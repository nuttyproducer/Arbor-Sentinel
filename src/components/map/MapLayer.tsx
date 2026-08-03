// src/components/map/MapLayer.tsx
import { useEffect, useRef } from "react";
import { useMapContext } from "./MapContext";
import type { MapLayerConfig } from "../../lib/map/types";
import { createGeoJSONSource } from "../../lib/map/sources";
import { createLayerSpec } from "../../lib/map/layers";

interface MapLayerProps {
  config: MapLayerConfig;
  visible?: boolean;
  beforeId?: string;
}

/**
 * Zero-render component. Adds a GeoJSON source + layer to the MapLibre map
 * on mount, updates visibility/reactivity via native MapLibre API on prop
 * changes, and cleans up on unmount. Returns null — no DOM output.
 *
 * The mount effect depends on `map` (not `[]`) because MapContainer exposes
 * `map: null` until the map's "load" event fires; with `[]` deps the effect
 * would run once against `null` and never attach the source/layer. `addedRef`
 * guards against double-adding when the map reference is stable.
 */
export function MapLayer({ config, visible = true, beforeId }: MapLayerProps): null {
  const { map } = useMapContext();
  const addedRef = useRef(false);
  const sourceId = `${config.id}--source`;

  // Add source + layer on mount (or once the map becomes available)
  useEffect(() => {
    if (!map || addedRef.current) return;

    const source = createGeoJSONSource(config.features);
    map.addSource(sourceId, source);
    const layerSpec = createLayerSpec(config, sourceId);
    map.addLayer(layerSpec, beforeId);
    addedRef.current = true;

    return () => {
      if (map.getLayer(config.id)) {
        map.removeLayer(config.id);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
      addedRef.current = false;
    };
  }, [map]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update visibility
  useEffect(() => {
    if (!map || !addedRef.current) return;
    const visibility = visible ? "visible" : "none";
    map.setLayoutProperty(config.id, "visibility", visibility);
  }, [map, visible, config.id]);

  return null;
}
