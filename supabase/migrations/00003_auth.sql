-- ============================================================================
-- Arbor Sentinel — Authentication Schema
-- Migration: 00003
-- Description: Auth triggers, session tracking, 2FA support tables
-- Requires: 00001_initial_schema (user_roles table must exist)
-- Reversible: Yes (see down migration at end)
-- ============================================================================

-- ── Auto-create user_role on signup ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'contributor');
  RETURN NEW;
END;
$$;

-- Trigger fires when a new user is created in auth.users
-- (Requires Supabase Auth to be configured)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- ── Session tracking ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token_hash text NOT NULL,
  ip_address text,
  user_agent text,
  is_2fa_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz
);

CREATE INDEX idx_auth_sessions_user_id ON auth_sessions (user_id);
CREATE INDEX idx_auth_sessions_token_hash ON auth_sessions (session_token_hash);
CREATE INDEX idx_auth_sessions_expires_at ON auth_sessions (expires_at);

-- ── 2FA Setup ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS two_factor_setups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  secret_encrypted text NOT NULL,      -- TOTP secret, encrypted at rest
  is_enrolled boolean NOT NULL DEFAULT false,
  enrolled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_two_factor_user_id ON two_factor_setups (user_id);

-- ── 2FA Rate Limiting ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS two_factor_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_at timestamptz NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false
);

CREATE INDEX idx_two_factor_attempts_user ON two_factor_attempts (user_id, attempt_at);

-- Helper: count failed 2FA attempts in the last 15 minutes
CREATE OR REPLACE FUNCTION recent_failed_2fa_attempts(check_user_id uuid)
RETURNS int
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COUNT(*)::int
  FROM two_factor_attempts
  WHERE user_id = check_user_id
    AND success = false
    AND attempt_at > now() - interval '15 minutes';
$$;

-- ── Audit trail for auth events ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS auth_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,   -- login, logout, 2fa_setup, 2fa_verify, 2fa_failed, role_change, session_revoked
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_auth_audit_log_user ON auth_audit_log (user_id);
CREATE INDEX idx_auth_audit_log_event ON auth_audit_log (event_type);
CREATE INDEX idx_auth_audit_log_created ON auth_audit_log (created_at);

-- ── Enable RLS on auth tables ────────────────────────────────────────────────

ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins and security_admins can read auth tables
CREATE POLICY "auth_sessions_admin_select" ON auth_sessions
  FOR SELECT TO authenticated
  USING (is_admin() OR has_role('security_admin'));

CREATE POLICY "auth_sessions_admin_all" ON auth_sessions
  FOR ALL TO authenticated
  USING (is_admin() OR has_role('security_admin'));

CREATE POLICY "two_factor_setups_admin_select" ON two_factor_setups
  FOR SELECT TO authenticated
  USING (is_admin() OR has_role('security_admin'));

CREATE POLICY "two_factor_setups_admin_all" ON two_factor_setups
  FOR ALL TO authenticated
  USING (is_admin() OR has_role('security_admin'));

CREATE POLICY "two_factor_attempts_admin_select" ON two_factor_attempts
  FOR SELECT TO authenticated
  USING (is_admin() OR has_role('security_admin'));

CREATE POLICY "auth_audit_log_admin_select" ON auth_audit_log
  FOR SELECT TO authenticated
  USING (is_admin() OR has_role('security_admin'));

CREATE POLICY "auth_audit_log_admin_all" ON auth_audit_log
  FOR ALL TO authenticated
  USING (is_admin() OR has_role('security_admin'));

-- ============================================================================
-- DOWN MIGRATION (reverse)
-- ============================================================================

/*
DROP POLICY IF EXISTS "auth_audit_log_admin_all" ON auth_audit_log;
DROP POLICY IF EXISTS "auth_audit_log_admin_select" ON auth_audit_log;
DROP POLICY IF EXISTS "two_factor_attempts_admin_select" ON two_factor_attempts;
DROP POLICY IF EXISTS "two_factor_setups_admin_all" ON two_factor_setups;
DROP POLICY IF EXISTS "two_factor_setups_admin_select" ON two_factor_setups;
DROP POLICY IF EXISTS "auth_sessions_admin_all" ON auth_sessions;
DROP POLICY IF EXISTS "auth_sessions_admin_select" ON auth_sessions;
DROP TABLE IF EXISTS auth_audit_log CASCADE;
DROP FUNCTION IF EXISTS recent_failed_2fa_attempts(uuid);
DROP TABLE IF EXISTS two_factor_attempts CASCADE;
DROP TABLE IF EXISTS two_factor_setups CASCADE;
DROP TABLE IF EXISTS auth_sessions CASCADE;
DROP FUNCTION IF EXISTS handle_new_user();
*/
