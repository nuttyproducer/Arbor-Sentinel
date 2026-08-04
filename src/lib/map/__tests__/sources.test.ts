import { describe, it, expect } from "vitest";
import { createGeoJSONSource } from "../sources";
import type { MapFeature, SafeCoordinate } from "../types";

const safeCoord = (lat: number, lon: number): SafeCoordinate =>
  ({ lat, lon, precision: "city" }) as SafeCoordinate;

function makeFeature(overrides: Partial<MapFeature> = {}): MapFeature {
  return {
    id: "test-1",
    type: "event",
    category: "legal_proceeding",
    title: "Test Event",
    safeCoordinate: safeCoord(52.08, 4.30),
    sourceIds: ["src-1"],
    isSensitive: false,
    ...overrides,
  };
}

describe("createGeoJSONSource", () => {
  it("produces a GeoJSON source with type geojson", () => {
    const source = createGeoJSONSource([makeFeature()]);
    expect(source.type).toBe("geojson");
  });

  it("wraps features in a FeatureCollection", () => {
    const features = [makeFeature({ id: "a" }), makeFeature({ id: "b" })];
    const source = createGeoJSONSource(features);
    const data = source.data as GeoJSON.FeatureCollection;
    expect(data.type).toBe("FeatureCollection");
    expect(data.features).toHaveLength(2);
  });

  it("includes feature properties in GeoJSON properties", () => {
    const feature = makeFeature({ id: "evt-001", title: "ICJ Hearing" });
    const source = createGeoJSONSource([feature]);
    const data = source.data as GeoJSON.FeatureCollection;
    const props = data.features[0].properties;
    expect(props).toBeDefined();
    expect(props?.title).toBe("ICJ Hearing");
    expect(props?.id).toBe("evt-001");
  });

  it("uses safeCoordinate for geometry", () => {
    const feature = makeFeature({
      safeCoordinate: safeCoord(31.5, 34.5),
    });
    const source = createGeoJSONSource([feature]);
    const data = source.data as GeoJSON.FeatureCollection;
    const geometry = data.features[0].geometry;
    if (geometry.type !== "Point") {
      throw new Error("Expected Point geometry");
    }
    expect(geometry.coordinates).toEqual([34.5, 31.5]); // GeoJSON is [lng, lat]
  });

  it("returns empty FeatureCollection for empty input", () => {
    const source = createGeoJSONSource([]);
    const data = source.data as GeoJSON.FeatureCollection;
    expect(data.features).toHaveLength(0);
  });
});
