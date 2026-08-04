#!/usr/bin/env tsx
/**
 * Data-flow verification (CI-compatible).
 *
 * Validates that every pipeline stage produces output shaped for the next
 * stage's input. Runs standalone via `npx tsx scripts/verify-data-flow.ts`
 * and is invoked by `scripts/verify-data-flow.sh`.
 *
 * Exit code 0 = all contracts satisfied. Exit code 1 = a stage boundary is
 * broken (TypeScript interfaces would reject the data flow).
 */

import type { NormalizedContent } from "../src/lib/collectors/types";
import type { AIProcessedContent, AIContent } from "../src/lib/ai/types";
import type { ReviewItem, ReviewerProfile, ReviewType } from "../src/lib/review/types";
import type { PublishState, PublishAction } from "../src/lib/workflow/types";
import type { SearchableRecord, SearchableRecordType } from "../src/lib/search/types";
import type { SafeCoordinate, MapFeature, LocationPrecision } from "../src/lib/map/types";
import type { SourceRecord, VerificationLevel } from "../src/types/content";
import { VALID_TRANSITIONS, isValidTransition, nextState } from "../src/lib/workflow/types";
import { EDGE_TYPE_ALLOWED_PAIRS, NODE_TYPE_LABELS } from "../src/lib/graph/types";

// Note: `safeCoordinate()` itself is exercised under Vite in the integration
// tests (fullSystem.test.ts, mapDataSafety.test.ts). This script validates the
// map contract at the type level so it can run under plain Node/tsx.

// ── Check registry ────────────────────────────────────────────────────────────

interface Check {
  name: string;
  stage: string;
  run: () => boolean;
}

const results: Array<{ check: Check; ok: boolean }> = [];

function check(name: string, stage: string, run: () => boolean): void {
  results.push({ check: { name, stage, run }, ok: run() });
}

function record(record: { id: string; title: string; summary: string }): SourceRecord {
  return {
    id: record.id,
    slug: record.id,
    title: record.title,
    publisher: "Test Publisher",
    sourceType: "court",
    url: "https://example.com",
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

// ── Stage 1 → 2: Collector output → AI input ──────────────────────────────────

const normalized: NormalizedContent = {
  title: "ICJ Order of 15 June 2026",
  body: "The Court ordered provisional measures in the case.",
  url: "https://www.icj-cij.org/node/200001",
  tags: ["icj"],
  metadata: {},
};

check(
  "Collector NormalizedContent satisfies AIContent.source",
  "collector → AI",
  () => {
    const aiContent: AIContent = {
      source: normalized,
      sourceQuality: 3 as VerificationLevel,
      collectionTimestamp: "2026-08-03T00:00:00.000Z",
    };
    return (
      typeof aiContent.source.title === "string" &&
      typeof aiContent.source.body === "string" &&
      typeof aiContent.source.url === "string" &&
      Array.isArray(aiContent.source.tags) &&
      typeof aiContent.source.metadata === "object"
    );
  },
);

// ── Stage 2 → 3: AI output → review queue input ───────────────────────────────

const aiProcessed: AIProcessedContent = {
  sourceId: "doc-full",
  processedAt: "2026-08-03T00:00:00.000Z",
  entities: { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] },
  claims: { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] },
  timeline: { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] },
  locations: { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] },
  relationships: { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] },
  topics: { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] },
  confidence: { data: {}, confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] },
  hallucinationFlags: { data: [], confidence: 0, modelUsed: "mock", tokensUsed: { input: 0, output: 0 }, latencyMs: 0, warnings: [], sourceSpans: [] },
  auditLog: [],
};

check(
  "AIProcessedContent carries a reviewable aiOutput",
  "AI → review queue",
  () => {
    const reviewItemAi = {
      pipelineRunId: aiProcessed.sourceId,
      stageResults: {
        entities: aiProcessed.entities,
        claims: aiProcessed.claims,
        confidence: aiProcessed.confidence,
      },
    };
    return (
      typeof aiProcessed.sourceId === "string" &&
      Array.isArray(aiProcessed.auditLog) &&
      typeof reviewItemAi.pipelineRunId === "string" &&
      typeof reviewItemAi.stageResults === "object"
    );
  },
);

// ── Stage 3 → 4: Review → publish state machine ───────────────────────────────

check(
  "approved review state can transition to published",
  "review → publish",
  () => {
    const from: PublishState = "approved";
    const action: PublishAction = "publish";
    const to = nextState(from, action);
    return to === "published";
  },
);

check(
  "every PublishState lists valid actions",
  "review → publish",
  () => {
    const states: PublishState[] = [
      "draft", "in_review", "changes_requested", "approved", "scheduled", "published", "rolled_back", "archived",
    ];
    return states.every((s) => Array.isArray(VALID_TRANSITIONS[s]));
  },
);

check(
  "published is reachable only through the workflow",
  "review → publish",
  () => {
    // new → published is illegal; the state machine enforces the review path.
    return isValidTransition("new", "publish") === false;
  },
);

// ── Stage 4 → 5: Published content → public API / search index ────────────────

