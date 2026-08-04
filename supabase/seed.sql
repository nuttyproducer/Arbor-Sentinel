-- ============================================================================
-- Arbor Sentinel — Seed Data
-- Reference data for development and testing.
-- Sources data from the static TypeScript files in src/data/.
-- All content is public, reviewed information. No sensitive data.
-- ============================================================================

-- ── Sources ───────────────────────────────────────────────────────────────────

INSERT INTO sources (name, type, url, country, credibility_tier, notes) VALUES
  ('International Court of Justice', 'court', 'https://www.icj-cij.org/', 'International', 5, 'Principal judicial organ of the United Nations'),
  ('European Court of Human Rights', 'court', 'https://www.echr.coe.int/', 'International', 5, 'Council of Europe human rights court'),
  ('International Criminal Court', 'court', 'https://www.icc-cpi.int/', 'International', 5, 'Permanent international criminal court'),
  ('UN Office for the Coordination of Humanitarian Affairs', 'un_body', 'https://www.unocha.org/', 'International', 4, 'UN humanitarian coordination body'),
  ('UN Human Rights Office (OHCHR)', 'un_body', 'https://www.ohchr.org/', 'International', 5, 'UN human rights monitoring'),
  ('UNRWA', 'un_body', 'https://www.unrwa.org/', 'International', 4, 'UN agency for Palestine refugees'),
  ('Amnesty International', 'ngo', 'https://www.amnesty.org/', 'International', 4, 'International human rights organization'),
  ('Human Rights Watch', 'ngo', 'https://www.hrw.org/', 'International', 4, 'International human rights research and advocacy'),
  ('B''Tselem', 'ngo', 'https://www.btselem.org/', 'Israel/Palestine', 4, 'Israeli human rights information center'),
  ('Belgian Federal Government', 'government', 'https://www.belgium.be/', 'Belgium', 4, 'Official Belgian government portal'),
  ('European Union External Action', 'eu_body', 'https://www.eeas.europa.eu/', 'European Union', 4, 'EU diplomatic service'),
  ('Al Jazeera', 'media', 'https://www.aljazeera.com/', 'International', 3, 'International news organization');

-- ── Countries ─────────────────────────────────────────────────────────────────

INSERT INTO countries (name, iso_code, region, eu_member, nato_member, slug) VALUES
  ('Belgium', 'BE', 'Europe', true, true, 'belgium'),
  ('France', 'FR', 'Europe', true, true, 'france'),
  ('Germany', 'DE', 'Europe', true, true, 'germany'),
  ('Netherlands', 'NL', 'Europe', true, true, 'netherlands'),
  ('Ireland', 'IE', 'Europe', true, false, 'ireland'),
  ('Spain', 'ES', 'Europe', true, true, 'spain'),
  ('European Union', 'EU', 'Europe', true, false, 'european-union'),
  ('United States', 'US', 'North America', false, true, 'united-states'),
  ('United Kingdom', 'GB', 'Europe', false, true, 'united-kingdom'),
  ('Israel', 'IL', 'Middle East', false, false, 'israel'),
  ('Palestine', 'PS', 'Middle East', false, false, 'palestine'),
  ('South Africa', 'ZA', 'Africa', false, false, 'south-africa');

-- ── Country Positions ─────────────────────────────────────────────────────────

INSERT INTO country_positions (country_id, issue, position_summary, score, source_url)
SELECT c.id, 'ceasefire', 'Supports immediate ceasefire and release of all hostages', 4, 'https://www.belgium.be/'
FROM countries c WHERE c.slug = 'belgium'
UNION ALL
SELECT c.id, 'humanitarian_access', 'Calls for full, safe, and unhindered humanitarian access', 4, 'https://www.belgium.be/'
FROM countries c WHERE c.slug = 'belgium'
UNION ALL
SELECT c.id, 'arms_transfers', 'Suspended arms exports to Israel pending review', 3, 'https://www.belgium.be/'
FROM countries c WHERE c.slug = 'belgium'
UNION ALL
SELECT c.id, 'icc_icj_support', 'Supports ICJ provisional measures and ICC investigations', 4, 'https://www.belgium.be/'
FROM countries c WHERE c.slug = 'belgium'
UNION ALL
SELECT c.id, 'ceasefire', 'Calls for immediate and permanent ceasefire', 4, 'https://www.eeas.europa.eu/'
FROM countries c WHERE c.slug = 'european-union'
UNION ALL
SELECT c.id, 'humanitarian_access', 'Largest humanitarian donor; calls for unimpeded access', 4, 'https://www.eeas.europa.eu/'
FROM countries c WHERE c.slug = 'european-union';

-- ── Organizations ─────────────────────────────────────────────────────────────

