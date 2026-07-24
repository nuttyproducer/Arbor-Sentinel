export type ContentStatus =
  | "draft"
  | "static_preview"
  | "review_pending"
  | "reviewed"
  | "disputed"
  | "corrected"
  | "archived";

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  draft: "Draft",
  static_preview: "Static preview",
  review_pending: "Review pending",
  reviewed: "Reviewed",
  disputed: "Disputed",
  corrected: "Corrected",
  archived: "Archived",
};

export type LegalStatus =
  | "court_proceeding_active"
  | "provisional_measures_issued"
  | "arrest_warrant_issued"
  | "allegation_under_investigation"
  | "un_finding"
  | "ngo_legal_determination"
  | "not_judicially_determined"
  | "contested_claim"
  | "requires_further_verification";

export const LEGAL_STATUS_LABELS: Record<LegalStatus, string> = {
  court_proceeding_active: "Court proceeding active",
  provisional_measures_issued: "Provisional measures issued",
  arrest_warrant_issued: "Arrest warrant issued",
  allegation_under_investigation: "Allegation under investigation",
  un_finding: "UN finding",
  ngo_legal_determination: "NGO legal determination",
  not_judicially_determined: "Not yet judicially determined",
  contested_claim: "Contested claim",
  requires_further_verification: "Requires further verification",
};

export type VerificationLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const VERIFICATION_LEVEL_LABELS: Record<VerificationLevel, string> = {
  0: "Unreviewed lead",
  1: "Preserved lead",
  2: "Source checked",
  3: "Corroborated",
  4: "Trusted organization verified",
  5: "Legal/institutional record",
};

export type SourceType =
  | "court"
  | "un"
  | "government"
  | "humanitarian"
  | "ngo"
  | "academic"
  | "journalism"
  | "osint";

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  court: "Court / legal record",
  un: "UN / international body",
  government: "Government / parliamentary record",
  humanitarian: "Humanitarian organization",
  ngo: "Human-rights organization",
  academic: "Academic research",
  journalism: "Investigative journalism",
  osint: "OSINT / documentation group",
};

/** Source record status — describes URL and currency state. */
export type SourceStatus = "active" | "broken" | "archived" | "superseded";

export const SOURCE_STATUS_LABELS: Record<SourceStatus, string> = {
  active: "Active",
  broken: "Broken link",
  archived: "Archived",
  superseded: "Superseded",
};

export interface SourceRecord {
  id: string;
  /** URL-safe slug for routing. */
  slug: string;
  title: string;
  publisher: string;
  sourceType: SourceType;
  /** The document type, e.g. "court order", "report", "resolution", "filing". */
  documentType?: string;
  url: string;
  publicationDate?: string;
  accessedAt: string;
  archiveUrl?: string;
  language?: string;
  /** Legal or institutional jurisdiction, e.g. "International", "Belgium". */
  jurisdiction?: string;
  /** Authors or issuing body, if distinct from publisher. */
  authors?: string[];
  /** Whether this is an official institutional record. */
  official?: boolean;
  /** Source currency status. */
  status: SourceStatus;
  /** Notes safe for public display — no private/internal review notes. */
  notes?: string;
  /** Schema version of this record. */
  version: number;
  /** When the URL was last verified as resolving correctly. */
  lastCheckedAt?: string;
  /** Route to the corrections process. */
  correctionUrl: string;
}

export interface ReviewMetadata {
  contentStatus: ContentStatus;
  sourceQuality?: VerificationLevel;
  sourceIds: string[];
  legalStatuses?: LegalStatus[];
  lastReviewedAt?: string;
  reviewedByRole?: string;
  version: number;
  methodologyUrl?: string;
  correctionUrl?: string;
  reviewNotes?: string;
}

export interface BasePreviewRecord {
  id: string;
  title: string;
  summary: string;
  review: ReviewMetadata;
}

// ── Dossier ─────────────────────────────────────────────────────────────────

/** Dossier type — corresponds to PRD dossier types. */
export type DossierType =
  | "one_page_brief"
  | "five_page_memo"
  | "full_dossier"
  | "journalist_briefing"
  | "council_motion_pack"
  | "mp_contact_pack"
  | "humanitarian_access_brief"
  | "arms_transfer_brief"
  | "legal_accountability_brief";

export const DOSSIER_TYPE_LABELS: Record<DossierType, string> = {
  one_page_brief: "One-page executive brief",
  five_page_memo: "Five-page policy memo",
  full_dossier: "Full evidence dossier",
  journalist_briefing: "Journalist briefing",
  council_motion_pack: "Local council motion pack",
  mp_contact_pack: "MP/MEP contact pack",
  humanitarian_access_brief: "Humanitarian access brief",
  arms_transfer_brief: "Arms-transfer review brief",
  legal_accountability_brief: "Legal accountability brief",
};

