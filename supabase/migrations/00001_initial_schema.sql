-- ============================================================================
-- Arbor Sentinel — Initial Schema
-- Migration: 00001
-- Description: Core tables from PRD Section 16 + M4 Intelligence Layer additions
-- Reversible: Yes (see down migration at end)
-- ============================================================================

-- ── Extensions ────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ── Auto-update trigger function ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PRD Section 16 Tables
-- ============================================================================

-- ── 16.1 sources ─────────────────────────────────────────────────────────────

CREATE TABLE sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  url text,
  country text,
  credibility_tier int,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_sources_updated_at
  BEFORE UPDATE ON sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_sources_type ON sources (type);
CREATE INDEX idx_sources_country ON sources (country);
CREATE INDEX idx_sources_credibility_tier ON sources (credibility_tier);

-- ── 16.2 evidence_items ──────────────────────────────────────────────────────

CREATE TABLE evidence_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  summary text NOT NULL,
  body text,
  category text NOT NULL,
  incident_date timestamp,
  publication_date date,
  location_name text,
  country_or_territory text,
  lat numeric(10,6),
  lng numeric(10,6),
  location_precision text,
  verification_level int NOT NULL DEFAULT 0,
  source_id uuid REFERENCES sources(id) ON DELETE SET NULL,
  legal_tags text[] DEFAULT '{}',
  humanitarian_tags text[] DEFAULT '{}',
  visibility text NOT NULL DEFAULT 'draft',
  review_status text NOT NULL DEFAULT 'draft',
  created_by uuid,
  reviewed_by uuid,
  last_reviewed_at timestamptz,
  version int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_evidence_items_updated_at
  BEFORE UPDATE ON evidence_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE UNIQUE INDEX idx_evidence_items_slug ON evidence_items (slug);
CREATE INDEX idx_evidence_items_category ON evidence_items (category);
CREATE INDEX idx_evidence_items_review_status ON evidence_items (review_status);
CREATE INDEX idx_evidence_items_visibility ON evidence_items (visibility);
CREATE INDEX idx_evidence_items_country ON evidence_items (country_or_territory);
CREATE INDEX idx_evidence_items_source_id ON evidence_items (source_id);
CREATE INDEX idx_evidence_items_created_at ON evidence_items (created_at);
CREATE INDEX idx_evidence_items_legal_tags ON evidence_items USING GIN (legal_tags);
CREATE INDEX idx_evidence_items_humanitarian_tags ON evidence_items USING GIN (humanitarian_tags);

-- ── 16.3 evidence_references ─────────────────────────────────────────────────

CREATE TABLE evidence_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_item_id uuid NOT NULL REFERENCES evidence_items(id) ON DELETE CASCADE,
  source_id uuid REFERENCES sources(id) ON DELETE SET NULL,
  url text,
  archive_url text,
  quote_excerpt text,
  reference_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_evidence_refs_item_id ON evidence_references (evidence_item_id);
CREATE INDEX idx_evidence_refs_source_id ON evidence_references (source_id);

-- ── 16.4 countries ───────────────────────────────────────────────────────────

CREATE TABLE countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  iso_code text UNIQUE,
  region text,
  eu_member boolean NOT NULL DEFAULT false,
  nato_member boolean NOT NULL DEFAULT false,
  slug text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_countries_updated_at
  BEFORE UPDATE ON countries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_countries_region ON countries (region);
CREATE INDEX idx_countries_slug ON countries (slug);

-- ── 16.5 country_positions ───────────────────────────────────────────────────

CREATE TABLE country_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  issue text NOT NULL,
  position_summary text,
  score int,
  source_url text,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_country_positions_updated_at
  BEFORE UPDATE ON country_positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_country_positions_country_id ON country_positions (country_id);
CREATE INDEX idx_country_positions_issue ON country_positions (issue);

-- ── 16.6 actions ─────────────────────────────────────────────────────────────

