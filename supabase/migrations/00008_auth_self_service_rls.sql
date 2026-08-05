-- ============================================================================
-- Arbor Sentinel — Auth Self-Service RLS Policies
-- Migration: 00008
-- Description: Add self-service RLS policies for auth flow
--   - user_roles: users can read their own role
--   - two_factor_setups: users can manage their own 2FA setup
--   - two_factor_attempts: users can insert and read their own attempts (rate limiting)
-- Reversible: Yes (see down migration at end)
-- ============================================================================

-- ── user_roles — self-read ──────────────────────────────────────────────────
-- Users must be able to read their own role for client-side auth checks.
-- Previous policy only allowed admin/security_admin to read any user_roles.

CREATE POLICY "user_roles_self_select" ON user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ── two_factor_setups — self-service ────────────────────────────────────────
-- Users need to insert their own 2FA setup and read it back during enrollment.

CREATE POLICY "two_factor_setups_self_select" ON two_factor_setups
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "two_factor_setups_self_insert" ON two_factor_setups
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "two_factor_setups_self_update" ON two_factor_setups
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── two_factor_attempts — self-service ──────────────────────────────────────
-- Users must be able to insert their own 2FA attempts (for rate-limit logging)
-- and read their own attempts (for the rate-limiting function to work).

CREATE POLICY "two_factor_attempts_self_select" ON two_factor_attempts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "two_factor_attempts_self_insert" ON two_factor_attempts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- DOWN MIGRATION (reverse)
-- ============================================================================

/*
DROP POLICY IF EXISTS "two_factor_attempts_self_insert" ON two_factor_attempts;
DROP POLICY IF EXISTS "two_factor_attempts_self_select" ON two_factor_attempts;
DROP POLICY IF EXISTS "two_factor_setups_self_update" ON two_factor_setups;
DROP POLICY IF EXISTS "two_factor_setups_self_insert" ON two_factor_setups;
DROP POLICY IF EXISTS "two_factor_setups_self_select" ON two_factor_setups;
DROP POLICY IF EXISTS "user_roles_self_select" ON user_roles;
*/
