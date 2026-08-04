// src/lib/ai/__tests__/ConfidenceEstimator.test.ts

import { describe, it, expect } from "vitest";
import { confidenceEstimatorStage } from "../stages/ConfidenceEstimator";
import { createPipelineContext } from "../AIPipeline";
import type { NormalizedContent } from "../../collectors/types";

function makeContent(): NormalizedContent {
  return { title: "Test", body: "Test body.", url: "https://example.com/test", tags: [], metadata: {} };
}

describe("ConfidenceEstimator", () => {
  it("calibrates unified confidence from stage scores", async () => {
    const ctx = createPipelineContext(makeContent(), 4);
    ctx.set("language_detection", { data: {}, confidence: 0.9, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("entity_extraction", { data: [], confidence: 0.85, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("claim_extraction", { data: [], confidence: 0.8, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("timeline_extraction", { data: [], confidence: 0.75, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("geographic_extraction", { data: [], confidence: 0.7, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("relationship_detection", { data: [], confidence: 0.65, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("topic_classification", { data: [], confidence: 0.9, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });

    const result = await confidenceEstimatorStage.run(makeContent(), ctx, { complete: async () => ({ content: "", model: "", tokensUsed: { input: 0, output: 0 }, finishReason: "stop" }) });

    expect(result.data!.unifiedConfidence).toBeGreaterThan(0);
    expect(result.data!.unifiedConfidence).toBeLessThanOrEqual(1);
    expect(result.data!.stageScores).toHaveProperty("entity_extraction");
    expect(result.data!.factors.sourceQuality).toBeGreaterThan(0);
  });

  it("flags low confidence for human review", async () => {
    const ctx = createPipelineContext(makeContent(), 0); // Low source quality
    ctx.set("language_detection", { data: {}, confidence: 0.3, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("entity_extraction", { data: [], confidence: 0.2, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("claim_extraction", { data: [], confidence: 0.3, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("timeline_extraction", { data: null, confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("geographic_extraction", { data: null, confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("relationship_detection", { data: null, confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("topic_classification", { data: [], confidence: 0.3, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });

    const result = await confidenceEstimatorStage.run(makeContent(), ctx, { complete: async () => ({ content: "", model: "", tokensUsed: { input: 0, output: 0 }, finishReason: "stop" }) });

    expect(result.data!.unifiedConfidence).toBeLessThan(0.6);
    expect(result.data!.requiresHumanReview).toBe(true);
  });

  it("source quality weighting affects confidence", async () => {
    const lowQualityCtx = createPipelineContext(makeContent(), 0);
    const highQualityCtx = createPipelineContext(makeContent(), 5);

    const mockResult = { data: [], confidence: 0.9, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] };
    for (const ctx of [lowQualityCtx, highQualityCtx]) {
      for (const name of ["language_detection", "entity_extraction", "claim_extraction", "timeline_extraction", "geographic_extraction", "relationship_detection", "topic_classification"]) {
        ctx.set(name, mockResult);
      }
    }

    const mockProvider = { complete: async () => ({ content: "", model: "", tokensUsed: { input: 0, output: 0 }, finishReason: "stop" as const }) };

    const lowResult = await confidenceEstimatorStage.run(makeContent(), lowQualityCtx, mockProvider);
    const highResult = await confidenceEstimatorStage.run(makeContent(), highQualityCtx, mockProvider);

    expect(highResult.data!.unifiedConfidence).toBeGreaterThan(lowResult.data!.unifiedConfidence);
    expect(highResult.data!.factors.sourceQuality).toBeGreaterThan(lowResult.data!.factors.sourceQuality);
  });

  it("never exceeds 1.0 confidence", async () => {
    const ctx = createPipelineContext(makeContent(), 5);
    const mockResult = { data: [], confidence: 1.0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] };
    for (const name of ["language_detection", "entity_extraction", "claim_extraction", "timeline_extraction", "geographic_extraction", "relationship_detection", "topic_classification"]) {
      ctx.set(name, mockResult);
    }

    const result = await confidenceEstimatorStage.run(makeContent(), ctx, { complete: async () => ({ content: "", model: "", tokensUsed: { input: 0, output: 0 }, finishReason: "stop" }) });

    expect(result.data!.unifiedConfidence).toBeLessThanOrEqual(1.0);
  });
});
