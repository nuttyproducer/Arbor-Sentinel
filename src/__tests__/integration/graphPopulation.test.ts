/**
 * Graph Population Integration Tests (M4.7-03).
 *
 * Verifies knowledge graph node/edge creation, schema validation, and entity resolution.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { GraphDB } from "../../lib/graph/GraphDB";
import { EntityResolver } from "../../lib/graph/EntityResolver";
import { schema } from "../../lib/graph/schema";
import type { GraphNode, GraphEdge, NodeType, EdgeType } from "../../lib/graph/types";

describe("Graph Population — Integration", () => {
  let graph: GraphDB;

  beforeEach(() => {
    graph = new GraphDB(schema);
  });

  // ── Node creation with schema-required properties ─────────────────────

  describe("node creation with required properties", () => {
    it("creates source nodes with publisher + sourceType", () => {
      const node: GraphNode = {
        id: "src-1",
        type: "source",
        label: "ICJ",
        properties: {
          publisher: "International Court of Justice",
          sourceType: "court",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      graph.addNode(node);
      expect(graph.getNode("src-1")?.type).toBe("source");
    });

    it("creates document nodes with title", () => {
      graph.addNode({
        id: "doc-1",
        type: "document",
        label: "ICJ Order",
        properties: { title: "ICJ Order of 15 June 2026" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(graph.getNode("doc-1")).toBeDefined();
    });

    it("creates entity nodes with canonicalName + entityType", () => {
      graph.addNode({
        id: "ent-1",
        type: "entity",
        label: "ICJ",
        properties: {
          canonicalName: "International Court of Justice",
          entityType: "organization",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(graph.getNode("ent-1")).toBeDefined();
    });

    it("creates event nodes with description + date", () => {
      graph.addNode({
        id: "evt-1",
        type: "event",
        label: "ICJ Ruling",
        properties: {
          description: "ICJ issued provisional measures ruling",
          date: "2026-06-15",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(graph.getNode("evt-1")?.type).toBe("event");
    });

    it("creates location nodes with name + locationType", () => {
      graph.addNode({
        id: "loc-1",
        type: "location",
        label: "Test Region",
        properties: {
          name: "Test Region",
          locationType: "region",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(graph.getNode("loc-1")).toBeDefined();
    });
  });

  // ── Edge creation with schema validation ───────────────────────────────

  describe("edge creation and schema validation", () => {
    it("creates valid edges between compatible node types", () => {
      graph.addNode({
        id: "doc-2", type: "document", label: "Report",
        properties: { title: "Test Report" },
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      });
      graph.addNode({
        id: "src-2", type: "source", label: "ICJ",
        properties: { publisher: "ICJ", sourceType: "court" },
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      });

      // published_by: document → source (valid)
      const edge: GraphEdge = {
        id: "e-1",
        type: "published_by",
        sourceId: "doc-2",
        targetId: "src-2",
        label: "Published by",
        properties: {},
        createdAt: new Date().toISOString(),
      };

      expect(() => graph.addEdge(edge)).not.toThrow();
    });

    it("rejects invalid edge types between incompatible nodes", () => {
      graph.addNode({
        id: "src-a", type: "source", label: "Court A",
        properties: { publisher: "Court A", sourceType: "court" },
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      });
      graph.addNode({
        id: "src-b", type: "source", label: "Court B",
        properties: { publisher: "Court B", sourceType: "court" },
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      });

      // mentions: source → source is NOT valid (requires document → *)
      const badEdge: GraphEdge = {
        id: "e-bad",
        type: "mentions" as EdgeType,
        sourceId: "src-a",
        targetId: "src-b",
        label: "Invalid",
        properties: {},
        createdAt: new Date().toISOString(),
      };

      expect(() => graph.addEdge(badEdge)).toThrow();
    });
  });

  // ── Entity resolution ──────────────────────────────────────────────────

  describe("entity resolution", () => {
    it("entity resolver initializes with graph", () => {
      graph.addNode({
        id: "ent-canon", type: "entity", label: "ICJ",
        properties: { canonicalName: "International Court of Justice", entityType: "organization" },
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      });

      const resolver = new EntityResolver(graph);
      expect(resolver).toBeDefined();
    });
  });
});
