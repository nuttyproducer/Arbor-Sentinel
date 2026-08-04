import { describe, it, expect, beforeEach } from "vitest";
import { AlertSystem } from "../AlertSystem";
import type { CollectorHealthSnapshot } from "../types";

// ── Test helpers ────────────────────────────────────────────────────────────

function makeSnapshot(
  overrides: Partial<CollectorHealthSnapshot> = {},
): CollectorHealthSnapshot {
  return {
    collectorName: "TestCollector",
    sourceType: "court",
    status: "active",
    totalFetches: 0,
    successfulFetches: 0,
    failedFetches: 0,
    consecutiveFailures: 0,
    avgResponseTimeMs: 0,
    errorRate: 0,
    enabled: true,
    isStale: false,
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("AlertSystem", () => {
  let alertSystem: AlertSystem;

  beforeEach(() => {
    alertSystem = new AlertSystem();
    alertSystem.reset();
  });

  describe("evaluation", () => {
    it("triggers alert on 3 consecutive failures", () => {
      const snapshot = makeSnapshot({
        status: "failed",
        totalFetches: 3,
        failedFetches: 3,
        consecutiveFailures: 3,
        errorRate: 0.3,
      });

      const events = alertSystem.evaluate([snapshot]);

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        type: "consecutive_failures",
        severity: "warning",
        collectorName: "TestCollector",
        status: "active",
      });
    });

    it("triggers critical alert on 5 consecutive failures", () => {
      const snapshot = makeSnapshot({
        status: "failed",
        totalFetches: 5,
        failedFetches: 5,
        consecutiveFailures: 5,
        errorRate: 0.3,
      });

      const events = alertSystem.evaluate([snapshot]);

      expect(
        events.some(
          (e) => e.type === "consecutive_failures" && e.severity === "warning",
        ),
      ).toBe(true);
      expect(
        events.some(
          (e) => e.type === "consecutive_failures" && e.severity === "critical",
        ),
      ).toBe(true);
    });

    it("triggers alert on stale data", () => {
      const snapshot = makeSnapshot({
        status: "degraded",
        isStale: true,
      });

      const events = alertSystem.evaluate([snapshot]);

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        type: "stale_data",
        severity: "warning",
      });
    });

    it("respects cooldown between repeated alerts", () => {
      const snapshot = makeSnapshot({
        status: "failed",
        totalFetches: 3,
        failedFetches: 3,
        consecutiveFailures: 3,
        errorRate: 0.3,
      });

      const first = alertSystem.evaluate([snapshot]);
      expect(first).toHaveLength(1);

      const second = alertSystem.evaluate([snapshot]);
      expect(second).toHaveLength(0);
    });
  });

  describe("alert lifecycle", () => {
    function triggerAlert(): string {
      const snapshot = makeSnapshot({
        status: "failed",
        totalFetches: 3,
        failedFetches: 3,
        consecutiveFailures: 3,
        errorRate: 0.3,
      });
      const events = alertSystem.evaluate([snapshot]);
      return events[0].id;
    }

    it("acknowledge transitions alert to acknowledged", () => {
      const alertId = triggerAlert();

      const result = alertSystem.acknowledge(alertId);
      expect(result).toBe(true);

      const event = alertSystem.getAllEvents().find((e) => e.id === alertId);
      expect(event?.status).toBe("acknowledged");
      expect(event?.acknowledgedAt).toBeTruthy();
    });

    it("resolve transitions alert to resolved", () => {
      const alertId = triggerAlert();

      const result = alertSystem.resolve(alertId);
      expect(result).toBe(true);

      const event = alertSystem.getAllEvents().find((e) => e.id === alertId);
      expect(event?.status).toBe("resolved");
      expect(event?.resolvedAt).toBeTruthy();
    });

    it("autoResolve resolves alerts when collector recovers", () => {
      triggerAlert();
      expect(alertSystem.getActiveCount()).toBe(1);

      const healthy = makeSnapshot({
        status: "active",
        consecutiveFailures: 0,
      });

      alertSystem.autoResolve("TestCollector", healthy);

      expect(alertSystem.getActiveCount()).toBe(0);
      const event = alertSystem.getAllEvents()[0];
      expect(event.status).toBe("resolved");
      expect(event.resolvedAt).toBeTruthy();
    });
  });
});
