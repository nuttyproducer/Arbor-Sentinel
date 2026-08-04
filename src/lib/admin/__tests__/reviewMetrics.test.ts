// src/lib/admin/__tests__/reviewMetrics.test.ts
import { describe, it, expect } from "vitest";
import {
  getQueueDepth, getAgeDistribution, getThroughput, getReviewerPerformance,
  getSLACompliance, detectBottlenecks,
} from "../reviewMetrics";
import { seedReviewItems, seedReviewerProfiles } from "../seedData";

const LAST_7D = { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString() };

describe("getQueueDepth", () => {
  it("sums items per state correctly", () => {
    const items = seedReviewItems();
    const depth = getQueueDepth(items);
    const total = Object.values(depth).reduce((a, b) => a + b, 0);
    expect(total).toBe(30);
  });
});

describe("getAgeDistribution", () => {
  it("returns 5 age buckets", () => {
    const items = seedReviewItems();
    const buckets = getAgeDistribution(items);
    expect(buckets).toHaveLength(5);
    expect(buckets[0].label).toBe("0-1d");
    expect(buckets[4].label).toBe("14d+");
  });

  it("bucket counts sum to total items", () => {
    const items = seedReviewItems();
    const buckets = getAgeDistribution(items);
    const sum = buckets.reduce((a, b) => a + b.count, 0);
    expect(sum).toBe(30);
  });
});

describe("getThroughput", () => {
  it("returns data points with trend values", () => {
    const items = seedReviewItems();
    const points = getThroughput(items, LAST_7D);
    expect(points.length).toBeGreaterThan(0);
    expect(points[0]).toHaveProperty("date");
    expect(points[0]).toHaveProperty("reviewed");
    expect(points[0]).toHaveProperty("trend");
  });
});

describe("getReviewerPerformance", () => {
  it("anonymizes reviewer IDs (no personal names)", () => {
    const profiles = seedReviewerProfiles();
    const items = seedReviewItems();
    const metrics = getReviewerPerformance(profiles, items);
    for (const m of metrics) {
      expect(m.id).toMatch(/^rev-\d{3}$/);
    }
  });

  it("sorts by SLA compliance (lowest first)", () => {
    const profiles = seedReviewerProfiles();
    const items = seedReviewItems();
    const metrics = getReviewerPerformance(profiles, items);
    for (let i = 1; i < metrics.length; i++) {
      expect(metrics[i].slaCompliancePercent).toBeGreaterThanOrEqual(metrics[i - 1].slaCompliancePercent);
    }
  });
});

describe("getSLACompliance", () => {
  it("returns daily compliance rates", () => {
    const items = seedReviewItems();
    const points = getSLACompliance(items, LAST_7D);
    expect(points.length).toBeGreaterThan(0);
    if (points.length > 0) {
      expect(points[0].overall).toBeGreaterThanOrEqual(0);
      expect(points[0].overall).toBeLessThanOrEqual(100);
    }
  });
});

describe("detectBottlenecks", () => {
  it("returns bottleneck objects with correct shape", () => {
    const items = seedReviewItems();
    const profiles = seedReviewerProfiles();
    const bottlenecks = detectBottlenecks(items, profiles);
    for (const b of bottlenecks) {
      expect(b).toHaveProperty("type");
      expect(b).toHaveProperty("description");
      expect(b).toHaveProperty("count");
      expect(b).toHaveProperty("threshold");
    }
  });

  it("detects reviewer-at-capacity for busy reviewers", () => {
    const items = seedReviewItems();
    const profiles = seedReviewerProfiles();
    const bottlenecks = detectBottlenecks(items, profiles);
    const capacityBottlenecks = bottlenecks.filter((b) => b.type === "reviewer_at_capacity");
    // rev-002 has 9/10 workload = 90%
    expect(capacityBottlenecks.some((b) => b.description.includes("rev-002"))).toBe(true);
  });
});
