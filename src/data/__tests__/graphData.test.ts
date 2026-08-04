// src/data/__tests__/graphData.test.ts
// Validates the static knowledge-graph seed data: every node/edge must ingest
// into GraphDB without schema validation errors so the explore routes render.

import { describe, it, expect } from "vitest";
import { graphNodes, graphEdges } from "../graphData";
import { GraphDB } from "../../lib/graph/GraphDB";

describe("graphData", () => {
  it("produces at least one node and one edge", () => {
    expect(graphNodes.length).toBeGreaterThan(0);
    expect(graphEdges.length).toBeGreaterThan(0);
  });

  it("every node ingests into GraphDB without schema errors", () => {
    const db = new GraphDB();
    let errors = 0;
    for (const n of graphNodes) {
      try {
        db.addNode(n);
      } catch {
        errors += 1;
      }
    }
    expect(errors).toBe(0);
    expect(db.nodeCount).toBe(graphNodes.length);
  });

  it("every edge ingests into GraphDB without schema errors", () => {
    const db = new GraphDB();
    for (const n of graphNodes) {
      try {
        db.addNode(n);
      } catch {
        // Node errors are covered by the test above; skip for edge validation.
      }
    }
    let errors = 0;
    for (const e of graphEdges) {
      try {
        db.addEdge(e);
      } catch {
        errors += 1;
      }
    }
    expect(errors).toBe(0);
  });

  it("node ids are unique", () => {
    const ids = new Set(graphNodes.map((n) => n.id));
    expect(ids.size).toBe(graphNodes.length);
  });

  it("edge endpoints reference existing nodes", () => {
    const nodeIds = new Set(graphNodes.map((n) => n.id));
    for (const e of graphEdges) {
      expect(nodeIds.has(e.sourceId)).toBe(true);
      expect(nodeIds.has(e.targetId)).toBe(true);
    }
  });
});
