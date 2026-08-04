/**
 * Types for the local static search and relationship layer.
 *
 * No external service, no query logging, no analytics,
 * no user profile — client-side only.
 */

import type { SourceType, ContentStatus, VerificationLevel, LegalStatus } from "../../types/content";

// ── Record type discriminant ────────────────────────────────────────────────

export type SearchableRecordType =
  | "source"
  | "evidence"
  | "legal_case"
  | "organization"
  | "action"
  | "country"
  | "institution"
  | "dossier"
  | "trust_page";

export const RECORD_TYPE_LABELS: Record<SearchableRecordType, string> = {
  source: "Source",
  evidence: "Evidence record",
  legal_case: "Legal case",
  organization: "Organization",
  action: "Action template",
  country: "Country",
  institution: "Institution",
  dossier: "Dossier",
  trust_page: "Trust / methodology page",
};

// ── Normalized searchable record ────────────────────────────────────────────

/**
 * Every public record in the platform maps to this shape for search indexing.
 * Fields are populated based on what each record type provides.
 */
export interface SearchableRecord {
  /** Unique ID — the record's native id, scoped by type for uniqueness. */
  id: string;
  /** The record type discriminant. */
  type: SearchableRecordType;
  /** Primary display title or name. */
  title: string;
  /** Short description, summary, or purpose. */
  description: string;
  /** Route on this platform. */
  route: string;
  /** Searchable tags or keywords. */
  tags: string[];
  /** Publisher, institution, or issuing body. */
  publisher?: string;
  /** Category, action type, or dossier type label. */
  category?: string;
  /** Jurisdiction scope. */
  jurisdiction?: string;
  /** Source types for evidence items. */
  sourceType?: SourceType;
  /** Content/editorial status. */
  contentStatus?: ContentStatus;
  /** Verification / source-quality level. */
  sourceQuality?: VerificationLevel;
  /** Legal statuses. */
  legalStatuses?: LegalStatus[];
  /** Language code. */
  language?: string;
  /** Whether this record is currently active/public. */
  active: boolean;
}

// ── Search query ────────────────────────────────────────────────────────────

export interface SearchQuery {
  /** Raw query string from the user. */
  query: string;
  /** Optional filter: only return records of these types. */
  typeFilter?: SearchableRecordType[];
}

// ── Search result ───────────────────────────────────────────────────────────

export interface SearchResult {
  /** The matching record. */
  record: SearchableRecord;
  /** Relevance score — higher = more relevant. */
  score: number;
  /** The specific field(s) that matched, for display hints. */
  matchedFields: string[];
}

// ── Search response ─────────────────────────────────────────────────────────

export interface SearchResponse {
  /** The query that produced these results. */
  query: string;
  /** Results sorted by relevance, highest first. */
  results: SearchResult[];
  /** Total records in the index (for "searching across N records"). */
  totalIndexed: number;
  /** Time taken in milliseconds. */
  tookMs: number;
}

// ── Cross-record relationships ──────────────────────────────────────────────

/** A related record reference. */
export interface RelatedRecord {
  /** The related record's unique ID. */
  id: string;
  /** The related record's type. */
  type: SearchableRecordType;
  /** Display title. */
  title: string;
  /** Route on this platform. */
  route: string;
  /** Relationship direction description. */
  relationship: string;
}

/** Resolved relationships for a given record. */
export interface RecordRelationships {
  /** The record these relationships are for. */
  recordId: string;
  /** Records that reference this record. */
  referencedBy: RelatedRecord[];
  /** Records that this record references. */
  references: RelatedRecord[];
}
