// src/lib/runtime/types.ts
// Types for the RuntimeEngine and its subsystems.

import type { CollectorHealthSnapshot } from "../collectors/monitoring/types";

// ── Runtime state ────────────────────────────────────────────────────────────

export type RuntimeState = "idle" | "starting" | "running" | "stopping" | "stopped" | "error";

// ── Runtime configuration ────────────────────────────────────────────────────

export interface RuntimeConfig {
  /** Whether to auto-start the scheduler on bootstrap. */
  autoStart: boolean;
  /** Default polling interval in milliseconds when feed has no explicit interval. */
  defaultPollIntervalMs: number;
  /** Maximum concurrent collector runs. */
  maxConcurrentRuns: number;
  /** Whether to process items through the AI pipeline after collection. */
  enableAIPipeline: boolean;
  /** Whether to auto-publish items from trusted sources. */
  enableAutoPublish: boolean;
  /** Whether to populate the knowledge graph. */
  enableGraphPopulation: boolean;
  /** Whether to rebuild the search index after collection. */
  enableSearchIndexing: boolean;
}

export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  autoStart: false,
  defaultPollIntervalMs: 60 * 60 * 1000, // 1 hour
  maxConcurrentRuns: 3,
  enableAIPipeline: false, // opt-in — AI is expensive
  enableAutoPublish: true,
  enableGraphPopulation: false,
  enableSearchIndexing: false,
};

// ── Pipeline event ───────────────────────────────────────────────────────────

export type PipelineStage =
  | "collected"
  | "ai_processed"
  | "review_queued"
  | "published"
  | "graph_populated"
  | "search_indexed";

export interface PipelineEvent {
  stage: PipelineStage;
  itemId: string;
  sourceId: string;
  timestamp: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

// ── Runtime statistics ───────────────────────────────────────────────────────

export interface RuntimeStats {
  state: RuntimeState;
  uptimeMs: number;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  totalItemsCollected: number;
  totalItemsStored: number;
  activeJobs: number;
  queuedJobs: number;
}

// ── Run outcome ──────────────────────────────────────────────────────────────

export type ItemOutcome = "accepted" | "rejected" | "duplicated" | "published";

// ── Diagnostics ──────────────────────────────────────────────────────────────

// ── Run All result ───────────────────────────────────────────────────────────

export interface FeedRunResult {
  name: string;
  fetched: number;
  stored: number;
  success: boolean;
  error?: string;
  proxyUsed?: string;
}

export interface RunAllSummary {
  feeds: FeedRunResult[];
  totalFetched: number;
  totalStored: number;
  errors: string[];
}

// ── Diagnostics ──────────────────────────────────────────────────────────────

export interface RuntimeDiagnostics {
  state: RuntimeState;
  uptimeMs: number;
  stats: RuntimeStats;
  scheduler: {
    active: boolean;
    jobCount: number;
    nextRunAt: string | null;
    paused: boolean;
  };
  collectors: CollectorHealthSnapshot[];
  lastErrors: Array<{ feedId: string; error: string; timestamp: string }>;
  circuitBreakers: Record<string, "closed" | "open" | "half_open">;
}
