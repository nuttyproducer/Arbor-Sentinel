/**
 * EU & Belgium collector integration tests.
 * Tests combined fetch + validate + normalize for EU and Belgium collectors.
 * Verifies pipeline execution, error handling, and registrations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EUCollector } from "../EUCollector";
import { BelgiumCollector } from "../BelgiumCollector";
import { GovernmentNormalizer } from "../GovernmentNormalizer";
import { CollectorRegistry } from "../../CollectorRegistry";
import { RateLimiter } from "../../rateLimiter";
import { DevMemoryStore } from "../../store";
import { BaseCollector } from "../../BaseCollector";
import {
  validEUDocument,
  validBelgiumDocument,
  validCouncilConclusion,
  emptyGovernmentDocument,
  normalizationVariants,
} from "../../__tests__/fixtures/governmentFixtures";
import type { SourceRecord, SourceType } from "../../../../types/content";
import type { CollectorConfig, CollectResult } from "../../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "eu-test-src",
    slug: "eu-test",
    title: "EU Test Source",
    publisher: "European Union",
    sourceType: "government" as SourceType,
    url: "https://www.europarl.europa.eu/test",
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
    sourceId: "eu-test-src",
    label: "EUTest",
    sourceType: "government" as SourceType,
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

describe("EU & Belgium Collectors — Integration", () => {
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
    it("registers EUCollector in the registry", () => {
      registry.register(EUCollector, ["government"], "EU Government Collector");
      expect(registry.hasCollectorForType("government")).toBe(true);
    });

    it("registers BelgiumCollector in the registry", () => {
      registry.register(BelgiumCollector, ["government"], "Belgium Government Collector");
      expect(registry.hasCollectorForType("government")).toBe(true);
    });

    it("registers both EU and Belgium collectors", () => {
      registry.register(EUCollector, ["government"], "EU");
      registry.register(BelgiumCollector, ["government"], "Belgium");
      expect(registry.hasCollectorForType("government")).toBe(true);
      expect(registry.listRegistrations()).toHaveLength(2);
    });

    it("creates EUCollector instance from registry", () => {
      registry.register(EUCollector, ["government"], "EU");
      const instance = registry.createInstance(makeSource(), makeConfig());
      expect(instance).toBeInstanceOf(BaseCollector);
    });

    it("creates BelgiumCollector instance from registry", () => {
      registry.register(BelgiumCollector, ["government"], "Belgium");
      const instance = registry.createInstance(makeSource(), makeConfig());
      expect(instance).toBeInstanceOf(BaseCollector);
    });
  });

  // ── Pipeline: EU ────────────────────────────────────────────────────────

  describe("EUCollector pipeline", () => {
    it("completes full pipeline with mock data", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve("<html><body><article><h1>Test Resolution</h1><p>Content here.</p></article></body></html>"),
      });

      const source = makeSource({ url: "https://www.europarl.europa.eu/doceo/document/TEST_EN.html" });
      const config = makeConfig();
      const collector = new EUCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.stageDurations.fetch).toBeGreaterThan(0);
    });

    it("handles minimal HTML gracefully without throwing", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve("<html><body></body></html>"),
      });

      const source = makeSource();
      const config = makeConfig();
      const collector = new EUCollector(source, config, storage, rateLimiter);
      // Pipeline should not crash on empty/minimal content
      const result = await collector.collect();
      expect(result.runId).toMatch(/^run-/);
      expect(result.stageDurations).toBeDefined();
    });
  });

  // ── Pipeline: Belgium ───────────────────────────────────────────────────

  describe("BelgiumCollector pipeline", () => {
    it("completes full pipeline with mock data", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve("<html><body><article><h1>Wetsvoorstel Test</h1><p>Inhoud hier.</p></article></body></html>"),
      });

      const source = makeSource({
        id: "be-test",
        url: "https://www.dekamer.be/kvvcr/test.cfm",
        sourceType: "government" as SourceType,
      });
      const config = makeConfig({ sourceId: "be-test" });
      const collector = new BelgiumCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.stageDurations.fetch).toBeGreaterThan(0);
    });
  });

  // ── Error handling ──────────────────────────────────────────────────────

  describe("error handling", () => {
    it("handles 404 responses", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Not Found"),
      });

      const source = makeSource();
      const config = makeConfig();
      const collector = new EUCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(false);
    });

    it("handles 503 responses", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: () => Promise.resolve("Service Unavailable"),
      });

      const source = makeSource();
      const config = makeConfig();
      const collector = new EUCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(false);
    });

    it("handles rate-limited (429) responses", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: () => Promise.resolve("Too Many Requests"),
      });

      const source = makeSource();
      const config = makeConfig();
      const collector = new EUCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(false);
    });

    it("handles network errors", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("ENOTFOUND"));

      const source = makeSource();
      const config = makeConfig();
      const collector = new EUCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(false);
    });
  });

  // ── Normalization across variants ───────────────────────────────────────

  describe("normalization", () => {
    it("normalizes diverse government document formats", () => {
      const normalizer = new GovernmentNormalizer();
      for (const variant of normalizationVariants) {
        if (variant.url && variant.title && variant.bodyText && variant.institution) {
          const validation = normalizer.validate(variant);
          expect(validation.valid).toBe(true);
          const normalized = normalizer.normalize(variant);
          expect(normalized.title).toBe(variant.title);
          expect(normalized.metadata.institution).toBe(variant.institution);
        }
      }
    });

    it("rejects documents missing required fields", () => {
      const normalizer = new GovernmentNormalizer();
      const validation = normalizer.validate(emptyGovernmentDocument);
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBeTruthy();
    });

    it("preserves vote tally on normalized result", () => {
      const normalizer = new GovernmentNormalizer();
      const normalized = normalizer.normalize(validEUDocument);
      expect(normalized.voteTally).toEqual({ for: 450, against: 120, abstain: 35 });
    });

    it("preserves legal basis citations on normalized result", () => {
      const normalizer = new GovernmentNormalizer();
      const normalized = normalizer.normalize(validCouncilConclusion);
      expect(normalized.legalBasis).toContain("Article 29 TEU");
    });

    it("distinguishes between adopted and proposed documents", () => {
      const normalizer = new GovernmentNormalizer();
      const adopted = normalizer.normalize(validEUDocument);
      const proposed = normalizer.normalize(validBelgiumDocument);
      expect(adopted.isAdopted).toBe(true);
      expect(proposed.isAdopted).toBe(false);
    });

    it("handles multilingual documents (NL, FR, EN)", () => {
      const normalizer = new GovernmentNormalizer();
      for (const variant of [validEUDocument, validBelgiumDocument]) {
        const normalized = normalizer.normalize(variant);
        expect(["en", "nl", "fr"]).toContain(normalized.language);
      }
    });
  });

  // ── CollectResult schema validation ─────────────────────────────────────

  describe("CollectResult schema", () => {
    it("produces valid CollectResult on success", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve("<html><body><article><h1>Test</h1><p>Body.</p></article></body></html>"),
      });

      const source = makeSource();
      const config = makeConfig();
      const collector = new EUCollector(source, config, storage, rateLimiter);
      const result: CollectResult = await collector.collect();

      expect(result.runId).toMatch(/^run-/);
      expect(result.sourceId).toBe("eu-test-src");
      expect(result.startedAt).toBeTruthy();
      expect(result.completedAt).toBeTruthy();
      expect(typeof result.itemsFetched).toBe("number");
      expect(typeof result.success).toBe("boolean");
      expect(result.stageDurations).toBeDefined();
    });
  });
});