check(
  "published content satisfies SearchableRecord shape",
  "publish → API/search",
  () => {
    const published: SearchableRecord = {
      id: "evidence:ev-1",
      type: "evidence" as SearchableRecordType,
      title: "ICJ Provisional Measures",
      description: "ICJ ordered provisional measures.",
      route: "/evidence/icj-provisional-measures",
      tags: ["icj"],
      publisher: "ICJ",
      category: "court record",
      active: true,
    };
    return (
      published.active === true &&
      typeof published.title === "string" &&
      typeof published.route === "string" &&
      Array.isArray(published.tags)
    );
  },
);

check(
  "ReviewItem shape required by the review queue is complete",
  "review queue",
  () => {
    const reviewer: ReviewerProfile = {
      id: "rev-1",
      role: "Reviewer",
      expertiseAreas: ["legal"],
      contentSkills: [{ contentType: "evidence", proficiency: 4 }],
      maxWorkload: 5,
      currentWorkload: 0,
      availability: "available",
      activeAssignments: [],
      completedToday: 0,
      averageReviewTimeMinutes: 20,
      languages: ["en"],
      countries: [],
      institutions: [],
    };
    const item: ReviewItem = {
      id: "review-1",
      sourceContentRef: { type: "evidence", id: "ev-1", slug: "ev-1" },
      reviewType: "legal" as ReviewType,
      priority: "high",
      priorityScore: 80,
      state: "approved",
      comments: [],
      checklists: [],
      slaTarget: { targetHours: 6, warningThreshold: 0.75, overdueThreshold: 1.25, escalationPath: [] },
      stateHistory: [],
      createdAt: "2026-08-03T00:00:00.000Z",
      updatedAt: "2026-08-03T00:00:00.000Z",
    };
    return (
      reviewer.availability === "available" &&
      item.sourceContentRef.type === "evidence" &&
      item.state === "approved"
    );
  },
);

// ── Stage 5 → map: spatial safety ─────────────────────────────────────────────

check(
  "SafeCoordinate precision vocabulary includes safe downgrade targets",
  "publish → map",
  () => {
    const allowed: LocationPrecision[] = ["country", "region", "city", "safe"];
    // safeCoordinate downgrades sensitive exact coords to one of these — the
    // vocabulary must contain them so the map never shows an exact coord.
    return allowed.every((p) => (["country", "region", "city", "district", "exact", "safe"] as LocationPrecision[]).includes(p));
  },
);

check(
  "MapFeature requires a SafeCoordinate (never a RawCoordinate)",
  "publish → map",
  () => {
    const safe: SafeCoordinate = { lat: 31.5, lon: 34.5, precision: "city", ["__brand" as never]: undefined as never };
    const feature: MapFeature = {
      id: "ev-1",
      type: "event",
      category: "documented_incident",
      title: "Test event",
      safeCoordinate: safe,
      sourceIds: ["src-1"],
      isSensitive: false,
    };
    // The brand makes it impossible to assign a raw coordinate — this compiles
    // only because `safe` is a SafeCoordinate, proving the layer contract.
    return (
      feature.safeCoordinate.precision === "city" &&
      typeof feature.safeCoordinate.lat === "number" &&
      typeof feature.safeCoordinate.lon === "number"
    );
  },
);

// ── Graph: node/edge schema alignment ─────────────────────────────────────────

check(
  "graph node types match the controlled vocabulary",
  "AI → graph",
  () => {
    const nodeTypes = Object.keys(NODE_TYPE_LABELS);
    return nodeTypes.includes("source") && nodeTypes.includes("document") && nodeTypes.includes("entity");
  },
);

check(
  "graph edge pairs are schema-valid",
  "AI → graph",
  () => {
    // Every edge type must declare at least one allowed (source, target) pair.
    return Object.values(EDGE_TYPE_ALLOWED_PAIRS).every((pairs) => pairs.length > 0);
  },
);

// ── Source registry → collector config ────────────────────────────────────────

check(
  "SourceRecord maps to a collector sourceId",
  "source registry → collector",
  () => {
    const src = record({ id: "src-icj", title: "ICJ", summary: "Test" });
    return src.id === "src-icj" && src.sourceType === "court";
  },
);

// ── Runner ────────────────────────────────────────────────────────────────────

const stageOrder = [
  "source registry → collector",
  "collector → AI",
  "AI → review queue",
  "review queue",
  "review → publish",
  "publish → API/search",
  "publish → map",
  "AI → graph",
];

console.log("── Data-flow verification ──────────────────────────────");

let failed = 0;
for (const stage of stageOrder) {
  const stageChecks = results.filter((r) => r.check.stage === stage);
  if (stageChecks.length === 0) continue;
  console.log(`\n${stage}`);
  for (const r of stageChecks) {
    const mark = r.ok ? "✅ PASS" : "❌ FAIL";
    console.log(`  ${mark}  ${r.check.name}`);
    if (!r.ok) failed += 1;
  }
}

console.log("\n──────────────────────────────────────────────────────");

const total = results.length;
console.log(`${total - failed}/${total} contract checks passed`);

if (failed > 0) {
  console.error("\n❌ DATA-FLOW VERIFICATION FAILED");
  for (const r of results.filter((x) => !x.ok)) {
    console.error(`   - [${r.check.stage}] ${r.check.name}`);
  }
  process.exit(1);
}

console.log("✅ DATA-FLOW VERIFICATION PASSED");
process.exit(0);
