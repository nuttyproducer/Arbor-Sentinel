import type {
  CollectorConfig,
  CollectedItem,
  CollectResult,
  CollectError,
  NormalizedContent,
  PipelineStageDurations,
  StorageInterface,
} from "./types";
import { PIPELINE_STAGES, DEFAULT_RETRY_CONFIG } from "./types";
import type { RetryConfig } from "./types";
import { RateLimiter } from "./rateLimiter";
import { withRetry } from "./retry";
import { FetchError, TimeoutError, RateLimitError } from "./errors";
import type { SourceRecord } from "../../types/content";

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
      store: 0,
    };

    let rawItems: unknown[] = [];
    let validatedItems: unknown[] = [];
    let collectedItems: CollectedItem[] = [];
    let deduplicatedItems: CollectedItem[] = [];
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

      // ── Stage 5: Store ──────────────────────────────────────────
      const storeStart = Date.now();
      for (const item of deduplicatedItems) {
        await this.storage.save(item);
        storedCount++;
      }
      durations.store = Date.now() - storeStart;

      return {
        runId,
        sourceId: this.source.id,
        startedAt,
        completedAt: new Date().toISOString(),
        itemsFetched: rawItems.length,
        itemsValidated: validatedItems.length,
        itemsNormalized: collectedItems.length,
        itemsDeduplicated: deduplicatedItems.length,
        itemsStored: storedCount,
        stageDurations: durations,
        success: true,
      };
    } catch (error) {
      const stage =
        durations.fetch > 0 && durations.validate === 0
          ? "validate"
          : durations.validate > 0 && durations.normalize === 0
            ? "normalize"
            : durations.normalize > 0 && durations.deduplicate === 0
              ? "deduplicate"
              : "fetch";

      const collectError: CollectError = {
        type: "unknown",
        message: error instanceof Error ? error.message : String(error),
        sourceId: this.source.id,
        url: this.source.url,
        attempt: 1,
        stage,
        timestamp: new Date().toISOString(),
        retryable: false,
      };

      return {
        runId,
        sourceId: this.source.id,
        startedAt,
        completedAt: new Date().toISOString(),
        itemsFetched: rawItems.length,
        itemsValidated: validatedItems.length,
        itemsNormalized: collectedItems.length,
        itemsDeduplicated: deduplicatedItems.length,
        itemsStored: storedCount,
        stageDurations: durations,
        success: false,
      };
    }
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
      (attempt) => operation(),
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
