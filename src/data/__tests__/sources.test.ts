import { describe, it, expect } from "vitest";
import { sources, getSourceById, getSourceBySlug, getAvailableSourceTypes, getAvailableJurisdictions, getAvailableDocumentTypes } from "../sources";
import { evidenceItems } from "../evidenceItems";
import { legalCases } from "../legalCases";
import { organizationRecords } from "../organizations";

describe("Source registry", () => {
  // ── Lookup ────────────────────────────────────────────────────────────
  it("getSourceById returns the correct source", () => {
    const src = getSourceById("icj-2024-01-26");
    expect(src).toBeDefined();
    expect(src!.title).toContain("26 January 2024");
    expect(src!.publisher).toBe("International Court of Justice");
  });

  it("getSourceById returns undefined for non-existent id", () => {
    expect(getSourceById("non-existent-source")).toBeUndefined();
  });

  it("getSourceBySlug returns the correct source", () => {
    const src = getSourceBySlug("icj-provisional-measures-jan-2024");
    expect(src).toBeDefined();
    expect(src!.id).toBe("icj-2024-01-26");
  });

  it("getSourceBySlug returns undefined for non-existent slug", () => {
    expect(getSourceBySlug("non-existent-slug")).toBeUndefined();
  });

  // ── Duplicate detection ───────────────────────────────────────────────
  it("has no duplicate source ids", () => {
    const ids = sources.map((s) => s.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    expect(duplicates).toEqual([]);
  });

  it("has no duplicate source slugs", () => {
    const slugs = sources.map((s) => s.slug);
    const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
    expect(duplicates).toEqual([]);
  });

  it("has no duplicate source URLs", () => {
    const urls = sources.map((s) => s.url);
    const duplicates = urls.filter((url, index) => urls.indexOf(url) !== index);
    expect(duplicates).toEqual([]);
  });

  // ── Completeness ──────────────────────────────────────────────────────
  it("every source has a non-empty title", () => {
    for (const src of sources) {
      expect(src.title, `Source ${src.id} has empty title`).toBeTruthy();
    }
  });

  it("every source has a non-empty URL", () => {
    for (const src of sources) {
      expect(src.url, `Source ${src.id} has empty URL`).toBeTruthy();
    }
  });

  it("every source has a valid URL starting with https://", () => {
    for (const src of sources) {
      expect(src.url, `Source ${src.id} URL does not start with https://: ${src.url}`)
        .toMatch(/^https:\/\//);
    }
  });

  it("every source has a publisher", () => {
    for (const src of sources) {
      expect(src.publisher, `Source ${src.id} has empty publisher`).toBeTruthy();
    }
  });

  it("every source has an accessedAt date", () => {
    for (const src of sources) {
      expect(src.accessedAt, `Source ${src.id} has empty accessedAt`).toBeTruthy();
    }
  });

  it("accessedAt dates are in ISO format (YYYY-MM-DD)", () => {
    for (const src of sources) {
      expect(src.accessedAt, `Source ${src.id} accessedAt is not ISO date: ${src.accessedAt}`)
        .toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("every source has a valid sourceType", () => {
    const validTypes = ["court", "un", "government", "humanitarian", "ngo", "academic", "journalism", "osint"];
    for (const src of sources) {
      expect(validTypes, `Source ${src.id} has invalid sourceType: ${src.sourceType}`)
        .toContain(src.sourceType);
    }
  });

  it("every source has a valid status", () => {
    const validStatuses = ["active", "broken", "archived", "superseded"];
    for (const src of sources) {
      expect(validStatuses, `Source ${src.id} has invalid status: ${src.status}`)
        .toContain(src.status);
    }
  });

  it("every source has a correctionUrl", () => {
    for (const src of sources) {
      expect(src.correctionUrl, `Source ${src.id} has empty correctionUrl`).toBeTruthy();
    }
  });

  it("every source has a version >= 1", () => {
    for (const src of sources) {
      expect(src.version, `Source ${src.id} has version < 1`).toBeGreaterThanOrEqual(1);
    }
  });

  // ── No dead links recorded as active ──────────────────────────────────
  it("no source has status 'broken' or 'superseded' without notes", () => {
    for (const src of sources) {
      if (src.status === "broken" || src.status === "superseded") {
        expect(src.notes, `Source ${src.id} is ${src.status} but has no notes explaining why`)
          .toBeTruthy();
      }
    }
  });

  // ── Filter helpers ────────────────────────────────────────────────────
  it("getAvailableSourceTypes returns sorted unique types", () => {
    const types = getAvailableSourceTypes();
    expect(types.length).toBeGreaterThan(0);
    // Verify sorted
    for (let i = 1; i < types.length; i++) {
      expect(types[i] >= types[i - 1]).toBe(true);
    }
  });

  it("getAvailableJurisdictions returns sorted unique jurisdictions", () => {
    const jurisdictions = getAvailableJurisdictions();
    expect(jurisdictions.length).toBeGreaterThan(0);
    // Verify sorted
    for (let i = 1; i < jurisdictions.length; i++) {
      expect(jurisdictions[i] >= jurisdictions[i - 1]).toBe(true);
    }
  });

  it("getAvailableDocumentTypes returns sorted unique document types", () => {
    const docTypes = getAvailableDocumentTypes();
    expect(docTypes.length).toBeGreaterThan(0);
    // Verify sorted
    for (let i = 1; i < docTypes.length; i++) {
      expect(docTypes[i] >= docTypes[i - 1]).toBe(true);
    }
  });

  // ── Reference integrity ───────────────────────────────────────────────
  it("every source ID referenced by evidence items exists in the registry", () => {
    const sourceIds = new Set(sources.map((s) => s.id));
    for (const item of evidenceItems) {
      for (const sid of item.sourceIds) {
        expect(sourceIds.has(sid),
          `Evidence item "${item.slug}" references non-existent source "${sid}"`
        ).toBe(true);
      }
    }
  });

  it("every source ID referenced by legal cases exists in the registry", () => {
    const sourceIds = new Set(sources.map((s) => s.id));
    for (const legalCase of legalCases) {
      for (const sid of legalCase.sourceIds) {
        expect(sourceIds.has(sid),
          `Legal case "${legalCase.slug}" references non-existent source "${sid}"`
        ).toBe(true);
      }
    }
  });

  it("every source ID referenced by organizations exists in the registry", () => {
    const sourceIds = new Set(sources.map((s) => s.id));
    for (const org of organizationRecords) {
      for (const sid of org.sourceIds) {
        expect(sourceIds.has(sid),
          `Organization "${org.slug}" references non-existent source "${sid}"`
        ).toBe(true);
      }
    }
  });

  // ── Evidence items: no empty sourceIds ────────────────────────────────
  it("every evidence item has at least one source", () => {
    for (const item of evidenceItems) {
      expect(item.sourceIds.length, `Evidence item "${item.slug}" has empty sourceIds`)
        .toBeGreaterThan(0);
    }
  });

  // ── Organizations: no empty sourceIds ──────────────────────────────────
  it("every organization has at least one source", () => {
    for (const org of organizationRecords) {
      expect(org.sourceIds.length, `Organization "${org.slug}" has empty sourceIds`)
        .toBeGreaterThan(0);
    }
  });

  // ── Legal cases: no empty sourceIds ────────────────────────────────────
  it("every legal case has at least one source", () => {
    for (const legalCase of legalCases) {
      expect(legalCase.sourceIds.length, `Legal case "${legalCase.slug}" has empty sourceIds`)
        .toBeGreaterThan(0);
    }
  });
});
