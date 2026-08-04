import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BtselemCollector } from "../BtselemCollector";
import { RateLimiter } from "../../rateLimiter";
import { DevMemoryStore } from "../../store";
import { ValidationError } from "../../errors";
import { btselemTestimonyHtml } from "../mockData";
import type { SourceRecord, SourceType } from "../../../../types/content";
import type { CollectorConfig } from "../../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../types";

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "btselem-test",
    slug: "btselem-test",
    title: "B'Tselem",
    publisher: "B'Tselem",
    sourceType: "ngo" as SourceType,
    url: "https://www.btselem.org/testimonies/20260503-displacement",
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
    sourceId: "btselem-test",
    label: "BtselemCollector",
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

describe("BtselemCollector", () => {
  let source: SourceRecord;
  let config: CollectorConfig;
  let storage: DevMemoryStore;
  let rateLimiter: RateLimiter;
  let collector: BtselemCollector;

  beforeEach(() => {
    source = makeSource();
    config = makeConfig();
    storage = new DevMemoryStore();
    rateLimiter = new RateLimiter();
    collector = new BtselemCollector(source, config, storage, rateLimiter);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    rateLimiter.reset();
  });

  describe("fetch", () => {
    it("fetches and parses a B'Tselem testimony from HTML", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(btselemTestimonyHtml),
      });

      const result = await collector.fetch();
      expect(result).toHaveLength(1);
      const doc = result[0] as Record<string, unknown>;
      expect(doc.organization).toBe("B'Tselem");
      expect(doc.reportType).toBe("testimony_summary");
      expect(doc.title).toContain("Testimony");
    });

    it("detects video documentation from URL", async () => {
      const videoSource = makeSource({
        url: "https://www.btselem.org/video/20260501-gaza-footage",
      });
      const videoCollector = new BtselemCollector(videoSource, config, storage, rateLimiter);

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(
          `<html><head><title>Video: Footage from Gaza | B'Tselem</title></head>
           <body><article><div class="video-description"><p>12-minute video documentation.</p></div></article></body></html>`,
        ),
      });

      const result = await videoCollector.fetch();
      const doc = result[0] as Record<string, unknown>;
      expect(doc.reportType).toBe("video_documentation");
    });
  });

  describe("normalize", () => {
    it("normalizes a raw B'Tselem testimony through NGONormalizer", async () => {
      const rawDoc = {
        url: "https://www.btselem.org/testimonies/20260503-displacement",
        title: "Testimony: A family's displacement",
        organization: "B'Tselem",
        reportType: "testimony_summary" as const,
        date: "2026-05-03",
        bodyText: '"We received a warning to evacuate, but there was nowhere to go."',
        keyFindings: ["Family displaced from northern Gaza, father killed in UN school strike"],
        legalReferences: [],
        language: "en",
        isOfficialSource: false,
      };

      const result = await collector.normalize(rawDoc);
      expect(result.title).toContain("family's displacement");
      expect(result.metadata.organization).toBe("B'Tselem");
    });

    it("throws ValidationError for missing body text", async () => {
      const invalidDoc = {
        url: "https://www.btselem.org/testimony",
        title: "Testimony",
        organization: "B'Tselem",
        reportType: "testimony_summary" as const,
        bodyText: "",
        keyFindings: [],
        legalReferences: [],
        language: "en",
        isOfficialSource: false,
      };

      await expect(collector.normalize(invalidDoc)).rejects.toThrow(ValidationError);
    });
  });
});
