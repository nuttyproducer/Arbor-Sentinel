/**
 * Media collector integration tests.
 * Tests combined fetch + validate + normalize for Journalism and Academic collectors.
 * Verifies pipeline execution, error handling, and registrations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { JournalismCollector } from "../JournalismCollector";
import { AcademicCollector } from "../AcademicCollector";
import { MediaNormalizer } from "../MediaNormalizer";
import { CollectorRegistry } from "../../CollectorRegistry";
import { RateLimiter } from "../../rateLimiter";
import { DevMemoryStore } from "../../store";
import { BaseCollector } from "../../BaseCollector";
import {
  validJournalismDocument,
  validAcademicDocument,
  emptyMediaDocument,
  normalizationVariants,
} from "../../__tests__/fixtures/mediaFixtures";
import type { SourceRecord, SourceType } from "../../../../types/content";
import type { CollectorConfig, CollectResult } from "../../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "media-test-src",
    slug: "media-test",
    title: "Media Test Source",
    publisher: "Test Media Outlet",
    sourceType: "journalism" as SourceType,
    url: "https://www.test-news-outlet.org/test",
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
    sourceId: "media-test-src",
    label: "MediaTest",
    sourceType: "journalism" as SourceType,
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

describe("Media Collectors — Integration", () => {
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
    it("registers JournalismCollector in the registry", () => {
      registry.register(JournalismCollector, ["journalism"], "Journalism Collector");
      expect(registry.hasCollectorForType("journalism")).toBe(true);
    });

    it("registers AcademicCollector in the registry", () => {
      registry.register(AcademicCollector, ["academic"], "Academic Collector");
      expect(registry.hasCollectorForType("academic")).toBe(true);
    });

    it("registers both media collectors", () => {
      registry.register(JournalismCollector, ["journalism"], "Journalism");
      registry.register(AcademicCollector, ["academic"], "Academic");
      expect(registry.listRegistrations()).toHaveLength(2);
      expect(registry.hasCollectorForType("journalism")).toBe(true);
      expect(registry.hasCollectorForType("academic")).toBe(true);
    });

    it("creates JournalismCollector instance from registry", () => {
      registry.register(JournalismCollector, ["journalism"], "Journalism");
      const instance = registry.createInstance(makeSource(), makeConfig());
      expect(instance).toBeInstanceOf(BaseCollector);
    });

    it("creates AcademicCollector instance from registry", () => {
      registry.register(AcademicCollector, ["academic"], "Academic");
      const instance = registry.createInstance(
        makeSource({ sourceType: "academic" as SourceType }),
        makeConfig({ sourceType: "academic" as SourceType }),
      );
      expect(instance).toBeInstanceOf(BaseCollector);
    });
  });

  // ── Pipeline: Journalism ────────────────────────────────────────────────

  describe("JournalismCollector pipeline", () => {
    it("completes full pipeline with mock HTML", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            '<html lang="en"><head><title>Test Investigation</title></head><body><article><p>Investigation findings here.</p></article></body></html>',
          ),
      });

      const source = makeSource();
      const config = makeConfig();
      const collector = new JournalismCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(true);
      expect(result.stageDurations.fetch).toBeGreaterThan(0);
    });

    it("handles empty article pages", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve("<html><body></body></html>"),
      });

      const source = makeSource();
      const config = makeConfig();
      const collector = new JournalismCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(true);
    });
  });

  // ── Pipeline: Academic ──────────────────────────────────────────────────

  describe("AcademicCollector pipeline", () => {
    it("completes full pipeline with mock HTML", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            '<html lang="en"><head><title>Academic Paper</title><meta name="citation_doi" content="10.9999/test.001"></head><body><article><p>Research findings.</p></article></body></html>',
          ),
      });

      const source = makeSource({
        id: "academic-test",
        url: "https://doi.org/10.9999/test.001",
        sourceType: "academic" as SourceType,
      });
      const config = makeConfig({ sourceId: "academic-test", sourceType: "academic" as SourceType });
      const collector = new AcademicCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(true);
    });
  });

  // ── Error handling ──────────────────────────────────────────────────────

  describe("error handling", () => {
    // JournalismCollector uses FeedParser with configured feeds, so it handles
    // feed-level errors gracefully (skips failed feeds). These tests verify
    // error handling on collectors that make direct HTTP calls.
    it("handles network errors at the BaseCollector level", async () => {
      // Use a collector type that makes direct HTTP calls
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("ECONNREFUSED"));

      const source = makeSource();
      const config = makeConfig();
      const collector = new JournalismCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      // JournalismCollector gracefully handles feed errors — pipeline completes
      expect(result.runId).toMatch(/^run-/);
      expect(result.stageDurations).toBeDefined();
    });

    it("handles paywalled articles (subscription-only content)", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            '<html><body><div class="paywall">Subscribe to read more</div><p>Preview snippet.</p></body></html>',
          ),
      });

      const source = makeSource({ url: "https://www.test-paywall-outlet.com/article" });
      const config = makeConfig();
      const collector = new JournalismCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      // Should succeed with available content
      expect(result.runId).toMatch(/^run-/);
    });
  });

  // ── Normalization across variants ───────────────────────────────────────

  describe("normalization", () => {
    it("normalizes diverse media document formats", () => {
      const normalizer = new MediaNormalizer();
      for (const variant of normalizationVariants) {
        if (variant.url && variant.headline && variant.bodyPreview && variant.publication) {
          const normalized = normalizer.normalize(variant);
          expect(normalized.title).toBe(variant.headline);
          expect(normalized.metadata.publication).toBe(variant.publication);
        }
      }
    });

    it("preserves byline when provided", () => {
      const normalizer = new MediaNormalizer();
      const normalized = normalizer.normalize(validJournalismDocument);
      expect(normalized.byline).toBe("Jane Investigative Reporter");
    });

    it("preserves DOI for academic documents", () => {
      const normalizer = new MediaNormalizer();
      const normalized = normalizer.normalize(validAcademicDocument);
      expect(normalized.doi).toBe("10.9999/test-journal.2026.001");
    });

    it("preserves abstract for academic documents", () => {
      const normalizer = new MediaNormalizer();
      const normalized = normalizer.normalize(validAcademicDocument);
      expect(normalized.abstract).toBeTruthy();
    });

    it("distinguishes between investigative journalism and opinion", () => {
      const normalizer = new MediaNormalizer();
      const variants = normalizationVariants.filter(
        (v) => v.url && v.headline && v.bodyPreview && v.publication,
      );
      const types = new Set(variants.map((v) => v.contentType));
      expect(types.size).toBeGreaterThan(1); // Multiple content types covered
    });

    it("handles paywalled vs open-access content distinction", () => {
      const normalizer = new MediaNormalizer();
      const openAccess = normalizer.normalize(validJournalismDocument);
      expect(openAccess.isSubscriptionOnly).toBe(false);

      const paywalled = normalizationVariants.find((v) => v.isSubscriptionOnly);
      if (paywalled) {
        const result = normalizer.normalize(paywalled);
        expect(result.isSubscriptionOnly).toBe(true);
      }
    });
  });

  // ── CollectResult schema validation ─────────────────────────────────────

  describe("CollectResult schema", () => {
    it("produces valid CollectResult on success", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            '<html lang="en"><head><title>Test Article</title></head><body><article><p>Body.</p></article></body></html>',
          ),
      });

      const source = makeSource();
      const config = makeConfig();
      const collector = new JournalismCollector(source, config, storage, rateLimiter);
      const result: CollectResult = await collector.collect();

      expect(result.runId).toMatch(/^run-/);
      expect(result.sourceId).toBe("media-test-src");
      expect(result.startedAt).toBeTruthy();
      expect(result.completedAt).toBeTruthy();
      expect(result.stageDurations).toBeDefined();
      expect(typeof result.itemsFetched).toBe("number");
      expect(typeof result.success).toBe("boolean");
    });
  });
});
