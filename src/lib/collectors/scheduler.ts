import type { CollectorConfig, ScheduledJob, CollectResult, StorageInterface } from "./types";
import type { SourceRecord } from "../../types/content";
import type { CollectorRegistry } from "./CollectorRegistry";

/**
 * Scheduler manages timed and manual collection jobs.
 *
 * During the static beta, the scheduler supports:
 * - Manual triggers (one-off collection runs)
 * - Interval-based scheduling (polling every N minutes)
 * - Cron-like interval scheduling
 *
 * Auto-start / daemon behavior is NOT implemented — all jobs
 * must be triggered manually or via interval configuration.
 *
 * Health-based scheduling: collectors in "failed" health status
 * are skipped until their health is restored.
 */
export class Scheduler {
  private readonly registry: CollectorRegistry;
  private readonly jobs = new Map<string, ScheduledJob>();
  private readonly intervalTimers = new Map<string, ReturnType<typeof setInterval>>();

  constructor(registry: CollectorRegistry, _storage: StorageInterface) {
    this.registry = registry;
  }

  // ── Job Management ────────────────────────────────────────────────────

  /**
   * Schedule a source for collection.
   *
   * @param source - Source record from the Source Registry.
   * @param config - Collector configuration (trigger type determines scheduling).
   * @returns The scheduled job.
   */
  schedule(source: SourceRecord, config: CollectorConfig): ScheduledJob {
    const job: ScheduledJob = {
      id: `job-${source.id}`,
      sourceId: source.id,
      config,
      trigger: config.trigger,
      running: false,
    };

    // Remove any existing job for this source
    this.unschedule(source.id);

    this.jobs.set(source.id, job);

    // Set up interval if applicable
    if (config.trigger.type === "interval" && config.enabled) {
      this.scheduleInterval(job);
    }

    // Calculate next run time
    job.nextRunAt = this.calculateNextRun(job);

    return job;
  }

  /**
   * Remove a source from the schedule.
   */
  unschedule(sourceId: string): void {
    const timer = this.intervalTimers.get(sourceId);
    if (timer) {
      clearInterval(timer);
      this.intervalTimers.delete(sourceId);
    }
    this.jobs.delete(sourceId);
  }

  /**
   * Trigger a collection run immediately (manual trigger).
   * Does NOT affect the regular schedule.
   *
   * @param sourceId - Source ID to trigger.
   * @returns The collection result.
   * @throws If no job is scheduled for this source.
   */
  async trigger(sourceId: string): Promise<CollectResult> {
    const job = this.jobs.get(sourceId);
    if (!job) {
      throw new Error(`No scheduled job for source "${sourceId}". Schedule it first.`);
    }

    return this.executeJob(job);
  }

  /**
   * Trigger all enabled scheduled jobs.
   * Useful for catch-up or maintenance runs.
   *
   * @returns Map of source ID → result.
   */
  async triggerAll(): Promise<Map<string, CollectResult>> {
    const results = new Map<string, CollectResult>();

    const promises = Array.from(this.jobs.values())
      .filter((job) => job.config.enabled && !job.running)
      .map(async (job) => {
        const result = await this.executeJob(job);
        results.set(job.sourceId, result);
      });

    await Promise.all(promises);
    return results;
  }

