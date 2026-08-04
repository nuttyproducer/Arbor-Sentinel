-- ============================================================================
-- Arbor Sentinel — PostGIS Spatial Queries
-- Migration: 00005
-- Description: Spatial columns, indexes, and safety enforcement functions
-- Requires: PostGIS extension (created in 00001)
-- Reversible: Yes
-- ============================================================================

-- ── Spatial columns ──────────────────────────────────────────────────────────

-- evidence_items: location point geometry
ALTER TABLE evidence_items ADD COLUMN IF NOT EXISTS location_geom geometry(Point, 4326);

-- Populate from lat/lng
DO $$ BEGIN
  UPDATE evidence_items
  SET location_geom = ST_SetSRID(ST_MakePoint(lng, lat), 4326)
  WHERE lat IS NOT NULL AND lng IS NOT NULL AND location_geom IS NULL;
END $$;

-- organizations: operational area polygon
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS operational_area geometry(Polygon, 4326);

-- country_positions: jurisdiction area
ALTER TABLE country_positions ADD COLUMN IF NOT EXISTS jurisdiction_area geometry(Polygon, 4326);

-- sources: region geometry
ALTER TABLE sources ADD COLUMN IF NOT EXISTS region_geometry geometry(Geometry, 4326);

-- ── Spatial indexes ──────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_evidence_items_location ON evidence_items USING GIST (location_geom);
CREATE INDEX IF NOT EXISTS idx_organizations_operational_area ON organizations USING GIST (operational_area);

-- ── Safety: coordinate precision enforcement ──────────────────────────────────

/**
 * Round a coordinate to safe precision.
 * - country: 1 decimal place (~11 km)
 * - region: 2 decimal places (~1.1 km)
 * - city: 3 decimal places (~110 m)
 * - district: 4 decimal places (~11 m)
 * - exact: no rounding (admin only)
 */
CREATE OR REPLACE FUNCTION safe_coordinate(
  coord numeric,
  precision_level text
)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE precision_level
    WHEN 'country' THEN round(coord, 1)
    WHEN 'region' THEN round(coord, 2)
    WHEN 'city' THEN round(coord, 3)
    WHEN 'district' THEN round(coord, 4)
    WHEN 'exact' THEN coord
    ELSE round(coord, 2) -- default safe
  END;
$$;

/**
 * Apply safety rounding to a point geometry based on precision.
 * Only admins get exact coordinates.
 */
CREATE OR REPLACE FUNCTION safe_location(
  geom geometry(Point, 4326),
  precision_level text
)
RETURNS geometry(Point, 4326)
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE
    WHEN precision_level = 'exact' AND (public.is_admin() OR public.has_role('security_admin'))
    THEN geom
    ELSE ST_SetSRID(
      ST_MakePoint(
        safe_coordinate(ST_X(geom), precision_level),
        safe_coordinate(ST_Y(geom), precision_level)
      ),
      4326
    )
  END;
$$;

-- ── Spatial query functions ───────────────────────────────────────────────────

/** Find evidence items within a radius of a point (in km). */
CREATE OR REPLACE FUNCTION evidence_nearby(
  center_lat numeric,
  center_lng numeric,
  radius_km numeric,
  max_results int DEFAULT 50
)
RETURNS TABLE(
  id uuid,
  title text,
  slug text,
  category text,
  lat numeric,
  lng numeric,
  distance_km numeric
)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT
    ei.id,
    ei.title,
    ei.slug,
    ei.category,
    ST_Y(ei.location_geom) AS lat,
    ST_X(ei.location_geom) AS lng,
    ST_Distance(
      ei.location_geom::geography,
      ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
    ) / 1000.0 AS distance_km
  FROM public.evidence_items ei
  WHERE ei.location_geom IS NOT NULL
    AND ei.review_status = 'published'
    AND ei.visibility = 'public'
    AND ST_DWithin(
      ei.location_geom::geography,
      ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
      radius_km * 1000
    )
  ORDER BY distance_km
  LIMIT max_results;
$$;

/** Find evidence items within a bounding box. */
CREATE OR REPLACE FUNCTION evidence_in_bbox(
  bbox_north numeric,
  bbox_south numeric,
  bbox_east numeric,
  bbox_west numeric,
  max_results int DEFAULT 200
)
RETURNS TABLE(
  id uuid,
  title text,
  slug text,
  category text,
  lat numeric,
  lng numeric
)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT
    ei.id,
    ei.title,
    ei.slug,
    ei.category,
    ST_Y(ei.location_geom) AS lat,
    ST_X(ei.location_geom) AS lng
  FROM public.evidence_items ei
  WHERE ei.location_geom IS NOT NULL
    AND ei.review_status = 'published'
    AND ei.visibility = 'public'
    AND ei.location_geom && ST_MakeEnvelope(bbox_west, bbox_south, bbox_east, bbox_north, 4326)
  ORDER BY ei.created_at DESC
  LIMIT max_results;
$$;

/** GeoJSON feature collection for a map layer. */
CREATE OR REPLACE FUNCTION geojson_evidence_events()
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'type', 'FeatureCollection',
    'features', COALESCE(jsonb_agg(
      jsonb_build_object(
        'type', 'Feature',
        'geometry', ST_AsGeoJSON(
          public.safe_location(ei.location_geom, ei.location_precision)
        )::jsonb,
        'properties', jsonb_build_object(
          'id', ei.id,
          'title', ei.title,
          'slug', ei.slug,
          'category', ei.category,
          'verification_level', ei.verification_level
        )
      )
      ORDER BY ei.created_at DESC
    ), '[]'::jsonb)
  )
  FROM public.evidence_items ei
  WHERE ei.location_geom IS NOT NULL
    AND ei.review_status = 'published'
    AND ei.visibility = 'public';
$$;

-- ============================================================================
-- DOWN MIGRATION
-- ============================================================================

/*
DROP FUNCTION IF EXISTS geojson_evidence_events();
DROP FUNCTION IF EXISTS evidence_in_bbox(numeric,numeric,numeric,numeric,int);
DROP FUNCTION IF EXISTS evidence_nearby(numeric,numeric,numeric,int);
DROP FUNCTION IF EXISTS safe_location(geometry,text);
DROP FUNCTION IF EXISTS safe_coordinate(numeric,text);
ALTER TABLE sources DROP COLUMN IF EXISTS region_geometry;
ALTER TABLE country_positions DROP COLUMN IF EXISTS jurisdiction_area;
ALTER TABLE organizations DROP COLUMN IF EXISTS operational_area;
ALTER TABLE evidence_items DROP COLUMN IF EXISTS location_geom;
*/
