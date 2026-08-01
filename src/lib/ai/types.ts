// src/lib/ai/types.ts

import type { NormalizedContent } from "../collectors/types";
import type { VerificationLevel } from "../../types/content";

// ── Core result wrapper ────────────────────────────────────────────────────

/** Character range reference into a source document. */
export interface SourceSpan {
  /** Document ID from the source registry. */
  sourceId: string;
  /** Character offset start (0-based). */
  start: number;
  /** Character offset end (exclusive). */
  end: number;
  /** The referenced text excerpt. */
  excerpt: string;
}

/** Universal wrapper returned by every AI stage and operation. */
export interface AIOperationResult<T> {
  /** The structured output data — null on failure. */
  data: T | null;
  /** Calibrated confidence 0–1. 0 = complete failure, 1 = certain. */
  confidence: number;
  /** Model identifier used for this operation (e.g. "deepseek-chat"). */
  modelUsed: string;
  /** Token counts for this operation. */
  tokensUsed: { input: number; output: number };
  /** Wall-clock latency in milliseconds. */
  latencyMs: number;
  /** Non-fatal issues encountered (low confidence, ambiguity, skipped step). */
  warnings: string[];
  /** Source text spans that support this output. */
  sourceSpans: SourceSpan[];
}

/** Create a successful result. */
export function successResult<T>(
  data: T,
  opts: {
    confidence: number;
    modelUsed: string;
    tokensUsed: { input: number; output: number };
    latencyMs: number;
    warnings?: string[];
    sourceSpans?: SourceSpan[];
  },
): AIOperationResult<T> {
  return {
    data,
    confidence: Math.min(opts.confidence, 1),
    modelUsed: opts.modelUsed,
    tokensUsed: opts.tokensUsed,
    latencyMs: opts.latencyMs,
    warnings: opts.warnings ?? [],
    sourceSpans: opts.sourceSpans ?? [],
  };
}

/** Create a failed/empty result (stage skipped, error, or no data). */
export function emptyResult<T>(
  modelUsed: string,
  warnings: string[] = [],
): AIOperationResult<T> {
  return {
    data: null,
    confidence: 0,
    modelUsed,
    tokensUsed: { input: 0, output: 0 },
    latencyMs: 0,
    warnings,
    sourceSpans: [],
  };
}

// ── Provider interface ─────────────────────────────────────────────────────

/** Role in a chat message. */
export type MessageRole = "system" | "user";

/** A single chat message. */
export interface AIMessage {
  role: MessageRole;
  content: string;
}

/** Request to an AI provider. */
export interface AIRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" | "text" };
}

/** Response from an AI provider. */
export interface AIResponse {
  /** Raw response text. */
  content: string;
  /** Model that produced this response. */
  model: string;
  /** Token counts. */
  tokensUsed: { input: number; output: number };
  /** Why the response ended. */
  finishReason: "stop" | "length" | "content_filter";
}

/** Provider-agnostic AI client interface. */
export interface AIProvider {
  complete(request: AIRequest): Promise<AIResponse>;
}

// ── Model routing ──────────────────────────────────────────────────────────

/** Configuration for a specific model. */
export interface ModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}

/** Rule for selecting a model based on task and content characteristics. */
export interface ModelRoute {
  /** Task type identifier (e.g. "translation", "summarization"). */
  taskType: string;
  /** Minimum content length in characters for this route to apply. */
  minContentLength?: number;
  /** Maximum content length in characters for this route to apply. */
  maxContentLength?: number;
  /** Language code this route applies to (ISO 639-1). */
  language?: string;
  /** The model config to use when this route matches. */
  model: ModelConfig;
}

// ── Error handling ─────────────────────────────────────────────────────────

/** Classified AI error types. */
export type AIErrorType =
  | "transient"
  | "rate_limit"
  | "context_length"
  | "content_filter"
  | "permanent";

/** Structured AI error. */
export interface AIError {
  type: AIErrorType;
  message: string;
  retryable: boolean;
  cause?: unknown;
}

// ── Logging ────────────────────────────────────────────────────────────────

/** A single AI operation log entry — always recorded, never disabled. */
export interface AILogEntry {
  /** ISO timestamp when the operation occurred. */
  timestamp: string;
  /** Which pipeline stage produced this entry. */
  stageName: string;
  /** Model identifier used. */
  model: string;
  /** Prompt text, truncated to first 500 characters. */
  prompt: string;
  /** Response text summary, truncated to first 500 characters. */
  responseSummary: string;
  /** Token counts. */
  tokensUsed: { input: number; output: number };
  /** Wall-clock latency in milliseconds. */
  latencyMs: number;
  /** Confidence score from the operation. */
  confidence: number;
  /** Error message if the operation failed. */
  error?: string;
}

// ── Prompt management ──────────────────────────────────────────────────────

