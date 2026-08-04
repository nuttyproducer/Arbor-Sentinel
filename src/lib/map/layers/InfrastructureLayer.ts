import type { MapLayerConfig, MapFeature } from "../types";

// Sensitive infrastructure categories. Hidden by default — most sensitive.
const SENSITIVE_CATEGORIES = new Set(["hospital", "school"]);

export function buildInfrastructureLayerConfig(features: MapFeature[]): MapLayerConfig {
  const infrastructureFeatures = features.filter(
    (f) => f.type === "infrastructure" && SENSITIVE_CATEGORIES.has(f.category)
  );

  return {
    id: "infrastructure-layer",
    group: "infrastructure",
    label: "Infrastructure",
    features: infrastructureFeatures,
    style: { color: "#B95C50", radius: 8 },
    defaultVisible: false,
  };
}
