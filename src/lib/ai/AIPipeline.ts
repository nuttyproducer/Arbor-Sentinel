// src/lib/ai/AIPipeline.ts

import type {
  AIStage,
  AIPipelineConfig,
  PipelineContext,
  AIContent,
  AIProcessedContent,
  AIOperationResult,
  StageDefinition,
  AILogEntry,
} from "./types";
import type { NormalizedContent } from "../collectors/types";
import { emptyResult } from "./types";

/**
 * DAG-based AI pipeline orchestrator.
 *
 * Resolves stage dependencies into a directed acyclic graph,
 * runs stages in dependency order, parallelizes independent stages,
 * and accumulates results into PipelineContext.
 *
 * Usage:
 *   const pipeline = new AIPipeline({ stages, provider, router, logger });
 *   const results = await pipeline.process(aiContent);
 */
export class AIPipeline {
  private stages: Map<string, AIStage>;
  private config: AIPipelineConfig;

  constructor(config: AIPipelineConfig) {
    this.config = config;
    this.stages = new Map();
    for (const stage of config.stages) {
      this.stages.set(stage.name, stage);
    }
    this.validateDependencies();
  }

  /**
   * Process content through all configured stages.
   * Returns the complete AIProcessedContent with results from all stages.
   */
  async process(content: AIContent): Promise<AIProcessedContent> {
    const context = createPipelineContext(
      content.source,
      content.sourceQuality,
      content.collectionTimestamp,
      content.existingRecords,
      content.knownEntities,
    );

    const results = new Map<string, AIOperationResult<unknown>>();
    const auditLog: AILogEntry[] = [];
    const completed = new Set<string>();
    const failed = new Set<string>();

    // Resolve execution order via topological sort
    const order = this.topologicalSort();

    for (const batch of order) {
      // Run all stages in this batch in parallel (no mutual dependencies)
      const batchResults = await Promise.all(
        batch.map((stageName) => {
          const stage = this.stages.get(stageName)!;

          // Check if all dependencies succeeded
          const depsFailed = stage.requires.some((dep) => failed.has(dep));
          if (depsFailed) {
            const result = emptyResult("none", [
              `skipped: dependency failed for ${stageName}`,
            ]);
            results.set(stageName, result);
            failed.add(stageName);
            return { stageName, result };
          }

          return this.runStage(stage, content.source, context).then((result) => {
            results.set(stageName, result);
            if (result.data === null && result.confidence === 0) {
              failed.add(stageName);
            } else {
              completed.add(stageName);
            }
            return { stageName, result };
          });
        }),
      );

      // Accumulate results into context
      for (const { stageName, result } of batchResults) {
        context.set(stageName, result);

        // Build audit log entry
        auditLog.push({
          timestamp: new Date().toISOString(),
          stageName,
          model: result.modelUsed,
          prompt: `[Stage: ${stageName}]`,
          responseSummary: result.data !== null ? "Success" : "Failed",
          tokensUsed: result.tokensUsed,
          latencyMs: result.latencyMs,
          confidence: result.confidence,
          error: result.warnings.length > 0 ? result.warnings.join("; ") : undefined,
        });
      }
    }

    return this.buildOutput(content, results, auditLog);
  }

  /**
   * Run a single stage with error isolation.
   * A stage failure never propagates — it returns an empty result.
   */
  private async runStage(
    stage: AIStage,
    source: NormalizedContent,
    context: PipelineContext,
  ): Promise<AIOperationResult<unknown>> {
    try {
      return await stage.run(source, context, this.config.provider);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return emptyResult("error", [`${stage.name} failed: ${message}`]);
    }
  }

