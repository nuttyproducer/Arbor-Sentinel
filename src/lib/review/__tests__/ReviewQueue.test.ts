// src/lib/review/__tests__/ReviewQueue.test.ts

import { describe, it, expect } from "vitest";
import {
  ReviewQueue,
  ItemNotFoundError,
  type PriorityInput,
  type EnqueueInput,
} from "../ReviewQueue";
import {
  InMemoryPersistence,
  LocalStoragePersistence,
  type PersistenceStore,
} from "../ReviewPersistence";
import { ReviewStateMachine, InvalidTransitionError } from "../ReviewStateMachine";
import type { ReviewItem } from "../types";

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

// Priority inputs with known scores:
//   legal(40) + court(30)                                  = 70 -> high
//   legal(40) + court(30) + contradiction(15)              = 85 -> critical
//   general(10) + media(10)                                = 20 -> low
//   testimony(25) + ngo(15)                                = 40 -> medium
const highInput: PriorityInput = { contentRiskLevel: "legal", sourceRiskLevel: "court" };
const criticalInput: PriorityInput = {
  contentRiskLevel: "legal",
  sourceRiskLevel: "court",
  hasContradictions: true,
};
const lowInput: PriorityInput = { contentRiskLevel: "general", sourceRiskLevel: "media" };
const mediumInput: PriorityInput = { contentRiskLevel: "testimony", sourceRiskLevel: "ngo" };

function makeQueue(persistence?: PersistenceStore, now?: () => Date): ReviewQueue {
  return new ReviewQueue(persistence ?? new InMemoryPersistence(), new ReviewStateMachine(), now);
}

// ── enqueue ─────────────────────────────────────────────────────────────────

describe("enqueue", () => {
  it("adds an item with a calculated priority", async () => {
    const queue = makeQueue();
    const item = await queue.enqueue(makeEnqueueInput(), criticalInput);

    expect(item.priorityScore).toBe(85);
    expect(item.priority).toBe("critical");
    // SLA derived from the resulting priority (source + critical => 4h)
    expect(item.slaTarget.targetHours).toBe(4);
    expect(item.dueBy).toBeDefined();
    if (item.dueBy) {
      expect(Date.parse(item.dueBy)).not.toBeNaN();
    }

    const all = await queue.query({});
    expect(all).toHaveLength(1);
  });

  it("assigns the new state, a generated id, and timestamps", async () => {
    const queue = makeQueue();
    const item = await queue.enqueue(makeEnqueueInput(), mediumInput);

    expect(item.state).toBe("new");
    expect(item.stateHistory).toEqual([]);
    expect(item.id).toBeTruthy();
    expect(Date.parse(item.createdAt)).not.toBeNaN();
    expect(Date.parse(item.updatedAt)).not.toBeNaN();
  });

  it("derives priority from the item when no priority input is supplied", async () => {
    const queue = makeQueue();
    // legal review type => content risk "legal" (40); evidence => source risk "un" (25) => 65 high
    const item = await queue.enqueue(makeEnqueueInput({ reviewType: "legal" }));

    expect(item.priorityScore).toBe(65);
    expect(item.priority).toBe("high");
  });
});

// ── dequeue ─────────────────────────────────────────────────────────────────

