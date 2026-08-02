// src/lib/review/__tests__/ReviewPriority.test.ts

import { describe, it, expect } from "vitest";
import {
  calculatePriority,
  scoreToLevel,
  getSLATarget,
  isOverdue,
  getSLAStatus,
  type SLAStatus,
} from "../ReviewPriority";
import type {
  ReviewItem,
  ReviewType,
  PriorityLevel,
  ContentRiskLevel,
} from "../types";

// ── Fixtures ────────────────────────────────────────────────────────────────

const NOW = new Date("2026-08-03T00:00:00.000Z");
const HOUR_MS = 60 * 60 * 1000;

function hoursAgo(hours: number): string {
  return new Date(NOW.getTime() - hours * HOUR_MS).toISOString();
}

function makeItem(overrides: Partial<ReviewItem> = {}): ReviewItem {
  return {
    id: "review-1",
    sourceContentRef: { type: "evidence", id: "evidence-1", slug: "evidence-1" },
    reviewType: "source",
    priority: "high",
    priorityScore: 80,
    state: "new",
    assignedReviewer: undefined,
    comments: [],
    checklists: [],
    slaTarget: {
      targetHours: 24,
      warningThreshold: 0.75,
      overdueThreshold: 1.25,
      escalationPath: [
        { afterHoursOverdue: 6, action: "notify_admin" },
        { afterHoursOverdue: 12, action: "reassign" },
      ],
    },
    stateHistory: [],
    createdAt: "2026-08-02T00:00:00.000Z",
    updatedAt: "2026-08-02T00:00:00.000Z",
    ...overrides,
  };
}

const baseItem = {
  sourceContentRef: { type: "evidence" as const, id: "evidence-1", slug: "evidence-1" },
  reviewType: "source" as const,
};

// ── Priority Scoring ─────────────────────────────────────────────────────────

describe("calculatePriority", () => {
  it("gives legal content the highest priority", () => {
    const levels: ContentRiskLevel[] = [
      "legal",
      "casualty",
      "testimony",
      "humanitarian",
      "general",
    ];
    const scores = levels.map((contentRiskLevel) =>
      calculatePriority(baseItem, { contentRiskLevel, sourceRiskLevel: "court" }).score,
    );

    expect(scores[0]).toBe(70); // legal(40) + court(30)
    expect(scores[1]).toBe(65); // casualty(35) + court(30)
    expect(scores[2]).toBe(55); // testimony(25) + court(30)
    expect(scores[3]).toBe(50); // humanitarian(20) + court(30)
    expect(scores[4]).toBe(40); // general(10) + court(30)
    expect(scores[0]).toBe(Math.max(...scores));
  });

  it("ranks casualty content above testimony", () => {
    const casualty = calculatePriority(baseItem, {
      contentRiskLevel: "casualty",
      sourceRiskLevel: "court",
    }).score;
    const testimony = calculatePriority(baseItem, {
      contentRiskLevel: "testimony",
      sourceRiskLevel: "court",
    }).score;

    expect(casualty).toBe(65);
    expect(testimony).toBe(55);
    expect(casualty).toBeGreaterThan(testimony);
  });

  it("ranks court source type above UN", () => {
    const court = calculatePriority(baseItem, {
      contentRiskLevel: "legal",
      sourceRiskLevel: "court",
    }).score;
    const un = calculatePriority(baseItem, {
      contentRiskLevel: "legal",
      sourceRiskLevel: "un",
    }).score;

    expect(court).toBe(70);
    expect(un).toBe(65);
    expect(court).toBeGreaterThan(un);
  });

  it("boosts the score when contradictions are flagged", () => {
    const without = calculatePriority(baseItem, {
      contentRiskLevel: "legal",
      sourceRiskLevel: "court",
    }).score;
    const withContradictions = calculatePriority(baseItem, {
      contentRiskLevel: "legal",
      sourceRiskLevel: "court",
      hasContradictions: true,
    }).score;

    expect(without).toBe(70);
    expect(withContradictions).toBe(85); // +15
    expect(withContradictions).toBeGreaterThan(without);
  });

  it("boosts the score when hallucinations are detected", () => {
    const without = calculatePriority(baseItem, {
      contentRiskLevel: "legal",
      sourceRiskLevel: "court",
    }).score;
    const withHallucinations = calculatePriority(baseItem, {
      contentRiskLevel: "legal",
      sourceRiskLevel: "court",
      hasHallucinations: true,
    }).score;

    expect(without).toBe(70);
    expect(withHallucinations).toBe(90); // +20
    expect(withHallucinations).toBeGreaterThan(without);
  });

  it("caps the score at 100 when flags stack", () => {
    const result = calculatePriority(baseItem, {
      contentRiskLevel: "legal",
      sourceRiskLevel: "court",
      hasContradictions: true,
      hasHallucinations: true,
    });

    // raw 70 + 15 + 20 = 105, capped at 100
    expect(result.score).toBe(100);
    expect(result.level).toBe("critical");
  });
});

