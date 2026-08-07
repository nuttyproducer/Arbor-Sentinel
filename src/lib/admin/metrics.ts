// src/lib/admin/metrics.ts
// Pure query functions and Supabase loader for the Pipeline Monitoring Dashboard (M4.4-01).

import { supabase } from "../db/client";
import type { CollectResult, PipelineStageDurations } from "../collectors/types";
import type { HealthReport, AlertEvent, CollectorHealthSnapshot, SystemHealthSummary } from "../collectors/monitoring/types";
import type { DashboardTimeRange, SourceOverview, IngestionSeries, PipelineStageMetrics, CollectorGridItem, ErrorRatePoint } from "./types";

export function getSourceOverview(report: HealthReport): SourceOverview {
  const s = report.summary;
  return {
    total: s.totalCollectors,
    active: s.activeCount,
    degraded: s.degradedCount,
    failed: s.failedCount,
  };
}

export function getIngestionSeries(
  runs: CollectResult[],
  range: DashboardTimeRange,
): IngestionSeries[] {
  const rangeStart = new Date(range.start).getTime();
  const rangeEnd = new Date(range.end).getTime();
  const windowRuns = runs.filter((r) => {
    const t = new Date(r.completedAt).getTime();
    return t >= rangeStart && t <= rangeEnd;
  });

  // Group by hour for short ranges, by day for longer
  const bucketMs = (rangeEnd - rangeStart) > 24 * 60 * 60 * 1000 ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;

  const buckets = new Map<string, Record<string, number>>();

  for (const run of windowRuns) {
    const bucketKey = new Date(
      Math.floor(new Date(run.completedAt).getTime() / bucketMs) * bucketMs,
    ).toISOString();

    let bucket = buckets.get(bucketKey);
    if (!bucket) {
      bucket = {};
      buckets.set(bucketKey, bucket);
    }

    // Infer source type from sourceId pattern "source-<type>-N"
    const sourceType = run.sourceId.replace(/^source-/, "").replace(/-\d+$/, "") || "unknown";
    bucket[sourceType] = (bucket[sourceType] ?? 0) + run.itemsStored;
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, bySourceType]) => ({ period, bySourceType }));
}

export function getPipelineMetrics(
  runs: CollectResult[],
  range: DashboardTimeRange,
): PipelineStageMetrics[] {
  const rangeStart = new Date(range.start).getTime();
  const rangeEnd = new Date(range.end).getTime();
  const windowRuns = runs.filter((r) => {
    const t = new Date(r.completedAt).getTime();
    return t >= rangeStart && t <= rangeEnd;
  });

  const stages = ["fetch", "validate", "normalize", "deduplicate", "store"] as const;

  return stages.map((stage) => {
    const durations = windowRuns
      .filter((r) => r.success)
      .map((r) => r.stageDurations[stage])
      .filter((d): d is number => d !== undefined)
      .sort((a, b) => a - b);

    const len = durations.length;
    return {
      stageName: stage,
      throughput: len,
      latency: {
        p50: len > 0 ? durations[Math.floor(len * 0.5)] : 0,
        p95: len > 0 ? durations[Math.floor(len * 0.95)] : 0,
        p99: len > 0 ? durations[Math.floor(len * 0.99)] : 0,
      },
    };
  });
}

export function getCollectorGridItems(report: HealthReport): CollectorGridItem[] {
  return report.collectors.map((c) => ({
    name: c.collectorName,
    sourceType: c.sourceType,
    status: c.status as CollectorGridItem["status"],
    lastFetch: c.lastFetchAt ?? null,
    itemsCollected: c.successfulFetches,
    errorCount: c.failedFetches,
  }));
}

