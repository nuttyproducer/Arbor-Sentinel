import type { CollectResult } from "../types";
import {
  type SourceMetrics,
  type SystemMetrics,
  type MetricPoint,
  type MetricsWindow,
  METRICS_WINDOW_MS,
} from "./types";

/** Internal per-source metric tracking. */
interface SourceMetricState {
  sourceId: string;
  collectorName: string;
  sourceType: string;
  runs: RunRecord[];
}

interface RunRecord {
  timestamp: string;
  totalMs: number;
  itemsFetched: number;
  itemsStored: number;
  success: boolean;
  isRateLimit: boolean;
}

/**
 * Collects and aggregates metrics across collector runs.
 *
 * Tracks per-source metrics (items fetched/stored, response times, errors,
 * rate limit hits) and aggregates them into time-windowed system-wide
 * snapshots.
 *
 * All state is in-memory (consistent with static beta approach).
 */
export class MetricsCollector {
  private readonly sources = new Map<string, SourceMetricState>();

  // ── Recording ────────────────────────────────────────────────────────

  /**
   * Record a collector run result.
   */
  recordRun(
    sourceId: string,
    collectorName: string,
    sourceType: string,
    result: CollectResult,
  ): void {
    let s = this.sources.get(sourceId);
    if (!s) {
      s = {
        sourceId,
        collectorName,
        sourceType,
        runs: [],
      };
      this.sources.set(sourceId, s);
    }

    const totalMs = Object.values(result.stageDurations).reduce(
      (sum, d) => sum + d,
      0,
    );

    s.runs.push({
      timestamp: result.completedAt,
      totalMs,
      itemsFetched: result.itemsFetched,
      itemsStored: result.itemsStored,
      success: result.success,
      isRateLimit: false, // can't detect from CollectResult alone
    });

    // Prune runs older than the longest window
    const maxWindow = METRICS_WINDOW_MS["7d"];
    const cutoff = Date.now() - maxWindow;
    s.runs = s.runs.filter(
      (r) => new Date(r.timestamp).getTime() > cutoff,
    );
  }

  /**
   * Record a rate limit hit for a source.
   */
  recordRateLimit(sourceId: string, collectorName: string, sourceType: string): void {
    let s = this.sources.get(sourceId);
    if (!s) {
      s = {
        sourceId,
        collectorName,
        sourceType,
        runs: [],
      };
      this.sources.set(sourceId, s);
    }

    s.runs.push({
      timestamp: new Date().toISOString(),
      totalMs: 0,
      itemsFetched: 0,
      itemsStored: 0,
      success: false,
      isRateLimit: true,
    });
  }

  // ── Queries ──────────────────────────────────────────────────────────

  /**
   * Get per-source metrics for a time window.
   */
  getSourceMetrics(
    sourceId: string,
    window: MetricsWindow,
  ): SourceMetrics | undefined {
    const s = this.sources.get(sourceId);
    if (!s) return undefined;

    return this.buildSourceMetrics(s, window);
  }

  /**
   * Get all source metrics for a time window.
   */
  getAllSourceMetrics(window: MetricsWindow): SourceMetrics[] {
    return Array.from(this.sources.values()).map((s) =>
      this.buildSourceMetrics(s, window),
    );
  }

  /**
   * Generate a system-wide metrics snapshot for a time window.
   */
  getSystemMetrics(window: MetricsWindow): SystemMetrics {
    const windowMs = METRICS_WINDOW_MS[window];
    const windowEnd = new Date().toISOString();
    const windowStart = new Date(Date.now() - windowMs).toISOString();

    const sources = this.getAllSourceMetrics(window);

    let itemsFetched = 0;
    let itemsStored = 0;
    let errors = 0;
    let rateLimitHits = 0;
    let totalResponseTime = 0;
    let responseCount = 0;
    let activeCollectors = 0;
    let failedCollectors = 0;

    for (const sm of sources) {
      itemsFetched += sm.itemsFetched;
      itemsStored += sm.itemsStored;
      errors += sm.errorCount;
      rateLimitHits += sm.rateLimitHits;
      for (const pt of sm.responseTimes) {
        totalResponseTime += pt.value;
        responseCount++;
      }
      // Active = had at least one successful run in the window
      if (sm.itemsFetched > 0 && sm.errorCount === 0) {
        activeCollectors++;
      } else if (sm.errorCount > 0) {
        failedCollectors++;
      }
    }

    return {
      window,
      windowStart,
      windowEnd,
      sources,
      totals: {
        itemsFetched,
        itemsStored,
        errors,
        rateLimitHits,
        avgResponseTimeMs:
          responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0,
      },
      activeCollectors,
      failedCollectors,
    };
  }

  /**
   * Reset all metrics (for testing).
   */
  reset(): void {
    this.sources.clear();
  }

  // ── Private Helpers ──────────────────────────────────────────────────

  private buildSourceMetrics(
    s: SourceMetricState,
    window: MetricsWindow,
  ): SourceMetrics {
    const windowMs = METRICS_WINDOW_MS[window];
    const cutoff = Date.now() - windowMs;

    const windowRuns = s.runs.filter(
      (r) => new Date(r.timestamp).getTime() > cutoff,
    );

    const itemsFetched = windowRuns.reduce(
      (sum, r) => sum + r.itemsFetched,
      0,
    );
    const itemsStored = windowRuns.reduce(
      (sum, r) => sum + r.itemsStored,
      0,
    );
    const errorCount = windowRuns.filter((r) => !r.success).length;
    const rateLimitHits = windowRuns.filter((r) => r.isRateLimit).length;

    const responseTimes: MetricPoint[] = windowRuns
      .filter((r) => r.success && r.totalMs > 0)
      .map((r) => ({
        timestamp: r.timestamp,
        value: r.totalMs,
      }));

    const lastRun = windowRuns[windowRuns.length - 1];

    return {
      sourceId: s.sourceId,
      collectorName: s.collectorName,
      sourceType: s.sourceType,
      itemsFetched,
      itemsStored,
      responseTimes,
      errorCount,
      rateLimitHits,
      lastFetchAt: lastRun?.timestamp,
    };
  }
}
