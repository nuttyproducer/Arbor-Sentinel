// src/lib/review/__tests__/AssignmentRouter.test.ts

import { describe, it, expect } from "vitest";
import {
  AssignmentRouter,
  NoAvailableReviewerError,
  ReviewerAtCapacityError,
  ManualAssignmentError,
} from "../AssignmentRouter";
import { ReviewerRegistry, ReviewerNotFoundError } from "../ReviewerRegistry";
import { ReviewQueue, ItemNotFoundError, type EnqueueInput } from "../ReviewQueue";
import type { ReviewerProfile, ReviewItem } from "../types";

// ── Fixtures ────────────────────────────────────────────────────────────────

const placeholderSlaTarget = {
  targetHours: 24,
  warningThreshold: 0.75,
  overdueThreshold: 1.25,
  escalationPath: [{ afterHoursOverdue: 6, action: "notify_admin" as const }],
};

function makeEnqueueInput(overrides: Partial<ReviewItem> = {}): EnqueueInput {
  return {
    sourceContentRef: { type: "evidence", id: "evidence-1", slug: "evidence-1" },
    reviewType: "source",
    priority: "medium",
    slaTarget: placeholderSlaTarget,
    comments: [],
    checklists: [],
    ...overrides,
  };
}

function makeReviewer(overrides: Partial<ReviewerProfile> = {}): ReviewerProfile {
  return {
    id: "reviewer-1",
    role: "Content Reviewer",
    expertiseAreas: ["source", "editorial"],
    contentSkills: [
      { contentType: "evidence", proficiency: 4 },
      { contentType: "source", proficiency: 3 },
    ],
    maxWorkload: 5,
    currentWorkload: 0,
    availability: "available",
    activeAssignments: [],
    completedToday: 0,
    averageReviewTimeMinutes: 90,
    languages: ["en", "fr"],
    countries: ["US", "FR"],
    institutions: [],
    ...overrides,
  };
}

function makeRouter() {
  const registry = new ReviewerRegistry();
  const queue = new ReviewQueue();
  const router = new AssignmentRouter(registry, queue);
  return { registry, queue, router };
}

async function enqueue(
  queue: ReviewQueue,
  overrides: Partial<ReviewItem> = {},
): Promise<ReviewItem> {
  return queue.enqueue(makeEnqueueInput(overrides));
}

// ── round_robin ─────────────────────────────────────────────────────────────

describe("round_robin", () => {
  it("cycles through available reviewers", async () => {
    const { registry, queue, router } = makeRouter();
    registry.register(makeReviewer({ id: "r1", expertiseAreas: ["source"] }));
    registry.register(makeReviewer({ id: "r2", expertiseAreas: ["source"] }));
    registry.register(makeReviewer({ id: "r3", expertiseAreas: ["source"] }));

    const item1 = await enqueue(queue);
    const item2 = await enqueue(queue);
    const item3 = await enqueue(queue);
    const item4 = await enqueue(queue);

    const a1 = await router.assign(item1, "round_robin");
    const a2 = await router.assign(item2, "round_robin");
    const a3 = await router.assign(item3, "round_robin");
    const a4 = await router.assign(item4, "round_robin");

    expect([a1.reviewerId, a2.reviewerId, a3.reviewerId]).toEqual(["r1", "r2", "r3"]);
    // Fourth assignment cycles back to the first reviewer.
    expect(a4.reviewerId).toBe("r1");
  });

  it("skips unavailable reviewers", async () => {
    const { registry, queue, router } = makeRouter();
    registry.register(makeReviewer({ id: "r1", expertiseAreas: ["source"] }));
    registry.register(
      makeReviewer({ id: "busy", expertiseAreas: ["source"], availability: "busy" }),
    );
    registry.register(makeReviewer({ id: "r2", expertiseAreas: ["source"] }));

    const item1 = await enqueue(queue);
    const item2 = await enqueue(queue);

    const a1 = await router.assign(item1, "round_robin");
    const a2 = await router.assign(item2, "round_robin");

    expect(a1.reviewerId).toBe("r1");
    expect(a2.reviewerId).toBe("r2"); // never picks "busy"
  });

  it("throws when no reviewer is available for the type", async () => {
    const { registry, queue, router } = makeRouter();
    registry.register(makeReviewer({ id: "legal", expertiseAreas: ["legal"] }));

    const item = await enqueue(queue, { reviewType: "source" });
    await expect(router.assign(item, "round_robin")).rejects.toBeInstanceOf(
      NoAvailableReviewerError,
    );
  });
});

