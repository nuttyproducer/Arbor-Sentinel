// src/components/map/MapFilters.tsx
import { useEffect, useMemo, useState } from "react";
import type { MapFeature } from "../../lib/map/types";

export interface FilterState {
  categories: Set<string>;
  sourceTypes: Set<string>;
  verificationLevels: Set<string>;
  dateStart: string;
  dateEnd: string;
  layerIds: Set<string>;
}

interface MapFiltersProps {
  features: MapFeature[];
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function toggleInSet(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function getVerificationLevel(f: MapFeature): string {
  return (f as MapFeature & { verificationLevel?: string }).verificationLevel ?? "";
}

function CheckboxGroup({
  title,
  values,
  selected,
  onToggle,
  labelPrefix,
}: {
  title: string;
  values: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  labelPrefix: string;
}) {
  if (values.length === 0) return null;

  return (
    <div className="mb-3">
      <h4 className="font-mono text-[10px] uppercase tracking-widest text-charcoal/60 mb-1">
        {title}
      </h4>
      {values.map((value) => (
        <label
          key={value}
          className="flex items-center gap-2 py-0.5 text-sm text-charcoal/80 hover:text-charcoal cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selected.has(value)}
            onChange={() => onToggle(value)}
            aria-label={`${labelPrefix} ${value}`}
            className="rounded border-charcoal/30 text-trust focus:ring-trust"
          />
          {value}
        </label>
      ))}
    </div>
  );
}

/**
 * Checkbox-based filter panel. Extracts the unique categories, source types,
 * and verification levels present in `features` and emits a FilterState via
 * `onFiltersChange` whenever any control changes. Active filters are meant to
 * be combined with AND logic by the consumer.
 */
export function MapFilters({
  features,
  onFiltersChange,
  className = "",
}: MapFiltersProps) {
  const categories = useMemo(
    () => uniqueSorted(features.map((f) => f.category)),
    [features]
  );
  const sourceTypes = useMemo(
    () => uniqueSorted(features.map((f) => f.type)),
    [features]
  );
  const verificationLevels = useMemo(
    () => uniqueSorted(features.map(getVerificationLevel)),
    [features]
  );

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedSourceTypes, setSelectedSourceTypes] = useState<Set<string>>(
    new Set()
  );
  const [selectedVerificationLevels, setSelectedVerificationLevels] = useState<
    Set<string>
  >(new Set());
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  // Emit the full filter state whenever any selection changes.
  useEffect(() => {
    onFiltersChange({
      categories: selectedCategories,
      sourceTypes: selectedSourceTypes,
      verificationLevels: selectedVerificationLevels,
      dateStart,
      dateEnd,
      layerIds: new Set<string>(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCategories,
    selectedSourceTypes,
    selectedVerificationLevels,
    dateStart,
    dateEnd,
  ]);

  const clearAll = () => {
    setSelectedCategories(new Set());
    setSelectedSourceTypes(new Set());
    setSelectedVerificationLevels(new Set());
    setDateStart("");
    setDateEnd("");
  };

  return (
    <div
      className={`bg-bone/95 border border-charcoal/20 rounded-lg p-3 text-xs ${className}`}
      aria-label="Map filters"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-charcoal/60">
          Filters
        </h3>
        <button
          onClick={clearAll}
          aria-label="Clear all filters"
          className="font-mono text-[10px] text-charcoal/60 hover:text-charcoal underline underline-offset-2"
        >
          Clear all
        </button>
      </div>

      <CheckboxGroup
        title="Category"
        values={categories}
        selected={selectedCategories}
        onToggle={(v) => setSelectedCategories((prev) => toggleInSet(prev, v))}
        labelPrefix="Filter category"
      />
      <CheckboxGroup
        title="Source type"
        values={sourceTypes}
        selected={selectedSourceTypes}
        onToggle={(v) => setSelectedSourceTypes((prev) => toggleInSet(prev, v))}
        labelPrefix="Filter source type"
      />
      <CheckboxGroup
        title="Verification level"
        values={verificationLevels}
        selected={selectedVerificationLevels}
        onToggle={(v) =>
          setSelectedVerificationLevels((prev) => toggleInSet(prev, v))
        }
        labelPrefix="Filter verification level"
      />

      <div className="mb-1">
        <h4 className="font-mono text-[10px] uppercase tracking-widest text-charcoal/60 mb-1">
          Date range
        </h4>
        <div className="flex gap-2">
          <label className="flex flex-col gap-0.5 flex-1 text-charcoal/70">
            <span className="font-mono text-[10px]">Start</span>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              aria-label="Filter start date"
              className="bg-bone border border-charcoal/20 rounded px-2 py-1 text-charcoal/80 focus:outline-none focus:border-trust"
            />
          </label>
          <label className="flex flex-col gap-0.5 flex-1 text-charcoal/70">
            <span className="font-mono text-[10px]">End</span>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              aria-label="Filter end date"
              className="bg-bone border border-charcoal/20 rounded px-2 py-1 text-charcoal/80 focus:outline-none focus:border-trust"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
