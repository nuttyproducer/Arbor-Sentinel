// ── Branded coordinate types ──────────────────────────────────────────

declare const RawCoordinateBrand: unique symbol;
declare const SafeCoordinateBrand: unique symbol;

/** A raw coordinate that has NOT passed through safeCoordinate(). Must not reach the map. */
export interface RawCoordinate {
  lat: number;
  lon: number;
  [RawCoordinateBrand]: never;
}

/** A coordinate that HAS passed through safeCoordinate(). The only type MapLayer accepts. */
export interface SafeCoordinate {
  lat: number;
  lon: number;
  precision: LocationPrecision;
  [SafeCoordinateBrand]: never;
}

// ── Precision ─────────────────────────────────────────────────────────

export type LocationPrecision = "country" | "region" | "city" | "district" | "exact" | "safe";

export type SensitivityLevel = "public" | "sensitive" | "restricted";

// ── Layer groups ──────────────────────────────────────────────────────

export type LayerGroup = "events" | "sources" | "organizations" | "legal" | "infrastructure";

export const LAYER_GROUP_LABELS: Record<LayerGroup, string> = {
  events: "Events",
  sources: "Sources",
  organizations: "Organizations",
  legal: "Legal",
  infrastructure: "Infrastructure",
};

// ── Layer visibility ──────────────────────────────────────────────────

export interface LayerVisibility {
  /** Keyed by layer id. If absent, defaults to config.defaultVisible. */
  [layerId: string]: boolean;
}

// ── Layer style ───────────────────────────────────────────────────────

export interface LayerStyle {
  color: string;
  /** Circle radius in px for point features. */
  radius?: number;
  /** Fill opacity 0–1 for polygon features. */
  fillOpacity?: number;
  /** Stroke width in px. */
  strokeWidth?: number;
  /** Icon identifier (marker shape). */
  icon?: "circle" | "square" | "triangle" | "diamond";
}

// ── GeoJSON ───────────────────────────────────────────────────────────

export interface SafeGeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point" | "Polygon";
    coordinates: number[] | number[][] | number[][][];
  };
  properties: Record<string, unknown>;
  /** The safe coordinate used (possibly jittered/downgraded from original). */
  safeCoordinate: SafeCoordinate;
}

// ── Map feature (domain model) ────────────────────────────────────────

export type EventCategory =
  | "legal_proceeding"
  | "humanitarian_incident"
  | "displacement"
  | "casualty_event"
  | "political_development"
  | "documented_incident";

export type SourceCategory = "court" | "un_body" | "ngo" | "journalism" | "academic";

export type OrgCategory = "humanitarian" | "legal" | "medical" | "documentation" | "research";

export interface MapFeature {
  id: string;
  type: "event" | "source" | "organization" | "legal" | "infrastructure";
  category: string;
  title: string;
  safeCoordinate: SafeCoordinate;
  date?: string;
  endDate?: string;
  description?: string;
  sourceIds: string[];
  severity?: "informational" | "notable" | "severe";
  confidence?: number;
  isSensitive: boolean;
  sensitivityLevel?: SensitivityLevel;
}

// ── Layer config ──────────────────────────────────────────────────────

export interface MapLayerConfig {
  id: string;
  group: LayerGroup;
  label: string;
  features: MapFeature[];
  style: LayerStyle;
  minZoom?: number;
  defaultVisible: boolean;
  subLayers?: MapLayerConfig[];
}

// ── Viewport ──────────────────────────────────────────────────────────

export interface MapViewport {
  center: [number, number]; // [lng, lat]
  zoom: number;
}

// ── Safety context for safeCoordinate() ────────────────────────────────

export interface SafetyContext {
  locationType: string;
  isSensitive: boolean;
  sourcePrecision: LocationPrecision;
}
