// src/lib/db/queries/actions.ts
// Action queries — typed database access for the actions table.

import { supabase } from '../client';
import type { ActionRecord, QueryListResult, QueryResult } from '../types';

// ── List ──────────────────────────────────────────────────────────────────────

export interface ActionListParams {
  page?: number;
  perPage?: number;
  countryId?: string;
  issue?: string;
  actionType?: string;
  activeOnly?: boolean;
  search?: string;
  sortBy?: 'title' | 'issue' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export async function getActions(
  params: ActionListParams = {},
): Promise<QueryListResult<ActionRecord>> {
  const {
    page = 1,
    perPage = 20,
    countryId,
    issue,
    actionType,
    activeOnly = true,
    search,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params;

  const offset = (page - 1) * perPage;

  let query = supabase
    .from('actions')
    .select('*', { count: 'exact' });

  if (activeOnly) query = query.eq('active', true);
  if (countryId) query = query.eq('country_id', countryId);
  if (issue) query = query.eq('issue', issue);
  if (actionType) query = query.eq('action_type', actionType);
  if (search) query = query.ilike('title', `%${search}%`);

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + perPage - 1);

  if (error) {
    return { data: [], count: 0, error: error.message };
  }

  return { data: data as ActionRecord[], count: count ?? 0, error: null };
}

// ── Get by slug ───────────────────────────────────────────────────────────────

export async function getActionBySlug(
  slug: string,
): Promise<QueryResult<ActionRecord>> {
  const { data, error } = await supabase
    .from('actions')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as ActionRecord, error: null };
}

// ── Get by country ────────────────────────────────────────────────────────────

export async function getActionsByCountry(
  countryId: string,
  limit = 50,
): Promise<QueryListResult<ActionRecord>> {
  const { data, error, count } = await supabase
    .from('actions')
    .select('*', { count: 'exact' })
    .eq('country_id', countryId)
    .eq('active', true)
    .order('title')
    .limit(limit);

  if (error) {
    return { data: [], count: 0, error: error.message };
  }

  return { data: data as ActionRecord[], count: count ?? 0, error: null };
}

// ── Get by issue ──────────────────────────────────────────────────────────────

export async function getActionsByIssue(
  issue: string,
  limit = 50,
): Promise<QueryListResult<ActionRecord>> {
  const { data, error, count } = await supabase
    .from('actions')
    .select('*', { count: 'exact' })
    .eq('issue', issue)
    .eq('active', true)
    .order('title')
    .limit(limit);

  if (error) {
    return { data: [], count: 0, error: error.message };
  }

  return { data: data as ActionRecord[], count: count ?? 0, error: null };
}
