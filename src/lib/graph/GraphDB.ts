// src/lib/graph/GraphDB.ts
//
// In-memory graph database for the Arbor Sentinel knowledge graph.
// Supports CRUD operations, type/property queries, path finding (BFS/DFS/shortest),
// and subgraph extraction.
//
// This is the MVP implementation — replaced by a persistent store
// (e.g., PostgreSQL + PostGIS) in a later phase.

import type {
  GraphNode,
  GraphEdge,
  NodeType,
  EdgeType,
  NodeFilter,
  EdgeFilter,
  GraphQuery,
  GraphPath,
  PathFindOptions,
  SubgraphOptions,
  Subgraph,
  PropertyFilter,
} from "./types";
import { validateNodeProperties, validateEdge } from "./schema";

// ── Internal adjacency index ─────────────────────────────────────────────────

interface AdjacencyEntry {
  edge: GraphEdge;
  direction: "outgoing" | "incoming";
}

// ── GraphDB ──────────────────────────────────────────────────────────────────

export class GraphDB {
  /** All nodes keyed by ID. */
  private nodes: Map<string, GraphNode> = new Map();

  /** All edges keyed by ID. */
  private edges: Map<string, GraphEdge> = new Map();

  /** Adjacency index: nodeId → list of incident edges with direction. */
  private adjacency: Map<string, AdjacencyEntry[]> = new Map();

  /** Type index: nodeType → list of node IDs. */
  private typeIndex: Map<NodeType, Set<string>> = new Map();

  /** Edge type index: edgeType → list of edge IDs. */
  private edgeTypeIndex: Map<EdgeType, Set<string>> = new Map();

  // ── Node operations ──────────────────────────────────────────────────────

  /**
   * Add a node to the graph.
   * Validates properties against the schema before insertion.
   * Throws if a node with the same ID already exists.
   */
  addNode(node: GraphNode): GraphNode {
    if (this.nodes.has(node.id)) {
      throw new Error(`Node with ID "${node.id}" already exists. Use updateNode() to modify.`);
    }

    const validation = validateNodeProperties(node.type, node.properties);
    if (!validation.valid) {
      throw new Error(`Node validation failed for "${node.id}": ${validation.errors.join("; ")}`);
    }

    this.nodes.set(node.id, node);
    this.adjacency.set(node.id, []);

    // Update type index
    if (!this.typeIndex.has(node.type)) {
      this.typeIndex.set(node.type, new Set());
    }
    this.typeIndex.get(node.type)!.add(node.id);

    return node;
  }

  /**
   * Update an existing node's properties.
   * Merges new properties on top of existing ones.
   * Validates the merged properties against the schema.
   * Throws if the node does not exist.
   */
  updateNode(id: string, updates: Partial<Pick<GraphNode, "label" | "properties">>): GraphNode {
    const existing = this.getNode(id);
    if (!existing) {
      throw new Error(`Node "${id}" not found.`);
    }

    const mergedProperties = {
      ...existing.properties,
      ...(updates.properties ?? {}),
    };

    const validation = validateNodeProperties(existing.type, mergedProperties);
    if (!validation.valid) {
      throw new Error(`Node update validation failed for "${id}": ${validation.errors.join("; ")}`);
    }

    const updated: GraphNode = {
      ...existing,
      label: updates.label ?? existing.label,
      properties: mergedProperties,
      updatedAt: new Date().toISOString(),
    };

    this.nodes.set(id, updated);
    return updated;
  }

  /**
   * Delete a node and all its incident edges.
   * Returns the deleted node, or undefined if not found.
   */
  deleteNode(id: string): GraphNode | undefined {
    const node = this.nodes.get(id);
    if (!node) return undefined;

    // Remove incident edges
    const incident = this.adjacency.get(id) ?? [];
    for (const entry of incident) {
      this.deleteEdge(entry.edge.id);
    }

    this.nodes.delete(id);
    this.adjacency.delete(id);

    // Update type index
    this.typeIndex.get(node.type)?.delete(id);

    return node;
  }

  /** Get a node by ID. */
  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  /** Check if a node exists. */
  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  /** Get the total number of nodes. */
  get nodeCount(): number {
    return this.nodes.size;
  }

