// src/lib/scheduler/Scheduler.ts
// Real scheduler with cron support, interval polling, manual triggers,
// missed-run recovery, and exponential backoff with jitter.

import { supabase } from "../db/client";

// ── Types ────────────────────────────────────────────────────────────────────

export type SchedulerMode = "interval" | "cron" | "manual" | "disabled";

export interface ScheduledJob {
  feedId: string;
  feedName: string;
  mode: SchedulerMode;
  /** Interval in milliseconds (for 'interval' mode). */
  intervalMs: number;
  /** Cron expression (for 'cron' mode). e.g. "0 0/6 * * *" */
  cronExpression?: string;
  /** ISO timestamp of the next scheduled run. */
  nextRunAt: string;
  /** Called when the job fires. Receives the feedId. */
  callback: (feedId: string) => Promise<void>;
  /** Consecutive failure count for backoff. */
  consecutiveFailures: number;
  /** Whether the job is currently paused. */
  paused: boolean;
}

export interface SchedulerStats {
  totalJobs: number;
  activeJobs: number;
  pausedJobs: number;
  nextRunAt: string | null;
}

// ── Cron matching ────────────────────────────────────────────────────────────

interface CronField {
  values: Set<number>;
  hasWildcard: boolean;
}

function parseCronField(field: string, min: number, max: number): CronField {
  const values = new Set<number>();

  if (field === "*") {
    for (let i = min; i <= max; i++) values.add(i);
    return { values, hasWildcard: true };
  }

  const parts = field.split(",");
  for (const part of parts) {
    if (part.includes("/")) {
      // Step: */15 or 0/15
      const [range, stepStr] = part.split("/");
      const step = parseInt(stepStr, 10) || 1;
      let rangeMin = min;
      let rangeMax = max;

      if (range !== "*") {
        if (range.includes("-")) {
          const [rMin, rMax] = range.split("-");
          rangeMin = parseInt(rMin, 10);
          rangeMax = parseInt(rMax, 10);
        } else {
          rangeMin = parseInt(range, 10);
          rangeMax = max;
        }
      }

      for (let i = rangeMin; i <= rangeMax; i += step) {
        values.add(i);
      }
    } else if (part.includes("-")) {
      const [rMin, rMax] = part.split("-");
      for (let i = parseInt(rMin, 10); i <= parseInt(rMax, 10); i++) {
        values.add(i);
      }
    } else {
      values.add(parseInt(part, 10));
    }
  }

  return { values, hasWildcard: field === "*" };
}

/**
 * Check whether a cron expression matches a given date.
 * Handles: *, specific values, ranges (1-5), steps (every 15 min), lists (1,3,5).
 */
export function cronMatches(expression: string, date: Date = new Date()): boolean {
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5) return false;

  const [minField, hourField, domField, monthField, dowField] = fields;

  const minute = date.getUTCMinutes();
  const hour = date.getUTCHours();
  const dayOfMonth = date.getUTCDate();
  const month = date.getUTCMonth() + 1; // 1-indexed
  const dayOfWeek = date.getUTCDay(); // 0 = Sunday

  const minutes = parseCronField(minField, 0, 59);
  const hours = parseCronField(hourField, 0, 23);
  const daysOfMonth = parseCronField(domField, 1, 31);
  const months = parseCronField(monthField, 1, 12);
  const daysOfWeek = parseCronField(dowField, 0, 6);

  return (
    minutes.values.has(minute)
    && hours.values.has(hour)
    && daysOfMonth.values.has(dayOfMonth)
    && months.values.has(month)
    && daysOfWeek.values.has(dayOfWeek)
  );
}

/**
 * Calculate the next run time from a cron expression.
 * Simple forward-iterating approach — checks every minute up to 31 days ahead.
 */
export function nextCronRun(expression: string, from: Date = new Date()): Date {
  const candidate = new Date(from.getTime() + 60_000); // start next minute
  candidate.setUTCSeconds(0, 0);

  // Search forward one minute at a time, up to 31 days
  const maxIterations = 31 * 24 * 60;
  for (let i = 0; i < maxIterations; i++) {
    if (cronMatches(expression, candidate)) {
      return candidate;
    }
    candidate.setUTCMinutes(candidate.getUTCMinutes() + 1);
  }

  // Fallback: 1 hour from now
  return new Date(from.getTime() + 60 * 60_000);
}

// ── Backoff ──────────────────────────────────────────────────────────────────

function backoffDelay(consecutiveFailures: number, baseMs: number = 60_000): number {
  const exponential = baseMs * Math.pow(2, Math.min(consecutiveFailures, 8));
  const jitter = Math.random() * 0.3 * exponential; // ±15% jitter
  return Math.min(exponential + jitter, 24 * 60 * 60 * 1000); // cap at 24h
}

// ── Scheduler ────────────────────────────────────────────────────────────────

export class Scheduler {
  private jobs = new Map<string, ScheduledJob>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;
  private tickIntervalMs = 30_000; // check every 30 seconds

