// src/lib/ai/__tests__/ModelRouter.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { ModelRouter, DEFAULT_MODEL_CONFIG } from "../ModelRouter";
import type { NormalizedContent } from "../../collectors/types";

function makeContent(overrides: Partial<NormalizedContent> = {}): NormalizedContent {
  return {
    title: "Test Article",
    body: "This is the body of the test article with some content.",
    url: "https://example.com/test",
    tags: [],
    metadata: {},
    ...overrides,
  };
}

describe("ModelRouter", () => {
  let router: ModelRouter;

  beforeEach(() => {
    router = new ModelRouter();
  });

  it("returns default config for unknown task type", () => {
    const config = router.route("nonexistent_task", makeContent());
    expect(config).toEqual(DEFAULT_MODEL_CONFIG);
  });

  it("routes translation tasks to appropriate model", () => {
    const config = router.route("translation", makeContent());
    expect(config.model).toBe("deepseek-chat");
    expect(config.temperature).toBe(0.1);
    expect(config.maxTokens).toBe(8192);
  });

  it("routes language_detection with low max tokens", () => {
    const config = router.route("language_detection", makeContent());
    expect(config.maxTokens).toBe(256);
  });

  it("routes summarization with appropriate config", () => {
    const config = router.route("summarization", makeContent());
    expect(config.model).toBe("deepseek-chat");
    expect(config.temperature).toBe(0);
  });

  it("all task types return a valid config", () => {
    const taskTypes = [
      "language_detection", "translation", "translation_review",
      "summarization", "fact_extraction", "entity_extraction",
      "claim_extraction", "timeline_extraction", "geographic_extraction",
      "relationship_detection", "topic_classification",
      "duplicate_detection", "contradiction_detection",
      "confidence_estimation", "hallucination_detection",
    ];

    for (const taskType of taskTypes) {
      const config = router.route(taskType, makeContent());
      expect(config.model).toBeTruthy();
      expect(config.maxTokens).toBeGreaterThan(0);
    }
  });

  it("custom route takes precedence over default", () => {
    router.registerRoute({
      taskType: "translation",
      model: { model: "deepseek-reasoner", temperature: 0.2, maxTokens: 16000 },
    });

    const config = router.route("translation", makeContent());
    expect(config.model).toBe("deepseek-reasoner");
    expect(config.maxTokens).toBe(16000);
  });

  it("filters routes by content length", () => {
    router.registerRoute({
      taskType: "summarization",
      minContentLength: 10000,
      model: { model: "deepseek-reasoner", temperature: 0, maxTokens: 8000 },
    });

    // Short content — should use default
    const shortConfig = router.route("summarization", makeContent({ body: "short" }));
    expect(shortConfig.model).toBe("deepseek-chat");

    // Long content — should use custom route
    const longConfig = router.route("summarization", makeContent({ body: "x".repeat(15000) }));
    expect(longConfig.model).toBe("deepseek-reasoner");
  });

  it("filters routes by language", () => {
    router.registerRoute({
      taskType: "translation",
      language: "ar",
      model: { model: "deepseek-reasoner", temperature: 0, maxTokens: 8000 },
    });

    const enConfig = router.route("translation", makeContent({ language: "en" }));
    expect(enConfig.model).toBe("deepseek-chat");

    const arConfig = router.route("translation", makeContent({ language: "ar" }));
    expect(arConfig.model).toBe("deepseek-reasoner");
  });

  it("more specific routes are preferred", () => {
    router.registerRoute({
      taskType: "summarization",
      model: { model: "general-model", temperature: 0, maxTokens: 1000 },
    });
    router.registerRoute({
      taskType: "summarization",
      minContentLength: 5000,
      language: "fr",
      model: { model: "specific-model", temperature: 0, maxTokens: 2000 },
    });

    const config = router.route("summarization", makeContent({
      body: "x".repeat(6000),
      language: "fr",
    }));
    expect(config.model).toBe("specific-model");
  });

  it("getRoutes returns all registered routes", () => {
    const routes = router.getRoutes();
    expect(routes.length).toBeGreaterThan(10);
  });
});
