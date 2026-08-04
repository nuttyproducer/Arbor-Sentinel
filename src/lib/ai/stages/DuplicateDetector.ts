// src/lib/ai/stages/DuplicateDetector.ts

import { z } from "zod";
import { createStage } from "../AIPipeline";
import type { AIProvider, AIOperationResult } from "../types";
import { emptyResult } from "../types";
import { StructuredOutputHandler } from "../StructuredOutputHandler";
import type { DuplicateGroup, MatchLevel } from "./types";

const duplicateSchema = z.object({
  matches: z.array(z.object({
    existingRecordId: z.string(),
    matchLevel: z.enum(["exact_duplicate", "near_duplicate", "related", "new"]),
    similarityScore: z.number().min(0).max(1),
    rationale: z.string(),
    matchingFields: z.array(z.string()),
    confidence: z.number().min(0).max(1),
  })),
  mergeProposals: z.array(z.object({
    existingRecordId: z.string(),
    rationale: z.string(),
    fieldsToMerge: z.array(z.string()),
    confidence: z.number().min(0).max(1),
  })).optional(),
});

const PROMPT = {
  system: `You are a duplicate detection expert. Compare content against existing records. Never auto-merge — only propose. Return JSON only.`,
  user: `Compare the following new content against existing records to detect duplicates.

New content:
Title: {{title}}
Body: {{body}}
Date: {{date}}
Location: {{location}}

Existing records:
{{existingRecords}}

For each match:
- existingRecordId: ID of the matching record
- matchLevel: exact_duplicate/near_duplicate/related/new
- similarityScore: 0-1
- rationale: why they match
- matchingFields: which fields overlap (title, date, location, entities, description)
- confidence: 0-1

Rules:
- Similarity thresholds must be conservative — prefer false negatives over false positives
- Do not merge records with conflicting factual claims
- Merge proposals are suggestions, not actions — never auto-merge
- Configurable thresholds per match level

Return JSON with matches and optional mergeProposals.`,
};

/**
 * Detects exact and near duplicates against existing records.
 *
 * Compares new content against existing records, classifies matches as
 * exact_duplicate/near_duplicate/related/new, and generates merge proposals.
 * Never auto-merges — proposals are suggestions for human review. Returns an
 * empty result when there are no existing records to compare against.
 */
export const duplicateDetectorStage = createStage({
  name: "duplicate_detection",
  requires: ["claim_extraction", "topic_classification"],
  run: async (input, context, provider: AIProvider): Promise<AIOperationResult<DuplicateGroup[]>> => {
    if (!context.existingRecords || context.existingRecords.length === 0) {
      return {
        data: [],
        confidence: 1.0,
        modelUsed: "none",
        tokensUsed: { input: 0, output: 0 },
        latencyMs: 0,
        warnings: ["No existing records to compare against"],
        sourceSpans: [],
      };
    }

    const handler = new StructuredOutputHandler();
    const prompt = {
      system: PROMPT.system,
      user: PROMPT.user
        .replace("{{title}}", input.title)
        .replace("{{body}}", input.body)
        .replace("{{date}}", input.publishedAt ?? "unknown")
        .replace("{{location}}", (input.metadata?.location as string) ?? "unknown")
        .replace("{{existingRecords}}", JSON.stringify(context.existingRecords, null, 2)),
    };

    const result = await handler.extract(provider, prompt, duplicateSchema);

    if (result.data) {
      const groups: DuplicateGroup[] = result.data.matches
        .filter((m) => m.matchLevel !== "new")
        .map((m) => ({
          primaryRecordId: m.existingRecordId,
          duplicateRecordIds: [input.url],
          matchLevel: m.matchLevel as MatchLevel,
          similarityScore: m.similarityScore,
          rationale: m.rationale,
          matchingFields: m.matchingFields,
          confidence: Math.min(m.confidence, 1),
        }));

      return { ...result, data: groups };
    }

    return emptyResult(result.modelUsed, result.warnings);
  },
});
