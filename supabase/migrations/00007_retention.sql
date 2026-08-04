-- ============================================================================
-- Accountability Atlas — Data Retention Policies
-- Migration: 00007
-- Description: Retention policies, archival triggers, and purge procedures
-- Reversible: Yes
-- ============================================================================

-- ── Archived content table ────────────────────────────────────────────────────

CREATE TABLE archived_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  data jsonb NOT NULL,
  archived_reason text NOT NULL,
  archived_by uuid,
  archived_at timestamptz NOT NULL DEFAULT now(),
  purge_after timestamptz -- when this archived record can be permanently deleted
);

CREATE INDEX idx_archived_content_type ON archived_content (content_type);
CREATE INDEX idx_archived_content_purge ON archived_content (purge_after)
  WHERE purge_after IS NOT NULL;

ALTER TABLE archived_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "archived_content_admin_select" ON archived_content
  FOR SELECT TO authenticated
  USING (is_admin() OR has_role('security_admin'));

-- ── Retention helper: archive a record ────────────────────────────────────────

CREATE OR REPLACE FUNCTION archive_record(
  target_content_type text,
  target_content_id uuid,
  reason text DEFAULT 'manual_archive'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  record_data jsonb;
BEGIN
  -- Only admins can archive
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can archive records.';
  END IF;

  -- Fetch the record based on content type
  CASE target_content_type
    WHEN 'evidence_items' THEN
      SELECT to_jsonb(ei) INTO record_data FROM evidence_items ei WHERE ei.id = target_content_id;
    WHEN 'sources' THEN
      SELECT to_jsonb(s) INTO record_data FROM sources s WHERE s.id = target_content_id;
    ELSE
      RAISE EXCEPTION 'Archive not supported for content type: %', target_content_type;
  END CASE;

  IF record_data IS NULL THEN
    RAISE EXCEPTION 'Record not found: %/%', target_content_type, target_content_id;
  END IF;

  -- Insert into archived_content with purge date based on type
  INSERT INTO archived_content (content_type, content_id, data, archived_reason, purge_after)
  VALUES (
    target_content_type,
    target_content_id,
    record_data,
    reason,
    CASE
      WHEN target_content_type = 'evidence_items' THEN now() + interval '1 year'
      WHEN target_content_type = 'corrections' THEN now() + interval '2 years'
      ELSE now() + interval '3 years'
    END
  );
END;
$$;

-- ── Purge expired archived content ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION purge_expired_archived_content()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  purged_count int;
BEGIN
  -- 30-day grace period: mark for deletion first, actually delete after 30 days
  DELETE FROM archived_content
  WHERE purge_after < now() - interval '30 days';

  GET DIAGNOSTICS purged_count = ROW_COUNT;
  RETURN purged_count;
END;
$$;

-- ── Draft content auto-purge ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION purge_old_drafts()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  evidence_count int;
  dossier_count int;
BEGIN
  -- Purge draft evidence items older than 1 year
  WITH deleted AS (
    DELETE FROM evidence_items
    WHERE review_status = 'draft'
      AND created_at < now() - interval '1 year'
    RETURNING id
  )
  SELECT COUNT(*) INTO evidence_count FROM deleted;

  -- Purge unpublished dossiers older than 1 year
  WITH deleted AS (
    DELETE FROM dossiers
    WHERE published = false
      AND created_at < now() - interval '1 year'
    RETURNING id
  )
  SELECT COUNT(*) INTO dossier_count FROM deleted;

  RETURN evidence_count + dossier_count;
END;
$$;

-- ============================================================================
-- DOWN MIGRATION
-- ============================================================================

/*
DROP FUNCTION IF EXISTS purge_old_drafts();
DROP FUNCTION IF EXISTS purge_expired_archived_content();
DROP FUNCTION IF EXISTS archive_record(text, uuid, text);
DROP TABLE IF EXISTS archived_content CASCADE;
*/
