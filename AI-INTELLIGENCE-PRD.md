# Accountability Atlas — AI Intelligence Layer Product Requirements Document

**Document title:** AI Intelligence Layer PRD
**Project:** Accountability Atlas
**Version:** 1.0
**Date:** 2026-07-24
**Status:** Draft for review
**Supersedes:** `AI_Intelligence_Architecture_Addendum.md` (now marked as superseded)

**Companion documents:** `PRD-v2.md` (canonical product requirements), `PRD-v1-archive.md` (detailed page specs, SQL schemas, risk register), `ROADMAP-v2.md` (milestone integration), `PROJECT-ARCHITECTURE.md` (technical architecture)

---

## Table of Contents

1. Executive Summary
2. Core Principles
3. Collector Framework
4. Normalization Layer
5. AI Pipeline
6. Review Queue System
7. Maps and Geospatial
8. Timeline Engine
9. Knowledge Graph
10. Intelligence Dashboard
11. Testing and Quality Assurance
12. Monitoring and Operations
13. Roadmap Integration

---

## 1. Executive Summary

### 1.1 Purpose

The AI Intelligence Layer transforms Accountability Atlas from a static evidence website into a civic intelligence platform. It is an AI-assisted human-review system for ingesting, processing, understanding, and organizing publicly available sources about atrocity crimes, humanitarian harm, legal accountability, and institutional responsibility.

The layer never operates autonomously. Every AI output — every summary, translation, entity extraction, relationship suggestion, timeline entry, and classification — passes through mandatory human review before it reaches any public surface. AI proposes. Humans verify. The system publishes only when a qualified reviewer approves.

### 1.2 What Problem It Solves

Accountability Atlas currently relies on manual research, curation, and data entry. This does not scale. During the static beta, a small team can manage dozens of evidence items manually. At production scale, the platform must process hundreds of sources per day across multiple languages, source types, and jurisdictions. No small team can do this alone.

The AI Intelligence Layer provides:

- **Automated ingestion**: Collectors fetch new content from UN agencies, courts, NGOs, journalism feeds, academic sources, and government portals on a scheduled basis.
- **Structured extraction**: AI converts unstructured text (press releases, reports, statements, rulings) into structured records with entities, dates, locations, claims, and categories.
- **Human review workflow**: Every extraction enters a review queue where qualified reviewers verify, correct, or reject AI proposals before anything reaches the public.
- **Connected intelligence**: The knowledge graph links evidence, events, entities, and sources so users can traverse from a country page to relevant legal cases to specific evidence items.
- **Temporal and geographic mapping**: Extracted dates feed timeline views; extracted locations feed interactive maps with safe precision controls.

### 1.3 Guiding Metaphor

Think of the AI Intelligence Layer as a **research assistant that drafts everything in pencil**. The assistant can read many documents quickly, identify patterns, suggest connections, and prepare structured summaries. But nothing leaves the desk until a qualified human reviewer reads the pencil draft, makes corrections, and signs off in ink.

### 1.4 How It Fits the Broader Platform

```
Public Sources (UN, Courts, NGOs, Govts, Journalism, Academia)
        │
        ▼
┌─────────────────────────────────────────────────┐
│           1. Collector Framework                │
│   Fetch → Validate → Normalize → Deduplicate    │
└─────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────┐
│             2. AI Pipeline                      │
│   Translate → Summarize → Extract → Classify    │
│   → Entity Link → Detect Duplicates/Contradict  │
└─────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────┐
│         3. Review Queue System                  │
│   New → Assigned → In Review → Changes → Pub    │
└─────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────┐
│        4. Public Platform (PRD-v2.md)           │
│  Evidence Library, Legal Tracker, Country Pages │
│  Action Hub, Dossiers, Maps, Timelines          │
└─────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────┐
│        5. Knowledge Graph                       │
│  Sources → Claims → Evidence → Events → Entities│
└─────────────────────────────────────────────────┘
```

### 1.5 Relationship to Other Documents

This document is the technical specification for Milestone 4 of the product roadmap (see `ROADMAP-v2.md`). It assumes the reader is familiar with:

- The product vision and constitutional principles (`PRD-v2.md`)
- The five product pillars (`PRD-v1-archive.md` Section 7)
- The verification levels (`PRD-v1-archive.md` Section 7.1, table)
- The ethical AI policy (`PRD-v1-archive.md` Section 33)
- The source hierarchy (`PRD-v1-archive.md` Section 11.1)
- The review gates (`PRD-v1-archive.md` Section 11.3)
- The future data model (`PRD-v1-archive.md` Section 16)
- The content review workflow (`PRD-v1-archive.md` Section 11.4)

### 1.6 Out of Scope (for this document)

This document does **not** cover:

- The public-facing UI components (pages, cards, badges) — these are in `PRD-v2.md` and `PRD-v1-archive.md`
- The backend infrastructure (Supabase/Django, hosting) — these are in `PROJECT-ARCHITECTURE.md`
- The specific collector implementation code — only the contracts are defined here
- The specific AI model selection — only the routing principles are defined
- Legal or regulatory compliance review of AI outputs — covered by the review workflow
- Witness testimony processing, SecureDrop integration, or sensitive vault workflows (deferred to later phases)
---

## 2. Core Principles

### 2.1 AI Assists Humans. AI Never Publishes.

This is the single non-negotiable rule of the system. Every AI operation generates a **proposal** — never a publication. The system architecture must enforce this at every layer:

- AI outputs are stored with a `status: "ai_proposed"` flag
- Public endpoints filter on `status = "published"` only
- No API route, database trigger, or scheduled job can promote AI output to published status
- Only a human reviewer acting through the review queue UI can set `status = "published"`

### 2.2 Every AI Output Carries Complete Provenance

Every AI operation result must include:

- **Proposed content**: The output itself (summary, translation, extraction, classification)
- **Confidence score**: A 0–1 value calibrated per operation type
- **Source span references**: Specific character ranges or paragraph references in the original source that support each claim in the output
- **Model and version**: The exact model name and version that produced the output
- **Timestamp**: ISO 8601 timestamp of when the AI operation completed
- **Warnings**: Any known limitations, edge cases, or concerns identified during processing

This provenance is never stripped. It follows the content through the review queue and into the database, where it remains even after publication for audit purposes.

### 2.3 Human Review Is Mandatory Before Any AI-Assisted Content Reaches Publication

The review queue is not optional. It is not a checkbox that can be automated. The architecture must make it impossible for AI output to bypass human review:

- Database rows have `review_status` and `published_at` columns
- Published content always has a `reviewed_by` human user reference
- The review queue UI is the only path to publication
- Scheduled jobs, API endpoints, and database triggers check review status before exposing content

### 2.4 AI Must Preserve Source Provenance Through Every Transformation

When the AI pipeline transforms a source — translating it, then summarizing the translation, then extracting entities from the summary — every step must maintain reference chains back to the original source. The rule is:

- Every output claim references a source span in the input it was derived from
- That input references its source span in the stage before it
- The chain terminates at the original fetched source document

This means a reviewer seeing a claim in a summary can trace it through the translation back to the exact sentence in the original source.

### 2.5 AI Confidence Is Metadata, Not a Publication Decision

Confidence scores inform reviewer priority and flagging but never determine publication automatically. A high-confidence extraction is not published automatically. A low-confidence extraction is not suppressed automatically. Confidence is a signal to the reviewer:

- **0.9–1.0**: Reviewer should verify quickly but likely to be correct
- **0.7–0.89**: Reviewer should verify with moderate attention
- **0.5–0.69**: Reviewer should scrutinize carefully
- **0.0–0.49**: Reviewer should treat as uncertain; may need escalation

Confidence thresholds are configurable per operation type and review queue configuration.

### 2.6 AI Model and Version Must Be Recorded for Every Operation

Every AIOperationResult records `model` and `modelVersion`. This enables:

- Auditing which model version produced which outputs
- Retracting or flagging outputs from a specific model version if a regression is discovered
- Tracking accuracy improvements over time as models evolve
- Reproducing outputs for debugging or appeal

### 2.7 Hallucination Must Be Actively Mitigated

The system must not merely hope the AI does not hallucinate. It must implement active countermeasures:

- **Source span verification**: Every extraction must reference the specific source text that supports it. Extractions without source spans are flagged as invalid.
- **Cross-reference checks**: Extracted dates, names, locations, and numerical values are cross-checked against the source text programmatically where possible.
- **Contradiction detection**: New extractions are checked against existing verified records for contradictions before entering the queue.
- **Confidence thresholds**: Low-confidence outputs are routed to mandatory higher-scrutiny review.
- **Human review**: Every extraction receives human review. There is no fully automated path.

### 2.8 AI Translations of Legal, Testimony, Casualty, or Identity Content Require Expert Human Review

Not all human review is equal. The review queue assigns review types based on content categories:

- Legal content (court rulings, legal filings, legal analyses): reviewed by legal reviewers
- Testimony content: reviewed by trauma-informed reviewers with language expertise
- Casualty figures: reviewed by researchers with domain knowledge
- Identity information: reviewed by privacy-trained reviewers

AI translation of these categories is permitted for drafting only. The human reviewer must have demonstrated competence in both the source language and the content domain.

### 2.9 Every Correction Is Transparent

When a reviewer corrects an AI proposal, the correction is recorded:

- Original AI proposal content
- Reviewer correction
- Correction rationale
- Reviewer identity (or role, for privacy)
- Timestamp

Corrections are available in the audit trail and can feed back into AI pipeline improvement.

### 2.10 No Doxing, Harassment, or Unsafe Data Through the AI Pipeline

The AI pipeline must respect the same safety rules as the public platform (PRD-v1-archive.md Section 41 — Red-Line Policy). Specifically:

- AI entity extraction must not extract private addresses, private phone numbers, or private individuals' personal data
- AI must flag and quarantine content containing potential doxing data
- Geographic extraction must respect safe precision levels
- Identity extraction must be flagged for privacy review

---

## 3. Collector Framework

### 3.1 Architecture Overview

The Collector Framework is the ingestion layer of the AI Intelligence system. Each collector is an independent module that follows a standard pipeline for fetching, validating, normalizing, and storing content from a specific source or source category.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Fetch     │ ──► │  Validate   │ ──► │ Normalize   │ ──► │ Deduplicate │ ──► │   Store     │
│             │     │             │     │             │     │             │     │             │
│ RSS / API / │     │ schema      │     │ to unified  │     │ hash-based  │     │ to source   │
│ web scrape  │     │ checksum    │     │ record type │     │ + semantic  │     │ table + AI  │
│             │     │ freshness   │     │             │     │ matching    │     │ queue       │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘     └─────┬───────┘
                                                                                      │
                                                                                      ▼
                                                                             ┌─────────────────┐
                                                                             │  AI Processing  │
                                                                             │  Pipeline Queue │
                                                                             └─────────────────┘
```

### 3.2 Collector Contract (TypeScript Interface)

Every collector must implement the following interface:

```typescript
/**
 * Raw source data as fetched from the source.
 * This is the unprocessed response from an API, RSS feed, or web scrape.
 */
interface RawSourceData {
  /** Unique identifier from the source */
  externalId: string;
  /** The URL or API endpoint this was fetched from */
  sourceUrl: string;
  /** Raw content as fetched — typically HTML, JSON, XML, or Markdown */
  rawContent: string;
  /** Content type hint (e.g., 'text/html', 'application/json', 'application/rss+xml') */
  contentType: string;
  /** Publication date according to the source */
  sourcePublishedAt?: string;
  /** Last modified date according to the source */
  sourceModifiedAt?: string;
  /** Any HTTP headers or metadata from the fetch */
  fetchMetadata: Record<string, string>;
  /** Timestamp of when the fetch occurred */
  fetchedAt: string;
}

/**
 * Result of validating raw source data.
 */
interface ValidationResult {
  /** Whether the source data passed all validation checks */
  valid: boolean;
  /** Structured error messages if validation failed */
  errors: ValidationError[];
  /** Warnings that did not block validation but should be noted */
  warnings: ValidationWarning[];
}

interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'fatal';
}

interface ValidationWarning {
  field: string;
  code: string;
  message: string;
}

/**
 * A normalized, system-ready source record.
 * This is the universal format that all collectors produce.
 */
interface NormalizedSourceRecord {
  /** System-generated unique identifier */
  id: string;
  /** Source type classification */
  sourceType: SourceType;
  /** Original external identifier from the source */
  externalId: string;
  /** Publisher or issuing body */
  publisher: string;
  /** Publisher type classification */
  publisherType: PublisherType;
  /** Human-readable title */
  title: string;
  /** Full text content in normalized form */
  body: string;
  /** Summary/excerpt if available */
  summary?: string;
  /** Primary URL of the source */
  url: string;
  /** Archive URL if captured */
  archiveUrl?: string;
  /** Publication date (normalized to ISO 8601) */
  publishedAt: string;
  /** Date the content was fetched (ISO 8601) */
  fetchedAt: string;
  /** Date the content was last modified per source (ISO 8601) */
  modifiedAt?: string;
  /** ISO 639-1 language code(s) detected */
  languages: string[];
  /** Countries/territories the content primarily concerns */
  countries: string[];
  /** Regions the content concerns */
  regions: string[];
  /** Topics/categories assigned by the collector */
  categories: string[];
  /** Named entities mentioned (pre-normalization, raw from source) */
  mentionedEntities: string[];
  /** Geographic locations mentioned (pre-normalization, raw from source) */
  mentionedLocations: string[];
  /** Confidence that fetch was successful and content is complete */
  fetchQuality: number;
  /** MD5 hash of the normalized body for deduplication */
  bodyHash: string;
  /** Collector instance that produced this record */
  collectorName: string;
  /** Version of the collector that produced this record */
  collectorVersion: string;
}

type SourceType =
  | 'press_release'
  | 'judgment'
  | 'order'
  | 'statement'
  | 'report'
  | 'resolution'
  | 'conclusion'
  | 'article'
  | 'blog_post'
  | 'research_paper'
  | 'dataset'
  | 'transcript'
  | 'speech'
  | 'letter'
  | 'briefing'
  | 'situation_report'
  | 'flash_appeal'
  | 'press_conference_transcript'
  | 'parliamentary_record'
  | 'voting_record'
  | 'legal_filing'
  | 'warrant'
  | 'decision'
  | 'memorandum'
  | 'other';

type PublisherType =
  | 'international_court'
  | 'national_court'
  | 'un_agency'
  | 'un_body'
  | 'ngo'
  | 'humanitarian_organization'
  | 'government'
  | 'government_department'
  | 'eu_institution'
  | 'journalism_outlet'
  | 'academic_institution'
  | 'research_organization'
  | 'think_tank'
  | 'data_portal'
  | 'individual_researcher'
  | 'other';

/**
 * Metadata about the source itself (not a specific piece of content).
 */
interface SourceMetadata {
  /** Source unique identifier from the source registry */
  sourceId: string;
  /** Human-readable source name */
  name: string;
  /** Type of publisher */
  publisherType: PublisherType;
  /** Whether this source is currently reachable and returning valid data */
  healthStatus: 'healthy' | 'degraded' | 'unreachable' | 'unknown';
  /** Timestamp of last successful fetch */
  lastSuccessfulFetch?: string;
  /** Timestamp of last fetch attempt */
  lastFetchAttempt?: string;
  /** Error message from last failed fetch, if any */
  lastFetchError?: string;
  /** Rate limit information if applicable */
  rateLimitInfo?: {
    requestsPerSecond: number;
    maxRequestsPerDay?: number;
    currentDailyCount?: number;
  };
}
```

### 3.3 Collector Contract Methods

Every collector module must export a class implementing the following interface:

```typescript
interface CollectorInterface {
  /**
   * Fetch new content from the source.
   * Should implement pagination, rate limiting, and incremental fetching.
   * Returns raw data that has not yet been validated or normalized.
   */
  fetch(): Promise<RawSourceData[]>;

  /**
   * Validate raw source data against the collector's schema expectations.
   * Checks: content non-empty, required fields present, date formats valid,
   * content hash not duplicate, source freshness acceptable.
   */
  validate(raw: RawSourceData): ValidationResult;

  /**
   * Normalize validated raw data into the system's unified record format.
   * Handles: date normalization, language detection, entity extraction (basic),
   * URL normalization, text cleaning, hash generation.
   */
  normalize(raw: RawSourceData): NormalizedSourceRecord;

  /**
   * Return metadata about the source this collector monitors.
   * Used by the monitoring system for health checks and status displays.
   */
  getSourceInfo(): SourceMetadata;

  /**
   * Optional: Return the fetch schedule configuration.
   * If not implemented, the scheduler uses a default interval.
   */
  getScheduleConfig?: () => CollectorScheduleConfig;
}

interface CollectorScheduleConfig {
  /** How often to check for new content */
  intervalMinutes: number;
  /** Preferred time window for fetching (UTC) */
  preferredWindow?: {
    startHour: number;  // 0-23
    endHour: number;    // 0-23
  };
  /** Maximum number of items to fetch per run */
  maxItemsPerRun?: number;
  /** Whether to use incremental fetching (only new/changed items) */
  incrementalFetch: boolean;
}

/**
 * Base class that all collectors should extend.
 * Provides shared utilities for logging, error handling, and result recording.
 */
abstract class BaseCollector implements CollectorInterface {
  protected sourceId: string;
  protected sourceRegistry: SourceRegistry;

  constructor(sourceId: string, sourceRegistry: SourceRegistry) {
    this.sourceId = sourceId;
    this.sourceRegistry = sourceRegistry;
  }

  abstract fetch(): Promise<RawSourceData[]>;
  abstract validate(raw: RawSourceData): ValidationResult;
  abstract normalize(raw: RawSourceData): NormalizedSourceRecord;
  abstract getSourceInfo(): SourceMetadata;

  /**
   * Run the full pipeline: fetch, validate, normalize, deduplicate, store.
   * This is the main entry point called by the scheduler.
   */
  async run(): Promise<CollectorRunResult> {
    const startTime = new Date().toISOString();
    const results: CollectorRunResult = {
      startTime,
      sourceId: this.sourceId,
      fetchedCount: 0,
      validatedCount: 0,
      normalizedCount: 0,
      storedCount: 0,
      errors: [],
      completedAt: '',
    };

    try {
      const rawItems = await this.fetch();
      results.fetchedCount = rawItems.length;

      for (const raw of rawItems) {
        const validation = this.validate(raw);
        if (!validation.valid) {
          results.errors.push({
            externalId: raw.externalId,
            stage: 'validation',
            errors: validation.errors,
          });
          continue;
        }
        results.validatedCount++;

        const normalized = this.normalize(raw);
        results.normalizedCount++;

        // Deduplication check
        const isDuplicate = await DeduplicationService.checkDuplicate(normalized);
        if (isDuplicate) {
          continue;
        }

        // Store the normalized record
        await SourceRecordRepository.save(normalized);

        // Enqueue for AI processing
        await AiProcessingQueue.enqueue(normalized);

        results.storedCount++;
      }
    } catch (error) {
      results.errors.push({
        externalId: 'pipeline',
        stage: 'run',
        errors: [{
          field: 'pipeline',
          code: 'RUN_ERROR',
          message: error instanceof Error ? error.message : String(error),
          severity: 'fatal',
        }],
      });
    }

    results.completedAt = new Date().toISOString();
    return results;
  }
}

interface CollectorRunResult {
  startTime: string;
  sourceId: string;
  fetchedCount: number;
  validatedCount: number;
  normalizedCount: number;
  storedCount: number;
  errors: {
    externalId: string;
    stage: 'fetch' | 'validation' | 'normalization' | 'storage' | 'run';
    errors: ValidationError[];
  }[];
  completedAt: string;
}
```

### 3.4 Source Registry Schema

The Source Registry is the authoritative database of all sources the system monitors. Each source has a full metadata record that drives collector behavior, monitoring, and review prioritization.

```typescript
interface SourceRegistryEntry {
  /** Unique identifier for this source */
  id: string;
  /** Human-readable source name */
  name: string;
  /** The organization or entity that publishes this source */
  publisher: string;
  /** Type of publisher */
  publisherType: PublisherType;

  /** Trust level 1–5 (5 = highest, e.g., ICJ/ICC official records) */
  trustLevel: 1 | 2 | 3 | 4 | 5;

