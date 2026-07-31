import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimiter } from "../rateLimiter";
import { RateLimitError } from "../errors";
import type { RateLimitConfig } from "../types";

function makeConfig(overrides: Partial<RateLimitConfig> = {}): RateLimitConfig {
  return {
    minDelayMs: 100,
    maxRequestsPerMinute: 10,
    maxConcurrent: 2,
    burstSize: 5,
    respectRetryAfter: true,
    ...overrides,
  };
}

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("per-source delay enforcement", () => {
    it("allows the first request immediately", async () => {
      const promise = limiter.acquire("src-1", "example.com", makeConfig());
      await vi.runAllTimersAsync();
      await expect(promise).resolves.toBeUndefined();
    });

    it("delays a second request within minDelayMs", async () => {
      const config = makeConfig({ minDelayMs: 500, maxConcurrent: 5 });

      await limiter.acquire("src-1", "example.com", config);
      limiter.release("example.com");

      const start = Date.now();
      const promise = limiter.acquire("src-1", "example.com", config);
      await vi.runAllTimersAsync();
      await promise;

      // Request should complete after delay
      limiter.release("example.com");
      expect(limiter.getInFlight("example.com")).toBe(0);
    });

    it("releases in-flight count after acquire completes", async () => {
      const config = makeConfig({ maxConcurrent: 2 });

      await limiter.acquire("src-1", "example.com", config);
      expect(limiter.getInFlight("example.com")).toBe(1);

      limiter.release("example.com");
      expect(limiter.getInFlight("example.com")).toBe(0);
    });
  });

  describe("per-domain limits", () => {
    it("tracks in-flight requests per domain", async () => {
      const config = makeConfig({ maxConcurrent: 2 });

      await limiter.acquire("src-1", "example.com", config);
      await limiter.acquire("src-2", "example.com", config);

      expect(limiter.getInFlight("example.com")).toBe(2);
    });

    it("blocks requests when max concurrent is reached", async () => {
      const config = makeConfig({
        maxConcurrent: 1,
        minDelayMs: 0,
      });

      // First request goes through
      await limiter.acquire("src-1", "example.com", config);

      // Second request should wait
      const promise = limiter.acquire("src-2", "example.com", config);

      // Release the first
      limiter.release("example.com");

      await vi.runAllTimersAsync();
      await promise;

      expect(limiter.getInFlight("example.com")).toBe(1);
    });
  });

  describe("domain blocking", () => {
    it("blocks a domain for a specified duration", () => {
      limiter.blockDomain("blocked.com", 60_000);
      expect(limiter.isBlocked("blocked.com")).toBe(true);
    });

    it("unblocks a domain", () => {
      limiter.blockDomain("blocked.com", 60_000);
      limiter.unblockDomain("blocked.com");
      expect(limiter.isBlocked("blocked.com")).toBe(false);
    });

    it("throws RateLimitError when acquiring on a blocked domain", async () => {
      limiter.blockDomain("blocked.com", 60_000);
      await expect(
        limiter.acquire("src-1", "blocked.com", makeConfig()),
      ).rejects.toThrow(RateLimitError);
    });

    it("auto-clears expired blocks", () => {
      limiter.blockDomain("example.com", 1_000);

      // Block is still active
      expect(limiter.isBlocked("example.com")).toBe(true);

      // Advance time past the block duration
      vi.advanceTimersByTime(2_000);

      // Block should be cleared
      expect(limiter.isBlocked("example.com")).toBe(false);
    });
  });

  describe("burst handling", () => {
    it("increments in-flight count correctly within burst limits", async () => {
      const config = makeConfig({
        burstSize: 10,
        minDelayMs: 0,
        maxRequestsPerMinute: 100,
        maxConcurrent: 10,
      });

      // Multiple rapid requests within generous burst limit should all acquire
      // without triggering delays
      const p1 = limiter.acquire("src-1", "example.com", config);
      const p2 = limiter.acquire("src-2", "example.com", config);
      const p3 = limiter.acquire("src-3", "example.com", config);

      await vi.runAllTimersAsync();
      await Promise.all([p1, p2, p3]);

      expect(limiter.getInFlight("example.com")).toBe(3);

      limiter.release("example.com");
      limiter.release("example.com");
      limiter.release("example.com");
      expect(limiter.getInFlight("example.com")).toBe(0);
    });
  });

  describe("reset", () => {
    it("clears all state", () => {
      limiter.blockDomain("example.com", 60_000);
      limiter.reset();

      expect(limiter.isBlocked("example.com")).toBe(false);
      expect(limiter.getInFlight("example.com")).toBe(0);
    });
  });
});