/** A versioned prompt template. */
export interface PromptTemplate {
  /** Prompt name (matches the markdown filename without extension). */
  name: string;
  /** Semantic version of this prompt. */
  version: number;
  /** The raw template text with {{variable}} placeholders. */
  template: string;
  /** System prompt portion (frontmatter or first section). */
  systemPrompt?: string;
  /** User prompt portion (main template body). */
  userPrompt?: string;
}

// ── Pipeline context ───────────────────────────────────────────────────────

/** Read-only context passed to each stage during pipeline execution. */
export interface PipelineContext {
  /** Get the result of a previously-run stage by name. */
  get(stageName: string): AIOperationResult<unknown> | undefined;
  /** Check if a stage has completed successfully. */
  has(stageName: string): boolean;
  /** The original normalized content being processed. */
  source: NormalizedContent;
  /** Source quality from the collector. */
  sourceQuality: VerificationLevel;
  /** ISO timestamp when collection occurred. */
  collectionTimestamp: string;
  /** Existing evidence records for dedup/contradiction (optional). */
  existingRecords?: Array<{
    id: string;
    title: string;
    summary: string;
    sourceIds: string[];
    publicationDate?: string;
    safeLocation?: string;
  }>;
  /** Known entities for entity linking (optional). */
  knownEntities?: Array<{
    id: string;
    canonicalName: string;
    aliases: string[];
    entityType: string;
  }>;
}

// ── Pipeline input ─────────────────────────────────────────────────────────

/** Enriched input passed into the AI pipeline. */
export interface AIContent {
  /** The normalized content from the collector framework. */
  source: NormalizedContent;
  /** Source quality from the collector. */
  sourceQuality: VerificationLevel;
  /** ISO timestamp when collection occurred. */
  collectionTimestamp: string;
  /** Existing records for dedup/contradiction detection (optional). */
  existingRecords?: PipelineContext["existingRecords"];
  /** Known entities for entity linking (optional). */
  knownEntities?: PipelineContext["knownEntities"];
}

// ── Pipeline output ────────────────────────────────────────────────────────

/** Complete output from a full pipeline run. */
export interface AIProcessedContent {
  /** Source document ID. */
  sourceId: string;
  /** ISO timestamp when processing completed. */
  processedAt: string;
  /** Language detection result (if stage ran). */
  language?: AIOperationResult<unknown>;
  /** Translation result (if stage ran). */
  translation?: AIOperationResult<unknown>;
  /** Summarization result (if stage ran). */
  summary?: AIOperationResult<unknown>;
  /** Extracted entities. */
  entities: AIOperationResult<unknown[]>;
  /** Extracted claims. */
  claims: AIOperationResult<unknown[]>;
  /** Timeline events. */
  timeline: AIOperationResult<unknown[]>;
  /** Geographic locations. */
  locations: AIOperationResult<unknown[]>;
  /** Entity relationships. */
  relationships: AIOperationResult<unknown[]>;
  /** Topic classifications. */
  topics: AIOperationResult<unknown[]>;
  /** Duplicate groups (if stage ran). */
  duplicates?: AIOperationResult<unknown[]>;
  /** Contradiction reports (if stage ran). */
  contradictions?: AIOperationResult<unknown[]>;
  /** Unified confidence report. */
  confidence: AIOperationResult<unknown>;
  /** Hallucination flags. */
  hallucinationFlags: AIOperationResult<unknown[]>;
  /** Complete audit log from all stages. */
  auditLog: AILogEntry[];
}

// ── Stage definition ───────────────────────────────────────────────────────

/** A composable AI pipeline stage. */
export interface AIStage<TInput = NormalizedContent, TOutput = unknown> {
  /** Unique stage name (e.g. "entity_extraction"). */
  name: string;
  /** Names of stages that must complete before this one runs. */
  requires: string[];
  /** Execute this stage. */
  run: (
    input: TInput,
    context: PipelineContext,
    provider: AIProvider,
  ) => Promise<AIOperationResult<TOutput>>;
}

/** Definition used to create a stage via createStage(). */
export interface StageDefinition<TInput = NormalizedContent, TOutput = unknown> {
  name: string;
  requires: string[];
  run: (
    input: TInput,
    context: PipelineContext,
    provider: AIProvider,
  ) => Promise<AIOperationResult<TOutput>>;
}

// ── Pipeline config ────────────────────────────────────────────────────────

/** Configuration for the AIPipeline orchestrator. */
export interface AIPipelineConfig {
  stages: AIStage[];
  provider: AIProvider;
  router: {
    route(taskType: string, content: NormalizedContent): ModelConfig;
  };
  logger: {
    log(entry: AILogEntry): void;
    getEntries(filter?: { stageName?: string; startDate?: string }): AILogEntry[];
    export(): string;
  };
}
