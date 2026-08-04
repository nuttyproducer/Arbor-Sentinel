/**
 * Court collector integration tests.
 * Tests combined fetch + validate + normalize for ICJ and ICC collectors.
 * Verifies pipeline execution, error handling, and registrations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ICJCollector } from "../ICJCollector";
import { ICCCollector } from "../ICCCollector";
import { LegalNormalizer } from "../LegalNormalizer";
import { CollectorRegistry } from "../../CollectorRegistry";
import { RateLimiter } from "../../rateLimiter";
import { DevMemoryStore } from "../../store";
import { BaseCollector } from "../../BaseCollector";
import {
  validCourtDocument,
  validCourtDocumentAlt,
  emptyCourtDocument,
  normalizationVariants,
  notFoundError,
  serverError,
  rateLimitedError,
  icjHtmlFixture,
} from "../../__tests__/fixtures/courtFixtures";
import type { SourceRecord, SourceType } from "../../../../types/content";
import type { CollectorConfig, CollectResult } from "../../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "court-test-src",
    slug: "court-test",
    title: "Court Test Source",
    publisher: "Test Court",
    sourceType: "court" as SourceType,
    url: "https://www.icj-cij.org/node/200001",
    accessedAt: "2026-08-03",
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
    sourceId: "court-test-src",
    label: "CourtTest",
    sourceType: "court" as SourceType,
    enabled: true,
    trigger: { type: "manual" as const },
    rateLimit: DEFAULT_RATE_LIMIT,
    retry: { ...DEFAULT_RETRY_CONFIG, maxRetries: 0 },
    fetchTimeoutMs: 5000,
    maxContentAgeMs: 24 * 60 * 60 * 1000,
    storeRawResponse: false,
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Court Collectors — Integration", () => {
  let registry: CollectorRegistry;
  let storage: DevMemoryStore;
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    storage = new DevMemoryStore();
    rateLimiter = new RateLimiter();
    registry = new CollectorRegistry(storage, rateLimiter);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    rateLimiter.reset();
    registry.reset();
    storage.clear();
  });

  // ── Registration ────────────────────────────────────────────────────────

  describe("registration", () => {
    it("registers ICJCollector in the registry", () => {
      registry.register(ICJCollector, ["court"], "ICJ Court Collector");
      expect(registry.hasCollectorForType("court")).toBe(true);
    });

    it("registers ICCCollector in the registry", () => {
      registry.register(ICCCollector, ["court"], "ICC Court Collector");
      expect(registry.hasCollectorForType("court")).toBe(true);
    });

    it("registers both ICJ and ICC under court type", () => {
      registry.register(ICJCollector, ["court"], "ICJ");
      // Second registration for same type overwrites (by design)
      registry.register(ICCCollector, ["court"], "ICC");
      expect(registry.hasCollectorForType("court")).toBe(true);
      expect(registry.listRegistrations()).toHaveLength(2);
    });

    it("can create instances from registry", () => {
      registry.register(ICJCollector, ["court"], "ICJ");
      const source = makeSource();
      const config = makeConfig();
      const instance = registry.createInstance(source, config);
      expect(instance).toBeInstanceOf(BaseCollector);
    });
  });

  // ── Pipeline: ICJ ───────────────────────────────────────────────────────

  describe("ICJCollector pipeline", () => {
    it("completes full pipeline: fetch → validate → normalize → store", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(icjHtmlFixture),
      });

      const source = makeSource();
      const config = makeConfig();
      const collector = new ICJCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(true);
      expect(result.itemsFetched).toBeGreaterThan(0);
      expect(result.itemsValidated).toBeGreaterThanOrEqual(0);
      expect(result.stageDurations.fetch).toBeGreaterThan(0);
    });

    it("handles minimal HTML gracefully without throwing", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve("<html><body><main></main></body></html>"),
      });

      const source = makeSource();
      const config = makeConfig();
      const collector = new ICJCollector(source, config, storage, rateLimiter);
      // Should not throw — pipeline handles empty/minimal content
      const result = await collector.collect();
      // Pipeline completes (success or failure depends on HTML parsing, but doesn't crash)
      expect(result.runId).toMatch(/^run-/);
      expect(result.stageDurations).toBeDefined();
    });
  });

  // ── Error handling ──────────────────────────────────────────────────────

  describe("error handling", () => {
    it("returns failed result for 404 responses", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Not Found"),
      });

      const source = makeSource();
      const config = makeConfig();
      const collector = new ICJCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(false);
    });

    it("returns failed result for 503 responses", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: () => Promise.resolve("Service Unavailable"),
      });

      const source = makeSource();
      const config = makeConfig();
      const collector = new ICJCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(false);
    });

    it("handles rate-limited responses", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: () => Promise.resolve("Too Many Requests"),
      });

      const source = makeSource();
      const config = makeConfig();
      const collector = new ICJCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(false);
    });

    it("handles network timeout", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("The operation was aborted due to timeout"),
      );

      const source = makeSource();
      const config = makeConfig({ fetchTimeoutMs: 100 });
      const collector = new ICJCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(false);
    });
  });

  // ── Normalization across variants ───────────────────────────────────────

  describe("normalization", () => {
    it("normalizes diverse court document formats", async () => {
      const normalizer = new LegalNormalizer();
      for (const variant of normalizationVariants) {
        const validation = normalizer.validate(variant);
        if (variant.url && variant.title && variant.bodyText) {
          expect(validation.valid).toBe(true);
          const normalized = normalizer.normalize(variant);
          expect(normalized.title).toBe(variant.title);
          expect(normalized.metadata.court).toBe(variant.court);
        }
      }
    });

    it("rejects documents missing required fields", async () => {
      const normalizer = new LegalNormalizer();
      const validation = normalizer.validate(emptyCourtDocument);
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBeTruthy();
    });

    it("populates normalized content metadata correctly", async () => {
      const normalizer = new LegalNormalizer();
      const normalized = normalizer.normalize(validCourtDocument);
      // Top-level court-specific fields
      expect(normalized.court).toBe("ICJ");
      expect(normalized.documentType).toBe("order");
      expect(normalized.caseName).toBe("Test Alpha v. Test Beta");
      expect(normalized.parties).toEqual(["Test Alpha", "Test Beta"]);
      // Metadata object contains court info for downstream consumers
      expect(normalized.metadata.court).toBe("ICJ");
      expect(normalized.metadata.documentType).toBe("order");
    });
  });

  // ── CollectResult schema validation ─────────────────────────────────────

  describe("CollectResult schema", () => {
    it("produces valid CollectResult on success", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(icjHtmlFixture),
      });

      const source = makeSource();
      const config = makeConfig();
      const collector = new ICJCollector(source, config, storage, rateLimiter);
      const result: CollectResult = await collector.collect();

      expect(result.runId).toMatch(/^run-/);
      expect(result.sourceId).toBe("court-test-src");
      expect(result.startedAt).toBeTruthy();
      expect(result.completedAt).toBeTruthy();
      expect(result.stageDurations).toBeDefined();
      expect(result.stageDurations.fetch).toBeGreaterThanOrEqual(0);
      expect(result.stageDurations.validate).toBeGreaterThanOrEqual(0);
      expect(result.stageDurations.normalize).toBeGreaterThanOrEqual(0);
      expect(result.stageDurations.deduplicate).toBeGreaterThanOrEqual(0);
      expect(result.stageDurations.store).toBeGreaterThanOrEqual(0);
      expect(typeof result.itemsFetched).toBe("number");
      expect(typeof result.itemsValidated).toBe("number");
      expect(typeof result.itemsNormalized).toBe("number");
      expect(typeof result.itemsDeduplicated).toBe("number");
      expect(typeof result.itemsStored).toBe("number");
      expect(typeof result.success).toBe("boolean");
    });

    it("produces valid CollectResult on failure", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network failure"));

      const source = makeSource();
      const config = makeConfig();
      const collector = new ICJCollector(source, config, storage, rateLimiter);
      const result: CollectResult = await collector.collect();

      expect(result.runId).toMatch(/^run-/);
      expect(result.sourceId).toBe("court-test-src");
      expect(result.success).toBe(false);
      // Some fields should be zero on failure
      expect(typeof result.itemsFetched).toBe("number");
      expect(typeof result.itemsStored).toBe("number");
    });
  });
});
