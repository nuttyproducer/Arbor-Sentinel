// src/lib/search/fts.ts
// Full-text search query builder — wraps the search_all() PostgreSQL function.

import { supabase } from '../db/client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SearchResult {
  resultType: 'evidence' | 'source' | 'legal_case' | 'country' | 'organization';
  resultId: string;
  title: string;
  snippet: string | null;
  rank: number;
  createdAt: string;
}

export interface SearchOptions {
  types?: string[];
  limit?: number;
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function fullTextSearch(
  query: string,
  options: SearchOptions = {},
): Promise<SearchResult[]> {
  const { types = null, limit = 50 } = options;

  const { data, error } = await supabase.rpc('search_all', {
    search_query: query,
    search_types: types,
    result_limit: limit,
  });

  if (error) {
    console.error('Full-text search failed:', error.message);
    return [];
  }

  return (data as SearchResult[]) ?? [];
}

// ── Type-specific searches ────────────────────────────────────────────────────

export async function searchEvidence(query: string, limit = 20) {
  return fullTextSearch(query, { types: ['evidence'], limit });
}

export async function searchSources(query: string, limit = 20) {
  return fullTextSearch(query, { types: ['source'], limit });
}

export async function searchLegalCases(query: string, limit = 20) {
  return fullTextSearch(query, { types: ['legal_case'], limit });
}

export async function searchCountries(query: string, limit = 20) {
  return fullTextSearch(query, { types: ['country'], limit });
}

export async function searchOrganizations(query: string, limit = 20) {
  return fullTextSearch(query, { types: ['organization'], limit });
}
