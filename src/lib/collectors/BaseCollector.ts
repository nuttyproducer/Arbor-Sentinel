import type {
  CollectorConfig,
  CollectedItem,
  CollectResult,
  NormalizedContent,
  PipelineStageDurations,
  StorageInterface,
} from "./types";
import type { RetryConfig } from "./types";
import { RateLimiter } from "./rateLimiter";
import { withRetry } from "./retry";
import { TimeoutError, FetchError, RateLimitError, ParseError } from "./errors";
import type { SourceRecord, HealthStatus } from "../../types/content";
import type { CollectorHealthSnapshot } from "./monitoring/types";

/** Unique run ID counter. */
let runCounter = 0;

function nextRunId(): string {
  runCounter += 1;
  return `run-${Date.now()}-${runCounter}`;
}

/**
 * Abstract base class for all source collectors.
 *
 * Subclasses implement source-specific fetch logic. The base class
 * enforces the pipeline order:
 *
 *   fetch → validate → normalize → deduplicate → store
 *
 * Each stage is measured and errors are typed with full context.
 */
export abstract class BaseCollector {
  /** Source record from the Source Registry. */
  protected readonly source: SourceRecord;
  /** Collector configuration. */
  protected readonly config: CollectorConfig;
  /** Storage for collected content. */
  protected readonly storage: StorageInterface;
  /** Shared rate limiter instance. */
  protected readonly rateLimiter: RateLimiter;
  /** The most recent collection result, set after each collect() call. */
  protected lastResult: CollectResult | null = null;

