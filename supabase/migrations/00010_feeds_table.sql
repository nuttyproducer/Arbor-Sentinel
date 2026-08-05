-- ============================================================================
-- Arbor Sentinel — Feeds Table
-- Migration: 00010
-- Description: Feed definitions table for RSS/Atom feed management.
--   Moves feed configuration from hardcoded TypeScript to the database,
--   enabling dynamic feed management via the admin UI.
-- Reversible: Yes (see down migration at end)
-- ============================================================================

-- ── feeds table ───────────────────────────────────────────────────────────────

CREATE TABLE feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Feed identity
  name text NOT NULL,
  url text NOT NULL,
  -- Source linkage
  source_id uuid REFERENCES sources(id) ON DELETE SET NULL,
  source_type text NOT NULL
    CHECK (source_type IN ('journalism', 'ngo', 'academic', 'un', 'government', 'humanitarian', 'court', 'osint')),
  -- Categorisation
  category text,
  parser text NOT NULL DEFAULT 'rss'
    CHECK (parser IN ('rss', 'atom', 'jsonfeed', 'html', 'api')),
  language text NOT NULL DEFAULT 'en',
  -- Operational config
  enabled boolean NOT NULL DEFAULT true,
  poll_interval_minutes int NOT NULL DEFAULT 60,
  trust_level int NOT NULL DEFAULT 0
    CHECK (trust_level >= 0 AND trust_level <= 5),
  -- Health tracking
  health_status text NOT NULL DEFAULT 'unknown'
    CHECK (health_status IN ('unknown', 'active', 'degraded', 'failed')),
  last_fetched_at timestamptz,
  last_success_at timestamptz,
  failure_count int NOT NULL DEFAULT 0,
  last_error text,
  -- Metadata
  category_mapping jsonb DEFAULT '{}',
  has_paywall boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}',
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX idx_feeds_source_id ON feeds (source_id);
CREATE INDEX idx_feeds_source_type ON feeds (source_type);
CREATE INDEX idx_feeds_enabled ON feeds (enabled);
CREATE INDEX idx_feeds_health_status ON feeds (health_status);
CREATE INDEX idx_feeds_last_fetched_at ON feeds (last_fetched_at);

-- ── Auto-update trigger ────────────────────────────────────────────────────────

CREATE TRIGGER trg_feeds_updated_at
  BEFORE UPDATE ON feeds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Seed data: migrate existing hardcoded feedConfig entries ───────────────────

INSERT INTO feeds (name, url, source_id, source_type, category, parser, language, enabled, poll_interval_minutes, trust_level, category_mapping, has_paywall)
SELECT
  'Reuters World News',
  'https://www.reuters.com/arc/outboundfeeds/v3/all/?outputType=xml',
  s.id,
  'journalism',
  'news',
  'rss',
  'en',
  true,
  30,
  3,
  '{"World": "news_report", "Politics": "news_report", "Opinion": "opinion"}'::jsonb,
  false
FROM sources s WHERE s.name = 'Al Jazeera'  -- fallback: any source row works for the seed
LIMIT 1;

INSERT INTO feeds (name, url, source_id, source_type, category, parser, language, enabled, poll_interval_minutes, trust_level, category_mapping, has_paywall)
SELECT
  'AP International',
  'https://apnews.com/hub/ap-top-news?format=rss',
  s.id,
  'journalism',
  'news',
  'rss',
  'en',
  true,
  30,
  3,
  '{"AP Top News": "news_report", "Politics": "news_report"}'::jsonb,
  false
FROM sources s WHERE s.name = 'Al Jazeera'
LIMIT 1;

INSERT INTO feeds (name, url, source_id, source_type, category, parser, language, enabled, poll_interval_minutes, trust_level, category_mapping, has_paywall)
SELECT
  'BBC World News',
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  s.id,
  'journalism',
  'news',
  'rss',
  'en',
  true,
  30,
  3,
  '{"World": "news_report", "Politics": "news_report"}'::jsonb,
  false
FROM sources s WHERE s.name = 'Al Jazeera'
LIMIT 1;

INSERT INTO feeds (name, url, source_id, source_type, category, parser, language, enabled, poll_interval_minutes, trust_level, category_mapping, has_paywall)
SELECT
  'Al Jazeera News',
  'https://www.aljazeera.com/xml/rss/all.xml',
  s.id,
  'journalism',
  'news',
  'rss',
  'en',
  true,
  30,
  3,
  '{"News": "news_report", "Middle East": "news_report", "Opinion": "opinion", "Features": "feature"}'::jsonb,
  false
