# Project Architecture — Arbor Sentinel

**Version:** 1.0  
**Date:** 2026-07-24  
**Status:** Current — reflects the public static beta phase  
**License:** AGPL-3.0-or-later (code) / CC BY-SA 4.0 (documentation)

> This document describes the complete technical architecture, data flow, and
> subsystem overview of the Arbor Sentinel platform. It is written for
> senior engineers, architects, and technical contributors who need to understand
> the entire system from a single document.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Architecture Principles](#2-architecture-principles)
3. [Layer 1 — Collection](#3-layer-1--collection)
4. [Layer 2 — Normalization](#4-layer-2--normalization)
5. [Layer 3 — AI Intelligence Assistance](#5-layer-3--ai-intelligence-assistance)
6. [Layer 4 — Human Editorial & Expert Review](#6-layer-4--human-editorial--expert-review)
7. [Layer 5 — Versioned Public Knowledge](#7-layer-5--versioned-public-knowledge)
8. [Layer 6 — Public Platform](#8-layer-6--public-platform)
9. [Data Architecture](#9-data-architecture)
10. [Technology Stack](#10-technology-stack)
11. [Security Architecture](#11-security-architecture)
12. [Deployment Architecture](#12-deployment-architecture)
13. [Integration Points](#13-integration-points)

---

## 1. Architecture Overview

Arbor Sentinel is organized around a **6-layer information pipeline**.
The website (Layer 6) is only one layer in the pipeline. Every layer is designed
to be independently replaceable, testable, and securely isolated.

```
                      ┌─────────────────────────────────────┐
                      │         TRUSTED SOURCES             │
                      │  (UN, ICJ, ICC, NGOs, Journalism,   │
                      │   Gov Portals, Academia, Open Data)  │
                      └────────────────┬────────────────────┘
                                       │
                       ┌───────────────▼────────────────────┐
                       │   LAYER 1 — COLLECTOR FRAMEWORK    │
                       │   RSS · API · Web Scraper · SDK    │
                       │   Source Registry · Feed Registry  │
                       │   Scheduling · Monitoring · Retry  │
                       └───────────────┬────────────────────┘
                                       │
                       ┌───────────────▼────────────────────┐
                       │   LAYER 2 — NORMALIZATION          │
                       │   NormalizedSourceRecord            │
                       │   EventRecord · EntityRecord        │
                       │   EvidenceRecord · Validation       │
                       │   Deduplication · Quality Checks    │
                       └───────────────┬────────────────────┘
                                       │
                       ┌───────────────▼────────────────────┐
                       │   LAYER 3 — AI INTELLIGENCE        │
                       │   Translation · Summarization       │
                       │   Entity Extraction · Claims        │
                       │   Timeline · GeoJSON · Relations   │
                       │   Dedup · Contradiction Detection   │
                       │   ────────────────────────────      │
                       │   AI PROPOSES — NEVER PUBLISHES     │
                       └───────────────┬────────────────────┘
                                       │
                       ┌───────────────▼────────────────────┐
                       │   LAYER 4 — HUMAN REVIEW           │
                       │   Review Queue · State Machine     │
                       │   Legal · Translation · Editorial   │
                       │   Country · Institution · Evidence  │
                       │   Escalation · Correction Flow     │
                       └───────────────┬────────────────────┘
                                       │
                       ┌───────────────▼────────────────────┐
                       │   LAYER 5 — VERSIONED KNOWLEDGE    │
                       │   Published · Versioned · Archived  │
                       │   Corrected · Deprecated            │
                       │   Rollback · Audit Trail            │
                       └───────────────┬────────────────────┘
                                       │
          ┌────────────────────────────┼────────────────────────────┐
          │                            │                            │
          ▼                            ▼                            ▼
┌───────────────────┐   ┌───────────────────────┐   ┌───────────────────┐
│  Search · Browse   │   │  Maps · Timelines     │   │  Dossiers         │
│  Evidence Library  │   │  GeoJSON Layer System │   │  Action Hub       │
│  Legal Tracker     │   │  Country Maps         │   │  Templates        │
│  Organization Dir  │   │  Humanitarian Layers  │   │  Jurisdiction     │
│                    │   │                       │   │  Routing          │
└───────────────────┘   └───────────────────────┘   └───────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────────┐
                      │  BETTER PUBLIC UNDERSTANDING         │
                      │  AND ACCOUNTABILITY                  │
                      └─────────────────────────────────────┘
```

### Current Phase: Public Static Beta

The **public static beta** implements only the right side of Layer 6 (the public
website), using static TypeScript data files instead of a database. Layers 1-5
are designed but not yet implemented. All content is hand-authored, manually
reviewed, and committed as source code. This deliberate constraint allows the
project to validate its information architecture, navigation, design, legal
framing, and review methodology before introducing backend complexity.

---

## 2. Architecture Principles

### 2.1 Event-First, Not Article-First

The central entity in the data model is the **Event**, not the Article or
Document. Documents are sources *about* events. Events may be: a court filing,
a humanitarian update, a parliamentary vote, a public statement, an attack
on a hospital, a displacement wave. Everything else (evidence records, legal
cases, timelines, dossiers) attaches to or references events.

This is the opposite of a news or blog architecture, where articles are primary
and events are metadata.

### 2.2 AI Assists, Humans Decide

AI (Layer 3) may propose translations, summaries, entity extractions, and
classifications. AI **never** publishes automatically. Every AI output is
routed to a human review queue (Layer 4). No AI output reaches Layer 5 or
Layer 6 without explicit human approval.

### 2.3 Every Claim Traceable to Source

Every factual assertion on the platform carries source IDs that resolve to
public, archived, or permission-cleared documents. Claims without source
references must be clearly labeled as draft, pending review, disputed, or
unverified. The Source Registry (`/sources`) is the ground truth layer.

### 2.4 Static-First, Database Later

All content during the static beta lives in TypeScript data files under
`src/data/`. These files are type-checked, schema-validated at test time,
and versioned in git. A database (Supabase/PostgreSQL) will be introduced
only after:

- The static beta has been reviewed by trusted experts.
- The data model has been validated against real content needs.
- Editorial workflows, correction routing, and review states are proven.

### 2.5 Privacy by Default

No analytics, no cookies, no tracking scripts, no user accounts, no public
submissions, no personal data collection. The static beta works with zero
client-side storage of personal information. Language preference is stored
in `localStorage` only (key: `arbor-sentinel-lang`), never transmitted.

### 2.6 Composition Over Duplication

Shared UI patterns (badges, cards, status indicators, preview notices, source
lists) are composed from a small set of reusable components, not duplicated
per page. Content models share a common `ReviewMetadata` base. Search indexing
maps all record types to a single `SearchableRecord` shape.

### 2.7 Review States Are First-Class Citizens

Every piece of content carries explicit review metadata: content status,
verification level, last-reviewed date, reviewer role, version number, and
correction route. Content cannot be published without passing through defined
review gates. Review state is visible to the public — a "Static preview" or
"Source pending" label is as important as the content itself.

### 2.8 Design Repositories Around Domain Models, Not Database Tables

The project is organized by domain concept (Evidence, Legal Case, Country,
Organization, Action, Dossier, Source), not by database normalization. Data
files mirror domain models. Components are organized by domain. Routes are
organized by domain. The database, when introduced, will be designed around
these same domain aggregates.

---

## 3. Layer 1 — Collection

> **Current state:** Not yet implemented. The static beta sources are
> hand-authored TypeScript files. This section describes the planned collector
> framework for when automated collection begins.

### 3.1 Collector Interface / Contract

Every collector implements the same interface:

```typescript
interface Collector {
  /** Unique collector identifier (e.g. "icj-rss", "ocha-api"). */
  readonly id: string;

  /** Human-readable name. */
  readonly name: string;

  /** Source type this collector produces. */
  readonly sourceType: SourceType;

  /** Execute one collection cycle. Returns normalized records. */
  collect(): Promise<CollectorResult>;

  /** Validate the collector configuration. */
  validate(): CollectorHealth;
}

interface CollectorResult {
  collectorId: string;
  collectedAt: string;            // ISO 8601
  records: NormalizedSourceRecord[];
  errors: CollectorError[];
  metrics: CollectionMetrics;
}

interface CollectorError {
  stage: "fetch" | "parse" | "validate" | "transform";
  message: string;
  sourceId?: string;
  retryable: boolean;
}

interface CollectionMetrics {
  sourcesFetched: number;
  sourcesParsed: number;
  recordsGenerated: number;
  duplicatesSkipped: number;
  durationMs: number;
}
```

### 3.2 Collector Types

| Type | Description | Examples |
|------|-------------|---------|
| **RSS Collector** | Subscribes to RSS/Atom feeds from known sources | UN OCHA feed, ICJ press feed, NGO news feeds |
| **API Collector** | Pulls from structured REST/JSON APIs | UN API, EU Open Data, parliamentary voting APIs |
| **Web Scraper** | Parses HTML from government or court portals — used carefully, respecting robots.txt and rate limits | National court registries, ministry press pages |
| **Government Portal Collector** | Specialized scraper for official gazettes and parliamentary records | Belgian Senate, Dutch Overheid, UK Parliament |
| **UN API Collector** | Targeted at UN info systems | UN Digital Library, OHCHR, OCHA API |
| **ICJ/ICC Collector** | Court-specific collectors | ICJ case pages, ICC situation pages |
| **NGO Feed Collector** | RSS and press release pages | HRW, Amnesty, B'Tselem, MSF |
| **Journalism RSS Collector** | RSS feeds from investigative outlets | Specific journalists, wire services, investigative outlets |
| **Academic API Collector** | Academic search and open-access APIs | CrossRef, OpenAlex, SSRN |
| **Open Data Portal Collector** | Government and institutional open data | EU Open Data Portal, data.gov, national statistics |

### 3.3 Collector SDK Design

Collectors are built against a lightweight SDK that provides:

- **HTTP client:** configurable user-agent, timeout, retry, backoff, caching
- **Rate limiter:** token-bucket per-domain, configurable bursts
- **Parser utilities:** HTML sanitization, date normalization, language detection
- **Output adapter:** transforms collector-specific output into `NormalizedSourceRecord`
- **Health reporting:** uptime, error rate, last collection time, record throughput

```typescript
class CollectorSDK {
  protected http: HttpClient;
  protected rateLimiter: RateLimiter;
  protected parser: ParserUtilities;

  constructor(config: {
    userAgent: string;
    rateLimit: { domain: string; requestsPerSecond: number }[];
    timeout: number;
  });

  /** Fetch with retry, backoff, and rate limiting built in. */
  protected async fetch(url: string, options?: FetchOptions): Promise<FetchResult>;

  /** Parse HTML safely — strips scripts, normalizes text. */
  protected parseHTML(html: string): ParsedDocument;

  /** Detect language of text content. */
  protected detectLanguage(text: string): string;

  /** Create a normalized output record. */
  protected createRecord(input: NormalizedSourceRecord): NormalizedSourceRecord;
}
```

### 3.4 Source Registry — Schema

The Source Registry is the authoritative catalog of every source the platform
tracks. It lives in `src/data/sources.ts` during the static beta and will
migrate to a database table for the functional MVP.

```typescript
interface SourceRegistryEntry {
  /** Unique source identifier. */
  id: string;

  /** The publishing entity (organization, institution, body). */
  publisher: {
    name: string;
    type: "un" | "government" | "ngo" | "academic" | "journalism" | "court" | "humanitarian";
    country?: string;
    website?: string;
  };

  /** Trust level — determined by editorial methodology. */
  trustLevel: 1 | 2 | 3 | 4 | 5;

  /** Verification metadata about the publisher relationship. */
  verification: {
    method: "direct" | "gateway" | "aggregator" | "secondary";
    lastVerifiedAt: string;  // ISO 8601
    verifiedBy: string;      // role reference
  };

  /** Technical access information. */
  access: {
    apiEndpoint?: string;
    apiDocumentation?: string;
    rssFeed?: string;
    type: "rss" | "api" | "scrape" | "manual";
    authentication?: "none" | "api_key" | "oauth";
  };

  /** Content metadata. */
  content: {
    languages: string[];
    license: string;
    jurisdiction?: string;
    region?: string;
    categories: string[];
  };

  /** Reliability notes for editorial use. */
  reliabilityNotes: string;

  /** Monitoring and scheduling. */
  operations: {
    pollIntervalMs: number;
    lastCheckedAt: string;
    lastErrorAt?: string;
    lastErrorMessage?: string;
    consecutiveFailures: number;
    health: "healthy" | "degraded" | "down";
    enabled: boolean;
  };
}
```

### 3.5 Feed Registry

The Feed Registry tracks individual RSS/Atom feeds, API endpoints, and
scraped pages that collectors process. It is a lightweight registry keyed
by URL:

```typescript
interface FeedRegistryEntry {
  id: string;
  sourceRegistryId: string;  // FK to SourceRegistryEntry
  url: string;
  type: "rss" | "atom" | "sitemap" | "api_endpoint" | "html_page";
  contentType: "application/rss+xml" | "application/json" | "text/html" | string;
  schedule: {
    interval: string;    // e.g. "*/30 * * * *"
    jitterWindowMs: number;
  };
  lastFetch: {
    at: string;
    statusCode: number;
    etag?: string;
    lastModified?: string;
    contentHash?: string;
  };
  enabled: boolean;
}
```

### 3.6 Scheduling and Monitoring

Collectors run on a cron-based schedule managed by a scheduler service:

- **Short-poll collectors** (humanitarian updates, news): every 15-30 minutes
- **Medium-poll collectors** (UN bodies, court filings): every 6-24 hours
- **Long-poll collectors** (government portals, academic): every 24-72 hours
- **Manual collectors** (sources requiring human judgment): on-demand only

Each collector exposes a health endpoint (or logs structured health metrics):
- Last collection time and duration
- Records produced, errors encountered
- Current backoff state
- Queue depth (for queue-based collectors)

### 3.7 Error Handling and Retry

Errors are classified as **transient** (network timeout, 503, rate limit) or
**permanent** (404, malformed feed, auth failure).

- Transient errors: retry with exponential backoff (1s, 5s, 30s, 5m, 30m, 4h max)
- Permanent errors: alert human operator, disable collector
- Consecutive failures beyond threshold: mark source as `degraded` or `down`

### 3.8 Rate Limiting and Politeness

Every collector respects:

- **robots.txt** crawl-delay directives
- Per-domain rate limits configured in the Source Registry
- Token-bucket algorithm with configurable burst
- User-agent identification via `ArborSentinel/1.0 (+https://arborsentinel.org)`
- Conditional requests (ETag, If-Modified-Since)
- No scraping during peak hours for government domains

---

## 4. Layer 2 — Normalization

> **Current state:** The data structures below are designed and partially
> implemented in TypeScript types. The automated normalization pipeline
> (transforming raw collector output into typed records) is not yet built.

### 4.1 NormalizedSourceRecord — Universal Collector Output

Every collector outputs the same shape:

```typescript
interface NormalizedSourceRecord {
  /** Unique ID within the collector's namespace. */
  id: string;

  /** Which collector produced this. */
  collectorId: string;

  /** When the collector ran. */
  collectedAt: string;

  /** Source document URL. */
  url: string;

  /** Archived/mirrored URL if preserved. */
  archiveUrl?: string;

  /** Title of the source document. */
  title: string;

  /** Publisher or issuing body. */
  publisher: string;

  /** Source type classification. */
  sourceType: SourceType;

  /** Document type within the source type. */
  documentType?: string;

  /** Publication date as stated in the source. */
  publicationDate?: string;

  /** Language of the source document. */
  language?: string;

  /** Jurisdiction the document pertains to. */
  jurisdiction?: string;

  /** Authors if listed. */
  authors?: string[];

  /** Full text or extract, size-limited. */
  body?: string;

  /** Summary or abstract if provided by the source. */
  summary?: string;

  /** MIME type of the original document. */
  mimeType?: string;

  /** Content hash for deduplication. */
  contentHash?: string;

  /** Size of the fetched content in bytes. */
  sizeBytes?: number;
}
```

### 4.2 EventRecord

The event is the central entity in the data model:

```typescript
interface EventRecord {
  id: string;
  title: string;
  summary: string;
  eventType: string;
  date: string;             // ISO 8601
  endDate?: string;
  location?: {
    country?: string;
    region?: string;
    locality?: string;
    coordinates?: [number, number];  // [lat, lng]
    precision: "country" | "region" | "city" | "exact";
  };
  involvedEntities: string[];   // EntityRecord IDs
  sourceIds: string[];
  category: string;
  tags: string[];
  verificationLevel: VerificationLevel;
  contentStatus: ContentStatus;
}
```

### 4.3 EntityRecord

People, organizations, institutions, locations mentioned across sources:

```typescript
interface EntityRecord {
  id: string;
  name: string;
  type: "person" | "organization" | "institution" | "location" | "legal_case";
  aliases: string[];
  description?: string;
  externalIds?: Record<string, string>;  // e.g. Wikidata QID
  firstSeenAt: string;
  lastSeenAt: string;
}
```

### 4.4 EvidenceRecord

A normalized piece of evidence — a structured summary of what a source says
about an event:

```typescript
interface EvidenceRecord {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: EvidenceCategory;
  sourceIds: string[];
  eventIds: string[];
  primarySourceType: SourceType;
  sourceQuality: VerificationLevel;
  contentStatus: ContentStatus;
  legalStatuses?: LegalStatus[];
  publicationDate?: string;
  incidentDate?: string;
  safeLocation?: string;
  sourceLanguage?: string;
  lastReviewedAt?: string;
  reviewedByRole?: string;
  version: number;
  correctionUrl: string;
  tags: string[];
  relatedRoutes: string[];
}
```

### 4.5 Validation Rules

The content validation system enforces 25+ rules across all record types.
Rules are independently testable and composable. Full list in
`src/lib/content-validation/rules.ts`.

**Essential rules (enforced in CI):**

| # | Rule | Scope | Error/Warning |
|---|------|-------|---------------|
| 1 | No duplicate IDs within a collection | All records | Error |
| 2 | No duplicate slugs within a record type | slug-bearing records | Error |
| 3 | All URLs must be valid http(s) | All records with URL fields | Error |
| 4 | Dates must be ISO 8601 (not ranges) | All date fields | Error |
| 5 | Referenced source IDs must exist in sources.ts | All records with sourceIds | Error |
| 6 | Reviewed records must have sourceIds | All records | Error |
| 7 | Reviewed records must have lastReviewedAt | All records | Error |
| 8 | Reviewed records must have reviewedByRole | All records | Error |
| 9 | Reviewed records must have version >= 1 | All records | Error |
| 10 | Legal statuses must be in controlled vocabulary | Legal-status-bearing records | Error |
| 11 | Verification levels must be 0-5 | All records with sourceQuality | Error |
| 12 | Relationship status in static beta can only be "public_resource" | Organizations | Error |
| 13 | Reviewed action templates need jurisdiction/language review evidence | Action templates | Error |
| 14 | Reviewed evidence items need source support (sourceQuality >= 2) | Evidence items | Error |
| 15 | Published records must have correctionUrl | All records | Error |
| 16 | relatedRoutes must reference valid platform routes | Records with relatedRoutes | Error |
| 17 | Reviewed records must not exceed review cadence | All records | Warning |
| 18 | Source records must have publisher, title, URL, access date, source type | Sources | Error |
| 19 | Organization donation URL must share domain with official website | Organizations | Warning |
| 20 | Organizations must have link-check dates for URLs | Organizations | Warning |
| 21 | Non-draft evidence items must have sourceIds | Evidence items | Error |
| 22 | Non-draft organizations must have sourceIds or valid website | Organizations | Error |
| 23 | Organization descriptions must be 60-500 characters | Organizations | Error/Warning |
| 24 | Reviewed evidence needs content-status/source-quality consistency | Evidence items | Error |
| 25 | Organization source references must not point to broken/archived sources | Organizations | Warning |

Rules are run via `npm run validate:content` (which invokes
`scripts/validate-content.ts`) and in CI via `npx vitest run`.

### 4.6 Deduplication Strategy (Before AI)

Before AI processing, the normalization layer performs structural
deduplication:

1. **Exact URL match:** Same URL fetched by multiple collectors → one record
2. **Content hash match:** Same document content from different URLs → one record
3. **Canonical URL match:** Redirect chains resolved to final URL
4. **DOI / document ID match:** Publications with known identifiers (DOI, ISSN, court case number)

Deduplication is conservative — when uncertain, keep both records and let AI
(Layer 3) assess similarity.

### 4.7 Data Quality Checks

At the normalization boundary:

- **Field completeness:** Required fields must be non-empty
- **URL validity:** All URLs must resolve (checked periodically)
- **Date sanity:** No future dates for past events, no dates before 1900
- **Language consistency:** language field must match detected language of body
- **Size limits:** body field limited to 100KB to prevent runaway storage

### 4.8 Language Detection and Metadata

Every normalized record carries:

```typescript
interface LanguageMetadata {
  detectedLanguage: string;      // ISO 639-1, detected from body
  confidence: number;            // 0.0 - 1.0
  script: string;                // e.g. "Latin", "Arabic"
  isRTL: boolean;
  sourceLanguage?: string;       // Language declared by source
  originalScript?: string;       // Script declared in source metadata
}
```

Language detection uses a compact library (e.g. CLD3 or franc) — no external
API call required for detection.

---

## 5. Layer 3 — AI Intelligence Assistance

> **Current state:** Not yet implemented. All content is hand-authored.
> This section describes the planned AI pipeline for when AI assistance
> is introduced, following the ethical AI policy defined in the PRD.

### 5.1 Critical Rule

**AI NEVER publishes. AI only proposes.** Every AI output must pass through
human review (Layer 4) before reaching Layer 5 or Layer 6. AI outputs are
clearly labeled as AI-proposed when presented in review interfaces.

### 5.2 Translation Engine

```
Source Document (Language A)
        │
        ▼
Language Detection
        │
        ▼
AI Translation Draft
        │
        ▼
Human Translation Review
   (competent speaker required for legal content)
        │
        ▼
Translation Published (with status label)
```

- **Low-risk content** (UI chrome, non-legal descriptions): AI can draft, human
  reviews quickly
- **High-risk content** (legal summaries, casualty claims, evidence descriptions):
  AI can assist, but output must be reviewed by a competent speaker; machine
  translation label must be displayed
- **Source language preservation:** Original language text is always preserved
  alongside translations

### 5.3 Summarization Engine

AI summarizes source documents into structured summaries for evidence records:

```typescript
interface AISummaryOutput {
  /** The proposed summary text. */
  summary: string;

  /** Target length. */
  targetLength: "short" | "medium" | "long";

  /** Confidence in the summary's accuracy. */
  confidence: number;  // 0.0 - 1.0

  /** Span references in the source document. */
  sourceSpanReferences: {
    startOffset: number;
    endOffset: number;
    supportingText: string;
  }[];

  /** Model that produced this summary. */
  model: string;
  modelVersion: string;

  /** When the summary was generated. */
  generatedAt: string;

  /** Warning flags for the reviewer. */
  warnings: string[];
}
```

Summarization prompts follow a strict template:

```
You are an AI assistant for Arbor Sentinel, a civic evidence platform.
Your task is to produce an objective, neutral summary of the following source
document. Follow these rules:

1. Do not add information not present in the source.
2. Do not editorialize, speculate, or offer opinions.
3. Distinguish between established facts, allegations, and claims.
4. Preserve legal precision — do not simplify legal terminology.
5. If the source contains multiple perspectives, represent them fairly.
6. If anything is unclear or ambiguous, note it rather than inventing clarity.
7. Output format: structured JSON per the EvidenceRecord schema.

Source document:
[document text]
```

### 5.4 Entity Extraction

AI extracts entities (people, organizations, locations, dates) from source
documents:

```typescript
interface AIEntityExtractionOutput {
  entities: {
    name: string;
    type: "person" | "organization" | "location" | "date" | "legal_case" | "treaty";
    confidence: number;
    sourceSpan: { startOffset: number; endOffset: number };
    normalizedName?: string;
    wikidataId?: string;
  }[];
  model: string;
  modelVersion: string;
  generatedAt: string;
}
```

### 5.5 Claim Extraction and Classification

AI extracts discrete claims from documents and classifies them:

```typescript
interface AIClaimOutput {
  claims: {
    id: string;
    text: string;
    type: "factual_assertion" | "allegation" | "legal_finding" | "opinion" | "policy_position";
    subject: string;         // entity making or subject of the claim
    predicate: string;
    object?: string;
    confidence: number;
    sourceSpan: { startOffset: number; endOffset: number };
    legalClassification?: string;
  }[];
  model: string;
  modelVersion: string;
  generatedAt: string;
}
```

### 5.6 Timeline Extraction

AI extracts chronological sequences from documents:

```typescript
interface AITimelineOutput {
  events: {
    date: string;         // ISO 8601
    datePrecision: "exact" | "month" | "year" | "approximate";
    title: string;
    description: string;
    sourceSpan: { startOffset: number; endOffset: number };
  }[];
  model: string;
  modelVersion: string;
}
```

### 5.7 Geographic Extraction (Text to GeoJSON)

AI extracts location references and converts them to GeoJSON:

```typescript
interface AIGeoJSONOutput {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    geometry: {
      type: "Point" | "Polygon" | "MultiPolygon";
      coordinates: number[] | number[][];
    };
    properties: {
      name: string;
      sourceText: string;
      confidence: number;
      precision: "exact" | "approximate" | "region" | "country";
      safetyLevel: "safe" | "requires_review" | "unsafe";
    };
  }[];
  model: string;
  modelVersion: string;
}
```

**Safety constraint:** Any location with precision "exact" that could identify
a shelter, safe route, or individual must be flagged for human safety review.
The platform never publishes exact sensitive locations.

### 5.8 Relationship Detection (Entity Linking)

AI detects relationships between entities across documents:

```typescript
interface AIRelationshipOutput {
  relationships: {
    source: string;       // Entity ID
    target: string;       // Entity ID
    type: "member_of" | "located_in" | "funded_by" | "reported_by" |
          "investigates" | "sanctioned_by" | "party_to_case";
    confidence: number;
    evidenceSpans: { sourceSpan: { startOffset: number; endOffset: number } }[];
  }[];
}
```

### 5.9 Topic Classification

AI classifies documents and evidence records into a controlled topic taxonomy:

```typescript
interface AITopicClassificationOutput {
  primaryTopic: string;
  secondaryTopics: string[];
  confidence: number;
  taxonomyVersion: string;
}
```

Controlled topic taxonomy includes: `ceasefire`, `humanitarian_access`,
`arms_transfers`, `legal_accountability`, `civilian_protection`,
`displacement`, `medical_access`, `food_security`, `detention`, `torture`,
`journalist_safety`, `aid_obstruction`, `cultural_destruction`.

### 5.10 Duplicate Detection (Across Sources)

AI assesses semantic similarity between records, beyond structural
deduplication (Layer 2):

```typescript
interface AIDuplicateAssessment {
  recordA: string;
  recordB: string;
  similarityScore: number;     // 0.0 - 1.0
  isDuplicate: boolean;        // only if above threshold
  reasoning: string;
  mergeRecommendation?: string;
}
```

### 5.11 Contradiction Detection

AI flags contradictions between claims in different sources:

```typescript
interface AIContradictionOutput {
  claimA: string;
  claimB: string;
  contradictionType: "direct" | "implied" | "temporal" | "contextual";
  severity: "high" | "medium" | "low";
  explanation: string;
  resolutionRecommendation?: string;
}
```

### 5.12 Confidence Estimation

Every AI extraction carries a confidence score:

| Score Range | Meaning | Review Priority |
|-------------|---------|-----------------|
| 0.9 - 1.0 | High confidence — clear source text, unambiguous | Optional review |
| 0.7 - 0.89 | Moderate confidence — some ambiguity | Recommended review |
| 0.5 - 0.69 | Low confidence — significant ambiguity | Required review |
| 0.0 - 0.49 | Very low confidence — likely wrong | Do not use |

### 5.13 AI Model Routing

Different tasks use different models based on requirements:

| Task | Model Requirement | Reasoning |
|------|------------------|-----------|
| Translation | High-quality translation model (GPT-4, Claude, or dedicated translation model) | Accuracy critical for legal content |
| Summarization | Large context window, instruction-following | Must handle long documents |
| Entity extraction | Fast, structured output | High volume, lower stakes |
| Claim extraction | Strong reasoning, structured output | Legal nuance critical |
| Geographic extraction | Must output valid GeoJSON | Schema-critical output |
| Relationship detection | Large context, entity resolution | Cross-document reasoning |
| Duplicate detection | Embedding model + classifier | Semantic similarity |
| Contradiction detection | Strong reasoning, multi-document | Highest stakes |

### 5.14 Prompt Engineering Patterns

All AI prompts follow a consistent pattern:

1. **System role:** "You are an AI assistant for Arbor Sentinel..."
2. **Task description:** Specific, unambiguous instruction
3. **Rules list:** 3-7 numbered rules for the task
4. **Output format:** Structured JSON schema
5. **Source context:** The document or text to process
6. **Few-shot examples** (for complex tasks)

### 5.15 Hallucination Mitigation

- All outputs must reference source spans (character offsets in the source text)
- Confidence scores must reflect genuine model uncertainty, not verbosity
- Claims without source span support are discarded
- Model-specific hallucination rates are tracked per task
- "I don't know" is a valid and encouraged output

### 5.16 AI Output Schema (Universal Wrapper)

Every AI extraction is wrapped in a standard envelope:

```typescript
interface AIOutput<T> {
  /** The proposed content, typed per task. */
  proposedContent: T;

  /** Overall confidence score (0.0 - 1.0). */
  confidence: number;

  /** References to spans in the source document. */
  sourceSpanReferences: {
    sourceId: string;
    startOffset: number;
    endOffset: number;
    supportingText: string;
  }[];

  /** Model that produced this output. */
  model: string;
  modelVersion: string;

  /** When the output was generated. */
  timestamp: string;

  /** Prompt template version used. */
  promptVersion: string;

  /** Warning flags for the human reviewer. */
  warnings: string[];

  /** Status — always "proposed" until reviewed. */
  status: "proposed" | "accepted" | "rejected" | "modified";
}
```

---

## 6. Layer 4 — Human Editorial & Expert Review

> **Current state:** The review data model (ContentStatus, VerificationLevel)
> and review-state-aware components (VerificationBadge, LegalStatusBadge,
> ContentStatusBadge) are implemented. The review queue backend is not yet
> built. During the static beta, review happens offline via GitHub issues,
> pull requests, and trusted-reviewer feedback.

### 6.1 Review Queue Architecture

```
Proposed Content (from AI Layer 3 or human draft)
        │
        ▼
┌─────────────────┐
│  Review Queue    │  ← Items enter here
│  Status: New     │
└────────┬────────┘
         │ assign
         ▼
┌─────────────────┐
│  Status:         │  ← Reviewer picks up item
│  Reviewing       │
└────────┬────────┘
         │ decide
         ▼
┌─────────────────────┐
│  Approve │ Reject   │
│  Request Changes    │
└──────┬──────────────┘
       │ approved
       ▼
┌─────────────────┐
│  Status:         │  ← Ready for publication
│  Approved        │
└────────┬────────┘
         │ publish
         ▼
┌─────────────────┐
│  Status:         │  ← Public
│  Published       │
└────────┬────────┘
         │ correct / deprecate
         ▼
┌───────────────────┐
│  Corrected   or   │
│  Deprecated       │
└───────────────────┘
```

### 6.2 Review States (Machine)

```typescript
type ReviewState =
  | "new"              // Entered the queue, not yet assigned
  | "reviewing"        // Assigned and in progress
  | "approved"         // Passed review, ready for publication
  | "rejected"         // Failed review, returned with notes
  | "changes_requested" // Needs revision before re-review
  | "published"        // Reviewed AND published (terminal, but can be superseded)
  | "corrected"        // Published, then corrected
  | "deprecated";      // Published, then deprecated/withdrawn
```

### 6.3 Review Types

| Review Type | Scope | Required Skills |
|-------------|-------|-----------------|
| **Legal** | Legal wording, status labels, jurisdictional accuracy, ICJ/ICC framing | Legal professional or trained human-rights lawyer |
| **Translation** | Accuracy of translated content | Competent speaker of source and target language |
| **Editorial** | Tone, clarity, compliance with voice guidelines, factual framing | Editorial experience |
| **Country** | Country position accuracy, voting records, arms-transfer data | Country/region expertise |
| **Institution** | Institution role, competence boundaries, public statements | Institutional knowledge |
| **Source Verification** | URL validity, publisher identity, document authenticity | OSINT/research skills |
| **Evidence** | Source-evidence alignment, verification level accuracy, categorization | Research or investigative background |

### 6.4 Assignment and Routing

Review items are routed based on:

1. **Content type:** Evidence → evidence reviewers, legal → legal reviewers
2. **Language:** Translation reviewed by competent speakers of target language
3. **Jurisdiction:** Belgium content routed to reviewers with Belgian expertise
4. **Sensitivity:** High-sensitivity items require two independent reviews

### 6.5 Review UI Requirements

The review interface (not yet built) requires:

- Side-by-side source document and proposed content view
- Clickable source span references
- One-click approve/reject/request-changes
- Structured review checklist per review type
- Comment threading for discussion
- Escalation button for complex issues
- Version comparison (what changed since last review)
- Role-based access (reviewers cannot publish their own content)

### 6.6 Escalation Paths

```
Normal Reviewer → Senior Reviewer → Editorial Board → Founder/Lead
```

Escalation triggers:
- Disagreement between two reviewers
- Novel legal or safety question
- Content about a living individual that could cause reputational harm
- Content that could affect an ongoing legal proceeding
- Previously unpublished allegation of atrocity crimes

### 6.7 Correction Workflow

Corrections follow the same review pipeline as new content:

1. **Correction submitted** via `/corrections` form or GitHub issue
2. **Triage:** Is this a factual error, broken link, safety issue, or other type?
3. **Reviewed:** By the appropriate reviewer type
4. **Action:** Content updated, deprecated, or confirmed as accurate
5. **Logged:** Major corrections publicly recorded
6. **Version:** Content version incremented

### 6.8 Audit Trail

Every state transition is recorded:

```typescript
interface ReviewAuditEntry {
  id: string;
  recordId: string;
  previousState: ReviewState;
  newState: ReviewState;
  reviewerRole: string;
  reviewerId?: string;    // Internal, not public
  comment: string;
  timestamp: string;
  changeDelta?: Record<string, unknown>;  // What changed
}
```

---

## 7. Layer 5 — Versioned Public Knowledge

> **Current state:** Version tracking exists as a `version` field in every
> record type. Full versioned storage and rollback are not yet implemented.

### 7.1 Publication States

```typescript
type PublicationState =
  | "draft"             // Not yet reviewed, not public
  | "static_preview"    // In static beta — manually constructed preview
  | "published"         // Reviewed and live
  | "versioned"         // Superseded by a newer version, previous version retained
  | "archived"          // No longer actively maintained but still accessible
  | "corrected"         // Published, then corrected (correction is a new version)
  | "deprecated";       // Withdrawn — content was incorrect or unsafe
```

### 7.2 Versioning Strategy

Each content version is a complete snapshot:

```typescript
interface ContentVersion {
  id: string;
  recordId: string;
  recordType: string;
  versionNumber: number;
  content: Record<string, unknown>;  // Full record snapshot
  changeDescription: string;
  reason: "initial" | "editorial_update" | "correction" | "deprecation";
  approvedBy: string;        // Role reference
  publishedAt: string;
  supersedesVersion: number;
  supersededByVersion?: number;
}
```

Key rules:
- Version numbers are sequential per record (1, 2, 3...)
- Versions are immutable once created
- The public always sees the latest published version
- Previous versions are accessible via a version selector (for dossiers, legal pages)
- Corrections create new versions, never modify existing ones

### 7.3 Content Version Storage

During the static beta: versions are tracked via git history. The `version`
field in each data file is manually incremented.

During the functional MVP: versions are stored in a `content_versions` table
in PostgreSQL, keyed by `(record_type, record_id, version_number)`.

### 7.4 Rollback Capability

Rollback creates a new version whose content equals a previous version, with
reason code `rollback`. This ensures the audit trail is complete — no version
is ever deleted.

```typescript
interface RollbackOperation {
  recordId: string;
  recordType: string;
  targetVersion: number;
  reason: string;
  approvedBy: string;
  timestamp: string;
}
```

### 7.5 Publication Approval Gates

Before content reaches `published` state, it must pass:

1. **Source check:** At least one sourceId resolves to a valid SourceRecord
2. **Date check:** All dates are current or clearly dated, no expected-future dates
3. **Legal-status check:** Allegations, proceedings, rulings, warrants, findings,
   and NGO determinations are properly distinguished
4. **Safety check:** No unsafe personal or location data
5. **Language check:** Calm, precise, non-hateful, non-inciting wording (enforced
   by editorial review)
6. **Correction path:** A correction route exists (`correctionUrl` is non-empty)
7. **Methodology link:** Relevant policy is accessible via `methodologyUrl`
8. **Version check:** Version number is recorded and incremented

Content that has not passed all gates remains in `draft`, `static_preview`,
or `review_pending` status.

---

## 8. Layer 6 — Public Platform

> **Current state:** Fully implemented as a React/Vite/TypeScript static
> application. This is the only layer currently live.

### 8.1 Route Architecture

All routes are defined in `src/App.tsx` using React Router v7.

```
/                              → HomePage (eager-loaded)
/methodology                   → MethodologyPage
/contribute                    → ContributePage
/changelog                     → ChangelogPage
/attributions                  → AttributionsPage
/corrections                   → CorrectionsPage
/privacy                       → PrivacyPage
/accessibility                 → AccessibilityPage
/disclaimer                    → DisclaimerPage
/gaza-dossier                  → GazaDossierPage
/legal-tracker                 → LegalTrackerPage
/legal-tracker/:slug           → LegalCaseDetailPage
/countries                     → CountriesIndexPage
/countries/belgium             → BelgiumPage
/institutions                  → InstitutionsIndexPage
/institutions/european-union   → EuropeanUnionPage
/organizations                 → OrganizationsPage
/organizations/:slug           → OrganizationDetailPage
/take-action                   → ActionHubPage
/take-action/:slug             → ActionDetailPage
/evidence                      → EvidenceLibraryPage
/evidence/:slug                → EvidenceDetailPage
/press                         → PressPage
/sources                       → SourceRegistryPage
/sources/:sourceId             → SourceDetailPage
/dossiers                      → DossiersPage
/dossiers/:slug                → DossierDetailPage
/search                        → SearchPage
*                              → NotFoundPage (eager-loaded)
```

**Route splitting:** All pages except Home, NotFound, and App shell are
lazy-loaded via `React.lazy()` with `Suspense` + `RouteLoadingFallback`.
Vite manualChunks split vendor dependencies:

| Chunk | Contents | Rationale |
|-------|----------|-----------|
| `vendor-react` | react, react-dom, react-router-dom | Changes rarely, benefits from long-term cache |
| `vendor-motion` | framer-motion | Isolated so pages without motion don't pay for it |
| `vendor-i18n` | i18next, react-i18next | Isolated, rarely changes |

### 8.2 Navigation Architecture

**Desktop navigation** (defined in `src/data/navigation.ts`):
```
Gaza Dossier | Legal Tracker | Countries | Methodology | Contribute
```

**Footer navigation** (defined in `src/components/layout/Footer.tsx`):
```
Project:     Gaza Dossier | Legal Tracker | Countries | Institutions |
             Organizations | Take Action | Evidence Library |
             Dossier Library | Methodology | Contribute | Corrections
Resources:   Attributions | Privacy | Accessibility | Press | Disclaimer
External:    GitHub Repository | Security Policy | Contribution Guide
```

**Header** (`src/components/layout/Header.tsx`):
- Logo + wordmark
- Desktop nav items (above)
- Search link (navigates to `/search`)
- LanguageSwitcher component
- DisplayDensityToggle component
- GitHub external link
- Responsive: collapses to hamburger menu on mobile

### 8.3 Component Architecture

Components are organized by domain:

```
src/components/
  ui/           → Generic reusable UI primitives (Badge, Card, Button,
                  Container, Reveal, SectionHeading, ExternalLink,
                  LinkCard, DocumentHead, RouteLoadingFallback)

  layout/       → Structural components (Header, Footer, PageShell,
                  LanguageSwitcher, DisplayDensityToggle)

  landing/      → Homepage sections (Hero, StartingFocus, MissionSection,
                  ModuleGrid, BetaStatusNotice, SafetyPrinciples,
                  NotThisProject, RoadmapPreview, GatewaySection,
                  ContributorCTA)

  pages/        → Shared page patterns (PageIntro, PageStatusNotice,
                  PreviewNotice, PolicySection, CorrectionLink,
                  LastUpdated, SourceList, ContentStatusBadge,
                  VerificationBadge, LegalStatusBadge, PrintOnly)

  evidence/     → Evidence-specific (EvidenceItemCard, EvidenceFilters,
                  EvidenceEmptyState)

  legal/        → Legal-specific (LegalCaseCard, LegalTimeline,
                  LegalStatusExplanations)

  countries/    → Country-specific (CountryIndexCard)

  institutions/ → Institution-specific (InstitutionIndexCard)

  organizations/→ Organization-specific (OrganizationCard,
                  OrganizationDisclaimer)

  actions/      → Action-specific (ActionCard, CopyTemplateButton)

  search/       → Search-specific (SearchResultCard, RelatedRecords)
```

### 8.4 Evidence Card Component

```typescript
interface EvidenceItemCardProps {
  item: EvidenceItem;
  showStatus?: boolean;
  showSourceQuality?: boolean;
  compact?: boolean;
}
```

Displays: title, summary (truncated), category badge, source type badge,
verification level, content status, date, source count, related route links.

### 8.5 Legal Case Card Component

```typescript
interface LegalCaseCardProps {
  case: LegalCaseEntry;
  showTimeline?: boolean;
}
```

Displays: case title, institution, jurisdiction, parties, legal status badges,
opened date, latest update, next milestone, action relevance.

### 8.6 Country and Institution Cards

```typescript
interface CountryIndexCardProps {
  country: {
    id: string;
    name: string;
    flag?: string;
    description: string;
    status: ContentStatus;
    route: string;
  };
}
```

Country cards link to country detail pages. Institution cards follow the same
pattern.

### 8.7 Organization Card

```typescript
interface OrganizationCardProps {
  organization: OrganizationRecord;
}
```

Displays: name, category, regions, short description, official website link,
donation link, relationship status badge, content status badge.

### 8.8 Action Card

```typescript
interface ActionCardProps {
  action: ActionTemplate;
}
```

Displays: title, action type badge, jurisdiction, intended audience, purpose,
policy ask, source basis, template review status, warnings.

### 8.9 Search Architecture

Search is fully client-side during the static beta. The architecture has three
layers:

**Layer 1 — Build Index** (`src/lib/search/buildIndex.ts`):
At build time (or app initialization), all data collections are mapped to a
single `SearchableRecord[]` array. This is a flat, in-memory index.

```typescript
interface SearchableRecord {
  id: string;
  type: SearchableRecordType;
  title: string;
  description: string;
  route: string;
  tags: string[];
  publisher?: string;
  category?: string;
  jurisdiction?: string;
  sourceType?: SourceType;
  contentStatus?: ContentStatus;
  sourceQuality?: VerificationLevel;
  legalStatuses?: LegalStatus[];
  language?: string;
  active: boolean;
}
```

**Layer 2 — Search Function** (`src/lib/search/search.ts`):
Simple, understandable ranking without fuzzy matching:

| Rank | Match Type | Score |
|------|-----------|-------|
| 1 | Exact title match | 100 |
| 2 | Title starts with query | 80 |
| 3 | Title contains all query terms | 60 + term count |
| 4 | Title contains any query term | 30 + match count |
| 5 | Description contains all query terms | 20 + term count |
| 6 | Description contains any query term | 10 + match count |
| 7 | Tags/publisher/category/jurisdiction match | 3-5 per match |

No query logging. No user profiling. No external service.

**Layer 3 — Relationship Resolver** (`src/lib/search/relationships.ts`):
Bidirectional relationship lookup. Given a record ID, returns:
- `references`: records that this record points TO (via sourceIds, relatedRoutes)
- `referencedBy`: records that point TO this record (reverse-reference search)

**Future migration path:**
- Postgres full-text search (`tsvector` + `tsquery`) for the functional MVP
- Meilisearch or OpenSearch if the evidence library grows beyond ~10,000 records

### 8.10 Maps Architecture

Maps are not yet implemented (deferred per PRD). The planned architecture:

- **Renderer:** MapLibre GL JS (open-source, no API key required)
- **Base tiles:** OpenStreetMap via a tile server (self-hosted or CDN-cached)
- **Data layer:** GeoJSON FeatureCollections from the Geographic Extraction (Layer 3)
- **Layer system:**
  - Events layer (incident markers with safe precision)
  - Sources layer (source document geographic coverage)
  - Organizations layer (organizations' operational regions)
  - Legal layer (jurisdictional boundaries, ICJ/ICC member states)
  - Infrastructure layer (hospitals, crossings, aid routes — curated only)
  - Humanitarian layer (humanitarian access, displacement)
  - Timeline layer (animate events over time)

**Safety constraints:**
- No exact locations for sensitive incidents (shelters, safe routes)
- Location precision controlled by `LocationPrecision` field
- Delayed publication where needed
- All map data manually reviewed before publication

### 8.11 Dossier Generation

During the static beta: dossiers are hand-authored Markdown/HTML with
structured metadata in `src/data/dossiers.ts`.

For the functional MVP:
- **Templates:** Hand-authored dossier layouts per type (one-page brief,
  five-page memo, full dossier)
- **Assembly:** Server-side assembly from reviewed records
- **Output:** HTML for browser view, PDF via Playwright/Puppeteer, Markdown for download
- **Versioning:** Each generated dossier is a versioned snapshot
- **Format:** PDF, Markdown, HTML/print page; DOCX later

```typescript
interface DossierAssemblyRequest {
  type: DossierType;
  audience: DossierAudience;
  issueFocus: string;
  jurisdiction: string;
  language: string;
  evidenceIds?: string[];
  legalCaseIds?: string[];
  countryIds?: string[];
  includeSources?: boolean;
}
```

### 8.12 Action Hub

The Action Hub (`/take-action`) provides lawful civic action templates:

- **Template system:** Each template is a structured record with title, purpose,
  policy ask, source basis, instructions, and template body
- **Jurisdiction routing:** Templates are tagged by jurisdiction (country,
  EU, international)
- **Manual copy:** During static beta, templates are manual copy-only;
  `mailto:` links require review
- **Later flow:** Country -> Issue -> Template -> Copy/Send (no identity storage)

Warnings are displayed on every action card:
```typescript
interface ActionWarning {
  type: "legal" | "safety" | "jurisdiction" | "tone";
  message: string;
}
```

### 8.13 Internationalization

- **Framework:** react-i18next with i18next
- **Namespaces:** `common`, `statusLabels`, `navigation`
- **Current locales:** English (source), Dutch, French
- **Planned locales:** Arabic, Spanish, German, Hebrew

**Architecture decisions:**

- Language preference stored in `localStorage` only (key:
  `arbor-sentinel-lang`) — no URL prefix, no subdomain routing
- English is the authoritative source language
- UI chrome and status labels are fully internationalized (3 namespaces)
- Content (summaries, evidence, legal) remains English until translated
  and reviewed
- Locale detection order: localStorage -> navigator.language -> 'en'
- Missing keys in non-English locales fall back to English gracefully
- RTL support designed for future Arabic/Hebrew layouts but not yet tested

**LocaleSwitcher component:**
- Dropdown showing language names in their native script
- Currently: English, Nederlands, Francais
- No flags (avoids political implications)

### 8.14 Display Preferences

The `DisplayPreferenceProvider` context manages:

- **Display density:** "compact" or "comfortable" — toggled via
  `DisplayDensityToggle` component
- Preference stored in `localStorage`

---

## 9. Data Architecture

### 9.1 Event-First Data Model

The data model centers on **Events**, not Articles. Events are occurrences
that sources document. Everything else is a derived view:

```
Source Document
      │
      ▼
    Event ◄─────────────────────────┐
      │                             │
      ▼                             │
  Evidence Record ◄─── Legal Case ──┤
  (structured summary)   │          │
      │                  │          │
      ▼                  ▼          ▼
  Evidence Items    Legal Timelines   Dossiers
  (curated library) (per case)     (assembled views)
```

### 9.2 Knowledge Graph Design

The knowledge graph is implicit in the data model, expressed through ID
references:

```
Source ──supports──▶ Claim ──supported_by──▶ Evidence
  │                    │                        │
  │                    ▼                        ▼
  └──documents──▶ Event ──located_in──▶ Country
  │                    │                        │
  │                    ▼                        │
  └──filed_in──▶ Legal Case ──involves──▶ Institution
  │                              │
  │                              ▼
  │                        Person / Organization
  ▼
Action ──targets──▶ Country/Institution
  │
  └──references──▶ Source
```

Relationships are stored as explicit ID arrays:
- `sourceIds` on evidence, legal cases, organizations, actions, dossiers
- `eventIds` on evidence records
- `keyFactRecordIds` on dossiers (evidence items referenced)
- `legalCaseIds` on dossiers
- `countryOrInstitutionIds` on dossiers
- `relatedRoutes` on evidence items and action templates

### 9.3 Current Static Data Files

All data lives in `src/data/` as TypeScript files:

| File | Contents | Types Used |
|------|----------|------------|
| `sources.ts` | SourceRecord[] | SourceRecord |
| `evidenceItems.ts` | EvidenceItem[] | EvidenceItem (interface) |
| `legalCases.ts` | LegalCaseEntry[] | LegalCaseEntry (interface) |
| `organizations.ts` | OrganizationRecord[] | OrganizationRecord (interface) |
| `countries.ts` | Country data + Belgium detail | Various position/record types |
| `institutions.ts` | Institution entries + EU detail | InstitutionEntry, position records |
| `actionTemplates.ts` | ActionTemplate[] | ActionTemplate (interface) |
| `dossiers.ts` | DossierRecord[] | DossierRecord |
| `dossierTemplates.ts` | DossierTemplate[] | DossierTemplate |
| `navigation.ts` | NavItem[], mainNavItems, githubLink | NavItem |
| `routeMetadata.ts` | Route metadata for SEO/OG | RouteMeta, getRouteMeta() |
| `roadmap.ts` | Roadmap phases and milestones | Roadmap types |
| `modules.ts` | Core platform modules | Module descriptions |
| `principles.ts` | Platform principles | Principle descriptions |
| `attributions.ts` | Image attribution records | AttributionRecord |
| `gazaDossier.ts` | Gaza dossier content | Dossier content types |
| `legalTimeline.ts` | Legal procedural timeline | LegalTimelineEvent[] |
| `validation.ts` | Validation wrapper | Re-exports from lib/content-validation |
| `belgiumData.ts` | Belgium-specific content | Position, vote, statement records |
| `euData.ts` | EU-specific content | Institution position records |

### 9.4 Database Design (Future — Supabase/PostgreSQL)

The database will follow the same domain model as the static data. Core tables:

```sql
-- Sources table
CREATE TABLE sources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  publisher     TEXT NOT NULL,
  source_type   TEXT NOT NULL,          -- ENUM: court, un, government, etc.
  document_type TEXT,
  url           TEXT NOT NULL,
  archive_url   TEXT,
  publication_date DATE,
  accessed_at   DATE NOT NULL,
  language      TEXT,
  jurisdiction  TEXT,
  authors       TEXT[],
  official      BOOLEAN DEFAULT false,
  status        TEXT NOT NULL DEFAULT 'active',  -- active, broken, archived, superseded
  notes         TEXT,
  version       INTEGER NOT NULL DEFAULT 1,
  last_checked_at TIMESTAMPTZ,
  correction_url TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Evidence items
CREATE TABLE evidence_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT UNIQUE NOT NULL,
  title             TEXT NOT NULL,
  summary           TEXT NOT NULL,
  category          TEXT NOT NULL,      -- ENUM
  source_ids        UUID[] NOT NULL,    -- FK to sources
  primary_source_type TEXT NOT NULL,
  source_quality    INTEGER NOT NULL CHECK (source_quality BETWEEN 0 AND 5),
  content_status    TEXT NOT NULL,      -- ENUM
  legal_statuses    TEXT[],
  publication_date  DATE,
  incident_date     DATE,
  safe_location     TEXT,
  source_language   TEXT,
  last_reviewed_at  TIMESTAMPTZ,
  reviewed_by_role  TEXT,
  version           INTEGER NOT NULL DEFAULT 1,
  correction_url    TEXT NOT NULL,
  tags              TEXT[],
  related_routes    TEXT[],
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Countries
CREATE TABLE countries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  iso_code      TEXT UNIQUE,
  region        TEXT,
  slug          TEXT UNIQUE NOT NULL,
  eu_member     BOOLEAN DEFAULT false,
  nato_member   BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Legal cases
CREATE TABLE legal_cases (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  institution  TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  parties      TEXT[] NOT NULL,
  summary      TEXT NOT NULL,
  legal_statuses TEXT[],
  opened_date  DATE,
  latest_verified_update_date TEXT,
  next_milestone TEXT,
  legal_basis  TEXT,
  action_relevance TEXT,
  source_ids   UUID[] NOT NULL,
  source_quality INTEGER CHECK (source_quality BETWEEN 0 AND 5),
  content_status TEXT NOT NULL,
  procedural_note TEXT,
  version      INTEGER DEFAULT 1,
  last_reviewed_at TIMESTAMPTZ,
  reviewed_by_role TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Organizations
CREATE TABLE organizations (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                      TEXT UNIQUE NOT NULL,
  name                      TEXT NOT NULL,
  category                  TEXT NOT NULL,
  regions                   TEXT[],
  short_description         TEXT NOT NULL,
  official_website          TEXT NOT NULL,
  official_donation_url     TEXT,
  services                  TEXT[],
  relationship_status       TEXT NOT NULL DEFAULT 'public_resource',
  content_status            TEXT NOT NULL,
  source_ids                UUID[],
  last_reviewed_at          TIMESTAMPTZ,
  reviewed_by_role          TEXT,
  version                   INTEGER DEFAULT 1,
  correction_url            TEXT NOT NULL,
  review_notes              TEXT,
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now()
);

-- Action templates
CREATE TABLE action_templates (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                    TEXT UNIQUE NOT NULL,
  title                   TEXT NOT NULL,
  action_type             TEXT NOT NULL,
  jurisdiction            TEXT NOT NULL,
  intended_audience       TEXT NOT NULL,
  purpose                 TEXT NOT NULL,
  policy_ask              TEXT NOT NULL,
  source_basis            TEXT NOT NULL,
  instructions            TEXT NOT NULL,
  template_body           TEXT,
  template_review_status  TEXT,
  language                TEXT NOT NULL,
  content_status          TEXT NOT NULL,
  source_ids              UUID[],
  last_reviewed_at        TIMESTAMPTZ,
  reviewed_by_role        TEXT,
  version                 INTEGER DEFAULT 1,
  related_routes          TEXT[],
  warnings                TEXT[],
  active                  BOOLEAN DEFAULT true,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

-- Content versions (audit trail)
CREATE TABLE content_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_type     TEXT NOT NULL,
  record_id       UUID NOT NULL,
  version_number  INTEGER NOT NULL,
  content         JSONB NOT NULL,          -- full snapshot
  change_description TEXT,
  reason          TEXT NOT NULL,
  approved_by     TEXT,
  published_at    TIMESTAMPTZ DEFAULT now(),
  supersedes      INTEGER,
  superseded_by   INTEGER,
  UNIQUE (record_type, record_id, version_number)
);

-- Corrections
CREATE TABLE corrections (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type         TEXT NOT NULL,
  target_id           UUID,
  reason              TEXT NOT NULL,
  message             TEXT NOT NULL,
  submitter_info      TEXT,            -- minimal, privacy-preserving
  status              TEXT DEFAULT 'pending',
  review_notes        TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Review assignments (for Layer 4)
CREATE TABLE review_assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_type   TEXT NOT NULL,
  record_id     UUID NOT NULL,
  review_type   TEXT NOT NULL,
  reviewer_role TEXT NOT NULL,
  state         TEXT DEFAULT 'new',
  assigned_at   TIMESTAMPTZ DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  result        TEXT,
  notes         TEXT
);

-- Audit log
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action      TEXT NOT NULL,
  actor_role  TEXT,
  record_type TEXT,
  record_id   UUID,
  details     JSONB,
  ip_address  TEXT,                    -- masked / partial only
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies:**

```sql
-- Public read on all published content
CREATE POLICY "Public read published content" ON evidence_items
  FOR SELECT USING (content_status IN ('static_preview', 'reviewed', 'corrected'));

-- Admin write only
CREATE POLICY "Admin write evidence" ON evidence_items
  FOR ALL USING (auth.role() = 'admin');

-- Corrections: anyone can insert, only admins/moderators can update
CREATE POLICY "Public submit corrections" ON corrections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Moderator update corrections" ON corrections
  FOR UPDATE USING (auth.role() IN ('moderator', 'admin'));
```

**PostGIS support** (functional MVP+):
```sql
-- Add spatial column to evidence_items
ALTER TABLE evidence_items ADD COLUMN location GEOMETRY(Point, 4326);

-- Add spatial column to countries
ALTER TABLE countries ADD COLUMN boundary GEOMETRY(MultiPolygon, 4326);

-- Spatial index for location queries
CREATE INDEX idx_evidence_location ON evidence_items USING GIST (location);
```

### 9.5 Static Data Strategy (Before Database)

During the static beta, all data resides in TypeScript files. The advantages:

1. **Type safety:** Every record is type-checked at compile time
2. **Validation:** Zod schemas validate every record at test time
3. **Version control:** All content is tracked in git alongside code
4. **Code review:** Content changes go through PRs with the same review process
5. **No backend:** Zero infrastructure required to serve data
6. **Fast iteration:** Content changes deploy immediately via git push

Rules for static data:
- All draft/preview content is marked with appropriate `contentStatus`
- No sensitive personal data is stored in static files
- No raw witness testimony in static files
- No unverified social-media claims presented as evidence
- Interfaces are designed to be compatible with future API records
- Every record includes `lastReviewedAt`, `contentStatus`, and `sourceIds`

### 9.6 Migration Path: Static Data to Database

The migration will happen in stages:

1. **Phase A:** Add database tables alongside static files
2. **Phase B:** Seed database from static files (import script)
3. **Phase C:** Admin UI for database content management
4. **Phase D:** Frontend reads from API instead of static imports
5. **Phase E:** Static files become the seed-data backup

During migration, the frontend will use a data access layer that abstracts the
source:

```typescript
// Future data access layer abstraction
interface DataProvider {
  getEvidence(slug: string): Promise<EvidenceItem>;
  listEvidence(filters: EvidenceFilters): Promise<EvidenceItem[]>;
  getLegalCase(slug: string): Promise<LegalCaseEntry>;
  // ...
}

// Static implementation (current)
class StaticDataProvider implements DataProvider { /* imports from src/data */ }

// API implementation (future)
class APIDataProvider implements DataProvider { /* fetches from /api/v1/ */ }
```

---

## 10. Technology Stack

### 10.1 Current (Static Beta)

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React | 19 | UI rendering |
| **Bundler** | Vite | 6 | Build tool with fast HMR |
| **Language** | TypeScript | 5.7 | Type safety |
| **CSS** | Tailwind CSS | 3.4 | Utility-first design system |
| **Animation** | Framer Motion | 12 | Restrained scroll reveals and transitions |
| **Routing** | React Router | 7 | Client-side routing |
| **i18n** | react-i18next, i18next | 17, 26 | Internationalization |
| **Validation** | Zod | 4 | Runtime schema validation |
| **Testing** | Vitest | 4 | Unit and integration tests |
| **DOM Testing** | Testing Library | 16 | Component tests |
| **Accessibility** | vitest-axe | 0.1 | Automated a11y checks |
| **Fonts** | IBM Plex Serif, Inter, IBM Plex Mono | via @fontsource | Typography |
| **Hosting** | TBD (Netlify/Vercel/Cloudflare Pages) | - | Static site hosting |

### 10.2 Planned (Functional MVP+)

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Backend** | Supabase or Django + PostgreSQL | Data API, admin, auth |
| **Database** | PostgreSQL + PostGIS | Relational data with geospatial |
| **Search** | PostgreSQL full-text → Meilisearch/OpenSearch | Full-text search |
| **Maps** | MapLibre GL + OpenStreetMap Tiles | Interactive maps |
| **PDF** | Playwright / Puppeteer (server-side) | Dossier generation |
| **Analytics** | Plausible or Matomo | Privacy-first analytics |
| **CDN/DNS** | Cloudflare | DNS, CDN, WAF, DDoS protection |
| **Edge** | Cloudflare Workers (potentially) | API proxying, auth |

### 10.3 Infrastructure Decisions

| Decision | Rationale |
|----------|-----------|
| **No SSR/SSG in static beta** | Simplifies deployment; client-side React is sufficient for current scale |
| **No database in static beta** | Zero infrastructure cost, faster iteration, safer for early-stage content |
| **No TypeScript backend** | The backend decision is deferred to Sprint 4 after static-beta feedback |
| **No CSS framework (Tailwind only)** | No design-system lock-in; utility classes map directly to design tokens |
| **No state management library** | Component-local state + React context is sufficient for current complexity |
| **ManualChunks in Vite** | Splits vendor code for caching efficiency |
| **@fontsource for fonts** | Self-hosted fonts, no external font service request |

### 10.4 Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-motion": ["framer-motion"],
          "vendor-i18n": ["i18next", "react-i18next"],
        },
      },
    },
    chunkSizeWarningLimit: 400,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    css: true,
  },
});
```

### 10.5 Tailwind Design Token Mapping

| Token | Hex | Role |
|-------|-----|------|
| `ink` | `#101828` | Primary text, footer backgrounds, primary buttons |
| `charcoal` | `#1F2937` | Body text |
| `paper` | `#F7F1E8` | Page background, warm base |
| `bone` | `#FAFAF7` | Cards, light surfaces |
| `clay` | `#B95C50` | Human/safety accent |
| `amber` | `#D99A2B` | Current phase markers, evidence points, careful emphasis |
| `trust` | `#3B6EA8` | Legal/institutional states, interactive elements |
| `border` | `#D8D6D0` | Dividers, card borders |

Typography:
- **Headings:** `font-serif` (IBM Plex Serif)
- **Body:** `font-sans` (Inter)
- **Labels/Metadata:** `font-mono` (IBM Plex Mono)

---

## 11. Security Architecture

### 11.1 Threat Model

| Threat | Likelihood | Impact | Current Mitigation (Static Beta) | MVP Mitigation |
|--------|-----------|--------|----------------------------------|----------------|
| **DDoS** | High | High | CDN (when deployed) | Cloudflare WAF + Galileo |
| **Spam/fake submissions** | High | Medium | No submission forms on static beta | Rate limiting + moderation |
| **Disinformation** | High | High | Review gates, source requirements, correction routes | Stronger editorial workflow |
| **Legal threats (defamation, etc.)** | Medium | High | Careful wording, methodology, primary sources, corrections | Legal counsel, documented processes |
| **Doxing** | Medium | Extreme | Explicit policy, no private targets, static files are public | Automated scanning, faster removal |
| **Witness exposure** | Medium | Extreme | No witness submissions in static beta | Separate secure system |
| **Credential theft** | Low | High | No user accounts in static beta | 2FA, RBAC, minimal privileged accounts |
| **Malicious uploads** | Medium | High | No upload forms in static beta | File type validation, scanning |
| **Dependency compromise** | Medium | High | Regular updates, lockfile | Automated Dependabot/Renovate |
| **Defacement** | Medium | Medium | Static site, CDN cache, git-based deployment | Subresource Integrity, deployment approval |

### 11.2 Defense in Depth (Layered Controls)

**Layer 1 — CDN/WAF** (planned for deployment):
- Cloudflare for DNS, CDN, WAF, DDoS protection
- Rate limiting on API endpoints
- Geographic blocking if targeted

**Layer 2 — Transport:**
- HTTPS enforced (HSTS preload)
- TLS 1.2+ minimum
- Secure cookies only (when cookies are introduced)

**Layer 3 — Content Security:**
- Strict CSP header:
  ```
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  ```
- No inline scripts (all JS in bundles)
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

**Layer 4 — Access Control:**
- **Static beta:** No authentication. Site is fully public.
- **Functional MVP:** Admin-only auth. Role-based access (RBAC).
- **Public launch:** Public read, authenticated write for authorized roles.

Roles (functional MVP):
| Role | Access |
|------|--------|
| Public visitor | View public content, submit corrections |
| Contributor | Suggest sources, drafts, translations |
| Researcher | Create draft evidence records |
| Reviewer | Review evidence, corrections, translations |
| Editor | Approve publication |
| Admin | Full system management |

**Layer 5 — Database:**
- Row-Level Security (RLS) on all tables
- Least-privilege service accounts
- Encrypted at rest

**Layer 6 — Audit:**
- All content changes logged in `audit_log` table
- All review state transitions logged
- All admin actions logged

### 11.3 Phase-Appropriate Controls

**Static Beta (current):**
- No user accounts or authentication
- No submission forms or file uploads
- No analytics or tracking
- HTTPS + security headers (when deployed)
- Dependency scanning in CI
- Branch protection on GitHub
- `SECURITY.md` with responsible disclosure route

**Functional MVP:**
- Cloudflare DNS/CDN/WAF added
- HSTS preload
- Admin 2FA (hardware key where possible)
- Strict RBAC with least privilege
- Rate limiting on API and correction forms
- Spam protection on submissions
- Database backups with restoration tests
- Audit logging for all admin actions
- Incident response runbook

**Public Launch:**
- Project Galileo application (DDoS protection for humanitarian sites)
- Independent security audit
- Separate admin domain (admin.arborsentinel.org)
- Tor/onion service evaluation
- Hardware security keys for all admin accounts
- Encrypted object storage for user-uploaded assets

### 11.4 Data Minimization

The platform collects the minimum data necessary:

- **Static beta:** Nothing. No forms, no accounts, no tracking.
- **Functional MVP:** Correction submissions (minimal, privacy-preserving).
  Admin accounts (email, 2FA secret). Aggregate analytics (page views, no IP storage).
- **Never collected:** Political profiles, exact user locations, message content
  sent via action templates, recipient responses, private notes, witness testimony
  (until expert review).

### 11.5 Secure Development Practices

- All code changes reviewed via pull request
- Branch protection: required reviews, no direct pushes to main
- Dependency scanning (npm audit, Dependabot)
- Secret scanning (git secrets, pre-commit hooks)
- No secrets in code (environment variables for build-time configuration)
- Secure `.env` management
- Regular dependency updates

---

## 12. Deployment Architecture

### 12.1 Static Beta (Current)

```
┌─────────────────────┐
│   Git Repository     │
│   (GitHub)           │
└─────────┬───────────┘
          │ git push
          ▼
┌─────────────────────┐
│   CI Pipeline        │
│   tsc → test → build │
└─────────┬───────────┘
          │ deploy
          ▼
┌─────────────────────┐
│   Static Hosting     │
│   (CDN / Object      │
│    Storage)          │
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│   Browser (React)    │
└─────────────────────┘
```

**Hosting options** (decision deferred):
- **Cloudflare Pages:** CDN, automatic HTTPS, preview deployments, generous free tier
- **Netlify:** Similar capabilities, simpler configuration
- **Vercel:** Optimized for React, excellent preview deployments

All options support:
- Custom domain + HTTPS
- Automatic deployment from git
- Preview deployments for PRs
- CDN caching
- Environment variables

### 12.2 Functional MVP (Planned)

```
┌─────────────────────┐
│   Git Repository     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   CI/CD Pipeline     │
│   typecheck → test   │
│   validate:content   │
│   build → deploy     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────────────────────┐
│  Cloudflare DNS, CDN, WAF           │
├─────────────────────────────────────┤
│  Static Frontend (CDN)              │
│  │                                  │
│  └─ /api/* → Supabase/Django API   │
└─────────────────────────────────────┘
          │
          ▼
┌─────────────────────┐
│  Supabase/PostgreSQL │
│  (or Django backend) │
│  + PostGIS           │
│  + Full-text search  │
└─────────────────────┘
```

### 12.3 CI/CD Pipeline

**Current (static beta):**

```yaml
# .github/workflows/ci.yml (planned)
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
      - run: npm run validate:content
```

**Planned (functional MVP):**
- Same as above, plus:
- Database migrations run on deploy
- Seed data sync from static files to database
- Integration tests against staging database
- E2E tests (Playwright) on preview deployment

### 12.4 Environment Strategy

| Environment | Purpose | Data | Who Has Access |
|-------------|---------|------|----------------|
| `local` | Development | Static TypeScript files | Contributors |
| `preview` | PR preview deployments | Static TypeScript files | Reviewers |
| `staging` | Pre-production validation | Staging DB (seeded from static) | Core team, testers |
| `production` | Public site | Production DB + CDN | Public |

### 12.5 Build Output

```
dist/
  index.html
  assets/
    index-abc123.css       (Tailwind output, ~25KB)
    index-def456.js         (App shell + routing)
    HomePage-789abc.js      (Eager-loaded pages)
    vendor-react-xyz789.js  (React/Router chunk, ~140KB)
    vendor-motion-uvw456.js (Framer Motion chunk, ~30KB)
    vendor-i18n-rst123.js   (i18n chunk, ~40KB)
    page-*.js               (Lazy-loaded page chunks)
  images/
    hero-gaza.jpg           (Optimized images)
    starting-focus-gaza.jpg
```

---

## 13. Integration Points

### 13.1 How Layers Communicate

```
Layer 1 → Layer 2: Collector output → NormalizedSourceRecord
Layer 2 → Layer 3: Normalized records → AI processing pipeline
Layer 3 → Layer 4: AI proposals (wrapped in AIOutput<T>) → Review queue
Layer 4 → Layer 5: Approved records → Publication pipeline
Layer 5 → Layer 6: Published records → Public API / static data
```

During the static beta, this pipeline is manual: human authors create content
in TypeScript files, which are type-checked, validated, and built into the
static site.

### 13.2 Event-Driven Architecture (Future)

For Layers 1-3, an event-driven approach is appropriate:

```
Collector → SourceCollected event
    → Normalizer picks up event
    → SourceNormalized event
        → AI Processor picks up event
        → AIProcessed event
            → Review Queue picks up event
            → ItemForReview event
                → Reviewer notification
```

Events are small, immutable messages containing the record ID and a reference
to the data. Event bus options: PostgreSQL LISTEN/NOTIFY (simple), Redis
Streams (medium), or RabbitMQ (complex).

### 13.3 API Contracts Between Layers

**Collector → Normalizer:**

```typescript
// Input: CollectorResult (see Section 3.1)
// Output: NormalizedSourceRecord[] (see Section 4.1)
```

**Normalizer → AI Pipeline:**

```typescript
interface AIPipelineInput {
  sourceRecords: NormalizedSourceRecord[];
  existingRecords: {
    evidence: EvidenceRecord[];
    entities: EntityRecord[];
    events: EventRecord[];
  };
  tasks: AITask[];  // which AI tasks to run
}

type AITask =
  | "translate"
  | "summarize"
  | "extract_entities"
  | "extract_claims"
  | "extract_timeline"
  | "extract_geography"
  | "detect_relationships"
  | "classify_topics"
  | "detect_duplicates"
  | "detect_contradictions";
```

**AI Pipeline → Review Queue:**

```typescript
interface ReviewQueueInput {
  recordType: string;
  proposedRecord: AIOutput<Record<string, unknown>>;
  priority: "low" | "medium" | "high";
  reviewType: ReviewType;
  suggestedReviewerRole: string;
}
```

**Review Queue → Publication:**

```typescript
interface PublicationInput {
  recordType: string;
  recordId: string;
  approvedRecord: Record<string, unknown>;
  version: number;
  approvedBy: string;   // role reference
  approvedAt: string;
  reviewIds: string[];  // audit trail references
}
```

### 13.4 Webhook and Scheduled Job Design

**Webhooks** (for push-based sources):
- Court filing feeds that support webhook delivery
- NGO press release webhooks
- UN info system webhook endpoints

Registration:

```typescript
interface WebhookRegistration {
  id: string;
  sourceRegistryId: string;
  url: string;                    // Webhook target URL
  secret: string;                 // HMAC secret for payload verification
  events: string[];               // Event types to subscribe to
  active: boolean;
  lastDelivery?: {
    at: string;
    statusCode: number;
    error?: string;
  };
}
```

**Scheduled jobs** (for polling-based collectors):

```typescript
interface ScheduledJob {
  id: string;
  collectorId: string;
  cronExpression: string;
  jitterWindowMs: number;
  timeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
  };
  enabled: boolean;
  lastRun?: {
    at: string;
    duration: number;
    recordsProduced: number;
    errors: CollectorError[];
  };
}
```

### 13.5 Data Flow Example: Source to Public Platform

```
1. [Layer 1] ICJ publishes a new provisional measures order
2. [Layer 1] ICJ RSS collector fetches the feed, detects new entry
3. [Layer 1] Collector outputs NormalizedSourceRecord
4. [Layer 2] Normalizer validates fields, detects language, checks for duplicates
5. [Layer 2] Normalizer creates/updates EventRecord for the procedural event
6. [Layer 3] AI pipeline receives the source record
7. [Layer 3] AI generates: summary, entity extraction, claim extraction,
   timeline event, GeoJSON (if location-related)
8. [Layer 3] Output: AIOutput<AISummary>, AIOutput<AIEntityExtraction>, etc.
9. [Layer 4] Items enter review queue with priority: high (court document)
10. [Layer 4] Legal reviewer reviews, approves summary, adjusts legal status
11. [Layer 4] Evidence reviewer reviews, sets verification level, links to
    existing case record
12. [Layer 5] Approved record versioned and published
13. [Layer 6] Public platform: new evidence card appears, legal timeline
    updated, search index rebuilt
14. [Layer 6] Dossier engine (if active) offers to include in relevant dossiers
```

---

## Appendix A: Key File Map

| Path | Purpose |
|------|---------|
| `src/App.tsx` | Route definitions, app shell |
| `src/main.tsx` | Entry point |
| `src/types/content.ts` | Core TypeScript types and controlled vocabularies |
| `src/schemas/index.ts` | Zod validation schemas for all record types |
| `src/data/*.ts` | Static data files (all collections) |
| `src/lib/content-validation/` | Content validation engine (rules, types, validator, summary) |
| `src/lib/search/` | Client-side search engine (index, ranking, relationships) |
| `src/i18n/` | Internationalization (config, detector, locale files, LocaleProvider) |
| `src/components/layout/Header.tsx` | Header with nav, language switcher, search |
| `src/components/layout/Footer.tsx` | Footer with all navigation links |
| `src/components/layout/PageShell.tsx` | Layout wrapper (header + content + footer) |
| `src/components/ui/` | Reusable UI primitives |
| `src/pages/` | All page components (28 pages) |
| `tailwind.config.js` | Design tokens (colors, fonts, shadows) |
| `vite.config.ts` | Build configuration and test setup |
| `PRD-v2.md` | Canonical product requirements (pipeline-centric) |
| `PRD-v1-archive.md` | Archived V1 PRD — detailed page specs, SQL schemas, risk register |
| `AI-INTELLIGENCE-PRD.md` | Complete AI/collector/review/maps/graph specification |
| `ROADMAP-v2.md` | Milestone-based roadmap (M1–M8) |
| `IMPLEMENTATION-GUIDE.md` | Golden rules for all implementation work |

## Appendix B: Controlled Vocabularies

### Content Status
`draft` | `static_preview` | `review_pending` | `reviewed` | `disputed` | `corrected` | `archived`

### Legal Status
`court_proceeding_active` | `provisional_measures_issued` | `arrest_warrant_issued` |
`allegation_under_investigation` | `un_finding` | `ngo_legal_determination` |
`not_judicially_determined` | `contested_claim` | `requires_further_verification`

### Verification Level
0 = Unreviewed lead | 1 = Preserved lead | 2 = Source checked |
3 = Corroborated | 4 = Trusted organization verified | 5 = Legal/institutional record

### Source Type
`court` | `un` | `government` | `humanitarian` | `ngo` | `academic` | `journalism` | `osint`

### Source Status
`active` | `broken` | `archived` | `superseded`

### Evidence Category
`court record` | `official UN document` | `humanitarian update` |
`human-rights report` | `parliamentary document` | `verified investigative report`

### Organization Category
`UN and humanitarian` | `Red Cross / Red Crescent` | `medical` |
`legal and human rights` | `documentation and data` | `journalism and press freedom` |
`academic and research`

### Action Type
`contact_representative` | `arms_transfer_review` | `humanitarian_access` |
`send_dossier` | `submit_correction` | `volunteer`

### Dossier Type
`one_page_brief` | `five_page_memo` | `full_dossier` | `journalist_briefing` |
`council_motion_pack` | `mp_contact_pack` | `humanitarian_access_brief` |
`arms_transfer_brief` | `legal_accountability_brief`

### Legal Timeline Event Type
`filing` | `jurisdiction_decision` | `investigation_opened` |
`provisional_measure` | `arrest_warrant_application` | `arrest_warrant_issued` |
`hearing` | `order` | `judgment` | `intervention` | `official_report_update`

---

## Appendix C: Design Principles for Implementation

1. **Don't import data directly in components.** Use data access functions
   (`getSourceById`, `getEvidenceBySlug`, `search()`) that can later be swapped
   for API calls.
2. **Keep validation in the validation library.** Don't scatter validation
   logic across data files. Add new rules to `src/lib/content-validation/rules.ts`.
3. **Every public record needs a correction route.** The `correctionUrl` field
   is not optional for publishable content.
4. **Status labels are visible by design.** Viewers should always know whether
   content is reviewed, a static preview, source-pending, or disputed. Never
   hide editorial status.
5. **Version numbers are sequential, never skipped.** When a record is corrected,
   its version increments. Previous versions remain accessible.
6. **No dead placeholder pages.** Every route must provide value even when its
   final feature is not active. Use `PageIntro` and `PageStatusNotice` to
   explain what the page will become.
7. **Support reduced motion.** All Framer Motion animations must respect
   `prefers-reduced-motion`. Use `useReducedMotion()` hook.
8. **Keep URL slugs stable.** Once a slug is published, it should not change.
   Redirects should be put in place if renaming is unavoidable.
9. **Preserve source language.** Never discard the original language text when
   displaying translations. Both versions should be accessible.
10. **Privacy is not optional.** No tracking scripts, no analytics cookies,
    no IP logging, no user profiling — at any phase.
