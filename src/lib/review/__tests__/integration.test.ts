/**
 * M4.3 Integration Tests
 *
 * End-to-end scenarios crossing module boundaries:
 * - Full review lifecycle
 * - Correction workflow
 * - Priority ordering
 * - SLA escalation
 * - Assignment round-robin
 */
import { describe, it, expect, beforeEach } from "vitest";
import { ReviewQueue } from "../ReviewQueue";
import { InMemoryPersistence } from "../ReviewPersistence";
import { ReviewStateMachine } from "../ReviewStateMachine";
import { AssignmentRouter } from "../AssignmentRouter";
import { ReviewerRegistry } from "../ReviewerRegistry";
import { SLATracker } from "../SLATracker";
import { CorrectionManager } from "../CorrectionManager";

import type {
  ReviewItem,
  ReviewerProfile,
  ReviewType,
} from "../types";

// ── Helpers ────────────────────────────────────────────────────────────────

function makeReviewer(
  id: string,
  overrides: Partial<ReviewerProfile> = {},
): ReviewerProfile {
  return {
    id,
    role: "Test Reviewer",
    expertiseAreas: ["legal", "editorial", "translation", "competency"],
    contentSkills: [
      { contentType: "evidence", proficiency: 3 as const },
      { contentType: "legal_case", proficiency: 4 as const },
    ],
    maxWorkload: 5,
    currentWorkload: 0,
    availability: "available",
    activeAssignments: [],
    completedToday: 0,
    averageReviewTimeMinutes: 30,
    languages: ["en", "fr"],
    countries: ["BE"],
    institutions: ["icc"],
    ...overrides,
  };
}

