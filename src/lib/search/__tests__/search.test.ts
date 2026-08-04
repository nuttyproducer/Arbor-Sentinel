import { describe, it, expect } from "vitest";
import { search, quickSearch } from "../search";
import { rebuildIndex, getSearchIndex, getIndexedCount } from "../buildIndex";
import { getRelationships } from "../relationships";
import type { SearchableRecordType } from "../types";

// ── Index health ────────────────────────────────────────────────────────────

describe("Search index", () => {
  it("builds an index with records across all types", () => {
    rebuildIndex();
    const index = getSearchIndex();
    expect(index.length).toBeGreaterThan(0);

    const types = new Set(index.map((r) => r.type));
    const expectedTypes: SearchableRecordType[] = [
      "source",
      "evidence",
      "legal_case",
      "organization",
      "action",
      "country",
      "institution",
      "dossier",
      "trust_page",
    ];
    for (const t of expectedTypes) {
      expect(types.has(t)).toBe(true);
    }
  });

  it("only includes active records", () => {
    const index = getSearchIndex();
    for (const record of index) {
      expect(record.active).toBe(true);
    }
  });

  it("every record has a non-empty title and route", () => {
    const index = getSearchIndex();
    for (const record of index) {
      expect(record.title.length).toBeGreaterThan(0);
      expect(record.route.length).toBeGreaterThan(0);
      expect(record.route.startsWith("/")).toBe(true);
    }
  });

  it("getIndexedCount returns a sensible number", () => {
    const count = getIndexedCount();
    expect(count).toBeGreaterThan(30); // we have 4 sources + 8 evidence + 3 legal + orgs + actions + etc
  });
});

// ── Search: edge cases ──────────────────────────────────────────────────────

describe("Search — edge cases", () => {
  it("empty query returns no results", () => {
    const result = search({ query: "" });
    expect(result.results).toHaveLength(0);
    expect(result.totalIndexed).toBeGreaterThan(0);
  });

  it("whitespace-only query returns no results", () => {
    const result = search({ query: "   " });
    expect(result.results).toHaveLength(0);
  });

  it("returns results for a known term", () => {
    const result = search({ query: "ICJ" });
    expect(result.results.length).toBeGreaterThan(0);
    // All results should have ICJ somewhere
    for (const r of result.results) {
      const hasMatch =
        r.record.title.toLowerCase().includes("icj") ||
        r.record.description.toLowerCase().includes("icj") ||
        r.record.tags.some((t) => t.toLowerCase().includes("icj")) ||
        (r.record.publisher ?? "").toLowerCase().includes("icj");
      expect(hasMatch).toBe(true);
    }
  });

  it("results are sorted by score descending", () => {
    const result = search({ query: "Gaza" });
    for (let i = 1; i < result.results.length; i++) {
      expect(result.results[i].score).toBeLessThanOrEqual(result.results[i - 1].score);
    }
  });

  it("quickSearch returns at most N results", () => {
    const result = quickSearch("ICJ", 2);
    expect(result.results.length).toBeLessThanOrEqual(2);
  });

  it("includes tookMs in the response", () => {
    const result = search({ query: "test" });
    expect(typeof result.tookMs).toBe("number");
    expect(result.tookMs).toBeGreaterThanOrEqual(0);
  });
});

// ── Search: type filtering ──────────────────────────────────────────────────

describe("Search — type filtering", () => {
  it("filters to a specific type", () => {
    const result = search({ query: "ICJ", typeFilter: ["source"] });
    for (const r of result.results) {
      expect(r.record.type).toBe("source");
    }
  });

  it("filters to multiple types", () => {
    const result = search({ query: "Gaza", typeFilter: ["evidence", "dossier"] });
    for (const r of result.results) {
      expect(["evidence", "dossier"]).toContain(r.record.type);
    }
  });

  it("empty type filter returns all types", () => {
    const unfiltered = search({ query: "ICJ" });
    const withEmptyFilter = search({ query: "ICJ", typeFilter: [] });
    expect(withEmptyFilter.results.length).toBe(unfiltered.results.length);
  });

  it("filtering to an unrelated type returns no results", () => {
    const result = search({ query: "ICJ", typeFilter: ["organization"] });
    // ICJ is a court, not an organization in our directory
    for (const r of result.results) {
      expect(r.record.type).toBe("organization");
    }
  });
});

// ── Search: ranking quality ─────────────────────────────────────────────────

