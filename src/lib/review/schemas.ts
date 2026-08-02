import { z } from "zod";

// Reuse primitives from src/schemas/index.ts
const nonEmptyString = z.string().trim().min(1);
const isoDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}/);

// ── Review State ───────────────────────────────────────────────────────────

export const reviewStateSchema = z.enum([
  "new", "assigned", "in_review", "changes_requested",
  "approved", "published", "rejected", "archived",
]);

export const priorityLevelSchema = z.enum(["critical", "high", "medium", "low"]);

export const reviewTypeSchema = z.enum([
  "source", "editorial", "legal", "competency",
  "safety", "translation", "accessibility", "licensing",
]);

// ── Checklist ──────────────────────────────────────────────────────────────

export const checklistResultSchema = z.enum(["pass", "fail", "na"]);

export const reviewChecklistItemSchema = z.object({
  id: nonEmptyString,
  label: nonEmptyString,
  description: nonEmptyString,
  required: z.boolean(),
  category: nonEmptyString,
});

export const reviewChecklistResultSchema = z.object({
  itemId: nonEmptyString,
  result: checklistResultSchema,
  note: z.string().optional(),
});

// ── Comments ───────────────────────────────────────────────────────────────

export const reviewCommentSchema = z.object({
  id: nonEmptyString,
  reviewItemId: nonEmptyString,
  authorId: nonEmptyString,
  body: nonEmptyString,
  stateAtComment: reviewStateSchema,
  version: z.number().int().min(1),
  createdAt: isoDateString,
  editedAt: isoDateString.optional(),
});

// ── SLA ────────────────────────────────────────────────────────────────────

export const escalationStepSchema = z.object({
  afterHoursOverdue: z.number().positive(),
  action: z.enum(["reassign", "notify_admin", "notify_reviewer"]),
});

export const slaTargetSchema = z.object({
  targetHours: z.number().positive(),
  warningThreshold: z.number().min(0).max(1),
  overdueThreshold: z.number().min(0).max(2),
  escalationPath: z.array(escalationStepSchema),
});

// ── State Transition ───────────────────────────────────────────────────────

export const stateTransitionSchema = z.object({
  from: reviewStateSchema,
  to: reviewStateSchema,
  timestamp: isoDateString,
  actor: z.string().optional(),
  reason: z.string().optional(),
});

// ── Review Item (Full) ─────────────────────────────────────────────────────

export const sourceContentRefSchema = z.object({
  type: z.enum([
    "evidence", "legal_case", "source", "organization",
    "action_template", "country", "institution",
  ]),
  id: nonEmptyString,
  slug: nonEmptyString,
});

export const reviewItemSchema = z.object({
  id: nonEmptyString,
  sourceContentRef: sourceContentRefSchema,
  aiOutput: z.object({
    pipelineRunId: nonEmptyString,
    stageResults: z.record(z.string(), z.unknown()),
  }).optional(),
  reviewType: reviewTypeSchema,
  priority: priorityLevelSchema,
  priorityScore: z.number().int().min(0).max(100),
  state: reviewStateSchema,
  assignedReviewer: z.string().optional(),
  dueBy: isoDateString.optional(),
  comments: z.array(reviewCommentSchema),
  checklists: z.array(reviewChecklistResultSchema),
  slaTarget: slaTargetSchema,
  stateHistory: z.array(stateTransitionSchema),
  createdAt: isoDateString,
  updatedAt: isoDateString,
  assignmentStrategy: z.enum(["round_robin", "expertise", "load_balanced", "manual"]).optional(),
  assignmentRationale: z.string().optional(),
});

// ── Reviewer ───────────────────────────────────────────────────────────────

export const reviewerProfileSchema = z.object({
  id: nonEmptyString,
  role: nonEmptyString,
  expertiseAreas: z.array(reviewTypeSchema),
  contentSkills: z.array(z.object({
    contentType: sourceContentRefSchema.shape.type,
    proficiency: z.number().int().min(1).max(5),
  })),
  maxWorkload: z.number().int().positive(),
  currentWorkload: z.number().int().min(0),
  availability: z.enum(["available", "busy", "unavailable"]),
  activeAssignments: z.array(z.string()),
  completedToday: z.number().int().min(0),
  averageReviewTimeMinutes: z.number().min(0),
  languages: z.array(z.string()),
  countries: z.array(z.string()),
  institutions: z.array(z.string()),
});

// ── Correction ─────────────────────────────────────────────────────────────

export const correctionCategorySchema = z.enum([
  "factual_error", "outdated_source", "wrong_location_date",
  "unsafe_personal_info", "mistranslation", "legal_wording",
  "broken_link", "duplicate", "misleading_framing", "licensing_attribution",
]);

export const correctionStateSchema = z.enum([
  "new", "under_review", "applied", "rejected", "disputed", "archived", "withdrawn",
]);

export const correctionSubmissionSchema = z.object({
  id: nonEmptyString,
  category: correctionCategorySchema,
  targetPage: nonEmptyString,
  targetSection: z.string().optional(),
  description: nonEmptyString,
  sourceUrl: z.string().optional(),
  contactInfo: z.string().optional(), // never exposed publicly
  state: correctionStateSchema,
  resolution: z.enum(["update", "downgrade", "dispute", "archive", "withdraw", "remove"]).optional(),
  resolutionNote: z.string().optional(),
  assignedReviewer: z.string().optional(),
  publicLogEntry: z.string().optional(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
  resolvedAt: isoDateString.optional(),
  isMajor: z.boolean(),
});

// ── Inferred types ─────────────────────────────────────────────────────────

export type ReviewItemSchema = z.infer<typeof reviewItemSchema>;
export type ReviewerProfileSchema = z.infer<typeof reviewerProfileSchema>;
export type CorrectionSubmissionSchema = z.infer<typeof correctionSubmissionSchema>;
