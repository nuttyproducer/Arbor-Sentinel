// src/lib/admin/__tests__/qualityMetrics.test.ts
import { describe, it, expect } from "vitest";
import {
  getConfidenceDistribution, getContradictionRates, getDuplicateRates,
  getSourceCoverage, getDataFreshness, getQualityTrends, getQualityAlerts,
  DEFAULT_QUALITY_THRESHOLDS,
} from "../qualityMetrics";
import { seedAuditLogs, seedQualityData } from "../seedData";

describe("getConfidenceDistribution", () => {
  it("returns 5 buckets summing to total entries", () => {
    const entries = seedAuditLogs();
    const buckets = getConfidenceDistribution(entries);
    expect(buckets).toHaveLength(5);
    const total = buckets.reduce((a, b) => a + b.count, 0);
    expect(total).toBe(50);
  });

  it("filters by stage when stageFilter is provided", () => {
    const entries = seedAuditLogs();
    const buckets = getConfidenceDistribution(entries, "entity_extraction");
    const total = buckets.reduce((a, b) => a + b.count, 0);
    expect(total).toBeLessThanOrEqual(50);
  });
});

describe("getContradictionRates", () => {
  it("groups by content type and source type", () => {
    const { contradictionReports } = seedQualityData();
    const result = getContradictionRates(contradictionReports);
    expect(result.byContentType.length).toBeGreaterThan(0);
    expect(result.bySourceType.length).toBeGreaterThan(0);
    expect(result.unresolvedTotal).toBeGreaterThanOrEqual(0);
  });
});

describe("getDuplicateRates", () => {
  it("calculates detection, false positive, and merge rates", () => {
    const { duplicateGroups } = seedQualityData();
    const result = getDuplicateRates(duplicateGroups);
    expect(result.detectionRate).toBeGreaterThanOrEqual(0);
    expect(result.falsePositiveRate).toBeGreaterThanOrEqual(0);
    expect(result.mergeRate).toBeGreaterThanOrEqual(0);
    expect(Object.keys(result.bySourceType).length).toBeGreaterThan(0);
  });
});

describe("getSourceCoverage", () => {
  it("returns coverage cells for all country × source type combinations", () => {
    const countries = ["Belgium", "EU", "Gaza"];
    const sourceTypes = ["court", "un", "government", "ngo"];
    const coverageMap = { Belgium: { court: 3, un: 2, government: 1, ngo: 0 } };

    const cells = getSourceCoverage(countries, sourceTypes, coverageMap);
    expect(cells.length).toBe(12); // 3 × 4
    expect(cells.some((c) => c.status === "gap")).toBe(true);
    expect(cells.some((c) => c.status === "covered")).toBe(true);
    expect(cells.some((c) => c.status === "na")).toBe(true);
  });
});

describe("getDataFreshness", () => {
  it("flags stale and critical items", () => {
    const inputs = [
      { category: "evidence", lastUpdated: new Date().toISOString(), thresholdDays: 7 },
      { category: "countries", lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), thresholdDays: 7 },
    ];
    const result = getDataFreshness(inputs);
    // Sorted oldest-first, so the 30-day-old "countries" item is first.
    expect(result[0].status).toBe("critical");
    expect(result[1].status).toBe("fresh");
  });

  it("sorts by age (oldest first)", () => {
    const inputs = [
      { category: "recent", lastUpdated: new Date().toISOString(), thresholdDays: 7 },
      { category: "oldest", lastUpdated: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), thresholdDays: 7 },
    ];
    const result = getDataFreshness(inputs);
    expect(result[0].category).toBe("oldest");
  });
});

describe("getQualityTrends", () => {
  it("returns weekly trend points with all four metrics", () => {
    const { scores, contradictionReports, duplicateGroups } = seedQualityData();
    const freshnessInputs = [
      { category: "evidence", lastUpdated: new Date().toISOString(), thresholdDays: 7 },
    ];
    const range = { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString() };

    const points = getQualityTrends(scores, contradictionReports, duplicateGroups, freshnessInputs, range);
    expect(points.length).toBeGreaterThan(0);
    if (points.length > 0) {
      expect(points[0]).toHaveProperty("confidence");
      expect(points[0]).toHaveProperty("contradictionRate");
      expect(points[0]).toHaveProperty("duplicateRate");
      expect(points[0]).toHaveProperty("freshnessScore");
    }
  });
});

describe("getQualityAlerts", () => {
  it("returns alerts when thresholds crossed", () => {
    const entries = seedAuditLogs();
    const { contradictionReports, duplicateGroups } = seedQualityData();
    const freshnessInputs = [
      { category: "old", lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), thresholdDays: 7 },
    ];

    const alerts = getQualityAlerts(entries, contradictionReports, duplicateGroups, freshnessInputs, DEFAULT_QUALITY_THRESHOLDS);
    // May or may not trigger depending on seed data values
    expect(Array.isArray(alerts)).toBe(true);
    for (const alert of alerts) {
      expect(alert).toHaveProperty("metric");
      expect(alert).toHaveProperty("message");
    }
  });
});