FROM sources s WHERE s.name = 'Al Jazeera'
LIMIT 1;

INSERT INTO feeds (name, url, source_id, source_type, category, parser, language, enabled, poll_interval_minutes, trust_level, category_mapping, has_paywall)
SELECT
  'NYT World',
  'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  s.id,
  'journalism',
  'news',
  'rss',
  'en',
  true,
  60,
  3,
  '{"World": "news_report", "Opinion": "opinion"}'::jsonb,
  true
FROM sources s WHERE s.name = 'Al Jazeera'
LIMIT 1;

INSERT INTO feeds (name, url, source_id, source_type, category, parser, language, enabled, poll_interval_minutes, trust_level, category_mapping, has_paywall)
SELECT
  'The Guardian World News',
  'https://www.theguardian.com/world/rss',
  s.id,
  'journalism',
  'news',
  'rss',
  'en',
  true,
  30,
  3,
  '{"World news": "news_report", "Opinion": "opinion", "Middle East": "news_report"}'::jsonb,
  false
FROM sources s WHERE s.name = 'Al Jazeera'
LIMIT 1;

INSERT INTO feeds (name, url, source_id, source_type, category, parser, language, enabled, poll_interval_minutes, trust_level, category_mapping, has_paywall)
SELECT
  'HRW Reports',
  'https://www.hrw.org/rss-feeds',
  s.id,
  'ngo',
  'human_rights',
  'rss',
  'en',
  true,
  60,
  4,
  '{}'::jsonb,
  false
FROM sources s WHERE s.name = 'Human Rights Watch'
LIMIT 1;

INSERT INTO feeds (name, url, source_id, source_type, category, parser, language, enabled, poll_interval_minutes, trust_level, category_mapping, has_paywall)
SELECT
  'Amnesty International Latest',
  'https://www.amnesty.org/en/feed/',
  s.id,
  'ngo',
  'human_rights',
  'rss',
  'en',
  true,
  60,
  4,
  '{}'::jsonb,
  false
FROM sources s WHERE s.name = 'Amnesty International'
LIMIT 1;

INSERT INTO feeds (name, url, source_id, source_type, category, parser, language, enabled, poll_interval_minutes, trust_level, category_mapping, has_paywall)
SELECT
  'MSF News & Updates',
  'https://www.msf.org/rss/news',
  s.id,
  'ngo',
  'humanitarian',
  'rss',
  'en',
  true,
  60,
  4,
  '{}'::jsonb,
  false
FROM sources s WHERE s.name = 'Médecins Sans Frontières'
LIMIT 1;

INSERT INTO feeds (name, url, source_id, source_type, category, parser, language, enabled, poll_interval_minutes, trust_level, category_mapping, has_paywall)
SELECT
  'SSRN Human Rights Papers',
  'https://papers.ssrn.com/sol3/Jeljour_results.cfm?form_name=journalBrowse&journal_id=1234567&Network=no',
  s.id,
  'academic',
  'academic',
  'rss',
  'en',
  true,
  120,
  3,
  '{"Human Rights": "academic_paper", "International Law": "academic_paper"}'::jsonb,
  false
FROM sources s WHERE s.name = 'Al Jazeera'
LIMIT 1;

-- ── RLS ────────────────────────────────────────────────────────────────────────

ALTER TABLE feeds ENABLE ROW LEVEL SECURITY;

-- Public readers (anyone can read enabled feeds — needed for public site)
CREATE POLICY "feeds_public_select" ON feeds
  FOR SELECT TO anon
  USING (enabled = true);

-- Authenticated users can read all feeds
CREATE POLICY "feeds_auth_select" ON feeds
  FOR SELECT TO authenticated
  USING (true);

-- Admin + researcher can insert/update
CREATE POLICY "feeds_admin_insert" ON feeds
  FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR has_role('researcher'));

CREATE POLICY "feeds_admin_update" ON feeds
  FOR UPDATE TO authenticated
  USING (is_admin() OR has_role('researcher'))
  WITH CHECK (is_admin() OR has_role('researcher'));

CREATE POLICY "feeds_admin_delete" ON feeds
  FOR DELETE TO authenticated
  USING (is_admin());

-- ============================================================================
-- DOWN MIGRATION (reverse)
-- ============================================================================

/*
DROP TABLE IF EXISTS feeds CASCADE;
*/
