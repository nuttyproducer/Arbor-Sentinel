// src/components/graph/GraphPathFinder.tsx
//
// Path finder component: search for two entities, find and display shortest path.

import { useState, useCallback, useMemo } from "react";
import type { GraphNode, GraphEdge, GraphPath } from "../../lib/graph/types";
import { GraphDB } from "../../lib/graph/GraphDB";

export interface GraphPathFinderProps {
  /** All nodes in the graph. */
  nodes: GraphNode[];
  /** All edges in the graph. */
  edges: GraphEdge[];
  /** Callback when a path is found (or cleared). */
  onPathFound: (path: GraphPath | null) => void;
  /** Currently highlighted path (null if none). */
  highlightedPath: GraphPath | null;
}

export function GraphPathFinder({
  nodes,
  edges,
  onPathFound,
  highlightedPath,
}: GraphPathFinderProps) {
  const [sourceQuery, setSourceQuery] = useState("");
  const [targetQuery, setTargetQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Memoize a temporary GraphDB for path finding
  const graphDB = useMemo(() => {
    const db = new GraphDB();
    for (const node of nodes) {
      try { db.addNode(node); } catch { /* ignore duplicates */ }
    }
    for (const edge of edges) {
      try { db.addEdge(edge); } catch { /* ignore invalid edges */ }
    }
    return db;
  }, [nodes, edges]);

  // Filter nodes by search query
  const sourceMatches = useMemo(() => {
    if (!sourceQuery.trim()) return [];
    const lower = sourceQuery.toLowerCase();
    return nodes
      .filter((n) => n.label.toLowerCase().includes(lower))
      .slice(0, 10);
  }, [nodes, sourceQuery]);

  const targetMatches = useMemo(() => {
    if (!targetQuery.trim()) return [];
    const lower = targetQuery.toLowerCase();
    return nodes
      .filter((n) => n.label.toLowerCase().includes(lower))
      .slice(0, 10);
  }, [nodes, targetQuery]);

  const findPath = useCallback(() => {
    setError(null);

    if (!selectedSource || !selectedTarget) {
      setError("Select both a source and target node.");
      return;
    }

    if (selectedSource === selectedTarget) {
      setError("Source and target are the same node.");
      return;
    }

    try {
      const paths = graphDB.findPaths({
        sourceNodeId: selectedSource,
        targetNodeId: selectedTarget,
        algorithm: "shortest",
        maxDepth: 10,
      });

      if (paths.length === 0) {
        setError("No path found between these nodes.");
        onPathFound(null);
      } else {
        onPathFound(paths[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Path finding failed.");
      onPathFound(null);
    }
  }, [selectedSource, selectedTarget, graphDB, onPathFound]);

  const clearPath = useCallback(() => {
    setSourceQuery("");
    setTargetQuery("");
    setSelectedSource(null);
    setSelectedTarget(null);
    setError(null);
    onPathFound(null);
  }, [onPathFound]);

  return (
    <div className="graph-pathfinder w-64 shrink-0 border border-border rounded-lg bg-white p-3 text-sm">
      <h4 className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-3">
        Path Finder
      </h4>

      {/* Source node search */}
      <div className="mb-2">
        <label className="text-xs text-ink/60 block mb-1">From:</label>
        <input
          type="text"
          placeholder="Search source node…"
          value={sourceQuery}
          onChange={(e) => {
            setSourceQuery(e.target.value);
            setSelectedSource(null);
          }}
          className="w-full border border-border rounded px-2 py-1 text-xs"
        />
        {sourceMatches.length > 0 && !selectedSource && (
          <ul className="mt-1 border border-border rounded max-h-32 overflow-y-auto">
            {sourceMatches.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => {
                    setSelectedSource(n.id);
                    setSourceQuery(n.label);
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-50 truncate"
                >
                  {n.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Target node search */}
      <div className="mb-3">
        <label className="text-xs text-ink/60 block mb-1">To:</label>
        <input
          type="text"
          placeholder="Search target node…"
          value={targetQuery}
          onChange={(e) => {
            setTargetQuery(e.target.value);
            setSelectedTarget(null);
          }}
          className="w-full border border-border rounded px-2 py-1 text-xs"
        />
        {targetMatches.length > 0 && !selectedTarget && (
          <ul className="mt-1 border border-border rounded max-h-32 overflow-y-auto">
            {targetMatches.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => {
                    setSelectedTarget(n.id);
                    setTargetQuery(n.label);
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-50 truncate"
                >
                  {n.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={findPath}
          disabled={!selectedSource || !selectedTarget}
          className="flex-1 px-3 py-1.5 bg-trust text-white rounded text-xs font-medium hover:bg-trust/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Find Path
        </button>
        <button
          onClick={clearPath}
          className="px-3 py-1.5 border border-border rounded text-xs hover:bg-gray-50 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-clay mb-2">{error}</p>
      )}

      {/* Path result */}
      {highlightedPath && (
        <div className="border-t border-border pt-2 mt-2">
          <p className="text-xs text-ink/60 mb-1">
            Path found: {highlightedPath.nodes.length} nodes, {highlightedPath.edges.length} edges
          </p>
          <ol className="space-y-1">
            {highlightedPath.nodes.map((node, i) => (
              <li key={node.id} className="text-xs">
                <span className="text-ink/40 font-mono">{i + 1}.</span>{" "}
                <span className="text-ink truncate">{node.label}</span>
                {i < highlightedPath.edges.length && (
                  <span className="text-ink/30 text-[10px] block ml-4">
                    {'↓'} {highlightedPath.edges[i].label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
