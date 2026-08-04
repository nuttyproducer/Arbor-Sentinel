# Arbor Sentinel — Roadmap v2

> **Former roadmap:** `ROADMAP.md` has been archived as `ROADMAP-v1-archive.md`.
>
> This roadmap is **milestone-based**, not phase-based. Each milestone builds on
> the previous one. A milestone is not considered complete until its Definition of
> Done has been met.
>
> Milestones are numbered for reference, not sequence: a later milestone may begin
> research or prototyping while an earlier milestone is still in review, but no
> milestone is considered shipped until its exit criteria are satisfied.

---

## Milestone 0 — Archive of v1

**Status:** Done

The original roadmap (`ROADMAP.md`) has been archived as
`ROADMAP-v1-archive.md`. That document used a phase-based structure (Phase 0
through Phase 7) that served the project through its initial conception and the
development of the static beta. The shift to a milestone-based format in v2
reflects the project's evolution from a website project into an AI-assisted
Civic Intelligence Platform whose architecture is organized around information
flow: Sources -> Collection -> Normalization -> AI Intelligence -> Human Review
-> Publication -> Public Platform -> Action -> Impact.

### Deliverables

- `ROADMAP.md` preserved as `ROADMAP-v1-archive.md`
- v1 content remains available for historical reference
- Decision log entry recording the structural change

---

## Milestone 1 — Foundation

**Status:** Done

**Goal:** Make the project credible, legally careful, and contribution-ready
before any major coding began. Establish the ethical, legal, and operational
boundaries that every subsequent milestone inherits.

### Deliverables

1. GitHub organization and repository initialized and configured
2. Product Requirements Document (PRD) drafted and iterated to v2.1
3. README with project identity, tagline, institutional descriptor, and status
4. CODE_OF_CONDUCT defining safe collaboration boundaries
5. CONTRIBUTING guide with role descriptions, expectations, and first-task pathways
6. GOVERNANCE document outlining founder role, core-team targets, advisory circle,
   editorial board plans, and representation/affiliation rules
7. SECURITY.md with responsible disclosure route and `security.txt`
8. Source methodology draft: source hierarchy, verification levels (0--5), legal
   status labels, evidence classification, and review gates
9. Legal language policy: genocide terminology rules, legal status labels,
   separation of content types, right of reply and corrections
10. Ethics and anti-doxing policies: no doxing, no hatred/incitement, legal
    accountability not vigilante justice, civilian protection first
11. First set of GitHub issues created for safe contributor onboarding
12. First outreach message drafted for reviewer recruitment
13. Landing page copy drafted in full (hero, tagline, Starting Focus, Core
    Modules, Safety Principles, Boundaries, Contributor CTA)
14. License structure: AGPL-3.0-or-later (code), CC BY-SA 4.0 (documentation),
    with third-party exclusions in NOTICE.md
15. AI Intelligence Architecture Addendum documenting the vision for AI-assisted
    collection, processing, and human-review workflows
16. Risk register with 14 identified risks and mitigations
17. Image and attribution policy for open-licensed and permission-cleared media

### Exclusions

- No code implementation beyond repository scaffolding
- No public deployment
- No backend or database setup
- No contributor recruitment beyond initial drafting

### Definition of Done

- [ ] A stranger can understand the project, its mission, and its safety
      boundaries in 5 minutes or less
- [ ] A volunteer can find a safe first task
- [ ] A reviewer can see and understand all safety boundaries
- [ ] No sensitive submissions are requested or accepted
- [ ] Legal terminology for genocide allegations, IHL violations, and legal
      proceedings is documented and consistent
- [ ] Ethics policies explicitly prohibit doxing, harassment, hatred,
      collective blame, and false partnership claims
- [ ] Every third-party media item has a documented license or permission

### Dependencies

- None (this is the starting milestone)

---

## Milestone 2 — Landing Page

**Status:** Done

**Goal:** Deploy a public-facing landing page that communicates the project's
mission with moral clarity, establishes visual identity, and guides visitors
into the broader platform. The landing page is the public entry point, not the
entire product.

### Deliverables

1. React/Vite foundation with TypeScript and Tailwind CSS
2. Tailwind-based design system with brand tokens:
   - Deep Ink Navy, Soft Charcoal, Warm Paper, Bone White
   - Signal Amber, Muted Clay, Trust Blue, Quiet Border Grey
   - IBM Plex Serif (headings), Inter (body), IBM Plex Mono (metadata)
3. Image-led hero with real contextual documentary image, left-aligned editorial
   text, strong layered gradients, WCAG-compliant contrast
4. Beta status notice communicating early-stage nature
5. "Why This Exists" section explaining fragmentation of evidence and civic need
6. Starting Focus section naming Gaza and the wider regional humanitarian crisis
   with full-width contextual image and right-oriented editorial copy
7. Core Modules grid explaining the five product pillars
8. Safety Principles section (civilian protection, evidence before emotion,
   moral clarity without dehumanization, source transparency, etc.)
9. Strict Boundaries section (what the platform is NOT)
10. Horizontal roadmap component with phase markers (current/next/planned)
11. Contributor CTA with specific first-task pathways
12. Full footer with navigation, legal links, and attribution link
13. Framer Motion for hero entrance, section reveals, staggered cards, and
    roadmap line/cards -- with reduced-motion support
14. Responsive behavior for mobile, tablet, and desktop breakpoints
15. Image attribution documentation (route: `/attributions`)

### Exclusions

- No static product routes beyond the landing page
- No backend, database, or API
- No public submissions or user accounts
- No analytics
- No automated email sending
- No maps or geospatial features
- No PDF generation

### Definition of Done

- [ ] Deployed preview is accessible at the project domain
- [ ] Mission is clear in under ten seconds
- [ ] Gaza focus is unmistakably stated
- [ ] No false partnerships or sensitive forms exist on the page
- [ ] Image credits are documented on `/attributions`
- [ ] Mobile, keyboard, reduced-motion, contrast, and build checks pass
- [ ] All copy uses approved legal framing (genocide terminology policy,
      legal status labels, no incitement or collective blame)
- [ ] Navigation and footer provide pathways into the broader platform

### Dependencies

- Milestone 1 (Foundation) -- policies, legal framework, and methodology
  must exist to inform landing page copy

---

## Milestone 3 — Static Product

**Status:** In Progress

**Goal:** Turn the project from a single landing page into a navigable,
credible, multi-route static beta that demonstrates the full scope of the
planned platform without backend, database, or sensitive features. Every public
route must provide value even when its final feature is not active.

### Deliverables

#### Routes

1. `/` -- Public gateway and contributor-facing landing page (complete in M2)
2. `/methodology` -- Source hierarchy, verification levels (0--5), legal
   terminology policy, genocide terminology policy, correction policy, content
   moderation, anti-doxing policy, AI-use policy, citation guide, review gates
3. `/attributions` -- Image and third-party credits with title, creator,
   source URL, license, modifications, and date added (complete in M2)
4. `/gaza-dossier` -- First crisis-dossier structure: overview, scope,
   humanitarian situation, legal status, documented-harm categories, source
   categories, policy asks preview, action routes preview, correction request
5. `/legal-tracker` -- Legal-process tracking: ICJ proceedings, ICC
   investigations and warrants, UN Commission of Inquiry findings,
   universal-jurisdiction actions, sanctions procedures, parliamentary inquiries
   -- with LegalCaseCard, LegalStatusBadge, TimelineEvent components
6. `/countries/belgium` -- First country accountability structure: federal
   position, UN/EU voting record, arms-transfer review, humanitarian aid,
   ICC/ICJ cooperation, representatives, action templates (Dutch/French/English)
7. `/institutions/european-union` -- EU accountability: Council position,
   Commission actions, Parliament resolutions, EU-Israel Association Agreement,
   arms-export competence, sanctions, MEP contact, EU petition route
8. `/organizations` -- Public-resource directory with categories (UN,
   humanitarian, medical, human-rights, documentation, journalism, civil
   society), disclaimer labels, last-reviewed dates
9. `/take-action` -- Lawful action templates and routes: contact representative,
   arms-transfer review request, humanitarian access support, dossier-to-journalist,
   correction submission, volunteer signposting
