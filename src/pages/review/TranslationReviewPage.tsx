// src/pages/review/TranslationReviewPage.tsx

import { useMemo } from "react";
import type { ReviewItem } from "../../lib/review/types";
import type { ReviewQueue } from "../../lib/review/ReviewQueue";
import { SideBySideView } from "../../components/review/SideBySideView";
import { TranslationChecklist } from "../../components/review/TranslationChecklist";
import { ReviewActions } from "../../components/review/ReviewActions";
import { ReviewNotes } from "../../components/review/ReviewNotes";
import { ReviewHistory } from "../../components/review/ReviewHistory";
import { Badge } from "../../components/ui/Badge";
import { mockTranslationReviewItem } from "./mockReviewItems";
import { CollapsibleSection, ReviewHeader } from "./reviewPageComponents";
import {
  buildEntityHighlights,
  extractTranslationContent,
  useReviewItemState,
} from "./reviewPageShared";

export interface TranslationReviewPageProps {
  /** Review item to render. Defaults to a mock translation review item. */
  item?: ReviewItem;
  /** Optional queue used to persist state changes. Falls back to local state. */
  queue?: ReviewQueue;
}

/**
 * Translation review page (admin-only).
 *
 * Route: /admin/review/translation/:id (wired to the queue in a later milestone).
 *
 * Compares the source-language text against the AI translation side by side,
 * highlights preserved named entities in both panels, surfaces the AI-assist
 * disclosure flag, and walks the reviewer through the translation checklist.
 */
export default function TranslationReviewPage({
  item = mockTranslationReviewItem,
  queue,
}: TranslationReviewPageProps) {
  const state = useReviewItemState(item, queue);

  const {
    sourceText,
    translatedText,
    preservedEntities,
    humanReviewed,
    confidence,
    sourceLanguage,
    targetLanguage,
  } = useMemo(() => extractTranslationContent(item), [item]);

  const highlights = useMemo(
    () => buildEntityHighlights(sourceText, translatedText, preservedEntities),
    [sourceText, translatedText, preservedEntities],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8" data-testid="translation-review-page">
      <ReviewHeader item={state.item} />

      <section className="flex flex-wrap items-center gap-2">
        <Badge variant={humanReviewed ? "neutral" : "warning"}>
          {humanReviewed
            ? "Human-reviewed translation"
            : "AI-assisted translation — human review required"}
        </Badge>
        {typeof confidence === "number" && (
          <Badge variant="info">Confidence {Math.round(confidence * 100)}%</Badge>
        )}
        {sourceLanguage && targetLanguage && (
          <span className="font-mono text-xs text-charcoal/50">
            {sourceLanguage.toUpperCase()} → {targetLanguage.toUpperCase()}
          </span>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-ink">Source vs. translation</h2>
        <SideBySideView
          leftContent={sourceText}
          rightContent={translatedText}
          leftLabel={sourceLanguage ? `Source (${sourceLanguage})` : "Source"}
          rightLabel={targetLanguage ? `Translation (${targetLanguage})` : "Translation"}
          highlights={highlights}
        />
      </section>

      <section className="space-y-3">
        <TranslationChecklist results={state.checklist} onResultChange={state.handleChecklistChange} />
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
