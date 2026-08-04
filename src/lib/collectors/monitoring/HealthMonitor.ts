import type { CollectResult } from "../types";
import type { CollectorRegistration } from "../types";
import type { HealthStatus } from "../../../types/content";
import {
  type CollectorHealthSnapshot,
  type HealthReport,
  type SystemHealthSummary,
  DEFAULT_MONITORING_CONFIG,
  type MonitoringConfig,
} from "./types";

/** Internal per-collector tracking state. */
interface CollectorState {
  collectorName: string;
  sourceType: string;
  enabled: boolean;
  lastFetchAt?: string;
  lastSuccessAt?: string;
  totalFetches: number;
  successfulFetches: number;
  failedFetches: number;
  consecutiveFailures: number;
  recentResponseTimes: number[]; // last N runs, ms
  lastError?: string;
  lastErrorType?: string;
}

/**
 * Tracks collector health over time.
 *
 * Records results from collector runs, maintains per-collector state,
 * and generates HealthReports with system-wide summaries.
 *
 * All state is in-memory (consistent with DevMemoryStore for static beta).
 */
export class HealthMonitor {
  private readonly state = new Map<string, CollectorState>();
  private readonly config: MonitoringConfig;
  private registrationList: CollectorRegistration[] = [];

  constructor(config?: Partial<MonitoringConfig>) {
    this.config = { ...DEFAULT_MONITORING_CONFIG, ...config };
  }

  // ── Registration ─────────────────────────────────────────────────────

  /**
   * Sync the monitor's view of registered collectors.
   * Call this after registering collectors with the CollectorRegistry.
   */
  syncRegistrations(registrations: CollectorRegistration[]): void {
    this.registrationList = registrations;

    for (const reg of registrations) {
      if (!this.state.has(reg.name)) {
        this.state.set(reg.name, {
          collectorName: reg.name,
          sourceType: reg.supportedSourceTypes[0] ?? "unknown",
          enabled: true,
          totalFetches: 0,
          successfulFetches: 0,
          failedFetches: 0,
          consecutiveFailures: 0,
          recentResponseTimes: [],
        });
      }
    }
  }

  // ── Run Recording ────────────────────────────────────────────────────

  /**
   * Record the result of a collector run.
   *
   * @param collectorName - The collector's registration name.
   * @param sourceType - The source type.
   * @param result - The CollectResult from a collector.collect() call.
   */
  recordRun(
    collectorName: string,
    sourceType: string,
    result: CollectResult,
  ): void {
    let s = this.state.get(collectorName);

    if (!s) {
      s = {
        collectorName,
        sourceType,
        enabled: true,
        totalFetches: 0,
        successfulFetches: 0,
        failedFetches: 0,
        consecutiveFailures: 0,
        recentResponseTimes: [],
      };
      this.state.set(collectorName, s);
    }

    const now = new Date().toISOString();
    s.lastFetchAt = now;
    s.totalFetches++;

    if (result.success) {
      s.successfulFetches++;
      s.lastSuccessAt = now;
      s.consecutiveFailures = 0;
      s.lastError = undefined;
      s.lastErrorType = undefined;

      // Record response time from stage durations
      const totalMs = Object.values(result.stageDurations).reduce(
        (sum, d) => sum + d,
        0,
      );
      s.recentResponseTimes.push(totalMs);
      if (s.recentResponseTimes.length > this.config.responseTimeWindowSize) {
        s.recentResponseTimes.shift();
      }
    } else {
      s.failedFetches++;
      s.consecutiveFailures++;
      // Extract error info if we can — CollectResult doesn't carry error detail
      // but failures are still tracked
      s.lastError = `Collection failed (${result.itemsFetched} items fetched, 0 stored)`;
    }

    // Update enabled status from registrations
    const reg = this.registrationList.find((r) => r.name === collectorName);
    if (reg) {
      s.enabled = reg.healthStatus !== "failed" || reg.consecutiveFailures < 3;
    }
  }

