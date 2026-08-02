// src/lib/ai/__tests__/RelationshipDetector.test.ts

import { describe, it, expect } from "vitest";
import { createMockProvider } from "../provider";
import { relationshipDetectorStage } from "../stages/RelationshipDetector";
import { createPipelineContext } from "../AIPipeline";
import type { NormalizedContent } from "../../collectors/types";

function makeContent(body: string): NormalizedContent {
  return { title: "Test", body, url: "https://example.com/test", tags: [], metadata: {} };
}

describe("RelationshipDetector", () => {
  const entities = [
    { id: "e1", canonicalName: "António Guterres", aliases: [], entityType: "person", confidence: 0.95, sourceSpan: { sourceId: "test", start: 0, end: 0, excerpt: "" }, linked: false },
    { id: "e2", canonicalName: "United Nations", aliases: ["UN"], entityType: "organization", confidence: 0.95, sourceSpan: { sourceId: "test", start: 0, end: 0, excerpt: "" }, linked: false },
  ];

  it("identifies person-organization relationships", async () => {
    const provider = createMockProvider([{
      content: JSON.stringify({
        relationships: [
          { sourceEntityName: "António Guterres", targetEntityName: "United Nations", relationshipType: "affiliation", direction: "directed", strength: "strong", label: "Secretary-General of", confidence: 0.95, startChar: 0, endChar: 50, isInferred: false },
        ],
      }),
    }]);

    const ctx = createPipelineContext(makeContent("António Guterres, Secretary-General of the UN, spoke today."));
    ctx.set("entity_extraction", { data: entities, confidence: 0.9, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("timeline_extraction", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });

    const result = await relationshipDetectorStage.run(makeContent("António Guterres, Secretary-General of the UN, spoke today."), ctx, provider);

    expect(result.data!).toHaveLength(1);
    expect(result.data![0].relationshipType).toBe("affiliation");
    expect(result.data![0].label).toBe("Secretary-General of");
  });

  it("labels inferred relationships correctly", async () => {
    const provider = createMockProvider([{
      content: JSON.stringify({
        relationships: [
          { sourceEntityName: "OrgA", targetEntityName: "OrgB", relationshipType: "association", direction: "undirected", strength: "inferred", label: "possibly associated with", confidence: 0.3, startChar: 0, endChar: 0, isInferred: true },
        ],
      }),
    }]);

    const ctx = createPipelineContext(makeContent("OrgA and OrgB both operate in the same region."));
    ctx.set("entity_extraction", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("timeline_extraction", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });

    const result = await relationshipDetectorStage.run(makeContent("OrgA and OrgB both operate in the same region."), ctx, provider);

    expect(result.data![0].isInferred).toBe(true);
    expect(result.data![0].strength).toBe("inferred");
  });

  it("detects causal relationships only when explicit", async () => {
    const provider = createMockProvider([{
      content: JSON.stringify({
        relationships: [
          { sourceEntityName: "airstrike", targetEntityName: "displacement", relationshipType: "causal", direction: "directed", strength: "strong", label: "caused", confidence: 0.9, startChar: 0, endChar: 0, isInferred: false },
        ],
      }),
    }]);

    const ctx = createPipelineContext(makeContent("The airstrike caused the displacement of 500 families."));
    ctx.set("entity_extraction", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("timeline_extraction", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });

    const result = await relationshipDetectorStage.run(makeContent("The airstrike caused the displacement of 500 families."), ctx, provider);

    expect(result.data![0].relationshipType).toBe("causal");
    expect(result.data![0].label).toBe("caused");
  });

  it("deduplicates same relationship from multiple mentions", async () => {
    const provider = createMockProvider([{
      content: JSON.stringify({
        relationships: [
          { sourceEntityName: "ICJ", targetEntityName: "UN", relationshipType: "affiliation", direction: "directed", strength: "strong", label: "organ of", confidence: 0.9, startChar: 0, endChar: 10, isInferred: false },
          { sourceEntityName: "ICJ", targetEntityName: "UN", relationshipType: "affiliation", direction: "directed", strength: "strong", label: "organ of", confidence: 0.85, startChar: 50, endChar: 60, isInferred: false },
        ],
      }),
    }]);

    const ctx = createPipelineContext(makeContent("The ICJ is an organ of the UN. The ICJ represents the UN in legal matters."));
    ctx.set("entity_extraction", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });
    ctx.set("timeline_extraction", { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] });

    const result = await relationshipDetectorStage.run(makeContent("The ICJ is an organ of the UN. The ICJ represents the UN in legal matters."), ctx, provider);

    // Deduped to one relationship
    expect(result.data!.length).toBe(1);
    // But has two source spans
    expect(result.data![0].sourceSpans.length).toBe(2);
  });
});
