// src/lib/collectors/feedRegistry.ts
// Single source of truth for feed definitions. The `feeds` Supabase table
// is authoritative; the static `feedConfig.ts` is used only for initial
// seeding when a feed doesn't yet exist in the database.

import { supabase } from "../db/client";
import type { CollectorHealthSnapshot } from "./monitoring/types";
import { feedConfig, type FeedDefinition } from "./feeds/feedConfig";

// ── DB row shape (snake_case as returned by Supabase) ────────────────────────

export interface FeedRow {
  id: string;
  name: string;
  url: string;
  source_id: string | null;
  source_type: string;
  category: string | null;
  parser: string;
  language: string;
  enabled: boolean;
  poll_interval_minutes: number;
  trust_level: number;
  health_status: string;
  last_fetched_at: string | null;
  last_success_at: string | null;
  failure_count: number;
  last_error: string | null;
  category_mapping: Record<string, unknown>;
  has_paywall: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ── Feed query functions ─────────────────────────────────────────────────────

/**
 * Fetch all feeds from the database.
 * Falls back to an empty array on error.
 */
export async function getFeeds(): Promise<FeedRow[]> {
  const { data, error } = await supabase
    .from("feeds")
    .select("*")
    .order("name", { ascending: true });

  if (error || !data) return [];
  return data as FeedRow[];
}

/**
 * Fetch a single feed by ID.
 */
export async function getFeed(id: string): Promise<FeedRow | null> {
  const { data, error } = await supabase
    .from("feeds")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as FeedRow;
}

/**
 * Fetch all enabled feeds.
 */
export async function listEnabled(): Promise<FeedRow[]> {
  const { data, error } = await supabase
    .from("feeds")
    .select("*")
    .eq("enabled", true)
    .order("name", { ascending: true });

  if (error || !data) return [];
  return data as FeedRow[];
}

/**
 * Fetch feeds filtered by source type.
 */
export async function getFeedsBySourceType(
  type: string,
): Promise<FeedRow[]> {
  const { data, error } = await supabase
    .from("feeds")
    .select("*")
    .eq("source_type", type)
    .eq("enabled", true)
    .order("name", { ascending: true });

  if (error || !data) return [];
  return data as FeedRow[];
}

// ── Health updates ───────────────────────────────────────────────────────────

/**
 * Update a feed's health fields after a collection run.
 */
export async function updateFeedHealth(
  feedId: string,
  snapshot: CollectorHealthSnapshot,
): Promise<void> {
  await supabase
    .from("feeds")
    .update({
      health_status: snapshot.status,
      last_fetched_at: snapshot.lastFetchAt ?? null,
      last_success_at: snapshot.lastSuccessAt ?? null,
      failure_count: snapshot.consecutiveFailures,
      last_error: snapshot.lastError ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", feedId);
}

// ── Seeding from static config ───────────────────────────────────────────────

/**
 * Seed missing feeds from the static `feedConfig.ts`.
 *
 * For each feed in the static config, check if a feed with the same name
 * already exists in the database. If not, insert it. Existing feeds are
 * never overwritten — the database is authoritative.
 *
 * Safe to call multiple times (idempotent).
 *
 * @returns The number of newly inserted feeds.
 */
export async function syncFromConfig(): Promise<number> {
  const existing = await getFeeds();
  const existingNames = new Set(existing.map((f) => f.name));

  let inserted = 0;
  for (const def of feedConfig) {
    if (existingNames.has(def.label)) continue;

    const { error } = await supabase.from("feeds").insert({
      name: def.label,
      url: def.url,
      source_type: def.sourceType,
      parser: "rss",
      language: def.language,
      enabled: def.enabled,
      poll_interval_minutes: def.pollingIntervalMinutes,
      category_mapping: def.categoryMapping as Record<string, unknown>,
      has_paywall: def.hasPaywall,
      metadata: def.metadata ?? {},
    });

    if (!error) {
      inserted++;
      existingNames.add(def.label);
    }
  }

  return inserted;
}

/**
 * Get the static feed config definitions (for reference / bootstrapping).
 */
export function getStaticFeedConfig(): FeedDefinition[] {
  return feedConfig;
}
