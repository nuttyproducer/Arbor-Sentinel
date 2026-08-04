// src/lib/ai/ModelRouter.ts

import type { ModelConfig, ModelRoute } from "./types";
import type { NormalizedContent } from "../collectors/types";

/** Default model config for DeepSeek. */
export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  model: "deepseek-chat",
  temperature: 0,
  maxTokens: 4096,
};

/** Default routes for common task types. */
export const DEFAULT_ROUTES: ModelRoute[] = [
  {
    taskType: "language_detection",
    model: { model: "deepseek-chat", temperature: 0, maxTokens: 256 },
  },
  {
    taskType: "translation",
    model: { model: "deepseek-chat", temperature: 0.1, maxTokens: 8192 },
  },
  {
    taskType: "translation_review",
    model: { model: "deepseek-chat", temperature: 0, maxTokens: 512 },
  },
  {
    taskType: "summarization",
    model: { model: "deepseek-chat", temperature: 0, maxTokens: 4096 },
  },
  {
    taskType: "fact_extraction",
    model: { model: "deepseek-chat", temperature: 0, maxTokens: 4096 },
  },
  {
    taskType: "entity_extraction",
    model: { model: "deepseek-chat", temperature: 0, maxTokens: 4096 },
  },
  {
    taskType: "claim_extraction",
    model: { model: "deepseek-chat", temperature: 0, maxTokens: 4096 },
  },
  {
    taskType: "timeline_extraction",
    model: { model: "deepseek-chat", temperature: 0, maxTokens: 4096 },
  },
  {
    taskType: "geographic_extraction",
    model: { model: "deepseek-chat", temperature: 0, maxTokens: 4096 },
  },
  {
    taskType: "relationship_detection",
    model: { model: "deepseek-chat", temperature: 0, maxTokens: 4096 },
  },
  {
    taskType: "topic_classification",
    model: { model: "deepseek-chat", temperature: 0, maxTokens: 2048 },
  },
  {
    taskType: "duplicate_detection",
    model: { model: "deepseek-chat", temperature: 0, maxTokens: 4096 },
  },
  {
    taskType: "contradiction_detection",
    model: { model: "deepseek-chat", temperature: 0, maxTokens: 4096 },
  },
  {
    taskType: "confidence_estimation",
    model: { model: "deepseek-chat", temperature: 0, maxTokens: 2048 },
  },
  {
    taskType: "hallucination_detection",
    model: { model: "deepseek-chat", temperature: 0, maxTokens: 4096 },
  },
];

/**
 * Routes AI requests to the appropriate model configuration
 * based on task type, content length, and language.
 */
export class ModelRouter {
  private routes: ModelRoute[];
  private defaultConfig: ModelConfig;

  constructor(routes: ModelRoute[] = [], defaultConfig?: ModelConfig) {
    this.routes = [...DEFAULT_ROUTES, ...routes];
    this.defaultConfig = defaultConfig ?? DEFAULT_MODEL_CONFIG;
  }

  /**
   * Register a custom route. Custom routes take precedence over defaults.
   */
  registerRoute(route: ModelRoute): void {
    // Remove any existing route for the same taskType with same constraints
    this.routes = this.routes.filter(
      (r) =>
        !(
          r.taskType === route.taskType &&
          r.minContentLength === route.minContentLength &&
          r.maxContentLength === route.maxContentLength &&
          r.language === route.language
        ),
    );
    this.routes.push(route);
  }

  /**
   * Select the best model config for a given task and content.
   */
  route(taskType: string, content: NormalizedContent): ModelConfig {
    const contentLength = content.body.length;
    const language = content.language;

    // Find matching routes, sorted by specificity (most specific first)
    const candidates = this.routes
      .filter((r) => r.taskType === taskType)
      .filter((r) => {
        if (r.minContentLength !== undefined && contentLength < r.minContentLength) return false;
        if (r.maxContentLength !== undefined && contentLength > r.maxContentLength) return false;
        if (r.language !== undefined && language !== r.language) return false;
        return true;
      })
      .sort((a, b) => {
        // More constraints = more specific = higher priority
        const aSpecificity = (a.minContentLength ? 1 : 0) + (a.maxContentLength ? 1 : 0) + (a.language ? 1 : 0);
        const bSpecificity = (b.minContentLength ? 1 : 0) + (b.maxContentLength ? 1 : 0) + (b.language ? 1 : 0);
        return bSpecificity - aSpecificity;
      });

    return candidates[0]?.model ?? this.defaultConfig;
  }

  /**
   * Get all registered routes (for inspection/debugging).
   */
  getRoutes(): ReadonlyArray<ModelRoute> {
    return this.routes;
  }
}