// ── expertise ───────────────────────────────────────────────────────────────

describe("expertise", () => {
  it("selects the reviewer with matching expertise", async () => {
    const { registry, queue, router } = makeRouter();
    registry.register(
      makeReviewer({
        id: "legal",
        expertiseAreas: ["legal"],
        contentSkills: [{ contentType: "legal_case", proficiency: 5 }],
      }),
    );
    registry.register(
      makeReviewer({
        id: "source",
        expertiseAreas: ["source"],
        contentSkills: [{ contentType: "evidence", proficiency: 4 }],
      }),
    );

    const item = await enqueue(queue, { reviewType: "source" });
    const record = await router.assign(item, "expertise");

    expect(record.reviewerId).toBe("source");
  });

  it("picks the reviewer with the higher content skill proficiency", async () => {
    const { registry, queue, router } = makeRouter();
    registry.register(
      makeReviewer({
        id: "expert",
        expertiseAreas: ["source"],
        contentSkills: [{ contentType: "evidence", proficiency: 5 }],
      }),
    );
    registry.register(
      makeReviewer({
        id: "novice",
        expertiseAreas: ["source"],
        contentSkills: [{ contentType: "evidence", proficiency: 2 }],
      }),
    );

    const item = await enqueue(queue, { reviewType: "source" });
    const record = await router.assign(item, "expertise");

    expect(record.reviewerId).toBe("expert");
  });

  it("applies language and country bonuses", async () => {
    const { registry, queue, router } = makeRouter();
    registry.register(
      makeReviewer({
        id: "base",
        expertiseAreas: ["source"],
        contentSkills: [{ contentType: "evidence", proficiency: 3 }],
        languages: ["en"],
        countries: ["US"],
      }),
    );
    registry.register(
      makeReviewer({
        id: "lang",
        expertiseAreas: ["source"],
        contentSkills: [{ contentType: "evidence", proficiency: 3 }],
        languages: ["fr"],
        countries: ["US"],
      }),
    );
    registry.register(
      makeReviewer({
        id: "both",
        expertiseAreas: ["source"],
        contentSkills: [{ contentType: "evidence", proficiency: 3 }],
        languages: ["fr"],
        countries: ["FR"],
      }),
    );

    const item = await enqueue(queue, { reviewType: "source" });
    const record = await router.assign(item, "expertise", {
      language: "fr",
      country: "FR",
    });

    // base = 6, lang = 8, both = 10.
    expect(record.reviewerId).toBe("both");
  });

  it("returns null when no reviewer has the matching expertise", async () => {
    const { registry, queue, router } = makeRouter();
    registry.register(
      makeReviewer({
        id: "legal",
        expertiseAreas: ["legal"],
        contentSkills: [{ contentType: "legal_case", proficiency: 5 }],
      }),
    );

    const item = await enqueue(queue, { reviewType: "source" });
    await expect(router.assign(item, "expertise")).rejects.toBeInstanceOf(
      NoAvailableReviewerError,
    );
  });
});

// ── load_balanced ───────────────────────────────────────────────────────────

