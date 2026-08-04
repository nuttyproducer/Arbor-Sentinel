// src/lib/ai/stages/Translator.ts

import { z } from "zod";
import { createStage } from "../AIPipeline";
import type { AIProvider, AIOperationResult } from "../types";
import { emptyResult } from "../types";
import { StructuredOutputHandler } from "../StructuredOutputHandler";
import type { TranslationResult } from "./types";
import type { DetectionResult } from "./types";

const translationSchema = z.object({
  translatedText: z.string(),
  confidence: z.number().min(0).max(1),
  preservedEntities: z.array(z.string()),
});

const TRANSLATION_PROMPT = {
  system: `You are a professional translator. Translate the provided text accurately while preserving:
- Named entities (people, places, organizations) in their original form
- URLs and email addresses
- Numbers, dates, and measurements exactly as written
- Original formatting and paragraph structure

Do NOT translate names of people, places, or organizations — keep them in the original language.
Return JSON only.`,
  user: `Translate the following text from {{sourceLanguage}} to {{targetLanguage}}.

Original text:
{{text}}

Return a JSON object with:
- translatedText: the full translated text
- confidence: 0-1 score reflecting translation quality confidence
- preservedEntities: array of named entities kept in original form`,
};

/**
 * Translates content while preserving named entities, URLs, numbers, and formatting.
 * NEVER translates names of people, places, or organizations.
 */
export const translatorStage = createStage({
  name: "translation",
  requires: ["language_detection"],
  run: async (
    input,
    context,
    provider: AIProvider,
  ): Promise<AIOperationResult<TranslationResult>> => {
    const handler = new StructuredOutputHandler();
    const langResult = context.get("language_detection");

    const sourceLanguage =
      (langResult?.data as DetectionResult)?.languageCode ?? input.language ?? "unknown";
    const targetLanguage = "en"; // Configurable later

    // Skip if already in target language
    if (sourceLanguage === targetLanguage) {
      return {
        data: {
          sourceLanguage,
          targetLanguage,
          translatedText: input.body,
          originalText: input.body,
          confidence: 1.0,
          preservedEntities: [],
          humanReviewed: false,
        },
        confidence: 1.0,
        modelUsed: "none",
        tokensUsed: { input: 0, output: 0 },
        latencyMs: 0,
        warnings: ["Already in target language, translation skipped"],
        sourceSpans: [],
      };
    }

    const prompt = {
      system: TRANSLATION_PROMPT.system,
      user: TRANSLATION_PROMPT.user
        .replace("{{sourceLanguage}}", sourceLanguage)
        .replace("{{targetLanguage}}", targetLanguage)
        .replace("{{text}}", input.body),
    };

    const result = await handler.extract(provider, prompt, translationSchema);

    if (result.data) {
      return {
        ...result,
        data: {
          sourceLanguage,
          targetLanguage,
          translatedText: result.data.translatedText,
          originalText: input.body,
          confidence: result.data.confidence,
          preservedEntities: result.data.preservedEntities,
          humanReviewed: false,
        },
        warnings: [
          ...result.warnings,
          "AI-assisted translation — human review pending",
        ],
      };
    }

    return emptyResult(result.modelUsed, result.warnings);
  },
});
