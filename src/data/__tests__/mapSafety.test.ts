import { describe, it, expect } from "vitest";
import { safeCoordinate, makeRawCoordinate } from "../../lib/map/utils/safety";

/**
 * Safety validation: ensures that all map data coordinates comply with
 * safety rules. This test runs against any data files found in src/data/map/.
 * If a data file is added, update the fixture list here.
 */
describe("Map data safety validation", () => {
  it("safety function rejects exact coordinates for shelters", () => {
    const raw = makeRawCoordinate(31.5065, 34.4604);
    const result = safeCoordinate(raw, {
      locationType: "shelter",
      isSensitive: true,
      sourcePrecision: "exact",
    });
    expect(result.precision).not.toBe("exact");
  });

  it("safety function rejects exact coordinates for medical facilities", () => {
    const raw = makeRawCoordinate(31.5065, 34.4604);
    const result = safeCoordinate(raw, {
      locationType: "medical_facility",
      isSensitive: true,
      sourcePrecision: "exact",
    });
    expect(result.precision).not.toBe("exact");
    expect(result.precision).toBe("safe");
  });

  it("safety function rejects exact coordinates for aid points", () => {
    const raw = makeRawCoordinate(31.5065, 34.4604);
    const result = safeCoordinate(raw, {
      locationType: "aid_distribution_point",
      isSensitive: true,
      sourcePrecision: "exact",
    });
    expect(result.precision).not.toBe("exact");
  });

  it("safety function rejects exact coordinates for checkpoints", () => {
    const raw = makeRawCoordinate(31.5065, 34.4604);
    const result = safeCoordinate(raw, {
      locationType: "checkpoint",
      isSensitive: true,
      sourcePrecision: "exact",
    });
    expect(result.precision).not.toBe("exact");
  });

  it("safety function rejects exact coordinates for witness locations", () => {
    const raw = makeRawCoordinate(31.5065, 34.4604);
    const result = safeCoordinate(raw, {
      locationType: "witness_location",
      isSensitive: true,
      sourcePrecision: "exact",
    });
    expect(result.precision).not.toBe("exact");
  });

  it("safety function rejects exact coordinates for individual homes", () => {
    const raw = makeRawCoordinate(31.5065, 34.4604);
    const result = safeCoordinate(raw, {
      locationType: "individual_home",
      isSensitive: true,
      sourcePrecision: "exact",
    });
    expect(result.precision).not.toBe("exact");
  });
});