10. `/evidence` -- Evidence-library structure with source summaries, source-type
    badges, verification labels, evidence-item template, methodology links,
    filters (category, date range, source type, verification level)
11. `/press` -- Press and resources: project summary, 60-second pitch,
    methodology links, public contact, citation guide, quote policy
12. `/contribute` -- Contributor roles and pathways: developers, designers,
    researchers, legal reviewers, OSINT reviewers, security reviewers,
    accessibility reviewers, writers/translators, communications contributors

#### Static Data Files

13. `src/data/sources.ts` -- Source registry with type, URL, country,
    credibility tier, notes, last-reviewed date
14. `src/data/legalCases.ts` -- Legal cases with institution, jurisdiction,
    status, dates, source documents, action relevance
15. `src/data/organizations.ts` -- Organizations with type, website, regions,
    services, partnership status, last-verified date
16. `src/data/countries.ts` -- Countries with ISO code, region, membership
    status, position summaries
17. `src/data/actionTemplates.ts` -- Action templates with type, issue,
    template body, language, recipient type, source notes
18. `src/data/evidenceItems.ts` -- Evidence items with category, dates,
    location, verification level, source references, tags
19. `src/data/dossierTemplates.ts` -- Dossier type definitions and structure
20. `src/data/navigation.ts` -- Navigation hierarchy for desktop and mobile
21. `src/data/roadmap.ts` -- Roadmap phases with status and descriptions

#### Shared Components

22. `PageIntro` -- Consistent section introduction with optional status badge
23. `PageStatusNotice` -- Status labels (Static preview, Source pending,
    Legal wording review needed, Correction welcome)
24. `PreviewNotice` -- Explains what the page will become, what is available
    now, what is intentionally not active, and how contributors can help
25. `Badge` -- Reusable status badge component
26. `Card` -- Document/evidence-style card with quiet borders and mono labels
27. `Container` -- Consistent layout container
28. `Reveal` -- Scroll-reveal wrapper with reduced-motion support
29. `SectionHeading` -- Consistent section heading pattern
30. `SourceList` -- Source reference list with links and archive references
31. `VerificationBadge` -- Level-0 through Level-5 verification display
32. `LegalStatusBadge` -- Legal process status indicator
33. `CorrectionLink` -- Correction submission link with category selection
34. `LastUpdated` -- Date and version display for reviewed pages
35. `EvidenceItemCard` -- Evidence item card with verification badge
36. `LegalCaseCard` -- Legal case card with status badge and timeline
37. `OrganizationCard` -- Organization entry with disclaimer
38. `ActionCard` -- Action template card with copy-to-clipboard
39. `CountryIndexCard` -- Country index card
40. `InstitutionIndexCard` -- Institution index card

### Exclusions

- No database or API
- No admin CMS or authentication
- No public evidence or witness submissions
- No PDF generation (static dossier page structure only)
- No public maps or geospatial features
- No donation handling
- No user accounts
- No automated email sending
- No AI publication workflows
- No action tracking tied to identity
- No scoring or rankings on country/institution pages

### Definition of Done

- [ ] All 12 static routes (including `/` and `/attributions`) are active and
      work without console errors
- [ ] No dead placeholder pages: every route explains what it will become, why
      it matters, what is available now, and what is intentionally not active
- [ ] All routes are responsive at mobile, tablet, and desktop breakpoints
- [ ] All routes pass keyboard navigation and reduced-motion checks
- [ ] All copy uses safe legal framing with appropriate review labels
- [ ] Every factual claim has a source or is clearly labeled as draft/preview
- [ ] Source and methodology links are present on relevant pages
- [ ] No false partnership claims: organizations are listed as "public resource"
      unless written confirmation exists
- [ ] No doxing, unsafe links, or sensitive personal data
- [ ] Image attribution is complete on `/attributions`
- [ ] Footer includes legal, safety, and attribution links
- [ ] Build, type-check, and lint pass
- [ ] No backend, database, or sensitive feature is required to serve any route
- [ ] At least 9 static data files exist with TypeScript interfaces

### Dependencies

- Milestone 2 (Landing Page) -- design system, component patterns, and
  deployment pipeline serve as foundation

---

## Milestone 4 — Intelligence Layer

**Status:** Planned

**Goal:** Transform Arbor Sentinel from a static information site into an
AI-assisted civic intelligence platform. Build a pipeline that ingests public
sources, normalizes them into structured data, applies AI processing
(translation, summarization, entity extraction, classification, relationship
detection), routes results through human review, and surfaces intelligence
through dashboards, geospatial views, and knowledge graphs.

This is the heart of the v2 architecture. The architecture follows the
information flow:

```
Sources -> Collection -> Normalization -> AI Intelligence ->
Human Review -> Publication -> Public Platform -> Action -> Impact
```

AI never publishes automatically. Human review is mandatory. Every public claim
is source-backed. Every edit is versioned. Every correction is transparent.

### M4.0 — Architecture Principles (applies to all sub-milestones)

1. **Human-in-the-loop:** AI output is never published without human review.
   The review states are: New -> Reviewing -> Approved -> Published.
2. **Source transparency:** Every processed item retains links to original
   sources. No AI-generated claim is presented without source traceability.
3. **Versioning:** Every change to processed data is versioned and auditable.
4. **Correction-enabled:** Every published item has a correction pathway.
5. **Minimal collection:** Collect only what is needed. Do not hoard data.
6. **Safety by design:** No sensitive personal data enters the pipeline without
   explicit policy review. Location precision is controlled at every stage.
7. **Confidence estimation:** Every AI-generated extraction, classification, or
   relationship includes a confidence score. Low-confidence items are flagged
   for mandatory human review before they can enter the publication pipeline.

---

### M4.1 — Collector Framework

**Status:** Planned

**Goal:** Build the SDK and infrastructure for collecting, validating,
normalizing, deduplicating, and storing public-source data. Each collector is
an independent module that follows a common pipeline: Fetch -> Validate ->
Normalize -> Deduplicate -> Store.

#### Deliverables

1. **Base Collector class/interface** defining the standard pipeline contract:
   - `fetch()` -- retrieve raw data from source
   - `validate()` -- check structure, freshness, integrity
   - `normalize()` -- convert to canonical schema
   - `deduplicate()` -- check against existing stored items
   - `store()` -- persist to data layer
   - `collect()` -- orchestrate the full pipeline
   - Error handling, retry logic, rate-limit awareness, timeout configuration

2. **Collector Registry** -- central registry where all collectors register
   their identity, source URL, schedule, status, and health endpoint.
   - `CollectorRegistry` class with `register()`, `unregister()`, `get()`,
     `list()`, `healthCheck()` methods
   - Auto-discovery of collectors by convention

3. **Source Registry data model and UI**
   - Data model: `Source` with fields for id, name, type, url, country,
     credibility tier, feed URL, collector ID, last collected, health status,
     notes
   - UI: `/sources` route with registry listing, source detail pages,
     health indicators, last-collected timestamps
   - Source categories: Court/legal, UN, Humanitarian org, Human-rights org,
     Journalism, Academic, Government, Open data

4. **Feed Registry** -- for RSS/Atom-based collectors:
   - Feed URL validation and polling interval configuration
   - Feed health monitoring (last successful poll, error count, feed staleness)
   - Automatic feed discovery where supported

5. **Source monitoring and health checks**
   - Periodic health checks for each registered source
   - Health status: Healthy, Degraded, Unreachable, Unauthorized, Unknown
   - Alerting on repeated failures or stale data
   - Health dashboard (see M4.4)

6. **Individual collectors** (each implements the base collector interface):

   | Collector | Source type | Data collected |
   |---|---|---|
   | ICJ | Court/legal | Case dockets, orders, judgments, press releases |
   | ICC | Court/legal | Case information, warrants, proceedings, rulings |
   | OHCHR | UN | Reports, statements, findings, press briefings |
   | OCHA | UN | Humanitarian situation reports, funding updates, data |
   | EU | Government | Council decisions, Commission statements, Parliament
     resolutions, sanctions listings |
   | Belgium Government | Government | Federal positions, parliamentary records,
     foreign ministry statements, arms-export data |
   | Amnesty International | NGO | Reports, legal determinations, press releases |
   | Human Rights Watch | NGO | Reports, analysis, press releases |
   | B'Tselem | NGO | Reports, testimony summaries, data |
   | Medecins Sans Frontieres | NGO | Medical access reports, operational updates |
   | Journalism (aggregator) | Journalism | Curated RSS of verified outlets |
   | Academic (aggregator) | Academic | SSRN, academia.edu, institutional papers |
   | Open Data (aggregator) | Open data | Public datasets, government open data |

