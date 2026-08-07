// src/lib/graph/GraphPersistence.ts
// Bridges the in-memory GraphDB to Supabase's graph_nodes/graph_edges tables.
// Handles bulk-upsert of nodes and edges with idempotent merge semantics.

import { supabase } from "../db/client";
import type { GraphNode, GraphEdge } from "./types";

// ── Save ──────────────────────────────────────────────────────────────────────

/**
 * Persist an in-memory GraphDB to the graph_nodes and graph_edges tables.
 * Existing nodes/edges (matched by id) are upserted; new ones inserted.
 * Best-effort — errors are logged but never thrown.
 */
export async function saveGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
): Promise<{ nodesInserted: number; edgesInserted: number; errors: string[] }> {
  const errors: string[] = [];

  // ── Upsert nodes ───────────────────────────────────────────────────────
  let nodesInserted = 0;
  if (nodes.length > 0) {
    const nodeRows = nodes.map((n) => ({
      id: n.id,
      type: n.type,
      label: n.label,
      properties: { ...n.properties, label: n.label },
      updated_at: new Date().toISOString(),
    }));

    const { error: nodeError } = await supabase
      .from("graph_nodes")
      .upsert(nodeRows, { onConflict: "id" });

    if (nodeError) {
      errors.push(`graph_nodes upsert: ${nodeError.message}`);
    } else {
      nodesInserted = nodes.length;
    }
  }

  // ── Upsert edges ───────────────────────────────────────────────────────
  let edgesInserted = 0;
  if (edges.length > 0) {
    const edgeRows = edges.map((e) => ({
      id: e.id,
      type: e.type,
      source_id: e.sourceId,
      target_id: e.targetId,
      properties: { ...e.properties, label: e.label },
    }));

    const { error: edgeError } = await supabase
      .from("graph_edges")
      .upsert(edgeRows, { onConflict: "id" });

    if (edgeError) {
      errors.push(`graph_edges upsert: ${edgeError.message}`);
    } else {
      edgesInserted = edges.length;
    }
  }

  return { nodesInserted, edgesInserted, errors };
}

// ── Load ──────────────────────────────────────────────────────────────────────

/**
 * Load persisted graph data from Supabase into GraphNode/GraphEdge arrays.
 * Used to hydrate a GraphDB instance on startup.
 */
export async function loadGraph(): Promise<{
  nodes: GraphNode[];
  edges: GraphEdge[];
}> {
  const { data: nodeRows, error: nodeError } = await supabase
    .from("graph_nodes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10000);

  if (nodeError) {
    console.warn("[GraphPersistence] Failed to load graph nodes:", nodeError.message);
    return { nodes: [], edges: [] };
  }

  const { data: edgeRows, error: edgeError } = await supabase
    .from("graph_edges")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50000);

  if (edgeError) {
    console.warn("[GraphPersistence] Failed to load graph edges:", edgeError.message);
    return { nodes: [], edges: [] };
  }

  const nodes: GraphNode[] = (nodeRows as Array<{
    id: string; type: string; label: string;
    properties: Record<string, unknown>; created_at: string; updated_at: string;
  }>).map((r) => ({
    id: r.id,
    type: r.type as GraphNode["type"],
    label: (r.properties?.label as string) ?? r.label,
    properties: r.properties ?? {},
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  const edges: GraphEdge[] = (edgeRows as Array<{
    id: string; type: string; source_id: string; target_id: string;
    properties: Record<string, unknown>; created_at: string;
  }>).map((r) => ({
    id: r.id,
    type: r.type as GraphEdge["type"],
    sourceId: r.source_id,
    targetId: r.target_id,
    label: (r.properties?.label as string) ?? r.type,
    properties: r.properties ?? {},
    createdAt: r.created_at,
  }));

  return { nodes, edges };
}

// ── Clear ─────────────────────────────────────────────────────────────────────

/**
 * Delete all graph nodes and edges for a specific source.
 * Used before re-populating a source's graph data.
 */
export async function clearSourceGraph(sourceId: string): Promise<void> {
  // Delete edges where either endpoint is a node owned by this source
  await supabase
    .from("graph_edges")
    .delete()
    .or(`source_id.in.(select id from graph_nodes where properties->>'sourceId' eq '${sourceId}'),target_id.in.(select id from graph_nodes where properties->>'sourceId' eq '${sourceId}')`);

  // Delete nodes owned by this source
  await supabase
    .from("graph_nodes")
    .delete()
    .filter("properties->>sourceId", "eq", sourceId);
}
