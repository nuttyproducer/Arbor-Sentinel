// src/lib/ai/__tests__/ClaimExtractor.test.ts

import { describe, it, expect } from "vitest";
import { createMockProvider } from "../provider";
import { claimExtractorStage } from "../stages/ClaimExtractor";
import { createPipelineContext } from "../AIPipeline";
import type { NormalizedContent } from "../../collectors/types";

function makeContent(body: string): NormalizedContent {
  return { title: "Test", body, url: "https://example.com/test", tags: [], metadata: {} };
}

describe("ClaimExtractor", () => {
  it("extracts and classifies claims by type", async () => {
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          claims: [
            { claimText: "The court found the defendant guilty of war crimes.", claimType: "legal", confidence: 0.95, startChar: 0, endChar: 57, linkedEntityNames: [], isNested: false, fromOpinionContent: false },
            { claimText: "1500 civilians were killed in the attack.", claimType: "factual", confidence: 0.9, startChar: 58, endChar: 99, linkedEntityNames: [], isNested: false, fromOpinionContent: false },
          ],
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent("The court found the defendant guilty of war crimes. 1500 civilians were killed in the attack."));
    ctx.set("entity_extraction", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });

    const result = await claimExtractorStage.run(makeContent("The court found the defendant guilty of war crimes. 1500 civilians were killed in the attack."), ctx, provider);

    expect(result.data!).toHaveLength(2);
    expect(result.data![0].claimType).toBe("legal");
    expect(result.data![1].claimType).toBe("factual");
    expect(result.data![0].verificationStatus).toBe("unverified");
  });

  it("labels allegations correctly", async () => {
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          claims: [
            { claimText: "Witnesses allege that soldiers opened fire on civilians.", claimType: "allegation", confidence: 0.7, startChar: 0, endChar: 62, linkedEntityNames: [], isNested: false, fromOpinionContent: false },
          ],
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent("Witnesses allege that soldiers opened fire on civilians."));
    ctx.set("entity_extraction", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });

    const result = await claimExtractorStage.run(makeContent("Witnesses allege that soldiers opened fire on civilians."), ctx, provider);

    expect(result.data![0].claimType).toBe("allegation");
    expect(result.data![0].verificationStatus).toBe("unverified");
  });

  it("flags claims from opinion content", async () => {
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          claims: [
            { claimText: "This policy is a disaster for human rights.", claimType: "political", confidence: 0.6, startChar: 0, endChar: 46, linkedEntityNames: [], isNested: false, fromOpinionContent: true },
          ],
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent("This policy is a disaster for human rights."));
    ctx.set("entity_extraction", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });

    const result = await claimExtractorStage.run(makeContent("This policy is a disaster for human rights."), ctx, provider);

    expect(result.data![0].fromOpinionContent).toBe(true);
  });

  it("links claims to entities from entity extractor", async () => {
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          claims: [
            { claimText: "The ICJ issued provisional measures.", claimType: "legal", confidence: 0.9, startChar: 0, endChar: 36, linkedEntityNames: ["ICJ", "International Court of Justice"], isNested: false, fromOpinionContent: false },
          ],
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent("The ICJ issued provisional measures."));
    ctx.set("entity_extraction", {
      data: [
        { id: "entity_1", canonicalName: "International Court of Justice", aliases: ["ICJ"], entityType: "organization", confidence: 0.95, sourceSpan: { sourceId: "test", start: 4, end: 7, excerpt: "ICJ" }, linked: false },
      ],
      confidence: 0.95, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [],
    });

    const result = await claimExtractorStage.run(makeContent("The ICJ issued provisional measures."), ctx, provider);

    expect(result.data![0].linkedEntityIds.length).toBeGreaterThan(0);
  });

  it("handles nested claims", async () => {
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          claims: [
            { claimText: "The report found multiple violations.", claimType: "factual", confidence: 0.85, startChar: 0, endChar: 37, linkedEntityNames: [], isNested: false, fromOpinionContent: false },
            { claimText: "Violations included targeting civilians and blocking aid.", claimType: "humanitarian", confidence: 0.8, startChar: 38, endChar: 92, linkedEntityNames: [], isNested: true, parentClaimIndex: 0, fromOpinionContent: false },
          ],
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent("The report found multiple violations. Violations included targeting civilians and blocking aid."));
    ctx.set("entity_extraction", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });

    const result = await claimExtractorStage.run(makeContent("The report found multiple violations. Violations included targeting civilians and blocking aid."), ctx, provider);

    expect(result.data![1].isNested).toBe(true);
  });
});