  /** Current verification status of this source as a data provider */
  verificationStatus: 'unreviewed' | 'identity_confirmed' | 'provenance_verified' | 'trusted' | 'disputed' | 'deprecated';

  /** API endpoint URL (if available) */
  apiEndpoint?: string;
  /** RSS/Atom feed URL (if available) */
  rssFeed?: string;
  /** Primary website URL */
  webUrl: string;

  /** Content license (e.g., 'CC BY 4.0', 'public_domain', 'all_rights_reserved') */
  license?: string;
  /** Primary language(s) of the source content */
  language: string;
  /** Geographic region the source primarily covers */
  region?: string;

  /** Categories this source covers */
  categories: SourceCategory[];

  /** Free-text reliability notes */
  reliabilityNotes?: string;

  /** When the source was last checked for availability */
  lastChecked?: string;
  /** When the last successful fetch occurred */
  lastSuccessfulFetch?: string;

  /** Whether this source can be fetched automatically */
  automationEligible: boolean;
  /** Current health status */
  healthStatus: 'healthy' | 'degraded' | 'unreachable' | 'pending_first_check' | 'retired';
  /** Whether health monitoring is active */
  monitoringEnabled: boolean;

  /** Fetch configuration */
  fetchConfig: {
    /** Preferred HTTP method */
    method: 'GET' | 'POST';
    /** Headers to send with requests */
    headers?: Record<string, string>;
    /** Authentication method if any */
    auth?: 'none' | 'api_key' | 'basic' | 'oauth2';
    /** Rate limit configuration */
    rateLimit: {
      requestsPerSecond: number;
      maxRequestsPerDay?: number;
    };
    /** Retry configuration */
    retryConfig: {
      maxRetries: number;
      backoffMs: number;
      backoffMultiplier: number;
    };
    /** User agent string */
    userAgent: string;
  };

  /** When this record was created */
  createdAt: string;
  /** When this record was last modified */
  updatedAt: string;
}

type SourceCategory =
  | 'legal_proceedings'
  | 'humanitarian_situation'
  | 'human_rights'
  | 'international_law'
  | 'arms_transfers'
  | 'diplomacy'
  | 'government_policy'
  | 'parliamentary_records'
  | 'journalism'
  | 'academic_research'
  | 'open_source_intelligence'
  | 'civil_society'
  | 'medical_humanitarian'
  | 'detention_and_torture'
  | 'forced_displacement'
  | 'civilian_casualties'
  | 'cultural_heritage'
  | 'environmental_impact'
  | 'sanctions'
  | 'military_cooperation'
  | 'peacekeeping';
```

### 3.5 Collector Registry

The following collectors are specified for initial implementation. Each collector monitors a specific source or category of sources.

#### 3.5.1 ICJ Collector

- **Source type**: International Court of Justice
- **Content**: Press releases, orders, judgments, advisory opinions, provisional measures
- **Fetch method**: RSS feed + API + web scrape (redundant for reliability)
- **Schedule**: Every 4 hours (during court sessions), every 12 hours otherwise
- **Language**: English, French
- **Trust level**: 5 (primary legal record)
- **Implementation priority**: P0

```typescript
class IcjCollector extends BaseCollector {
  constructor(sourceRegistry: SourceRegistry) {
    super('source-icj', sourceRegistry);
  }

  async fetch(): Promise<RawSourceData[]> {
    // Fetch from ICJ RSS feed: https://www.icj-cij.org/rss
    // Fetch from ICJ press releases API
    // Parse HTML for judgments page
    // Merge and deduplicate across sources
  }

  validate(raw: RawSourceData): ValidationResult {
    // Validate: non-empty, has title and date, is a known document type
  }

  normalize(raw: RawSourceData): NormalizedSourceRecord {
    // Normalize: map document types, extract case numbers, link to case pages
  }

  getSourceInfo(): SourceMetadata {
    // Return ICJ source metadata
  }
}
```

#### 3.5.2 ICC Collector

- **Source type**: International Criminal Court
- **Content**: Press releases, warrant announcements, confirmation of charges, trial updates, appeal decisions, situation updates
- **Fetch method**: RSS feed + API + web scrape
- **Schedule**: Every 4 hours
- **Language**: English, French
- **Trust level**: 5 (primary legal record)
- **Implementation priority**: P0

#### 3.5.3 OHCHR Collector

- **Source type**: Office of the UN High Commissioner for Human Rights
- **Content**: Reports, statements, press briefings, findings, universal periodic review outcomes
- **Fetch method**: RSS feed + web scrape
- **Schedule**: Every 6 hours
- **Language**: English, French, Spanish, Arabic
- **Trust level**: 5 (official UN human rights documentation)
- **Implementation priority**: P0

#### 3.5.4 OCHA Collector

- **Source type**: UN Office for the Coordination of Humanitarian Affairs
- **Content**: Situation reports, flash appeals, humanitarian updates, funding data, relief web content
- **Fetch method**: RSS feed + ReliefWeb API + web scrape
- **Schedule**: Every 4 hours (active crises), every 12 hours (static periods)
- **Language**: English, Arabic
- **Trust level**: 4 (operational humanitarian reporting — timely but subject to field corrections)
- **Implementation priority**: P0

#### 3.5.5 EU Collector

- **Source type**: European Union institutions
- **Content**: European Council conclusions, European Parliament resolutions, Commission statements, EEAS press releases, EU sanctions announcements
- **Fetch method**: RSS feeds from multiple EU institution portals
- **Schedule**: Every 6 hours
- **Language**: English, French, German (primary); all 24 EU languages where available
- **Trust level**: 4 (official EU documentation)
- **Implementation priority**: P1

#### 3.5.6 Belgium Collector

- **Source type**: Belgian federal government
- **Content**: Federal government positions, parliamentary records (Chamber and Senate), foreign ministry statements, development cooperation updates, arms export reports
- **Fetch method**: RSS feeds + web scrape from federal portals
- **Schedule**: Every 6 hours
- **Language**: Dutch, French, English (selected)
- **Trust level**: 4 (official Belgian government documentation)
- **Implementation priority**: P1

#### 3.5.7 NGO Collectors

Each major NGO has its own collector instance with shared base infrastructure:

| NGO | Content Type | Fetch Method | Language | Trust Level | Priority |
|---|---|---|---|---|---|
| Amnesty International | Press releases, reports, legal analysis | RSS + web | EN, FR, AR, ES, others | 4 (verified NGO reporting) | P1 |
| Human Rights Watch | Press releases, reports, analysis | RSS + web | EN, FR, others | 4 | P1 |
| B'Tselem | Reports, testimony, video summaries | RSS + web | EN, HE, AR | 4 | P1 |
| MSF (Doctors Without Borders) | Medical situation updates, press releases | RSS + web | EN, FR, ES, AR | 4 | P1 |
| ICRC | Humanitarian law updates, operational reports | RSS + web | EN, FR, ES, AR | 5 (official IHL mandate) | P1 |

#### 3.5.8 Journalism Collector

- **Source type**: Trusted news outlets and investigative journalism projects
- **Content**: Investigative reports, long-form journalism, verified news reporting
- **Fetch method**: RSS feeds
- **Schedule**: Every 4 hours
- **Language**: Multiple, configured per outlet
- **Trust level**: 3 (requires corroboration; journalism is source-weighted per PRD-v1-archive.md Section 11.1)
- **Implementation priority**: P2

```typescript
interface JournalismOutletConfig {
  name: string;
  rssFeed: string;
  language: string;
  region: string;
  trustLevel: 1 | 2 | 3 | 4 | 5;
  categories: SourceCategory[];
  requiresCorroboration: boolean;
}

class JournalismCollector extends BaseCollector {
  private outlets: JournalismOutletConfig[];

  constructor(outlets: JournalismOutletConfig[], sourceRegistry: SourceRegistry) {
    super('source-journalism', sourceRegistry);
    this.outlets = outlets;
  }

  async fetch(): Promise<RawSourceData[]> {
    // Fetch RSS feeds for all configured outlets
    // Parse each feed item
    // Return merged raw data
  }

  // ... implement remaining methods
}
```

#### 3.5.9 Academic Collector

- **Source type**: Academic institutions, research bodies, university programs
- **Content**: Research papers, working papers, university statements, academic blog posts, data sets
- **Fetch method**: RSS feeds, CrossRef API, institutional repositories
- **Schedule**: Every 12 hours
- **Language**: Multiple
- **Trust level**: 3 (academic research — authoritative in its domain but requires contextual review)
- **Implementation priority**: P2

#### 3.5.10 Open Data Collector

- **Source type**: Public data portals, transparency portals, arms transfer databases
- **Content**: Datasets, export license records, parliamentary voting data, sanctions lists, arms trade databases (SIPRI, national export authorities)
- **Fetch method**: API where available, CSV/JSON file download, web scrape
- **Schedule**: Every 24 hours
- **Language**: Multiple
- **Trust level**: 4–5 (varies by data source)
- **Implementation priority**: P2

### 3.6 Source Monitoring

#### 3.6.1 Health Checks

Every source in the registry has a health check routine that runs independently of the fetch cycle:

```typescript
interface HealthCheckResult {
  sourceId: string;
  timestamp: string;
  reachable: boolean;
  responseTimeMs: number;
  statusCode?: number;
  contentTypeValid: boolean;
  contentFreshness: 'recent' | 'stale' | 'no_content';
  errorMessage?: string;
}

interface HealthMonitorConfig {
  /** How often to run health checks (default: 30 minutes) */
  checkIntervalMinutes: number;
  /** Number of consecutive failures before marking source as degraded */
  degradedThreshold: number;
  /** Number of consecutive failures before marking source as unreachable */
  unreachableThreshold: number;
  /** Grace period for expected content freshness (hours) */
  freshnessGracePeriodHours: number;
  /** Whether to alert on status changes */
  alertOnChange: boolean;
}
```

#### 3.6.2 Update Detection

The system tracks what content has been fetched from each source to enable incremental updates:

```typescript
interface SourceFetchState {
  sourceId: string;
  lastFetchTimestamps: string[];  // Last 50 fetch timestamps
  latestExternalId: string;
  latestPublishedAt: string;
  knownHashes: string[];  // Last 1000 body hashes for deduplication
  totalItemsFetched: number;
  totalItemsStored: number;
  firstFetchAt: string;
  lastFetchAt: string;
}
```

#### 3.6.3 Rate Limiting and Polite Crawling

All collectors must implement rate limiting to avoid overloading source servers:

```typescript
interface RateLimiter {
  /** Maximum number of requests per second */
  requestsPerSecond: number;
  /** Minimum delay between requests in milliseconds */
  minDelayMs: number;
  /** Maximum requests per day (0 = unlimited) */
  maxPerDay: number;
  /** Current count of requests today */
  currentDailyCount: number;
  /** Timestamp of last request */
  lastRequestAt?: number;

  /** Wait until a request is permitted, then return */
  acquire(): Promise<void>;

  /** Record that a request was made */
  recordRequest(): void;

  /** Reset daily counter */
  resetDailyCount(): void;
}
```

#### 3.6.4 Error Handling and Retry Strategy

```typescript
interface FetchRetryConfig {
  maxRetries: number;
  backoffMs: number;
  backoffMultiplier: number;  // e.g., 2 for exponential backoff
  maxBackoffMs: number;
  retryableStatusCodes: number[];  // e.g., [429, 500, 502, 503, 504]
  retryableErrors: string[];  // e.g., ['ECONNRESET', 'ETIMEDOUT']
}

interface FetchResult {
  success: boolean;
  data?: RawSourceData[];
  error?: string;
  retryCount: number;
  totalDurationMs: number;
  rateLimitHit: boolean;
}
```

#### 3.6.5 Monitoring Dashboard

The source monitoring dashboard (admin-only) displays:

- Source list with health status indicators (healthy / degraded / unreachable / retired)
- Last fetch time and duration per source
- Items fetched (last 24h, 7d, 30d) per source
- Error rate per source
- Rate limit hits per source
- Content freshness indicators
- Manual trigger button for immediate fetch
- Source configuration editor

---

## 4. Normalization Layer

The Normalization Layer transforms raw source data into structured, system-wide unified records. It ensures that content from the ICJ, Amnesty International, OCHA, and a Belgian parliamentary record all conform to the same data model for AI processing.

### 4.1 Unified Record Types

#### 4.1.1 NormalizedSourceRecord

The primary record type for fetched source content:

```typescript
interface NormalizedSourceRecord {
  /** System-generated UUID */
  id: string;

  /** Which collector produced this record */
  collectorName: string;
  collectorVersion: string;

  /** Source registry reference */
  sourceRegistryId: string;

  /** External identifier from the original source */
  externalId: string;

  /** Source type classification */
  sourceType: SourceType;

  /** Publisher information */
  publisher: string;
  publisherType: PublisherType;

  /** Content fields */
  title: string;
  body: string;  // Cleaned, normalized text
  summary?: string;

  /** URLs */
  url: string;
  archiveUrl?: string;

  /** Dates (all ISO 8601) */
  publishedAt: string;
  fetchedAt: string;
  modifiedAt?: string;

  /** Language detection results */
  languages: string[];
  primaryLanguage: string;

  /** Geographic scope */
  countries: string[];
  regions: string[];

  /** Classification */
  categories: SourceCategory[];

  /** Entity mentions (pre-AI, basic extraction only) */
  mentionedEntityNames: string[];

  /** Location mentions (pre-AI, basic extraction only) */
  mentionedLocationNames: string[];

  /** Quality and integrity */
  fetchQuality: number;  // 0–1
  bodyHash: string;

  /** Processing state */
  normalizationStatus: 'raw' | 'normalized' | 'failed';
  normalizationErrors: string[];

  /** Metadata for the normalization process */
  normalizedAt: string;
  normalizerVersion: string;
}
```

#### 4.1.2 EventRecord

An event is something that happened — an airstrike, a court ruling, a parliamentary vote, a humanitarian convoy movement, a diplomatic statement:

```typescript
interface EventRecord {
  /** System-generated UUID */
  id: string;

  /** Short, descriptive title */
  title: string;

  /** Detailed description */
  description: string;

  /** When the event occurred */
  eventDate: string;  // ISO 8601
  eventDatePrecision: 'exact' | 'day' | 'week' | 'month' | 'year' | 'range';
  eventDateEnd?: string;  // For date ranges
  eventDateAccuracy: 'confirmed' | 'estimated' | 'disputed' | 'unknown';

  /** Where the event occurred */
  locations: EventLocation[];

  /** Categories */
  eventType: EventType;
  subTypes: string[];

  /** Entities involved */
  involvedEntities: EntityReference[];

  /** Source records that document this event */
  sourceRecordIds: string[];

  /** Evidence items that incorporate this event */
  evidenceItemIds: string[];

  /** Claim IDs that reference this event */
  claimIds: string[];

  /** Verification level per PRD-v1-archive.md Section 7.1 */
  verificationLevel: number;

  /** Status */
  status: 'ai_proposed' | 'draft' | 'verified' | 'disputed' | 'corrected' | 'deprecated';

  /** Timeline position */
  timelinePosition?: {
    sequence: number;
    parentEventId?: string;  // For sub-events
  };

  /** Provenance */
  createdBy: 'ai' | 'human';
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
}

interface EventLocation {
  locationType: 'exact' | 'neighborhood' | 'city' | 'region' | 'country';
  name: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  geojson?: object;  // GeoJSON Feature or Geometry
  sourceSpan?: SourceSpan;
}

type EventType =
  | 'airstrike_or_military_attack'
  | 'court_ruling'
  | 'warrant_issued'
  | 'legal_filing'
  | 'parliamentary_vote'
  | 'diplomatic_statement'
  | 'humanitarian_incident'
  | 'civilian_casualty_incident'
  | 'aid_obstruction'
  | 'displacement_event'
  | 'detention_event'
  | 'publication'
  | 'protest_or_demonstration'
  | 'sanctions_announcement'
  | 'arms_transfer'
  | 'ceasefire_violation'
  | 'hospital_or_school_attack'
  | 'journalist_or_worker_attack'
  | 'cultural_heritage_destruction'
  | 'political_decision'
  | 'other';
```

#### 4.1.3 EntityRecord

An entity is a person, organization, country, institution, or legal body that appears in the system:

```typescript
interface EntityRecord {
  /** System-generated UUID */
  id: string;

  /** Entity type */
  entityType: 'person' | 'organization' | 'country' | 'institution' | 'legal_body' | 'armed_group' | 'other';

  /** Canonical name */
  name: string;

  /** Alternative names / aliases */
  aliases: string[];

  /** Description */
  description?: string;

  /** For persons: role/title */
  role?: string;

  /** For organizations/countries/institutions */
  acronym?: string;
  parentEntityId?: string;  // e.g., WHO is parented by UN
  subEntities: string[];    // e.g., UN agencies under UN

  /** Country/institution metadata */
  isoCode?: string;  // For countries
  institutionType?: 'eu' | 'un' | 'national_government' | 'parliament' | 'court' | 'ngo' | 'other';

  /** Geographic scope */
  country?: string;
  region?: string;

  /** Status */
  isActive: boolean;  // Still exists/operates
  isVerified: boolean;  // Identity confirmed by human reviewer

  /** Relationships to other entities */
  relationships: EntityRelationship[];

  /** When this entity was last verified */
  lastVerifiedAt?: string;
  verifiedBy?: string;

  /** Provenance */
  createdBy: 'ai' | 'human';
  createdAt: string;
  updatedAt: string;

  /** External references */
  wikipediaUrl?: string;
  officialUrl?: string;
  wikidataId?: string;
}

interface EntityRelationship {
  targetEntityId: string;
  relationshipType: RelationshipType;
  startDate?: string;
  endDate?: string;
  sourceSpan?: SourceSpan;
  confidence: number;
}

type RelationshipType =
  | 'member_of'        // Person → Organization
  | 'belongs_to'       // Entity → Country
  | 'part_of'          // Sub-org → Parent org
  | 'governs'          // Country → Institution
  | 'represents'       // Person → Role
  | 'located_in'       // Entity → Location
  | 'related_to'       // Generic
  | 'conflict_with'    // Entity → Entity
  | 'cooperates_with'  // Entity → Entity
  | 'investigates'     // Institution → Entity
  | 'sanctions'        // Entity → Entity
  | 'funds'            // Entity → Entity
  | 'opposes'          // Entity → Entity
  | 'supports';        // Entity → Entity
```
#### 4.1.4 EvidenceRecord

An evidence record links a claim to a source, incorporating verification metadata:

```typescript
interface EvidenceRecord {
  /** System-generated UUID */
  id: string;

  /** The claim being made */
  claim: string;

  /** Claim category from PRD-v1-archive.md evidence categories */
  claimCategory: EvidenceCategory;

  /** The source that supports this claim */
  sourceRecordIds: string[];

  /** Specific excerpts from source text */
  sourceExcerpts: SourceExcerpt[];

  /** Verification level (0–5, per PRD-v1-archive.md Section 7.1) */
  verificationLevel: number;

  /** Current verification status */
  verificationStatus: 'ai_proposed' | 'unverified' | 'source_checked' | 'corroborated' | 'verified' | 'disputed' | 'superseded' | 'withdrawn';

  /** Counter-claims or disputes */
  disputedBy?: string[];
  disputeNotes?: string;

  /** Links to events */
  eventIds: string[];

  /** Links to entities */
  entityIds: string[];

  /** Links to legal cases */
  legalCaseIds?: string[];

  /** Human review */
  reviewedBy?: string;
  reviewerNotes?: string;
  reviewedAt?: string;

  /** AI provenance */
  aiOperationId?: string;
  aiConfidence?: number;

  /** Safety flags */
  safetyFlags: SafetyFlag[];
  hasSensitiveLocation: boolean;
  hasIdentityInformation: boolean;

  /** Publication status */
  publicationStatus: 'draft' | 'needs_review' | 'approved' | 'published' | 'retracted';
  publishedAt?: string;