/** Target audience for a dossier. */
export type DossierAudience =
  | "citizen"
  | "journalist"
  | "researcher"
  | "policymaker"
  | "ngo"
  | "legal_professional";

export const DOSSIER_AUDIENCE_LABELS: Record<DossierAudience, string> = {
  citizen: "Concerned citizens",
  journalist: "Journalists and researchers",
  researcher: "Academic researchers",
  policymaker: "Policymakers and staffers",
  ngo: "NGOs and humanitarian organizations",
  legal_professional: "Legal workers and human-rights defenders",
};

/** Generation status for dossier output. */
export type DossierGenerationStatus =
  | "manual_static_preview"
  | "generation_inactive";

export const DOSSIER_GENERATION_STATUS_LABELS: Record<DossierGenerationStatus, string> = {
  manual_static_preview: "Static preview — manually constructed",
  generation_inactive: "Automated generation not yet active",
};

/**
 * A structured dossier record.
 *
 * Dossiers are assembled from reviewed records (evidence, legal cases,
 * country/institution data, and sources). During the static beta,
 * dossiers are manually constructed previews. Automated generation
 * from reviewed records will be implemented in a later phase.
 */
export interface DossierRecord {
  /** Stable unique identifier — kebab-case. */
  id: string;
  /** URL-safe slug for routing. */
  slug: string;
  /** Human-readable title. */
  title: string;
  /** Dossier type from the controlled vocabulary. */
  dossierType: DossierType;
  /** Primary intended audience. */
  audience: DossierAudience;
  /** Issue or crisis focus (e.g. "Gaza accountability"). */
  issueFocus: string;
  /** Jurisdiction scope, e.g. "International", "Belgium", "European Union". */
  jurisdiction: string;
  /** Language code (ISO 639-1). */
  language: string;
  /** One-paragraph executive summary. */
  executiveSummary: string;
  /** IDs of evidence items that provide key factual support. */
  keyFactRecordIds: string[];
  /** IDs of legal cases referenced in the dossier. */
  legalCaseIds: string[];
  /** IDs of country or institution entries referenced. */
  countryOrInstitutionIds: string[];
  /** Policy asks derived from sourced records. */
  policyAsks: string[];
  /** Recommended lawful actions. */
  recommendedActions: string[];
  /** IDs of source records supporting dossier content. */
  sourceIds: string[];
  /** Editorial and review status. */
  contentStatus: ContentStatus;
  /** Generation status — always generation_inactive or manual_static_preview during static beta. */
  generationStatus: DossierGenerationStatus;
  /** Schema version of this record. */
  version: number;
  /** When this dossier was created or last assembled. */
  createdAt: string;
  /** When this dossier was last reviewed. */
  lastReviewedAt?: string;
  /** Role that performed the last review. */
  reviewedByRole?: string;
  /** Route to the corrections process. */
  correctionUrl: string;
}

// ── Translation ──────────────────────────────────────────────────────────────

/** Controlled translation status vocabulary. */
export type TranslationStatus =
  | "not_started"
  | "draft"
  | "review_pending"
  | "reviewed"
  | "outdated"
  | "archived";

export const TRANSLATION_STATUS_LABELS: Record<TranslationStatus, string> = {
  not_started: "Not started",
  draft: "Draft translation",
  review_pending: "Translation review pending",
  reviewed: "Translation reviewed",
  outdated: "Translation outdated",
  archived: "Translation archived",
};

/** Metadata for a translated content item. */
export interface TranslationMetadata {
  /** ISO 639-1 code of the source language. */
  sourceLanguage: string;
  /** ISO 639-1 code of the target language. */
  targetLanguage: string;
  /** Current translation status. */
  translationStatus: TranslationStatus;
  /** Whether machine translation was used in the draft. */
  machineAssisted: boolean;
  /** Role that produced the translation draft. */
  translatedByRole?: string;
  /** Role that reviewed the translation. */
  reviewedByRole?: string;
  /** When the translation was last reviewed. */
  lastReviewedAt?: string;
  /** Schema version of this translation record. */
  version: number;
}

// ── Dossier template ─────────────────────────────────────────────────────────

/** Dossier template metadata — describes a dossier type without the full content. */
export interface DossierTemplate {
  /** Template identifier. */
  id: string;
  /** The dossier type this template describes. */
  dossierType: DossierType;
  /** Human-readable label. */
  label: string;
  /** What this template produces. */
  description: string;
  /** Typical inputs/parameters. */
  inputs: string[];
  /** Typical output structure. */
  outputStructure: string[];
  /** Whether automated generation is active for this template. */
  generationActive: boolean;
}

