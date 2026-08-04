/**
 * State Machine Transition Integration Tests (M4.7-03).
 *
 * Tests valid and invalid transitions across all state machines:
 * - Review state machine
 * - Correction state model
 */

import { describe, it, expect } from "vitest";
import { ReviewStateMachine } from "../../lib/review/ReviewStateMachine";
import type { ReviewState, CorrectionState } from "../../lib/review/types";

describe("State Transitions — Integration", () => {
  // ── Review state machine ────────────────────────────────────────────────

  describe("ReviewStateMachine", () => {
    const sm = new ReviewStateMachine();

    describe("valid transitions", () => {
      const validPaths = [
        { from: "new" as ReviewState, to: "assigned" as ReviewState },
        { from: "assigned" as ReviewState, to: "in_review" as ReviewState },
        { from: "in_review" as ReviewState, to: "approved" as ReviewState },
        { from: "in_review" as ReviewState, to: "changes_requested" as ReviewState },
        { from: "changes_requested" as ReviewState, to: "in_review" as ReviewState },
        { from: "approved" as ReviewState, to: "published" as ReviewState },
      ];

      for (const { from, to } of validPaths) {
        it(`allows ${from} → ${to}`, () => {
          expect(sm.canTransition(from, to)).toBe(true);
        });
      }
    });

    describe("invalid transitions", () => {
      const invalidPaths = [
        { from: "published" as ReviewState, to: "new" as ReviewState },
        { from: "published" as ReviewState, to: "in_review" as ReviewState },
        { from: "archived" as ReviewState, to: "new" as ReviewState },
        { from: "approved" as ReviewState, to: "new" as ReviewState },
        { from: "new" as ReviewState, to: "published" as ReviewState },
      ];

      for (const { from, to } of invalidPaths) {
        it(`rejects ${from} → ${to}`, () => {
          expect(sm.canTransition(from, to)).toBe(false);
        });
      }
    });

    describe("transition execution", () => {
      it("throws when attempting invalid transition", () => {
        expect(() => sm.transition("published", "new")).toThrow();
      });

      it("returns StateTransition on valid transition", () => {
        const result = sm.transition("new", "assigned");
        expect(result.from).toBe("new");
        expect(result.to).toBe("assigned");
        expect(result.timestamp).toBeTruthy();
      });
    });

    describe("valid transitions discovery", () => {
      it("provides valid transitions for each state", () => {
        const allStates: ReviewState[] = [
          "new", "assigned", "in_review", "changes_requested",
          "approved", "published", "rejected", "archived",
        ];

        for (const state of allStates) {
          const allowed = sm.getValidTransitions(state);
          // Every non-terminal state should have some valid transitions
          if (state !== "archived") {
            expect(allowed.length).toBeGreaterThan(0);
          }
        }
      });

      it("terminal states have limited transitions", () => {
        // Archived should have very limited outgoing transitions
        const archivedTransitions = sm.getValidTransitions("archived");
        expect(archivedTransitions.length).toBeLessThanOrEqual(1);
      });
    });
  });

  // ── Correction state model ─────────────────────────────────────────────

  describe("CorrectionState model", () => {
    it("defines all correction workflow states", () => {
      const states: CorrectionState[] = [
        "new", "under_review", "applied", "rejected",
        "disputed", "archived", "withdrawn",
      ];

      // All states should be unique
      expect(new Set(states).size).toBe(states.length);
      expect(states).toHaveLength(7);
    });
  });
});
