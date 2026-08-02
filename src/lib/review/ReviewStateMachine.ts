// src/lib/review/ReviewStateMachine.ts

import type {
  ReviewState,
  StateTransition,
  ReviewItem,
} from "./types";

// ── Valid Transitions Map ───────────────────────────────────────────────────

/**
 * Valid transitions: from -> Set<to>.
 *
 * Mirrors the M4.3-01 spec exactly. "Archived" is a terminal state — no
 * transitions leave it. "Rejected" may only move to "archived".
 */
export const VALID_TRANSITIONS: Record<ReviewState, Set<ReviewState>> = {
  new: new Set<ReviewState>(["assigned", "rejected"]),
  assigned: new Set<ReviewState>(["in_review", "rejected"]),
  in_review: new Set<ReviewState>(["changes_requested", "approved", "rejected"]),
  changes_requested: new Set<ReviewState>(["in_review", "rejected"]),
  approved: new Set<ReviewState>(["published", "rejected"]),
  published: new Set<ReviewState>(["archived", "rejected"]),
  rejected: new Set<ReviewState>(["archived"]),
  archived: new Set<ReviewState>([]),
};

// ── Error ───────────────────────────────────────────────────────────────────

/**
 * Thrown when a requested state transition is not allowed — either because the
 * `from -> to` pair is absent from the valid-transitions map, or because a
 * guard condition (reviewer, checklist, comment, approval) is unsatisfied.
 */
export class InvalidTransitionError extends Error {
  public readonly from: ReviewState;
  public readonly to: ReviewState;

  constructor(from: ReviewState, to: ReviewState, message?: string) {
    super(message ?? `Invalid transition from '${from}' to '${to}'.`);
    this.name = "InvalidTransitionError";
    this.from = from;
    this.to = to;
  }
}

// ── Options ─────────────────────────────────────────────────────────────────

export interface TransitionOptions {
  /** Reviewer ID or "system" performing the transition. */
  actor?: string;
  /** Human-readable reason for the transition. */
  reason?: string;
  /**
   * The review item being transitioned. Required to evaluate guard conditions.
   * When omitted, the state machine performs a structural check only and
   * guard conditions are treated as satisfied.
   */
  item?: ReviewItem;
  /**
   * IDs of required checklist items for the `in_review -> approved` guard.
   * When omitted, every checklist result present on the item is treated as
   * required.
   */
  requiredChecklistItemIds?: string[];
}

type TransitionHook = (transition: StateTransition) => void;

// ── State Machine ───────────────────────────────────────────────────────────

/**
 * Review state machine (M4.3-01).
 *
 * Enforces valid transitions between {@link ReviewState} values and guard
 * conditions for the critical transitions:
 *
 * - `new -> assigned`          requires a reviewer to be assigned
 * - `in_review -> approved`    requires all required checklist items to pass
 * - `changes_requested -> in_review` requires a change request comment
 * - `approved -> published`    requires at least one prior approval
 *
 * The machine is a pure validator/emitter — it does not mutate the item. It
 * returns the {@link StateTransition} it would record and emits transition
 * hooks so callers (ReviewQueue, review pages) can persist side effects.
 */
export class ReviewStateMachine {
  private hooks = new Set<TransitionHook>();

  /**
   * Whether `from -> to` is a structurally valid transition whose guard
   * conditions are satisfied (when an item is supplied).
   */
  canTransition(from: ReviewState, to: ReviewState, opts?: TransitionOptions): boolean {
    if (!VALID_TRANSITIONS[from].has(to)) return false;
    return this.guardViolation(from, to, opts) === null;
  }

  /**
   * Validate and emit a transition. Throws {@link InvalidTransitionError}
   * when the transition is structurally invalid or a guard condition fails.
   */
  transition(from: ReviewState, to: ReviewState, opts?: TransitionOptions): StateTransition {
    if (!VALID_TRANSITIONS[from].has(to)) {
      throw new InvalidTransitionError(
        from,
        to,
        `Invalid transition from '${from}' to '${to}' — no such transition is allowed.`,
      );
    }

    const violation = this.guardViolation(from, to, opts);
    if (violation !== null) {
      throw new InvalidTransitionError(from, to, violation);
    }

    const transition: StateTransition = {
      from,
      to,
      timestamp: new Date().toISOString(),
      actor: opts?.actor,
      reason: opts?.reason,
    };

    for (const hook of this.hooks) {
      hook(transition);
    }

    return transition;
  }

  /** All states reachable from `from` via a valid (structural) transition. */
  getValidTransitions(from: ReviewState): ReviewState[] {
    return Array.from(VALID_TRANSITIONS[from]);
  }

  /**
   * Register a hook invoked with each emitted transition. Returns an
   * unsubscribe function. Hook errors propagate to the `transition` caller.
   */
  onTransition(hook: TransitionHook): () => void {
    this.hooks.add(hook);
    return () => {
      this.hooks.delete(hook);
    };
  }

  /** The ordered transition history for an item. */
  getStateTimeline(item: ReviewItem): StateTransition[] {
    return [...item.stateHistory];
  }

  /**
   * Returns a human-readable guard violation message for `from -> to`, or
   * `null` when no guard applies or all guards pass.
   */
  private guardViolation(from: ReviewState, to: ReviewState, opts?: TransitionOptions): string | null {
    if (!opts?.item) return null; // structural-only call — no item to evaluate

    const item = opts.item;

    switch (`${from}->${to}`) {
      case "new->assigned":
        if (!item.assignedReviewer) {
          return "Cannot transition 'new' -> 'assigned': a reviewer must be assigned before the item leaves the queue.";
        }
        return null;

      case "in_review->approved": {
        const requiredItemIds =
          opts?.requiredChecklistItemIds && opts.requiredChecklistItemIds.length > 0
            ? opts.requiredChecklistItemIds
            : item.checklists.map((c) => c.itemId);

        if (requiredItemIds.length === 0) {
          return "Cannot transition 'in_review' -> 'approved': no required checklist items are recorded on the item.";
        }

        const resultsByItem = new Map(item.checklists.map((c) => [c.itemId, c.result]));
        const notPassed = requiredItemIds.filter((id) => resultsByItem.get(id) !== "pass");

        if (notPassed.length > 0) {
          return `Cannot transition 'in_review' -> 'approved': required checklist items not passed — ${notPassed.join(", ")}.`;
        }
        return null;
      }

      case "changes_requested->in_review":
        if (!item.comments.some((c) => c.stateAtComment === "changes_requested")) {
          return "Cannot transition 'changes_requested' -> 'in_review': at least one change request comment is required.";
        }
        return null;

      case "approved->published":
        if (!item.stateHistory.some((t) => t.to === "approved")) {
          return "Cannot transition 'approved' -> 'published': at least one prior approval is required.";
        }
        return null;

      default:
        return null;
    }
  }
}
