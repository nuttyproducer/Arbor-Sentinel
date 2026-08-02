// ── Review States ──────────────────────────────────────────────────────────

export type ReviewState =
  | "new"
  | "assigned"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "published"
  | "rejected"
  | "archived";

// ── Priority ───────────────────────────────────────────────────────────────

export type PriorityLevel = "critical" | "high" | "medium" | "low";

// ── Review Item ────────────────────────────────────────────────────────────

export interface ReviewItem {
  id: string;
  /** Reference to the source content this review is for. */
  sourceContentRef: {
    type: "evidence" | "legal_case" | "source" | "organization" | "action_template" | "country" | "institution";
    id: string;
    slug: string;
  };
  /** The AI pipeline output being reviewed (if applicable). */
  aiOutput?: {
    pipelineRunId: string;
    stageResults: Record<string, unknown>;
  };
  /** Type of review needed. */
  reviewType: ReviewType;
  priority: PriorityLevel;
  priorityScore: number; // 0–100, higher = more urgent
  state: ReviewState;
  assignedReviewer?: string; // reviewer ID
  dueBy?: string; // ISO date
  comments: ReviewComment[];
  checklists: ReviewChecklistResult[];
  slaTarget: SLATarget;
  /** ISO timestamps for state transitions. */
  stateHistory: StateTransition[];
  createdAt: string;
  updatedAt: string;
  /** The strategy used to assign this item. */
  assignmentStrategy?: AssignmentStrategy;
  assignmentRationale?: string;
}

export type ReviewType =
  | "source"
  | "editorial"
  | "legal"
  | "competency"
  | "safety"
  | "translation"
  | "accessibility"
  | "licensing";

// ── State Transitions ──────────────────────────────────────────────────────

export interface StateTransition {
  from: ReviewState;
  to: ReviewState;
  timestamp: string;
  actor?: string; // reviewer ID or "system"
  reason?: string;
}

// ── Review Comment ─────────────────────────────────────────────────────────

export interface ReviewComment {
  id: string;
  reviewItemId: string;
  authorId: string; // internal reviewer ID, never PII
  body: string; // must not contain PII
  stateAtComment: ReviewState;
  version: number;
  createdAt: string;
  editedAt?: string;
}

// ── Review Checklist ───────────────────────────────────────────────────────

export interface ReviewChecklistItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
  category: string; // groups items within a checklist
}

export type ChecklistResult = "pass" | "fail" | "na";

export interface ReviewChecklistResult {
  itemId: string;
  result: ChecklistResult;
  note?: string;
}

// ── SLA Tracking ───────────────────────────────────────────────────────────

export interface SLATarget {
  /** Target hours from assignment to completion. */
  targetHours: number;
  /** Warning threshold as fraction of target (e.g., 0.75 = warn at 75%). */
  warningThreshold: number;
  /** Overdue threshold as fraction of target. */
  overdueThreshold: number;
  /** Escalation path when overdue. */
  escalationPath: EscalationStep[];
}

export interface EscalationStep {
  afterHoursOverdue: number;
  action: "reassign" | "notify_admin" | "notify_reviewer";
}

// ── Assignment ─────────────────────────────────────────────────────────────

export type AssignmentStrategy =
  | "round_robin"
  | "expertise"
  | "load_balanced"
  | "manual";

export interface ReviewerProfile {
  id: string;
  /** Role description only — never personal name in public code. */
  role: string;
  expertiseAreas: ReviewType[];
  contentSkills: {
    contentType: ReviewItem["sourceContentRef"]["type"];
    proficiency: 1 | 2 | 3 | 4 | 5;
  }[];
  maxWorkload: number;
  currentWorkload: number;
  availability: "available" | "busy" | "unavailable";
  activeAssignments: string[]; // review item IDs
  completedToday: number;
  averageReviewTimeMinutes: number;
  /** ISO language codes this reviewer can review. */
  languages: string[];
  /** Country codes for country-specific expertise. */
  countries: string[];
  /** Institution IDs for institution-specific expertise. */
  institutions: string[];
}

export interface WorkloadMetrics {
  reviewerId: string;
  activeAssignments: number;
  completedToday: number;
  averageReviewTimeMinutes: number;
  queueDepth: number;
}

export interface AssignmentRecord {
  reviewItemId: string;
  reviewerId: string;
  strategy: AssignmentStrategy;
  rationale: string;
  assignedAt: string;
}

// ── Correction ─────────────────────────────────────────────────────────────

export type CorrectionCategory =
  | "factual_error"
  | "outdated_source"
  | "wrong_location_date"
  | "unsafe_personal_info"
  | "mistranslation"
  | "legal_wording"
  | "broken_link"
  | "duplicate"
  | "misleading_framing"
  | "licensing_attribution";

export type CorrectionState =
  | "new"
  | "under_review"
  | "applied"
  | "rejected"
  | "disputed"
  | "archived"
  | "withdrawn";

export type CorrectionResolution =
  | "update"
  | "downgrade"
  | "dispute"
  | "archive"
  | "withdraw"
  | "remove"
  | "reject";

export interface CorrectionSubmission {
  id: string;
  category: CorrectionCategory;
  targetPage: string;
  targetSection?: string;
  description: string;
  sourceUrl?: string;
  /** Optional contact — never exposed publicly. */
  contactInfo?: string;
  state: CorrectionState;
  resolution?: CorrectionResolution;
  resolutionNote?: string;
  /** Internal reviewer ID assigned. */
  assignedReviewer?: string;
  /** Public-facing correction log entry (no PII). */
  publicLogEntry?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  /** Whether this is a major correction requiring public logging. */
  isMajor: boolean;
  /** Content version counter — incremented each time the correction is applied. */
  version?: number;
}

/**
 * A public-facing correction log entry. Never contains PII, submitter identity,
 * or internal review notes.
 */
export interface PublicCorrectionEntry {
  id: string;
  category: CorrectionCategory;
  targetPage: string;
  resolution?: CorrectionResolution;
  /** Sanitized, human-readable summary of the correction. */
  summary: string;
  createdAt: string;
  resolvedAt?: string;
}

// ── Content type risk levels for priority calculation ──────────────────────

export type ContentRiskLevel = "legal" | "casualty" | "testimony" | "humanitarian" | "general";

export type SourceRiskLevel = "court" | "un" | "ngo" | "media";
