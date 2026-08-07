// src/lib/admin/seedData.ts
// Development seed data for M4.4 dashboards. All values are realistic but fake.

import type { CollectResult } from "../collectors/types";
import type { HealthReport, CollectorHealthSnapshot, AlertEvent } from "../collectors/monitoring/types";
import type { ReviewItem, ReviewerProfile } from "../review/types";
import type { AILogEntry } from "../ai/types";

const NOW = new Date().toISOString();
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * HOUR_MS).toISOString();
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * DAY_MS).toISOString();
}

/** ~20 mock collector runs across varied source types. */
export function seedCollectorRuns(): CollectResult[] {
  const sourceTypes = ["court", "un", "government", "ngo", "academic", "journalism"];
  const runs: CollectResult[] = [];

  for (let i = 0; i < 20; i++) {
    const sourceType = sourceTypes[i % sourceTypes.length];
    const success = Math.random() > 0.15; // 85% success rate
    runs.push({
      runId: `seed-run-${i}`,
      sourceId: `source-${sourceType}-${i % 3}`,
      startedAt: hoursAgo(24 - i),
      completedAt: hoursAgo(24 - i - 0.01),
      itemsFetched: success ? Math.floor(Math.random() * 20) + 1 : 0,
      itemsValidated: success ? Math.floor(Math.random() * 18) + 1 : 0,
      itemsNormalized: success ? Math.floor(Math.random() * 15) + 1 : 0,
      itemsDeduplicated: success ? Math.floor(Math.random() * 12) + 1 : 0,
      itemsFiltered: 0,
      itemsStored: success ? Math.floor(Math.random() * 10) + 1 : 0,
      stageDurations: {
        fetch: Math.floor(Math.random() * 2000) + 100,
        validate: Math.floor(Math.random() * 500) + 50,
        normalize: Math.floor(Math.random() * 1000) + 100,
        deduplicate: Math.floor(Math.random() * 300) + 20,
        filter: 0,
        store: Math.floor(Math.random() * 200) + 10,
      },
      success,
    });
  }

  return runs;
}

