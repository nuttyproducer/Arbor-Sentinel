// src/pages/review/LegalReviewPage.tsx

import { useMemo } from "react";
import type { ReviewItem } from "../../lib/review/types";
import type { ReviewQueue } from "../../lib/review/ReviewQueue";
import { SideBySideView } from "../../components/review/SideBySideView";
import { LegalChecklist } from "../../components/review/LegalChecklist";
import { ReviewActions } from "../../components/review/ReviewActions";
import { ReviewNotes } from "../../components/review/ReviewNotes";
import { ReviewHistory } from "../../components/review/ReviewHistory";
import { mockLegalReviewItem } from "./mockReviewItems";
import { CollapsibleSection, ReviewHeader } from "./reviewPageComponents";
import { extractLegalContent, useReviewItemState } from "./reviewPageShared";

export interface LegalReviewPageProps {
  /** Review item to render. Defaults to a mock legal review item. */
  item?: ReviewItem;
  /** Optional queue used to persist state changes. Falls back to local state. */
  queue?: ReviewQueue;
}

/**
 * Legal review page (admin-only).
 *
 * Route: /admin/review/legal/:id (wired to the queue in a later milestone).
 *
 * Compares the AI-generated legal proposal against the original source side by
 * side, walks the reviewer through the legal checklist, and exposes state
 * transitions (start review / request changes / approve / reject) plus
 * collapsible notes and history.
 */
export default function LegalReviewPage({
  item = mockLegalReviewItem,
  queue,
}: LegalReviewPageProps) {
  const state = useReviewItemState(item, queue);
  const { proposalText, sourceText } = useMemo(() => extractLegalContent(item), [item]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8" data-testid="legal-review-page">
      <ReviewHeader item={state.item} />

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-ink">
          AI legal proposal vs. original source
        </h2>
        <SideBySideView
          leftContent={proposalText}
          rightContent={sourceText}
          leftLabel="AI legal proposal"
          rightLabel="Original source"
        />
      </section>

      <section className="space-y-3">
        <LegalChecklist results={state.checklist} onResultChange={state.handleChecklistChange} />
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