  /** Version tracking */
  version: number;
  correctionIds: string[];

  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

interface SourceExcerpt {
  sourceRecordId: string;
  excerpt: string;
  charStart: number;
  charEnd: number;
  relevance: number;  // 0–1, how central is this excerpt to the claim
}

type EvidenceCategory =
  | 'civilian_casualties'
  | 'hospitals_clinics_schools_shelters_infrastructure'
  | 'journalists_media_workers'
  | 'medical_humanitarian_workers'
  | 'aid_obstruction_attack'
  | 'food_water_sanitation_public_health'
  | 'forced_displacement'
  | 'housing_cultural_religious_destruction'
  | 'detention_mistreatment'
  | 'torture'
  | 'mass_graves'
  | 'public_incitement'
  | 'arms_transfers'
  | 'humanitarian_access_restrictions'
  | 'ceasefire_violations';

interface SafetyFlag {
  flagType: 'sensitive_location' | 'identity_data' | 'graphic_content' | 'unverified_claim' | 'potential_doxing' | 'legal_risk' | 'privacy_risk';
  description: string;
  severity: 'info' | 'warning' | 'critical';
  sourceSpan?: SourceSpan;
}
```

### 4.2 Normalization Rules

#### 4.2.1 Date Normalization

Dates from sources arrive in dozens of formats. The normalizer converts all to ISO 8601:

```typescript
interface DateNormalizer {
  /**
   * Normalize a date string from any common format to ISO 8601.
   * Supported formats:
   *   - "2024-03-15" → "2024-03-15"
   *   - "15 March 2024" → "2024-03-15"
   *   - "March 15, 2024" → "2024-03-15"
   *   - "15/03/2024" → "2024-03-15"
   *   - "03/15/2024" → "2024-03-15" (US format, with locale hint)
   *   - "2024-03-15T14:30:00Z" → "2024-03-15T14:30:00Z"
   *   - "2024-W11" → "2024-03-11" (ISO week)
   *   - "late March 2024" → "2024-03" (precision: month)
   *   - "2024" → "2024" (precision: year)
   */
  normalize(dateStr: string, localeHint?: string): NormalizedDate;

  /**
   * Extract dates from a text block.
   * Returns all detected dates with their source spans.
   */
  extractDates(text: string): DateExtraction[];
}

interface NormalizedDate {
  iso8601: string;       // ISO 8601 with appropriate precision
  precision: 'exact' | 'day' | 'week' | 'month' | 'year' | 'decade' | 'unknown';
  originalFormat: string;
  originalText: string;
  confidence: number;    // 0–1
}

interface DateExtraction {
  normalized: NormalizedDate;
  charStart: number;
  charEnd: number;
}
```

#### 4.2.2 Location Normalization

Locations in source text need to be parsed into structured data with safe precision controls:

```typescript
interface LocationNormalizer {
  /**
   * Normalize a location mention to a structured location.
   * Attempts to resolve place names, handle aliases,
   * and assign safe precision level.
   */
  normalize(locationName: string, contextText?: string): NormalizedLocation;

  /**
   * Extract location mentions from text.
   */
  extractLocations(text: string): LocationExtraction[];
}

interface NormalizedLocation {
  name: string;              // Canonical name
  canonicalId?: string;      // Reference to gazetteer ID (OpenStreetMap, Wikidata)
  country: string;           // Country name
  countryIso: string;        // ISO 3166-1 alpha-2
  region?: string;           // Administrative region
  city?: string;             // City/town
  neighborhood?: string;     // Neighborhood or district (only if safe)
  latitude?: number;         // Safe precision only
  longitude?: number;        // Safe precision only
  safePrecision: PrecisionLevel;  // Applied by location safety rules
  precision: PrecisionLevel; // Original precision from source
  geojson?: object;          // GeoJSON representation at safe precision
}

type PrecisionLevel =
  | 'exact'        // Specific coordinates (RARELY published)
  | 'neighborhood' // Neighborhood/district level
  | 'city'         // City level
  | 'region'       // Regional level
  | 'country';     // Country level only

interface LocationExtraction {
  normalized: NormalizedLocation;
  charStart: number;
  charEnd: number;
  sourceText: string;
  confidence: number;
}
```

#### 4.2.3 Entity Name Normalization

Entity names vary across sources (e.g., "International Criminal Court", "ICC", "The Hague Court"). The normalizer maps them to canonical names:

```typescript
interface EntityNameNormalizer {
  /**
   * Look up a canonical entity name from an alias or partial name.
   */
  resolveToCanonical(name: string): EntityResolution | null;

  /**
   * Register a new alias → canonical mapping.
   */
  registerAlias(alias: string, canonicalId: string, sourceRecordId?: string): void;
}

interface EntityResolution {
  canonicalId: string;
  canonicalName: string;
  entityType: EntityRecord['entityType'];
  matchedOn: 'exact' | 'alias' | 'fuzzy' | 'acronym';
  confidence: number;
}

// Pre-registered aliases (seeded from source registry and initial data):
// "International Court of Justice" → "ICJ"
// "World Court" → "ICJ"
// "International Criminal Court" → "ICC"
// "OCHA" → "UN Office for the Coordination of Humanitarian Affairs"
// "Office for the Coordination of Humanitarian Affairs" → "OCHA"
// "UN Human Rights Office" → "OHCHR"
// "Médecins Sans Frontières" → "MSF"
// "Doctors Without Borders" → "MSF"
// "European Union" → "EU"
// "ICC Office of the Prosecutor" → "ICC-OTP"
```

#### 4.2.4 Language Detection and Tagging

```typescript
interface LanguageDetector {
  /**
   * Detect the language(s) present in a text block.
   * Returns ISO 639-1 language codes with confidence scores.
   */
  detectLanguages(text: string): LanguageDetection[];

  /**
   * Detect the primary language and flag if multiple languages are present.
   */
  detectPrimaryLanguage(text: string): {
    primaryLanguage: string;
    allLanguages: LanguageDetection[];
    isMultilingual: boolean;
  };
}

interface LanguageDetection {
  language: string;     // ISO 639-1 code
  name: string;         // English name
  confidence: number;   // 0–1
  charRange?: {         // Which part of text is in this language
    charStart: number;
    charEnd: number;
  };
}
```

#### 4.2.5 Source URL Preservation and Archival Reference

```typescript
interface SourceUrlManager {
  /**
   * Normalize and validate a source URL.
   * Handles: trailing slash removal, protocol normalization,
   * query parameter cleaning, and basic URL validation.
   */
  normalizeUrl(url: string): string;

  /**
   * Generate an archive reference (Internet Archive, local archive).
   * Returns null if archiving is not available.
   */
  generateArchiveRef(url: string, content?: string): Promise<ArchiveReference | null>;
}

interface ArchiveReference {
  archiveUrl: string;       // Internet Archive or local archive URL
  archivedAt: string;       // ISO 8601
  archiveProvider: 'internet_archive' | 'local' | 'perma_cc';
  contentHash?: string;     // SHA-256 of archived content
}
```

### 4.3 Normalization Pipeline Implementation

The normalization pipeline runs after collection and before AI processing:

```typescript
interface NormalizationPipeline {
  /**
   * Run the full normalization pipeline on raw source data.
   * Stages run in order and may each produce errors or warnings.
   */
  run(raw: RawSourceData): NormalizationResult;

  /**
   * Run normalization for a batch of records.
   */
  runBatch(rawItems: RawSourceData[]): NormalizationResult[];
}

interface NormalizationResult {
  originalExternalId: string;
  success: boolean;
  normalized?: NormalizedSourceRecord;
  errors: NormalizationError[];
  warnings: NormalizationWarning[];
  processingTimeMs: number;
}

interface NormalizationError {
  stage: 'text_cleaning' | 'date_normalization' | 'location_normalization' | 'entity_normalization' | 'language_detection' | 'hashing';
  code: string;
  message: string;
}

interface NormalizationWarning {
  stage: string;
  code: string;
  message: string;
}
```

---

## 5. AI Pipeline

The AI Pipeline is the core intelligence layer of the system. It processes each normalized source record through a sequence of stages that extract structured understanding from unstructured text.

### 5.1 Pipeline Architecture

```
NormalizedSourceRecord
        │
        ▼
┌─────────────────────────────────────┐
│  1. Language Detection              │
│  Identify languages in source text  │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  2. Translation (if needed)         │
│  AI draft → human review flag       │
│  Based on language + content risk   │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  3. Summarization                   │
│  Neutral, factual summary           │
│  Word counts: 50, 200, 500 variants │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  4. Entity Extraction               │
│  People, Orgs, Locations, Dates,    │
│  Legal References                   │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  5. Claim Extraction               │
│  Identify factual claims in text    │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  6. Timeline Extraction             │
│  Extract dated events, sequence     │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  7. Geographic Extraction           │
│  Extract locations, generate GeoJSON│
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  8. Relationship Detection          │
│  Link to existing knowledge graph   │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  9. Topic Classification            │
│  Assign evidence taxonomy labels    │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  10. Duplicate Detection            │
│  Match against known events         │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  11. Contradiction Detection        │
│  Flag conflicts with verified data  │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  12. Confidence Estimation          │
│  Score confidence for each output   │
└─────────────────────────────────────┘
        │
        ▼
              Enqueue for Human Review
```

### 5.2 Pipeline Stage Details

#### 5.2.1 Stage 1: Language Detection

```typescript
interface StageLanguageDetection {
  stageId: 'language_detection';
  inputs: {
    text: string;
  };
  outputs: {
    languages: LanguageDetection[];
    primaryLanguage: string;
    isMultilingual: boolean;
  };
  run(input: StageLanguageDetection['inputs']): Promise<AIOperationResult<StageLanguageDetection['outputs']>>;
}
```

**Rules:**
- Run on every source record before any other AI stage
- If content is not in a supported pipeline language, flag for translation
- If content is multilingual, process each language segment separately
- Languages below 10% of total content are flagged as "secondary only"

#### 5.2.2 Stage 2: Translation

```typescript
interface StageTranslation {
  stageId: 'translation';
  inputs: {
    text: string;
    sourceLanguage: string;
    targetLanguage: string;  // Default: English
    contentRiskLevel: 'low' | 'medium' | 'high';
  };
  outputs: {
    translatedText: string;
    segments: TranslationSegment[];
    sourceSpans: SourceSpan[];
  };
  run(input: StageTranslation['inputs']): Promise<AIOperationResult<StageTranslation['outputs']>>;
}

interface TranslationSegment {
  sourceText: string;
  translatedText: string;
  charStart: number;
  charEnd: number;
  confidence: number;
}
```

**Content risk levels for translation review:**

| Risk Level | Content Types | Translation Path |
|---|---|---|
| Low | General news, generic statements, procedural updates | AI draft → optional human spot-check |
| Medium | Policy positions, institutional analyses, NGO findings | AI draft → human review |
| High | Legal rulings, legal filings, casualty figures, testimony, identity information, witness accounts | AI draft → expert human review (domain + language competence required) |

**Rules:**
- Original source text MUST be preserved alongside any translation
- Source spans in the translation reference the original-language source, not the translation
- Low-risk translations may proceed through standard review
- High-risk translations are flagged for expert language review (the reviewer must speak both languages)
- Legal terminology must use standard legal translation conventions, not literal translation

#### 5.2.3 Stage 3: Summarization

```typescript
interface StageSummarization {
  stageId: 'summarization';
  inputs: {
    text: string;
    maxWords: number;  // 50, 200, or 500
    style: 'neutral_factual' | 'executive_brief';
  };
  outputs: {
    summary: string;
    sections: SummarySection[];
    keyPoints: string[];
  };
  run(input: StageSummarization['inputs']): Promise<AIOperationResult<StageSummarization['outputs']>>;
}

interface SummarySection {
  heading: string;
  content: string;
  sourceSpans: SourceSpan[];
}

interface SourceSpan {
  documentId: string;
  charStart: number;
  charEnd: number;
  excerpt: string;
}
```

**Summarization rules:**
- Every sentence in the summary must have at least one source span reference
- Summaries must be neutral and factual — no editorializing, no advocacy language
- Multiple length variants are generated (50 words / 200 words / 500 words) for different use cases
- The summary must preserve all key claims, dates, names, and numbers from the source
- The summary must not introduce information not present in the source
- The summary must clearly attribute statements to their source ("the ICJ ruled that..." not "it was ruled that...")
- Confidence is per-sentence, not per-summary

#### 5.2.4 Stage 4: Entity Extraction

```typescript
interface StageEntityExtraction {
  stageId: 'entity_extraction';
  inputs: {
    text: string;
    knownEntities: EntityRecord[];  // For relationship linking
  };
  outputs: {
    entities: ExtractedEntity[];
  };
  run(input: StageEntityExtraction['inputs']): Promise<AIOperationResult<StageEntityExtraction['outputs']>>;
}

interface ExtractedEntity {
  name: string;
  entityType: EntityRecord['entityType'];
  aliases: string[];
  mentions: EntityMention[];
  resolvedToExistingId?: string;  // If matched to an existing entity
  confidence: number;
}

interface EntityMention {
  text: string;
  charStart: number;
  charEnd: number;
  isCoreferent: boolean;  // e.g., "the Court" referring to "ICJ"
}
```

**Entity extraction rules:**
- Extract all named entities: persons (officials, judges, lawyers), organizations, countries, institutions, legal bodies, armed groups
- Resolve pronouns and definite references to their antecedents (coreference resolution)
- Match each extracted entity against the existing entity registry
- Redacted or partially named entities (e.g., "a senior official who spoke on condition of anonymity") are extracted with lower confidence and a privacy warning
- Private individuals not in public roles must not be extracted unless relevant to a verified claim
- Entity extraction confidence is per-entity

#### 5.2.5 Stage 5: Claim Extraction

```typescript
interface StageClaimExtraction {
  stageId: 'claim_extraction';
  inputs: {
    text: string;
    entities: ExtractedEntity[];
  };
  outputs: {
    claims: ExtractedClaim[];
  };
  run(input: StageClaimExtraction['inputs']): Promise<AIOperationResult<StageClaimExtraction['outputs']>>;
}

interface ExtractedClaim {
  claimText: string;
  claimType: 'factual' | 'allegation' | 'finding' | 'ruling' | 'statement' | 'conclusion';
  subject: string;       // Who or what the claim is about
  predicate: string;     // What is claimed
  object?: string;       // Target of the claim, if any
  sourceSpans: SourceSpan[];
  isAttributedTo?: string;  // Who said this (if not the source itself)
  confidence: number;
  category: EvidenceCategory;
}
```

**Claim extraction rules:**
- Distinguish between the source's own claims and claims the source is reporting about others (e.g., "State X said Y" vs. the source's own findings)
- Extract both explicit claims and strongly implied claims (with lower confidence)
- Flag claims that are presented as allegations rather than established facts
- Flag claims that lack verifiable attribution
- Claim confidence is per-claim

#### 5.2.6 Stage 6: Timeline Extraction

```typescript
interface StageTimelineExtraction {
  stageId: 'timeline_extraction';
  inputs: {
    text: string;
    knownEvents: EventRecord[];  // For cross-referencing
  };
  outputs: {
    events: TimelineEvent[];
    timelineGroups: TimelineEvent[][];  // Grouped by topic
  };
  run(input: StageTimelineExtraction['inputs']): Promise<AIOperationResult<StageTimelineExtraction['outputs']>>;
}

interface TimelineEvent {
  title: string;
  description: string;
  date: string;  // ISO 8601
  datePrecision: 'exact' | 'day' | 'week' | 'month' | 'year';
  location?: string;
  involvedEntities: string[];
  sourceSpans: SourceSpan[];
  confidence: number;
  matchesExistingEventId?: string;  // If matched to a known event
  relationshipToExisting?: 'same' | 'related' | 'contradicts' | 'new';
}
```

**Timeline extraction rules:**
- Extract every event with a specific date or date range
- Sequence events chronologically within the source
- Group events by topic, location, or involved entity
- Check each extracted event against the existing event registry
- Flag events that appear to describe already-known incidents (for deduplication)
- Flag events that contradict the existing timeline

#### 5.2.7 Stage 7: Geographic Extraction

```typescript
interface StageGeographicExtraction {
  stageId: 'geographic_extraction';
  inputs: {
    text: string;
  };
  outputs: {
    locations: ExtractedGeographicLocation[];
    geojson: object;  // FeatureCollection of extracted locations
  };
  run(input: StageGeographicExtraction['inputs']): Promise<AIOperationResult<StageGeographicExtraction['outputs']>>;
}

interface ExtractedGeographicLocation {
  name: string;
  locationType: 'country' | 'region' | 'city' | 'neighborhood' | 'facility' | 'infrastructure' | 'natural_feature';
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  safePrecision: PrecisionLevel;
  geojson: object;  // Point, Polygon, or MultiPolygon
  sourceSpans: SourceSpan[];
  confidence: number;
}
```

**Geographic extraction rules:**
- Extract all geographic references (countries, regions, cities, neighborhoods, facilities, infrastructure)
- Resolve coordinates where possible (via OpenStreetMap/Nominatim gazetteer)
- Apply safe precision rules BEFORE any location data enters the system
- Flag sensitive location types (shelters, safe routes, medical facilities) for mandatory safety review
- Generate GeoJSON FeatureCollection output for map rendering
- Never extract precise coordinates for sensitive locations — round to safe precision level

#### 5.2.8 Stage 8: Relationship Detection

```typescript
interface StageRelationshipDetection {
  stageId: 'relationship_detection';
  inputs: {
    extractedEntities: ExtractedEntity[];
    extractedEvents: TimelineEvent[];
    existingEntities: EntityRecord[];
    existingRelationships: EntityRelationship[];
  };
  outputs: {
    newRelationships: ProposedRelationship[];
    relationshipUpdates: RelationshipUpdate[];
  };
  run(input: StageRelationshipDetection['inputs']): Promise<AIOperationResult<StageRelationshipDetection['outputs']>>;
}

interface ProposedRelationship {
  sourceEntityId: string;
  targetEntityId: string;
  relationshipType: RelationshipType;
  evidence: string;      // How the relationship was derived
  sourceSpans: SourceSpan[];
  confidence: number;
}

interface RelationshipUpdate {
  existingRelationshipId: string;
  suggestedChanges: Partial<EntityRelationship>;
  evidence: string;
  sourceSpans: SourceSpan[];
  confidence: number;
}
```

**Relationship detection rules:**
- Propose relationships between newly extracted entities and existing knowledge graph entities
- Suggest updates to existing relationships when new evidence is found
- Confidence is per-relationship
- Relationships without clear source spans are rejected

#### 5.2.9 Stage 9: Topic Classification

```typescript
interface StageTopicClassification {
  stageId: 'topic_classification';
  inputs: {
    text: string;
    extractedClaims: ExtractedClaim[];
  };
  outputs: {
    primaryCategory: SourceCategory;
    secondaryCategories: SourceCategory[];
    evidenceCategories: EvidenceCategory[];
    tags: string[];
  };
  run(input: StageTopicClassification['inputs']): Promise<AIOperationResult<StageTopicClassification['outputs']>>;
}
```

**Topic classification rules:**
- Assign the most specific applicable categories
- A single source may have multiple categories
- Categories follow the evidence taxonomy (PRD-v1-archive.md Section 7.1)
- Confidence is per-category

#### 5.2.10 Stage 10: Duplicate Detection

```typescript
interface StageDuplicateDetection {
  stageId: 'duplicate_detection';
  inputs: {
    extractedEvents: TimelineEvent[];
    extractedClaims: ExtractedClaim[];
    existingEvents: EventRecord[];
    threshold: number;  // Similarity threshold (default: 0.85)
  };
  outputs: {
    duplicates: DuplicateMatch[];
    uniqueItems: string[];  // IDs of items with no match found
  };
  run(input: StageDuplicateDetection['inputs']): Promise<AIOperationResult<StageDuplicateDetection['outputs']>>;
}

interface DuplicateMatch {
  newItemDescriptor: string;
  existingItemId: string;
  existingItemTitle: string;
  similarityScore: number;
  matchCriteria: ('title' | 'body_similarity' | 'date_match' | 'entity_match' | 'location_match')[];
  evidence: string;
}
```

**Duplicate detection rules:**
- Use a combination of exact matching (same URL, same hash), fuzzy matching (cosine similarity of embeddings), and structural matching (same entities + same date + same location)
- Duplicate threshold is configurable per source and content type
- Near-duplicates (e.g., the same press release published on two different portals) are flagged with confidence
- False positive rate must be measured during testing and configurable via threshold
- Humans make the final merge decision in the review queue

#### 5.2.11 Stage 11: Contradiction Detection

```typescript
interface StageContradictionDetection {
  stageId: 'contradiction_detection';
  inputs: {
    newClaims: ExtractedClaim[];
    newEvents: TimelineEvent[];
    verifiedClaims: EvidenceRecord[];
    verifiedEvents: EventRecord[];
  };
  outputs: {
    contradictions: ContradictionFlag[];
    confirmations: ConfirmationFlag[];  // Claims that SUPPORT existing records
  };
  run(input: StageContradictionDetection['inputs']): Promise<AIOperationResult<StageContradictionDetection['outputs']>>;
}

interface ContradictionFlag {
  newItemDescriptor: string;
  existingItemId: string;
  existingItemTitle: string;
  nature: 'date_conflict' | 'number_conflict' | 'factual_contradiction' | 'source_conflict';
  description: string;
  severity: 'info' | 'warning' | 'critical';
  confidence: number;
}

interface ConfirmationFlag {
  newItemDescriptor: string;
  existingItemId: string;
  existingItemTitle: string;
  nature: 'corroborates' | 'cross_validates' | 'additional_detail';
  description: string;
  confidence: number;
}
```

**Contradiction detection rules:**
- Check new claims against ALL existing verified claims, not just those in the same category
- Flag date contradictions (same event, different dates), number contradictions (same incident, different casualty counts), and factual contradictions
- Positive confirmations (new evidence supports existing records) are also flagged
- Critical contradictions require immediate reviewer attention

#### 5.2.12 Stage 12: Confidence Estimation

The final stage estimates overall confidence for each extraction and flags items that need special attention:

```typescript
interface StageConfidenceEstimation {
  stageId: 'confidence_estimation';
  inputs: {
    pipelineResults: AllPipelineResults;  // Outputs from stages 1–11
    sourceQuality: number;                // From normalization
    sourceTrustLevel: number;             // From source registry
  };
  outputs: {
    overallConfidence: number;
    perStageConfidence: Record<string, number>;
    warnings: string[];
    recommendedReviewType: ReviewType;
    requiresEscalation: boolean;
  };
  run(input: StageConfidenceEstimation['inputs']): Promise<AIOperationResult<StageConfidenceEstimation['outputs']>>;
}
```

### 5.3 AI Output Schema

Every AI operation produces a standardized result envelope:

```typescript
interface AIOperationResult<T = unknown> {
  /** Type of operation performed */
  operationType: AIOperationType;

