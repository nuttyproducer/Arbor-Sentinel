// src/lib/review/__tests__/ReviewStateMachine.test.ts

import { describe, it, expect, vi } from "vitest";
import {
  ReviewStateMachine,
  InvalidTransitionError,
  VALID_TRANSITIONS,
} from "../ReviewStateMachine";
import type {
  ReviewState,
  StateTransition,
  ReviewItem,
  ReviewComment,
} from "../types";

// ── Fixtures ────────────────────────────────────────────────────────────────

const slaTarget = {
  targetHours: 24,
  warningThreshold: 0.75,
  overdueThreshold: 1.5,
  escalationPath: [
    { afterHoursOverdue: 12, action: "notify_admin" as const },
    { afterHoursOverdue: 24, action: "reassign" as const },
  ],
};

function makeItem(overrides: Partial<ReviewItem> = {}): ReviewItem {
  return {
    id: "review-1",
    sourceContentRef: { type: "evidence", id: "evidence-1", slug: "evidence-1" },
    reviewType: "source",
    priority: "high",
    priorityScore: 80,
    state: "new",
    assignedReviewer: undefined,
    comments: [],
    checklists: [],
    slaTarget,
    stateHistory: [],
    createdAt: "2026-08-02",
    updatedAt: "2026-08-02",
    ...overrides,
  };
}

function makeComment(overrides: Partial<ReviewComment> = {}): ReviewComment {
  return {
    id: "comment-1",
    reviewItemId: "review-1",
    authorId: "reviewer-1",
    body: "Please revise the summary and re-cite the ruling.",
    stateAtComment: "changes_requested",
    version: 1,
    createdAt: "2026-08-02",
    ...overrides,
  };
}

const machine = () => new ReviewStateMachine();

// ── Tests ───────────────────────────────────────────────────────────────────

describe("canTransition", () => {
  it("returns true for valid transitions", () => {
    const sm = machine();
    const validPairs: Array<[ReviewState, ReviewState]> = [
      ["new", "assigned"],
      ["new", "rejected"],
      ["assigned", "in_review"],
      ["assigned", "rejected"],
      ["in_review", "changes_requested"],
      ["in_review", "approved"],
      ["in_review", "rejected"],
      ["changes_requested", "in_review"],
      ["changes_requested", "rejected"],
      ["approved", "published"],
      ["approved", "rejected"],
      ["published", "archived"],
      ["published", "rejected"],
      ["rejected", "archived"],
    ];
    for (const [from, to] of validPairs) {
      expect(sm.canTransition(from, to)).toBe(true);
    }
  });

  it("returns false for invalid transitions", () => {
    const sm = machine();
    const invalidPairs: Array<[ReviewState, ReviewState]> = [
      ["new", "in_review"],
      ["new", "approved"],
      ["new", "published"],
      ["new", "archived"],
      ["new", "new"],
      ["assigned", "assigned"],
      ["assigned", "published"],
      ["in_review", "new"],
      ["changes_requested", "approved"],
      ["approved", "in_review"],
      ["approved", "approved"],
      ["published", "new"],
      ["rejected", "new"],
      ["rejected", "published"],
      ["archived", "rejected"],
      ["archived", "archived"],
    ];
    for (const [from, to] of invalidPairs) {
      expect(sm.canTransition(from, to)).toBe(false);
    }
  });

  it("returns false when a guard condition fails and an item is supplied", () => {
    const sm = machine();
    // new -> assigned requires a reviewer.
    expect(sm.canTransition("new", "assigned", { item: makeItem() })).toBe(false);
    expect(
      sm.canTransition("new", "assigned", { item: makeItem({ assignedReviewer: "reviewer-1" }) }),
    ).toBe(true);
  });
});

