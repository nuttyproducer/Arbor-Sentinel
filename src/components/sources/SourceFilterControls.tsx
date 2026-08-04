import type { SourceType, SourceStatus, HealthStatus, TrustLevel } from "../../types/content";
import {
  SOURCE_TYPE_LABELS,
  SOURCE_STATUS_LABELS,
  HEALTH_STATUS_LABELS,
  TRUST_LEVEL_LABELS,
} from "../../types/content";
import { FilterChipGroup } from "../evidence/EvidenceFilters";

export interface SourceFilters {
  sourceType: SourceType | null;
  status: SourceStatus | null;
  healthStatus: HealthStatus | null;
  region: string | null;
  language: string | null;
  trustLevel: TrustLevel | null;
}

export const DEFAULT_SOURCE_FILTERS: SourceFilters = {
  sourceType: null,
  status: null,
  healthStatus: null,
  region: null,
  language: null,
  trustLevel: null,
};

const ALL_SOURCE_TYPES: SourceType[] = [
  "court", "un", "government", "humanitarian", "ngo", "academic", "journalism", "osint",
];

const ALL_SOURCE_STATUSES: SourceStatus[] = ["active", "broken", "archived", "superseded"];

const ALL_HEALTH_STATUSES: HealthStatus[] = ["unknown", "active", "degraded", "failed"];

const ALL_TRUST_LEVELS: TrustLevel[] = [0, 1, 2, 3, 4, 5];

interface SourceFilterControlsProps {
  filters: SourceFilters;
  setFilter: <K extends keyof SourceFilters>(key: K, value: SourceFilters[K]) => void;
  clearFilter: (key: keyof SourceFilters) => void;
  clearAllFilters: () => void;
  availableRegions: string[];
  availableLanguages: string[];
  filteredCount: number;
  totalCount: number;
}

export function SourceFilterControls({
  filters,
  setFilter,
  clearFilter,
  clearAllFilters,
  availableRegions,
  availableLanguages,
  filteredCount,
  totalCount,
}: SourceFilterControlsProps) {
  const hasActive =
    filters.sourceType !== null ||
    filters.status !== null ||
    filters.healthStatus !== null ||
    filters.region !== null ||
    filters.language !== null ||
    filters.trustLevel !== null;

  return (
    <section aria-labelledby="source-filters-heading" className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2
          id="source-filters-heading"
          className="font-serif text-2xl font-semibold text-ink"
        >
          Source filters
        </h2>
        {hasActive && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-sm text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm min-h-[44px] flex items-center"
          >
            Clear all filters
          </button>
        )}
      </div>

      <FilterChipGroup<SourceType>
        label="Source type"
        options={ALL_SOURCE_TYPES}
        selected={filters.sourceType}
        onSelect={(v) => setFilter("sourceType", v)}
        onClear={() => clearFilter("sourceType")}
        formatLabel={(v) => SOURCE_TYPE_LABELS[v]}
      />

      <FilterChipGroup<SourceStatus>
        label="URL status"
        options={ALL_SOURCE_STATUSES}
        selected={filters.status}
        onSelect={(v) => setFilter("status", v)}
        onClear={() => clearFilter("status")}
        formatLabel={(v) => SOURCE_STATUS_LABELS[v]}
      />

      <FilterChipGroup<HealthStatus>
        label="Health status"
        options={ALL_HEALTH_STATUSES}
        selected={filters.healthStatus}
        onSelect={(v) => setFilter("healthStatus", v)}
        onClear={() => clearFilter("healthStatus")}
        formatLabel={(v) => HEALTH_STATUS_LABELS[v]}
      />

      <FilterChipGroup<TrustLevel>
        label="Trust level"
        options={ALL_TRUST_LEVELS}
        selected={filters.trustLevel}
        onSelect={(v) => setFilter("trustLevel", v)}
        onClear={() => clearFilter("trustLevel")}
        formatLabel={(v) => `Level ${v} — ${TRUST_LEVEL_LABELS[v]}`}
      />

      {availableLanguages.length > 0 && (
        <FilterChipGroup<string>
          label="Language"
          options={availableLanguages}
          selected={filters.language}
          onSelect={(v) => setFilter("language", v)}
          onClear={() => clearFilter("language")}
          formatLabel={(v) => v.toUpperCase()}
        />
      )}

      {availableRegions.length > 0 && (
        <FilterChipGroup<string>
          label="Region"
          options={availableRegions}
          selected={filters.region}
          onSelect={(v) => setFilter("region", v)}
          onClear={() => clearFilter("region")}
          formatLabel={(v) => v}
        />
      )}

      <p className="font-mono text-xs text-charcoal/50 mt-2">
        {filteredCount} of {totalCount} sources
        {hasActive ? " match the current filters" : " displayed"}
      </p>
    </section>
  );
}