  /**
   * Get all scheduled jobs.
   */
  getJobs(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get a specific scheduled job.
   */
  getJob(sourceId: string): ScheduledJob | undefined {
    return this.jobs.get(sourceId);
  }

  /**
   * Get the next scheduled run time for a source.
   */
  getNextRunTime(sourceId: string): string | undefined {
    return this.jobs.get(sourceId)?.nextRunAt;
  }

  /**
   * Stop all scheduled intervals and clear all jobs.
   */
  shutdown(): void {
    for (const timer of this.intervalTimers.values()) {
      clearInterval(timer);
    }
    this.intervalTimers.clear();
    this.jobs.clear();
  }

  // ── Private ────────────────────────────────────────────────────────────

  private async executeJob(job: ScheduledJob): Promise<CollectResult> {
    job.running = true;
    const collectorName = job.config.label;

    try {
      // Check health — skip failed collectors
      const registrations = this.registry.listRegistrations();
      const reg = registrations.find((r) => r.name === collectorName);
      if (reg?.healthStatus === "failed") {
        return {
          runId: `skipped-${Date.now()}`,
          sourceId: job.sourceId,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          itemsFetched: 0,
          itemsValidated: 0,
          itemsNormalized: 0,
          itemsDeduplicated: 0,
          itemsStored: 0,
          stageDurations: { fetch: 0, validate: 0, normalize: 0, deduplicate: 0, store: 0 },
          success: false,
        };
      }

      // Check if a collector class is registered for this source type
      const collectorConstructor = this.registry.getCollectorForType(
        job.config.sourceType,
      );
      if (!collectorConstructor) {
        console.warn(
          `[Scheduler] No collector registered for source type "${job.config.sourceType}". ` +
          `Skipping job for source "${job.sourceId}".`,
        );
        return {
          runId: `unregistered-${Date.now()}`,
          sourceId: job.sourceId,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          itemsFetched: 0,
          itemsValidated: 0,
          itemsNormalized: 0,
          itemsDeduplicated: 0,
          itemsStored: 0,
          stageDurations: { fetch: 0, validate: 0, normalize: 0, deduplicate: 0, store: 0 },
          success: false,
        };
      }

      // Build a minimal source record from the job config for the collector
      const sourceRecord: SourceRecord = {
        id: job.sourceId,
        slug: job.sourceId,
        title: job.config.label,
        publisher: job.config.label,
        sourceType: job.config.sourceType,
        url: (job.config.metadata?.url as string) ?? "",
        accessedAt: new Date().toISOString(),
        status: "active",
        version: 1,
        trustLevel: 0,
        healthStatus: reg?.healthStatus ?? "unknown",
        automationStatus: "scheduled",
        failureCount: 0,
        monitoringEnabled: true,
        correctionUrl: "",
      };

      // Create the collector instance and run it
      const collector = this.registry.createInstance(sourceRecord, job.config);
      const result = await collector.collect();

      // Update health tracking
      if (result.success) {
        this.registry.recordSuccess(collectorName);
      } else {
        this.registry.recordFailure(collectorName);
      }

      job.lastResult = result;
      return result;
    } catch {
      this.registry.recordFailure(collectorName);
      const errorResult: CollectResult = {
        runId: `error-${Date.now()}`,
        sourceId: job.sourceId,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        itemsFetched: 0,
        itemsValidated: 0,
        itemsNormalized: 0,
        itemsDeduplicated: 0,
        itemsStored: 0,
        stageDurations: { fetch: 0, validate: 0, normalize: 0, deduplicate: 0, store: 0 },
        success: false,
      };
      job.lastResult = errorResult;
      return errorResult;
    } finally {
      job.running = false;
      // Recalculate next run
      if (job.config.trigger.type === "interval") {
        job.nextRunAt = this.calculateNextRun(job);
      }
    }
  }

  private scheduleInterval(job: ScheduledJob): void {
    if (job.trigger.type !== "interval") return;

    const intervalMs = job.trigger.intervalMinutes * 60 * 1000;
    const timer = setInterval(async () => {
      if (!job.running) {
        try {
          await this.trigger(job.sourceId);
        } catch {
          // Errors are logged inside executeJob via registry.recordFailure
        }
      }
    }, intervalMs);

    this.intervalTimers.set(job.sourceId, timer);
  }

  private calculateNextRun(job: ScheduledJob): string | undefined {
    if (!job.config.enabled) return undefined;

    switch (job.trigger.type) {
      case "manual":
        return undefined; // Manual triggers have no next run
      case "interval":
        return new Date(
          Date.now() + job.trigger.intervalMinutes * 60 * 1000,
        ).toISOString();
      case "cron": {
        // Simple cron-like: store the expression for the consumer to interpret
        // Next-run calculation for actual cron expressions will be added
        // when the cron parser dependency is introduced.
        return new Date(Date.now() + 60 * 60 * 1000).toISOString(); // Default: 1 hour
      }
      default:
        return undefined;
    }
  }
}
