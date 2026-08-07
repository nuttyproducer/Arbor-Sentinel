// src/lib/graph/index.ts
//
// Barrel export for the knowledge graph module.

export type {
  NodeType,
  EdgeType,
  GraphNode,
  GraphEdge,
  NodeFilter,
  EdgeFilter,
  PropertyFilter,
  PropertyOperator,
  GraphQuery,
  GraphPath,
  PathFindOptions,
  SubgraphOptions,
  Subgraph,
  MergeRecord,
  ResolvedNode,
} from "./types";

export {
  NODE_TYPE_LABELS,
  EDGE_TYPE_LABELS,
  EDGE_TYPE_ALLOWED_PAIRS,
} from "./types";

export {
  type PropertyDef,
  type NodePropertySchema,
  type EdgePropertySchema,
  type ValidationResult,
  NODE_SCHEMAS,
  EDGE_SCHEMAS,
  validateNodeProperties,
  validateEdge,
  isValidEdgePair,
  getAllowedTargetTypes,
  getAllowedSourceTypes,
} from "./schema";

export { GraphDB } from "./GraphDB";

export {
  EntityResolver,
  type EntityResolverConfig,
} from "./EntityResolver";

// Graph persistence (Supabase-backed)
export { saveGraph, loadGraph, clearSourceGraph } from "./GraphPersistence";

// Graph API queries
export {
  getEntitySubgraph,
  getNodesByType,
  getEdgesByType,
  getFullGraph,
  getGraphStats,
  type GraphNodeRow,
  type GraphEdgeRow,
  type SubgraphResult,
} from "./GraphAPI";
