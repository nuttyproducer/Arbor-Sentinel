/**
 * Pure filtering utilities for the Evidence Library.
 *
 * These functions are testable independently of React rendering.
 * They encode the filter logic — what matches and what doesn't —
 * without any dependency on component state or DOM.
 */

import type { EvidenceItem, EvidenceCategory } from "../../data/evidenceItems";
import type { ContentStatus, VerificationLevel, SourceType } from "../../types/content";

export type FilterKey = "category" | "sourceType" | "verificationLevel" | "contentStatus";

export interface ActiveFilters {
  category: EvidenceCategory | null;
  sourceType: SourceType | null;
  verificationLevel: VerificationLevel | null;
  contentStatus: ContentStatus | null;
}

export const defaultFilters: ActiveFilters = {
  category: null,
  sourceType: null,
  verificationLevel: null,
  contentStatus: null,
};

/** Return items that match all active filters. */
export function filterItems(items: EvidenceItem[], filters: ActiveFilters): EvidenceItem[] {
  return items.filter((item) => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.sourceType && item.primarySourceType !== filters.sourceType) return false;
    if (filters.verificationLevel !== null && item.sourceQuality !== filters.verificationLevel) return false;
    if (filters.contentStatus && item.contentStatus !== filters.contentStatus) return false;
    return true;
  });
}

/** Whether any filter is active (not null). */
export function hasActiveFilters(filters: ActiveFilters): boolean {
  return (
    filters.category !== null ||
    filters.sourceType !== null ||
    filters.verificationLevel !== null ||
    filters.contentStatus !== null
  );
}

/** Count how many filters are active. */
export function activeFilterCount(filters: ActiveFilters): number {
  let count = 0;
  if (filters.category !== null) count++;
  if (filters.sourceType !== null) count++;
  if (filters.verificationLevel !== null) count++;
  if (filters.contentStatus !== null) count++;
  return count;
}
