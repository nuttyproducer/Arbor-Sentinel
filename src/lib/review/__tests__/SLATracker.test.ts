// src/lib/review/__tests__/SLATracker.test.ts

import { describe, it, expect } from "vitest";
import { SLATracker, type SLAAlert, type EscalationAction } from "../SLATracker";
import { getSLATarget } from "../ReviewPriority";
import type { ReviewItem } from "../types";

// ── Fixtures ────────────────────────────────────────────────────────────────

const HOUR_MS = 60 * 60 * 1000;

/** ISO timestamp `hours` before the current time. */
function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * HOUR_MS).toISOString();
}

/**
 * Build a review item against a 24h SLA target. Defaults to on-track (created
 * 5h ago); tests override `createdAt`/`id`/`slaTarget` as needed.
 */
function makeItem(overrides: Partial<ReviewItem> = {}): ReviewItem {
  return {
    id: "review-1",
    sourceContentRef: { type: "evidence", id: "evidence-1", slug: "evidence-1" },
    reviewType: "source",
    priority: "medium",
    priorityScore: 50,
    state: "new",
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
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
    ...overrides,
  };
}

/** Assert an item is being tracked and return its current {@link SLAAlert}. */
function mustAlert(tracker: SLATracker, itemId: string): SLAAlert {
  const alert = tracker.check(itemId);
  if (!alert) throw new Error(`Expected an SLA alert for '${itemId}'`);
  return alert;
}

// ── Tracking & checking ─────────────────────────────────────────────────────

