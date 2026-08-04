-- ============================================================================
-- Accountability Atlas — Audit Logging
-- Migration: 00006
-- Description: Comprehensive audit log table with automatic triggers on all CRUD
-- Reversible: Yes
-- ============================================================================

-- ── Audit log table ───────────────────────────────────────────────────────────

CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,              -- auth.uid() of the user who performed the action
  actor_role text,             -- role at the time of the action
  action text NOT NULL,         -- 'create', 'read', 'update', 'delete', 'restore'
  target_type text NOT NULL,    -- table name: 'evidence_items', 'sources', etc.
  target_id uuid NOT NULL,      -- PK of the affected row
  diff jsonb,                   -- before/after for updates; created data for inserts
  request_id text,              -- correlation ID for tracing
  ip_address text,              -- admin only
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_actor ON audit_log (actor_id);
CREATE INDEX idx_audit_log_action ON audit_log (action);
CREATE INDEX idx_audit_log_target ON audit_log (target_type, target_id);
CREATE INDEX idx_audit_log_created ON audit_log (created_at);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins and security_admins can view audit logs
CREATE POLICY "audit_log_admin_select" ON audit_log
  FOR SELECT TO authenticated
  USING (is_admin() OR has_role('security_admin'));

CREATE POLICY "audit_log_admin_all" ON audit_log
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── Audit trigger function ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  audit_action text;
  audit_diff jsonb;
  target_id_val uuid;
BEGIN
  -- Determine action
  IF TG_OP = 'INSERT' THEN
    audit_action := 'create';
    audit_diff := to_jsonb(NEW);
    target_id_val := NEW.id;
  ELSIF TG_OP = 'UPDATE' THEN
    audit_action := 'update';
    audit_diff := jsonb_build_object(
      'before', to_jsonb(OLD),
      'after', to_jsonb(NEW)
    );
    target_id_val := NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    audit_action := 'delete';
    audit_diff := to_jsonb(OLD);
    target_id_val := OLD.id;
  ELSE
    RETURN NULL;
  END IF;

  -- Insert audit record
  INSERT INTO audit_log (
    actor_id,
    actor_role,
    action,
    target_type,
    target_id,
    diff,
    ip_address
  ) VALUES (
    auth.uid(),
    user_role(),
    audit_action,
    TG_TABLE_NAME,
    target_id_val,
    audit_diff,
    NULL -- ip_address populated by application layer for security
  );

  RETURN NULL; -- AFTER trigger, result is ignored
END;
$$;

-- ── Apply audit triggers to all content tables ────────────────────────────────

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'sources',
      'evidence_items',
      'evidence_references',
      'countries',
      'country_positions',
      'actions',
      'organizations',
      'legal_cases',
      'dossiers',
      'corrections',
      'collector_runs',
      'ai_operations',
      'review_queue_items',
      'graph_nodes',
      'graph_edges',
      'map_layers',
      'content_versions',
      'user_roles'
    ])
  LOOP
    -- Drop existing triggers to avoid duplicates
    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_%s ON %I', tbl, tbl);
    EXECUTE format('
      CREATE TRIGGER trg_audit_%s
        AFTER INSERT OR UPDATE OR DELETE ON %I
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function()
    ', tbl, tbl);
  END LOOP;
END $$;

-- ============================================================================
-- DOWN MIGRATION
-- ============================================================================

/*
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'sources','evidence_items','evidence_references','countries','country_positions',
    'actions','organizations','legal_cases','dossiers','corrections','collector_runs',
    'ai_operations','review_queue_items','graph_nodes','graph_edges','map_layers',
    'content_versions','user_roles'
  ]) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_%s ON %I', tbl, tbl);
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS audit_trigger_function();
DROP POLICY IF EXISTS "audit_log_admin_all" ON audit_log;
DROP POLICY IF EXISTS "audit_log_admin_select" ON audit_log;
DROP TABLE IF EXISTS audit_log CASCADE;
*/
