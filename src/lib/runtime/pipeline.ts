// src/lib/runtime/pipeline.ts
// Downstream processing pipeline: collected items → AI → review → publish → graph → search.
// Each stage is independently error-handled — one failure doesn't abort the chain.

import type { CollectedItem } from "../collectors/types";
import type { PipelineEvent, PipelineStage } from "./types";

// ── Pipeline runner ──────────────────────────────────────────────────────────

export interface PipelineOptions {
  enableAI: boolean;
  enableAutoPublish: boolean;
  enableGraph: boolean;
  enableSearch: boolean;
}

/**
 * Process a single collected item through the downstream pipeline.
 *
 * Stages (sequential, each gated by options):
 *   collected → ai_processed → review_queued → published → graph_populated → search_indexed
 *
 * Each stage is best-effort — failures are recorded as PipelineEvents
 * but never thrown.
 */
export async function processItem(
  item: CollectedItem,
  sourceId: string,
  options: PipelineOptions,
): Promise<PipelineEvent[]> {
  const events: PipelineEvent[] = [];
  const now = () => new Date().toISOString();

  // Stage 1: Collected (always recorded)
  events.push({
    stage: "collected" as PipelineStage,
    itemId: item.fingerprint,
    sourceId,
    timestamp: now(),
    success: true,
  });

  // Stage 2: AI pipeline (gated — deferred to full pipeline integration)
  if (options.enableAI && item.normalized) {
    // The AI pipeline requires full AIContent (source + sourceQuality +
    // collectionTimestamp). Deferred to a later phase that constructs
    // AIContent from the collected item context.
    events.push({
      stage: "ai_processed",
      itemId: item.fingerprint,
      sourceId,
      timestamp: now(),
      success: false,
      error: "AI pipeline integration deferred — enableAIPipeline requires full pipeline context",
    });
  }

  // Stage 3: Review queue (always enqueue as draft)
  try {
    const { supabase } = await import("../db/client");
    await supabase.from("review_queue_items").insert({
      source_content_type: "evidence",
      source_content_id: item.fingerprint,
      source_content_slug: item.normalized?.title?.slice(0, 100) ?? item.fingerprint,
      review_type: "editorial",
      priority: "medium",
      priority_score: 50,
      state: "new",
      created_at: now(),
      updated_at: now(),
    });
    events.push({
      stage: "review_queued",
      itemId: item.fingerprint,
      sourceId,
      timestamp: now(),
      success: true,
    });
  } catch (err) {
    events.push({
      stage: "review_queued",
      itemId: item.fingerprint,
      sourceId,
      timestamp: now(),
      success: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Stage 4-6: Publish, Graph, Search (gated — deferred to future phases)
  if (options.enableAutoPublish) {
    events.push({
      stage: "published",
      itemId: item.fingerprint,
      sourceId,
      timestamp: now(),
      success: false,
      error: "Auto-publish is handled by SupabaseStore.credibility_tier check on ingest",
    });
  }

  void options.enableGraph;
  void options.enableSearch;

  return events;
}
