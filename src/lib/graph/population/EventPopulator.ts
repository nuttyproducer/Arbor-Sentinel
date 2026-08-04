// src/lib/graph/population/EventPopulator.ts
//
// Ingests timeline/event extraction output as event nodes with temporal properties.
// Idempotent: running twice with the same data creates no duplicates.

import type { GraphDB } from "../GraphDB";
import type { TimelineEvent } from "../../ai/stages/types";

export interface EventPopulationInput {
  /** Document ID that these events were extracted from. */
  documentId: string;
  /** Source ID for provenance tracking. */
  sourceId?: string;
  /** Extracted timeline events from the AI pipeline. */
  events: TimelineEvent[];
}

/**
 * Populate the graph with event nodes from AI timeline extraction output.
 */
export function populateEvents(
  db: GraphDB,
  input: EventPopulationInput,
): { created: number; skipped: number; errors: string[] } {
  const stats = { created: 0, skipped: 0, errors: [] as string[] };

  for (const event of input.events) {
    const nodeId = `event:${event.id}`;

    // Idempotency check
    if (db.hasNode(nodeId)) {
      stats.skipped++;
      continue;
    }

    try {
      db.addNode({
        id: nodeId,
        type: "event",
        label: event.description.slice(0, 120),
        properties: {
          description: event.description,
          date: event.date,
          datePrecision: event.datePrecision,
          endDate: event.endDate,
          isApproximate: event.isApproximate,
          isUndated: event.isUndated,
          originalDateText: event.originalDateText,
          confidence: event.confidence,
          linkedEntityIds: event.linkedEntityIds,
          linkedClaimIds: event.linkedClaimIds,
          sourceId: input.sourceId,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      stats.created++;
    } catch (err) {
      stats.errors.push(
        `Failed to add event "${event.id}": ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return stats;
}

/**
 * Populate events from multiple documents at once.
 */
export function populateEventsBatch(
  db: GraphDB,
  inputs: EventPopulationInput[],
): { created: number; skipped: number; errors: string[] } {
  const totals = { created: 0, skipped: 0, errors: [] as string[] };

  for (const input of inputs) {
    const stats = populateEvents(db, input);
    totals.created += stats.created;
    totals.skipped += stats.skipped;
    totals.errors.push(...stats.errors);
  }

  return totals;
}
