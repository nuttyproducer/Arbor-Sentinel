// src/lib/review/ReviewPriority.ts

import type {
  ReviewItem,
  ReviewType,
  PriorityLevel,
  ContentRiskLevel,
  SourceRiskLevel,
  SLATarget,
  EscalationStep,
} from "./types";

// ── Risk Weights ─────────────────────────────────────────────────────────────

/**
 * Risk level weights for priority scoring. Content that is legally sensitive or
 * involves casualties is more urgent to review than general editorial content.
 */
const CONTENT_RISK_WEIGHTS: Record<ContentRiskLevel, number> = {
  legal: 40,
  casualty: 35,
  testimony: 25,
  humanitarian: 20,
  general: 10,
};

/**
 * Source type weights for priority scoring. Primary court records and UN
 * documents carry more weight than secondary NGO or media reporting.
 */
const SOURCE_TYPE_WEIGHTS: Record<SourceRiskLevel, number> = {
  court: 30,
  un: 25,
  ngo: 15,
  media: 10,
};

/** Score added when the AI pipeline detected contradictions. */
const CONTRADICTION_BONUS = 15;

/**
 * Score added when the AI pipeline detected hallucinations. The name mirrors
 * the spec — a "penalty" that raises the score and therefore the priority.
 */
const HALLUCINATION_PENALTY = 20;

// ── SLA Configuration ────────────────────────────────────────────────────────

const HOUR_MS = 60 * 60 * 1000;

/** Base target hours per priority before the review-type multiplier is applied. */
const BASE_SLA_HOURS: Record<PriorityLevel, number> = {
  critical: 4,
  high: 8,
  medium: 24,
  low: 72,
};

/** Review-type multipliers so more complex reviews get proportionally more time. */
const REVIEW_TYPE_SLA_MULTIPLIER: Record<ReviewType, number> = {
  source: 1,
  editorial: 1,
  legal: 1.5,
  competency: 1.25,
  safety: 1.25,
  translation: 1,
  accessibility: 1,
  licensing: 1,
};

/** Warn once this fraction of the SLA target has elapsed. */
const SLA_WARNING_THRESHOLD = 0.75;

/** Consider the item overdue once this multiple of the target has elapsed. */
const SLA_OVERDUE_THRESHOLD = 1.25;

/** Consider the SLA breached once this multiple of the target has elapsed. */
const SLA_BREACH_MULTIPLIER = 2;

/** Escalation steps keyed by priority (action after N hours overdue). */
const ESCALATION_STEPS: Record<PriorityLevel, EscalationStep[]> = {
  critical: [
    { afterHoursOverdue: 1, action: "notify_admin" },
    { afterHoursOverdue: 2, action: "reassign" },
  ],
  high: [
    { afterHoursOverdue: 2, action: "notify_admin" },
    { afterHoursOverdue: 4, action: "reassign" },
  ],
  medium: [
    { afterHoursOverdue: 6, action: "notify_admin" },
    { afterHoursOverdue: 12, action: "reassign" },
  ],
  low: [
    { afterHoursOverdue: 24, action: "notify_reviewer" },
    { afterHoursOverdue: 48, action: "reassign" },
  ],
};

// ── Priority Calculation ─────────────────────────────────────────────────────

/**
 * Calculate the priority score (0-100) for a review item.
 *
 * Formula: contentRiskWeight + sourceTypeWeight + contradictionBonus +
 * hallucinationPenalty, capped at 100.
 *
 * @param _item The review item being prioritized. Part of the public API so the
 *   queue can pass the full item through; the current formula derives its score
 *   entirely from `opts` (kept for future content-type-specific weighting).
 * @param opts Risk levels and AI-detection flags used to compute the score.
 */
