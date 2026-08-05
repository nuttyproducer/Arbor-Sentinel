import type { SourceType, HealthStatus } from "../../types/content";

// ── Collector Configuration ──────────────────────────────────────────────────

/** Taxonomy of collector implementations. */
export type CollectorType =
  | 'rss'
  | 'rest-api'
  | 'graphql'
  | 'csv'
  | 'xml'
  | 'gov-portal'
  | 'court'
  | 'manual-import'
  | 'ai-extraction';

/** Per-source configuration for a collector instance. */
export interface CollectorConfig {
  /** Source ID from the Source Registry. */
  sourceId: string;
  /** Human-readable label for logging and debugging. */
  label: string;
  /** Source type — determines which collector class handles this source. */
  sourceType: SourceType;
  /** Whether this collector is enabled. Disabled collectors are skipped by the scheduler. */
  enabled: boolean;
  /** How the collector is triggered. */
  trigger: CollectorTrigger;
  /** Rate-limiting configuration for this source. */
  rateLimit: RateLimitConfig;
  /** Retry configuration for transient failures. */
  retry: RetryConfig;
  /** Fetch timeout in milliseconds. */
  fetchTimeoutMs: number;
  /** Maximum content age in milliseconds before a re-fetch is forced. */
  maxContentAgeMs: number;
  /** Whether to store raw responses alongside normalized content. */
  storeRawResponse: boolean;
  /** Arbitrary metadata for collector-specific options. */
  metadata?: Record<string, unknown>;
}

/** How a collector is triggered. */
export type CollectorTrigger =
  | { type: "manual" }
  | { type: "interval"; intervalMinutes: number }
  | { type: "cron"; expression: string };

/** Rate-limiting configuration. */
export interface RateLimitConfig {
  /** Minimum delay between requests to this source, in milliseconds. */
  minDelayMs: number;
  /** Maximum requests per minute to a single domain. */
  maxRequestsPerMinute: number;
  /** Maximum concurrent requests to a single domain. */
  maxConcurrent: number;
  /** Maximum burst size before throttling. */
  burstSize: number;
  /** Whether to respect Retry-After headers from the source. */
  respectRetryAfter: boolean;
}

/** Retry configuration. */
export interface RetryConfig {
  /** Maximum number of retry attempts. 0 = no retries. */
  maxRetries: number;
  /** Initial backoff delay in milliseconds. */
  initialDelayMs: number;
  /** Backoff multiplier (e.g., 2.0 for exponential). */
  backoffMultiplier: number;
  /** Maximum backoff delay in milliseconds. */
  maxDelayMs: number;
  /** Whether to add jitter to backoff delay. */
  jitter: boolean;
  /** HTTP status codes that should trigger a retry. */
  retryableStatuses: number[];
}

// ── Collection Pipeline ──────────────────────────────────────────────────────

/** Result of a successful collection run. */
export interface CollectResult {
  /** Unique run ID for this collection. */
  runId: string;
  /** Source ID that was collected from. */
  sourceId: string;
  /** ISO timestamp when collection started. */
  startedAt: string;
  /** ISO timestamp when collection completed. */
  completedAt: string;
  /** Number of items fetched. */
  itemsFetched: number;
  /** Number of items that passed validation. */
  itemsValidated: number;
  /** Number of items normalized. */
  itemsNormalized: number;
  /** Number of duplicate items removed. */
  itemsDeduplicated: number;
  /** Number of new items stored. */
  itemsStored: number;
  /** Pipeline stage durations in ms, for observability. */
  stageDurations: PipelineStageDurations;
  /** Whether the run completed without errors. */
  success: boolean;
}

/** Millisecond durations for each pipeline stage. */
export interface PipelineStageDurations {
  fetch: number;
  validate: number;
  normalize: number;
  deduplicate: number;
  store: number;
}

/** A collected content item flowing through the pipeline. */
export interface CollectedItem {
  /** Unique fingerprint for deduplication. */
  fingerprint: string;
  /** Raw content as received from the source. */
  raw: unknown;
  /** Normalized content after parsing. */
  normalized?: NormalizedContent;
  /** Source ID this item came from. */
  sourceId: string;
  /** ISO timestamp when this item was fetched. */
  fetchedAt: string;
  /** The URL this item was fetched from. */
  url: string;
}

