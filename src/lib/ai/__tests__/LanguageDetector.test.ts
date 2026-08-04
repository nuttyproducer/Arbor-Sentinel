// src/lib/ai/__tests__/LanguageDetector.test.ts

import { describe, it, expect } from "vitest";
import { createMockProvider } from "../provider";
import { languageDetectorStage } from "../stages/LanguageDetector";
import { createPipelineContext } from "../AIPipeline";
import type { NormalizedContent } from "../../collectors/types";

function makeContent(body: string, language?: string): NormalizedContent {
  return {
    title: "Test",
    body,
    url: "https://example.com/test",
    tags: [],
    metadata: {},
    language,
  };
}

describe("LanguageDetector", () => {
  it("detects English text with high confidence", async () => {
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          languageCode: "en",
          languageName: "English",
          confidence: 0.98,
          isMixedLanguage: false,
          isShortText: false,
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent(
      "The International Court of Justice issued a landmark ruling on Friday regarding the application of provisional measures."
    ));

    const result = await languageDetectorStage.run(makeContent(
      "The International Court of Justice issued a landmark ruling on Friday regarding the application of provisional measures."
    ), ctx, provider);

    expect(result.data!.languageCode).toBe("en");
    expect(result.data!.confidence).toBeGreaterThan(0.9);
    expect(result.data!.isMixedLanguage).toBe(false);
  });

  it("detects mixed language content", async () => {
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          languageCode: "ar",
          languageName: "Arabic",
          confidence: 0.85,
          isMixedLanguage: true,
          otherLanguages: ["en"],
          isShortText: false,
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent("Arabic text with some English terms mixed in."));
    const result = await languageDetectorStage.run(makeContent("Arabic text with some English terms mixed in."), ctx, provider);

    expect(result.data!.isMixedLanguage).toBe(true);
    expect(result.data!.otherLanguages).toContain("en");
  });

  it("returns lower confidence for short text", async () => {
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          languageCode: "fr",
          languageName: "French",
          confidence: 0.6,
          isMixedLanguage: false,
          isShortText: true,
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent("Bonjour"));
    const result = await languageDetectorStage.run(makeContent("Bonjour"), ctx, provider);

    expect(result.data!.isShortText).toBe(true);
    expect(result.data!.confidence).toBeLessThanOrEqual(0.7);
  });

  it("handles provider error gracefully", async () => {
    const provider = createMockProvider([
      { content: "not json", finishReason: "stop" },
      { content: "still not json" },
      { content: "nope" },
      { content: "nope again" },
    ]);

    const ctx = createPipelineContext(makeContent("Some text"));
    const result = await languageDetectorStage.run(makeContent("Some text"), ctx, provider);

    // Should return empty result after exhausting retries
    expect(result.data).toBeNull();
    expect(result.confidence).toBe(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("works with proper-name-heavy text", async () => {
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          languageCode: "en",
          languageName: "English",
          confidence: 0.7,
          isMixedLanguage: false,
          isShortText: false,
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent(
      "António Guterres spoke at the Palais des Nations in Geneva about UNRWA and UNHCR operations."
    ));
    const result = await languageDetectorStage.run(makeContent(
      "António Guterres spoke at the Palais des Nations in Geneva about UNRWA and UNHCR operations."
    ), ctx, provider);

    expect(result.data!.languageCode).toBe("en");
    // Confidence may be reduced due to proper names
    expect(result.data!.confidence).toBeGreaterThan(0);
  });
});
