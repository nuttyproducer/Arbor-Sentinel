// src/lib/graph/types.ts
//
// Core graph type definitions for the Arbor Sentinel knowledge graph.
// Defines node types, edge types, and query structures used by GraphDB,
// EntityResolver, and graph visualization components.
//
// Graph edge type strings are defined in the canonical taxonomy (lib/taxonomy)
// as GRAPH_EDGE_TYPES. This file defines the structural NodeType enum and
// edge validation schema (EDGE_TYPE_ALLOWED_PAIRS) on top of those strings.

// ── Node types ───────────────────────────────────────────────────────────────

/**
 * Supported node types in the knowledge graph.
 *
 * Maps to the node types defined in the graph schema:
 * - source: a publisher or data provider (e.g. ICJ, OHCHR, Amnesty International)
 * - document: a collected piece of content (article, report, legal filing)
 * - entity: a named thing — person, organization, or location extracted from documents
 * - event: a timeline event with temporal bounds
 * - location: a geographic place with hierarchy
 * - claim: an extracted factual or legal claim
 * - country: a sovereign state or territory
 * - institution: an EU or international institution
 * - organization: a structured group (NGO, court, government body)
 * - action: a civic action template
 */
export type NodeType =
  | "source"
  | "document"
  | "entity"
  | "event"
  | "location"
  | "claim"
  | "country"
  | "institution"
  | "organization"
  | "action";

/** Human-readable labels for each node type. */
export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  source: "Source",
  document: "Document",
  entity: "Entity",
  event: "Event",
  location: "Location",
  claim: "Claim",
  country: "Country",
  institution: "Institution",
  organization: "Organization",
  action: "Action",
};

// ── Edge types ───────────────────────────────────────────────────────────────

/**
 * Directed edge types in the knowledge graph.
 *
 * Direction follows ontological convention:
 * - event -> location (occurs_at), not location -> event
 * - document -> entity (mentions)
 * - document -> claim (supports)
 * - entity -> entity (related_to, part_of)
 * - entity -> location (located_in)
 * - document -> source (published_by)
 * - document -> entity (authored_by)
 * - claim -> claim (contradicts)
 * - event -> entity (involves)
 */
export type EdgeType =
  | "mentions"
  | "occurs_at"
  | "involves"
  | "supports"
  | "contradicts"
  | "related_to"
  | "authored_by"
  | "published_by"
  | "located_in"
  | "part_of";

/** Human-readable labels for each edge type. */
export const EDGE_TYPE_LABELS: Record<EdgeType, string> = {
  mentions: "Mentions",
  occurs_at: "Occurs at",
  involves: "Involves",
  supports: "Supports",
  contradicts: "Contradicts",
  related_to: "Related to",
  authored_by: "Authored by",
  published_by: "Published by",
  located_in: "Located in",
  part_of: "Part of",
};

/**
 * Valid (source node type, target node type) pairs for each edge type.
 * Used by schema validation to reject invalid edges.
 */
export const EDGE_TYPE_ALLOWED_PAIRS: Record<EdgeType, [NodeType, NodeType][]> = {
  mentions: [
    ["document", "entity"],
    ["document", "event"],
    ["document", "location"],
    ["document", "claim"],
    ["document", "country"],
  ],
  occurs_at: [
    ["event", "location"],
    ["event", "country"],
  ],
  involves: [
    ["event", "entity"],
    ["event", "organization"],
    ["claim", "entity"],
    ["claim", "organization"],
  ],
  supports: [
    ["document", "claim"],
  ],
  contradicts: [
    ["claim", "claim"],
  ],
  related_to: [
    ["entity", "entity"],
    ["entity", "organization"],
    ["organization", "organization"],
    ["event", "event"],
    ["claim", "claim"],
    ["document", "document"],
  ],
  authored_by: [
    ["document", "entity"],
  ],
  published_by: [
    ["document", "source"],
  ],
  located_in: [
    ["entity", "location"],
    ["entity", "country"],
    ["organization", "location"],
    ["organization", "country"],
    ["event", "location"],
    ["location", "location"],
    ["location", "country"],
    ["country", "country"],
  ],
  part_of: [
    ["entity", "entity"],
    ["entity", "organization"],
    ["organization", "organization"],
    ["location", "location"],
    ["location", "country"],
    ["country", "country"],
    ["institution", "institution"],
  ],
};

// ── Graph node ───────────────────────────────────────────────────────────────

/**
 * A node in the knowledge graph.
 *
 * Each node has a unique ID, a type, a human-readable label, and
 * arbitrary typed properties. Properties are validated against the
 * schema for the node's type.
 */
export interface GraphNode {
  /** Unique identifier — UUID or slug. */
  id: string;
  /** Node type from the controlled vocabulary. */
  type: NodeType;
  /** Human-readable display label. */
  label: string;
  /** Arbitrary properties keyed by property name. */
  properties: Record<string, unknown>;
  /** ISO timestamp when the node was created. */
  createdAt: string;
  /** ISO timestamp when the node was last updated. */
  updatedAt: string;
}

// ── Graph edge ───────────────────────────────────────────────────────────────

/**
 * A directed edge connecting two nodes in the knowledge graph.
 */
