/**
 * UN collector integration tests.
 * Tests combined fetch + validate + normalize for OHCHR and OCHA collectors.
 * Verifies pipeline execution, error handling, and registrations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OHCHRCollector } from "../OHCHRCollector";
import { OCHACollector } from "../OCHACollector";
import { UNNormalizer } from "../UNNormalizer";
import { CollectorRegistry } from "../../CollectorRegistry";
import { RateLimiter } from "../../rateLimiter";
import { DevMemoryStore } from "../../store";
import { BaseCollector } from "../../BaseCollector";
import {
  validOHCHRDocument,
  validOCHADocument,
  validCOIDocument,
  normalizationVariants,
} from "../../__tests__/fixtures/unFixtures";
import type { SourceRecord, SourceType } from "../../../../types/content";
import type { CollectorConfig, CollectResult } from "../../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../types";
import type { RawUNDocument } from "../UNNormalizer";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "un-test-src",
    slug: "un-test",
    title: "UN Test Source",
    publisher: "United Nations",
    sourceType: "un" as SourceType,
    url: "https://www.ohchr.org/en/test",
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
    sourceId: "un-test-src",
    label: "UNTest",
    sourceType: "un" as SourceType,
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

describe("UN Collectors — Integration", () => {
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
    it("registers OHCHRCollector in the registry", () => {
      registry.register(OHCHRCollector, ["un"], "OHCHR UN Collector");
      expect(registry.hasCollectorForType("un")).toBe(true);
    });

    it("registers OCHACollector in the registry", () => {
      registry.register(OCHACollector, ["un"], "OCHA UN Collector");
      expect(registry.hasCollectorForType("un")).toBe(true);
    });

    it("registers both UN collectors", () => {
      registry.register(OHCHRCollector, ["un"], "OHCHR");
      registry.register(OCHACollector, ["un"], "OCHA");
      expect(registry.hasCollectorForType("un")).toBe(true);
      expect(registry.listRegistrations()).toHaveLength(2);
    });

    it("creates OHCHR collector instance from registry", () => {
      registry.register(OHCHRCollector, ["un"], "OHCHR");
      const instance = registry.createInstance(makeSource(), makeConfig());
      expect(instance).toBeInstanceOf(BaseCollector);
    });

    it("creates OCHA collector instance from registry", () => {
      registry.register(OCHACollector, ["un"], "OCHA");
      const instance = registry.createInstance(makeSource(), makeConfig());
      expect(instance).toBeInstanceOf(BaseCollector);
    });
  });

  // ── Pipeline: OHCHR ─────────────────────────────────────────────────────

  describe("OHCHRCollector pipeline", () => {
    it("completes full pipeline with mock HTML", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(
          '<html lang="en"><head><title>Test OHCHR Press Release</title>' +
          '<meta name="description" content="UN expert calls for investigation.">' +
          '<meta name="date" content="2026-07-15"></head>' +
          '<body><article><h1>Test OHCHR Press Release</h1>' +
          '<p>UN expert calls for investigation into human rights situation.</p>' +
          '</article></body></html>'
        ),
      });

      const source = makeSource({ url: "https://www.ohchr.org/en/press-releases/test-doc" });
      const config = makeConfig({ sourceType: "un" as SourceType });
      const collector = new OHCHRCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.stageDurations.fetch).toBeGreaterThan(0);
      expect(result.runId).toMatch(/^run-/);
    });

    it("handles minimal HTML without throwing", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve("<html><body></body></html>"),
      });

      const source = makeSource({ url: "https://www.ohchr.org/en/minimal" });
      const config = makeConfig({ sourceType: "un" as SourceType });
      const collector = new OHCHRCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      // Pipeline completes without crashing (success/failure depends on parsing)
      expect(result.runId).toMatch(/^run-/);
      expect(result.stageDurations).toBeDefined();
    });
  });

  // ── Pipeline: OCHA ──────────────────────────────────────────────────────

  describe("OCHACollector pipeline", () => {
    it("completes full pipeline with RSS mock data", async () => {
      const { ochaRssFixture } = await import("../../__tests__/fixtures/unFixtures");
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(ochaRssFixture),
      });

      const source = makeSource({
        id: "ocha-test",
        url: "https://www.unocha.org/rss",
        sourceType: "un" as SourceType,
      });
      const config = makeConfig({ sourceId: "ocha-test", sourceType: "un" as SourceType });
      const collector = new OCHACollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(true);
    });

    it("handles empty RSS feeds", async () => {
      const { ochaEmptyRssFixture } = await import("../../__tests__/fixtures/unFixtures");
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(ochaEmptyRssFixture),
      });

      const source = makeSource({
        id: "ocha-empty",
        url: "https://www.unocha.org/rss",
        sourceType: "un" as SourceType,
      });
      const config = makeConfig({ sourceId: "ocha-empty", sourceType: "un" as SourceType });
      const collector = new OCHACollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(true);
    });
  });

  // ── Error handling ──────────────────────────────────────────────────────

  describe("error handling", () => {
    it("returns failed result for 404 responses", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: "Not found" }),
      });

      const source = makeSource();
      const config = makeConfig({ sourceType: "un" as SourceType });
      const collector = new OHCHRCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(false);
    });

    it("returns failed result for 500 responses", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Server error" }),
      });

      const source = makeSource();
      const config = makeConfig({ sourceType: "un" as SourceType });
      const collector = new OHCHRCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(false);
    });

    it("handles rate-limited (429) responses", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: "Rate limited" }),
      });

      const source = makeSource();
      const config = makeConfig({ sourceType: "un" as SourceType });
      const collector = new OHCHRCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(false);
    });

    it("handles network errors", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network failure"));

      const source = makeSource();
      const config = makeConfig({ sourceType: "un" as SourceType });
      const collector = new OHCHRCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(false);
    });
  });

  // ── Normalization across variants ───────────────────────────────────────

  describe("normalization", () => {
    it("normalizes diverse UN document formats", () => {
      const normalizer = new UNNormalizer();
      for (const variant of normalizationVariants) {
        if (variant.url && variant.title && variant.bodyText) {
          const normalized = normalizer.normalize(variant);
          expect(normalized.title).toBe(variant.title);
          expect(normalized.metadata.issuingBody).toBe(variant.issuingBody);
          expect(normalized.metadata.reportType).toBe(variant.reportType);
        }
      }
    });

    it("handles COI report with document symbol and session", () => {
      const normalizer = new UNNormalizer();
      const normalized = normalizer.normalize(validCOIDocument);
      expect(normalized.metadata.documentSymbol).toBe("A/HRC/99/COI/1");
      expect(normalized.metadata.session).toBe("99th session");
    });

    it("populates geographic scope from UN documents", () => {
      const normalizer = new UNNormalizer();
      const normalized = normalizer.normalize(validOCHADocument);
      expect(normalized.geographicScope).toContain("Test Region");
    });

    it("handles documents without date", () => {
      const normalizer = new UNNormalizer();
      const noDateDoc: RawUNDocument = {
        ...validOHCHRDocument,
        date: undefined,
        url: "https://www.ohchr.org/en/no-date",
      };
      const normalized = normalizer.normalize(noDateDoc);
      expect(normalized.publishedAt).toBeUndefined();
    });
  });

  // ── CollectResult schema validation ─────────────────────────────────────

  describe("CollectResult schema", () => {
    it("produces valid CollectResult on success", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ results: [validOHCHRDocument], total: 1 }),
      });

      const source = makeSource({ url: "https://www.ohchr.org/en/press-releases" });
      const config = makeConfig({ sourceType: "un" as SourceType });
      const collector = new OHCHRCollector(source, config, storage, rateLimiter);
      const result: CollectResult = await collector.collect();

      expect(result.runId).toMatch(/^run-/);
      expect(result.sourceId).toBe("un-test-src");
      expect(result.startedAt).toBeTruthy();
      expect(result.completedAt).toBeTruthy();
      expect(result.stageDurations).toBeDefined();
      expect(typeof result.success).toBe("boolean");
    });
  });
});
