import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { JournalismCollector } from "../JournalismCollector";
import { RateLimiter } from "../../rateLimiter";
import { DevMemoryStore } from "../../store";
import { mockRssItem, mockDuplicateRssItem } from "../mockData";
import type { SourceRecord, SourceType } from "../../../../types/content";
import type { CollectorConfig, CollectedItem } from "../../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../types";

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "reuters",
    slug: "reuters",
    title: "Reuters",
    publisher: "Reuters",
    sourceType: "journalism" as SourceType,
    url: "https://www.reuters.com/arc/outboundfeeds/v3/all/?outputType=xml",
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
    sourceId: "reuters",
    label: "JournalismCollector",
    sourceType: "journalism" as SourceType,
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

describe("JournalismCollector", () => {
  let source: SourceRecord;
  let config: CollectorConfig;
  let storage: DevMemoryStore;
  let rateLimiter: RateLimiter;
  let collector: JournalismCollector;

  beforeEach(() => {
    source = makeSource();
    config = makeConfig();
    storage = new DevMemoryStore();
    rateLimiter = new RateLimiter();
    collector = new JournalismCollector(source, config, storage, rateLimiter);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    rateLimiter.reset();
  });

  describe("normalize", () => {
    it("normalizes a parsed RSS item through MediaNormalizer", async () => {
      const result = await collector.normalize(mockRssItem);

      expect(result.title).toBe("UN Security Council votes on Gaza resolution");
      expect(result.url).toBe("https://www.reuters.com/world/unsc-gaza-resolution-2026-08-01/");
      expect(result.publishedAt).toBe("2026-08-01T09:30:00.000Z");
      expect(result.metadata.byline).toBe("Jane Smith");
      expect(result.metadata.publication).toBe("Reuters World News");
      expect(result.metadata.contentType).toBe("news_report");
      expect(result.metadata.isSubscriptionOnly).toBe(false);
      // Body should be truncated to 280 chars
      expect(result.body.length).toBeLessThanOrEqual(280);
    });

    it("sets accessDate on all normalized items", async () => {
      const result = await collector.normalize(mockRssItem);
      expect(result.metadata.accessDate).toBeDefined();
      // Should be today's date in ISO format
      expect(result.metadata.accessDate).toMatch(/^\d{4}-\d{2}-\d{2}/);
    });

    it("labels opinion content from categories", async () => {
      const opinionItem = {
        ...mockRssItem,
        categories: ["Opinion", "Commentary"],
      };

      const result = await collector.normalize(opinionItem);
      expect(result.metadata.contentType).toBe("opinion");
      expect(result.tags).toContain("opinion");
    });
  });

  describe("duplicate detection", () => {
    it("detects duplicate articles by GUID from different feeds", async () => {
      // Normalize and save the first item
      const normalized1 = await collector.normalize(mockRssItem);
      const fingerprint = `${mockRssItem.url}|${mockRssItem.title}|${mockRssItem.publishedAt ?? ""}`;
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        hash = (hash << 5) - hash + fingerprint.charCodeAt(i);
        hash = hash & hash;
      }
      const fp = `${source.id}:${Math.abs(hash).toString(36)}`;

      await storage.save({
        fingerprint: fp,
        raw: mockRssItem,
        normalized: normalized1,
        sourceId: source.id,
        fetchedAt: new Date().toISOString(),
        url: mockRssItem.url,
      });

      // Same URL and GUID — should be detected as duplicate
      const exists = await storage.exists(fp);
      expect(exists).toBe(true);
    });

    it("detects the same article from a different feed by URL", async () => {
      const normalized1 = await collector.normalize(mockRssItem);
      await storage.save({
        fingerprint: "reuters:first",
        raw: mockRssItem,
        normalized: normalized1,
        sourceId: source.id,
        fetchedAt: new Date().toISOString(),
        url: mockRssItem.url,
      });

      // Same article surfaced from a different feed — same URL and GUID
      const normalized2 = await collector.normalize(mockDuplicateRssItem);
      const second: CollectedItem = {
        fingerprint: "reuters:second",
        raw: mockDuplicateRssItem,
        normalized: normalized2,
        sourceId: source.id,
        fetchedAt: new Date().toISOString(),
        url: mockDuplicateRssItem.url,
      };

      expect(await collector.isDuplicate(second)).toBe(true);
    });

    it("detects duplicates by GUID even when the URL differs", async () => {
      const storedItem = {
        ...mockRssItem,
        url: "https://www.reuters.com/world/alternate-url/",
      };
      await storage.save({
        fingerprint: "reuters:guid-first",
        raw: storedItem,
        normalized: await collector.normalize(storedItem),
        sourceId: source.id,
        fetchedAt: new Date().toISOString(),
        url: storedItem.url,
      });

      const candidate = await collector.normalize(mockRssItem);
      const second: CollectedItem = {
        fingerprint: "reuters:guid-second",
        raw: mockRssItem,
        normalized: candidate,
        sourceId: source.id,
        fetchedAt: new Date().toISOString(),
        url: mockRssItem.url,
      };

      // Same GUID, different URL — should still be flagged as a duplicate
      expect(await collector.isDuplicate(second)).toBe(true);
    });
  });

  describe("collect pipeline", () => {
    // Builds a single-item feed. `url` and `guid` drive the dedup checks:
    // the fingerprint is url|title|publishedAt, so two items with the same
    // GUID but different URLs are only catchable by the isDuplicate override.
    function makeFeed(url: string, guid: string): string {
      return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Reuters World News</title>
    <link>https://www.reuters.com/world</link>
    <description>Reuters world news feed</description>
    <language>en</language>
    <item>
      <title>UN Security Council votes on Gaza resolution</title>
      <link>${url}</link>
      <description>The UN Security Council voted today on a resolution concerning the humanitarian situation in Gaza.</description>
      <pubDate>Mon, 01 Aug 2026 09:30:00 GMT</pubDate>
      <author>reuters@reuters.com (Jane Smith)</author>
      <category>World</category>
      <guid isPermaLink="false">${guid}</guid>
    </item>
  </channel>
</rss>`;
    }

    const originalUrl = "https://www.reuters.com/world/unsc-gaza-resolution-2026-08-01/";
    const syndicatedUrl = "https://www.reuters.com/world/unsc-gaza-resolution-2026-08-01/alternate";

    it("deduplicates a GUID-matching item found via a different URL on a later run", async () => {
      const fetchMock = fetch as ReturnType<typeof vi.fn>;

      // Run 1: article discovered via its canonical URL.
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(makeFeed(originalUrl, "reuters-gaza-2026-08-01")),
      });
      const result1 = await collector.collect();
      expect(result1.success).toBe(true);
      expect(result1.itemsStored).toBe(1);

      // Run 2: same article surfaced under a different URL — different
      // fingerprint, but the isDuplicate GUID check should catch it.
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(makeFeed(syndicatedUrl, "reuters-gaza-2026-08-01")),
      });
      const result2 = await collector.collect();
      expect(result2.success).toBe(true);
      expect(result2.itemsStored).toBe(0);
      expect(result2.itemsDeduplicated).toBe(0);

      // Only the canonical occurrence was stored.
      const stored = await storage.getBySource(source.id);
      expect(stored).toHaveLength(1);
      expect(stored[0].url).toBe(originalUrl);
    });

    it("stores a later item when the GUID differs from what is stored", async () => {
      const fetchMock = fetch as ReturnType<typeof vi.fn>;

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(makeFeed(originalUrl, "reuters-gaza-2026-08-01")),
      });
      const result1 = await collector.collect();
      expect(result1.itemsStored).toBe(1);

      // Distinct GUID + distinct URL → genuine new article, must be stored.
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(makeFeed(syndicatedUrl, "reuters-gaza-alternate-2026-08-01")),
      });
      const result2 = await collector.collect();
      expect(result2.success).toBe(true);
      expect(result2.itemsStored).toBe(1);
      expect(result2.itemsDeduplicated).toBe(1);

      const stored = await storage.getBySource(source.id);
      expect(stored).toHaveLength(2);
    });
  });

  describe("error handling", () => {
    it("handles items with no description gracefully", async () => {
      const noDesc = { ...mockRssItem, description: "" };
      const result = await collector.normalize(noDesc);
      expect(result.body).toBe("");
    });

    it("handles items with no author gracefully", async () => {
      const noAuthor = { ...mockRssItem, author: undefined };
      const result = await collector.normalize(noAuthor);
      expect(result.metadata.byline).toBeUndefined();
    });
  });
});
