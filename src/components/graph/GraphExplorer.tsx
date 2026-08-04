// src/components/graph/GraphExplorer.tsx
//
// Main graph visualization component using cytoscape.js.
// Force-directed layout, zoom/pan, node selection, connected node highlighting.

import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import cytoscape from "cytoscape";
import type { Core, EventObject } from "cytoscape";
import type { GraphNode, GraphEdge, NodeType, GraphPath } from "../../lib/graph/types";
import {
  getLayoutOptions,
  generateStylesheet,
  toCytoscapeElements,
} from "../../lib/graph/viz/layout";
import type { LayoutPreset } from "../../lib/graph/viz/layout";
import { GraphControls } from "./GraphControls";
import { GraphInspector } from "./GraphInspector";
import { GraphPathFinder } from "./GraphPathFinder";

// ── Props ────────────────────────────────────────────────────────────────────

export interface GraphExplorerProps {
  /** Nodes to display. */
  nodes: GraphNode[];
  /** Edges to display. */
  edges: GraphEdge[];
  /** Initial layout preset. */
  initialLayout?: LayoutPreset;
  /** Whether to show the controls toolbar. */
  showControls?: boolean;
  /** Whether to show the inspector panel. */
  showInspector?: boolean;
  /** Whether to show the path finder. */
  showPathFinder?: boolean;
  /** Callback when a node is selected. */
  onNodeSelect?: (node: GraphNode | null) => void;
  /** Callback when a path is found. */
  onPathFound?: (path: GraphPath | null) => void;
  /** CSS class for the container. */
  className?: string;
  /** Height override (default: "600px"). */
  height?: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export function GraphExplorer({
  nodes,
  edges,
  initialLayout = "force",
  showControls = true,
  showInspector = true,
  showPathFinder = true,
  onNodeSelect,
  onPathFound,
  className = "",
  height = "600px",
}: GraphExplorerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [currentLayout, setCurrentLayout] = useState<LayoutPreset>(initialLayout);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleTypes, setVisibleTypes] = useState<Set<NodeType>>(new Set());
  const [nodeCount, setNodeCount] = useState(nodes.length);
  const [edgeCount, setEdgeCount] = useState(edges.length);
  const [highlightedPath, setHighlightedPath] = useState<GraphPath | null>(null);

  // Convert nodes/edges to cytoscape elements
  const elements = useMemo(
    () => toCytoscapeElements(nodes, edges),
    [nodes, edges],
  );

