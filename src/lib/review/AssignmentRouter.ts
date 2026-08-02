// src/lib/review/AssignmentRouter.ts

import type {
  ReviewItem,
  ReviewType,
  AssignmentStrategy,
  AssignmentRecord,
  ReviewerProfile,
} from "./types";
import { ReviewerRegistry, ReviewerNotFoundError } from "./ReviewerRegistry";
import { ReviewQueue, ItemNotFoundError } from "./ReviewQueue";

// ── Errors ─────────────────────────────────────────────────────────────────

/** Thrown when no eligible reviewer can be found for an item + strategy. */
export class NoAvailableReviewerError extends Error {
  public readonly reviewItemId: string;
  public readonly strategy: AssignmentStrategy;

  constructor(reviewItemId: string, strategy: AssignmentStrategy) {
    super(
      `No available reviewer for review item '${reviewItemId}' using strategy '${strategy}'.`,
    );
    this.name = "NoAvailableReviewerError";
    this.reviewItemId = reviewItemId;
    this.strategy = strategy;
  }
}

/** Thrown when a manual assignment targets a reviewer at max capacity. */
export class ReviewerAtCapacityError extends Error {
  public readonly reviewerId: string;

  constructor(reviewerId: string) {
    super(`Reviewer '${reviewerId}' is at capacity and cannot accept more assignments.`);
    this.name = "ReviewerAtCapacityError";
    this.reviewerId = reviewerId;
  }
}

/** Thrown when the `manual` strategy is used without a reviewer id. */
export class ManualAssignmentError extends Error {
  constructor(message?: string) {
    super(message ?? "Manual assignment requires a reviewer id.");
    this.name = "ManualAssignmentError";
  }
}

// ── Options ─────────────────────────────────────────────────────────────────

/** Additional inputs for {@link AssignmentRouter.assign}. */
export interface AssignOptions {
  /**
   * Reviewer id for the `manual` strategy. When omitted, falls back to
   * `item.assignedReviewer`.
   */
  reviewerId?: string;
  /** Item language (ISO code) — earns a +2 expertise-score bonus when it matches. */
  language?: string;
  /** Item country (ISO code) — earns a +2 expertise-score bonus when it matches. */
  country?: string;
}

// ── Router ──────────────────────────────────────────────────────────────────

/**
 * Assignment router (M4.3-02, Task 6).
 *
 * Selects a reviewer for a review item via one of four strategies and drives
 * the {@link ReviewQueue} + {@link ReviewerRegistry} through the assignment
 * lifecycle:
 *
 * 1. {@link assign}   — pick a reviewer and move a `new` item to `assigned`.
 * 2. {@link reassign} — pick a replacement reviewer for an engaged item.
 * 3. {@link getAssignment} — the current {@link AssignmentRecord} for an item.
 *
 * Strategies:
 * - **round_robin**: cycle through available reviewers per review type.
 * - **expertise**:   score reviewers by expertise, content skill, language,
 *   and country match; pick the highest score.
 * - **load_balanced**: pick the available reviewer with the lowest
 *   `currentWorkload / maxWorkload` ratio.
 * - **manual**:      assign to a specific reviewer, validating capacity.
 *
 * The router records each {@link AssignmentRecord} in memory, keyed by review
 * item id, so review pages can look up who owns an item.
 */
export class AssignmentRouter {
  private readonly assignments = new Map<string, AssignmentRecord>();
  /** Last-assigned candidate index per review type, for round-robin. */
  private readonly roundRobinIndex = new Map<ReviewType, number>();

  constructor(
    private readonly registry: ReviewerRegistry,
    private readonly queue: ReviewQueue,
  ) {}

