import type { GeoJSONSourceSpecification } from "maplibre-gl";
import type { MapFeature } from "./types";

/**
 * Creates a MapLibre GeoJSON source specification from MapFeature[].
 * Coordinates are taken from feature.safeCoordinate — raw coordinates
 * MUST have already passed through safeCoordinate() before this point.
 * GeoJSON positions are [lng, lat], so the SafeCoordinate lat/lon fields
 * are swapped when building the Point geometry.
 */
export function createGeoJSONSource(
  features: MapFeature[]
): GeoJSONSourceSpecification {
  return {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: features.map((f) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [f.safeCoordinate.lon, f.safeCoordinate.lat],
        },
        properties: {
          id: f.id,
          type: f.type,
          category: f.category,
          title: f.title,
          description: f.description ?? "",
          date: f.date ?? "",
          endDate: f.endDate ?? "",
          sourceIds: f.sourceIds,
          severity: f.severity ?? "informational",
          confidence: f.confidence ?? 0,
          isSensitive: f.isSensitive,
          sensitivityLevel: f.sensitivityLevel ?? "public",
          safePrecision: f.safeCoordinate.precision,
        },
      })),
    },
  };
}
