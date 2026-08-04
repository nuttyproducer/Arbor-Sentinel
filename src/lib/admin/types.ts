// src/lib/admin/types.ts
// Dashboard metric types for M4.4 intelligence dashboards.

/** Time range for all dashboard queries. */
export interface DashboardTimeRange {
  start: string; // ISO timestamp
  end: string;   // ISO timestamp
}

// ── Pipeline Dashboard (M4.4-01) ────────────────────────────────────────

export interface SourceOverview {
  total: number;
  active: number;
  degraded: number;
  failed: number;
}

export interface IngestionSeries {
  period: string; // ISO date/hour label
  bySourceType: Record<string, number>;
}

export interface PipelineStageMetrics {
  stageName: string;
  throughput: number; // items processed in window
  latency: {
    p50: number; // ms
    p95: number; // ms
    p99: number; // ms
  };
}

export interface CollectorGridItem {
  name: string;
  sourceType: string;
  status: "active" | "degraded" | "failed" | "unknown";
  lastFetch: string | null; // ISO timestamp or null if never run
  itemsCollected: number;
  errorCount: number;
}

export interface ErrorRatePoint {
  timestamp: string; // ISO
  bySourceType: Record<string, number>;
  byCategory: Record<string, number>;
}

// ── Review Dashboard (M4.4-02) ──────────────────────────────────────────

export interface ReviewQueueDepth {
  new: number;
  assigned: number;
  in_review: number;
  changes_requested: number;
  approved: number;
  published: number;
  rejected: number;
  archived: number;
}

export interface AgeBucket {
  label: string;   // "0-1d", "1-3d", etc.
  minDays: number;
  maxDays: number; // Infinity for the last bucket
  count: number;
}

export interface ThroughputPoint {
  date: string;    // ISO date
  reviewed: number;
  trend: number;   // 7-day moving average
}

export interface ReviewerMetric {
  id: string;                   // internal ID only — never a personal name
  completed: number;
  avgTimeMinutes: number;
  slaCompliancePercent: number;
  workload: number;             // current active assignments
  maxWorkload: number;
}

export interface SLACompliancePoint {
  date: string; // ISO date
  overall: number; // percentage 0-100
  byContentType: Record<string, number>;
}

export type BottleneckType = "stuck" | "unassigned" | "overdue" | "reviewer_at_capacity";

export interface Bottleneck {
  type: BottleneckType;
  description: string;
  count: number;
  threshold: string; // human-readable threshold, e.g. "48h", "90%"
}

// ── Data Quality Dashboard (M4.4-03) ────────────────────────────────────

export interface ConfidenceBucket {
  range: string; // "0.0-0.2", "0.2-0.4", etc.
  min: number;
  max: number;
  count: number;
}

export interface ContradictionRate {
  group: string;    // content type or source type label
  rate: number;     // 0-1
  unresolved: number;
}

export interface DuplicateRates {
  detectionRate: number;
  falsePositiveRate: number;
  mergeRate: number;
  bySourceType: Record<string, number>;
}

export type CoverageStatus = "covered" | "partial" | "gap" | "na";

export interface CoverageCell {
  country: string;
  sourceType: string;
  status: CoverageStatus;
  sourceCount: number;
}

export type FreshnessStatus = "fresh" | "stale" | "critical";

export interface FreshnessItem {
  category: string;
  lastUpdated: string; // ISO date
  ageDays: number;
  status: FreshnessStatus;
  thresholdDays: number;
}

export interface QualityTrendPoint {
  period: string;        // ISO week/month label
  confidence: number;    // average, 0-100
  contradictionRate: number; // percentage 0-100
  duplicateRate: number;     // percentage 0-100
  freshnessScore: number;    // percentage 0-100
}

export interface QualityAlert {
  metric: string;
  currentValue: number;
  threshold: number;
  message: string;
}

// ── Shared ──────────────────────────────────────────────────────────────

export type AutoRefreshInterval = 30_000 | 60_000 | 300_000 | null; // 30s, 60s, 5min, off

export type TimeRangePreset = "1h" | "24h" | "7d" | "30d" | "custom";
