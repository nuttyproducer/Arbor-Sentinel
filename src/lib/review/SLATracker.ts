// src/lib/review/SLATracker.ts

import type { ReviewItem } from "./types";
import { getSLAStatus } from "./ReviewPriority";

const HOUR_MS = 60 * 60 * 1000;

// ── Public Types ─────────────────────────────────────────────────────────────

export type SLAAlertStatus = "warning" | "overdue" | "breached";

export interface EscalationAction {
  type: "reassign" | "notify_admin" | "notify_reviewer";
  itemId: string;
  reason: string;
  triggeredAt: string;
}

export interface SLAAlert {
  itemId: string;
  status: SLAAlertStatus;
  hoursInState: number;
  targetHours: number;
  escalationActions: EscalationAction[];
}

// ── Internal evaluation helpers ───────────────────────────────────────────────

interface EscalationResult {
  actions: EscalationAction[];
  stepKeys: string[];
}

/** Hours elapsed since the item's SLA clock started (`createdAt`). */
function hoursInStateFor(item: ReviewItem, now: Date): number {
  return (now.getTime() - new Date(item.createdAt).getTime()) / HOUR_MS;
}

/** Hours the item is past its SLA target (0 while on track or warning). */
function hoursOverdueFor(item: ReviewItem, now: Date): number {
  return Math.max(0, hoursInStateFor(item, now) - item.slaTarget.targetHours);
}

/**
 * Compute the escalation actions that currently apply to an item.
 *
 * Only overdue and breached items generate actions. A step fires once the item
 * has been past its SLA target for at least `afterHoursOverdue` hours, so the
 * escalation path activates progressively as an item ages.
 */
function computeEscalations(item: ReviewItem, now: Date): EscalationResult {
  const status = getSLAStatus(item, now);
  if (status === "on_track" || status === "warning") {
    return { actions: [], stepKeys: [] };
  }

  const hoursOverdue = hoursOverdueFor(item, now);
  const actions: EscalationAction[] = [];
  const stepKeys: string[] = [];

  for (const step of item.slaTarget.escalationPath) {
    if (hoursOverdue < step.afterHoursOverdue) continue;
    stepKeys.push(`${step.afterHoursOverdue}:${step.action}`);
    actions.push({
      type: step.action,
      itemId: item.id,
      reason: `SLA ${status}: ${hoursOverdue.toFixed(1)}h past the ${item.slaTarget.targetHours}h target`,
      triggeredAt: now.toISOString(),
    });
  }

  return { actions, stepKeys };
}

interface Evaluation {
  alert: SLAAlert | null;
  stepKeys: string[];
}

/** Build the {@link SLAAlert} for an item at `now`, or `null` when on track. */
function evaluateItem(item: ReviewItem, now: Date): Evaluation {
  const status = getSLAStatus(item, now);
  if (status === "on_track") return { alert: null, stepKeys: [] };

  const { actions, stepKeys } = computeEscalations(item, now);
  return {
    alert: {
      itemId: item.id,
      status,
      hoursInState: hoursInStateFor(item, now),
      targetHours: item.slaTarget.targetHours,
      escalationActions: actions,
    },
    stepKeys,
  };
}

// ── Tracker ──────────────────────────────────────────────────────────────────

/**
 * SLA tracker (M4.3-02, Task 7).
 *
 * Monitors review items against their SLA targets, bucketing each item into a
 * warning, overdue, or breached state and producing escalation actions along
 * the item's configured escalation path. Handlers registered via
 * {@link onEscalate} are invoked once per escalation step as items cross their
 * overdue thresholds.
 */
export class SLATracker {
  private items: Map<string, ReviewItem> = new Map();
  private alerts: Map<string, SLAAlert> = new Map();
  private firedSteps: Map<string, Set<string>> = new Map();
  private escalationHandlers: Array<(action: EscalationAction) => void> = [];

  /** Start tracking an item's SLA. */
  track(item: ReviewItem): void {
    this.items.set(item.id, item);
    this.alerts.delete(item.id);
    this.firedSteps.delete(item.id);
  }

  /** Check SLA status for an item. Returns `null` for on-track or unknown items. */
  check(itemId: string): SLAAlert | null {
    const item = this.items.get(itemId);
    if (!item) return null;
    return this.evaluate(item, new Date());
  }

  /** Get all currently overdue or breached items. */
  getOverdueItems(): SLAAlert[] {
    return this.snapshot(new Date()).filter((alert) => alert.status !== "warning");
  }

  /** Get all items approaching their warning threshold. */
  getWarningItems(): SLAAlert[] {
    return this.snapshot(new Date()).filter((alert) => alert.status === "warning");
  }

  /** Get escalation actions for an item based on its SLA status. */
  getEscalationActions(item: ReviewItem): EscalationAction[] {
    return computeEscalations(item, new Date()).actions;
  }

  /**
   * Register an escalation handler. Returns an unsubscribe function that
   * removes the handler.
   */
  onEscalate(handler: (action: EscalationAction) => void): () => void {
    this.escalationHandlers.push(handler);
    return () => {
      const index = this.escalationHandlers.indexOf(handler);
      if (index >= 0) this.escalationHandlers.splice(index, 1);
    };
  }

  /** Stop tracking an item (e.g., resolved). */
  untrack(itemId: string): void {
    this.items.delete(itemId);
    this.alerts.delete(itemId);
    this.firedSteps.delete(itemId);
  }

  /** Run a check cycle on all tracked items, firing any new escalations. */
  runCheckCycle(): SLAAlert[] {
    const now = new Date();
    const alerts: SLAAlert[] = [];
    for (const item of this.items.values()) {
      const { alert, stepKeys } = evaluateItem(item, now);
      if (alert) {
        this.alerts.set(item.id, alert);
        this.fireEscalations(alert, stepKeys);
        alerts.push(alert);
      } else {
        this.alerts.delete(item.id);
      }
    }
    return alerts;
  }

  // ── Internals ─────────────────────────────────────────────────────────────

  private evaluate(item: ReviewItem, now: Date): SLAAlert | null {
    const { alert, stepKeys } = evaluateItem(item, now);
    if (alert) {
      this.alerts.set(item.id, alert);
      this.fireEscalations(alert, stepKeys);
    } else {
      this.alerts.delete(item.id);
    }
    return alert;
  }

  private snapshot(now: Date): SLAAlert[] {
    const alerts: SLAAlert[] = [];
    for (const item of this.items.values()) {
      const { alert } = evaluateItem(item, now);
      if (alert) {
        this.alerts.set(item.id, alert);
        alerts.push(alert);
      } else {
        this.alerts.delete(item.id);
      }
    }
    return alerts;
  }

  private fireEscalations(alert: SLAAlert, stepKeys: string[]): void {
    if (this.escalationHandlers.length === 0 || alert.escalationActions.length === 0) return;

    const fired = this.firedSteps.get(alert.itemId) ?? new Set<string>();
    let changed = false;

    for (let i = 0; i < alert.escalationActions.length; i++) {
      const key = stepKeys[i];
      if (key === undefined || fired.has(key)) continue;
      fired.add(key);
      changed = true;
      const action = alert.escalationActions[i];
      for (const handler of this.escalationHandlers) {
        handler(action);
      }
    }

    if (changed) this.firedSteps.set(alert.itemId, fired);
  }
}