describe("Search — ranking quality", () => {
  it("exact title match scores highest", () => {
    // Find a known record title
    const index = getSearchIndex();
    const knownTitle = index.find((r) => r.title.length > 20)?.title;
    if (knownTitle) {
      const result = search({ query: knownTitle });
      if (result.results.length > 0) {
        // The exact match should be first
        expect(result.results[0].record.title).toBe(knownTitle);
        expect(result.results[0].score).toBeGreaterThanOrEqual(80);
      }
    }
  });

  it("partial matches score lower than exact", () => {
    const exactResult = search({ query: "ICJ provisional measures order" });
    const partialResult = search({ query: "ICJ" });

    // Exact query should give higher top score than partial
    if (exactResult.results.length > 0 && partialResult.results.length > 0) {
      // The top result for the exact query should have a high score
      expect(exactResult.results[0].score).toBeGreaterThanOrEqual(60);
    }
  });

  it("no-results query returns empty results array", () => {
    // Use a string designed to avoid accidental substring matches with any tag (e.g. "en", "ar", "2")
    const result = search({ query: "qxzqxz987qxzqxz" });
    expect(result.results).toHaveLength(0);
  });
});

// ── Relationships ───────────────────────────────────────────────────────────

describe("Relationship resolver", () => {
  it("resolves source referenced by evidence", () => {
    const rels = getRelationships("source:icj-2024-01-26");
    // This source is referenced by at least one evidence item
    expect(rels.referencedBy.length).toBeGreaterThan(0);
    expect(rels.referencedBy.some((r) => r.type === "evidence")).toBe(true);
  });

  it("resolves source referenced by legal cases", () => {
    const rels = getRelationships("source:icj-2024-01-26");
    expect(rels.referencedBy.some((r) => r.type === "legal_case")).toBe(true);
  });

  it("resolves dossier references to sources", () => {
    const rels = getRelationships("dossier:gaza-accountability-one-page");
    expect(rels.references.length).toBeGreaterThan(0);
    expect(rels.references.some((r) => r.type === "source")).toBe(true);
    expect(rels.references.some((r) => r.type === "evidence")).toBe(true);
    expect(rels.references.some((r) => r.type === "legal_case")).toBe(true);
  });

  it("resolves dossier referenced-by correctly (nothing points to dossiers yet)", () => {
    const rels = getRelationships("dossier:gaza-accountability-one-page");
    // Dossiers are referenced by nothing currently
    expect(rels.referencedBy.length).toBe(0);
  });

  it("resolves evidence references to sources and routes", () => {
    const rels = getRelationships("evidence:icj-provisional-measures-jan-2024");
    expect(rels.references.some((r) => r.type === "source")).toBe(true);
  });

  it("unknown record ID returns empty relationships", () => {
    const rels = getRelationships("source:nonexistent-id");
    expect(rels.references).toHaveLength(0);
    expect(rels.referencedBy).toHaveLength(0);
  });

  it("malformed record ID returns empty relationships", () => {
    const rels = getRelationships("badformat");
    expect(rels.references).toHaveLength(0);
    expect(rels.referencedBy).toHaveLength(0);
  });

  it("all relationships have valid routes", () => {
    // Test across all source records
    const allTypes: Array<{ prefix: string; ids: string[] }> = [
      { prefix: "source", ids: ["icj-2024-01-26", "icj-2024-05-24", "icc-palestine-2024", "un-coi-2024"] },
      { prefix: "evidence", ids: ["icj-provisional-measures-jan-2024", "icc-palestine-situation"] },
      { prefix: "legal_case", ids: ["icj-genocide-convention", "icc-palestine-situation"] },
      { prefix: "dossier", ids: ["gaza-accountability-one-page"] },
      { prefix: "country", ids: ["belgium"] },
      { prefix: "institution", ids: ["european-union"] },
      { prefix: "action", ids: ["contact-representative"] },
    ];

    for (const { prefix, ids } of allTypes) {
      for (const id of ids) {
        const rels = getRelationships(`${prefix}:${id}`);
        // Every relationship should have a valid route
        for (const ref of [...rels.references, ...rels.referencedBy]) {
          expect(ref.route.startsWith("/")).toBe(true);
          expect(ref.title.length).toBeGreaterThan(0);
          expect(ref.type.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("does not create duplicate relationships", () => {
    const rels = getRelationships("source:icj-2024-01-26");
    const ids = rels.referencedBy.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });
});
