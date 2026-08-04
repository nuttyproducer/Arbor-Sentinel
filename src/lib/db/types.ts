// src/lib/db/types.ts
// Database record types matching the Supabase schema.
// TypeScript (camelCase) ↔ PostgreSQL (snake_case) mapping.
// Generated as reference types — runtime mapping handled by Supabase client.

// ── Source ────────────────────────────────────────────────────────────────────

export interface SourceRecord {
  id: string;
  name: string;
  type: string;
  url: string | null;
  country: string | null;
  credibilityTier: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Evidence Item ─────────────────────────────────────────────────────────────

export interface EvidenceItemRecord {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string | null;
  category: string;
  incidentDate: string | null;
  publicationDate: string | null;
  locationName: string | null;
  countryOrTerritory: string | null;
  lat: number | null;
  lng: number | null;
  locationPrecision: string | null;
  verificationLevel: number;
  sourceId: string | null;
  legalTags: string[];
  humanitarianTags: string[];
  visibility: string;
  reviewStatus: string;
  createdBy: string | null;
  reviewedBy: string | null;
  lastReviewedAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// ── Evidence Reference ────────────────────────────────────────────────────────

export interface EvidenceReferenceRecord {
  id: string;
  evidenceItemId: string;
  sourceId: string | null;
  url: string | null;
  archiveUrl: string | null;
  quoteExcerpt: string | null;
  referenceType: string | null;
  createdAt: string;
}

// ── Country ───────────────────────────────────────────────────────────────────

export interface CountryRecord {
  id: string;
  name: string;
  isoCode: string | null;
  region: string | null;
  euMember: boolean;
  natoMember: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

// ── Country Position ──────────────────────────────────────────────────────────

export interface CountryPositionRecord {
  id: string;
  countryId: string;
  issue: string;
  positionSummary: string | null;
  score: number | null;
  sourceUrl: string | null;
  lastVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Action ────────────────────────────────────────────────────────────────────

export interface ActionRecord {
  id: string;
  countryId: string | null;
  title: string;
  slug: string;
  actionType: string | null;
  issue: string | null;
  templateBody: string | null;
  language: string | null;
  recipientType: string | null;
  recipientName: string | null;
  recipientUrl: string | null;
  sourceNotes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Organization ──────────────────────────────────────────────────────────────

export interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  type: string | null;
  website: string | null;
  officialDonationUrl: string | null;
  regions: string[];
  services: string[];
  partnershipStatus: string | null;
  verificationDocumentUrl: string | null;
  lastVerifiedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Legal Case ────────────────────────────────────────────────────────────────

export interface LegalCaseRecord {
  id: string;
  title: string;
  institution: string | null;
  jurisdiction: string | null;
  status: string | null;
  summary: string | null;
  openedDate: string | null;
  latestUpdateDate: string | null;
  sourceUrl: string | null;
  actionRelevance: string | null;
  lastReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Dossier ───────────────────────────────────────────────────────────────────

export interface DossierRecord {
  id: string;
  title: string | null;
  slug: string;
  countryId: string | null;
  issue: string | null;
  language: string | null;
  format: string | null;
  htmlContent: string | null;
  pdfUrl: string | null;
  version: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Correction ────────────────────────────────────────────────────────────────

export interface CorrectionRecord {
  id: string;
  targetType: string;
  targetId: string;
  reason: string | null;
  message: string | null;
  submitterEmailHash: string | null;
  status: string;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Collector Run ─────────────────────────────────────────────────────────────

export interface CollectorRunRecord {
  id: string;
  sourceId: string;
  collectorType: string;
  status: 'running' | 'completed' | 'failed';
  itemsFetched: number;
  itemsValidated: number;
  itemsStored: number;
  stageDurations: Record<string, number>;
  errors: Record<string, unknown>[];
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
}

// ── AI Operation ──────────────────────────────────────────────────────────────

export interface AIOperationRecord {
  id: string;
  operationType: string;
  modelUsed: string;
  confidence: number;
  tokensInput: number;
  tokensOutput: number;
  latencyMs: number;
  sourceSpans: Record<string, unknown>[];
  data: Record<string, unknown> | null;
  warnings: string[];
  status: string;
  createdAt: string;
}

// ── Review Queue Item ─────────────────────────────────────────────────────────

export interface ReviewQueueItemRecord {
  id: string;
  sourceContentType: string;
  sourceContentId: string;
  sourceContentSlug: string | null;
  reviewType: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  priorityScore: number;
  state: 'new' | 'assigned' | 'in_review' | 'changes_requested' | 'approved' | 'published' | 'rejected' | 'archived';
  assignedReviewer: string | null;
  dueBy: string | null;
  comments: Record<string, unknown>[];
  checklists: Record<string, unknown>[];
  stateHistory: Record<string, unknown>[];
  createdAt: string;
  updatedAt: string;
}

// ── Graph Node ────────────────────────────────────────────────────────────────

export interface GraphNodeRecord {
  id: string;
  type: 'source' | 'document' | 'entity' | 'event' | 'location' | 'claim' | 'country' | 'institution' | 'organization' | 'action';
  label: string;
  properties: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ── Graph Edge ────────────────────────────────────────────────────────────────

export interface GraphEdgeRecord {
  id: string;
  type: 'mentions' | 'occurs_at' | 'involves' | 'supports' | 'contradicts' | 'related_to' | 'authored_by' | 'published_by' | 'located_in' | 'part_of';
  sourceId: string;
  targetId: string;
  label: string;
  weight: number | null;
  properties: Record<string, unknown>;
  createdAt: string;
}

// ── Map Layer ─────────────────────────────────────────────────────────────────

export interface MapLayerRecord {
  id: string;
  name: string;
  layerType: 'tile' | 'geojson' | 'heatmap' | 'cluster';
  sourceConfig: Record<string, unknown>;
  style: Record<string, unknown> | null;
  visibility: boolean;
  zIndex: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// ── Content Version ───────────────────────────────────────────────────────────

export interface ContentVersionRecord {
  id: string;
  contentType: string;
  contentId: string;
  version: number;
  data: Record<string, unknown>;
  createdBy: string | null;
  createdAt: string;
}

// ── User Role ─────────────────────────────────────────────────────────────────

export interface UserRoleRecord {
  id: string;
  userId: string;
  role: 'public' | 'contributor' | 'researcher' | 'moderator' | 'partner_org' | 'legal_reviewer' | 'security_admin' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// ── Helper types for inserts/updates ──────────────────────────────────────────

/** Omit auto-generated fields for insert operations. */
export type InsertRecord<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/** Partial update — omit id and auto-generated fields. */
export type UpdateRecord<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

// ── Query result wrapper ──────────────────────────────────────────────────────

export interface QueryResult<T> {
  data: T | null;
  error: string | null;
}

export interface QueryListResult<T> {
  data: T[];
  count: number;
  error: string | null;
}
