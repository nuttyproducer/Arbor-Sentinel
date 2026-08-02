// src/lib/ai/__tests__/GeographicExtractor.test.ts

import { describe, it, expect } from "vitest";
import { createMockProvider } from "../provider";
import { geographicExtractorStage } from "../stages/GeographicExtractor";
import { createPipelineContext } from "../AIPipeline";
import type { NormalizedContent } from "../../collectors/types";

function makeContent(body: string): NormalizedContent {
  return { title: "Test", body, url: "https://example.com/test", tags: [], metadata: {} };
}

describe("GeographicExtractor", () => {
  it("extracts locations at multiple precision levels", async () => {
    const provider = createMockProvider([{
      content: JSON.stringify({
        locations: [
          { name: "Gaza", locationType: "region", parentLocation: "Palestine", sourcePrecision: "region", coordinates: { lat: 31.5, lon: 34.47 }, confidence: 0.9, startChar: 0, endChar: 4, isUnresolvable: false },
          { name: "Rafah", locationType: "city", parentLocation: "Gaza", sourcePrecision: "city", coordinates: { lat: 31.29, lon: 34.25 }, confidence: 0.85, startChar: 30, endChar: 35, isUnresolvable: false },
        ],
      }),
    }]);

    const ctx = createPipelineContext(makeContent("Gaza... Rafah"));
    ctx.set("timeline_extraction", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });

    const result = await geographicExtractorStage.run(makeContent("Gaza... Rafah"), ctx, provider);
    expect(result.data!).toHaveLength(2);
    expect(result.data![0].geojson).toBeDefined();
    expect(result.data![0].geojson!.geometry.type).toBe("Point");
  });

  it("downgrades precision for sensitive locations", async () => {
    const provider = createMockProvider([{
      content: JSON.stringify({
        locations: [
          { name: "Al-Shifa Hospital", locationType: "medical_facility", parentLocation: "Gaza City", sourcePrecision: "exact", coordinates: { lat: 31.52, lon: 34.44 }, confidence: 0.9, startChar: 0, endChar: 18, isUnresolvable: false },
        ],
      }),
    }]);

    const ctx = createPipelineContext(makeContent("Al-Shifa Hospital at coordinates 31.52, 34.44"));
    ctx.set("timeline_extraction", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });

    const result = await geographicExtractorStage.run(makeContent("Al-Shifa Hospital at coordinates 31.52, 34.44"), ctx, provider);

    expect(result.data![0].precisionDowngraded).toBe(true);
    expect(result.data![0].displayPrecision).toBe("safe");
    expect(result.data![0].coordinates).toBeUndefined();
    expect(result.data![0].geojson).toBeUndefined();
  });

  it("flags unresolvable references", async () => {
    const provider = createMockProvider([{
      content: JSON.stringify({
        locations: [
          { name: "unknown", locationType: "named_location", sourcePrecision: "country", confidence: 0.1, startChar: 0, endChar: 4, isUnresolvable: true, unresolvableReference: "nearby" },
        ],
      }),
    }]);

    const ctx = createPipelineContext(makeContent("The attack occurred nearby."));
    ctx.set("timeline_extraction", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });

    const result = await geographicExtractorStage.run(makeContent("The attack occurred nearby."), ctx, provider);

    expect(result.data![0].isUnresolvable).toBe(true);
    expect(result.data![0].unresolvableReference).toBe("nearby");
  });

  it("generates valid GeoJSON for public locations", async () => {
    const provider = createMockProvider([{
      content: JSON.stringify({
        locations: [
          { name: "Brussels", locationType: "city", parentLocation: "Belgium", sourcePrecision: "city", coordinates: { lat: 50.85, lon: 4.35 }, confidence: 0.95, startChar: 0, endChar: 8, isUnresolvable: false },
        ],
      }),
    }]);

    const ctx = createPipelineContext(makeContent("Brussels"));
    ctx.set("timeline_extraction", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });

    const result = await geographicExtractorStage.run(makeContent("Brussels"), ctx, provider);

    expect(result.data![0].geojson).toBeDefined();
    expect(result.data![0].geojson!.type).toBe("Feature");
    expect(result.data![0].precisionDowngraded).toBe(false);
  });
});
