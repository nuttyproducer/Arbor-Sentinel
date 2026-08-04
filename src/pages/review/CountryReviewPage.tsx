// src/pages/review/CountryReviewPage.tsx

import { useMemo } from "react";
import type { ReviewItem } from "../../lib/review/types";
import type { ReviewQueue } from "../../lib/review/ReviewQueue";
import { CountryChecklist } from "../../components/review/CountryChecklist";
import { ReviewActions } from "../../components/review/ReviewActions";
import { ReviewNotes } from "../../components/review/ReviewNotes";
import { ReviewHistory } from "../../components/review/ReviewHistory";
import { Badge } from "../../components/ui/Badge";
import { mockCountryReviewItem } from "./mockReviewItems";
import { CollapsibleSection, ReviewHeader } from "./reviewPageComponents";
import { extractCountryContent, useReviewItemState } from "./reviewPageShared";

export interface CountryReviewPageProps {
  /** Review item to render. Defaults to a mock country review item. */
  item?: ReviewItem;
  /** Optional queue used to persist state changes. Falls back to local state. */
  queue?: ReviewQueue;
}

function formatSourceDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Country review page (admin-only).
 *
 * Route: /admin/review/country/:id (wired to the queue in a later milestone).
 *
 * Walks the reviewer through the country checklist (position accuracy, UN
 * voting records, source freshness) alongside a source verification panel.
 * Country pages are shown without an accountability score by policy, and a
 * freshness banner warns when any source is over a year old.
 */
export default function CountryReviewPage({
  item = mockCountryReviewItem,
  queue,
}: CountryReviewPageProps) {
  const state = useReviewItemState(item, queue);
  const { sources, staleSourceNames, hasStaleSources } = useMemo(
    () => extractCountryContent(item),
    [item],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8" data-testid="country-review-page">
      <ReviewHeader item={state.item} />

      {/* Special: country pages never show an accountability score (policy). */}
      <section className="flex flex-wrap items-center gap-2" data-testid="accountability-score-hidden">
        <Badge variant="neutral">Accountability score withheld by policy</Badge>
      </section>

      {hasStaleSources && (
        <div
          role="alert"
          data-testid="source-freshness-warning"
          className="flex items-start gap-3 border border-amber/40 bg-amber/10 rounded-lg px-4 py-3"
        >
          <span aria-hidden="true">⚠</span>
          <p className="text-sm text-[#8B6914]">
            Some sources are over 12 months old. Verify positions against current
            official sources before approving.
          </p>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-ink">Source verification</h2>
        <ul className="space-y-3" data-testid="source-verification-panel">
          {sources.map((source) => (
            <li
              key={source.name}
              className="flex flex-wrap items-center gap-3 border border-border/60 rounded-lg bg-paper px-4 py-3"
            >
              <Badge variant={source.verified ? "neutral" : "warning"}>
                {source.verified ? "Verified" : "Unverified"}
              </Badge>
              <span className="text-sm text-ink">{source.name}</span>
              <span className="font-mono text-xs text-charcoal/50">
                {formatSourceDate(source.date)}
              </span>
              {staleSourceNames.includes(source.name) && (
                <Badge variant="warning">Stale</Badge>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <CountryChecklist
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
