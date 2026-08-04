import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MSFCollector } from "../MSFCollector";
import { RateLimiter } from "../../rateLimiter";
import { DevMemoryStore } from "../../store";
import { ValidationError } from "../../errors";
import { msfFieldReportHtml } from "../mockData";
import type { SourceRecord, SourceType } from "../../../../types/content";
import type { CollectorConfig } from "../../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../types";

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "msf-test",
    slug: "msf-test",
    title: "Médecins Sans Frontières",
    publisher: "Médecins Sans Frontières",
    sourceType: "ngo" as SourceType,
    url: "https://www.msf.org/gaza-medical-teams-overwhelmed-2026",
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
    sourceId: "msf-test",
    label: "MSFCollector",
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

describe("MSFCollector", () => {
  let source: SourceRecord;
  let config: CollectorConfig;
  let storage: DevMemoryStore;
  let rateLimiter: RateLimiter;
  let collector: MSFCollector;

  beforeEach(() => {
    source = makeSource();
    config = makeConfig();
    storage = new DevMemoryStore();
    rateLimiter = new RateLimiter();
    collector = new MSFCollector(source, config, storage, rateLimiter);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    rateLimiter.reset();
  });

  describe("fetch", () => {
    it("fetches and parses an MSF field report from HTML", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(msfFieldReportHtml),
      });

      const result = await collector.fetch();
      expect(result).toHaveLength(1);
      const doc = result[0] as Record<string, unknown>;
      expect(doc.organization).toBe("Médecins Sans Frontières");
      expect(doc.reportType).toBe("field_report");
      expect(doc.title).toContain("Medical teams overwhelmed");
    });

    it("detects press release from URL", async () => {
      const pressSource = makeSource({
        url: "https://www.msf.org/press-release/gaza-medical-response-2026",
      });
      const pressCollector = new MSFCollector(pressSource, config, storage, rateLimiter);

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(
          `<html><head><title>MSF Press Release: Medical Response | MSF</title></head>
           <body><article><div class="body"><p>MSF press statement.</p></div></article></body></html>`,
        ),
      });

      const result = await pressCollector.fetch();
      const doc = result[0] as Record<string, unknown>;
      expect(doc.reportType).toBe("press_release");
    });
  });

  describe("normalize", () => {
    it("normalizes an MSF field report through NGONormalizer", async () => {
      const rawDoc = {
        url: "https://www.msf.org/gaza-medical-teams-2026",
        title: "Gaza: Medical teams overwhelmed",
        organization: "Médecins Sans Frontières",
        reportType: "field_report" as const,
        date: "2026-07-20",
        bodyText: "MSF teams in Gaza report overwhelming numbers of trauma patients.",
        summaryText: "Medical teams overwhelmed as casualties mount.",
        keyFindings: ["Al-Aqsa Hospital received 200+ patients in 48 hours"],
        legalReferences: [],
        language: "en",
        isOfficialSource: false,
      };

      const result = await collector.normalize(rawDoc);
      expect(result.metadata.organization).toBe("Médecins Sans Frontières");
      expect(result.metadata.reportType).toBe("field_report");
    });

    it("throws ValidationError for missing organization", async () => {
      const invalidDoc = {
        url: "https://www.msf.org/report",
        title: "Report",
        organization: "",
        reportType: "field_report" as const,
        bodyText: "Content.",
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
