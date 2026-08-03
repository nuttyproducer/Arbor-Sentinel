import { describe, it, expect } from "vitest";
import { filterFeaturesByDateRange, getDateRange, generateTimelineSteps } from "../utils/timeline";
import type { MapFeature, SafeCoordinate } from "../types";

const safeCoord = (lat: number, lon: number): SafeCoordinate =>
  ({ lat, lon, precision: "city" }) as SafeCoordinate;

function makeFeature(date: string, id = "f"): MapFeature {
  return {
    id,
    type: "event",
    category: "legal_proceeding",
    title: "Event",
    safeCoordinate: safeCoord(52, 4),
    sourceIds: [],
    date,
    isSensitive: false,
  };
}

describe("filterFeaturesByDateRange", () => {
  const features = [
    makeFeature("2024-01-15", "a"),
    makeFeature("2024-03-20", "b"),
    makeFeature("2024-06-01", "c"),
  ];

  it("returns features within the date range", () => {
    const result = filterFeaturesByDateRange(features, "2024-01-01", "2024-04-01");
    expect(result).toHaveLength(2);
    expect(result.map((f) => f.id)).toEqual(["a", "b"]);
  });

  it("returns empty array when no features match", () => {
    const result = filterFeaturesByDateRange(features, "2025-01-01", "2025-12-31");
    expect(result).toHaveLength(0);
  });

  it("includes features without dates (undated)", () => {
    const withUndated = [...features, makeFeature("", "undated")];
    const result = filterFeaturesByDateRange(withUndated, "2024-01-01", "2024-02-01");
    // Undated features are included by default (could be any date)
    expect(result.map((f) => f.id)).toContain("undated");
  });

  it("returns all features when range covers everything", () => {
    const result = filterFeaturesByDateRange(features, "2024-01-01", "2024-12-31");
    expect(result).toHaveLength(3);
  });
});

describe("getDateRange", () => {
  it("returns min and max dates from features", () => {
    const features = [
      makeFeature("2023-01-01", "oldest"),
      makeFeature("2024-06-15", "middle"),
      makeFeature("2025-12-31", "newest"),
    ];
    const range = getDateRange(features);
    expect(range.min).toBe("2023-01-01");
    expect(range.max).toBe("2025-12-31");
  });

  it("ignores features without dates", () => {
    const features = [makeFeature("2024-01-01"), makeFeature("")];
    const range = getDateRange(features);
    expect(range.min).toBe("2024-01-01");
    expect(range.max).toBe("2024-01-01");
  });

  it("returns same min/max for single feature", () => {
    const features = [makeFeature("2024-07-01")];
    const range = getDateRange(features);
    expect(range.min).toBe("2024-07-01");
    expect(range.max).toBe("2024-07-01");
  });
});

describe("generateTimelineSteps", () => {
  it("generates the requested number of steps", () => {
    const steps = generateTimelineSteps({ min: "2024-01-01", max: "2024-12-31" }, 4);
    expect(steps).toHaveLength(4);
    expect(steps[0]).toBe("2024-01-01");
    expect(steps[3]).toBe("2024-12-31");
  });
});
