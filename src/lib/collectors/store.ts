import type { CollectedItem, StorageInterface } from "./types";

/**
 * In-memory storage implementation for development and testing.
 *
 * During the static beta, collected content is stored in memory only.
 * This avoids persisting data that may be incomplete or from sources
 * whose terms of service have not yet been fully reviewed.
 *
 * In production, this will be replaced with an API-backed store that
 * persists to a database.
 */
export class DevMemoryStore implements StorageInterface {
  private readonly items: Map<string, CollectedItem> = new Map();
  private readonly fingerprintIndex: Set<string> = new Set();

  async save(item: CollectedItem): Promise<void> {
    const key = this.itemKey(item);
    this.items.set(key, item);
    this.fingerprintIndex.add(item.fingerprint);
  }

  async getBySource(sourceId: string): Promise<CollectedItem[]> {
    const results: CollectedItem[] = [];
    for (const item of this.items.values()) {
      if (item.sourceId === sourceId) {
        results.push(item);
      }
    }
    return results;
  }

  async getByDate(start: string, end: string): Promise<CollectedItem[]> {
    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();
    const results: CollectedItem[] = [];
    for (const item of this.items.values()) {
      const fetchedAt = new Date(item.fetchedAt).getTime();
      if (fetchedAt >= startDate && fetchedAt <= endDate) {
        results.push(item);
      }
    }
    return results;
  }

  async getUnprocessed(): Promise<CollectedItem[]> {
    // In this dev implementation, items without normalized content
    // are considered unprocessed.
    const results: CollectedItem[] = [];
    for (const item of this.items.values()) {
      if (!item.normalized) {
        results.push(item);
      }
    }
    return results;
  }

  async exists(fingerprint: string): Promise<boolean> {
    return this.fingerprintIndex.has(fingerprint);
  }

  async count(): Promise<number> {
    return this.items.size;
  }

  async clear(): Promise<void> {
    this.items.clear();
    this.fingerprintIndex.clear();
  }

  private itemKey(item: CollectedItem): string {
    return `${item.sourceId}:${item.fingerprint}`;
  }
}