/** Build a HealthReport from collector runs. */
export function seedHealthReport(): HealthReport {
  const snapshots: CollectorHealthSnapshot[] = [
    { collectorName: "ICJCollector", sourceType: "court", status: "active", lastFetchAt: hoursAgo(1), lastSuccessAt: hoursAgo(1), totalFetches: 50, successfulFetches: 48, failedFetches: 2, consecutiveFailures: 0, avgResponseTimeMs: 450, errorRate: 0.04, enabled: true, isStale: false },
    { collectorName: "ICCCollector", sourceType: "court", status: "active", lastFetchAt: hoursAgo(2), lastSuccessAt: hoursAgo(2), totalFetches: 40, successfulFetches: 38, failedFetches: 2, consecutiveFailures: 0, avgResponseTimeMs: 380, errorRate: 0.05, enabled: true, isStale: false },
    { collectorName: "OHCHRCollector", sourceType: "un", status: "active", lastFetchAt: hoursAgo(3), lastSuccessAt: hoursAgo(3), totalFetches: 30, successfulFetches: 28, failedFetches: 2, consecutiveFailures: 0, avgResponseTimeMs: 520, errorRate: 0.067, enabled: true, isStale: false },
    { collectorName: "OCHACollector", sourceType: "un", status: "degraded", lastFetchAt: hoursAgo(12), lastSuccessAt: hoursAgo(24), totalFetches: 25, successfulFetches: 20, failedFetches: 5, consecutiveFailures: 2, avgResponseTimeMs: 600, errorRate: 0.2, lastError: "Timeout after 30s", lastErrorType: "TimeoutError", enabled: true, isStale: true },
    { collectorName: "EUCollector", sourceType: "government", status: "active", lastFetchAt: hoursAgo(1), lastSuccessAt: hoursAgo(1), totalFetches: 20, successfulFetches: 20, failedFetches: 0, consecutiveFailures: 0, avgResponseTimeMs: 300, errorRate: 0, enabled: true, isStale: false },
    { collectorName: "BelgiumCollector", sourceType: "government", status: "failed", lastFetchAt: hoursAgo(6), lastSuccessAt: daysAgo(3), totalFetches: 15, successfulFetches: 8, failedFetches: 7, consecutiveFailures: 5, avgResponseTimeMs: 800, errorRate: 0.467, lastError: "FetchError: 503 Service Unavailable", lastErrorType: "FetchError", enabled: true, isStale: true },
    { collectorName: "AmnestyCollector", sourceType: "ngo", status: "active", lastFetchAt: hoursAgo(2), lastSuccessAt: hoursAgo(2), totalFetches: 35, successfulFetches: 34, failedFetches: 1, consecutiveFailures: 0, avgResponseTimeMs: 420, errorRate: 0.029, enabled: true, isStale: false },
    { collectorName: "HRWCollector", sourceType: "ngo", status: "active", lastFetchAt: hoursAgo(4), lastSuccessAt: hoursAgo(4), totalFetches: 30, successfulFetches: 29, failedFetches: 1, consecutiveFailures: 0, avgResponseTimeMs: 480, errorRate: 0.033, enabled: true, isStale: false },
    { collectorName: "BtselemCollector", sourceType: "ngo", status: "unknown", lastFetchAt: undefined, lastSuccessAt: undefined, totalFetches: 0, successfulFetches: 0, failedFetches: 0, consecutiveFailures: 0, avgResponseTimeMs: 0, errorRate: 0, enabled: true, isStale: false },
    { collectorName: "JournalismCollector", sourceType: "journalism", status: "active", lastFetchAt: hoursAgo(1), lastSuccessAt: hoursAgo(1), totalFetches: 50, successfulFetches: 47, failedFetches: 3, consecutiveFailures: 0, avgResponseTimeMs: 350, errorRate: 0.06, enabled: true, isStale: false },
    { collectorName: "AcademicCollector", sourceType: "academic", status: "active", lastFetchAt: hoursAgo(5), lastSuccessAt: hoursAgo(5), totalFetches: 20, successfulFetches: 19, failedFetches: 1, consecutiveFailures: 0, avgResponseTimeMs: 550, errorRate: 0.05, enabled: true, isStale: false },
  ];

  const active = snapshots.filter(s => s.status === "active").length;
  const degraded = snapshots.filter(s => s.status === "degraded").length;
  const failed = snapshots.filter(s => s.status === "failed").length;
  const unknown = snapshots.filter(s => s.status === "unknown").length;
  const stale = snapshots.filter(s => s.isStale).length;
  const overallErrorRate = snapshots.reduce((sum, s) => sum + s.errorRate, 0) / snapshots.length;

  return {
    generatedAt: NOW,
    collectors: snapshots,
    summary: {
      totalCollectors: snapshots.length,
      activeCount: active,
      degradedCount: degraded,
      failedCount: failed,
      unknownCount: unknown,
      staleCount: stale,
      overallErrorRate,
      coverageGaps: ["osint"],
    },
  };
}

/** Generate mock alert events for error rate charts. */
export function seedAlertEvents(): AlertEvent[] {
  const events: AlertEvent[] = [];
  const types: Array<AlertEvent["type"]> = ["consecutive_failures", "stale_data", "error_rate", "rate_limit"];
  const sourceTypes = ["court", "un", "government", "ngo", "journalism"];

  for (let h = 168; h >= 0; h -= 4) {
    if (Math.random() > 0.7) {
      const t = types[Math.floor(Math.random() * types.length)];
      events.push({
        id: `seed-alert-${h}`,
        ruleId: `rule-${t}`,
        type: t,
        severity: Math.random() > 0.5 ? "warning" : "critical",
        collectorName: `Collector-${h % 5}`,
        sourceType: sourceTypes[h % sourceTypes.length],
        firedAt: hoursAgo(h),
        status: h < 2 ? "active" : "resolved",
        resolvedAt: h < 2 ? undefined : hoursAgo(h - 1),
        message: `Mock alert: ${t} on ${sourceTypes[h % sourceTypes.length]}`,
        context: { errorCount: Math.floor(Math.random() * 10) + 1 },
      });
    }
  }
  return events;
}

