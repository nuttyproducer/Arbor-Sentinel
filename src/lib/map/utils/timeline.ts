import type { MapFeature } from "../types";

/**
 * Filters features to those whose date falls within [start, end].
 * Features without a date are included (they could be any date).
 */
export function filterFeaturesByDateRange(
  features: MapFeature[],
  start: string,
  end: string,
): MapFeature[] {
  if (!start && !end) return features;

  return features.filter((f) => {
    if (!f.date) return true; // undated = could be any date, so include
    if (start && f.date < start) return false;
    if (end && f.date > end) return false;
    return true;
  });
}

/**
 * Returns the min and max dates across all features.
 * Ignores features without dates.
 */
export function getDateRange(
  features: MapFeature[],
): { min: string; max: string } {
  const dated = features.filter(
    (f): f is MapFeature & { date: string } => !!f.date,
  );
  if (dated.length === 0) {
    const now = new Date().toISOString().slice(0, 10);
    return { min: now, max: now };
  }

  let min = dated[0].date;
  let max = dated[0].date;

  for (const f of dated) {
    if (f.date < min) min = f.date;
    if (f.date > max) max = f.date;
  }

  return { min, max };
}

/**
 * Generates evenly spaced date steps between min and max.
 * Useful for timeline slider ticks.
 */
export function generateTimelineSteps(
  range: { min: string; max: string },
  steps: number,
): string[] {
  const minMs = new Date(range.min).getTime();
  const maxMs = new Date(range.max).getTime();
  const stepMs = (maxMs - minMs) / (steps - 1);

  return Array.from({ length: steps }, (_, i) => {
    const ms = minMs + stepMs * i;
    return new Date(ms).toISOString().slice(0, 10);
  });
}
