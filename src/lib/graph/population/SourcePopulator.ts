// src/lib/graph/population/SourcePopulator.ts
//
// Ingests source records into the graph as source nodes.
// Idempotent: running twice with the same data creates no duplicates.

import type { GraphDB } from "../GraphDB";
import type { SourceRecord } from "../../../types/content";

export interface PopulatorStats {
  created: number;
  skipped: number;
  errors: string[];
}

/**
 * Populate the graph with source nodes from source registry records.
 */
export function populateSources(
  db: GraphDB,
  sources: SourceRecord[],
): PopulatorStats {
  const stats: PopulatorStats = { created: 0, skipped: 0, errors: [] };

  for (const source of sources) {
    const nodeId = `source:${source.id}`;

    // Idempotency check
    if (db.hasNode(nodeId)) {
      stats.skipped++;
      continue;
    }

    try {
      db.addNode({
        id: nodeId,
        type: "source",
        label: source.title,
        properties: {
          publisher: source.publisher,
          sourceType: source.sourceType,
          url: source.url,
          trustLevel: source.trustLevel,
          jurisdiction: source.jurisdiction,
          language: source.language,
          region: source.region,
          status: source.status,
          healthStatus: source.healthStatus,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      stats.created++;
    } catch (err) {
      stats.errors.push(
        `Failed to add source "${source.id}": ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return stats;
}
