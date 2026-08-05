import { useMemo } from 'react';
import type { ContentRepository } from '../lib/repository/types';
import { StaticRepository } from '../lib/repository/StaticRepository';
import { SupabaseRepository } from '../lib/repository/SupabaseRepository';

let instance: ContentRepository | null = null;

function createRepository(): ContentRepository {
  const mode = import.meta.env.VITE_DATA_MODE ?? 'static';
  return mode === 'live'
    ? new SupabaseRepository()
    : new StaticRepository();
}

export function useRepository(): ContentRepository {
  return useMemo(() => {
    if (!instance) instance = createRepository();
    return instance;
  }, []);
}