7. **Data normalization schemas** for each collector output type:
   - `NormalizedSource` -- common fields for all collected items
   - `NormalizedReport` -- report/update structure
   - `NormalizedLegalDocument` -- court/legal filing structure
   - `NormalizedStatement` -- official statement structure
   - `NormalizedDataPoint` -- structured data point (vote, resolution, etc.)

8. **Error handling and retry policies:**
   - Exponential backoff for transient failures
   - Circuit breaker for persistent failures
   - Dead-letter queue for items that fail normalization
   - Structured error logging with source and collector attribution

9. **Rate limiting and responsible collection:**
   - Configurable per-source rate limits
   - Respect for `robots.txt` and API terms of service
   - Caching layer to avoid redundant fetches

#### Definition of Done (M4.1)

- [ ] Base collector interface is defined with typed pipeline methods
- [ ] Collector Registry is implemented and functional
- [ ] Source Registry data model is defined with all required fields
- [ ] Source Registry UI exists at `/sources` with listing and detail views
- [ ] Feed Registry supports RSS/Atom polling with health tracking
- [ ] Source health checks run on a configurable schedule with status reporting
- [ ] At least 5 individual collectors are implemented (ICJ, ICC, OHCHR, OCHA,
      Amnesty)
- [ ] Normalization schemas exist for all collector types
- [ ] Error handling, retry, circuit-breaker, and dead-letter queue are
      implemented
- [ ] Rate limiting is configured per source
- [ ] All collectors register themselves in the Collector Registry on startup

#### Dependencies (M4.1)

- Milestone 3 (Static Product) -- existing data models and UI patterns serve as
  the target schemas and display layer
- M4.1 can begin in parallel with Milestone 3 final review

---

### M4.2 — AI Pipeline

**Status:** Planned

**Goal:** Build the AI processing pipeline that transforms raw collected data
into structured, queryable intelligence. Each processing step operates on the
output of the Collector Framework and produces enriched data for the Review
Queue. Every output includes confidence estimation. Low-confidence results are
flagged for mandatory human review.

#### Deliverables

1. **Language detection**
   - Detect source document language using statistical and ML methods
   - Output: language code (ISO 639-1) with confidence score
   - Fallback: character-set analysis for documents without clear language
     markers
   - Support for: English, Arabic, Dutch, French, Spanish, German, Hebrew,
     Russian, Turkish, Persian (Farsi)
   - Items below confidence threshold (e.g., < 0.85) flagged for human review

2. **Translation pipeline**
   - AI drafts translations of source content
   - Translation memory to avoid re-translating identical or near-identical
     passages
   - Preserve source language alongside translation
   - Track translation version, model, and human reviewer
   - High-risk content (legal findings, casualty figures, witness accounts)
     requires human review before any use
   - Low-risk content (general reporting, public statements) may proceed with
     spot-check review
   - Language pair priority: Arabic -> English, Dutch -> English, French ->
     English, Spanish -> English, German -> English, Hebrew -> English

3. **Summarization engine**
   - Generate concise, source-faithful summaries of reports, legal documents,
     and statements
   - Multi-length support: one-paragraph, three-paragraph, bullet-point
   - Preserve key dates, numbers, locations, named entities, and legal
     terminology
   - Flag content that exceeds confidence thresholds for human review
   - Version each summary with model identifier and generation parameters
   - Store original alongside summary for comparison

