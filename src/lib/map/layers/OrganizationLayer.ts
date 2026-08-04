import type { MapLayerConfig, MapFeature } from "../types";
import { ORG_CATEGORY_COLORS, getLayerStyle } from "../layers";

const CATEGORY_LABELS: Record<string, string> = {
  humanitarian: "Humanitarian Organizations",
  legal: "Legal Organizations",
  medical: "Medical",
  documentation: "Documentation",
  research: "Research",
};

export function buildOrganizationLayerConfig(features: MapFeature[]): MapLayerConfig {
  const organizationFeatures = features.filter((f) => f.type === "organization");

  // Group features by category for sub-layers
  const byCategory = organizationFeatures.reduce<Record<string, MapFeature[]>>((acc, f) => {
    const cat = f.category || "humanitarian";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

  const subLayers: MapLayerConfig[] = Object.entries(byCategory).map(([cat, fts]) => {
    const style = getLayerStyle(cat);
    return {
      id: `organizations--${cat}`,
      group: "organizations",
      label: CATEGORY_LABELS[cat] ?? cat,
      features: fts,
      style: { color: style.color, radius: style.radius },
      defaultVisible: true,
    };
  });

  return {
    id: "organizations-layer",
    group: "organizations",
    label: "Organizations",
    features: organizationFeatures,
    style: { color: ORG_CATEGORY_COLORS.humanitarian, radius: 8 },
    defaultVisible: true,
    subLayers,
  };
}
