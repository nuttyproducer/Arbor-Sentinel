// src/lib/graph/population/ClaimPopulator.ts
//
// Ingests claim extraction output as claim nodes with type and properties.
// Idempotent: running twice with the same data creates no duplicates.

import type { GraphDB } from "../GraphDB";
import type { ExtractedClaim } from "../../ai/stages/types";

export interface ClaimPopulationInput {
  /** Document ID that these claims were extracted from. */
  documentId: string;
  /** Source ID for provenance tracking. */
  sourceId?: string;
  /** Extracted claims from the AI pipeline. */
  claims: ExtractedClaim[];
}

/**
 * Populate the graph with claim nodes from AI claim extraction output.
 */
export function populateClaims(
  db: GraphDB,
  input: ClaimPopulationInput,
): { created: number; skipped: number; errors: string[] } {
  const stats = { created: 0, skipped: 0, errors: [] as string[] };

  for (const claim of input.claims) {
    const nodeId = `claim:${claim.id}`;

    // Idempotency check
    if (db.hasNode(nodeId)) {
      stats.skipped++;
      continue;
    }

    try {
      db.addNode({
        id: nodeId,
        type: "claim",
        label: claim.claimText.slice(0, 120),
        properties: {
          claimText: claim.claimText,
          claimType: claim.claimType,
          verificationStatus: claim.verificationStatus,
          confidence: claim.confidence,
          isNested: claim.isNested,
          parentClaimId: claim.parentClaimId,
          fromOpinionContent: claim.fromOpinionContent,
          linkedEntityIds: claim.linkedEntityIds,
          sourceId: input.sourceId,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      stats.created++;
    } catch (err) {
      stats.errors.push(
        `Failed to add claim "${claim.id}": ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return stats;
}

/**
 * Populate claims from multiple documents at once.
 */
export function populateClaimsBatch(
  db: GraphDB,
  inputs: ClaimPopulationInput[],
): { created: number; skipped: number; errors: string[] } {
  const totals = { created: 0, skipped: 0, errors: [] as string[] };

  for (const input of inputs) {
    const stats = populateClaims(db, input);
    totals.created += stats.created;
    totals.skipped += stats.skipped;
    totals.errors.push(...stats.errors);
  }

  return totals;
}
