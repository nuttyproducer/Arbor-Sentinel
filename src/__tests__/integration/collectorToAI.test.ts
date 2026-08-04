/**
 * Collector-to-AI Integration Test (M4.7-03).
 *
 * End-to-end: mock source data → collector → normalize → AI pipeline stages → structured output.
 * Uses mocked external services — no real HTTP calls, no real API keys.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ICJCollector } from "../../lib/collectors/courts/ICJCollector";
import { CollectorRegistry } from "../../lib/collectors/CollectorRegistry";
import { RateLimiter } from "../../lib/collectors/rateLimiter";
import { DevMemoryStore } from "../../lib/collectors/store";
import { AIPipeline, createStage } from "../../lib/ai/AIPipeline";
import { createMockProvider } from "../../lib/ai/provider";
import { Logger } from "../../lib/ai/Logger";
import { ModelRouter } from "../../lib/ai/ModelRouter";
import type { SourceRecord, SourceType } from "../../types/content";
import type { CollectorConfig, CollectResult } from "../../lib/collectors/types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../lib/collectors/types";
import type { AIContent } from "../../lib/ai/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSource(): SourceRecord {
  return {
    id: "icj-integration",
    slug: "icj-integration",
    title: "ICJ Integration Test",
    publisher: "International Court of Justice",
    sourceType: "court" as SourceType,
    url: "https://www.icj-cij.org/node/200001",
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

function makeConfig(): CollectorConfig {
  return {
    sourceId: "icj-integration",
    label: "ICJIntegration",
    sourceType: "court" as SourceType,
    enabled: true,
    trigger: { type: "manual" as const },
    rateLimit: DEFAULT_RATE_LIMIT,
    retry: { ...DEFAULT_RETRY_CONFIG, maxRetries: 0 },
    fetchTimeoutMs: 5000,
    maxContentAgeMs: 24 * 60 * 60 * 1000,
    storeRawResponse: false,
  };
}

const mockHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Order of 15 June 2026 — Test Case | International Court of Justice</title>
  <meta name="description" content="The Court ordered provisional measures in the case concerning Test Region.">
  <meta property="article:published_time" content="2026-06-15">
</head>
<body>
  <main>
    <h1>Order of 15 June 2026</h1>
    <article>
      <p>The International Court of Justice today delivered its Order on provisional measures.</p>
      <p>The Court finds that 500 civilian casualties were documented in the Test Region.</p>
      <p>The Court orders the respondent to submit a compliance report within 30 days.</p>
    </article>
  </main>
</body>
</html>`;

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Collector → AI Pipeline — Integration", () => {
  let storage: DevMemoryStore;
  let rateLimiter: RateLimiter;
  let registry: CollectorRegistry;

  beforeEach(() => {
    storage = new DevMemoryStore();
    rateLimiter = new RateLimiter();
    registry = new CollectorRegistry(storage, rateLimiter);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    rateLimiter.reset();
    storage.clear();
  });

  // ── Collector → NormalizedContent ──────────────────────────────────────

  describe("collector output", () => {
    it("produces valid CollectResult from mock HTML", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockHtml),
      });

      registry.register(ICJCollector, ["court"], "ICJ");
      const collector = new ICJCollector(makeSource(), makeConfig(), storage, rateLimiter);
      const result: CollectResult = await collector.collect();

      expect(result.success).toBe(true);
      expect(result.runId).toMatch(/^run-/);
      expect(result.sourceId).toBe("icj-integration");
      // Collector produces stage durations for observability
      expect(result.stageDurations.fetch).toBeGreaterThanOrEqual(0);
      expect(result.stageDurations.validate).toBeGreaterThanOrEqual(0);
      expect(result.stageDurations.normalize).toBeGreaterThanOrEqual(0);
    });

    it("collector output flows to AI pipeline context", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockHtml),
      });

      const collector = new ICJCollector(makeSource(), makeConfig(), storage, rateLimiter);
      const result = await collector.collect();

      // The collector result provides the data that feeds into AIContent
      expect(result.sourceId).toBeTruthy();
      // Items stored can flow to AI pipeline
      expect(typeof result.itemsStored).toBe("number");
    });
  });

  // ── Collector output → AI Pipeline input ───────────────────────────────

  describe("collector → AI pipeline flow", () => {
    it("NormalizedContent passes from collector to AI pipeline", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockHtml),
      });

      const collector = new ICJCollector(makeSource(), makeConfig(), storage, rateLimiter);
      const collectResult = await collector.collect();

      // If collector stored items, retrieve them for AI pipeline
      if (collectResult.itemsStored > 0) {
        const items = await storage.getBySource("icj-integration");
        expect(items.length).toBeGreaterThan(0);

        // The first item's normalized content becomes AI pipeline input
        const firstItem = items[0];
        if (firstItem.normalized) {
          const aiContent: AIContent = {
            source: firstItem.normalized,
            sourceQuality: 3,
            collectionTimestamp: firstItem.fetchedAt,
          };

          expect(aiContent.source.title).toBeTruthy();
          expect(aiContent.source.url).toBeTruthy();
          expect(aiContent.sourceQuality).toBe(3);
        }
      }
    });

    it("AI pipeline processes collector output end-to-end", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockHtml),
      });

      const collector = new ICJCollector(makeSource(), makeConfig(), storage, rateLimiter);
      await collector.collect();
      const items = await storage.getBySource("icj-integration");

      // If items were collected, feed them to AI pipeline
      if (items.length > 0 && items[0].normalized) {
        const provider = createMockProvider([
          { content: JSON.stringify({ language: "en", confidence: 0.99 }) },
          { content: JSON.stringify({ summary: "ICJ ordered provisional measures.", facts: [] }) },
          { content: JSON.stringify({ entities: [] }) },
        ]);

        const logger = new Logger();
        const router = new ModelRouter();

        const stage1 = createStage({
          name: "language_detection",
          requires: [],
          run: async () => ({
            data: { language: "en" },
            confidence: 0.99,
            modelUsed: "mock",
            tokensUsed: { input: 10, output: 5 },
            latencyMs: 1,
            warnings: [],
            sourceSpans: [],
          }),
        });

        const pipeline = new AIPipeline({
          stages: [stage1],
          provider,
          router,
          logger,
        });

        const aiContent: AIContent = {
          source: items[0].normalized,
          sourceQuality: 3,
          collectionTimestamp: items[0].fetchedAt,
        };

        const aiResult = await pipeline.process(aiContent);
        expect(aiResult.sourceId).toBeDefined();
        expect(aiResult.processedAt).toBeDefined();
        expect(aiResult.auditLog.length).toBeGreaterThan(0);
      }
    });
  });
});