  /**
   * Assign a review item using the specified strategy (default: `load_balanced`).
   *
   * Selects a reviewer, moves the item to `assigned` (via
   * {@link ReviewQueue.assignItem}, which sets `assignedReviewer` before the
   * state-machine transition), and increments the reviewer's workload. The item
   * must be in the `new` state — use {@link reassign} for engaged items.
   *
   * @param item The dequeued item to assign (must currently be in `new`).
   * @param strategy Which selection strategy to use.
   * @param opts Manual reviewer id and expertise language/country context.
   */
  async assign(
    item: ReviewItem,
    strategy: AssignmentStrategy = "load_balanced",
    opts: AssignOptions = {},
  ): Promise<AssignmentRecord> {
    const reviewer = this.selectReviewer(item, strategy, opts);
    if (!reviewer) {
      throw new NoAvailableReviewerError(item.id, strategy);
    }

    const rationale = this.buildRationale(strategy, reviewer, item);

    await this.queue.assignItem(item.id, reviewer.id, {
      actor: "system",
      strategy,
      rationale,
    });

    this.registry.updateWorkload(reviewer.id, { assignments: 1 });

    const record: AssignmentRecord = {
      reviewItemId: item.id,
      reviewerId: reviewer.id,
      strategy,
      rationale,
      assignedAt: new Date().toISOString(),
    };
    this.assignments.set(item.id, record);
    return record;
  }

  /**
   * Reassign an item to a replacement reviewer (e.g., reviewer unavailable or
   * SLA breach). Picks a new reviewer with the default `load_balanced`
   * strategy, releases the previous reviewer's workload, engages the new one,
   * and records a fresh {@link AssignmentRecord}.
   */
  async reassign(itemId: string, reason: string): Promise<AssignmentRecord> {
    const item = await this.queue.getById(itemId);
    if (!item) throw new ItemNotFoundError(itemId);

    const previousRecord = this.assignments.get(itemId);
    const previousReviewerId = previousRecord?.reviewerId ?? item.assignedReviewer;

    const strategy: AssignmentStrategy = "load_balanced";
    const reviewer = this.selectReviewer(item, strategy);
    if (!reviewer) {
      throw new NoAvailableReviewerError(itemId, strategy);
    }

    if (previousReviewerId && previousReviewerId !== reviewer.id) {
      const previous = this.registry.getById(previousReviewerId);
      if (previous) {
        this.registry.updateWorkload(previousReviewerId, { assignments: -1 });
      }
    }

    if (item.state === "new") {
      await this.queue.assignItem(itemId, reviewer.id, {
        actor: "system",
        strategy,
        rationale: reason,
      });
    } else {
      await this.queue.reassignItem(itemId, reviewer.id, reason);
    }

    if (previousReviewerId !== reviewer.id) {
      this.registry.updateWorkload(reviewer.id, { assignments: 1 });
    }

    const record: AssignmentRecord = {
      reviewItemId: itemId,
      reviewerId: reviewer.id,
      strategy,
      rationale: reason,
      assignedAt: new Date().toISOString(),
    };
    this.assignments.set(itemId, record);
    return record;
  }

  /** Get the current assignment for a review item, or `undefined` when none. */
  getAssignment(itemId: string): AssignmentRecord | undefined {
    return this.assignments.get(itemId);
  }

  // ── Strategy dispatch ─────────────────────────────────────────────────────

  private selectReviewer(
    item: ReviewItem,
    strategy: AssignmentStrategy,
    opts: AssignOptions = {},
  ): ReviewerProfile | null {
    switch (strategy) {
      case "round_robin":
        return this.roundRobin(item.reviewType);
      case "expertise":
        return this.expertiseMatch(item, opts.language, opts.country);
      case "load_balanced":
        return this.loadBalanced(item);
      case "manual": {
        const reviewerId = opts.reviewerId ?? item.assignedReviewer;
        if (!reviewerId) {
          throw new ManualAssignmentError(
            "Manual assignment requires a reviewer id — pass AssignOptions.reviewerId or set item.assignedReviewer.",
          );
        }
        return this.manual(item, reviewerId);
      }
    }
  }