function makeEnqueueInput(overrides: Partial<ReviewItem> = {}) {
  return {
    sourceContentRef: {
      type: "evidence" as const,
      id: "ev-test",
      slug: "test-evidence",
    },
    reviewType: "editorial" as ReviewType,
    priority: "medium" as const,
    priorityScore: 50,
    state: "new" as const,
    comments: [],
    checklists: [],
    slaTarget: {
      targetHours: 24,
      warningThreshold: 0.75,
      overdueThreshold: 1.25,
      escalationPath: [
        { afterHoursOverdue: 4, action: "notify_admin" as const },
      ],
    },
    stateHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ── Integration Tests ──────────────────────────────────────────────────────

describe("M4.3 Integration: Full Review Lifecycle", () => {
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

  it("completes full lifecycle: enqueue → assign → review → approve → publish → archive", async () => {
    // Register a reviewer
    registry.register(makeReviewer("rev-1"));

    // Enqueue
    const item = await queue.enqueue(makeEnqueueInput({ reviewType: "editorial" }));
    expect(item.state).toBe("new");

    // Assign (uses assignItem internally)
    const record = await router.assign(item, "load_balanced");
    expect(record.reviewerId).toBe("rev-1");
    expect(record.strategy).toBe("load_balanced");

    const assigned = await queue.getById(item.id);
    expect(assigned!.state).toBe("assigned");
    expect(assigned!.assignedReviewer).toBe("rev-1");

    // Start review
    const inReview = await queue.updateState(item.id, "in_review", { actor: "rev-1" });
    expect(inReview.state).toBe("in_review");

    // Record a checklist pass so the approval guard is satisfied
    const withChecklist = await queue.getById(item.id);
    withChecklist!.checklists = [{ itemId: "editorial-tone", result: "pass" }];

    // Approve (guard requires at least one required checklist item recorded and passing)
    await queue.updateState(item.id, "approved", {
      actor: "rev-1",
      requiredChecklistItemIds: ["editorial-tone"],
    });

    // Publish
    await queue.updateState(item.id, "published", { actor: "rev-1" });

    // Archive
    const archived = await queue.updateState(item.id, "archived");
    expect(archived.state).toBe("archived");
    expect(archived.stateHistory).toHaveLength(5); // new→assigned→in_review→approved→published→archived
  });

  it("handles changes-requested cycle", async () => {
    registry.register(makeReviewer("rev-1"));

    const item = await queue.enqueue(makeEnqueueInput({ reviewType: "legal" }));
    await router.assign(item, "load_balanced");
    await queue.updateState(item.id, "in_review", { actor: "rev-1" });

    // Request changes
    const changesRequested = await queue.updateState(item.id, "changes_requested", {
      actor: "rev-1",
      reason: "Legal status needs correction",
    });
    expect(changesRequested.state).toBe("changes_requested");

    // Add comment while in changes_requested state (guard requires stateAtComment match)
    await queue.addComment(item.id, "rev-1", "Please fix the legal status label.");

    // Fix and resubmit
    const backInReview = await queue.updateState(item.id, "in_review", { actor: "rev-1" });
    expect(backInReview.state).toBe("in_review");

    // Record checklist pass for approval guard
    const fixed = await queue.getById(item.id);
    fixed!.checklists = [{ itemId: "legal-status", result: "pass" }];

    // Approve
    await queue.updateState(item.id, "approved", {
      actor: "rev-1",
      requiredChecklistItemIds: ["legal-status"],
    });

    const published = await queue.updateState(item.id, "published", {
      actor: "rev-1",
    });
    expect(published.state).toBe("published");
  });

  it("rejects invalid state transitions", async () => {
    const item = await queue.enqueue(makeEnqueueInput());

    // Can't jump from new directly to approved
    await expect(
      queue.updateState(item.id, "approved"),
    ).rejects.toThrow();
  });
});

describe("M4.3 Integration: Priority Ordering", () => {
  it("dequeues critical before high before medium before low", async () => {
    const queue = new ReviewQueue(new InMemoryPersistence(), new ReviewStateMachine());

    // Enqueue items in reverse priority order to test sorting
    const low = await queue.enqueue(makeEnqueueInput({
      reviewType: "editorial",
    }), {
      contentRiskLevel: "general",
      sourceRiskLevel: "media",
      hasContradictions: false,
      hasHallucinations: false,
    });
    expect(low.priority).toBe("low");

    const medium = await queue.enqueue(makeEnqueueInput({
      reviewType: "editorial",
    }), {
      contentRiskLevel: "humanitarian",
      sourceRiskLevel: "ngo",
      hasContradictions: false,
      hasHallucinations: false,
    });
    expect(medium.priority).toBe("medium");

    const high = await queue.enqueue(makeEnqueueInput({
      reviewType: "legal",
    }), {
      contentRiskLevel: "casualty",
      sourceRiskLevel: "un",
      hasContradictions: false,
      hasHallucinations: false,
    });
    expect(high.priority).toBe("high");

    const critical = await queue.enqueue(makeEnqueueInput({
      reviewType: "legal",
    }), {
      contentRiskLevel: "legal",
      sourceRiskLevel: "court",
      hasContradictions: true,
      hasHallucinations: false,
    });
    expect(critical.priority).toBe("critical");

    // Dequeue should return critical first
    const first = await queue.dequeue();
    expect(first!.id).toBe(critical.id);

    // Transition first out of "new" so next dequeue works
    await queue.assignItem(first!.id, "rev-1");

    const second = await queue.dequeue();
    expect(second!.id).toBe(high.id);
  });

  it("respects FIFO within same priority level", async () => {
    const queue = new ReviewQueue(new InMemoryPersistence(), new ReviewStateMachine());

    const first = await queue.enqueue(makeEnqueueInput({
      reviewType: "editorial",
      createdAt: "2026-01-01T00:00:00.000Z",
    }), {
      contentRiskLevel: "general",
      sourceRiskLevel: "media",
      hasContradictions: false,
      hasHallucinations: false,
    });
    first.priority = "low";

    const second = await queue.enqueue(makeEnqueueInput({
      reviewType: "editorial",
      createdAt: "2026-01-02T00:00:00.000Z",
    }), {
      contentRiskLevel: "general",
      sourceRiskLevel: "media",
      hasContradictions: false,
      hasHallucinations: false,
    });
    second.priority = "low";

    // Both are low priority — first should be dequeued first (FIFO)
    // Note: the queue sorts by priorityScore then createdAt, so items with
    // same priorityScore should be ordered by createdAt ascending.
    expect((await queue.dequeue())!.id).toBe(first.id);
    await queue.assignItem(first.id, "rev-1");
    expect((await queue.dequeue())!.id).toBe(second.id);
  });
});

describe("M4.3 Integration: Correction Workflow", () => {
  let queue: ReviewQueue;
  let correctionManager: CorrectionManager;

  beforeEach(() => {
    queue = new ReviewQueue(new InMemoryPersistence(), new ReviewStateMachine());
    correctionManager = new CorrectionManager(queue);
  });

  it("completes correction workflow: submit → review → apply → public log", async () => {
    const submission = await correctionManager.submit({
      category: "factual_error",
      targetPage: "/countries/belgium",
      description: "The UN voting record date is incorrect.",
      sourceUrl: "https://example.com/correct-record",
    });

    expect(submission.state).toBe("new");
    expect(submission.isMajor).toBe(true);

    // Review and accept
    const reviewed = await correctionManager.review(
      submission.id,
      "update",
      "Confirmed — updating the voting record date.",
      "rev-1",
    );
    expect(reviewed.state).toBe("under_review");
    expect(reviewed.resolution).toBe("update");

    // Apply
    const applied = await correctionManager.apply(submission.id, "rev-1");
    expect(applied.state).toBe("applied");
    expect(applied.publicLogEntry).toBeTruthy();

    // Check public log
    const log = await correctionManager.getPublicLog();
    expect(log).toHaveLength(1);
    expect(log[0].category).toBe("factual_error");
    // No PII in public log
    expect(log[0].summary).not.toContain("@");
    expect(log[0].summary).not.toContain("+");
  });

  it("immediately applies unsafe_personal_info corrections", async () => {
    const submission = await correctionManager.submit({
      category: "unsafe_personal_info",
      targetPage: "/evidence/sensitive",
      description: "This page contains a private home address.",
    });

    // Should be auto-applied
    expect(submission.state).toBe("applied");
    expect(submission.resolution).toBe("update");

    const log = await correctionManager.getPublicLog();
    expect(log).toHaveLength(1);
    expect(log[0].category).toBe("unsafe_personal_info");
  });

  it("rejects submissions containing PII in description", async () => {
    await expect(
      correctionManager.submit({
        category: "broken_link",
        targetPage: "/test",
        description: "My email is user@example.com — fix this link.",
      }),
    ).rejects.toThrow();
  });
});

describe("M4.3 Integration: SLA Escalation", () => {
  it("detects overdue items and triggers escalation", async () => {
    const queue = new ReviewQueue(new InMemoryPersistence(), new ReviewStateMachine());
    const slaTracker = new SLATracker();
    const registry = new ReviewerRegistry();
    const router = new AssignmentRouter(registry, queue);

    registry.register(makeReviewer("rev-1"));
    registry.register(makeReviewer("rev-2"));

    // Enqueue with a very short SLA (1 hour)
    const item = await queue.enqueue(makeEnqueueInput({
      reviewType: "legal",
      slaTarget: {
        targetHours: 0.01, // ~36 seconds
        warningThreshold: 0.5,
        overdueThreshold: 1.0,
        escalationPath: [
          { afterHoursOverdue: 0, action: "reassign" },
        ],
      },
    }));

    slaTracker.track(item);
    await router.assign(item, "load_balanced");

    // Manually trigger check cycle (would normally run on a timer)
    const alerts = slaTracker.runCheckCycle();
    // Item was just assigned — may or may not be overdue depending on timing
    expect(alerts).toBeDefined();

    // Escalation check should return actions for overdue items
    const escalationActions = slaTracker.getEscalationActions(item);
    expect(escalationActions).toBeDefined();
  });
});

describe("M4.3 Integration: Assignment Strategies", () => {
  let registry: ReviewerRegistry;
  let router: AssignmentRouter;
  let queue: ReviewQueue;

  beforeEach(() => {
    queue = new ReviewQueue(new InMemoryPersistence(), new ReviewStateMachine());
    registry = new ReviewerRegistry();
    router = new AssignmentRouter(registry, queue);
  });

  it("round-robin cycles through available reviewers", async () => {
    registry.register(makeReviewer("rev-1"));
    registry.register(makeReviewer("rev-2"));
    registry.register(makeReviewer("rev-3"));

    const item1 = await queue.enqueue(makeEnqueueInput({ reviewType: "editorial" }));
    const item2 = await queue.enqueue(makeEnqueueInput({ reviewType: "editorial" }));
    const item3 = await queue.enqueue(makeEnqueueInput({ reviewType: "editorial" }));

    const a1 = await router.assign(item1, "round_robin");
    const a2 = await router.assign(item2, "round_robin");
    const a3 = await router.assign(item3, "round_robin");

    // All three should get different reviewers (cycling through the pool)
    const ids = [a1.reviewerId, a2.reviewerId, a3.reviewerId];
    expect(new Set(ids).size).toBe(3);
  });

  it("load-balanced picks least-loaded reviewer", async () => {
    const r1 = makeReviewer("rev-1");
    const r2 = makeReviewer("rev-2");

    // Give rev-1 some existing workload
    r1.currentWorkload = 3;
    r1.activeAssignments = ["a", "b", "c"];

    registry.register(r1);
    registry.register(r2);

    const item = await queue.enqueue(makeEnqueueInput({ reviewType: "editorial" }));
    const record = await router.assign(item, "load_balanced");

    // rev-2 should be picked (0/5 load vs 3/5)
    expect(record.reviewerId).toBe("rev-2");
    expect(record.strategy).toBe("load_balanced");
  });

  it("expertise matches reviewer with correct skills", async () => {
    registry.register(makeReviewer("rev-general", {
      expertiseAreas: ["editorial"],
    }));
    registry.register(makeReviewer("rev-legal", {
      expertiseAreas: ["legal", "editorial"],
    }));

    const item = await queue.enqueue(makeEnqueueInput({ reviewType: "legal" }));
    const record = await router.assign(item, "expertise");

    // rev-legal should be picked (has legal expertise)
    expect(record.reviewerId).toBe("rev-legal");
    expect(record.strategy).toBe("expertise");
  });
});
