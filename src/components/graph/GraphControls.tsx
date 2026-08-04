// src/components/graph/GraphControls.tsx
//
// Controls toolbar for the graph explorer: layout selector, zoom, filter by type, search.

import type { NodeType } from "../../lib/graph/types";
import { NODE_TYPE_LABELS, NODE_TYPE_COLORS } from "../../lib/graph/viz/layout";
import type { LayoutPreset } from "../../lib/graph/viz/layout";

export interface GraphControlsProps {
  currentLayout: LayoutPreset;
  onLayoutChange: (preset: LayoutPreset) => void;
  onSearch: (query: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  searchQuery: string;
  visibleTypes: Set<NodeType>;
  onTypeToggle: (type: NodeType) => void;
  nodeCount: number;
  edgeCount: number;
}

const LAYOUT_OPTIONS: { value: LayoutPreset; label: string }[] = [
  { value: "force", label: "Force" },
  { value: "hierarchical", label: "Hierarchical" },
  { value: "concentric", label: "Concentric" },
  { value: "circle", label: "Circle" },
  { value: "grid", label: "Grid" },
];

const ALL_NODE_TYPES: NodeType[] = [
  "source", "document", "entity", "event", "location",
  "claim", "country", "institution", "organization", "action",
];

export function GraphControls({
  currentLayout,
  onLayoutChange,
  onSearch,
  onZoomIn,
  onZoomOut,
  onFit,
  searchQuery,
  visibleTypes,
  onTypeToggle,
  nodeCount,
  edgeCount,
}: GraphControlsProps) {
  return (
    <div
      className="graph-controls flex flex-wrap items-center gap-2 p-3 bg-white border border-border rounded-lg mb-3 text-sm"
      role="toolbar"
      aria-label="Graph controls"
    >
      {/* Layout selector */}
      <div className="flex items-center gap-1">
        <label htmlFor="graph-layout" className="text-ink/60 text-xs font-medium">
          Layout:
        </label>
        <select
          id="graph-layout"
          value={currentLayout}
          onChange={(e) => onLayoutChange(e.target.value as LayoutPreset)}
          className="border border-border rounded px-2 py-1 text-xs bg-white"
        >
          {LAYOUT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-1 border-l border-border pl-2">
        <button
          onClick={onZoomOut}
          className="px-2 py-1 border border-border rounded text-xs hover:bg-gray-50"
          aria-label="Zoom out"
          title="Zoom out"
        >
          −
        </button>
        <button
          onClick={onFit}
          className="px-2 py-1 border border-border rounded text-xs hover:bg-gray-50"
          aria-label="Fit to screen"
          title="Fit to screen"
        >
          ⊡
        </button>
        <button
          onClick={onZoomIn}
          className="px-2 py-1 border border-border rounded text-xs hover:bg-gray-50"
          aria-label="Zoom in"
          title="Zoom in"
        >
          +
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-1 border-l border-border pl-2">
        <label htmlFor="graph-search" className="sr-only">
          Search nodes
        </label>
        <input
          id="graph-search"
          type="text"
          placeholder="Search nodes…"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="border border-border rounded px-2 py-1 text-xs w-40"
        />
      </div>

      {/* Type filter */}
      <div className="flex items-center gap-1 flex-wrap border-l border-border pl-2">
        {ALL_NODE_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => onTypeToggle(type)}
            className={`px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${
              visibleTypes.size === 0 || visibleTypes.has(type)
                ? "ring-1 ring-offset-1"
                : "opacity-40"
            }`}
            style={{
              backgroundColor: visibleTypes.size === 0 || visibleTypes.has(type)
                ? NODE_TYPE_COLORS[type] + "20"
                : "transparent",
              color: NODE_TYPE_COLORS[type],
              borderColor: NODE_TYPE_COLORS[type],
              borderWidth: "1px",
            }}
            title={`Toggle ${NODE_TYPE_LABELS[type]}`}
            aria-pressed={visibleTypes.size === 0 || visibleTypes.has(type)}
          >
            {NODE_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Count indicator */}
      <div className="ml-auto text-xs text-ink/50 font-mono">
        {nodeCount} nodes · {edgeCount} edges
      </div>
    </div>
  );
}
