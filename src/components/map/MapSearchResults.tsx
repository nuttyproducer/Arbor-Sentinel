// src/components/map/MapSearchResults.tsx
import type { MapFeature } from "../../lib/map/types";

interface MapSearchResultsProps {
  results: MapFeature[];
  onSelect: (feature: MapFeature) => void;
  className?: string;
}

/**
 * Renders a flat list of matching features. Each item is a clickable option
 * showing the feature title, a category badge, and its date.
 */
export function MapSearchResults({
  results,
  onSelect,
  className = "",
}: MapSearchResultsProps) {
  if (results.length === 0) return null;

  return (
    <ul
      role="listbox"
      aria-label="Search results"
      className={`bg-bone/95 border border-charcoal/20 rounded-lg mt-2 divide-y divide-charcoal/10 max-h-64 overflow-y-auto ${className}`}
    >
      {results.map((f) => (
        <li key={f.id}>
          <button
            role="option"
            aria-label={f.title}
            onClick={() => onSelect(f)}
            className="w-full text-left px-3 py-2 hover:bg-paper transition-colors"
          >
            <span className="block text-sm text-ink font-serif font-semibold leading-tight">
              {f.title}
            </span>
            <span className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[10px] uppercase tracking-wider bg-charcoal/5 text-charcoal/70 rounded px-1.5 py-0.5">
                {f.category}
              </span>
              {f.date && (
                <span className="font-mono text-[10px] text-charcoal/50">
                  {f.date}
                </span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
