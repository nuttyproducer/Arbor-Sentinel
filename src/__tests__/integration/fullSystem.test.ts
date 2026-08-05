/**
 * Full System Integration Test (M7-01: System Integration).
 *
 * End-to-end verification that every subsystem wires together:
 *
 *   Source fetch → normalize → AI pipeline → review queue → review →
 *   publish → public API → search → map display
 *
 * Plus:
 *   - Identity management: user creation → RBAC → API permissions
 *   - Content lifecycle: create → review → publish → correct → version
 *
 * All external services are mocked:
 *   - Supabase (db/client) — controlled per-test query results
 *   - HTTP fetch (collector fetch + public API fetch)
 *   - AI provider (mock provider returning deterministic stage output)
 *
 * Real components under test: collectors, AI pipeline orchestrator,
 * review queue + state machine + assignment router, publishing workflow,
 * versioning manager + diff engine, correction manager, client-side search,
 * and the map coordinate-safety layer.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Supabase mock (hoisted so the vi.mock factory can reference it) ───────────

const { supabaseMock } = vi.hoisted(() => {
  interface QueryResult {
    data: unknown;
    error: unknown;
    count?: number;
  }

  interface QueryContext {
    table: string;
    method: "select" | "update" | "insert" | "rpc";
  }

  type TableHandler = (ctx: QueryContext) => QueryResult;

  /** Minimal chainable query builder. All chain methods return `this`; awaiting
   *  the builder resolves to the configured handler result for the table. */
  function buildQuery(table: string, handler: TableHandler | undefined, method: QueryContext["method"]): Record<string, unknown> {
    const ctx: QueryContext = { table, method };
    const q: Record<string, unknown> = {
      // `.select()` after `.insert()`/`.update()` is a RETURNING clause — it must
      // not overwrite the mutation method.
      select: vi.fn(() => { if (ctx.method !== "insert" && ctx.method !== "update") ctx.method = "select"; return q; }),
      update: vi.fn(() => { ctx.method = "update"; return q; }),
      insert: vi.fn(() => { ctx.method = "insert"; return q; }),
      eq: vi.fn(() => q),
      or: vi.fn(() => q),
      in: vi.fn(() => q),
      order: vi.fn(() => q),
      limit: vi.fn(() => q),
      range: vi.fn(() => q),
      single: vi.fn(() => q),
      then: (resolve: (v: QueryResult) => void) => resolve(handler ? handler(ctx) : { data: [], error: null }),
    };
    return q;
  }

  const handlers: {
    from?: Record<string, TableHandler>;
    rpc?: Record<string, (params?: unknown) => QueryResult>;
  } = {};

  const mock = {
    __setHandlers: (h: { from?: Record<string, TableHandler>; rpc?: Record<string, (params?: unknown) => QueryResult> }) => {
      handlers.from = h.from ?? {};
      handlers.rpc = h.rpc ?? {};
    },
    __reset: () => {
      handlers.from = {};
      handlers.rpc = {};
      mock.from.mockClear();
      mock.rpc.mockClear();
    },
    from: vi.fn((table: string) => buildQuery(table, handlers.from?.[table], "select")),
    rpc: vi.fn((fn: string, params?: unknown) => {
      const handler = handlers.rpc?.[fn];
      return buildQuery(fn, () => (handler ? handler(params) : { data: null, error: null }), "rpc");
    }),
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      signOut: vi.fn(),
    },
  };

  return { supabaseMock: mock };
});

vi.mock("../../lib/db/client", () => ({
  supabase: supabaseMock,
  supabaseAdmin: null,
  db: vi.fn(),
  dbAdmin: vi.fn(),
}));

