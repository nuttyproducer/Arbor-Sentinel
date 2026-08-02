import { useMemo, useState } from "react";
import type {
  ChecklistResult,
  ReviewChecklistItem,
  ReviewChecklistResult,
} from "../../lib/review/types";

interface ReviewChecklistProps {
  items: ReviewChecklistItem[];
  results: ReviewChecklistResult[];
  onResultChange: (itemId: string, result: ChecklistResult, note?: string) => void;
  readonly?: boolean;
}

interface ChecklistRowProps {
  item: ReviewChecklistItem;
  result?: ReviewChecklistResult;
  onResultChange: ReviewChecklistProps["onResultChange"];
  readonly: boolean;
}

const RESULT_OPTIONS: {
  value: ChecklistResult;
  label: string;
  activeClass: string;
}[] = [
  {
    value: "pass",
    label: "Pass",
    activeClass: "bg-trust/10 text-trust border-trust/40",
  },
  {
    value: "fail",
    label: "Fail",
    activeClass: "bg-clay/10 text-clay border-clay/40",
  },
  {
    value: "na",
    label: "N/A",
    activeClass: "bg-amber/10 text-[#8B6914] border-amber/40",
  },
];

function ChecklistRow({
  item,
  result,
  onResultChange,
  readonly,
}: ChecklistRowProps) {
  // Local note buffer so a note typed before a result is selected is not
  // lost — it is attached to the result the next time a toggle is pressed.
  const [noteDraft, setNoteDraft] = useState(result?.note ?? "");

  const handleSelect = (value: ChecklistResult) => {
    onResultChange(item.id, value, noteDraft.trim() ? noteDraft : undefined);
  };

  const handleNoteChange = (value: string) => {
    setNoteDraft(value);
    // Persist immediately once a result is already recorded.
    if (result?.result) {
      onResultChange(item.id, result.result, value);
    }
  };

  return (
    <li className="border border-border/60 rounded-lg p-4 bg-paper">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">
            {item.label}
            {item.required && (
              <span className="ml-2 font-mono text-xs text-clay">Required</span>
            )}
          </p>
          {item.description && (
            <p className="text-xs text-charcoal/60 mt-1">{item.description}</p>
          )}
        </div>

        <div
          role="group"
          aria-label={`Result for ${item.label}`}
          className="flex gap-1.5 shrink-0"
        >
          {RESULT_OPTIONS.map((option) => {
            const isActive = result?.result === option.value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={readonly}
                aria-pressed={isActive}
                onClick={() => handleSelect(option.value)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors min-h-[32px] ${
                  isActive
                    ? option.activeClass
                    : "border-border text-charcoal/60 hover:bg-ink/5"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor={`note-${item.id}`} className="sr-only">
          Note for {item.label}
        </label>
        <textarea
          id={`note-${item.id}`}
          value={noteDraft}
          onChange={(event) => handleNoteChange(event.target.value)}
          disabled={readonly}
          placeholder="Add a note…"
          rows={1}
          className="w-full text-sm bg-bone border border-border/70 rounded-md px-3 py-2 text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-trust/50 resize-y"
        />
      </div>
    </li>
  );
}

/**
 * Shared review checklist: pass/fail/N-A toggles per item grouped by
 * category, with an optional note per item and a live progress indicator.
 */
export function ReviewChecklist({
  items,
  results,
  onResultChange,
  readonly = false,
}: ReviewChecklistProps) {
  const resultsByItem = useMemo(
    () => new Map(results.map((result) => [result.itemId, result])),
    [results],
  );

  const grouped = useMemo(() => {
    const groups = new Map<string, ReviewChecklistItem[]>();
    for (const item of items) {
      const list = groups.get(item.category) ?? [];
      list.push(item);
      groups.set(item.category, list);
    }
    return Array.from(groups.entries());
  }, [items]);

  const passedCount = items.filter(
    (item) => resultsByItem.get(item.id)?.result === "pass",
  ).length;

  if (items.length === 0) {
    return (
      <p className="text-sm text-charcoal/60 italic">
        No checklist items are defined for this review.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-ink">
          Review checklist
        </h3>
        <span
          className="font-mono text-sm text-charcoal/60"
          aria-live="polite"
        >
          {passedCount}/{items.length} passed
        </span>
      </div>

      {grouped.map(([category, categoryItems]) => (
        <section key={category}>
          <h4 className="text-xs font-mono uppercase tracking-wide text-charcoal/50 mb-3">
            {category}
          </h4>
          <ul className="space-y-3">
            {categoryItems.map((item) => (
              <ChecklistRow
                key={item.id}
                item={item}
                result={resultsByItem.get(item.id)}
                onResultChange={onResultChange}
                readonly={readonly}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
