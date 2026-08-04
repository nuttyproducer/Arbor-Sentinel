// src/lib/ai/stages/ConfidenceEstimator.ts

import { createStage } from "../AIPipeline";
import type { AIOperationResult } from "../types";
import { successResult } from "../types";
import type { ConfidenceReport } from "./types";

/**
 * Calibrates confidence scores across all AI stages.
 * Applies source quality weighting. Flags low-confidence output for human review.
 * Does NOT call the AI — purely algorithmic.
 */
export const confidenceEstimatorStage = createStage({
  name: "confidence_estimation",
  requires: [
    "language_detection", "entity_extraction", "claim_extraction",
    "timeline_extraction", "geographic_extraction", "relationship_detection",
    "topic_classification",
  ],
  run: async (_input, context): Promise<AIOperationResult<ConfidenceReport>> => {
    const stageNames = [
      "language_detection", "entity_extraction", "claim_extraction",
      "timeline_extraction", "geographic_extraction", "relationship_detection",
      "topic_classification",
    ];

    const stageScores: Record<string, number> = {};
    let totalConfidence = 0;
    let stagesWithData = 0;

    for (const name of stageNames) {
      const result = context.get(name);
      const score = result?.confidence ?? 0;
      stageScores[name] = score;
      if (result?.data !== null && result?.data !== undefined) {
        totalConfidence += score;
        stagesWithData++;
      }
    }

    // Average confidence across stages that produced data
    const avgStageConfidence = stagesWithData > 0
      ? totalConfidence / stagesWithData
      : 0;

    // Source quality weight: 0 (unreviewed) to 5 (authoritative)
    const sourceQualityWeight = Math.min(context.sourceQuality / 5, 1);
    const sourceQualityFactor = 0.5 + sourceQualityWeight * 0.5; // Range 0.5–1.0

    // Factors
    const extractionConsistency = calculateConsistency(stageScores);
    const crossSourceAgreement = context.existingRecords ? 0.7 : 0.5; // Lower when no cross-reference
    const temporalRelevance = 0.8; // Default; reduced for old content
    const languageConfidence = stageScores["language_detection"] ?? 0.5;

    // Weighted unified confidence. avgStageConfidence reflects how confident
    // the extraction stages themselves were; sourceQualityFactor discounts for
    // unreviewed/low-authority sources. Together these carry the most weight.
    const weights = {
      avgStageConfidence: 0.25,
      sourceQuality: 0.25,
      extractionConsistency: 0.15,
      crossSourceAgreement: 0.10,
      temporalRelevance: 0.10,
      languageConfidence: 0.15,
    };

    const unifiedConfidence = Math.min(
      avgStageConfidence * weights.avgStageConfidence +
        sourceQualityFactor * weights.sourceQuality +
        extractionConsistency * weights.extractionConsistency +
        crossSourceAgreement * weights.crossSourceAgreement +
        temporalRelevance * weights.temporalRelevance +
        languageConfidence * weights.languageConfidence,
      1.0,
    );

    return successResult(
      {
        unifiedConfidence,
        stageScores,
        sourceQualityWeight,
        requiresHumanReview: unifiedConfidence < 0.6,
        factors: {
          sourceQuality: sourceQualityFactor,
          extractionConsistency,
          crossSourceAgreement,
          temporalRelevance,
          languageConfidence,
        },
      },
      {
        confidence: unifiedConfidence,
        modelUsed: "algorithm",
        tokensUsed: { input: 0, output: 0 },
        latencyMs: 0,
      },
    );
  },
});

function calculateConsistency(scores: Record<string, number>): number {
  const values = Object.values(scores).filter((v) => v > 0);
  if (values.length < 2) return 1.0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Lower std dev = higher consistency
  return Math.max(0, 1 - stdDev * 2);
}