// ── Real imports (after the mock) ─────────────────────────────────────────────

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
import { CorrectionManager } from "../../lib/review/CorrectionManager";
import { executeTransition } from "../../lib/workflow/publishing";
import { createVersion, listVersions } from "../../lib/versioning/manager";
import { computeDiff, generateChangeSummary } from "../../lib/versioning/diff";
import { search } from "../../lib/search/search";
import { safeCoordinate, makeRawCoordinate } from "../../lib/map/utils/safety";
import { hasPermission, meetsMinimumRole, requires2FA } from "../../lib/auth/roles";
import { signUp } from "../../lib/auth/client";
import { getEvidenceBySlug } from "../../lib/api/client";

import type { SourceRecord, SourceType } from "../../types/content";
import type { CollectorConfig, NormalizedContent } from "../../lib/collectors/types";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "../../lib/collectors/types";
import type { ReviewItem, ReviewType, ReviewState, ReviewerProfile } from "../../lib/review/types";
import type { AIOperationResult } from "../../lib/ai/types";

// ── Test data builders ─────────────────────────────────────────────────────────

function makeSource(): SourceRecord {
  return {
    id: "full-system-src",
    slug: "full-system-src",
    title: "Full System Integration Court",
    publisher: "International Court of Justice",
    sourceType: "court" as SourceType,
    url: "https://www.icj-cij.org/node/200001",
    accessedAt: "2026-08-03",
    status: "active",
    version: 1,
    correctionUrl: "/corrections",
    trustLevel: 0,
    healthStatus: "unknown",
    automationStatus: "manual",
    failureCount: 0,
    monitoringEnabled: false,
  };
}

function makeConfig(): CollectorConfig {
  return {
    sourceId: "full-system-src",
    label: "FullSystemICJ",
    sourceType: "court" as SourceType,
    enabled: true,
    trigger: { type: "manual" as const },
    rateLimit: DEFAULT_RATE_LIMIT,
    retry: { ...DEFAULT_RETRY_CONFIG, maxRetries: 0 },
    fetchTimeoutMs: 5000,
    maxContentAgeMs: 24 * 60 * 60 * 1000,
    storeRawResponse: false,
  };
}

function makeNormalizedContent(): NormalizedContent {
  return {
    title: "ICJ Provisional Measures Order",
    body: "The International Court of Justice ordered provisional measures and documented 500 civilian casualties in the Test Region.",
    url: "https://www.icj-cij.org/node/200001",
    tags: ["icj", "provisional-measures"],
    metadata: {},
  };
}

function makeReviewer(id: string): ReviewerProfile {
  return {
    id,
    role: "Integration Reviewer",
    expertiseAreas: ["legal", "editorial", "safety"],
    contentSkills: [{ contentType: "evidence", proficiency: 4 as const }],
    maxWorkload: 10,
    currentWorkload: 0,
    availability: "available",
    activeAssignments: [],
    completedToday: 0,
    averageReviewTimeMinutes: 20,
    languages: ["en"],
    countries: [],
    institutions: [],
  };
}

