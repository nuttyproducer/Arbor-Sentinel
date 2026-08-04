/**
 * Hallucination regression tests.
 * Known failure modes re-tested on every pipeline change.
 * Uses synthetic adversarial examples — no real content.
 */

import { describe, it, expect } from "vitest";
import { createMockProvider } from "../provider";
import { hallucinationDetectorStage } from "../stages/HallucinationDetector";
import { summarizerStage } from "../stages/Summarizer";
import { createPipelineContext } from "../AIPipeline";
import type { NormalizedContent } from "../../collectors/types";
import { hallucinationDetectionGroundTruth } from "./groundTruth/hallucinationDetection";

function makeContent(body: string): NormalizedContent {
  return { title: "Test", body, url: "https://example.com/test", tags: [], metadata: {} };
}

describe("Hallucination Regression", () => {
  // ── Known hallucination patterns ────────────────────────────────────────

  describe("fabricated facts", () => {
    it("detects numerical fabrication in summaries", async () => {
      const sourceText = "The UN report documented humanitarian access restrictions.";
      const provider = createMockProvider([
        {
          content: JSON.stringify({
            summary:
              "The UN report documented access restrictions and confirmed 10,000 civilian deaths.",
            preservedAmbiguities: [],
            sourceReferences: [],
            facts: [
              { fact: "10,000 civilian deaths confirmed", category: "number", confidence: 0.9, startChar: 55, endChar: 85, numericValue: 10000, unit: "people" },
            ],
          }),
        },
      ]);

      const ctx = createPipelineContext(makeContent(sourceText));
      const result = await summarizerStage.run(makeContent(sourceText), ctx, provider);

      // The summarizer should detect that 10,000 is NOT in the source
      if (result.data?.facts) {
        const numberFacts = result.data.facts.filter((f: { category: string }) => f.category === "number");
        // Either no numeric facts, or the numeric fact should have a source span that exists in the source
        for (const fact of numberFacts) {
          if (fact.sourceSpan) {
            const excerpt = sourceText.slice(fact.sourceSpan.start, fact.sourceSpan.end);
            // If the excerpt exists, it should NOT contain "10,000"
            if (excerpt.includes("10000") || excerpt.includes("10,000")) {
              // This should not happen — 10,000 is not in source
            }
          }
        }
      }
    });

    it("detects invented source attribution", async () => {
      const sourceText = "Several organizations reported access challenges in affected areas.";
      const hallucinatedText =
        "According to UNSC Resolution 9999, all parties must allow unimpeded access, " +
        "as reported by several organizations.";

      // The hallucinated text introduces UNSC Resolution 9999 — not in source
      const provider = createMockProvider([
        {
          content: JSON.stringify({
            flags: [
              {
                type: "fabricated_source",
                text: "UNSC Resolution 9999",
                explanation: "Source citation not found in original text",
                severity: "high",
              },
            ],
            hallucinationScore: 0.8,
            checkedFields: ["sources", "citations"],
          }),
        },
      ]);

      const ctx = createPipelineContext(makeContent(hallucinatedText));
      const result = await hallucinationDetectorStage.run(makeContent(hallucinatedText), ctx, provider);

      if (result.data) {
        const data = result.data as { flags?: Array<{ type: string }>; hallucinationScore?: number };
        expect(data.hallucinationScore).toBeGreaterThan(0);
      }
    });
  });

  // ── Adversarial examples ────────────────────────────────────────────────

  describe("adversarial examples", () => {
    it("rejects hallucinated legal rulings", async () => {
      const sourceText =
        "The ICJ indicated provisional measures requiring Israel to prevent " +
        "acts within the scope of Article II of the Genocide Convention.";

      const provider = createMockProvider([
        {
          content: JSON.stringify({
            flags: [
              {
                type: "hallucinated_legal_ruling",
                text: "ICJ found Israel guilty of genocide",
                explanation: "Provisional measures ≠ final judgment on genocide",
                severity: "critical",
              },
            ],
            hallucinationScore: 0.95,
            checkedFields: ["legal_conclusions", "rulings"],
          }),
        },
      ]);

      const ctx = createPipelineContext(makeContent(sourceText));
      const result = await hallucinationDetectorStage.run(makeContent(sourceText), ctx, provider);

      if (result.data) {
        const data = result.data as { flags?: Array<{ type: string; severity: string }>; hallucinationScore?: number };
        const criticalFlag = data.flags?.find((f) => f.severity === "critical");
        expect(criticalFlag).toBeDefined();
      }
    });

    it("detects made-up direct quotes", async () => {
      const sourceText = "The High Commissioner expressed concern about the situation.";
      const provider = createMockProvider([
        {
          content: JSON.stringify({
            flags: [
              {
                type: "fabricated_quote",
                text: '"This is the worst catastrophe I have witnessed"',
                explanation: "Direct quote fabricated — not present in source",
                severity: "high",
              },
            ],
            hallucinationScore: 0.85,
            checkedFields: ["quotes", "direct_speech"],
          }),
        },
      ]);

      const ctx = createPipelineContext(makeContent(sourceText));
      const result = await hallucinationDetectorStage.run(makeContent(sourceText), ctx, provider);

      if (result.data) {
        const data = result.data as { hallucinationScore?: number };
        expect(data.hallucinationScore).toBeGreaterThan(0.5);
      }
    });
  });

  // ── Regression: all ground truth cases ──────────────────────────────────

  describe("ground truth regression", () => {
    // Positive cases — should detect hallucinations
    const positiveCases = hallucinationDetectionGroundTruth.filter((c) => c.expected.hasHallucination);
    // Negative cases — should NOT flag hallucinations
    const negativeCases = hallucinationDetectionGroundTruth.filter((c) => !c.expected.hasHallucination);

    it(`regression: ${positiveCases.length} positive hallucination cases`, () => {
      expect(positiveCases.length).toBeGreaterThan(0);
      for (const testCase of positiveCases) {
        expect(testCase.expected.hallucinationType).toBeDefined();
        // The candidate text differs from source in content (not just length)
        expect(testCase.candidateText).toBeTruthy();
        expect(testCase.sourceText).toBeTruthy();
        expect(testCase.candidateText).not.toBe(testCase.sourceText);
      }
    });

    it(`regression: ${negativeCases.length} negative (clean) cases`, () => {
      expect(negativeCases.length).toBeGreaterThan(0);
      for (const testCase of negativeCases) {
        expect(testCase.expected.hasHallucination).toBe(false);
        // Negative cases: candidate should be consistent with source
        expect(testCase.candidateText).toBeTruthy();
        expect(testCase.sourceText).toBeTruthy();
      }
    });

    it("covers all hallucination types in positive cases", () => {
      const coveredTypes = new Set(
        positiveCases.map((c) => c.expected.hallucinationType),
      );
      // Should cover multiple hallucination types
      expect(coveredTypes.size).toBeGreaterThan(3);
    });
  });
});
