-- ============================================================================
-- Arbor Sentinel — Collector Write Policies
-- Migration: 00013
-- Description: Allow anon and authenticated roles to insert draft rows into
--   evidence_items and review_queue_items. Required so the collector runtime
--   can persist collected content from the browser.
--
--   In production, collection should run server-side via Edge Functions using
--   the service_role key. These policies are for development/bootstrap.
-- Reversible: Yes
-- ============================================================================

-- ── evidence_items: allow anon + authenticated to insert drafts ──────────────

DROP POLICY IF EXISTS evidence_items_collector_insert ON evidence_items;
CREATE POLICY evidence_items_collector_insert ON evidence_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ── review_queue_items: allow anon + authenticated to insert ─────────────────

DROP POLICY IF EXISTS review_queue_items_collector_insert ON review_queue_items;
CREATE POLICY review_queue_items_collector_insert ON review_queue_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ── collector_runs: allow anon + authenticated to insert ─────────────────────

DROP POLICY IF EXISTS collector_runs_collector_insert ON collector_runs;
CREATE POLICY collector_runs_collector_insert ON collector_runs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