  /** The AI's proposed output */
  proposedContent: T;

  /** Overall confidence (0–1) for this operation */
  confidence: number;

  /** References back to source text */
  sourceSpans: SourceSpan[];

  /** AI model identifier */
  model: string;

  /** Specific model version */
  modelVersion: string;

  /** When the operation was performed (ISO 8601) */
  timestamp: string;

  /** Duration of the operation in milliseconds */
  durationMs: number;

  /** Known limitations or concerns */
  warnings: AIWarning[];

  /** Whether this result requires human review */
  requiresReview: boolean;

  /** Suggested review type */
  suggestedReviewType?: ReviewType;
}

type AIOperationType =
  | 'language_detection'
  | 'translation'
  | 'summarization'
  | 'entity_extraction'
  | 'claim_extraction'
  | 'timeline_extraction'
  | 'geographic_extraction'
  | 'relationship_detection'
  | 'topic_classification'
  | 'duplicate_detection'
  | 'contradiction_detection'
  | 'confidence_estimation'
  | 'full_pipeline';

interface AIWarning {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  sourceSpan?: SourceSpan;
  affectedField?: string;
}
```

### 5.4 Model Routing

#### 5.4.1 Task-to-Model Mapping

| AI Task | Recommended Model | Fallback Model | Structured Output Format |
|---|---|---|---|
| Language detection | Specialized fast classifier | Lightweight LLM | JSON with language codes + confidence |
| Translation (low risk) | Production translation model | Smaller translation model | JSON with segments + alignments |
| Translation (high risk) | Best available LLM (highest accuracy) | Secondary LLM | JSON with segments + confidence per segment |
| Summarization | High-quality LLM | Mid-size LLM | JSON with sections + source spans |
| Entity extraction | High-quality LLM with structured output | Mid-size LLM | JSON with entities + mentions + source spans |
| Claim extraction | High-quality LLM | Mid-size LLM | JSON with claims + types + attribution |
| Timeline extraction | Mid-size LLM | Small LLM | JSON with events + dates + sequences |
| Geographic extraction | Mid-size LLM + gazetteer lookup | Small LLM | JSON with locations + GeoJSON |
| Relationship detection | High-quality LLM | Mid-size LLM | JSON with proposed relationships |
| Topic classification | Specialized classifier | Lightweight LLM | JSON with categories + confidence |
| Duplicate detection | Embedding similarity + fuzzy matching | Signature hashing | JSON with match scores |
| Contradiction detection | High-quality LLM | Mid-size LLM | JSON with contradiction flags |

#### 5.4.2 Structured Output Requirements

All AI operations must use structured output formats (JSON Schema or tool-use constrained generation):

```typescript
// Example structured output schema for entity extraction
const EntityExtractionOutputSchema = {
  type: 'object',
  properties: {
    entities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          entityType: {
            type: 'string',
            enum: ['person', 'organization', 'country', 'institution', 'legal_body', 'armed_group', 'other'],
          },
          mentions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                charStart: { type: 'integer' },
                charEnd: { type: 'integer' },
              },
              required: ['text', 'charStart', 'charEnd'],
            },
          },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
        },
        required: ['name', 'entityType', 'mentions', 'confidence'],
      },
    },
  },
  required: ['entities'],
};
```

#### 5.4.3 Cost Optimization Strategies

- **Batching**: Process multiple pipeline stages for the same source in a single LLM call where feasible
- **Model tiering**: Use smaller/faster models for low-risk tasks (language detection, topic classification); reserve large models for high-accuracy tasks (translation, entity/claim extraction)
- **Caching**: Cache extraction results for identical or near-identical source texts
- **Queue scheduling**: Process low-priority items during off-peak hours
- **Token optimization**: Send only the body text, not boilerplate HTML/XML

#### 5.4.4 Fallback Models

For each task, a fallback model is defined. The pipeline retries on the fallback if:

1. The primary model returns an error
2. The primary model's confidence is below threshold
3. The primary model's response fails JSON Schema validation
4. The primary model times out

Fallback transition is logged for monitoring purposes.

### 5.5 Hallucination Mitigation

#### 5.5.1 Source Span Verification

Every claim, entity, date, location, and classification must reference specific source text spans:

```typescript
interface SourceSpanValidator {
  /**
   * Verify that every claim in the AI output is supported by
   * a source span that legitimately contains that information.
   *
   * Returns:
   *   - verified: claims with valid supporting source spans
   *   - unverifiable: claims where source span does not support them
   *   - missingSource: items that claim to reference a source but don't
   *   - inventedSource: items that reference non-existent source spans
   */
  verifySourceSpans(operationResult: AIOperationResult): SpanValidationResult;
}

interface SpanValidationResult {
  verified: number;
  unverifiable: { claim: string; reason: string }[];
  missingSource: { claim: string }[];
  inventedSource: { claim: string }[];
  overallValidity: 'valid' | 'partially_valid' | 'invalid';
}
```

#### 5.5.2 Cross-Reference Checks

```typescript
interface CrossReferenceValidator {
  /**
   * Check extracted values against the source text.
   * Verifies that dates, names, numbers, and locations
   * actually appear in (or can be directly derived from) the source.
   */
  validateExtractions(
    sourceText: string,
    extractions: ExtractedEntity[] | ExtractedClaim[] | TimelineEvent[]
  ): CrossReferenceResult;
}

interface CrossReferenceResult {
  itemsChecked: number;
  itemsPassed: number;
  failures: CrossReferenceFailure[];
}

interface CrossReferenceFailure {
  type: 'missing_date' | 'wrong_name' | 'wrong_number' | 'invented_location' | 'contradicts_source';
  extracted: string;
  expected?: string;
  sourceSpan?: SourceSpan;
  severity: 'minor' | 'major' | 'critical';
}
```

#### 5.5.3 Confidence Thresholds

```typescript
interface ConfidenceThresholds {
  // Per-operation-type thresholds
  translation: { minimum: number; reviewRequired: number };
  summarization: { minimum: number; reviewRequired: number };
  entity_extraction: { minimum: number; reviewRequired: number };
  claim_extraction: { minimum: number; reviewRequired: number };
  timeline_extraction: { minimum: number; reviewRequired: number };
  geographic_extraction: { minimum: number; reviewRequired: number };
  relationship_detection: { minimum: number; reviewRequired: number };
  topic_classification: { minimum: number; reviewRequired: number };

  // Global thresholds
  overallMinimum: number;  // 0.3 — below this, the entire pipeline output is rejected
  reviewThreshold: number; // 0.65 — below this, mandatory human review with escalation option
  autoRejectThreshold: number; // 0.2 — below this, output is automatically rejected
}

const DEFAULT_CONFIDENCE_THRESHOLDS: ConfidenceThresholds = {
  translation: { minimum: 0.4, reviewRequired: 0.7 },
  summarization: { minimum: 0.3, reviewRequired: 0.6 },
  entity_extraction: { minimum: 0.3, reviewRequired: 0.65 },
  claim_extraction: { minimum: 0.3, reviewRequired: 0.7 },
  timeline_extraction: { minimum: 0.3, reviewRequired: 0.6 },
  geographic_extraction: { minimum: 0.3, reviewRequired: 0.6 },
  relationship_detection: { minimum: 0.25, reviewRequired: 0.6 },
  topic_classification: { minimum: 0.4, reviewRequired: 0.7 },
  overallMinimum: 0.3,
  reviewThreshold: 0.65,
  autoRejectThreshold: 0.2,
};
```

#### 5.5.4 Hallucination Detection Pipeline

```typescript
interface HallucinationDetector {
  /**
   * Run all hallucination mitigation checks on a pipeline result.
   * Returns a summary of findings and a recommended disposition.
   */
  evaluate(operationResult: AIOperationResult, sourceText: string): HallucinationEvaluation;

  /**
   * Run a specific hallucination check.
   */
  checkSourceSpans(operationResult: AIOperationResult): SpanValidationResult;
  checkCrossReferences(operationResult: AIOperationResult, sourceText: string): CrossReferenceResult;
  checkConfidenceThresholds(operationResult: AIOperationResult): ConfidenceCheckResult;
  checkInternalConsistency(operationResult: AIOperationResult): ConsistencyCheckResult;
}

interface HallucinationEvaluation {
  overallScore: number;  // 0 = severe hallucination, 1 = no issues detected
  checks: {
    sourceSpanValidity: SpanValidationResult;
    crossReferenceValidity: CrossReferenceResult;
    confidenceThresholds: ConfidenceCheckResult;
    internalConsistency: ConsistencyCheckResult;
  };
  disposition: 'pass' | 'flag_review' | 'reject' | 'escalate';
  details: string[];
}
```

### 5.6 AI Pipeline Orchestration

```typescript
interface AiPipelineOrchestrator {
  /**
   * Process a normalized source record through the complete AI pipeline.
   * Stages run sequentially with dependency checking.
   * Results are collected into a single pipeline result.
   */
  processSource(normalizedRecord: NormalizedSourceRecord): Promise<PipelineResult>;

  /**
   * Process multiple sources in batch (with configurable concurrency).
   */
  processBatch(normalizedRecords: NormalizedSourceRecord[], concurrency?: number): Promise<PipelineResult[]>;
}

interface PipelineResult {
  sourceRecordId: string;
  success: boolean;
  stages: {
    [stageId: string]: {
      status: 'completed' | 'skipped' | 'failed' | 'fallback_used';
      result?: AIOperationResult;
      error?: string;
      durationMs: number;
    };
  };
  overallConfidence: number;
  hallucinationCheck: HallucinationEvaluation;
  requiresReview: boolean;
  reviewPriority: 'low' | 'normal' | 'high' | 'critical';
  totalDurationMs: number;
  completedAt: string;
}

interface PipelineConfig {
  enabledStages: AIOperationType[];
  stageDependencies: Record<string, string[]>;  // Stage → stages that must complete first
  concurrency: number;
  retryConfig: {
    maxRetries: number;
    backoffMs: number;
  };
  timeoutMs: number;
  modelRouting: Record<AIOperationType, string>;  // Stage → model name
}
```

---

## 6. Review Queue System

The Review Queue System is the gate through which all AI-assisted content passes before publication. It is the architectural enforcement of the "AI proposes, humans approve" principle.

### 6.1 Architecture

```
AI Pipeline Output
        │
        ▼
┌─────────────────────────────────────┐
│       Review Queue Ingest           │
│  Create review items from pipeline  │
│  results with priority assignment   │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│        Queue Manager                │
│  ┌───────────────────────────────┐   │
│  │ Assignment Logic              │   │
│  │ - Round-robin                 │   │
│  │ - Expertise-based             │   │
│  │ - Load-balanced               │   │
│  └───────────────────────────────┘   │
│  ┌───────────────────────────────┐   │
│  │ SLA Tracking                  │   │
│  │ - Time-in-queue               │   │
│  │ - Age alerts                  │   │
│  │ - Overflow detection          │   │
│  └───────────────────────────────┘   │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│       Reviewer Workspace            │
│  Side-by-side: AI proposal vs.      │
│  original source. Quick actions:    │
│  Approve, Reject, Request Changes,  │
│  Escalate. Review notes and         │
│  discussion thread.                 │
└─────────────────────────────────────┘
        │
        ▼
    ┌───┴───┐
    ▼       ▼
Published  Changes Requested
               │
               ▼
           Reviewer revises → Approve
               or
           Escalated → Senior Review
```

### 6.2 Queue Data Model

```typescript
interface ReviewQueueItem {
  /** System-generated UUID */
  id: string;

  /** The source record being reviewed */
  sourceRecordId: string;

  /** The AI pipeline result being reviewed */
  pipelineResultId: string;

  /** Type of review needed */
  reviewType: ReviewType;

  /** Current state in the review workflow */
  status: ReviewStatus;

  /** Priority level */
  priority: 'low' | 'normal' | 'high' | 'critical';

  /** Human-readable title for the queue item */
  title: string;

  /** Brief description of what needs review */
  description: string;

  /** The AI-proposed content that needs review */
  proposedContent: ProposedContent[];

  /** The original source content */
  originalSourceContent: {
    recordId: string;
    title: string;
    body: string;
    url: string;
    publishedAt: string;
  };

  /** AI operation metadata */
  aiMetadata: {
    model: string;
    modelVersion: string;
    confidence: number;
    warnings: AIWarning[];
    operationTypes: AIOperationType[];
    hallucinationScore: number;
  };

  /** Assignment */
  assignedTo?: string;       // Reviewer user ID
  assignedAt?: string;       // ISO 8601
  assignedBy?: string;       // Assigner user ID

  /** Review timeline */
  createdAt: string;          // ISO 8601 — when entered queue
  pickedUpAt?: string;        // When reviewer started review
  completedAt?: string;       // When review was completed
  slaDeadline?: string;       // Target completion time

  /** SLA breach tracking */
  slaBreached: boolean;
  slaBreachedAt?: string;

  /** Audit trail */
  events: ReviewQueueEvent[];
}

interface ProposedContent {
  sectionType: 'translation' | 'summary_50' | 'summary_200' | 'summary_500' | 'entities' | 'claims' | 'events' | 'locations' | 'categories' | 'relationships' | 'classifications';
  content: unknown;  // The AI proposal data
  confidence: number;
  requiresReview: boolean;  // False if auto-approved (e.g., high-confidence language detection)
  sourceSpans: SourceSpan[];
}

type ReviewType =
  | 'legal_review'
  | 'translation_review'
  | 'editorial_review'
  | 'country_review'
  | 'institution_review'
  | 'source_verification'
  | 'evidence_review'
  | 'safety_review'
  | 'general_review'
  | 'expert_review';

type ReviewStatus =
  | 'new'              // In queue, unassigned
  | 'assigned'         // Assigned to a reviewer
  | 'in_review'        // Reviewer has started working
  | 'changes_requested' // Reviewer requested changes (→ AI or human revision)
  | 'approved'         // Reviewer approved
  | 'rejected'         // Reviewer rejected
  | 'escalated'        // Sent to senior/expert reviewer
  | 'corrected'        // AI proposal was corrected during review
  | 'deprecated'       // Source or proposal rendered obsolete
  | 'published';       // Content has been published

interface ReviewQueueEvent {
  eventType: 'assigned' | 'picked_up' | 'changes_requested' | 'approved' | 'rejected' | 'escalated' | 'corrected' | 'deprecated' | 'published' | 'note_added' | 'sla_breached';
  timestamp: string;
  userId: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}
```

### 6.3 Assignment Logic

```typescript
interface ReviewAssignmentStrategy {
  /**
   * Assign an item to the most appropriate reviewer.
   * Strategy can be:
   *   - round_robin: simple sequential assignment
   *   - expertise_based: match review type to reviewer expertise
   *   - load_balanced: assign to reviewer with fewest open items
   *   - priority_queue: always assign critical items first
   */
  assign(item: ReviewQueueItem, availableReviewers: Reviewer[]): AssignmentResult;
}

interface Reviewer {
  userId: string;
  displayName: string;
  expertise: ReviewType[];
  currentLoad: number;  // Number of open review items
  maxLoad: number;
  isAvailable: boolean;
  reviewHistory: {
    totalReviewed: number;
    averageReviewTimeMs: number;
    accuracyRate: number;  // How often their approvals stand
    lastActiveAt: string;
  };
}

interface AssignmentResult {
  assignedTo: string;
  strategy: 'round_robin' | 'expertise' | 'load_balance' | 'priority';
  estimatedCompletionTime?: string;
}

/**
 * Priority calculation: determines item priority based on multiple factors.
 */
interface PriorityCalculator {
  calculate(item: ReviewQueueItem): 'low' | 'normal' | 'high' | 'critical';
}

// Priority factors:
// - Source trust level (higher trust → higher priority for review)
// - Content sensitivity (legal rulings, casualty data → higher priority)
// - Age in queue (items waiting longer → priority increases)
// - Source freshness (time-sensitive content → higher priority)
// - Contradiction flags (items contradicting existing records → high priority)
// - Escalation status (escalated items → highest priority)
```

### 6.4 SLA Tracking

```typescript
interface SlaConfig {
  reviewType: ReviewType;
  targetCompletionMinutes: number;
  warningThresholdMinutes: number;  // Alert at this percentage of target
  escalationThresholdMinutes: number;  // Auto-escalate at this point
  priorityMultiplier: {
    low: number;       // e.g., 2.0 (double the standard SLA)
    normal: number;    // 1.0
    high: number;      // 0.5 (half the standard SLA)
    critical: number;  // 0.25
  };
}