  // ── Edge operations ──────────────────────────────────────────────────────

  /**
   * Add an edge to the graph.
   * Validates that both endpoints exist and the edge type is valid for them.
   * Throws if an edge with the same ID already exists.
   */
  addEdge(edge: GraphEdge): GraphEdge {
    if (this.edges.has(edge.id)) {
      throw new Error(`Edge with ID "${edge.id}" already exists. Use updateEdge() to modify.`);
    }

    const sourceNode = this.getNode(edge.sourceId);
    if (!sourceNode) {
      throw new Error(`Source node "${edge.sourceId}" not found for edge "${edge.id}".`);
    }

    const targetNode = this.getNode(edge.targetId);
    if (!targetNode) {
      throw new Error(`Target node "${edge.targetId}" not found for edge "${edge.id}".`);
    }

    const validation = validateEdge(
      { type: edge.type, sourceId: edge.sourceId, targetId: edge.targetId, properties: edge.properties },
      sourceNode.type,
      targetNode.type,
    );
    if (!validation.valid) {
      throw new Error(`Edge validation failed for "${edge.id}": ${validation.errors.join("; ")}`);
    }

    this.edges.set(edge.id, edge);

    // Update adjacency index
    this.adjacency.get(edge.sourceId)?.push({ edge, direction: "outgoing" });
    this.adjacency.get(edge.targetId)?.push({ edge, direction: "incoming" });

    // Update edge type index
    if (!this.edgeTypeIndex.has(edge.type)) {
      this.edgeTypeIndex.set(edge.type, new Set());
    }
    this.edgeTypeIndex.get(edge.type)!.add(edge.id);

    return edge;
  }

  /**
   * Update an existing edge's properties.
   * Merges new properties on top of existing ones.
   * Throws if the edge does not exist.
   */
  updateEdge(id: string, updates: Partial<Pick<GraphEdge, "label" | "weight" | "properties">>): GraphEdge {
    const existing = this.getEdge(id);
    if (!existing) {
      throw new Error(`Edge "${id}" not found.`);
    }

    const updated: GraphEdge = {
      ...existing,
      label: updates.label ?? existing.label,
      weight: updates.weight ?? existing.weight,
      properties: {
        ...existing.properties,
        ...(updates.properties ?? {}),
      },
    };

    this.edges.set(id, updated);

    // Update in adjacency index
    this.replaceEdgeInAdjacency(existing, updated);

    return updated;
  }

  /**
   * Delete an edge.
   * Returns the deleted edge, or undefined if not found.
   */
  deleteEdge(id: string): GraphEdge | undefined {
    const edge = this.edges.get(id);
    if (!edge) return undefined;

    this.edges.delete(id);

    // Remove from adjacency index
    this.removeEdgeFromAdjacency(edge);

    // Update edge type index
    this.edgeTypeIndex.get(edge.type)?.delete(id);

    return edge;
  }

  /** Get an edge by ID. */
  getEdge(id: string): GraphEdge | undefined {
    return this.edges.get(id);
  }

  /** Check if an edge exists. */
  hasEdge(id: string): boolean {
    return this.edges.has(id);
  }

  /** Get the total number of edges. */
  get edgeCount(): number {
    return this.edges.size;
  }

  // ── Query operations ─────────────────────────────────────────────────────

  /**
   * Find nodes matching the given filter.
   * Performs indexed lookups where possible, falls back to scan for property filters.
   */
  findNodes(filter: NodeFilter = {}): GraphNode[] {
    let candidates: Iterable<string>;

    // Use type index if types are specified
    if (filter.types && filter.types.length > 0) {
      candidates = new Set<string>();
      for (const type of filter.types) {
        const typeNodes = this.typeIndex.get(type);
        if (typeNodes) {
          for (const id of typeNodes) {
            (candidates as Set<string>).add(id);
          }
        }
      }
    } else {
      candidates = this.nodes.keys();
    }

    const results: GraphNode[] = [];
    for (const id of candidates) {
      const node = this.nodes.get(id)!;

      // Apply label filter
      if (filter.labelContains) {
        const search = filter.labelContains.toLowerCase();
        if (!node.label.toLowerCase().includes(search)) continue;
      }

      // Apply property filters
      if (filter.propertyFilters && filter.propertyFilters.length > 0) {
        if (!matchesPropertyFilters(node.properties, filter.propertyFilters)) continue;
      }

      results.push(node);
    }

    // Apply pagination
    const offset = filter.offset ?? 0;
    const limit = filter.limit ?? results.length;
    return results.slice(offset, offset + limit);
  }