/** ~30 review items across all states with varied ages and priorities. */
export function seedReviewItems(): ReviewItem[] {
  const states: Array<ReviewItem["state"]> = ["new", "assigned", "in_review", "changes_requested", "approved", "published", "rejected", "archived"];
  const types: Array<ReviewItem["reviewType"]> = ["editorial", "legal", "source", "translation", "safety"];
  const contentTypes: Array<ReviewItem["sourceContentRef"]["type"]> = ["evidence", "legal_case", "organization", "country", "institution"];
  const priorities: Array<ReviewItem["priority"]> = ["critical", "high", "medium", "low"];
  const items: ReviewItem[] = [];

  for (let i = 0; i < 30; i++) {
    const state = states[i % states.length];
    const priority = priorities[i % priorities.length];
    const createdAt = daysAgo(Math.floor(Math.random() * 14));
    const slaHours = priority === "critical" ? 4 : priority === "high" ? 8 : priority === "medium" ? 24 : 72;

    items.push({
      id: `seed-review-${i}`,
      sourceContentRef: {
        type: contentTypes[i % contentTypes.length],
        id: `content-${i}`,
        slug: `content-slug-${i}`,
      },
      reviewType: types[i % types.length],
      priority,
      priorityScore: 100 - i * 3,
      state,
      assignedReviewer: state !== "new" ? `rev-00${(i % 5) + 1}` : undefined,
      dueBy: new Date(new Date(createdAt).getTime() + slaHours * HOUR_MS).toISOString(),
      comments: [],
      checklists: [],
      slaTarget: {
        targetHours: slaHours,
        warningThreshold: 0.75,
        overdueThreshold: 1.0,
        escalationPath: [{ afterHoursOverdue: slaHours * 1.5, action: "notify_admin" }],
      },
      stateHistory: [{ from: "new", to: state, timestamp: createdAt, actor: "system" }],
      createdAt,
      updatedAt: hoursAgo(Math.floor(Math.random() * 12)),
    });
  }

  return items;
}

/** ~5 reviewer profiles with varied workloads. */
export function seedReviewerProfiles(): ReviewerProfile[] {
  return [
    { id: "rev-001", role: "Editorial reviewer — legal background", expertiseAreas: ["editorial", "legal"], contentSkills: [{ contentType: "evidence", proficiency: 5 }, { contentType: "legal_case", proficiency: 4 }], maxWorkload: 8, currentWorkload: 5, availability: "available", activeAssignments: ["seed-review-1", "seed-review-6"], completedToday: 3, averageReviewTimeMinutes: 45, languages: ["en", "fr"], countries: ["BE", "EU"], institutions: ["european-union"] },
    { id: "rev-002", role: "Source reviewer — OSINT background", expertiseAreas: ["source", "safety"], contentSkills: [{ contentType: "source", proficiency: 5 }, { contentType: "evidence", proficiency: 3 }], maxWorkload: 10, currentWorkload: 9, availability: "busy", activeAssignments: ["seed-review-2", "seed-review-7", "seed-review-12"], completedToday: 5, averageReviewTimeMinutes: 30, languages: ["en", "ar"], countries: [], institutions: [] },
    { id: "rev-003", role: "Translation reviewer", expertiseAreas: ["translation", "editorial"], contentSkills: [{ contentType: "evidence", proficiency: 4 }, { contentType: "organization", proficiency: 3 }], maxWorkload: 6, currentWorkload: 2, availability: "available", activeAssignments: ["seed-review-3"], completedToday: 2, averageReviewTimeMinutes: 60, languages: ["en", "fr", "nl", "ar", "he"], countries: [], institutions: [] },
    { id: "rev-004", role: "Competency reviewer — IHL background", expertiseAreas: ["competency", "legal", "safety"], contentSkills: [{ contentType: "country", proficiency: 5 }, { contentType: "institution", proficiency: 4 }, { contentType: "legal_case", proficiency: 5 }], maxWorkload: 5, currentWorkload: 0, availability: "unavailable", activeAssignments: [], completedToday: 0, averageReviewTimeMinutes: 90, languages: ["en", "fr"], countries: ["BE", "EU", "PS"], institutions: ["european-union", "unrwa"] },
    { id: "rev-005", role: "Accessibility & licensing reviewer", expertiseAreas: ["accessibility", "licensing"], contentSkills: [{ contentType: "action_template", proficiency: 4 }, { contentType: "organization", proficiency: 3 }], maxWorkload: 8, currentWorkload: 3, availability: "available", activeAssignments: ["seed-review-5"], completedToday: 4, averageReviewTimeMinutes: 25, languages: ["en", "nl"], countries: [], institutions: [] },
  ];
}

