// src/lib/graph/population/EntityPopulator.ts
//
// Ingests entity extraction output as entity nodes with property mapping.
// Deduplicates during population using EntityResolver.
// Idempotent: running twice with the same data creates no duplicates.

import type { GraphDB } from "../GraphDB";
import type { ExtractedEntity } from "../../ai/stages/types";
import { EntityResolver } from "../EntityResolver";

export interface EntityPopulationInput {
  /** Document ID that these entities were extracted from. */
  documentId: string;
  /** Source ID for provenance tracking. */
  sourceId?: string;
  /** Extracted entities from the AI pipeline. */
  entities: ExtractedEntity[];
}

/**
 * Populate the graph with entity nodes from AI entity extraction output.
 */
export function populateEntities(
  db: GraphDB,
  input: EntityPopulationInput,
  resolver?: EntityResolver,
): { created: number; merged: number; skipped: number; errors: string[] } {
  const stats = { created: 0, merged: 0, skipped: 0, errors: [] as string[] };

  // Collect entities for batch resolution
  const candidates: Array<{ id: string; type: "entity"; name: string; sourceIds: string[] }> = [];

  for (const entity of input.entities) {
    const nodeId = `entity:${entity.id}`;
    const canonicalName = entity.canonicalName || entity.id;

    // Idempotency check
    if (db.hasNode(nodeId)) {
      stats.skipped++;
      continue;
    }

    try {
      db.addNode({
        id: nodeId,
        type: "entity",
        label: canonicalName,
        properties: {
          canonicalName,
          entityType: entity.entityType,
          aliases: entity.aliases ?? [],
          role: entity.role,
          affiliation: entity.affiliation,
          organizationType: entity.organizationType,
          acronym: entity.acronym,
          locationType: entity.locationType,
          parentLocation: entity.parentLocation,
          dateValue: entity.dateValue,
          caseNumber: entity.caseNumber,
          court: entity.court,
          confidence: entity.confidence,
          linkedEntityId: entity.linkedEntityId,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      stats.created++;
    } catch (err) {
      stats.errors.push(
        `Failed to add entity "${entity.id}": ${err instanceof Error ? err.message : String(err)}`,
      );
      continue;
    }

    // Queue for entity resolution
    candidates.push({
      id: nodeId,
      type: "entity",
      name: canonicalName,
      sourceIds: input.sourceId ? [input.sourceId] : [],
    });
  }

  // Run batch entity resolution
  if (resolver && candidates.length > 0) {
    const mergeRecords = resolver.resolveBatch(candidates);
    stats.merged = mergeRecords.length;
  }

  return stats;
}

/**
 * Populate entities from multiple documents at once.
 */
export function populateEntitiesBatch(
  db: GraphDB,
  inputs: EntityPopulationInput[],
  resolver?: EntityResolver,
): { created: number; merged: number; skipped: number; errors: string[] } {
  const totals = { created: 0, merged: 0, skipped: 0, errors: [] as string[] };

  for (const input of inputs) {
    const stats = populateEntities(db, input, resolver);
    totals.created += stats.created;
    totals.merged += stats.merged;
    totals.skipped += stats.skipped;
    totals.errors.push(...stats.errors);
  }

  return totals;
}
