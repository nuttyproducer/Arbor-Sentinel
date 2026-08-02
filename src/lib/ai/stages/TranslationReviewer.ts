// src/lib/ai/stages/TranslationReviewer.ts

import { z } from "zod";
import { createStage } from "../AIPipeline";
import type { AIProvider, AIOperationResult } from "../types";
import { StructuredOutputHandler } from "../StructuredOutputHandler";
import type { TranslationRiskClassification, RiskLevel } from "./types";

const reviewSchema = z.object({
  riskLevel: z.enum(["low", "medium", "high"]),
  reasons: z.array(z.string()),
  humanReviewRequired: z.boolean(),
  detectedCategories: z.array(z.string()),
});

const REVIEW_PROMPT = {
  system: `You are a content risk classifier for translation review. Classify content into risk levels for mandatory human review.

Risk levels:
- low: General news, public statements, routine reporting
- medium: Humanitarian reporting, political analysis, human rights documentation
- high: Legal documents, casualty figures, witness testimony, personal identities, medical records

High-risk content MUST be flagged for mandatory human review before any use of the translation.
Return JSON only.`,
  user: `Classify the following content for translation review risk.

Content:
{{text}}

Return a JSON object with:
- riskLevel: "low", "medium", or "high"
- reasons: array of specific reasons for this classification
- humanReviewRequired: true if risk is "high" (legal, casualty, testimony, identity, medical)
- detectedCategories: array of content categories found (legal, casualty, testimony, identity, medical, general_news, political_analysis, humanitarian, human_rights)`,
};

/**
 * Classifies content risk level for translation review.
 * High-risk content (legal, casualty, testimony, identity) requires mandatory human review.
 */
export const translationReviewerStage = createStage({
  name: "translation_review",
  requires: ["translation"],
  run: async (
    input,
    _context,
    provider: AIProvider,
  ): Promise<AIOperationResult<TranslationRiskClassification>> => {
    const handler = new StructuredOutputHandler();

    const prompt = {
      system: REVIEW_PROMPT.system,
      user: REVIEW_PROMPT.user.replace("{{text}}", input.body),
    };

    const result = await handler.extract(provider, prompt, reviewSchema);

    if (result.data) {
      // Enforce: high risk ALWAYS requires human review
      if (result.data.riskLevel === "high" && !result.data.humanReviewRequired) {
        result.data.humanReviewRequired = true;
        result.warnings.push("Overrode humanReviewRequired to true for high-risk content");
      }

      return {
        ...result,
        data: result.data,
      };
    }

    // Default to high risk on failure (safe default)
    return {
      data: {
        riskLevel: "high" as RiskLevel,
        reasons: ["Failed to classify — defaulting to high risk"],
        humanReviewRequired: true,
        detectedCategories: [],
      },
      confidence: 0,
      modelUsed: result.modelUsed,
      tokensUsed: result.tokensUsed,
      latencyMs: result.latencyMs,
      warnings: [...result.warnings, "Classification failed, defaulting to high risk"],
      sourceSpans: [],
    };
  },
});