const DEFAULT_SLA_CONFIGS: SlaConfig[] = [
  { reviewType: 'legal_review', targetCompletionMinutes: 480, warningThresholdMinutes: 360, escalationThresholdMinutes: 720, priorityMultiplier: { low: 2.0, normal: 1.0, high: 0.5, critical: 0.25 } },
  { reviewType: 'translation_review', targetCompletionMinutes: 1440, warningThresholdMinutes: 1080, escalationThresholdMinutes: 2160, priorityMultiplier: { low: 2.0, normal: 1.0, high: 0.5, critical: 0.25 } },
  { reviewType: 'editorial_review', targetCompletionMinutes: 1440, warningThresholdMinutes: 1080, escalationThresholdMinutes: 2160, priorityMultiplier: { low: 2.0, normal: 1.0, high: 0.5, critical: 0.25 } },
  { reviewType: 'country_review', targetCompletionMinutes: 720, warningThresholdMinutes: 540, escalationThresholdMinutes: 1080, priorityMultiplier: { low: 2.0, normal: 1.0, high: 0.5, critical: 0.25 } },
  { reviewType: 'institution_review', targetCompletionMinutes: 720, warningThresholdMinutes: 540, escalationThresholdMinutes: 1080, priorityMultiplier: { low: 2.0, normal: 1.0, high: 0.5, critical: 0.25 } },
  { reviewType: 'source_verification', targetCompletionMinutes: 240, warningThresholdMinutes: 180, escalationThresholdMinutes: 480, priorityMultiplier: { low: 2.0, normal: 1.0, high: 0.5, critical: 0.25 } },
  { reviewType: 'evidence_review', targetCompletionMinutes: 1440, warningThresholdMinutes: 1080, escalationThresholdMinutes: 2160, priorityMultiplier: { low: 2.0, normal: 1.0, high: 0.5, critical: 0.25 } },
  { reviewType: 'safety_review', targetCompletionMinutes: 120, warningThresholdMinutes: 60, escalationThresholdMinutes: 240, priorityMultiplier: { low: 1.0, normal: 0.75, high: 0.5, critical: 0.25 } },
  { reviewType: 'general_review', targetCompletionMinutes: 2880, warningThresholdMinutes: 2160, escalationThresholdMinutes: 4320, priorityMultiplier: { low: 2.0, normal: 1.0, high: 0.5, critical: 0.25 } },
  { reviewType: 'expert_review', targetCompletionMinutes: 4320, warningThresholdMinutes: 3240, escalationThresholdMinutes: 6480, priorityMultiplier: { low: 2.0, normal: 1.0, high: 0.5, critical: 0.25 } },
];
```

### 6.5 Review Types and Requirements

#### 6.5.1 Legal Review

**When triggered:** AI processing of legal content (court rulings, legal filings, legal analyses, warrants, legal case summaries)

**Reviewer requirements:**
- Legal background or training
- Familiarity with international humanitarian law, international criminal law, or relevant national law
- Understanding of the source hierarchy (PRD-v1-archive.md Section 11.1)
- Ability to verify legal terminology, procedural accuracy, and status labels

**Review checklist:**
- [ ] Legal terminology is accurate
- [ ] Procedural status is correctly identified
- [ ] Court/case names are correct
- [ ] Dates of proceedings are accurate
- [ ] Quoted legal provisions are correctly referenced
- [ ] Status labels (PRD-v1-archive.md Section 4.3) are appropriate
- [ ] Genocide terminology policy (PRD-v1-archive.md Section 4.2) is followed
- [ ] AI translation of legal terms is accurate (if translation was performed)

#### 6.5.2 Translation Review

**When triggered:** AI translation of content with risk level "medium" or "high"

**Reviewer requirements:**
- Native or near-native fluency in both source and target language
- For legal translations: legal terminology competence
- For testimony translations: understanding of trauma-informed language

**Review checklist:**
- [ ] Translation preserves meaning faithfully
- [ ] Legal/technical terms are correctly translated
- [ ] Nuance and tone are preserved
- [ ] No content was added or omitted
- [ ] Dates, numbers, names are correctly transferred
- [ ] Source-language cultural context is preserved where relevant

#### 6.5.3 Editorial Review

**When triggered:** AI-generated summaries, briefs, or public-facing text

**Reviewer requirements:**
- Strong writing skills
- Familiarity with brand voice (PRD-v1-archive.md Section 24)
- Understanding of evidence presentation standards

**Review checklist:**
- [ ] Follows brand voice guidelines
- [ ] Clear and readable language
- [ ] Appropriate reading level for target audience
- [ ] No editorializing or advocacy language
- [ ] Claims are properly attributed
- [ ] Source references are accurate
- [ ] Appropriate for the intended audience

#### 6.5.4 Country Review

**When triggered:** AI processing of country-specific content

**Reviewer requirements:**
- Knowledge of the country's political landscape, institutions, and policies
- Familiarity with the country's relevant legal framework

**Review checklist:**
- [ ] Country positions are accurately represented
- [ ] Government/institutional names are correct
- [ ] Voting records are accurate
- [ ] Policy positions are correctly attributed
- [ ] Relevant context is included
- [ ] No outdated information

#### 6.5.5 Institution Review

**When triggered:** AI processing of institution-specific content (EU, UN bodies, etc.)

**Reviewer requirements:**
- Knowledge of the institution's structure, procedures, and relevant policies

**Review checklist:**
- [ ] Institution procedures are accurately described
- [ ] Institutional positions are correctly represented
- [ ] Role and competence boundaries are respected
- [ ] Official names and designations are correct
- [ ] Relevant legal bases are cited accurately

#### 6.5.6 Source Verification

**When triggered:** New source discovered or existing source needs re-verification

**Reviewer requirements:**
- OSINT/source verification skills
- Understanding of the source hierarchy

**Review checklist:**
- [ ] Source identity is confirmed
- [ ] Source URL is valid and authentic
- [ ] Publisher is who they claim to be
- [ ] Publication date is correct
- [ ] Content is not manipulated or misleading
- [ ] Source trust level is appropriate
- [ ] Archive reference is captured

#### 6.5.7 Evidence Review

**When triggered:** AI-proposed evidence records, claim categorizations, or verification level assignments

**Reviewer requirements:**
- Understanding of evidence classification (PRD-v1-archive.md Section 7.1)
- Familiarity with the evidence taxonomy

**Review checklist:**
- [ ] Claim is accurately extracted from source
- [ ] Verification level is appropriate
- [ ] Evidence category is correct
- [ ] Source excerpt accurately supports the claim
- [ ] No over-interpretation of source content
- [ ] Alternative interpretations are noted if relevant

#### 6.5.8 Safety Review

**When triggered:** AI output contains locations, identity information, or potentially sensitive content

**Reviewer requirements:**
- Training in safety and privacy protocols
- Understanding of the red-line policy (PRD-v1-archive.md Section 41)
- Knowledge of precision-level guidelines

**Review checklist:**
- [ ] Location precision is safe
- [ ] No personal/private data exposed
- [ ] No doxing risk
- [ ] No graphic content without warning
- [ ] No sensitive operational data
- [ ] No risk to witnesses or affected communities

### 6.6 Review States and Transitions

```
                    ┌─────────────┐
                    │     New     │
                    └──────┬──────┘
                           │ assign
                    ┌──────▼──────┐
              ┌─────│  Assigned   │
              │     └──────┬──────┘
              │            │ pick up
              │     ┌──────▼──────┐
              │     │  In Review  │
              │     └──┬───┬──┬───┘
              │        │   │  │
              │  ┌─────┘   │  └──────────┐
              │  │         │             │
              │  ▼         ▼             ▼
              │  Approve  Reject    Changes
              │  ┌───┐    ┌───┐    Requested
              │  │   │    │   │    ┌───────┐
              │  │   │    │   │    │       │
              │  │   │    │   │    ▼       │
              │  │   │    │   │  Revise   │
              │  │   │    │   │  ┌───┐    │
              │  │   │    │   │  │   │    │
              │  │   │    │   └──┼───┼────┘
              │  │   │    └──────┼───┼────┐
              │  │   └───────────┼───┼──┐ │
              │  │               │   │  │ │
              │  ▼               ▼   ▼  ▼ ▼
              │  ┌────────────────────────┐
              │  │      Escalated         │────→ Senior Review → Approve/Reject
              │  └────────────────────────┘
              │
              │  ┌─────────────┐
              │  │  Corrected  │── Reviewer corrected AI proposal
              │  └─────────────┘
              │
              │  ┌──────────────┐
              │  │  Deprecated  │── Source/proposal no longer relevant
              │  └──────────────┘
              │
              ▼
        ┌───────────┐
        │ Published │── Content is live on the platform
        └───────────┘
```

### 6.7 Review UI Requirements

The review interface is a web application for human reviewers. It is **not** the public-facing platform.

**Key views:**

#### 6.7.1 Review Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  Review Queue Dashboard                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Filters: [Review Type ▼] [Status ▼] [Priority ▼]    │    │
│  │ Search: [..................................]         │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ Queue Summary:                                      │    │
│  │   New: 12   |   In Review: 8   |   Overdue: 3      │    │
│  │   High Priority: 5   |   Critical: 2                │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ Queue Items (sorted by priority + age):             │    │
│  │ ┌──────────────────────────────────────────────┐    │    │
│  │ │ #1283  ICJ Order on Provisional Measures       │    │    │
│  │ │ Review: Legal    Priority: Critical  Age: 2h   │    │    │
│  │ │ Source: icj.int  Confidence: 0.92              │    │    │
│  │ │ [Review Now]                                   │    │    │
│  │ ├──────────────────────────────────────────────┤    │    │
│  │ │ #1282  OCHA Situation Report #45 Summary       │    │    │
│  │ │ Review: Editorial  Priority: High  Age: 4h     │    │    │
│  │ │ Source: ocha.org   Confidence: 0.85            │    │    │
│  │ │ [Review Now]                                   │    │    │
│  │ ├──────────────────────────────────────────────┤    │    │
│  │ │ ...more items...                               │    │    │
│  │ └──────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

#### 6.7.2 Side-by-Side Review Workspace

```
┌──────────────────────────────┬──────────────────────────────┐
│      AI Proposal             │      Original Source         │
│ ┌────────────────────────┐   │ ┌────────────────────────┐   │
│ │ Summary (200 words)     │   │ │ ICJ Press Release       │   │
│ │                         │   │ │ 2024-03-15              │   │
│ │ The ICJ today issued    │   │ │                         │   │
│ │ provisional measures    │   │ │ The International       │   │
│ │ in the case [1]...      │   │ │ Court of Justice today  │   │
│ │                         │   │ │ issued an order...     │   │
│ │ Confidence: 0.87        │   │ │                         │   │
│ │ [1] Source: icj.int,    │   │ │ Source: icj.int/case184 │   │
│ │     paragraph 3         │   │ │                         │   │
│ └────────────────────────┘   │ └────────────────────────┘   │
│                              │                              │
│ Proposed Entities:           │                              │
│ □ ICJ                         │                              │
│ □ South Africa (correct?)    │                              │
│ □ Israel                     │                              │
│                              │                              │
│ ┌────────────────────────┐   │                              │
│ │ Review Actions          │   │                              │
│ │                         │   │                              │
│ │ [Approve] [Reject]      │   │                              │
│ │ [Request Changes]       │   │                              │
│ │ [Escalate]              │   │                              │
│ │                         │   │                              │
│ │ Notes: [................]  │   │                              │
│ └────────────────────────┘   │                              │
└──────────────────────────────┴──────────────────────────────┘
```

**Required UI features:**

1. **Side-by-side layout**: AI proposal on the left, original source on the right (configurable)
2. **Source span highlighting**: Clicking an AI claim highlights the supporting source span in the source panel
3. **Confidence indicators**: Visual indicators (color-coding, badges) for confidence levels
4. **Quick actions**: One-click approve, reject, request changes, escalate
5. **Inline editing**: Reviewers can edit AI proposals directly
6. **Revision history**: Side-by-side diff of AI proposal vs. reviewer revision
7. **Discussion thread**: Per-item comments between reviewers
8. **Source link**: Direct link to original source URL
9. **Archive link**: Link to archived copy of source
10. **Keyboard shortcuts**: For efficient review workflows
11. **Batch operations**: Approve/reject multiple similar items
12. **Template responses**: Pre-written review notes for common scenarios

#### 6.7.3 Review Audit Trail

Every action in the review workflow is logged:

```typescript
interface ReviewAuditLog {
  id: string;
  reviewItemId: string;
  userId: string;
  action: 'assigned' | 'picked_up' | 'approved' | 'rejected' | 'changes_requested' | 'escalated' | 'corrected' | 'published' | 'note_added';
  timestamp: string;
  previousStatus: ReviewStatus;
  newStatus: ReviewStatus;
  changeDetails?: {
    field: string;
    previousValue: unknown;
    newValue: unknown;
    rationale?: string;
  };
  notes?: string;
}
```

### 6.8 Correction Workflow

When a reviewer corrects an AI proposal, the correction enters its own mini-workflow:

```typescript
interface CorrectionRecord {
  id: string;
  reviewItemId: string;
  originalAiContent: unknown;
  correctedContent: unknown;
  rationale: string;
  correctedBy: string;
  correctedAt: string;
  verifiedBy?: string;   // Second reviewer for critical corrections
  verifiedAt?: string;
  status: 'pending_verification' | 'verified' | 'applied' | 'rejected';
}

// Corrections can be:
// A) Applied immediately (for simple factual fixes by trusted reviewers)
// B) Require secondary verification (for substantive changes to legal content)
// C) Flagged for AI pipeline improvement (correction patterns collected for model tuning)
```

---

## 7. Maps and Geospatial

### 7.1 Architecture

The mapping system renders curated, reviewed geospatial data on interactive maps. It follows the same principle as the rest of the system: AI extracts locations, humans review the output, maps display only reviewed data.

```
┌───────────────────────────────────────────┐
│           Map Data Pipeline               │
│                                           │
│ AI Geographic Extraction → Review Queue   │
│   → Approved Locations → GeoJSON Store    │
│   → Map Rendering                         │
└───────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────┐
│           Rendering Stack                 │
│                                           │
│ MapLibre GL (rendering engine)            │
│ OpenStreetMap (base tiles)                │
│ GeoJSON (all data layers)                 │
│ React MapLibre GL JS (React bindings)     │
└───────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────┐
│           Layer System                    │
│                                           │
│ Events Layer     Sources Layer            │
│ Organizations    Legal Layer              │
│ Infrastructure   Humanitarian Layer       │
│ Timeline Layer (temporal filter)          │
└───────────────────────────────────────────┘
```

**Key requirements:**

- MapLibre GL for rendering (open source, no licensing restrictions)
- OpenStreetMap for base tiles
- GeoJSON for all data layers
- No proprietary mapping SDKs (Google Maps, Mapbox — unless licensing is explicitly approved)
- Only embeddable third-party maps where licensing permits
- Offline-capable tile caching where practical
- Accessibility: maps must be keyboard-navigable and screen-reader compatible

### 7.2 Layer System

```typescript
interface MapLayer {
  /** Layer identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Layer description for legend */
  description: string;
  /** GeoJSON data source */
  geojsonSource: string;  // URL or inline GeoJSON
  /** MapLibre paint properties */
  paint: Record<string, unknown>;
  /** Whether the layer is visible by default */
  visibleByDefault: boolean;
  /** Minimum zoom level for display */
  minZoom?: number;
  /** Maximum zoom level for display */
  maxZoom?: number;
  /** Sort order in the layer control */
  sortOrder: number;
}

interface MapConfig {
  /** Initial center point */
  center: [number, number];  // [lng, lat]
  /** Initial zoom level */
  zoom: number;
  /** Maximum zoom level allowed */
  maxZoom: number;
  /** Minimum zoom level allowed */
  minZoom: number;
  /** Map style URL */
  style: string;
  /** Available layers */
  layers: MapLayer[];
  /** Layer groups for the control panel */
  layerGroups: LayerGroup[];
}

interface LayerGroup {
  id: string;
  name: string;
  layerIds: string[];
}
```

#### 7.2.1 Events Layer

Displays where documented incidents occurred:

```typescript
interface EventLayerConfig {
  id: 'events';
  name: 'Events';
  description: 'Where documented incidents occurred';
  geojsonSource: '/api/v1/maps/events';  // API endpoint returning reviewed events
  featureProperties: {
    // Per GeoJSON Feature properties
    eventId: string;
    title: string;
    description: string;
    eventDate: string;
    eventType: EventType;
    verificationLevel: number;
    evidenceCount: number;
    popupContent: string;  // Pre-rendered HTML for popup
  };
  paint: {
    circleColor: ['get', 'colorByVerificationLevel'],
    circleRadius: ['get', 'radiusByConfidence'],
    circleOpacity: 0.8,
  };
}
```

**Rendering rules:**
- Color-code by verification level (Level 5 = Trust Blue, Level 3 = Signal Amber, Level 1 = Muted Clay)
- Size markers by confidence/evidence count
- Cluster markers at lower zoom levels
- Click popup shows event summary, date, type, verification badge, source links
- Only events with `status = 'published'` and `mapVisibility = 'visible'` are shown
- Events with `safetyFlag = true` are excluded until explicitly reviewed for map safety

#### 7.2.2 Sources Layer

Displays where sources originate (publisher locations):

```typescript
interface SourcesLayerConfig {
  id: 'sources';
  name: 'Sources';
  description: 'Where sources originate — UN agencies, courts, NGOs, government offices';
  geojsonSource: '/api/v1/maps/sources';
}
```

**Rendering rules:**
- Show official headquarter locations of source publishers
- Color-code by publisher type (UN = blue, Court = purple, NGO = green, Government = orange)
- Popup shows source name, publisher type, trust level, link to source page
- Only active sources with `mapVisibility = 'visible'`

#### 7.2.3 Organizations Layer

Displays where organizations operate:

```typescript
interface OrganizationsLayerConfig {
  id: 'organizations';
  name: 'Organizations';
  description: 'Where humanitarian, legal, and civil society organizations operate';
  geojsonSource: '/api/v1/maps/organizations';
}
```

**Rendering rules:**
- Show operational regions as polygons (not precise office locations for sensitive organizations)
- Color-code by organization type
- Popup shows organization name, type, services, official website link
- Only organizations that have consented to map listing (or are public resources)

#### 7.2.4 Legal Layer

Displays jurisdictions and court locations:

```typescript
interface LegalLayerConfig {
  id: 'legal';
  name: 'Legal Jurisdictions';
  description: 'Court locations, jurisdictional boundaries, and legal case venues';
  geojsonSource: '/api/v1/maps/legal';
}
```

**Rendering rules:**
- Show court locations as markers
- Show jurisdictional boundaries as polygons where applicable
- Popup shows court name, active cases, jurisdiction description
- Color-code by court type (ICJ, ICC, national courts, universal jurisdiction)

#### 7.2.5 Infrastructure Layer

Displays hospitals, schools, shelters, and civilian infrastructure:

```typescript
interface InfrastructureLayerConfig {
  id: 'infrastructure';
  name: 'Civilian Infrastructure';
  description: 'Hospitals, schools, shelters, and other civilian infrastructure — safe precision only';
  geojsonSource: '/api/v1/maps/infrastructure';
  requiresExplicitReview: true;  // Every feature must be safety-reviewed before display
}
```

**Safety rules for infrastructure:**
- Never display exact GPS coordinates of active hospitals, shelters, or clinics
- Default to city or neighborhood precision
- Delayed publication for active conflict zones (minimum 72 hours after event)
- Each infrastructure feature requires a safety review before appearing on any public map
- Features with `safetyFlag = 'critical'` are never displayed on public maps (admin-only)

#### 7.2.6 Humanitarian Layer

Displays aid routes, crossings, refugee camps, and humanitarian access points:

```typescript
interface HumanitarianLayerConfig {
  id: 'humanitarian';
  name: 'Humanitarian Access';
  description: 'Aid routes, border crossings, refugee camps — safe precision only';
  geojsonSource: '/api/v1/maps/humanitarian';
  requiresExplicitReview: true;
}
```

**Safety rules for humanitarian layer:**
- Display crossing points and camp locations with delayed precision
- Never display active aid convoy routes in real time
- Use region-level polygons for camp locations, not camp-boundary coordinates
- Coordinate with humanitarian partners before publishing sensitive route data
- Each feature requires humanitarian safety review

#### 7.2.7 Timeline Layer

A temporal filter that applies to all other layers:

```typescript
interface TimelineLayerControl {
  /** Date range filter */
  dateRange: { start: string; end: string } | null;
  /** Animation speed for timeline playback */
  animationSpeed: 'slow' | 'normal' | 'fast';
  /** Whether timeline animation is playing */
  isPlaying: boolean;
  /** Current animation date */
  currentDate: string;
}
```

**Behavior:**
- A date-range slider filters all layers to show only events/features within the selected range
- Play button animates through the timeline, revealing events in chronological order
- Events appear as "pins" dropping on the map at their date
- Older events fade slightly in opacity as time progresses

### 7.3 Safety Rules for Maps

#### 7.3.1 Location Precision Levels

```typescript
enum PrecisionLevel {
  /** Exact GPS coordinates — RARELY published. Requires director-level approval. */
  EXACT = 'exact',
  /** Neighborhood or district level (e.g., "Al-Shifa Hospital, Gaza City") */
  NEIGHBORHOOD = 'neighborhood',
  /** City level (e.g., "Gaza City") */
  CITY = 'city',
  /** Regional level (e.g., "Northern Gaza") */
  REGION = 'region',
  /** Country level only (e.g., "Israel", "Palestine") */
  COUNTRY = 'country',
}