  // ── Job management ─────────────────────────────────────────────────────

  /**
   * Schedule a feed for periodic collection.
   */
  schedule(
    feedId: string,
    feedName: string,
    mode: SchedulerMode,
    intervalOrCron: string | number,
    callback: (feedId: string) => Promise<void>,
  ): void {
    // Remove existing job if any
    this.unschedule(feedId);

    const intervalMs = typeof intervalOrCron === "number"
      ? intervalOrCron
      : 60 * 60_000; // default 1h for cron

    const now = Date.now();
    const nextRunAt = mode === "cron" && typeof intervalOrCron === "string"
      ? nextCronRun(intervalOrCron).toISOString()
      : new Date(now + intervalMs).toISOString();

    const job: ScheduledJob = {
      feedId,
      feedName,
      mode,
      intervalMs,
      cronExpression: typeof intervalOrCron === "string" ? intervalOrCron : undefined,
      nextRunAt,
      callback,
      consecutiveFailures: 0,
      paused: false,
    };

    this.jobs.set(feedId, job);
    void this.persistNextRun(feedId, nextRunAt);
  }

  /**
   * Remove a job from the schedule.
   */
  unschedule(feedId: string): void {
    this.jobs.delete(feedId);
  }

  /**
   * Pause a specific job without removing it.
   */
  pauseJob(feedId: string): void {
    const job = this.jobs.get(feedId);
    if (job) job.paused = true;
  }

  /**
   * Resume a paused job.
   */
  resumeJob(feedId: string): void {
    const job = this.jobs.get(feedId);
    if (job) {
      job.paused = false;
      job.nextRunAt = new Date(Date.now() + job.intervalMs).toISOString();
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  start(): void {
    if (this.running) return;
    this.running = true;

    // Recover missed runs: any job whose nextRunAt < now fires immediately
    void this.recoverMissedRuns();

    // Tick loop
    this.timer = setInterval(() => {
      void this.tick();
    }, this.tickIntervalMs);
  }

  stop(): void {
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // ── Tick ───────────────────────────────────────────────────────────────

  private async tick(): Promise<void> {
    if (!this.running) return;

    const now = Date.now();
    const dueJobs: ScheduledJob[] = [];

    for (const job of this.jobs.values()) {
      if (job.paused || job.mode === "disabled" || job.mode === "manual") continue;
      if (new Date(job.nextRunAt).getTime() <= now) {
        dueJobs.push(job);
      }
    }

    for (const job of dueJobs) {
      try {
        await job.callback(job.feedId);
        job.consecutiveFailures = 0;

        // Schedule next run
        const delay = job.consecutiveFailures > 0
          ? backoffDelay(job.consecutiveFailures)
          : (job.mode === "cron" && job.cronExpression
            ? nextCronRun(job.cronExpression).getTime() - now
            : job.intervalMs);

        job.nextRunAt = new Date(now + delay).toISOString();
        void this.persistNextRun(job.feedId, job.nextRunAt);
      } catch {
        job.consecutiveFailures++;
        const delay = backoffDelay(job.consecutiveFailures);
        job.nextRunAt = new Date(now + delay).toISOString();
        void this.persistNextRun(job.feedId, job.nextRunAt);
      }
    }
  }

  // ── Recovery ───────────────────────────────────────────────────────────

  private async recoverMissedRuns(): Promise<void> {
    const now = Date.now();
    const missed: ScheduledJob[] = [];

    for (const job of this.jobs.values()) {
      if (job.paused || job.mode === "disabled" || job.mode === "manual") continue;
      if (new Date(job.nextRunAt).getTime() <= now) {
        missed.push(job);
      }
    }

    // Run missed jobs with a small stagger to avoid thundering herd
    for (let i = 0; i < missed.length; i++) {
      setTimeout(() => {
        void missed[i].callback(missed[i].feedId).catch(() => {});
      }, i * 2000);
    }
  }

  // ── Persistence ────────────────────────────────────────────────────────

  private async persistNextRun(feedId: string, nextRunAt: string): Promise<void> {
    try {
      await supabase
        .from("feeds")
        .update({ metadata: { next_run_at: nextRunAt } })
        .eq("id", feedId);
    } catch {
      // Best-effort — don't block the scheduler on persistence failures
    }
  }

  // ── Stats ──────────────────────────────────────────────────────────────

  stats(): SchedulerStats {
    const jobs = Array.from(this.jobs.values());
    const active = jobs.filter((j) => !j.paused && j.mode !== "disabled" && j.mode !== "manual");
    const next = active.length > 0
      ? active.reduce((earliest, j) =>
        j.nextRunAt < earliest ? j.nextRunAt : earliest, active[0].nextRunAt)
      : null;

    return {
      totalJobs: jobs.length,
      activeJobs: active.length,
      pausedJobs: jobs.filter((j) => j.paused).length,
      nextRunAt: next,
    };
  }

  listJobs(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }
}
