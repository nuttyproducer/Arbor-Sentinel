// src/lib/beta/types.ts
// Beta program types — feedback, bug reports, and anonymous user journey analytics.
//
// Feedback and bug reports are stored server-side with a user reference.
// UserJourney records are aggregate-only: they never contain user identifiers.

// ── FeedbackSubmission ─────────────────────────────────────────────────────────

export interface FeedbackSubmission {
  id: string;
  userId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  category: 'content' | 'UI' | 'performance' | 'feature' | 'missing';
  message: string;
  pageContext: string;
  browserInfo: string;
  timestamp: string;
  status: 'new' | 'reviewed' | 'acknowledged' | 'closed';
}

// ── BugReport ──────────────────────────────────────────────────────────────────

export interface BugReport {
  id: string;
  userId: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  browserInfo: string;
  severity: 'critical' | 'major' | 'minor' | 'cosmetic';
  status: 'new' | 'triaged' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  timestamp: string;
}

// ── UserJourney ────────────────────────────────────────────────────────────────
// Aggregate only — no user identifiers.

export interface UserJourney {
  page: string;
  feature: string;
  timeOnPage: number;
}

// ── Submission payloads ────────────────────────────────────────────────────────
// Server-assigned fields (id, userId, timestamp, status) are omitted from the
// client input shapes.

export type FeedbackRating = FeedbackSubmission['rating'];
export type FeedbackCategory = FeedbackSubmission['category'];
export type FeedbackStatus = FeedbackSubmission['status'];

export type BugSeverity = BugReport['severity'];
export type BugReportStatus = BugReport['status'];

export interface FeedbackSubmissionInput {
  rating: FeedbackRating;
  category: FeedbackCategory;
  message: string;
  pageContext: string;
  browserInfo: string;
}

export interface BugReportInput {
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  browserInfo: string;
  severity: BugSeverity;
}

// ── Label maps (used by forms and displays) ───────────────────────────────────

export const FEEDBACK_CATEGORIES: ReadonlyArray<{ value: FeedbackCategory; label: string }> = [
  { value: 'content', label: 'Content' },
  { value: 'UI', label: 'User interface' },
  { value: 'performance', label: 'Performance' },
  { value: 'feature', label: 'Feature request' },
  { value: 'missing', label: 'Missing content' },
];

export const BUG_SEVERITIES: ReadonlyArray<{ value: BugSeverity; label: string }> = [
  { value: 'critical', label: 'Critical — blocks or breaks core functionality' },
  { value: 'major', label: 'Major — significant issue with a workaround' },
  { value: 'minor', label: 'Minor — noticeable but non-blocking' },
  { value: 'cosmetic', label: 'Cosmetic — visual or formatting only' },
];

export const RATING_LABELS: Record<FeedbackRating, string> = {
  1: 'Very poor',
  2: 'Poor',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
};
