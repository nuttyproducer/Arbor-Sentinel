import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AcademicCollector } from "../AcademicCollector";
import { RateLimiter } from "../../rateLimiter";
import { DevMemoryStore } from "../../store";
import { mockCrossRefResponse } from "../mockData";
import type { SourceRecord, SourceType } from "../../../../types/content";
import type { CollectorConfig } from "../../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../types";

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "ssrn",
    slug: "ssrn",
    title: "SSRN Human Rights",
    publisher: "SSRN",
    sourceType: "academic" as SourceType,
    url: "https://papers.ssrn.com/sol3/Jeljour_results.cfm?form_name=journalBrowse&journal_id=1234567",
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
    sourceId: "ssrn",
    label: "AcademicCollector",
    sourceType: "academic" as SourceType,
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

describe("AcademicCollector", () => {
  let source: SourceRecord;
  let config: CollectorConfig;
  let storage: DevMemoryStore;
  let rateLimiter: RateLimiter;
  let collector: AcademicCollector;

  beforeEach(() => {
    source = makeSource();
    config = makeConfig();
    storage = new DevMemoryStore();
    rateLimiter = new RateLimiter();
    collector = new AcademicCollector(source, config, storage, rateLimiter);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    rateLimiter.reset();
  });

  describe("normalize", () => {
    it("normalizes an academic item with DOI and enriches metadata", async () => {
      const rawItem = {
        title: "International Humanitarian Law and Armed Conflict",
        url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=123456",
        description: "A review of state practice in IHL compliance.",
        publishedAt: "2026-06-15",
        author: "Sarah Johnson, Michael Chen",
        categories: ["International Law"],
        guid: "10.1234/hilj.2026.001",
        feedTitle: "SSRN Human Rights",
      };

      const result = await collector.normalize(rawItem);

      expect(result.title).toContain("International Humanitarian Law");
      expect(result.metadata.contentType).toBe("academic_paper");
      expect(result.tags).toContain("academic");
      expect(result.tags).toContain("analysis");
    });

    it("extracts DOI from guid when present", async () => {
      const rawItem = {
        title: "Test Paper",
        url: "https://example.com/paper",
        description: "Test abstract.",
        publishedAt: "2026-01-01",
        author: "Author Name",
        categories: ["Law"],
        guid: "10.1234/test.2026",
        feedTitle: "Test Journal",
      };

      const result = await collector.normalize(rawItem);

      expect(result.metadata.doi).toBe("10.1234/test.2026");
    });

    it("labels items without OA URL as subscription-only", async () => {
      const rawItem = {
        title: "Paywalled Paper",
        url: "https://www.jstor.org/stable/123456",
        description: "An important legal analysis behind a paywall.",
        publishedAt: "2026-03-01",
        author: "Researcher",
        categories: ["International Law"],
        guid: "paywall-001",
        feedTitle: "Law Review",
      };

      const result = await collector.normalize(rawItem);

      // No OA URL set
      expect(result.metadata.openAccessUrl).toBeUndefined();
      // Should be marked subscription-only since no OA link
      expect(result.tags).toContain("subscription-required");
    });

    it("handles items with minimal fields gracefully", async () => {
      const rawItem = {
        title: "Minimal Paper",
        url: "https://example.com/minimal",
        description: "",
        categories: [],
        feedTitle: "Minimal Feed",
      };

      const result = await collector.normalize(rawItem);

      expect(result.title).toBe("Minimal Paper");
      expect(result.metadata.contentType).toBe("academic_paper");
      expect(result.body).toBe("");
    });
  });

  describe("CrossRef enrichment", () => {
    it("enriches item metadata from CrossRef API response", async () => {
      // Mock CrossRef API response
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockCrossRefResponse),
      });

      const rawItem = {
        title: "Original Feed Title",
        url: "https://doi.org/10.1234/hilj.2026.001",
        description: "Feed description.",
        publishedAt: "2026-06-15",
        author: "Feed Author",
        categories: ["International Law"],
        guid: "10.1234/hilj.2026.001",
        feedTitle: "SSRN",
      };

      const result = await collector.normalize(rawItem);

      // CrossRef title should override feed title if available
      expect(result.metadata.doi).toBe("10.1234/hilj.2026.001");
      expect(result.metadata.publicationVenue).toBeDefined();
    });

    it("handles CrossRef API timeout gracefully", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Timeout"));

      const rawItem = {
        title: "Test Paper",
        url: "https://doi.org/10.1234/test.2026",
        description: "Test.",
        categories: [],
        guid: "10.1234/test.2026",
        feedTitle: "Test",
      };

      // Should not throw — degrades gracefully without enrichment
      const result = await collector.normalize(rawItem);
      expect(result.title).toBe("Test Paper");
      expect(result.metadata.doi).toBe("10.1234/test.2026");
    });
  });
});
