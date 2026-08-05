-- ============================================================================
-- Arbor Sentinel — Standardize review_status on evidence_items
-- Migration: 00012
-- Description: Adds CHECK constraint to enforce publishing state machine
--   on evidence_items.review_status, matching the workflow states in
--   src/lib/workflow/publishing.ts and src/lib/workflow/types.ts.
-- Reversible: Yes (DROP CONSTRAINT)
-- ============================================================================

ALTER TABLE evidence_items
  ADD CONSTRAINT evidence_items_review_status_check
  CHECK (review_status IN ('draft', 'in_review', 'approved', 'published', 'rejected', 'archived'));

-- Migrate any existing values outside the allowed set to 'draft'
UPDATE evidence_items
  SET review_status = 'draft'
  WHERE review_status NOT IN ('draft', 'in_review', 'approved', 'published', 'rejected', 'archived');
