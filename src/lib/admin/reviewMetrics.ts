// src/lib/admin/reviewMetrics.ts
// Pure query functions and Supabase loader for the Review Queue Metrics Dashboard (M4.4-02).

import { supabase } from "../db/client";
import type { ReviewItem, ReviewerProfile, ReviewType, PriorityLevel, ReviewState, ReviewComment, ReviewChecklistResult, StateTransition, SLATarget } from "../review/types";
import type { DashboardTimeRange, ReviewQueueDepth, AgeBucket, ThroughputPoint, ReviewerMetric, SLACompliancePoint, Bottleneck } from "./types";

export function getQueueDepth(items: ReviewItem[]): ReviewQueueDepth {
  const depth: ReviewQueueDepth = {
    new: 0, assigned: 0, in_review: 0, changes_requested: 0,
    approved: 0, published: 0, rejected: 0, archived: 0,
  };
  for (const item of items) {
    if (item.state in depth) {
      depth[item.state as keyof ReviewQueueDepth] += 1;
    }
  }
  return depth;
}

const AGE_BUCKETS: Omit<AgeBucket, "count">[] = [
  { label: "0-1d", minDays: 0, maxDays: 1 },
  { label: "1-3d", minDays: 1, maxDays: 3 },
  { label: "3-7d", minDays: 3, maxDays: 7 },
  { label: "7-14d", minDays: 7, maxDays: 14 },
  { label: "14d+", minDays: 14, maxDays: Infinity },
];

export function getAgeDistribution(items: ReviewItem[]): AgeBucket[] {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  return AGE_BUCKETS.map((bucket) => {
    const count = items.filter((item) => {
      const ageDays = (now - new Date(item.createdAt).getTime()) / DAY_MS;
      return ageDays >= bucket.minDays && ageDays < bucket.maxDays;
    }).length;
    return { ...bucket, count };
  });
}

export function getThroughput(
  items: ReviewItem[],
  range: DashboardTimeRange,
): ThroughputPoint[] {
  const rangeStart = new Date(range.start).getTime();
  const rangeEnd = new Date(range.end).getTime();
  const DAY_MS = 24 * 60 * 60 * 1000;

  // Count items completed (approved/published/rejected) per day
  const byDay = new Map<string, number>();
  const completed = items.filter((item) => ["approved", "published", "rejected"].includes(item.state));

  for (const item of completed) {
    const completedAt = new Date(item.updatedAt).getTime();
    if (completedAt >= rangeStart && completedAt <= rangeEnd) {
      const day = new Date(Math.floor(completedAt / DAY_MS) * DAY_MS).toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    }
  }

  // Fill in all days in range
  const points: ThroughputPoint[] = [];
  const days = Math.ceil((rangeEnd - rangeStart) / DAY_MS);
  const recent = new Array(7).fill(0);

  for (let i = days; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY_MS).toISOString().slice(0, 10);
    const reviewed = byDay.get(d) ?? 0;
    recent.push(reviewed);
    if (recent.length > 7) recent.shift();
    const trend = recent.reduce((a, b) => a + b, 0) / recent.length;
    points.push({ date: d, reviewed, trend: Math.round(trend * 10) / 10 });
  }

  return points;
}

export function getReviewerPerformance(
  profiles: ReviewerProfile[],
  items: ReviewItem[],
): ReviewerMetric[] {
  return profiles.map((profile) => {
    const assignedItems = items.filter((item) => item.assignedReviewer === profile.id);
    const completedItems = assignedItems.filter(
      (item) => ["approved", "published", "rejected"].includes(item.state),
    );
    const slaCompliant = completedItems.filter((item) => {
      if (!item.dueBy) return true;
      return new Date(item.updatedAt) <= new Date(item.dueBy);
    });

    return {
      id: profile.id,
      completed: completedItems.length,
      avgTimeMinutes: completedItems.length > 0 ? profile.averageReviewTimeMinutes : 0,
      slaCompliancePercent: completedItems.length > 0
        ? Math.round((slaCompliant.length / completedItems.length) * 100)
        : 100,
      workload: profile.currentWorkload,
      maxWorkload: profile.maxWorkload,
    };
  }).sort((a, b) => a.slaCompliancePercent - b.slaCompliancePercent);
}

