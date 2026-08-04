/**
 * Review Queue System — barrel export.
 *
 * M4.3: Review Queue System
 * Provides types, state machine, queue management, assignment routing,
 * SLA tracking, correction management, and checklist definitions.
 */

// ── Types ─────────────────────────────────────────────────────────────────
export type {
  ReviewState,
  PriorityLevel,
  ReviewItem,
  ReviewType,
  StateTransition,
  ReviewComment,
  ReviewChecklistItem,
  ChecklistResult,
  ReviewChecklistResult,
  SLATarget,
  EscalationStep,
  AssignmentStrategy,
  ReviewerProfile,
  WorkloadMetrics,
  AssignmentRecord,
  CorrectionCategory,
  CorrectionState,
  CorrectionResolution,
  CorrectionSubmission,
  PublicCorrectionEntry,
  ContentRiskLevel,
  SourceRiskLevel,
} from "./types";

// ── Schemas ───────────────────────────────────────────────────────────────
export {
  reviewStateSchema,
  priorityLevelSchema,
  reviewTypeSchema,
  checklistResultSchema,
  reviewChecklistItemSchema,
  reviewChecklistResultSchema,
  reviewCommentSchema,
  escalationStepSchema,
  slaTargetSchema,
  stateTransitionSchema,
  sourceContentRefSchema,
  reviewItemSchema,
  reviewerProfileSchema,
  correctionCategorySchema,
  correctionStateSchema,
  correctionSubmissionSchema,
} from "./schemas";
export type {
  ReviewItemSchema,
  ReviewerProfileSchema,
  CorrectionSubmissionSchema,
} from "./schemas";

// ── State Machine ─────────────────────────────────────────────────────────
export {
  VALID_TRANSITIONS,
  InvalidTransitionError,
  ReviewStateMachine,
} from "./ReviewStateMachine";
export type { TransitionOptions } from "./ReviewStateMachine";

// ── Priority ──────────────────────────────────────────────────────────────
export {
  calculatePriority,
  scoreToLevel,
  getSLATarget,
  isOverdue,
  getSLAStatus,
} from "./ReviewPriority";
export type { SLAStatus } from "./ReviewPriority";

// ── Persistence ───────────────────────────────────────────────────────────
export {
  applyFilters,
  InMemoryPersistence,
  LocalStoragePersistence,
} from "./ReviewPersistence";
export type { ReviewQueryFilters, PersistenceStore } from "./ReviewPersistence";

// ── Queue ─────────────────────────────────────────────────────────────────
export {
  ItemNotFoundError,
  ReviewQueue,
  inferPriorityInput,
} from "./ReviewQueue";
export type {
  PriorityInput,
  UpdateStateOptions,
  AssignItemOptions,
  QueueStats,
  EnqueueInput,
} from "./ReviewQueue";

// ── Reviewer Registry ─────────────────────────────────────────────────────
export {
  ReviewerNotFoundError,
  ReviewerRegistry,
} from "./ReviewerRegistry";
export type { AvailabilityFilter, WorkloadDelta } from "./ReviewerRegistry";

// ── Assignment Router ─────────────────────────────────────────────────────
export {
  NoAvailableReviewerError,
  ReviewerAtCapacityError,
  ManualAssignmentError,
  AssignmentRouter,
} from "./AssignmentRouter";
export type { AssignOptions } from "./AssignmentRouter";

// ── SLA Tracker ───────────────────────────────────────────────────────────
export { SLATracker } from "./SLATracker";
export type { SLAAlertStatus, EscalationAction, SLAAlert } from "./SLATracker";

// ── Correction Manager ────────────────────────────────────────────────────
export {
  CorrectionNotFoundError,
  InvalidCorrectionStateError,
  CorrectionPIIError,
  CorrectionManager,
} from "./CorrectionManager";
export type { CorrectionSubmissionInput } from "./CorrectionManager";

// ── Checklist Definitions ─────────────────────────────────────────────────
export { LEGAL_CHECKLIST_ITEMS } from "./legalChecklist";
export { TRANSLATION_CHECKLIST_ITEMS } from "./translationChecklist";
export { EDITORIAL_CHECKLIST_ITEMS } from "./editorialChecklist";
export { COUNTRY_CHECKLIST_ITEMS } from "./countryChecklist";
export { INSTITUTION_CHECKLIST_ITEMS } from "./institutionChecklist";
