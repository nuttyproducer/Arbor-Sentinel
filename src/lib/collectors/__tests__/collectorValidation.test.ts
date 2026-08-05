/**
 * Validation tests: every collector output validates against CollectResult schema.
 * Tests cover: collect() return shape, pipeline stage durations,
 * error result shape, typed errors, and CollectResult field constraints.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ICJCollector } from "../courts/ICJCollector";
import { OHCHRCollector } from "../un/OHCHRCollector";
import { AmnestyCollector } from "../ngo/AmnestyCollector";
import { EUCollector } from "../eu/EUCollector";
import { JournalismCollector } from "../media/JournalismCollector";
import { RateLimiter } from "../rateLimiter";
import { DevMemoryStore } from "../store";
import { z } from "zod/v4";
import type { SourceRecord, SourceType } from "../../../types/content";
import type { CollectorConfig } from "../types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../types";

// ── Zod schemas for CollectResult validation ──────────────────────────────────

const PipelineStageDurationsSchema = z.object({
  fetch: z.number().min(0),
  validate: z.number().min(0),
  normalize: z.number().min(0),
  deduplicate: z.number().min(0),
  store: z.number().min(0),
});

const CollectResultSchema = z.object({
  runId: z.string().min(1).regex(/^run-/),
  sourceId: z.string().min(1),
  startedAt: z.string().min(1),
  completedAt: z.string().min(1),
  itemsFetched: z.number().int().min(0),
  itemsValidated: z.number().int().min(0),
  itemsNormalized: z.number().int().min(0),
  itemsDeduplicated: z.number().int().min(0),
  itemsStored: z.number().int().min(0),
  stageDurations: PipelineStageDurationsSchema,
  success: z.boolean(),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSource(type: SourceType, url: string): SourceRecord {
  return {
    id: `val-${type}`,
    slug: `val-${type}`,
    title: `Validation ${type}`,
    publisher: "Validator",
    sourceType: type,
    url,
    accessedAt: "2026-08-03",
    status: "active",
    version: 1,
    correctionUrl: "/corrections",
    trustLevel: 0,
    healthStatus: "unknown",
    automationStatus: "manual",
    failureCount: 0,
    monitoringEnabled: false,
  };
}

function makeConfig(type: SourceType): CollectorConfig {
  return {
    sourceId: `val-${type}`,
    label: `Val${type}`,
    sourceType: type,
    enabled: true,
    trigger: { type: "manual" as const },
    rateLimit: DEFAULT_RATE_LIMIT,
    retry: { ...DEFAULT_RETRY_CONFIG, maxRetries: 0 },
    fetchTimeoutMs: 5000,
    maxContentAgeMs: 24 * 60 * 60 * 1000,
    storeRawResponse: false,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Collector Output Validation", () => {
  let storage: DevMemoryStore;
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    storage = new DevMemoryStore();
    rateLimiter = new RateLimiter();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    rateLimiter.reset();
    storage.clear();
  });

  // ── CollectResult schema validation ─────────────────────────────────────

  describe("CollectResult schema (Zod)", () => {
    it("validates a successful ICJ CollectResult against schema", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            '<html lang="en"><head><title>Test Order</title><meta name="date" content="2026-01-15"></head><body><main><p>The Court ordered provisional measures.</p></main></body></html>',
          ),
      });

      const collector = new ICJCollector(
        makeSource("court", "https://www.icj-cij.org/node/200001"),
        makeConfig("court"),
        storage,
        rateLimiter,
      );

      const result = await collector.collect();
      const parsed = CollectResultSchema.safeParse(result);

      expect(parsed.success).toBe(true);
    });

    it("validates a failed CollectResult against schema", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network failure"));

      const collector = new ICJCollector(
        makeSource("court", "https://www.icj-cij.org/node/200001"),
        makeConfig("court"),
        storage,
        rateLimiter,
      );

      const result = await collector.collect();
      const parsed = CollectResultSchema.safeParse(result);

      expect(parsed.success).toBe(true);
      expect(result.success).toBe(false);
    });

    it("validates CollectResult from every collector type", async () => {
      // Define collector factories for each source type
      const factories: Array<{
        type: SourceType;
        url: string;
        factory: (
          source: SourceRecord,
          config: CollectorConfig,
        ) => ReturnType<typeof ICJCollector.prototype.collect> extends Promise<infer T>
          ? { collect(): Promise<T> }
          : never;
      }> = [
        {
          type: "court",
          url: "https://www.icj-cij.org/node/200001",
          factory: (s, c) => new ICJCollector(s, c, storage, rateLimiter),
        },
        {
          type: "un",
          url: "https://www.ohchr.org/en/test",
          factory: (s, c) => new OHCHRCollector(s, c, storage, rateLimiter),
        },
        {
          type: "government",
          url: "https://www.europarl.europa.eu/test",
          factory: (s, c) => new EUCollector(s, c, storage, rateLimiter),
        },
        {
          type: "ngo",
          url: "https://www.amnesty.org/en/test",
          factory: (s, c) => new AmnestyCollector(s, c, storage, rateLimiter),
        },
        {
          type: "journalism",
          url: "https://www.test-news-outlet.org/test",
          factory: (s, c) => new JournalismCollector(s, c, storage, rateLimiter),
        },
      ];

      for (const { type, url, factory } of factories) {
        (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () =>
            Promise.resolve(
              '<html lang="en"><head><title>Test</title></head><body><main><p>Content.</p></main></body></html>',
            ),
          json: () => Promise.resolve({ results: [{ title: "Test" }], total: 1 }),
        });

        const collector = factory(makeSource(type, url), makeConfig(type));
        if (typeof collector.collect === "function") {
          const result = await collector.collect();
          const parsed = CollectResultSchema.safeParse(result);
          expect(parsed.success).toBe(true);
        }
      }
    });
  });

  // ── Pipeline stage invariants ───────────────────────────────────────────

  describe("pipeline stage invariants", () => {
    it("itemsValidated <= itemsFetched", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            '<html lang="en"><head><title>Test</title></head><body><main><p>Text.</p></main></body></html>',
          ),
      });

      const collector = new ICJCollector(
        makeSource("court", "https://www.icj-cij.org/node/200001"),
        makeConfig("court"),
        storage,
        rateLimiter,
      );

      const result = await collector.collect();
      expect(result.itemsValidated).toBeLessThanOrEqual(result.itemsFetched);
    });

    it("itemsNormalized <= itemsValidated", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            '<html lang="en"><head><title>Test</title></head><body><main><p>Text.</p></main></body></html>',
          ),
      });

      const collector = new ICJCollector(
        makeSource("court", "https://www.icj-cij.org/node/200001"),
        makeConfig("court"),
        storage,
        rateLimiter,
      );

      const result = await collector.collect();
      expect(result.itemsNormalized).toBeLessThanOrEqual(result.itemsValidated);
    });

    it("itemsDeduplicated <= itemsNormalized", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            '<html lang="en"><head><title>Test</title></head><body><main><p>Text.</p></main></body></html>',
          ),
      });

      const collector = new ICJCollector(
        makeSource("court", "https://www.icj-cij.org/node/200001"),
        makeConfig("court"),
        storage,
        rateLimiter,
      );

      const result = await collector.collect();
      expect(result.itemsDeduplicated).toBeLessThanOrEqual(result.itemsNormalized);
    });

    it("itemsStored <= itemsDeduplicated", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            '<html lang="en"><head><title>Test</title></head><body><main><p>Text.</p></main></body></html>',
          ),
      });

      const collector = new ICJCollector(
        makeSource("court", "https://www.icj-cij.org/node/200001"),
        makeConfig("court"),
        storage,
        rateLimiter,
      );

      const result = await collector.collect();
      expect(result.itemsStored).toBeLessThanOrEqual(result.itemsDeduplicated);
    });

    it("stage durations are non-negative", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            '<html lang="en"><head><title>Test</title></head><body><main><p>Text.</p></main></body></html>',
          ),
      });

      const collector = new ICJCollector(
        makeSource("court", "https://www.icj-cij.org/node/200001"),
        makeConfig("court"),
        storage,
        rateLimiter,
      );

      const result = await collector.collect();
      // All stage durations should be >= 0
      const d = result.stageDurations;
      expect(d.fetch).toBeGreaterThanOrEqual(0);
      expect(d.validate).toBeGreaterThanOrEqual(0);
      expect(d.normalize).toBeGreaterThanOrEqual(0);
      expect(d.deduplicate).toBeGreaterThanOrEqual(0);
      expect(d.store).toBeGreaterThanOrEqual(0);
    });
  });

  // ── Error result shape ──────────────────────────────────────────────────

  describe("error result shape", () => {
    it("failed result still has all required CollectResult fields", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Aborted"));

      const collector = new ICJCollector(
        makeSource("court", "https://www.icj-cij.org/node/200001"),
        makeConfig("court"),
        storage,
        rateLimiter,
      );

      const result = await collector.collect();

      expect(result.runId).toMatch(/^run-/);
      expect(result.sourceId).toBe("val-court");
      expect(result.startedAt).toBeTruthy();
      expect(result.completedAt).toBeTruthy();
      expect(result.success).toBe(false);
      expect(typeof result.itemsFetched).toBe("number");
      expect(typeof result.itemsValidated).toBe("number");
      expect(typeof result.itemsNormalized).toBe("number");
      expect(typeof result.itemsDeduplicated).toBe("number");
      expect(typeof result.itemsStored).toBe("number");
      expect(result.stageDurations).toBeDefined();
    });

    it("failed result has itemsStored = 0", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network down"));

      const collector = new ICJCollector(
        makeSource("court", "https://www.icj-cij.org/node/200001"),
        makeConfig("court"),
        storage,
        rateLimiter,
      );

      const result = await collector.collect();
      expect(result.itemsStored).toBe(0);
      expect(result.success).toBe(false);
    });
  });

  // ── Timestamp consistency ───────────────────────────────────────────────

  describe("timestamp consistency", () => {
    it("completedAt is after startedAt", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            '<html lang="en"><head><title>Test</title></head><body><main><p>Text.</p></main></body></html>',
          ),
      });

      const collector = new ICJCollector(
        makeSource("court", "https://www.icj-cij.org/node/200001"),
        makeConfig("court"),
        storage,
        rateLimiter,
      );

      const result = await collector.collect();
      const started = new Date(result.startedAt).getTime();
      const completed = new Date(result.completedAt).getTime();
      expect(completed).toBeGreaterThanOrEqual(started);
    });

    it("timestamps are valid ISO 8601 strings", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("fail"));

      const collector = new ICJCollector(
        makeSource("court", "https://www.icj-cij.org/node/200001"),
        makeConfig("court"),
        storage,
        rateLimiter,
      );

      const result = await collector.collect();
      expect(() => new Date(result.startedAt)).not.toThrow();
      expect(() => new Date(result.completedAt)).not.toThrow();
      expect(new Date(result.startedAt).toISOString()).toBe(result.startedAt);
      expect(new Date(result.completedAt).toISOString()).toBe(result.completedAt);
    });
  });

  // ── Run ID uniqueness ───────────────────────────────────────────────────

  describe("run ID uniqueness", () => {
    it("produces unique run IDs across multiple calls", async () => {
      (fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () =>
            Promise.resolve(
              '<html lang="en"><head><title>Test 1</title></head><body><main><p>A.</p></main></body></html>',
            ),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () =>
            Promise.resolve(
              '<html lang="en"><head><title>Test 2</title></head><body><main><p>B.</p></main></body></html>',
            ),
        });

      const collector = new ICJCollector(
        makeSource("court", "https://www.icj-cij.org/node/200001"),
        makeConfig("court"),
        storage,
        rateLimiter,
      );

      const result1 = await collector.collect();
      const result2 = await collector.collect();

      expect(result1.runId).not.toBe(result2.runId);
    });
  });
});