  /**
   * Record an error from a collector run that threw before producing a CollectResult.
   */
  recordError(
    collectorName: string,
    sourceType: string,
    error: Error,
  ): void {
    let s = this.state.get(collectorName);

    if (!s) {
      s = {
        collectorName,
        sourceType,
        enabled: true,
        totalFetches: 0,
        successfulFetches: 0,
        failedFetches: 0,
        consecutiveFailures: 0,
        recentResponseTimes: [],
      };
      this.state.set(collectorName, s);
    }

    const now = new Date().toISOString();
    s.lastFetchAt = now;
    s.totalFetches++;
    s.failedFetches++;
    s.consecutiveFailures++;
    s.lastError = error.message;
    s.lastErrorType = error.constructor.name;
  }

  // ── Queries ──────────────────────────────────────────────────────────

  /** Get a snapshot for a single collector. */
  getSnapshot(collectorName: string): CollectorHealthSnapshot | undefined {
    const s = this.state.get(collectorName);
    if (!s) return undefined;
    return this.buildSnapshot(s);
  }

  /** Get snapshots for all tracked collectors. */
  getAllSnapshots(): CollectorHealthSnapshot[] {
    return Array.from(this.state.values()).map((s) => this.buildSnapshot(s));
  }

  /** Generate a full health report with system-wide summary. */
  generateReport(): HealthReport {
    const snapshots = this.getAllSnapshots();
    const summary = this.buildSummary(snapshots);

    return {
      generatedAt: new Date().toISOString(),
      collectors: snapshots,
      summary,
    };
  }

  /** Reset all tracking state (for testing). */
  reset(): void {
    this.state.clear();
    this.registrationList = [];
  }

  // ── Private Helpers ──────────────────────────────────────────────────

  private buildSnapshot(s: CollectorState): CollectorHealthSnapshot {
    const avg =
      s.recentResponseTimes.length > 0
        ? Math.round(
            s.recentResponseTimes.reduce((a, b) => a + b, 0) /
              s.recentResponseTimes.length,
          )
        : 0;

    const errorRate =
      s.totalFetches > 0 ? s.failedFetches / s.totalFetches : 0;

    const isStale =
      s.lastSuccessAt
        ? Date.now() - new Date(s.lastSuccessAt).getTime() >
          this.config.defaultStaleThresholdMs
        : true;

    const status: HealthStatus =
      s.totalFetches === 0
        ? "unknown"
        : s.consecutiveFailures >= 3
          ? "failed"
          : s.consecutiveFailures > 0 || isStale
            ? "degraded"
            : "active";

    return {
      collectorName: s.collectorName,
      sourceType: s.sourceType,
      status,
      lastFetchAt: s.lastFetchAt,
      lastSuccessAt: s.lastSuccessAt,
      totalFetches: s.totalFetches,
      successfulFetches: s.successfulFetches,
      failedFetches: s.failedFetches,
      consecutiveFailures: s.consecutiveFailures,
      avgResponseTimeMs: avg,
      errorRate: Math.round(errorRate * 100) / 100,
      lastError: s.lastError,
      lastErrorType: s.lastErrorType,
      enabled: s.enabled,
      isStale,
    };
  }

  private buildSummary(
    snapshots: CollectorHealthSnapshot[],
  ): SystemHealthSummary {
    const activeCount = snapshots.filter((s) => s.status === "active").length;
    const degradedCount = snapshots.filter(
      (s) => s.status === "degraded",
    ).length;
    const failedCount = snapshots.filter((s) => s.status === "failed").length;
    const unknownCount = snapshots.filter(
      (s) => s.status === "unknown",
    ).length;
    const staleCount = snapshots.filter((s) => s.isStale).length;

    const overallErrorRate =
      snapshots.length > 0
        ? snapshots.reduce((sum, s) => sum + s.errorRate, 0) / snapshots.length
        : 0;

    // Detect coverage gaps — source types in the type system with no registered collector
    const allSourceTypes = [
      "court",
      "un",
      "government",
      "humanitarian",
      "ngo",
      "academic",
      "journalism",
      "osint",
    ];
    const coveredTypes = new Set(snapshots.map((s) => s.sourceType));
    const coverageGaps = allSourceTypes.filter((t) => !coveredTypes.has(t));

    return {
      totalCollectors: snapshots.length,
      activeCount,
      degradedCount,
      failedCount,
      unknownCount,
      staleCount,
      overallErrorRate: Math.round(overallErrorRate * 100) / 100,
      coverageGaps,
    };
  }
}
