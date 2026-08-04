import { Reveal } from "../ui/Reveal";

interface EvidenceEmptyStateProps {
  totalCount: number;
  categoryCount: number;
  onClearFilters: () => void;
}

export function EvidenceEmptyState({ totalCount, categoryCount, onClearFilters }: EvidenceEmptyStateProps) {
  return (
    <Reveal delay={0.1}>
      <div className="bg-bone border border-border rounded-lg p-10 text-center mb-10">
        <p className="font-serif text-xl font-semibold text-ink mb-3">
          No records match these filters.
        </p>
        <p className="text-charcoal/70 leading-relaxed mb-4">
          Try adjusting or clearing the filter selections above. The
          evidence library contains {totalCount} records across{" "}
          {categoryCount} categories — a different combination
          may show results.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm min-h-[44px]"
        >
          Clear all filters
        </button>
      </div>
    </Reveal>
  );
}