export function calculatePriority(
  _item: Pick<ReviewItem, "sourceContentRef" | "reviewType">,
  opts: {
    contentRiskLevel: ContentRiskLevel;
    sourceRiskLevel: SourceRiskLevel;
    hasContradictions?: boolean;
    hasHallucinations?: boolean;
  },
): { score: number; level: PriorityLevel } {
  const contentWeight = CONTENT_RISK_WEIGHTS[opts.contentRiskLevel];
  const sourceWeight = SOURCE_TYPE_WEIGHTS[opts.sourceRiskLevel];
  const contradictionBonus = opts.hasContradictions ? CONTRADICTION_BONUS : 0;
  const hallucinationPenalty = opts.hasHallucinations ? HALLUCINATION_PENALTY : 0;

  const score = Math.min(
    100,
    contentWeight + sourceWeight + contradictionBonus + hallucinationPenalty,
  );

  return { score, level: scoreToLevel(score) };
}

/**
 * Map a numeric priority score to a {@link PriorityLevel}.
 *
 * critical: >= 80, high: >= 60, medium: >= 30, low: < 30.
 */
export function scoreToLevel(score: number): PriorityLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

// ── SLA Targets ──────────────────────────────────────────────────────────────

/**
 * Get the SLA target configuration for a review type and priority level.
 *
 * Higher priority items get shorter targets. The target is derived from a base
 * number of hours per priority scaled by a review-type multiplier.
 */
export function getSLATarget(reviewType: ReviewType, priority: PriorityLevel): SLATarget {
  return {
    targetHours: BASE_SLA_HOURS[priority] * REVIEW_TYPE_SLA_MULTIPLIER[reviewType],
    warningThreshold: SLA_WARNING_THRESHOLD,
    overdueThreshold: SLA_OVERDUE_THRESHOLD,
    escalationPath: ESCALATION_STEPS[priority].map((step) => ({ ...step })),
  };
}

/**
 * Fraction of the SLA target that has elapsed for an item at `now`.
 *
 * `1.0` means the target deadline has been reached. The deadline is the item's
 * `dueBy` when set, otherwise `createdAt + slaTarget.targetHours`. A `dueBy`
 * earlier than `createdAt` (degenerate) yields `Infinity` once `now` passes the
 * creation time so the item is treated as breached.
 */
function slaProgress(item: ReviewItem, now: Date): number {
  const start = new Date(item.createdAt).getTime();
  const end = item.dueBy
    ? new Date(item.dueBy).getTime()
    : start + item.slaTarget.targetHours * HOUR_MS;
  const span = end - start;
  if (span <= 0) return now.getTime() >= start ? Number.POSITIVE_INFINITY : 0;
  return (now.getTime() - start) / span;
}

/**
 * Check whether a review item is past its SLA target. An item is overdue once
 * the elapsed time reaches `slaTarget.overdueThreshold` (a multiple of the
 * target — by default 1.25x, i.e. 25% past the deadline).
 *
 * @param now The reference clock; defaults to the current time. Injectable for
 *   deterministic testing.
 */
export function isOverdue(item: ReviewItem, now: Date = new Date()): boolean {
  return slaProgress(item, now) >= item.slaTarget.overdueThreshold;
}

/** SLA status buckets for a review item. */
export type SLAStatus = "on_track" | "warning" | "overdue" | "breached";

/**
 * Calculate the SLA status for a review item against its stored
 * `slaTarget`.
 *
 * - "on_track":  less than `warningThreshold` of the target elapsed
 * - "warning":   at/after `warningThreshold` but before `overdueThreshold`
 * - "overdue":   at/after `overdueThreshold` but before the breach point
 * - "breached":  at/after `SLA_BREACH_MULTIPLIER` (2x) the target elapsed
 *
 * @param now The reference clock; defaults to the current time. Injectable for
 *   deterministic testing.
 */
export function getSLAStatus(item: ReviewItem, now: Date = new Date()): SLAStatus {
  const progress = slaProgress(item, now);
  if (progress >= SLA_BREACH_MULTIPLIER) return "breached";
  if (progress >= item.slaTarget.overdueThreshold) return "overdue";
  if (progress >= item.slaTarget.warningThreshold) return "warning";
  return "on_track";
}
