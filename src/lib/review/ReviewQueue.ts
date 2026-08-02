// src/lib/review/ReviewQueue.ts

import type {
  ReviewItem,
  ReviewState,
  ReviewComment,
  ReviewType,
  PriorityLevel,
  ContentRiskLevel,
  SourceRiskLevel,
} from "./types";
import { ReviewStateMachine, VALID_TRANSITIONS } from "./ReviewStateMachine";
import { calculatePriority, getSLATarget, isOverdue } from "./ReviewPriority";
import {
  InMemoryPersistence,
  type PersistenceStore,
  type ReviewQueryFilters,
} from "./ReviewPersistence";

// ── Errors ─────────────────────────────────────────────────────────────────

/** Thrown when an operation targets a review item that is not in the store. */
export class ItemNotFoundError extends Error {
  public readonly itemId: string;

  constructor(itemId: string) {
    super(`Review item '${itemId}' not found.`);
    this.name = "ItemNotFoundError";
    this.itemId = itemId;
  }
}

// ── Public Types ───────────────────────────────────────────────────────────

/** Risk-level inputs consumed by `calculatePriority`. */
export interface PriorityInput {
  contentRiskLevel: ContentRiskLevel;
  sourceRiskLevel: SourceRiskLevel;
  hasContradictions?: boolean;
  hasHallucinations?: boolean;
}

/** Options for {@link ReviewQueue.updateState}. */
export interface UpdateStateOptions {
  /** Reviewer ID or "system" performing the transition. */
  actor?: string;
  /** Human-readable reason for the transition. */
  reason?: string;
  /** Required checklist IDs for the `in_review -> approved` guard. */
  requiredChecklistItemIds?: string[];
}

/** Aggregate queue statistics returned by {@link ReviewQueue.stats}. */
export interface QueueStats {
  total: number;
  /** Items still in the `new` (pending) state. */
  pending: number;
  /** Items past their SLA target. */
  overdue: number;
  byState: Record<ReviewState, number>;
  byPriority: Record<PriorityLevel, number>;
}

/**
 * The shape accepted by {@link ReviewQueue.enqueue}. `id`, `priorityScore`,
 * `state`, `stateHistory`, `createdAt`, and `updatedAt` are produced by the
 * queue. Note that `priority`, `slaTarget`, and `dueBy` are re-derived from the
 * priority calculation, so any values provided here are overridden.
 */
export type EnqueueInput = Omit<
  ReviewItem,
  "id" | "priorityScore" | "state" | "stateHistory" | "createdAt" | "updatedAt"
>;

// ── ID generation ──────────────────────────────────────────────────────────

let fallbackIdCounter = 0;

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  fallbackIdCounter += 1;
  return `review-${Date.now().toString(36)}-${fallbackIdCounter.toString(36)}`;
}

// ── Priority inference ─────────────────────────────────────────────────────
// Used when enqueue is called without an explicit PriorityInput, and by
// reprioritize (which has no per-item options). The mapping is a documented
// best-effort derivation from the item's review type and source content type.

const HOUR_MS = 60 * 60 * 1000;

const REVIEW_TYPE_CONTENT_RISK: Partial<Record<ReviewType, ContentRiskLevel>> = {
  legal: "legal",
  safety: "casualty",
  competency: "testimony",
};

const SOURCE_TYPE_SOURCE_RISK: Record<string, SourceRiskLevel> = {
  legal_case: "court",
  evidence: "un",
  source: "media",
  organization: "ngo",
  country: "media",
  institution: "ngo",
  action_template: "media",
};

function inferContentRiskLevel(reviewType: ReviewType): ContentRiskLevel {
  return REVIEW_TYPE_CONTENT_RISK[reviewType] ?? "general";
}

function inferSourceRiskLevel(sourceType: string): SourceRiskLevel {
  return SOURCE_TYPE_SOURCE_RISK[sourceType] ?? "media";
}

/**
 * True when a pipeline stage whose key matches `keyPattern` produced non-empty
 * findings. Stage results are stored as `{ data: T[] }`; an empty array means
 * the stage ran but found nothing.
 */
