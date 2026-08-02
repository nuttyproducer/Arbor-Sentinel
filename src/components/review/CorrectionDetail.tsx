// src/components/review/CorrectionDetail.tsx

import { useState } from "react";
import type {
  CorrectionResolution,
  CorrectionSubmission,
} from "../../lib/review/types";
import { Badge } from "../ui/Badge";
import {
  BASE_BUTTON_CLASSES,
  BUTTON_CLASSES,
  RESOLUTION_META,
  STATE_LABELS,
  STATE_VARIANTS,
  URGENCY_LABELS,
  URGENCY_VARIANTS,
  formatDateTime,
  getCategoryDef,
  isPendingCorrection,
} from "./correctionMeta";

const CONTENT_ACTIONS: CorrectionResolution[] = ["update", "downgrade", "remove"];
const TERMINAL_ACTIONS: CorrectionResolution[] = ["dispute", "archive", "withdraw", "reject"];

interface CorrectionDetailProps {
  correction: CorrectionSubmission;
  /** Fire a review resolution (e.g. update / downgrade / reject). */
  onReview: (resolution: CorrectionResolution, note: string) => void;
  /** Escalate the correction to the reviewer queue. */
  onEscalate: () => void;
  /** Open the apply confirmation dialog (content resolutions only). */
  onApply?: () => void;
  isLoading?: boolean;
}

function ResolutionButton({
  resolution,
  disabled,
  onClick,
}: {
  resolution: CorrectionResolution;
  disabled?: boolean;
  onClick: (resolution: CorrectionResolution) => void;
}) {
  const meta = RESOLUTION_META[resolution];
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(resolution)}
      className={`${BASE_BUTTON_CLASSES} ${BUTTON_CLASSES[meta.variant]}`}
    >
      {meta.label}
    </button>
  );
}

/**
 * Full detail view for a correction submission: category badge, urgency
 * indicator, target page link, reported description, optional source URL, and
 * the resolution action buttons. Content resolutions (update / downgrade /
 * remove) keep the correction pending and surface an "Apply correction"
 * button once reviewed.
 */
