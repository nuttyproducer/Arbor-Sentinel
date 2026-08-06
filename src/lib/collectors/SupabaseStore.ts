import type { CollectedItem, NormalizedContent, StorageInterface } from "./types";
import { supabase } from "../db/client";

/** Sources at or above this credibility tier are auto-published on ingestion. */
const AUTO_PUBLISH_MIN_CREDIBILITY_TIER = 3;

/** Fallback evidence item category when the normalized content has none. */
const DEFAULT_EVIDENCE_CATEGORY = "other";

/** Maximum length of the evidence item summary (derived from the body). */
const EVIDENCE_SUMMARY_MAX_LENGTH = 200;

/**
 * Persistent storage implementation backed by Supabase.
 *
 * Writes collector runs to the `collector_runs` table and stores collected
 * items for deduplication checks. Collected items are also persisted to
 * `evidence_items` (the normalized-content destination); items collected from
 * trusted sources (credibility_tier >= {@link AUTO_PUBLISH_MIN_CREDIBILITY_TIER})
 * are auto-published. Replaces DevMemoryStore for production use.
 */
export class SupabaseStore implements StorageInterface {
  private readonly fingerprintCache = new Set<string>();
  private readonly items: Map<string, CollectedItem> = new Map();

  async save(item: CollectedItem): Promise<void> {
    const key = this.itemKey(item);
    this.items.set(key, item);
    this.fingerprintCache.add(item.fingerprint);

    // Persist the collected item to evidence_items, then auto-publish it if
    // its source is trusted. Both steps are best-effort — failures are logged
    // and swallowed so collection is never disrupted.
    const recordId = await persistEvidenceItem(item);
    if (recordId) {
      await autoPublishIfTrusted(item.sourceId, recordId);
    }
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
    const results: CollectedItem[] = [];
    for (const item of this.items.values()) {
      if (!item.normalized) {
        results.push(item);
      }
    }
    return results;
  }