describe("dequeue", () => {
  it("returns the highest priority item first", async () => {
    const queue = makeQueue();
    await queue.enqueue(
      makeEnqueueInput({ sourceContentRef: { type: "source", id: "s1", slug: "s1" } }),
      lowInput, // 20
    );
    const critical = await queue.enqueue(
      makeEnqueueInput({ sourceContentRef: { type: "evidence", id: "e1", slug: "e1" } }),
      criticalInput, // 85
    );

    const next = await queue.dequeue();
    expect(next).not.toBeNull();
    expect(next?.id).toBe(critical.id);
    expect(next?.priorityScore).toBe(85);
  });

  it("respects FIFO within the same priority", async () => {
    let current = new Date("2026-08-02T10:00:00.000Z");
    const queue = makeQueue(undefined, () => current);

    const itemA = await queue.enqueue(
      makeEnqueueInput({
        sourceContentRef: { type: "evidence", id: "item-a", slug: "item-a" },
        assignedReviewer: "reviewer-1",
      }),
      highInput, // 70
    );
    current = new Date(current.getTime() + 1000); // advance the clock 1s
    const itemB = await queue.enqueue(
      makeEnqueueInput({
        sourceContentRef: { type: "evidence", id: "item-b", slug: "item-b" },
        assignedReviewer: "reviewer-1",
      }),
      highInput, // 70
    );

    const first = await queue.dequeue();
    expect(first?.id).toBe(itemA.id); // earlier createdAt wins

    // Move the first item out of the pending pool, as the assignment router would.
    await queue.updateState(itemA.id, "assigned", { actor: "system", reason: "Assigned" });

    const second = await queue.dequeue();
    expect(second?.id).toBe(itemB.id);
  });

  it("returns null for an empty queue", async () => {
    const queue = makeQueue();
    expect(await queue.dequeue()).toBeNull();
  });
});

// ── updateState ─────────────────────────────────────────────────────────────

describe("updateState", () => {
  it("validates a transition through the state machine and records history", async () => {
    const queue = makeQueue();
    const item = await queue.enqueue(makeEnqueueInput({ assignedReviewer: "reviewer-1" }));

    const updated = await queue.updateState(item.id, "assigned", {
      actor: "system",
      reason: "Round-robin assignment",
    });

    expect(updated.state).toBe("assigned");
    expect(updated.stateHistory).toHaveLength(1);
    expect(updated.stateHistory[0]).toMatchObject({
      from: "new",
      to: "assigned",
      actor: "system",
      reason: "Round-robin assignment",
    });
    expect(Date.parse(updated.stateHistory[0].timestamp)).not.toBeNaN();
  });

  it("throws on an invalid transition", async () => {
    const queue = makeQueue();
    const item = await queue.enqueue(makeEnqueueInput());

    // Structurally invalid: new -> published is not in the transition map.
    await expect(queue.updateState(item.id, "published")).rejects.toBeInstanceOf(
      InvalidTransitionError,
    );
    // Guard failure: new -> assigned requires a reviewer on the item.
    await expect(queue.updateState(item.id, "assigned")).rejects.toBeInstanceOf(
      InvalidTransitionError,
    );
  });

  it("throws ItemNotFoundError for an unknown id", async () => {
    const queue = makeQueue();
    await expect(queue.updateState("missing", "assigned")).rejects.toBeInstanceOf(
      ItemNotFoundError,
    );
  });

  it("enforces the checklist guard for in_review -> approved", async () => {
    const queue = makeQueue();
    const item = await queue.enqueue(
      makeEnqueueInput({ assignedReviewer: "reviewer-1", checklists: [{ itemId: "c1", result: "pass" }] }),
    );
    await queue.updateState(item.id, "assigned", { actor: "system" });
    await queue.updateState(item.id, "in_review", { actor: "reviewer-1" });

    // Passing required checklist item allows approval.
    const approved = await queue.updateState(item.id, "approved", { actor: "reviewer-1" });
    expect(approved.state).toBe("approved");

    // A second item with a failing checklist cannot be approved.
    const failing = await queue.enqueue(
      makeEnqueueInput({
        sourceContentRef: { type: "evidence", id: "f", slug: "f" },
        assignedReviewer: "reviewer-2",
        checklists: [{ itemId: "c1", result: "fail" }],
      }),
    );
    await queue.updateState(failing.id, "assigned", { actor: "system" });
    await queue.updateState(failing.id, "in_review", { actor: "reviewer-2" });
    await expect(queue.updateState(failing.id, "approved", { actor: "reviewer-2" })).rejects.toBeInstanceOf(
      InvalidTransitionError,
    );
  });
});

// ── addComment ──────────────────────────────────────────────────────────────

