import { ReviewChecklist } from "./ReviewChecklist";
import type {
  ChecklistResult,
  ReviewChecklistResult,
} from "../../lib/review/types";
import { INSTITUTION_CHECKLIST_ITEMS } from "../../lib/review/institutionChecklist";

interface InstitutionChecklistProps {
  results: ReviewChecklistResult[];
  onResultChange: (itemId: string, result: ChecklistResult, note?: string) => void;
  readonly?: boolean;
}

/**
 * Institution review checklist: pre-configured with the institution checklist
 * items. All other behavior (grouping, progress, notes, readonly) is provided
 * by the shared ReviewChecklist component.
 */
export function InstitutionChecklist({
  results,
  onResultChange,
  readonly = false,
}: InstitutionChecklistProps) {
  return (
    <ReviewChecklist
      items={INSTITUTION_CHECKLIST_ITEMS}
      results={results}
      onResultChange={onResultChange}
      readonly={readonly}
    />
  );
}