  /**
   * Topological sort returning batches of parallel-executable stages.
   * Each batch contains stages whose dependencies are all in prior batches.
   */
  private topologicalSort(): string[][] {
    const stageNames = Array.from(this.stages.keys());
    const inDegree = new Map<string, number>();
    const dependents = new Map<string, string[]>();

    for (const name of stageNames) {
      inDegree.set(name, 0);
      dependents.set(name, []);
    }

    for (const [name, stage] of this.stages) {
      for (const dep of stage.requires) {
        if (!this.stages.has(dep)) {
          throw new Error(
            `Stage "${name}" requires "${dep}" which is not in the pipeline`,
          );
        }
        inDegree.set(name, (inDegree.get(name) ?? 0) + 1);
        dependents.get(dep)?.push(name);
      }
    }

    const batches: string[][] = [];
    let currentBatch = stageNames.filter((n) => (inDegree.get(n) ?? 0) === 0);

    while (currentBatch.length > 0) {
      batches.push([...currentBatch]);
      const nextBatch: string[] = [];

      for (const name of currentBatch) {
        for (const dep of dependents.get(name) ?? []) {
          const newDegree = (inDegree.get(dep) ?? 1) - 1;
          inDegree.set(dep, newDegree);
          if (newDegree === 0) {
            nextBatch.push(dep);
          }
        }
      }

      currentBatch = nextBatch;
    }

    // Check for cycles or unresolved dependencies
    const processed = batches.flat();
    if (processed.length !== stageNames.length) {
      const unprocessed = stageNames.filter((n) => !processed.includes(n));
      throw new Error(
        `Pipeline has unresolved dependencies or cycle involving: ${unprocessed.join(", ")}`,
      );
    }

    return batches;
  }

  private validateDependencies(): void {
    for (const [name, stage] of this.stages) {
      for (const dep of stage.requires) {
        if (!this.stages.has(dep)) {
          throw new Error(
            `Stage "${name}" requires "${dep}" which is not registered`,
          );
        }
      }
    }
  }

  private buildOutput(
    content: AIContent,
    results: Map<string, AIOperationResult<unknown>>,
    auditLog: AILogEntry[],
  ): AIProcessedContent {
    // Stages hold results as AIOperationResult<unknown>; output fields that
    // require an array payload (entities, claims, …) need a narrowing cast.
    const arrayResult = (name: string): AIOperationResult<unknown[]> =>
      (results.get(name) ?? emptyResult("none", ["not run"])) as AIOperationResult<unknown[]>;
    const singleResult = (name: string): AIOperationResult<unknown> =>
      results.get(name) ?? emptyResult("none", ["not run"]);

    return {
      sourceId: content.source.url,
      processedAt: new Date().toISOString(),
      language: results.get("language_detection"),
      translation: results.get("translation"),
      summary: results.get("summarization"),
      entities: arrayResult("entity_extraction"),
      claims: arrayResult("claim_extraction"),
      timeline: arrayResult("timeline_extraction"),
      locations: arrayResult("geographic_extraction"),
      relationships: arrayResult("relationship_detection"),
      topics: arrayResult("topic_classification"),
      duplicates: results.get("duplicate_detection") as AIOperationResult<unknown[]> | undefined,
      contradictions: results.get("contradiction_detection") as AIOperationResult<unknown[]> | undefined,
      confidence: singleResult("confidence_estimation"),
      hallucinationFlags: arrayResult("hallucination_detection"),
      auditLog,
    };
  }
}

/**
 * Create a stage from a definition object.
 */
export function createStage<TInput = NormalizedContent, TOutput = unknown>(
  definition: StageDefinition<TInput, TOutput>,
): AIStage<TInput, TOutput> {
  return {
    name: definition.name,
    requires: definition.requires,
    run: definition.run,
  };
}

/**
 * Create a PipelineContext for a single content item.
 */
export function createPipelineContext(
  source: NormalizedContent,
  sourceQuality: PipelineContext["sourceQuality"] = 0,
  collectionTimestamp: string = new Date().toISOString(),
  existingRecords?: PipelineContext["existingRecords"],
  knownEntities?: PipelineContext["knownEntities"],
): PipelineContext & { set(name: string, result: AIOperationResult<unknown>): void } {
  const results = new Map<string, AIOperationResult<unknown>>();

  return {
    get(stageName: string) {
      return results.get(stageName);
    },
    has(stageName: string) {
      return results.has(stageName);
    },
    source,
    sourceQuality,
    collectionTimestamp,
    existingRecords,
    knownEntities,
    set(name: string, result: AIOperationResult<unknown>) {
      results.set(name, result);
    },
  };
}

// Re-export for convenience
export { emptyResult, successResult } from "./types";
