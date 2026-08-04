import type {
  CircleLayerSpecification,
  FillLayerSpecification,
} from "maplibre-gl";
import type {
  MapLayerConfig,
  EventCategory,
  SourceCategory,
  OrgCategory,
  LayerStyle,
} from "./types";

// ── Per-category colors (using project palette) ────────────────────────

export const EVENT_CATEGORY_COLORS: Record<EventCategory, string> = {
  legal_proceeding: "#3B6EA8", // trust
  humanitarian_incident: "#D99A2B", // amber
  displacement: "#B95C50", // clay
  casualty_event: "#B95C50", // clay (same as displacement — note severity distinguishes)
  political_development: "#3B6EA8", // trust
  documented_incident: "#D99A2B", // amber
};

export const SOURCE_CATEGORY_COLORS: Record<SourceCategory, string> = {
  court: "#B95C50", // clay
  un_body: "#3B6EA8", // trust
  ngo: "#D99A2B", // amber
  journalism: "#1F2937", // charcoal
  academic: "#3B6EA8", // trust
};

export const ORG_CATEGORY_COLORS: Record<OrgCategory, string> = {
  humanitarian: "#D99A2B", // amber
  legal: "#B95C50", // clay
  medical: "#B95C50", // clay
  documentation: "#3B6EA8", // trust
  research: "#3B6EA8", // trust
};

const FALLBACK_STYLE: LayerStyle = {
  color: "#999999",
  radius: 6,
  fillOpacity: 0.2,
  strokeWidth: 1,
};

// ── Style lookup ───────────────────────────────────────────────────────

export function getLayerStyle(category: string): LayerStyle {
  const color =
    EVENT_CATEGORY_COLORS[category as EventCategory] ??
    SOURCE_CATEGORY_COLORS[category as SourceCategory] ??
    ORG_CATEGORY_COLORS[category as OrgCategory] ??
    FALLBACK_STYLE.color;

  return { ...FALLBACK_STYLE, color };
}

// ── Layer spec factory ─────────────────────────────────────────────────

export function createLayerSpec(
  config: MapLayerConfig,
  sourceId: string
): CircleLayerSpecification | FillLayerSpecification {
  const isPoint =
    config.features.length === 0
      ? true // default to point if no features to inspect
      : config.features[0].safeCoordinate !== undefined;

  if (isPoint) {
    return {
      id: config.id,
      type: "circle",
      source: sourceId,
      minzoom: config.minZoom ?? 0,
      paint: {
        "circle-color": config.style.color,
        "circle-radius": config.style.radius ?? 8,
        "circle-opacity": 0.9,
        "circle-stroke-width": config.style.strokeWidth ?? 1,
        "circle-stroke-color": "#ffffff",
      },
      layout: {
        visibility: config.defaultVisible ? "visible" : "none",
      },
    } as CircleLayerSpecification;
  }

  return {
    id: config.id,
    type: "fill",
    source: sourceId,
    minzoom: config.minZoom ?? 0,
    paint: {
      "fill-color": config.style.color,
      "fill-opacity": config.style.fillOpacity ?? 0.3,
      "fill-outline-color": config.style.color,
    },
    layout: {
      visibility: config.defaultVisible ? "visible" : "none",
    },
  } as FillLayerSpecification;
}
