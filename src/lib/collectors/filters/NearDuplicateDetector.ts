// src/lib/collectors/filters/NearDuplicateDetector.ts
// Detects near-duplicate articles before they enter the review queue.
// Runs BEFORE the exact fingerprint dedup stage in BaseCollector.
//
// Uses three complementary signals:
// 1. Title similarity (normalized Levenshtein ratio)
// 2. URL canonicalization (strips tracking params, fragments)
// 3. Description text overlap (Jaccard similarity on word sets)

import type { CollectedItem } from "../types";

// ── Config ────────────────────────────────────────────────────────────────────

export interface NearDuplicateConfig {
  /** Title similarity threshold (0-1). Items above this are flagged. */
  titleSimilarityThreshold: number;
  /** Minimum description word overlap ratio (0-1). */
  descriptionOverlapThreshold: number;
  /** Whether to canonicalize URLs before comparison. */
  canonicalizeUrls: boolean;
}

export const DEFAULT_NEAR_DUP_CONFIG: NearDuplicateConfig = {
  titleSimilarityThreshold: 0.85,
  descriptionOverlapThreshold: 0.7,
  canonicalizeUrls: true,
};

// ── Detector ──────────────────────────────────────────────────────────────────

/**
 * Check whether a new item is a near-duplicate of any item in the existing set.
 * Returns the matching item's fingerprint, or null if no near-duplicate found.
 */
export function detectNearDuplicate(
  candidate: CollectedItem,
  existing: CollectedItem[],
  config: NearDuplicateConfig = DEFAULT_NEAR_DUP_CONFIG,
): string | null {
  for (const stored of existing) {
    if (isNearDuplicate(candidate, stored, config)) {
      return stored.fingerprint;
    }
  }
  return null;
}

/**
 * Compare two items for near-duplicate status using all three signals.
 */
function isNearDuplicate(
  a: CollectedItem,
  b: CollectedItem,
  config: NearDuplicateConfig,
): boolean {
  // Signal 1: Title similarity
  const titleA = (a.normalized?.title ?? "").toLowerCase().trim();
  const titleB = (b.normalized?.title ?? "").toLowerCase().trim();
  if (titleA && titleB) {
    const titleSim = levenshteinRatio(titleA, titleB);
    if (titleSim < config.titleSimilarityThreshold) return false;
  }

  // Signal 2: URL canonicalization match
  if (config.canonicalizeUrls) {
    const urlA = canonicalizeUrl(a.url);
    const urlB = canonicalizeUrl(b.url);
    if (urlA === urlB) return true;
  }

  // Signal 3: Description word overlap
  const descA = (a.normalized?.body ?? "").toLowerCase();
  const descB = (b.normalized?.body ?? "").toLowerCase();
  if (descA && descB && descA.length > 50 && descB.length > 50) {
    const overlap = jaccardSimilarity(descA, descB);
    if (overlap >= config.descriptionOverlapThreshold) return true;
  }

  return false;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Normalized Levenshtein similarity ratio (0-1). 1 = identical strings. */
function levenshteinRatio(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;

  const lenA = a.length;
  const lenB = b.length;
  const maxLen = Math.max(lenA, lenB);

  // Use simple edit-distance approach
  const matrix: number[][] = [];
  for (let i = 0; i <= lenA; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= lenB; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  const distance = matrix[lenA][lenB];
  return 1 - distance / maxLen;
}

/** Jaccard similarity coefficient on word sets (0-1). */
function jaccardSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.split(/\s+/).filter((w) => w.length > 2));
  const wordsB = new Set(b.split(/\s+/).filter((w) => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);
  return intersection.size / union.size;
}

/** Strip tracking params and fragments from a URL for comparison. */
function canonicalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    // Strip known tracking/utm params
    const stripParams = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref", "source", "fbclid", "gclid"];
    for (const p of stripParams) {
      u.searchParams.delete(p);
    }
    u.hash = "";
    return u.toString();
  } catch {
    return url;
  }
}
