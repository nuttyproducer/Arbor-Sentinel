// src/pages/review/InstitutionReviewPage.tsx

import { useMemo } from "react";
import type { ReviewItem } from "../../lib/review/types";
import type { ReviewQueue } from "../../lib/review/ReviewQueue";
import { InstitutionChecklist } from "../../components/review/InstitutionChecklist";
import { ReviewActions } from "../../components/review/ReviewActions";
import { ReviewNotes } from "../../components/review/ReviewNotes";
import { ReviewHistory } from "../../components/review/ReviewHistory";
import { Badge } from "../../components/ui/Badge";
import { mockInstitutionReviewItem } from "./mockReviewItems";
import { CollapsibleSection, ReviewHeader } from "./reviewPageComponents";
import {
  extractInstitutionContent,
  useReviewItemState,
  type EUCompetencyType,
} from "./reviewPageShared";

export interface InstitutionReviewPageProps {
  /** Review item to render. Defaults to a mock institution review item. */
  item?: ReviewItem;
  /** Optional queue used to persist state changes. Falls back to local state. */
  queue?: ReviewQueue;
}

const COMPETENCY_TYPE_META: Record<
  EUCompetencyType,
  { label: string; variant: "info" | "warning" | "neutral" }
> = {
  eu_exclusive: { label: "EU exclusive", variant: "info" },
  shared: { label: "Shared", variant: "warning" },
  national: { label: "National", variant: "neutral" },
};

/** Legend for the EU competency distinction indicator. */
const EU_COMPETENCY_LEGEND: { type: EUCompetencyType; description: string }[] = [
  {
    type: "eu_exclusive",
    description: "The EU acts alone — member states do not legislate nationally.",
  },
  {
    type: "shared",
    description: "The EU sets minimum standards; member states may go further.",
  },
  {
    type: "national",
    description: "Member states retain authority — the EU may not act unilaterally.",
  },
];

/**
 * Institution review page (admin-only).
 *
 * Route: /admin/review/institution/:id (wired to the queue in a later milestone).
 *
 * Walks the reviewer through the institution checklist (role accuracy,
 * competency boundaries, legal basis) alongside a competency-boundaries panel
 * that distinguishes EU-exclusive, shared, and national competencies.
 */
export default function InstitutionReviewPage({
  item = mockInstitutionReviewItem,
  queue,
}: InstitutionReviewPageProps) {
  const state = useReviewItemState(item, queue);
  const { role, boundaries } = useMemo(() => extractInstitutionContent(item), [item]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8" data-testid="institution-review-page">
      <ReviewHeader item={state.item} />

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-ink">Competency boundaries</h2>
        <div className="border border-border/60 rounded-lg bg-paper px-4 py-3">
          <p className="text-sm text-charcoal/85 leading-relaxed">{role}</p>
        </div>
        <ul className="space-y-3" data-testid="competency-boundaries-panel">
          {boundaries.map((boundary) => {
            const meta = COMPETENCY_TYPE_META[boundary.competencyType];
            return (
              <li
                key={boundary.area}
                className="border border-border/60 rounded-lg bg-paper px-4 py-3 space-y-1.5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                  <span className="text-sm font-medium text-ink">{boundary.area}</span>
                  <Badge variant={boundary.canAct ? "neutral" : "warning"}>
                    {boundary.canAct ? "Can act" : "Cannot act"}
                  </Badge>
                </div>
                <p className="text-xs text-charcoal/60 leading-relaxed">{boundary.detail}</p>
              </li>
            );
          })}
        </ul>

        <div
          data-testid="eu-competency-distinction"
          className="border border-border/60 rounded-lg bg-paper px-4 py-3 space-y-2"
        >
          <p className="text-xs font-mono uppercase tracking-wide text-charcoal/50">
            EU competency distinction
          </p>
          <ul className="space-y-1.5">
            {EU_COMPETENCY_LEGEND.map((entry) => {
              const meta = COMPETENCY_TYPE_META[entry.type];
              return (
                <li key={entry.type} className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                  <span className="text-xs text-charcoal/70">{entry.description}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <InstitutionChecklist
          results={state.checklist}
          onResultChange={state.handleChecklistChange}
        />
      </section>

      <section>
        <ReviewActions
          currentState={state.item.state}
          validTransitions={state.validTransitions}
          onAction={state.handleAction}
          isLoading={state.isLoading}
        />
      </section>

      <CollapsibleSection title="Review notes">
        <ReviewNotes onSave={state.handleNotesSave} />
      </CollapsibleSection>

      <CollapsibleSection title="Review history">
        <ReviewHistory stateHistory={state.item.stateHistory} comments={state.item.comments} />
      </CollapsibleSection>
    </div>
  );
}
