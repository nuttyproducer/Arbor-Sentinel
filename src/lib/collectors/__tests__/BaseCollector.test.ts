import { describe, it, expect, vi, beforeEach } from "vitest";
import { BaseCollector } from "../BaseCollector";
import { RateLimiter } from "../rateLimiter";
import { DevMemoryStore } from "../store";
import { FetchError, ParseError, TimeoutError } from "../errors";
import type { SourceRecord, SourceType } from "../../../types/content";
import type { CollectorConfig, NormalizedContent } from "../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../types";

// ── Test helpers ────────────────────────────────────────────────────────────

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    id: "test-source-1",
    slug: "test-source",
    title: "Test Source",
    publisher: "Test Publisher",
    sourceType: "court" as SourceType,
    url: "https://example.com/source",
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
    sourceId: "test-source-1",
    label: "TestCollector",
    sourceType: "court" as SourceType,
    enabled: true,
    trigger: { type: "manual" },
    rateLimit: DEFAULT_RATE_LIMIT,
    retry: { ...DEFAULT_RETRY_CONFIG, maxRetries: 0 },
    fetchTimeoutMs: 5000,
    maxContentAgeMs: 24 * 60 * 60 * 1000,
    storeRawResponse: false,
    ...overrides,
  };
}

// ── Concrete subclass for testing ───────────────────────────────────────────

class TestCollector extends BaseCollector {
  public fetchResult: unknown[] = [{ id: 1, title: "Test item" }];
  public fetchCallCount = 0;
  public validateCallCount = 0;
  public normalizeCallCount = 0;
  public pipelineCallOrder: string[] = [];
  public shouldFailFetch = false;
  public shouldFailTimeout = false;
  public shouldFailValidate = false;
  public validateReturnValue = true;

  async fetch(): Promise<unknown[]> {
    this.fetchCallCount++;
    this.pipelineCallOrder.push("fetch");
    if (this.shouldFailFetch) {
      throw new FetchError("Fetch failed", {
        sourceId: this.source.id,
        url: this.source.url,
        attempt: 1,
      });
    }
    if (this.shouldFailTimeout) {
      // Simulate a timeout by never resolving
      return new Promise(() => {});
    }
    return this.fetchResult;
  }

  async validate(raw: unknown): Promise<boolean> {
    this.validateCallCount++;
    this.pipelineCallOrder.push("validate");
    if (this.shouldFailValidate) {
      throw new ParseError("Validation failed", {
        sourceId: this.source.id,
        attempt: 1,
      });
    }
    return this.validateReturnValue;
  }

  async normalize(raw: unknown): Promise<NormalizedContent> {
    this.normalizeCallCount++;
    this.pipelineCallOrder.push("normalize");
    const item = raw as Record<string, unknown>;
    return {
      title: (item.title as string) || "",
      body: JSON.stringify(item),
      url: this.source.url,
      tags: [],
      metadata: {},
    };
  }
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("BaseCollector", () => {
  let source: SourceRecord;
  let config: CollectorConfig;
  let storage: DevMemoryStore;
  let rateLimiter: RateLimiter;
  let collector: TestCollector;

  beforeEach(() => {
    source = makeSource();
    config = makeConfig();
    storage = new DevMemoryStore();
    rateLimiter = new RateLimiter();
    collector = new TestCollector(source, config, storage, rateLimiter);
  });

  describe("pipeline execution order", () => {
    it("executes pipeline stages in correct order", async () => {
      const result = await collector.collect();

      expect(collector.pipelineCallOrder).toEqual([
        "fetch",
        "validate",
        "normalize",
      ]);
      expect(result.success).toBe(true);
    });

    it("calls each pipeline stage the correct number of times", async () => {
      collector.fetchResult = [{ id: 1 }, { id: 2 }, { id: 3 }];

      await collector.collect();

      expect(collector.fetchCallCount).toBe(1);
      expect(collector.validateCallCount).toBe(3);
      expect(collector.normalizeCallCount).toBe(3);
    });

    it("reports correct counts in result", async () => {
      collector.fetchResult = [{ id: 1 }, { id: 2 }, { id: 3 }];

      const result = await collector.collect();

      expect(result.itemsFetched).toBe(3);
      expect(result.itemsValidated).toBe(3);
      expect(result.itemsNormalized).toBe(3);
      expect(result.itemsStored).toBe(3);
    });

    it("includes run metadata in result", async () => {
      const result = await collector.collect();

      expect(result.runId).toMatch(/^run-\d+/);
      expect(result.sourceId).toBe("test-source-1");
      expect(result.startedAt).toBeTruthy();
      expect(result.completedAt).toBeTruthy();
      expect(result.stageDurations.fetch).toBeGreaterThanOrEqual(0);
      expect(result.stageDurations.validate).toBeGreaterThanOrEqual(0);
      expect(result.stageDurations.normalize).toBeGreaterThanOrEqual(0);
      expect(result.stageDurations.deduplicate).toBeGreaterThanOrEqual(0);
      expect(result.stageDurations.store).toBeGreaterThanOrEqual(0);
    });
  });

  describe("error propagation", () => {
    it("returns failed result on fetch error", async () => {
      collector.shouldFailFetch = true;

      const result = await collector.collect();

      expect(result.success).toBe(false);
      expect(result.itemsFetched).toBe(0);
    });

    it("skips invalid items but continues pipeline", async () => {
      collector.fetchResult = [{ id: 1 }, { id: 2 }, { id: 3 }];
      collector.validateReturnValue = false;

      const result = await collector.collect();

      expect(result.itemsValidated).toBe(0);
      expect(result.itemsNormalized).toBe(0);
      expect(result.itemsStored).toBe(0);
      expect(result.success).toBe(true);
    });

    it("does not call validate after fetch failure", async () => {
      collector.shouldFailFetch = true;

      await collector.collect();

      expect(collector.validateCallCount).toBe(0);
    });
  });

  describe("deduplication", () => {
    it("skips items with fingerprints that already exist in storage", async () => {
      collector.fetchResult = [{ id: 1 }];

      // First run — stores the item
      const result1 = await collector.collect();
      expect(result1.itemsStored).toBe(1);

      // Second run — same item; should be deduplicated
      const result2 = await collector.collect();
      expect(result2.itemsStored).toBe(0);
      expect(result2.itemsDeduplicated).toBe(0);
    });
  });

  describe("timeout", () => {
    it("handles fetch timeout by returning failure result", async () => {
      // Create a collector whose fetch() hangs, with a very short timeout
      const config = makeConfig({ fetchTimeoutMs: 10, retry: { ...DEFAULT_RETRY_CONFIG, maxRetries: 0 } });
      const hangingCollector = new TestCollector(source, config, storage, rateLimiter);
      hangingCollector.shouldFailTimeout = true;

      const result = await hangingCollector.collect();

      // The collector wraps errors in a failed result, so success is false
      expect(result.success).toBe(false);
      expect(result.itemsFetched).toBe(0);
    }, 5000);
  });
});
