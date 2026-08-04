// src/lib/map/spatial.ts
// Spatial query functions — distance, bounding box, containment.
// Wraps PostGIS functions from the database.

import { supabase } from '../db/client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NearbyParams {
  lat: number;
  lng: number;
  radiusKm: number;
  maxResults?: number;
}

export interface BoundingBoxParams {
  north: number;
  south: number;
  east: number;
  west: number;
  maxResults?: number;
}

export interface NearbyResult {
  id: string;
  title: string;
  slug: string;
  category: string;
  lat: number;
  lng: number;
  distanceKm: number;
}

export interface BBoxResult {
  id: string;
  title: string;
  slug: string;
  category: string;
  lat: number;
  lng: number;
}

// ── Nearby query ──────────────────────────────────────────────────────────────

export async function findNearby(params: NearbyParams): Promise<NearbyResult[]> {
  const { lat, lng, radiusKm, maxResults = 50 } = params;

  const { data, error } = await supabase.rpc('evidence_nearby', {
    center_lat: lat,
    center_lng: lng,
    radius_km: radiusKm,
    max_results: maxResults,
  });

  if (error) {
    console.error('Nearby query failed:', error.message);
    return [];
  }

  return (data as NearbyResult[]) ?? [];
}

// ── Bounding box query ────────────────────────────────────────────────────────

export async function findInBoundingBox(params: BoundingBoxParams): Promise<BBoxResult[]> {
  const { north, south, east, west, maxResults = 200 } = params;

  // Enforce maximum bounding box size (~1000km x 1000km)
  const latSpan = Math.abs(north - south);
  const lngSpan = Math.abs(east - west);
  if (latSpan > 10 || lngSpan > 10) {
    throw new Error('Bounding box too large. Maximum span is 10 degrees (~1000 km).');
  }

  const { data, error } = await supabase.rpc('evidence_in_bbox', {
    bbox_north: north,
    bbox_south: south,
    bbox_east: east,
    bbox_west: west,
    max_results: maxResults,
  });

  if (error) {
    console.error('Bounding box query failed:', error.message);
    return [];
  }

  return (data as BBoxResult[]) ?? [];
}

// ── GeoJSON ───────────────────────────────────────────────────────────────────

export async function getEvidenceGeoJSON() {
  const { data, error } = await supabase.rpc('geojson_evidence_events');

  if (error) {
    console.error('GeoJSON query failed:', error.message);
    return null;
  }

  return data;
}
