// src/components/graph/GraphInspector.tsx
//
// Inspector panel for the graph explorer: selected node details,
// connected nodes grouped by relationship type.

import { useMemo } from "react";
import type { GraphNode, GraphEdge, EdgeType } from "../../lib/graph/types";
import { EDGE_TYPE_LABELS, NODE_TYPE_LABELS } from "../../lib/graph/types";
import { NODE_TYPE_COLORS } from "../../lib/graph/viz/layout";

export interface GraphInspectorProps {
  /** The selected node. */
  node: GraphNode;
  /** All edges in the graph (to find connections). */
  edges: GraphEdge[];
  /** All nodes in the graph (to resolve connected node IDs). */
  nodes: GraphNode[];
  /** Callback when a connected node is clicked. */
  onNodeSelect?: (nodeId: string) => void;
  /** Callback to close the inspector. */
  onClose?: () => void;
}

interface GroupedConnection {
  edgeType: EdgeType;
  label: string;
  connectedNodes: GraphNode[];
}

export function GraphInspector({
  node,
  edges,
  nodes,
  onNodeSelect,
  onClose,
}: GraphInspectorProps) {
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    for (const n of nodes) map.set(n.id, n);
    return map;
  }, [nodes]);

  const connections = useMemo((): GroupedConnection[] => {
    const incident = edges.filter(
      (e) => e.sourceId === node.id || e.targetId === node.id,
    );

    const groups = new Map<EdgeType, GraphNode[]>();

    for (const edge of incident) {
      const connectedId = edge.sourceId === node.id ? edge.targetId : edge.sourceId;
      const connectedNode = nodeMap.get(connectedId);
      if (!connectedNode) continue;

      if (!groups.has(edge.type)) {
        groups.set(edge.type, []);
      }
      groups.get(edge.type)!.push(connectedNode);
    }

    return Array.from(groups.entries()).map(([edgeType, connectedNodes]) => ({
      edgeType,
      label: EDGE_TYPE_LABELS[edgeType] || edgeType,
      connectedNodes,
    }));
  }, [edges, node.id, nodeMap]);

  const propertyEntries = Object.entries(node.properties).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );

  return (
    <div
      className="graph-inspector w-72 shrink-0 border border-border rounded-lg bg-white overflow-y-auto"
      style={{ maxHeight: "600px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: NODE_TYPE_COLORS[node.type] }}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-ink truncate">
              {node.label}
            </h3>
            <p className="text-xs text-ink/50">
              {NODE_TYPE_LABELS[node.type]}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-ink/40 hover:text-ink text-lg leading-none px-1"
            aria-label="Close inspector"
          >
            ×
          </button>
        )}
      </div>

      {/* Properties */}
      {propertyEntries.length > 0 && (
        <div className="p-3 border-b border-border">
          <h4 className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-2">
            Properties
          </h4>
          <dl className="space-y-1">
            {propertyEntries.slice(0, 8).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-2 text-xs">
                <dt className="text-ink/50 truncate">{key}</dt>
                <dd className="text-ink font-mono truncate text-right">
                  {typeof value === "object"
                    ? JSON.stringify(value).slice(0, 60)
                    : String(value).slice(0, 80)}
                </dd>
              </div>
            ))}
            {propertyEntries.length > 8 && (
              <p className="text-xs text-ink/40">
                +{propertyEntries.length - 8} more properties
              </p>
            )}
          </dl>
        </div>
      )}

      {/* Connected nodes */}
      <div className="p-3">
        <h4 className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-2">
          Connections ({connections.reduce((sum, g) => sum + g.connectedNodes.length, 0)})
        </h4>
        {connections.length === 0 ? (
          <p className="text-xs text-ink/40 italic">No connections found.</p>
        ) : (
          <div className="space-y-2">
            {connections.map((group) => (
              <div key={group.edgeType}>
                <h5 className="text-xs font-medium text-ink/60 mb-1">
                  {group.label} ({group.connectedNodes.length})
                </h5>
                <ul className="space-y-0.5">
                  {group.connectedNodes.slice(0, 10).map((connectedNode) => (
                    <li key={connectedNode.id}>
                      <button
                        onClick={() => onNodeSelect?.(connectedNode.id)}
                        className="flex items-center gap-1.5 w-full text-left px-1.5 py-0.5 rounded hover:bg-gray-50 text-xs transition-colors"
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor: NODE_TYPE_COLORS[connectedNode.type],
                          }}
                          aria-hidden="true"
                        />
                        <span className="text-ink truncate">{connectedNode.label}</span>
                        <span className="text-ink/30 text-[10px] ml-auto shrink-0">
                          {NODE_TYPE_LABELS[connectedNode.type]}
                        </span>
                      </button>
                    </li>
                  ))}
                  {group.connectedNodes.length > 10 && (
                    <li className="text-xs text-ink/40 pl-5">
                      +{group.connectedNodes.length - 10} more
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
