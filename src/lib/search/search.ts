/**
 * Client-side search function.
 *
 * Simple, understandable ranking:
 *  1. Exact title match (score: 100)
 *  2. Title starts with query (score: 80)
 *  3. Title contains all query terms (score: 60 + term count)
 *  4. Title contains any query term (score: 30 + term count)
 *  5. Description contains all query terms (score: 20 + term count)
 *  6. Description contains any query term (score: 10 + term count)
 *  7. Tags contain any query term (score: 5 per match)
 *
 * No fuzzy matching. No query logging. No user profiling.
 */

import type { SearchQuery, SearchResponse, SearchResult, SearchableRecord } from "./types";
import { getSearchIndex } from "./buildIndex";

// ── Tokenization ────────────────────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

// ── Ranking ─────────────────────────────────────────────────────────────────

function scoreRecord(record: SearchableRecord, queryTerms: string[]): { score: number; matchedFields: string[] } {
  let score = 0;
  const matchedFields: string[] = [];

  const titleLower = record.title.toLowerCase();
  const descLower = record.description.toLowerCase();
  const tagsLower = record.tags.map((t) => t.toLowerCase());
  const publisherLower = (record.publisher ?? "").toLowerCase();
  const categoryLower = (record.category ?? "").toLowerCase();
  const jurisdictionLower = (record.jurisdiction ?? "").toLowerCase();

  const fullQuery = queryTerms.join(" ");

  // 1. Exact title match
  if (titleLower === fullQuery) {
    score += 100;
    matchedFields.push("title (exact)");
  }
  // 2. Title starts with query
  else if (titleLower.startsWith(fullQuery)) {
    score += 80;
    matchedFields.push("title (prefix)");
  }
  // 3. Title contains all query terms
  else if (queryTerms.every((t) => titleLower.includes(t))) {
    score += 60 + queryTerms.length;
    matchedFields.push("title (all terms)");
  }
  // 4. Title contains any query term
  else if (queryTerms.some((t) => titleLower.includes(t))) {
    const matchCount = queryTerms.filter((t) => titleLower.includes(t)).length;
    score += 30 + matchCount;
    matchedFields.push("title (partial)");
  }

  // 5. Description contains all query terms
  if (queryTerms.every((t) => descLower.includes(t))) {
    score += 20 + queryTerms.length;
    matchedFields.push("description (all terms)");
  } else if (queryTerms.some((t) => descLower.includes(t))) {
    // 6. Description contains any query term
    const matchCount = queryTerms.filter((t) => descLower.includes(t)).length;
    score += 10 + matchCount;
    matchedFields.push("description (partial)");
  }

  // 7. Publisher match
  if (queryTerms.some((t) => publisherLower.includes(t))) {
    score += 5;
    matchedFields.push("publisher");
  }

  // 8. Category match
  if (queryTerms.some((t) => categoryLower.includes(t))) {
    score += 5;
    matchedFields.push("category");
  }

  // 9. Jurisdiction match
  if (queryTerms.some((t) => jurisdictionLower.includes(t))) {
    score += 5;
    matchedFields.push("jurisdiction");
  }

  // 10. Tags match — lower weight, avoids tag-stuffing
  for (const tag of tagsLower) {
    if (queryTerms.some((t) => tag.includes(t) || t.includes(tag))) {
      score += 3;
      if (!matchedFields.includes("tags")) {
        matchedFields.push("tags");
      }
    }
  }

  return { score, matchedFields };
}

// ── Search ──────────────────────────────────────────────────────────────────

/**
 * Search the static index.
 *
 * - Empty query returns no results (not all records).
 * - Results are sorted by score descending.
 * - Only active records are included.
 * - Type filter reduces the result set to matching record types.
 */
export function search(query: SearchQuery): SearchResponse {
  const startTime = performance.now();
  const index = getSearchIndex();

  // Empty query → no results (don't show everything)
  if (!query.query || query.query.trim().length === 0) {
    return {
      query: query.query,
      results: [],
      totalIndexed: index.length,
      tookMs: 0,
    };
  }

  const queryTerms = tokenize(query.query);
  if (queryTerms.length === 0) {
    return {
      query: query.query,
      results: [],
      totalIndexed: index.length,
      tookMs: 0,
    };
  }

  // Score and filter
  const scored: SearchResult[] = [];
  for (const record of index) {
    // Only active records
    if (!record.active) continue;

    // Type filter
    if (query.typeFilter && query.typeFilter.length > 0) {
      if (!query.typeFilter.includes(record.type)) continue;
    }

    const { score, matchedFields } = scoreRecord(record, queryTerms);
    if (score > 0) {
      scored.push({ record, score, matchedFields });
    }
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  const tookMs = performance.now() - startTime;

  return {
    query: query.query,
    results: scored,
    totalIndexed: index.length,
    tookMs: Math.round(tookMs * 100) / 100,
  };
}

/**
 * Quick search — returns top N results for autocomplete or inline use.
 */
export function quickSearch(query: string, limit = 5): SearchResponse {
  return {
    ...search({ query }),
    results: search({ query }).results.slice(0, limit),
  };
}
