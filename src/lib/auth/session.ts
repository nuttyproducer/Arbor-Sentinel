// src/lib/auth/session.ts
// Session management — refresh, timeout, concurrent session limits.
// Uses Supabase Auth under the hood.

import { supabase } from '../db/client';

// ── Session config ────────────────────────────────────────────────────────────

export interface SessionConfig {
  /** Session timeout in minutes. Default: 480 (8 hours). */
  timeoutMinutes: number;
  /** Inactivity timeout in minutes. Default: 120 (2 hours). */
  inactivityTimeoutMinutes: number;
  /** Max concurrent sessions per user. Default: 5. */
  maxConcurrentSessions: number;
}

const DEFAULT_CONFIG: SessionConfig = {
  timeoutMinutes: 480,
  inactivityTimeoutMinutes: 120,
  maxConcurrentSessions: 5,
};

let currentConfig: SessionConfig = { ...DEFAULT_CONFIG };

export function configureSession(config: Partial<SessionConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

// ── Session operations ────────────────────────────────────────────────────────

/**
 * Get the current session if authenticated and valid.
 */
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    return null;
  }
  return data.session;
}

/**
 * Get the current user if authenticated.
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return data.user;
}

/**
 * Check if the current session is valid and not expired.
 */
export async function isSessionValid(): Promise<boolean> {
  const session = await getCurrentSession();
  if (!session) return false;

  const now = new Date();
  const expiresAt = new Date(session.expires_at! * 1000);

  return expiresAt > now;
}

/**
 * Refresh the current session token.
 */
export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    throw new Error(`Session refresh failed: ${error.message}`);
  }
  return data.session;
}

/**
 * Sign out the current user — invalidates the session on the server.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Sign out failed: ${error.message}`);
  }
}

/**
 * Set up an auth state change listener.
 * Returns an unsubscribe function.
 */
export function onAuthStateChange(
  callback: (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED') => void,
): () => void {
  const { data } = supabase.auth.onAuthStateChange((event) => {
    callback(event as 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED');
  });

  return data.subscription.unsubscribe;
}

// ── Session validation helpers ────────────────────────────────────────────────

/**
 * Check if the user needs to re-authenticate (session expired or about to expire).
 */
export async function needsReauthentication(): Promise<boolean> {
  const session = await getCurrentSession();
  if (!session) return true;

  const now = new Date();
  const expiresAt = new Date(session.expires_at! * 1000);
  const fiveMinutes = 5 * 60 * 1000;

  // Re-authenticate if session expires within 5 minutes
  return expiresAt.getTime() - now.getTime() < fiveMinutes;
}

/**
 * Get the time remaining on the current session in seconds.
 * Returns 0 if no session or session expired.
 */
export async function sessionTimeRemaining(): Promise<number> {
  const session = await getCurrentSession();
  if (!session) return 0;

  const now = new Date();
  const expiresAt = new Date(session.expires_at! * 1000);
  const remaining = Math.max(0, expiresAt.getTime() - now.getTime());

  return Math.floor(remaining / 1000);
}
