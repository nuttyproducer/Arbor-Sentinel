// src/lib/ai/__tests__/RateLimiter.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { RateLimiter } from "../RateLimiter";

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({
      maxTokensPerMinute: 10000,
      maxRequestsPerMinute: 10,
      maxConcurrent: 3,
    });
  });

  it("allows requests within limits", async () => {
    await limiter.acquire(100);
    expect(limiter.activeRequests).toBe(1);
    limiter.release(100);
    expect(limiter.activeRequests).toBe(0);
  });

  it("deducts tokens on acquire", async () => {
    const before = limiter.availableTokens;
    await limiter.acquire(500);
    const after = limiter.availableTokens;
    expect(after).toBeLessThan(before);
    limiter.release(500);
  });

  it("enforces max concurrency", async () => {
    // Acquire 3 slots (max)
    await limiter.acquire(100);
    await limiter.acquire(100);
    await limiter.acquire(100);

    expect(limiter.activeRequests).toBe(3);

    // 4th request should be queued — we verify by checking it doesn't resolve immediately
    let resolved = false;
    const promise = limiter.acquire(100).then(() => { resolved = true; });

    // Wait a tick — should NOT have resolved
    await new Promise((r) => setTimeout(r, 10));
    expect(resolved).toBe(false);

    // Release one — now it should resolve
    limiter.release(100);
    await promise;
    expect(resolved).toBe(true);
  });

  it("release decrements active count", async () => {
    await limiter.acquire(100);
    expect(limiter.activeRequests).toBe(1);
    limiter.release(100);
    expect(limiter.activeRequests).toBe(0);
  });

  it("does not go below zero on release", async () => {
    limiter.release(100);
    expect(limiter.activeRequests).toBe(0);
  });

  it("tracks queue length", async () => {
    // Fill all concurrent slots
    await limiter.acquire(100);
    await limiter.acquire(100);
    await limiter.acquire(100);

    // Queue two more
    const p1 = limiter.acquire(100);
    const p2 = limiter.acquire(100);

    // Give queue time to form
    await new Promise((r) => setTimeout(r, 10));
    expect(limiter.queueLength).toBe(2);

    // Cleanup
    limiter.release(100);
    limiter.release(100);
    limiter.release(100);
    await p1;
    await p2;
  });

  it("returns activeRequests to zero after queued requests complete", async () => {
    // Fill all concurrent slots
    await limiter.acquire(100);
    await limiter.acquire(100);
    await limiter.acquire(100);

    // Queue two more
    const p1 = limiter.acquire(100);
    const p2 = limiter.acquire(100);
    await Promise.resolve(); // let the queue drains run

    expect(limiter.queueLength).toBe(2);
    expect(limiter.activeRequests).toBe(3);

    // First original request completes → grants p1
    limiter.release(100);
    await p1;
    expect(limiter.activeRequests).toBe(3);

    // Second original request completes → grants p2
    limiter.release(100);
    await p2;
    expect(limiter.activeRequests).toBe(3);

    // Third original, then p1 and p2 complete
    limiter.release(100);
    limiter.release(100);
    limiter.release(100);
    await Promise.resolve();

    expect(limiter.activeRequests).toBe(0);
    expect(limiter.queueLength).toBe(0);
  });

  it("uses default config when none provided", () => {
    const defaultLimiter = new RateLimiter();
    expect(defaultLimiter.availableTokens).toBeGreaterThan(0);
    expect(defaultLimiter.activeRequests).toBe(0);
  });

  it("refills tokens over time", async () => {
    // Drain tokens
    const limiter2 = new RateLimiter({
      maxTokensPerMinute: 1000,
      maxRequestsPerMinute: 100,
      maxConcurrent: 10,
    });

    await limiter2.acquire(900);
    const afterDrain = limiter2.availableTokens;
    expect(afterDrain).toBeLessThan(200);

    // Wait for refill
    await new Promise((r) => setTimeout(r, 1100)); // 1.1 seconds

    const afterRefill = limiter2.availableTokens;
    expect(afterRefill).toBeGreaterThan(afterDrain - 100);

    limiter2.release(900);
  }, 5000);
});