  // Initialize cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: generateStylesheet(),
      layout: getLayoutOptions(currentLayout),
      minZoom: 0.1,
      maxZoom: 3,
      wheelSensitivity: 0.3,
    });

    cyRef.current = cy;

    // Selection handler
    const onSelect = (evt: EventObject) => {
      const node = evt.target;
      if (node.isNode()) {
        const nodeData = node.data();
        const graphNode = nodes.find((n) => n.id === nodeData.id) ?? null;
        setSelectedNode(graphNode);
        onNodeSelect?.(graphNode);

        // Highlight connected nodes
        highlightConnected(cy, nodeData.id);
      }
    };

    const onUnselect = () => {
      setSelectedNode(null);
      clearHighlight(cy);
    };

    cy.on("select", "node", onSelect);
    cy.on("unselect", "node", onUnselect);
    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        clearHighlight(cy);
      }
    });

    setNodeCount(nodes.length);
    setEdgeCount(edges.length);

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
    // Only re-initialize when elements change significantly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements.map((e) => e.data.id).join(",")]);

  // Update layout when preset changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const layout = cy.layout(getLayoutOptions(currentLayout));
    layout.run();
  }, [currentLayout]);

  // Filter by type
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    if (visibleTypes.size === 0) {
      cy.elements().style("display", "element");
    } else {
      cy.nodes().forEach((node) => {
        const type = node.data("type") as NodeType;
        node.style("display", visibleTypes.has(type) ? "element" : "none");
      });
      // Hide edges that connect to hidden nodes
      cy.edges().forEach((edge) => {
        const source = edge.source();
        const target = edge.target();
        const sourceHidden = source.style("display") === "none";
        const targetHidden = target.style("display") === "none";
        edge.style("display", sourceHidden || targetHidden ? "none" : "element");
      });
    }
  }, [visibleTypes]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleLayoutChange = useCallback((preset: LayoutPreset) => {
    setCurrentLayout(preset);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    const cy = cyRef.current;
    if (!cy) return;

    if (!query.trim()) {
      clearHighlight(cy);
      return;
    }

    const lower = query.toLowerCase();
    const matched = cy.nodes().filter((node) => {
      const label = (node.data("label") as string).toLowerCase();
      return label.includes(lower);
    });

    cy.nodes().addClass("dimmed");
    cy.edges().addClass("dimmed");
    matched.removeClass("dimmed");
    matched.addClass("highlighted");
  }, []);

  const handleZoomIn = useCallback(() => {
    cyRef.current?.zoom(cyRef.current.zoom() * 1.2);
  }, []);

  const handleZoomOut = useCallback(() => {
    cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  }, []);

  const handleFit = useCallback(() => {
    cyRef.current?.fit(undefined, 30);
  }, []);

  const handleTypeToggle = useCallback((type: NodeType) => {
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const handleNodeSelect = useCallback((nodeId: string) => {
    const cy = cyRef.current;
    if (!cy) return;
    const cyNode = cy.getElementById(nodeId);
    if (cyNode.length > 0) {
      cyNode.emit("select");
      cy.center(cyNode);
    }
  }, []);

  const handlePathFound = useCallback((path: GraphPath | null) => {
    setHighlightedPath(path);
    const cy = cyRef.current;
    if (!cy) return;

    clearHighlight(cy);

    if (path) {
      // Highlight path nodes and edges
      const nodeIds = new Set(path.nodes.map((n) => n.id));
      const edgeIds = new Set(path.edges.map((e) => e.id));

      cy.nodes().addClass("dimmed");
      cy.edges().addClass("dimmed");

      cy.nodes().forEach((node) => {
        if (nodeIds.has(node.data("id"))) {
          node.removeClass("dimmed");
        }
      });
      cy.edges().forEach((edge) => {
        if (edgeIds.has(edge.data("id"))) {
          edge.removeClass("dimmed");
          edge.addClass("highlighted");
        }
      });

      cy.fit(cy.nodes().filter((n) => nodeIds.has(n.data("id"))), 50);
    }

    onPathFound?.(path);
  }, [onPathFound]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={`graph-explorer ${className}`}>
      {showControls && (
        <GraphControls
          currentLayout={currentLayout}
          onLayoutChange={handleLayoutChange}
          onSearch={handleSearch}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFit={handleFit}
          searchQuery={searchQuery}
          visibleTypes={visibleTypes}
          onTypeToggle={handleTypeToggle}
          nodeCount={nodeCount}
          edgeCount={edgeCount}
        />
      )}

      <div className="graph-explorer-main" style={{ display: "flex", gap: "1rem" }}>
        <div
          ref={containerRef}
          className="graph-canvas"
          style={{
            flex: 1,
            height,
            border: "1px solid var(--color-border, #E5E7EB)",
            borderRadius: "0.5rem",
            background: "var(--color-bg, #F9FAFB)",
          }}
        />

        {showInspector && selectedNode && (
          <GraphInspector
            node={selectedNode}
            edges={edges}
            nodes={nodes}
            onNodeSelect={handleNodeSelect}
            onClose={() => setSelectedNode(null)}
          />
        )}

        {showPathFinder && (
          <GraphPathFinder
            nodes={nodes}
            edges={edges}
            onPathFound={handlePathFound}
            highlightedPath={highlightedPath}
          />
        )}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function highlightConnected(cy: Core, nodeId: string): void {
  clearHighlight(cy);

  const node = cy.getElementById(nodeId);
  if (node.length === 0) return;

  const connected = node.closedNeighborhood();
  cy.nodes().addClass("dimmed");
  cy.edges().addClass("dimmed");
  connected.removeClass("dimmed");
}

function clearHighlight(cy: Core): void {
  cy.nodes().removeClass("dimmed");
  cy.edges().removeClass("dimmed").removeClass("highlighted");
}