  async exists(fingerprint: string): Promise<boolean> {
    // Check local cache first — this covers dedup within the current session.
    if (this.fingerprintCache.has(fingerprint)) {
      return true;
    }

    // Cross-session dedup: check evidence_items for a matching slug fragment.
    // The fingerprint hash is embedded in the slug as `slugify(title)-shortHash(fp)`.
    // We extract the short hash from the fingerprint and search for it.
    try {
      const hashPart = fingerprint.split(":")[1] ?? fingerprint;
      const { data, error } = await supabase
        .from("evidence_items")
        .select("id")
        .ilike("slug", `%-${hashPart}`);

      if (error) {
        console.warn("[SupabaseStore] Fingerprint lookup failed:", error.message);
        return false;
      }

      if ((data?.length ?? 0) > 0) {
        // Seed the cache so we don't hit the DB again for this fingerprint
        this.fingerprintCache.add(fingerprint);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  async count(): Promise<number> {
    return this.items.size;
  }

  async clear(): Promise<void> {
    this.items.clear();
    this.fingerprintCache.clear();
  }

  /**
   * Persist a completed collector run to the database.
   */
  async persistRun(run: {
    sourceId: string;
    collectorType: string;
    status: "running" | "completed" | "failed";
    itemsFetched: number;
    itemsValidated: number;
    itemsStored: number;
    stageDurations: Record<string, number>;
    errors: Array<Record<string, unknown>>;
    startedAt: string;
    completedAt?: string;
  }): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from("collector_runs")
        .insert({
          source_id: run.sourceId,
          collector_type: run.collectorType,
          status: run.status,
          items_fetched: run.itemsFetched,
          items_validated: run.itemsValidated,
          items_stored: run.itemsStored,
          stage_durations: run.stageDurations,
          errors: run.errors,
          started_at: run.startedAt,
          completed_at: run.completedAt ?? new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) {
        console.error("[SupabaseStore] Failed to persist run:", error.message);
        return null;
      }

      return data.id;
    } catch (err) {
      console.error("[SupabaseStore] Error persisting run:", err);
      return null;
    }
  }

  /**
   * Get recent collector runs for a source.
   */
  async getRunsForSource(
    sourceId: string,
    limit = 10,
  ): Promise<Array<Record<string, unknown>>> {
    try {
      const { data, error } = await supabase
        .from("collector_runs")
        .select("*")
        .eq("source_id", sourceId)
        .order("started_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("[SupabaseStore] Failed to fetch runs:", error.message);
        return [];
      }

      return data ?? [];
    } catch {
      return [];
    }
  }

  /**
   * Get all recent collector runs.
   */
  async getRecentRuns(
    limit = 50,
  ): Promise<Array<Record<string, unknown>>> {
    try {
      const { data, error } = await supabase
        .from("collector_runs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("[SupabaseStore] Failed to fetch runs:", error.message);
        return [];
      }

      return data ?? [];
    } catch {
      return [];
    }
  }

  /**
   * Get feeds from the database.
   */
  async getFeeds(): Promise<Array<Record<string, unknown>>> {
    try {
      const { data, error } = await supabase
        .from("feeds")
        .select("*")
        .order("name");

      if (error) {
        console.error("[SupabaseStore] Failed to fetch feeds:", error.message);
        return [];
      }

      return data ?? [];
    } catch {
      return [];
    }
  }

  /**
   * Update a feed's health status after a fetch attempt.
   */
  async updateFeedHealth(
    feedId: string,
    updates: {
      healthStatus?: string;
      lastFetchedAt?: string;
      lastSuccessAt?: string;
      failureCount?: number;
      lastError?: string;
    },
  ): Promise<void> {
    try {
      await supabase
        .from("feeds")
        .update(updates)
        .eq("id", feedId);
    } catch (err) {
      console.error("[SupabaseStore] Failed to update feed health:", err);
    }
  }

  /**
   * Toggle a feed's enabled state.
   */
  async toggleFeed(feedId: string, enabled: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("feeds")
        .update({ enabled })
        .eq("id", feedId);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Delete a feed.
   */
  async deleteFeed(feedId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("feeds")
        .delete()
        .eq("id", feedId);

      return !error;
    } catch {
      return false;
    }
  }

  private itemKey(item: CollectedItem): string {
    return `${item.sourceId}:${item.fingerprint}`;
  }
}

/**
 * Best-effort persistence of a collected item into `evidence_items`.
 *
 * Returns the new record id, or `null` when the item has no normalized content
 * or the insert fails (e.g. RLS, foreign-key or unique-slug violation). Never
 * throws.
 */
async function persistEvidenceItem(item: CollectedItem): Promise<string | null> {
  const normalized = item.normalized;
  if (!normalized) return null;

  const title = normalized.title.trim() || "Untitled";
  const body = normalized.body?.trim() ?? "";
  const slug = `${slugify(title)}-${shortHash(item.fingerprint)}`;

  try {
    const { data, error } = await supabase
      .from("evidence_items")
      .insert({
        title,
        slug,
        summary: body.slice(0, EVIDENCE_SUMMARY_MAX_LENGTH) || title,
        body: body || null,
        category: inferCategory(normalized),
        publication_date: toDateOnly(normalized.publishedAt),
        source_id: item.sourceId,
        visibility: "draft",
        review_status: "draft",
      })
      .select("id")
      .single();

    if (error) {
      console.warn("[SupabaseStore] Failed to persist evidence item:", error.message);
      return null;
    }

    return data.id;
  } catch (err) {
    console.warn(
      "[SupabaseStore] Error persisting evidence item:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

/**
 * Auto-publish a persisted evidence item when its source is trusted
 * (credibility_tier >= {@link AUTO_PUBLISH_MIN_CREDIBILITY_TIER}).
 *
 * `publishRecord` is dynamically imported to avoid a circular dependency
 * between the collector store and the workflow module. Best-effort: missing
 * sources and publish failures are logged and swallowed — never thrown.
 */
async function autoPublishIfTrusted(sourceId: string, recordId: string): Promise<void> {
  try {
    const { data: source } = await supabase
      .from("sources")
      .select("credibility_tier")
      .eq("id", sourceId)
      .single();

    if (source && (source.credibility_tier ?? 0) >= AUTO_PUBLISH_MIN_CREDIBILITY_TIER) {
      const { publishRecord } = await import("../workflow/publish");
      const result = await publishRecord("evidence_items", recordId);
      if (!result.success) {
        console.warn(
          `[SupabaseStore] Auto-publish failed for evidence item "${recordId}": ${result.error}`,
        );
      }
    }
  } catch (err) {
    console.warn(
      `[SupabaseStore] Auto-publish check failed for source "${sourceId}":`,
      err instanceof Error ? err.message : err,
    );
  }
}

/** Derive a URL-safe slug from an item title. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/** Short, stable hash of a string (used to disambiguate evidence slugs). */
function shortHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/** Extract an ISO datetime string into a yyyy-mm-dd date-only value. */
function toDateOnly(iso?: string): string | null {
  if (!iso) return null;
  const match = /^\d{4}-\d{2}-\d{2}/.exec(iso);
  return match ? match[0] : null;
}

/** Map normalized content to an evidence_items category value. */
function inferCategory(normalized: NormalizedContent): string {
  const contentType = normalized.metadata?.contentType;
  return typeof contentType === "string" && contentType.length > 0
    ? contentType
    : DEFAULT_EVIDENCE_CATEGORY;
}
