import { useState } from "react";
import type { ReviewState } from "../../lib/review/types";

interface ReviewActionsProps {
  currentState: ReviewState;
  validTransitions: ReviewState[];
  onAction: (toState: ReviewState, note?: string) => void;
  isLoading?: boolean;
}

interface TransitionMeta {
  label: string;
  className: string;
  /** Irreversible action — require an explicit confirmation step. */
  confirm?: string;
  /** A note is mandatory before the action can be confirmed. */
  noteRequired?: boolean;
  /** A note is optional — show the textarea but do not gate on it. */
  noteOptional?: boolean;
}

const TRANSITION_META: Partial<Record<ReviewState, TransitionMeta>> = {
  assigned: { label: "Assign", className: "secondary" },
  in_review: { label: "Start review", className: "secondary" },
  changes_requested: {
    label: "Request changes",
    className: "warning",
    noteRequired: true,
  },
  approved: { label: "Approve", className: "primary", noteOptional: true },
  published: {
    label: "Publish",
    className: "primary",
    confirm:
      "Publishing makes this content publicly visible and cannot be undone. Continue?",
  },
  rejected: {
    label: "Reject",
    className: "danger",
    confirm:
      "Rejecting ends this review and cannot be undone. Continue?",
  },
  archived: { label: "Archive", className: "secondary" },
};

const BUTTON_CLASSES: Record<string, string> = {
  primary:
    "bg-ink text-bone hover:bg-charcoal border border-ink focus-visible:ring-trust/50",
  secondary:
    "bg-paper text-ink border border-ink/30 hover:bg-ink/5 focus-visible:ring-trust/50",
  warning:
    "bg-amber/10 text-[#8B6914] border border-amber/30 hover:bg-amber/20 focus-visible:ring-amber/50",
  danger:
    "bg-clay/10 text-clay border border-clay/30 hover:bg-clay/20 focus-visible:ring-clay/50",
};

const BASE_BUTTON_CLASSES =
  "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

/**
 * Renders action buttons for every valid transition from the current review
 * state. Irreversible transitions (published, rejected) require a
 * confirmation step; "changes_requested" requires a note before confirming.
 */
export function ReviewActions({
  currentState,
  validTransitions,
  onAction,
  isLoading = false,
}: ReviewActionsProps) {
  const [pendingState, setPendingState] = useState<ReviewState | null>(null);
  const [note, setNote] = useState("");

  const pendingMeta = pendingState ? TRANSITION_META[pendingState] : undefined;
  const showNote =
    pendingMeta?.noteRequired === true || pendingMeta?.noteOptional === true;
  const noteMissing = pendingMeta?.noteRequired === true && note.trim() === "";

  const handleButtonClick = (toState: ReviewState) => {
    const targetMeta = TRANSITION_META[toState];
    if (targetMeta?.confirm || targetMeta?.noteRequired || targetMeta?.noteOptional) {
      setNote("");
      setPendingState(toState);
    } else {
      onAction(toState, undefined);
    }
  };

  const handleConfirm = () => {
    if (!pendingState) return;
    if (noteMissing) return;
    onAction(pendingState, note.trim() ? note : undefined);
    setPendingState(null);
    setNote("");
  };

  const handleCancel = () => {
    setPendingState(null);
    setNote("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-ink">
          Review actions
        </h3>
        <span className="font-mono text-xs text-charcoal/60">
          State: <span className="text-charcoal">{currentState}</span>
        </span>
      </div>

      <div role="group" aria-label="Review actions" className="flex flex-wrap gap-2">
        {validTransitions.map((toState) => {
          const targetMeta =
            TRANSITION_META[toState] ?? { label: toState, className: "secondary" };
          return (
            <button
              key={toState}
              type="button"
              disabled={isLoading}
              onClick={() => handleButtonClick(toState)}
              className={`${BASE_BUTTON_CLASSES} ${BUTTON_CLASSES[targetMeta.className]}`}
            >
              {targetMeta.label}
            </button>
          );
        })}
      </div>

      {pendingState && pendingMeta && (
        <div
          role="dialog"
          aria-label={`Confirm ${pendingMeta.label}`}
          className="border border-border/70 rounded-lg p-4 bg-paper space-y-3"
        >
          <p className="text-sm text-charcoal/80">
            {pendingMeta.confirm ??
              `Continue with “${pendingMeta.label}”?`}
          </p>

          {showNote && (
            <div>
              <label
                htmlFor="review-action-note"
                className="block text-xs font-medium text-charcoal/70 mb-1"
              >
                Note{" "}
                {pendingMeta.noteRequired ? "(required)" : "(optional)"}
              </label>
              <textarea
                id="review-action-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={2}
                placeholder="Add context for this action…"
                className="w-full text-sm bg-bone border border-border/70 rounded-md px-3 py-2 text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-trust/50 resize-y"
              />
              {pendingMeta.noteRequired && note.trim() === "" && (
                <p className="text-xs text-clay mt-1">
                  A note is required for this action.
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={noteMissing || isLoading}
              className={`${BASE_BUTTON_CLASSES} ${BUTTON_CLASSES[pendingMeta.className]}`}
            >
              Confirm {pendingMeta.label}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className={`${BASE_BUTTON_CLASSES} ${BUTTON_CLASSES.secondary}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
