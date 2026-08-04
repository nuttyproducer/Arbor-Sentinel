// src/components/map/MapContext.tsx
import { createContext, useContext } from "react";
import type { Map } from "maplibre-gl";
import type { LayerVisibility, LayerGroup } from "../../lib/map/types";

export interface MapContextValue {
  map: Map | null;
  layerVisibility: LayerVisibility;
  setLayerVisibility: (id: string, visible: boolean) => void;
  toggleLayerGroup: (group: LayerGroup) => void;
}

export const MapContext = createContext<MapContextValue>({
  map: null,
  layerVisibility: {},
  setLayerVisibility: () => {},
  toggleLayerGroup: () => {},
});

export function useMapContext(): MapContextValue {
  return useContext(MapContext);
}
