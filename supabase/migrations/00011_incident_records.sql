-- ============================================================================
-- Arbor Sentinel — Incident Records & Processing Queue
-- Migration: 00011
-- Description: Incident intelligence records and processing queue for
--   collector → AI pipeline workflow. No victim databases — incidents
--   track events and patterns, not individual people.
-- Reversible: Yes (see down migration at end)
-- ============================================================================

-- ── incident_records ──────────────────────────────────────────────────────────

CREATE TABLE incident_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Core incident data
  title text NOT NULL,
  description text,
  incident_date date,
  incident_date_precision text NOT NULL DEFAULT 'day'
    CHECK (incident_date_precision IN ('day', 'month', 'year', 'range')),
  incident_date_end date,
  -- Location
  location_name text,
  country_or_territory text,
  lat numeric(10,6),
  lng numeric(10,6),
  location_precision text
    CHECK (location_precision IN ('country', 'region', 'city', 'district', 'exact')),
  -- Classification
  incident_type text NOT NULL
    CHECK (incident_type IN (
      'civilian_harm', 'healthcare', 'displacement', 'aid_access',
      'infrastructure', 'legal', 'political', 'other'
    )),
  -- Verification
  verification_status text NOT NULL DEFAULT 'single_source'
    CHECK (verification_status IN (
      'single_source', 'multi_source', 'official', 'reviewed'
    )),
  confidence int NOT NULL DEFAULT 50
    CHECK (confidence >= 0 AND confidence <= 100),
  -- Source tracking
  source_ids uuid[] DEFAULT '{}',
  source_count int NOT NULL DEFAULT 1,
  primary_source_id uuid REFERENCES sources(id) ON DELETE SET NULL,
  source_urls text[] DEFAULT '{}',
  -- Related entities (graph node references)
  related_entity_ids uuid[] DEFAULT '{}',
  related_incident_ids uuid[] DEFAULT '{}',
  -- Review metadata
  review_status text NOT NULL DEFAULT 'new'
    CHECK (review_status IN ('new', 'processing', 'failed', 'review', 'approved', 'merged', 'archived')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_notes text,
  -- Merge tracking (for deduplication)
  merged_into_id uuid REFERENCES incident_records(id) ON DELETE SET NULL,
  is_duplicate boolean NOT NULL DEFAULT false,
  -- Metadata
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_incident_records_updated_at
  BEFORE UPDATE ON incident_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_incident_records_type ON incident_records (incident_type);
CREATE INDEX idx_incident_records_verification ON incident_records (verification_status);
CREATE INDEX idx_incident_records_review_status ON incident_records (review_status);
CREATE INDEX idx_incident_records_incident_date ON incident_records (incident_date);
CREATE INDEX idx_incident_records_country ON incident_records (country_or_territory);
CREATE INDEX idx_incident_records_confidence ON incident_records (confidence);
CREATE INDEX idx_incident_records_source_ids ON incident_records USING GIN (source_ids);
CREATE INDEX idx_incident_records_tags ON incident_records USING GIN (tags);
CREATE INDEX idx_incident_records_merged_into ON incident_records (merged_into_id);

-- ── processing_queue ──────────────────────────────────────────────────────────

CREATE TABLE processing_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- What to process
  item_type text NOT NULL
    CHECK (item_type IN ('collector_output', 'incident', 'evidence', 'review')),
  item_id uuid NOT NULL,
  -- Pipeline stage
  stage text NOT NULL DEFAULT 'raw'
    CHECK (stage IN (
      'raw', 'normalized', 'translated', 'summarized',
      'entities_extracted', 'claims_extracted', 'events_extracted',
      'graph_populated', 'review_ready'
    )),
  -- Priority & ordering
  priority int NOT NULL DEFAULT 50
    CHECK (priority >= 0 AND priority <= 100),
  -- Status
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'dead')),
  -- Attempt tracking
  attempt_count int NOT NULL DEFAULT 0,
  max_attempts int NOT NULL DEFAULT 3,
  -- Timing
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  -- Error info
  last_error text,
  error_history jsonb DEFAULT '[]',
  -- Payload
  payload jsonb DEFAULT '{}',
  result jsonb DEFAULT '{}',
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_processing_queue_updated_at
  BEFORE UPDATE ON processing_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_processing_queue_status ON processing_queue (status);
CREATE INDEX idx_processing_queue_stage ON processing_queue (stage);
CREATE INDEX idx_processing_queue_priority ON processing_queue (priority DESC);
CREATE INDEX idx_processing_queue_next_attempt ON processing_queue (next_attempt_at);
CREATE INDEX idx_processing_queue_item_type ON processing_queue (item_type);

-- ── RLS ────────────────────────────────────────────────────────────────────────

ALTER TABLE incident_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_queue ENABLE ROW LEVEL SECURITY;

-- Incident records: public can read reviewed/approved incidents
CREATE POLICY "incident_records_public_select" ON incident_records
  FOR SELECT TO anon
  USING (review_status IN ('approved', 'review'));

CREATE POLICY "incident_records_auth_select" ON incident_records
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "incident_records_admin_insert" ON incident_records
  FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR has_role('researcher'));

CREATE POLICY "incident_records_admin_update" ON incident_records
  FOR UPDATE TO authenticated
  USING (is_admin() OR has_role('researcher') OR has_role('moderator'))
  WITH CHECK (is_admin() OR has_role('researcher') OR has_role('moderator'));

CREATE POLICY "incident_records_admin_delete" ON incident_records
  FOR DELETE TO authenticated
  USING (is_admin());

-- Processing queue: admin + researcher only
CREATE POLICY "processing_queue_auth_select" ON processing_queue
  FOR SELECT TO authenticated
  USING (is_admin() OR has_role('researcher'));

CREATE POLICY "processing_queue_admin_insert" ON processing_queue
  FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR has_role('researcher'));

CREATE POLICY "processing_queue_admin_update" ON processing_queue
  FOR UPDATE TO authenticated
  USING (is_admin() OR has_role('researcher'))
  WITH CHECK (is_admin() OR has_role('researcher'));

CREATE POLICY "processing_queue_admin_delete" ON processing_queue
  FOR DELETE TO authenticated
  USING (is_admin());

-- ============================================================================
-- DOWN MIGRATION (reverse)
-- ============================================================================

/*
DROP TABLE IF EXISTS processing_queue CASCADE;
DROP TABLE IF EXISTS incident_records CASCADE;
*/
