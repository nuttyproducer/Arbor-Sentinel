import type { MapLayerConfig, MapFeature } from "../types";

// Humanitarian infrastructure categories (aid routes, crossing points).
// Grouped under "infrastructure" and hidden by default.
const HUMANITARIAN_CATEGORIES = new Set(["aid_route", "crossing_point"]);

export function buildHumanitarianLayerConfig(features: MapFeature[]): MapLayerConfig {
  const humanitarianFeatures = features.filter((f) =>
    HUMANITARIAN_CATEGORIES.has(f.category)
  );

  return {
    id: "humanitarian-layer",
    group: "infrastructure",
    label: "Humanitarian",
    features: humanitarianFeatures,
    style: { color: "#D99A2B", radius: 8 },
    defaultVisible: false,
  };
}