export function getSLACompliance(
  items: ReviewItem[],
  range: DashboardTimeRange,
): SLACompliancePoint[] {
  const rangeStart = new Date(range.start).getTime();
  const rangeEnd = new Date(range.end).getTime();
  const DAY_MS = 24 * 60 * 60 * 1000;

  const completed = items.filter((item) => {
    const t = new Date(item.updatedAt).getTime();
    return t >= rangeStart && t <= rangeEnd && ["approved", "published", "rejected"].includes(item.state);
  });

  const byDay = new Map<string, { total: number; compliant: number; byType: Map<string, { total: number; compliant: number }> }>();

  for (const item of completed) {
    const day = new Date(Math.floor(new Date(item.updatedAt).getTime() / DAY_MS) * DAY_MS).toISOString().slice(0, 10);
    let bucket = byDay.get(day);
    if (!bucket) {
      bucket = { total: 0, compliant: 0, byType: new Map() };
      byDay.set(day, bucket);
    }

    bucket.total++;
    const isCompliant = item.dueBy ? new Date(item.updatedAt) <= new Date(item.dueBy) : true;
    if (isCompliant) bucket.compliant++;

    const ct = item.sourceContentRef.type;
    let typeBucket = bucket.byType.get(ct);
    if (!typeBucket) {
      typeBucket = { total: 0, compliant: 0 };
      bucket.byType.set(ct, typeBucket);
    }
    typeBucket.total++;
    if (isCompliant) typeBucket.compliant++;
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, bucket]) => {
      const byContentType: Record<string, number> = {};
      for (const [ct, tb] of bucket.byType) {
        byContentType[ct] = tb.total > 0 ? Math.round((tb.compliant / tb.total) * 100) : 100;
      }
      return {
        date,
        overall: bucket.total > 0 ? Math.round((bucket.compliant / bucket.total) * 100) : 100,
        byContentType,
      };
    });
}

export function detectBottlenecks(
  items: ReviewItem[],
  profiles: ReviewerProfile[],
): Bottleneck[] {
  const bottlenecks: Bottleneck[] = [];
  const now = Date.now();
  const HOUR_MS = 60 * 60 * 1000;

  // Stuck items: in_review > 48h or assigned > 24h
  const stuckInReview = items.filter((item) => {
    if (item.state !== "in_review") return false;
    const ageHours = (now - new Date(item.createdAt).getTime()) / HOUR_MS;
    return ageHours > 48;
  });

  const stuckAssigned = items.filter((item) => {
    if (item.state !== "assigned") return false;
    const ageHours = (now - new Date(item.createdAt).getTime()) / HOUR_MS;
    return ageHours > 24;
  });

  if (stuckInReview.length > 0) {
    bottlenecks.push({
      type: "stuck",
      description: `${stuckInReview.length} items stuck in review (>48h) — these are under active review but not progressing`,
      count: stuckInReview.length,
      threshold: "48h",
    });
  }

  if (stuckAssigned.length > 0) {
    bottlenecks.push({
      type: "stuck",
      description: `${stuckAssigned.length} items stuck in assigned state (>24h) — reviewer has not started`,
      count: stuckAssigned.length,
      threshold: "24h",
    });
  }

  // Unassigned: new items > 24h with no reviewer
  const unassigned = items.filter((item) => {
    if (item.state !== "new" || item.assignedReviewer) return false;
    const ageHours = (now - new Date(item.createdAt).getTime()) / HOUR_MS;
    return ageHours > 24;
  });

  if (unassigned.length > 0) {
    bottlenecks.push({
      type: "unassigned",
      description: `${unassigned.length} items awaiting assignment (>24h)`,
      count: unassigned.length,
      threshold: "24h",
    });
  }

  // Overdue: items past dueBy
  const overdue = items.filter((item) => {
    if (!item.dueBy) return false;
    return now > new Date(item.dueBy).getTime() && !["approved", "published", "rejected", "archived"].includes(item.state);
  });

  if (overdue.length > 0) {
    bottlenecks.push({
      type: "overdue",
      description: `${overdue.length} items past their SLA deadline`,
      count: overdue.length,
      threshold: "Per-item SLA target",
    });
  }

  // Reviewers at capacity (≥90%)
  for (const profile of profiles) {
    const ratio = profile.maxWorkload > 0 ? profile.currentWorkload / profile.maxWorkload : 0;
    if (ratio >= 0.9) {
      bottlenecks.push({
        type: "reviewer_at_capacity",
        description: `Reviewer ${profile.id} at ${Math.round(ratio * 100)}% capacity (${profile.currentWorkload}/${profile.maxWorkload})`,
        count: 1,
        threshold: "90%",
      });
    }
  }

  return bottlenecks;
}

// ── Supabase data loader ────────────────────────────────────────────────────