// ── Legal Timeline ─────────────────────────────────────────────────────────

/** Controlled procedural event types for legal case timelines. */
export type LegalTimelineEventType =
  | "filing"
  | "jurisdiction_decision"
  | "investigation_opened"
  | "provisional_measure"
  | "arrest_warrant_application"
  | "arrest_warrant_issued"
  | "hearing"
  | "order"
  | "judgment"
  | "intervention"
  | "official_report_update";

export const LEGAL_TIMELINE_EVENT_LABELS: Record<LegalTimelineEventType, string> = {
  filing: "Filing",
  jurisdiction_decision: "Jurisdiction decision",
  investigation_opened: "Investigation opened",
  provisional_measure: "Provisional measure",
  arrest_warrant_application: "Arrest warrant application",
  arrest_warrant_issued: "Arrest warrant issued",
  hearing: "Hearing",
  order: "Order",
  judgment: "Judgment",
  intervention: "Intervention",
  official_report_update: "Official report / update",
};

// ── Country & Institution Accountability ─────────────────────────────────────

/** Record of a government position on a specific issue at a specific date. */
export interface CountryPositionRecord {
  id: string;
  area: string;
  position: string;
  attribution: string;
  date: string;
  sourceIds: string[];
  contentStatus: ContentStatus;
  version: number;
  correctionUrl: string;
}

/** Record of an EU institution's position or action. */
export interface InstitutionPositionRecord {
  id: string;
  institution: string;
  area: string;
  position: string;
  attribution: string;
  date: string;
  sourceIds: string[];
  contentStatus: ContentStatus;
  version: number;
  correctionUrl: string;
}

/** Describes a division of legal or political competence. */
export interface CompetencyRecord {
  id: string;
  level: "federal" | "regional" | "eu" | "international" | "shared";
  area: string;
  description: string;
  belongsTo: string;
  doesNotBelongTo: string;
  sourceIds: string[];
  contentStatus: ContentStatus;
  version: number;
  correctionUrl: string;
}

/** Record of a vote at a multilateral body. */
export interface VoteRecord {
  id: string;
  body: string;
  resolution: string;
  date: string;
  vote: "yes" | "no" | "abstain" | "absent";
  sourceIds: string[];
  contentStatus: ContentStatus;
  version: number;
  correctionUrl: string;
}

/** Record of a public official statement. */
export interface OfficialStatementRecord {
  id: string;
  speaker: string;
  office: string;
  date: string;
  summary: string;
  sourceIds: string[];
  contentStatus: ContentStatus;
  version: number;
  correctionUrl: string;
}

/** Record of an arms-transfer policy, decision, or legal action. */
export interface ArmsTransferPolicyRecord {
  id: string;
  level: "federal" | "regional" | "eu";
  authority: string;
  date: string;
  policy: string;
  sourceIds: string[];
  contentStatus: ContentStatus;
  version: number;
  correctionUrl: string;
}

/** Record of a humanitarian aid contribution or commitment. */
export interface HumanitarianAidRecord {
  id: string;
  recipient: string;
  amount: string;
  period: string;
  channel: string;
  sourceIds: string[];
  contentStatus: ContentStatus;
  version: number;
  correctionUrl: string;
}

/** Record of an official contact route for civic engagement. */
export interface ContactRouteRecord {
  id: string;
  entity: string;
  route: string;
  url?: string;
  notes: string;
  sourceIds: string[];
  contentStatus: ContentStatus;
  version: number;
  correctionUrl: string;
}

/** A single procedural event in a legal case timeline. */
export interface LegalTimelineEvent {
  /** Unique identifier for this timeline event. */
  id: string;
  /** References the legal case this event belongs to. */
  legalCaseId: string;
  /** Date of the procedural event (ISO 8601). */
  date: string;
  /** Controlled event type from the procedural vocabulary. */
  eventType: LegalTimelineEventType;
  /** Brief title for this timeline entry. */
  title: string;
  /** Careful procedural summary — distinguishes allegations from findings. */
  proceduralSummary: string;
  /** Source document IDs that support this timeline entry. */
  sourceIds: string[];
  /** Editorial content status of this timeline entry. */
  contentStatus: ContentStatus;
  /** Verification level of the underlying sources. */
  sourceQuality: VerificationLevel;
  /** Schema version of this timeline record. */
  version: number;
  /** When this timeline entry was last reviewed. */
  lastReviewedAt?: string;
  /** Role that performed the review — not a personal name. */
  reviewedByRole?: string;
  /** Route to the corrections process. */
  correctionUrl: string;
}
