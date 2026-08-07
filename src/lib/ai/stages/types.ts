// src/lib/ai/stages/types.ts

import type { SourceSpan } from "../types";

// ── Language Detection & Translation (M4.2-02) ────────────────────────────

export interface DetectionResult {
  /** ISO 639-1 language code. */
  languageCode: string;
  /** Human-readable language name. */
  languageName: string;
  /** Confidence 0–1. */
  confidence: number;
  /** Whether the content contains mixed languages. */
  isMixedLanguage: boolean;
  /** Other languages detected (if mixed). */
  otherLanguages?: string[];
  /** Whether the text is too short for reliable detection. */
  isShortText: boolean;
}

export interface TranslationResult {
  /** ISO 639-1 source language code. */
  sourceLanguage: string;
  /** ISO 639-1 target language code. */
  targetLanguage: string;
  /** The translated text. */
  translatedText: string;
  /** The original text (preserved). */
  originalText: string;
  /** Translation confidence 0–1. */
  confidence: number;
  /** Named entities preserved in original form. */
  preservedEntities: string[];
  /** Whether the translation has been human-reviewed. */
  humanReviewed: boolean;
}

export type RiskLevel = "low" | "medium" | "high";

export interface TranslationRiskClassification {
  /** Classified risk level. */
  riskLevel: RiskLevel;
  /** Reasons for the classification. */
  reasons: string[];
  /** Whether mandatory human review is required. */
  humanReviewRequired: boolean;
  /** Content categories detected (legal, casualty, testimony, identity). */
  detectedCategories: string[];
}

// ── Summarization (M4.2-03) ───────────────────────────────────────────────

export type SummaryType = "brief" | "normal" | "detailed";

export interface SummaryResult {
  /** The summary text. */
  summary: string;
  /** Type of summary produced. */
  type: SummaryType;
  /** Source spans that support the summary. */
  sourceSpans: SourceSpan[];
  /** Whether an ambiguity check was performed. */
  ambiguityChecked: boolean;
  /** Ambiguities preserved from the source. */
  preservedAmbiguities?: string[];
}

export interface FactExtraction {
  /** The extracted fact. */
  fact: string;
  /** Category: number, named_entity, legal_finding, policy_position, humanitarian_metric, date. */
  category: "number" | "named_entity" | "legal_finding" | "policy_position" | "humanitarian_metric" | "date";
  /** Confidence 0–1. */
  confidence: number;
  /** Exact source span in the original text. */
  sourceSpan: SourceSpan;
  /** Associated numeric value if the fact is a number. */
  numericValue?: number;
  /** Unit if the fact is a measurement. */
  unit?: string;
}

// ── Entity Extraction (M4.2-04) ────────────────────────────────────────────

import type { EntityType, ClaimType, EntityRelationshipType, ContradictionType, MatchLevel, HallucinationFlagType } from "../../taxonomy";
export type { EntityType, ClaimType, EntityRelationshipType, ContradictionType, MatchLevel, HallucinationFlagType };

// Re-export under the name AI stages expect (RelationshipType = EntityRelationshipType)
export type RelationshipType = EntityRelationshipType;

export interface ExtractedEntity {
  /** Unique ID for this entity mention. */
  id: string;
  /** Canonical name. */
  canonicalName: string;
  /** Known aliases or variations. */
  aliases: string[];
  /** Entity type. */
  entityType: EntityType;
  /** Confidence 0–1. */
  confidence: number;
  /** Source span where the entity was found. */
  sourceSpan: SourceSpan;
  /** Role or title (for persons). */
  role?: string;
  /** Affiliation (for persons: organization they belong to). */
  affiliation?: string;
  /** Organization type (for organizations: ngo, court, government, etc.). */
  organizationType?: string;
  /** Acronym (for organizations). */
  acronym?: string;
  /** Parent location (for locations). */
  parentLocation?: string;
  /** Location type (for locations: country, region, city, etc.). */
  locationType?: string;
  /** Date value in ISO format (for dates). */
  dateValue?: string;
  /** Case number (for legal cases). */
  caseNumber?: string;
  /** Court name (for legal cases). */
  court?: string;
  /** Whether the entity has been linked to an existing entity. */
  linked: boolean;
  /** ID of the linked entity, if any. */
  linkedEntityId?: string;
}

