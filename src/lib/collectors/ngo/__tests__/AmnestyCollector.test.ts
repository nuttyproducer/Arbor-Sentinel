import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AmnestyCollector } from "../AmnestyCollector";
import { RateLimiter } from "../../rateLimiter";
import { DevMemoryStore } from "../../store";
import { ValidationError } from "../../errors";
import { amnestyResearchReportHtml, amnestyPressReleaseHtml } from "../mockData";
import type { SourceRecord, SourceType } from "../../../../types/content";
import type { CollectorConfig } from "../../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../types";

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "amnesty-test",
    slug: "amnesty-test",
    title: "Amnesty International",
    publisher: "Amnesty International",
    sourceType: "ngo" as SourceType,
    url: "https://www.amnesty.org/en/latest/news/2026/07/gaza-human-rights-report/",
    accessedAt: "2026-08-01",
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
    sourceId: "amnesty-test",
    label: "AmnestyCollector",
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

describe("AmnestyCollector", () => {
  let source: SourceRecord;
  let config: CollectorConfig;
  let storage: DevMemoryStore;
  let rateLimiter: RateLimiter;
  let collector: AmnestyCollector;

  beforeEach(() => {
    source = makeSource();
    config = makeConfig();
    storage = new DevMemoryStore();
    rateLimiter = new RateLimiter();
    collector = new AmnestyCollector(source, config, storage, rateLimiter);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    rateLimiter.reset();
  });

  describe("fetch", () => {
    it("fetches and parses an Amnesty research report from HTML", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(amnestyResearchReportHtml),
      });

      const result = await collector.fetch();
      expect(result).toHaveLength(1);
      const doc = result[0] as Record<string, unknown>;
      expect(doc.organization).toBe("Amnesty International");
      expect(doc.reportType).toBe("research_report");
      expect(doc.title).toContain("Gaza: Humanitarian Crisis Deepens");
    });

    it("detects press release document type from URL patterns", async () => {
      const pressSource = makeSource({ url: "https://www.amnesty.org/en/latest/press-releases/2026/02/israel-must-comply/" });
      const pressCollector = new AmnestyCollector(pressSource, config, storage, rateLimiter);

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(amnestyPressReleaseHtml),
      });

      const result = await pressCollector.fetch();
      const doc = result[0] as Record<string, unknown>;
      expect(doc.reportType).toBe("press_release");
    });
  });

  describe("normalize", () => {
    it("normalizes a raw Amnesty document through NGONormalizer", async () => {
      const rawDoc = {
        url: "https://www.amnesty.org/en/latest/news/2026/07/gaza-report/",
        title: "Gaza Report",
        organization: "Amnesty International",
        reportType: "research_report" as const,
        date: "2026-07-15",
        bodyText: "Research findings on Gaza.",
        summaryText: "New research documents IHL violations.",
        methodology: "Interviews and satellite imagery.",
        keyFindings: ["Finding 1: Violations documented."],
        geographicScope: ["Gaza Strip"],
        legalReferences: ["Geneva Convention IV"],
        language: "en",
        isOfficialSource: false,
      };

      const result = await collector.normalize(rawDoc);
      expect(result.title).toBe("Gaza Report");
      expect(result.metadata.organization).toBe("Amnesty International");
      expect(result.metadata.isOfficialSource).toBe(false);
    });

    it("throws ValidationError for invalid documents", async () => {
      const invalidDoc = {
        url: "",
        title: "",
        organization: "",
        reportType: "research_report" as const,
        bodyText: "",
        keyFindings: [],
        legalReferences: [],
        language: "en",
        isOfficialSource: false,
      };

      await expect(collector.normalize(invalidDoc)).rejects.toThrow(ValidationError);
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

    it("returns failed result for 503 responses", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: () => Promise.resolve("Service Unavailable"),
      });

      const result = await collector.collect();
      expect(result.success).toBe(false);
    });
  });
});
