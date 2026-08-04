// src/lib/api/types.ts
// API response types — shared between public and admin API clients.
// Consistent JSON response format: { data, meta, error }

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

// ── API Response ──────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  meta: PaginationMeta | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  requestId?: string;
  details?: Record<string, unknown>;
}

// ── List Response ─────────────────────────────────────────────────────────────

export interface ApiListResponse<T> {
  data: T[];
  meta: PaginationMeta;
  error: null;
}

// ── Sorting & Filtering ───────────────────────────────────────────────────────

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EvidenceFilterParams {
  category?: string;
  country?: string;
  verificationLevel?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface CountryFilterParams {
  region?: string;
  euMember?: boolean;
  search?: string;
}

export interface ActionFilterParams {
  countryId?: string;
  issue?: string;
  actionType?: string;
  activeOnly?: boolean;
}

export interface OrganizationFilterParams {
  type?: string;
  region?: string;
  partnershipStatus?: string;
  search?: string;
}

export interface LegalCaseFilterParams {
  institution?: string;
  jurisdiction?: string;
  status?: string;
  search?: string;
}

export interface DossierFilterParams {
  countryId?: string;
  issue?: string;
  publishedOnly?: boolean;
}

export interface SourceFilterParams {
  type?: string;
  country?: string;
  search?: string;
}

export interface SearchParams {
  query: string;
  types?: string[];
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  verificationLevel?: number;
  page?: number;
  perPage?: number;
}

// ── Correction types ──────────────────────────────────────────────────────────

export interface CorrectionSubmission {
  targetType: string;
  targetId: string;
  category: string;
  description: string;
  sourceUrl?: string;
  contactEmail?: string; // stored as hash only
}

export interface CorrectionModerationAction {
  action: 'approve' | 'reject' | 'request_clarification' | 'archive';
  reason?: string;
  notes?: string;
}

// ── Spatial types ─────────────────────────────────────────────────────────────

export interface SpatialQueryParams {
  lat: number;
  lng: number;
  radiusKm: number;
  types?: string[];
  limit?: number;
}

export interface BoundingBoxParams {
  north: number;
  south: number;
  east: number;
  west: number;
  types?: string[];
  limit?: number;
}
