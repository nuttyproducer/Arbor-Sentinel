// src/lib/ai/stages/HallucinationDetector.ts

import { z } from "zod";
import { createStage } from "../AIPipeline";
import type { AIProvider, AIOperationResult } from "../types";
import { emptyResult } from "../types";
import { StructuredOutputHandler } from "../StructuredOutputHandler";
import type { HallucinationFlag, HallucinationSeverity } from "./types";
import type { ExtractedClaim, ExtractedEntity, TimelineEvent, EntityRelationship } from "./types";

const hallucinationSchema = z.object({
  flags: z.array(z.object({
    flagType: z.enum(["unsupported_claim", "numerical_mismatch", "entity_hallucination", "relationship_hallucination", "temporal_hallucination"]),
    severity: z.enum(["critical", "major", "minor", "informational"]),
    flaggedContent: z.string(),
    reason: z.string(),
    sourceStage: z.string(),
    blocksPublication: z.boolean(),
  })),
});

const PROMPT = {
  system: `You are a hallucination detection expert. Cross-reference AI-extracted claims against source text. Flag any claim not supported by the source. Prefer false positives over false negatives. Return JSON only.`,
  user: `Cross-reference the following AI extractions against the original source text.

Source text:
{{sourceText}}

Extracted claims:
{{claims}}

Extracted entities:
{{entities}}

Timeline events:
{{timeline}}

Relationships:
{{relationships}}

For each hallucination detected:
- flagType: unsupported_claim/numerical_mismatch/entity_hallucination/relationship_hallucination/temporal_hallucination
- severity: critical (factually incorrect)/major (unsupported)/minor (extrapolation)/informational (potential ambiguity)
- flaggedContent: the extracted content that appears hallucinated
- reason: why it's flagged (reference the source text)
- sourceStage: which stage produced it
- blocksPublication: true for critical/major hallucinations

Rules:
- Prefer false positives over false negatives — safety layer
- Any claim without source-text support is a hallucination
- Numbers must match source exactly
- Entities must appear verbatim in source text
- Relationships must have explicit source evidence

Return JSON with flags array.`,
};

let flagCounter = 0;

export const hallucinationDetectorStage = createStage({
  name: "hallucination_detection",
  requires: ["entity_extraction", "claim_extraction", "timeline_extraction", "relationship_detection"],
  run: async (input, context, provider: AIProvider): Promise<AIOperationResult<HallucinationFlag[]>> => {
    const handler = new StructuredOutputHandler();

    const claimsResult = context.get("claim_extraction");
    const entitiesResult = context.get("entity_extraction");
    const timelineResult = context.get("timeline_extraction");
    const relationshipsResult = context.get("relationship_detection");

    const claims = (claimsResult?.data as ExtractedClaim[]) ?? [];
    const entities = (entitiesResult?.data as ExtractedEntity[]) ?? [];
    const timeline = (timelineResult?.data as TimelineEvent[]) ?? [];
    const relationships = (relationshipsResult?.data as EntityRelationship[]) ?? [];

    const prompt = {
      system: PROMPT.system,
      user: PROMPT.user
        .replace("{{sourceText}}", input.body)
        .replace("{{claims}}", JSON.stringify(claims.map((c) => ({ id: c.id, text: c.claimText, type: c.claimType })), null, 2))
        .replace("{{entities}}", JSON.stringify(entities.map((e) => ({ name: e.canonicalName, type: e.entityType })), null, 2))
        .replace("{{timeline}}", JSON.stringify(timeline.map((t) => ({ description: t.description, date: t.date })), null, 2))
        .replace("{{relationships}}", JSON.stringify(relationships.map((r) => ({ source: r.sourceEntityId, target: r.targetEntityId, type: r.relationshipType })), null, 2)),
    };

    const result = await handler.extract(provider, prompt, hallucinationSchema);

    if (result.data) {
      const flags: HallucinationFlag[] = result.data.flags.map((f) => {
        flagCounter++;
        return {
          id: `hallucination_flag_${flagCounter}`,
          flagType: f.flagType,
          severity: f.severity as HallucinationSeverity,
          flaggedContent: f.flaggedContent,
          expectedSourceSpan: { sourceId: input.url, start: 0, end: 0, excerpt: "" },
          reason: f.reason,
          sourceStage: f.sourceStage,
          blocksPublication: f.blocksPublication || f.severity === "critical" || f.severity === "major",
        };
      });

      return { ...result, data: flags };
    }

    return emptyResult(result.modelUsed, result.warnings);
  },
});
