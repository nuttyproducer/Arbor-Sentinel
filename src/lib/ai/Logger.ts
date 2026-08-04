// src/lib/ai/Logger.ts

import type { AILogEntry } from "./types";

/**
 * Audit logger for all AI operations.
 *
 * ALWAYS ON — there is no disable flag. Every AI call is recorded.
 * In-memory storage by default; swap the store for persistence later.
 */
export class Logger {
  private entries: AILogEntry[] = [];

  /** Record an AI operation. */
  log(entry: AILogEntry): void {
    this.entries.push({
      ...entry,
      prompt: truncate(entry.prompt, 500),
      responseSummary: truncate(entry.responseSummary, 500),
    });
  }

  /** Get all log entries, optionally filtered. */
  getEntries(filter?: {
    stageName?: string;
    startDate?: string;
  }): AILogEntry[] {
    let result = [...this.entries];

    if (filter?.stageName) {
      const stageName = filter.stageName;
      result = result.filter((e) => e.stageName === stageName);
    }
    if (filter?.startDate) {
      const startDate = filter.startDate;
      result = result.filter((e) => e.timestamp >= startDate);
    }

    return result;
  }

  /** Export all entries as JSON string for audit/review. */
  export(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  /** Number of entries recorded. */
  get count(): number {
    return this.entries.length;
  }

  /** Clear all entries (primarily for testing). */
  clear(): void {
    this.entries = [];
  }
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "... [truncated]";
}
