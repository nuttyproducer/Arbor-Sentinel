import type { MapLayerConfig, MapFeature } from "../types";

// Legal layer uses the "trust" palette color (#3B6EA8) for all legal features.
const TRUST_COLOR = "#3B6EA8";

export function buildLegalLayerConfig(features: MapFeature[]): MapLayerConfig {
  const legalFeatures = features.filter((f) => f.type === "legal");

  return {
    id: "legal-layer",
    group: "legal",
    label: "Legal",
    features: legalFeatures,
    style: { color: TRUST_COLOR, radius: 8 },
    defaultVisible: true,
  };
}
