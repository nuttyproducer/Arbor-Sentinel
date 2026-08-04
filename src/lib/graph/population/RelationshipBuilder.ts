// src/lib/graph/population/RelationshipBuilder.ts
//
// Builds edges between nodes based on relationship detection output,
// entity links, and document provenance.
// Idempotent: checks for existing edges before creating new ones.

import type { GraphDB } from "../GraphDB";
import type { EntityRelationship } from "../../ai/stages/types";
import type { EdgeType } from "../types";

// ── Relationship type mapping ────────────────────────────────────────────────

/**
 * Maps AI pipeline relationship types to graph edge types.
 */
function mapRelationshipToEdgeType(
  rel: EntityRelationship,
): EdgeType | null {
  switch (rel.relationshipType) {
    case "affiliation":
    case "association":
      return "related_to";
    case "location":
      return "located_in";
    case "temporal":
      return "related_to"; // temporal relationships become generic related_to
    case "causal":
      return "related_to"; // causal relationships become generic related_to
    case "documentary":
      return "supports"; // documentary evidence supports a claim
    default:
      return "related_to";
  }
}

// ── Relationship builder ─────────────────────────────────────────────────────

export interface RelationshipBuildInput {
  /** Document ID these relationships were detected from. */
  documentId: string;
  /** Relationships from the AI pipeline. */
  relationships: EntityRelationship[];
}

/**
 * Build edges from AI relationship detection output.
 *
 * The graph edge direction follows ontological convention:
 * relationships with direction "directed" create edges in the
 * sourceEntityId → targetEntityId direction.
 */
