import { useState } from "react";
import { useMapContext } from "./MapContext";
import {
  LAYER_GROUP_LABELS,
  type MapLayerConfig,
  type LayerGroup,
  type LayerVisibility,
} from "../../lib/map/types";

interface LayerGroupControlProps {
  layers: MapLayerConfig[];
  className?: string;
}

function LayerCheckbox({
  config,
  checked,
  onChange,
  layerVisibility,
  depth = 0,
}: {
  config: MapLayerConfig;
  checked: boolean;
  onChange: (id: string, visible: boolean) => void;
  layerVisibility: LayerVisibility;
  depth?: number;
}) {
  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <label className="flex items-center gap-2 py-1 cursor-pointer text-sm text-charcoal/80 hover:text-charcoal">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(config.id, e.target.checked)}
          className="rounded border-charcoal/30 text-trust focus:ring-trust"
        />
        <span
          className="inline-block w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: config.style.color }}
          aria-hidden="true"
        />
        {config.label}
      </label>
      {config.subLayers?.map((sub) => (
        <LayerCheckbox
          key={sub.id}
          config={sub}
          checked={layerVisibility[sub.id] ?? sub.defaultVisible}
          onChange={onChange}
          layerVisibility={layerVisibility}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export function LayerGroupControl({ layers, className = "" }: LayerGroupControlProps) {
  const { setLayerVisibility, toggleLayerGroup, layerVisibility } = useMapContext();
  const [expandedGroups, setExpandedGroups] = useState<Set<LayerGroup>>(
    new Set(["events", "sources"])
  );

  // Group layers by config.group
  const grouped = layers.reduce<Record<LayerGroup, MapLayerConfig[]>>((acc, l) => {
    if (!acc[l.group]) acc[l.group] = [];
    acc[l.group].push(l);
    return acc;
  }, {} as Record<LayerGroup, MapLayerConfig[]>);

  const toggleExpand = (group: LayerGroup) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  return (
    <div className={`bg-bone/95 border border-charcoal/20 rounded-lg p-3 text-xs ${className}`}>
      <h3 className="font-mono text-[10px] uppercase tracking-widest text-charcoal/60 mb-2">
        Layers
      </h3>
      {Object.entries(grouped).map(([group, groupLayers]) => {
        const grp = group as LayerGroup;
        const isExpanded = expandedGroups.has(grp);
        return (
          <div key={group} className="mb-2 last:mb-0">
            <button
              onClick={() => toggleExpand(grp)}
              className="flex items-center gap-1 w-full text-left font-mono text-[10px] font-semibold text-charcoal/80 hover:text-ink py-0.5"
              aria-expanded={isExpanded}
            >
              <span className="text-[8px]">{isExpanded ? "▼" : "▶"}</span>
              <span
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerGroup(grp);
                }}
              >
                {LAYER_GROUP_LABELS[grp]}
              </span>
            </button>
            {isExpanded &&
              groupLayers.map((l) => (
                <LayerCheckbox
                  key={l.id}
                  config={l}
                  checked={layerVisibility[l.id] ?? l.defaultVisible}
                  onChange={setLayerVisibility}
                  layerVisibility={layerVisibility}
                />
              ))}
          </div>
        );
      })}
    </div>
  );
}