  constructor(
    source: SourceRecord,
    config: CollectorConfig,
    storage: StorageInterface,
    rateLimiter: RateLimiter,
  ) {
    this.source = source;
    this.config = config;
    this.storage = storage;
    this.rateLimiter = rateLimiter;
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /**
   * Execute the full collection pipeline.
   *
   * @returns CollectResult with per-stage metrics.
   */
  async collect(): Promise<CollectResult> {
    const runId = nextRunId();
    const startedAt = new Date().toISOString();
    const durations: PipelineStageDurations = {
      fetch: 0,
      validate: 0,
      normalize: 0,
      deduplicate: 0,
      filter: 0,
      store: 0,
    };

    let rawItems: unknown[] = [];
    let validatedItems: unknown[] = [];
    let collectedItems: CollectedItem[] = [];
    let deduplicatedItems: CollectedItem[] = [];
    let filteredCount = 0;
    let storedCount = 0;

    try {
      // ── Stage 1: Fetch ───────────────────────────────────────────
      const fetchStart = Date.now();
      rawItems = await this.executeWithRetry(
        () => this.fetchWithRateLimit(),
      );
      durations.fetch = Date.now() - fetchStart;

      // ── Stage 2: Validate ────────────────────────────────────────
      const validateStart = Date.now();
      validatedItems = [];
      for (const raw of rawItems) {
        if (await this.validate(raw)) {
          validatedItems.push(raw);
        }
      }
      durations.validate = Date.now() - validateStart;

      // ── Stage 3: Normalize ───────────────────────────────────────
      const normalizeStart = Date.now();
      collectedItems = [];
      for (const raw of validatedItems) {
        const item = await this.normalizeToItem(raw);
        collectedItems.push(item);
      }
      durations.normalize = Date.now() - normalizeStart;

      // ── Stage 4: Deduplicate ────────────────────────────────────
      const dedupeStart = Date.now();
      deduplicatedItems = [];
      for (const item of collectedItems) {
        if (!(await this.isDuplicate(item))) {
          deduplicatedItems.push(item);
        }
      }
      durations.deduplicate = Date.now() - dedupeStart;

      // ── Stage 5: Filter ──────────────────────────────────────────
      const filterStart = Date.now();
      filteredCount = 0;
      if (deduplicatedItems.length > 0) {
        try {
          const { applyFilters, DEFAULT_FILTER_CONTEXT } = await import("./filters/RelevanceFilter");
          const { accepted, rejected } = await applyFilters(deduplicatedItems, {
            ...DEFAULT_FILTER_CONTEXT,
            minTrustLevel: (this.config.metadata?.trust_level as number) ?? 0,
          });
          filteredCount = rejected.length;
          deduplicatedItems = accepted;
        } catch {
          // Filter errors are non-fatal — items pass through unfiltered
        }
      }
      durations.filter = Date.now() - filterStart;

      // ── Stage 6: Store ──────────────────────────────────────────
      const storeStart = Date.now();
      for (const item of deduplicatedItems) {
        await this.store(item);
        storedCount++;
      }
      durations.store = Date.now() - storeStart;

      const result: CollectResult = {
        runId,
        sourceId: this.source.id,
        startedAt,
        completedAt: new Date().toISOString(),
        itemsFetched: rawItems.length,
        itemsValidated: validatedItems.length,
        itemsNormalized: collectedItems.length,
        itemsDeduplicated: deduplicatedItems.length + filteredCount,
        itemsFiltered: filteredCount,
        itemsStored: storedCount,
        stageDurations: durations,
        success: true,
      };
      this.lastResult = result;
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn(`[${this.constructor.name}] Collection failed for "${this.source.id}":`, errorMessage);
      const result: CollectResult = {
        runId,
        sourceId: this.source.id,
        startedAt,
        completedAt: new Date().toISOString(),
        itemsFetched: rawItems.length,
        itemsValidated: validatedItems.length,
        itemsNormalized: collectedItems.length,
        itemsDeduplicated: deduplicatedItems.length + filteredCount,
        itemsFiltered: filteredCount,
        itemsStored: storedCount,
        stageDurations: durations,
        success: false,
        error: errorMessage,
      };
      this.lastResult = result;
      return result;
    }
  }

  /**
   * Build a health snapshot from the most recent collection result.
   * Subclasses may override to add collector-specific health signals.
   */
  health(): CollectorHealthSnapshot {
    const last = this.lastResult;
    const totalFetches = last ? last.itemsFetched : 0;
    const failedFetches = last && !last.success ? 1 : 0;
    return {
      collectorName: this.constructor.name,
      sourceType: this.config.sourceType,
      status: this.computeHealthStatus(),
      lastFetchAt: last?.startedAt,
      lastSuccessAt: last?.success ? last.completedAt : undefined,
      totalFetches,
      successfulFetches: last?.success ? 1 : 0,
      failedFetches,
      consecutiveFailures: last && !last.success ? 1 : 0,
      avgResponseTimeMs: last ? last.stageDurations.fetch : 0,
      errorRate: totalFetches > 0 ? failedFetches / totalFetches : 0,
      enabled: this.config.enabled,
      isStale: !last || (Date.now() - new Date(last.completedAt).getTime()) > 24 * 60 * 60 * 1000,
    };
  }

  /**
   * Return detailed diagnostics about this collector instance.
   * Subclasses may override to add collector-specific state.
   */
  diagnostics(): Record<string, unknown> {
    return {
      collectorName: this.constructor.name,
      sourceType: this.config.sourceType,
      sourceId: this.source.id,
      sourceUrl: this.source.url,
      enabled: this.config.enabled,
      trigger: this.config.trigger,
      rateLimitConfig: this.config.rateLimit,
      retryConfig: this.config.retry,
      fetchTimeoutMs: this.config.fetchTimeoutMs,
      lastResult: this.lastResult,
      health: this.health(),
    };
  }

  /** Derive HealthStatus from the last result and config. */
  protected computeHealthStatus(): HealthStatus {
    if (!this.lastResult) return "unknown";
    if (!this.lastResult.success) return "degraded";
    return "active";
  }

  // ── Pipeline Stage Methods ────────────────────────────────────────────

  /**
   * Fetch raw content from the source.
   * Subclasses MUST implement this.
   *
   * @returns Array of raw items from the source.
   */
  abstract fetch(): Promise<unknown[]>;

  /**
   * Validate a raw item before normalization.
   * Override for source-specific validation rules.
   *
   * Default: accept all items.
   *
   * @param raw - A raw item returned by fetch().
   * @returns true if the item passes validation.
   */
  async validate(raw: unknown): Promise<boolean> {
    return raw !== null && raw !== undefined;
  }

  /**
   * Normalize a validated raw item into a CollectedItem.
   * Override for source-specific normalization.
   *
   * Default: wrap the raw item with minimal metadata.
   *
   * @param raw - A validated raw item.
   * @returns A CollectedItem ready for deduplication and storage.
   */
  async normalize(raw: unknown): Promise<NormalizedContent> {
    return {
      title: "",
      body: typeof raw === "string" ? raw : JSON.stringify(raw),
      url: this.source.url,
      tags: [],
      metadata: {},
    };
  }

  /**
   * Determine whether a collected item is a duplicate.
   * Override to customize fingerprinting.
   *
   * Default: checks storage for fingerprint existence.
   *
   * @param item - The item to check.
   * @returns true if the item is a duplicate (already stored).
   */
  async isDuplicate(item: CollectedItem): Promise<boolean> {
    return this.storage.exists(item.fingerprint);
  }

  /**
   * Store a collected item.
   * Override to customize storage behavior.
   *
   * Default: saves to the configured storage.
   *
   * @param item - The item to store.
   */
  async store(item: CollectedItem): Promise<void> {
    await this.storage.save(item);
  }

  // ── Shared HTTP Client ──────────────────────────────────────────────────

  /**
   * Unified HTTP fetch for all collectors. Sets User-Agent, requests gzip
   * compression, and maps HTTP status codes to typed, retryable errors so
   * the base retry wrapper can correctly retry transient failures.
   *
   * All collector fetch logic MUST use this helper instead of raw `fetch()`.
   */
  protected async httpFetch(url: string, opts?: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutMs = this.config.fetchTimeoutMs;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...opts,
        signal: controller.signal,
        headers: {
          "User-Agent": `Arbor-Sentinel/1.0 (${this.constructor.name})`,
          "Accept-Encoding": "gzip, deflate",
          ...(opts?.headers as Record<string, string> | undefined),
        },
      });

