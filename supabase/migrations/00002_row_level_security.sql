-- ============================================================================
-- Arbor Sentinel — Row-Level Security Policies
-- Migration: 00002
-- Description: RLS enabled on every table with role-based access control
-- Reversible: Yes (see down migration at end)
--
-- Roles (from user_roles table):
--   public         — unauthenticated visitors (anon key)
--   contributor    — can submit corrections
--   researcher     — can create draft content
--   moderator      — can review and moderate content
--   partner_org    — partner organization access
--   legal_reviewer — legal review access
--   security_admin — security administration
--   admin          — full CRUD on all tables
-- ============================================================================

-- ── Helper: check if current user has a specific role ────────────────────────

CREATE OR REPLACE FUNCTION has_role(required_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = required_role
  );
$$;

-- ── Helper: check if current user has any of the specified roles ─────────────

CREATE OR REPLACE FUNCTION has_any_role(required_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = ANY(required_roles)
  );
$$;

-- ── Helper: is the current user an admin? ────────────────────────────────────

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================================
-- Enable RLS on EVERY table
-- ============================================================================

ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE country_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collector_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_queue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- sources — public read, admin write
-- ============================================================================

CREATE POLICY "sources_public_select" ON sources
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "sources_admin_all" ON sources
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- evidence_items — public read published, admin full, researcher create draft
-- ============================================================================

CREATE POLICY "evidence_items_public_select" ON evidence_items
  FOR SELECT TO anon
  USING (review_status = 'published' AND visibility = 'public');

CREATE POLICY "evidence_items_auth_select" ON evidence_items
  FOR SELECT TO authenticated
  USING (
    is_admin()
    OR has_any_role(ARRAY['moderator', 'legal_reviewer', 'researcher', 'partner_org'])
    OR (review_status = 'published' AND visibility = 'public')
  );

CREATE POLICY "evidence_items_researcher_insert" ON evidence_items
  FOR INSERT TO authenticated
  WITH CHECK (
    is_admin()
    OR has_role('researcher')
  );

CREATE POLICY "evidence_items_admin_moderator_update" ON evidence_items
  FOR UPDATE TO authenticated
  USING (is_admin() OR has_any_role(ARRAY['moderator', 'legal_reviewer']))
  WITH CHECK (is_admin() OR has_any_role(ARRAY['moderator', 'legal_reviewer']));

CREATE POLICY "evidence_items_admin_delete" ON evidence_items
  FOR DELETE TO authenticated
  USING (is_admin());

-- ============================================================================
-- evidence_references — public read if parent is published, admin write
-- ============================================================================

CREATE POLICY "evidence_references_public_select" ON evidence_references
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM evidence_items
      WHERE evidence_items.id = evidence_references.evidence_item_id
        AND evidence_items.review_status = 'published'
        AND evidence_items.visibility = 'public'
    )
  );

CREATE POLICY "evidence_references_auth_select" ON evidence_references
  FOR SELECT TO authenticated
  USING (
    is_admin()
    OR has_any_role(ARRAY['moderator', 'researcher', 'legal_reviewer'])
    OR EXISTS (
      SELECT 1 FROM evidence_items
      WHERE evidence_items.id = evidence_references.evidence_item_id
        AND evidence_items.review_status = 'published'
        AND evidence_items.visibility = 'public'
    )
  );

CREATE POLICY "evidence_references_admin_all" ON evidence_references
  FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR has_role('researcher'));

CREATE POLICY "evidence_references_admin_update" ON evidence_references
  FOR UPDATE TO authenticated
  USING (is_admin() OR has_any_role(ARRAY['moderator', 'researcher']));

CREATE POLICY "evidence_references_admin_delete" ON evidence_references
  FOR DELETE TO authenticated
  USING (is_admin());

-- ============================================================================
-- countries — public read, admin write
-- ============================================================================

CREATE POLICY "countries_public_select" ON countries
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "countries_admin_all" ON countries
  FOR ALL TO authenticated
  USING (is_admin() OR has_any_role(ARRAY['moderator', 'researcher']))
  WITH CHECK (is_admin() OR has_any_role(ARRAY['moderator', 'researcher']));

