import {
  type AlertRule,
  type AlertEvent,
  type AlertStatus,
  type AlertSeverity,
  type CollectorHealthSnapshot,
  DEFAULT_MONITORING_CONFIG,
  type MonitoringConfig,
} from "./types";

let alertCounter = 0;

function nextAlertId(): string {
  alertCounter++;
  return `alert-${Date.now()}-${alertCounter}`;
}

/**
 * Alert system that evaluates collector health snapshots against
 * configurable rules and emits AlertEvents.
 *
 * Features:
 * - Configurable thresholds per alert type
 * - Cooldown periods to prevent alert fatigue
 * - Alert lifecycle: active → acknowledged → resolved
 * - Per-source-type rule filtering
 */
export class AlertSystem {
  private readonly rules: AlertRule[];
  private readonly events: AlertEvent[] = [];
  private readonly lastFired = new Map<string, number>(); // ruleId:collectorName → timestamp
  private readonly cooldownMs: number;
  private readonly staleThresholdMs: number;

  constructor(config?: Partial<MonitoringConfig>) {
    const cfg = { ...DEFAULT_MONITORING_CONFIG, ...config };
    this.rules = cfg.rules.filter((r) => r.enabled);
    this.cooldownMs = cfg.defaultAlertCooldownMs;
    this.staleThresholdMs = cfg.defaultStaleThresholdMs;
  }

  // ── Evaluation ────────────────────────────────────────────────────────

  /**
   * Evaluate all rules against a set of collector snapshots.
   * Returns newly triggered AlertEvents.
   *
   * @param snapshots - Current collector health snapshots.
   * @returns Array of new AlertEvents (empty if no rules triggered).
   */
  evaluate(snapshots: CollectorHealthSnapshot[]): AlertEvent[] {
    const newEvents: AlertEvent[] = [];

    for (const snapshot of snapshots) {
      for (const rule of this.rules) {
        // Check source type filter
        if (
          rule.sourceTypes &&
          rule.sourceTypes.length > 0 &&
          !rule.sourceTypes.includes(snapshot.sourceType)
        ) {
          continue;
        }

        // Check cooldown
        const cooldownKey = `${rule.id}:${snapshot.collectorName}`;
        const lastFire = this.lastFired.get(cooldownKey);
        if (lastFire && Date.now() - lastFire < rule.cooldownMs) {
          continue;
        }

        // Check if this rule/collector already has an active alert
        const hasActive = this.events.some(
          (e) =>
            e.ruleId === rule.id &&
            e.collectorName === snapshot.collectorName &&
            e.status === "active",
        );
        if (hasActive) continue;

        // Evaluate the rule
        const event = this.checkRule(rule, snapshot);
        if (event) {
          this.lastFired.set(cooldownKey, Date.now());
          this.events.push(event);
          newEvents.push(event);
        }
      }
    }

    return newEvents;
  }

  // ── Alert Lifecycle ───────────────────────────────────────────────────

  /** Acknowledge an alert. */
  acknowledge(alertId: string): boolean {
    const event = this.events.find((e) => e.id === alertId);
    if (!event || event.status !== "active") return false;
    event.status = "acknowledged";
    event.acknowledgedAt = new Date().toISOString();
    return true;
  }

  /** Resolve an alert. */
  resolve(alertId: string): boolean {
    const event = this.events.find((e) => e.id === alertId);
    if (!event || event.status === "resolved") return false;
    event.status = "resolved";
    event.resolvedAt = new Date().toISOString();
    return true;
  }

  /** Auto-resolve alerts for a collector that has recovered. */
  autoResolve(collectorName: string, snapshot: CollectorHealthSnapshot): void {
    if (snapshot.status === "active" && snapshot.consecutiveFailures === 0) {
      for (const event of this.events) {
        if (
          event.collectorName === collectorName &&
          event.status !== "resolved"
        ) {
          event.status = "resolved";
          event.resolvedAt = new Date().toISOString();
        }
      }
    }
  }

  // ── Queries ───────────────────────────────────────────────────────────

