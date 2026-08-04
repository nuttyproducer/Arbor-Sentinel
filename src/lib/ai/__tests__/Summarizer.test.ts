// src/lib/ai/__tests__/Summarizer.test.ts

import { describe, it, expect } from "vitest";
import { createMockProvider } from "../provider";
import { summarizerStage } from "../stages/Summarizer";
import { createPipelineContext } from "../AIPipeline";
import type { NormalizedContent } from "../../collectors/types";

function makeContent(body: string): NormalizedContent {
  return {
    title: "Test",
    body,
    url: "https://example.com/test",
    tags: [],
    metadata: {},
  };
}

describe("Summarizer", () => {
  it("produces a summary with facts and source spans", async () => {
    const sourceText = "On January 15, 2026, the ICJ issued a ruling finding that 1500 civilian casualties were documented.";
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          summary: "The ICJ issued a ruling on January 15, 2026, documenting 1500 civilian casualties.",
          preservedAmbiguities: [],
          sourceReferences: [
            { text: "ICJ issued a ruling", startChar: 20, endChar: 39 },
          ],
          facts: [
            {
              fact: "ICJ ruling issued January 15, 2026",
              category: "legal_finding",
              confidence: 0.95,
              startChar: 20,
              endChar: 54,
            },
            {
              fact: "1500 civilian casualties documented",
              category: "number",
              confidence: 0.95,
              startChar: 72,
              endChar: 104,
              numericValue: 1500,
              unit: "people",
            },
          ],
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent(sourceText));
    const result = await summarizerStage.run(makeContent(sourceText), ctx, provider);

    expect(result.data!.summary).toBeTruthy();
    expect(result.data!.facts).toHaveLength(2);
    expect(result.data!.facts[0].category).toBe("legal_finding");
    expect(result.data!.facts[1].numericValue).toBe(1500);
    expect(result.data!.type).toBe("normal");
  });

  it("does NOT introduce claims not in source", async () => {
    const sourceText = "The ministry released a statement about the new policy.";
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          summary: "The ministry released a statement about a new policy.",
          preservedAmbiguities: [],
          sourceReferences: [{ text: "The ministry released a statement", startChar: 0, endChar: 38 }],
          facts: [{ fact: "Ministry released statement about new policy", category: "policy_position", confidence: 0.9, startChar: 0, endChar: 57 }],
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent(sourceText));
    const result = await summarizerStage.run(makeContent(sourceText), ctx, provider);

    // Verify summary doesn't contain made-up details
    expect(result.data!.summary).not.toContain("announced");
    expect(result.data!.summary).not.toContain("confirmed");
    expect(result.data!.summary).not.toContain("according to sources");
    expect(result.data!.facts).toHaveLength(1);
  });

  it("preserves ambiguity from source", async () => {
    const sourceText = "Reports suggest approximately 200-300 people may have been affected.";
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          summary: "Reports suggest approximately 200-300 people may have been affected.",
          preservedAmbiguities: ["Exact number unknown, estimated 200-300", "May have been affected — not confirmed"],
          sourceReferences: [{ text: "Reports suggest approximately 200-300", startChar: 0, endChar: 39 }],
          facts: [{ fact: "Approximately 200-300 people potentially affected", category: "number", confidence: 0.6, startChar: 24, endChar: 74, numericValue: 250, unit: "people" }],
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent(sourceText));
    const result = await summarizerStage.run(makeContent(sourceText), ctx, provider);

    expect(result.data!.ambiguityChecked).toBe(true);
    expect(result.data!.preservedAmbiguities!.length).toBeGreaterThan(0);
    expect(result.data!.facts[0].confidence).toBeLessThan(0.8);
  });

  it("includes exact character positions in source spans", async () => {
    const sourceText = "The UN report states that 5000 people were displaced.";
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          summary: "A UN report states 5000 people were displaced.",
          preservedAmbiguities: [],
          sourceReferences: [{ text: "UN report states that 5000 people were displaced", startChar: 4, endChar: 52 }],
          facts: [{ fact: "5000 people displaced per UN report", category: "number", confidence: 0.9, startChar: 26, endChar: 52, numericValue: 5000, unit: "people" }],
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent(sourceText));
    const result = await summarizerStage.run(makeContent(sourceText), ctx, provider);

    const fact = result.data!.facts[0];
    const excerpt = sourceText.slice(fact.sourceSpan.start, fact.sourceSpan.end);
    expect(excerpt).toContain("5000");
  });

  it("handles empty content gracefully", async () => {
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          summary: "",
          preservedAmbiguities: [],
          sourceReferences: [],
          facts: [],
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent(""));
    const result = await summarizerStage.run(makeContent(""), ctx, provider);
    expect(result.data!.facts).toHaveLength(0);
  });
});
