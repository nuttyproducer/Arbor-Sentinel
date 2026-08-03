import type { MapLayerConfig, MapFeature } from "../types";
import { getLayerStyle } from "../layers";

const CATEGORY_LABELS: Record<string, string> = {
  legal_proceeding: "Legal Proceedings",
  humanitarian_incident: "Humanitarian Incidents",
  displacement: "Displacement",
  casualty_event: "Casualty Events",
  political_development: "Political Developments",
  documented_incident: "Documented Incidents",
};

export function buildEventLayerConfig(features: MapFeature[]): MapLayerConfig {
  const eventFeatures = features.filter((f) => f.type === "event");

  // Group features by category for sub-layers
  const byCategory = eventFeatures.reduce<Record<string, MapFeature[]>>((acc, f) => {
    const cat = f.category || "documented_incident";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

  const subLayers: MapLayerConfig[] = Object.entries(byCategory).map(([cat, fts]) => {
    const style = getLayerStyle(cat);
    return {
      id: `events--${cat}`,
      group: "events",
      label: CATEGORY_LABELS[cat] ?? cat,
      features: fts,
      style: { color: style.color, radius: style.radius },
      defaultVisible: true,
    };
  });

  return {
    id: "events-layer",
    group: "events",
    label: "Events",
    features: eventFeatures,
    style: { color: "#D99A2B", radius: 8 },
    defaultVisible: true,
    subLayers,
  };
}
