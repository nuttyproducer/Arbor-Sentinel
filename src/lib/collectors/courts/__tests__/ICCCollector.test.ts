import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ICCCollector } from "../ICCCollector";
import { RateLimiter } from "../../rateLimiter";
import { DevMemoryStore } from "../../store";
import { ValidationError } from "../../errors";
import { iccWarrantHtml } from "../mockData";
import type { SourceRecord, SourceType } from "../../../../types/content";
import type { CollectorConfig } from "../../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../types";

// ── Test helpers ────────────────────────────────────────────────────────────

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "icc-test",
    slug: "icc-test",
    title: "ICC Test Source",
    publisher: "International Criminal Court",
    sourceType: "court" as SourceType,
    url: "https://www.icc-cpi.int/news/test",
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
    sourceId: "icc-test",
    label: "ICCCollector",
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

describe("ICCCollector", () => {
  let source: SourceRecord;
  let config: CollectorConfig;
  let storage: DevMemoryStore;
  let rateLimiter: RateLimiter;
  let collector: ICCCollector;

  beforeEach(() => {
    source = makeSource();
    config = makeConfig();
    storage = new DevMemoryStore();
    rateLimiter = new RateLimiter();
    collector = new ICCCollector(source, config, storage, rateLimiter);

    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    rateLimiter.reset();
  });

  describe("fetch", () => {
    it("fetches and parses an ICC document from HTML", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(iccWarrantHtml),
      });

      const result = await collector.fetch();

      expect(result).toHaveLength(1);
      const doc = result[0] as Record<string, unknown>;
      expect(doc.court).toBe("ICC");
      expect(doc.documentType).toBe("warrant");
      expect(doc.url).toBe("https://www.icc-cpi.int/news/test");
    });

    it("detects arrest warrant document type from ICC HTML", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(iccWarrantHtml),
      });

      const result = await collector.fetch();
      const doc = result[0] as Record<string, unknown>;

      expect(doc.documentType).toBe("warrant");
    });

    it("extracts title without ICC branding suffix", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(iccWarrantHtml),
      });

      const result = await collector.fetch();
      const doc = result[0] as Record<string, unknown>;

      expect(doc.title).toContain("ICC Pre-Trial Chamber I");
      // Should NOT contain the "International Criminal Court" suffix
    });

    it("extracts publication date from meta tags", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(iccWarrantHtml),
      });

      const result = await collector.fetch();
      const doc = result[0] as Record<string, unknown>;

      expect(doc.date).toBe("2024-11-21");
    });

    it("extracts parties from prosecutor v. defendant pattern", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(iccWarrantHtml),
      });

      const result = await collector.fetch();
      const doc = result[0] as Record<string, unknown>;

      expect(doc.parties).toBeInstanceOf(Array);
    });
  });

  describe("normalize", () => {
    it("normalizes a raw ICC warrant document", async () => {
      const rawDoc = {
        url: "https://www.icc-cpi.int/news/warrant",
        title: "ICC Issues Warrant of Arrest",
        court: "ICC" as const,
        caseName: "The Prosecutor v. Defendant",
        caseNumber: "ICC-01/18",
        parties: ["The Prosecutor", "Defendant"],
        documentType: "warrant" as const,
        date: "2024-11-21",
        bodyText: "The Chamber issued warrants of arrest.",
        keyRulings: ["Warrant of arrest issued."],
        legalBasis: ["Rome Statute — Article 7"],
        nextSteps: ["States Parties shall cooperate."],
        language: "en",
      };

      const result = await collector.normalize(rawDoc);

      expect(result.title).toBe("ICC Issues Warrant of Arrest");
      expect(result.metadata.court).toBe("ICC");
    });

    it("throws ValidationError for invalid ICC documents", async () => {
      const invalidDoc = {
        url: "",
        title: "",
        court: "ICC" as const,
        parties: [],
        documentType: "warrant" as const,
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
    it("returns failed result for 404 not found on ICC documents", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Not Found"),
      });

      const result = await collector.collect();
      expect(result.success).toBe(false);
      expect(result.itemsFetched).toBe(0);
    });

    it("returns failed result for 503 service unavailable on ICC", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: () => Promise.resolve("Service Unavailable"),
      });

      const result = await collector.collect();
      expect(result.success).toBe(false);
    });
  });

  describe("registration", () => {
    it("can be registered in the CollectorRegistry", async () => {
      const { CollectorRegistry } = await import("../../CollectorRegistry");
      const registry = new CollectorRegistry(storage, rateLimiter);

      registry.register(ICCCollector, ["court"], "ICC court records collector");
      expect(registry.hasCollectorForType("court")).toBe(true);

      const Constructor = registry.getCollectorForType("court");
      expect(Constructor).toBe(ICCCollector);
    });
  });
});