/** Mock AI pipeline audit log entries. */
export function seedAuditLogs(): AILogEntry[] {
  const stages = ["entity_extraction", "claim_extraction", "summarization", "translation", "language_detection", "duplicate_detection", "contradiction_detection", "confidence_estimation", "hallucination_detection", "topic_classification", "timeline_extraction", "geographic_extraction"];
  const entries: AILogEntry[] = [];

  for (let i = 0; i < 50; i++) {
    const confidence = Math.random() * 0.6 + 0.3; // 0.3-0.9
    entries.push({
      timestamp: hoursAgo(Math.floor(Math.random() * 168)),
      stageName: stages[i % stages.length],
      model: "deepseek-chat",
      prompt: `[Stage: ${stages[i % stages.length]}]`,
      responseSummary: Math.random() > 0.1 ? "Success" : "Failed",
      tokensUsed: { input: Math.floor(Math.random() * 2000) + 200, output: Math.floor(Math.random() * 1000) + 100 },
      latencyMs: Math.floor(Math.random() * 3000) + 200,
      confidence,
      error: Math.random() > 0.9 ? `Mock error in ${stages[i % stages.length]}` : undefined,
    });
  }

  return entries;
}

/** Seed quality-related data: confidence scores by stage, contradiction reports, duplicate groups. */
export function seedQualityData() {
  const stages = ["entity_extraction", "claim_extraction", "summarization", "translation", "confidence_estimation"];
  const scores: Array<{ stage: string; score: number; timestamp: string }> = [];

  for (let i = 0; i < 200; i++) {
    scores.push({
      stage: stages[i % stages.length],
      score: Math.random() * 0.7 + 0.2, // 0.2-0.9
      timestamp: daysAgo(Math.floor(Math.random() * 30)),
    });
  }

  const contradictionReports = [
    { contentType: "evidence", sourceType: "ngo", unresolved: 3, total: 12 },
    { contentType: "evidence", sourceType: "un", unresolved: 1, total: 8 },
    { contentType: "legal_case", sourceType: "court", unresolved: 2, total: 15 },
    { contentType: "organization", sourceType: "ngo", unresolved: 0, total: 5 },
    { contentType: "country", sourceType: "government", unresolved: 1, total: 6 },
  ];

  const duplicateGroups = [
    { sourceType: "ngo", detected: 8, falsePositives: 2, merged: 5 },
    { sourceType: "journalism", detected: 12, falsePositives: 3, merged: 7 },
    { sourceType: "un", detected: 4, falsePositives: 0, merged: 4 },
    { sourceType: "academic", detected: 2, falsePositives: 1, merged: 1 },
    { sourceType: "court", detected: 6, falsePositives: 1, merged: 4 },
  ];

  return { scores, contradictionReports, duplicateGroups };
}