  /** Get all alert events. */
  getAllEvents(): AlertEvent[] {
    return [...this.events];
  }

  /** Get alert events filtered by status. */
  getEventsByStatus(status: AlertStatus): AlertEvent[] {
    return this.events.filter((e) => e.status === status);
  }

  /** Get alert events for a specific collector. */
  getEventsForCollector(collectorName: string): AlertEvent[] {
    return this.events.filter((e) => e.collectorName === collectorName);
  }

  /** Get active (unresolved) alert count. */
  getActiveCount(): number {
    return this.events.filter((e) => e.status === "active").length;
  }

  /** Reset all alert state (for testing). */
  reset(): void {
    this.events.length = 0;
    this.lastFired.clear();
    alertCounter = 0;
  }

  // ── Rule Evaluation ───────────────────────────────────────────────────

  private checkRule(
    rule: AlertRule,
    s: CollectorHealthSnapshot,
  ): AlertEvent | null {
    const t = rule.threshold;

    switch (rule.type) {
      case "consecutive_failures": {
        if (
          t.maxConsecutiveFailures !== undefined &&
          s.consecutiveFailures >= t.maxConsecutiveFailures
        ) {
          return this.createEvent(
            rule,
            s,
            `Collector "${s.collectorName}" has ${s.consecutiveFailures} consecutive failures (threshold: ${t.maxConsecutiveFailures})`,
          );
        }
        return null;
      }

      case "stale_data": {
        const maxAge = t.maxStaleAgeMs ?? this.staleThresholdMs;
        if (s.isStale) {
          const lastSuccess = s.lastSuccessAt
            ? new Date(s.lastSuccessAt).toISOString()
            : "never";
          return this.createEvent(
            rule,
            s,
            `Collector "${s.collectorName}" has stale data — last successful fetch: ${lastSuccess}`,
          );
        }
        return null;
      }

      case "error_rate": {
        if (
          t.maxErrorRate !== undefined &&
          s.errorRate > t.maxErrorRate &&
          s.totalFetches > 0
        ) {
          return this.createEvent(
            rule,
            s,
            `Collector "${s.collectorName}" error rate ${(s.errorRate * 100).toFixed(0)}% exceeds ${(t.maxErrorRate * 100).toFixed(0)}%`,
          );
        }
        return null;
      }

      case "rate_limit": {
        if (
          t.maxRateLimitHits !== undefined
          // Rate limit tracking requires MetricsCollector integration
          // For now, check if last error type suggests rate limiting
        ) {
          if (
            s.lastErrorType === "RateLimitError" &&
            s.consecutiveFailures >= 1
          ) {
            return this.createEvent(
              rule,
              s,
              `Collector "${s.collectorName}" may be hitting rate limits (last error: ${s.lastErrorType})`,
            );
          }
        }
        return null;
      }

      case "response_time": {
        if (
          t.maxResponseTimeMs !== undefined &&
          s.avgResponseTimeMs > t.maxResponseTimeMs
        ) {
          return this.createEvent(
            rule,
            s,
            `Collector "${s.collectorName}" avg response time ${s.avgResponseTimeMs}ms exceeds ${t.maxResponseTimeMs}ms`,
          );
        }
        return null;
      }

      case "coverage_gap": {
        // Coverage gaps are detected system-wide, not per-collector
        return null;
      }

      default:
        return null;
    }
  }

  private createEvent(
    rule: AlertRule,
    s: CollectorHealthSnapshot,
    message: string,
  ): AlertEvent {
    return {
      id: nextAlertId(),
      ruleId: rule.id,
      type: rule.type,
      severity: rule.severity,
      collectorName: s.collectorName,
      sourceType: s.sourceType,
      firedAt: new Date().toISOString(),
      status: "active",
      message,
      context: {
        consecutiveFailures: s.consecutiveFailures,
        errorRate: s.errorRate,
        avgResponseTimeMs: s.avgResponseTimeMs,
        isStale: s.isStale,
        totalFetches: s.totalFetches,
        status: s.status,
      },
    };
  }
}
