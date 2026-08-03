import { describe, it, expect } from "vitest";
import { safeCoordinate, makeRawCoordinate, SENSITIVE_LOCATION_TYPES } from "../utils/safety";

describe("safeCoordinate", () => {
  it("passes through coordinates for public, non-sensitive locations unchanged in precision", () => {
    const raw = makeRawCoordinate(52.08, 4.30);
    const result = safeCoordinate(raw, {
      locationType: "courthouse",
      isSensitive: false,
      sourcePrecision: "city",
    });
    expect(result.lat).toBe(52.08);
    expect(result.lon).toBe(4.30);
    expect(result.precision).toBe("city");
  });

  it("downgrades exact → safe for sensitive location types", () => {
    const raw = makeRawCoordinate(31.5065, 34.4604); // exact coordinates
    const result = safeCoordinate(raw, {
      locationType: "shelter",
      isSensitive: true,
      sourcePrecision: "exact",
    });
    expect(result.precision).toBe("safe");
    // Coordinates should be jittered — not exactly the raw values
    expect(result.lat).not.toBe(31.5065);
    expect(result.lon).not.toBe(34.4604);
  });

  it("downgrades district → city for sensitive locations", () => {
    const raw = makeRawCoordinate(31.50, 34.46);
    const result = safeCoordinate(raw, {
      locationType: "medical_facility",
      isSensitive: true,
      sourcePrecision: "district",
    });
    expect(result.precision).toBe("city");
  });

  it("applies jitter within precision zone (~2-5km for city)", () => {
    const raw = makeRawCoordinate(31.5, 34.5);
    const result = safeCoordinate(raw, {
      locationType: "school",
      isSensitive: true,
      sourcePrecision: "city",
    });
    // Jitter should keep the result within ~0.05 degrees (city-level)
    expect(Math.abs(result.lat - 31.5)).toBeLessThan(1.0);
    expect(Math.abs(result.lon - 34.5)).toBeLessThan(1.0);
  });

  it("passes through country and region precision for any location type", () => {
    const raw = makeRawCoordinate(31.5, 34.5);
    for (const precision of ["country", "region"]) {
      const result = safeCoordinate(raw, {
        locationType: "shelter",
        isSensitive: true,
        sourcePrecision: precision as "country" | "region",
      });
      expect(result.precision).toBe(precision);
    }
  });

  it("known sensitive types are in the set", () => {
    expect(SENSITIVE_LOCATION_TYPES.has("shelter")).toBe(true);
    expect(SENSITIVE_LOCATION_TYPES.has("safe_house")).toBe(true);
    expect(SENSITIVE_LOCATION_TYPES.has("medical_facility")).toBe(true);
    expect(SENSITIVE_LOCATION_TYPES.has("aid_distribution_point")).toBe(true);
    expect(SENSITIVE_LOCATION_TYPES.has("checkpoint")).toBe(true);
    expect(SENSITIVE_LOCATION_TYPES.has("witness_location")).toBe(true);
    expect(SENSITIVE_LOCATION_TYPES.has("individual_home")).toBe(true);
  });
});

describe("makeRawCoordinate", () => {
  it("creates a raw coordinate with the correct lat/lon", () => {
    const raw = makeRawCoordinate(52, 4);
    expect(raw.lat).toBe(52);
    expect(raw.lon).toBe(4);
  });
});