export function getErrorRateSeries(
  events: AlertEvent[],
  range: DashboardTimeRange,
): ErrorRatePoint[] {
  const rangeStart = new Date(range.start).getTime();
  const rangeEnd = new Date(range.end).getTime();
  const windowEvents = events.filter((e) => {
    const t = new Date(e.firedAt).getTime();
    return t >= rangeStart && t <= rangeEnd;
  });

  const dayMs = 24 * 60 * 60 * 1000;
  const buckets = new Map<string, { bySourceType: Record<string, number>; byCategory: Record<string, number> }>();

  for (const event of windowEvents) {
    const day = new Date(
      Math.floor(new Date(event.firedAt).getTime() / dayMs) * dayMs,
    ).toISOString();

    let bucket = buckets.get(day);
    if (!bucket) {
      bucket = { bySourceType: {}, byCategory: {} };
      buckets.set(day, bucket);
    }

    const st = event.sourceType ?? "unknown";
    bucket.bySourceType[st] = (bucket.bySourceType[st] ?? 0) + 1;

    const cat = event.type;
    bucket.byCategory[cat] = (bucket.byCategory[cat] ?? 0) + 1;
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([timestamp, data]) => ({
      timestamp,
      bySourceType: data.bySourceType,
      byCategory: data.byCategory,
    }));
}

// ── Supabase data loader ────────────────────────────────────────────────────

interface CollectorRunRow {
  id: string;
  source_id: string;
  collector_type: string;
  status: string;
  items_fetched: number;
  items_validated: number;
  items_stored: number;
  stage_durations: PipelineStageDurations | null;
  errors: Record<string, unknown>[] | null;
  started_at: string;
  completed_at: string | null;
}

interface FeedRow {
  id: string;
  name: string;
  source_type: string;
  health_status: string;
  last_fetched_at: string | null;
  last_success_at: string | null;
  failure_count: number;
  last_error: string | null;
  enabled: boolean;
}

interface SourceTypeRow {
  id: string;
  type: string;
}

