import { ReviewChecklist } from "./ReviewChecklist";
import type {
  ChecklistResult,
  ReviewChecklistResult,
} from "../../lib/review/types";
import { EDITORIAL_CHECKLIST_ITEMS } from "../../lib/review/editorialChecklist";

interface EditorialChecklistProps {
  results: ReviewChecklistResult[];
  onResultChange: (itemId: string, result: ChecklistResult, note?: string) => void;
  readonly?: boolean;
}

/**
 * Editorial review checklist: pre-configured with the editorial checklist
 * items. All other behavior (grouping, progress, notes, readonly) is provided
 * by the shared ReviewChecklist component.
 */
export function EditorialChecklist({
  results,
  onResultChange,
  readonly = false,
}: EditorialChecklistProps) {
  return (
    <ReviewChecklist
      items={EDITORIAL_CHECKLIST_ITEMS}
      results={results}
      onResultChange={onResultChange}
      readonly={readonly}
    />
  );
}