  // ── Strategy implementations ──────────────────────────────────────────────

  /**
   * Round-robin: track the last-assigned candidate index per review type and
   * pick the next available reviewer. `getAvailable` already excludes
   * unavailable and at-capacity reviewers, so those are skipped naturally.
   */
  private roundRobin(reviewType: ReviewType): ReviewerProfile | null {
    const candidates = this.registry.getAvailable({ reviewType });
    if (candidates.length === 0) return null;

    const last = this.roundRobinIndex.get(reviewType) ?? -1;
    const next = (last + 1) % candidates.length;
    this.roundRobinIndex.set(reviewType, next);
    return candidates[next];
  }

  /**
   * Expertise: score each available reviewer with the matching expertise and
   * return the highest score.
   *
   * - +3 for the item's review type appearing in `expertiseAreas`
   * - +proficiency for the content skill matching the item's source content type
   * - +2 when the reviewer's languages include the item's language
   * - +2 when the reviewer's countries include the item's country
   */
  private expertiseMatch(
    item: ReviewItem,
    language?: string,
    country?: string,
  ): ReviewerProfile | null {
    const candidates = this.registry.getAvailable({ reviewType: item.reviewType });
    if (candidates.length === 0) return null;

    let best: ReviewerProfile | null = null;
    let bestScore = -Infinity;

    for (const reviewer of candidates) {
      let score = 0;
      if (reviewer.expertiseAreas.includes(item.reviewType)) score += 3;
      const skill = reviewer.contentSkills.find(
        (s) => s.contentType === item.sourceContentRef.type,
      );
      if (skill) score += skill.proficiency;
      if (language && reviewer.languages.includes(language)) score += 2;
      if (country && reviewer.countries.includes(country)) score += 2;

      if (score > bestScore) {
        bestScore = score;
        best = reviewer;
      }
    }

    return best;
  }

  /**
   * Load-balanced: pick the available reviewer with the lowest
   * `currentWorkload / maxWorkload` ratio for the item's review type and source
   * content type. Ties break by reviewer id for determinism.
   */
  private loadBalanced(item: ReviewItem): ReviewerProfile | null {
    const candidates = this.registry.getAvailable({
      reviewType: item.reviewType,
      contentType: item.sourceContentRef.type,
    });
    if (candidates.length === 0) return null;

    const sorted = [...candidates].sort((a, b) => {
      const ratioA = a.currentWorkload / a.maxWorkload;
      const ratioB = b.currentWorkload / b.maxWorkload;
      if (ratioA !== ratioB) return ratioA - ratioB;
      return a.id.localeCompare(b.id);
    });

    return sorted[0];
  }

  /**
   * Manual: assign to a specific reviewer. Validates the reviewer exists and is
   * under capacity (workload is never capped by `updateWorkload`, so the router
   * must check `canAcceptMore` before assigning).
   */
  private manual(_item: ReviewItem, reviewerId: string): ReviewerProfile | null {
    const reviewer = this.registry.getById(reviewerId);
    if (!reviewer) throw new ReviewerNotFoundError(reviewerId);
    if (!this.registry.canAcceptMore(reviewerId)) {
      throw new ReviewerAtCapacityError(reviewerId);
    }
    return reviewer;
  }

  private buildRationale(
    strategy: AssignmentStrategy,
    reviewer: ReviewerProfile,
    item: ReviewItem,
  ): string {
    switch (strategy) {
      case "round_robin":
        return `Round-robin: next available reviewer for '${item.reviewType}'.`;
      case "expertise":
        return `Expertise match: '${reviewer.id}' scored highest for '${item.reviewType}'.`;
      case "load_balanced":
        return `Load-balanced: '${reviewer.id}' has the lowest workload ratio (${reviewer.currentWorkload}/${reviewer.maxWorkload}).`;
      case "manual":
        return `Manual assignment to '${reviewer.id}'.`;
    }
  }
}
