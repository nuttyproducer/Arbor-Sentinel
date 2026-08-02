// src/components/review/CorrectionApplyDialog.tsx

import type { CorrectionSubmission } from "../../lib/review/types";
import { Badge } from "../ui/Badge";
import {
  BASE_BUTTON_CLASSES,
  BUTTON_CLASSES,
  RESOLUTION_META,
  STATE_LABELS,
  STATE_VARIANTS,
  buildPublicLogPreview,
  getCategoryDef,
} from "./correctionMeta";

interface CorrectionApplyDialogProps {
  correction: CorrectionSubmission;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation dialog shown before a correction is applied. States what will
 * change, warns that remove / downgrade are irreversible, and — for major
 * corrections — previews the public log entry that will be written.
 */
export function CorrectionApplyDialog({
  correction,
  open,
  onConfirm,
  onCancel,
}: CorrectionApplyDialogProps) {
  if (!open) return null;

  const def = getCategoryDef(correction.category);
  const resolution = correction.resolution ?? "update";
  const meta = RESOLUTION_META[resolution];
  const irreversible = resolution === "remove" || resolution === "downgrade";
  const confirmVariant =
    resolution === "remove" ? "danger" : resolution === "downgrade" ? "warning" : "primary";
  const publicLogPreview = correction.isMajor ? buildPublicLogPreview(correction) : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/40"
        onClick={onCancel}
        aria-hidden="true"
        data-testid="apply-dialog-backdrop"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Apply correction"
        className="relative bg-bone border border-border rounded-lg shadow-soft max-w-lg w-full p-6 space-y-4"
        data-testid="apply-dialog"
      >
        <h2 className="font-serif text-xl font-semibold text-ink">Apply correction</h2>

        <div className="space-y-2 text-sm">
          <p className="text-charcoal/80">
            This will apply the <strong>{meta.label}</strong> resolution to{" "}
            <strong className="font-mono text-xs text-trust break-all">{correction.targetPage}</strong>.
          </p>
          {correction.targetSection && (
            <p className="text-charcoal/70">
              <span className="text-charcoal/50">Section: </span>
              {correction.targetSection}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="neutral">{def.label}</Badge>
            <Badge variant={STATE_VARIANTS[correction.state]}>
              {STATE_LABELS[correction.state]}
            </Badge>
          </div>
        </div>

        {irreversible && (
          <div className="bg-clay/10 border border-clay/30 rounded-lg px-4 py-3" data-testid="irreversible-warning">
            <p className="text-sm font-medium text-clay">Irreversible action</p>
            <p className="text-sm text-charcoal/80 mt-1">
              {resolution === "remove"
                ? "Removing deletes this content from the public page. This cannot be undone."
                : "Downgrading reduces the prominence of this content. This cannot be undone."}
            </p>
          </div>
        )}

        {publicLogPreview && (
          <div className="bg-amber/10 border border-amber/30 rounded-lg px-4 py-3 space-y-1" data-testid="public-log-preview">
            <p className="text-xs font-mono uppercase tracking-wide text-[#8B6914]">
              Public log preview
            </p>
            <p className="text-sm text-charcoal/80">{publicLogPreview}</p>
            <p className="text-xs text-charcoal/50">
              This entry will appear in the public correction log.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className={`${BASE_BUTTON_CLASSES} ${BUTTON_CLASSES.secondary}`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`${BASE_BUTTON_CLASSES} ${BUTTON_CLASSES[confirmVariant]}`}
          >
            Apply correction
          </button>
        </div>
      </div>
    </div>
  );
}
