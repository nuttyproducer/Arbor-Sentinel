// src/lib/graph/population/LocationPopulator.ts
//
// Ingests geographic extraction output as location nodes with parent-child hierarchy.
// Idempotent: running twice with the same data creates no duplicates.

import type { GraphDB } from "../GraphDB";
import type { ExtractedLocation } from "../../ai/stages/types";

export interface LocationPopulationInput {
  /** Document ID that these locations were extracted from. */
  documentId: string;
  /** Source ID for provenance tracking. */
  sourceId?: string;
  /** Extracted locations from the AI pipeline. */
  locations: ExtractedLocation[];
}

/**
 * Populate the graph with location nodes from AI geographic extraction output.
 */
export function populateLocations(
  db: GraphDB,
  input: LocationPopulationInput,
): { created: number; skipped: number; edgesCreated: number; errors: string[] } {
  const stats = { created: 0, skipped: 0, edgesCreated: 0, errors: [] as string[] };

  for (const location of input.locations) {
    const nodeId = `location:${location.id}`;

    // Idempotency check
    if (db.hasNode(nodeId)) {
      stats.skipped++;
      continue;
    }

    try {
      db.addNode({
        id: nodeId,
        type: "location",
        label: location.name,
        properties: {
          name: location.name,
          locationType: location.locationType,
          parentLocation: location.parentLocation,
          sourcePrecision: location.sourcePrecision,
          displayPrecision: location.displayPrecision,
          coordinates: location.coordinates,
          confidence: location.confidence,
          sourceId: input.sourceId,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      stats.created++;
    } catch (err) {
      stats.errors.push(
        `Failed to add location "${location.id}": ${err instanceof Error ? err.message : String(err)}`,
      );
      continue;
    }

    // Create parent-child hierarchy edge (located_in or part_of)
    if (location.parentLocation) {
      // Try to find a matching existing location node
      const existingLocations = db.findNodes({
        types: ["location", "country"],
        propertyFilters: [{ key: "name", value: location.parentLocation }],
      });

      if (existingLocations.length > 0) {
        const parentId = existingLocations[0].id;
        const edgeId = `edge:located_in:${nodeId}:${parentId}`;

        if (!db.hasEdge(edgeId)) {
          try {
            db.addEdge({
              id: edgeId,
              type: "located_in",
              sourceId: nodeId,
              targetId: parentId,
              label: `Located in ${location.parentLocation}`,
              properties: { confidence: location.confidence },
              createdAt: new Date().toISOString(),
            });
            stats.edgesCreated++;
          } catch {
            // Skip invalid edge — parent may be wrong type
          }
        }
      }
    }
  }

  return stats;
}

/**
 * Populate locations from multiple documents at once.
 */
export function populateLocationsBatch(
  db: GraphDB,
  inputs: LocationPopulationInput[],
): { created: number; skipped: number; edgesCreated: number; errors: string[] } {
  const totals = { created: 0, skipped: 0, edgesCreated: 0, errors: [] as string[] };

  for (const input of inputs) {
    const stats = populateLocations(db, input);
    totals.created += stats.created;
    totals.skipped += stats.skipped;
    totals.edgesCreated += stats.edgesCreated;
    totals.errors.push(...stats.errors);
  }

  return totals;
}
