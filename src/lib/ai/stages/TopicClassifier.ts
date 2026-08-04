// src/lib/ai/stages/TopicClassifier.ts

import { z } from "zod";
import { createStage } from "../AIPipeline";
import type { AIProvider, AIOperationResult } from "../types";
import { emptyResult } from "../types";
import { StructuredOutputHandler } from "../StructuredOutputHandler";
import type { TopicClassification } from "./types";

const classificationSchema = z.object({
  classifications: z.array(z.object({
    categoryId: z.string(),
    confidence: z.number().min(0).max(1),
    supportingEvidence: z.string(),
    alternativesConsidered: z.array(z.string()),
  })),
});

const EVIDENCE_CATEGORIES = [
  "civilian_casualties", "infrastructure_damage", "journalists_media_workers",
  "medical_workers_healthcare", "aid_obstruction", "food_water_sanitation",
  "forced_displacement", "housing_cultural_destruction", "detention_mistreatment",
  "torture_allegations", "mass_graves", "public_incitement",
  "arms_transfers", "humanitarian_access_restrictions", "ceasefire_violations",
];

const PROMPT = {
  system: `You are a topic classification expert. Classify content into evidence categories. Never force a classification — "uncategorized" is valid. Return JSON only.`,
  user: `Classify the following content into evidence categories. Available categories:
${EVIDENCE_CATEGORIES.join(", ")}

For each matching category:
- categoryId: the category slug
- confidence: 0-1
- supportingEvidence: excerpt from text supporting this classification
- alternativesConsidered: other categories you considered

Rules:
- Multi-label: content may match multiple categories
- Never force a classification — it's OK to return an empty array
- Classification confidence must be calibrated
- Do not conflate topic classification with verification status

Text:
{{text}}`,
};

/**
 * Classifies content into evidence categories (multi-label).
 * Produces document-level topic classifications with calibrated
 * confidence and supporting evidence. "Uncategorized" is a valid output.
 */
export const topicClassifierStage = createStage({
  name: "topic_classification",
  requires: ["entity_extraction", "claim_extraction"],
  run: async (input, _context, provider: AIProvider): Promise<AIOperationResult<TopicClassification[]>> => {
    const handler = new StructuredOutputHandler();
    const prompt = { system: PROMPT.system, user: PROMPT.user.replace("{{text}}", input.body) };
    const result = await handler.extract(provider, prompt, classificationSchema);

    if (result.data) {
      const classifications: TopicClassification[] = result.data.classifications.map((c) => ({
        categoryId: c.categoryId,
        confidence: Math.min(c.confidence, 1),
        supportingEvidence: c.supportingEvidence,
        alternativesConsidered: c.alternativesConsidered,
        level: "document" as const,
      }));

      return { ...result, data: classifications };
    }

    return emptyResult(result.modelUsed, result.warnings);
  },
});
