// src/lib/ai/__tests__/ContradictionDetector.test.ts

import { describe, it, expect } from "vitest";
import { createMockProvider } from "../provider";
import { contradictionDetectorStage } from "../stages/ContradictionDetector";
import { createPipelineContext } from "../AIPipeline";
import type { NormalizedContent } from "../../collectors/types";

function makeContent(body: string): NormalizedContent {
  return { title: "Test", body, url: "https://example.com/test", tags: [], metadata: {} };
}

describe("ContradictionDetector", () => {
  it("detects numerical contradictions", async () => {
    const provider = createMockProvider([{
      content: JSON.stringify({
        contradictions: [
          { claimText: "150 civilians killed", conflictingClaimText: "47 civilians killed", conflictingSourceId: "s1", contradictionType: "numerical", severity: "critical", conflictingFields: ["casualty_count"], recommendation: "flag_for_review" },
        ],
      }),
    }]);

    const ctx = createPipelineContext(makeContent("The attack killed 150 civilians."), 3, "2026-01-01", [
      { id: "rec1", title: "Verified", summary: "47 civilians killed", sourceIds: ["s1"], publicationDate: "2026-01-26" },
    ]);
    ctx.set("claim_extraction", {
      data: [{ id: "claim_1", claimText: "150 civilians killed", claimType: "factual", confidence: 0.9, sourceSpan: { sourceId: "test", start: 0, end: 10, excerpt: "" }, linkedEntityIds: [], verificationStatus: "unverified", isNested: false, fromOpinionContent: false }],
      confidence: 0.9, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [],
    });
    ctx.set("duplicate_detection", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });

    const result = await contradictionDetectorStage.run(makeContent("The attack killed 150 civilians."), ctx, provider);

    expect(result.data!).toHaveLength(1);
    expect(result.data![0].contradictionType).toBe("numerical");
    expect(result.data![0].severity).toBe("critical");
    expect(result.data![0].resolutionState).toBe("unresolved");
  });

  it("returns empty when no claims exist", async () => {
    const ctx = createPipelineContext(makeContent("Some text."));
    ctx.set("claim_extraction", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("duplicate_detection", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });

    const result = await contradictionDetectorStage.run(makeContent("Some text."), ctx, createMockProvider([]));
    expect(result.data!).toHaveLength(0);
  });

  it("detects factual contradictions", async () => {
    const provider = createMockProvider([{
      content: JSON.stringify({
        contradictions: [
          { claimText: "The attack occurred on Monday", conflictingClaimText: "The attack occurred on Tuesday", conflictingSourceId: "s2", contradictionType: "temporal", severity: "major", conflictingFields: ["date"], recommendation: "request_clarification" },
        ],
      }),
    }]);

    const ctx = createPipelineContext(makeContent("The attack occurred on Monday."), 3, "2026-01-01", [
      { id: "rec2", title: "Verified", summary: "The attack occurred on Tuesday.", sourceIds: ["s2"], publicationDate: "2026-01-27" },
    ]);
    ctx.set("claim_extraction", { data: [{ id: "claim_1", claimText: "The attack occurred on Monday", claimType: "factual", confidence: 0.9, sourceSpan: { sourceId: "test", start: 0, end: 10, excerpt: "" }, linkedEntityIds: [], verificationStatus: "unverified", isNested: false, fromOpinionContent: false }], confidence: 0.9, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("duplicate_detection", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });

    const result = await contradictionDetectorStage.run(makeContent("The attack occurred on Monday."), ctx, provider);

    expect(result.data![0].contradictionType).toBe("temporal");
  });
});