function hasDetectedIssues(
  stageResults: Record<string, unknown> | undefined,
  keyPattern: RegExp,
): boolean {
  if (!stageResults) return false;
  return Object.entries(stageResults).some(([key, value]) => {
    if (!keyPattern.test(key)) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      const data = record.data;
      if (Array.isArray(data)) return data.length > 0;
      return Object.keys(record).length > 0;
    }
    return false;
  });
}

/**
 * Best-effort {@link PriorityInput} derived from an item's stored fields. Prefer
 * passing an explicit {@link PriorityInput} to {@link ReviewQueue.enqueue} when
 * the true risk levels are known; this is the fallback used otherwise.
 */
export function inferPriorityInput(
  item: Pick<ReviewItem, "reviewType" | "sourceContentRef" | "aiOutput">,
): PriorityInput {
  const stageResults = item.aiOutput?.stageResults;
  return {
    contentRiskLevel: inferContentRiskLevel(item.reviewType),
    sourceRiskLevel: inferSourceRiskLevel(item.sourceContentRef.type),
    hasContradictions: hasDetectedIssues(stageResults, /contradict/i),
    hasHallucinations: hasDetectedIssues(stageResults, /hallucin/i),
  };
}

const REVIEW_STATES = Object.keys(VALID_TRANSITIONS) as ReviewState[];

// ── Queue ──────────────────────────────────────────────────────────────────

/**
 * Review queue (M4.3-01).
 *
 * Owns the pending review worklist: items enter via {@link enqueue} with their
 * priority score calculated automatically, leave the pending pool when a
 * consumer picks them up, and progress through states via the state machine.
 *
 * Ordering is priority-first (higher `priorityScore` wins) with FIFO within the
 * same priority (earlier `createdAt` wins). SLA deadlines are set at creation
 * time from the priority's target hours.
 */
export class ReviewQueue {
  constructor(
    private readonly persistence: PersistenceStore = new InMemoryPersistence(),
    private readonly stateMachine: ReviewStateMachine = new ReviewStateMachine(),
    /** Injectable clock for deterministic testing. */
    private readonly now: () => Date = () => new Date(),
  ) {}

  /**
   * Add a review item to the queue.
   *
   * Calculates `priorityScore`/`priority` (via `calculatePriority`), derives the
   * SLA target and `dueBy` from the resulting priority, assigns the `new` state,
   * and generates the item's id. SLA clock starts at creation time.
   *
   * @param priorityInput Risk levels for the priority calculation. When omitted,
   *   derived via {@link inferPriorityInput}.
   */
  async enqueue(item: EnqueueInput, priorityInput?: PriorityInput): Promise<ReviewItem> {
    const now = this.now();
    const nowIso = now.toISOString();
    const id = generateId();

    const { score, level } = priorityInput
      ? calculatePriority(item, priorityInput)
      : calculatePriority(item, inferPriorityInput(item));

    const slaTarget = getSLATarget(item.reviewType, level);
    const dueBy = new Date(now.getTime() + slaTarget.targetHours * HOUR_MS).toISOString();

    const fullItem: ReviewItem = {
      ...item,
      id,
      priority: level,
      priorityScore: score,
      slaTarget,
      dueBy,
      state: "new",
      stateHistory: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const items = await this.persistence.load();
    items.push(fullItem);
    await this.persistence.save(items);

    return fullItem;
  }

  /**
   * Get the next pending item without removing it. Non-destructive: the item
   * stays in the store in its current state and remains eligible until a
   * consumer transitions it out of `new` via {@link updateState}. Returns
   * `null` when the queue is empty.
   *
   * Ordering: highest priority first, then FIFO within the same priority.
   */
  async dequeue(): Promise<ReviewItem | null> {
    const items = await this.persistence.load();
    const pending = items.filter((item) => item.state === "new");
    if (pending.length === 0) return null;
    return this.sortByPriority(pending)[0];
  }

  /**
   * Transition an item to `newState`, validated by the state machine. Always
   * passes the full item so guard conditions are enforced.
   */
  async updateState(id: string, newState: ReviewState, opts: UpdateStateOptions = {}): Promise<ReviewItem> {
    const items = await this.persistence.load();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) throw new ItemNotFoundError(id);

    const item = items[index];
    const transition = this.stateMachine.transition(item.state, newState, {
      actor: opts.actor,
      reason: opts.reason,
      item,
      requiredChecklistItemIds: opts.requiredChecklistItemIds,
    });

    const updatedAt = this.now().toISOString();
    const updated: ReviewItem = {
      ...item,
      state: newState,
      stateHistory: [...item.stateHistory, transition],
      updatedAt,
    };

    items[index] = updated;
    await this.persistence.save(items);

    return updated;
  }

