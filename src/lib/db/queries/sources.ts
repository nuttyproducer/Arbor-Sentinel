// src/lib/db/queries/sources.ts
// Source registry queries — typed database access for the sources table.

import { supabase } from '../client';
import type { SourceRecord, QueryListResult, QueryResult } from '../types';

// ── List ──────────────────────────────────────────────────────────────────────

export interface SourceListParams {
  page?: number;
  perPage?: number;
  type?: string;
  country?: string;
  search?: string;
  sortBy?: 'name' | 'type' | 'country' | 'credibility_tier' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export async function getAllSources(
  params: SourceListParams = {},
): Promise<QueryListResult<SourceRecord>> {
  const {
    page = 1,
    perPage = 20,
    type,
    country,
    search,
    sortBy = 'name',
    sortOrder = 'asc',
  } = params;

  const offset = (page - 1) * perPage;

  let query = supabase
    .from('sources')
    .select('*', { count: 'exact' });

  if (type) query = query.eq('type', type);
  if (country) query = query.eq('country', country);
  if (search) query = query.or(`name.ilike.%${search}%,notes.ilike.%${search}%`);

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + perPage - 1);

  if (error) {
    return { data: [], count: 0, error: error.message };
  }

  return { data: data as SourceRecord[], count: count ?? 0, error: null };
}

// ── Get by ID ─────────────────────────────────────────────────────────────────

export async function getSourceById(id: string): Promise<QueryResult<SourceRecord>> {
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as SourceRecord, error: null };
}

// ── Get by type ───────────────────────────────────────────────────────────────

export async function getSourcesByType(
  type: string,
  limit = 50,
): Promise<QueryListResult<SourceRecord>> {
  const { data, error, count } = await supabase
    .from('sources')
    .select('*', { count: 'exact' })
    .eq('type', type)
    .order('name')
    .limit(limit);

  if (error) {
    return { data: [], count: 0, error: error.message };
  }

  return { data: data as SourceRecord[], count: count ?? 0, error: null };
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function searchSources(
  query: string,
  limit = 20,
): Promise<QueryListResult<SourceRecord>> {
  const { data, error, count } = await supabase
    .from('sources')
    .select('*', { count: 'exact' })
    .or(`name.ilike.%${query}%,notes.ilike.%${query}%`)
    .order('name')
    .limit(limit);

  if (error) {
    return { data: [], count: 0, error: error.message };
  }

  return { data: data as SourceRecord[], count: count ?? 0, error: null };
}
