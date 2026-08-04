// src/pages/review/CorrectionReviewPage.tsx

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  CorrectionResolution,
  CorrectionState,
  CorrectionSubmission,
} from "../../lib/review/types";
import { CorrectionManager } from "../../lib/review/CorrectionManager";
import { CorrectionList } from "../../components/review/CorrectionList";
import { CorrectionDetail } from "../../components/review/CorrectionDetail";
import { CorrectionApplyDialog } from "../../components/review/CorrectionApplyDialog";
import { buildPublicLogPreview, isPendingCorrection } from "../../components/review/correctionMeta";
import { MOCK_CORRECTIONS } from "./mockCorrections";

const REVIEWER_ID = "reviewer-admin";

/** Resolutions that resolve immediately to a terminal state during review. */
const TERMINAL_STATES: Partial<Record<CorrectionResolution, CorrectionState>> = {
  dispute: "disputed",
  archive: "archived",
  withdraw: "withdrawn",
  reject: "rejected",
};

interface CorrectionReviewPageProps {
  /** Corrections store. When omitted the page manages local state seeded from
   * `initialCorrections` so it is fully usable in isolation and in tests. */
  manager?: CorrectionManager;
  /** Local-state seed when no manager is provided. */
  initialCorrections?: CorrectionSubmission[];
}

/** Local-only review transition, mirroring CorrectionManager.review. */
function applyLocalReview(
  correction: CorrectionSubmission,
  resolution: CorrectionResolution,
  note: string,
): CorrectionSubmission {
  const nowIso = new Date().toISOString();
  const terminal = TERMINAL_STATES[resolution];
  const next: CorrectionSubmission = {
    ...correction,
    state: terminal ?? "under_review",
    resolution,
    resolutionNote: note,
    assignedReviewer: correction.assignedReviewer ?? REVIEWER_ID,
    updatedAt: nowIso,
  };
  if (terminal) next.resolvedAt = nowIso;
  if (next.isMajor) next.publicLogEntry = buildPublicLogPreview(next);
  return next;
}

/** Local-only apply transition, mirroring CorrectionManager.apply. */
function applyLocalApply(correction: CorrectionSubmission, reviewerId: string): CorrectionSubmission {
  const nowIso = new Date().toISOString();
  const next: CorrectionSubmission = {
    ...correction,
    state: "applied",
    resolution: correction.resolution ?? "update",
    assignedReviewer: correction.assignedReviewer ?? reviewerId,
    resolvedAt: nowIso,
    updatedAt: nowIso,
    version: (correction.version ?? 1) + 1,
  };
  if (next.isMajor) next.publicLogEntry = buildPublicLogPreview(next);
  return next;
}

/**
 * Admin correction review interface (M4.3-05, final task).
 *
 * Three-panel layout: filterable/sortable queue (left), full detail with
 * resolution actions (right), and an apply confirmation dialog (modal). The
 * queue loads pending corrections (`new` / `under_review`); a review action
 * records the resolution and, for content-affecting resolutions, an apply step
 * writes the public log entry.
 */
export default function CorrectionReviewPage({
  manager,
  initialCorrections = MOCK_CORRECTIONS,
}: CorrectionReviewPageProps) {
  const [corrections, setCorrections] = useState<CorrectionSubmission[]>(initialCorrections);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Load pending corrections from the manager when one is provided.
  useEffect(() => {
    if (!manager) return;
    let cancelled = false;
    (async () => {
      try {
        const pending = await manager.getPending();
        if (!cancelled) setCorrections(pending);
      } catch {
        if (!cancelled) setNotice("Failed to load corrections.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [manager]);

  const pendingCorrections = useMemo(
    () => corrections.filter(isPendingCorrection),
    [corrections],
  );

  // Until the admin explicitly selects a row, the first pending correction is
  // shown in the detail panel (derived, so no effect is needed).
  const selected = useMemo(
    () => corrections.find((c) => c.id === selectedId) ?? pendingCorrections[0] ?? null,
    [corrections, selectedId, pendingCorrections],
  );

  const handleReview = useCallback(
    async (resolution: CorrectionResolution, note: string) => {
      if (!selected) return;
      setIsLoading(true);
      setNotice(null);
      try {
        if (manager) {
          const updated = await manager.review(selected.id, resolution, note, REVIEWER_ID);
          setCorrections((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        } else {
          setCorrections((prev) =>
            prev.map((c) => (c.id === selected.id ? applyLocalReview(c, resolution, note) : c)),
          );
        }
      } catch {
        setNotice("The review action could not be completed.");
      } finally {
        setIsLoading(false);
      }
    },
    [selected, manager],
  );

  const handleApply = useCallback(async () => {
    if (!selected) return;
    setApplyOpen(false);
    setIsLoading(true);
    setNotice(null);
    try {
      if (manager) {
        const updated = await manager.apply(selected.id, REVIEWER_ID);
        setCorrections((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        setCorrections((prev) =>
          prev.map((c) => (c.id === selected.id ? applyLocalApply(c, REVIEWER_ID) : c)),
        );
      }
    } catch {
      setNotice("The correction could not be applied.");
    } finally {
      setIsLoading(false);
    }
  }, [selected, manager]);

  const handleEscalate = useCallback(async () => {
    if (!selected || !manager) return;
    try {
      await manager.escalate(selected.id);
      setNotice("Correction escalated to the review queue.");
    } catch {
      setNotice("Escalation failed.");
    }
  }, [selected, manager]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10" data-testid="correction-review-page">
      <header className="pb-6 border-b border-border/60">
        <p className="font-mono text-xs uppercase tracking-wide text-charcoal/50">Admin</p>
        <h1 className="font-serif text-2xl font-semibold text-ink leading-tight">
          Correction review queue
        </h1>
        <p className="text-sm text-charcoal/70 mt-1">
          Review and apply public correction submissions.
        </p>
      </header>

      {notice && (
        <div
          role="status"
          className="mt-4 bg-amber/10 border border-amber/30 text-sm text-charcoal/80 rounded-md px-4 py-3"
        >
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 mt-6">
        <CorrectionList
          corrections={pendingCorrections}
          selectedId={selected?.id}
          onSelect={setSelectedId}
        />
        <div>
          {selected ? (
            <CorrectionDetail
              correction={selected}
              onReview={handleReview}
              onEscalate={handleEscalate}
              onApply={() => setApplyOpen(true)}
              isLoading={isLoading}
            />
          ) : (
            <div className="border border-dashed border-border rounded-lg p-10 text-center text-sm text-charcoal/50">
              No corrections to review.
            </div>
          )}
        </div>
      </div>

      {selected && (
        <CorrectionApplyDialog
          correction={selected}
          open={applyOpen}
          onConfirm={handleApply}
          onCancel={() => setApplyOpen(false)}
        />
      )}
    </div>
  );
}
