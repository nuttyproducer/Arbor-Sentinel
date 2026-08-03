import { useMapContext } from "./MapContext";
import { LAYER_GROUP_LABELS, type LayerGroup, type MapLayerConfig } from "../../lib/map/types";

interface MapLegendProps {
  layers: MapLayerConfig[];
  className?: string;
}

export function MapLegend({ layers, className = "" }: MapLegendProps) {
  const { layerVisibility } = useMapContext();

  const visibleLayers = layers.filter((l) => {
    const vis = layerVisibility[l.id];
    return vis !== undefined ? vis : l.defaultVisible;
  });

  if (visibleLayers.length === 0) return null;

  // Group visible layers by group
  const grouped = visibleLayers.reduce<Record<LayerGroup, MapLayerConfig[]>>((acc, l) => {
    if (!acc[l.group]) acc[l.group] = [];
    acc[l.group].push(l);
    return acc;
  }, {} as Record<LayerGroup, MapLayerConfig[]>);

  return (
    <div
      className={`absolute bottom-8 left-3 z-20 bg-bone/95 border border-charcoal/20 rounded-lg p-3 max-w-[220px] text-xs ${className}`}
      aria-label="Map legend"
    >
      <h3 className="font-mono text-[10px] uppercase tracking-widest text-charcoal/60 mb-2">
        Legend
      </h3>
      {Object.entries(grouped).map(([group, groupLayers]) => (
        <div key={group} className="mb-2 last:mb-0">
          <p className="font-mono text-[10px] font-semibold text-charcoal/80 mb-1">
            {LAYER_GROUP_LABELS[group as LayerGroup]}
          </p>
          {groupLayers.map((l) => (
            <div key={l.id} className="flex items-center gap-2 py-0.5">
              <span
                className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: l.style.color }}
                aria-hidden="true"
              />
              <span className="text-charcoal/80 truncate">{l.label}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
