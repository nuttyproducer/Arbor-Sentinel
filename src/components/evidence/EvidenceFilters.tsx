import type { EvidenceCategory } from "../../data/evidenceItems";
import { EVIDENCE_CATEGORIES, EVIDENCE_CATEGORY_LABELS } from "../../data/evidenceItems";
import {
  CONTENT_STATUS_LABELS,
  VERIFICATION_LEVEL_LABELS,
  SOURCE_TYPE_LABELS,
  type ContentStatus,
  type VerificationLevel,
  type SourceType,
} from "../../types/content";
import type { ActiveFilters, FilterKey } from "./filters";

interface FilterChipGroupProps<T extends string | number> {
  label: string;
  options: T[];
  selected: T | null;
  onSelect: (value: T) => void;
  onClear: () => void;
  formatLabel: (value: T) => string;
}

/** Keyboard-accessible filter chip group used within EvidenceFilters. */
export function FilterChipGroup<T extends string | number>({
  label,
  options,
  selected,
  onSelect,
  onClear,
  formatLabel,
}: FilterChipGroupProps<T>) {
  return (
    <fieldset className="mb-4">
      <legend className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-2">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((value) => {
          const isActive = selected === value;
          return (
            <button
              key={String(value)}
              type="button"
              onClick={() => (isActive ? onClear() : onSelect(value))}
              className={`
                inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border
                transition-colors duration-200 min-h-[36px]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-1
                ${
                  isActive
                    ? "bg-ink text-bone border-ink"
                    : "bg-paper text-charcoal/70 border-charcoal/20 hover:bg-ink/5 hover:border-charcoal/40"
                }
              `.trim()}
              aria-pressed={isActive}
            >
              {formatLabel(value)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

// ── Pre-bound filter groups for the evidence library ──────────────────────

interface EvidenceFiltersProps {
  filters: ActiveFilters;
  setFilter: <K extends FilterKey>(key: K, value: ActiveFilters[K]) => void;
  clearFilter: (key: FilterKey) => void;
  clearAllFilters: () => void;
  availableSourceTypes: string[];
  availableVerificationLevels: VerificationLevel[];
  availableContentStatuses: ContentStatus[];
  filteredCount: number;
  totalCount: number;
}

export function EvidenceFilters({
  filters,
  setFilter,
  clearFilter,
  clearAllFilters,
  availableSourceTypes,
  availableVerificationLevels,
  availableContentStatuses,
  filteredCount,
  totalCount,
}: EvidenceFiltersProps) {
  const active = filters.category !== null || filters.sourceType !== null ||
    filters.verificationLevel !== null || filters.contentStatus !== null;

  return (
    <section aria-labelledby="filters-heading" className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2
          id="filters-heading"
          className="font-serif text-2xl font-semibold text-ink"
        >
          Filters
        </h2>
        {active && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-sm text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm min-h-[44px] flex items-center"
          >
            Clear all filters
          </button>
        )}
      </div>

      <FilterChipGroup<EvidenceCategory>
        label="Category"
        options={EVIDENCE_CATEGORIES}
        selected={filters.category}
        onSelect={(v) => setFilter("category", v)}
        onClear={() => clearFilter("category")}
        formatLabel={(v) => EVIDENCE_CATEGORY_LABELS[v]}
      />

      <FilterChipGroup<SourceType>
        label="Source type"
        options={availableSourceTypes as SourceType[]}
        selected={filters.sourceType}
        onSelect={(v) => setFilter("sourceType", v)}
        onClear={() => clearFilter("sourceType")}
        formatLabel={(v) => SOURCE_TYPE_LABELS[v]}
      />

      <FilterChipGroup<VerificationLevel>
        label="Verification level"
        options={availableVerificationLevels}
        selected={filters.verificationLevel}
        onSelect={(v) => setFilter("verificationLevel", v)}
        onClear={() => clearFilter("verificationLevel")}
        formatLabel={(v) => `Level ${v} — ${VERIFICATION_LEVEL_LABELS[v]}`}
      />

      <FilterChipGroup<ContentStatus>
        label="Content status"
        options={availableContentStatuses}
        selected={filters.contentStatus}
        onSelect={(v) => setFilter("contentStatus", v)}
        onClear={() => clearFilter("contentStatus")}
        formatLabel={(v) => CONTENT_STATUS_LABELS[v]}
      />

      <p className="font-mono text-xs text-charcoal/50 mt-2">
        {filteredCount} of {totalCount} records
        {active ? " match the current filters" : " displayed"}
      </p>
    </section>
  );
}
