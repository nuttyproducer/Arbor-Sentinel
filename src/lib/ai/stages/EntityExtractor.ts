// src/lib/ai/stages/EntityExtractor.ts

import { z } from "zod";
import { createStage } from "../AIPipeline";
import type { AIProvider, AIOperationResult } from "../types";
import { emptyResult } from "../types";
import { StructuredOutputHandler } from "../StructuredOutputHandler";
import type { ExtractedEntity } from "./types";

const entitySchema = z.object({
  entities: z.array(z.object({
    canonicalName: z.string(),
    aliases: z.array(z.string()),
    entityType: z.enum(["person", "organization", "location", "date", "event", "legal_case"]),
    confidence: z.number().min(0).max(1),
    startChar: z.number(),
    endChar: z.number(),
    role: z.string().optional(),
    affiliation: z.string().optional(),
    organizationType: z.string().optional(),
    acronym: z.string().optional(),
    parentLocation: z.string().optional(),
    locationType: z.string().optional(),
    dateValue: z.string().optional(),
    caseNumber: z.string().optional(),
    court: z.string().optional(),
  })),
});

const ENTITY_EXTRACTION_PROMPT = {
  system: `You are an entity extraction expert. Extract all named entities from the text. Do NOT extract private individuals who are not public figures. Return JSON only.`,
  user: `Extract all named entities from the following text. For each entity provide:

- canonicalName: official full name
- aliases: other names or variations used
- entityType: person/organization/location/date/event/legal_case
- confidence: 0-1
- startChar/endChar: exact character positions in the text
- For persons: role, affiliation
- For organizations: organizationType, acronym
- For locations: parentLocation, locationType
- For dates: dateValue (ISO format)
- For legal_cases: caseNumber, court

Rules:
- Do NOT extract private individuals who are not public figures
- Canonical names must match official names where possible
- Do not fabricate biographical details not in the source
- Role/affiliation must be explicit from source, not inferred

Text:
{{text}}`,
};

let entityCounter = 0;

/**
 * Extracts entities: persons, organizations, locations, dates, events, legal cases.
 * Links entity variants (ICJ ↔ International Court of Justice).
 * Does NOT extract private individuals.
 */
export const entityExtractorStage = createStage({
  name: "entity_extraction",
  requires: [],
  run: async (
    input,
    context,
    provider: AIProvider,
  ): Promise<AIOperationResult<ExtractedEntity[]>> => {
    const handler = new StructuredOutputHandler();

    const prompt = {
      system: ENTITY_EXTRACTION_PROMPT.system,
      user: ENTITY_EXTRACTION_PROMPT.user.replace("{{text}}", input.body),
    };

    const result = await handler.extract(provider, prompt, entitySchema);

    if (result.data) {
      const knownEntities = context.knownEntities ?? [];

      const entities: ExtractedEntity[] = result.data.entities.map((e) => {
        entityCounter++;
        const entityId = `entity_${entityCounter}`;

        // Try to link to known entity
        const linked = findKnownEntity(e.canonicalName, e.aliases, knownEntities);

        return {
          id: entityId,
          canonicalName: e.canonicalName,
          aliases: e.aliases,
          entityType: e.entityType,
          confidence: Math.min(e.confidence, 1),
          sourceSpan: {
            sourceId: input.url,
            start: e.startChar,
            end: e.endChar,
            excerpt: input.body.slice(e.startChar, e.endChar),
          },
          role: e.role,
          affiliation: e.affiliation,
          organizationType: e.organizationType,
          acronym: e.acronym,
          parentLocation: e.parentLocation,
          locationType: e.locationType,
          dateValue: e.dateValue,
          caseNumber: e.caseNumber,
          court: e.court,
          linked: linked !== undefined,
          linkedEntityId: linked?.id,
        };
      });

      // Deduplicate: canonical name + entityType match = same entity
      const deduped = deduplicateEntities(entities);

      return {
        ...result,
        data: deduped,
      };
    }

    return emptyResult(result.modelUsed, result.warnings);
  },
});

function findKnownEntity(
  canonicalName: string,
  aliases: string[],
  knownEntities: Array<{ id: string; canonicalName: string; aliases: string[]; entityType: string }>,
): { id: string } | undefined {
  const allNames = [canonicalName, ...aliases].map((n) => n.toLowerCase());

  for (const known of knownEntities) {
    const knownNames = [known.canonicalName, ...known.aliases].map((n) => n.toLowerCase());
    if (knownNames.some((kn) => allNames.includes(kn))) {
      return { id: known.id };
    }
  }

  return undefined;
}

function deduplicateEntities(entities: ExtractedEntity[]): ExtractedEntity[] {
  const seen = new Map<string, ExtractedEntity>();

  for (const entity of entities) {
    const key = `${entity.canonicalName.toLowerCase()}|${entity.entityType}`;
    const existing = seen.get(key);

    if (!existing || entity.confidence > existing.confidence) {
      // Merge aliases
      if (existing) {
        entity.aliases = [...new Set([...entity.aliases, ...existing.aliases])];
      }
      seen.set(key, entity);
    }
  }

  return Array.from(seen.values());
}
