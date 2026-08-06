// src/lib/runtime/index.ts
// Runtime engine barrel export.

export { RuntimeEngine, getRuntimeEngine } from "./RuntimeEngine";
export { processItem } from "./pipeline";
export { recordRun, recordFeedError, recordItemOutcome, getRuntimeStats } from "./metrics";
export { DEFAULT_RUNTIME_CONFIG } from "./types";
export type {
  RuntimeState,
  RuntimeConfig,
  RuntimeStats,
  RuntimeDiagnostics,
  PipelineStage,
  PipelineEvent,
  ItemOutcome,
} from "./types";
