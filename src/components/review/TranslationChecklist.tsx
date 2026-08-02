import { ReviewChecklist } from "./ReviewChecklist";
import type {
  ChecklistResult,
  ReviewChecklistResult,
} from "../../lib/review/types";
import { TRANSLATION_CHECKLIST_ITEMS } from "../../lib/review/translationChecklist";

interface TranslationChecklistProps {
  results: ReviewChecklistResult[];
  onResultChange: (itemId: string, result: ChecklistResult, note?: string) => void;
  readonly?: boolean;
}

/**
 * Translation review checklist: pre-configured with the translation checklist
 * items. All other behavior (grouping, progress, notes, readonly) is provided
 * by the shared ReviewChecklist component.
 */
export function TranslationChecklist({
  results,
  onResultChange,
  readonly = false,
}: TranslationChecklistProps) {
  return (
    <ReviewChecklist
      items={TRANSLATION_CHECKLIST_ITEMS}
      results={results}
      onResultChange={onResultChange}
      readonly={readonly}
    />
  );
}
