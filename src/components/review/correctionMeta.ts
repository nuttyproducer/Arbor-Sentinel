// src/components/review/correctionMeta.ts
//
// Shared display metadata and helpers for the correction review UI. Kept out
// of the component files so CorrectionList, CorrectionDetail,
// CorrectionApplyDialog, and CorrectionReviewPage stay consistent on labels,
// badge variants, sorting weights, and the public-log summary format.

import type {
  CorrectionCategory,
  CorrectionResolution,
  CorrectionState,
  CorrectionSubmission,
} from "../../lib/review/types";
import { CORRECTION_CATEGORIES } from "../../data/correctionCategories";

export type UrgencyLevel = "immediate" | "high" | "normal";

// ── Category labels/descriptions ───────────────────────────────────────────

export function getCategoryDef(category: CorrectionCategory) {
  const def = CORRECTION_CATEGORIES.find((c) => c.id === category);
  if (!def) throw new Error(`Unknown correction category: ${category}`);
  return def;
}

export const CATEGORY_LABELS = Object.fromEntries(
  CORRECTION_CATEGORIES.map((c) => [c.id, c.label]),
) as Record<CorrectionCategory, string>;

// ── Urgency ────────────────────────────────────────────────────────────────

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  immediate: "Immediate",
  high: "High",
  normal: "Normal",
};

export const URGENCY_VARIANTS: Record<UrgencyLevel, "neutral" | "info" | "warning" | "alert"> = {
  immediate: "alert",
  high: "warning",
  normal: "neutral",
};

/** Sort weight for urgency (lower = more urgent). */
export const URGENCY_ORDER: Record<UrgencyLevel, number> = {
  immediate: 0,
  high: 1,
  normal: 2,
};

// ── State ──────────────────────────────────────────────────────────────────

export const STATE_LABELS: Record<CorrectionState, string> = {
  new: "New",
  under_review: "Under review",
  applied: "Applied",
  rejected: "Rejected",
  disputed: "Disputed",
  archived: "Archived",
  withdrawn: "Withdrawn",
};

export const STATE_VARIANTS: Record<CorrectionState, "neutral" | "info" | "warning" | "alert"> = {
  new: "info",
  under_review: "warning",
  applied: "info",
  rejected: "neutral",
  disputed: "alert",
  archived: "neutral",
  withdrawn: "neutral",
};

// ── Resolutions ────────────────────────────────────────────────────────────

/** Resolutions that change public content and stay pending until `apply`. */
export const CONTENT_RESOLUTIONS: CorrectionResolution[] = ["update", "downgrade", "remove"];

export function isContentResolution(resolution: CorrectionResolution): boolean {
  return CONTENT_RESOLUTIONS.includes(resolution);
}

export interface ResolutionMeta {
  label: string;
  variant: "primary" | "secondary" | "warning" | "danger";
  /** A note must be entered before the resolution can be confirmed. */
  noteRequired?: boolean;
  /** Irreversible action — shown verbatim in the confirmation step. */
  confirm?: string;
}

export const RESOLUTION_META: Record<CorrectionResolution, ResolutionMeta> = {
  update: {
    label: "Update content",
    variant: "primary",
    noteRequired: true,
  },
  downgrade: {
    label: "Downgrade content",
    variant: "warning",
    noteRequired: true,
    confirm:
      "Downgrading reduces the prominence or rank of this content and cannot be undone. Continue?",
  },
  remove: {
    label: "Remove content",
    variant: "danger",
    noteRequired: true,
    confirm: "Removing deletes this content from the public page and cannot be undone. Continue?",
  },
  dispute: {
    label: "Dispute correction",
    variant: "secondary",
    noteRequired: true,
  },
  archive: {
    label: "Archive",
    variant: "secondary",
  },
  withdraw: {
    label: "Withdraw",
    variant: "secondary",
  },
  reject: {
    label: "Reject correction",
    variant: "danger",
    noteRequired: true,
    confirm: "Rejecting closes this correction without changes and cannot be undone. Continue?",
  },
};

// ── Predicates ─────────────────────────────────────────────────────────────

/** A correction still in the review queue (awaiting or under review). */
export function isPendingCorrection(correction: CorrectionSubmission): boolean {
  return correction.state === "new" || correction.state === "under_review";
}

// ── Public log summary ─────────────────────────────────────────────────────

/**
 * Build the sanitized public log summary for a correction. Mirrors
 * `CorrectionManager.buildPublicLogEntry`: category label + resolution +
 * target page. Never includes the description, contact info, or submitter
 * identity.
 */
export function buildPublicLogPreview(correction: CorrectionSubmission): string {
  const def = getCategoryDef(correction.category);
  return `${def.label} (${correction.resolution ?? "update"}) on ${correction.targetPage}.`;
}

// ── Date formatting ────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Shared button styling ──────────────────────────────────────────────────

export const BASE_BUTTON_CLASSES =
  "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

export const BUTTON_CLASSES: Record<"primary" | "secondary" | "warning" | "danger", string> = {
  primary: "bg-ink text-bone hover:bg-charcoal border border-ink focus-visible:ring-trust/50",
  secondary: "bg-paper text-ink border border-ink/30 hover:bg-ink/5 focus-visible:ring-trust/50",
  warning: "bg-amber/10 text-[#8B6914] border border-amber/30 hover:bg-amber/20 focus-visible:ring-amber/50",
  danger: "bg-clay/10 text-clay border border-clay/30 hover:bg-clay/20 focus-visible:ring-clay/50",
};