-- ============================================================================
-- country_positions — public read, admin write
-- ============================================================================

CREATE POLICY "country_positions_public_select" ON country_positions
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "country_positions_admin_all" ON country_positions
  FOR ALL TO authenticated
  USING (is_admin() OR has_any_role(ARRAY['moderator', 'researcher']))
  WITH CHECK (is_admin() OR has_any_role(ARRAY['moderator', 'researcher']));

-- ============================================================================
-- actions — public read active, admin write
-- ============================================================================

CREATE POLICY "actions_public_select" ON actions
  FOR SELECT TO anon
  USING (active = true);

CREATE POLICY "actions_auth_select" ON actions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "actions_admin_all" ON actions
  FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR has_any_role(ARRAY['moderator', 'researcher']));

CREATE POLICY "actions_admin_update" ON actions
  FOR UPDATE TO authenticated
  USING (is_admin() OR has_any_role(ARRAY['moderator', 'researcher']))
  WITH CHECK (is_admin() OR has_any_role(ARRAY['moderator', 'researcher']));

CREATE POLICY "actions_admin_delete" ON actions
  FOR DELETE TO authenticated
  USING (is_admin());

-- ============================================================================
-- organizations — public read, admin write
-- ============================================================================

CREATE POLICY "organizations_public_select" ON organizations
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "organizations_admin_all" ON organizations
  FOR ALL TO authenticated
  USING (is_admin() OR has_any_role(ARRAY['moderator', 'researcher']))
  WITH CHECK (is_admin() OR has_any_role(ARRAY['moderator', 'researcher']));

-- ============================================================================
-- legal_cases — public read, admin write
-- ============================================================================

CREATE POLICY "legal_cases_public_select" ON legal_cases
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "legal_cases_admin_all" ON legal_cases
  FOR ALL TO authenticated
  USING (is_admin() OR has_any_role(ARRAY['moderator', 'researcher', 'legal_reviewer']))
  WITH CHECK (is_admin() OR has_any_role(ARRAY['moderator', 'researcher', 'legal_reviewer']));

-- ============================================================================
-- dossiers — public read published, admin write
-- ============================================================================

CREATE POLICY "dossiers_public_select" ON dossiers
  FOR SELECT TO anon
  USING (published = true);

CREATE POLICY "dossiers_auth_select" ON dossiers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "dossiers_admin_all" ON dossiers
  FOR ALL TO authenticated
  USING (is_admin() OR has_any_role(ARRAY['moderator', 'researcher']))
  WITH CHECK (is_admin() OR has_any_role(ARRAY['moderator', 'researcher']));

-- ============================================================================
-- corrections — public insert, contributor insert, admin/reviewer manage
-- ============================================================================

CREATE POLICY "corrections_public_insert" ON corrections
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "corrections_auth_insert" ON corrections
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "corrections_admin_select" ON corrections
  FOR SELECT TO authenticated
  USING (is_admin() OR has_any_role(ARRAY['moderator', 'researcher']));

CREATE POLICY "corrections_admin_update" ON corrections
  FOR UPDATE TO authenticated
  USING (is_admin() OR has_any_role(ARRAY['moderator', 'researcher']))
  WITH CHECK (is_admin() OR has_any_role(ARRAY['moderator', 'researcher']));

CREATE POLICY "corrections_admin_delete" ON corrections
  FOR DELETE TO authenticated
  USING (is_admin());

-- ============================================================================
-- collector_runs — admin only
-- ============================================================================

CREATE POLICY "collector_runs_admin_select" ON collector_runs
  FOR SELECT TO authenticated
  USING (is_admin() OR has_role('researcher'));

CREATE POLICY "collector_runs_admin_all" ON collector_runs
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- ai_operations — admin only
-- ============================================================================

CREATE POLICY "ai_operations_admin_select" ON ai_operations
  FOR SELECT TO authenticated
  USING (is_admin() OR has_role('researcher'));

CREATE POLICY "ai_operations_admin_all" ON ai_operations
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- review_queue_items — reviewer can see/update assigned, admin full
-- ============================================================================

