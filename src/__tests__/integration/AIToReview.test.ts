/**
 * AI-to-Review Integration Test (M4.7-03).
 *
 * End-to-end: AI pipeline output → review queue creation → assignment → state transitions.
 * Uses actual ReviewQueue and AssignmentRouter APIs verified from existing tests.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ReviewQueue } from "../../lib/review/ReviewQueue";
import { InMemoryPersistence } from "../../lib/review/ReviewPersistence";
import { ReviewStateMachine } from "../../lib/review/ReviewStateMachine";
import { AssignmentRouter } from "../../lib/review/AssignmentRouter";
import { ReviewerRegistry } from "../../lib/review/ReviewerRegistry";
import type { ReviewerProfile, ReviewType, ReviewItem, ReviewState } from "../../lib/review/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeReviewer(id: string, overrides: Partial<ReviewerProfile> = {}): ReviewerProfile {
  return {
    id,
    role: "Test Reviewer",
    expertiseAreas: ["legal", "editorial", "safety"],
    contentSkills: [
      { contentType: "evidence", proficiency: 4 as const },
      { contentType: "legal_case", proficiency: 5 as const },
    ],
    maxWorkload: 5,
    currentWorkload: 0,
    availability: "available",
    activeAssignments: [],
    completedToday: 0,
    averageReviewTimeMinutes: 30,
    languages: ["en"],
    countries: [],
    institutions: [],
    ...overrides,
  };
}

function makeEnqueueInput(overrides: Partial<ReviewItem> = {}) {
  return {
    sourceContentRef: { type: "evidence" as const, id: "ev-test", slug: "test-evidence" },
    reviewType: "editorial" as ReviewType,
    priority: "medium" as const,
    priorityScore: 50,
    state: "new" as ReviewState,
    comments: [],
    checklists: [],
    slaTarget: {
      targetHours: 24,
      warningThreshold: 0.75,
      overdueThreshold: 1.25,
      escalationPath: [{ afterHoursOverdue: 4, action: "notify_admin" as const }],
    },
    stateHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("AI → Review Queue — Integration", () => {
  let queue: ReviewQueue;
  let stateMachine: ReviewStateMachine;
  let registry: ReviewerRegistry;
  let router: AssignmentRouter;

  beforeEach(() => {
    stateMachine = new ReviewStateMachine();
    queue = new ReviewQueue(new InMemoryPersistence(), stateMachine);
    registry = new ReviewerRegistry();
    router = new AssignmentRouter(registry, queue);
  });

  // ── AI output enqueuing ────────────────────────────────────────────────

  describe("AI output enqueuing", () => {
    it("enqueues AI pipeline output as a review item", async () => {
      const item = await queue.enqueue(makeEnqueueInput({
        aiOutput: {
          pipelineRunId: "run-2026-08-03-001",
          stageResults: {
            summarization: { confidence: 0.92 },
            entityExtraction: { confidence: 0.88 },
          },
        },
      }));

      expect(item.id).toBeTruthy();
      expect(item.state).toBe("new");
      expect(item.aiOutput?.pipelineRunId).toBe("run-2026-08-03-001");
    });

    it("preserves AI stage confidence results in review item", async () => {
      const stageResults = {
        summarization: { confidence: 0.92, summary: "ICJ ordered provisional measures." },
        hallucinationDetection: { flags: [], hallucinationScore: 0.03 },
        confidenceEstimation: { overallConfidence: 0.88 },
      };

      const item = await queue.enqueue(makeEnqueueInput({
        reviewType: "safety" as ReviewType,
        aiOutput: { pipelineRunId: "run-002", stageResults },
      }));

      expect(item.aiOutput?.stageResults).toBeDefined();
    });
  });

  // ── Assignment ────────────────────────────────────────────────────────

  describe("assignment", () => {
    it("assigns review items via the assignment router", async () => {
      registry.register(makeReviewer("rev-1"));

      const item = await queue.enqueue(makeEnqueueInput());
      const record = await router.assign(item, "load_balanced");

      expect(record.reviewerId).toBe("rev-1");
      expect(record.strategy).toBe("load_balanced");

      const updated = await queue.getById(item.id);
      expect(updated?.assignedReviewer).toBe("rev-1");
    });
  });

  // ── Review state progression ──────────────────────────────────────────

  describe("state progression", () => {
    it("progresses through full review lifecycle", async () => {
      registry.register(makeReviewer("rev-lifecycle"));

      // Enqueue with a checklist item pre-filled so approval guard is satisfied
      const item = await queue.enqueue(makeEnqueueInput({
        checklists: [{ itemId: "editorial-tone", result: "pass" }],
      }));
      await router.assign(item, "load_balanced");

      await queue.updateState(item.id, "in_review", { actor: "rev-lifecycle" });
      await queue.updateState(item.id, "approved", {
        actor: "rev-lifecycle",
        requiredChecklistItemIds: ["editorial-tone"],
      });

      const final = await queue.getById(item.id);
      expect(final?.state).toBe("approved");
    });

    it("supports changes_requested review loop", async () => {
      registry.register(makeReviewer("rev-loop"));

      const item = await queue.enqueue(makeEnqueueInput({
        checklists: [{ itemId: "editorial-tone", result: "pass" }],
      }));
      await router.assign(item, "load_balanced");
      await queue.updateState(item.id, "in_review", { actor: "rev-loop" });
      await queue.updateState(item.id, "changes_requested", { actor: "rev-loop" });

      // Add comment while in changes_requested so guard is satisfied for return to in_review
      await queue.addComment(item.id, "rev-loop", "Please revise the summary section.");

      // Return to in_review — guard requires a comment with stateAtComment === "changes_requested"
      await queue.updateState(item.id, "in_review", { actor: "rev-loop" });

      // Approve
      await queue.updateState(item.id, "approved", {
        actor: "rev-loop",
        requiredChecklistItemIds: ["editorial-tone"],
      });

      const final = await queue.getById(item.id);
      expect(final?.state).toBe("approved");
    });

    it("rejects invalid transitions", async () => {
      const item = await queue.enqueue(makeEnqueueInput());

      // "new" cannot go directly to "published"
      await expect(
        queue.updateState(item.id, "published", { actor: "system" }),
      ).rejects.toThrow();
    });
  });

  // ── Queue querying ────────────────────────────────────────────────────

  describe("queue querying", () => {
    it("queries items by state", async () => {
      await queue.enqueue(makeEnqueueInput());
      await queue.enqueue(makeEnqueueInput());

      const newItems = await queue.query({ state: "new" });
      expect(newItems.length).toBe(2);
    });

    it("provides queue statistics", async () => {
      await queue.enqueue(makeEnqueueInput());

      const stats = await queue.stats();
      expect(stats).toBeDefined();
    });
  });
});
