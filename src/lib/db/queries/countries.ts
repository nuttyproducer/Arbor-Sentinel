// src/lib/db/queries/countries.ts
// Country queries — typed database access for countries and country_positions.

import { supabase } from '../client';
import type {
  CountryRecord,
  CountryPositionRecord,
  QueryListResult,
  QueryResult,
} from '../types';

// ── Countries ─────────────────────────────────────────────────────────────────

export interface CountryListParams {
  page?: number;
  perPage?: number;
  region?: string;
  euMember?: boolean;
  search?: string;
  sortBy?: 'name' | 'region' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export async function getAllCountries(
  params: CountryListParams = {},
): Promise<QueryListResult<CountryRecord>> {
  const {
    page = 1,
    perPage = 50,
    region,
    euMember,
    search,
    sortBy = 'name',
    sortOrder = 'asc',
  } = params;

  const offset = (page - 1) * perPage;

  let query = supabase
    .from('countries')
    .select('*', { count: 'exact' });

  if (region) query = query.eq('region', region);
  if (euMember !== undefined) query = query.eq('eu_member', euMember);
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + perPage - 1);

  if (error) {
    return { data: [], count: 0, error: error.message };
  }

  return { data: data as CountryRecord[], count: count ?? 0, error: null };
}

export async function getCountryBySlug(
  slug: string,
): Promise<QueryResult<CountryRecord>> {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as CountryRecord, error: null };
}

// ── Country Positions ─────────────────────────────────────────────────────────

export async function getCountryPositions(
  countryId: string,
): Promise<QueryListResult<CountryPositionRecord>> {
  const { data, error, count } = await supabase
    .from('country_positions')
    .select('*', { count: 'exact' })
    .eq('country_id', countryId)
    .order('issue');

  if (error) {
    return { data: [], count: 0, error: error.message };
  }

  return { data: data as CountryPositionRecord[], count: count ?? 0, error: null };
}

export async function getCountryWithPositions(
  slug: string,
): Promise<QueryResult<CountryRecord & { positions: CountryPositionRecord[] }>> {
  const countryResult = await getCountryBySlug(slug);
  if (countryResult.error || !countryResult.data) {
    return { data: null, error: countryResult.error };
  }

  const positionsResult = await getCountryPositions(countryResult.data.id);

  return {
    data: { ...countryResult.data, positions: positionsResult.data },
    error: positionsResult.error,
  };
}
