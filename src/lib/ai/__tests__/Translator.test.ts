// src/lib/ai/__tests__/Translator.test.ts

import { describe, it, expect } from "vitest";
import { createMockProvider } from "../provider";
import { translatorStage } from "../stages/Translator";
import { translationReviewerStage } from "../stages/TranslationReviewer";
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

describe("Translator", () => {
  it("translates text and preserves named entities", async () => {
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          translatedText: "The International Court of Justice issued a ruling.",
          confidence: 0.9,
          preservedEntities: ["International Court of Justice", "ICJ"],
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent(""));
    ctx.set("language_detection", {
      data: { languageCode: "fr", languageName: "French", confidence: 0.95, isMixedLanguage: false, isShortText: false },
      confidence: 0.95,
      modelUsed: "mock",
      tokensUsed: { input: 10, output: 20 },
      latencyMs: 100,
      warnings: [],
      sourceSpans: [],
    });

    const result = await translatorStage.run(
      makeContent("La Cour internationale de Justice a rendu un arrêt.", "fr"),
      ctx,
      provider,
    );

    expect(result.data!.translatedText).toContain("International Court of Justice");
    expect(result.data!.preservedEntities).toContain("International Court of Justice");
    expect(result.data!.sourceLanguage).toBe("fr");
    expect(result.data!.targetLanguage).toBe("en");
    expect(result.warnings).toContain("AI-assisted translation — human review pending");
  });

  it("skips translation when already in target language", async () => {
    const provider = createMockProvider([]);

    const ctx = createPipelineContext(makeContent(""));
    ctx.set("language_detection", {
      data: { languageCode: "en", languageName: "English", confidence: 0.98, isMixedLanguage: false, isShortText: false },
      confidence: 0.98,
      modelUsed: "mock",
      tokensUsed: { input: 10, output: 20 },
      latencyMs: 100,
      warnings: [],
      sourceSpans: [],
    });

    const result = await translatorStage.run(
      makeContent("This is already in English.", "en"),
      ctx,
      provider,
    );

    expect(result.data!.translatedText).toBe("This is already in English.");
    expect(result.confidence).toBe(1.0);
    expect(result.warnings).toContain("Already in target language, translation skipped");
  });

  it("preserves original text alongside translation", async () => {
    const originalText = "Le rapport documente 1500 victimes civiles.";
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          translatedText: "The report documents 1500 civilian victims.",
          confidence: 0.88,
          preservedEntities: [],
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent(""));
    ctx.set("language_detection", {
      data: { languageCode: "fr", languageName: "French", confidence: 0.95, isMixedLanguage: false, isShortText: false },
      confidence: 0.95,
      modelUsed: "mock",
      tokensUsed: { input: 10, output: 20 },
      latencyMs: 100,
      warnings: [],
      sourceSpans: [],
    });

    const result = await translatorStage.run(makeContent(originalText, "fr"), ctx, provider);

    expect(result.data!.originalText).toBe(originalText);
    expect(result.data!.translatedText).not.toBe(originalText);
  });
});

describe("TranslationReviewer", () => {
  it("classifies legal content as high risk", async () => {
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          riskLevel: "high",
          reasons: ["Contains legal findings", "References specific court case"],
          humanReviewRequired: true,
          detectedCategories: ["legal"],
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent(""));
    const result = await translationReviewerStage.run(
      makeContent("The ICC arrest warrant states that the defendant is charged with war crimes."),
      ctx,
      provider,
    );

    expect(result.data!.riskLevel).toBe("high");
    expect(result.data!.humanReviewRequired).toBe(true);
    expect(result.data!.detectedCategories).toContain("legal");
  });

  it("classifies casualty content as high risk", async () => {
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          riskLevel: "high",
          reasons: ["Contains casualty figures"],
          humanReviewRequired: true,
          detectedCategories: ["casualty"],
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent(""));
    const result = await translationReviewerStage.run(
      makeContent("The airstrike killed 47 civilians including 12 children."),
      ctx,
      provider,
    );

    expect(result.data!.riskLevel).toBe("high");
    expect(result.data!.humanReviewRequired).toBe(true);
  });

  it("classifies general news as low risk", async () => {
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          riskLevel: "low",
          reasons: ["General public statement"],
          humanReviewRequired: false,
          detectedCategories: ["general_news"],
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent(""));
    const result = await translationReviewerStage.run(
      makeContent("The ministry announced a new public health initiative today."),
      ctx,
      provider,
    );

    expect(result.data!.riskLevel).toBe("low");
    expect(result.data!.humanReviewRequired).toBe(false);
  });

  it("enforces human review for high risk even if model says false", async () => {
    const provider = createMockProvider([
      {
        content: JSON.stringify({
          riskLevel: "high",
          reasons: ["Casualty figures"],
          humanReviewRequired: false, // Model incorrectly says no review needed
          detectedCategories: ["casualty"],
        }),
      },
    ]);

    const ctx = createPipelineContext(makeContent(""));
    const result = await translationReviewerStage.run(
      makeContent("47 civilians were killed."),
      ctx,
      provider,
    );

    expect(result.data!.humanReviewRequired).toBe(true); // Overridden
    expect(result.warnings.some(w => w.includes("Overrode"))).toBe(true);
  });

  it("defaults to high risk on classification failure", async () => {
    const provider = createMockProvider([
      { content: "bad" },
      { content: "bad" },
      { content: "bad" },
      { content: "bad" },
    ]);

    const ctx = createPipelineContext(makeContent(""));
    const result = await translationReviewerStage.run(
      makeContent("Some content"),
      ctx,
      provider,
    );

    expect(result.data!.riskLevel).toBe("high");
    expect(result.data!.humanReviewRequired).toBe(true);
  });
});