      if (!res.ok) {
        throw this.statusToError(url, res.status);
      }

      return res;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new TimeoutError(
          `HTTP fetch timed out after ${timeoutMs}ms for "${url}"`,
          { sourceId: this.source.id, url, attempt: 1, timeoutMs },
        );
      }
      // Re-throw typed collector errors unchanged; wrap everything else
      if (err && typeof err === "object" && "code" in err) throw err;
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  /** Map an HTTP status code to the correct typed error for retry decisions. */
  private statusToError(url: string, status: number): Error {
    const ctx = { sourceId: this.source.id, url, attempt: 1 };
    if (status === 429) {
      return new RateLimitError(`Rate limited (${status}) for "${url}"`, ctx);
    }
    // FetchError is retryable by default (retry.ts checks error type).
    // 4xx client errors (except 408/429) should NOT be retried — use ParseError for those.
    if (status >= 500 || status === 408) {
      return new FetchError(`Server error (${status}) for "${url}"`, ctx);
    }
    // 4xx client errors are fatal (bad URL, auth, etc.)
    return new ParseError(`Client error (${status}) for "${url}"`, ctx);
  }

  // ── Protected Helpers ──────────────────────────────────────────────────

  /** Fetch with rate limiting applied. */
  protected async fetchWithRateLimit(): Promise<unknown[]> {
    const domain = this.extractDomain(this.source.url);
    await this.rateLimiter.acquire(this.source.id, domain, this.config.rateLimit);
    try {
      return await this.fetchWithTimeout();
    } finally {
      this.rateLimiter.release(domain);
    }
  }

  /** Fetch with a configurable timeout. */
  protected async fetchWithTimeout(): Promise<unknown[]> {
    return new Promise<unknown[]>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(
          new TimeoutError(
            `Fetch timed out after ${this.config.fetchTimeoutMs}ms for source "${this.source.id}"`,
            {
              sourceId: this.source.id,
              url: this.source.url,
              attempt: 1,
              timeoutMs: this.config.fetchTimeoutMs,
            },
          ),
        );
      }, this.config.fetchTimeoutMs);

      this.fetch()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /** Execute an operation with retry logic using this collector's config. */
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    const result = await withRetry(
      () => operation(),
      this.config.retry,
      this.source.id,
    );

    if (!result.success) {
      throw result.error;
    }

    return result.result!;
  }

  /** Create a fingerprint for a normalized item. */
  protected createFingerprint(normalized: NormalizedContent): string {
    const key = `${normalized.url}|${normalized.title}|${normalized.publishedAt ?? ""}`;
    // Simple hash for fingerprinting
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `${this.source.id}:${Math.abs(hash).toString(36)}`;
  }

  /** Extract domain from a URL for rate limiting. */
  protected extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  /** Normalize a raw item into a full CollectedItem. */
  private async normalizeToItem(raw: unknown): Promise<CollectedItem> {
    const normalized = await this.normalize(raw);
    const fingerprint = this.createFingerprint(normalized);
    return {
      fingerprint,
      raw,
      normalized,
      sourceId: this.source.id,
      fetchedAt: new Date().toISOString(),
      url: normalized.url || this.source.url,
    };
  }

  /** Expose retry config for subclasses. */
  protected get retryConfig(): RetryConfig {
    return this.config.retry;
  }
}
