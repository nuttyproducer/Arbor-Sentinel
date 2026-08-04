// src/lib/ai/stages/RelationshipDetector.ts

import { z } from "zod";
import { createStage } from "../AIPipeline";
import type { AIProvider, AIOperationResult } from "../types";
import { emptyResult } from "../types";
import { StructuredOutputHandler } from "../StructuredOutputHandler";
import type { EntityRelationship, RelationshipStrength, ExtractedEntity } from "./types";

const relationshipSchema = z.object({
  relationships: z.array(z.object({
    sourceEntityName: z.string(),
    targetEntityName: z.string(),
    relationshipType: z.enum(["affiliation", "association", "location", "temporal", "causal", "documentary"]),
    direction: z.enum(["directed", "undirected"]),
    strength: z.enum(["strong", "weak", "inferred"]),
    label: z.string(),
    confidence: z.number().min(0).max(1),
    startChar: z.number(),
    endChar: z.number(),
    isInferred: z.boolean(),
  })),
});

const PROMPT = {
  system: `You are a relationship detection expert. Identify relationships between entities. Causal relationships must be explicitly stated in source — never infer causation. Return JSON only.`,
  user: `Detect relationships between entities in the following text. For each:

- sourceEntityName/targetEntityName: the two entities involved
- relationshipType: affiliation/association/location/temporal/causal/documentary
- direction: directed/undirected
- strength: strong (explicitly stated)/weak (implied)/inferred (from context)
- label: human-readable description (e.g. "works for", "occurred at")
- confidence: 0-1
- startChar/endChar: character positions
- isInferred: true if the relationship is inferred, not explicit

Rules:
- Causal relationships MUST be explicitly stated in the source — never infer causation
- "Inferred" relationships must be clearly labeled as such
- Do not create relationships based on speculation or proximity alone
- Person-organization relationships require explicit source mention
- Confidence must reflect source quality, not just quantity

Text:
{{text}}`,
};

let relCounter = 0;

/**
 * Detects relationships between entities: person-org, person-person,
 * org-org, event-location, event-person, claim-source, entity-document.
 *
 * Resolves entity names against the entity_extraction stage output,
 * labels inferred relationships, and deduplicates repeated mentions
 * of the same relationship (merging source spans).
 * Causal relationships are only kept when explicitly stated in the source.
 */
export const relationshipDetectorStage = createStage({
  name: "relationship_detection",
  requires: ["entity_extraction", "timeline_extraction"],
  run: async (input, context, provider: AIProvider): Promise<AIOperationResult<EntityRelationship[]>> => {
    const handler = new StructuredOutputHandler();
    const prompt = { system: PROMPT.system, user: PROMPT.user.replace("{{text}}", input.body) };
    const result = await handler.extract(provider, prompt, relationshipSchema);

    if (result.data) {
      const entitiesResult = context.get("entity_extraction");
      const entities: ExtractedEntity[] = (entitiesResult?.data as ExtractedEntity[]) ?? [];

      const relationships: EntityRelationship[] = result.data.relationships.map((r) => {
        relCounter++;
        const sourceEntity = findEntity(r.sourceEntityName, entities);
        const targetEntity = findEntity(r.targetEntityName, entities);

        return {
          id: `relationship_${relCounter}`,
          sourceEntityId: sourceEntity?.id ?? r.sourceEntityName,
          targetEntityId: targetEntity?.id ?? r.targetEntityName,
          relationshipType: r.relationshipType,
          direction: r.direction,
          strength: r.strength as RelationshipStrength,
          label: r.label,
          confidence: Math.min(r.confidence, 1),
          sourceSpans: [{ sourceId: input.url, start: r.startChar, end: r.endChar, excerpt: input.body.slice(r.startChar, r.endChar) }],
          isInferred: r.isInferred || r.strength === "inferred",
        };
      });

      // Deduplicate same relationships from different source spans
      const deduped = deduplicateRelationships(relationships);

      return { ...result, data: deduped };
    }

    return emptyResult(result.modelUsed, result.warnings);
  },
});

function findEntity(name: string, entities: ExtractedEntity[]): ExtractedEntity | undefined {
  const lower = name.toLowerCase();
  return entities.find(
    (e) =>
      e.canonicalName.toLowerCase() === lower ||
      e.aliases.some((a) => a.toLowerCase() === lower),
  );
}

function deduplicateRelationships(rels: EntityRelationship[]): EntityRelationship[] {
  const seen = new Map<string, EntityRelationship>();

  for (const rel of rels) {
    const key = `${rel.sourceEntityId}|${rel.targetEntityId}|${rel.relationshipType}`;
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, rel);
      continue;
    }

    // Keep the higher-confidence mention but preserve spans from all mentions
    const combinedSpans = [...existing.sourceSpans, ...rel.sourceSpans];

    if (rel.confidence > existing.confidence) {
      rel.sourceSpans = combinedSpans;
      seen.set(key, rel);
    } else {
      existing.sourceSpans = combinedSpans;
    }
  }

  return Array.from(seen.values());
}
