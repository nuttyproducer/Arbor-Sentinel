// src/lib/db/queries/organizations.ts
// Organization queries — typed database access for the organizations table.

import { supabase } from '../client';
import type { OrganizationRecord, QueryListResult, QueryResult } from '../types';

// ── List ──────────────────────────────────────────────────────────────────────

export interface OrganizationListParams {
  page?: number;
  perPage?: number;
  type?: string;
  region?: string;
  partnershipStatus?: string;
  search?: string;
  sortBy?: 'name' | 'type' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export async function getAllOrganizations(
  params: OrganizationListParams = {},
): Promise<QueryListResult<OrganizationRecord>> {
  const {
    page = 1,
    perPage = 20,
    type,
    region,
    partnershipStatus,
    search,
    sortBy = 'name',
    sortOrder = 'asc',
  } = params;

  const offset = (page - 1) * perPage;

  let query = supabase
    .from('organizations')
    .select('*', { count: 'exact' });

  if (type) query = query.eq('type', type);
  if (region) query = query.contains('regions', [region]);
  if (partnershipStatus) query = query.eq('partnership_status', partnershipStatus);
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + perPage - 1);

  if (error) {
    return { data: [], count: 0, error: error.message };
  }

  return { data: data as OrganizationRecord[], count: count ?? 0, error: null };
}

// ── Get by slug ───────────────────────────────────────────────────────────────

export async function getOrganizationBySlug(
  slug: string,
): Promise<QueryResult<OrganizationRecord>> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as OrganizationRecord, error: null };
}

// ── Get by type ───────────────────────────────────────────────────────────────

export async function getOrganizationsByType(
  type: string,
  limit = 50,
): Promise<QueryListResult<OrganizationRecord>> {
  const { data, error, count } = await supabase
    .from('organizations')
    .select('*', { count: 'exact' })
    .eq('type', type)
    .order('name')
    .limit(limit);

  if (error) {
    return { data: [], count: 0, error: error.message };
  }

  return { data: data as OrganizationRecord[], count: count ?? 0, error: null };
}
