# Knowledge Graph Architecture

This document describes the knowledge graph schema, storage, and usage for the Accountability Atlas.

---

## Overview

The knowledge graph stores structured data extracted by the AI pipeline — entities, claims, events, locations, and their relationships — as a directed graph. It enables rich querying, path finding, and relationship navigation.

The MVP uses an in-memory graph store (`GraphDB`). A persistent backend (PostgreSQL + recursive CTEs or a dedicated graph DB) will replace it in a later phase.

---

## Node Types

| Type | Description | Required Properties |
|---|---|---|
| `source` | A publisher or data provider | `publisher`, `sourceType` |
| `document` | A collected piece of content | `title` |
| `entity` | A named thing (person, org, location) | `canonicalName`, `entityType` |
| `event` | A timeline event | `description`, `date` |
| `location` | A geographic place with hierarchy | `name`, `locationType` |
| `claim` | An extracted factual or legal claim | `claimText`, `claimType` |
| `country` | A sovereign state or territory | `name` |
| `institution` | An EU or international institution | `name` |
| `organization` | A structured group (NGO, court, etc.) | `name` |
| `action` | A civic action template | `name`, `actionType` |

Full property schemas are defined in `src/lib/graph/schema.ts`.

---

## Edge Types

| Type | Direction | Allowed Pairs |
|---|---|---|
| `mentions` | document → entity/event/location/claim/country | document mentions things it describes |
| `occurs_at` | event → location/country | event occurred at a place |
| `involves` | event/claim → entity/organization | event or claim involves an entity |
| `supports` | document → claim | document provides evidence for claim |
| `contradicts` | claim → claim | one claim contradicts another |
| `related_to` | entity/org/event/claim/doc → same type | general relatedness |
| `authored_by` | document → entity | document was authored by entity |
| `published_by` | document → source | document was published by source |
| `located_in` | entity/org/event/location/country → location/country | something is located in a place |
| `part_of` | entity/org/location/country/institution → same/higher level | hierarchical membership |

Edge direction follows ontological convention (e.g., event → location, not location → event).

---

## GraphDB API

### Node Operations

```typescript
const db = new GraphDB();

// Add a node (validates properties against schema)
db.addNode({
  id: "entity-1",
  type: "entity",
  label: "United Nations",
  properties: { canonicalName: "United Nations", entityType: "organization" },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Get, update, delete
db.getNode("entity-1");
db.updateNode("entity-1", { label: "UN", properties: { acronym: "UN" } });
db.deleteNode("entity-1");
```

### Edge Operations

```typescript
// Add an edge (validates endpoints and edge type compatibility)
db.addEdge({
  id: "edge-1",
  type: "mentions",
  sourceId: "doc-1",
  targetId: "entity-1",
  label: "Mentions",
  properties: { confidence: 0.95 },
  createdAt: new Date().toISOString(),
});
```

### Queries

```typescript
// Find nodes by type and properties
const entities = db.findNodes({
  types: ["entity"],
  propertyFilters: [{ key: "entityType", value: "organization" }],
  labelContains: "united",
  limit: 10,
});

// Find edges incident to a node
const edges = db.findEdges({ incidentTo: "entity-1", types: ["mentions"] });

// Traversal query
const result = db.query({
  nodeFilter: { types: ["document"] },
  edgeTypes: ["mentions"],
  maxDepth: 2,
  direction: "outgoing",
});
```

### Path Finding

```typescript
// BFS (shortest path by edge count)
const paths = db.findPaths({
  sourceNodeId: "doc-1",
  targetNodeId: "loc-1",
  algorithm: "bfs",       // "bfs" | "dfs" | "shortest"
  maxDepth: 10,
  edgeTypes: ["mentions", "located_in"],
});
// Returns GraphPath[] with nodes, edges, and totalWeight
```

### Subgraph Extraction

```typescript
const subgraph = db.extractSubgraph({
  nodeId: "entity-1",
  hops: 2,
  direction: "both",
  edgeTypes: ["related_to", "located_in"],
  limit: 200,
});
// Returns Subgraph with nodes, edges, centerNodeId
```

---

## Entity Resolution

The `EntityResolver` merges duplicate entities, resolves name variants, and maintains canonical IDs.

### Key Rules

- **Never merge across types** — entities with different `NodeType` values are never merged
- **Name similarity** — normalized comparison (case-insensitive, ignores titles, punctuation, stop words)
- **Source overlap boost** — shared source documents increase merge confidence
- **All merges logged and reversible** — every merge creates a `MergeRecord` with undo support

### Usage

```typescript
const resolver = new EntityResolver({
  minNameSimilarity: 0.7,    // Minimum name similarity to consider merging
  autoMergeConfidence: 0.85, // Threshold for automatic merging
  useSourceOverlap: true,     // Boost confidence for shared sources
});

// Resolve an entity to its canonical ID
const canonicalId = resolver.resolve("entity-1");

// Merge duplicates
resolver.merge("entity", ["canonical-id", "duplicate-id"], "name_similarity", 0.95);

// Batch resolution
const mergeRecords = resolver.resolveBatch(entities);

// Undo
resolver.undoLastMerge();
resolver.reverseMerge("merge-1-1234567890");
```

---

## Integration with AI Pipeline

The knowledge graph is populated from `AIProcessedContent` — the output of the AI pipeline. Each stage produces data that maps to graph nodes:

| AI Stage | Graph Node Type |
|---|---|
| `entity_extraction` | entity nodes |
| `claim_extraction` | claim nodes |
| `timeline_extraction` | event nodes |
| `geographic_extraction` | location nodes |

Edges are built from:
- `relationship_detection` — `EntityRelationship[]` mapped to edge types
- Document-to-entity links from entity source spans
- Event-to-entity links from `linkedEntityIds`

### Population Pattern

Population follows this pattern:
1. Create source nodes from the source registry
2. Create document nodes for collected content
3. Extract and create entity/claim/event/location nodes from AI pipeline output
4. Deduplicate entities during population via EntityResolver
5. Build edges from relationship detection output
6. Link documents to sources, entities, and claims

---

## Performance Characteristics

- **In-memory storage** — all operations are O(1) for ID lookups (hash maps)
- **Type and edge-type indexes** — O(1) filtered lookups by type
- **Path finding** — BFS is O(V + E) for unweighted; Dijkstra-like is O((V + E) log V) for weighted
- **Subgraph extraction** — BFS from center, O(V + E) in the subgraph
- **Target: 500+ nodes** with interactive performance

---

## Future Considerations

- **Persistent storage** — PostgreSQL with recursive CTEs or dedicated graph DB (Neo4j, Apache AGE)
- **pgRouting** for geographic path queries on PostGIS
- **Materialized views** for common query patterns (e.g., "all evidence for a claim")
- **Index on (sourceId, targetId, relationshipType)** for fast edge lookups
- **Public vs. private edges** — unreviewed relationships excluded from public pathfinding
- **API layer** — REST or GraphQL endpoint for graph queries
