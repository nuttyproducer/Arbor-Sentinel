// src/lib/runtime/RuntimeEngine.ts
// Central runtime orchestrator. Owns the collector registry, scheduler,
// and downstream pipeline. This is the single entry point for the live
// collection system.

import { CollectorRegistry } from "../collectors/CollectorRegistry";
import { RateLimiter } from "../collectors/rateLimiter";
import { SupabaseStore } from "../collectors/SupabaseStore";
import { setupRegistry } from "../collectors/registrySetup";
import { listEnabled, getFeed } from "../collectors/feedRegistry";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG, DEFAULT_FETCH_TIMEOUT_MS } from "../collectors/types";
import { recordRun, recordFeedError } from "./metrics";
import { Scheduler } from "../scheduler/Scheduler";
import type { RuntimeState, RuntimeConfig, RuntimeStats, RuntimeDiagnostics, RunAllSummary, FeedRunResult } from "./types";
import { DEFAULT_RUNTIME_CONFIG } from "./types";
import type { CollectorConfig, CollectResult } from "../collectors/types";
import type { SourceRecord } from "../../types/content";
import type { FeedRow } from "../collectors/feedRegistry";

// ── Singleton ────────────────────────────────────────────────────────────────

let instance: RuntimeEngine | null = null;

export function getRuntimeEngine(): RuntimeEngine {
  if (!instance) {
    instance = new RuntimeEngine();
  }
  return instance;
}

// ── Engine ───────────────────────────────────────────────────────────────────

export class RuntimeEngine {
  private registry: CollectorRegistry;
  private store: SupabaseStore;
  private rateLimiter: RateLimiter;
  private scheduler: Scheduler;
  private config: RuntimeConfig;
  private state: RuntimeState = "idle";
  private startedAt: number = 0;

  // Stats (in-memory, reset on restart)
  private totalRuns = 0;
  private successfulRuns = 0;
  private failedRuns = 0;
  private totalItemsStored = 0;
  private lastErrors: Array<{ feedId: string; error: string; timestamp: string }> = [];

