// src/components/map/MapContainer.tsx
import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapContext, type MapContextValue } from "./MapContext";
import type { MapViewport, LayerVisibility, LayerGroup, MapLayerConfig } from "../../lib/map/types";

interface MapContainerProps {
  initialViewport?: MapViewport;
  style?: string;
  /** All layer configs rendered inside the map. Used by group-level toggles. */
  layerConfigs?: MapLayerConfig[];
  children: ReactNode;
}

const DEFAULT_VIEWPORT: MapViewport = {
  center: [0, 0],
  zoom: 2,
};

const OSM_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    "osm-tiles": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm-tiles",
      type: "raster",
      source: "osm-tiles",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export function MapContainer({
  initialViewport = DEFAULT_VIEWPORT,
  style,
  layerConfigs,
  children,
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [layerVisibility, setLayerVisibilityState] = useState<LayerVisibility>({});

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const mapInstance = new maplibregl.Map({
      container: containerRef.current,
      style: style ?? OSM_STYLE,
      center: initialViewport.center,
      zoom: initialViewport.zoom,
      // attributionControl defaults to enabled — maplibre-gl v6 types only
      // accept `false | AttributionControlOptions`, not `true`.
    });

    mapRef.current = mapInstance;

    mapInstance.on("load", () => {
      setMap(mapInstance);
    });

    return () => {
      mapInstance.remove();
      mapRef.current = null;
      setMap(null);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      mapRef.current?.resize();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const setLayerVisibility = useCallback((id: string, visible: boolean) => {
    setLayerVisibilityState((prev) => ({ ...prev, [id]: visible }));
  }, []);

  const toggleLayerGroup = useCallback((group: LayerGroup) => {
    const groupLayers = (layerConfigs ?? []).filter((l) => l.group === group);
    if (groupLayers.length === 0) return;
    setLayerVisibilityState((prev) => {
      // Toggle: if any layer in the group is visible, hide all; otherwise
      // show all. Writes real per-layer ids into layerVisibility, which
      // MapLayer reads via context — no synthetic keys.
      const anyVisible = groupLayers.some((l) => prev[l.id] ?? l.defaultVisible);
      const next = { ...prev };
      for (const l of groupLayers) {
        next[l.id] = !anyVisible;
      }
      return next;
    });
  }, [layerConfigs]);

  const contextValue: MapContextValue = {
    map,
    layerVisibility,
    setLayerVisibility,
    toggleLayerGroup,
  };

  return (
    <MapContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className="map-container w-full h-full min-h-[400px] relative"
        aria-label="Interactive map of documented events, sources, organizations, legal jurisdictions, and infrastructure"
        role="application"
      >
        {!map && (
          <div className="absolute inset-0 flex items-center justify-center bg-bone z-10">
            <p className="font-mono text-sm text-charcoal/60">Loading map…</p>
          </div>
        )}
      </div>
      {children}
    </MapContext.Provider>
  );
}