export function CorrectionDetail({
  correction,
  onReview,
  onEscalate,
  onApply,
  isLoading = false,
}: CorrectionDetailProps) {
  const [pendingResolution, setPendingResolution] = useState<CorrectionResolution | null>(null);
  const [note, setNote] = useState("");

  const def = getCategoryDef(correction.category);
  const pendingMeta = pendingResolution ? RESOLUTION_META[pendingResolution] : undefined;
  const noteMissing = pendingMeta?.noteRequired === true && note.trim() === "";
  const canApply =
    correction.state === "under_review" &&
    correction.resolution !== undefined &&
    CONTENT_ACTIONS.includes(correction.resolution);

  const handleActionClick = (resolution: CorrectionResolution) => {
    const meta = RESOLUTION_META[resolution];
    if (meta.noteRequired || meta.confirm) {
      setNote("");
      setPendingResolution(resolution);
    } else {
      onReview(resolution, "");
    }
  };

  const handleConfirm = () => {
    if (!pendingResolution || noteMissing) return;
    onReview(pendingResolution, note.trim() ? note : "");
    setPendingResolution(null);
    setNote("");
  };

  const handleCancel = () => {
    setPendingResolution(null);
    setNote("");
  };

  return (
    <div className="space-y-6" data-testid="correction-detail">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-wide text-charcoal/50">
              Correction review
            </p>
            <h2 className="font-serif text-xl font-semibold text-ink leading-tight">
              {correction.targetPage}
            </h2>
          </div>
          <Badge variant={STATE_VARIANTS[correction.state]}>
            {STATE_LABELS[correction.state]}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{def.label}</Badge>
          <Badge variant={URGENCY_VARIANTS[def.urgency]}>
            {URGENCY_LABELS[def.urgency]} priority
          </Badge>
          {correction.isMajor && <Badge variant="warning">Major</Badge>}
        </div>
      </header>

      <section className="space-y-2">
        <h3 className="text-xs font-mono uppercase tracking-wide text-charcoal/50">
          Reported issue
        </h3>
        <p className="text-sm text-charcoal/80 bg-paper border border-border/60 rounded-lg px-4 py-3 whitespace-pre-wrap">
          {correction.description}
        </p>
        {correction.targetSection && (
          <p className="text-sm text-charcoal/70">
            <span className="text-charcoal/50">Section: </span>
            {correction.targetSection}
          </p>
        )}
        {correction.sourceUrl && (
          <p className="text-sm break-all">
            <span className="text-charcoal/50">Source: </span>
            <a
              href={correction.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-trust hover:text-trust/80 underline underline-offset-2"
            >
              {correction.sourceUrl}
            </a>
          </p>
        )}
        <p className="text-xs">
          <a
            href={correction.targetPage}
            className="text-trust hover:text-trust/80 underline underline-offset-2"
          >
            Open target page
          </a>
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-xs font-mono uppercase tracking-wide text-charcoal/50">
          Review details
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="inline text-charcoal/50">Submitted: </dt>
            <dd className="inline text-charcoal/80">{formatDateTime(correction.createdAt)}</dd>
          </div>
          <div>
            <dt className="inline text-charcoal/50">Updated: </dt>
            <dd className="inline text-charcoal/80">{formatDateTime(correction.updatedAt)}</dd>
          </div>
          {correction.resolvedAt && (
            <div>
              <dt className="inline text-charcoal/50">Resolved: </dt>
              <dd className="inline text-charcoal/80">{formatDateTime(correction.resolvedAt)}</dd>
            </div>
          )}
          <div>
            <dt className="inline text-charcoal/50">Version: </dt>
            <dd className="inline text-charcoal/80">{correction.version ?? 1}</dd>
          </div>
          {correction.assignedReviewer && (
            <div>
              <dt className="inline text-charcoal/50">Reviewer: </dt>
              <dd className="inline text-charcoal/80 font-mono">{correction.assignedReviewer}</dd>
            </div>
          )}
          {correction.resolution && (
            <div>
              <dt className="inline text-charcoal/50">Resolution: </dt>
              <dd className="inline text-charcoal/80">
                {RESOLUTION_META[correction.resolution].label}
              </dd>
            </div>
          )}
        </dl>

        {correction.resolutionNote && (
          <div className="bg-paper border border-border/60 rounded-lg px-4 py-3">
            <p className="text-xs font-mono uppercase tracking-wide text-charcoal/50 mb-1">
              Resolution note
            </p>
            <p className="text-sm text-charcoal/80 whitespace-pre-wrap">
              {correction.resolutionNote}
            </p>
          </div>
        )}
        {correction.publicLogEntry && (
          <div className="bg-amber/10 border border-amber/30 rounded-lg px-4 py-3">
            <p className="text-xs font-mono uppercase tracking-wide text-[#8B6914] mb-1">
              Public log entry
            </p>
            <p className="text-sm text-charcoal/80">{correction.publicLogEntry}</p>
          </div>
        )}
      </section>

      <section className="space-y-3 border-t border-border/60 pt-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-serif text-lg font-semibold text-ink">Resolution</h3>
          <button
            type="button"
            onClick={onEscalate}
            disabled={isLoading}
            className={`${BASE_BUTTON_CLASSES} ${BUTTON_CLASSES.secondary}`}
          >
            Escalate
          </button>
        </div>

        {!isPendingCorrection(correction) ? (
          <p className="text-sm text-charcoal/50 italic">
            This correction is resolved and no further action is available.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              <div className="space-y-2">
                <p className="text-xs font-mono uppercase tracking-wide text-charcoal/50">
                  Apply a change
                </p>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_ACTIONS.map((resolution) => (
                    <ResolutionButton
                      key={resolution}
                      resolution={resolution}
                      disabled={isLoading}
                      onClick={handleActionClick}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-mono uppercase tracking-wide text-charcoal/50">
                  Resolve without changes
                </p>
                <div className="flex flex-wrap gap-2">
                  {TERMINAL_ACTIONS.map((resolution) => (
                    <ResolutionButton
                      key={resolution}
                      resolution={resolution}
                      disabled={isLoading}
                      onClick={handleActionClick}
                    />
                  ))}
                </div>
              </div>
            </div>

            {pendingResolution && pendingMeta && (
              <div
                role="dialog"
                aria-label={`Confirm ${pendingMeta.label}`}
                className="border border-border/70 rounded-lg p-4 bg-paper space-y-3"
              >
                <p className="text-sm text-charcoal/80">
                  {pendingMeta.confirm ?? `Continue with “${pendingMeta.label}”?`}
                </p>
                {pendingMeta.noteRequired && (
                  <div>
                    <label
                      htmlFor="correction-resolution-note"
                      className="block text-xs font-medium text-charcoal/70 mb-1"
                    >
                      Note (required)
                    </label>
                    <textarea
                      id="correction-resolution-note"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={2}
                      placeholder="Add context for this action…"
                      className="w-full text-sm bg-bone border border-border/70 rounded-md px-3 py-2 text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-trust/50 resize-y"
                    />
                    {noteMissing && (
                      <p className="text-xs text-clay mt-1">A note is required for this action.</p>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={noteMissing || isLoading}
                    className={`${BASE_BUTTON_CLASSES} ${BUTTON_CLASSES[pendingMeta.variant]}`}
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

            {canApply && (
              <div className="border border-trust/30 bg-trust/5 rounded-lg p-4 space-y-2">
                <p className="text-sm text-charcoal/80">
                  This correction has been reviewed for{" "}
                  <strong>{RESOLUTION_META[correction.resolution as CorrectionResolution].label}</strong>.
                  Apply it to update the public page.
                </p>
                <button
                  type="button"
                  onClick={onApply}
                  disabled={isLoading}
                  className={`${BASE_BUTTON_CLASSES} ${BUTTON_CLASSES.primary}`}
                >
                  Apply correction
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
