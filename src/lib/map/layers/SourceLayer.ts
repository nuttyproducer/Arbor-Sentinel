import type { MapLayerConfig, MapFeature } from "../types";
import { SOURCE_CATEGORY_COLORS, getLayerStyle } from "../layers";

const CATEGORY_LABELS: Record<string, string> = {
  court: "Courts",
  un_body: "UN Bodies",
  ngo: "NGOs",
  journalism: "Journalism",
  academic: "Academic",
};

export function buildSourceLayerConfig(features: MapFeature[]): MapLayerConfig {
  const sourceFeatures = features.filter((f) => f.type === "source");

  // Group features by category for sub-layers
  const byCategory = sourceFeatures.reduce<Record<string, MapFeature[]>>((acc, f) => {
    const cat = f.category || "journalism";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

  const subLayers: MapLayerConfig[] = Object.entries(byCategory).map(([cat, fts]) => {
    const style = getLayerStyle(cat);
    return {
      id: `sources--${cat}`,
      group: "sources",
      label: CATEGORY_LABELS[cat] ?? cat,
      features: fts,
      style: { color: style.color, radius: style.radius },
      defaultVisible: true,
    };
  });

  return {
    id: "sources-layer",
    group: "sources",
    label: "Sources",
    features: sourceFeatures,
    style: { color: SOURCE_CATEGORY_COLORS.court, radius: 8 },
    defaultVisible: true,
    subLayers,
  };
}