export async function fetchPipelineData(range: DashboardTimeRange): Promise<{
  runs: CollectResult[];
  report: HealthReport;
  events: AlertEvent[];
}> {
  const rangeStart = range.start;
  const rangeEnd = range.end;

  // Fetch collector runs, feeds, and sources in parallel
  const [runsResult, feedsResult, sourcesResult] = await Promise.all([
    supabase
      .from("collector_runs")
      .select("id, source_id, collector_type, status, items_fetched, items_validated, items_stored, stage_durations, errors, started_at, completed_at")
      .gte("started_at", rangeStart)
      .lte("started_at", rangeEnd)
      .order("started_at", { ascending: false })
      .limit(500),
    supabase
      .from("feeds")
      .select("id, name, source_type, health_status, last_fetched_at, last_success_at, failure_count, last_error, enabled"),
    supabase
      .from("sources")
      .select("id, type"),
  ]);

  const runsData = (runsResult.data ?? []) as CollectorRunRow[];
  const feedsData = (feedsResult.data ?? []) as FeedRow[];
  const sourcesData = (sourcesResult.data ?? []) as SourceTypeRow[];

  // Build source id → type map
  const sourceTypeMap = new Map<string, string>();
  for (const s of sourcesData) {
    sourceTypeMap.set(s.id, s.type);
  }

  // Map collector_runs → CollectResult[]
  const runs: CollectResult[] = runsData.map((row) => {
    const sourceType = sourceTypeMap.get(row.source_id) ?? row.collector_type ?? "unknown";
    const defaultDurations: PipelineStageDurations = { fetch: 0, validate: 0, normalize: 0, deduplicate: 0, filter: 0, store: 0 };
    return {
      runId: row.id,
      sourceId: `${sourceType}-${row.source_id}`,
      startedAt: row.started_at,
      completedAt: row.completed_at ?? row.started_at,
      itemsFetched: row.items_fetched ?? 0,
      itemsValidated: row.items_validated ?? 0,
      itemsNormalized: row.items_stored ?? 0,
      itemsDeduplicated: row.items_stored ?? 0,
      itemsFiltered: 0,
      itemsStored: row.items_stored ?? 0,
      stageDurations: row.stage_durations ?? defaultDurations,
      success: row.status === "completed",
    };
  });

  // Map feeds → CollectorHealthSnapshot[] + HealthReport
  const now = new Date().toISOString();
  const collectors: CollectorHealthSnapshot[] = feedsData.map((f) => {
    const totalFetches = f.failure_count + (f.last_success_at ? 1 : 0);
    const healthStatus = (f.health_status ?? "unknown") as CollectorHealthSnapshot["status"];
    return {
      collectorName: f.name,
      sourceType: f.source_type ?? "unknown",
      status: healthStatus,
      lastFetchAt: f.last_fetched_at ?? undefined,
      lastSuccessAt: f.last_success_at ?? undefined,
      totalFetches,
      successfulFetches: f.last_success_at ? 1 : 0,
      failedFetches: f.failure_count ?? 0,
      consecutiveFailures: f.failure_count ?? 0,
      avgResponseTimeMs: 0,
      errorRate: totalFetches > 0 ? (f.failure_count ?? 0) / totalFetches : 0,
      lastError: f.last_error ?? undefined,
      lastErrorType: f.last_error ? "fetch" : undefined,
      enabled: f.enabled,
      isStale: !f.last_success_at || (Date.now() - new Date(f.last_success_at).getTime()) > 24 * 60 * 60 * 1000,
    };
  });

  const summary: SystemHealthSummary = {
    totalCollectors: collectors.length,
    activeCount: collectors.filter((c) => c.status === "active").length,
    degradedCount: collectors.filter((c) => c.status === "degraded").length,
    failedCount: collectors.filter((c) => c.status === "failed").length,
    unknownCount: collectors.filter((c) => c.status === "unknown").length,
    staleCount: collectors.filter((c) => c.isStale).length,
    overallErrorRate: collectors.length > 0
      ? collectors.reduce((s, c) => s + c.errorRate, 0) / collectors.length
      : 0,
    coverageGaps: [],
  };

  const report: HealthReport = {
    generatedAt: now,
    collectors,
    summary,
  };

  // Generate AlertEvent[] from failed runs and unhealthy feeds
  const events: AlertEvent[] = [];
  let alertCounter = 0;

  // Failed runs → error_rate / consecutive_failures alerts
  for (const row of runsData) {
    if (row.status === "failed") {
      const errorCount = row.errors?.length ?? 1;
      events.push({
        id: `alert-${Date.now()}-${alertCounter++}`,
        ruleId: "high-error-rate",
        type: "error_rate",
        severity: errorCount > 3 ? "critical" : "warning",
        collectorName: sourceTypeMap.get(row.source_id) ?? row.collector_type ?? "unknown",
        sourceType: sourceTypeMap.get(row.source_id),
        firedAt: row.completed_at ?? row.started_at,
        status: "active",
        message: `Run ${row.id} failed with ${errorCount} error(s)`,
        context: { runId: row.id, errorCount, errors: row.errors },
      });
    }
  }

  // Unhealthy feeds → stale/error alerts
  for (const f of feedsData) {
    if (f.failure_count >= 3) {
      events.push({
        id: `alert-${Date.now()}-${alertCounter++}`,
        ruleId: "consecutive-failures",
        type: "consecutive_failures",
        severity: f.failure_count >= 5 ? "critical" : "warning",
        collectorName: f.name,
        sourceType: f.source_type,
        firedAt: f.last_fetched_at ?? now,
        status: "active",
        message: `${f.name} has ${f.failure_count} consecutive failures`,
        context: { feedId: f.id, failureCount: f.failure_count, lastError: f.last_error },
      });
    }
    if (f.health_status === "degraded" || f.health_status === "failed") {
      events.push({
        id: `alert-${Date.now()}-${alertCounter++}`,
        ruleId: "stale-data",
        type: "stale_data",
        severity: f.health_status === "failed" ? "critical" : "warning",
        collectorName: f.name,
        sourceType: f.source_type,
        firedAt: f.last_fetched_at ?? now,
        status: "active",
        message: `${f.name} health is ${f.health_status}${f.last_error ? `: ${f.last_error}` : ""}`,
        context: { feedId: f.id, healthStatus: f.health_status, lastError: f.last_error },
      });
    }
  }

  return { runs, report, events };
}