describe("addComment", () => {
  it("appends a versioned comment", async () => {
    const queue = makeQueue();
    const item = await queue.enqueue(makeEnqueueInput(), mediumInput);

    const c1 = await queue.addComment(item.id, "reviewer-1", "Please add citations");
    const c2 = await queue.addComment(item.id, "reviewer-2", "Done");

    expect(c1.version).toBe(1);
    expect(c2.version).toBe(2);
    expect(c1.stateAtComment).toBe("new");
    expect(c2.stateAtComment).toBe("new");
    expect(c1.reviewItemId).toBe(item.id);

    const [loaded] = await queue.query({});
    expect(loaded.comments).toHaveLength(2);
    expect(loaded.comments.map((c) => c.version)).toEqual([1, 2]);
    expect(loaded.comments.map((c) => c.body)).toEqual(["Please add citations", "Done"]);
  });

  it("throws ItemNotFoundError for an unknown id", async () => {
    const queue = makeQueue();
    await expect(queue.addComment("missing", "reviewer-1", "hi")).rejects.toBeInstanceOf(
      ItemNotFoundError,
    );
  });
});

// ── query ───────────────────────────────────────────────────────────────────

describe("query", () => {
  it("filters by state (single and array form)", async () => {
    const queue = makeQueue();
    const itemA = await queue.enqueue(
      makeEnqueueInput({
        sourceContentRef: { type: "evidence", id: "a", slug: "a" },
        assignedReviewer: "reviewer-1",
      }),
    );
    const itemB = await queue.enqueue(
      makeEnqueueInput({ sourceContentRef: { type: "evidence", id: "b", slug: "b" } }),
    );

    await queue.updateState(itemA.id, "assigned", { actor: "system" });

    const pending = await queue.query({ state: "new" });
    const assigned = await queue.query({ state: "assigned" });
    const both = await queue.query({ state: ["new", "assigned"] });

    expect(pending.map((i) => i.id)).toEqual([itemB.id]);
    expect(assigned.map((i) => i.id)).toEqual([itemA.id]);
    expect(both.map((i) => i.id).sort()).toEqual([itemA.id, itemB.id].sort());
  });

  it("filters by priority (single and array form)", async () => {
    const queue = makeQueue();
    await queue.enqueue(
      makeEnqueueInput({ sourceContentRef: { type: "evidence", id: "h", slug: "h" } }),
      highInput, // 70 high
    );
    await queue.enqueue(
      makeEnqueueInput({ sourceContentRef: { type: "evidence", id: "c", slug: "c" } }),
      criticalInput, // 85 critical
    );

    const critical = await queue.query({ priority: "critical" });
    const highOrCritical = await queue.query({ priority: ["high", "critical"] });

    expect(critical).toHaveLength(1);
    expect(critical[0].priorityScore).toBe(85);
    expect(highOrCritical).toHaveLength(2);
  });

  it("filters by assignee", async () => {
    const queue = makeQueue();
    const itemA = await queue.enqueue(
      makeEnqueueInput({
        sourceContentRef: { type: "evidence", id: "a", slug: "a" },
        assignedReviewer: "reviewer-1",
      }),
    );
    await queue.enqueue(
      makeEnqueueInput({
        sourceContentRef: { type: "evidence", id: "b", slug: "b" },
        assignedReviewer: "reviewer-2",
      }),
    );

    const r1 = await queue.query({ assignee: "reviewer-1" });
    expect(r1).toHaveLength(1);
    expect(r1[0].id).toBe(itemA.id);
  });

  it("returns results ordered priority-first then FIFO", async () => {
    const queue = makeQueue();
    const low = await queue.enqueue(
      makeEnqueueInput({ sourceContentRef: { type: "evidence", id: "low", slug: "low" } }),
      lowInput, // 20
    );
    const crit = await queue.enqueue(
      makeEnqueueInput({ sourceContentRef: { type: "evidence", id: "crit", slug: "crit" } }),
      criticalInput, // 85
    );
    const mid = await queue.enqueue(
      makeEnqueueInput({ sourceContentRef: { type: "evidence", id: "mid", slug: "mid" } }),
      mediumInput, // 40
    );

    const items = await queue.query({});
    expect(items.map((i) => i.id)).toEqual([crit.id, mid.id, low.id]);
    expect(items.map((i) => i.priorityScore)).toEqual([85, 40, 20]);
  });
});

