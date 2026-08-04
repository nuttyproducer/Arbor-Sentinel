// src/lib/graph/__tests__/GraphDB.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { GraphDB } from "../GraphDB";
import type { GraphNode, GraphEdge, NodeType, EdgeType } from "../types";
import { EDGE_TYPE_ALLOWED_PAIRS } from "../types";

// ── Test helpers ────────────────────────────────────────────────────────────

function makeEdge(overrides: Partial<GraphEdge> = {}): GraphEdge {
  return {
    id: "edge-1",
    type: "mentions" as EdgeType,
    sourceId: "doc-1",
    targetId: "entity-1",
    label: "Mentions",
    properties: {},
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeNodeOfType(id: string, type: NodeType, label: string, extraProps: Record<string, unknown> = {}): GraphNode {
  const now = new Date().toISOString();
  const baseProps: Record<string, Record<string, unknown>> = {
    source: { publisher: "Test Publisher", sourceType: "ngo" },
    document: { title: label, contentType: "article" },
    entity: { canonicalName: label, entityType: "organization" },
    event: { description: label, date: "2026-01-15" },
    location: { name: label, locationType: "city" },
    claim: { claimText: label, claimType: "factual" },
    country: { name: label },
    institution: { name: label },
    organization: { name: label },
    action: { name: label, actionType: "contact_representative" },
  };

  return {
    id,
    type,
    label,
    properties: { ...(baseProps[type] ?? {}), ...extraProps },
    createdAt: now,
    updatedAt: now,
  };
}

// ── Node CRUD tests ─────────────────────────────────────────────────────────

describe("GraphDB — Node CRUD", () => {
  let db: GraphDB;

  beforeEach(() => {
    db = new GraphDB();
  });

  describe("addNode", () => {
    it("adds a node and retrieves it by ID", () => {
      const node = makeNodeOfType("entity-1", "entity", "Test Entity");
      db.addNode(node);
      expect(db.getNode("entity-1")).toEqual(node);
      expect(db.hasNode("entity-1")).toBe(true);
      expect(db.nodeCount).toBe(1);
    });

    it("throws when adding a node with a duplicate ID", () => {
      const node = makeNodeOfType("entity-1", "entity", "First");
      db.addNode(node);
      expect(() => db.addNode(makeNodeOfType("entity-1", "entity", "Second"))).toThrow(
        /already exists/,
      );
    });

    it("rejects a node with missing required properties", () => {
      const node = makeNodeOfType("entity-1", "entity", "Bad Entity");
      node.properties = { canonicalName: "Bad" }; // missing entityType
      expect(() => db.addNode(node)).toThrow(/Node validation failed/);
    });

    it("rejects a node with wrong property types", () => {
      const node = makeNodeOfType("entity-1", "entity", "Bad Entity");
      node.properties = { canonicalName: 123, entityType: "org" }; // canonicalName should be string
      expect(() => db.addNode(node)).toThrow(/Node validation failed/);
    });

    it("accepts nodes with optional properties omitted", () => {
      const node: GraphNode = {
        id: "src-1",
        type: "source",
        label: "Test Source",
        properties: { publisher: "Test Pub", sourceType: "ngo" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(() => db.addNode(node)).not.toThrow();
      expect(db.getNode("src-1")).toBeDefined();
    });
  });

  describe("updateNode", () => {
    it("updates a node's label and properties", () => {
      const node = makeNodeOfType("entity-1", "entity", "Original", {
        canonicalName: "Original",
        entityType: "person",
      });
      db.addNode(node);

      const updated = db.updateNode("entity-1", {
        label: "Updated",
        properties: { role: "Director" },
      });

      expect(updated.label).toBe("Updated");
      expect(updated.properties.role).toBe("Director");
      expect(updated.properties.canonicalName).toBe("Original"); // preserved
    });

    it("throws when updating a non-existent node", () => {
      expect(() => db.updateNode("nonexistent", { label: "New" })).toThrow(/not found/);
    });

    it("rejects updates that violate the property schema", () => {
      const node = makeNodeOfType("entity-1", "entity", "Entity", {
        canonicalName: "Entity",
        entityType: "person",
      });
      db.addNode(node);

      // Remove a required property
      expect(() =>
        db.updateNode("entity-1", {
          properties: { canonicalName: undefined },
        }),
      ).toThrow(); // canonicalName is required
    });
  });

  describe("deleteNode", () => {
    it("deletes a node and returns it", () => {
      const node = makeNodeOfType("entity-1", "entity", "To Delete");
      db.addNode(node);
      const deleted = db.deleteNode("entity-1");

      expect(deleted).toEqual(node);
      expect(db.hasNode("entity-1")).toBe(false);
      expect(db.nodeCount).toBe(0);
    });

    it("returns undefined for non-existent node", () => {
      expect(db.deleteNode("nonexistent")).toBeUndefined();
    });

    it("removes incident edges when a node is deleted", () => {
      const doc = makeNodeOfType("doc-1", "document", "Test Doc");
      const entity = makeNodeOfType("entity-1", "entity", "Test Entity");
      db.addNode(doc);
      db.addNode(entity);

      const edge = makeEdge({ id: "e-1", sourceId: "doc-1", targetId: "entity-1" });
      db.addEdge(edge);

      expect(db.edgeCount).toBe(1);
      db.deleteNode("entity-1");
      expect(db.edgeCount).toBe(0);
    });
  });
});

// ── Edge CRUD tests ─────────────────────────────────────────────────────────

describe("GraphDB — Edge CRUD", () => {
  let db: GraphDB;

  beforeEach(() => {
    db = new GraphDB();
    // Set up nodes for edge tests
    db.addNode(makeNodeOfType("doc-1", "document", "Test Document"));
    db.addNode(makeNodeOfType("entity-1", "entity", "Test Entity"));
    db.addNode(makeNodeOfType("evt-1", "event", "Test Event"));
    db.addNode(makeNodeOfType("loc-1", "location", "Test Location"));
    db.addNode(makeNodeOfType("src-1", "source", "Test Source"));
    db.addNode(makeNodeOfType("claim-1", "claim", "Test Claim"));
  });

  describe("addEdge", () => {
    it("adds an edge and retrieves it", () => {
      const edge = makeEdge({ id: "e-1", sourceId: "doc-1", targetId: "entity-1" });
      db.addEdge(edge);
      expect(db.getEdge("e-1")).toEqual(edge);
      expect(db.edgeCount).toBe(1);
    });

    it("throws for duplicate edge ID", () => {
      db.addEdge(makeEdge({ id: "e-1", sourceId: "doc-1", targetId: "entity-1" }));
      expect(() =>
        db.addEdge(makeEdge({ id: "e-1", sourceId: "doc-1", targetId: "entity-1" })),
      ).toThrow(/already exists/);
    });

    it("throws when source node does not exist", () => {
      const edge = makeEdge({ sourceId: "nonexistent", targetId: "entity-1" });
      expect(() => db.addEdge(edge)).toThrow(/Source node/);
    });

    it("throws when target node does not exist", () => {
      const edge = makeEdge({ sourceId: "doc-1", targetId: "nonexistent" });
      expect(() => db.addEdge(edge)).toThrow(/Target node/);
    });

    it("rejects invalid edge type for the node pair", () => {
      // authored_by expects document -> entity, not entity -> document
      const edge: GraphEdge = {
        id: "e-bad",
        type: "authored_by",
        sourceId: "entity-1",
        targetId: "doc-1",
        label: "Authored by",
        properties: {},
        createdAt: new Date().toISOString(),
      };
      expect(() => db.addEdge(edge)).toThrow(/Edge validation failed/);
    });

    it("accepts valid edge types for correct node pairs", () => {
      // occurs_at: event -> location
      const edge: GraphEdge = {
        id: "e-ok",
        type: "occurs_at",
        sourceId: "evt-1",
        targetId: "loc-1",
        label: "Occurs at",
        properties: {},
        createdAt: new Date().toISOString(),
      };
      expect(() => db.addEdge(edge)).not.toThrow();
    });
  });

  describe("updateEdge", () => {
    it("updates an edge's weight and properties", () => {
      const edge = makeEdge({ id: "e-1", sourceId: "doc-1", targetId: "entity-1" });
      db.addEdge(edge);

      const updated = db.updateEdge("e-1", { weight: 0.85, label: "Updated" });
      expect(updated.weight).toBe(0.85);
      expect(updated.label).toBe("Updated");
    });

    it("throws for non-existent edge", () => {
      expect(() => db.updateEdge("nonexistent", { label: "Nope" })).toThrow(/not found/);
    });
  });

  describe("deleteEdge", () => {
    it("deletes an edge", () => {
      const edge = makeEdge({ id: "e-1", sourceId: "doc-1", targetId: "entity-1" });
      db.addEdge(edge);
      db.deleteEdge("e-1");
      expect(db.hasEdge("e-1")).toBe(false);
      expect(db.edgeCount).toBe(0);
    });

    it("returns undefined for non-existent edge", () => {
      expect(db.deleteEdge("nonexistent")).toBeUndefined();
    });
  });
});

// ── Query tests ─────────────────────────────────────────────────────────────

describe("GraphDB — Queries", () => {
  let db: GraphDB;

  beforeEach(() => {
    db = new GraphDB();

    // Add various nodes
    db.addNode(makeNodeOfType("doc-1", "document", "Document Alpha"));
    db.addNode(makeNodeOfType("doc-2", "document", "Document Beta"));
    db.addNode(makeNodeOfType("entity-1", "entity", "Entity One"));
    db.addNode(makeNodeOfType("entity-2", "entity", "Entity Two"));
    db.addNode(makeNodeOfType("evt-1", "event", "Event Alpha"));
    db.addNode(makeNodeOfType("src-1", "source", "Source One", { trustLevel: 5 }));
    db.addNode(makeNodeOfType("src-2", "source", "Source Two", { trustLevel: 3 }));

    // Add edges
    db.addEdge(makeEdge({ id: "e-1", type: "mentions", sourceId: "doc-1", targetId: "entity-1" }));
    db.addEdge(makeEdge({ id: "e-2", type: "mentions", sourceId: "doc-1", targetId: "entity-2" }));
    db.addEdge(makeEdge({ id: "e-3", type: "published_by", sourceId: "doc-1", targetId: "src-1" }));
    db.addEdge(makeEdge({ id: "e-4", type: "published_by", sourceId: "doc-2", targetId: "src-2" }));
    db.addEdge(makeEdge({ id: "e-5", type: "mentions", sourceId: "doc-2", targetId: "entity-1" }));
  });

  describe("findNodes", () => {
    it("finds all nodes when no filter is given", () => {
      const nodes = db.findNodes();
      expect(nodes).toHaveLength(7);
    });

    it("filters nodes by type", () => {
      const docs = db.findNodes({ types: ["document"] });
      expect(docs).toHaveLength(2);
      expect(docs.every((n) => n.type === "document")).toBe(true);
    });

    it("filters nodes by multiple types", () => {
      const nodes = db.findNodes({ types: ["document", "entity"] });
      expect(nodes).toHaveLength(4);
    });

    it("filters by label substring (case-insensitive)", () => {
      const nodes = db.findNodes({ labelContains: "alpha" });
      expect(nodes).toHaveLength(2); // Document Alpha, Event Alpha
    });

    it("filters by property value", () => {
      const nodes = db.findNodes({
        propertyFilters: [{ key: "trustLevel", value: 5, operator: "gte" }],
      });
      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe("src-1");
    });

    it("supports pagination with offset and limit", () => {
      const nodes = db.findNodes({ limit: 2 });
      expect(nodes).toHaveLength(2);

      const paged = db.findNodes({ offset: 2, limit: 2 });
      expect(paged).toHaveLength(2);
      expect(paged[0].id).not.toBe(nodes[0].id);
    });
  });

  describe("findEdges", () => {
    it("finds all edges when no filter is given", () => {
      const edges = db.findEdges();
      expect(edges).toHaveLength(5);
    });

    it("filters edges by type", () => {
      const mentions = db.findEdges({ types: ["mentions"] });
      expect(mentions).toHaveLength(3);
    });

    it("filters edges by source node", () => {
      const fromDoc1 = db.findEdges({ sourceId: "doc-1" });
      expect(fromDoc1).toHaveLength(3);
    });

    it("filters edges by target node", () => {
      const toEntity1 = db.findEdges({ targetId: "entity-1" });
      expect(toEntity1).toHaveLength(2);
    });

    it("filters edges incident to a node", () => {
      const incident = db.findEdges({ incidentTo: "entity-1" });
      expect(incident).toHaveLength(2);
    });
  });

  describe("graph traversal query", () => {
    it("traverses from nodes matching a filter through edges", () => {
      const result = db.query({
        nodeFilter: { types: ["document"] },
        maxDepth: 1,
        direction: "outgoing",
      });
      // doc-1 connects to entity-1, entity-2, src-1; doc-2 connects to src-2, entity-1
      expect(result.nodes.length).toBeGreaterThanOrEqual(5);
      expect(result.edges.length).toBeGreaterThanOrEqual(5);
    });

    it("respects edge type filter in traversal", () => {
      const result = db.query({
        nodeFilter: { types: ["document"] },
        edgeTypes: ["published_by"],
        maxDepth: 1,
        direction: "outgoing",
      });
      // Should only traverse published_by edges
      const publishedEdges = result.edges.filter((e) => e.type === "published_by");
      expect(publishedEdges).toHaveLength(2);
    });
  });
});

// ── Path finding tests ──────────────────────────────────────────────────────

describe("GraphDB — Path Finding", () => {
  let db: GraphDB;

  beforeEach(() => {
    db = new GraphDB();

    // Create a simple graph for path finding:
    // doc-1 --mentions--> entity-1 --located_in--> loc-1
    //                                              ^
    // evt-1 --occurs_at----------------------------|

    db.addNode(makeNodeOfType("doc-1", "document", "Document"));
    db.addNode(makeNodeOfType("entity-1", "entity", "Entity One", {
      canonicalName: "Entity One",
      entityType: "organization",
    }));
    db.addNode(makeNodeOfType("loc-1", "location", "Location Alpha"));
    db.addNode(makeNodeOfType("evt-1", "event", "Test Event"));

    db.addEdge({
      id: "e-mention",
      type: "mentions",
      sourceId: "doc-1",
      targetId: "entity-1",
      label: "Mentions",
      properties: {},
      createdAt: new Date().toISOString(),
    });

    db.addEdge({
      id: "e-located",
      type: "located_in",
      sourceId: "entity-1",
      targetId: "loc-1",
      label: "Located in",
      properties: {},
      createdAt: new Date().toISOString(),
    });

    db.addEdge({
      id: "e-occurs",
      type: "occurs_at",
      sourceId: "evt-1",
      targetId: "loc-1",
      label: "Occurs at",
      properties: {},
      createdAt: new Date().toISOString(),
    });
  });

  describe("BFS (shortest path)", () => {
    it("finds a direct path between adjacent nodes", () => {
      const paths = db.findPaths({
        sourceNodeId: "doc-1",
        targetNodeId: "entity-1",
        algorithm: "bfs",
      });
      expect(paths).toHaveLength(1);
      expect(paths[0].nodes.map((n) => n.id)).toEqual(["doc-1", "entity-1"]);
      expect(paths[0].edges).toHaveLength(1);
    });

    it("finds a path through intermediate nodes", () => {
      const paths = db.findPaths({
        sourceNodeId: "doc-1",
        targetNodeId: "loc-1",
        algorithm: "bfs",
      });
      expect(paths).toHaveLength(1);
      expect(paths[0].nodes.map((n) => n.id)).toEqual(["doc-1", "entity-1", "loc-1"]);
      expect(paths[0].edges).toHaveLength(2);
    });

    it("finds no path when nodes are disconnected", () => {
      // Add an isolated node
      db.addNode(makeNodeOfType("iso-1", "entity", "Isolated", {
        canonicalName: "Isolated",
        entityType: "person",
      }));

      const paths = db.findPaths({
        sourceNodeId: "doc-1",
        targetNodeId: "iso-1",
        algorithm: "bfs",
      });
      expect(paths).toHaveLength(0);
    });

    it("returns identity path when source equals target", () => {
      const paths = db.findPaths({
        sourceNodeId: "entity-1",
        targetNodeId: "entity-1",
        algorithm: "bfs",
      });
      expect(paths).toHaveLength(1);
      expect(paths[0].nodes).toHaveLength(1);
    });

    it("respects maxDepth", () => {
      const paths = db.findPaths({
        sourceNodeId: "doc-1",
        targetNodeId: "loc-1",
        algorithm: "bfs",
        maxDepth: 1,
      });
      expect(paths).toHaveLength(0);
    });
  });

  describe("DFS", () => {
    it("finds a path via DFS", () => {
      const paths = db.findPaths({
        sourceNodeId: "doc-1",
        targetNodeId: "loc-1",
        algorithm: "dfs",
      });
      expect(paths).toHaveLength(1);
    });
  });

  describe("shortest path (weighted)", () => {
    it("finds shortest path by edge count when unweighted", () => {
      const paths = db.findPaths({
        sourceNodeId: "doc-1",
        targetNodeId: "loc-1",
        algorithm: "shortest",
      });
      expect(paths).toHaveLength(1);
      expect(paths[0].edges).toHaveLength(2);
      expect(paths[0].totalWeight).toBe(2); // 2 edges, each weight 1
    });

    it("prefers lower-weight paths", () => {
      // Add an alternative path with higher weight
      db.addNode(makeNodeOfType("entity-2", "entity", "Entity Two", {
        canonicalName: "Entity Two",
        entityType: "person",
      }));

      db.addEdge({
        id: "e-alt-1",
        type: "mentions",
        sourceId: "doc-1",
        targetId: "entity-2",
        label: "Mentions",
        weight: 10,
        properties: {},
        createdAt: new Date().toISOString(),
      });

      db.addEdge({
        id: "e-alt-2",
        type: "located_in",
        sourceId: "entity-2",
        targetId: "loc-1",
        label: "Located in",
        weight: 10,
        properties: {},
        createdAt: new Date().toISOString(),
      });

      const paths = db.findPaths({
        sourceNodeId: "doc-1",
        targetNodeId: "loc-1",
        algorithm: "shortest",
      });

      expect(paths).toHaveLength(1);
      expect(paths[0].totalWeight).toBe(2); // The 2-edge lightweight path
    });
  });

  describe("errors", () => {
    it("throws for missing source node", () => {
      expect(() =>
        db.findPaths({ sourceNodeId: "nonexistent", targetNodeId: "loc-1" }),
      ).toThrow(/Source node/);
    });

    it("throws for missing target node", () => {
      expect(() =>
        db.findPaths({ sourceNodeId: "doc-1", targetNodeId: "nonexistent" }),
      ).toThrow(/Target node/);
    });
  });
});

// ── Subgraph extraction tests ───────────────────────────────────────────────

describe("GraphDB — Subgraph Extraction", () => {
  let db: GraphDB;

  beforeEach(() => {
    db = new GraphDB();

    // Star topology: center document mentions 3 entity leaves
    db.addNode(makeNodeOfType("center", "document", "Center Document"));
    db.addNode(makeNodeOfType("leaf-1", "entity", "Leaf One"));
    db.addNode(makeNodeOfType("leaf-2", "entity", "Leaf Two"));
    db.addNode(makeNodeOfType("leaf-3", "entity", "Leaf Three"));
    db.addNode(makeNodeOfType("leaf-4", "location", "Leaf Four"));

    // Center document mentions the entity leaves (valid: document → entity)
    ["leaf-1", "leaf-2", "leaf-3"].forEach((leafId, i) => {
      db.addEdge({
        id: `e-center-${i}`,
        type: "mentions",
        sourceId: "center",
        targetId: leafId,
        label: "Mentions",
        properties: {},
        createdAt: new Date().toISOString(),
      });
    });

    // Create a second hop: leaf-3 (entity) located_in leaf-4 (location)
    // Valid: entity → location via located_in
    db.addEdge({
      id: "e-leaf-3-4",
      type: "located_in",
      sourceId: "leaf-3",
      targetId: "leaf-4",
      label: "Located in",
      properties: {},
      createdAt: new Date().toISOString(),
    });
  });

  it("extracts nodes within 1 hop of the center", () => {
    const subgraph = db.extractSubgraph({ nodeId: "center", hops: 1 });

    expect(subgraph.centerNodeId).toBe("center");
    expect(subgraph.nodes.length).toBe(4); // center + 3 leaves at 1 hop
    expect(subgraph.edges.length).toBe(3); // 3 connecting edges
  });

  it("extracts nodes within 2 hops", () => {
    const subgraph = db.extractSubgraph({ nodeId: "center", hops: 2 });

    expect(subgraph.nodes.length).toBe(5); // all nodes
    expect(subgraph.edges.length).toBe(4);
    // Should include leaf-4 via leaf-3
    expect(subgraph.nodes.some((n) => n.id === "leaf-4")).toBe(true);
  });

  it("respects direction restriction", () => {
    // From center, edges are outgoing (document → entity).
    // Traversing incoming only should find nothing beyond center.
    const subgraph = db.extractSubgraph({
      nodeId: "center",
      hops: 1,
      direction: "incoming",
    });
    expect(subgraph.nodes.length).toBe(1); // only center — no incoming edges
    expect(subgraph.edges.length).toBe(0);
  });

  it("respects edge type filter", () => {
    const subgraph = db.extractSubgraph({
      nodeId: "center",
      hops: 2,
      edgeTypes: ["occurs_at"],
    });
    // occurs_at only connects leaf-3 -> leaf-4
    // Center has no occurs_at edges, so only center returned
    expect(subgraph.nodes.length).toBe(1);
  });

  it("throws for missing center node", () => {
    expect(() => db.extractSubgraph({ nodeId: "nonexistent", hops: 1 })).toThrow(
      /not found/,
    );
  });

  it("respects node limit", () => {
    const subgraph = db.extractSubgraph({
      nodeId: "center",
      hops: 2,
      limit: 3,
    });
    expect(subgraph.nodes.length).toBeLessThanOrEqual(3);
  });
});

// ── Import/Export tests ─────────────────────────────────────────────────────

describe("GraphDB — Import/Export", () => {
  it("exports and imports the full graph state", () => {
    const db1 = new GraphDB();
    db1.addNode(makeNodeOfType("node-1", "entity", "Test Entity"));
    db1.addNode(makeNodeOfType("node-2", "document", "Test Document"));
    db1.addEdge({
      id: "e-1",
      type: "mentions",
      sourceId: "node-2",
      targetId: "node-1",
      label: "Mentions",
      properties: {},
      createdAt: new Date().toISOString(),
    });

    const exported = db1.export();
    expect(exported.nodes).toHaveLength(2);
    expect(exported.edges).toHaveLength(1);

    const db2 = new GraphDB();
    db2.import(exported);
    expect(db2.nodeCount).toBe(2);
    expect(db2.edgeCount).toBe(1);
    expect(db2.getNode("node-1")).toBeDefined();
  });

  it("clear removes all data", () => {
    const db = new GraphDB();
    db.addNode(makeNodeOfType("node-1", "entity", "Test"));
    db.clear();
    expect(db.nodeCount).toBe(0);
    expect(db.edgeCount).toBe(0);
  });
});

// ── Adjacency/degree helpers ────────────────────────────────────────────────

describe("GraphDB — Adjacency Helpers", () => {
  let db: GraphDB;

  beforeEach(() => {
    db = new GraphDB();
    db.addNode(makeNodeOfType("doc-1", "document", "Document"));
    db.addNode(makeNodeOfType("entity-1", "entity", "Entity"));
    db.addNode(makeNodeOfType("entity-2", "entity", "Entity Two"));

    db.addEdge({
      id: "e-1",
      type: "mentions",
      sourceId: "doc-1",
      targetId: "entity-1",
      label: "Mentions",
      properties: {},
      createdAt: new Date().toISOString(),
    });
    db.addEdge({
      id: "e-2",
      type: "mentions",
      sourceId: "doc-1",
      targetId: "entity-2",
      label: "Mentions",
      properties: {},
      createdAt: new Date().toISOString(),
    });
  });

  it("getDegree returns the number of incident edges", () => {
    expect(db.getDegree("doc-1")).toBe(2);
    expect(db.getDegree("entity-1")).toBe(1);
  });

  it("getOutgoingEdges returns edges from the node", () => {
    const outgoing = db.getOutgoingEdges("doc-1");
    expect(outgoing).toHaveLength(2);
  });

  it("getIncomingEdges returns edges to the node", () => {
    const incoming = db.getIncomingEdges("entity-1");
    expect(incoming).toHaveLength(1);
  });

  it("getNeighbors returns adjacent node IDs", () => {
    const neighbors = db.getNeighbors("doc-1");
    expect(neighbors).toContain("entity-1");
    expect(neighbors).toContain("entity-2");
    expect(neighbors).toHaveLength(2);
  });
});

// ── Schema validation tests ─────────────────────────────────────────────────

describe("GraphDB — Schema Validation", () => {
  it("all node types are defined in NODE_SCHEMAS", () => {
    // Smoke test: each node type should have a schema
    const db = new GraphDB();
    const types: NodeType[] = [
      "source", "document", "entity", "event", "location",
      "claim", "country", "institution", "organization", "action",
    ];
    for (const type of types) {
      const node = makeNodeOfType(`test-${type}`, type, `Test ${type}`);
      expect(() => db.addNode(node)).not.toThrow();
    }
    expect(db.nodeCount).toBe(10);
  });

  it("all edge types have valid allowed pairs defined", () => {
    const edgeTypes: EdgeType[] = [
      "mentions", "occurs_at", "involves", "supports", "contradicts",
      "related_to", "authored_by", "published_by", "located_in", "part_of",
    ];

    // Each edge type should have at least one valid pair in EDGE_TYPE_ALLOWED_PAIRS
    for (const et of edgeTypes) {
      const pairs = EDGE_TYPE_ALLOWED_PAIRS[et];
      expect(pairs).toBeDefined();
      expect(pairs.length).toBeGreaterThan(0);
    }
  });
});
