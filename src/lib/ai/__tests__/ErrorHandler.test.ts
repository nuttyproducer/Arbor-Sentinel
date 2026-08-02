// src/lib/ai/__tests__/ErrorHandler.test.ts

import { describe, it, expect, vi, afterEach } from "vitest";
import { ErrorHandler, AIRequestError } from "../ErrorHandler";

describe("ErrorHandler.classify", () => {
  const handler = new ErrorHandler();

  it("classifies 429 as rate_limit", () => {
    const result = handler.classify(new Error("HTTP 429: Too Many Requests"));
    expect(result.type).toBe("rate_limit");
    expect(result.retryable).toBe(true);
  });

  it("classifies 'rate limit' message as rate_limit", () => {
    const result = handler.classify(new Error("rate limit exceeded"));
    expect(result.type).toBe("rate_limit");
    expect(result.retryable).toBe(true);
  });

  it("classifies context length errors", () => {
    const result = handler.classify(new Error("maximum context length exceeded"));
    expect(result.type).toBe("context_length");
    expect(result.retryable).toBe(true);
  });

  it("classifies token limit errors", () => {
    const result = handler.classify(new Error("token limit reached, reduce the length"));
    expect(result.type).toBe("context_length");
    expect(result.retryable).toBe(true);
  });

  it("classifies content filter errors", () => {
    const result = handler.classify(new Error("content filter blocked response"));
    expect(result.type).toBe("content_filter");
    expect(result.retryable).toBe(false);
  });

  it("classifies 500 errors as transient", () => {
    const result = handler.classify(new Error("HTTP 500: Internal Server Error"));
    expect(result.type).toBe("transient");
    expect(result.retryable).toBe(true);
  });

  it("classifies 502/503/504 as transient", () => {
    expect(handler.classify(new Error("502 Bad Gateway")).type).toBe("transient");
    expect(handler.classify(new Error("503 Service Unavailable")).type).toBe("transient");
    expect(handler.classify(new Error("504 Gateway Timeout")).type).toBe("transient");
  });

  it("classifies timeout as transient", () => {
    const result = handler.classify(new Error("request timeout"));
    expect(result.type).toBe("transient");
    expect(result.retryable).toBe(true);
  });

  it("classifies network errors as transient", () => {
    const result = handler.classify(new Error("network error: ECONNREFUSED"));
    expect(result.type).toBe("transient");
    expect(result.retryable).toBe(true);
  });

  it("classifies unknown errors as permanent", () => {
    const result = handler.classify(new Error("something completely unexpected"));
    expect(result.type).toBe("permanent");
    expect(result.retryable).toBe(false);
  });

  it("classifies non-Error values", () => {
    const result = handler.classify("a plain string error");
    expect(result.type).toBe("permanent");
    expect(result.retryable).toBe(false);
  });
});

describe("ErrorHandler.withRetry", () => {
  const handler = new ErrorHandler();

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns result on first success", async () => {
    const fn = vi.fn().mockResolvedValue("success");
    const result = await handler.withRetry(fn);
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries transient errors and succeeds", async () => {
    // Backoff sleeps are real (up to seconds) — use fake timers so the test
    // verifies the retry behavior without waiting out the wall-clock delays.
    vi.useFakeTimers();
    try {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error("HTTP 500"))
        .mockRejectedValueOnce(new Error("HTTP 503"))
        .mockResolvedValue("eventual success");

      const resultPromise = handler.withRetry(fn);
      await vi.advanceTimersByTimeAsync(120_000);
      await expect(resultPromise).resolves.toBe("eventual success");
      expect(fn).toHaveBeenCalledTimes(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it("throws AIRequestError after exhausting retries", async () => {
    vi.useFakeTimers();
    try {
      const fn = vi.fn().mockRejectedValue(new Error("HTTP 500"));

      const resultPromise = handler.withRetry(fn);
      // Attach the rejection handler before advancing timers so the promise
      // is handled the moment it rejects during the advance.
      const rejection = expect(resultPromise).rejects.toThrow(AIRequestError);
      await vi.advanceTimersByTimeAsync(120_000);
      await rejection;
      expect(fn).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not retry permanent errors", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("permanent failure"));

    await expect(handler.withRetry(fn)).rejects.toThrow(AIRequestError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not retry content filter errors", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("content filter blocked"));

    await expect(handler.withRetry(fn)).rejects.toThrow(AIRequestError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries rate limit errors more times", async () => {
    vi.useFakeTimers();
    try {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error("429 rate limit"))
        .mockRejectedValueOnce(new Error("429 rate limit"))
        .mockResolvedValue("success");

      const resultPromise = handler.withRetry(fn);
      await vi.advanceTimersByTimeAsync(120_000);
      await expect(resultPromise).resolves.toBe("success");
      expect(fn).toHaveBeenCalledTimes(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it("respects custom retry config", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("HTTP 500"));

    await expect(
      handler.withRetry(fn, { maxRetries: 1, initialDelayMs: 10, backoffMultiplier: 1, maxDelayMs: 100, jitter: false }),
    ).rejects.toThrow(AIRequestError);
    expect(fn).toHaveBeenCalledTimes(2); // 1 initial + 1 retry
  });
});