/** Normalized content structure. */
export interface NormalizedContent {
  /** Normalized title. */
  title: string;
  /** Plain-text body or summary. */
  body: string;
  /** Publication date in ISO format. */
  publishedAt?: string;
  /** Author or publisher attribution. */
  author?: string;
  /** Permalink to the original content. */
  url: string;
  /** Content language (ISO 639-1). */
  language?: string;
  /** Extracted tags or categories. */
  tags: string[];
  /** Source-specific metadata. */
  metadata: Record<string, unknown>;
}

/** Error from a collection run. */
export interface CollectError {
  /** Error type for classification. */
  type: CollectErrorType;
  /** Human-readable error message. */
  message: string;
  /** Source ID where the error occurred. */
  sourceId: string;
  /** URL being fetched when the error occurred. */
  url?: string;
  /** Which attempt this error occurred on (1-based). */
  attempt: number;
  /** Pipeline stage where the error occurred. */
  stage: PipelineStageName;
  /** ISO timestamp of the error. */
  timestamp: string;
  /** Whether this error is retryable. */
  retryable: boolean;
  /** Original error for debugging. */
  cause?: unknown;
}

/** Classified error types. */
export type CollectErrorType =
  | "fetch"
  | "parse"
  | "validation"
  | "rate_limit"
  | "auth"
  | "timeout"
  | "unknown";

/** Pipeline stage names in execution order. */
export type PipelineStageName =
  | "fetch"
  | "validate"
  | "normalize"
  | "deduplicate"
  | "store";

/** Ordered pipeline stages array. */
export const PIPELINE_STAGES: PipelineStageName[] = [
  "fetch",
  "validate",
  "normalize",
  "deduplicate",
  "store",
];

// ── Collector Interface ──────────────────────────────────────────────────────

/** Registration entry for a collector in the registry. */
export interface CollectorRegistration {
  /** Unique name for this collector class. */
  name: string;
  /** Source types this collector can handle. */
  supportedSourceTypes: SourceType[];
  /** Human-readable description. */
  description: string;
  /** Current health status of this collector. */
  healthStatus: HealthStatus;
  /** Last time this collector ran successfully. */
  lastSuccessfulRun?: string;
  /** Number of consecutive failures. */
  consecutiveFailures: number;
}

// ── Storage ──────────────────────────────────────────────────────────────────

/** Storage interface for collected content. */
export interface StorageInterface {
  /** Save a collected item. */
  save(item: CollectedItem): Promise<void>;
  /** Get all items from a specific source. */
  getBySource(sourceId: string): Promise<CollectedItem[]>;
  /** Get items collected within a date range. */
  getByDate(start: string, end: string): Promise<CollectedItem[]>;
  /** Get items that have not been processed by downstream systems. */
  getUnprocessed(): Promise<CollectedItem[]>;
  /** Check if a fingerprint already exists (deduplication). */
  exists(fingerprint: string): Promise<boolean>;
  /** Get the total count of stored items. */
  count(): Promise<number>;
  /** Clear all stored items (for testing/reset). */
  clear(): Promise<void>;
}

// ── Scheduler ────────────────────────────────────────────────────────────────

/** A scheduled collector job. */
export interface ScheduledJob {
  /** Unique job ID. */
  id: string;
  /** Source ID this job collects from. */
  sourceId: string;
  /** The collector configuration. */
  config: CollectorConfig;
  /** The trigger that fires this job. */
  trigger: CollectorTrigger;
  /** Whether the job is currently running. */
  running: boolean;
  /** Last run result, if any. */
  lastResult?: CollectResult;
  /** Next scheduled run time as ISO string. */
  nextRunAt?: string;
}

// ── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  minDelayMs: 1000,
  maxRequestsPerMinute: 30,
  maxConcurrent: 2,
  burstSize: 5,
  respectRetryAfter: true,
};

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  backoffMultiplier: 2.0,
  maxDelayMs: 30000,
  jitter: true,
  retryableStatuses: [429, 500, 502, 503, 504],
};

export const DEFAULT_FETCH_TIMEOUT_MS = 30000;
export const DEFAULT_MAX_CONTENT_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
