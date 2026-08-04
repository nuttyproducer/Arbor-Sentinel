// src/lib/db/queries/evidence.ts
// Evidence item queries — typed database access for the evidence_items table.

import { supabase } from '../client';
import type { EvidenceItemRecord, QueryListResult, QueryResult } from '../types';

// ── List params ───────────────────────────────────────────────────────────────

export interface EvidenceListParams {
  page?: number;
  perPage?: number;
  category?: string;
  country?: string;
  verificationLevel?: number;
  reviewStatus?: string;
  search?: string;
  sortBy?: 'title' | 'category' | 'incident_date' | 'verification_level' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// ── List (paginated, filtered) ────────────────────────────────────────────────

export async function getEvidenceList(
  params: EvidenceListParams = {},
): Promise<QueryListResult<EvidenceItemRecord>> {
  const {
    page = 1,
    perPage = 20,
    category,
    country,
    verificationLevel,
    reviewStatus,
    search,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params;

  const offset = (page - 1) * perPage;

  let query = supabase
    .from('evidence_items')
    .select('*', { count: 'exact' })
    .eq('review_status', 'published')
    .eq('visibility', 'public');

  if (category) query = query.eq('category', category);
  if (country) query = query.eq('country_or_territory', country);
  if (verificationLevel !== undefined) query = query.eq('verification_level', verificationLevel);
  if (reviewStatus) query = query.eq('review_status', reviewStatus);
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,summary.ilike.%${search}%,body.ilike.%${search}%`,
    );
  }

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + perPage - 1);

  if (error) {
    return { data: [], count: 0, error: error.message };
  }

  return { data: data as EvidenceItemRecord[], count: count ?? 0, error: null };
}

// ── Get by slug ───────────────────────────────────────────────────────────────

export async function getEvidenceBySlug(
  slug: string,
): Promise<QueryResult<EvidenceItemRecord>> {
  const { data, error } = await supabase
    .from('evidence_items')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as EvidenceItemRecord, error: null };
}

// ── Get by country ────────────────────────────────────────────────────────────

export async function getEvidenceByCountry(
  country: string,
  limit = 50,
): Promise<QueryListResult<EvidenceItemRecord>> {
  const { data, error, count } = await supabase
    .from('evidence_items')
    .select('*', { count: 'exact' })
    .eq('country_or_territory', country)
    .eq('review_status', 'published')
    .eq('visibility', 'public')
    .order('incident_date', { ascending: false })
    .limit(limit);

  if (error) {
    return { data: [], count: 0, error: error.message };
  }

  return { data: data as EvidenceItemRecord[], count: count ?? 0, error: null };
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function searchEvidence(
  query: string,
  limit = 20,
): Promise<QueryListResult<EvidenceItemRecord>> {
  const { data, error, count } = await supabase
    .from('evidence_items')
    .select('*', { count: 'exact' })
    .eq('review_status', 'published')
    .eq('visibility', 'public')
    .or(`title.ilike.%${query}%,summary.ilike.%${query}%,body.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { data: [], count: 0, error: error.message };
  }

  return { data: data as EvidenceItemRecord[], count: count ?? 0, error: null };
}
