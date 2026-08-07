// src/lib/admin/availabilityMetrics.ts
// Rolling availability queries for the Feed Health dashboard.
// Computes uptime percentages from collector_runs data over 24h/7d/30d windows.

import { supabase } from "../db/client";

// ── Availability ──────────────────────────────────────────────────────────────

export interface AvailabilityWindow {
  windowHours: number;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  uptimePercent: number;
  itemsFetched: number;
  itemsStored: number;
  avgResponseTimeMs: number;
}

/**
 * Compute availability for a specific feed over a rolling time window.
 * Queries the collector_runs table which now correctly stores source_id
 * (the FK to sources.id) after the Phase 1 FK fix.
 */
export async function getAvailability(
  sourceId: string,
  windowHours: number,
): Promise<AvailabilityWindow> {
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();

  const { data: runs, error } = await supabase
    .from("collector_runs")
    .select("status, items_fetched, items_stored, stage_durations, started_at")
    .eq("source_id", sourceId)
    .gte("started_at", since)
    .order("started_at", { ascending: false });

  if (error || !runs) {
    return {
      windowHours,
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      uptimePercent: 100, // no data = assume healthy
      itemsFetched: 0,
      itemsStored: 0,
      avgResponseTimeMs: 0,
    };
  }

  const typed = runs as Array<{
    status: string;
    items_fetched: number;
    items_stored: number;
    stage_durations: Record<string, number> | null;
  }>;

  const total = typed.length;
  const successful = typed.filter((r) => r.status === "completed").length;
  const failed = total - successful;
  const uptimePercent = total > 0 ? Math.round((successful / total) * 10000) / 100 : 100;

  const itemsFetched = typed.reduce((s, r) => s + (r.items_fetched ?? 0), 0);
  const itemsStored = typed.reduce((s, r) => s + (r.items_stored ?? 0), 0);

  const durations = typed
    .map((r) => r.stage_durations?.fetch ?? 0)
    .filter((d) => d > 0);
  const avgResponseTimeMs = durations.length > 0
    ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
    : 0;

  return {
    windowHours,
    totalRuns: total,
    successfulRuns: successful,
    failedRuns: failed,
    uptimePercent,
    itemsFetched,
    itemsStored,
    avgResponseTimeMs,
  };
}

export function getUptimePercent24h(sourceId: string): Promise<AvailabilityWindow> {
  return getAvailability(sourceId, 24);
}

export function getUptimePercent7d(sourceId: string): Promise<AvailabilityWindow> {
  return getAvailability(sourceId, 7 * 24);
}

export function getUptimePercent30d(sourceId: string): Promise<AvailabilityWindow> {
  return getAvailability(sourceId, 30 * 24);
}

// ── All-feeds summary ─────────────────────────────────────────────────────────

export interface SystemAvailability {
  feedsTotal: number;
  feedsHealthy: number;
  feedsDegraded: number;
  feedsFailed: number;
  overallUptime24h: number;
  overallUptime7d: number;
  overallUptime30d: number;
}

/**
 * Compute system-wide health summary from the feeds table.
 */
export async function getSystemAvailability(): Promise<SystemAvailability> {
  const { data: feeds, error } = await supabase
    .from("feeds")
    .select("id, health_status, enabled");

  if (error || !feeds) {
    return {
      feedsTotal: 0, feedsHealthy: 0, feedsDegraded: 0, feedsFailed: 0,
      overallUptime24h: 100, overallUptime7d: 100, overallUptime30d: 100,
    };
  }

  const typed = feeds as Array<{ id: string; health_status: string; enabled: boolean }>;
  const enabled = typed.filter((f) => f.enabled);

  return {
    feedsTotal: enabled.length,
    feedsHealthy: enabled.filter((f) => f.health_status === "active").length,
    feedsDegraded: enabled.filter((f) => f.health_status === "degraded").length,
    feedsFailed: enabled.filter((f) => f.health_status === "failed").length,
    overallUptime24h: 100, // computed by dashboard from individual feed data
    overallUptime7d: 100,
    overallUptime30d: 100,
  };
}
