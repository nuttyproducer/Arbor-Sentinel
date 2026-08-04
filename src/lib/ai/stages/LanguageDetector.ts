// src/lib/ai/stages/LanguageDetector.ts

import { z } from "zod";
import { createStage } from "../AIPipeline";
import type { AIProvider, AIOperationResult } from "../types";
import { emptyResult } from "../types";
import { StructuredOutputHandler } from "../StructuredOutputHandler";
import type { DetectionResult } from "./types";

const detectionSchema = z.object({
  languageCode: z.string().describe("ISO 639-1 language code"),
  languageName: z.string().describe("Human-readable language name"),
  confidence: z.number().min(0).max(1),
  isMixedLanguage: z.boolean(),
  otherLanguages: z.array(z.string()).optional(),
  isShortText: z.boolean(),
});

const LANGUAGE_DETECTION_PROMPT = {
  system: "You are a language detection expert. Detect the language of the provided text. Respond with JSON only.",
  user: `Detect the language of the following text. Return a JSON object with:
- languageCode: ISO 639-1 two-letter code
- languageName: full English name of the language
- confidence: 0-1 score (lower for short texts, ambiguous texts, or texts with many proper names)
- isMixedLanguage: true if the text contains multiple languages
- otherLanguages: array of other ISO 639-1 codes found (if mixed)
- isShortText: true if text is less than 50 characters

Important: short texts (<50 chars) or texts with many proper names should have reduced confidence.

Text to detect:
{{text}}`,
};

/**
 * Detects the language of source content with confidence scoring.
 * Handles single-language, mixed-language, short text, and proper-name-heavy text.
 */
export const languageDetectorStage = createStage({
  name: "language_detection",
  requires: [],
  run: async (
    input,
    _context,
    provider: AIProvider,
  ): Promise<AIOperationResult<DetectionResult>> => {
    const handler = new StructuredOutputHandler();
    const text = input.body;

    // Quick heuristic: if text is very short, boost the "short text" awareness
    const isVeryShort = text.length < 50;

    const prompt = {
      system: LANGUAGE_DETECTION_PROMPT.system,
      user: LANGUAGE_DETECTION_PROMPT.user.replace("{{text}}", text),
    };

    const result = await handler.extract(provider, prompt, detectionSchema);

    if (result.data) {
      // Boost isShortText flag for very short content
      if (isVeryShort && !result.data.isShortText) {
        result.data.isShortText = true;
        result.data.confidence = Math.min(result.data.confidence, 0.7);
        result.warnings.push("Short text: confidence capped at 0.7");
      }

      // Cap confidence at 1.0
      result.data.confidence = Math.min(result.data.confidence, 1.0);

      return {
        ...result,
        data: result.data,
      };
    }

    return emptyResult(result.modelUsed, result.warnings);
  },
});
