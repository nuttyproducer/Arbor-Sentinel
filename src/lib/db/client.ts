// src/lib/db/client.ts
// Supabase client initialization for the Arbor Sentinel.
// - Browser client: uses anon key, safe for frontend (respects RLS)
// - Admin client: uses service_role key, SERVER-SIDE ONLY (bypasses RLS)
//
// IMPORTANT: Never import supabaseAdmin in browser bundles.
// The admin client is guarded by a runtime check and should only be used
// in edge functions or server-side scripts.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// ── Environment validation ────────────────────────────────────────────────────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    // In test environments, return a placeholder — tests should mock supabase
    if (typeof process !== 'undefined' && process.env?.VITEST) {
      return `mock-${name}`;
    }
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Set it in .env or your deployment configuration.`
    );
  }
  return value;
}

// ── Browser client (safe for frontend — respects RLS) ─────────────────────────

let _supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    const url = requireEnv('VITE_SUPABASE_URL', SUPABASE_URL);
    const key = requireEnv('VITE_SUPABASE_ANON_KEY', SUPABASE_ANON_KEY);

    _supabase = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      db: {
        schema: 'public',
      },
    });
  }
  return _supabase;
}

/** Convenience alias — primary client for most operations. */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseClient() as Record<string | symbol, unknown>)[prop];
  },
});

// ── Admin client (server-side only — bypasses RLS) ────────────────────────────

let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient {
  // Runtime guard: never expose the service role key in browser bundles
  if (typeof window !== 'undefined') {
    throw new Error(
      'supabaseAdmin cannot be used in browser bundles. ' +
      'Use the regular supabase client instead — it respects RLS policies.'
    );
  }

  if (!_supabaseAdmin) {
    const url = requireEnv('VITE_SUPABASE_URL', SUPABASE_URL);
    const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY', SUPABASE_SERVICE_ROLE_KEY);

    _supabaseAdmin = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
    });
  }
  return _supabaseAdmin;
}

/** Server-side admin client — bypasses RLS. ONLY for edge functions/scripts. */
export const supabaseAdmin = typeof window === 'undefined'
  ? getSupabaseAdminClient()
  : (null as unknown as SupabaseClient);

// ── Typed table helpers ───────────────────────────────────────────────────────

/**
 * Get a typed Supabase query builder for a table.
 * Usage: db('sources').select('*').eq('type', 'court')
 */
export function db<T = Record<string, unknown>>(table: string) {
  return supabase.from(table);
}

/**
 * Get a typed admin query builder for a table (server-side only).
 */
export function dbAdmin<T = Record<string, unknown>>(table: string) {
  if (typeof window !== 'undefined') {
    throw new Error('dbAdmin cannot be used in browser bundles.');
  }
  return supabaseAdmin.from(table);
}