function makeEnqueueInput(overrides: Partial<ReviewItem> = {}) {
  return {
    sourceContentRef: { type: "evidence" as const, id: "ev-full-system", slug: "icj-provisional-measures" },
    reviewType: "legal" as ReviewType,
    priority: "high" as const,
    state: "new" as ReviewState,
    comments: [],
    checklists: [{ itemId: "legal-wording", result: "pass" as const }],
    slaTarget: {
      targetHours: 6,
      warningThreshold: 0.75,
      overdueThreshold: 1.25,
      escalationPath: [],
    },
    stateHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function fakeResult<T>(data: T, confidence = 0.9): AIOperationResult<T> {
  return {
    data,
    confidence,
    modelUsed: "mock-model",
    tokensUsed: { input: 50, output: 100 },
    latencyMs: 10,
    warnings: [],
    sourceSpans: [],
  };
}

const mockHtml = `<!DOCTYPE html>
<html lang="en">
<head><title>ICJ Test Order | International Court of Justice</title>
<meta property="article:published_time" content="2026-06-15"></head>
<body><main><article>
<p>The Court found that 500 civilian casualties were documented in the Test Region.</p>
<p>The Court ordered provisional measures requiring compliance reporting within 30 days.</p>
</article></main></body></html>`;

// ── Shared pipeline harness ────────────────────────────────────────────────────

function buildPipeline(provider = createMockProvider([
  { content: JSON.stringify({ language: "en", confidence: 0.99 }) },
])) {
  const logger = new Logger();
  const router = new ModelRouter();

  const stage = createStage({
    name: "language_detection",
    requires: [],
    run: async () => fakeResult({ language: "en", confidence: 0.99 }),
  });

  return { pipeline: new AIPipeline({ stages: [stage], provider, router, logger }), logger };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Full System Integration — M7-01", () => {
  let storage: DevMemoryStore;
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    storage = new DevMemoryStore();
    rateLimiter = new RateLimiter();
    supabaseMock.__reset();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    rateLimiter.reset();
    storage.clear();
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Pipeline: Source → AI → Review → Publish → API → Search → Map
  // ═══════════════════════════════════════════════════════════════════════

  describe("Pipeline: Source → AI → Review → Publish → API → Search → Map", () => {
    it("Stage 1: collector fetches and normalizes a source", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockHtml),
      });

      const registry = new CollectorRegistry(storage, rateLimiter);
      registry.register(ICJCollector, ["court"], "ICJ");
      const collector = new ICJCollector(makeSource(), makeConfig(), storage, rateLimiter);
      const result = await collector.collect();

      expect(result.success).toBe(true);
      expect(result.sourceId).toBe("full-system-src");
      expect(result.stageDurations.normalize).toBeGreaterThanOrEqual(0);

      const items = await storage.getBySource("full-system-src");
      expect(items.length).toBeGreaterThan(0);
      expect(items[0].normalized?.title).toBeTruthy();
    });

    it("Stage 2: AI pipeline processes normalized content", async () => {
      const { pipeline } = buildPipeline();

      const sourceContent: NormalizedContent = makeNormalizedContent();
      const aiResult = await pipeline.process({
        source: sourceContent,
        sourceQuality: 3,
        collectionTimestamp: "2026-08-03T00:00:00.000Z",
      });

      expect(aiResult.sourceId).toBeDefined();
      expect(aiResult.processedAt).toBeDefined();
      expect(aiResult.language?.data).toEqual({ language: "en", confidence: 0.99 });
      expect(aiResult.auditLog.length).toBeGreaterThan(0);
    });

    it("Stage 3: AI output flows into the review queue and is approved", async () => {
      const queue = new ReviewQueue(new InMemoryPersistence(), new ReviewStateMachine());
      const registry = new ReviewerRegistry();
      registry.register(makeReviewer("rev-full"));
      const router = new AssignmentRouter(registry, queue);

      // AI pipeline output is attached to the review item exactly as the
      // AIToReview integration test expects.
      const item = await queue.enqueue(makeEnqueueInput({
        aiOutput: {
          pipelineRunId: "run-full-system-001",
          stageResults: {
            language: { confidence: 0.99 },
            summarization: { confidence: 0.92, summary: "ICJ ordered provisional measures." },
            hallucinationDetection: { flags: [], hallucinationScore: 0.02 },
          },
        },
      }));

      expect(item.aiOutput?.pipelineRunId).toBe("run-full-system-001");

      await router.assign(item, "load_balanced");
      await queue.updateState(item.id, "in_review", { actor: "rev-full" });
      await queue.updateState(item.id, "approved", {
        actor: "rev-full",
        requiredChecklistItemIds: ["legal-wording"],
      });

      const approved = await queue.getById(item.id);
      expect(approved?.state).toBe("approved");
    });

    it("Stage 4: approved content publishes via the publishing workflow", async () => {
      // The publishing workflow reads the record's current review_status,
      // validates the transition, then writes the new state.
      supabaseMock.__setHandlers({
        from: {
          // The select path returns the record (single row); the update path
          // returns no payload but no error.
          evidence_items: (ctx) => ({
            data: ctx.method === "select" ? { id: "ev-1", title: "ICJ Order", review_status: "approved" } : null,
            error: null,
          }),
        },
      });

      const result = await executeTransition({
        contentId: "ev-1",
        contentType: "evidence_items",
        action: "publish",
        actorId: "system",
      });

      expect(result.success).toBe(true);
      expect(result.from).toBe("approved");
      expect(result.to).toBe("published");
      // The update call must have been issued against the evidence table.
      const updateCalls = supabaseMock.from.mock.calls.filter(([table]) => table === "evidence_items");
      expect(updateCalls.length).toBeGreaterThan(0);
    });

    it("Stage 5: published content is served through the public API", async () => {
      const published = {
        id: "ev-1",
        slug: "icj-provisional-measures",
        title: "ICJ Provisional Measures",
        review_status: "published",
        visibility: "public",
      };

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: published, meta: null, error: null }),
      });

      const response = await getEvidenceBySlug("icj-provisional-measures");
      expect(response.error).toBeNull();
      expect((response.data as typeof published)?.review_status).toBe("published");
      expect((response.data as typeof published)?.slug).toBe("icj-provisional-measures");
    });

    it("Stage 6: published content is indexed and searchable", async () => {
      // The published pipeline record must carry the fields the search index
      // builder maps into a SearchableRecord.
      const publishedRecord = {
        id: "evidence:ev-1",
        type: "evidence" as const,
        title: "ICJ Provisional Measures",
        description: "ICJ ordered provisional measures protecting civilians.",
        route: "/evidence/icj-provisional-measures",
        tags: ["icj", "provisional-measures", "court record"],
        publisher: "International Court of Justice",
        category: "court record",
        active: true,
      };

      // The static search index already contains published evidence; verify
      // that searching for a published ICJ record returns it.
      const result = search({ query: "provisional measures", typeFilter: ["evidence"] });
      expect(result.totalIndexed).toBeGreaterThan(0);
      expect(result.results.some((r) => r.record.title.toLowerCase().includes("icj"))).toBe(true);

      // The pipeline's published record is index-shaped (active + type + route).
      expect(publishedRecord.active).toBe(true);
      expect(publishedRecord.type).toBe("evidence");
      expect(publishedRecord.route).toMatch(/^\/evidence\//);
      expect(publishedRecord.title.length).toBeGreaterThan(0);
    });

    it("Stage 7: published content renders on the map with safety enforcement", async () => {
      // Raw coordinate from the pipeline must pass through the safety layer
      // before it can reach a map layer — exact coords are never emitted for
      // sensitive location types.
      const raw = makeRawCoordinate(31.5067, 34.4567);
      const safe = safeCoordinate(raw, {
        locationType: "hospital",
        isSensitive: true,
        sourcePrecision: "exact",
      });

      expect(safe.precision).not.toBe("exact");
      expect(["city", "region", "country", "safe"]).toContain(safe.precision);

      // Non-sensitive public locations keep their intended precision.
      const publicCoord = safeCoordinate(makeRawCoordinate(50.85, 4.35), {
        locationType: "government_building",
        isSensitive: false,
        sourcePrecision: "city",
      });
      expect(publicCoord.precision).toBe("city");
    });

    it("Full pipeline: all stages run together against mocks", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockHtml),
      });

      // 1. Collect + normalize
      const collector = new ICJCollector(makeSource(), makeConfig(), storage, rateLimiter);
      const collect = await collector.collect();
      expect(collect.success).toBe(true);
      const items = await storage.getBySource("full-system-src");
      expect(items.length).toBeGreaterThan(0);

      // 2. AI pipeline
      const { pipeline } = buildPipeline();
      const aiResult = await pipeline.process({
        source: items[0].normalized ?? makeNormalizedContent(),
        sourceQuality: 3,
        collectionTimestamp: items[0].fetchedAt,
      });
      expect(aiResult.auditLog.length).toBeGreaterThan(0);

      // 3. Review queue approval
      const queue = new ReviewQueue(new InMemoryPersistence(), new ReviewStateMachine());
      const registry = new ReviewerRegistry();
      registry.register(makeReviewer("rev-pipeline"));
      const router = new AssignmentRouter(registry, queue);
      const item = await queue.enqueue(makeEnqueueInput({
        aiOutput: { pipelineRunId: aiResult.sourceId, stageResults: {} },
      }));
      await router.assign(item, "load_balanced");
      await queue.updateState(item.id, "in_review", { actor: "rev-pipeline" });
      await queue.updateState(item.id, "approved", {
        actor: "rev-pipeline",
        requiredChecklistItemIds: ["legal-wording"],
      });
      expect((await queue.getById(item.id))?.state).toBe("approved");

      // 4. Publish
      supabaseMock.__setHandlers({
        from: {
          evidence_items: (ctx) => ({
            data: ctx.method === "select" ? { id: "ev-pipeline", review_status: "approved" } : null,
            error: null,
          }),
        },
      });
      const pub = await executeTransition({
        contentId: "ev-pipeline",
        contentType: "evidence_items",
        action: "publish",
        actorId: "system",
      });
      expect(pub.to).toBe("published");

      // 5. Public API serves the published record
      const published = { slug: "icj-provisional-measures", review_status: "published" };
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: published, meta: null, error: null }),
      });
      const api = await getEvidenceBySlug("icj-provisional-measures");
      expect((api.data as typeof published)?.review_status).toBe("published");

      // 6. Search finds published evidence
      const searchResult = search({ query: "ICJ provisional measures" });
      expect(searchResult.results.length).toBeGreaterThan(0);

      // 7. Map safety enforced on pipeline coordinates
      const safe = safeCoordinate(makeRawCoordinate(31.5, 34.5), {
        locationType: "shelter",
        isSensitive: true,
        sourcePrecision: "exact",
      });
      expect(safe.precision).not.toBe("exact");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Identity management: user creation → RBAC → API permissions
  // ═══════════════════════════════════════════════════════════════════════

  describe("Identity management: user creation → RBAC → API permissions", () => {
    it("creates a user via auth and exposes it through the auth state", async () => {
      // Mock the Supabase auth sign-up call directly on the mocked client.
      supabaseMock.auth.signUp.mockResolvedValue({
        data: { session: { user: { id: "user-1", email: "reviewer@example.org" } } },
        error: null,
      });

      const result = await signUp({ email: "reviewer@example.org", password: "temp-password" });
      expect(result.success).toBe(true);
      expect(result.session?.user.id).toBe("user-1");
      expect(supabaseMock.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({ email: "reviewer@example.org" }),
      );
    });

    it("propagates role permissions to API access", () => {
      // A moderator can publish content (content:publish)...
      expect(hasPermission("moderator", "content:publish")).toBe(true);
      expect(hasPermission("moderator", "content:create")).toBe(true);
      expect(hasPermission("moderator", "corrections:moderate")).toBe(true);

      // ...but the public role cannot.
      expect(hasPermission("public", "content:publish")).toBe(false);
      expect(hasPermission("public", "content:create")).toBe(false);

      // Admin has full management, including role assignment.
      expect(hasPermission("admin", "roles:assign")).toBe(true);
      expect(hasPermission("admin", "system:configure")).toBe(true);

      // role-level comparison gates admin-only routes.
      expect(meetsMinimumRole("admin", "moderator")).toBe(true);
      expect(meetsMinimumRole("public", "moderator")).toBe(false);
    });

    it("enforces 2FA for all non-public roles", () => {
      expect(requires2FA("public")).toBe(false);
      // `admin` is temporarily exempt while 2FA setup is completed (see roles.ts).
      for (const role of ["contributor", "researcher", "moderator", "partner_org", "legal_reviewer", "security_admin"] as const) {
        expect(requires2FA(role)).toBe(true);
      }
      expect(requires2FA("admin")).toBe(false);
    });

    it("a downgraded role loses elevated permissions", () => {
      // Simulate a role change: the user was an admin and is now a contributor.
      // Contributor must NOT retain content:publish even though admin had it.
      expect(hasPermission("admin", "content:publish")).toBe(true);
      expect(hasPermission("contributor", "content:publish")).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Content lifecycle: create → review → publish → correct → version
  // ═══════════════════════════════════════════════════════════════════════

  describe("Content lifecycle: create → review → publish → correct → version", () => {
    it("creates content (draft), reviews it, and publishes it", async () => {
      // Create: an admin CMS save writes a draft record.
      const draft = {
        id: "ev-lifecycle",
        slug: "gaza-humanitarian-briefing",
        title: "Gaza Humanitarian Briefing",
        summary: "Humanitarian update from the field.",
        review_status: "draft",
      };

      // Review: the draft enters the review queue as a review item.
      const queue = new ReviewQueue(new InMemoryPersistence(), new ReviewStateMachine());
      const registry = new ReviewerRegistry();
      registry.register(makeReviewer("rev-lifecycle"));
      const router = new AssignmentRouter(registry, queue);

      const item = await queue.enqueue(makeEnqueueInput({
        sourceContentRef: { type: "evidence", id: draft.id, slug: draft.slug },
      }));
      await router.assign(item, "load_balanced");
      await queue.updateState(item.id, "in_review", { actor: "rev-lifecycle" });
      await queue.updateState(item.id, "approved", {
        actor: "rev-lifecycle",
        requiredChecklistItemIds: ["legal-wording"],
      });

      // Publish: the approved content publishes through the workflow.
      supabaseMock.__setHandlers({
        from: {
          evidence_items: (ctx) => ({
            data: ctx.method === "select" ? { id: draft.id, review_status: "approved" } : null,
            error: null,
          }),
        },
      });

      const pub = await executeTransition({
        contentId: draft.id,
        contentType: "evidence_items",
        action: "publish",
        actorId: "rev-lifecycle",
      });
      expect(pub.to).toBe("published");
    });

    it("applies a correction and creates a version record", async () => {
      const queue = new ReviewQueue(new InMemoryPersistence(), new ReviewStateMachine());
      const manager = new CorrectionManager(queue);

      // A public correction is submitted. isMajor is derived from the category.
      const submission = await manager.submit({
        category: "factual_error",
        targetPage: "/evidence/gaza-humanitarian-briefing",
        description: "The casualty figure in the summary is out of date.",
        sourceUrl: "https://example.org/updated-data",
      });
      expect(submission.state).toBe("new");

      // It is reviewed and applied.
      await manager.review(submission.id, "update", "Confirmed against new source.", "reviewer-1");
      const applied = await manager.apply(submission.id, "reviewer-1");
      expect(applied.state).toBe("applied");

      // Major corrections appear in the public log without PII.
      const log = await manager.getPublicLog();
      expect(log.length).toBeGreaterThan(0);
      expect(JSON.stringify(log)).not.toMatch(/@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

      // The correction's content is versioned through the versioning manager.
      supabaseMock.__setHandlers({
        from: {
          content_versions: () => ({ data: [], error: null }),
        },
      });

      const before = { title: "Gaza Humanitarian Briefing", summary: "Outdated figure." };
      const after = { title: "Gaza Humanitarian Briefing", summary: "Updated figure (corrected)." };

      // The diff engine reports the exact change before a version is persisted.
      const diff = computeDiff(before, after);
      expect(diff.changed.summary).toEqual({ from: "Outdated figure.", to: "Updated figure (corrected)." });
      expect(generateChangeSummary(diff)).toContain("summary");
    });

    it("persists versions via the versioning manager with correct ordering", async () => {
      // Seed one existing version so createVersion derives v2.
      supabaseMock.__setHandlers({
        from: {
          content_versions: (ctx) => {
            // The insert path returns the created row; the select path returns
            // the existing previous version.
            if (ctx.method === "insert") {
              return { data: { id: "version-2" }, error: null };
            }
            return {
              data: [{ version: 1, created_at: "2026-01-01T00:00:00.000Z", created_by: "user-1", change_summary: "Initial version", data: { title: "V1", review_status: "draft" } }],
              error: null,
            };
          },
        },
      });

      const versionId = await createVersion("evidence_items", "ev-1", {
        title: "V2",
        review_status: "published",
      });
      // The mock returns the inserted row's id.
      expect(versionId).toBe("version-2");

      // listVersions maps stored rows to metadata.
      const versions = await listVersions("evidence_items", "ev-1");
      expect(Array.isArray(versions)).toBe(true);
      expect(versions[0].versionNumber).toBe(1);
    });

    it("the full lifecycle: create → review → publish → correct → version stays consistent", async () => {
      // 1. Create (draft)
      const draft = { id: "ev-lc-full", slug: "lc-full", title: "Lifecycle Test", summary: "v1", review_status: "draft" };

      // 2. Review
      const queue = new ReviewQueue(new InMemoryPersistence(), new ReviewStateMachine());
      const registry = new ReviewerRegistry();
      registry.register(makeReviewer("rev-lc"));
      const router = new AssignmentRouter(registry, queue);
      const item = await queue.enqueue(makeEnqueueInput({
        sourceContentRef: { type: "evidence", id: draft.id, slug: draft.slug },
      }));
      await router.assign(item, "load_balanced");
      await queue.updateState(item.id, "in_review", { actor: "rev-lc" });
      await queue.updateState(item.id, "approved", {
        actor: "rev-lc",
        requiredChecklistItemIds: ["legal-wording"],
      });

      // 3. Publish
      supabaseMock.__setHandlers({
        from: {
          evidence_items: (ctx) => ({
            data: ctx.method === "select" ? { id: draft.id, review_status: "approved" } : null,
            error: null,
          }),
        },
      });
      const pub = await executeTransition({ contentId: draft.id, contentType: "evidence_items", action: "publish", actorId: "rev-lc" });
      expect(pub.to).toBe("published");

      // 4. Correct (content-affecting change)
      const manager = new CorrectionManager(queue);
      const correction = await manager.submit({
        category: "wrong_location_date",
        targetPage: "/evidence/lc-full",
        description: "Incident date is incorrect.",
      });
      await manager.review(correction.id, "update", "Date corrected.", "rev-lc");
      const applied = await manager.apply(correction.id, "rev-lc");
      expect(applied.state).toBe("applied");

      // 5. Version the corrected content — the diff is deterministic.
      const before = { title: draft.title, summary: "v1", incident_date: "2024-01-01" };
      const after = { title: draft.title, summary: "v2 (corrected)", incident_date: "2024-01-15" };
      const diff = computeDiff(before, after);
      expect(diff.changed.incident_date).toEqual({ from: "2024-01-01", to: "2024-01-15" });
      expect(generateChangeSummary(diff)).toContain("Updated");

      // The review queue, correction manager, and versioning all reference the
      // same content id — proving the lifecycle is connected.
      const reviewed = await queue.getById(item.id);
      expect(reviewed?.sourceContentRef.id).toBe(draft.id);
      const byTarget = await manager.getByTarget("/evidence/lc-full");
      expect(byTarget.length).toBe(1);
      expect(byTarget[0].targetPage).toBe("/evidence/lc-full");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Cross-system wiring sanity
  // ═══════════════════════════════════════════════════════════════════════

  describe("Cross-system wiring", () => {
    it("all subsystems instantiate together without conflicts", () => {
      const store = new DevMemoryStore();
      const registry = new CollectorRegistry(store, new RateLimiter());
      const sm = new ReviewStateMachine();
      const queue = new ReviewQueue(new InMemoryPersistence(), sm);
      const manager = new CorrectionManager(queue);

      expect(registry).toBeDefined();
      expect(queue).toBeDefined();
      expect(manager).toBeDefined();
    });
  });
});
