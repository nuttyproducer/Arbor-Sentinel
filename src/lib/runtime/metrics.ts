// src/lib/runtime/metrics.ts
// Runtime metrics — persists run results, updates feed health, tracks item outcomes.

import { supabase } from "../db/client";
import type { CollectResult } from "../collectors/types";
import type { ItemOutcome } from "./types";

// ── Run recording ────────────────────────────────────────────────────────────

/**
 * Persist a collector run to the `collector_runs` table and update the
 * corresponding feed's health fields. Best-effort — errors are logged
 * but never thrown, so collection is never disrupted.
 */
export async function recordRun(
  feedId: string,
  sourceType: string,
  result: CollectResult,
): Promise<void> {
  // 1. Insert collector_runs row
  const { error: runError } = await supabase.from("collector_runs").insert({
    source_id: feedId,
    collector_type: sourceType,
    status: result.success ? "completed" : "failed",
    items_fetched: result.itemsFetched,
    items_validated: result.itemsValidated,
    items_stored: result.itemsStored,
    stage_durations: result.stageDurations as unknown as Record<string, number>,
    errors: result.success ? [] : [{ message: "Collection failed", timestamp: result.completedAt }],
    started_at: result.startedAt,
    completed_at: result.completedAt,
  });

  if (runError) {
    console.error(`[RuntimeMetrics] Failed to persist run for feed ${feedId}:`, runError);
  }

  // 2. Update feed health
  const healthStatus = result.success ? "active" : "degraded";
  const { error: feedError } = await supabase
    .from("feeds")
    .update({
      health_status: healthStatus,
      last_fetched_at: result.startedAt,
      last_success_at: result.success ? result.completedAt : undefined,
      failure_count: result.success ? 0 : undefined, // reset or handled separately
      updated_at: new Date().toISOString(),
    })
    .eq("id", feedId);

  if (feedError) {
    console.error(`[RuntimeMetrics] Failed to update feed health for ${feedId}:`, feedError);
  }
}

/**
 * Increment the failure count for a feed after an error.
 */
export async function recordFeedError(feedId: string, errorMessage: string): Promise<void> {
  const { error } = await supabase
    .from("feeds")
    .update({
      last_error: errorMessage,
      health_status: "degraded",
      last_fetched_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", feedId);

  if (error) {
    console.error(`[RuntimeMetrics] Failed to record feed error for ${feedId}:`, error);
  }

  // Increment failure_count — fetch current value then update
  const { data } = await supabase
    .from("feeds")
    .select("failure_count")
    .eq("id", feedId)
    .single();

  const currentCount = (data as { failure_count: number } | null)?.failure_count ?? 0;
  await supabase
    .from("feeds")
    .update({ failure_count: currentCount + 1 })
    .eq("id", feedId);
}

// ── Item outcome tracking ────────────────────────────────────────────────────

/**
 * Record the outcome of a single collected item.
 * Useful for dashboards that want per-item acceptance/rejection/publish rates.
 */
export async function recordItemOutcome(
  feedId: string,
  fingerprint: string,
  outcome: ItemOutcome,
): Promise<void> {
  // Item outcome tracking — placeholder until runtime_metrics table exists.
  // Currently just logs for debugging; full persistence added in Phase 3b.
  void feedId;
  void fingerprint;
  void outcome;
}

// ── Aggregate stats ──────────────────────────────────────────────────────────

/**
 * Get aggregate runtime statistics from the database.
 */
export async function getRuntimeStats(): Promise<{
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  totalItemsStored: number;
}> {
  const { count: totalRuns } = await supabase
    .from("collector_runs")
    .select("*", { count: "exact", head: true });

  const { count: successfulRuns } = await supabase
    .from("collector_runs")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");

  const { count: failedRuns } = await supabase
    .from("collector_runs")
    .select("*", { count: "exact", head: true })
    .eq("status", "failed");

  const { data: sumData } = await supabase
    .from("collector_runs")
    .select("items_stored");

  const totalItemsStored = (sumData as Array<{ items_stored: number }> | null)?.reduce(
    (s, r) => s + (r.items_stored ?? 0), 0,
  ) ?? 0;

  return {
    totalRuns: totalRuns ?? 0,
    successfulRuns: successfulRuns ?? 0,
    failedRuns: failedRuns ?? 0,
    totalItemsStored,
  };
}
