// src/pages/review/EditorialReviewPage.tsx

import { useMemo } from "react";
import type { ReviewItem } from "../../lib/review/types";
import type { ReviewQueue } from "../../lib/review/ReviewQueue";
import { SideBySideView } from "../../components/review/SideBySideView";
import { EditorialChecklist } from "../../components/review/EditorialChecklist";
import { ReviewActions } from "../../components/review/ReviewActions";
import { ReviewNotes } from "../../components/review/ReviewNotes";
import { ReviewHistory } from "../../components/review/ReviewHistory";
import { mockEditorialReviewItem } from "./mockReviewItems";
import { CollapsibleSection, ReviewHeader } from "./reviewPageComponents";
import { extractEditorialContent, useReviewItemState } from "./reviewPageShared";

export interface EditorialReviewPageProps {
  /** Review item to render. Defaults to a mock editorial review item. */
  item?: ReviewItem;
  /** Optional queue used to persist state changes. Falls back to local state. */
  queue?: ReviewQueue;
}

/**
 * Editorial review page (admin-only).
 *
 * Route: /admin/review/editorial/:id (wired to the queue in a later milestone).
 *
 * Compares the AI-edited content against the original source side by side,
 * walks the reviewer through the editorial checklist (tone, evidence, safety),
 * and exposes state transitions plus collapsible notes and history.
 */
export default function EditorialReviewPage({
  item = mockEditorialReviewItem,
  queue,
}: EditorialReviewPageProps) {
  const state = useReviewItemState(item, queue);
  const { editedText, originalText } = useMemo(() => extractEditorialContent(item), [item]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8" data-testid="editorial-review-page">
      <ReviewHeader item={state.item} />

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-ink">
          AI-edited content vs. original source
        </h2>
        <SideBySideView
          leftContent={editedText}
          rightContent={originalText}
          leftLabel="AI-edited content"
          rightLabel="Original source"
        />
      </section>

      <section className="space-y-3">
        <EditorialChecklist
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
