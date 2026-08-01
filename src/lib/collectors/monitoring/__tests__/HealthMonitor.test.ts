import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { HealthMonitor } from "../HealthMonitor";
import type { CollectResult, CollectorRegistration } from "../../types";

// ── Test helpers ────────────────────────────────────────────────────────────

function makeResult(overrides: Partial<CollectResult> = {}): CollectResult {
  return {
    runId: "run-1",
    sourceId: "source-1",
    startedAt: "2026-01-01T00:00:00.000Z",
    completedAt: "2026-01-01T00:00:00.500Z",
    itemsFetched: 10,
    itemsValidated: 10,
    itemsNormalized: 10,
    itemsDeduplicated: 0,
    itemsStored: 10,
    stageDurations: {
      fetch: 100,
      validate: 50,
      normalize: 25,
      deduplicate: 10,
      store: 15,
    },
    success: true,
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("HealthMonitor", () => {
  let monitor: HealthMonitor;

  beforeEach(() => {
    monitor = new HealthMonitor();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("run recording", () => {
    it("tracks successful fetch and updates health status", () => {
      monitor.recordRun("TestCollector", "court", makeResult());

      const snapshot = monitor.getSnapshot("TestCollector");

      expect(snapshot).toBeDefined();
      expect(snapshot?.status).toBe("active");
      expect(snapshot?.totalFetches).toBe(1);
      expect(snapshot?.successfulFetches).toBe(1);
      expect(snapshot?.failedFetches).toBe(0);
      expect(snapshot?.consecutiveFailures).toBe(0);
      expect(snapshot?.lastSuccessAt).toBeTruthy();
    });

    it("tracks failed fetch and increments consecutive failures", () => {
      monitor.recordRun("TestCollector", "court", makeResult());
      monitor.recordRun(
        "TestCollector",
        "court",
        makeResult({ success: false }),
      );

      const snapshot = monitor.getSnapshot("TestCollector");

      expect(snapshot?.consecutiveFailures).toBe(1);
      expect(snapshot?.failedFetches).toBe(1);
      expect(snapshot?.totalFetches).toBe(2);
      expect(snapshot?.successfulFetches).toBe(1);
      expect(snapshot?.status).toBe("degraded");
    });

    it("records response time from stage durations", () => {
      monitor.recordRun("TestCollector", "court", makeResult());

      const snapshot = monitor.getSnapshot("TestCollector");
      // 100 + 50 + 25 + 10 + 15 = 200ms
      expect(snapshot?.avgResponseTimeMs).toBe(200);
    });

    it("transitions to failed after 3 consecutive failures", () => {
      monitor.recordRun(
        "TestCollector",
        "court",
        makeResult({ success: false }),
      );
      monitor.recordRun(
        "TestCollector",
        "court",
        makeResult({ success: false }),
      );
      monitor.recordRun(
        "TestCollector",
        "court",
        makeResult({ success: false }),
      );

      const snapshot = monitor.getSnapshot("TestCollector");

      expect(snapshot?.consecutiveFailures).toBe(3);
      expect(snapshot?.failedFetches).toBe(3);
      expect(snapshot?.status).toBe("failed");
    });
  });

  describe("stale data", () => {
    it("detects stale data", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

      monitor.recordRun("TestCollector", "court", makeResult());

      // Fresh — not stale yet
      expect(monitor.getSnapshot("TestCollector")?.isStale).toBe(false);

      // Advance past the 24h default stale threshold
      vi.advanceTimersByTime(25 * 60 * 60 * 1000);

      const snapshot = monitor.getSnapshot("TestCollector");
      expect(snapshot?.isStale).toBe(true);
      expect(snapshot?.status).toBe("degraded");
    });
  });

  describe("reporting", () => {
    it("generates report with system-wide summary", () => {
      monitor.recordRun("ActiveCollector", "court", makeResult());
      monitor.recordRun(
        "DegradedCollector",
        "ngo",
        makeResult({ success: false }),
      );
      monitor.recordRun(
        "DegradedCollector",
        "ngo",
        makeResult({ success: false }),
      );
      monitor.recordRun(
        "FailedCollector",
        "un",
        makeResult({ success: false }),
      );
      monitor.recordRun(
        "FailedCollector",
        "un",
        makeResult({ success: false }),
      );
      monitor.recordRun(
        "FailedCollector",
        "un",
        makeResult({ success: false }),
      );

      const report = monitor.generateReport();

      expect(report.collectors).toHaveLength(3);
      expect(report.summary.totalCollectors).toBe(3);
      expect(report.summary.activeCount).toBe(1);
      expect(report.summary.degradedCount).toBe(1);
      expect(report.summary.failedCount).toBe(1);
      expect(report.summary.unknownCount).toBe(0);
      expect(report.summary.staleCount).toBe(2);
      expect(report.summary.overallErrorRate).toBe(0.67);
      expect(report.summary.coverageGaps).not.toContain("court");
      expect(report.summary.coverageGaps).toContain("government");
      expect(report.summary.coverageGaps).toContain("journalism");
    });
  });

  describe("registration sync", () => {
    it("syncs registrations from CollectorRegistry", () => {
      const registrations: CollectorRegistration[] = [
        {
          name: "AmnestyCollector",
          supportedSourceTypes: ["ngo", "humanitarian"],
          description: "Amnesty International",
          healthStatus: "active",
          consecutiveFailures: 0,
        },
        {
          name: "ICJCollector",
          supportedSourceTypes: ["court"],
          description: "International Court of Justice",
          healthStatus: "active",
          consecutiveFailures: 0,
        },
      ];

      monitor.syncRegistrations(registrations);

      const snapshots = monitor.getAllSnapshots();
      expect(snapshots).toHaveLength(2);
      expect(snapshots[0].collectorName).toBe("AmnestyCollector");
      expect(snapshots[0].sourceType).toBe("ngo"); // first supported type
      expect(snapshots[0].status).toBe("unknown"); // never run
      expect(snapshots[1].collectorName).toBe("ICJCollector");
      expect(snapshots[1].sourceType).toBe("court");
    });
  });

  describe("error recording", () => {
    it("records errors thrown before CollectResult", () => {
      const error = new Error("Network timeout");
      monitor.recordError("ApiCollector", "un", error);

      const snapshot = monitor.getSnapshot("ApiCollector");

      expect(snapshot?.totalFetches).toBe(1);
      expect(snapshot?.failedFetches).toBe(1);
      expect(snapshot?.consecutiveFailures).toBe(1);
      expect(snapshot?.lastError).toBe("Network timeout");
      expect(snapshot?.lastErrorType).toBe("Error");
      expect(snapshot?.status).toBe("degraded");
    });
  });
});