// ── paginate ────────────────────────────────────────────────────────────────

describe("paginate", () => {
  it("returns the correct page and total, with no overlap across pages", async () => {
    const queue = makeQueue();
    for (let i = 0; i < 5; i++) {
      await queue.enqueue(
        makeEnqueueInput({ sourceContentRef: { type: "evidence", id: `e${i}`, slug: `e${i}` } }),
        lowInput,
      );
    }

    const page1 = await queue.paginate({}, 1, 2);
    const page2 = await queue.paginate({}, 2, 2);
    const page3 = await queue.paginate({}, 3, 2);

    expect(page1.items).toHaveLength(2);
    expect(page2.items).toHaveLength(2);
    expect(page3.items).toHaveLength(1);
    expect(page1.total).toBe(5);

    const seen = new Set([...page1.items, ...page2.items, ...page3.items].map((i) => i.id));
    expect(seen.size).toBe(5);
  });
});

// ── persistence round-trip ──────────────────────────────────────────────────

describe("persistence", () => {
  it("round-trips through an InMemoryPersistence store", async () => {
    const store = new InMemoryPersistence();
    const queue = makeQueue(store);
    const item = await queue.enqueue(makeEnqueueInput(), criticalInput);

    // A second queue over the same store observes the same data.
    const queue2 = new ReviewQueue(store, new ReviewStateMachine());
    expect(await queue2.query({})).toEqual([item]);

    // The store itself round-trips raw items.
    expect(await store.load()).toEqual([item]);
    expect(await store.getById(item.id)).toEqual(item);
    expect(await store.getById("nope")).toBeNull();
  });

  it("round-trips through LocalStoragePersistence in a browser-like environment", async () => {
    const store = new LocalStoragePersistence("test-queue");
    const queue = makeQueue(store);
    const item = await queue.enqueue(makeEnqueueInput(), highInput);

    expect(await store.load()).toEqual([item]);
    expect(await store.getById(item.id)).toEqual(item);
  });
});

// ── reprioritize & stats ────────────────────────────────────────────────────

describe("reprioritize", () => {
  it("recalculates priorities and anchors due dates to creation time", async () => {
    let current = new Date("2026-08-02T10:00:00.000Z");
    const queue = makeQueue(undefined, () => current);

    // legal review type -> inferred content risk "legal" (40); evidence -> "un" (25) => 65 high
    const item = await queue.enqueue(makeEnqueueInput({ reviewType: "legal" }));
    expect(item.priorityScore).toBe(65);

    current = new Date("2026-08-05T10:00:00.000Z");
    await queue.reprioritize();

    const [recomputed] = await queue.query({});
    expect(recomputed.priorityScore).toBe(65);
    expect(recomputed.priority).toBe("high");
    expect(recomputed.updatedAt).toBe("2026-08-05T10:00:00.000Z");

    // legal + high SLA target = 8h * 1.5 = 12h, anchored to creation (not reprioritize time).
    expect(recomputed.dueBy).toBeDefined();
    const createdAtMs = new Date(recomputed.createdAt).getTime();
    if (recomputed.dueBy) {
      expect(new Date(recomputed.dueBy).getTime()).toBe(createdAtMs + 12 * 60 * 60 * 1000);
    }
  });
});

describe("stats", () => {
  it("returns queue statistics", async () => {
    const queue = makeQueue();
    const a = await queue.enqueue(makeEnqueueInput({ assignedReviewer: "reviewer-1" }), highInput);
    await queue.enqueue(makeEnqueueInput(), criticalInput);
    await queue.updateState(a.id, "assigned", { actor: "system" });

    const stats = await queue.stats();

    expect(stats.total).toBe(2);
    expect(stats.pending).toBe(1); // one item still in "new"
    expect(stats.byState.new).toBe(1);
    expect(stats.byState.assigned).toBe(1);
    expect(stats.byState.approved).toBe(0);
    expect(stats.byPriority.high).toBe(1);
    expect(stats.byPriority.critical).toBe(1);
    expect(stats.overdue).toBe(0); // created at the reference clock, nothing elapsed
  });
});