  /**
   * Find edges matching the given filter.
   */
  findEdges(filter: EdgeFilter = {}): GraphEdge[] {
    let candidates: Iterable<string>;

    // Use edge type index
    if (filter.types && filter.types.length > 0) {
      candidates = new Set<string>();
      for (const type of filter.types) {
        const typeEdges = this.edgeTypeIndex.get(type);
        if (typeEdges) {
          for (const id of typeEdges) {
            (candidates as Set<string>).add(id);
          }
        }
      }
    } else {
      candidates = this.edges.keys();
    }

    const results: GraphEdge[] = [];
    for (const id of candidates) {
      const edge = this.edges.get(id)!;

      // Apply endpoint filters
      if (filter.sourceId && edge.sourceId !== filter.sourceId) continue;
      if (filter.targetId && edge.targetId !== filter.targetId) continue;
      if (filter.incidentTo && edge.sourceId !== filter.incidentTo && edge.targetId !== filter.incidentTo) continue;

      // Apply property filters
      if (filter.propertyFilters && filter.propertyFilters.length > 0) {
        if (!matchesPropertyFilters(edge.properties, filter.propertyFilters)) continue;
      }

      results.push(edge);
    }

    // Apply pagination
    const offset = filter.offset ?? 0;
    const limit = filter.limit ?? results.length;
    return results.slice(offset, offset + limit);
  }

  /**
   * Execute a graph traversal query.
   * Starts from nodes matching nodeFilter, then traverses edges.
   */
  query(query: GraphQuery): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const startNodes = this.findNodes(query.nodeFilter);
    const maxDepth = query.maxDepth ?? 1;
    const edgeTypes = query.edgeTypes && query.edgeTypes.length > 0 ? new Set(query.edgeTypes) : undefined;
    const direction = query.direction ?? "both";

    const visitedNodes = new Set<string>();
    const visitedEdges = new Set<string>();

    // Queue of [nodeId, depth]
    const queue: Array<[string, number]> = startNodes.map((n) => [n.id, 0]);
    for (const node of startNodes) {
      visitedNodes.add(node.id);
    }

    while (queue.length > 0) {
      const [currentId, depth] = queue.shift()!;
      if (depth >= maxDepth) continue;

      const incident = this.adjacency.get(currentId) ?? [];
      for (const entry of incident) {
        if (edgeTypes && !edgeTypes.has(entry.edge.type)) continue;

        const nextId =
          entry.direction === "outgoing" ? entry.edge.targetId : entry.edge.sourceId;

        // Check direction
        if (direction === "outgoing" && entry.direction !== "outgoing") continue;
        if (direction === "incoming" && entry.direction !== "incoming") continue;

        visitedEdges.add(entry.edge.id);

        if (!visitedNodes.has(nextId)) {
          visitedNodes.add(nextId);
          queue.push([nextId, depth + 1]);
        }
      }
    }

    const nodes = Array.from(visitedNodes).map((id) => this.nodes.get(id)!);
    const edges = Array.from(visitedEdges).map((id) => this.edges.get(id)!);