export interface EntityLink {
  /** Source entity mention ID. */
  sourceEntityId: string;
  /** Target canonical entity ID. */
  targetEntityId: string;
  /** Confidence in this link. */
  confidence: number;
}

// ── Claim Extraction (M4.2-05) ────────────────────────────────────────────

export type ClaimVerificationStatus = "unverified" | "verified" | "contradicted";

export interface ExtractedClaim {
  /** Unique claim ID. */
  id: string;
  /** The claim text. */
  claimText: string;
  /** Claim type classification. */
  claimType: ClaimType;
  /** Confidence 0–1. */
  confidence: number;
  /** Source span supporting this claim. */
  sourceSpan: SourceSpan;
  /** Linked entity IDs. */
  linkedEntityIds: string[];
  /** Verification status — always "unverified" unless from a verified source. */
  verificationStatus: ClaimVerificationStatus;
  /** Whether this is a nested claim (part of a compound statement). */
  isNested: boolean;
  /** Parent claim ID if nested. */
  parentClaimId?: string;
  /** Whether the claim is from opinion/editorial content. */
  fromOpinionContent: boolean;
}

// ── Timeline Extraction (M4.2-06) ─────────────────────────────────────────

export type DatePrecision = "exact" | "month" | "year" | "range" | "ambiguous";

export interface TimelineEvent {
  /** Unique event ID. */
  id: string;
  /** Event description. */
  description: string;
  /** Date in ISO format (best available precision). */
  date: string;
  /** Precision classification. */
  datePrecision: DatePrecision;
  /** Original date text from source. */
  originalDateText: string;
  /** End date for ranges (ISO format). */
  endDate?: string;
  /** Whether the date is approximate. */
  isApproximate: boolean;
  /** Confidence 0–1. */
  confidence: number;
  /** Linked entity IDs. */
  linkedEntityIds: string[];
  /** Linked claim IDs. */
  linkedClaimIds: string[];
  /** Source span. */
  sourceSpan: SourceSpan;
  /** Whether the event has no date (undated). */
  isUndated: boolean;
}

// ── Geographic Extraction (M4.2-07) ───────────────────────────────────────

export type LocationPrecision = "country" | "region" | "city" | "district" | "exact" | "safe";

export interface ExtractedLocation {
  /** Unique location ID. */
  id: string;
  /** Location name. */
  name: string;
  /** Location type (country, region, city, district, named_location, geographic_feature). */
  locationType: string;
  /** Parent location name. */
  parentLocation?: string;
  /** Original precision from source. */
  sourcePrecision: LocationPrecision;
  /** Safe precision for public display (downgraded if necessary). */
  displayPrecision: LocationPrecision;
  /** Whether the precision was downgraded for safety. */
  precisionDowngraded: boolean;
  /** Coordinates (only if safe to display). */
  coordinates?: { lat: number; lon: number };
  /** GeoJSON feature representation. */
  geojson?: GeoJSONFeature;
  /** Confidence 0–1. */
  confidence: number;
  /** Source span. */
  sourceSpan: SourceSpan;
  /** Linked event IDs. */
  linkedEventIds: string[];
  /** Whether the location is unresolvable. */
  isUnresolvable: boolean;
  /** Original text if unresolvable ("here", "nearby"). */
  unresolvableReference?: string;
}

export interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point" | "Polygon";
    coordinates: number[] | number[][] | number[][][];
  };
  properties: Record<string, unknown>;
}

// ── Relationship Detection (M4.2-08) ──────────────────────────────────────

export type RelationshipDirection = "directed" | "undirected";

export type RelationshipStrength = "strong" | "weak" | "inferred";

export interface EntityRelationship {
  /** Unique relationship ID. */
  id: string;
  /** Source entity ID (or claim/event/document ID for non-entity relationships). */
  sourceEntityId: string;
  /** Target entity ID. */
  targetEntityId: string;
  /** Relationship type. */
  relationshipType: RelationshipType;
  /** Direction. */
  direction: RelationshipDirection;
  /** Relationship strength. */
  strength: RelationshipStrength;
  /** Human-readable label (e.g. "works for", "occurred at"). */
  label: string;
  /** Confidence 0–1. */
  confidence: number;
  /** Source spans supporting this relationship. */
  sourceSpans: SourceSpan[];
  /** Whether this is an inferred relationship (not explicit in source). */
  isInferred: boolean;
}