// ── scoreToLevel ─────────────────────────────────────────────────────────────

describe("scoreToLevel", () => {
  it("maps scores to priority levels at the exact boundaries", () => {
    expect(scoreToLevel(0)).toBe("low");
    expect(scoreToLevel(29)).toBe("low");
    expect(scoreToLevel(30)).toBe("medium");
    expect(scoreToLevel(59)).toBe("medium");
    expect(scoreToLevel(60)).toBe("high");
    expect(scoreToLevel(79)).toBe("high");
    expect(scoreToLevel(80)).toBe("critical");
    expect(scoreToLevel(100)).toBe("critical");
  });

  it("returns the derived level from calculatePriority", () => {
    const { score, level } = calculatePriority(baseItem, {
      contentRiskLevel: "testimony",
      sourceRiskLevel: "ngo",
    });
    expect(score).toBe(40); // testimony(25) + ngo(15)
    expect(level).toBe("medium");
  });
});

// ── SLA Targets ──────────────────────────────────────────────────────────────

describe("getSLATarget", () => {
  it("returns shorter targets for higher priority", () => {
    const reviewType: ReviewType = "legal";
    const priorities: PriorityLevel[] = ["critical", "high", "medium", "low"];
    const hours = priorities.map((priority) => getSLATarget(reviewType, priority).targetHours);

    // legal multiplier is 1.5: 4, 8, 24, 72 base hours
    expect(hours).toEqual([6, 12, 36, 108]);
    expect(hours[0]).toBeLessThan(hours[1]);
    expect(hours[1]).toBeLessThan(hours[2]);
    expect(hours[2]).toBeLessThan(hours[3]);
  });

  it("returns a fully populated SLA target", () => {
    const target = getSLATarget("source", "critical");

    expect(target.targetHours).toBe(4);
    expect(target.warningThreshold).toBe(0.75);
    expect(target.overdueThreshold).toBe(1.25);
    expect(target.escalationPath.length).toBeGreaterThan(0);
    expect(target.escalationPath[0].action).toBe("notify_admin");
  });

  it("does not share mutable escalation state between calls", () => {
    const a = getSLATarget("source", "critical");
    a.escalationPath[0].action = "reassign";

    const b = getSLATarget("source", "critical");
    expect(b.escalationPath[0].action).toBe("notify_admin");
  });
});

// ── SLA Status ───────────────────────────────────────────────────────────────

describe("isOverdue", () => {
  it("returns true once the item is past its SLA target", () => {
    // 30h elapsed on a 24h target = 1.25x (the default overdueThreshold).
    const overdue = makeItem({ createdAt: hoursAgo(30) });
    expect(isOverdue(overdue, NOW)).toBe(true);
  });

  it("returns false while the item is within its SLA target", () => {
    // 12h elapsed on a 24h target = 0.5x.
    const onTrack = makeItem({ createdAt: hoursAgo(12) });
    expect(isOverdue(onTrack, NOW)).toBe(false);
  });

  it("honors the item's stored overdue threshold", () => {
    // overdueThreshold of 1.0 => overdue exactly at the deadline (24h).
    const atDeadline = makeItem({
      createdAt: hoursAgo(24),
      slaTarget: {
        targetHours: 24,
        warningThreshold: 0.75,
        overdueThreshold: 1.0,
        escalationPath: [],
      },
    });
    expect(isOverdue(atDeadline, NOW)).toBe(true);

    const justBefore = makeItem({
      createdAt: hoursAgo(23.9),
      slaTarget: {
        targetHours: 24,
        warningThreshold: 0.75,
        overdueThreshold: 1.0,
        escalationPath: [],
      },
    });
    expect(isOverdue(justBefore, NOW)).toBe(false);
  });
});

describe("getSLAStatus", () => {
  it("returns the correct status for each SLA band", () => {
    const cases: Array<[elapsedHours: number, expected: SLAStatus]> = [
      [12, "on_track"], // 0.5x  target
      [20, "warning"], //   0.83x target
      [30, "overdue"], //    1.25x target
      [50, "breached"], //    2.08x target
    ];

    for (const [elapsedHours, expected] of cases) {
      const item = makeItem({ createdAt: hoursAgo(elapsedHours) });
      expect(getSLAStatus(item, NOW)).toBe(expected);
    }
  });

  it("marks an item with a dueBy deadline at its threshold", () => {
    // dueBy 24h after createdAt => 1.25x is 30h after creation; 30h elapsed is overdue.
    const item = makeItem({
      createdAt: hoursAgo(30),
      dueBy: new Date(NOW.getTime() - 6 * HOUR_MS).toISOString(), // 24h after createdAt
    });
    expect(getSLAStatus(item, NOW)).toBe("overdue");
  });
});
