// src/lib/ai/ErrorHandler.ts

import type { AIError } from "./types";

/** Retry configuration. */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
  jitter: boolean;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 30000,
  jitter: true,
};

/** Extended retry config for rate limit errors. */
const RATE_LIMIT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  initialDelayMs: 2000,
  backoffMultiplier: 2,
  maxDelayMs: 60000,
  jitter: true,
};

/** Context-length errors get one retry after truncation. */
const CONTEXT_LENGTH_RETRY_CONFIG: RetryConfig = {
  maxRetries: 1,
  initialDelayMs: 500,
  backoffMultiplier: 1,
  maxDelayMs: 1000,
  jitter: false,
};

/**
 * Classifies and retries AI operation errors.
 *
 * - transient (5xx, network) → retry 3x with exponential backoff + jitter
 * - rate_limit (429) → retry 5x with longer backoff
 * - context_length → retry 1x after truncation
 * - content_filter / permanent → fail immediately, no retry
 */
export class ErrorHandler {
  /**
   * Classify an error into a structured AIError.
   */
  classify(error: unknown): AIError {
    if (error instanceof AIRequestError) {
      return error.aiError;
    }

    const message = error instanceof Error ? error.message : String(error);
    const lower = message.toLowerCase();

    // Rate limit detection
    if (lower.includes("429") || lower.includes("rate limit") || lower.includes("too many requests")) {
      return {
        type: "rate_limit",
        message,
        retryable: true,
        cause: error,
      };
    }

    // Context length detection
    if (
      lower.includes("context length") ||
      lower.includes("too long") ||
      lower.includes("maximum context") ||
      lower.includes("token limit") ||
      lower.includes("reduce the length")
    ) {
      return {
        type: "context_length",
        message,
        retryable: true,
        cause: error,
      };
    }

    // Content filter detection
    if (
      lower.includes("content filter") ||
      lower.includes("content_policy") ||
      lower.includes("safety") ||
      lower.includes("blocked")
    ) {
      return {
        type: "content_filter",
        message,
        retryable: false,
        cause: error,
      };
    }

    // Transient errors (5xx, network, timeout)
    if (
      lower.includes("500") ||
      lower.includes("502") ||
      lower.includes("503") ||
      lower.includes("504") ||
      lower.includes("timeout") ||
      lower.includes("econnrefused") ||
      lower.includes("enotfound") ||
      lower.includes("network") ||
      lower.includes("abort")
    ) {
      return {
        type: "transient",
        message,
        retryable: true,
        cause: error,
      };
    }

    // Default: permanent
    return {
      type: "permanent",
      message,
      retryable: false,
      cause: error,
    };
  }

  /**
   * Execute a function with retry logic based on error classification.
   */
  async withRetry<T>(
    fn: () => Promise<T>,
    config?: RetryConfig,
  ): Promise<T> {
    const retryConfig = config ?? DEFAULT_RETRY_CONFIG;
    let attempt = 0;

    const tryOnce = async (remainingRetries: number): Promise<T> => {
      try {
        return await fn();
      } catch (error) {
        const classified = this.classify(error);

        if (!classified.retryable || remainingRetries <= 0) {
          throw new AIRequestError(classified);
        }

        // Select retry config based on error type
        const effectiveConfig =
          classified.type === "rate_limit"
            ? RATE_LIMIT_RETRY_CONFIG
            : classified.type === "context_length"
              ? CONTEXT_LENGTH_RETRY_CONFIG
              : retryConfig;

        attempt += 1;
        const delay = calculateDelay(attempt, effectiveConfig);
        await sleep(delay);
        return tryOnce(remainingRetries - 1);
      }
    };

    return tryOnce(retryConfig.maxRetries);
  }
}

/** Error class wrapping a classified AIError. */
export class AIRequestError extends Error {
  public readonly aiError: AIError;

  constructor(aiError: AIError) {
    super(aiError.message);
    this.name = "AIRequestError";
    this.aiError = aiError;
  }
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  let delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
  delay = Math.min(delay, config.maxDelayMs);

  if (config.jitter) {
    delay = delay * (0.5 + Math.random() * 0.5);
  }

  return Math.floor(delay);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
