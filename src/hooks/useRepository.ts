import { useMemo } from 'react';
import type { ContentRepository } from '../lib/repository/types';
import { StaticRepository } from '../lib/repository/StaticRepository';
import { SupabaseRepository } from '../lib/repository/SupabaseRepository';

let instance: ContentRepository | null = null;

function getRepositoryInstance(): ContentRepository {
  if (!instance) {
    const mode = import.meta.env.VITE_DATA_MODE ?? 'static';
    instance = mode === 'live'
      ? new SupabaseRepository()
      : new StaticRepository();
  }
  return instance;
}

export function useRepository(): ContentRepository {
  return useMemo(() => getRepositoryInstance(), []);
}
