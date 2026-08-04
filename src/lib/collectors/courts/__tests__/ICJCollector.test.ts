import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ICJCollector } from "../ICJCollector";
import { RateLimiter } from "../../rateLimiter";
import { DevMemoryStore } from "../../store";
import { FetchError, ParseError, ValidationError } from "../../errors";
import { icjOrderHtml } from "../mockData";
import type { SourceRecord, SourceType } from "../../../../types/content";
import type { CollectorConfig } from "../../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../types";

// ── Test helpers ────────────────────────────────────────────────────────────

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "icj-test",
    slug: "icj-test",
    title: "ICJ Test Source",
    publisher: "International Court of Justice",
    sourceType: "court" as SourceType,
    url: "https://www.icj-cij.org/node/203455",
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
    sourceId: "icj-test",
    label: "ICJCollector",
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

// ── Tests ────────────────────────────────────────────────────────────────────

describe("ICJCollector", () => {
  let source: SourceRecord;
  let config: CollectorConfig;
  let storage: DevMemoryStore;
  let rateLimiter: RateLimiter;
  let collector: ICJCollector;

  beforeEach(() => {
    source = makeSource();
    config = makeConfig();
    storage = new DevMemoryStore();
    rateLimiter = new RateLimiter();
    collector = new ICJCollector(source, config, storage, rateLimiter);

    // Mock global fetch
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    rateLimiter.reset();
  });

  describe("fetch", () => {
    it("fetches and parses an ICJ document from HTML", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(icjOrderHtml),
      });

      const result = await collector.fetch();

      expect(result).toHaveLength(1);
      const doc = result[0] as Record<string, unknown>;
      expect(doc.court).toBe("ICJ");
      expect(doc.documentType).toBe("order");
      // Title should be extracted from the HTML
      expect(doc.title).toBeTruthy();
      expect(doc.url).toBe("https://www.icj-cij.org/node/203455");
    });

    it("extracts document type correctly from ICJ HTML", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(icjOrderHtml),
      });

      const result = await collector.fetch();
      const doc = result[0] as Record<string, unknown>;

      expect(doc.documentType).toBe("order");
    });

    it("extracts title from HTML <title> tag", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(icjOrderHtml),
      });

      const result = await collector.fetch();
      const doc = result[0] as Record<string, unknown>;

      expect(doc.title).toContain("Application of the Convention");
      expect(doc.title).not.toContain("International Court of Justice");
    });

    it("extracts publication date from HTML meta tags", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(icjOrderHtml),
      });

      const result = await collector.fetch();
      const doc = result[0] as Record<string, unknown>;

      expect(doc.date).toBe("2024-01-26");
    });
  });

  describe("normalize", () => {
    it("normalizes a raw ICJ document into NormalizedContent", async () => {
      const rawDoc = {
        url: "https://www.icj-cij.org/node/203455",
        title: "Test ICJ Order",
        court: "ICJ" as const,
        parties: ["South Africa", "Israel"],
        documentType: "order" as const,
        bodyText: "The Court finds that provisional measures are necessary.",
        keyRulings: ["Provisional measures granted."],
        legalBasis: ["Genocide Convention"],
        nextSteps: ["Israel shall report within one month."],
        language: "en",
      };

      const result = await collector.normalize(rawDoc);

      expect(result.title).toBe("Test ICJ Order");
      expect(result.url).toBe("https://www.icj-cij.org/node/203455");
      expect(result.metadata.court).toBe("ICJ");
    });

    it("throws ValidationError for invalid documents", async () => {
      const invalidDoc = {
        url: "",
        title: "",
        court: "ICJ" as const,
        parties: [],
        documentType: "order" as const,
        bodyText: "",
        keyRulings: [],
        legalBasis: [],
        nextSteps: [],
        language: "en",
      };

      await expect(collector.normalize(invalidDoc)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("error handling", () => {
    it("returns failed result for 404 responses", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Not Found"),
      });

      const result = await collector.collect();
      expect(result.success).toBe(false);
      expect(result.itemsFetched).toBe(0);
    });

    it("returns failed result for 503 service unavailable", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: () => Promise.resolve("Service Unavailable"),
      });

      const result = await collector.collect();
      expect(result.success).toBe(false);
    });
  });

  describe("url classification", () => {
    it("recognizes node URLs as document URLs", async () => {
      const docCollector = new ICJCollector(
        makeSource({ url: "https://www.icj-cij.org/node/203455" }),
        config,
        storage,
        rateLimiter,
      );

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(icjOrderHtml),
      });

      const result = await docCollector.fetch();
      expect(result).toHaveLength(1);
    });
  });
});