describe("load_balanced", () => {
  const sourceSkills: ReviewerProfile["contentSkills"] = [
    { contentType: "evidence", proficiency: 4 },
  ];

  it("picks the least-loaded reviewer", async () => {
    const { registry, queue, router } = makeRouter();
    registry.register(
      makeReviewer({ id: "r1", expertiseAreas: ["source"], contentSkills: sourceSkills, currentWorkload: 3, maxWorkload: 10 }),
    );
    registry.register(
      makeReviewer({ id: "r2", expertiseAreas: ["source"], contentSkills: sourceSkills, currentWorkload: 1, maxWorkload: 10 }),
    );
    registry.register(
      makeReviewer({ id: "r3", expertiseAreas: ["source"], contentSkills: sourceSkills, currentWorkload: 2, maxWorkload: 10 }),
    );

    const item = await enqueue(queue, { reviewType: "source" });
    const record = await router.assign(item, "load_balanced");

    // Ratios: r1 0.3, r2 0.1, r3 0.2.
    expect(record.reviewerId).toBe("r2");
  });

  it("respects workload caps (excludes at-capacity reviewers)", async () => {
    const { registry, queue, router } = makeRouter();
    registry.register(
      makeReviewer({ id: "full", expertiseAreas: ["source"], contentSkills: sourceSkills, currentWorkload: 5, maxWorkload: 5 }),
    );
    registry.register(
      makeReviewer({ id: "open", expertiseAreas: ["source"], contentSkills: sourceSkills, currentWorkload: 2, maxWorkload: 5 }),
    );

    const item = await enqueue(queue, { reviewType: "source" });
    const record = await router.assign(item, "load_balanced");

    expect(record.reviewerId).toBe("open");
  });

  it("throws when every reviewer is at capacity", async () => {
    const { registry, queue, router } = makeRouter();
    registry.register(
      makeReviewer({ id: "r1", expertiseAreas: ["source"], contentSkills: sourceSkills, currentWorkload: 5, maxWorkload: 5 }),
    );
    registry.register(
      makeReviewer({ id: "r2", expertiseAreas: ["source"], contentSkills: sourceSkills, currentWorkload: 5, maxWorkload: 5 }),
    );

    const item = await enqueue(queue, { reviewType: "source" });
    await expect(router.assign(item, "load_balanced")).rejects.toBeInstanceOf(
      NoAvailableReviewerError,
    );
  });

  it("is the default strategy when none is specified", async () => {
    const { registry, queue, router } = makeRouter();
    registry.register(
      makeReviewer({ id: "r1", expertiseAreas: ["source"], contentSkills: sourceSkills }),
    );

    const item = await enqueue(queue, { reviewType: "source" });
    const record = await router.assign(item);

    expect(record.strategy).toBe("load_balanced");
    expect(record.reviewerId).toBe("r1");
  });
});

// ── manual ──────────────────────────────────────────────────────────────────

describe("manual", () => {
  it("assigns to the specified reviewer", async () => {
    const { registry, queue, router } = makeRouter();
    registry.register(makeReviewer({ id: "r1", expertiseAreas: ["source"] }));
    registry.register(makeReviewer({ id: "r2", expertiseAreas: ["source"] }));

    const item = await enqueue(queue, { reviewType: "source" });
    const record = await router.assign(item, "manual", { reviewerId: "r2" });

    expect(record.reviewerId).toBe("r2");
    expect(record.strategy).toBe("manual");

    const loaded = await queue.getById(item.id);
    expect(loaded?.assignedReviewer).toBe("r2");
    expect(loaded?.state).toBe("assigned");
  });

  it("falls back to the item's assignedReviewer when no options are given", async () => {
    const { registry, queue, router } = makeRouter();
    registry.register(makeReviewer({ id: "r1", expertiseAreas: ["source"] }));

    const item = await enqueue(queue, { reviewType: "source", assignedReviewer: "r1" });
    const record = await router.assign(item, "manual");

    expect(record.reviewerId).toBe("r1");
  });

  it("throws if the reviewer is at capacity", async () => {
    const { registry, queue, router } = makeRouter();
    registry.register(
      makeReviewer({ id: "full", expertiseAreas: ["source"], currentWorkload: 5, maxWorkload: 5 }),
    );

    const item = await enqueue(queue, { reviewType: "source" });
    await expect(router.assign(item, "manual", { reviewerId: "full" })).rejects.toBeInstanceOf(
      ReviewerAtCapacityError,
    );
  });

  it("throws if the reviewer is not registered", async () => {
    const { queue, router } = makeRouter();

    const item = await enqueue(queue, { reviewType: "source" });
    await expect(router.assign(item, "manual", { reviewerId: "ghost" })).rejects.toBeInstanceOf(
      ReviewerNotFoundError,
    );
  });

  it("throws when no reviewer id is provided", async () => {
    const { queue, router } = makeRouter();

    const item = await enqueue(queue, { reviewType: "source" });
    await expect(router.assign(item, "manual")).rejects.toBeInstanceOf(ManualAssignmentError);
  });
});

