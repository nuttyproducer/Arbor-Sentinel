// src/components/map/MapSearch.tsx
import { useEffect, useMemo, useState } from "react";
import { useMapContext } from "./MapContext";
import { MapSearchResults } from "./MapSearchResults";
import type { MapFeature } from "../../lib/map/types";

interface MapSearchProps {
  features: MapFeature[];
  className?: string;
}

const DEBOUNCE_MS = 300;

/**
 * Case-insensitive fuzzy match. Returns true when every character of `query`
 * appears in `target` in order (a subsequence match), so typos and partial
 * terms still hit.
 */
function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (!q) return false;
  if (t.includes(q)) return true;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

export function MapSearch({ features, className = "" }: MapSearchProps) {
  const { map } = useMapContext();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce the raw input so filtering only happens after a pause in typing.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return features.filter(
      (f) =>
        fuzzyMatch(debouncedQuery, f.title) ||
        fuzzyMatch(debouncedQuery, f.description ?? "") ||
        fuzzyMatch(debouncedQuery, f.category)
    );
  }, [features, debouncedQuery]);

  const handleSelect = (feature: MapFeature) => {
    map?.panTo([feature.safeCoordinate.lon, feature.safeCoordinate.lat]);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search features…"
        aria-label="Search features"
        className="w-full bg-bone border border-charcoal/20 rounded-lg px-3 py-2 text-sm text-ink placeholder:text-charcoal/40 focus:outline-none focus:border-trust focus:ring-1 focus:ring-trust"
      />
      {results.length > 0 && (
        <MapSearchResults results={results} onSelect={handleSelect} />
      )}
    </div>
  );
}