4. **Entity extraction**
   - Extract named entities: people, organizations, locations, dates,
     nationalities, legal instruments, treaties, resolutions
   - Link extracted entities to existing knowledge graph entries (see M4.6)
   - Disambiguation where possible (e.g., "Geneva" as location vs. "Geneva
     Conventions")
   - Confidence score per entity
   - Output: structured entity list with type, value, position in source text,
     confidence, and linked knowledge graph ID (if available)

5. **Claim extraction**
   - Extract factual claims from source text
   - Classify claims by type: legal finding, humanitarian condition, policy
     position, allegation, statistical claim, timeline event
   - Link each claim to its source sentence(s) and source document
   - Confidence score per claim
   - Claims below threshold flagged for human verification

6. **Timeline extraction**
   - Extract dated events from documents
   - Normalize date formats to ISO 8601
   - Resolve relative dates ("last week", "three days ago") to absolute dates
     based on document publication date where possible
   - Link events to extracted entities and claims
   - Output: structured timeline entries with date, event description, source,
     confidence

7. **Geographic extraction (GeoJSON from text)**
   - Extract location mentions from text
   - Geocode named locations to coordinates where publicly known and safe
   - Generate GeoJSON features for locations
   - Location precision levels: Country -> Region -> City -> District ->
     Informal area (never exact residential coordinates)
   - Flag sensitive location types for safety review before geocoding
   - Confidence per extracted location

8. **Relationship detection**
   - Detect relationships between extracted entities
   - Relationship types: Person->Organization, Country->Action,
     Institution->LegalCase, Organization->Location, Person->Role
   - Temporal relationships: Event A before Event B, Event A caused Event B
   - Hierarchical relationships: Institution A is part of Institution B
   - Confidence per relationship

9. **Topic classification**
   - Classify documents and extracted items into topic taxonomy
   - Primary topics: Civilian casualties, Humanitarian access, Legal
     proceedings, Arms transfers, Diplomacy, Sanctions, Displacement,
     Medical infrastructure, Education, Cultural heritage, Detention,
     Freedom of expression
   - Multi-label classification (a document may belong to multiple topics)
   - Confidence per topic label
   - Custom topic taxonomy aligned with product pillars

10. **Duplicate detection**
    - Identify near-duplicate content across sources
    - Methods: text fingerprinting, semantic similarity, URL normalization,
      cross-reference matching
    - Output: duplicate groups with confidence scores
    - Flag for deduplication in the Review Queue
    - Configurable sensitivity threshold

11. **Contradiction detection**
    - Identify contradictory claims across sources or within a single source
    - Track contradictions between: official statements vs. documented events,
      different institutional sources, different time periods, earlier vs.
      corrected positions
    - Output: contradiction pairs with confidence score and source attribution
    - Flagged for human review: contradictions require editorial judgment

12. **Confidence estimation**
    - Every AI output includes a calibrated confidence score (0.0 -- 1.0)
    - Confidence thresholds are configurable per processing step and per
      content type
    - Items below threshold are automatically routed to human review
    - Items above threshold may proceed to human spot-check based on risk
      classification
    - Confidence calibration is logged and periodically reviewed

#### Definition of Done (M4.2)

- [ ] Language detection covers all 10 target languages with confidence scoring
- [ ] Translation pipeline produces drafts with source preservation and version
      tracking
- [ ] Summarization engine produces one-paragraph and three-paragraph summaries
      with source faithfulness checks
- [ ] Entity extraction identifies people, organizations, locations, and dates
      with disambiguation
- [ ] Claim extraction surfaces factual claims with type classification
- [ ] Timeline extraction produces dated event entries in ISO 8601 format
- [ ] Geographic extraction generates GeoJSON features with precision controls
- [ ] Relationship detection links entities across multiple types
- [ ] Topic classification covers the full taxonomy with multi-label support
- [ ] Duplicate detection identifies near-duplicates with configurable
      thresholds
- [ ] Contradiction detection flags contradictory claims with source attribution
- [ ] Confidence estimation is implemented across all AI processing steps
- [ ] Items below confidence threshold are routed to mandatory human review
- [ ] Every AI output includes model/version metadata and confidence scores

#### Dependencies (M4.2)

- M4.1 (Collector Framework) -- AI pipeline processes collector output; can
  begin once individual collectors exist for testing
- M4.3 (Review Queue) -- AI output routes to review; parallel design possible

---

### M4.3 — Review Queue System

**Status:** Planned

**Goal:** Build the human review infrastructure that sits between AI processing
and publication. Every item must pass through a defined review workflow before
it can be published. The review queue manages assignment, tracking, and
escalation across multiple reviewer roles.

#### Deliverables

1. **Review Queue data model**
   - `ReviewItem` -- core entity with fields for id, source item, AI output
     (translation, summary, entities, etc.), review status, assigned reviewer,
     review history, priority, risk classification
   - `ReviewStatus` enum: New, In Review, Changes Requested, Approved,
     Published, Rejected, Archived
   - `ReviewAssignment` -- links reviewers to items with assignment date,
     deadline, notes
   - `ReviewAction` -- log entry for each status change, comment, or correction

2. **Review Queue UI**
   - Queue listing with filters by status, role, source, date, priority
   - Detail view showing source item, AI outputs, current status, review
     history, and action buttons
   - Side-by-side comparison of AI output vs. source original
   - Batch operations for approved items
   - Search across the review queue

3. **Assignment workflow**
   - Automatic assignment based on reviewer role and availability
   - Manual assignment by senior reviewers or admins
   - Reassignment with audit trail
   - Workload balancing across reviewers
   - Deadline tracking and escalation for overdue items

4. **Role-based review workflows** (each with specific review criteria):

   | Review role | What they review | Review criteria |
   |---|---|---|
   | Legal review | Legal findings, court summaries, legal status labels | Accuracy of legal terminology, correct procedural status,
     proper attribution of legal determinations to the issuing body,
     no conflation of allegation with judgment |
   | Translation review | AI-generated translations | Accuracy, fluency, preservation of legal terminology,
     appropriate register for target audience |
   | Editorial review | Summaries, claims, entity extractions, topic
     classifications | Faithfulness to source, clarity, tone, adherence to
     brand voice, no editorializing, no dehumanizing language |
   | Country review | Country position summaries, voting records,
     arms-transfer data | Accuracy of policy representation, correct sourcing,
     up-to-date information, no misleading framing |
   | Institution review | Institution position summaries, resolutions,
     statements | Same as country review, applied to institutional entities |
   | Source verification | Source identity, provenance, credibility tier | Source URL is valid and links to authentic content,
     publication date is correct, source organization is legitimate,
     no manipulation or misattribution |
   | Evidence review | Evidence items, verification level assignments | Correct categorization, appropriate verification level,
     all source references are functional, no unsafe personal data,
     correction path is attached |

5. **Review states and transitions:**
   - New (unassigned) -> In Review (assigned)
   - In Review -> Changes Requested (returned to AI or drafter)
   - In Review -> Approved (ready for publication)
   - Changes Requested -> In Review (resubmitted)
   - Approved -> Published (published to public platform)
   - Any state -> Rejected (with reason)
   - Published -> Archived (superseded or withdrawn)
   - Published -> Correction Published (correction issued)

6. **Correction workflow**
   - Correction submission form (public, no authentication required)
   - Correction review queue (separate from main review queue)
   - Correction categories: factual error, outdated source, wrong
     location/date, unsafe personal information, mistranslation, legal wording
     issue, broken link, duplicate, misleading framing
   - Correction resolution: Accept (publish correction and update item),
     Accept (publish correction and archive item), Reject (with explanation),
     Escalate (to senior reviewer)
   - Public correction log for major corrections

7. **Priority and risk classification**
   - Risk levels: Low, Medium, High, Critical
   - High-risk content requires mandatory legal review: casualty figures,
     atrocity allegations, legal findings, witness accounts, sensitive locations
   - Critical items trigger notification to senior reviewers
   - Priority levels: Standard, High, Urgent (for time-sensitive content)

8. **Reviewer dashboard**
   - My Queue: assigned items with status and deadline
   - My Activity: review history with actions taken
   - My Stats: items reviewed, average review time, approval rate
   - Available items claim queue for self-assignment

#### Definition of Done (M4.3)

- [ ] Review Queue data model is defined and implemented
- [ ] Review Queue UI is functional with listing, detail, and action views
- [ ] Assignment workflow supports automatic and manual assignment with
      reassignment and audit trail
- [ ] All 7 review roles have defined workflows with specific review criteria
- [ ] Review state machine correctly handles all defined transitions
- [ ] Correction workflow accepts public submissions and routes to appropriate
      reviewers
- [ ] Priority and risk classification are functional with mandatory legal
      review for high-risk items
- [ ] Reviewer dashboard shows personal queue, activity, and stats
- [ ] All status changes are logged in the audit trail
- [ ] No item can reach Published status without passing through the correct
      review workflow for its risk level

#### Dependencies (M4.3)

- M4.2 (AI Pipeline) -- review queue processes AI output; can be designed in
  parallel but requires AI output schema for implementation
- M4.4 (Intelligence Dashboard) -- shares UI components and data layer

---

### M4.4 — Intelligence Dashboard

**Status:** Planned

**Goal:** Build the admin dashboard for monitoring AI pipeline health, source
collection status, review queue metrics, and data quality indicators. This is
an operational tool for project maintainers and reviewers, not a public-facing
feature.

#### Deliverables

1. **AI Pipeline monitoring dashboard**
   - Pipeline visualization showing each processing stage (Collect -> Parse ->
     Translate -> Summarize -> Extract -> Classify -> Review)
   - Per-stage metrics: items processed, success rate, average processing time,
     error rate, queue depth
   - Processing volume charts (items/hour, items/day)
   - Error breakdown by type and source
   - Model performance metrics (latency, confidence score distribution)

2. **Source health dashboard**
   - Source registry listing with health status indicators
   - Per-source metrics: last successful collection, collection success rate,
     items collected, error count, feed staleness
   - Health score aggregate across all sources
   - Source collection timeline/history
   - Add/edit source interface (admin only)

3. **Review Queue metrics dashboard**
   - Queue overview: total items, by status (New, In Review, Approved,
     Published), by role
   - Review velocity: items reviewed per day/week, average time in queue,
     average review time
   - Reviewer performance (aggregate, anonymous): items reviewed, approval
     rate, average review time
   - Bottleneck identification: stages with longest queue times
   - SLA tracking: items exceeding target review time

4. **Data quality metrics dashboard**
   - Verification level distribution across evidence items
   - Source credibility tier distribution
   - Coverage gaps: countries, topics, source types with low coverage
   - Duplicate rate
   - Contradiction resolution rate
   - Broken link rate
   - Correction volume and resolution rate
   - Staleness: items not reviewed within target interval

5. **System health dashboard**
   - Uptime monitoring
   - Error rate tracking
   - Storage utilization
   - API response times
   - Rate limit utilization
   - Scheduler/job status

6. **Alert configuration**
   - Configurable thresholds for: collection failure rate, queue backlog,
     processing error rate, source staleness, storage capacity
   - Alert channels: in-app notification, email (admin only)
   - Alert history and acknowledgement tracking

#### Definition of Done (M4.4)

- [ ] AI Pipeline monitoring dashboard shows all processing stages with
      per-stage metrics
- [ ] Source health dashboard displays all registered sources with health
      status and collection metrics
- [ ] Review Queue metrics dashboard shows queue overview, velocity, and
      bottleneck identification
- [ ] Data quality metrics dashboard covers verification distribution,
      coverage gaps, duplicate rate, and correction resolution
- [ ] System health dashboard tracks uptime, errors, storage, and API
      performance
- [ ] Alert configuration supports threshold-based triggering with in-app
      notifications
- [ ] All dashboards are accessible only to authenticated admin users
- [ ] Dashboard data refreshes on a configurable schedule (real-time not
      required)

#### Dependencies (M4.4)

- M4.1 (Collector Framework) -- source health data
- M4.2 (AI Pipeline) -- pipeline performance data
- M4.3 (Review Queue) -- review metrics data
- Milestone 5 (Backend) -- persistent storage for dashboard data

---

### M4.5 — Maps and Geospatial

**Status:** Planned

**Goal:** Add geospatial context to the platform using curated public data.
Display events, sources, organizations, legal proceedings, infrastructure, and
humanitarian conditions on interactive maps. Never expose exact sensitive
locations. All spatial data is reviewed before publication.

#### Deliverables

1. **MapLibre GL integration**
   - MapLibre GL JS as the primary map rendering library
   - OpenStreetMap tile layer (or approved alternative)
   - Custom map style aligned with brand direction (restrained, informative,
     not militaristic)
   - RTL support for Arabic and Hebrew map labels
   - Offline-capable tile caching where feasible

2. **GeoJSON data pipeline**
   - GeoJSON as the standard data format for all geospatial data
   - FeatureCollection types: Event, Source, Organization, Legal, Infrastructure,
     Humanitarian
   - Each Feature includes: geometry (Point, Polygon, MultiPolygon), properties
     (name, type, date, source, verification level, precision level)
   - Precision controls: Country -> Region -> City -> District -> Informal area
     (never exact residential coordinates, shelter locations, or safe routes)
   - Automated precision stripping for sensitive feature types
   - Source attribution attached to each feature

3. **Event layer**
   - Documented harm events: civilian casualties, infrastructure damage,
     attacks on medical/education facilities, displacement events
   - Filterable by date, category, verification level, source
   - Displayed only after human review and safety check
   - Cluster markers for high-density areas with zoom-dependent detail
   - Popup with event summary, date, source link, and verification badge

4. **Source layer**
   - Geographic locations of source organizations: UN offices, NGO headquarters,
     court locations, institutional presences
   - Public office locations only (not residential or sensitive operational
     locations)
   - Organization type icons/categorization

5. **Organization layer**
   - Humanitarian organization operational presences (country/region level only)
   - No exact field office locations that could compromise safety
   - Link to organization detail pages

6. **Legal layer**
   - Jurisdiction visualization: ICJ, ICC, national courts with case markers
   - Case status indicators (active, pending, concluded)
   - Link to legal tracker entries

7. **Infrastructure layer**
   - Documented infrastructure: hospitals, schools, water facilities, cultural
     heritage sites
   - Status indicators (functional, damaged, destroyed, at risk)
   - Source attribution for each infrastructure item
   - Reviewed before publication

8. **Humanitarian layer**
   - Humanitarian access indicators
   - Aid delivery status by region
   - Food insecurity levels (from public sources like IPC)
   - Displacement patterns (generalized, not individual tracking)
   - Source attribution for all data

9. **Timeline integration**
   - Map responds to timeline filtering: events on the map update as the
     timeline range changes
   - Animated timeline playback for sequential event visualization
   - Date range slider linked to map layers

10. **Safety controls**
    - No exact sensitive locations: residential addresses, shelter coordinates,
      safe routes, operational field offices
    - Location precision is determined by location type and review status
    - Precision stripping is automated for known sensitive categories
    - Safety review gate before any location is published with sub-city precision
    - Configurable precision by context (e.g., general region for civilian
      casualties, city level for infrastructure damage)
    - Clear methodology page explaining location precision policy

11. **Map interaction patterns**
    - Click feature -> popup with summary and link to detail
    - Hover feature -> highlight and tooltip
    - Layer toggle control
    - Zoom-dependent feature detail
    - Full-screen map view
    - Print-friendly static map export (later)

12. **Accessibility**
    - Keyboard navigation for map controls
    - Feature data available in non-map formats (table, list) for screen reader
      users
    - Alt text for static map views
    - Focus management for popup interactions

#### Definition of Done (M4.5)

- [ ] MapLibre GL renders with OpenStreetMap tiles and custom brand styling
- [ ] GeoJSON pipeline produces typed FeatureCollections with precision controls
- [ ] Event, Source, Organization, Legal, Infrastructure, and Humanitarian
      layers are implemented with toggle controls
- [ ] Timeline integration synchronizes map layers with date range selection
- [ ] Safety controls prevent display of exact sensitive locations
- [ ] Location precision policy is documented on the methodology page
- [ ] All map features include source attribution and verification badges
- [ ] Map interaction patterns (click, hover, zoom, layer toggle) are functional
- [ ] Accessibility: keyboard navigation, non-map alternative views, alt text
- [ ] No unreviewed locations are displayed on public maps

#### Dependencies (M4.5)

- M4.2 (AI Pipeline) -- geographic extraction produces GeoJSON from text
- M4.3 (Review Queue) -- location data must pass review before publication
- Milestone 3 (Static Product) -- existing data models provide feature
  properties

---

### M4.6 — Knowledge Graph

**Status:** Planned

**Goal:** Build a knowledge graph that connects sources, claims, evidence,
events, countries, institutions, people, organizations, legal cases, and
actions into a navigable, queryable structure. Enable users and reviewers to
explore relationships between entities and understand the full context of any
item.

#### Deliverables

1. **Knowledge Graph data model**
   - Node types: Source, Claim, Evidence, Event, Country, Institution, Person,
     Organization, LegalCase, Action
   - Edge/relationship types:
     - Source -> Claim (reports, contains)
     - Source -> Evidence (provides)
     - Claim -> Evidence (supports, contradicts)
     - Event -> Country (occurs_in)
     - Event -> Claim (is_about)
     - Country -> Institution (has_member, has_observer)
     - Institution -> LegalCase (is_party_to, is_hearing)
     - Person -> Organization (member_of, leads, represents)
     - Person -> LegalCase (is_named_in, is_witness_to)
     - Organization -> Action (provides, supports)
     - LegalCase -> Action (enables, requires)
     - Source -> Source (cites, corrects, updates)
     - Claim -> Claim (contradicts, supports, supersedes)
   - Each edge has: type, source reference, confidence score, date range (where
     applicable), review status, human review notes

2. **Graph database integration**
   - Evaluation: RDF triple store vs. labeled property graph (Neo4j/Lite) vs.
     relational adjacency model in PostgreSQL
   - Decision recorded in architecture decision log
   - If PostgreSQL: adjacency table pattern with recursive queries
   - If dedicated graph DB: connection pooling, query interface, backup strategy

3. **Graph visualization**
   - Force-directed graph visualization for entity exploration
   - Node type icons and colors for visual distinction
   - Zoom and pan controls
   - Click node -> expand connections, show detail panel
   - Filter by node type, relationship type, date range, confidence
   - Search within graph
   - Focus view on single entity with all direct connections
   - Path finding between two entities

4. **Entity detail panels**
   - For each node type: summary view with key properties
   - Connected entities listed with relationship type
   - Timeline of related events
   - Sources linked to the entity
   - Actions associated with the entity
   - Correction and version history

5. **Relationship navigation**
   - Breadcrumb trail for graph exploration
   - "Related" sections on existing detail pages (evidence, legal case, country,
     organization)
   - Cross-linking between entity types throughout the platform UI
   - Relationship search: "Show all connections between Country X and Legal
     Case Y"

6. **Search integration**
   - Knowledge graph search across all node types and relationship types
   - Faceted search by node type, date range, relationship type, confidence
   - Search results display relationship context

7. **Graph updates and versioning**
   - New items from the AI pipeline create or update nodes and edges
   - Relationship changes are versioned
   - Human reviewers can add, modify, or remove relationships
   - All changes logged in the audit trail

8. **Relationship confidence display**
   - Relationships from AI extraction show confidence scores
   - Human-confirmed relationships are marked as reviewed
   - Low-confidence relationships are visually distinct
   - Unreviewed relationships are not used in public-facing pathfinding

#### Definition of Done (M4.6)

- [ ] Knowledge Graph data model defines all node and edge types with their
      properties
- [ ] Graph storage backend is selected and implemented
- [ ] Graph visualization renders force-directed layouts with node type
      differentiation
- [ ] Entity detail panels show complete entity information with connected
      entities
- [ ] Relationship navigation provides breadcrumbs, cross-links, and path
      finding
- [ ] Search across knowledge graph is functional with faceted filtering
- [ ] Graph updates from AI pipeline create and update nodes/edges with
      versioning
- [ ] Human reviewers can modify relationships with audit trail
- [ ] Confidence scores are displayed for AI-extracted relationships
- [ ] Unreviewed relationships are not used in public-facing context

#### Dependencies (M4.6)

- M4.2 (AI Pipeline) -- entity extraction, relationship detection, and
  claim extraction produce the nodes and edges
- M4.3 (Review Queue) -- relationships require review
- M4.5 (Maps and Geospatial) -- geospatial entities link into the graph
- Milestone 5 (Backend) -- graph storage persistence

---

### M4.7 — Testing, Documentation, and Monitoring

**Status:** Planned

**Goal:** Ensure the Intelligence Layer is reliable, documented, testable, and
monitorable before it processes data for public use. Every component must have
tests, documentation, and operational monitoring.

#### Deliverables

1. **Unit tests for Collector Framework**
   - Test base collector pipeline with mock sources
   - Test normalization for each collector type
   - Test deduplication logic
   - Test error handling, retry, and circuit breaker
   - Test Collector Registry operations
   - Test Feed Registry polling and health tracking

2. **Unit tests for AI Pipeline**
   - Test language detection against known samples for all 10 languages
   - Test translation pipeline with round-trip verification where feasible
   - Test summarization for faithfulness, length, and key-information retention
   - Test entity extraction against annotated corpora
   - Test claim extraction against known claim types
   - Test timeline extraction with relative date resolution
   - Test geographic extraction with known locations
   - Test relationship detection against known relationships
   - Test topic classification against labeled documents
   - Test duplicate detection with known duplicates and near-duplicates
   - Test contradiction detection with known contradictions
   - Test confidence estimation calibration

3. **Unit tests for Review Queue**
   - Test state machine transitions for all valid and invalid transitions
   - Test assignment workflow
   - Test role-based access controls
   - Test correction submission and processing

4. **Unit tests for Maps and Geospatial**
   - Test precision stripping for sensitive location types
   - Test GeoJSON generation and validation
   - Test layer filtering and combining

5. **Unit tests for Knowledge Graph**
   - Test node and edge creation
   - Test relationship queries
   - Test path finding
   - Test search indexing

6. **Integration tests**
   - End-to-end: Source -> Collect -> Normalize -> AI Process -> Review Queue
     -> Approve -> Publish
   - Test cross-component data flow
   - Test error propagation across pipeline stages
   - Test concurrent processing

7. **Documentation**
   - Collector Framework developer guide
   - AI Pipeline configuration guide
   - Review Queue operator guide
   - Dashboard user guide
   - Knowledge Graph schema reference
   - Map layer configuration guide
   - API reference for any new endpoints
   - Architecture decision records for key design choices
   - Operational runbook for common issues

8. **Operational monitoring**
   - Prometheus metrics for pipeline performance
   - Structured logging (JSON) across all components
   - Grafana dashboards for operational monitoring
   - Error budget tracking
   - SLO definition and monitoring
   - On-call runbook for pipeline failures

9. **Performance testing**
   - Load testing for collector concurrent operation
   - AI pipeline throughput testing
   - Review queue UI responsiveness under load
   - Map rendering performance with large feature sets
   - Knowledge graph query performance with large datasets

10. **Security testing**
    - Dependency scanning
    - Secrets detection in collector configurations
    - Access control testing for review queue and dashboards
    - Input validation for correction submissions
    - Rate limit effectiveness testing

#### Definition of Done (M4.7)

- [ ] Unit tests exist for Collector Framework with > 80% coverage
- [ ] Unit tests exist for AI Pipeline components with > 70% coverage (some
      AI components may be difficult to unit test exhaustively)
- [ ] Unit tests exist for Review Queue state machine and assignment workflow
- [ ] Integration tests cover the full pipeline from collection to publication
- [ ] Documentation exists for all major components
- [ ] Prometheus metrics and structured logging are implemented
- [ ] Performance tests show acceptable throughput for projected data volumes
- [ ] Security tests pass with no critical or high findings
- [ ] Architecture decision records document key design decisions

#### Dependencies (M4.7)

- M4.1 through M4.6 -- testing and documentation are developed alongside and
  after component implementation; this milestone verifies and completes them

---

## Milestone 5 — Backend

**Status:** Planned

**Goal:** Design and implement the Supabase/PostgreSQL backend based on what
the static beta and Intelligence Layer have revealed about data models, query
patterns, and access requirements. This is not a speculative database design:
it is driven by actual usage from the static product and the Intelligence Layer
pipeline.

### Deliverables

1. **Database schema from M4 learnings**
   - Tables: sources, evidence_items, evidence_references, countries,
     country_positions, actions, organizations, legal_cases, dossiers,
     corrections, content_versions, review_assignments, audit_logs,
     translations, organization_relationships, country_votes,
     official_statements, arms_transfer_records, page_sources
   - Migrate static TypeScript data into database tables
   - Data validation constraints at the database level
   - Foreign key relationships with cascade rules
   - Indexes for query patterns observed in static beta

2. **Row-Level Security (RLS)**
   - Public read policies for published content
   - Admin write policies with role-based restrictions
   - Draft/preview visibility policies
   - Correction submission insert policy (public, no authentication required)
   - Audit log insert policies

3. **Admin authentication and 2FA**
   - Supabase Auth or equivalent authentication provider
   - Admin role management (admin, moderator, reviewer, contributor)
   - Two-factor authentication for admin and reviewer roles
   - Session management and timeout policies
   - Offboarding procedure for role revocation

4. **Public read APIs**
   - `GET /api/v1/evidence` -- list with filtering, pagination, search
   - `GET /api/v1/evidence/:slug` -- single evidence item with references
   - `GET /api/v1/countries` -- list with region/membership filtering
   - `GET /api/v1/countries/:slug` -- country detail with positions
   - `GET /api/v1/actions` -- list with country/issue/type filtering
   - `GET /api/v1/organizations` -- list with type/region filtering
   - `GET /api/v1/legal-cases` -- list with institution/status filtering
   - `GET /api/v1/dossiers/:slug` -- dossier detail
   - Versioned routes (`/api/v1/...`)
   - OpenAPI/Swagger documentation
   - Rate limiting (configurable per endpoint)

5. **Correction submission API**
   - `POST /api/v1/corrections` -- public correction submission
   - Validation: target_type, target_id, reason, message required
   - Rate limiting per IP/submission
   - Spam protection (honeypot field, content filtering)
   - Confirmation mechanism (no email required at minimum)

6. **Document storage**
   - Supabase Storage or equivalent for document assets
   - Public documents: methodology PDFs, image assets with attribution
   - Admin-only: review documents, collector configurations
   - File type restrictions and size limits
   - Virus scanning for uploaded content

7. **Postgres full-text search**
   - Search indexes on evidence_items, countries, actions, organizations,
     legal_cases
   - Weighted search (title > summary > body)
   - Language-specific text search configurations (English, Dutch, French,
     Arabic planned)
   - Search results with relevance ranking
   - Search-as-you-type for admin interfaces

8. **PostGIS for spatial queries**
   - PostGIS extension enabled
   - Geometry columns on evidence_items, locations, country boundaries
   - Spatial queries: find items within region, distance-based filtering
   - Coordinate system: WGS 84 (EPSG:4326)
   - Precision controls enforced at query level

9. **Audit logging**
   - Automatic audit log inserts for: content creation, content update,
     content deletion, status changes, publication actions, correction
     resolutions, role changes, authentication events
   - Audit log fields: timestamp, actor, action type, target type, target ID,
     summary of change, previous state (where applicable)
   - Audit log retention policy
   - Audit log query interface (admin only)
   - No sensitive personal data in audit logs

10. **Backups and recovery**
    - Automated daily database backups
    - Point-in-time recovery configuration
    - Backup retention policy (daily: 30 days, weekly: 6 months, monthly: 2 years)
    - Backup encryption
    - Recovery procedure documentation
    - Periodic recovery testing

### Exclusions

- No public user accounts or registration
- No general-public authentication
- No automated email sending infrastructure
- No real-time collaboration features
- No vector database (evaluated later if needed)

### Definition of Done

- [ ] Database schema is implemented with all required tables, constraints, and
      indexes based on M4 learnings
- [ ] Static TypeScript data is migrated to database tables
- [ ] Row-Level Security is configured with public read and admin write policies
- [ ] Admin authentication with 2FA is functional for admin/reviewer roles
- [ ] Public read APIs are documented and deployed for all major entity types
- [ ] Correction submission API accepts and validates public submissions
- [ ] Document storage is configured with appropriate restrictions
- [ ] Postgres full-text search is functional across all major content types
- [ ] PostGIS is configured with geometry columns and spatial query support
- [ ] Audit logging captures all required event types with retention policy
- [ ] Automated backups run on schedule with documented recovery procedure
- [ ] API is rate-limited and protected against common attack patterns
- [ ] All changes are versioned with audit trail
- [ ] Backend deployment is separate from frontend (or same platform with
      API routes)

### Dependencies

- Milestones 3 and 4 -- database design is driven by actual data models and
  query patterns observed in the static product and Intelligence Layer
- M4.4 (Intelligence Dashboard) -- may share data layer

---

## Milestone 6 — Editorial Platform

**Status:** Planned

**Goal:** Build the production-grade editorial management system that enables
reviewers, editors, and administrators to manage content, review queues,
publishing workflows, corrections, and versioning. This is the operational
backbone for maintaining platform quality at scale.

### Deliverables

1. **Admin CMS**
   - Dashboard with key metrics and recent activity
   - Content management interfaces for: evidence items, sources, countries,
     country positions, actions, organizations, legal cases, dossiers
   - Rich text editor with source embedding and formatting
   - Preview functionality before publishing
   - Content search and filtering
   - Bulk operations (approve, publish, archive)
   - Draft management with auto-save

2. **Review Queue (production)**
   - Full review queue UI from M4.3, now backed by the production database
   - Integration with content management: approve directly to publishing
   - Review history with full diff view
   - Batch review operations
   - SLA tracking and escalation
   - Reviewer performance metrics (private to each reviewer and admins)

3. **Publishing workflow with versioning**
   - Content version model: each publish creates a new version
   - Version comparison (side-by-side diff)
   - Version history for each content item
   - Rollback capability to any previous version
   - Scheduled publishing (publish at specified date/time)
   - Publishing queue for coordinated multi-item releases
   - Publishing audit log

4. **Correction management**
   - Correction submission moderation interface
   - Accept/reject/escalate workflow
   - Automatic content update on correction acceptance
   - Public correction log generation
   - Correction notification to relevant reviewers
   - Correction metrics and trends

5. **Audit trail**
   - Full audit log query interface (from Milestone 5)
   - Filterable by: date range, actor, action type, target type
   - Exportable audit reports
   - Retention management
   - No sensitive personal data exposure in audit views

6. **Role-based access control (production)**
   - Roles: Admin, Senior Editor, Editor, Legal Reviewer, Translation
     Reviewer, Country Reviewer, Institution Reviewer, Source Verifier,
     Evidence Reviewer, Contributor
   - Granular permissions per content type and action (create, read, update,
     delete, publish, archive)
   - Permission groups for efficient role assignment
   - Access review scheduling for periodic permission audits
   - Offboarding with immediate access revocation

7. **Content scheduling and calendar**
   - Editorial calendar view
   - Content scheduling with dependencies
   - Milestone tracking for content campaigns
   - Reviewer availability calendar (optional)

8. **Notification system**
   - In-app notifications for: review assignments, @mentions, status changes,
     correction submissions, SLA breaches, publication confirmations
   - Email notifications (admin only, opt-in)
   - Notification preferences per user
   - Notification history

### Exclusions

- No public-facing editorial features
- No automated content generation without human review
- No AI-in-the-loop for editorial decisions
- No social-media publishing integration

### Definition of Done

- [ ] Admin CMS provides content management for all entity types with rich text
      editing, preview, and search
- [ ] Review Queue is fully integrated with the production database and
      publishing workflow
- [ ] Publishing workflow creates versioned snapshots with rollback capability
- [ ] Correction management handles submission through resolution with public
      log generation
- [ ] Audit trail is queryable, filterable, and exportable
- [ ] Role-based access control enforces granular permissions for all content
      types and actions
- [ ] Notification system delivers in-app notifications for key events
- [ ] All editorial actions are logged with actor, timestamp, and change
      summary
- [ ] No editorial action can be performed without proper authentication and
      authorization

### Dependencies

- Milestone 5 (Backend) -- editorial platform is built on the production
  database and authentication layer
- M4.3 (Review Queue) -- review workflow design from the Intelligence Layer
  informs the production review queue

---

## Milestone 7 — Functional Beta

**Status:** Planned

**Goal:** Deliver a fully integrated, end-to-end functional beta where all
systems work together: collectors feed the AI pipeline, which routes to human
review, which publishes to the public platform, which surfaces through maps,
knowledge graph, and action tools. Curated content has been reviewed and
published. Security is hardened. Performance is validated.

### Deliverables

1. **All systems integrated**
   - Collector Framework -> AI Pipeline -> Review Queue -> Publication ->
     Public Platform flow is operational end-to-end
   - Intelligence Dashboard monitors the full pipeline
   - Maps display reviewed geospatial data
   - Knowledge Graph is populated and navigable
   - Search indexes across all content types

2. **Curated content reviewed and published**
   - Minimum 100 reviewed evidence items across all verification levels
   - Minimum 20 reviewed legal tracker entries with current status
   - Minimum 10 country/institution pages with reviewed content and action
     templates
   - Minimum 50 organization entries with accurate relationship labels
   - Minimum 10 action templates reviewed and published for each jurisdiction
   - Minimum 5 dossiers published across different formats and audiences
   - All published content has passed through the review workflow

3. **Privacy-first analytics**
   - Plausible, Matomo, or equivalent privacy-first analytics configured
   - No advertising trackers, behavioral profiling, or personal data collection
   - Aggregate public metrics available on a dashboard page
   - Analytics opt-out mechanism

4. **Security hardening**
   - Security headers and Content Security Policy are configured and tested
   - HTTPS enforcement with HSTS
   - DDoS protection (Cloudflare or equivalent)
   - Rate limiting on all public API endpoints
   - Input validation and sanitization on all submission points
   - Dependency scanning in CI/CD pipeline
   - Secrets management with no hardcoded credentials
   - Regular security review schedule established

5. **Performance testing and optimization**
   - Load testing at expected traffic levels
   - API response time targets: p50 < 200ms, p95 < 500ms, p99 < 1000ms
   - Page load targets: first contentful paint < 2s, largest contentful
     paint < 3s
   - Map rendering performance with 1000+ features
   - Search query performance: < 500ms for typical queries
   - Knowledge graph query performance: < 1s for single-entity expansion

6. **Beta user onboarding**
   - Beta user registration process (managed, not open)
   - Onboarding documentation for beta users
   - Feedback collection mechanism
   - Bug reporting workflow
   - Beta user communication channel
   - Beta participation terms and expectations

7. **Public launch preparation**
   - Legal review for public launch readiness
   - Security review for public launch readiness
   - Privacy review for public launch readiness
   - Accessibility audit (WCAG 2.2 AA target)
   - Content review for all published pages
   - Launch communications plan
   - Rollback plan
   - Incident response plan

8. **Documentation**
   - Platform user guide (public)
   - Contributor documentation update
   - API reference documentation
   - Operations runbook
   - Incident response runbook
   - Backup and recovery procedure documentation

### Exclusions

- No general-public user accounts
- No witness submission system
- No donation processing
- No Tor mirror (evaluated but not required for functional beta)
- No mobile app

### Definition of Done

- [ ] End-to-end pipeline is operational from collection through publication
- [ ] Minimum content thresholds are met across all content types
- [ ] Privacy-first analytics are configured with no personal data collection
- [ ] Security hardening measures are implemented and tested
- [ ] Performance meets defined targets for API, page load, map, search, and
      graph queries
- [ ] Beta user onboarding process is documented and operational
- [ ] Legal, security, and privacy reviews are completed for launch readiness
- [ ] Accessibility audit passes WCAG 2.2 AA or documents known exceptions
- [ ] All systems have monitoring and alerting configured
- [ ] Incident response and rollback plans are documented
- [ ] No critical or high-security findings remain unresolved

### Dependencies

- Milestone 5 (Backend) -- database, APIs, authentication
- Milestone 6 (Editorial Platform) -- review and publishing workflows
- Milestone 4 (Intelligence Layer) -- all sub-milestones must be operational
- Milestone 3 (Static Product) -- serves as the public face

---

## Milestone 8 — Expansion

**Status:** Planned

**Goal:** Expand the platform beyond the initial Gaza focus, adding new
geographic contexts, source types, languages, partnerships, and analytical
capabilities. Expansion follows a strict methodology: no new crisis context is
launched without local expertise, dedicated methodology adaptation, and
subject-matter reviewers.

### Deliverables

1. **Additional countries and regions**
   - Priority candidates (requires research capacity confirmation): Sudan,
     Democratic Republic of Congo, Myanmar, Tigray/Ethiopia, other documented
     mass-atrocity contexts
   - Each context has: dedicated methodology adaptation, local expert
     reviewers, region-specific source taxonomy, expanded collector set,
     reviewed evidence items, legal tracker entries, action templates
   - No context is launched with copy-paste methodology; each requires
     documented adaptation
   - Expansion does not dilute quality or editorial capacity

2. **Additional collectors**
   - Every new crisis context adds relevant collectors:
     - Regional human-rights bodies
     - Local civil-society documentation groups
     - Regional humanitarian organizations
     - Relevant national court records
     - Regional journalism and academic sources
   - Collectors follow the same base collector interface and pipeline

3. **Multilingual expansion**
   - Target languages beyond English/Dutch/French:
     - Arabic (high priority for Gaza context and Middle East expansion)
     - Spanish (high priority for Latin American and international audiences)
     - German (high priority for EU audience expansion)
     - Hebrew (for Israeli source access and accountability within Israel)
     - Additional languages based on crisis context
   - Translation pipeline extended for new language pairs
   - RTL layout testing and implementation for Arabic and Hebrew
   - Human reviewer recruitment for each language
   - Legal and action content requires in-language reviewer approval

4. **Public datasets**
   - Curated, reviewed datasets for public download
   - Formats: JSON, CSV, GeoJSON, Markdown
   - Dataset types: evidence items, legal cases, country positions,
     organization directory, action templates, timeline events
   - Dataset documentation with methodology, date range, coverage notes,
     and citation guide
   - Regular dataset refresh schedule
   - Dataset versioning

5. **Academic and journalistic partnerships**
   - Formal data-sharing agreements with academic institutions
   - Journalistic partnership guidelines for source attribution and
     collaboration
   - Citation tracking for academic references to the platform
   - Joint research projects where capacity permits
   - Partner institution access to reviewed datasets

6. **Annual accountability reporting**
   - Annual report on platform methodology, content growth, corrections,
     and impact
   - Transparency report on takedowns, corrections, and policy enforcement
   - Methodology update based on lessons learned
   - Year-over-year comparison of platform metrics
   - Publicly available report archive

7. **Advanced accountability methodology**
   - Accountibility scoring model (only after M3 exclusion is lifted):
     published methodology, weighting rationale, source rules, missing-data
     policy, date/version labels, correction route, external review
   - Clear warning that score is an analytical model, not a legal judgment
   - Comparative analysis tools across countries and institutions
   - Trend detection and reporting

8. **Partnership verification workflow**
   - Organization outreach templates and tracking
   - Written partnership confirmation process
   - Verification record storage (redacted where necessary)
   - Partner badge display with permission tracking
   - Periodic partner verification renewal

### Exclusions

- No expansion without dedicated editorial capacity
- No expansion without subject-matter expert reviewers
- No expansion into contexts where local documentation capacity is absent
- No lowering of review standards for increased content volume
- No automatic expansion based on public demand alone

### Definition of Done

- [ ] At least one new crisis context is launched with dedicated methodology
      adaptation and local expert reviewers
- [ ] Additional collectors for the new context are implemented using the base
      collector interface
- [ ] Multilingual support is expanded to at least one additional language
      beyond English/Dutch/French, with RTL layout where needed
- [ ] Public datasets are available for download in multiple formats with
      documentation
- [ ] At least one academic or journalistic partnership is formalized
- [ ] First annual accountability report is published
- [ ] Advanced methodology (scoring, comparative analysis) is published with
      external review
- [ ] Partnership verification workflow is operational with at least three
      verified partners
- [ ] No expansion has diluted content quality or editorial standards

### Dependencies

- Milestone 7 (Functional Beta) -- platform must be stable and scaled before
  expansion
- Milestone 4 (Intelligence Layer) -- multilingual pipeline expansion
- Milestone 5 (Backend) -- supports public datasets and API access
- Milestone 6 (Editorial Platform) -- supports partnership workflows

---

## Maturity Model

The following table shows how each dimension evolves across milestones:

| Dimension | M1--M2 (Foundation + Landing) | M3 (Static Product) | M4 (Intelligence Layer) | M5--M6 (Backend + Editorial) | M7 (Functional Beta) | M8 (Expansion) |
|---|---|---|---|---|---|---|
| **Data** | None | Static TypeScript files | Structured + AI-enriched | Database-backed with versioning | Full pipeline with review | Multi-context datasets |
| **Sources** | Methodology drafted | Source registry (static) | Automated collection | API-driven source ingestion | End-to-end pipeline | Expanded collector set |
| **Review** | Policies drafted | Manual content review | AI-assisted review queue | Production review platform | Integrated review workflow | Multi-language review |
| **Maps** | Not started | Not started | GeoJSON pipeline + MapLibre | PostGIS spatial queries | Reviewed public maps | Multi-context map layers |
| **Search** | Not started | Client-side filtering | AI indexing | Postgres full-text search | Unified search across types | Multi-language search |
| **AI** | Principles drafted | Not implemented | Full AI pipeline (M4.1--M4.6) | AI + human review integrated | Production AI pipeline | Expanded language + context |
| **Security** | Policies drafted | CSP + headers | Pipeline security | RLS + 2FA + audit | Hardened for launch | Ongoing security program |
| **International** | Language policy | English first | Translation pipeline | i18n framework | Dutch + French added | Arabic, Spanish, German, Hebrew |

---

## Risk Register Addendum (v2 additions)

These risks supplement the risk register in the PRD (Section 30).

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI pipeline produces confident but incorrect extractions | Medium | High | Confidence thresholds, human review for all published content, periodic accuracy audits |
| Collector framework exceeds rate limits or violates API terms | Medium | Medium | Per-source rate limiting, terms-of-service review, caching layer, responsible collection policy |
| Knowledge graph becomes too complex to navigate | Medium | Low | Graph visualization with filtering, search, and entity-focused views; usability testing |
| Map location precision accidentally exposes sensitive sites | Low | Critical | Precision stripping automation, safety review gate, category-based precision rules, methodology documentation |
| Translation pipeline introduces legal errors in translation | Medium | High | Legal content requires human-translation review, translation memory, version tracking |
| Review queue becomes bottleneck with insufficient reviewers | High | High | Workload balancing, auto-assignment, SLA tracking, reviewer recruitment pipeline, batch operations |
| Backend schema changes break Intelligence Layer integration | Medium | Medium | API versioning, schema migration procedures, integration tests, architecture decision records |
| AI pipeline costs exceed budget | Medium | Medium | Model selection for cost efficiency, caching, batch processing, cost monitoring dashboard |
| Expansion dilutes content quality | Medium | High | Strict per-context methodology adaptation, subject-matter reviewer requirements, no copy-paste expansion |

---

## How to Read This Roadmap

- Milestones are sequential in capability but may overlap in development.
- A milestone's Definition of Done must be met before the milestone is
  considered complete.
- Sub-milestones within M4 (e.g., M4.1, M4.2) may be developed in parallel
  where their Dependencies allow, but each must meet its own Definition of
  Done.
- Items listed as "Exclusions" are deliberately out of scope for that
  milestone. Removing an exclusion requires a documented decision.
- This roadmap inherits all policies, principles, and exclusions from the
  PRD v2.1 and the AI Intelligence Architecture Addendum. Nothing in this
  roadmap overrides the safety, legal, or ethical constraints defined in
  those documents.
- The roadmap is a living document. Milestones may be reordered, split, or
  combined based on learning, capacity, and risk assessment. Changes require
  a decision log entry.
- AI never publishes automatically. Human review is mandatory. Every public
  claim is source-backed. Every edit is versioned. Every correction is
  transparent.