// ── Topic Classification (M4.2-09) ────────────────────────────────────────

export interface TopicClassification {
  /** Evidence category ID. */
  categoryId: string;
  /** Confidence 0–1 for this category. */
  confidence: number;
  /** Supporting evidence from text. */
  supportingEvidence: string;
  /** Alternative categories considered. */
  alternativesConsidered: string[];
  /** Whether this classification is at document or paragraph level. */
  level: "document" | "paragraph";
  /** Paragraph index if paragraph-level. */
  paragraphIndex?: number;
}

// ── Duplicate Detection (M4.2-10) ─────────────────────────────────────────

export interface DuplicateGroup {
  /** Primary record (the one to keep). */
  primaryRecordId: string;
  /** Records that are duplicates of the primary. */
  duplicateRecordIds: string[];
  /** How strong the match is. */
  matchLevel: MatchLevel;
  /** Similarity score 0–1. */
  similarityScore: number;
  /** Rationale for the match. */
  rationale: string;
  /** Fields where the records overlap. */
  matchingFields: string[];
  /** Confidence 0–1. */
  confidence: number;
}

export interface MergeProposal {
  /** The proposed primary record ID. */
  primaryRecordId: string;
  /** Record IDs to merge into the primary. */
  mergeRecordIds: string[];
  /** Rationale for the merge. */
  rationale: string;
  /** Which fields should be merged. */
  fieldsToMerge: string[];
  /** Confidence 0–1. */
  confidence: number;
}

// ── Contradiction Detection (M4.2-11) ─────────────────────────────────────

export type ContradictionSeverity = "critical" | "major" | "minor" | "informational";

export type ResolutionState =
  | "unresolved"
  | "under_review"
  | "resolved_one_correct"
  | "resolved_both_partial"
  | "resolved_outdated_source";

export interface ContradictionReport {
  /** Unique contradiction ID. */
  id: string;
  /** The first claim in the contradiction pair. */
  claimA: { claimId: string; claimText: string; sourceId: string };
  /** The second claim in the contradiction pair. */
  claimB: { claimId: string; claimText: string; sourceId: string };
  /** Contradiction type. */
  contradictionType: ContradictionType;
  /** How severe the contradiction is. */
  severity: ContradictionSeverity;
  /** Which fields conflict. */
  conflictingFields: string[];
  /** Recommendation for human reviewer. */
  recommendation: "flag_for_review" | "request_clarification" | "monitor";
  /** Current resolution state. */
  resolutionState: ResolutionState;
  /** Who reviewed it (if resolved). */
  reviewedBy?: string;
  /** Resolution rationale. */
  resolutionRationale?: string;
  /** When resolved (ISO). */
  resolvedAt?: string;
}

// ── Confidence & Hallucination (M4.2-12) ──────────────────────────────────

export interface ConfidenceReport {
  /** Unified confidence score 0–1. */
  unifiedConfidence: number;
  /** Per-stage confidence scores. */
  stageScores: Record<string, number>;
  /** Source quality weight applied. */
  sourceQualityWeight: number;
  /** Whether human review is required. */
  requiresHumanReview: boolean;
  /** Factors contributing to the confidence score. */
  factors: {
    sourceQuality: number;
    extractionConsistency: number;
    crossSourceAgreement: number;
    temporalRelevance: number;
    languageConfidence: number;
  };
}

export type HallucinationSeverity = "critical" | "major" | "minor" | "informational";

export interface HallucinationFlag {
  /** Unique flag ID. */
  id: string;
  /** What type of hallucination was detected. */
  flagType: HallucinationFlagType;
  /** How severe. */
  severity: HallucinationSeverity;
  /** The claim or extraction being flagged. */
  flaggedContent: string;
  /** The source span it should match. */
  expectedSourceSpan: SourceSpan;
  /** Why it was flagged. */
  reason: string;
  /** The stage that produced the flagged output. */
  sourceStage: string;
  /** Whether this blocks publication. */
  blocksPublication: boolean;
}
