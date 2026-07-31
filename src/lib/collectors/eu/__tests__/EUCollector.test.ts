import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EUCollector } from "../EUCollector";
import { RateLimiter } from "../../rateLimiter";
import { DevMemoryStore } from "../../store";
import { ValidationError } from "../../errors";
import { euCouncilHtml } from "../mockData";
import type { SourceRecord, SourceType } from "../../../../types/content";
import type { CollectorConfig } from "../../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../types";

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "eu-test", slug: "eu-test", title: "EU Test", publisher: "EU",
    sourceType: "government" as SourceType, url: "https://www.consilium.europa.eu/en/press/test",
    accessedAt: "2026-07-31", status: "active", version: 1, correctionUrl: "/corrections",
    trustLevel: 0, healthStatus: "unknown", automationStatus: "manual",
    failureCount: 0, monitoringEnabled: false, ...overrides,
  };
}

function makeConfig(overrides: Partial<CollectorConfig> = {}): CollectorConfig {
  return {
    sourceId: "eu-test", label: "EUCollector", sourceType: "government" as SourceType,
    enabled: true, trigger: { type: "manual" as const },
    rateLimit: DEFAULT_RATE_LIMIT, retry: { ...DEFAULT_RETRY_CONFIG, maxRetries: 0 },
    fetchTimeoutMs: 5000, maxContentAgeMs: 24 * 60 * 60 * 1000, storeRawResponse: false, ...overrides,
  };
}

describe("EUCollector", () => {
  let collector: EUCollector;
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter();
    collector = new EUCollector(makeSource(), makeConfig(), new DevMemoryStore(), rateLimiter);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => { vi.unstubAllGlobals(); rateLimiter.reset(); });

  it("fetches and parses an EU Council conclusion from HTML", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(euCouncilHtml) });
    const result = await collector.fetch();
    expect(result).toHaveLength(1);
    const doc = result[0] as Record<string, unknown>;
    expect(doc.institution).toBe("Council of the European Union");
    expect(doc.documentType).toBe("council_conclusion");
  });

  it("detects Council institution from URL", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(euCouncilHtml) });
    const result = await collector.fetch();
    expect((result[0] as Record<string, unknown>).institution).toContain("Council");
  });

  it("extracts vote tally from resolution text", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(euCouncilHtml) });
    const result = await collector.fetch();
    const doc = result[0] as Record<string, unknown>;
    expect(doc.voteTally).toBeTruthy();
  });

  it("extracts legal basis from HTML", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(euCouncilHtml) });
    const result = await collector.fetch();
    const doc = result[0] as Record<string, unknown>;
    const legalBasis = doc.legalBasis as string[];
    expect(legalBasis.some((b: string) => b.includes("Article 29") || b.includes("Article 215"))).toBe(true);
  });

  it("normalizes a raw EU Council conclusion", async () => {
    const result = await collector.normalize({
      url: "https://test.eu/doc", title: "Council Conclusions", institution: "Council of the European Union",
      legalBasis: ["Article 29 TEU"], governmentLevel: "eu", documentType: "council_conclusion",
      bodyText: "The Council adopted...", language: "en", isAdopted: true,
    });
    expect(result.title).toBe("Council Conclusions");
    expect(result.metadata.institution).toBe("Council of the European Union");
  });

  it("throws ValidationError for invalid documents", async () => {
    await expect(collector.normalize({ url: "", title: "", institution: "", legalBasis: [], governmentLevel: "eu", documentType: "council_conclusion", bodyText: "", language: "en", isAdopted: true }))
      .rejects.toThrow(ValidationError);
  });

  it("handles fetch errors", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, status: 404, text: () => Promise.resolve("Not Found") });
    const result = await collector.collect();
    expect(result.success).toBe(false);
  });
});
