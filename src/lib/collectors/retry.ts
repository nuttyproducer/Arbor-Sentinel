import type { RetryConfig } from "./types";
import { isFatalError } from "./errors";

/** Result of a retry operation. */
export interface RetryResult<T> {
  /** Whether the operation succeeded. */
  success: boolean;
  /** The result, if successful. */
  result?: T;
  /** The error that caused the final failure, if unsuccessful. */
  error?: unknown;
  /** Total number of attempts made (1 + retries). */
  totalAttempts: number;
  /** Total time spent across all attempts, in ms. */
  totalDurationMs: number;
}

/**
 * Execute an async operation with retry logic.
 *
 * Retries are attempted on transient errors. Fatal errors (parse,
 * validation, auth) are NOT retried and immediately reject.
 *
 * Exponential backoff: delay = min(initialDelay * backoffMultiplier^attempt, maxDelay)
 * Jitter (when enabled): delay = delay * (0.5 + random * 0.5)
 */
export async function withRetry<T>(
  operation: (attempt: number) => Promise<T>,
  config: RetryConfig,
  sourceId: string,
): Promise<RetryResult<T>> {
  const startTime = Date.now();
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      const result = await operation(attempt);
      return {
        success: true,
        result,
        totalAttempts: attempt,
        totalDurationMs: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error;

      // ── Fatal errors: stop immediately ────────────────────────────
      if (isFatalError(error)) {
        return {
          success: false,
          error,
          totalAttempts: attempt,
          totalDurationMs: Date.now() - startTime,
        };
      }

      // ── No more retries ──────────────────────────────────────────
      if (attempt > config.maxRetries) {
        return {
          success: false,
          error,
          totalAttempts: attempt,
          totalDurationMs: Date.now() - startTime,
        };
      }

      // ── Calculate backoff delay ──────────────────────────────────
      const delay = computeBackoff(attempt, config);
      await sleep(delay);
    }
  }

  return {
    success: false,
    error: lastError,
    totalAttempts: config.maxRetries + 1,
    totalDurationMs: Date.now() - startTime,
  };
}

/**
 * Compute backoff delay for a given attempt number.
 * Formula: initialDelay * backoffMultiplier^(attempt-1), capped at maxDelay.
 * With jitter: multiplies by random factor in [0.5, 1.0].
 */
export function computeBackoff(
  attempt: number,
  config: RetryConfig,
): number {
  const exponential = config.initialDelayMs * Math.pow(
    config.backoffMultiplier,
    attempt - 1,
  );
  const capped = Math.min(exponential, config.maxDelayMs);

  if (config.jitter) {
    const jitterFactor = 0.5 + Math.random() * 0.5;
    return Math.round(capped * jitterFactor);
  }

  return Math.round(capped);
}

/** Determine whether an HTTP status code is retryable per config. */
export function isRetryableStatus(
  status: number,
  config: RetryConfig,
): boolean {
  return config.retryableStatuses.includes(status);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
