-- ============================================================================
-- Arbor Sentinel — Full-Text Search
-- Migration: 00004
-- Description: PostgreSQL full-text search configuration, indexes, and triggers
-- Reversible: Yes
-- ============================================================================

-- ── Text search configuration ─────────────────────────────────────────────────

-- Create a custom text search configuration for English
DO $$ BEGIN
  CREATE TEXT SEARCH CONFIGURATION arbor_sentinel (COPY = pg_catalog.english);
EXCEPTION WHEN unique_violation THEN NULL;
END $$;

-- ── Search indexes ───────────────────────────────────────────────────────────

-- evidence_items: search on title, summary, body
ALTER TABLE evidence_items ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION evidence_items_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('arbor_sentinel', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('arbor_sentinel', COALESCE(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('arbor_sentinel', COALESCE(NEW.body, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_evidence_items_search ON evidence_items;
CREATE TRIGGER trg_evidence_items_search
  BEFORE INSERT OR UPDATE ON evidence_items
  FOR EACH ROW EXECUTE FUNCTION evidence_items_search_update();

CREATE INDEX idx_evidence_items_search ON evidence_items USING GIN (search_vector);

-- sources: search on name, notes
ALTER TABLE sources ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION sources_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('arbor_sentinel', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('arbor_sentinel', COALESCE(NEW.notes, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sources_search ON sources;
CREATE TRIGGER trg_sources_search
  BEFORE INSERT OR UPDATE ON sources
  FOR EACH ROW EXECUTE FUNCTION sources_search_update();

CREATE INDEX idx_sources_search ON sources USING GIN (search_vector);

-- legal_cases: search on title, summary
ALTER TABLE legal_cases ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION legal_cases_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('arbor_sentinel', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('arbor_sentinel', COALESCE(NEW.summary, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_legal_cases_search ON legal_cases;
CREATE TRIGGER trg_legal_cases_search
  BEFORE INSERT OR UPDATE ON legal_cases
  FOR EACH ROW EXECUTE FUNCTION legal_cases_search_update();

CREATE INDEX idx_legal_cases_search ON legal_cases USING GIN (search_vector);

-- countries: search on name, position_summary (via join)
ALTER TABLE countries ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION countries_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('arbor_sentinel', COALESCE(NEW.name, '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_countries_search ON countries;
CREATE TRIGGER trg_countries_search
  BEFORE INSERT OR UPDATE ON countries
  FOR EACH ROW EXECUTE FUNCTION countries_search_update();

CREATE INDEX idx_countries_search ON countries USING GIN (search_vector);

-- organizations: search on name, description (notes)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION organizations_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('arbor_sentinel', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('arbor_sentinel', COALESCE(NEW.notes, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_organizations_search ON organizations;
CREATE TRIGGER trg_organizations_search
  BEFORE INSERT OR UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION organizations_search_update();

CREATE INDEX idx_organizations_search ON organizations USING GIN (search_vector);

-- ── Unified search function ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION search_all(
  search_query text,
  search_types text[] DEFAULT NULL,
  result_limit int DEFAULT 50
)
RETURNS TABLE(
  result_type text,
  result_id uuid,
  title text,
  snippet text,
  rank real,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 'evidence' AS result_type, id AS result_id,
    title,
    ts_headline('arbor_sentinel', summary, plainto_tsquery('arbor_sentinel', search_query), 'MaxWords=30, MinWords=15') AS snippet,
    ts_rank(search_vector, plainto_tsquery('arbor_sentinel', search_query)) AS rank,
    created_at
  FROM evidence_items
  WHERE search_vector @@ plainto_tsquery('arbor_sentinel', search_query)
    AND review_status = 'published' AND visibility = 'public'
    AND (search_types IS NULL OR 'evidence' = ANY(search_types))

  UNION ALL

  SELECT 'source' AS result_type, id AS result_id,
    name AS title,
    ts_headline('arbor_sentinel', COALESCE(notes, ''), plainto_tsquery('arbor_sentinel', search_query), 'MaxWords=30, MinWords=15') AS snippet,
    ts_rank(search_vector, plainto_tsquery('arbor_sentinel', search_query)) AS rank,
    created_at
  FROM sources
  WHERE search_vector @@ plainto_tsquery('arbor_sentinel', search_query)
    AND (search_types IS NULL OR 'source' = ANY(search_types))

  UNION ALL

  SELECT 'legal_case' AS result_type, id AS result_id,
    title,
    ts_headline('arbor_sentinel', COALESCE(summary, ''), plainto_tsquery('arbor_sentinel', search_query), 'MaxWords=30, MinWords=15') AS snippet,
    ts_rank(search_vector, plainto_tsquery('arbor_sentinel', search_query)) AS rank,
    created_at
  FROM legal_cases
  WHERE search_vector @@ plainto_tsquery('arbor_sentinel', search_query)
    AND (search_types IS NULL OR 'legal_case' = ANY(search_types))

  UNION ALL

  SELECT 'country' AS result_type, id AS result_id,
    name AS title,
    NULL AS snippet,
    ts_rank(search_vector, plainto_tsquery('arbor_sentinel', search_query)) AS rank,
    created_at
  FROM countries
  WHERE search_vector @@ plainto_tsquery('arbor_sentinel', search_query)
    AND (search_types IS NULL OR 'country' = ANY(search_types))

  UNION ALL

  SELECT 'organization' AS result_type, id AS result_id,
    name AS title,
    ts_headline('arbor_sentinel', COALESCE(notes, ''), plainto_tsquery('arbor_sentinel', search_query), 'MaxWords=30, MinWords=15') AS snippet,
    ts_rank(search_vector, plainto_tsquery('arbor_sentinel', search_query)) AS rank,
    created_at
  FROM organizations
  WHERE search_vector @@ plainto_tsquery('arbor_sentinel', search_query)
    AND (search_types IS NULL OR 'organization' = ANY(search_types))

  ORDER BY rank DESC, created_at DESC
  LIMIT result_limit;
$$;

-- ── Populate existing rows ───────────────────────────────────────────────────

UPDATE evidence_items SET search_vector = NULL WHERE search_vector IS NOT NULL;
UPDATE sources SET search_vector = NULL WHERE search_vector IS NOT NULL;
UPDATE legal_cases SET search_vector = NULL WHERE search_vector IS NOT NULL;
UPDATE countries SET search_vector = NULL WHERE search_vector IS NOT NULL;
UPDATE organizations SET search_vector = NULL WHERE search_vector IS NOT NULL;

-- ============================================================================
-- DOWN MIGRATION
-- ============================================================================

/*
DROP FUNCTION IF EXISTS search_all(text, text[], int);
DROP TRIGGER IF EXISTS trg_organizations_search ON organizations;
DROP FUNCTION IF EXISTS organizations_search_update();
DROP TRIGGER IF EXISTS trg_countries_search ON countries;
DROP FUNCTION IF EXISTS countries_search_update();
DROP TRIGGER IF EXISTS trg_legal_cases_search ON legal_cases;
DROP FUNCTION IF EXISTS legal_cases_search_update();
DROP TRIGGER IF EXISTS trg_sources_search ON sources;
DROP FUNCTION IF EXISTS sources_search_update();
DROP TRIGGER IF EXISTS trg_evidence_items_search ON evidence_items;
DROP FUNCTION IF EXISTS evidence_items_search_update();
ALTER TABLE organizations DROP COLUMN IF EXISTS search_vector;
ALTER TABLE countries DROP COLUMN IF EXISTS search_vector;
ALTER TABLE legal_cases DROP COLUMN IF EXISTS search_vector;
ALTER TABLE sources DROP COLUMN IF EXISTS search_vector;
ALTER TABLE evidence_items DROP COLUMN IF EXISTS search_vector;
DROP TEXT SEARCH CONFIGURATION IF EXISTS arbor_sentinel;
*/