INSERT INTO organizations (name, slug, type, website, regions, partnership_status) VALUES
  ('UNRWA', 'unrwa', 'UN body', 'https://www.unrwa.org/', ARRAY['Gaza', 'West Bank', 'Lebanon', 'Jordan', 'Syria'], 'public-resource-listed'),
  ('International Committee of the Red Cross', 'icrc', 'international-organization', 'https://www.icrc.org/', ARRAY['Global'], 'public-resource-listed'),
  ('Médecins Sans Frontières', 'msf', 'ngo', 'https://www.msf.org/', ARRAY['Global'], 'public-resource-listed'),
  ('Amnesty International', 'amnesty-international', 'ngo', 'https://www.amnesty.org/', ARRAY['Global'], 'public-resource-listed'),
  ('Human Rights Watch', 'human-rights-watch', 'ngo', 'https://www.hrw.org/', ARRAY['Global'], 'public-resource-listed'),
  ('B''Tselem', 'btselem', 'ngo', 'https://www.btselem.org/', ARRAY['Israel', 'Palestine'], 'public-resource-listed'),
  ('World Food Programme', 'wfp', 'UN body', 'https://www.wfp.org/', ARRAY['Global'], 'public-resource-listed'),
  ('UNICEF', 'unicef', 'UN body', 'https://www.unicef.org/', ARRAY['Global'], 'public-resource-listed');

-- ── Legal Cases ───────────────────────────────────────────────────────────────

INSERT INTO legal_cases (title, institution, jurisdiction, status, summary, opened_date, source_url) VALUES
  ('Application of the Genocide Convention (South Africa v. Israel)', 'International Court of Justice', 'International', 'Proceedings ongoing', 'South Africa instituted proceedings against Israel alleging violations of the Genocide Convention. The ICJ issued provisional measures on 26 January 2024, 28 March 2024, and 24 May 2024.', '2023-12-29', 'https://www.icj-cij.org/case/192'),
  ('Situation in the State of Palestine', 'International Criminal Court', 'International', 'Investigation ongoing', 'ICC investigation into alleged crimes within the Court''s jurisdiction committed in the State of Palestine since 13 June 2014.', '2021-03-03', 'https://www.icc-cpi.int/palestine'),
  ('Arrest warrant applications (Gaza)', 'International Criminal Court', 'International', 'Arrest warrants issued', 'ICC Pre-Trial Chamber I issued arrest warrants in relation to the Situation in the State of Palestine on 21 November 2024.', '2024-11-21', 'https://www.icc-cpi.int/palestine');

-- ── Actions ───────────────────────────────────────────────────────────────────

INSERT INTO actions (title, slug, action_type, issue, language, recipient_type, recipient_name, active)
SELECT 'Email your MP: Support humanitarian access and accountability', 'belgium-email-mp-humanitarian-access', 'email', 'humanitarian_access', 'en', 'elected-representative', 'Member of Parliament', true
FROM countries c WHERE c.slug = 'belgium'
LIMIT 1;

-- ── Evidence Items ────────────────────────────────────────────────────────────

INSERT INTO evidence_items (title, slug, summary, category, country_or_territory, verification_level, review_status, visibility) VALUES
  ('ICJ Provisional Measures Order — January 2024', 'icj-provisional-measures-jan-2024', 'The International Court of Justice issued provisional measures in the case concerning Application of the Convention on the Prevention and Punishment of the Crime of Genocide in the Gaza Strip (South Africa v. Israel).', 'legal-record', 'International', 5, 'published', 'public'),
  ('UN Security Council Resolution 2728 — Ceasefire Demand', 'unsc-resolution-2728', 'The UN Security Council adopted Resolution 2728 demanding an immediate ceasefire for the month of Ramadan leading to a lasting sustainable ceasefire.', 'legal-record', 'International', 5, 'published', 'public'),
  ('ICC Prosecutor Statement on Palestine Investigation', 'icc-prosecutor-statement-palestine-2024', 'The ICC Prosecutor issued a statement on the ongoing investigation into the Situation in the State of Palestine.', 'legal-record', 'International', 5, 'published', 'public');

-- ── Dossiers ──────────────────────────────────────────────────────────────────

INSERT INTO dossiers (title, slug, issue, language, format, published)
SELECT 'Gaza Accountability Dossier', 'gaza-accountability-dossier', 'gaza_accountability', 'en', 'html', true
FROM countries c WHERE c.slug = 'belgium'
LIMIT 1;

-- ── Map Layers ────────────────────────────────────────────────────────────────

INSERT INTO map_layers (name, layer_type, source_config, style, visibility, z_index, metadata) VALUES
  ('Evidence Events', 'geojson', '{"type": "geojson", "data": "/api/v1/locations/events"}', '{"circle-radius": 6, "circle-color": "#d7191c", "circle-opacity": 0.7}', true, 10, '{"group": "events"}'),
  ('Source Regions', 'geojson', '{"type": "geojson", "data": "/api/v1/locations/sources"}', '{"fill-color": "#2c7bb6", "fill-opacity": 0.3}', false, 5, '{"group": "sources"}'),
  ('Organizations', 'geojson', '{"type": "geojson", "data": "/api/v1/locations/organizations"}', '{"circle-radius": 4, "circle-color": "#fdae61"}', false, 5, '{"group": "organizations"}'),
  ('Legal Boundaries', 'geojson', '{"type": "geojson", "data": "/api/v1/locations/legal"}', '{"fill-color": "#2b83ba", "fill-opacity": 0.2, "stroke-color": "#2b83ba"}', true, 2, '{"group": "legal"}'),
  ('Base Map', 'tile', '{"type": "vector", "url": "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"}', '{}', true, 1, '{"group": "base"}');
