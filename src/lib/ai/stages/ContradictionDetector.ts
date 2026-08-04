// src/lib/ai/stages/ContradictionDetector.ts

import { z } from "zod";
import { createStage } from "../AIPipeline";
import type { AIProvider, AIOperationResult } from "../types";
import { emptyResult } from "../types";
import { StructuredOutputHandler } from "../StructuredOutputHandler";
import type { ContradictionReport, ContradictionSeverity } from "./types";
import type { ExtractedClaim } from "./types";

const contradictionSchema = z.object({
  contradictions: z.array(z.object({
    claimText: z.string(),
    conflictingClaimText: z.string(),
    conflictingSourceId: z.string(),
    contradictionType: z.enum(["numerical", "factual", "temporal", "source_source", "source_quality"]),
    severity: z.enum(["critical", "major", "minor", "informational"]),
    conflictingFields: z.array(z.string()),
    recommendation: z.enum(["flag_for_review", "request_clarification", "monitor"]),
  })),
});

const PROMPT = {
  system: `You are a contradiction detection expert. Flag when claims contradict existing verified records. NEVER auto-resolve contradictions — all require human review. Return JSON only.`,
  user: `Compare the following claims against existing verified records. Detect contradictions.

New claims:
{{claims}}

Existing verified records:
{{verifiedRecords}}

For each contradiction:
- claimText: the new claim that contradicts
- conflictingClaimText: the existing verified claim
- conflictingSourceId: source ID of the conflicting record
- contradictionType: numerical/factual/temporal/source_source/source_quality
- severity: critical/major/minor/informational
- conflictingFields: which fields conflict
- recommendation: flag_for_review/request_clarification/monitor

Rules:
- NEVER auto-resolve a contradiction — all require human review
- Do not delete or modify original claims — preserve both sides
- Numerical contradictions must preserve both numbers with source attribution
- Contradictions between verified sources escalated to expert review

Text:
{{text}}`,
};

let contradictionCounter = 0;

export const contradictionDetectorStage = createStage({
  name: "contradiction_detection",
  requires: ["claim_extraction", "duplicate_detection"],
  run: async (input, context, provider: AIProvider): Promise<AIOperationResult<ContradictionReport[]>> => {
    const claimsResult = context.get("claim_extraction");
    const claims: ExtractedClaim[] = (claimsResult?.data as ExtractedClaim[]) ?? [];

    if (claims.length === 0) {
      return { data: [], confidence: 1.0, modelUsed: "none", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: ["No claims to check for contradictions"], sourceSpans: [] };
    }

    const handler = new StructuredOutputHandler();
    const verifiedRecords = context.existingRecords ?? [];

    const prompt = {
      system: PROMPT.system,
      user: PROMPT.user
        .replace("{{claims}}", JSON.stringify(claims.map((c) => ({ id: c.id, text: c.claimText, sourceId: input.url })), null, 2))
        .replace("{{verifiedRecords}}", JSON.stringify(verifiedRecords, null, 2))
        .replace("{{text}}", input.body),
    };

    const result = await handler.extract(provider, prompt, contradictionSchema);

    if (result.data) {
      const reports: ContradictionReport[] = result.data.contradictions.map((c) => {
        contradictionCounter++;
        return {
          id: `contradiction_${contradictionCounter}`,
          claimA: { claimId: claims[0]?.id ?? "unknown", claimText: c.claimText, sourceId: input.url },
          claimB: { claimId: "verified_record", claimText: c.conflictingClaimText, sourceId: c.conflictingSourceId },
          contradictionType: c.contradictionType,
          severity: c.severity as ContradictionSeverity,
          conflictingFields: c.conflictingFields,
          recommendation: c.recommendation,
          resolutionState: "unresolved", // NEVER auto-resolve
        };
      });

      return { ...result, data: reports };
    }

    return emptyResult(result.modelUsed, result.warnings);
  },
});
