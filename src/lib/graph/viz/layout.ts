// src/lib/graph/viz/layout.ts
//
// Graph layout configuration and utilities for cytoscape-based visualization.
// Provides presets for force-directed, hierarchical, and concentric layouts.

import type {
  LayoutOptions,
  CoseLayoutOptions,
  BreadthFirstLayoutOptions,
  ConcentricLayoutOptions,
} from "cytoscape";
import type { NodeType } from "../types";
import { NODE_TYPE_LABELS } from "../types";

// ── Layout presets ───────────────────────────────────────────────────────────

export type LayoutPreset = "force" | "hierarchical" | "concentric" | "circle" | "grid";

/** Get a cytoscape layout options object for a given preset. */
export function getLayoutOptions(preset: LayoutPreset): LayoutOptions {
  switch (preset) {
    case "force":
      return getForceLayout();
    case "hierarchical":
      return getHierarchicalLayout();
    case "concentric":
      return getConcentricLayout();
    case "circle":
      return { name: "circle" };
    case "grid":
      return { name: "grid", rows: undefined };
  }
}

/** Force-directed layout using cytoscape's cose (Compound Spring Embedder). */
function getForceLayout(): CoseLayoutOptions {
  return {
    name: "cose",
    animate: true,
    animationDuration: 1000,
    animationEasing: "ease-out",
    nodeRepulsion: () => 8000,
    idealEdgeLength: () => 120,
    edgeElasticity: () => 0.45,
    gravity: 0.25,
    numIter: 2000,
    initialTemp: 200,
    coolingFactor: 0.95,
    minTemp: 1.0,
    fit: true,
    padding: 30,
  };
}

/** Hierarchical layout using breadthfirst. */
function getHierarchicalLayout(): BreadthFirstLayoutOptions {
  return {
    name: "breadthfirst",
    fit: true,
    directed: true,
    padding: 30,
    spacingFactor: 1.2,
    animate: true,
    animationDuration: 800,
  };
}

/** Concentric layout grouping nodes by type. */
function getConcentricLayout(): ConcentricLayoutOptions {
  return {
    name: "concentric",
    fit: true,
    padding: 30,
    animate: true,
    animationDuration: 800,
    concentric: (node) => {
      // Group by node type: sources at center, then documents, entities, events, etc.
      const type = node.data("type") as NodeType;
      const order: NodeType[] = [
        "source", "country", "institution", "organization",
        "document", "entity", "claim", "event", "location", "action",
      ];
      return order.indexOf(type);
    },
    levelWidth: () => 2,
  };
}

// ── Color scheme ─────────────────────────────────────────────────────────────

/** Color mapping for node types. */
export const NODE_TYPE_COLORS: Record<NodeType, string> = {
  source: "#6B7280",        // gray
  document: "#3B82F6",      // blue
  entity: "#8B5CF6",        // purple
  event: "#F59E0B",         // amber
  location: "#10B981",      // green
  claim: "#EF4444",         // red
  country: "#06B6D4",       // cyan
  institution: "#6366F1",   // indigo
  organization: "#EC4899",  // pink
  action: "#14B8A6",        // teal
};

/** Color mapping for edge types. */
export const EDGE_TYPE_COLORS: Record<string, string> = {
  mentions: "#9CA3AF",
  occurs_at: "#10B981",
  involves: "#F59E0B",
  supports: "#3B82F6",
  contradicts: "#EF4444",
  related_to: "#8B5CF6",
  authored_by: "#6366F1",
  published_by: "#6B7280",
  located_in: "#06B6D4",
  part_of: "#EC4899",
};

// ── Style helpers ────────────────────────────────────────────────────────────

/** Generate cytoscape stylesheet from node/edge type color maps. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateStylesheet(): any[] {
  return [
    // Node styles by type
    ...Object.entries(NODE_TYPE_COLORS).map(([type, color]) => ({
      selector: `node[type="${type}"]`,
      style: {
        "background-color": color,
        label: "data(label)",
        "text-valign": "bottom",
        "text-halign": "center",
        "text-margin-y": 6,
        "font-size": "11px",
        "font-family": "Inter, system-ui, sans-serif",
        color: "#374151",
        "text-wrap": "ellipsis",
        "text-max-width": "120px",
        "border-width": 2,
        "border-color": color,
        width: 28,
        height: 28,
      },
    })),
    // Selected node
    {
      selector: "node:selected",
      style: {
        "border-width": 3,
        "border-color": "#1D4ED8",
        "background-opacity": 1,
      },
    },
    // Edge styles
    ...Object.entries(EDGE_TYPE_COLORS).map(([type, color]) => ({
      selector: `edge[type="${type}"]`,
      style: {
        "line-color": color,
        "target-arrow-color": color,
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
        width: 1.5,
        label: "data(label)",
        "font-size": "9px",
        "font-family": "Inter, system-ui, sans-serif",
        color: "#6B7280",
        "text-opacity": 0.7,
      },
    })),
    // Selected / highlighted edges
    {
      selector: "edge.highlighted",
      style: {
        width: 3,
        "line-opacity": 1,
        "text-opacity": 1,
      },
    },
    // Dimmed (non-highlighted) nodes
    {
      selector: "node.dimmed",
      style: {
        opacity: 0.3,
      },
    },
    // Dimmed edges
    {
      selector: "edge.dimmed",
      style: {
        opacity: 0.15,
      },
    },
  ];
}

/**
 * Convert GraphDB nodes and edges to cytoscape elements.
 */
export function toCytoscapeElements(
  nodes: Array<{ id: string; type: NodeType; label: string; properties: Record<string, unknown> }>,
  edges: Array<{ id: string; type: string; sourceId: string; targetId: string; label: string; weight?: number; properties: Record<string, unknown> }>,
): cytoscape.ElementDefinition[] {
  const elements: cytoscape.ElementDefinition[] = [
    ...nodes.map((n) => ({
      data: {
        id: n.id,
        label: n.label,
        type: n.type,
        ...n.properties,
      },
    })),
    ...edges.map((e) => ({
      data: {
        id: e.id,
        source: e.sourceId,
        target: e.targetId,
        label: e.label,
        type: e.type,
        weight: e.weight,
        ...e.properties,
      },
    })),
  ];
  return elements;
}

// Re-export for convenience
export { NODE_TYPE_LABELS };
