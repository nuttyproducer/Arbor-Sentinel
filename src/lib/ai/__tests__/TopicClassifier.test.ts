// src/lib/ai/__tests__/TopicClassifier.test.ts

import { describe, it, expect } from "vitest";
import { createMockProvider } from "../provider";
import { topicClassifierStage } from "../stages/TopicClassifier";
import { createPipelineContext } from "../AIPipeline";
import type { NormalizedContent } from "../../collectors/types";

function makeContent(body: string): NormalizedContent {
  return { title: "Test", body, url: "https://example.com/test", tags: [], metadata: {} };
}

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

describe("TopicClassifier", () => {
  it("classifies content into evidence categories", async () => {
    const provider = createMockProvider([{
      content: JSON.stringify({
        classifications: [
          { categoryId: "civilian_casualties", confidence: 0.9, supportingEvidence: "47 civilians were killed", alternativesConsidered: ["infrastructure_damage"] },
          { categoryId: "forced_displacement", confidence: 0.75, supportingEvidence: "500 families displaced", alternativesConsidered: [] },
        ],
      }),
    }]);

    const ctx = createPipelineContext(makeContent("47 civilians were killed and 500 families were displaced in the attack."));
    ctx.set("entity_extraction", makePrerequisiteResults());
    ctx.set("claim_extraction", makePrerequisiteResults());

    const result = await topicClassifierStage.run(makeContent("47 civilians were killed and 500 families were displaced in the attack."), ctx, provider);

    expect(result.data!).toHaveLength(2);
    expect(result.data![0].categoryId).toBe("civilian_casualties");
    expect(result.data![1].categoryId).toBe("forced_displacement");
  });

  it("returns empty array for uncategorized content", async () => {
    const provider = createMockProvider([{
      content: JSON.stringify({ classifications: [] }),
    }]);

    const ctx = createPipelineContext(makeContent("The weather was pleasant today."));
    ctx.set("entity_extraction", makePrerequisiteResults());
    ctx.set("claim_extraction", makePrerequisiteResults());

    const result = await topicClassifierStage.run(makeContent("The weather was pleasant today."), ctx, provider);

    expect(result.data!).toHaveLength(0);
  });

  it("includes supporting evidence for each classification", async () => {
    const provider = createMockProvider([{
      content: JSON.stringify({
        classifications: [
          { categoryId: "aid_obstruction", confidence: 0.85, supportingEvidence: "aid convoys were blocked at the border", alternativesConsidered: [] },
        ],
      }),
    }]);

    const ctx = createPipelineContext(makeContent("Aid convoys were blocked at the border for the third consecutive day."));
    ctx.set("entity_extraction", makePrerequisiteResults());
    ctx.set("claim_extraction", makePrerequisiteResults());

    const result = await topicClassifierStage.run(makeContent("Aid convoys were blocked at the border for the third consecutive day."), ctx, provider);

    expect(result.data![0].supportingEvidence).toContain("blocked");
    expect(result.data![0].level).toBe("document");
  });
});
