// src/components/map/EventMapPanel.tsx
import { useMemo, useState } from "react";
import { MapContainer } from "./MapContainer";
import { MapLayer } from "./MapLayer";
import { MapTimeline } from "./MapTimeline";
import { MapLegend } from "./MapLegend";
import { buildEventLayerConfig } from "../../lib/map/layers/EventLayer";
import { buildSourceLayerConfig } from "../../lib/map/layers/SourceLayer";
import { filterFeaturesByDateRange } from "../../lib/map/utils/timeline";
import type { MapFeature, MapLayerConfig } from "../../lib/map/types";

interface EventMapPanelProps {
  eventFeatures: MapFeature[];
  sourceFeatures: MapFeature[];
  className?: string;
}

/**
 * Pre-composed, self-contained event map: a MapContainer with event and source
 * layers, a playable date timeline, and a legend. The timeline filters both
 * layers to the currently selected date range.
 */
export function EventMapPanel({
  eventFeatures,
  sourceFeatures,
  className = "",
}: EventMapPanelProps) {
  const [range, setRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  const filteredEvents = useMemo(
    () => filterFeaturesByDateRange(eventFeatures, range.start, range.end),
    [eventFeatures, range]
  );
  const filteredSources = useMemo(
    () => filterFeaturesByDateRange(sourceFeatures, range.start, range.end),
    [sourceFeatures, range]
  );

  const eventConfig = useMemo(
    () => buildEventLayerConfig(filteredEvents),
    [filteredEvents]
  );
  const sourceConfig = useMemo(
    () => buildSourceLayerConfig(filteredSources),
    [filteredSources]
  );

  const layers = useMemo<MapLayerConfig[]>(
    () => [eventConfig, sourceConfig],
    [eventConfig, sourceConfig]
  );

  return (
    <div
      className={`relative w-full h-[500px] overflow-hidden rounded-lg border border-charcoal/20 bg-bone ${className}`}
      aria-label="Event map panel"
    >
      <MapContainer>
        <MapLayer config={eventConfig} visible />
        <MapLayer config={sourceConfig} visible />
        <MapTimeline
          features={eventFeatures}
          onRangeChange={(start, end) => setRange({ start, end })}
        />
        <MapLegend layers={layers} />
      </MapContainer>
    </div>
  );
}
