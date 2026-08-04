import { ReviewChecklist } from "./ReviewChecklist";
import type {
  ChecklistResult,
  ReviewChecklistResult,
} from "../../lib/review/types";
import { COUNTRY_CHECKLIST_ITEMS } from "../../lib/review/countryChecklist";

interface CountryChecklistProps {
  results: ReviewChecklistResult[];
  onResultChange: (itemId: string, result: ChecklistResult, note?: string) => void;
  readonly?: boolean;
}

/**
 * Country review checklist: pre-configured with the country checklist items.
 * All other behavior (grouping, progress, notes, readonly) is provided by
 * the shared ReviewChecklist component.
 */
export function CountryChecklist({
  results,
  onResultChange,
  readonly = false,
}: CountryChecklistProps) {
  return (
    <ReviewChecklist
      items={COUNTRY_CHECKLIST_ITEMS}
      results={results}
      onResultChange={onResultChange}
      readonly={readonly}
    />
  );
}
