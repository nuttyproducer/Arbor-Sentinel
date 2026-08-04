// src/lib/ai/RateLimiter.ts

/** Configuration for the token-bucket rate limiter. */
export interface RateLimiterConfig {
  /** Maximum tokens allowed per minute. */
  maxTokensPerMinute: number;
  /** Maximum requests allowed per minute. */
  maxRequestsPerMinute: number;
  /** Maximum concurrent in-flight requests. */
  maxConcurrent: number;
}

/** Default rate limits for DeepSeek. */
export const DEFAULT_RATE_LIMITS: RateLimiterConfig = {
  maxTokensPerMinute: 1_000_000,
  maxRequestsPerMinute: 60,
  maxConcurrent: 5,
};

/** Rolling window length in milliseconds. */
const WINDOW_MS = 60_000;

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

interface QueueEntry {
  estimatedTokens: number;
  resolve: () => void;
}

/**
 * Token-bucket rate limiter for AI provider calls.
 *
 * Enforces per-minute token and request limits, plus max concurrency.
 * Call `acquire()` before each provider request and `release()` after.
 *
 * Requests are granted in FIFO order. When a limit is hit, the request is
 * queued and released as soon as capacity frees up (a `release()` frees a
 * concurrent slot) or the token bucket / request window refills (a backstop
 * timer re-evaluates the queue). Every grant increments `activeRequests`;
 * each completed request must call `release()` exactly once to balance it.
 */
export class RateLimiter {
  private tokenBucket: TokenBucket;
  private requestCount: number;
  private requestWindowStart: number;
  private activeRequestCount: number;
  private queue: QueueEntry[];
  private config: RateLimiterConfig;
  private drainScheduled = false;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = { ...DEFAULT_RATE_LIMITS, ...config };
    this.tokenBucket = {
      tokens: this.config.maxTokensPerMinute,
      lastRefill: Date.now(),
    };
    this.requestCount = 0;
    this.requestWindowStart = Date.now();
    this.activeRequestCount = 0;
    this.queue = [];
  }

  /**
   * Acquire capacity for a request with estimated token usage.
   * Resolves when capacity is available. May wait if limits are hit.
   */
  async acquire(estimatedTokens: number = 1000): Promise<void> {
    await new Promise<void>((resolve) => {
      this.queue.push({ estimatedTokens, resolve });
      this.scheduleDrain();
    });
  }

  /** Release capacity after a request completes. */
  release(_tokensUsed: number): void {
    this.activeRequestCount = Math.max(0, this.activeRequestCount - 1);
    this.scheduleDrain();
  }

  /** Current available tokens in the bucket. */
  get availableTokens(): number {
    this.refillTokenBucket();
    return this.tokenBucket.tokens;
  }

  /** Currently active (in-flight) requests. */
  get activeRequests(): number {
    return this.activeRequestCount;
  }

  /** Number of requests waiting in queue. */
  get queueLength(): number {
    return this.queue.length;
  }

  // ── Queue scheduling ────────────────────────────────────────────────────

  private scheduleDrain(): void {
    if (this.drainScheduled) return;
    this.drainScheduled = true;
    queueMicrotask(() => {
      this.drainScheduled = false;
      this.drain();
    });
  }

  /**
   * Grant capacity to as many queued requests as the current limits allow.
   * Head-of-line: the first queued request is granted before later ones.
   */
  private drain(): void {
    while (this.queue.length > 0) {
      this.refillTokenBucket();
      this.resetRequestWindowIfNeeded();

      const entry = this.queue[0];

      if (this.activeRequestCount >= this.config.maxConcurrent) {
        // Wait for a release() to free a concurrent slot.
        this.cancelRetry();
        return;
      }

      if (this.tokenBucket.tokens < entry.estimatedTokens) {
        // Not enough tokens — retry once the bucket refills enough.
        this.scheduleRetry(this.msUntilTokens(entry.estimatedTokens));
        return;
      }

      if (this.requestCount >= this.config.maxRequestsPerMinute) {
        // Request window exhausted — retry after the window resets.
        this.scheduleRetry(this.msUntilWindowReset());
        return;
      }

      // Grant capacity.
      this.queue.shift();
      this.tokenBucket.tokens -= entry.estimatedTokens;
      this.requestCount++;
      this.activeRequestCount++;
      entry.resolve();
    }

    this.cancelRetry();
  }

  private scheduleRetry(delayMs: number): void {
    this.cancelRetry();
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.drain();
    }, Math.max(0, delayMs));
  }

  private cancelRetry(): void {
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  // ── Window helpers ──────────────────────────────────────────────────────

  private msUntilTokens(estimatedTokens: number): number {
    this.refillTokenBucket();
    const deficit = estimatedTokens - this.tokenBucket.tokens;
    if (deficit <= 0) return 0;
    return Math.ceil((deficit * WINDOW_MS) / this.config.maxTokensPerMinute);
  }

  private msUntilWindowReset(): number {
    const now = Date.now();
    return Math.max(0, WINDOW_MS - (now - this.requestWindowStart));
  }

  private refillTokenBucket(): void {
    const now = Date.now();
    const elapsed = now - this.tokenBucket.lastRefill;
    const refill = elapsed * (this.config.maxTokensPerMinute / WINDOW_MS);
    this.tokenBucket.tokens = Math.min(
      this.config.maxTokensPerMinute,
      this.tokenBucket.tokens + refill,
    );
    this.tokenBucket.lastRefill = now;
  }

  private resetRequestWindowIfNeeded(): void {
    const now = Date.now();
    if (now - this.requestWindowStart >= WINDOW_MS) {
      this.requestCount = 0;
      this.requestWindowStart = now;
    }
  }
}