CREATE TABLE actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid REFERENCES countries(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  action_type text,
  issue text,
  template_body text,
  language text,
  recipient_type text,
  recipient_name text,
  recipient_url text,
  source_notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_actions_updated_at
  BEFORE UPDATE ON actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_actions_country_id ON actions (country_id);
CREATE INDEX idx_actions_slug ON actions (slug);
CREATE INDEX idx_actions_active ON actions (active);
CREATE INDEX idx_actions_issue ON actions (issue);

-- ── 16.7 organizations ───────────────────────────────────────────────────────

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  type text,
  website text,
  official_donation_url text,
  regions text[] DEFAULT '{}',
  services text[] DEFAULT '{}',
  partnership_status text,
  verification_document_url text,
  last_verified_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_organizations_slug ON organizations (slug);
CREATE INDEX idx_organizations_type ON organizations (type);
CREATE INDEX idx_organizations_regions ON organizations USING GIN (regions);
CREATE INDEX idx_organizations_services ON organizations USING GIN (services);

-- ── 16.8 legal_cases ─────────────────────────────────────────────────────────

CREATE TABLE legal_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  institution text,
  jurisdiction text,
  status text,
  summary text,
  opened_date date,
  latest_update_date date,
  source_url text,
  action_relevance text,
  last_reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_legal_cases_updated_at
  BEFORE UPDATE ON legal_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_legal_cases_institution ON legal_cases (institution);
CREATE INDEX idx_legal_cases_status ON legal_cases (status);
CREATE INDEX idx_legal_cases_jurisdiction ON legal_cases (jurisdiction);

-- ── 16.9 dossiers ────────────────────────────────────────────────────────────

CREATE TABLE dossiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  slug text UNIQUE NOT NULL,
  country_id uuid REFERENCES countries(id) ON DELETE SET NULL,
  issue text,
  language text,
  format text,
  html_content text,
  pdf_url text,
  version int NOT NULL DEFAULT 1,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_dossiers_updated_at
  BEFORE UPDATE ON dossiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_dossiers_slug ON dossiers (slug);
CREATE INDEX idx_dossiers_country_id ON dossiers (country_id);
CREATE INDEX idx_dossiers_published ON dossiers (published);

-- ── 16.10 corrections ────────────────────────────────────────────────────────

CREATE TABLE corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  reason text,
  message text,
  submitter_email_hash text,
  status text NOT NULL DEFAULT 'pending',
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_corrections_updated_at
  BEFORE UPDATE ON corrections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_corrections_status ON corrections (status);
CREATE INDEX idx_corrections_target_type ON corrections (target_type);

-- ============================================================================
-- M4 Intelligence Layer Tables
-- ============================================================================

-- ── collector_runs ───────────────────────────────────────────────────────────

CREATE TABLE collector_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  collector_type text NOT NULL,
  status text NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'completed', 'failed')),
  items_fetched int NOT NULL DEFAULT 0,
  items_validated int NOT NULL DEFAULT 0,
  items_stored int NOT NULL DEFAULT 0,
  stage_durations jsonb DEFAULT '{}',
  errors jsonb[] DEFAULT '{}',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_collector_runs_source_id ON collector_runs (source_id);
CREATE INDEX idx_collector_runs_status ON collector_runs (status);
CREATE INDEX idx_collector_runs_started_at ON collector_runs (started_at);

-- ── ai_operations ────────────────────────────────────────────────────────────

CREATE TABLE ai_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type text NOT NULL,
  model_used text NOT NULL,
  confidence numeric(3,2) NOT NULL DEFAULT 0
    CHECK (confidence >= 0 AND confidence <= 1),
  tokens_input int NOT NULL DEFAULT 0,
  tokens_output int NOT NULL DEFAULT 0,
  latency_ms int NOT NULL DEFAULT 0,
  source_spans jsonb DEFAULT '[]',
  data jsonb,
  warnings text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_operations_type ON ai_operations (operation_type);
CREATE INDEX idx_ai_operations_status ON ai_operations (status);
CREATE INDEX idx_ai_operations_created_at ON ai_operations (created_at);

-- ── review_queue_items ───────────────────────────────────────────────────────

CREATE TABLE review_queue_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_content_type text NOT NULL,
  source_content_id text NOT NULL,
  source_content_slug text,
  review_type text NOT NULL,
  priority text NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  priority_score int NOT NULL DEFAULT 50
    CHECK (priority_score >= 0 AND priority_score <= 100),
  state text NOT NULL DEFAULT 'new'
    CHECK (state IN ('new', 'assigned', 'in_review', 'changes_requested', 'approved', 'published', 'rejected', 'archived')),
  assigned_reviewer uuid,
  due_by timestamptz,
  comments jsonb DEFAULT '[]',
  checklists jsonb DEFAULT '[]',
  state_history jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_review_queue_items_updated_at
  BEFORE UPDATE ON review_queue_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_review_queue_items_state ON review_queue_items (state);