interface LocationSafetyRule {
  locationType: string;
  defaultPrecision: PrecisionLevel;
  allowExactAfterReview: boolean;
  requireDelay: boolean;
  delayHours?: number;
  requiresHumanReview: boolean;
}
```

**Default precision by location type:**

| Location Type | Default Precision | Allow Exact? | Delay Required? |
|---|---|---|---|
| Court location | EXACT | Yes | No |
| Capital city | CITY | Yes | No |
| Major city | CITY | Yes | No |
| Neighborhood | CITY (review for NEIGHBORHOOD) | No | No |
| Hospital/clinic | CITY | No | 72h |
| School | CITY | No | 72h |
| Shelter | REGION | No | 168h (1 week) |
| Refugee camp | REGION | No | 72h |
| Aid route | REGION | No | Never |
| Border crossing | CITY | With review | 72h |
| Military position | Never published | No | N/A |
| Witness home/location | Never published | No | N/A |
| Attack site | NEIGHBORHOOD | With review | 24h |
| Mass grave site | REGION | No | 168h |

#### 7.3.2 Delayed Publication

For active crisis zones, map data may be delayed to prevent real-time tracking:

```typescript
interface DelayConfig {
  /** Default delay for all map data in this region */
  defaultDelayHours: number;
  /** Override delays for specific location types */
  typeOverrides: Record<string, number>;
  /** Whether delay is active */
  delayActive: boolean;
  /** Reason for delay (for internal notes) */
  delayReason?: string;
}

// Example: Active conflict zone configuration
const activeConflictZoneDelay: DelayConfig = {
  defaultDelayHours: 48,
  typeOverrides: {
    'shelter': 168,
    'hospital': 72,
    'attack_site': 24,
  },
  delayActive: true,
  delayReason: 'Active hostilities — delaying map data to prevent real-time targeting',
};
```

#### 7.3.3 Review Gate for Map Data

All map features pass through the review queue (Section 6) before publication:

```typescript
interface MapFeatureReviewChecklist {
  locationName: string;
  coordinates: [number, number];
  precision: PrecisionLevel;
  isPrecisionAppropriate: boolean;    // Is the precision level safe for this location type?
  isDelayedAppropriately: boolean;   // Has the delay period been observed?
  noExactCoordinates: boolean;       // No exact GPS for sensitive locations
  noOperationalData: boolean;        // No active operational routes or positions
  noWitnessData: boolean;            // No witness location data
  humanitarianPartnerOk: boolean;    // If humanitarian data, partner has approved?
  reviewerNotes?: string;
}

interface MapSafetyReview {
  featureId: string;
  result: 'approved' | 'needs_changes' | 'rejected';
  precisionAdjustment?: PrecisionLevel;
  delayExtension?: number;
  notes: string;
  reviewedBy: string;
  reviewedAt: string;
}
```

---

## 8. Timeline Engine

The Timeline Engine organizes events extracted from sources into structured, navigable, verifiable timelines. Its core entity is the **event** (not the article), and it handles deduplication, sequencing, and cross-referencing.

### 8.1 Architecture

```
Multiple Sources → Event Extraction → AI Event Deduplication → Human Review
      → Canonical Timeline → Public Timeline Views
```

**Design principles:**
- Events are the primary entity — not the articles that report them
- Many articles may document the same event (event deduplication)
- Many sources contribute to one timeline
- Each event has source references for every claim
- Timelines support chronological and reverse-chronological views
- Timelines are filterable by: category, location, entity, source type, verification level

### 8.2 Event Data Model

```typescript
interface TimelineEventRecord {
  /** System-generated UUID */
  id: string;

  /** Canonical event title */
  title: string;

  /** Detailed event description — reviewed summary */
  description: string;

  /** Event date (ISO 8601) */
  date: string;
  datePrecision: 'exact' | 'day' | 'week' | 'month' | 'year';
  dateEnd?: string;  // For ongoing events

  /** Categories */
  eventType: EventType;
  evidenceCategories: EvidenceCategory[];

  /** Location */
  locations: TimelineLocation[];

  /** Source references */
  sourceRecords: TimelineSourceRef[];

  /** Entities involved */
  involvedEntities: TimelineEntityRef[];

  /** Verification level (0–5) */
  verificationLevel: number;

  /** Status */
  status: 'ai_proposed' | 'draft' | 'verified' | 'disputed' | 'corrected' | 'deprecated';

  /** Deduplication */
  duplicateOf?: string;  // If this event was merged into another
  duplicateGroupId?: string;  // Group of records representing the same event
  isCanonical: boolean;  // Is this the canonical record after deduplication?

  /** Temporal context */
  precedes?: string[];   // Event IDs that follow this one
  follows?: string[];    // Event IDs that precede this one

  /** Related events */
  subEvents?: string[];  // Events that are part of this event
  parentEvent?: string;  // Event this is part of

  /** Metadata */
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

interface TimelineLocation {
  name: string;
  precision: PrecisionLevel;
  coordinates?: [number, number];
}

interface TimelineSourceRef {
  sourceRecordId: string;
  url: string;
  publisher: string;
  publishedAt: string;
  excerpt?: string;
}

interface TimelineEntityRef {
  entityId: string;
  entityName: string;
  entityType: EntityRecord['entityType'];
  role?: string;
}
```

### 8.3 Event Deduplication

When multiple sources report the same event, the deduplication engine identifies matches and proposes merges:

```typescript
interface EventDeduplicationEngine {
  /**
   * Find potential duplicate events in the database.
   * Uses a combination of:
   *   1. Date proximity (events on the same day or within configurable window)
   *   2. Location overlap (same city, region, or coordinates)
   *   3. Entity overlap (same entities mentioned)
   *   4. Text similarity (cosine similarity of descriptions)
   *   5. Source overlap (shared source URLs)
   */
  findDuplicates(newEvent: TimelineEventRecord): Promise<DuplicateCandidate[]>;

  /**
   * Run a full deduplication scan of the event database.
   * Returns merge proposals for human review.
   */
  scanAllEvents(): Promise<MergeProposal[]>;
}

interface DuplicateCandidate {
  existingEventId: string;
  similarityScore: number;  // 0–1
  matchReasons: ('date' | 'location' | 'entity' | 'text' | 'source')[];
  comparisonSummary: {
    dateMatch: boolean;
    locationMatch: boolean;
    entityOverlap: number;  // Percentage of shared entities
    textSimilarity: number;
    sourceOverlap: number;
  };
  suggestedAction: 'merge' | 'link' | 'separate';
}

interface MergeProposal {
  primaryEventId: string;
  mergeEventId: string;
  similarityScore: number;
  matchReasons: string[];
  proposedMergedFields: Partial<TimelineEventRecord>;
  conflictingFields: { field: string; primaryValue: unknown; mergeValue: unknown }[];
  status: 'pending' | 'approved' | 'rejected';
}
```

**Deduplication rules:**
- AI proposes merge candidates; humans make the final decision
- Conflicting fields (different dates, different casualty counts) are highlighted for human resolution
- Merged events retain all source references from both original records
- The merge decision is recorded in the audit trail
- Unmerge is possible if a merge is later found to be incorrect

### 8.4 Timeline Views

```typescript
interface TimelineQuery {
  /** Filters */
  dateFrom?: string;
  dateTo?: string;
  eventTypes?: EventType[];
  categories?: EvidenceCategory[];
  locations?: string[];
  entities?: string[];
  sourceTypes?: SourceType[];
  verificationLevels?: number[];
  status?: TimelineEventRecord['status'];

  /** Sorting */
  sortDirection: 'asc' | 'desc';

  /** Pagination */
  limit: number;
  offset: number;
}

interface TimelineView {
  events: TimelineEventRecord[];
  totalCount: number;
  dateRange: { start: string; end: string };
  filterSummary: {
    categories: { category: string; count: number }[];
    locations: { location: string; count: number }[];
    entities: { entity: string; count: number }[];
  };
}
```

### 8.5 Timeline Component Specifications

```typescript
interface TimelineComponentProps {
  events: TimelineEventRecord[];
  viewMode: 'chronological' | 'reverse_chronological' | 'grouped';
  groupBy?: 'day' | 'week' | 'month' | 'year' | 'category' | 'location';
  maxItems?: number;
  showFilters?: boolean;
  showSourceCount?: boolean;
  compact?: boolean;
}

/**
 * Timeline UI components needed:
 *
 * 1. TimelineView — Full timeline with date-axis, event cards, and filters
 * 2. TimelineEventCard — Individual event card with date, title, description, source count, verification badge
 * 3. TimelineFilter — Filter panel with date range, category, location, entity, verification level
 * 4. TimelineNavigation — Navigation controls for date range and scroll position
 * 5. TimelineAnimation — Optional animated chronological reveal
 * 6. TimelineCompare — Side-by-side comparison of two events (for deduplication review)
 * 7. TimelineExport — Export timeline as JSON, CSV, or timeline graphic
 */
```

---

## 9. Knowledge Graph

The Knowledge Graph connects sources, claims, evidence, events, entities, countries, institutions, legal cases, and actions into a traversable network. It enables queries that span the entire data model, such as "What evidence exists for this claim?" or "Which organizations are active in this region?"

### 9.1 Entity Types and Relationships

```
Source ──sourced_from──► Claim ──claims──► Evidence ──documents──► Event
  │                        │                                            │
  │                        │                                            ├──involved_in──► Country
  │                        │                                            ├──involved_in──► Institution
  │                        │                                            ├──involved_in──► Person
  │                        │                                            └──involved_in──► Organization
  │                        │
  │                        └──related_to──► Legal Case
  │                                            │
  │                                            ├──brought_by──► Entity (Country/Institution/Person)
  │                                            └──jurisdiction──► Country
  │
  └──published_by──► Publisher (Entity)
```

### 9.2 Graph Schema

```typescript
interface GraphNode {
  /** Unique identifier */
  id: string;
  /** Node type */
  type: NodeType;
  /** Human-readable label */
  label: string;
  /** Properties (type-specific) */
  properties: Record<string, unknown>;
  /** When the node was created */
  createdAt: string;
  /** When the node was last updated */
  updatedAt: string;
}

type NodeType =
  | 'source_record'
  | 'claim'
  | 'evidence'
  | 'event'
  | 'country'
  | 'institution'
  | 'person'
  | 'organization'
  | 'legal_case'
  | 'action'
  | 'location'
  | 'publisher';

interface GraphEdge {
  /** Unique identifier */
  id: string;
  /** Source node ID */
  sourceId: string;
  /** Target node ID */
  targetId: string;
  /** Relationship type */
  relationshipType: EdgeType;
  /** Edge properties */
  properties: {
    confidence?: number;
    sourceSpan?: SourceSpan;
    sourceRecordId?: string;
    startDate?: string;
    endDate?: string;
    weight?: number;  // For ranking/counting
  };
  /** When the edge was created */
  createdAt: string;
  /** When the edge was last updated */
  updatedAt: string;
}

type EdgeType =
  | 'sourced_from'       // Claim → Source (claim originates from this source)
  | 'claims'             // Evidence → Claim (evidence supports/refutes this claim)
  | 'documents'          // Evidence → Event (evidence documents this event)
  | 'involved_in'        // Entity → Event (entity was involved in event)
  | 'located_in'         // Event → Location (event occurred at location)
  | 'located_at'         // Entity → Location (entity is located at)
  | 'governs'            // Country → Institution (country governs this institution)
  | 'part_of'            // Sub-entity → Parent Entity
  | 'member_of'          // Person → Organization
  | 'brought_by'         // Legal Case → Entity (entity brought the case)
  | 'jurisdiction_of'    // Legal Case → Country (country has jurisdiction)
  | 'responded_to_by'    // Action → Event (action was a response to event)
  | 'related_to'         // Generic relationship
  | 'same_as'            // Deduplication edge
  | 'contradicts'        // Evidence → Evidence (one contradicts another)
  | 'corroborates'       // Evidence → Evidence (one supports another)
  | 'precedes'           // Event → Event (temporal ordering)
  | 'follows'            // Event → Event (temporal ordering)
  | 'published_by';      // Source → Publisher
```

### 9.3 Node-Specific Properties

```typescript
// Source Record Node Properties
interface SourceNodeProperties {
  sourceType: SourceType;
  publisher: string;
  publisherType: PublisherType;
  publishedAt: string;
  url: string;
  trustLevel: number;
  verificationLevel: number;
  languages: string[];
  bodyHash: string;
}

// Claim Node Properties
interface ClaimNodeProperties {
  claimText: string;
  claimType: ExtractedClaim['claimType'];
  category: EvidenceCategory;
  confidence: number;
  verificationLevel: number;
  isAttributedTo?: string;
}

// Evidence Node Properties
interface EvidenceNodeProperties {
  claimSummary: string;
  category: EvidenceCategory;
  verificationLevel: number;
  verificationStatus: EvidenceRecord['verificationStatus'];
  publicationStatus: EvidenceRecord['publicationStatus'];
}

// Event Node Properties
interface EventNodeProperties {
  eventType: EventType;
  eventDate: string;
  datePrecision: TimelineEventRecord['datePrecision'];
  verificationLevel: number;
  sourceCount: number;
}

// Entity Node Properties (shared across person/organization/country/institution)
interface EntityNodeProperties {
  entityType: 'person' | 'organization' | 'country' | 'institution';
  aliases: string[];
  isActive: boolean;
  isVerified: boolean;
}
```

### 9.4 Query Patterns

The Knowledge Graph supports the following canonical queries:

```typescript
interface KnowledgeGraphQueries {
  /**
   * Find all events a country or institution was involved in.
   */
  eventsByEntity(entityId: string, dateRange?: { start?: string; end?: string }): Promise<GraphNode[]>;

  /**
   * Find all evidence supporting a specific claim.
   * Returns evidence nodes and their source references.
   */
  evidenceForClaim(claimId: string): Promise<{
    evidence: GraphNode;
    sources: GraphNode[];
    chain: GraphEdge[];
  }[]>;

  /**
   * Find all organizations active in a region/country.
   */
  organizationsInRegion(locationName: string, organizationTypes?: string[]): Promise<GraphNode[]>;

  /**
   * Find all legal cases related to an event.
   */
  legalCasesForEvent(eventId: string): Promise<{
    case: GraphNode;
    relevance: string;
    relationshipEdges: GraphEdge[];
  }[]>;

  /**
   * Get a complete timeline of events for a location.
   */
  timelineForLocation(locationName: string, dateFrom?: string, dateTo?: string): Promise<GraphNode[]>;

  /**
   * Find all claims made by a specific publisher/source.
   */
  claimsBySource(sourceId: string): Promise<GraphNode[]>;

  /**
   * Traverse from a source through claims to evidence to events.
   * Full traceability chain.
   */
  traceSourceToEvents(sourceId: string): Promise<{
    source: GraphNode;
    claims: GraphNode[];
    evidence: GraphNode[];
    events: GraphNode[];
  }>;

  /**
   * Find contradictions: evidence items that contradict each other.
   */
  findContradictions(entityId?: string): Promise<{
    evidenceA: GraphNode;
    evidenceB: GraphNode;
    contradictionType: string;
    resolution: 'unresolved' | 'resolved';
  }[]>;
}
```

### 9.5 Graph Visualization

```typescript
interface GraphVisualizationConfig {
  /** Which node types to show */
  visibleNodeTypes: NodeType[];
  /** Which edge types to show */
  visibleEdgeTypes: EdgeType[];
  /** Node size encoding */
  nodeSizeBy: 'degree' | 'evidence_count' | 'confidence' | 'fixed';
  /** Node color encoding */
  nodeColorBy: 'type' | 'verification_level' | 'status';
  /** Maximum nodes to display */
  maxNodes: number;
  /** Layout algorithm */
  layout: 'force_directed' | 'hierarchical' | 'circular' | 'radial';
  /** Interactive features */
  zoomable: boolean;
  draggable: boolean;
  clickToExpand: boolean;
}
```

### 9.6 Graph Implementation Considerations

- **Database options**: PostgreSQL + pgRouting + recursive CTEs (for moderate scale), or dedicated graph database (Neo4j, Apache Age) for large-scale traversal
- **Index strategy**: Index on (sourceId, targetId, relationshipType) for edge lookups
- **Performance**: Graph queries should complete within 500ms for typical paths (5 or fewer hops)
- **Materialized views**: Common query patterns (events-by-country, claims-by-source) should use materialized views for performance
- **Update strategy**: Edges are added during AI pipeline processing (relationship detection stage); edge deletions/updates occur during review corrections

---

## 10. Intelligence Dashboard

The Intelligence Dashboard provides operational visibility into the entire AI Intelligence Layer. It is an admin tool (not public-facing) that displays metrics, health status, and management controls.

### 10.1 Metrics

```typescript
interface SystemMetrics {
  /** Source metrics */
  sources: {
    total: number;
    healthy: number;
    degraded: number;
    failed: number;
    pendingFirstCheck: number;
    retired: number;
    monitored: number;
  };

  /** Collection metrics */
  collection: {
    totalItemsFetched: number;
    itemsFetchedToday: number;
    itemsFetchedThisWeek: number;
    itemsFetchedThisMonth: number;
    averageFetchDurationMs: number;
    totalFetchErrors: number;
    fetchErrorRate24h: number;  // Percentage
  };

  /** AI Pipeline metrics */
  aiPipeline: {
    totalProcessed: number;
    processedToday: number;
    averageProcessingTimeMs: number;
    throughputPerHour: number;
    errorRate24h: number;
    averageConfidence: number;
    confidenceDistribution: {
      high: number;   // 0.8–1.0
      medium: number; // 0.5–0.79
      low: number;    // 0.0–0.49
    };
    hallucinationRate: number;  // Percentage of outputs flagged
  };

  /** Review Queue metrics */
  reviewQueue: {
    total: number;
    new: number;
    assigned: number;
    inReview: number;
    changesRequested: number;
    approved: number;
    rejected: number;
    escalated: number;
    published: number;
    averageWaitTimeHours: number;
    averageReviewTimeHours: number;
    slaBreachCount: number;
    overdueItems: number;
  };

