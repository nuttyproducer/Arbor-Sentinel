import { describe, it, expect, vi, beforeEach } from "vitest";
import { withRetry, computeBackoff } from "../retry";
import { FetchError, ParseError, AuthError, TimeoutError } from "../errors";
import type { RetryConfig } from "../types";

function makeRetryConfig(overrides: Partial<RetryConfig> = {}): RetryConfig {
  return {
    maxRetries: 3,
    initialDelayMs: 100,
    backoffMultiplier: 2.0,
    maxDelayMs: 5000,
    jitter: false,
    retryableStatuses: [429, 500, 502, 503, 504],
    ...overrides,
  };
}

describe("withRetry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns success on first attempt", async () => {
    const operation = vi.fn().mockResolvedValue("result");

    const promise = withRetry(operation, makeRetryConfig(), "src-1");
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.success).toBe(true);
    expect(result.result).toBe("result");
    expect(result.totalAttempts).toBe(1);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("retries on transient errors and succeeds on retry", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new FetchError("Network error", { sourceId: "src-1", url: "https://example.com", attempt: 1 }))
      .mockRejectedValueOnce(new TimeoutError("Timeout", { sourceId: "src-1", url: "https://example.com", attempt: 2, timeoutMs: 5000 }))
      .mockResolvedValue("success-after-retries");

    const promise = withRetry(operation, makeRetryConfig(), "src-1");

    // Advance timers between retries
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(200);
    await vi.runAllTimersAsync();

    const result = await promise;

    expect(result.success).toBe(true);
    expect(result.result).toBe("success-after-retries");
    expect(result.totalAttempts).toBe(3);
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("stops immediately on fatal (non-retryable) errors", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new ParseError("Parse failed", { sourceId: "src-1", url: "https://example.com", attempt: 1 }));

    const promise = withRetry(operation, makeRetryConfig(), "src-1");
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.success).toBe(false);
    expect(result.totalAttempts).toBe(1); // No retries on fatal
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("stops immediately on AuthError (fatal)", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new AuthError("Bad credentials", { sourceId: "src-1", url: "https://example.com", attempt: 1 }));

    const promise = withRetry(operation, makeRetryConfig(), "src-1");
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.success).toBe(false);
    expect(result.totalAttempts).toBe(1);
  });

  it("fails after exhausting all retries", async () => {
    const operation = vi.fn().mockRejectedValue(
      new FetchError("Persistent network error", { sourceId: "src-1", url: "https://example.com", attempt: 1 }),
    );

    const promise = withRetry(
      operation,
      makeRetryConfig({ maxRetries: 2 }),
      "src-1",
    );

    // Run all timers for each retry
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.success).toBe(false);
    expect(result.totalAttempts).toBe(3); // 1 initial + 2 retries
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("passes attempt number to operation", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new FetchError("err1", { sourceId: "src-1", url: "https://example.com", attempt: 1 }))
      .mockResolvedValue("ok");

    const promise = withRetry(operation, makeRetryConfig(), "src-1");
    await vi.runAllTimersAsync();
    await promise;

    expect(operation).toHaveBeenNthCalledWith(1, 1);
    expect(operation).toHaveBeenNthCalledWith(2, 2);
  });

  it("reports total duration across all attempts", async () => {
    const operation = vi.fn().mockResolvedValue("ok");

    const promise = withRetry(operation, makeRetryConfig(), "src-1");
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.totalDurationMs).toBeGreaterThanOrEqual(0);
  });
});

describe("computeBackoff", () => {
  it("computes exponential backoff without jitter", () => {
    const config = makeRetryConfig({
      initialDelayMs: 1000,
      backoffMultiplier: 2,
      maxDelayMs: 30000,
      jitter: false,
    });

    expect(computeBackoff(1, config)).toBe(1000);  // 1000 * 2^0
    expect(computeBackoff(2, config)).toBe(2000);  // 1000 * 2^1
    expect(computeBackoff(3, config)).toBe(4000);  // 1000 * 2^2
    expect(computeBackoff(4, config)).toBe(8000);  // 1000 * 2^3
  });

  it("caps at maxDelayMs", () => {
    const config = makeRetryConfig({
      initialDelayMs: 1000,
      backoffMultiplier: 10,
      maxDelayMs: 5000,
      jitter: false,
    });

    // 1000 * 10^2 = 100000, but capped at 5000
    expect(computeBackoff(3, config)).toBe(5000);
  });

  it("applies jitter when enabled", () => {
    const config = makeRetryConfig({
      initialDelayMs: 1000,
      backoffMultiplier: 2,
      jitter: true,
    });

    const result = computeBackoff(1, config);
    // With jitter, 1000 should be multiplied by random factor in [0.5, 1.0]
    expect(result).toBeGreaterThanOrEqual(500);
    expect(result).toBeLessThanOrEqual(1000);
  });
});
