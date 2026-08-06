import { describe, it, expect, beforeEach, vi } from "vitest";
import { CollectorRegistry } from "../CollectorRegistry";
import { RateLimiter } from "../rateLimiter";
import { DevMemoryStore } from "../store";
import { BaseCollector } from "../BaseCollector";
import type { SourceRecord, SourceType } from "../../../types/content";
import type { CollectorConfig } from "../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../types";

// ── Test helpers ────────────────────────────────────────────────────────────

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "test-source-1",
    slug: "test-source",
    title: "Test Source",
    publisher: "Test Publisher",
    sourceType: "court" as SourceType,
    url: "https://example.com/source",
    accessedAt: "2026-07-31",
    status: "active",
    version: 1,
    correctionUrl: "/corrections",
    trustLevel: 0,
    healthStatus: "unknown",
    automationStatus: "manual",
    failureCount: 0,
    monitoringEnabled: false,
    ...overrides,
  };
}

function makeConfig(overrides: Partial<CollectorConfig> = {}): CollectorConfig {
  return {
    sourceId: "test-source-1",
    label: "TestCollector",
    sourceType: "court" as SourceType,
    enabled: true,
    trigger: { type: "manual" },
    rateLimit: DEFAULT_RATE_LIMIT,
    retry: { ...DEFAULT_RETRY_CONFIG, maxRetries: 0 },
    fetchTimeoutMs: 5000,
    maxContentAgeMs: 24 * 60 * 60 * 1000,
    storeRawResponse: false,
    ...overrides,
  };
}

class MockCollectorA extends BaseCollector {
  async fetch(): Promise<unknown[]> {
    return [{ type: "A" }];
  }
}

class MockCollectorB extends BaseCollector {
  async fetch(): Promise<unknown[]> {
    return [{ type: "B" }];
  }
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("CollectorRegistry", () => {
  let registry: CollectorRegistry;
  let storage: DevMemoryStore;
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    storage = new DevMemoryStore();
    rateLimiter = new RateLimiter();
    registry = new CollectorRegistry(storage, rateLimiter);
  });

  describe("registration", () => {
    it("registers a collector class for one or more source types", () => {
      registry.register(MockCollectorA, ["court", "un"], "Court and UN sources");

      expect(registry.hasCollectorForType("court")).toBe(true);
      expect(registry.hasCollectorForType("un")).toBe(true);
      expect(registry.hasCollectorForType("ngo")).toBe(false);
    });

    it("returns the correct constructor for a registered type", () => {
      registry.register(MockCollectorA, ["court"], "Court collector");
      registry.register(MockCollectorB, ["journalism"], "Journalism collector");

      expect(registry.getCollectorForType("court")).toBe(MockCollectorA);
      expect(registry.getCollectorForType("journalism")).toBe(MockCollectorB);
    });

    it("warns when appending to an existing source type", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      registry.register(MockCollectorA, ["court"], "First");
      registry.register(MockCollectorB, ["court"], "Second");

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Appending collector for source type"),
      );
      // Last registered collector is the default for createInstance
      expect(registry.getCollectorForType("court")).toBe(MockCollectorB);
      // Both collectors are available
      expect(registry.getCollectorsForType("court")).toHaveLength(2);

      warnSpy.mockRestore();
    });

    it("lists all registrations", () => {
      registry.register(MockCollectorA, ["court", "un"], "Court and UN");
      registry.register(MockCollectorB, ["journalism"], "Journalism");

      const list = registry.listRegistrations();
      expect(list).toHaveLength(2);
      expect(list[0].name).toBe("MockCollectorA");
      expect(list[1].name).toBe("MockCollectorB");
    });

    it("unregisters a collector by name", () => {
      registry.register(MockCollectorA, ["court", "un"], "Court and UN");
      registry.unregister("MockCollectorA");

      expect(registry.hasCollectorForType("court")).toBe(false);
      expect(registry.hasCollectorForType("un")).toBe(false);
      expect(registry.listRegistrations()).toHaveLength(0);
    });

    it("returns covered source types", () => {
      registry.register(MockCollectorA, ["court", "un"], "Court and UN");
      registry.register(MockCollectorB, ["journalism"], "Journalism");

      const covered = registry.getCoveredSourceTypes();
      expect(covered).toContain("court");
      expect(covered).toContain("un");
      expect(covered).toContain("journalism");
      expect(covered).toHaveLength(3);
    });
  });

  describe("discovery", () => {
    it("returns undefined for unregistered source type", () => {
      expect(registry.getCollectorForType("osint")).toBeUndefined();
    });

    it("finds registrations by health status", () => {
      registry.register(MockCollectorA, ["court"], "Court collector");

      const failed = registry.findByHealth("failed");
      expect(failed).toHaveLength(0);

      const unknown = registry.findByHealth("unknown");
      expect(unknown).toHaveLength(1);
    });
  });

  describe("instance management", () => {
    it("creates a collector instance for a source", () => {
      registry.register(MockCollectorA, ["court"], "Court collector");

      const source = makeSource();
      const config = makeConfig();
      const instance = registry.createInstance(source, config);

      expect(instance).toBeInstanceOf(BaseCollector);
    });

    it("caches and returns the same instance for the same source+config", () => {
      registry.register(MockCollectorA, ["court"], "Court collector");

      const source = makeSource();
      const config = makeConfig();
      const instance1 = registry.createInstance(source, config);
      const instance2 = registry.createInstance(source, config);

      expect(instance1).toBe(instance2);
    });

    it("throws when no collector is registered for the source type", () => {
      const source = makeSource({ sourceType: "osint" as SourceType });
      const config = makeConfig({ sourceType: "osint" as SourceType });

      expect(() => registry.createInstance(source, config)).toThrow(
        /No collector registered for source type/,
      );
    });

    it("evicts cached instances by source ID", () => {
      registry.register(MockCollectorA, ["court"], "Court collector");

      const source = makeSource();
      const config = makeConfig();
      registry.createInstance(source, config);
      registry.evictInstance(source.id);

      const instance2 = registry.createInstance(source, config);
      expect(instance2).toBeInstanceOf(BaseCollector);
    });
  });

  describe("health tracking", () => {
    it("updates collector health status", () => {
      registry.register(MockCollectorA, ["court"], "Court collector");
      registry.updateHealth("MockCollectorA", "active");

      const active = registry.findByHealth("active");
      expect(active).toHaveLength(1);
      expect(active[0].name).toBe("MockCollectorA");
    });

    it("records success and resets failures", () => {
      registry.register(MockCollectorA, ["court"], "Court collector");
      registry.updateHealth("MockCollectorA", "degraded");
      registry.recordSuccess("MockCollectorA");

      const active = registry.findByHealth("active");
      expect(active).toHaveLength(1);
      expect(active[0].lastSuccessfulRun).toBeTruthy();
    });

    it("transitions to failed after 3 consecutive failures", () => {
      registry.register(MockCollectorA, ["court"], "Court collector");
      registry.recordFailure("MockCollectorA");
      registry.recordFailure("MockCollectorA");

      const degraded = registry.findByHealth("degraded");
      expect(degraded).toHaveLength(1);

      registry.recordFailure("MockCollectorA");

      const failed = registry.findByHealth("failed");
      expect(failed).toHaveLength(1);
    });
  });

  describe("reset", () => {
    it("clears all state", () => {
      registry.register(MockCollectorA, ["court"], "Court collector");
      registry.reset();

      expect(registry.hasCollectorForType("court")).toBe(false);
      expect(registry.listRegistrations()).toHaveLength(0);
      expect(registry.getCoveredSourceTypes()).toHaveLength(0);
    });
  });
});
