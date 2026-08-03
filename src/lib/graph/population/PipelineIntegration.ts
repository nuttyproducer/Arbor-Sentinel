// src/lib/graph/population/PipelineIntegration.ts
//
// Integration with the AI pipeline: triggers graph population after AI processing
// completes. Orchestrates all populators and the relationship builder.
//
// Runs asynchronously — does not block the AI pipeline.

import type { GraphDB } from "../GraphDB";
import type { AIProcessedContent } from "../../ai/types";
import type { ExtractedEntity, ExtractedClaim, TimelineEvent, ExtractedLocation, EntityRelationship } from "../../ai/stages/types";
import { EntityResolver } from "../EntityResolver";
import { populateSources } from "./SourcePopulator";
import { populateDocuments } from "./DocumentPopulator";
import { populateEntities } from "./EntityPopulator";
import { populateClaims } from "./ClaimPopulator";
import { populateEvents } from "./EventPopulator";
import { populateLocations } from "./LocationPopulator";
import { buildRelationships, buildDocumentLinks, buildEventLinks } from "./RelationshipBuilder";
import type { SourceRecord } from "../../../types/content";

// ── Integration types ────────────────────────────────────────────────────────

export interface PipelineIntegrationConfig {
  /** The graph database to populate. */
  db: GraphDB;
  /** Entity resolver for deduplication. */
  resolver: EntityResolver;
  /** Source registry records for source node creation. */
  sources?: SourceRecord[];
}

export interface PipelineIntegrationResult {
  /** Total nodes created across all populators. */
  nodesCreated: number;
  /** Total edges created. */
  edgesCreated: number;
  /** Entities merged during resolution. */
  entitiesMerged: number;
  /** Nodes skipped (already existed). */
  nodesSkipped: number;
  /** Edges skipped (already existed). */
  edgesSkipped: number;
  /** Errors encountered. */
  errors: string[];
  /** Whether the integration completed successfully. */
  success: boolean;
}

// ── Pipeline integration ─────────────────────────────────────────────────────

/**
 * Populate the knowledge graph from AI pipeline output.
 *
 * This function coordinates all populators in the correct order:
 * 1. Source nodes (from source registry)
 * 2. Document nodes (from collected content)
 * 3. Entity nodes (from entity extraction)
 * 4. Claim nodes (from claim extraction)
 * 5. Event nodes (from timeline extraction)
 * 6. Location nodes (from geographic extraction)
 * 7. Document provenance edges (published_by, mentions, supports)
 * 8. Entity relationships (from relationship detection)
 * 9. Event links (involves)
 *
 * Each step is idempotent — running twice with the same data creates no duplicates.
 */
export function populateFromPipeline(
  config: PipelineIntegrationConfig,
  processedContent: AIProcessedContent,
): PipelineIntegrationResult {
  const { db, resolver, sources } = config;
  const result: PipelineIntegrationResult = {
    nodesCreated: 0,
    edgesCreated: 0,
    entitiesMerged: 0,
    nodesSkipped: 0,
    edgesSkipped: 0,
    errors: [],
    success: true,
  };

  try {
    // ── Step 1: Source nodes ──────────────────────────────────────────────
    if (sources && sources.length > 0) {
      const sourceStats = populateSources(db, sources);
      result.nodesCreated += sourceStats.created;
      result.nodesSkipped += sourceStats.skipped;
      result.errors.push(...sourceStats.errors);
    }

    // ── Step 2: Document node ─────────────────────────────────────────────
    const docId = processedContent.sourceId;
    const docStats = populateDocuments(db, [{
      id: docId,
      sourceId: docId, // simplified — in production this comes from the collector
      content: {
        url: docId,
        title: `Document: ${docId}`,
        body: "",
        tags: [],
        metadata: {},
      },
    }]);
    result.nodesCreated += docStats.created;
    result.nodesSkipped += docStats.skipped;
    result.errors.push(...docStats.errors);

    // ── Step 3: Entity nodes ──────────────────────────────────────────────
    const entities = extractArray<ExtractedEntity>(processedContent.entities);
    if (entities.length > 0) {
      const entityStats = populateEntities(db, {
        documentId: docId,
        entities,
      }, resolver);
      result.nodesCreated += entityStats.created;
      result.nodesSkipped += entityStats.skipped;
      result.entitiesMerged += entityStats.merged;
      result.errors.push(...entityStats.errors);
    }

    // ── Step 4: Claim nodes ───────────────────────────────────────────────
    const claims = extractArray<ExtractedClaim>(processedContent.claims);
    if (claims.length > 0) {
      const claimStats = populateClaims(db, { documentId: docId, claims });
      result.nodesCreated += claimStats.created;
      result.nodesSkipped += claimStats.skipped;
      result.errors.push(...claimStats.errors);
    }

    // ── Step 5: Event nodes ───────────────────────────────────────────────
    const events = extractArray<TimelineEvent>(processedContent.timeline);
    if (events.length > 0) {
      const eventStats = populateEvents(db, { documentId: docId, events });
      result.nodesCreated += eventStats.created;
      result.nodesSkipped += eventStats.skipped;
      result.errors.push(...eventStats.errors);
    }

    // ── Step 6: Location nodes ────────────────────────────────────────────
    const locations = extractArray<ExtractedLocation>(processedContent.locations);
    if (locations.length > 0) {
      const locStats = populateLocations(db, { documentId: docId, locations });
      result.nodesCreated += locStats.created;
      result.nodesSkipped += locStats.skipped;
      result.edgesCreated += locStats.edgesCreated;
      result.errors.push(...locStats.errors);
    }

    // ── Step 7: Document provenance edges ─────────────────────────────────
    const docLinkStats = buildDocumentLinks(db, {
      documentId: docId,
      sourceId: docId,
      mentionedEntityIds: entities.map((e) => e.id),
      claimIds: claims.map((c) => c.id),
      eventIds: events.map((e) => e.id),
    });
    result.edgesCreated += docLinkStats.created;
    result.edgesSkipped += docLinkStats.skipped;
    result.errors.push(...docLinkStats.errors);

    // ── Step 8: Entity relationships ──────────────────────────────────────
    const relationships = extractArray<EntityRelationship>(processedContent.relationships);
    if (relationships.length > 0) {
      const relStats = buildRelationships(db, { documentId: docId, relationships });
      result.edgesCreated += relStats.created;
      result.edgesSkipped += relStats.skipped;
      result.errors.push(...relStats.errors);
    }

    // ── Step 9: Event links (involves) ────────────────────────────────────
    if (events.length > 0) {
      const eventLinkStats = buildEventLinks(db, events.map((e) => e.id));
      result.edgesCreated += eventLinkStats.created;
      result.edgesSkipped += eventLinkStats.skipped;
      result.errors.push(...eventLinkStats.errors);
    }
  } catch (err) {
    result.success = false;
    result.errors.push(
      `Pipeline integration failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  return result;
}

/**
 * Schedule graph population to run asynchronously after AI processing.
 * Returns immediately — population runs in the background.
 */
export function scheduleGraphPopulation(
  config: PipelineIntegrationConfig,
  processedContent: AIProcessedContent,
): Promise<PipelineIntegrationResult> {
  // Use a microtask to run asynchronously (non-blocking)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(populateFromPipeline(config, processedContent));
    }, 0);
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Safely extract an array from an AI operation result.
 * Returns empty array on null data or failed extraction.
 */
function extractArray<T>(result: { data: unknown } | null | undefined): T[] {
  if (!result || !result.data || !Array.isArray(result.data)) {
    return [];
  }
  return result.data as T[];
}
