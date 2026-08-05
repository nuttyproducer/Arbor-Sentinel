-- ============================================================================
-- Arbor Sentinel — Admin Bootstrap
-- Migration: 00009
-- Description: Helper function to promote the first admin user.
--   Run manually in Supabase SQL Editor after creating your user account:
--     SELECT bootstrap_admin('<your-auth-user-id>');
--   Find your user ID: SELECT id FROM auth.users WHERE email = '<your-email>';
-- Reversible: Yes (see down migration at end)
-- ============================================================================

-- ── Admin bootstrap function ─────────────────────────────────────────────────
-- Promotes a user to admin role. SECURITY DEFINER so it can write to user_roles
-- even before any admin exists.

CREATE OR REPLACE FUNCTION bootstrap_admin(target_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN 'User ' || target_user_id || ' promoted to admin.';
END;
$$;

-- ============================================================================
-- DOWN MIGRATION (reverse)
-- ============================================================================

/*
DROP FUNCTION IF EXISTS bootstrap_admin(uuid);
*/
