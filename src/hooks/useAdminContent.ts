// src/hooks/useAdminContent.ts
// Admin content CRUD hook — unified data access for all content types.
// Uses the Supabase query modules for typed database access.

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/db/client';

export type ContentType =
  | 'sources'
  | 'evidence_items'
  | 'countries'
  | 'country_positions'
  | 'actions'
  | 'organizations'
  | 'legal_cases'
  | 'dossiers'
  | 'corrections';

interface UseAdminContentOptions {
  contentType: ContentType;
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UseAdminContentResult<T> {
  data: T[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  create: (record: Partial<T>) => Promise<T | null>;
  update: (id: string, record: Partial<T>) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
}

export function useAdminContent<T extends { id: string }>(
  options: UseAdminContentOptions,
): UseAdminContentResult<T> {
  const { contentType, page = 1, perPage = 20, search, status, sortBy = 'created_at', sortOrder = 'desc' } = options;

  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = useCallback(() => setRefetchTrigger((n) => n + 1), []);

  // Fetch data
  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      setIsLoading(true);
      setError(null);
    });

    async function fetchData() {
      const offset = (page - 1) * perPage;

      let query = supabase
        .from(contentType)
        .select('*', { count: 'exact' });

      if (status) {
        const statusCol = contentType === 'dossiers' ? 'published' :
          contentType === 'evidence_items' ? 'review_status' : 'status';
        if (statusCol === 'published') {
          query = query.eq(statusCol, status === 'published');
        } else {
          query = query.eq(statusCol, status);
        }
      }

      if (search) {
        const searchCol = contentType === 'sources' ? 'name' : 'title';
        query = query.ilike(searchCol, `%${search}%`);
      }

      const { data: rows, error: err, count } = await query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + perPage - 1);

      if (cancelled) return;

      if (err) {
        setError(err.message);
        setData([]);
        setTotal(0);
      } else {
        setData((rows as T[]) ?? []);
        setTotal(count ?? 0);
      }
      setIsLoading(false);
    }

    fetchData();
    return () => { cancelled = true; };
  }, [contentType, page, perPage, search, status, sortBy, sortOrder, refetchTrigger]);

  // Create
  const create = useCallback(async (record: Partial<T>): Promise<T | null> => {
    const { data: created, error: err } = await supabase
      .from(contentType)
      .insert(record as Record<string, unknown>)
      .select()
      .single();

    if (err) {
      setError(err.message);
      return null;
    }
    refetch();
    return created as T;
  }, [contentType, refetch]);

  // Update
  const update = useCallback(async (id: string, record: Partial<T>): Promise<T | null> => {
    const { data: updated, error: err } = await supabase
      .from(contentType)
      .update(record as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single();

    if (err) {
      setError(err.message);
      return null;
    }
    refetch();
    return updated as T;
  }, [contentType, refetch]);

  // Soft delete
  const remove = useCallback(async (id: string): Promise<boolean> => {
    // For evidence_items, set review_status to archived
    if (contentType === 'evidence_items') {
      const { error: err } = await supabase
        .from(contentType)
        .update({ review_status: 'archived' })
        .eq('id', id);
      if (err) { setError(err.message); return false; }
    } else {
      const { error: err } = await supabase
        .from(contentType)
        .delete()
        .eq('id', id);
      if (err) { setError(err.message); return false; }
    }
    refetch();
    return true;
  }, [contentType, refetch]);

  return { data, total, isLoading, error, refetch, create, update, remove };
}