export interface GraphEdge {
  /** Unique identifier — UUID. */
  id: string;
  /** Edge type from the controlled vocabulary. */
  type: EdgeType;
  /** Source node ID (the edge originates here). */
  sourceId: string;
  /** Target node ID (the edge points here). */
  targetId: string;
  /** Human-readable label for the relationship. */
  label: string;
  /** Optional weight or confidence 0–1. */
  weight?: number;
  /** Arbitrary properties keyed by property name. */
  properties: Record<string, unknown>;
  /** ISO timestamp when the edge was created. */
  createdAt: string;
}

// ── Query types ──────────────────────────────────────────────────────────────

/** Filter criteria for node queries. */
export interface NodeFilter {
  /** Match nodes of these types. If empty, match all types. */
  types?: NodeType[];
  /** Match nodes whose properties satisfy these conditions. */
  propertyFilters?: PropertyFilter[];
  /** Match nodes by label substring (case-insensitive). */
  labelContains?: string;
  /** Limit the number of results. */
  limit?: number;
  /** Offset for pagination. */
  offset?: number;
}

/** Filter criteria for edge queries. */
export interface EdgeFilter {
  /** Match edges of these types. If empty, match all types. */
  types?: EdgeType[];
  /** Match edges where source node ID equals this value. */
  sourceId?: string;
  /** Match edges where target node ID equals this value. */
  targetId?: string;
  /** Match edges incident to this node (either source or target). */
  incidentTo?: string;
  /** Match edges whose properties satisfy these conditions. */
  propertyFilters?: PropertyFilter[];
  /** Limit the number of results. */
  limit?: number;
  /** Offset for pagination. */
  offset?: number;
}

/** A property filter for node or edge queries. */
export interface PropertyFilter {
  /** Property key to filter on. */
  key: string;
  /** The value to compare against. */
  value: unknown;
  /** Comparison operator. Defaults to "eq". */
  operator?: PropertyOperator;
}

/** Supported comparison operators for property filters. */
export type PropertyOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains";

/** A composed graph query with node and edge filters. */
export interface GraphQuery {
  /** Filter for the starting nodes. */
  nodeFilter: NodeFilter;
  /** Edge types to traverse. */
  edgeTypes?: EdgeType[];
  /** Direction of traversal. */
  direction?: "outgoing" | "incoming" | "both";
  /** Maximum depth for traversal (default 1). */
  maxDepth?: number;
  /** Limit on total results. */
  limit?: number;
}

/** A path through the graph — sequence of alternating nodes and edges. */
export interface GraphPath {
  /** The nodes in the path, in order. */
  nodes: GraphNode[];
  /** The edges connecting the nodes, in order. */
  edges: GraphEdge[];
  /** Total path weight (sum of edge weights, or edge count if unweighted). */
  totalWeight: number;
}

/** Parameters for path finding between two nodes. */
export interface PathFindOptions {
  /** Source node ID. */
  sourceNodeId: string;
  /** Target node ID. */
  targetNodeId: string;
  /** Edge types to consider for traversal. If empty, all types allowed. */
  edgeTypes?: EdgeType[];
  /** Maximum path length in edges. Default: 10. */
  maxDepth?: number;
  /** Algorithm to use. Default: "shortest". */
  algorithm?: "bfs" | "dfs" | "shortest";
}

/** Parameters for subgraph extraction around a node. */
export interface SubgraphOptions {
  /** Center node ID. */
  nodeId: string;
  /** Number of hops from the center node. */
  hops: number;
  /** Edge types to consider for expansion. If empty, all types allowed. */
  edgeTypes?: EdgeType[];
  /** Direction of traversal. Default: "both". */
  direction?: "outgoing" | "incoming" | "both";
  /** Limit on total nodes in the subgraph. Default: 200. */
  limit?: number;
}

// ── Entity resolution types ──────────────────────────────────────────────────

/** A single merge operation record. */
export interface MergeRecord {
  /** Unique merge operation ID. */
  id: string;
  /** The canonical entity ID that survived the merge. */
  canonicalId: string;
  /** Entity IDs that were merged into the canonical. */
  mergedIds: string[];
  /** The entity type that was merged. */
  entityType: NodeType;
  /** Why the merge was performed. */
  rationale: "name_similarity" | "type_match" | "source_overlap" | "manual";
  /** Confidence in the merge decision 0–1. */
  confidence: number;
  /** Who or what performed the merge. */
  performedBy: string;
  /** ISO timestamp when the merge occurred. */
  timestamp: string;
}

/** A node with its canonical ID resolved (may differ from the node's own ID). */
export interface ResolvedNode {
  /** The node data. */
  node: GraphNode;
  /** The canonical ID — same as node.id if not an alias. */
  canonicalId: string;
  /** Whether this node is the canonical entity. */
  isCanonical: boolean;
  /** All aliases (former IDs) for this entity. */
  aliases: string[];
}

// ── Subgraph result ──────────────────────────────────────────────────────────

/** The result of a subgraph extraction operation. */
export interface Subgraph {
  /** Nodes within the subgraph. */
  nodes: GraphNode[];
  /** Edges where both endpoints are in the subgraph. */
  edges: GraphEdge[];
  /** The center node used for extraction. */
  centerNodeId: string;
  /** Number of hops actually traversed. */
  hopsUsed: number;
}
