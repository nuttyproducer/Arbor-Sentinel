// src/lib/review/ReviewerRegistry.ts

import type {
  ReviewerProfile,
  WorkloadMetrics,
  ReviewType,
  ReviewItem,
} from "./types";

// ── Errors ─────────────────────────────────────────────────────────────────

/** Thrown when an operation targets a reviewer that is not registered. */
export class ReviewerNotFoundError extends Error {
  public readonly reviewerId: string;

  constructor(reviewerId: string) {
    super(`Reviewer '${reviewerId}' not found.`);
    this.name = "ReviewerNotFoundError";
    this.reviewerId = reviewerId;
  }
}

// ── Options ─────────────────────────────────────────────────────────────────

/** Optional filters for {@link ReviewerRegistry.getAvailable}. */
export interface AvailabilityFilter {
  reviewType?: ReviewType;
  contentType?: ReviewItem["sourceContentRef"]["type"];
  language?: string;
  country?: string;
}

/** Signed workload delta accepted by {@link ReviewerRegistry.updateWorkload}. */
export interface WorkloadDelta {
  /** Signed change to the current workload (active assignment) count. */
  assignments?: number;
  /** Signed change to the completed-today count. */
  completed?: number;
}

// ── Registry ────────────────────────────────────────────────────────────────

/**
 * Reviewer registry (M4.3-02).
 *
 * Owns the set of registered reviewer profiles and answers availability and
 * workload queries for the {@link AssignmentRouter} (Task 6):
 *
 * - Lifecycle: {@link register}, {@link unregister}, {@link getById}, {@link setAvailability}
 * - Filtering: {@link getAvailable}, {@link getByExpertise}, {@link getByContentSkill}
 * - Workload: {@link updateWorkload}, {@link getWorkload}, {@link canAcceptMore}
 *
 * The registry is an in-memory store; it does not persist profiles. Profiles
 * are stored by value, so callers should treat returned profiles as read-only
 * and route mutations through the registry methods.
 */
export class ReviewerRegistry {
  private readonly reviewers = new Map<string, ReviewerProfile>();

  /**
   * Register a reviewer profile, keyed by {@link ReviewerProfile.id}. Registering
   * an id that already exists replaces the previous profile.
   */
  register(profile: ReviewerProfile): void {
    this.reviewers.set(profile.id, profile);
  }

  /** Remove a reviewer from the registry. No-op when the id is unknown. */
  unregister(id: string): void {
    this.reviewers.delete(id);
  }

  /** Look up a reviewer profile by id. Returns `undefined` when unknown. */
  getById(id: string): ReviewerProfile | undefined {
    return this.reviewers.get(id);
  }

  /**
   * Reviewers currently able to accept new assignments: availability is
   * `"available"`, workload is below capacity (`currentWorkload < maxWorkload`),
   * and every supplied filter matches. When no options are given, returns all
   * available, under-capacity reviewers.
   *
   * Filters are ANDed:
   * - `reviewType` matches when it appears in the reviewer's `expertiseAreas`.
   * - `contentType` matches when it appears in the reviewer's `contentSkills`.
   * - `language` matches when it appears in the reviewer's `languages`.
   * - `country` matches when it appears in the reviewer's `countries`.
   */
  getAvailable(opts: AvailabilityFilter = {}): ReviewerProfile[] {
    return [...this.reviewers.values()].filter((reviewer) => {
      if (reviewer.availability !== "available") return false;
      if (reviewer.currentWorkload >= reviewer.maxWorkload) return false;
      if (opts.reviewType && !reviewer.expertiseAreas.includes(opts.reviewType)) return false;
      if (
        opts.contentType &&
        !reviewer.contentSkills.some((skill) => skill.contentType === opts.contentType)
      ) {
        return false;
      }
      if (opts.language && !reviewer.languages.includes(opts.language)) return false;
      if (opts.country && !reviewer.countries.includes(opts.country)) return false;
      return true;
    });
  }

  /**
   * Apply a signed workload delta to a reviewer's counters. Counts are clamped
   * at zero so a delta cannot push them negative.
   *
   * @param delta.assignments Signed change to `currentWorkload` (active assignments).
   * @param delta.completed Signed change to `completedToday`.
   */
  updateWorkload(id: string, delta: WorkloadDelta): void {
    const reviewer = this.requireReviewer(id);
    reviewer.currentWorkload = Math.max(0, reviewer.currentWorkload + (delta.assignments ?? 0));
    reviewer.completedToday = Math.max(0, reviewer.completedToday + (delta.completed ?? 0));
  }

  /**
   * Current workload metrics for a reviewer. `activeAssignments` is the
   * reviewer's current workload count, `queueDepth` reflects items queued for
   * the reviewer that are not yet active — always `0` because the registry does
   * not track a per-reviewer queue (that is the AssignmentRouter's concern).
   */
  getWorkload(id: string): WorkloadMetrics {
    const reviewer = this.requireReviewer(id);
    return {
      reviewerId: reviewer.id,
      activeAssignments: reviewer.currentWorkload,
      completedToday: reviewer.completedToday,
      averageReviewTimeMinutes: reviewer.averageReviewTimeMinutes,
      queueDepth: 0,
    };
  }

  /**
   * Whether a reviewer has capacity to accept more work: `currentWorkload < maxWorkload`.
   * Availability status is intentionally not considered — this is a pure capacity check.
   */
  canAcceptMore(id: string): boolean {
    const reviewer = this.requireReviewer(id);
    return reviewer.currentWorkload < reviewer.maxWorkload;
  }

  /** Update a reviewer's availability status. */
  setAvailability(id: string, status: ReviewerProfile["availability"]): void {
    const reviewer = this.requireReviewer(id);
    reviewer.availability = status;
  }

  /**
   * Reviewers whose `expertiseAreas` include the given review type. Returns all
   * matches regardless of availability — use {@link getAvailable} for routing.
   */
  getByExpertise(reviewType: ReviewType): ReviewerProfile[] {
    return [...this.reviewers.values()].filter((reviewer) =>
      reviewer.expertiseAreas.includes(reviewType),
    );
  }

  /**
   * Reviewers whose `contentSkills` include the given content type. Returns all
   * matches regardless of availability — use {@link getAvailable} for routing.
   */
  getByContentSkill(contentType: ReviewItem["sourceContentRef"]["type"]): ReviewerProfile[] {
    return [...this.reviewers.values()].filter((reviewer) =>
      reviewer.contentSkills.some((skill) => skill.contentType === contentType),
    );
  }

  private requireReviewer(id: string): ReviewerProfile {
    const reviewer = this.reviewers.get(id);
    if (!reviewer) throw new ReviewerNotFoundError(id);
    return reviewer;
  }
}
