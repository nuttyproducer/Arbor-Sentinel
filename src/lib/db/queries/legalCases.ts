// src/lib/db/queries/legalCases.ts
// Legal case queries — typed database access for the legal_cases table.

import { supabase } from '../client';
import type { LegalCaseRecord, QueryListResult, QueryResult } from '../types';

// ── List ──────────────────────────────────────────────────────────────────────

export interface LegalCaseListParams {
  page?: number;
  perPage?: number;
  institution?: string;
  jurisdiction?: string;
  status?: string;
  search?: string;
  sortBy?: 'title' | 'institution' | 'opened_date' | 'status' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export async function getAllLegalCases(
  params: LegalCaseListParams = {},
): Promise<QueryListResult<LegalCaseRecord>> {
  const {
    page = 1,
    perPage = 20,
    institution,
    jurisdiction,
    status,
    search,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params;

  const offset = (page - 1) * perPage;

  let query = supabase
    .from('legal_cases')
    .select('*', { count: 'exact' });

  if (institution) query = query.eq('institution', institution);
  if (jurisdiction) query = query.eq('jurisdiction', jurisdiction);
  if (status) query = query.eq('status', status);
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,summary.ilike.%${search}%`,
    );
  }

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + perPage - 1);

  if (error) {
    return { data: [], count: 0, error: error.message };
  }

  return { data: data as LegalCaseRecord[], count: count ?? 0, error: null };
}

// ── Get by ID ─────────────────────────────────────────────────────────────────

export async function getLegalCaseById(id: string): Promise<QueryResult<LegalCaseRecord>> {
  const { data, error } = await supabase
    .from('legal_cases')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as LegalCaseRecord, error: null };
}

// ── Get by institution ────────────────────────────────────────────────────────

export async function getLegalCasesByInstitution(
  institution: string,
  limit = 50,
): Promise<QueryListResult<LegalCaseRecord>> {
  const { data, error, count } = await supabase
    .from('legal_cases')
    .select('*', { count: 'exact' })
    .eq('institution', institution)
    .order('opened_date', { ascending: false })
    .limit(limit);

  if (error) {
    return { data: [], count: 0, error: error.message };
  }

  return { data: data as LegalCaseRecord[], count: count ?? 0, error: null };
}