    const limit = query.limit ?? nodes.length;
    return { nodes: nodes.slice(0, limit), edges };
  }

  // ── Path finding ─────────────────────────────────────────────────────────

  /**
   * Find paths between two nodes.
   * Supports BFS (shortest path by edge count), DFS, and weighted shortest path.
   */
  findPaths(options: PathFindOptions): GraphPath[] {
    const { sourceNodeId, targetNodeId, edgeTypes, maxDepth = 10, algorithm = "shortest" } = options;

    if (!this.hasNode(sourceNodeId)) {
      throw new Error(`Source node "${sourceNodeId}" not found.`);
    }
    if (!this.hasNode(targetNodeId)) {
      throw new Error(`Target node "${targetNodeId}" not found.`);
    }

    if (sourceNodeId === targetNodeId) {
      const node = this.getNode(sourceNodeId)!;
      return [{ nodes: [node], edges: [], totalWeight: 0 }];
    }

    switch (algorithm) {
      case "bfs":
        return this.bfs(sourceNodeId, targetNodeId, edgeTypes, maxDepth);
      case "dfs":
        return this.dfs(sourceNodeId, targetNodeId, edgeTypes, maxDepth);
      case "shortest":
        return this.shortestPath(sourceNodeId, targetNodeId, edgeTypes, maxDepth);
    }
  }

  /**
   * BFS — finds the shortest path(s) by edge count.
   */
  private bfs(
    sourceId: string,
    targetId: string,
    edgeTypes: string[] | undefined,
    maxDepth: number,
  ): GraphPath[] {
    const typeSet = edgeTypes && edgeTypes.length > 0 ? new Set(edgeTypes) : undefined;

    // BFS queue: [nodeId, path so far]
    const queue: Array<{ nodeId: string; path: { nodes: string[]; edges: string[] } }> = [
      { nodeId: sourceId, path: { nodes: [sourceId], edges: [] } },
    ];
    const visited = new Set<string>([sourceId]);
    let foundDepth: number | undefined;

    const results: GraphPath[] = [];

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      const depth = path.edges.length;

      // If we've found paths and we're past that depth, stop
      if (foundDepth !== undefined && depth >= foundDepth) break;
      if (depth >= maxDepth) continue;

      const incident = this.adjacency.get(nodeId) ?? [];
      for (const entry of incident) {
        if (typeSet && !typeSet.has(entry.edge.type)) continue;

        const nextId =
          entry.direction === "outgoing" ? entry.edge.targetId : entry.edge.sourceId;

        if (nextId === targetId) {
          foundDepth = depth + 1;
          const nodeIds = [...path.nodes, nextId];
          const edgeIds = [...path.edges, entry.edge.id];
          results.push(this.buildPath(nodeIds, edgeIds));
          continue;
        }

        if (!visited.has(nextId)) {
          visited.add(nextId);
          queue.push({
            nodeId: nextId,
            path: {
              nodes: [...path.nodes, nextId],
              edges: [...path.edges, entry.edge.id],
            },
          });
        }
      }
    }

    return results;
  }

  /**
   * DFS — finds a path (not necessarily shortest).
   */
  private dfs(
    sourceId: string,
    targetId: string,
    edgeTypes: string[] | undefined,
    maxDepth: number,
  ): GraphPath[] {
    const typeSet = edgeTypes && edgeTypes.length > 0 ? new Set(edgeTypes) : undefined;
    const visited = new Set<string>();
    const results: GraphPath[] = [];

    const stack: Array<{ nodeId: string; path: { nodes: string[]; edges: string[] } }> = [
      { nodeId: sourceId, path: { nodes: [sourceId], edges: [] } },
    ];

    while (stack.length > 0) {
      const { nodeId, path } = stack.pop()!;

      if (nodeId === targetId) {
        results.push(this.buildPath(path.nodes, path.edges));
        continue;
      }

      if (path.edges.length >= maxDepth) continue;

      visited.add(nodeId);

      const incident = this.adjacency.get(nodeId) ?? [];
      for (const entry of incident) {
        if (typeSet && !typeSet.has(entry.edge.type)) continue;

        const nextId =
          entry.direction === "outgoing" ? entry.edge.targetId : entry.edge.sourceId;

        if (!visited.has(nextId)) {
          stack.push({
            nodeId: nextId,
            path: {
              nodes: [...path.nodes, nextId],
              edges: [...path.edges, entry.edge.id],
            },
          });
        }
      }
    }

    return results;
  }

  /**
   * Dijkstra-like shortest path using edge weights.
   * When weights are absent, treats each edge as weight 1 (same as BFS).
   */
  private shortestPath(
    sourceId: string,
    targetId: string,
    edgeTypes: string[] | undefined,
    maxDepth: number,
  ): GraphPath[] {
    const typeSet = edgeTypes && edgeTypes.length > 0 ? new Set(edgeTypes) : undefined;

    // Priority queue entry: [nodeId, totalWeight, path]
    const pq: Array<{ nodeId: string; weight: number; nodes: string[]; edges: string[] }> = [
      { nodeId: sourceId, weight: 0, nodes: [sourceId], edges: [] },
    ];

    // Best weight to reach each node
    const bestWeight = new Map<string, number>([[sourceId, 0]]);
    let bestTargetWeight = Infinity;

    const results: GraphPath[] = [];

    while (pq.length > 0) {
      // Extract minimum (simple linear scan — acceptable for MVP graph sizes)
      let minIdx = 0;
      for (let i = 1; i < pq.length; i++) {
        if (pq[i].weight < pq[minIdx].weight) minIdx = i;
      }
      const { nodeId, weight, nodes, edges } = pq.splice(minIdx, 1)[0];

      if (weight > bestTargetWeight) break;
      if (edges.length >= maxDepth) continue;

      if (nodeId === targetId) {
        bestTargetWeight = weight;
        results.push(this.buildPath(nodes, edges));
        continue;
      }

      const currentBest = bestWeight.get(nodeId) ?? Infinity;
      if (weight > currentBest) continue;

      const incident = this.adjacency.get(nodeId) ?? [];
      for (const entry of incident) {
        if (typeSet && !typeSet.has(entry.edge.type)) continue;

        const nextId =
          entry.direction === "outgoing" ? entry.edge.targetId : entry.edge.sourceId;
        const edgeWeight = entry.edge.weight ?? 1;
        const newWeight = weight + edgeWeight;
        const nextBest = bestWeight.get(nextId) ?? Infinity;

        if (newWeight <= nextBest) {
          bestWeight.set(nextId, newWeight);
          pq.push({
            nodeId: nextId,
            weight: newWeight,
            nodes: [...nodes, nextId],
            edges: [...edges, entry.edge.id],
          });
        }
      }
    }

    return results;
  }

  // ── Subgraph extraction ──────────────────────────────────────────────────

  /**
   * Extract a subgraph of nodes within N hops of a center node.
   */
  extractSubgraph(options: SubgraphOptions): Subgraph {
    const { nodeId, hops, edgeTypes, direction = "both", limit = 200 } = options;

    if (!this.hasNode(nodeId)) {
      throw new Error(`Center node "${nodeId}" not found.`);
    }

    const typeSet = edgeTypes && edgeTypes.length > 0 ? new Set(edgeTypes) : undefined;
    const visitedNodes = new Set<string>([nodeId]);
    const visitedEdges = new Set<string>();

    // BFS expansion
    const queue: Array<[string, number]> = [[nodeId, 0]];

    while (queue.length > 0 && visitedNodes.size < limit) {
      const [currentId, depth] = queue.shift()!;
      if (depth >= hops) continue;

      const incident = this.adjacency.get(currentId) ?? [];
      for (const entry of incident) {
        if (typeSet && !typeSet.has(entry.edge.type)) continue;

        // Respect direction
        if (direction === "outgoing" && entry.direction !== "outgoing") continue;
        if (direction === "incoming" && entry.direction !== "incoming") continue;

        const nextId =
          entry.direction === "outgoing" ? entry.edge.targetId : entry.edge.sourceId;

        visitedEdges.add(entry.edge.id);

        if (!visitedNodes.has(nextId)) {
          visitedNodes.add(nextId);
          queue.push([nextId, depth + 1]);

          // Respect node limit during expansion
          if (visitedNodes.size >= limit) break;
        }
      }

      // Respect node limit between inner loop iterations
      if (visitedNodes.size >= limit) break;
    }

    const nodes = Array.from(visitedNodes).map((id) => this.nodes.get(id)!);
    const edges = Array.from(visitedEdges)
      .map((id) => this.edges.get(id)!)
      // Only include edges where both endpoints are in the subgraph
      .filter((e) => visitedNodes.has(e.sourceId) && visitedNodes.has(e.targetId));

    return { nodes, edges, centerNodeId: nodeId, hopsUsed: hops };
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Build a GraphPath from node IDs and edge IDs. */
  private buildPath(nodeIds: string[], edgeIds: string[]): GraphPath {
    const nodes = nodeIds.map((id) => this.nodes.get(id)!);
    const edges = edgeIds.map((id) => this.edges.get(id)!);
    const totalWeight = edges.reduce((sum, e) => sum + (e.weight ?? 1), 0);
    return { nodes, edges, totalWeight };
  }

  /** Replace an edge in the adjacency index with its updated version. */
  private replaceEdgeInAdjacency(oldEdge: GraphEdge, newEdge: GraphEdge): void {
    this.removeEdgeFromAdjacency(oldEdge);

    this.adjacency.get(newEdge.sourceId)?.push({ edge: newEdge, direction: "outgoing" });
    this.adjacency.get(newEdge.targetId)?.push({ edge: newEdge, direction: "incoming" });
  }

  /** Remove an edge from the adjacency index. */
  private removeEdgeFromAdjacency(edge: GraphEdge): void {
    const srcAdj = this.adjacency.get(edge.sourceId);
    if (srcAdj) {
      const idx = srcAdj.findIndex((e) => e.edge.id === edge.id);
      if (idx !== -1) srcAdj.splice(idx, 1);
    }

    const tgtAdj = this.adjacency.get(edge.targetId);
    if (tgtAdj) {
      const idx = tgtAdj.findIndex((e) => e.edge.id === edge.id);
      if (idx !== -1) tgtAdj.splice(idx, 1);
    }
  }

  /** Get incident edges for a node with direction. */
  private getIncidentEdges(nodeId: string): AdjacencyEntry[] {
    return this.adjacency.get(nodeId) ?? [];
  }

  /** Get the degree (number of incident edges) of a node. */
  getDegree(nodeId: string): number {
    return this.getIncidentEdges(nodeId).length;
  }

  /** Get outgoing edges from a node. */
  getOutgoingEdges(nodeId: string): GraphEdge[] {
    return this.getIncidentEdges(nodeId)
      .filter((e) => e.direction === "outgoing")
      .map((e) => e.edge);
  }

  /** Get incoming edges to a node. */
  getIncomingEdges(nodeId: string): GraphEdge[] {
    return this.getIncidentEdges(nodeId)
      .filter((e) => e.direction === "incoming")
      .map((e) => e.edge);
  }

  /** Get neighboring node IDs (adjacent, any direction). */
  getNeighbors(nodeId: string): string[] {
    return this.getIncidentEdges(nodeId).map((e) =>
      e.direction === "outgoing" ? e.edge.targetId : e.edge.sourceId,
    );
  }

  /** Clear all data from the graph. */
  clear(): void {
    this.nodes.clear();
    this.edges.clear();
    this.adjacency.clear();
    this.typeIndex.clear();
    this.edgeTypeIndex.clear();
  }

  /** Export the entire graph as a serializable object. */
  export(): { nodes: GraphNode[]; edges: GraphEdge[] } {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
    };
  }

  /** Import nodes and edges, replacing current content. */
  import(data: { nodes: GraphNode[]; edges: GraphEdge[] }): void {
    this.clear();
    for (const node of data.nodes) {
      this.addNode(node);
    }
    for (const edge of data.edges) {
      this.addEdge(edge);
    }
  }
}

// ── Property filter matching ─────────────────────────────────────────────────

/**
 * Check if a properties object matches a set of property filters.
 * All filters must match (AND logic).
 */
function matchesPropertyFilters(
  properties: Record<string, unknown>,
  filters: PropertyFilter[],
): boolean {
  return filters.every((f) => {
    const value = properties[f.key];
    const operator = f.operator ?? "eq";

    switch (operator) {
      case "eq":
        return value === f.value;
      case "neq":
        return value !== f.value;
      case "gt":
        return typeof value === "number" && typeof f.value === "number" && value > f.value;
      case "gte":
        return typeof value === "number" && typeof f.value === "number" && value >= f.value;
      case "lt":
        return typeof value === "number" && typeof f.value === "number" && value < f.value;
      case "lte":
        return typeof value === "number" && typeof f.value === "number" && value <= f.value;
      case "contains":
        if (typeof value === "string" && typeof f.value === "string") {
          return value.toLowerCase().includes(f.value.toLowerCase());
        }
        if (Array.isArray(value)) {
          return value.includes(f.value);
        }
        return false;
      default:
        return false;
    }
  });
}
