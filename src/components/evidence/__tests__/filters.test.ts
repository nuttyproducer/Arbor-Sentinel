import { describe, it, expect } from "vitest";
import { filterItems, hasActiveFilters, activeFilterCount, defaultFilters } from "../filters";
import type { ActiveFilters } from "../filters";
import type { EvidenceItem } from "../../../data/evidenceItems";

const mockItems: EvidenceItem[] = [
  {
    id: "court-1",
    slug: "court-1",
    title: "Court Record",
    summary: "A court record.",
    category: "court record",
    sourceIds: ["src-1"],
    primarySourceType: "court",
    sourceQuality: 5,
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
    tags: [],
    relatedRoutes: [],
  },
  {
    id: "un-1",
    slug: "un-1",
    title: "UN Document",
    summary: "A UN document.",
    category: "official UN document",
    sourceIds: [],
    primarySourceType: "un",
    sourceQuality: 4,
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
    tags: [],
    relatedRoutes: [],
  },
  {
    id: "humanitarian-1",
    slug: "humanitarian-1",
    title: "Humanitarian Update",
    summary: "A humanitarian update.",
    category: "humanitarian update",
    sourceIds: [],
    primarySourceType: "humanitarian",
    sourceQuality: 3,
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
    tags: [],
    relatedRoutes: [],
  },
];

describe("filterItems", () => {
  it("returns all items with default (empty) filters", () => {
    expect(filterItems(mockItems, defaultFilters)).toHaveLength(3);
  });

  it("filters by category", () => {
    const filters: ActiveFilters = { ...defaultFilters, category: "court record" };
    const result = filterItems(mockItems, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("court-1");
  });

  it("filters by source type", () => {
    const filters: ActiveFilters = { ...defaultFilters, sourceType: "un" };
    const result = filterItems(mockItems, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("un-1");
  });

  it("filters by verification level", () => {
    const filters: ActiveFilters = { ...defaultFilters, verificationLevel: 5 };
    const result = filterItems(mockItems, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("court-1");
  });

  it("filters by content status", () => {
    const filters: ActiveFilters = { ...defaultFilters, contentStatus: "review_pending" };
    const result = filterItems(mockItems, filters);
    expect(result).toHaveLength(2);
  });

  it("combines multiple filters", () => {
    const filters: ActiveFilters = {
      ...defaultFilters,
      category: "humanitarian update",
      contentStatus: "review_pending",
    };
    const result = filterItems(mockItems, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("humanitarian-1");
  });

  it("returns empty array when no items match", () => {
    const filters: ActiveFilters = { ...defaultFilters, category: "human-rights report" };
    expect(filterItems(mockItems, filters)).toHaveLength(0);
  });
});

describe("hasActiveFilters", () => {
  it("returns false for default filters", () => {
    expect(hasActiveFilters(defaultFilters)).toBe(false);
  });

  it("returns true when any filter is set", () => {
    expect(hasActiveFilters({ ...defaultFilters, category: "court record" })).toBe(true);
    expect(hasActiveFilters({ ...defaultFilters, sourceType: "court" })).toBe(true);
    expect(hasActiveFilters({ ...defaultFilters, verificationLevel: 3 })).toBe(true);
    expect(hasActiveFilters({ ...defaultFilters, contentStatus: "reviewed" })).toBe(true);
  });
});

describe("activeFilterCount", () => {
  it("returns 0 for default filters", () => {
    expect(activeFilterCount(defaultFilters)).toBe(0);
  });

  it("counts active filters", () => {
    const filters: ActiveFilters = {
      category: "court record",
      sourceType: "court",
      verificationLevel: null,
      contentStatus: null,
    };
    expect(activeFilterCount(filters)).toBe(2);
  });

  it("counts all four when all set", () => {
    const filters: ActiveFilters = {
      category: "court record",
      sourceType: "court",
      verificationLevel: 5,
      contentStatus: "reviewed",
    };
    expect(activeFilterCount(filters)).toBe(4);
  });
});
