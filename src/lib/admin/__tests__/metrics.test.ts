// src/lib/admin/__tests__/metrics.test.ts
import { describe, it, expect } from "vitest";
import { getSourceOverview, getIngestionSeries, getPipelineMetrics, getCollectorGridItems, getErrorRateSeries } from "../metrics";
import { seedCollectorRuns, seedHealthReport, seedAlertEvents } from "../seedData";

const LAST_24H = { start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString() };
const LAST_7D = { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString() };

describe("getSourceOverview", () => {
  it("returns correct total, active, degraded, failed counts", () => {
    const report = seedHealthReport();
    const result = getSourceOverview(report);
    expect(result.total).toBe(11);
    expect(result.active).toBeGreaterThan(0);
    expect(result.failed).toBeGreaterThan(0);
    expect(result.active + result.degraded + result.failed + (report.summary.unknownCount ?? 0)).toBeLessThanOrEqual(result.total);
  });
});

describe("getIngestionSeries", () => {
  it("returns time-series buckets with source type breakdown", () => {
    const runs = seedCollectorRuns();
    const result = getIngestionSeries(runs, LAST_24H);
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("period");
      expect(result[0]).toHaveProperty("bySourceType");
    }
  });

  it("filters runs outside the time range", () => {
    const runs = seedCollectorRuns();
    const veryNarrow = { start: new Date(Date.now() - 60_000).toISOString(), end: new Date().toISOString() };
    const result = getIngestionSeries(runs, veryNarrow);
    // Nearly all seed runs are outside a 1-minute window
    const totalItems = result.reduce((sum, s) => sum + Object.values(s.bySourceType).reduce((a, b) => a + b, 0), 0);
    expect(totalItems).toBeLessThanOrEqual(20);
  });
});

describe("getPipelineMetrics", () => {
  it("returns 5 pipeline stages with latency percentiles", () => {
    const runs = seedCollectorRuns();
    const result = getPipelineMetrics(runs, LAST_7D);
    expect(result).toHaveLength(5);
    for (const stage of result) {
      expect(stage).toHaveProperty("stageName");
      expect(stage).toHaveProperty("throughput");
      expect(stage.latency).toHaveProperty("p50");
      expect(stage.latency).toHaveProperty("p95");
      expect(stage.latency).toHaveProperty("p99");
    }
  });
});

describe("getCollectorGridItems", () => {
  it("maps health snapshots to grid items", () => {
    const report = seedHealthReport();
    const items = getCollectorGridItems(report);
    expect(items).toHaveLength(report.collectors.length);
    expect(items[0]).toHaveProperty("name");
    expect(items[0]).toHaveProperty("sourceType");
    expect(items[0]).toHaveProperty("status");
    expect(items[0]).toHaveProperty("lastFetch");
    expect(items[0]).toHaveProperty("itemsCollected");
    expect(items[0]).toHaveProperty("errorCount");
  });
});

describe("getErrorRateSeries", () => {
  it("returns time-bucketed error data grouped by source type and category", () => {
    const events = seedAlertEvents();
    const result = getErrorRateSeries(events, LAST_7D);
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("timestamp");
      expect(result[0]).toHaveProperty("bySourceType");
      expect(result[0]).toHaveProperty("byCategory");
    }
  });
});
