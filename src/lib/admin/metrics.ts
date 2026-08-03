// src/lib/admin/metrics.ts
// Pure query functions for the Pipeline Monitoring Dashboard (M4.4-01).

import type { CollectResult } from "../collectors/types";
import type { HealthReport, AlertEvent } from "../collectors/monitoring/types";
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