interface ReviewQueueItemRow {
  id: string;
  source_content_type: string;
  source_content_id: string;
  source_content_slug: string;
  review_type: string;
  priority: string;
  priority_score: number;
  state: string;
  assigned_reviewer: string | null;
  due_by: string | null;
  comments: ReviewComment[] | null;
  checklists: ReviewChecklistResult[] | null;
  state_history: StateTransition[] | null;
  created_at: string;
  updated_at: string;
}

const SLA_TARGETS: Record<string, SLATarget> = {
  critical: { targetHours: 4, warningThreshold: 0.75, overdueThreshold: 1.0, escalationPath: [{ afterHoursOverdue: 1, action: "notify_admin" }] },
  high: { targetHours: 8, warningThreshold: 0.75, overdueThreshold: 1.0, escalationPath: [{ afterHoursOverdue: 2, action: "notify_admin" }] },
  medium: { targetHours: 24, warningThreshold: 0.75, overdueThreshold: 1.0, escalationPath: [{ afterHoursOverdue: 4, action: "notify_reviewer" }] },
  low: { targetHours: 72, warningThreshold: 0.75, overdueThreshold: 1.0, escalationPath: [{ afterHoursOverdue: 8, action: "notify_reviewer" }] },
};

function mapPriority(raw: string): PriorityLevel {
  const p = raw.toLowerCase();
  if (p === "critical") return "critical";
  if (p === "high") return "high";
  if (p === "medium") return "medium";
  return "low";
}

function mapState(raw: string): ReviewState {
  const valid: ReviewState[] = ["new", "assigned", "in_review", "changes_requested", "approved", "published", "rejected", "archived"];
  return valid.includes(raw as ReviewState) ? (raw as ReviewState) : "new";
}

function mapReviewType(raw: string): ReviewType {
  const valid: ReviewType[] = ["source", "editorial", "legal", "competency", "safety", "translation", "accessibility", "licensing"];
  return valid.includes(raw as ReviewType) ? (raw as ReviewType) : "editorial";
}

function toReviewItem(row: ReviewQueueItemRow): ReviewItem {
  const priority = mapPriority(row.priority);
  return {
    id: row.id,
    sourceContentRef: {
      type: row.source_content_type as ReviewItem["sourceContentRef"]["type"],
      id: row.source_content_id,
      slug: row.source_content_slug ?? "",
    },
    reviewType: mapReviewType(row.review_type),
    priority,
    priorityScore: row.priority_score ?? 50,
    state: mapState(row.state),
    assignedReviewer: row.assigned_reviewer ?? undefined,
    dueBy: row.due_by ?? undefined,
    comments: (row.comments as ReviewComment[] | null) ?? [],
    checklists: (row.checklists as ReviewChecklistResult[] | null) ?? [],
    slaTarget: SLA_TARGETS[priority] ?? SLA_TARGETS.medium,
    stateHistory: (row.state_history as StateTransition[] | null) ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchReviewData(_range: DashboardTimeRange): Promise<{
  items: ReviewItem[];
  profiles: ReviewerProfile[];
}> {
  const { data, error } = await supabase
    .from("review_queue_items")
    .select("id, source_content_type, source_content_id, source_content_slug, review_type, priority, priority_score, state, assigned_reviewer, due_by, comments, checklists, state_history, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error || !data) return { items: [], profiles: [] };

  const rows = data as ReviewQueueItemRow[];
  const items = rows.map(toReviewItem);

  // Build ReviewerProfile[] from assigned_reviewer aggregation
  const reviewerMap = new Map<string, { activeAssignments: string[]; completed: number; totalAssigned: number }>();
  for (const item of items) {
    if (item.assignedReviewer) {
      const entry = reviewerMap.get(item.assignedReviewer) ?? { activeAssignments: [], completed: 0, totalAssigned: 0 };
      entry.totalAssigned++;
      if (["approved", "published", "rejected", "archived"].includes(item.state)) {
        entry.completed++;
      } else {
        entry.activeAssignments.push(item.id);
      }
      reviewerMap.set(item.assignedReviewer, entry);
    }
  }

  const profiles: ReviewerProfile[] = Array.from(reviewerMap.entries()).map(([id, entry]) => ({
    id,
    role: "Reviewer",
    expertiseAreas: [] as ReviewType[],
    contentSkills: [],
    maxWorkload: 10,
    currentWorkload: entry.activeAssignments.length,
    availability: entry.activeAssignments.length >= 10 ? "busy" as const : "available" as const,
    activeAssignments: entry.activeAssignments,
    completedToday: entry.completed,
    averageReviewTimeMinutes: 0,
    languages: [],
    countries: [],
    institutions: [],
  }));

  return { items, profiles };
}
