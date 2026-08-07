// src/lib/taxonomy/index.ts
// Single source of truth for classification vocabularies, discard reasons,
// entity types, and geographic scope labels. Consumed by client AI stages,
// edge functions, dashboards, relevance engine, and monitoring.

// ── Evidence Categories ──────────────────────────────────────────────────────
// Authoritative list used by the TopicClassifier AI stage and the relevance
// engine. Keep in sync with the ai-analyze edge function's prompt vocabulary.

export const EVIDENCE_CATEGORIES = [
  "civilian_casualties",
  "infrastructure_damage",
  "journalists_media_workers",
  "medical_workers_healthcare",
  "aid_obstruction",
  "food_water_sanitation",
  "forced_displacement",
  "housing_cultural_destruction",
  "detention_mistreatment",
  "torture_allegations",
  "mass_graves",
  "public_incitement",
  "arms_transfers",
  "humanitarian_access_restrictions",
  "ceasefire_violations",
] as const;

export type EvidenceCategory = (typeof EVIDENCE_CATEGORIES)[number];

// ── High-level classification (used by ai-analyze edge function) ────────────
// These map to the broader categories the edge function uses. The client
// TopicClassifier's fine-grained categories are the authoritative ground
// truth; these broad categories are for routing and display.

export const BROAD_CATEGORIES = [
  "war_crimes",
  "crimes_against_humanity",
  "genocide",
  "human_rights_violation",
  "legal_development",
  "political_development",
  "humanitarian",
  "civil_society",
  "academic_research",
  "other",
] as const;

export type BroadCategory = (typeof BROAD_CATEGORIES)[number];

// Mapping from fine-grained evidence categories → broad categories.
// Used when the edge function or dashboard needs a high-level label.
export const EVIDENCE_TO_BROAD: Record<EvidenceCategory, BroadCategory[]> = {
  civilian_casualties: ["war_crimes", "human_rights_violation"],
  infrastructure_damage: ["war_crimes"],
  journalists_media_workers: ["human_rights_violation"],
  medical_workers_healthcare: ["war_crimes", "human_rights_violation"],
  aid_obstruction: ["humanitarian", "war_crimes"],
  food_water_sanitation: ["humanitarian", "war_crimes"],
  forced_displacement: ["war_crimes", "crimes_against_humanity"],
  housing_cultural_destruction: ["war_crimes"],
  detention_mistreatment: ["human_rights_violation", "war_crimes"],
  torture_allegations: ["war_crimes", "crimes_against_humanity"],
  mass_graves: ["war_crimes", "crimes_against_humanity", "genocide"],
  public_incitement: ["genocide", "crimes_against_humanity"],
  arms_transfers: ["legal_development", "war_crimes"],
  humanitarian_access_restrictions: ["humanitarian", "war_crimes"],
  ceasefire_violations: ["war_crimes", "legal_development"],
};

// ── Urgency levels ───────────────────────────────────────────────────────────

export const URGENCY_LEVELS = [
  "critical",
  "high",
  "medium",
  "low",
  "informational",
] as const;

export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];

// ── Discard reasons ──────────────────────────────────────────────────────────
// Structured reasons recorded when content is rejected by the relevance engine.
// Every discarded item gets a reason — nothing disappears silently.

export const DISCARD_REASONS = [
  "below_relevance_threshold",
  "duplicate_content",
  "out_of_scope",
  "low_credibility_source",
  "non_accountability_topic",
  "opinion_editorial",
  "sports_entertainment",
  "parse_failure",
  "language_not_supported",
  "paywall_blocked",
  "rate_limited",
  "timeout",
  "max_retries_exceeded",
  "manual_override",
] as const;

export type DiscardReason = (typeof DISCARD_REASONS)[number];

// ── Entity types ─────────────────────────────────────────────────────────────

export const ENTITY_TYPES = [
  "person",
  "organization",
  "location",
  "date",
  "legal_instrument",
  "event",
  "country",
  "institution",
  "legal_case",   // needed by AI EntityExtractor stage
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

// ── Geographic scope labels ──────────────────────────────────────────────────

export const GEO_SCOPES = [
  "global",
  "regional",
  "national",
  "local",
  "gaza",
  "west_bank",
  "lebanon",
  "ukraine",
  "sudan",
  "myanmar",
  "drc",
  "yemen",
  "syria",
  "ethiopia",
  "sahel",
] as const;

export type GeoScope = (typeof GEO_SCOPES)[number];

// ── Claim types ───────────────────────────────────────────────────────────────
// Authoritative list used by ClaimExtractor AI stage and knowledge graph.

export const CLAIM_TYPES = [
  "legal",
  "humanitarian",
  "political",
  "factual",
  "allegation",
] as const;

export type ClaimType = (typeof CLAIM_TYPES)[number];

// ── Graph edge types ──────────────────────────────────────────────────────────
// Structural edge types for the knowledge graph. These describe how nodes
// connect — distinct from EntityRelationship types (affiliation, causal, etc.)
// which describe real-world relationships between entities.

export const GRAPH_EDGE_TYPES = [
  "mentions",
  "occurs_at",
  "involves",
  "supports",
  "contradicts",
  "related_to",
  "authored_by",
  "published_by",
  "located_in",
  "part_of",
] as const;

export type GraphEdgeType = (typeof GRAPH_EDGE_TYPES)[number];

// ── Entity relationship types ─────────────────────────────────────────────────
// Real-world relationship categories between extracted entities.
// Used by the RelationshipDetector AI stage.

export const ENTITY_RELATIONSHIP_TYPES = [
  "affiliation",
  "association",
  "location",
  "temporal",
  "causal",
  "documentary",
] as const;

export type EntityRelationshipType = (typeof ENTITY_RELATIONSHIP_TYPES)[number];

// ── Contradiction types ───────────────────────────────────────────────────────

export const CONTRADICTION_TYPES = [
  "numerical",
  "factual",
  "temporal",
  "source_source",
  "source_quality",
] as const;

export type ContradictionType = (typeof CONTRADICTION_TYPES)[number];

// ── Match levels (for deduplication) ──────────────────────────────────────────

export const MATCH_LEVELS = [
  "exact_duplicate",
  "near_duplicate",
  "related",
  "new",
] as const;

export type MatchLevel = (typeof MATCH_LEVELS)[number];

// ── Hallucination flag types ──────────────────────────────────────────────────

export const HALLUCINATION_FLAG_TYPES = [
  "unsupported_claim",
  "numerical_mismatch",
  "entity_hallucination",
  "relationship_hallucination",
  "temporal_hallucination",
] as const;

export type HallucinationFlagType = (typeof HALLUCINATION_FLAG_TYPES)[number];

// ── Content types ────────────────────────────────────────────────────────────

export const CONTENT_TYPES = [
  "news_report",
  "legal_document",
  "academic_paper",
  "ngo_report",
  "press_release",
  "official_statement",
  "testimony",
  "data_release",
  "investigative_report",
  "opinion_editorial",
  "other",
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];
