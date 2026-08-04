// src/lib/review/ReviewPersistence.ts

import type {
  ReviewItem,
  ReviewState,
  ReviewType,
  PriorityLevel,
} from "./types";

// ── Query Filters ──────────────────────────────────────────────────────────

export interface ReviewQueryFilters {
  state?: ReviewState | ReviewState[];
  priority?: PriorityLevel | PriorityLevel[];
  assignee?: string;
  reviewType?: ReviewType | ReviewType[];
  sourceType?: string;
  /** Inclusive lower bound: `createdAt >= createdAfter`. ISO timestamp. */
  createdAfter?: string;
  /** Exclusive upper bound: `createdAt < createdBefore`. ISO timestamp. */
  createdBefore?: string;
}

// ── Persistence Store Interface ────────────────────────────────────────────

/**
 * Storage abstraction for review items. The queue never touches a concrete
 * storage implementation directly — it operates against this interface so the
 * same queue logic works in the browser (localStorage), on the server, and in
 * tests (in-memory Map).
 */
export interface PersistenceStore {
  /** Replace the entire persisted collection with `items`. */
  save(items: ReviewItem[]): Promise<void>;
  /** Load the entire collection in unspecified order. */
  load(): Promise<ReviewItem[]>;
  /** Load items matching `filters`. Order is unspecified (queue applies ordering). */
  query(filters: ReviewQueryFilters): Promise<ReviewItem[]>;
  /** Load a page of matching items (raw, unsorted). */
  paginate(
    filters: ReviewQueryFilters,
    page: number,
    pageSize: number,
  ): Promise<{ items: ReviewItem[]; total: number }>;
  getById(id: string): Promise<ReviewItem | null>;
}

// ── Filter application (shared by all stores) ───────────────────────────────

/**
 * Filter `items` against `filters`. Pure and order-preserving.
 *
 * - `state`, `priority`, `reviewType` accept either a single value or an array
 *   (matches any of the listed values).
 * - `createdAfter` is inclusive (`createdAt >= createdAfter`); `createdBefore`
 *   is exclusive (`createdAt < createdBefore`). ISO-8601 strings compare
 *   correctly with `<`/`>=`.
 */
export function applyFilters(items: ReviewItem[], filters: ReviewQueryFilters): ReviewItem[] {
  return items.filter((item) => {
    if (filters.state !== undefined) {
      const states = Array.isArray(filters.state) ? filters.state : [filters.state];
      if (!states.includes(item.state)) return false;
    }
    if (filters.priority !== undefined) {
      const priorities = Array.isArray(filters.priority)
        ? filters.priority
        : [filters.priority];
      if (!priorities.includes(item.priority)) return false;
    }
    if (filters.assignee !== undefined && item.assignedReviewer !== filters.assignee) {
      return false;
    }
    if (filters.reviewType !== undefined) {
      const types = Array.isArray(filters.reviewType) ? filters.reviewType : [filters.reviewType];
      if (!types.includes(item.reviewType)) return false;
    }
    if (filters.sourceType !== undefined && item.sourceContentRef.type !== filters.sourceType) {
      return false;
    }
    if (filters.createdAfter !== undefined && item.createdAt < filters.createdAfter) {
      return false;
    }
    if (filters.createdBefore !== undefined && item.createdAt >= filters.createdBefore) {
      return false;
    }
    return true;
  });
}

// ── In-memory Map store (default; test/server) ─────────────────────────────

/**
 * Default {@link PersistenceStore} backed by a `Map`. Safe in any environment
 * (Node, tests, SSR) — unlike {@link LocalStoragePersistence} which requires a
 * browser. The queue uses this when no store is supplied.
 */
export class InMemoryPersistence implements PersistenceStore {
  private readonly store = new Map<string, ReviewItem>();

  async save(items: ReviewItem[]): Promise<void> {
    this.store.clear();
    for (const item of items) {
      this.store.set(item.id, item);
    }
  }

  async load(): Promise<ReviewItem[]> {
    return Array.from(this.store.values());
  }

  async query(filters: ReviewQueryFilters): Promise<ReviewItem[]> {
    return applyFilters(Array.from(this.store.values()), filters);
  }

  async paginate(
    filters: ReviewQueryFilters,
    page: number,
    pageSize: number,
  ): Promise<{ items: ReviewItem[]; total: number }> {
    const filtered = applyFilters(Array.from(this.store.values()), filters);
    const start = Math.max(0, (page - 1) * pageSize);
    return { items: filtered.slice(start, start + pageSize), total: filtered.length };
  }

  async getById(id: string): Promise<ReviewItem | null> {
    return this.store.get(id) ?? null;
  }
}

// ── LocalStorage store (browser) ───────────────────────────────────────────

/**
 * Browser {@link PersistenceStore} that serializes the queue to a single
 * `localStorage` key as JSON. Throws when constructed or used outside a browser
 * environment (no `window.localStorage`) — use {@link InMemoryPersistence}
 * there instead.
 */
export class LocalStoragePersistence implements PersistenceStore {
  constructor(private readonly storageKey = "aa-review-queue") {}

  private get storage(): Storage {
    if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
      throw new Error(
        "LocalStoragePersistence requires a browser environment with localStorage. " +
          "Use InMemoryPersistence outside the browser.",
      );
    }
    return window.localStorage;
  }

  async save(items: ReviewItem[]): Promise<void> {
    this.storage.setItem(this.storageKey, JSON.stringify(items));
  }

  async load(): Promise<ReviewItem[]> {
    const raw = this.storage.getItem(this.storageKey);
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as ReviewItem[]) : [];
    } catch {
      return [];
    }
  }

  async query(filters: ReviewQueryFilters): Promise<ReviewItem[]> {
    return applyFilters(await this.load(), filters);
  }

  async paginate(
    filters: ReviewQueryFilters,
    page: number,
    pageSize: number,
  ): Promise<{ items: ReviewItem[]; total: number }> {
    const filtered = applyFilters(await this.load(), filters);
    const start = Math.max(0, (page - 1) * pageSize);
    return { items: filtered.slice(start, start + pageSize), total: filtered.length };
  }

  async getById(id: string): Promise<ReviewItem | null> {
    const items = await this.load();
    return items.find((item) => item.id === id) ?? null;
  }
}