  /** Quality metrics */
  quality: {
    correctionRate: number;  // Percentage of published items later corrected
    reviewerAgreementRate: number;  // Inter-reviewer agreement
    averageItemsReviewedPerReviewer: number;
    topCorrectionCategories: { category: string; count: number }[];
  };
}
```

### 10.2 Dashboard Views

#### 10.2.1 Overview Dashboard

A single-page summary of the most critical metrics:

```
┌─────────────────────────────────────────────────────────────┐
│  AI Intelligence Dashboard  [Last updated: 2026-07-24 14:30] │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│ │ Sources  │  │ Pipeline  │  │ Queue    │  │ Quality  │     │
│ │ 28✓ 2⚠ 1✗│  │ 98.5% ok  │  │ 12 new   │  │ 96.2%    │     │
│ │          │  │ 1.2s avg  │  │ 3 over   │  │ 2.1%     │     │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Queue Depth (Last 7 Days)                               │ │
│ │ ████████████░░░░░░░░░░░░░░░░░░░░ 12 pending             │ │
│ │ ██████████████████████████░░░░░░ 24 in review           │ │
│ │ ████████████████████████████████ 118 reviewed this week  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Confidence Distribution (Last 24h)                       │ │
│ │ High (0.8+):    ████████████████ 68%                     │ │
│ │ Medium (0.5-):  ████████ 24%                             │ │
│ │ Low (<0.5):     ██ 8%                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Recent Events                                            │ │
│ │ 14:28  ICJ Collector — 3 new items fetched               │ │
│ │ 14:15  OCHA Collector — 1 item failed (timeout)          │ │
│ │ 13:50  AI Pipeline — 5 items processed, 2 for review     │ │
│ │ 13:30  Review Queue — #1283 approved and published       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 10.2.2 Source Registry Management

```
┌─────────────────────────────────────────────────────────────┐
│  Source Registry                            [Add Source +]  │
├─────────────────────────────────────────────────────────────┤
│ Search: [...................]  Filter: [All ▼]              │
│                                                             │
│ ┌─────────┬──────────────┬─────────┬────────┬────────────┐ │
│ │ Name    │ Publisher    │ Health  │ Last   │ Items      │ │
│ │         │              │         │ Fetch  │ Today/Total│ │
│ ├─────────┼──────────────┼─────────┼────────┼────────────┤ │
│ │ ICJ RSS │ International│ ● 0.2s  │ 14:28  │ 3 / 1,247  │ │
│ │         │ Court of     │ 100%    │        │            │ │
│ │         │ Justice      │         │        │            │ │
│ ├─────────┼──────────────┼─────────┼────────┼────────────┤ │
│ │ OCHA    │ UN OCHA      │ ● 0.8s  │ 14:15  │ 1 / 3,421  │ │
│ │ Relief  │              │  95%    │        │            │ │
│ ├─────────┼──────────────┼─────────┼────────┼────────────┤ │
│ │ ...     │ ...          │ ...     │ ...    │ ...        │ │
│ └─────────┴──────────────┴─────────┴────────┴────────────┘ │
│                                                             │
│ [Edit Source]  [Test Connection]  [Trigger Fetch]           │
│ [Enable/Disable Monitoring]  [Configure Schedule]           │
└─────────────────────────────────────────────────────────────┘
```

#### 10.2.3 Review Queue Management

```
┌─────────────────────────────────────────────────────────────┐
│  Review Queue Management                    [Assign Reviewers] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Queue Overview                                          │ │
│ │ Total: 47    |    New: 12    |    Overdue: 3            │ │
│ │ Avg wait: 4.2h    |    SLA breach rate: 2.1%            │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Reviewer Workload:                                       │ │
│ │ Alice (Legal):    4 open  |  12 reviewed today  |  95%  │ │
│ │ Bob (Editorial):  7 open  |  8 reviewed today   |  88%  │ │
│ │ Carol (Safety):   2 open  |  15 reviewed today  |  97%  │ │
│ │                                                         │ │
│ │ [Reassign]  [View All Reviewers]  [Adjust Load]         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 10.2.4 AI Operation Log

```typescript
interface AiOperationLogEntry {
  id: string;
  sourceRecordId: string;
  pipelineResultId: string;
  operationType: AIOperationType;
  model: string;
  modelVersion: string;
  inputTokenCount: number;
  outputTokenCount: number;
  durationMs: number;
  confidence: number;
  status: 'success' | 'error' | 'timeout' | 'fallback_used';
  errorMessage?: string;
  warnings: AIWarning[];
  timestamp: string;
}

interface AiOperationLogQuery {
  dateFrom?: string;
  dateTo?: string;
  operationType?: AIOperationType;
  model?: string;
  status?: 'success' | 'error' | 'timeout' | 'fallback_used';
  confidenceMin?: number;
  confidenceMax?: number;
  limit?: number;
  offset?: number;
}
```

#### 10.2.5 Error and Exception Tracking

```typescript
interface PipelineException {
  id: string;
  timestamp: string;
  exceptionType: 'collector_error' | 'validation_error' | 'ai_error' | 'review_error' | 'infrastructure_error' | 'security_error';
  severity: 'info' | 'warning' | 'critical';
  sourceId?: string;
  pipelineResultId?: string;
  errorMessage: string;
  stackTrace?: string;
  resolution?: 'unresolved' | 'resolved' | 'workaround';
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}
```

### 10.3 Dashboard Implementation Requirements

- **Role-based access**: Dashboard is admin-only (no public exposure)
- **Real-time updates**: Metrics refresh every 30 seconds (configurable)
- **Historical data**: 90-day retention for all metrics; 30-day for detail logs
- **Export**: Dashboard data exportable as CSV or JSON
- **Alert integration**: Dashboard metrics drive alerting (Section 12.2)
- **Responsive**: Functional on desktop and tablet

---

## 11. Testing and Quality Assurance

### 11.1 Collector Testing

#### 11.1.1 Mock Source Data

Each collector must have a corresponding mock data provider that returns realistic test data:

```typescript
interface CollectorMockData {
  /** Name of the mock data set */
  name: string;
  /** The collector this mock targets */
  collectorName: string;
  /** Mock RawSourceData responses */
  fetchResponses: {
    scenario: 'normal' | 'empty' | 'error' | 'rate_limited' | 'malformed' | 'duplicate';
    data: RawSourceData[];
  }[];
  /** Expected normalized output for each scenario */
  expectedOutputs: {
    scenario: string;
    normalized: NormalizedSourceRecord[];
    errors?: string[];
  }[];
}

// Example mock data set for ICJ collector:
const icjMockData: CollectorMockData = {
  name: 'ICJ Press Release Mock',
  collectorName: 'IcjCollector',
  fetchResponses: [
    {
      scenario: 'normal',
      data: [
        {
          externalId: 'icj-pr-2024-001',
          sourceUrl: 'https://www.icj-cij.org/rss',
          rawContent: '{\n  "title": "ICJ issues provisional measures",\n  "date": "2024-03-15",\n  "body": "The International Court of Justice today..."\n}',
          contentType: 'application/json',
          sourcePublishedAt: '2024-03-15T12:00:00Z',
          fetchMetadata: { statusCode: '200' },
          fetchedAt: '2024-03-15T12:05:00Z',
        },
      ],
    },
    {
      scenario: 'empty',
      data: [],
    },
    {
      scenario: 'error',
      data: [],
      fetchError: 'ECONNRESET',
    },
  ],
  expectedOutputs: [
    {
      scenario: 'normal',
      normalized: [
        {
          /* ... expected normalized record ... */
        },
      ],
    },
  ],
};
```

#### 11.1.2 Validation Test Suite

```typescript
interface CollectorTestSuite {
  /** Test fetch() with normal response */
  testFetchNormal(): Promise<TestResult>;
  /** Test fetch() with empty response */
  testFetchEmpty(): Promise<TestResult>;
  /** Test fetch() with error */
  testFetchError(): Promise<TestResult>;
  /** Test fetch() with rate limiting */
  testFetchRateLimited(): Promise<TestResult>;
  /** Test validate() with valid data */
  testValidateValid(): Promise<TestResult>;
  /** Test validate() with missing required fields */
  testValidateMissingFields(): Promise<TestResult>;
  /** Test validate() with malformed data */
  testValidateMalformed(): Promise<TestResult>;
  /** Test normalize() produces expected structure */
  testNormalizeStructure(): Promise<TestResult>;
  /** Test normalize() date formats */
  testNormalizeDates(): Promise<TestResult>;
  /** Test normalize() language detection */
  testNormalizeLanguages(): Promise<TestResult>;
  /** Test the full run() pipeline */
  testFullPipeline(): Promise<TestResult>;
  /** Test deduplication within the collector */
  testDeduplication(): Promise<TestResult>;
}
```

#### 11.1.3 End-to-End Collector Tests

Test the full `fetch → validate → normalize → deduplicate → store` pipeline against mock APIs:

```typescript
interface CollectorE2ETest {
  setupMockServer(): Promise<void>;
  teardownMockServer(): Promise<void>;
  testRealisticFetchFlow(): Promise<TestResult>;
  testErrorRecoveryFlow(): Promise<TestResult>;
  testRateLimitHandling(): Promise<TestResult>;
  testDuplicateDetection(): Promise<TestResult>;
}
```

### 11.2 AI Pipeline Testing

#### 11.2.1 Ground Truth Datasets

For each AI task, maintain a ground truth dataset of known inputs and expected outputs:

```typescript
interface GroundTruthDataset {
  /** Dataset identifier */
  id: string;
  /** AI task type */
  taskType: AIOperationType;
  /** Description of the dataset */
  description: string;
  /** Source language(s) */
  languages: string[];
  /** Content types covered */
  contentTypes: string[];
  /** Items */
  items: GroundTruthItem[];
  /** When the dataset was last updated */
  updatedAt: string;
}

interface GroundTruthItem {
  input: string;  // Source text
  expectedOutput: unknown;  // Expected AI output
  acceptableAlternatives?: unknown[];  // Variations that are also correct
  notes?: string;  // Edge case notes
}
```

**Ground truth dataset requirements:**

| Task | Minimum Items | Languages | Special Coverage |
|---|---|---|---|
| Translation | 200 | EN, FR, NL, AR, ES, DE | Legal terminology, casualty language, diplomatic language |
| Summarization | 100 | EN, FR | Legal rulings, humanitarian reports, NGO findings |
| Entity Extraction | 200 | EN, FR, AR | Person names, organization names, location names, coreference |
| Claim Extraction | 150 | EN, FR | Attributed claims, direct claims, allegations |
| Timeline Extraction | 100 | EN | Single-day events, multi-day events, recurring events |
| Geographic Extraction | 150 | EN, FR, AR | Cities, regions, facilities, safe precision edge cases |
| Topic Classification | 200 | EN, FR | All evidence categories, multi-topic documents |

#### 11.2.2 Confidence Calibration Tests

```typescript
interface ConfidenceCalibrationTest {
  /**
   * Run the AI pipeline against ground truth data and compare
   * confidence scores to actual accuracy.
   * Goal: confidence should be well-calibrated (e.g., 90% confident
   * items should be correct ~90% of the time).
   */
  runCalibration(): Promise<CalibrationResult>;

  /**
   * Generate calibration curve data.
   */
  generateCalibrationCurve(): CalibrationCurvePoint[];
}

interface CalibrationResult {
  taskType: AIOperationType;
  overallAccuracy: number;
  calibrationError: number;  // Lower = better calibrated (perfect = 0)
  bins: {
    confidenceRange: string;  // e.g., "0.9-1.0"
    itemsInBin: number;
    actualAccuracy: number;
    calibrationGap: number;  // Confidence - Accuracy
  }[];
}

interface CalibrationCurvePoint {
  confidence: number;  // 0.0 to 1.0 in 0.1 increments
  actualAccuracy: number;
  itemCount: number;
}
```

#### 11.2.3 Hallucination Detection Tests

```typescript
interface HallucinationTest {
  /** Test that the detector catches known hallucination patterns */
  testKnownHallucinations(): Promise<TestResult>;
  /** Test that the detector does not flag correct outputs */
  testFalsePositives(): Promise<TestResult>;
  /** Test source span verification accuracy */
  testSourceSpanVerification(): Promise<TestResult>;
  /** Test cross-reference check accuracy */
  testCrossReferenceCheck(): Promise<TestResult>;
}

interface HallucinationTestDataset {
  items: {
    input: string;
    aiOutput: AIOperationResult;
    expectedHallucinationFlags: {
      type: string;
      expectedSeverity: 'minor' | 'major' | 'critical';
    }[];
    description: string;
  }[];
}
```

**Hallucination patterns to test:**

1. **Date invention**: AI outputs a specific date not present in source
2. **Name confabulation**: AI invents a person or organization name
3. **Number hallucination**: AI outputs casualty figures not in source
4. **Claim fabrication**: AI creates a factual claim not supported by source
5. **Location hallucination**: AI places an event in a location not mentioned
6. **Quote fabrication**: AI generates a quote that does not appear in source
7. **Over-attribution**: AI attributes a claim to the wrong speaker
8. **Source span mismatch**: AI references a source span that does not support the claim

#### 11.2.4 Regression Tests for Prompt Changes

```typescript
interface PromptRegressionTest {
  /**
   * Run all ground truth datasets against the current AI pipeline.
   * Compare results to baseline (previous known-good run).
   * Flag any regressions (degradation in accuracy or confidence calibration).
   */
  runRegressionSuite(): Promise<RegressionResult>;

  /**
   * Compare two pipeline runs.
   */
  compareRuns(baselineId: string, currentId: string): RegressionDiff;
}

interface RegressionResult {
  baselineId: string;
  currentId: string;
  overallChange: number;  // Positive = improvement, negative = regression
  perTask: {
    taskType: AIOperationType;
    baselineAccuracy: number;
    currentAccuracy: number;
    change: number;
    regressionsDetected: RegressionItem[];
    improvementsDetected: RegressionItem[];
  }[];
}

interface RegressionItem {
  groundTruthId: string;
  input: string;
  expectedOutput: unknown;
  baselineOutput: unknown;
  currentOutput: unknown;
  severity: 'minor' | 'moderate' | 'severe';
}

interface RegressionDiff {
  summary: string;
  regressions: RegressionItem[];
  improvements: RegressionItem[];
}
```

### 11.3 Integration Testing

#### 11.3.1 End-to-End: Source Fetch to Review Queue

```typescript
interface E2ETestScenario {
  name: string;
  description: string;
  steps: E2ETestStep[];
  expectedFinalState: string;
}

interface E2ETestStep {
  action: 'fetch_source' | 'validate' | 'normalize' | 'run_ai_pipeline' | 'enqueue_review' | 'assign_reviewer' | 'approve' | 'reject' | 'publish';
  input?: unknown;
  expectedResult: unknown;
}

// Scenario: Legal document goes from ICJ → AI processing → Review → Publication
const legalDocumentE2E: E2ETestScenario = {
  name: 'ICJ Legal Document Full Pipeline',
  description: 'Test full pipeline from ICJ source fetch to published event',
  steps: [
    { action: 'fetch_source', input: { sourceId: 'source-icj', mockData: 'icj-pr-2024-001' }, expectedResult: { count: 1 } },
    { action: 'validate', input: {}, expectedResult: { valid: true } },
    { action: 'normalize', input: {}, expectedResult: { normalized: true } },
    { action: 'run_ai_pipeline', input: {}, expectedResult: { stages: ['language_detection', 'summarization', 'entity_extraction', 'claim_extraction', 'timeline_extraction', 'topic_classification'], success: true } },
    { action: 'enqueue_review', input: {}, expectedResult: { status: 'new', reviewType: 'legal_review' } },
    { action: 'assign_reviewer', input: { reviewerId: 'reviewer-legal-1' }, expectedResult: { status: 'assigned' } },
    { action: 'approve', input: {}, expectedResult: { status: 'approved' } },
    { action: 'publish', input: {}, expectedResult: { status: 'published', publishedAt: expect.any(String) } },
  ],
  expectedFinalState: 'published',
};
```

#### 11.3.2 Review Workflow State Transitions

Test all valid and invalid review state transitions:

```typescript
interface StateTransitionTest {
  from: ReviewStatus;
  to: ReviewStatus;
  action: string;
  shouldSucceed: boolean;
  requiredRole?: string;
}

const reviewStateTransitions: StateTransitionTest[] = [
  // Valid transitions
  { from: 'new', to: 'assigned', action: 'assign', shouldSucceed: true, requiredRole: 'queue_manager' },
  { from: 'assigned', to: 'in_review', action: 'pick_up', shouldSucceed: true, requiredRole: 'reviewer' },
  { from: 'in_review', to: 'approved', action: 'approve', shouldSucceed: true, requiredRole: 'reviewer' },
  { from: 'in_review', to: 'rejected', action: 'reject', shouldSucceed: true, requiredRole: 'reviewer' },
  { from: 'in_review', to: 'changes_requested', action: 'request_changes', shouldSucceed: true, requiredRole: 'reviewer' },
  { from: 'in_review', to: 'escalated', action: 'escalate', shouldSucceed: true, requiredRole: 'reviewer' },
  { from: 'changes_requested', to: 'in_review', action: 'resubmit', shouldSucceed: true, requiredRole: 'ai_admin' },
  { from: 'approved', to: 'published', action: 'publish', shouldSucceed: true, requiredRole: 'editor' },
  { from: 'published', to: 'deprecated', action: 'deprecate', shouldSucceed: true, requiredRole: 'editor' },

  // Invalid transitions
  { from: 'new', to: 'approved', action: 'approve', shouldSucceed: false },  // Must assign first
  { from: 'new', to: 'published', action: 'publish', shouldSucceed: false },  // Must go through review
  { from: 'rejected', to: 'published', action: 'publish', shouldSucceed: false },  // Can't publish rejected
  { from: 'new', to: 'in_review', action: 'pick_up', shouldSucceed: false },  // Must be assigned first
];
```

#### 11.3.3 Map Data Safety Checks

```typescript
interface MapSafetyTest {
  /** Test that sensitive locations are correctly precision-reduced */
  testSensitiveLocationPrecision(): Promise<TestResult>;

  /** Test that no exact GPS is published for protected location types */
  testNoExactGpsForProtectedTypes(): Promise<TestResult>;

  /** Test delay enforcement for active crisis zones */
  testDelayEnforcement(): Promise<TestResult>;

  /** Test that unreviewed map features are not visible to public */
  testUnreviewedFeaturesHidden(): Promise<TestResult>;

  /** Test that safety-flagged features require explicit approval */
  testSafetyFlagGate(): Promise<TestResult>;
}
```

---

## 12. Monitoring and Operations

### 12.1 Health Monitoring

#### 12.1.1 Collector Health

```typescript
interface CollectorHealthStatus {
  sourceId: string;
  sourceName: string;
  status: 'healthy' | 'degraded' | 'unreachable' | 'pending' | 'retired';
  lastFetchAt?: string;
  lastFetchDurationMs?: number;
  lastErrorAt?: string;
  lastErrorMessage?: string;
  successRate24h: number;       // Percentage of successful fetches
  successRate7d: number;
  averageFetchDuration24h: number;
  itemsFetched24h: number;
  itemsFetched7d: number;
  consecutiveFailures: number;
  rateLimitHits24h: number;
  nextScheduledFetch: string;
}

// Health check service
interface HealthCheckService {
  /** Run health check for a specific source */
  checkSource(sourceId: string): Promise<HealthCheckResult>;

  /** Run health check for all active sources */
  checkAllSources(): Promise<HealthCheckResult[]>;

  /** Update source health status based on check results */
  updateSourceStatus(sourceId: string, result: HealthCheckResult): Promise<void>;

