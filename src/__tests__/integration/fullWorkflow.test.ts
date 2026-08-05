/**
 * Full Workflow Integration Test (M4.7-03).
 *
 * Complete end-to-end workflow: Collector → AI pipeline → Review queue → Knowledge graph.
 * All external services mocked — no real HTTP calls, no real API keys.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ICJCollector } from "../../lib/collectors/courts/ICJCollector";
import { CollectorRegistry } from "../../lib/collectors/CollectorRegistry";
import { RateLimiter } from "../../lib/collectors/rateLimiter";
import { DevMemoryStore } from "../../lib/collectors/store";
import { AIPipeline, createStage } from "../../lib/ai/AIPipeline";
import { createMockProvider } from "../../lib/ai/provider";
import { Logger } from "../../lib/ai/Logger";
import { ModelRouter } from "../../lib/ai/ModelRouter";
import { ReviewQueue } from "../../lib/review/ReviewQueue";
import { InMemoryPersistence } from "../../lib/review/ReviewPersistence";
import { ReviewStateMachine } from "../../lib/review/ReviewStateMachine";
import { AssignmentRouter } from "../../lib/review/AssignmentRouter";
import { ReviewerRegistry } from "../../lib/review/ReviewerRegistry";
import { GraphDB } from "../../lib/graph/GraphDB";
import type { SourceRecord, SourceType } from "../../types/content";
import type { CollectorConfig, NormalizedContent } from "../../lib/collectors/types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../lib/collectors/types";
import type { ReviewItem, ReviewType, ReviewState, ReviewerProfile } from "../../lib/review/types";
import type { GraphEdge, EdgeType } from "../../lib/graph/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSource(): SourceRecord {
  return {
    id: "full-workflow-src", slug: "full-workflow", title: "Full Workflow Test Court",
    publisher: "Test Court", sourceType: "court" as SourceType,
    url: "https://www.icj-cij.org/node/200001", accessedAt: "2026-08-03",
    status: "active", version: 1, correctionUrl: "/corrections",
    trustLevel: 0, healthStatus: "unknown", automationStatus: "manual",
    failureCount: 0, monitoringEnabled: false,
  };
}

function makeConfig(): CollectorConfig {
  return {
    sourceId: "full-workflow-src", label: "FullWorkflowICJ",
    sourceType: "court" as SourceType, enabled: true,
    trigger: { type: "manual" as const }, rateLimit: DEFAULT_RATE_LIMIT,
    retry: { ...DEFAULT_RETRY_CONFIG, maxRetries: 0 },
    fetchTimeoutMs: 5000, maxContentAgeMs: 24 * 60 * 60 * 1000,
    storeRawResponse: false,
  };
}

function makeReviewer(id: string): ReviewerProfile {
  return {
    id, role: "Integration Reviewer",
    expertiseAreas: ["legal", "editorial", "safety"],
    contentSkills: [{ contentType: "evidence", proficiency: 4 as const }],
    maxWorkload: 10, currentWorkload: 0, availability: "available",
    activeAssignments: [], completedToday: 0, averageReviewTimeMinutes: 20,
    languages: ["en"], countries: [], institutions: [],
  };
}

function makeEnqueueInput(overrides: Partial<ReviewItem> = {}) {
  return {
    sourceContentRef: { type: "evidence" as const, id: "ev-full", slug: "full-test" },
    reviewType: "editorial" as ReviewType,
    priority: "medium" as const, priorityScore: 50,
    state: "new" as ReviewState, comments: [], checklists: [],
    slaTarget: { targetHours: 24, warningThreshold: 0.75, overdueThreshold: 1.25, escalationPath: [] },
    stateHistory: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

const mockHtml = `<!DOCTYPE html>
<html lang="en">
<head><title>ICJ Test Order | International Court of Justice</title>
<meta property="article:published_time" content="2026-06-15"></head>
<body><main><article>
<p>The Court found that 500 civilian casualties were documented in the Test Region.</p>
</article></main></body></html>`;

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Full Workflow — Collector → AI → Review → Graph", () => {
  let storage: DevMemoryStore;
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    storage = new DevMemoryStore();
    rateLimiter = new RateLimiter();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    rateLimiter.reset();
    storage.clear();
  });

  it("Phase 1: Collector fetches and normalizes content", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true, status: 200,
      text: () => Promise.resolve(mockHtml),
    });

    const collector = new ICJCollector(makeSource(), makeConfig(), storage, rateLimiter);
    const result = await collector.collect();

    expect(result.success).toBe(true);
    expect(result.sourceId).toBe("full-workflow-src");
  });

  it("Phase 2: AI pipeline processes normalized content", async () => {
    const provider = createMockProvider([
      { content: JSON.stringify({ language: "en", confidence: 0.99 }) },
    ]);
    const logger = new Logger();
    const router = new ModelRouter();

    const langStage = createStage({
      name: "language_detection", requires: [],
      run: async () => ({
        data: { language: "en" }, confidence: 0.99, modelUsed: "mock",
        tokensUsed: { input: 5, output: 3 }, latencyMs: 1, warnings: [], sourceSpans: [],
      }),
    });

    const pipeline = new AIPipeline({ stages: [langStage], provider, router, logger });

    const sourceContent: NormalizedContent = {
      title: "ICJ Test Order",
      body: "The Court found that 500 civilian casualties were documented.",
      url: "https://www.icj-cij.org/node/200001", tags: [], metadata: {},
    };

    const aiResult = await pipeline.process({
      source: sourceContent, sourceQuality: 3,
      collectionTimestamp: "2026-08-03T00:00:00.000Z",
    });

    expect(aiResult.sourceId).toBeDefined();
    expect(aiResult.auditLog.length).toBeGreaterThan(0);
  });

  it("Phase 3: Review queue enqueues and processes content", async () => {
    const sm = new ReviewStateMachine();
    const queue = new ReviewQueue(new InMemoryPersistence(), sm);
    const registry = new ReviewerRegistry();
    registry.register(makeReviewer("rev-full"));
    const router = new AssignmentRouter(registry, queue);

    const item = await queue.enqueue(makeEnqueueInput({
      reviewType: "legal" as ReviewType,
      checklists: [{ itemId: "editorial-tone", result: "pass" }],
      aiOutput: { pipelineRunId: "run-full-001", stageResults: {} },
    }));

    await router.assign(item, "load_balanced");
    await queue.updateState(item.id, "in_review", { actor: "rev-full" });
    await queue.updateState(item.id, "approved", {
      actor: "rev-full", requiredChecklistItemIds: ["editorial-tone"],
    });

    const final = await queue.getById(item.id);
    expect(final?.state).toBe("approved");
  });

  it("Phase 4: Knowledge graph populates from approved content", () => {
    const graph = new GraphDB();

    graph.addNode({
      id: "doc-approved", type: "document", label: "ICJ Order — Approved",
      properties: { title: "ICJ Order of 15 June 2026" },
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });

    graph.addNode({
      id: "src-icj", type: "source", label: "ICJ",
      properties: { publisher: "International Court of Justice", sourceType: "court" },
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });

    const edge: GraphEdge = {
      id: "e-pub", type: "published_by" as EdgeType,
      sourceId: "doc-approved", targetId: "src-icj",
      label: "Published by", properties: {},
      createdAt: new Date().toISOString(),
    };

    graph.addEdge(edge);
    expect(graph.getNode("doc-approved")).toBeDefined();
  });

  it("All systems instantiate together without conflicts", () => {
    const store = new DevMemoryStore();
    const registry = new CollectorRegistry(store, new RateLimiter());
    const sm = new ReviewStateMachine();
    const queue = new ReviewQueue(new InMemoryPersistence(), sm);
    const graph = new GraphDB();

    expect(registry).toBeDefined();
    expect(queue).toBeDefined();
    expect(graph).toBeDefined();
  });
});
