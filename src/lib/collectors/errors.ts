import type { CollectError, CollectErrorType, PipelineStageName } from "./types";

/** Base class for all collector errors. */
export abstract class CollectorError extends Error {
  /** Error type for classification. */
  abstract readonly type: CollectErrorType;
  /** Source ID where the error occurred. */
  readonly sourceId: string;
  /** URL being fetched when the error occurred. */
  readonly url?: string;
  /** Which attempt this error occurred on (1-based). */
  readonly attempt: number;
  /** Pipeline stage where the error occurred. */
  readonly stage: PipelineStageName;
  /** Whether this error is retryable. */
  readonly retryable: boolean;

  constructor(
    message: string,
    context: {
      sourceId: string;
      url?: string;
      attempt: number;
      stage: PipelineStageName;
      retryable: boolean;
    },
  ) {
    super(message);
    this.name = this.constructor.name;
    this.sourceId = context.sourceId;
    this.url = context.url;
    this.attempt = context.attempt;
    this.stage = context.stage;
    this.retryable = context.retryable;
  }

  /** Convert to a CollectError record for logging/reporting. */
  toCollectError(): CollectError {
    return {
      type: this.type,
      message: this.message,
      sourceId: this.sourceId,
      url: this.url,
      attempt: this.attempt,
      stage: this.stage,
      timestamp: new Date().toISOString(),
      retryable: this.retryable,
      cause: (this as unknown as { cause?: unknown }).cause,
    };
  }
}

/**
 * FetchError — network-level failure.
 * Retryable: yes (transient network issues).
 */
export class FetchError extends CollectorError {
  readonly type: CollectErrorType = "fetch";

  constructor(
    message: string,
    context: {
      sourceId: string;
      url?: string;
      attempt: number;
    },
  ) {
    super(message, { ...context, stage: "fetch", retryable: true });
  }
}

/**
 * ParseError — failed to parse/normalize fetched content.
 * Retryable: no (same content will parse the same way).
 */
export class ParseError extends CollectorError {
  readonly type: CollectErrorType = "parse";

  constructor(
    message: string,
    context: {
      sourceId: string;
      url?: string;
      attempt: number;
    },
  ) {
    super(message, { ...context, stage: "normalize", retryable: false });
  }
}

/**
 * ValidationError — content failed validation rules.
 * Retryable: no (same content will fail the same rules).
 */
export class ValidationError extends CollectorError {
  readonly type: CollectErrorType = "validation";

  constructor(
    message: string,
    context: {
      sourceId: string;
      url?: string;
      attempt: number;
    },
  ) {
    super(message, { ...context, stage: "validate", retryable: false });
  }
}

/**
 * RateLimitError — source rate limit exceeded.
 * Retryable: yes (after backoff).
 */
export class RateLimitError extends CollectorError {
  readonly type: CollectErrorType = "rate_limit";
  /** Seconds until rate limit resets, if provided by the server. */
  readonly retryAfterSeconds?: number;

  constructor(
    message: string,
    context: {
      sourceId: string;
      url?: string;
      attempt: number;
      retryAfterSeconds?: number;
    },
  ) {
    super(message, { ...context, stage: "fetch", retryable: true });
    this.retryAfterSeconds = context.retryAfterSeconds;
  }
}

/**
 * AuthError — authentication failed (bad key, expired token, etc.).
 * Retryable: no (credentials need to be fixed).
 */
export class AuthError extends CollectorError {
  readonly type: CollectErrorType = "auth";

  constructor(
    message: string,
    context: {
      sourceId: string;
      url?: string;
      attempt: number;
    },
  ) {
    super(message, { ...context, stage: "fetch", retryable: false });
  }
}

/**
 * TimeoutError — request exceeded the configured timeout.
 * Retryable: yes (transient server slowness).
 */
export class TimeoutError extends CollectorError {
  readonly type: CollectErrorType = "timeout";
  /** The timeout that was exceeded, in ms. */
  readonly timeoutMs: number;

  constructor(
    message: string,
    context: {
      sourceId: string;
      url?: string;
      attempt: number;
      timeoutMs: number;
    },
  ) {
    super(message, { ...context, stage: "fetch", retryable: true });
    this.timeoutMs = context.timeoutMs;
  }
}

/** Type guard: is this error retryable? */
export function isRetryableError(error: unknown): boolean {
  return error instanceof CollectorError && error.retryable;
}

/** Type guard: is this error fatal (non-retryable)? */
export function isFatalError(error: unknown): boolean {
  return error instanceof CollectorError && !error.retryable;
}
