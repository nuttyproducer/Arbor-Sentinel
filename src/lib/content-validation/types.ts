/**
 * Types for the content-validation system.
 *
 * Separates validation errors from warnings. Errors fail CI;
 * warnings are informational but do not block the build.
 */

// ── Severity ──────────────────────────────────────────────────────────────

export type ValidationSeverity = "error" | "warning";

// ── Validation issue ──────────────────────────────────────────────────────

export interface ValidationIssue {
  /** The data collection name (e.g. "sources", "evidenceItems"). */
  collection: string;
  /** The record's id field. */
  recordId: string;
  /** The field or rule that caused the issue. */
  field: string;
  /** Human-readable description of the problem. */
  message: string;
  /** Error = blocks build, Warning = informational only. */
  severity: ValidationSeverity;
}

// ── Validation report ─────────────────────────────────────────────────────

export interface ValidationReport {
  /** All issues (errors + warnings). */
  issues: ValidationIssue[];
  /** Errors only — these should fail CI. */
  errors: ValidationIssue[];
  /** Warnings only — informational, don't fail CI. */
  warnings: ValidationIssue[];
  /** Number of collections checked. */
  collectionsChecked: number;
  /** Total records across all collections. */
  recordsChecked: number;
  /** Per-collection record counts. */
  recordCounts: Record<string, number>;
  /** Whether the validation passed (zero errors). */
  passed: boolean;
}

// ── Summary statistics ────────────────────────────────────────────────────

export interface ContentSummary {
  /** Total records by type. */
  recordsByType: Record<string, number>;
  /** Records by content status. */
  recordsByStatus: Record<string, number>;
  /** Number of source-reference failures. */
  sourceReferenceFailures: number;
  /** Number of stale records (past review cadence). */
  staleRecords: number;
  /** Number of reviewed records. */
  reviewedRecords: number;
  /** Number of review-pending records. */
  reviewPendingRecords: number;
  /** Per-collection breakdowns. */
  byCollection: Record<string, {
    total: number;
    reviewed: number;
    reviewPending: number;
    stale: number;
    sourceRefFailures: number;
  }>;
}

// ── Review cadence (months) ───────────────────────────────────────────────

export const REVIEW_CADENCE: Record<string, number> = {
  "court record": 6,
  "official UN document": 6,
  "humanitarian update": 3,
  "human-rights report": 6,
  "parliamentary document": 3,
  "verified investigative report": 6,
  organization: 6,
  "legal case": 6,
  "action template": 6,
  attribution: 12,
  country: 6,
  institution: 6,
};

// ── Helper ────────────────────────────────────────────────────────────────

export function issue(
  collection: string,
  recordId: string,
  field: string,
  message: string,
  severity: ValidationSeverity = "error",
): ValidationIssue {
  return { collection, recordId, field, message, severity };
}
