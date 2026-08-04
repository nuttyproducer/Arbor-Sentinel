// src/lib/ai/__tests__/HallucinationDetector.test.ts

import { describe, it, expect } from "vitest";
import { createMockProvider } from "../provider";
import { hallucinationDetectorStage } from "../stages/HallucinationDetector";
import { createPipelineContext } from "../AIPipeline";
import type { NormalizedContent } from "../../collectors/types";

function makeContent(body: string): NormalizedContent {
  return { title: "Test", body, url: "https://example.com/test", tags: [], metadata: {} };
}

describe("HallucinationDetector", () => {
  const setupCtx = (ctx: ReturnType<typeof createPipelineContext>) => {
    ctx.set("entity_extraction", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("claim_extraction", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("timeline_extraction", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("relationship_detection", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    return ctx;
  };

  it("flags unsupported claims not in source text", async () => {
    const sourceText = "The ministry released a statement about policy updates.";
    const provider = createMockProvider([{
      content: JSON.stringify({
        flags: [
          { flagType: "unsupported_claim", severity: "critical", flaggedContent: "The ministry admitted wrongdoing", reason: "Source text only mentions a policy update statement, not an admission of wrongdoing", sourceStage: "claim_extraction", blocksPublication: true },
        ],
      }),
    }]);

    const ctx = setupCtx(createPipelineContext(makeContent(sourceText)));
    const result = await hallucinationDetectorStage.run(makeContent(sourceText), ctx, provider);

    expect(result.data!).toHaveLength(1);
    expect(result.data![0].flagType).toBe("unsupported_claim");
    expect(result.data![0].blocksPublication).toBe(true);
  });

  it("flags numerical mismatches", async () => {
    const sourceText = "The report documented 47 civilian casualties.";
    const provider = createMockProvider([{
      content: JSON.stringify({
        flags: [
          { flagType: "numerical_mismatch", severity: "major", flaggedContent: "150 civilians killed", reason: "Source states 47 civilian casualties, not 150", sourceStage: "claim_extraction", blocksPublication: true },
        ],
      }),
    }]);

    const ctx = setupCtx(createPipelineContext(makeContent(sourceText)));
    const result = await hallucinationDetectorStage.run(makeContent(sourceText), ctx, provider);

    expect(result.data![0].flagType).toBe("numerical_mismatch");
    expect(result.data![0].severity).toBe("major");
  });

  it("flags entity hallucinations", async () => {
    const sourceText = "The UN issued a statement.";
    const provider = createMockProvider([{
      content: JSON.stringify({
        flags: [
          { flagType: "entity_hallucination", severity: "major", flaggedContent: "NATO", reason: "NATO not mentioned anywhere in source text", sourceStage: "entity_extraction", blocksPublication: true },
        ],
      }),
    }]);

    const ctx = setupCtx(createPipelineContext(makeContent(sourceText)));
    const result = await hallucinationDetectorStage.run(makeContent(sourceText), ctx, provider);

    expect(result.data![0].flagType).toBe("entity_hallucination");
  });

  it("flags temporal hallucinations", async () => {
    const sourceText = "The event occurred in March 2025.";
    const provider = createMockProvider([{
      content: JSON.stringify({
        flags: [
          { flagType: "temporal_hallucination", severity: "major", flaggedContent: "January 2026", reason: "Source states March 2025, not January 2026", sourceStage: "timeline_extraction", blocksPublication: true },
        ],
      }),
    }]);

    const ctx = setupCtx(createPipelineContext(makeContent(sourceText)));
    const result = await hallucinationDetectorStage.run(makeContent(sourceText), ctx, provider);

    expect(result.data![0].flagType).toBe("temporal_hallucination");
  });

  it("critical and major hallucinations block publication", async () => {
    const sourceText = "A statement was made.";
    const provider = createMockProvider([{
      content: JSON.stringify({
        flags: [
          { flagType: "unsupported_claim", severity: "critical", flaggedContent: "Fake claim", reason: "Not in source", sourceStage: "claim_extraction", blocksPublication: true },
          { flagType: "unsupported_claim", severity: "major", flaggedContent: "Major extrapolation", reason: "Slight deviation from source", sourceStage: "claim_extraction", blocksPublication: false },
        ],
      }),
    }]);

    const ctx = setupCtx(createPipelineContext(makeContent(sourceText)));
    const result = await hallucinationDetectorStage.run(makeContent(sourceText), ctx, provider);

    expect(result.data![0].blocksPublication).toBe(true);
    expect(result.data![1].blocksPublication).toBe(true); // Overridden: major → blocks
  });
});