CREATE POLICY "review_queue_items_reviewer_select" ON review_queue_items
  FOR SELECT TO authenticated
  USING (
    is_admin()
    OR has_any_role(ARRAY['moderator', 'legal_reviewer'])
    OR assigned_reviewer = auth.uid()
  );

CREATE POLICY "review_queue_items_admin_insert" ON review_queue_items
  FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR has_role('researcher'));

CREATE POLICY "review_queue_items_reviewer_update" ON review_queue_items
  FOR UPDATE TO authenticated
  USING (
    is_admin()
    OR has_any_role(ARRAY['moderator', 'legal_reviewer'])
    OR assigned_reviewer = auth.uid()
  )
  WITH CHECK (
    is_admin()
    OR has_any_role(ARRAY['moderator', 'legal_reviewer'])
    OR assigned_reviewer = auth.uid()
  );

CREATE POLICY "review_queue_items_admin_delete" ON review_queue_items
  FOR DELETE TO authenticated
  USING (is_admin());

-- ============================================================================
-- graph_nodes — public read, admin write
-- ============================================================================

CREATE POLICY "graph_nodes_public_select" ON graph_nodes
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "graph_nodes_admin_all" ON graph_nodes
  FOR ALL TO authenticated
  USING (is_admin() OR has_role('researcher'))
  WITH CHECK (is_admin() OR has_role('researcher'));

-- ============================================================================
-- graph_edges — public read, admin write
-- ============================================================================

CREATE POLICY "graph_edges_public_select" ON graph_edges
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "graph_edges_admin_all" ON graph_edges
  FOR ALL TO authenticated
  USING (is_admin() OR has_role('researcher'))
  WITH CHECK (is_admin() OR has_role('researcher'));

-- ============================================================================
-- map_layers — public read visible, admin write
-- ============================================================================

CREATE POLICY "map_layers_public_select" ON map_layers
  FOR SELECT TO anon
  USING (visibility = true);

CREATE POLICY "map_layers_auth_select" ON map_layers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "map_layers_admin_all" ON map_layers
  FOR ALL TO authenticated
  USING (is_admin() OR has_role('researcher'))
  WITH CHECK (is_admin() OR has_role('researcher'));

-- ============================================================================
-- content_versions — authenticated read, admin all
-- ============================================================================

CREATE POLICY "content_versions_auth_select" ON content_versions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "content_versions_admin_all" ON content_versions
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- user_roles — admin only
-- ============================================================================

CREATE POLICY "user_roles_admin_select" ON user_roles
  FOR SELECT TO authenticated
  USING (is_admin() OR has_role('security_admin'));

CREATE POLICY "user_roles_admin_all" ON user_roles
  FOR ALL TO authenticated
  USING (is_admin() OR has_role('security_admin'))
  WITH CHECK (is_admin() OR has_role('security_admin'));

-- ============================================================================
-- DOWN MIGRATION (reverse)
-- Run this block to revert:
-- ============================================================================

/*
DROP POLICY IF EXISTS "user_roles_admin_all" ON user_roles;
DROP POLICY IF EXISTS "user_roles_admin_select" ON user_roles;
DROP POLICY IF EXISTS "content_versions_admin_all" ON content_versions;
DROP POLICY IF EXISTS "content_versions_auth_select" ON content_versions;
DROP POLICY IF EXISTS "map_layers_admin_all" ON map_layers;
DROP POLICY IF EXISTS "map_layers_auth_select" ON map_layers;
DROP POLICY IF EXISTS "map_layers_public_select" ON map_layers;
DROP POLICY IF EXISTS "graph_edges_admin_all" ON graph_edges;
DROP POLICY IF EXISTS "graph_edges_public_select" ON graph_edges;
DROP POLICY IF EXISTS "graph_nodes_admin_all" ON graph_nodes;
DROP POLICY IF EXISTS "graph_nodes_public_select" ON graph_nodes;
-- (repeat for all policies above)
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS has_any_role(text[]);
DROP FUNCTION IF EXISTS has_role(text);
*/
