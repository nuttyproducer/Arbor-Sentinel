import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OHCHRCollector } from "../OHCHRCollector";
import { RateLimiter } from "../../rateLimiter";
import { DevMemoryStore } from "../../store";
import { ValidationError } from "../../errors";
import { ohchrCoiHtml } from "../mockData";
import type { SourceRecord, SourceType } from "../../../../types/content";
import type { CollectorConfig } from "../../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../types";

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "ohchr-test", slug: "ohchr-test", title: "OHCHR Test", publisher: "OHCHR",
    sourceType: "un" as SourceType, url: "https://www.ohchr.org/en/documents/reports/test",
    accessedAt: "2026-07-31", status: "active", version: 1, correctionUrl: "/corrections",
    trustLevel: 0, healthStatus: "unknown", automationStatus: "manual",
    failureCount: 0, monitoringEnabled: false, ...overrides,
  };
}

function makeConfig(overrides: Partial<CollectorConfig> = {}): CollectorConfig {
  return {
    sourceId: "ohchr-test", label: "OHCHRCollector", sourceType: "un" as SourceType,
    enabled: true, trigger: { type: "manual" as const },
    rateLimit: DEFAULT_RATE_LIMIT, retry: { ...DEFAULT_RETRY_CONFIG, maxRetries: 0 },
    fetchTimeoutMs: 5000, maxContentAgeMs: 24 * 60 * 60 * 1000, storeRawResponse: false, ...overrides,
  };
}

describe("OHCHRCollector", () => {
  let collector: OHCHRCollector;
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter();
    collector = new OHCHRCollector(makeSource(), makeConfig(), new DevMemoryStore(), rateLimiter);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => { vi.unstubAllGlobals(); rateLimiter.reset(); });

  it("fetches and parses an OHCHR COI report from HTML", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(ohchrCoiHtml) });
    const result = await collector.fetch();
    expect(result).toHaveLength(1);
    const doc = result[0] as Record<string, unknown>;
    expect(doc.issuingBody).toBe("Commission of Inquiry");
    expect(doc.reportType).toBe("coi_report");
    expect(doc.title).toContain("Commission of Inquiry");
  });

  it("detects Commission of Inquiry report type", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(ohchrCoiHtml) });
    const result = await collector.fetch();
    expect((result[0] as Record<string, unknown>).reportType).toBe("coi_report");
  });

  it("normalizes a raw OHCHR document", async () => {
    const result = await collector.normalize({
      url: "https://test.ohchr.org/report", title: "COI Report", issuingBody: "Commission of Inquiry",
      reportType: "coi_report", geographicScope: ["Palestine"], bodyText: "Findings...", language: "en",
    });
    expect(result.title).toBe("COI Report");
    expect(result.metadata.issuingBody).toBe("Commission of Inquiry");
  });

  it("throws ValidationError for invalid OHCHR documents", async () => {
    await expect(collector.normalize({ url: "", title: "", issuingBody: "", reportType: "coi_report", geographicScope: [], bodyText: "", language: "en" }))
      .rejects.toThrow(ValidationError);
  });

  it("handles fetch errors", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, status: 404, text: () => Promise.resolve("Not Found") });
    const result = await collector.collect();
    expect(result.success).toBe(false);
  });
});