// ── reassign ────────────────────────────────────────────────────────────────

describe("reassign", () => {
  const sourceSkills: ReviewerProfile["contentSkills"] = [
    { contentType: "evidence", proficiency: 4 },
  ];

  it("creates a new assignment record and shifts workload", async () => {
    const { registry, queue, router } = makeRouter();
    registry.register(
      makeReviewer({ id: "r1", expertiseAreas: ["source"], contentSkills: sourceSkills }),
    );
    registry.register(
      makeReviewer({ id: "r2", expertiseAreas: ["source"], contentSkills: sourceSkills }),
    );

    const item = await enqueue(queue, { reviewType: "source" });
    const first = await router.assign(item, "load_balanced");
    expect(first.reviewerId).toBe("r1"); // equal ratios, tie-break by id

    const second = await router.reassign(item.id, "Reviewer unavailable");

    expect(second.reviewItemId).toBe(item.id);
    expect(second.reviewerId).toBe("r2");
    expect(second.rationale).toBe("Reviewer unavailable");
    expect(second.strategy).toBe("load_balanced");

    // Workload moved from r1 to r2.
    expect(registry.getWorkload("r1").activeAssignments).toBe(0);
    expect(registry.getWorkload("r2").activeAssignments).toBe(1);

    // The item's reviewer is updated and the history records the reassignment.
    const loaded = await queue.getById(item.id);
    expect(loaded?.assignedReviewer).toBe("r2");
    expect(loaded?.stateHistory).toHaveLength(2);
    expect(loaded?.stateHistory[1]).toMatchObject({
      from: "assigned",
      to: "assigned",
      reason: "Reviewer unavailable",
    });
  });

  it("throws ItemNotFoundError for an unknown item", async () => {
    const { router } = makeRouter();
    await expect(router.reassign("missing", "reason")).rejects.toBeInstanceOf(ItemNotFoundError);
  });
});

// ── records & workload ──────────────────────────────────────────────────────

describe("assignment records", () => {
  it("includes the strategy and rationale", async () => {
    const { registry, queue, router } = makeRouter();
    registry.register(makeReviewer({ id: "r1", expertiseAreas: ["source"] }));

    const item = await enqueue(queue, { reviewType: "source" });
    const record = await router.assign(item, "round_robin");

    expect(record.reviewItemId).toBe(item.id);
    expect(record.reviewerId).toBe("r1");
    expect(record.strategy).toBe("round_robin");
    expect(record.rationale).toContain("Round-robin");
    expect(Date.parse(record.assignedAt)).not.toBeNaN();

    // getAssignment returns the stored record.
    expect(router.getAssignment(item.id)).toEqual(record);
  });

  it("stores strategy and rationale on the review item", async () => {
    const { registry, queue, router } = makeRouter();
    registry.register(makeReviewer({ id: "r1", expertiseAreas: ["source"] }));

    const item = await enqueue(queue, { reviewType: "source" });
    await router.assign(item, "round_robin");

    const loaded = await queue.getById(item.id);
    expect(loaded?.assignmentStrategy).toBe("round_robin");
    expect(loaded?.assignmentRationale).toContain("Round-robin");
    expect(loaded?.state).toBe("assigned");
  });

  it("updates the reviewer's workload on assignment", async () => {
    const { registry, queue, router } = makeRouter();
    registry.register(
      makeReviewer({ id: "r1", expertiseAreas: ["source"], currentWorkload: 2 }),
    );

    const item = await enqueue(queue, { reviewType: "source" });
    await router.assign(item, "round_robin");

    expect(registry.getWorkload("r1").activeAssignments).toBe(3);
  });

  it("getAssignment returns undefined when no assignment exists", () => {
    const { router } = makeRouter();
    expect(router.getAssignment("missing")).toBeUndefined();
  });
});