  /** Get current health status for all sources */
  getAllHealthStatuses(): Promise<CollectorHealthStatus[]>;
}
```

**Health check intervals:**
- Active sources: Every 30 minutes
- Degraded sources: Every 10 minutes (more frequent to detect recovery)
- Unreachable sources: Every 60 minutes (reduce load on unreachable servers)
- New sources: Every 15 minutes for the first 24 hours

**Degradation criteria:**
- 3 consecutive fetch failures → degraded
- 10 consecutive fetch failures → unreachable
- Average fetch time > 2x baseline → degraded
- Success rate < 90% over 24h → degraded
- Success rate < 50% over 24h → unreachable

#### 12.1.2 AI Pipeline Health

```typescript
interface AiPipelineHealth {
  status: 'healthy' | 'degraded' | 'failed';
  overallErrorRate: number;
  perOperationErrorRate: Record<AIOperationType, number>;
  averageProcessingTime: number;
  queueDepth: number;
  queueGrowthRate: number;  // Positive = queue growing, negative = shrinking
  modelAvailability: Record<string, 'available' | 'degraded' | 'unavailable'>;
  tokenUsage24h: number;
  estimatedCost24h: number;
  lastIncidentAt?: string;
  lastIncidentDescription?: string;
}

interface AiPipelineMonitor {
  /** Check pipeline health */
  checkHealth(): Promise<AiPipelineHealth>;
  /** Track a completed operation */
  recordOperation(result: AIOperationResult, durationMs: number): void;
  /** Track an error */
  recordError(operationType: AIOperationType, error: string): void;
  /** Get current metrics snapshot */
  getMetrics(): Promise<AiPipelineHealth>;
}
```

#### 12.1.3 Review Queue Health

```typescript
interface ReviewQueueHealth {
  status: 'healthy' | 'congested' | 'overloaded';
  totalItems: number;
  itemsByStatus: Record<ReviewStatus, number>;
  itemsByPriority: Record<string, number>;
  itemsOverSla: number;
  averageWaitTimeMs: number;
  averageReviewTimeMs: number;
  oldestItemAge: number;        // Minutes
  reviewerCount: number;
  reviewerWorkload: { reviewerId: string; openItems: number; maxItems: number }[];
  throughput24h: number;        // Items completed in last 24 hours
  incomingRate24h: number;      // Items entering queue per hour
}

interface ReviewQueueMonitor {
  checkHealth(): Promise<ReviewQueueHealth>;
  recordAssignment(itemId: string, reviewerId: string): void;
  recordCompletion(itemId: string, result: 'approved' | 'rejected' | 'escalated'): void;
  recordSlaBreach(itemId: string): void;
}
```

### 12.2 Alerting

#### 12.2.1 Alert Definitions

```typescript
interface AlertDefinition {
  /** Alert identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of the alert condition */
  description: string;
  /** Severity level */
  severity: 'info' | 'warning' | 'critical';
  /** The metric or condition being monitored */
  metricSource: 'collector' | 'ai_pipeline' | 'review_queue' | 'system' | 'security';
  /** Evaluation interval in seconds */
  evaluationIntervalSeconds: number;
  /** Condition that triggers the alert */
  condition: AlertCondition;
  /** Notification channels */
  notificationChannels: ('email' | 'slack' | 'webhook' | 'console')[];
  /** Whether the alert is currently active */
  enabled: boolean;
}

type AlertCondition =
  | { type: 'threshold'; metric: string; operator: 'gt' | 'lt' | 'gte' | 'lte'; value: number; durationMinutes: number }
  | { type: 'absence'; expectedIntervalMinutes: number }  // No data received
  | { type: 'pattern'; pattern: string; source: string }  // Error pattern in logs
  | { type: 'status_change'; from?: string; to: string };  // State transition
```

#### 12.2.2 Default Alert Rules

```typescript
const DEFAULT_ALERT_RULES: AlertDefinition[] = [
  // Collector alerts
  { id: 'collector-failure', name: 'Collector Failed', description: 'A collector has failed to fetch', severity: 'critical', metricSource: 'collector', evaluationIntervalSeconds: 300, condition: { type: 'threshold', metric: 'consecutiveFailures', operator: 'gte', value: 3, durationMinutes: 15 }, notificationChannels: ['slack', 'email'], enabled: true },
  { id: 'collector-degraded', name: 'Collector Degraded', description: 'A collector is running with degraded performance', severity: 'warning', metricSource: 'collector', evaluationIntervalSeconds: 600, condition: { type: 'threshold', metric: 'successRate24h', operator: 'lt', value: 90, durationMinutes: 60 }, notificationChannels: ['slack'], enabled: true },

  // AI Pipeline alerts
  { id: 'pipeline-error-rate', name: 'Pipeline Error Rate High', description: 'AI pipeline error rate exceeds threshold', severity: 'critical', metricSource: 'ai_pipeline', evaluationIntervalSeconds: 300, condition: { type: 'threshold', metric: 'errorRate', operator: 'gt', value: 10, durationMinutes: 15 }, notificationChannels: ['slack', 'email'], enabled: true },
  { id: 'pipeline-confidence-drop', name: 'Pipeline Confidence Drop', description: 'Average confidence dropped significantly', severity: 'warning', metricSource: 'ai_pipeline', evaluationIntervalSeconds: 600, condition: { type: 'threshold', metric: 'averageConfidence', operator: 'lt', value: 0.6, durationMinutes: 30 }, notificationChannels: ['slack'], enabled: true },
  { id: 'model-unavailable', name: 'AI Model Unavailable', description: 'A required AI model is unavailable', severity: 'critical', metricSource: 'ai_pipeline', evaluationIntervalSeconds: 120, condition: { type: 'status_change', to: 'unavailable' }, notificationChannels: ['slack', 'email'], enabled: true },

  // Review Queue alerts
  { id: 'queue-congested', name: 'Review Queue Congested', description: 'Queue depth exceeds capacity threshold', severity: 'warning', metricSource: 'review_queue', evaluationIntervalSeconds: 300, condition: { type: 'threshold', metric: 'totalItems', operator: 'gt', value: 100, durationMinutes: 30 }, notificationChannels: ['slack'], enabled: true },
  { id: 'queue-sla-breach', name: 'SLA Breach Rate High', description: 'SLA breach rate exceeds acceptable level', severity: 'warning', metricSource: 'review_queue', evaluationIntervalSeconds: 600, condition: { type: 'threshold', metric: 'slaBreachRate', operator: 'gt', value: 10, durationMinutes: 60 }, notificationChannels: ['slack'], enabled: true },

  // Security alerts
  { id: 'unauthorized-access', name: 'Unauthorized Access Attempt', description: 'Multiple unauthorized access attempts detected', severity: 'critical', metricSource: 'security', evaluationIntervalSeconds: 60, condition: { type: 'pattern', pattern: '401|403|unauthorized', source: 'access_log' }, notificationChannels: ['email', 'slack'], enabled: true },
  { id: 'rate-limit-exceeded', name: 'External Rate Limit Exceeded', description: 'External source rate limited us', severity: 'warning', metricSource: 'collector', evaluationIntervalSeconds: 300, condition: { type: 'threshold', metric: 'rateLimitHits24h', operator: 'gt', value: 10, durationMinutes: 60 }, notificationChannels: ['slack'], enabled: true },
];
```

#### 12.2.3 Alert Notification Channels

```typescript
interface AlertNotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'console' | 'pagerduty';
  config: {
    // Email
    recipients?: string[];
    // Slack
    slackWebhookUrl?: string;
    slackChannel?: string;
    // Webhook
    webhookUrl?: string;
    webhookHeaders?: Record<string, string>;
    // PagerDuty
    pagerdutyIntegrationKey?: string;
    pagerdutySeverity?: 'info' | 'warning' | 'error' | 'critical';
  };
}

interface AlertNotification {
  alertId: string;
  alertName: string;
  severity: string;
  timestamp: string;
  message: string;
  details: Record<string, unknown>;
  sourceLink?: string;  // Link to dashboard for investigation
}
```

### 12.3 Operational Runbooks

#### 12.3.1 Collector Recovery Procedures

**Symptom:** Collector marked as "unreachable"

**Recovery steps:**
1. Check source website manually — is the source itself down?
2. If source is down: add downtime note to source metadata; set health to "degraded" not "unreachable"
3. If source is up: check collector configuration (API endpoint, RSS feed URL, authentication tokens)
4. Test connection manually via admin dashboard "Test Connection" button
5. If test fails: check for API changes, feed URL changes, or authentication expiry
6. If test succeeds: reset collector health status and trigger manual fetch
7. If no root cause found: check network connectivity, DNS resolution, firewall rules
8. Document findings in source registry notes

**Symptom:** Collector returning empty results repeatedly

**Recovery steps:**
1. Check source for content changes (new feed structure, new API version)
2. Check collector logs for parsing errors
3. Manually examine source response (raw data)
4. Update collector parser if source format changed
5. Test with one manual fetch before re-enabling automated schedule

#### 12.3.2 AI Pipeline Troubleshooting

**Symptom:** High error rate for a specific operation type

**Recovery steps:**
1. Check which model is being used for the operation
2. Check model availability status
3. Review recent prompt changes (if applicable)
4. Review recent operation logs for error patterns
5. Try fallback model
6. If fallback succeeds: demote primary model, promote fallback
7. If both fail: pause the operation type, investigate root cause
8. Notify pipeline status via dashboard

**Symptom:** Sudden drop in confidence scores

**Recovery steps:**
1. Check if model was updated/changed
2. Check for changes in input data quality (new source types, different content formats)
3. Run ground truth dataset against current model and compare to baseline
4. If regression detected: roll back model version or adjust prompt
5. If no regression in ground truth: investigate input data changes
6. Check confidence calibration

#### 12.3.3 Review Queue Escalation Procedures

**Symptom:** Queue depth exceeding capacity; review backlog growing

**Response:**
1. Identify bottleneck review type (legal, editorial, translation, etc.)
2. Check reviewer availability and workload
3. Reassign items from overloaded reviewers to available ones
4. If no reviewers available: identify additional qualified reviewers
5. For critical items in backlog: escalate to senior editor for resource decisions
6. For non-critical items: extend SLA targets temporarily
7. Document capacity issue for team planning

**Symptom:** Critical review item stuck in queue

**Response:**
1. Identify the item and its current reviewer
2. Check if reviewer is active (last login, current workload)
3. If reviewer inactive: reassign to available reviewer
4. If reviewer active but blocked: check if they need additional context or source access
5. If reviewer active but slow: offer support or break item into smaller pieces
6. Escalate to senior editor if item has been in review > 2x SLA target

---

## 13. Roadmap Integration

The AI Intelligence Layer maps to Milestone 4 of the product roadmap. This section defines sub-milestones, dependencies, and sequencing.

### 13.1 Milestone Structure

```
Milestone 4: AI Intelligence Layer
├── M4.1: Collector Framework (Foundation)
├── M4.2: AI Pipeline (Core Processing)
├── M4.3: Review Queue System (Human Gate)
├── M4.4: Intelligence Dashboard (Operations)
├── M4.5: Maps and Geospatial (Visualization)
├── M4.6: Knowledge Graph (Connections)
└── M4.7: Testing, Documentation, Monitoring (Quality)
```

### 13.2 M4.1: Collector Framework

**Prerequisites:** Database tables from Functional MVP (PRD-v1-archive.md Section 16)

**Dependencies:** Source registry table, normalized source records table

**Estimated effort:** 3–4 weeks

**Deliverables:**

| Deliverable | Description | Priority |
|---|---|---|
| Source Registry schema and CRUD | Database table, admin CRUD UI, API endpoints | P0 |
| BaseCollector class | Abstract base class with `run()` pipeline, logging, error handling | P0 |
| Collector scheduler | Scheduled task runner with interval configuration | P0 |
| ICJ Collector | Initial ICJ collector implementation | P0 |
| ICC Collector | Initial ICC collector implementation | P0 |
| OHCHR Collector | Initial OHCHR collector implementation | P0 |
| OCHA Collector (including ReliefWeb API) | Initial OCHA collector implementation | P0 |
| EU Collector | Initial EU collector implementation | P1 |
| Belgium Collector | Initial Belgium collector implementation | P1 |
| NGO Collectors (Amnesty, HRW, B'Tselem, MSF, ICRC) | Initial NGO collector implementations | P1 |
| Health check service | Automated health monitoring for all sources | P1 |
| Rate limiter | Polite crawling enforcement | P1 |
| Deduplication service (basic hash-based) | Basic body-hash deduplication | P1 |
| Collector monitoring dashboard | Health status view in admin dashboard | P2 |

**Acceptance criteria:**
- 10+ collectors can fetch, validate, normalize, and store source records
- Health checks run on schedule and correctly report source status
- Rate limiting prevents overloading source servers
- Deduplication catches exact duplicates
- Errors are logged and alerting works

### 13.3 M4.2: AI Pipeline

**Prerequisites:** M4.1 (collectors producing normalized records)

**Dependencies:** AI model API keys/access, normalized source records flowing

**Estimated effort:** 5–7 weeks

**Deliverables:**

| Deliverable | Description | Priority |
|---|---|---|
| AI Pipeline orchestrator | Pipeline runner with stage sequencing, dependency management, retry logic | P0 |
| Language detection stage | Language identification service | P0 |
| Translation stage (low-risk) | Machine translation for low-risk content | P0 |
| Translation stage (high-risk) | Best-model translation for high-risk content | P0 |
| Summarization stage | Summary generation (50, 200, 500 word variants) | P0 |
| Entity extraction stage | Named entity recognition + coreference resolution | P0 |
| Claim extraction stage | Factual claim identification | P0 |
| Timeline extraction stage | Date-event extraction and sequencing | P0 |
| Geographic extraction stage | Location extraction with gazetteer resolution | P0 |
| Relationship detection stage | Knowledge graph linking | P1 |
| Topic classification stage | Evidence taxonomy classification | P1 |
| Duplicate detection stage (semantic) | Embedding-based fuzzy deduplication | P1 |
| Contradiction detection stage | Cross-claim contradiction checking | P1 |
| Confidence estimation stage | Per-operation and overall confidence scoring | P0 |
| Hallucination mitigation system | Source span verification, cross-reference checks | P0 |
| Model routing configuration | Configurable model-per-task assignment | P1 |
| Structured output enforcement | JSON Schema validation for all AI outputs | P0 |
| AI Operation Log | Storage and query for all AI operation records | P1 |

**Acceptance criteria:**
- All 12 pipeline stages produce valid, source-spanned outputs
- Summaries are factually accurate on ground truth datasets
- Entity extraction achieves >85% F1 on ground truth
- Hallucination detection catches >95% of invented content in test suite
- Pipeline completes within acceptable latency per content type
- Model routing correctly selects models per task

### 13.4 M4.3: Review Queue System

**Prerequisites:** M4.2 (AI pipeline producing reviewable content)

**Dependencies:** Reviewer accounts, pipeline output data

**Estimated effort:** 4–5 weeks

**Deliverables:**

| Deliverable | Description | Priority |
|---|---|---|
| Review Queue data model | Queue item schema, status states, transitions | P0 |
| Queue ingest service | Pipeline output → queue item creation | P0 |
| Assignment logic | Round-robin, expertise-based, load-balanced assignment | P0 |
| Priority system | Multi-factor priority calculation | P0 |
| SLA tracking | SLA configuration, deadline calculation, breach detection | P1 |
| Review UI — Dashboard | Queue overview with filters, sort, search | P0 |
| Review UI — Workspace | Side-by-side AI proposal vs. source comparison | P0 |
| Review UI — Quick actions | Approve, reject, changes, escalate buttons | P0 |
| Review UI — Inline editing | Direct editing of AI proposals | P1 |
| Review UI — Discussion thread | Per-item comments between reviewers | P2 |
| Review UI — Audit trail | Complete action history per item | P0 |
| Correction tracking | AI proposal → correction recording | P1 |
| Email/notification integration | Alert reviewers of new assignments | P2 |
| Review analytics | Metrics: throughput, SLA compliance, reviewer performance | P2 |

**Acceptance criteria:**
- AI pipeline output correctly enters the review queue
- Items are assigned to appropriate reviewers
- All status transitions work correctly with proper authorization checks
- SLA deadlines are calculated and enforced
- Side-by-side review workspace functions with source span highlighting
- Corrections are recorded and traceable
- Reviewers can complete full review workflow in the UI

### 13.5 M4.4: Intelligence Dashboard

**Prerequisites:** M4.1, M4.2, M4.3 producing metrics

**Dependencies:** Metrics collection infrastructure

**Estimated effort:** 2–3 weeks

**Deliverables:**

| Deliverable | Description | Priority |
|---|---|---|
| Metrics collection service | Gather metrics from all subsystems | P0 |
| Overview dashboard | Single-page summary of critical metrics | P0 |
| Source registry management view | Source list, health, edit, manual trigger | P0 |
| Review queue management view | Queue overview, reviewer workload, reassignment | P1 |
| AI operation log viewer | Searchable, filterable operation log | P1 |
| Error and exception tracker | Centralized error viewing | P1 |
| Historical metrics | 90-day metric retention and trending | P2 |
| Dashboard export | CSV/JSON export of dashboard data | P2 |

**Acceptance criteria:**
- All system metrics are collected and displayed
- Source registry management view supports edit operations
- Review queue management shows accurate statuses and reviewer workloads
- Dashboard refreshes automatically

### 13.6 M4.5: Maps and Geospatial

**Prerequisites:** M4.2 (geographic extraction working), M4.3 (review gates for map data)

**Dependencies:** GeoJSON data pipeline, MapLibre GL integration

**Estimated effort:** 4–6 weeks

**Deliverables:**

| Deliverable | Description | Priority |
|---|---|---|
| MapLibre GL integration | Map rendering component with base tiles (OSM) | P0 |
| GeoJSON data pipeline | Normalized location → GeoJSON → API endpoint | P0 |
| Events layer | Event markers with verification color-coding | P0 |
| Sources layer | Source publisher location markers | P1 |
| Organizations layer | Organization operating region polygons | P1 |
| Legal layer | Court locations and jurisdictional boundaries | P1 |
| Infrastructure layer | Hospital/school/shelter markers (safe precision) | P2 |
| Humanitarian layer | Aid routes, camps, crossings (safe precision) | P2 |
| Timeline layer | Temporal filter and animation controls | P2 |
| Location precision safety system | Automatic precision reduction per location type | P0 |
| Map feature review gate | Location data must pass review queue before display | P0 |
| Map accessibility | Keyboard navigation, screen reader support | P1 |
| Layer control panel | Toggle layers on/off, legend | P1 |

**Acceptance criteria:**
- Map renders with multiple selectable layers
- Events display with verification-level color coding
- Location precision safety rules are enforced
- Map features pass review queue before appearing
- Map is keyboard-navigable and screen-reader compatible
- No sensitive location data is exposed

### 13.7 M4.6: Knowledge Graph

**Prerequisites:** M4.2 (entity extraction, relationship detection), M4.3 (review for graph edges)

**Dependencies:** Graph database or PostgreSQL + recursive CTEs

**Estimated effort:** 3–5 weeks

**Deliverables:**

| Deliverable | Description | Priority |
|---|---|---|
| Graph schema implementation | Nodes, edges, properties in chosen database | P0 |
| Edge creation service | Relationship extraction → graph edge creation | P0 |
| Canonical queries | Query service for common graph traversals | P0 |
| Graph visualization (admin) | Interactive graph visualization for admin users | P2 |
| Graph health checks | Verification of graph integrity (no orphaned edges, etc.) | P2 |
| Graph API endpoints | Public API for graph queries (read-only, reviewed data only) | P2 |

**Acceptance criteria:**
- Graph schema supports all node and edge types
- Common queries complete within 500ms for 5-hop paths
- Edges are correctly created from AI relationship detection
- Graph integrity checks pass
- Materialized views accelerate common query patterns

### 13.8 M4.7: Testing, Documentation, Monitoring

**Prerequisites:** All M4 sub-milestones

**Dependencies:** Test infrastructure, documentation framework

**Estimated effort:** 2–3 weeks (ongoing alongside M4.1–M4.6)

**Deliverables:**

| Deliverable | Description | Priority |
|---|---|---|
| Collector test suite | Tests for all collectors with mock data | P0 |
| Ground truth datasets | Datasets for all AI tasks | P0 |
| AI pipeline regression tests | Automated regression detection for prompt/model changes | P1 |
| Integration tests | End-to-end pipeline tests | P0 |
| Map safety tests | Automated verification of location safety rules | P1 |
| Hallucination test suite | Systematic hallucination detection tests | P0 |
| Confidence calibration tests | Regular calibration verification | P1 |
| Admin runbooks | Runbooks for all operational procedures | P1 |
| Developer documentation | Collector creation guide, AI pipeline architecture | P1 |
| Operations monitoring setup | Alert configuration, dashboard setup | P0 |

**Acceptance criteria:**
- All tests pass in CI pipeline
- Ground truth datasets cover all supported content types and languages
- Regression tests catch prompt/model changes that degrade accuracy
- Hallucination test suite catches known hallucination patterns
- Runbooks cover all common operational scenarios
- Developer documentation enables new collector creation

### 13.9 Sequencing and Dependencies

```
Timeline (weeks):
W1  W2  W3  W4  W5  W6  W7  W8  W9  W10 W11 W12 W13 W14 W15 W16 W17 W18
├─── M4.1: Collector Framework ───┤
                                  ├─── M4.2: AI Pipeline ───────────────┤
                                                       ├─── M4.3: Review Queue ───┤
                                                                            ├── M4.4: Dashboard ─┤
                                                                            ├── M4.5: Maps ─────────────┤
                                                                            ├── M4.6: Knowledge Graph ─────┤
├──────────────────── M4.7: Testing, Documentation, Monitoring (parallel) ─────────────────────────────┤
```

**Critical path:** M4.1 → M4.2 → M4.3 (sequential because each depends on the previous)

**Parallel work streams:**
- M4.4 (Dashboard) can begin after M4.1 provides collection metrics
- M4.5 (Maps) can begin after M4.2 provides geographic extraction
- M4.6 (Knowledge Graph) can begin after M4.2 provides entity/relationship extraction
- M4.7 (Testing) runs throughout, with increasing depth as subsystems stabilize

### 13.10 Risk Factors

| Risk | Impact | Mitigation |
|---|---|---|
| AI model API changes during development | High | Use model routing abstraction; fallback models configured |
| Source format changes (feed restructure, API deprecation) | Medium | Per-collector mock tests detect format changes early; monitoring alerts on parse failures |
| AI hallucination rates higher than expected | High | Start with small-scale ground truth evaluation before full pipeline activation; conservative confidence thresholds |
| Reviewer availability insufficient | Medium | Build queue with SLA warning system; recruit reviewers early; design for async review |
| Map safety failure (sensitive location exposed) | Critical | Defense in depth: precision rules + review gate + delayed publication + automated tests |
| Knowledge graph performance degradation | Medium | Materialized views for common queries; query timeout limits; pagination |
| Pipeline latency exceeds expectations | Medium | Model tiering (fast models for simple tasks); batch processing; parallel stage execution where dependencies allow |