describe("SLATracker", () => {
  it("track adds an item to monitoring", () => {
    const tracker = new SLATracker();
    const overdue = makeItem({ id: "review-overdue", createdAt: hoursAgo(30) });

    tracker.track(overdue);

    expect(tracker.check("review-overdue")).not.toBeNull();
  });

  it("check returns null for on-track items", () => {
    const tracker = new SLATracker();
    // 5h elapsed on a 24h target = 0.21x, well inside the warning threshold.
    tracker.track(makeItem({ id: "on-track", createdAt: hoursAgo(5) }));

    expect(tracker.check("on-track")).toBeNull();
  });

  it("check returns warning when past the warning threshold", () => {
    const tracker = new SLATracker();
    // 20h elapsed on a 24h target = 0.83x (>= 0.75, < 1.25).
    tracker.track(makeItem({ id: "warning", createdAt: hoursAgo(20) }));

    const alert = tracker.check("warning");
    expect(alert?.status).toBe("warning");
    expect(alert?.targetHours).toBe(24);
    expect(alert?.hoursInState).toBeCloseTo(20, 1);
  });

  it("check returns overdue when past the SLA target", () => {
    const tracker = new SLATracker();
    // 30h elapsed on a 24h target = 1.25x (the default overdue threshold).
    tracker.track(makeItem({ id: "overdue", createdAt: hoursAgo(30) }));

    const alert = tracker.check("overdue");
    expect(alert?.status).toBe("overdue");
    expect(alert?.hoursInState).toBeCloseTo(30, 1);
  });

  it("check returns breached when far past the SLA target", () => {
    const tracker = new SLATracker();
    // 50h elapsed on a 24h target = 2.08x (>= the 2x breach point).
    tracker.track(makeItem({ id: "breached", createdAt: hoursAgo(50) }));

    const alert = tracker.check("breached");
    expect(alert?.status).toBe("breached");
  });

  // ── Batch queries ─────────────────────────────────────────────────────────

  it("getOverdueItems returns only overdue or breached items", () => {
    const tracker = new SLATracker();
    tracker.track(makeItem({ id: "on-track", createdAt: hoursAgo(5) }));
    tracker.track(makeItem({ id: "warning", createdAt: hoursAgo(20) }));
    tracker.track(makeItem({ id: "overdue", createdAt: hoursAgo(30) }));
    tracker.track(makeItem({ id: "breached", createdAt: hoursAgo(50) }));

    const ids = tracker.getOverdueItems().map((alert) => alert.itemId);
    expect(ids).toEqual(["overdue", "breached"]);
  });

  it("getWarningItems returns only warning items", () => {
    const tracker = new SLATracker();
    tracker.track(makeItem({ id: "on-track", createdAt: hoursAgo(5) }));
    tracker.track(makeItem({ id: "warning", createdAt: hoursAgo(20) }));
    tracker.track(makeItem({ id: "overdue", createdAt: hoursAgo(30) }));

    const ids = tracker.getWarningItems().map((alert) => alert.itemId);
    expect(ids).toEqual(["warning"]);
  });

  // ── Escalation ────────────────────────────────────────────────────────────

  it("getEscalationActions generates actions based on the escalation path", () => {
    const tracker = new SLATracker();

    // 30h elapsed, 24h target => 6h overdue => only the first step fires.
    const justOverdue = makeItem({ id: "just-overdue", createdAt: hoursAgo(30) });
    const actions = tracker.getEscalationActions(justOverdue);
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe("notify_admin");
    expect(actions[0].itemId).toBe("just-overdue");
    expect(actions[0].reason).toContain("overdue");

    // 40h elapsed => 16h overdue => both steps fire, in path order.
    const farOverdue = makeItem({ id: "far-overdue", createdAt: hoursAgo(40) });
    const farActions = tracker.getEscalationActions(farOverdue);
    expect(farActions.map((action) => action.type)).toEqual(["notify_admin", "reassign"]);
  });

  it("escalation handlers fire on breach", () => {
    const tracker = new SLATracker();
    const received: EscalationAction[] = [];
    tracker.onEscalate((action) => received.push(action));

    // 50h elapsed, 24h target => 26h overdue => both steps fire.
    tracker.track(makeItem({ id: "breached", createdAt: hoursAgo(50) }));
    tracker.runCheckCycle();

    expect(received.map((action) => action.type)).toEqual(["notify_admin", "reassign"]);
    expect(received[0].itemId).toBe("breached");

    // A second cycle must not re-fire the same steps.
    tracker.runCheckCycle();
    expect(received).toHaveLength(2);
  });

  it("onEscalate returns an unsubscribe function", () => {
    const tracker = new SLATracker();
    const received: EscalationAction[] = [];
    const unsubscribe = tracker.onEscalate((action) => received.push(action));
    unsubscribe();

    tracker.track(makeItem({ id: "breached", createdAt: hoursAgo(50) }));
    tracker.runCheckCycle();
    expect(received).toHaveLength(0);
  });

  // ── Lifecycle & batch processing ─────────────────────────────────────────

  it("untrack removes an item from monitoring", () => {
    const tracker = new SLATracker();
    tracker.track(makeItem({ id: "overdue", createdAt: hoursAgo(30) }));
    expect(tracker.check("overdue")).not.toBeNull();

    tracker.untrack("overdue");

    expect(tracker.check("overdue")).toBeNull();
    expect(tracker.getOverdueItems()).toHaveLength(0);
  });

  it("runCheckCycle processes all tracked items", () => {
    const tracker = new SLATracker();
    tracker.track(makeItem({ id: "on-track", createdAt: hoursAgo(5) }));
    tracker.track(makeItem({ id: "warning", createdAt: hoursAgo(20) }));
    tracker.track(makeItem({ id: "overdue", createdAt: hoursAgo(30) }));
    tracker.track(makeItem({ id: "breached", createdAt: hoursAgo(50) }));

    const alerts = tracker.runCheckCycle();

    expect(alerts.map((alert) => alert.itemId).sort()).toEqual([
      "breached",
      "overdue",
      "warning",
    ]);
    expect(alerts.map((alert) => alert.status).sort()).toEqual([
      "breached",
      "overdue",
      "warning",
    ]);
  });

  // ── SLA configuration ─────────────────────────────────────────────────────

  it("different content types have different SLA targets", () => {
    const tracker = new SLATracker();
    // source multiplier is 1 (24h), legal multiplier is 1.5 (36h) at medium.
    const source = makeItem({
      id: "source-item",
      reviewType: "source",
      slaTarget: getSLATarget("source", "medium"),
      createdAt: hoursAgo(30),
    });
    const legal = makeItem({
      id: "legal-item",
      reviewType: "legal",
      slaTarget: getSLATarget("legal", "medium"),
      createdAt: hoursAgo(30),
    });

    tracker.track(source);
    tracker.track(legal);

    const sourceAlert = mustAlert(tracker, "source-item");
    const legalAlert = mustAlert(tracker, "legal-item");

    expect(sourceAlert.targetHours).toBe(24);
    expect(legalAlert.targetHours).toBe(36);
    expect(sourceAlert.targetHours).toBeLessThan(legalAlert.targetHours);
  });

  it("higher priority items have shorter SLA targets", () => {
    const tracker = new SLATracker();
    // critical base is 4h, low base is 72h for the source review type.
    const critical = makeItem({
      id: "critical-item",
      priority: "critical",
      slaTarget: getSLATarget("source", "critical"),
      createdAt: hoursAgo(10),
    });
    const low = makeItem({
      id: "low-item",
      priority: "low",
      slaTarget: getSLATarget("source", "low"),
      createdAt: hoursAgo(100),
    });

    tracker.track(critical);
    tracker.track(low);

    const criticalAlert = mustAlert(tracker, "critical-item");
    const lowAlert = mustAlert(tracker, "low-item");

    expect(criticalAlert.targetHours).toBe(4);
    expect(lowAlert.targetHours).toBe(72);
    expect(criticalAlert.targetHours).toBeLessThan(lowAlert.targetHours);
  });
});
