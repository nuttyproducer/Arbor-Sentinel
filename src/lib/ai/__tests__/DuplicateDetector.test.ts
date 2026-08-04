// src/lib/ai/__tests__/DuplicateDetector.test.ts

import { describe, it, expect } from "vitest";
import { createMockProvider } from "../provider";
import { duplicateDetectorStage } from "../stages/DuplicateDetector";
import { createPipelineContext } from "../AIPipeline";
import type { NormalizedContent } from "../../collectors/types";

function makeContent(body: string): NormalizedContent {
  return { title: "Test", body, url: "https://example.com/new", tags: [], metadata: {} };
}

const existingRecords = [
  { id: "rec1", title: "ICJ rules on provisional measures", summary: "The ICJ issued provisional measures in the case.", sourceIds: ["s1"], publicationDate: "2026-01-26" },
  { id: "rec2", title: "UN report on humanitarian access", summary: "UN documents restrictions on aid delivery.", sourceIds: ["s2"], publicationDate: "2026-02-01" },
];

function makePrerequisiteResults() {
  return {
    data: [],
    confidence: 0,
    modelUsed: "mock",
    tokensUsed: { input: 0, output: 0 },
    latencyMs: 0,
    warnings: [],
    sourceSpans: [],
  };
}

describe("DuplicateDetector", () => {
  it("detects exact duplicates", async () => {
    const provider = createMockProvider([{
      content: JSON.stringify({
        matches: [
          { existingRecordId: "rec1", matchLevel: "exact_duplicate", similarityScore: 0.98, rationale: "Same court ruling, same date, same entities", matchingFields: ["title", "date", "entities"], confidence: 0.95 },
        ],
      }),
    }]);

    const ctx = createPipelineContext(makeContent("The ICJ issued provisional measures in the case on January 26, 2026."), 3, "2026-01-01", existingRecords);
    ctx.set("claim_extraction", makePrerequisiteResults());
    ctx.set("topic_classification", makePrerequisiteResults());

    const result = await duplicateDetectorStage.run(makeContent("The ICJ issued provisional measures in the case on January 26, 2026."), ctx, provider);

    expect(result.data!).toHaveLength(1);
    expect(result.data![0].matchLevel).toBe("exact_duplicate");
    expect(result.data![0].primaryRecordId).toBe("rec1");
  });

  it("returns empty when no existing records", async () => {
    const ctx = createPipelineContext(makeContent("Some new content."));
    ctx.set("claim_extraction", makePrerequisiteResults());
    ctx.set("topic_classification", makePrerequisiteResults());

    const result = await duplicateDetectorStage.run(makeContent("Some new content."), ctx, createMockProvider([]));

    expect(result.data!).toHaveLength(0);
    expect(result.warnings).toContain("No existing records to compare against");
  });

  it("detects near duplicates from different sources", async () => {
    const provider = createMockProvider([{
      content: JSON.stringify({
        matches: [
          { existingRecordId: "rec1", matchLevel: "near_duplicate", similarityScore: 0.82, rationale: "Same event, different news source, slightly different casualty count", matchingFields: ["date", "location", "entities"], confidence: 0.8 },
        ],
      }),
    }]);

    const ctx = createPipelineContext(makeContent("ICJ ruling on provisional measures — different source reporting."), 3, "2026-01-01", existingRecords);
    ctx.set("claim_extraction", makePrerequisiteResults());
    ctx.set("topic_classification", makePrerequisiteResults());

    const result = await duplicateDetectorStage.run(makeContent("ICJ ruling on provisional measures — different source reporting."), ctx, provider);

    expect(result.data![0].matchLevel).toBe("near_duplicate");
    expect(result.data![0].similarityScore).toBeGreaterThan(0.8);
  });
});
