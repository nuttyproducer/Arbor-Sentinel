import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HRWCollector } from "../HRWCollector";
import { RateLimiter } from "../../rateLimiter";
import { DevMemoryStore } from "../../store";
import { ValidationError } from "../../errors";
import { hrwDetailedReportHtml } from "../mockData";
import type { SourceRecord, SourceType } from "../../../../types/content";
import type { CollectorConfig } from "../../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../types";

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "hrw-test",
    slug: "hrw-test",
    title: "Human Rights Watch",
    publisher: "Human Rights Watch",
    sourceType: "ngo" as SourceType,
    url: "https://www.hrw.org/report/2026/06/20/gaza-unlawful-attacks",
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
    sourceId: "hrw-test",
    label: "HRWCollector",
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

describe("HRWCollector", () => {
  let source: SourceRecord;
  let config: CollectorConfig;
  let storage: DevMemoryStore;
  let rateLimiter: RateLimiter;
  let collector: HRWCollector;

  beforeEach(() => {
    source = makeSource();
    config = makeConfig();
    storage = new DevMemoryStore();
    rateLimiter = new RateLimiter();
    collector = new HRWCollector(source, config, storage, rateLimiter);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    rateLimiter.reset();
  });

  describe("fetch", () => {
    it("fetches and parses an HRW detailed report from HTML", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(hrwDetailedReportHtml),
      });

      const result = await collector.fetch();
      expect(result).toHaveLength(1);
      const doc = result[0] as Record<string, unknown>;
      expect(doc.organization).toBe("Human Rights Watch");
      expect(doc.reportType).toBe("research_report");
      expect(doc.title).toContain("Unlawful Attacks");
    });

    it("detects multimedia documentation from URL", async () => {
      const multiSource = makeSource({
        url: "https://www.hrw.org/video-photos/video/2026/gaza-destruction",
      });
      const multiCollector = new HRWCollector(multiSource, config, storage, rateLimiter);

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(
          `<html><head><title>Video: Documenting Destruction | Human Rights Watch</title></head>
           <body><article><div class="body-content"><p>Video investigation of damage.</p></div></article></body></html>`,
        ),
      });

      const result = await multiCollector.fetch();
      const doc = result[0] as Record<string, unknown>;
      expect(doc.reportType).toBe("multimedia_documentation");
    });
  });

  describe("normalize", () => {
    it("normalizes a raw HRW document through NGONormalizer", async () => {
      const rawDoc = {
        url: "https://www.hrw.org/report/2026/gaza-unlawful-attacks",
        title: "Gaza: Unlawful Attacks",
        organization: "Human Rights Watch",
        reportType: "research_report" as const,
        date: "2026-06-20",
        bodyText: "HRW documented 15 incidents.",
        summaryText: "HRW investigation documents unlawful attacks.",
        methodology: "Field investigations and witness interviews.",
        keyFindings: ["Finding 1: Unlawful attacks documented."],
        geographicScope: ["Gaza Strip"],
        legalReferences: ["Geneva Convention IV"],
        language: "en",
        isOfficialSource: false,
      };

      const result = await collector.normalize(rawDoc);
      expect(result.title).toBe("Gaza: Unlawful Attacks");
      expect(result.metadata.organization).toBe("Human Rights Watch");
    });

    it("throws ValidationError for missing body text", async () => {
      const invalidDoc = {
        url: "https://www.hrw.org/report",
        title: "Report",
        organization: "Human Rights Watch",
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
    });
  });
});
