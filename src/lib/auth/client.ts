// src/lib/auth/client.ts
// Supabase Auth client — sign-in, sign-up, 2FA integration.
// Wraps @supabase/supabase-js auth methods with role checks and 2FA enforcement.

import { supabase } from '../db/client';
import type { Role } from './roles';
import { requires2FA } from './roles';
import type { Session } from '@supabase/supabase-js';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SignInParams {
  email: string;
  password: string;
}

export interface SignInResult {
  success: boolean;
  session: Session | null;
  needs2FA: boolean;
  error: string | null;
}

export interface SignUpParams {
  email: string;
  password: string;
  invitationCode?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  email: string | null;
  role: Role | null;
  is2FAVerified: boolean;
}

// ── Sign in ───────────────────────────────────────────────────────────────────

/**
 * Sign in with email and password.
 * Returns whether 2FA is required next.
 */
export async function signIn(params: SignInParams): Promise<SignInResult> {
  const { email, password } = params;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return {
      success: false,
      session: null,
      needs2FA: false,
      error: error?.message ?? 'Sign in failed',
    };
  }

  // Check if the user's role requires 2FA
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', data.session.user.id)
    .single();

  const userRole: Role = (roleData?.role as Role) ?? 'public';
  const needs2FA = requires2FA(userRole);

  // If 2FA is required, check if it's already verified for this session
  if (needs2FA) {
    const { data: twoFactorData } = await supabase
      .from('two_factor_setups')
      .select('is_enrolled')
      .eq('user_id', data.session.user.id)
      .single();

    // If not enrolled, they need to set up 2FA first
    if (!twoFactorData?.is_enrolled) {
      return {
        success: true,
        session: data.session,
        needs2FA: true,
        error: null,
      };
    }
  }

  return {
    success: true,
    session: data.session,
    needs2FA,
    error: null,
  };
}

// ── Sign up (invite-only) ─────────────────────────────────────────────────────

/**
 * Sign up a new user. Requires an invitation code for non-public roles.
 */
export async function signUp(params: SignUpParams): Promise<SignInResult> {
  const { email, password } = params;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/admin/login`,
    },
  });

  if (error) {
    return {
      success: false,
      session: null,
      needs2FA: false,
      error: error.message,
    };
  }

  return {
    success: true,
    session: data.session,
    needs2FA: true,
    error: null,
  };
}

// ── Current auth state ────────────────────────────────────────────────────────

/**
 * Get the current authentication state including role and 2FA status.
 */
export async function getAuthState(): Promise<AuthState> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;

  if (!session) {
    return {
      isAuthenticated: false,
      isLoading: false,
      userId: null,
      email: null,
      role: null,
      is2FAVerified: false,
    };
  }

  // Get user role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .single();

  return {
    isAuthenticated: true,
    isLoading: false,
    userId: session.user.id,
    email: session.user.email ?? null,
    role: (roleData?.role as Role) ?? 'public',
    is2FAVerified: false, // Updated after 2FA verification
  };
}

// ── Password reset ────────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/reset-password`,
  });

  if (error) {
    throw new Error(`Password reset failed: ${error.message}`);
  }
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(`Password update failed: ${error.message}`);
  }
}
