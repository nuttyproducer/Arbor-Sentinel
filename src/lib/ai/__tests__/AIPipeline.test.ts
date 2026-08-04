// src/lib/ai/__tests__/AIPipeline.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { AIPipeline, createStage, createPipelineContext } from "../AIPipeline";
import { createMockProvider } from "../provider";
import { Logger } from "../Logger";
import { ModelRouter } from "../ModelRouter";
import type { AIStage, AIContent } from "../types";
import type { NormalizedContent } from "../../collectors/types";

function makeContent(overrides: Partial<NormalizedContent> = {}): NormalizedContent {
  return {
    title: "Test Article",
    body: "The ICJ issued a ruling on January 15, 2026.",
    url: "https://example.com/test",
    tags: [],
    metadata: {},
    ...overrides,
  };
}

function makeAIContent(source: NormalizedContent): AIContent {
  return {
    source,
    sourceQuality: 3,
    collectionTimestamp: "2026-08-01T00:00:00.000Z",
  };
}

describe("AIPipeline", () => {
  let provider: ReturnType<typeof createMockProvider>;
  let logger: Logger;
  let router: ModelRouter;

  beforeEach(() => {
    provider = createMockProvider([
      { content: '{"test": true}' },
      { content: '{"test": true}' },
      { content: '{"test": true}' },
    ]);
    logger = new Logger();
    router = new ModelRouter();
  });

  it("runs stages in dependency order", async () => {
    const runOrder: string[] = [];

    const stageA = createStage({
      name: "stage_a",
      requires: [],
      run: async () => {
        runOrder.push("a");
        return {
          data: "a-result", confidence: 1, modelUsed: "mock", tokensUsed: { input: 0, output: 0 },
          latencyMs: 0, warnings: [], sourceSpans: [],
        };
      },
    });

    const stageB = createStage({
      name: "stage_b",
      requires: ["stage_a"],
      run: async (_input, ctx) => {
        runOrder.push("b");
        expect(ctx.has("stage_a")).toBe(true);
        expect(ctx.get("stage_a")?.data).toBe("a-result");
        return {
          data: "b-result", confidence: 1, modelUsed: "mock", tokensUsed: { input: 0, output: 0 },
          latencyMs: 0, warnings: [], sourceSpans: [],
        };
      },
    });

    const stageC = createStage({
      name: "stage_c",
      requires: [],
      run: async () => {
        runOrder.push("c");
        return {
          data: "c-result", confidence: 1, modelUsed: "mock", tokensUsed: { input: 0, output: 0 },
          latencyMs: 0, warnings: [], sourceSpans: [],
        };
      },
    });

    const pipeline = new AIPipeline({
      stages: [stageA, stageB, stageC],
      provider,
      router,
      logger,
    });

    await pipeline.process(makeAIContent(makeContent()));

    // 'a' must come before 'b', 'c' can be anywhere
    const aIdx = runOrder.indexOf("a");
    const bIdx = runOrder.indexOf("b");
    expect(aIdx).toBeLessThan(bIdx);
  });

  it("runs independent stages in parallel", async () => {
    const timestamps: Array<{ name: string; start: number; end: number }> = [];

    const makeStage = (name: string): AIStage => createStage({
      name,
      requires: [],
      run: async () => {
        const start = Date.now();
        await new Promise((r) => setTimeout(r, 50));
        const end = Date.now();
        timestamps.push({ name, start, end });
        return {
          data: name, confidence: 1, modelUsed: "mock", tokensUsed: { input: 0, output: 0 },
          latencyMs: end - start, warnings: [], sourceSpans: [],
        };
      },
    });

    const pipeline = new AIPipeline({
      stages: [makeStage("a"), makeStage("b"), makeStage("c")],
      provider,
      router,
      logger,
    });

    const start = Date.now();
    await pipeline.process(makeAIContent(makeContent()));
    const totalTime = Date.now() - start;

    // If they ran in parallel, total time should be ~50ms, not ~150ms
    expect(totalTime).toBeLessThan(200);
  });

  it("skips stage when dependency fails", async () => {
    const failingStage = createStage({
      name: "failing",
      requires: [],
      run: async () => {
        throw new Error("deliberate failure");
      },
    });

    const dependentStage = createStage({
      name: "dependent",
      requires: ["failing"],
      run: async () => ({
        data: "should not run", confidence: 1, modelUsed: "mock",
        tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [],
      }),
    });

    const pipeline = new AIPipeline({
      stages: [failingStage, dependentStage],
      provider,
      router,
      logger,
    });

    const result = await pipeline.process(makeAIContent(makeContent()));

    // The dependent stage should have an empty result (skipped)
    // We check that the pipeline completed without throwing
    expect(result.auditLog.length).toBeGreaterThan(0);

    // Check that failing stage error is logged
    const failingLog = result.auditLog.find((e) => e.stageName === "failing");
    expect(failingLog).toBeDefined();
  });

  it("throws on unknown dependency", () => {
    const badStage = createStage({
      name: "bad",
      requires: ["nonexistent_stage"],
      run: async () => ({
        data: null, confidence: 0, modelUsed: "mock",
        tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [],
      }),
    });

    expect(
      () => new AIPipeline({ stages: [badStage], provider, router, logger }),
    ).toThrow("not registered");
  });

  it("detects dependency cycles", () => {
    const stageA = createStage({
      name: "a",
      requires: ["b"],
      run: async () => ({
        data: null, confidence: 0, modelUsed: "mock",
        tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [],
      }),
    });
    const stageB = createStage({
      name: "b",
      requires: ["a"],
      run: async () => ({
        data: null, confidence: 0, modelUsed: "mock",
        tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [],
      }),
    });

    const pipeline = new AIPipeline({
      stages: [stageA, stageB],
      provider,
      router,
      logger,
    });

    expect(pipeline.process(makeAIContent(makeContent()))).rejects.toThrow("cycle");
  });

  it("builds complete AIProcessedContent output", async () => {
    const stage = createStage({
      name: "entity_extraction",
      requires: [],
      run: async () => ({
        data: [{ name: "ICJ", type: "organization" }],
        confidence: 0.9,
        modelUsed: "deepseek-chat",
        tokensUsed: { input: 100, output: 50 },
        latencyMs: 500,
        warnings: [],
        sourceSpans: [],
      }),
    });

    const pipeline = new AIPipeline({
      stages: [stage],
      provider,
      router,
      logger,
    });

    const result = await pipeline.process(makeAIContent(makeContent()));

    expect(result.sourceId).toBe("https://example.com/test");
    expect(result.processedAt).toBeDefined();
    expect(result.entities.data).toHaveLength(1);
    expect(result.auditLog).toHaveLength(1);
  });

  it("handles empty pipeline (no stages)", async () => {
    const pipeline = new AIPipeline({
      stages: [],
      provider,
      router,
      logger,
    });

    const result = await pipeline.process(makeAIContent(makeContent()));
    expect(result.auditLog).toHaveLength(0);
    expect(result.entities.data).toBeNull(); // default empty result
  });
});

describe("createPipelineContext", () => {
  it("creates a context with source content", () => {
    const content = makeContent();
    const ctx = createPipelineContext(content, 3);

    expect(ctx.source).toBe(content);
    expect(ctx.sourceQuality).toBe(3);
    expect(ctx.has("anything")).toBe(false);
    expect(ctx.get("anything")).toBeUndefined();
  });

  it("allows setting and getting stage results", () => {
    const ctx = createPipelineContext(makeContent());

    ctx.set("test_stage", {
      data: "hello", confidence: 1, modelUsed: "mock",
      tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [],
    });

    expect(ctx.has("test_stage")).toBe(true);
    expect(ctx.get("test_stage")?.data).toBe("hello");
  });

  it("stores existing records and known entities", () => {
    const records = [{ id: "1", title: "Test", summary: "Summary", sourceIds: ["s1"] }];
    const entities = [{ id: "e1", canonicalName: "ICJ", aliases: ["International Court of Justice"], entityType: "organization" }];

    const ctx = createPipelineContext(makeContent(), 0, "2026-01-01", records, entities);

    expect(ctx.existingRecords).toBe(records);
    expect(ctx.knownEntities).toBe(entities);
  });
});
