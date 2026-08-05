// src/lib/api/client.ts
// Frontend API client — typed functions for all public endpoints.
// Uses fetch API with consistent error handling.

import type {
  ApiListResponse,
  ApiResponse,
  EvidenceFilterParams,
  CountryFilterParams,
  ActionFilterParams,
  OrganizationFilterParams,
  LegalCaseFilterParams,
  DossierFilterParams,
  SourceFilterParams,
  SearchParams,
  CorrectionSubmission,
  SpatialQueryParams,
  BoundingBoxParams,
  PaginationParams,
  SortParams,
} from './types';

// ── Config ────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1';

async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    return {
      data: null,
      meta: null,
      error: {
        code: `HTTP_${response.status}`,
        message: `Request failed: ${response.statusText}`,
      },
    };
  }

  return response.json();
}

async function apiPost<T, B = unknown>(path: string, body: B): Promise<ApiResponse<T>> {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return {
      data: null,
      meta: null,
      error: {
        code: `HTTP_${response.status}`,
        message: `Request failed: ${response.statusText}`,
      },
    };
  }

  return response.json();
}

// ── Evidence ──────────────────────────────────────────────────────────────────

export async function getEvidenceList(
  params: PaginationParams & SortParams & EvidenceFilterParams = {},
) {
  return apiGet<ApiListResponse<unknown>>('/evidence', params as Record<string, unknown>);
}

export async function getEvidenceBySlug(slug: string) {
  return apiGet<unknown>(`/evidence/${slug}`);
}

// ── Countries ─────────────────────────────────────────────────────────────────

export async function getCountriesList(
  params: PaginationParams & SortParams & CountryFilterParams = {},
) {
  return apiGet<ApiListResponse<unknown>>('/countries', params as Record<string, unknown>);
}

export async function getCountryBySlug(slug: string) {
  return apiGet<unknown>(`/countries/${slug}`);
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function getActionsList(
  params: PaginationParams & SortParams & ActionFilterParams = {},
) {
  return apiGet<ApiListResponse<unknown>>('/actions', params as Record<string, unknown>);
}

export async function getActionBySlug(slug: string) {
  return apiGet<unknown>(`/actions/${slug}`);
}

// ── Organizations ─────────────────────────────────────────────────────────────

export async function getOrganizationsList(
  params: PaginationParams & SortParams & OrganizationFilterParams = {},
) {
  return apiGet<ApiListResponse<unknown>>('/organizations', params as Record<string, unknown>);
}

export async function getOrganizationBySlug(slug: string) {
  return apiGet<unknown>(`/organizations/${slug}`);
}

// ── Legal Cases ───────────────────────────────────────────────────────────────

export async function getLegalCasesList(
  params: PaginationParams & SortParams & LegalCaseFilterParams = {},
) {
  return apiGet<ApiListResponse<unknown>>('/legal-cases', params as Record<string, unknown>);
}

export async function getLegalCaseById(id: string) {
  return apiGet<unknown>(`/legal-cases/${id}`);
}

// ── Dossiers ──────────────────────────────────────────────────────────────────

export async function getDossiersList(
  params: PaginationParams & SortParams & DossierFilterParams = {},
) {
  return apiGet<ApiListResponse<unknown>>('/dossiers', params as Record<string, unknown>);
}

export async function getDossierBySlug(slug: string) {
  return apiGet<unknown>(`/dossiers/${slug}`);
}

// ── Sources ───────────────────────────────────────────────────────────────────

export async function getSourcesList(
  params: PaginationParams & SortParams & SourceFilterParams = {},
) {
  return apiGet<ApiListResponse<unknown>>('/sources', params as Record<string, unknown>);
}

export async function getSourceById(id: string) {
  return apiGet<unknown>(`/sources/${id}`);
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function search(params: SearchParams) {
  return apiGet<ApiListResponse<unknown>>('/search', params as unknown as Record<string, unknown>);
}

// ── Corrections ───────────────────────────────────────────────────────────────

export async function submitCorrection(submission: CorrectionSubmission) {
  return apiPost<unknown, CorrectionSubmission>('/corrections', submission);
}

// ── Spatial / Map ─────────────────────────────────────────────────────────────

export async function getNearbyItems(params: SpatialQueryParams) {
  return apiGet<ApiListResponse<unknown>>('/locations/nearby', params as unknown as Record<string, unknown>);
}

export async function getItemsInBoundingBox(params: BoundingBoxParams) {
  return apiGet<ApiListResponse<unknown>>('/locations/bbox', params as unknown as Record<string, unknown>);
}

export async function getGeoJSON(layer: string) {
  return apiGet<unknown>(`/locations/geojson/${layer}`);
}
