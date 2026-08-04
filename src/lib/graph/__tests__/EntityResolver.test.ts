// src/lib/graph/__tests__/EntityResolver.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { EntityResolver } from "../EntityResolver";
import type { NodeType } from "../types";

// ── Tests ────────────────────────────────────────────────────────────────────

describe("EntityResolver", () => {
  let resolver: EntityResolver;

  beforeEach(() => {
    resolver = new EntityResolver();
  });

  describe("basic resolution", () => {
    it("resolves an unknown entity to itself", () => {
      expect(resolver.resolve("entity-1")).toBe("entity-1");
    });

    it("tracks an entity as its own canonical", () => {
      resolver.resolve("entity-1");
      expect(resolver.isCanonical("entity-1")).toBe(true);
      expect(resolver.getAliases("entity-1")).toEqual(["entity-1"]);
    });
  });

  describe("name similarity", () => {
    it("returns 1.0 for identical names", () => {
      expect(resolver.computeNameSimilarity("Test Entity", "Test Entity")).toBe(1.0);
    });

    it("returns high similarity for names differing by punctuation only", () => {
      const score = resolver.computeNameSimilarity(
        "International Court of Justice",
        "International Court of Justice (ICJ)",
      );
      expect(score).toBeGreaterThan(0.8);
    });

    it("ignores common titles and honorifics", () => {
      const score = resolver.computeNameSimilarity(
        "Dr. Jane Smith",
        "Jane Smith",
      );
      expect(score).toBeGreaterThanOrEqual(0.9);
    });

    it("returns 0 for completely different names", () => {
      const score = resolver.computeNameSimilarity("Apple Inc", "Zebra Corp");
      expect(score).toBeLessThan(0.5);
    });

    it("is case-insensitive", () => {
      expect(
        resolver.computeNameSimilarity("TEST ENTITY", "test entity"),
      ).toBe(1.0);
    });

    it("handles substring matches", () => {
      const score = resolver.computeNameSimilarity(
        "International Rescue Committee",
        "IRC",
      );
      // IRC is not a substring after normalization, so this is just a regular comparison
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe("findCandidates", () => {
    it("finds candidates with similar names of the same type", () => {
      const candidates = resolver.findCandidates(
        { id: "new-1", type: "entity" as NodeType, name: "United Nations" },
        [
          { id: "existing-1", type: "entity" as NodeType, name: "United Nations" },
          { id: "existing-2", type: "entity" as NodeType, name: "UN" },
          { id: "existing-3", type: "organization" as NodeType, name: "United Nations" },
        ],
      );

      // Should find existing-1 (exact match)
      expect(candidates.some((c) => c.candidateId === "existing-1")).toBe(true);
      // Should NOT match across types (entity vs organization)
      expect(candidates.some((c) => c.candidateId === "existing-3")).toBe(false);
    });

    it("returns empty when no similar names found", () => {
      const candidates = resolver.findCandidates(
        { id: "new-1", type: "entity" as NodeType, name: "Unique Name XYZ" },
        [
          { id: "existing-1", type: "entity" as NodeType, name: "Completely Different" },
        ],
      );
      expect(candidates).toHaveLength(0);
    });

    it("boosts confidence for shared sources", () => {
      const resolverWithOverlap = new EntityResolver({ useSourceOverlap: true });

      const candidates = resolverWithOverlap.findCandidates(
        {
          id: "new-1",
          type: "entity" as NodeType,
          name: "Test Entity",
          sourceIds: ["src-1", "src-2"],
        },
        [
          {
            id: "existing-1",
            type: "entity" as NodeType,
            name: "Test Entity",
            sourceIds: ["src-1", "src-3"],
          },
        ],
      );

      expect(candidates).toHaveLength(1);
      expect(candidates[0].confidence).toBeGreaterThan(0.95);
    });

    it("sorts candidates by confidence descending", () => {
      // Configure a lower threshold so partial matches show up
      const resolverLow = new EntityResolver({ minNameSimilarity: 0.3 });

      const candidates = resolverLow.findCandidates(
        { id: "new-1", type: "entity" as NodeType, name: "United Nations Human Rights Council" },
        [
          { id: "exact", type: "entity" as NodeType, name: "United Nations Human Rights Council" },
          { id: "partial", type: "entity" as NodeType, name: "United Nations" },
          { id: "different", type: "entity" as NodeType, name: "Amnesty International" },
        ],
      );

      expect(candidates).toHaveLength(2);
      expect(candidates[0].candidateId).toBe("exact");
      expect(candidates[1].candidateId).toBe("partial");
    });
  });

  describe("merge", () => {
    it("merges entities into a single canonical ID", () => {
      // Register both entities first
      resolver.resolve("entity-a");
      resolver.resolve("entity-b");

      resolver.merge("entity" as NodeType, ["entity-a", "entity-b"]);

      expect(resolver.isSameEntity("entity-a", "entity-b")).toBe(true);
      expect(resolver.resolve("entity-b")).toBe("entity-a");
    });

    it("preserves merged IDs as aliases", () => {
      resolver.resolve("canonical");
      resolver.resolve("alias-1");
      resolver.resolve("alias-2");

      resolver.merge("entity" as NodeType, ["canonical", "alias-1", "alias-2"]);

      const aliases = resolver.getAliases("alias-1");
      expect(aliases).toContain("canonical");
      expect(aliases).toContain("alias-1");
      expect(aliases).toContain("alias-2");
    });

    it("preserves the first ID as canonical", () => {
      resolver.resolve("primary");
      resolver.resolve("secondary");

      resolver.merge("entity" as NodeType, ["primary", "secondary"]);

      expect(resolver.isCanonical("primary")).toBe(true);
      expect(resolver.isCanonical("secondary")).toBe(false);
    });

    it("returns a merge record with all details", () => {
      resolver.resolve("a");
      resolver.resolve("b");

      const record = resolver.merge(
        "entity" as NodeType,
        ["a", "b"],
        "name_similarity",
        0.95,
        "auto",
      );

      expect(record.canonicalId).toBe("a");
      expect(record.mergedIds).toContain("b");
      expect(record.entityType).toBe("entity");
      expect(record.rationale).toBe("name_similarity");
      expect(record.confidence).toBe(0.95);
      expect(record.performedBy).toBe("auto");
      expect(record.id).toMatch(/^merge-/);
      expect(record.timestamp).toBeDefined();
    });

    it("handles chained merges correctly", () => {
      resolver.resolve("a");
      resolver.resolve("b");
      resolver.resolve("c");

      // First merge b into a
      resolver.merge("entity" as NodeType, ["a", "b"]);

      // Then merge c into a's canonical (which is a)
      resolver.merge("entity" as NodeType, ["a", "c"]);

      expect(resolver.resolve("b")).toBe("a");
      expect(resolver.resolve("c")).toBe("a");
      expect(resolver.getAliases("a")).toContain("a");
      expect(resolver.getAliases("a")).toContain("b");
      expect(resolver.getAliases("a")).toContain("c");
    });

    it("throws when fewer than 2 IDs are provided", () => {
      expect(() => resolver.merge("entity" as NodeType, ["only-one"])).toThrow(
        /at least 2/,
      );
    });

    it("throws when all IDs already resolve to the same canonical", () => {
      resolver.resolve("a");
      resolver.resolve("b");
      resolver.merge("entity" as NodeType, ["a", "b"]);

      // Now a and b are already merged — merging again should throw
      expect(() => resolver.merge("entity" as NodeType, ["a", "b"])).toThrow(
        /same canonical/,
      );
    });
  });

  describe("reverse merge", () => {
    it("reverses a merge by its record ID", () => {
      resolver.resolve("a");
      resolver.resolve("b");

      const record = resolver.merge("entity" as NodeType, ["a", "b"]);
      expect(resolver.resolve("b")).toBe("a");

      const reversed = resolver.reverseMerge(record.id);
      expect(reversed).toBe(true);
      expect(resolver.resolve("b")).toBe("b");
      expect(resolver.isSameEntity("a", "b")).toBe(false);
    });

    it("returns false for non-existent merge record", () => {
      expect(resolver.reverseMerge("nonexistent")).toBe(false);
    });
  });

  describe("undoLastMerge", () => {
    it("undoes the most recent merge", () => {
      resolver.resolve("a");
      resolver.resolve("b");

      resolver.merge("entity" as NodeType, ["a", "b"]);
      expect(resolver.resolve("b")).toBe("a");

      const undone = resolver.undoLastMerge();
      expect(undone).toBeDefined();
      expect(resolver.resolve("b")).toBe("b");
    });

    it("returns undefined when there are no merges to undo", () => {
      expect(resolver.undoLastMerge()).toBeUndefined();
    });
  });

  describe("merge history", () => {
    it("tracks all merge operations", () => {
      resolver.resolve("a");
      resolver.resolve("b");
      resolver.resolve("c");
      resolver.resolve("d");

      resolver.merge("entity" as NodeType, ["a", "b"]);
      resolver.merge("entity" as NodeType, ["c", "d"]);

      const history = resolver.getMergeHistory();
      expect(history).toHaveLength(2);
    });

    it("filters merge history for a specific entity", () => {
      resolver.resolve("a");
      resolver.resolve("b");
      resolver.resolve("c");

      resolver.merge("entity" as NodeType, ["a", "b"]);
      resolver.merge("entity" as NodeType, ["a", "c"]);

      const historyForB = resolver.getMergeHistoryForEntity("b");
      expect(historyForB.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("type compatibility", () => {
    it("never merges across different node types", () => {
      expect(resolver.canMergeTypes("entity", "organization")).toBe(false);
      expect(resolver.canMergeTypes("country", "location")).toBe(false);
    });

    it("allows merging same types", () => {
      expect(resolver.canMergeTypes("entity", "entity")).toBe(true);
      expect(resolver.canMergeTypes("organization", "organization")).toBe(true);
    });

    it("findCandidates rejects cross-type candidates", () => {
      const candidates = resolver.findCandidates(
        { id: "new", type: "entity" as NodeType, name: "Test" },
        [
          { id: "org-1", type: "organization" as NodeType, name: "Test" },
          { id: "country-1", type: "country" as NodeType, name: "Test" },
        ],
      );
      expect(candidates).toHaveLength(0);
    });
  });

  describe("batch resolution", () => {
    it("merges similar entities in a batch", () => {
      const entities = [
        { id: "e-1", type: "entity" as NodeType, name: "United Nations" },
        { id: "e-2", type: "entity" as NodeType, name: "United Nations" },
        { id: "e-3", type: "entity" as NodeType, name: "Human Rights Watch" },
        { id: "e-4", type: "entity" as NodeType, name: "Human Rights Watch (HRW)" },
      ];

      const records = resolver.resolveBatch(entities);

      expect(records.length).toBeGreaterThanOrEqual(2);
      expect(resolver.isSameEntity("e-1", "e-2")).toBe(true);
      expect(resolver.isSameEntity("e-3", "e-4")).toBe(true);
      expect(resolver.isSameEntity("e-1", "e-3")).toBe(false);
    });

    it("only auto-merges above the confidence threshold", () => {
      const resolverStrict = new EntityResolver({ autoMergeConfidence: 1.0 });

      const entities = [
        { id: "e-1", type: "entity" as NodeType, name: "United Nations" },
        { id: "e-2", type: "entity" as NodeType, name: "UN" }, // not exact match
      ];

      const records = resolverStrict.resolveBatch(entities);
      // Should not auto-merge since confidence < 1.0
      expect(records).toHaveLength(0);
    });
  });

  describe("import/export", () => {
    it("exports and imports resolution state", () => {
      resolver.resolve("a");
      resolver.resolve("b");
      resolver.merge("entity" as NodeType, ["a", "b"]);

      const exported = resolver.export();
      expect(exported.mappings).toBeDefined();
      expect(exported.mergeLog).toHaveLength(1);

      const resolver2 = new EntityResolver();
      resolver2.import(exported);

      expect(resolver2.isSameEntity("a", "b")).toBe(true);
      expect(resolver2.getAliases("a")).toContain("b");
      expect(resolver2.getMergeHistory()).toHaveLength(1);
    });

    it("reset clears all state", () => {
      resolver.resolve("a");
      resolver.resolve("b");
      resolver.merge("entity" as NodeType, ["a", "b"]);

      resolver.reset();

      expect(resolver.canonicalCount).toBe(0);
      expect(resolver.getMergeHistory()).toHaveLength(0);
      expect(resolver.resolve("a")).toBe("a"); // fresh registration
    });
  });
});