  constructor() {
    this.store = new SupabaseStore();
    this.rateLimiter = new RateLimiter();
    this.registry = new CollectorRegistry(this.store, this.rateLimiter);
    this.scheduler = new Scheduler();
    this.config = { ...DEFAULT_RUNTIME_CONFIG };

    // Register all collectors once
    setupRegistry(this.registry);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  getState(): RuntimeState {
    return this.state;
  }

  getConfig(): RuntimeConfig {
    return { ...this.config };
  }

  updateConfig(partial: Partial<RuntimeConfig>): void {
    this.config = { ...this.config, ...partial };
  }

  async start(): Promise<void> {
    if (this.state === "running") return;

    this.state = "starting";
    this.startedAt = Date.now();
    this.totalRuns = 0;
    this.successfulRuns = 0;
    this.failedRuns = 0;
    this.totalItemsStored = 0;
    this.lastErrors = [];

    // Schedule all enabled feeds using the real Scheduler
    const feeds = await listEnabled();
    for (const feed of feeds) {
      const intervalMs = (feed.poll_interval_minutes ?? 60) * 60 * 1000;
      const mode = feed.poll_interval_minutes === 0 ? "manual" as const : "interval" as const;
      this.scheduler.schedule(
        feed.id,
        feed.name,
        mode,
        intervalMs,
        async (feedId: string) => {
          const f = await getFeed(feedId);
          if (f) await this.collectFeed(f);
        },
      );
    }

    // Start the scheduler tick loop (replaces the old setInterval)
    this.scheduler.start();
    this.state = "running";
  }

  async stop(): Promise<void> {
    this.state = "stopping";
    this.scheduler.stop();
    this.state = "stopped";
  }

  /** Expose scheduler stats for the admin UI. */
  schedulerStats() {
    return this.scheduler.stats();
  }

  // ── Core loop ──────────────────────────────────────────────────────────

  /**
   * One tick of the runtime: fetch enabled feeds, collect from each,
   * record results. Designed to be called on a schedule or manually.
   */
  async tick(): Promise<void> {
    if (this.state !== "running") return;

    try {
      const feeds = await listEnabled();
      let running = 0;

      for (const feed of feeds) {
        if (running >= this.config.maxConcurrentRuns) break;
        running++;
        void this.collectFeed(feed).finally(() => { running--; });
      }
    } catch (err) {
      console.error("[RuntimeEngine] Tick error:", err);
    }
  }

  /**
   * Run collection for a specific feed (or all enabled feeds if no ID given).
   * Returns a summary with per-feed results for display in the UI.
   */
  async runOnce(feedId?: string): Promise<RunAllSummary> {
    if (feedId) {
      const feed = await getFeed(feedId);
      if (!feed) {
        return { feeds: [], totalFetched: 0, totalStored: 0, errors: [`Feed ${feedId} not found`] };
      }
      if (!feed.enabled) {
        return { feeds: [], totalFetched: 0, totalStored: 0, errors: [`Feed ${feed.name} is disabled`] };
      }
      const result = await this.collectFeed(feed);
      return {
        feeds: [{ name: feed.name, fetched: result?.itemsFetched ?? 0, stored: result?.itemsStored ?? 0, success: result?.success ?? false }],
        totalFetched: result?.itemsFetched ?? 0,
        totalStored: result?.itemsStored ?? 0,
        errors: result?.success ? [] : [`${feed.name} failed`],
      };
    }

    // Run all enabled feeds
    const feeds = await listEnabled();
    const feedResults: FeedRunResult[] = [];
    let totalFetched = 0;
    let totalStored = 0;
    const errors: string[] = [];

    for (const feed of feeds) {
      const result = await this.collectFeed(feed);
      const lastErr = this.lastErrors.filter((e) => e.feedId === feed.id).pop();
      feedResults.push({
        name: feed.name,
        fetched: result?.itemsFetched ?? 0,
        stored: result?.itemsStored ?? 0,
        success: result?.success ?? false,
        error: result && !result.success ? (lastErr?.error ?? "Unknown error") : undefined,
      });
      totalFetched += result?.itemsFetched ?? 0;
      totalStored += result?.itemsStored ?? 0;
      if (!result?.success) {
        errors.push(`${feed.name}: ${lastErr?.error ?? "failed"}`);
      }
    }

    return { feeds: feedResults, totalFetched, totalStored, errors };
  }

  /**
   * Run all feeds of a given source type.
   */
  async runSource(sourceType: string): Promise<CollectResult[]> {
    const { getFeedsBySourceType } = await import("../collectors/feedRegistry");
    const feeds = await getFeedsBySourceType(sourceType);
    const results: CollectResult[] = [];
    for (const feed of feeds) {
      const result = await this.collectFeed(feed);
      if (result) results.push(result);
    }
    return results;
  }

  // ── Per-feed collection ────────────────────────────────────────────────

  private async collectFeed(feed: FeedRow): Promise<CollectResult | null> {
    const feedId = feed.id;
    const sourceType = feed.source_type as
      | "journalism" | "ngo" | "academic" | "un" | "government" | "court";

    try {
      // Check if we have a collector for this source type
      if (!this.registry.hasCollectorForType(sourceType)) {
        const covered = this.registry.getCoveredSourceTypes().join(", ");
        this.lastErrors.push({
          feedId,
          error: `No collector registered for source type "${sourceType}". Covered types: ${covered || "none"}`,
          timestamp: new Date().toISOString(),
        });
        return null;
      }

      // The real source identity is feed.source_id (FK → sources.id).
      // Fall back to feed.id for feeds that aren't linked to a source row yet.
      const sourceId = feed.source_id ?? feed.id;

      // Build SourceRecord from feed data
      const sourceRecord: SourceRecord = {
        id: sourceId,
        slug: sourceId,
        title: feed.name,
        publisher: feed.name,
        sourceType,
        url: feed.url,
        accessedAt: new Date().toISOString(),
        status: "active",
        version: 1,
        trustLevel: feed.trust_level as 0 | 1 | 2 | 3 | 4 | 5,
        healthStatus: (feed.health_status as "unknown" | "active" | "degraded" | "failed") ?? "unknown",
        automationStatus: "scheduled",
        failureCount: feed.failure_count,
        monitoringEnabled: true,
        correctionUrl: "",
      };

      // Build CollectorConfig from feed data
      const config: CollectorConfig = {
        sourceId,
        label: feed.name,
        sourceType,
        enabled: true,
        trigger: { type: "manual" },
        rateLimit: { ...DEFAULT_RATE_LIMIT },
        retry: { ...DEFAULT_RETRY_CONFIG },
        fetchTimeoutMs: DEFAULT_FETCH_TIMEOUT_MS,
        maxContentAgeMs: 24 * 60 * 60 * 1000,
        storeRawResponse: false,
        metadata: { url: feed.url, feedId: feed.id },
      };

      // Create instance and collect
      const collector = this.registry.createInstance(sourceRecord, config);
      const result = await collector.collect();

      // Update stats
      this.totalRuns++;
      if (result.success) {
        this.successfulRuns++;
      } else {
        this.failedRuns++;
      }
      this.totalItemsStored += result.itemsStored;

      // Persist run and update feed health.
      // sourceId is the resolved FK to sources.id (may be null for unlinked feeds).
      await recordRun(feedId, sourceId, sourceType, result);

      // Downstream pipeline: process each stored item through AI → review → graph → search.
      // Gated behind config flags — AI and graph are expensive and default to off.
      if (this.config.enableAIPipeline || this.config.enableGraphPopulation || this.config.enableSearchIndexing) {
        const { processItem } = await import("./pipeline");
        const allItems = await this.store.getBySource(sourceId);
        for (const item of allItems.slice(-result.itemsStored)) {
          void processItem(item, sourceId, {
            enableAI: this.config.enableAIPipeline,
            enableAutoPublish: this.config.enableAutoPublish,
            enableGraph: this.config.enableGraphPopulation,
            enableSearch: this.config.enableSearchIndexing,
          });
        }
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.failedRuns++;
      this.lastErrors.push({
        feedId,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });

      await recordFeedError(feedId, errorMessage);

      // Keep lastErrors bounded
      if (this.lastErrors.length > 50) {
        this.lastErrors = this.lastErrors.slice(-50);
      }

      // Return a failed result so the UI can show what happened
      return {
        runId: `error-${Date.now()}`,
        sourceId: feedId,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        itemsFetched: 0,
        itemsValidated: 0,
        itemsNormalized: 0,
        itemsDeduplicated: 0,
        itemsStored: 0,
        stageDurations: { fetch: 0, validate: 0, normalize: 0, deduplicate: 0, store: 0 },
        success: false,
      } as CollectResult;
    }
  }

  // ── Stats & Diagnostics ────────────────────────────────────────────────

  stats(): RuntimeStats {
    return {
      state: this.state,
      uptimeMs: this.startedAt ? Date.now() - this.startedAt : 0,
      totalRuns: this.totalRuns,
      successfulRuns: this.successfulRuns,
      failedRuns: this.failedRuns,
      totalItemsCollected: this.totalItemsStored,
      totalItemsStored: this.totalItemsStored,
      activeJobs: 0,
      queuedJobs: 0,
    };
  }

  diagnostics(): RuntimeDiagnostics {
    const snapshot = this.stats();
    return {
      state: this.state,
      uptimeMs: snapshot.uptimeMs,
      stats: snapshot,
      scheduler: {
        active: this.state === "running",
        jobCount: this.scheduler.stats().totalJobs,
        nextRunAt: this.scheduler.stats().nextRunAt,
        paused: this.state !== "running",
      },
      collectors: this.registry.listRegistrations().map((r) => ({
        collectorName: r.name,
        sourceType: r.supportedSourceTypes[0] ?? "unknown",
        status: r.healthStatus,
        lastFetchAt: r.lastSuccessfulRun,
        lastSuccessAt: r.lastSuccessfulRun,
        totalFetches: 0,
        successfulFetches: 0,
        failedFetches: 0,
        consecutiveFailures: r.consecutiveFailures,
        avgResponseTimeMs: 0,
        errorRate: 0,
        enabled: true,
        isStale: !r.lastSuccessfulRun
          || (Date.now() - new Date(r.lastSuccessfulRun).getTime()) > 24 * 60 * 60 * 1000,
      })),
      lastErrors: [...this.lastErrors],
      circuitBreakers: {},
    };
  }
}
