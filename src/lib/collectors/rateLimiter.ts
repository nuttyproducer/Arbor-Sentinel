import type { RateLimitConfig } from "./types";
import { RateLimitError } from "./errors";

/** State tracked per domain for rate limiting. */
interface DomainState {
  /** Timestamps of recent requests, used for sliding-window counting. */
  requestTimestamps: number[];
  /** Number of currently in-flight requests. */
  inFlight: number;
  /** If the domain is blocked until a specific timestamp. */
  blockedUntil: number | null;
}

/** State tracked per source for rate limiting. */
interface SourceState {
  /** Timestamp of the last request made to this source. */
  lastRequestAt: number;
}

/**
 * RateLimiter enforces per-source delays, per-domain limits,
 * and burst handling. It is NOT a singleton — each CollectorRegistry
 * should create its own instance.
 */
export class RateLimiter {
  private readonly domainStates = new Map<string, DomainState>();
  private readonly sourceStates = new Map<string, SourceState>();

  /**
   * Wait until it is safe to make a request to the given source/domain.
   * Resolves immediately if no limits are exceeded. Otherwise delays
   * until the limit window clears.
   *
   * @throws {RateLimitError} if the domain is currently blocked.
   */
  async acquire(
    sourceId: string,
    domain: string,
    config: RateLimitConfig,
  ): Promise<void> {
    const now = Date.now();

    // ── Check domain block ──────────────────────────────────────────────
    const domainState = this.getOrCreateDomainState(domain);

    if (domainState.blockedUntil !== null && now < domainState.blockedUntil) {
      const retryAfter = Math.ceil((domainState.blockedUntil - now) / 1000);
      throw new RateLimitError(
        `Domain "${domain}" is rate-limited until ${new Date(domainState.blockedUntil).toISOString()}`,
        { sourceId, attempt: 1, retryAfterSeconds: retryAfter },
      );
    }

    // ── Enforce max concurrent requests ─────────────────────────────────
    if (domainState.inFlight >= config.maxConcurrent) {
      // Wait for an in-flight slot to free up
      await this.waitForSlot(domain, config.maxConcurrent);
    }

    // ── Enforce requests-per-minute via sliding window ──────────────────
    const windowStart = now - 60_000;
    domainState.requestTimestamps = domainState.requestTimestamps.filter(
      (t) => t > windowStart,
    );

    if (domainState.requestTimestamps.length >= config.maxRequestsPerMinute) {
      const oldestInWindow = domainState.requestTimestamps[0];
      if (oldestInWindow) {
        const waitMs = oldestInWindow - windowStart + 1;
        await this.delay(waitMs);
      }
    }

    // ── Enforce burst size ─────────────────────────────────────────────
    const burstWindow = now - 1000;
    const recentCount = domainState.requestTimestamps.filter(
      (t) => t > burstWindow,
    ).length;

    if (recentCount >= config.burstSize) {
      // Delay to spread burst
      await this.delay(config.minDelayMs);
    }

    // ── Enforce per-source min delay ───────────────────────────────────
    const sourceState = this.getOrCreateSourceState(sourceId);
    const timeSinceLast = now - sourceState.lastRequestAt;
    if (timeSinceLast < config.minDelayMs) {
      await this.delay(config.minDelayMs - timeSinceLast);
    }

    // ── Record this request ────────────────────────────────────────────
    const acquireTime = Date.now();
    domainState.requestTimestamps.push(acquireTime);
    domainState.inFlight++;
    sourceState.lastRequestAt = acquireTime;
  }

  /** Mark a request as complete, freeing an in-flight slot. */
  release(domain: string): void {
    const state = this.domainStates.get(domain);
    if (state && state.inFlight > 0) {
      state.inFlight--;
    }
  }

  /**
   * Block a domain for a specified duration. Used when a source returns
   * a Retry-After header or when rate limit errors are detected.
   */
  blockDomain(domain: string, durationMs: number): void {
    const state = this.getOrCreateDomainState(domain);
    state.blockedUntil = Date.now() + durationMs;
  }

  /** Clear the block on a domain. */
  unblockDomain(domain: string): void {
    const state = this.domainStates.get(domain);
    if (state) {
      state.blockedUntil = null;
    }
  }

  /** Check if a domain is currently blocked. */
  isBlocked(domain: string): boolean {
    const state = this.domainStates.get(domain);
    if (!state || state.blockedUntil === null) return false;
    if (Date.now() >= state.blockedUntil) {
      state.blockedUntil = null;
      return false;
    }
    return true;
  }

  /** Get current in-flight count for a domain. */
  getInFlight(domain: string): number {
    return this.domainStates.get(domain)?.inFlight ?? 0;
  }

  /** Reset all state (for testing). */
  reset(): void {
    this.domainStates.clear();
    this.sourceStates.clear();
  }

  // ── Private helpers ───────────────────────────────────────────────────

  private getOrCreateDomainState(domain: string): DomainState {
    let state = this.domainStates.get(domain);
    if (!state) {
      state = { requestTimestamps: [], inFlight: 0, blockedUntil: null };
      this.domainStates.set(domain, state);
    }
    return state;
  }

  private getOrCreateSourceState(sourceId: string): SourceState {
    let state = this.sourceStates.get(sourceId);
    if (!state) {
      state = { lastRequestAt: 0 };
      this.sourceStates.set(sourceId, state);
    }
    return state;
  }

  private async waitForSlot(
    domain: string,
    maxConcurrent: number,
  ): Promise<void> {
    const start = Date.now();
    const maxWait = 30_000; // 30s max wait

    while (Date.now() - start < maxWait) {
      const state = this.domainStates.get(domain);
      if (!state || state.inFlight < maxConcurrent) return;
      await this.delay(100);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
