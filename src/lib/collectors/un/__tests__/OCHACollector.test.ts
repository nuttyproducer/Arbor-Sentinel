import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OCHACollector } from "../OCHACollector";
import { RateLimiter } from "../../rateLimiter";
import { DevMemoryStore } from "../../store";
import { ValidationError } from "../../errors";
import { ochaRssXml } from "../mockData";
import type { SourceRecord, SourceType } from "../../../../types/content";
import type { CollectorConfig } from "../../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../types";

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "ocha-test", slug: "ocha-test", title: "OCHA Test", publisher: "OCHA",
    sourceType: "un" as SourceType, url: "https://www.ochaopt.org/rss.xml",
    accessedAt: "2026-07-31", status: "active", version: 1, correctionUrl: "/corrections",
    trustLevel: 0, healthStatus: "unknown", automationStatus: "manual",
    failureCount: 0, monitoringEnabled: false, ...overrides,
  };
}

function makeConfig(overrides: Partial<CollectorConfig> = {}): CollectorConfig {
  return {
    sourceId: "ocha-test", label: "OCHACollector", sourceType: "un" as SourceType,
    enabled: true, trigger: { type: "manual" as const },
    rateLimit: DEFAULT_RATE_LIMIT, retry: { ...DEFAULT_RETRY_CONFIG, maxRetries: 0 },
    fetchTimeoutMs: 5000, maxContentAgeMs: 24 * 60 * 60 * 1000, storeRawResponse: false, ...overrides,
  };
}

describe("OCHACollector", () => {
  let collector: OCHACollector;
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter();
    collector = new OCHACollector(makeSource(), makeConfig(), new DevMemoryStore(), rateLimiter);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => { vi.unstubAllGlobals(); rateLimiter.reset(); });

  describe("RSS feed support", () => {
    it("parses RSS feed and extracts items", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(ochaRssXml) });
      const result = await collector.fetch();
      expect(result.length).toBeGreaterThanOrEqual(1);
      const doc = result[0] as Record<string, unknown>;
      expect(doc.issuingBody).toBe("OCHA");
      expect(doc.reportType).toBe("humanitarian_update");
      expect(doc.title).toContain("Humanitarian Situation Update");
    });

    it("extracts publication dates from RSS pubDate", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(ochaRssXml) });
      const result = await collector.fetch();
      const doc = result[0] as Record<string, unknown>;
      expect(doc.date).toBeTruthy();
    });

    it("extracts geographic scope from RSS content", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(ochaRssXml) });
      const result = await collector.fetch();
      const doc = result[0] as Record<string, unknown>;
      const scope = doc.geographicScope as string[];
      expect(scope).toContain("Gaza");
    });
  });

  it("normalizes a raw OCHA situation report", async () => {
    const result = await collector.normalize({
      url: "https://test.ochaopt.org/sitrep", title: "Situation Report #180", issuingBody: "OCHA",
      reportType: "situation_report", geographicScope: ["Gaza"], date: "2024-07-12",
      bodyText: "Hostilities continue...", language: "en",
    });
    expect(result.reportType).toBe("situation_report");
    expect(result.issuingBody).toBe("OCHA");
  });

  it("throws ValidationError for invalid OCHA documents", async () => {
    await expect(collector.normalize({ url: "", title: "", issuingBody: "", reportType: "situation_report", geographicScope: [], bodyText: "", language: "en" }))
      .rejects.toThrow(ValidationError);
  });

  it("handles fetch errors", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, status: 503, text: () => Promise.resolve("Unavailable") });
    const result = await collector.collect();
    expect(result.success).toBe(false);
  });
});
