// src/lib/graph/GraphAPI.ts
// Query functions for the persisted knowledge graph.
// Used by entity pages, timeline, maps, and graph explorer to read
// from graph_nodes/graph_edges tables (populated by GraphPersistence).

import { supabase } from "../db/client";

// ── Types ────────────────────────────────────────────────────────────────────

export interface GraphNodeRow {
  id: string;
  type: string;
  label: string;
  properties: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GraphEdgeRow {
  id: string;
  type: string;
  source_id: string;
  target_id: string;
  properties: Record<string, unknown>;
  created_at: string;
}

export interface SubgraphResult {
  nodes: GraphNodeRow[];
  edges: GraphEdgeRow[];
}

// ── Queries ──────────────────────────────────────────────────────────────────

/**
 * Get a node and its neighborhood (nodes within `depth` hops).
 * For entity detail pages.
 */
export async function getEntitySubgraph(
  nodeId: string,
  depth = 2,
): Promise<SubgraphResult> {
  // Start with the target node
  const { data: node } = await supabase
    .from("graph_nodes")
    .select("*")
    .eq("id", nodeId)
    .single();

  if (!node) return { nodes: [], edges: [] };

  const seen = new Set<string>([nodeId]);
  let frontier = new Set<string>([nodeId]);
  const allNodes: GraphNodeRow[] = [node as GraphNodeRow];
  const allEdges: GraphEdgeRow[] = [];

  for (let hop = 0; hop < depth; hop++) {
    if (frontier.size === 0) break;
    const frontierArr = Array.from(frontier);

    // Get edges connected to frontier nodes
    const { data: edges } = await supabase
      .from("graph_edges")
      .select("*")
      .or(`source_id.in.(${frontierArr.map((id) => `'${id}'`).join(",")}),target_id.in.(${frontierArr.map((id) => `'${id}'`).join(",")})`)
      .limit(500);

    if (!edges || edges.length === 0) break;

    const nextFrontier = new Set<string>();
    for (const edge of edges as GraphEdgeRow[]) {
      allEdges.push(edge);
      if (!seen.has(edge.source_id)) {
        seen.add(edge.source_id);
        nextFrontier.add(edge.source_id);
      }
      if (!seen.has(edge.target_id)) {
        seen.add(edge.target_id);
        nextFrontier.add(edge.target_id);
      }
    }

    // Fetch newly discovered nodes
    const nextArr = Array.from(nextFrontier);
    if (nextArr.length > 0) {
      const { data: newNodes } = await supabase
        .from("graph_nodes")
        .select("*")
        .in("id", nextArr)
        .limit(500);

      if (newNodes) {
        for (const n of newNodes as GraphNodeRow[]) {
          allNodes.push(n);
        }
      }
    }

    frontier = nextFrontier;
  }

  return { nodes: allNodes, edges: allEdges };
}

/**
 * Get all graph nodes of a specific type. For timeline (type="event") and maps (type="location").
 */
export async function getNodesByType(
  nodeType: string,
  limit = 500,
): Promise<GraphNodeRow[]> {
  const { data } = await supabase
    .from("graph_nodes")
    .select("*")
    .eq("type", nodeType)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data as GraphNodeRow[]) ?? [];
}

/**
 * Get edges between nodes of specific types. For relationship visualization.
 */
export async function getEdgesByType(
  edgeType: string,
  limit = 500,
): Promise<GraphEdgeRow[]> {
  const { data } = await supabase
    .from("graph_edges")
    .select("*")
    .eq("type", edgeType)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data as GraphEdgeRow[]) ?? [];
}

/**
 * Get the full graph (all nodes and edges). For the GraphExplorer page.
 * Paginated to avoid overwhelming the client.
 */
export async function getFullGraph(
  pageSize = 200,
  page = 0,
): Promise<SubgraphResult> {
  const { data: nodes } = await supabase
    .from("graph_nodes")
    .select("*")
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  const { data: edges } = await supabase
    .from("graph_edges")
    .select("*")
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  return {
    nodes: (nodes as GraphNodeRow[]) ?? [],
    edges: (edges as GraphEdgeRow[]) ?? [],
  };
}

/**
 * Get graph statistics (counts by node/edge type).
 */
export async function getGraphStats(): Promise<{
  nodeCounts: Record<string, number>;
  edgeCounts: Record<string, number>;
  totalNodes: number;
  totalEdges: number;
}> {
  const { count: totalNodes } = await supabase
    .from("graph_nodes")
    .select("*", { count: "exact", head: true });

  const { count: totalEdges } = await supabase
    .from("graph_edges")
    .select("*", { count: "exact", head: true });

  const { data: nodeRows } = await supabase
    .from("graph_nodes")
    .select("type");

  const { data: edgeRows } = await supabase
    .from("graph_edges")
    .select("type");

  const nodeCounts: Record<string, number> = {};
  for (const n of (nodeRows as Array<{ type: string }>) ?? []) {
    nodeCounts[n.type] = (nodeCounts[n.type] ?? 0) + 1;
  }

  const edgeCounts: Record<string, number> = {};
  for (const e of (edgeRows as Array<{ type: string }>) ?? []) {
    edgeCounts[e.type] = (edgeCounts[e.type] ?? 0) + 1;
  }

  return {
    nodeCounts,
    edgeCounts,
    totalNodes: totalNodes ?? 0,
    totalEdges: totalEdges ?? 0,
  };
}
