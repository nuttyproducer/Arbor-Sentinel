import type { HealthStatus } from "../../../types/content";

// ── Health Tracking ──────────────────────────────────────────────────────

/** Per-collector health snapshot. */
export interface CollectorHealthSnapshot {
  /** Collector registration name (e.g. "AmnestyCollector"). */
  collectorName: string;
  /** Source type this collector handles. */
  sourceType: string;
  /** Current health status. */
  status: HealthStatus;
  /** ISO timestamp of the last fetch attempt. */
  lastFetchAt?: string;
  /** ISO timestamp of the last successful fetch. */
  lastSuccessAt?: string;
  /** Total fetch attempts (success + failure). */
  totalFetches: number;
  /** Number of successful fetches. */
  successfulFetches: number;
  /** Number of failed fetches. */
  failedFetches: number;
  /** Current consecutive failure count. */
  consecutiveFailures: number;
  /** Average response time in milliseconds over the last 10 runs. */
  avgResponseTimeMs: number;
  /** Error rate as a fraction (failedFetches / totalFetches). */
  errorRate: number;
  /** Last error message, if any. */
  lastError?: string;
  /** Last error type, if any. */
  lastErrorType?: string;
  /** Whether the collector is currently enabled. */
  enabled: boolean;
  /** Whether data is stale (no successful fetch within configured window). */
  isStale: boolean;
}

/** Aggregated health report for all collectors. */
export interface HealthReport {
  /** ISO timestamp when this report was generated. */
  generatedAt: string;
  /** Per-collector snapshots. */
  collectors: CollectorHealthSnapshot[];
  /** System-wide summary. */
  summary: SystemHealthSummary;
}

/** System-wide health summary. */
export interface SystemHealthSummary {
  /** Total registered collectors. */
  totalCollectors: number;
  /** Collectors in 'active' state. */
  activeCount: number;
  /** Collectors in 'degraded' state. */
  degradedCount: number;
  /** Collectors in 'failed' state. */
  failedCount: number;
  /** Collectors in 'unknown' state (never run). */
  unknownCount: number;
  /** Collectors with stale data. */
  staleCount: number;
  /** System-wide error rate (average across all collectors). */
  overallErrorRate: number;
  /** Source types that have no registered collector (coverage gaps). */
  coverageGaps: string[];
}

// ── Alerts ──────────────────────────────────────────────────────────────

/** Alert severity levels. */
export type AlertSeverity = "info" | "warning" | "critical";

/** Alert status lifecycle. */
export type AlertStatus = "active" | "acknowledged" | "resolved";

/** Categories of monitorable conditions. */
export type AlertType =
  | "consecutive_failures"
  | "stale_data"
  | "error_rate"
  | "rate_limit"
  | "response_time"
  | "coverage_gap";

/** A configurable alert rule. */
export interface AlertRule {
  /** Unique rule ID. */
  id: string;
  /** Alert type this rule checks. */
  type: AlertType;
  /** Human-readable description. */
  description: string;
  /** Severity level when triggered. */
  severity: AlertSeverity;
  /** Whether this rule is enabled. */
  enabled: boolean;
  /** Threshold configuration — meaning depends on type. */
  threshold: AlertThreshold;
  /** Minimum interval between repeated alerts for the same source, in ms. Prevents alert fatigue. */
  cooldownMs: number;
  /** Source types this rule applies to (empty = all). */
  sourceTypes?: string[];
}

/** Threshold configuration for an alert rule. */
export interface AlertThreshold {
  /** For consecutive_failures: trigger after N consecutive failures. */
  maxConsecutiveFailures?: number;
  /** For stale_data: trigger after no successful fetch for this many ms. */
  maxStaleAgeMs?: number;
  /** For error_rate: trigger when error rate exceeds this fraction (0-1). */
  maxErrorRate?: number;
  /** For rate_limit: trigger when rate limit hits exceed this count in the window. */
  maxRateLimitHits?: number;
  /** For response_time: trigger when avg response exceeds this ms. */
  maxResponseTimeMs?: number;
}

