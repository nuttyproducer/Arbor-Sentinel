import { describe, it, expect } from "vitest";
import { buildEventLayerConfig } from "../layers/EventLayer";
import { buildSourceLayerConfig } from "../layers/SourceLayer";
import { buildOrganizationLayerConfig } from "../layers/OrganizationLayer";
import { buildLegalLayerConfig } from "../layers/LegalLayer";
import { buildInfrastructureLayerConfig } from "../layers/InfrastructureLayer";
import { buildHumanitarianLayerConfig } from "../layers/HumanitarianLayer";
import type { MapFeature, SafeCoordinate } from "../types";

const safeCoord = (lat: number, lon: number): SafeCoordinate =>
  ({ lat, lon, precision: "city" }) as SafeCoordinate;

function makeEventFeature(overrides: Partial<MapFeature> = {}): MapFeature {
  return {
    id: "evt-1",
    type: "event",
    category: "legal_proceeding",
    title: "Test Event",
    safeCoordinate: safeCoord(52, 4),
    sourceIds: ["src-1"],
    isSensitive: false,
    ...overrides,
  };
}

describe("layer definition builders", () => {
  it("buildEventLayerConfig returns config with group 'events'", () => {
    const config = buildEventLayerConfig([makeEventFeature()]);
    expect(config.group).toBe("events");
    expect(config.id).toBe("events-layer");
    expect(config.defaultVisible).toBe(true);
    expect(config.features).toHaveLength(1);
  });

  it("buildEventLayerConfig maps feature categories to sub-layer styles", () => {
    const features = [
      makeEventFeature({ id: "a", category: "legal_proceeding" }),
      makeEventFeature({ id: "b", category: "humanitarian_incident" }),
    ];
    const config = buildEventLayerConfig(features);
    expect(config.subLayers).toBeDefined();
    expect(config.subLayers?.length ?? 0).toBeGreaterThanOrEqual(1);
  });

  it("buildSourceLayerConfig returns config with group 'sources'", () => {
    const feature = { ...makeEventFeature(), type: "source" as const, category: "court" };
    const config = buildSourceLayerConfig([feature]);
    expect(config.group).toBe("sources");
    expect(config.id).toBe("sources-layer");
    expect(config.defaultVisible).toBe(true);
  });

  it("buildOrganizationLayerConfig returns config with group 'organizations'", () => {
    const feature = { ...makeEventFeature(), type: "organization" as const, category: "humanitarian" };
    const config = buildOrganizationLayerConfig([feature]);
    expect(config.group).toBe("organizations");
    expect(config.defaultVisible).toBe(true);
  });

  it("buildLegalLayerConfig returns config with group 'legal'", () => {
    const feature = { ...makeEventFeature(), type: "legal" as const, category: "jurisdiction" };
    const config = buildLegalLayerConfig([feature]);
    expect(config.group).toBe("legal");
    expect(config.defaultVisible).toBe(true);
  });

  it("buildInfrastructureLayerConfig returns config with group 'infrastructure'", () => {
    const feature = { ...makeEventFeature(), type: "infrastructure" as const, category: "hospital" };
    const config = buildInfrastructureLayerConfig([feature]);
    expect(config.group).toBe("infrastructure");
    expect(config.defaultVisible).toBe(false); // hidden by default — most sensitive
  });

  it("buildHumanitarianLayerConfig returns config with group 'infrastructure'", () => {
    const feature = { ...makeEventFeature(), type: "infrastructure" as const, category: "aid_route" };
    const config = buildHumanitarianLayerConfig([feature]);
    expect(config.group).toBe("infrastructure");
  });
});