describe("transition", () => {
  it("returns a StateTransition for valid moves", () => {
    const sm = machine();
    const result = sm.transition("new", "assigned", {
      actor: "system",
      reason: "Round-robin assignment",
    });

    expect(result.from).toBe("new");
    expect(result.to).toBe("assigned");
    expect(result.actor).toBe("system");
    expect(result.reason).toBe("Round-robin assignment");
    expect(typeof result.timestamp).toBe("string");
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
  });

  it("throws InvalidTransitionError for invalid moves", () => {
    const sm = machine();
    try {
      sm.transition("new", "published");
      expect.unreachable("transition should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidTransitionError);
      expect((error as InvalidTransitionError).from).toBe("new");
      expect((error as InvalidTransitionError).to).toBe("published");
    }
  });

  it("throws an error whose message names the invalid pair", () => {
    const sm = machine();
    expect(() => sm.transition("archived", "assigned")).toThrow(
      /archived.*assigned/,
    );
  });

  it("throws an error whose name is InvalidTransitionError", () => {
    const sm = machine();
    try {
      sm.transition("new", "published");
      expect.unreachable("transition should have thrown");
    } catch (error) {
      expect((error as Error).name).toBe("InvalidTransitionError");
    }
  });
});

describe("guard conditions", () => {
  it("new -> assigned requires a reviewer to be assigned", () => {
    const sm = machine();
    expect(() =>
      sm.transition("new", "assigned", { item: makeItem() }),
    ).toThrow(InvalidTransitionError);
    expect(() =>
      sm.transition("new", "assigned", { item: makeItem() }),
    ).toThrow(/reviewer must be assigned/);

    const transition = sm.transition("new", "assigned", {
      item: makeItem({ assignedReviewer: "reviewer-1" }),
      actor: "system",
    });
    expect(transition.to).toBe("assigned");
  });

  it("in_review -> approved requires all required checklists to pass", () => {
    const sm = machine();

    // A failed required item blocks approval.
    const withFailure = makeItem({
      state: "in_review",
      checklists: [
        { itemId: "c1", result: "pass", note: "Sources verified." },
        { itemId: "c2", result: "fail", note: "Unverified claim." },
      ],
    });
    expect(() =>
      sm.transition("in_review", "approved", {
        item: withFailure,
        requiredChecklistItemIds: ["c1", "c2"],
      }),
    ).toThrow(/required checklist items not passed/);

    // A missing required item (not present at all) also blocks approval.
    expect(() =>
      sm.transition("in_review", "approved", {
        item: withFailure,
        requiredChecklistItemIds: ["c1", "c3"],
      }),
    ).toThrow(InvalidTransitionError);

    // All required items passing allows the transition.
    const allPass = makeItem({
      state: "in_review",
      checklists: [
        { itemId: "c1", result: "pass" },
        { itemId: "c2", result: "pass" },
      ],
    });
    const transition = sm.transition("in_review", "approved", {
      item: allPass,
      requiredChecklistItemIds: ["c1", "c2"],
    });
    expect(transition.to).toBe("approved");
  });

  it("in_review -> approved defaults to treating every recorded result as required", () => {
    const sm = machine();
    const onlyOneFailed = makeItem({
      state: "in_review",
      checklists: [{ itemId: "c1", result: "fail" }],
    });
    expect(() =>
      sm.transition("in_review", "approved", { item: onlyOneFailed }),
    ).toThrow(InvalidTransitionError);

    const allPass = makeItem({
      state: "in_review",
      checklists: [{ itemId: "c1", result: "pass" }],
    });
    expect(() =>
      sm.transition("in_review", "approved", { item: allPass }),
    ).not.toThrow();
  });

  it("changes_requested -> in_review requires a change request comment", () => {
    const sm = machine();
    const noComment = makeItem({ state: "changes_requested", comments: [] });
    expect(() =>
      sm.transition("changes_requested", "in_review", { item: noComment }),
    ).toThrow(/change request comment/);

    const withComment = makeItem({
      state: "changes_requested",
      comments: [makeComment()],
    });
    const transition = sm.transition("changes_requested", "in_review", {
      item: withComment,
      actor: "reviewer-1",
    });
    expect(transition.to).toBe("in_review");
  });

  it("approved -> published requires at least one prior approval", () => {
    const sm = machine();
    const neverApproved = makeItem({ state: "approved", stateHistory: [] });
    expect(() =>
      sm.transition("approved", "published", { item: neverApproved }),
    ).toThrow(/at least one prior approval/);

    const previouslyApproved = makeItem({
      state: "approved",
      stateHistory: [
        { from: "in_review", to: "approved", timestamp: "2026-08-02", actor: "reviewer-1" },
      ],
    });
    const transition = sm.transition("approved", "published", {
      item: previouslyApproved,
      actor: "system",
    });
    expect(transition.to).toBe("published");
  });

  it("guard conditions are not enforced when no item is supplied", () => {
    const sm = machine();
    // Structural validation still applies — but guards pass by default.
    expect(sm.transition("new", "assigned").to).toBe("assigned");
    expect(sm.transition("in_review", "approved").to).toBe("approved");
    expect(sm.transition("changes_requested", "in_review").to).toBe("in_review");
    expect(sm.transition("approved", "published").to).toBe("published");
  });
});

describe("getValidTransitions", () => {
  it("returns the correct set for each state", () => {
    const sm = machine();
    const expectations: Record<ReviewState, ReviewState[]> = {
      new: ["assigned", "rejected"],
      assigned: ["in_review", "rejected"],
      in_review: ["changes_requested", "approved", "rejected"],
      changes_requested: ["in_review", "rejected"],
      approved: ["published", "rejected"],
      published: ["archived", "rejected"],
      rejected: ["archived"],
      archived: [],
    };

    const states: ReviewState[] = [
      "new", "assigned", "in_review", "changes_requested",
      "approved", "published", "rejected", "archived",
    ];
    for (const state of states) {
      expect(sm.getValidTransitions(state).sort()).toEqual([...expectations[state]].sort());
    }
  });

  it("mirrors the exported VALID_TRANSITIONS map", () => {
    const sm = machine();
    for (const from of Object.keys(VALID_TRANSITIONS) as ReviewState[]) {
      expect(new Set(sm.getValidTransitions(from))).toEqual(VALID_TRANSITIONS[from]);
    }
  });
});

describe("onTransition hooks", () => {
  it("fires hooks on each successful transition", () => {
    const sm = machine();
    const hook = vi.fn();
    sm.onTransition(hook);

    sm.transition("new", "assigned", { actor: "system" });
    sm.transition("assigned", "in_review", { actor: "reviewer-1" });

    expect(hook).toHaveBeenCalledTimes(2);
    const [first, second] = hook.mock.calls.map((c) => c[0] as StateTransition);
    expect(first).toMatchObject({ from: "new", to: "assigned" });
    expect(second).toMatchObject({ from: "assigned", to: "in_review" });
  });

  it("does not fire hooks for rejected transitions", () => {
    const sm = machine();
    const hook = vi.fn();
    sm.onTransition(hook);

    expect(() => sm.transition("new", "published")).toThrow(InvalidTransitionError);
    expect(hook).not.toHaveBeenCalled();
  });

  it("supports hook unsubscription", () => {
    const sm = machine();
    const hook = vi.fn();
    const unsubscribe = sm.onTransition(hook);

    sm.transition("new", "assigned");
    expect(hook).toHaveBeenCalledTimes(1);

    unsubscribe();
    sm.transition("assigned", "in_review");
    expect(hook).toHaveBeenCalledTimes(1); // unchanged after unsubscribe
  });

  it("supports multiple simultaneous hooks", () => {
    const sm = machine();
    const a = vi.fn();
    const b = vi.fn();
    sm.onTransition(a);
    sm.onTransition(b);

    sm.transition("new", "assigned");
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it("unsubscribe is idempotent", () => {
    const sm = machine();
    const hook = vi.fn();
    const unsubscribe = sm.onTransition(hook);
    unsubscribe();
    unsubscribe();
    sm.transition("new", "assigned");
    expect(hook).not.toHaveBeenCalled();
  });
});

describe("getStateTimeline", () => {
  it("returns the item's transition history", () => {
    const sm = machine();
    const history: StateTransition[] = [
      { from: "new", to: "assigned", timestamp: "2026-08-02T10:00:00.000Z", actor: "system" },
      { from: "assigned", to: "in_review", timestamp: "2026-08-02T11:00:00.000Z", actor: "reviewer-1" },
    ];
    const item = makeItem({ stateHistory: history });

    expect(sm.getStateTimeline(item)).toEqual(history);
  });

  it("returns a copy, not the item's internal array", () => {
    const sm = machine();
    const item = makeItem({ stateHistory: [] });
    const timeline = sm.getStateTimeline(item);
    expect(timeline).not.toBe(item.stateHistory);
  });
});

describe("InvalidTransitionError", () => {
  it("exposes from/to and a stable name", () => {
    const error = new InvalidTransitionError("new", "published");
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("InvalidTransitionError");
    expect(error.from).toBe("new");
    expect(error.to).toBe("published");
    expect(error.message).toMatch(/new/);
    expect(error.message).toMatch(/published/);
  });

  it("uses a custom message when provided", () => {
    const error = new InvalidTransitionError("new", "published", "nope");
    expect(error.message).toBe("nope");
  });
});