CREATE INDEX idx_review_queue_items_priority ON review_queue_items (priority);
CREATE INDEX idx_review_queue_items_reviewer ON review_queue_items (assigned_reviewer);
CREATE INDEX idx_review_queue_items_content_type ON review_queue_items (source_content_type);

-- ── graph_nodes ──────────────────────────────────────────────────────────────

CREATE TABLE graph_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL
    CHECK (type IN ('source', 'document', 'entity', 'event', 'location', 'claim', 'country', 'institution', 'organization', 'action')),
  label text NOT NULL,
  properties jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_graph_nodes_updated_at
  BEFORE UPDATE ON graph_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_graph_nodes_type ON graph_nodes (type);
CREATE INDEX idx_graph_nodes_label ON graph_nodes (label);
CREATE INDEX idx_graph_nodes_properties ON graph_nodes USING GIN (properties);

-- ── graph_edges ──────────────────────────────────────────────────────────────

CREATE TABLE graph_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL
    CHECK (type IN ('mentions', 'occurs_at', 'involves', 'supports', 'contradicts', 'related_to', 'authored_by', 'published_by', 'located_in', 'part_of')),
  source_id uuid NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  target_id uuid NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  label text NOT NULL,
  weight numeric(3,2) CHECK (weight >= 0 AND weight <= 1),
  properties jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_graph_edges_type ON graph_edges (type);
CREATE INDEX idx_graph_edges_source_id ON graph_edges (source_id);
CREATE INDEX idx_graph_edges_target_id ON graph_edges (target_id);
CREATE INDEX idx_graph_edges_properties ON graph_edges USING GIN (properties);

-- ── map_layers ───────────────────────────────────────────────────────────────

CREATE TABLE map_layers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  layer_type text NOT NULL
    CHECK (layer_type IN ('tile', 'geojson', 'heatmap', 'cluster')),
  source_config jsonb NOT NULL DEFAULT '{}',
  style jsonb DEFAULT '{}',
  visibility boolean NOT NULL DEFAULT false,
  z_index int NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_map_layers_updated_at
  BEFORE UPDATE ON map_layers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_map_layers_type ON map_layers (layer_type);
CREATE INDEX idx_map_layers_visibility ON map_layers (visibility);

-- ============================================================================
-- Additional recommended tables (PRD 16.11)
-- ============================================================================

-- ── content_versions — version history for all content types ──────────────────

CREATE TABLE content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  version int NOT NULL,
  data jsonb NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_versions_content ON content_versions (content_type, content_id);
CREATE INDEX idx_content_versions_created_at ON content_versions (created_at);

-- ── user_roles — referenced by RLS helper function ───────────────────────────

CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role text NOT NULL
    CHECK (role IN ('public', 'contributor', 'researcher', 'moderator', 'partner_org', 'legal_reviewer', 'security_admin', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_user_roles_user_id ON user_roles (user_id);
CREATE INDEX idx_user_roles_role ON user_roles (role);

-- ============================================================================
-- Helper function: user_role()
-- Used by RLS policies to determine the current user's role.
-- Returns 'public' (anon) if not authenticated or no role assigned.
-- ============================================================================

CREATE OR REPLACE FUNCTION user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT role FROM user_roles WHERE user_id = auth.uid()),
    'public'
  );
$$;

-- ============================================================================
-- DOWN MIGRATION (reverse)
-- Run this block to revert:
-- ============================================================================

/*
DROP FUNCTION IF EXISTS user_role();
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS content_versions CASCADE;
DROP TABLE IF EXISTS map_layers CASCADE;
DROP TABLE IF EXISTS graph_edges CASCADE;
DROP TABLE IF EXISTS graph_nodes CASCADE;
DROP TABLE IF EXISTS review_queue_items CASCADE;
DROP TABLE IF EXISTS ai_operations CASCADE;
DROP TABLE IF EXISTS collector_runs CASCADE;
DROP TABLE IF EXISTS corrections CASCADE;
DROP TABLE IF EXISTS dossiers CASCADE;
DROP TABLE IF EXISTS legal_cases CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS actions CASCADE;
DROP TABLE IF EXISTS country_positions CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS evidence_references CASCADE;
DROP TABLE IF EXISTS evidence_items CASCADE;
DROP TABLE IF EXISTS sources CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column();
*/
