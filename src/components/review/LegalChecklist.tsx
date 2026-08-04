import { ReviewChecklist } from "./ReviewChecklist";
import type {
  ChecklistResult,
  ReviewChecklistResult,
} from "../../lib/review/types";
import { LEGAL_CHECKLIST_ITEMS } from "../../lib/review/legalChecklist";

interface LegalChecklistProps {
  results: ReviewChecklistResult[];
  onResultChange: (itemId: string, result: ChecklistResult, note?: string) => void;
  readonly?: boolean;
}

/**
 * Legal review checklist: pre-configured with the legal checklist items.
 * All other behavior (grouping, progress, notes, readonly) is provided by
 * the shared ReviewChecklist component.
 */
export function LegalChecklist({
  results,
  onResultChange,
  readonly = false,
}: LegalChecklistProps) {
  return (
    <ReviewChecklist
      items={LEGAL_CHECKLIST_ITEMS}
      results={results}
      onResultChange={onResultChange}
      readonly={readonly}
    />
  );
}