/** A triggered alert event. */
export interface AlertEvent {
  /** Unique event ID. */
  id: string;
  /** The rule that triggered this alert. */
  ruleId: string;
  /** Alert type. */
  type: AlertType;
  /** Severity. */
  severity: AlertSeverity;
  /** Which collector triggered the alert (empty = system-wide). */
  collectorName: string;
  /** Source type affected. */
  sourceType?: string;
  /** ISO timestamp when the alert fired. */
  firedAt: string;
  /** ISO timestamp when acknowledged, if any. */
  acknowledgedAt?: string;
  /** ISO timestamp when resolved, if any. */
  resolvedAt?: string;
  /** Current status. */
  status: AlertStatus;
  /** Human-readable alert message. */
  message: string;
  /** Relevant metric values at time of alert. */
  context: Record<string, unknown>;
}

// ── Metrics ─────────────────────────────────────────────────────────────

/** Time window for metric aggregation. */
export type MetricsWindow = "1h" | "24h" | "7d";

/** Duration in ms for each window. */
export const METRICS_WINDOW_MS: Record<MetricsWindow, number> = {
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

/** A single metric data point. */
export interface MetricPoint {
  /** ISO timestamp. */
  timestamp: string;
  /** Metric value. */
  value: number;
}

/** Per-source metrics snapshot. */
export interface SourceMetrics {
  /** Source ID. */
  sourceId: string;
  /** Collector name. */
  collectorName: string;
  /** Source type. */
  sourceType: string;
  /** Total items fetched in the window. */
  itemsFetched: number;
  /** Total items stored in the window. */
  itemsStored: number;
  /** Response time series. */
  responseTimes: MetricPoint[];
  /** Error count in the window. */
  errorCount: number;
  /** Rate limit hits in the window. */
  rateLimitHits: number;
  /** Last fetch timestamp. */
  lastFetchAt?: string;
}

/** System-wide metrics snapshot. */
export interface SystemMetrics {
  /** The time window this snapshot covers. */
  window: MetricsWindow;
  /** ISO start of the window. */
  windowStart: string;
  /** ISO end of the window (now). */
  windowEnd: string;
  /** Per-source metrics. */
  sources: SourceMetrics[];
  /** System-wide totals. */
  totals: {
    itemsFetched: number;
    itemsStored: number;
    errors: number;
    rateLimitHits: number;
    avgResponseTimeMs: number;
  };
  /** Active collector count. */
  activeCollectors: number;
  /** Failed collector count. */
  failedCollectors: number;
}

// ── Monitoring Config ────────────────────────────────────────────────────

/** Top-level monitoring configuration. */
export interface MonitoringConfig {
  /** How often to generate health reports, in ms. */
  healthReportIntervalMs: number;
  /** How many past runs to keep for response time averaging. */
  responseTimeWindowSize: number;
  /** Default cooldown between repeated alerts, in ms. */
  defaultAlertCooldownMs: number;
  /** Default stale data threshold, in ms. */
  defaultStaleThresholdMs: number;
  /** Alert rules. */
  rules: AlertRule[];
}

export const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
  healthReportIntervalMs: 60_000, // 1 minute
  responseTimeWindowSize: 10,
  defaultAlertCooldownMs: 30 * 60_000, // 30 minutes
  defaultStaleThresholdMs: 24 * 60 * 60 * 1000, // 24 hours
  rules: [
    {
      id: "consecutive-failures",
      type: "consecutive_failures",
      description: "Collector has failed 3+ times consecutively",
      severity: "warning",
      enabled: true,
      threshold: { maxConsecutiveFailures: 3 },
      cooldownMs: 30 * 60_000,
    },
    {
      id: "consecutive-failures-critical",
      type: "consecutive_failures",
      description: "Collector has failed 5+ times consecutively",
      severity: "critical",
      enabled: true,
      threshold: { maxConsecutiveFailures: 5 },
      cooldownMs: 15 * 60_000,
    },
    {
      id: "stale-data",
      type: "stale_data",
      description: "No successful fetch in 24 hours",
      severity: "warning",
      enabled: true,
      threshold: { maxStaleAgeMs: 24 * 60 * 60 * 1000 },
      cooldownMs: 60 * 60_000,
    },
    {
      id: "high-error-rate",
      type: "error_rate",
      description: "Error rate exceeds 50%",
      severity: "critical",
      enabled: true,
      threshold: { maxErrorRate: 0.5 },
      cooldownMs: 30 * 60_000,
    },
    {
      id: "rate-limit-spike",
      type: "rate_limit",
      description: "Rate limit hits exceed 10 in the monitoring window",
      severity: "warning",
      enabled: true,
      threshold: { maxRateLimitHits: 10 },
      cooldownMs: 15 * 60_000,
    },
  ],
};
