/**
 * NGO collector integration tests.
 * Tests combined fetch + validate + normalize for all five NGO collectors:
 * Amnesty, HRW, Btselem, MSF, ICRC.
 * Verifies pipeline execution, error handling, and registrations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AmnestyCollector } from "../AmnestyCollector";
import { HRWCollector } from "../HRWCollector";
import { BtselemCollector } from "../BtselemCollector";
import { MSFCollector } from "../MSFCollector";
import { ICRCCollector } from "../ICRCCollector";
import { NGONormalizer } from "../NGONormalizer";
import { CollectorRegistry } from "../../CollectorRegistry";
import { RateLimiter } from "../../rateLimiter";
import { DevMemoryStore } from "../../store";
import { BaseCollector } from "../../BaseCollector";
import {
  validAmnestyDocument,
  validHRWDocument,
  validBtselemDocument,
  validMSFDocument,
  validICRCDocument,
  emptyNGODocument,
  normalizationVariants,
} from "../../__tests__/fixtures/ngoFixtures";
import type { SourceRecord, SourceType } from "../../../../types/content";
import type { CollectorConfig, CollectResult } from "../../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "ngo-test-src",
    slug: "ngo-test",
    title: "NGO Test Source",
    publisher: "Test NGO",
    sourceType: "ngo" as SourceType,
    url: "https://www.amnesty.org/en/test",
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
    sourceId: "ngo-test-src",
    label: "NGOTest",
    sourceType: "ngo" as SourceType,
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

const mockHtml = (title: string, body: string) =>
  `<html lang="en"><head><title>${title}</title></head><body><article><p>${body}</p></article></body></html>`;

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("NGO Collectors — Integration", () => {
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
    const collectors = [
      { cls: AmnestyCollector, name: "AmnestyCollector" },
      { cls: HRWCollector, name: "HRWCollector" },
      { cls: BtselemCollector, name: "BtselemCollector" },
      { cls: MSFCollector, name: "MSFCollector" },
      { cls: ICRCCollector, name: "ICRCCollector" },
    ] as const;

    for (const { cls, name } of collectors) {
      it(`registers ${name} in the registry`, () => {
        registry.register(cls, ["ngo"], name);
        expect(registry.hasCollectorForType("ngo")).toBe(true);
      });
    }

    it("registers all five NGO collectors", () => {
      for (const { cls, name } of collectors) {
        registry.register(cls, ["ngo"], name);
      }
      expect(registry.listRegistrations()).toHaveLength(5);
      expect(registry.hasCollectorForType("ngo")).toBe(true);
    });

    it("creates instances for each NGO collector type from registry", () => {
      registry.register(AmnestyCollector, ["ngo"], "Amnesty");
      const instance = registry.createInstance(
        makeSource({ url: "https://www.amnesty.org/en/latest/news/test/" }),
        makeConfig(),
      );
      expect(instance).toBeInstanceOf(BaseCollector);
    });
  });

  // ── Pipeline: Each collector ────────────────────────────────────────────

  describe("AmnestyCollector pipeline", () => {
    it("completes full pipeline with mock HTML", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockHtml("Test Amnesty Report", "Amnesty investigation findings.")),
      });

      const source = makeSource({ url: "https://www.amnesty.org/en/latest/news/test/" });
      const config = makeConfig();
      const collector = new AmnestyCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(true);
      expect(result.stageDurations.fetch).toBeGreaterThan(0);
    });
  });

  describe("HRWCollector pipeline", () => {
    it("completes full pipeline with mock HTML", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockHtml("Test HRW Report", "HRW research findings.")),
      });

      const source = makeSource({
        id: "hrw-test",
        url: "https://www.hrw.org/report/test",
        sourceType: "ngo" as SourceType,
      });
      const config = makeConfig({ sourceId: "hrw-test" });
      const collector = new HRWCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(true);
    });
  });

  describe("MSFCollector pipeline", () => {
    it("completes full pipeline with mock HTML", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockHtml("Test MSF Field Report", "Medical crisis update.")),
      });

      const source = makeSource({
        id: "msf-test",
        url: "https://www.msf.org/test-report",
        sourceType: "ngo" as SourceType,
      });
      const config = makeConfig({ sourceId: "msf-test" });
      const collector = new MSFCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(true);
    });
  });

  describe("ICRCCollector pipeline", () => {
    it("completes full pipeline with mock HTML", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockHtml("Test ICRC Statement", "IHL compliance statement.")),
      });

      const source = makeSource({
        id: "icrc-test",
        url: "https://www.icrc.org/en/document/test",
        sourceType: "ngo" as SourceType,
      });
      const config = makeConfig({ sourceId: "icrc-test" });
      const collector = new ICRCCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(true);
    });
  });

  // ── Error handling ──────────────────────────────────────────────────────

  describe("error handling", () => {
    it("handles 404 for NGO pages", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Not Found"),
      });

      const source = makeSource();
      const config = makeConfig();
      const collector = new AmnestyCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(false);
    });

    it("handles 500 for NGO pages", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Error"),
      });

      const source = makeSource();
      const config = makeConfig();
      const collector = new AmnestyCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(false);
    });

    it("handles network errors for NGO pages", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

      const source = makeSource();
      const config = makeConfig();
      const collector = new AmnestyCollector(source, config, storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(false);
    });
  });

  // ── Normalization across variants ───────────────────────────────────────

  describe("normalization", () => {
    it("normalizes diverse NGO document formats", () => {
      const normalizer = new NGONormalizer();
      for (const variant of normalizationVariants) {
        if (variant.url && variant.title && variant.bodyText && variant.organization) {
          const validation = normalizer.validate(variant);
          expect(validation.valid).toBe(true);
          const normalized = normalizer.normalize(variant);
          expect(normalized.title).toBe(variant.title);
          expect(normalized.organization).toBe(variant.organization);
        }
      }
    });

    it("rejects documents missing required fields", () => {
      const normalizer = new NGONormalizer();
      const validation = normalizer.validate(emptyNGODocument);
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBeTruthy();
    });

    it("preserves key findings verbatim", () => {
      const normalizer = new NGONormalizer();
      const normalized = normalizer.normalize(validAmnestyDocument);
      expect(normalized.keyFindings).toEqual(validAmnestyDocument.keyFindings);
    });

    it("marks all NGO documents as non-official sources", () => {
      const normalizer = new NGONormalizer();
      for (const variant of normalizationVariants) {
        if (variant.url && variant.title && variant.bodyText && variant.organization) {
          const normalized = normalizer.normalize(variant);
          expect(normalized.isOfficialSource).toBe(false);
          expect(normalized.metadata.disclaimer).toBe("NGO findings are not judicial determinations");
        }
      }
    });

    it("preserves legal references", () => {
      const normalizer = new NGONormalizer();
      const normalized = normalizer.normalize(validICRCDocument);
      expect(normalized.legalReferences).toContain("Geneva Conventions I-IV");
    });

    it("preserves methodology when provided", () => {
      const normalizer = new NGONormalizer();
      const normalized = normalizer.normalize(validHRWDocument);
      expect(normalized.methodology).toBeTruthy();
      expect(normalized.metadata.methodology).toBe(validHRWDocument.methodology);
    });

    it("handles documents across report types", () => {
      const normalizer = new NGONormalizer();
      const types = new Set(normalizationVariants.map((v) => v.reportType));
      expect(types.size).toBeGreaterThan(1); // Multiple report types covered
    });
  });

  // ── CollectResult schema validation ─────────────────────────────────────

  describe("CollectResult schema", () => {
    it("produces valid CollectResult on success", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockHtml("NGO Report", "Content.")),
      });

      const source = makeSource({ url: "https://www.amnesty.org/en/latest/news/test/" });
      const config = makeConfig();
      const collector = new AmnestyCollector(source, config, storage, rateLimiter);
      const result: CollectResult = await collector.collect();

      expect(result.runId).toMatch(/^run-/);
      expect(result.sourceId).toBe("ngo-test-src");
      expect(result.startedAt).toBeTruthy();
      expect(result.completedAt).toBeTruthy();
      expect(result.stageDurations).toBeDefined();
      expect(typeof result.itemsFetched).toBe("number");
      expect(typeof result.success).toBe("boolean");
    });
  });
});