export function buildRelationships(
  db: GraphDB,
  input: RelationshipBuildInput,
): { created: number; skipped: number; errors: string[] } {
  const stats = { created: 0, skipped: 0, errors: [] as string[] };

  for (const rel of input.relationships) {
    const edgeType = mapRelationshipToEdgeType(rel);
    if (!edgeType) {
      stats.skipped++;
      continue;
    }

    const sourceNodeId = `entity:${rel.sourceEntityId}`;
    const targetNodeId = `entity:${rel.targetEntityId}`;
    const edgeId = `edge:${edgeType}:${rel.id}`;

    // Idempotency check
    if (db.hasEdge(edgeId)) {
      stats.skipped++;
      continue;
    }

    // Verify both endpoints exist
    if (!db.hasNode(sourceNodeId)) {
      stats.errors.push(`Source node "${sourceNodeId}" not found for relationship "${rel.id}".`);
      stats.skipped++;
      continue;
    }
    if (!db.hasNode(targetNodeId)) {
      stats.errors.push(`Target node "${targetNodeId}" not found for relationship "${rel.id}".`);
      stats.skipped++;
      continue;
    }

    try {
      db.addEdge({
        id: edgeId,
        type: edgeType,
        sourceId: sourceNodeId,
        targetId: targetNodeId,
        label: rel.label || edgeType,
        weight: rel.confidence,
        properties: {
          confidence: rel.confidence,
          relationshipType: rel.relationshipType,
          strength: rel.strength,
          isInferred: rel.isInferred,
          sourceSpans: rel.sourceSpans,
        },
        createdAt: new Date().toISOString(),
      });
      stats.created++;
    } catch (err) {
      stats.errors.push(
        `Failed to add relationship "${rel.id}": ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return stats;
}

// ── Document provenance edges ────────────────────────────────────────────────

export interface DocumentLinksInput {
  /** Document ID in the graph. */
  documentId: string;
  /** Source ID to link the document to. */
  sourceId?: string;
  /** Entity IDs mentioned in the document (from entity extraction). */
  mentionedEntityIds?: string[];
  /** Claim IDs extracted from the document. */
  claimIds?: string[];
  /** Event IDs extracted from the document. */
  eventIds?: string[];
  /** Location IDs extracted from the document. */
  locationIds?: string[];
}

/**
 * Build document provenance edges: published_by, mentions, supports.
 */
export function buildDocumentLinks(
  db: GraphDB,
  input: DocumentLinksInput,
): { created: number; skipped: number; errors: string[] } {
  const stats = { created: 0, skipped: 0, errors: [] as string[] };
  const docNodeId = `document:${input.documentId}`;

  if (!db.hasNode(docNodeId)) {
    stats.errors.push(`Document node "${docNodeId}" not found.`);
    return stats;
  }

  let edgeCounter = 0;

  // published_by: document → source
  if (input.sourceId) {
    const sourceNodeId = `source:${input.sourceId}`;
    const edgeId = `edge:published_by:${input.documentId}`;

    if (!db.hasEdge(edgeId) && db.hasNode(sourceNodeId)) {
      try {
        db.addEdge({
          id: edgeId,
          type: "published_by",
          sourceId: docNodeId,
          targetId: sourceNodeId,
          label: "Published by",
          properties: {},
          createdAt: new Date().toISOString(),
        });
        stats.created++;
        edgeCounter++;
      } catch (err) {
        stats.errors.push(`Failed to add published_by for "${input.documentId}": ${err}`);
      }
    } else if (db.hasEdge(edgeId)) {
      stats.skipped++;
    }
  }

  // mentions: document → entity
  const mentionedIds = input.mentionedEntityIds ?? [];
  for (const entityId of mentionedIds) {
    const targetNodeId = entityId.startsWith("entity:") ? entityId : `entity:${entityId}`;
    const edgeId = `edge:mentions:${input.documentId}:${entityId}`;

    if (!db.hasEdge(edgeId) && db.hasNode(targetNodeId)) {
      try {
        db.addEdge({
          id: edgeId,
          type: "mentions",
          sourceId: docNodeId,
          targetId: targetNodeId,
          label: "Mentions",
          properties: {},
          createdAt: new Date().toISOString(),
        });
        stats.created++;
        edgeCounter++;
      } catch (err) {
        stats.errors.push(`Failed to add mentions edge "${edgeId}": ${err}`);
      }
    } else if (db.hasEdge(edgeId)) {
      stats.skipped++;
    }
  }

  // supports: document → claim
  const claimIds = input.claimIds ?? [];
  for (const claimId of claimIds) {
    const targetNodeId = claimId.startsWith("claim:") ? claimId : `claim:${claimId}`;
    const edgeId = `edge:supports:${input.documentId}:${claimId}`;

    if (!db.hasEdge(edgeId) && db.hasNode(targetNodeId)) {
      try {
        db.addEdge({
          id: edgeId,
          type: "supports",
          sourceId: docNodeId,
          targetId: targetNodeId,
          label: "Supports",
          properties: {},
          createdAt: new Date().toISOString(),
        });
        stats.created++;
        edgeCounter++;
      } catch (err) {
        stats.errors.push(`Failed to add supports edge "${edgeId}": ${err}`);
      }
    } else if (db.hasEdge(edgeId)) {
      stats.skipped++;
    }
  }

  // involves: event → entity (for events mentioned in this document)
  // This is handled separately since events have their own entity links

  return stats;
}

/**
 * Build event-edges for events: occurs_at, involves.
 */
export function buildEventLinks(
  db: GraphDB,
  eventIds: string[],
): { created: number; skipped: number; errors: string[] } {
  const stats = { created: 0, skipped: 0, errors: [] as string[] };

  for (const eventId of eventIds) {
    const eventNodeId = eventId.startsWith("event:") ? eventId : `event:${eventId}`;
    const eventNode = db.getNode(eventNodeId);

    if (!eventNode) {
      stats.errors.push(`Event node "${eventNodeId}" not found.`);
      continue;
    }

    // involves: event → entity (from linkedEntityIds)
    const linkedEntityIds = (eventNode.properties.linkedEntityIds as string[]) ?? [];
    for (const entityId of linkedEntityIds) {
      const targetNodeId = entityId.startsWith("entity:") ? entityId : `entity:${entityId}`;
      const edgeId = `edge:involves:${eventId}:${entityId}`;

      if (!db.hasEdge(edgeId) && db.hasNode(targetNodeId)) {
        try {
          db.addEdge({
            id: edgeId,
            type: "involves",
            sourceId: eventNodeId,
            targetId: targetNodeId,
            label: "Involves",
            properties: {},
            createdAt: new Date().toISOString(),
          });
          stats.created++;
        } catch {
          stats.errors.push(`Failed to add involves edge "${edgeId}".`);
        }
      } else if (db.hasEdge(edgeId)) {
        stats.skipped++;
      }
    }
  }

  return stats;
}

/**
 * Build edges between existing nodes from multiple relationship batches.
 */
export function buildRelationshipsBatch(
  db: GraphDB,
  inputs: RelationshipBuildInput[],
): { created: number; skipped: number; errors: string[] } {
  const totals = { created: 0, skipped: 0, errors: [] as string[] };

  for (const input of inputs) {
    const stats = buildRelationships(db, input);
    totals.created += stats.created;
    totals.skipped += stats.skipped;
    totals.errors.push(...stats.errors);
  }

  return totals;
}
