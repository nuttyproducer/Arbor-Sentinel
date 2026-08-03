// src/lib/graph/population/DocumentPopulator.ts
//
// Ingests collected documents into the graph as document nodes.
// Idempotent: running twice with the same data creates no duplicates.

import type { GraphDB } from "../GraphDB";
import type { NormalizedContent } from "../../collectors/types";

export interface DocumentInput {
  /** Unique identifier for this document. */
  id: string;
  /** Source that published this document. */
  sourceId: string;
  /** The normalized content from the collector. */
  content: NormalizedContent;
  /** Verification level 0–5. */
  sourceQuality?: number;
  /** Document language code. */
  language?: string;
}

/**
 * Populate the graph with document nodes from collected content.
 */
export function populateDocuments(
  db: GraphDB,
  documents: DocumentInput[],
): { created: number; skipped: number; errors: string[] } {
  const stats = { created: 0, skipped: 0, errors: [] as string[] };

  for (const doc of documents) {
    const nodeId = `document:${doc.id}`;

    // Idempotency check
    if (db.hasNode(nodeId)) {
      stats.skipped++;
      continue;
    }

    try {
      db.addNode({
        id: nodeId,
        type: "document",
        label: doc.content.title || doc.content.url || doc.id,
        properties: {
          title: doc.content.title || "Untitled",
          url: doc.content.url,
          publicationDate: doc.content.publishedAt,
          contentType: (doc.content.metadata?.documentType as string) || "article",
          language: doc.language || doc.content.language,
          summary: doc.content.body?.slice(0, 500) || doc.content.title,
          authors: doc.content.author ? [doc.content.author] : [],
          sourceQuality: doc.sourceQuality,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      stats.created++;
    } catch (err) {
      stats.errors.push(
        `Failed to add document "${doc.id}": ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return stats;
}