  /** Append a versioned comment to an item (version numbers start at 1). */
  async addComment(id: string, authorId: string, body: string): Promise<ReviewComment> {
    const items = await this.persistence.load();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) throw new ItemNotFoundError(id);

    const item = items[index];
    const nextVersion = item.comments.reduce((max, comment) => Math.max(max, comment.version), 0) + 1;
    const nowIso = this.now().toISOString();
    const comment: ReviewComment = {
      id: generateId(),
      reviewItemId: id,
      authorId,
      body,
      stateAtComment: item.state,
      version: nextVersion,
      createdAt: nowIso,
    };

    const updated: ReviewItem = {
      ...item,
      comments: [...item.comments, comment],
      updatedAt: nowIso,
    };

    items[index] = updated;
    await this.persistence.save(items);

    return comment;
  }

  /** Query items, ordered priority-first then FIFO. */
  async query(filters: ReviewQueryFilters = {}): Promise<ReviewItem[]> {
    const items = await this.persistence.query(filters);
    return this.sortByPriority(items);
  }

  /** Paginated query. Items are ordered (priority-first, FIFO) before paging. */
  async paginate(
    filters: ReviewQueryFilters,
    page: number,
    pageSize: number,
  ): Promise<{ items: ReviewItem[]; total: number }> {
    const filtered = await this.persistence.query(filters);
    const sorted = this.sortByPriority(filtered);
    const start = Math.max(0, (page - 1) * pageSize);
    return { items: sorted.slice(start, start + pageSize), total: sorted.length };
  }

  /**
   * Recalculate priorities, SLA targets, and deadlines for every item. Useful
   * after a priority/weighting config change. Uses {@link inferPriorityInput}
   * because items do not persist risk-level options; deadlines remain anchored
   * to the original creation time (SLA clock starts at creation).
   */
  async reprioritize(): Promise<void> {
    const items = await this.persistence.load();
    const updatedAt = this.now().toISOString();
    const updated = items.map((item) => {
      const { score, level } = calculatePriority(item, inferPriorityInput(item));
      const slaTarget = getSLATarget(item.reviewType, level);
      const createdAtMs = new Date(item.createdAt).getTime();
      const dueBy = new Date(createdAtMs + slaTarget.targetHours * HOUR_MS).toISOString();
      return {
        ...item,
        priority: level,
        priorityScore: score,
        slaTarget,
        dueBy,
        updatedAt,
      };
    });
    await this.persistence.save(updated);
  }

  /** Queue statistics derived from the full collection. */
  async stats(): Promise<QueueStats> {
    const items = await this.persistence.load();

    const byState = Object.fromEntries(REVIEW_STATES.map((state) => [state, 0])) as Record<
      ReviewState,
      number
    >;
    const byPriority: Record<PriorityLevel, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    let overdue = 0;
    for (const item of items) {
      byState[item.state] += 1;
      byPriority[item.priority] += 1;
      if (isOverdue(item, this.now())) overdue += 1;
    }

    return {
      total: items.length,
      pending: byState.new,
      overdue,
      byState,
      byPriority,
    };
  }

  /** Priority descending (highest first), then createdAt ascending (FIFO). */
  private sortByPriority(items: ReviewItem[]): ReviewItem[] {
    return [...items].sort((a, b) => {
      if (a.priorityScore !== b.priorityScore) return b.priorityScore - a.priorityScore;
      return a.createdAt.localeCompare(b.createdAt);
    });
  }
}
