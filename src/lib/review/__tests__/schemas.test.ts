// src/lib/review/__tests__/schemas.test.ts

import { describe, it, expect } from "vitest";
import {
  reviewItemSchema,
  reviewCommentSchema,
  reviewerProfileSchema,
  correctionSubmissionSchema,
  slaTargetSchema,
} from "../schemas";

// ── Fixtures ────────────────────────────────────────────────────────────────

const validSlaTarget = {
  targetHours: 24,
  warningThreshold: 0.75,
  overdueThreshold: 1.5,
  escalationPath: [
    { afterHoursOverdue: 12, action: "notify_admin" },
    { afterHoursOverdue: 24, action: "reassign" },
  ],
};

const validComment = {
  id: "comment-1",
  reviewItemId: "review-1",
  authorId: "reviewer-1",
  body: "Looks good to me — sources verified.",
  stateAtComment: "in_review",
  version: 1,
  createdAt: "2026-08-02",
};

const validReviewItem = {
  id: "review-1",
  sourceContentRef: { type: "evidence", id: "evidence-1", slug: "evidence-1" },
  aiOutput: {
    pipelineRunId: "run-123",
    stageResults: { factCheck: { ok: true }, confidence: 0.92 },
  },
  reviewType: "source",
  priority: "high",
  priorityScore: 80,
  state: "assigned",
  assignedReviewer: "reviewer-1",
  dueBy: "2026-08-10",
  comments: [validComment],
  checklists: [{ itemId: "check-1", result: "pass", note: "No PII found." }],
  slaTarget: validSlaTarget,
  stateHistory: [{ from: "new", to: "assigned", timestamp: "2026-08-02", actor: "system" }],
  createdAt: "2026-08-02",
  updatedAt: "2026-08-02",
  assignmentStrategy: "round_robin",
  assignmentRationale: "Lowest current workload.",
};

const validReviewerProfile = {
  id: "reviewer-1",
  role: "senior-reviewer",
  expertiseAreas: ["source", "legal"],
  contentSkills: [
    { contentType: "evidence", proficiency: 5 },
    { contentType: "legal_case", proficiency: 4 },
  ],
  maxWorkload: 10,
  currentWorkload: 3,
  availability: "available",
  activeAssignments: ["review-1", "review-2"],
  completedToday: 4,
  averageReviewTimeMinutes: 45,
  languages: ["en", "ar"],
  countries: ["PS", "IL"],
  institutions: ["un"],
};

const validCorrectionSubmission = {
  id: "corr-1",
  category: "factual_error",
  targetPage: "/evidence/icj-2024-01-26",
  targetSection: "summary",
  description: "The ruling date is incorrect.",
  sourceUrl: "https://www.icj-cij.org/",
  contactInfo: "user@example.com",
  state: "under_review",
  resolution: "update",
  resolutionNote: "Date corrected in the summary.",
  assignedReviewer: "reviewer-1",
  publicLogEntry: "Corrected the provisional measures ruling date.",
  createdAt: "2026-08-02",
  updatedAt: "2026-08-02",
  resolvedAt: "2026-08-02",
  isMajor: true,
};

// ── Tests ───────────────────────────────────────────────────────────────────

describe("reviewItemSchema", () => {
  it("validates a complete ReviewItem", () => {
    const result = reviewItemSchema.safeParse(validReviewItem);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("review-1");
      expect(result.data.comments).toHaveLength(1);
      expect(result.data.stateHistory[0].to).toBe("assigned");
    }
  });

  it("rejects invalid state values", () => {
    const result = reviewItemSchema.safeParse({ ...validReviewItem, state: "bogus" });
    expect(result.success).toBe(false);
  });

  it("rejects negative priorityScore", () => {
    const result = reviewItemSchema.safeParse({ ...validReviewItem, priorityScore: -5 });
    expect(result.success).toBe(false);
  });
});

describe("reviewCommentSchema", () => {
  it("validates a comment", () => {
    const result = reviewCommentSchema.safeParse(validComment);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.authorId).toBe("reviewer-1");
      expect(result.data.version).toBe(1);
    }
  });
});

describe("reviewerProfileSchema", () => {
  it("validates a reviewer profile", () => {
    const result = reviewerProfileSchema.safeParse(validReviewerProfile);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.expertiseAreas).toContain("legal");
      expect(result.data.contentSkills[0].proficiency).toBe(5);
    }
  });
});

describe("correctionSubmissionSchema", () => {
  it("validates a correction submission", () => {
    const result = correctionSubmissionSchema.safeParse(validCorrectionSubmission);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe("factual_error");
      expect(result.data.isMajor).toBe(true);
    }
  });

  it("rejects invalid correction categories", () => {
    const result = correctionSubmissionSchema.safeParse({
      ...validCorrectionSubmission,
      category: "not-a-real-category",
    });
    expect(result.success).toBe(false);
  });
});

describe("slaTargetSchema", () => {
  it("validates SLA config", () => {
    const result = slaTargetSchema.safeParse(validSlaTarget);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.escalationPath).toHaveLength(2);
      expect(result.data.escalationPath[0].action).toBe("notify_admin");
    }
  });
});
