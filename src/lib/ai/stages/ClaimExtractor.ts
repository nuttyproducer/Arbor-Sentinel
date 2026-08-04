// src/lib/ai/stages/ClaimExtractor.ts

import { z } from "zod";
import { createStage } from "../AIPipeline";
import type { AIProvider, AIOperationResult } from "../types";
import { emptyResult } from "../types";
import { StructuredOutputHandler } from "../StructuredOutputHandler";
import type { ExtractedClaim, ClaimType } from "./types";
import type { ExtractedEntity } from "./types";

const claimSchema = z.object({
  claims: z.array(z.object({
    claimText: z.string(),
    claimType: z.enum(["legal", "humanitarian", "political", "factual", "allegation"]),
    confidence: z.number().min(0).max(1),
    startChar: z.number(),
    endChar: z.number(),
    linkedEntityNames: z.array(z.string()),
    isNested: z.boolean().default(false),
    parentClaimIndex: z.number().optional(),
    fromOpinionContent: z.boolean().default(false),
  })),
});

const CLAIM_EXTRACTION_PROMPT = {
  system: `You are a claim extraction expert. Identify distinct factual claims in text. Distinguish claims from opinions, hypotheticals, and rhetorical statements. Return JSON only.`,
  user: `Extract all distinct factual claims from the following text. For each claim:

- claimText: the exact claim statement
- claimType: legal (court findings, legal conclusions), humanitarian (aid access, civilian impact), political (policy positions, statements), factual (dates, numbers, events), allegation (unproven accusations)
- confidence: 0-1
- startChar/endChar: exact character positions
- linkedEntityNames: names of entities this claim involves
- isNested: true if part of a compound statement
- parentClaimIndex: index of parent claim if nested (0-based)
- fromOpinionContent: true if from marked opinion/editorial content

Rules:
- Never mark as "verified" — use "unverified" or flag source-stated
- Distinguish "source says X" from factual claims
- Allegations MUST be labeled as allegation type
- Do not extract claims from clearly marked opinion/editorial content without labeling
- Legal claims must use the LegalStatus controlled vocabulary where applicable

Text:
{{text}}`,
};

let claimCounter = 0;

/**
 * Extracts factual claims with type classification, entity linking, and source spans.
 * Distinguishes claims from opinions and allegations.
 */
export const claimExtractorStage = createStage({
  name: "claim_extraction",
  requires: ["entity_extraction"],
  run: async (
    input,
    context,
    provider: AIProvider,
  ): Promise<AIOperationResult<ExtractedClaim[]>> => {
    const handler = new StructuredOutputHandler();

    const prompt = {
      system: CLAIM_EXTRACTION_PROMPT.system,
      user: CLAIM_EXTRACTION_PROMPT.user.replace("{{text}}", input.body),
    };

    const result = await handler.extract(provider, prompt, claimSchema);

    if (result.data) {
      const entitiesResult = context.get("entity_extraction");
      const entities: ExtractedEntity[] = (entitiesResult?.data as ExtractedEntity[]) ?? [];

      const claims: ExtractedClaim[] = result.data.claims.map((c, idx) => {
        claimCounter++;
        const claimId = `claim_${claimCounter}`;

        // Link to entities by name matching
        const linkedEntityIds = c.linkedEntityNames
          .map((name) => {
            const entity = entities.find(
              (e) =>
                e.canonicalName.toLowerCase() === name.toLowerCase() ||
                e.aliases.some((a) => a.toLowerCase() === name.toLowerCase()),
            );
            return entity?.id;
          })
          .filter((id): id is string => id !== undefined);

        const parentClaimId =
          c.isNested && c.parentClaimIndex !== undefined
            ? `claim_${claimCounter - (idx - c.parentClaimIndex)}`
            : undefined;

        return {
          id: claimId,
          claimText: c.claimText,
          claimType: c.claimType as ClaimType,
          confidence: Math.min(c.confidence, 1),
          sourceSpan: {
            sourceId: input.url,
            start: c.startChar,
            end: c.endChar,
            excerpt: input.body.slice(c.startChar, c.endChar),
          },
          linkedEntityIds,
          verificationStatus: "unverified", // NEVER auto-verify
          isNested: c.isNested,
          parentClaimId,
          fromOpinionContent: c.fromOpinionContent,
        };
      });

      return {
        ...result,
        data: claims,
      };
    }

    return emptyResult(result.modelUsed, result.warnings);
  },
});
