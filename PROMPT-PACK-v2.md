# Accountability Atlas — Prompt Pack v2

## How to Use This Pack

This prompt pack is organized by milestone, with each prompt building cleanly on the previous one. Only forward-looking prompts are included — completed work is summarized for context. Every prompt is self-contained but assumes all previous milestones are complete.

**For contributors and AI agents:**

1. Run prompts in order within a milestone. Milestones are sequential (M4 is the first active milestone. M1–M3 are complete (see Completed Milestones below).).
2. Each prompt has a complete Definition of Done. Do not move on until all criteria are met.
3. "Files Affected" lists specific files to create or modify. If a file does not exist yet, create it.
4. "Suggested Commits" provides guidance on how to break the work into version-controlled steps.
5. "Rollback Considerations" explains how to undo changes if needed.
6. The Acceptance Criteria are testable. Verify each one before marking a prompt complete.
7. Guardrails are non-negotiable rules. Violating a guardrail means the prompt must be re-executed.
8. Tests in the "Tests" section must pass in CI before the prompt is considered done.
9. Documentation updates must be committed alongside code changes.
10. Use the Definition of Done as the final checklist before declaring a prompt complete.

## Prompt Format

Every prompt uses this exact format:

### Prompt [MILESTONE]-[NUMBER]: [Title]

**Goals:** What this prompt should accomplish
**Context:** Background information, what exists before this prompt
**Files Affected:** Specific files that will be created or modified
**Acceptance Criteria:** Specific, testable criteria for completion
**Guardrails:** What NOT to do, safety constraints, rules to follow
**Tests:** What tests should pass
**Documentation Updates:** What docs need updating
**Suggested Commits:** How to break the work into commits
**Rollback Considerations:** How to undo if needed
**Definition of Done:** When this prompt is truly complete

---

---

## Completed Milestones — M1, M2, M3

> **M1–M3 are complete.** The project has a working static beta with all 12 routes, design system, static data files, i18n framework, search, low-graphic mode, print styles, accessibility gate, route splitting, source registry, data integrity tests, content validation, editorial governance, and release readiness review.
>
> The original 23 detailed prompts for M1–M3 are preserved in the git history of this file. They are not repeated here — this prompt pack starts from **where the project actually is**.

| Milestone | Status | What was delivered |
|---|---|---|
| **M1 — Foundation** | ✅ | Repository, governance, community docs, legal/ethical framework, brand identity, outreach plan |
| **M2 — Landing Page** | ✅ | React/Vite/TS/Tailwind stack, design system, hero + Starting Focus, homepage sections, roadmap, contributor CTA, navigation, footer, motion polish |
| **M3 — Static Product** | ✅ | 12 routes (methodology, attributions, Gaza dossier, legal tracker, Belgium, EU, organizations, action hub, evidence library, press, contribute, 404), 9 static data files, shared components (evidence/legal/country/organization/action cards, badges, page intro/status), i18n (en/nl/fr), client-side search, low-graphic mode, route splitting, print styles, accessibility gate, source registry, data integrity tests, content validation, editorial governance, release readiness QA |

**Current state:** The static beta is deployed and reviewed. The project is ready to begin **M4 — Intelligence Layer**. All prompts from this point forward assume M1–M3 are complete and the static beta is stable.

---

## Milestone 4 — Intelligence Layer (▶️ NEXT — THE BIG ONE)

This is the heart of V2. The Intelligence Layer transforms Accountability Atlas from a static website into an AI-assisted civic intelligence platform. Information flows through: Sources -> Collection -> Normalization -> AI Intelligence -> Human Review -> Publication -> Public Platform -> Action -> Impact.

M4 is organized in 7 sub-milestones (M4.1 through M4.7). Each sub-milestone has multiple prompts. Run these prompts strictly in order within each sub-milestone.

---

### M4.1 — Collector Framework

#### Prompt M4.1-01: Source Registry Data Model and UI

**Goals:** Define the Source Registry schema and build the source registry management page. Every source in the system gets a structured record with trust metadata, automation configuration, and health monitoring fields.

**Context:** Static data files (M3-12) include basic SourceRecord interfaces. These need to be expanded into a full Source Registry with API/RSS configuration, trust scoring, and health monitoring. The existing `src/pages/SourceRegistryPage.tsx` and `src/data/sources.ts` provide the starting point.

**Files Affected:**
- `src/types/content.ts` — expand SourceRecord with: publisher metadata, trust level, verification method, API/RSS config, license, language, region, category, reliability notes, lastChecked, automation status, health status, monitoring config
- `src/schemas/index.ts` — add SourceRegistry schema
- `src/data/sources.ts` — migrate to expanded schema
- `src/pages/SourceRegistryPage.tsx` — build source registry management UI
- `src/components/sources/SourceRegistryTable.tsx` — table listing all sources with health indicators
- `src/components/sources/SourceDetailPanel.tsx` — detail panel for editing source metadata
- `src/components/sources/SourceHealthIndicator.tsx` — health status badge (active/degraded/failed)
- `src/components/sources/SourceFilterControls.tsx` — filter by type, status, region, language
- `src/data/routeMetadata.ts` — add source registry route metadata

**Acceptance Criteria:**
- SourceRegistry schema includes: id, slug, title, publisher, sourceType, documentType, url, publicationDate, accessedAt, archiveUrl, language, jurisdiction, authors, official, status, notes, version, lastCheckedAt, correctionUrl, trustLevel (0-5), verificationMethod (official/ngo/journalism/academic/osint), apiEndpoint, apiKeyRef (reference only, never store actual keys), rssFeedUrl, feedConfig (polling interval, lastFetched), license, licenseUrl, region, category, reliabilityNotes, automationStatus (manual/scheduled/real-time), healthStatus (unknown/active/degraded/failed), lastSuccessfulFetch, lastFailedFetch, failureCount, monitoringEnabled
- Source Registry UI shows all sources in a table with health indicators
- Filters work by type, status, region, language, trust level
- Detail panel shows all metadata for a selected source
- Source health indicators are color-coded: green (active), amber (degraded), red (failed), grey (unknown)
- Existing 40+ source records are migrated to the new schema with default values for new fields
- Schema validation passes for all records

**Guardrails:**
- Never store actual API keys in code or data files — use key references only (keyRef strings)
- Do not include access credentials for any source in the data file
- Do not mark a source as trusted automatically based on type alone — require human review
- Do not include internal review notes in public-facing source records
- Health status must default to "unknown" — never assume a source is active without verification

**Tests:**
- SourceRegistry schema validates all existing source records
- SourceRegistryPage renders with table and filters
- HealthIndicator renders all status variants
- Filter controls correctly filter the source list
- Data file migration does not lose any existing fields
- All SourceRecords comply with the new schema

**Documentation Updates:**
- `docs/data-model.md` — update source registry documentation
- `docs/data-field-dictionary.md` — add new fields
- `docs/source-policy.md` — add trust level and verification method documentation

**Suggested Commits:**
1. Expand SourceRecord interface and schema in types/content.ts and schemas/index.ts
2. Create SourceHealthIndicator, SourceFilterControls components
3. Create SourceRegistryTable and SourceDetailPanel components
4. Build SourceRegistryPage layout
5. Migrate existing source data to new schema
6. Validate all records pass schema

**Rollback Considerations:** Revert individual commits. Source data migration maintains backward compatibility through the expanded interface. Old sources.ts can be restored from git if migration has errors.

**Definition of Done:** Source Registry page displays all sources with health indicators and filters. All existing 40+ records migrated. Schema validation passes.

---

#### Prompt M4.1-02: Collector Base Framework

**Goals:** Build the base collector class/interface that all specific collectors will extend. Define the fetch -> validate -> normalize -> deduplicate -> store pipeline.

**Context:** Source Registry exists (M4.1-01) with source configuration. Need the runtime framework that reads source configs and collects content from them.

**Files Affected:**
- `src/lib/collectors/types.ts` — collector interfaces: CollectorConfig, CollectResult, CollectError, CollectPipeline, CollectorRegistration
- `src/lib/collectors/BaseCollector.ts` — abstract base class with pipeline: fetch, validate, normalize, deduplicate, store
- `src/lib/collectors/CollectorRegistry.ts` — collector registration and discovery system
- `src/lib/collectors/errors.ts` — typed error classes: FetchError, ParseError, ValidationError, RateLimitError, AuthError, TimeoutError
- `src/lib/collectors/rateLimiter.ts` — rate limiting: per-source delays, per-domain limits, burst handling
- `src/lib/collectors/retry.ts` — retry logic with exponential backoff, max retries, jitter
- `src/lib/collectors/scheduler.ts` — scheduling: cron-like intervals, manual triggers, health-based scheduling
- `src/lib/collectors/store.ts` — storage interface for collected content (initially localStorage/indexedDB for static dev, later API-backed)
- `src/lib/collectors/__tests__/BaseCollector.test.ts`
- `src/lib/collectors/__tests__/CollectorRegistry.test.ts`
- `src/lib/collectors/__tests__/rateLimiter.test.ts`
- `src/lib/collectors/__tests__/retry.test.ts`

**Acceptance Criteria:**
- BaseCollector defines the pipeline interface with methods: fetch(), validate(), normalize(), deduplicate(), store()
- Pipeline execution order is enforced: fetch -> validate -> normalize -> deduplicate -> store
- CollectorRegistry allows registering collectors by source type and discovering them
- Rate limiter enforces per-source delays, per-domain limits, and burst handling
- Retry logic implements exponential backoff with configurable maxRetries and jitter
- Scheduler supports cron-like intervals and manual triggers
- All error types are typed and include context (source, url, attempt count)
- Storage interface defines methods: save, getBySource, getByDate, getUnprocessed
- Collector instances can be registered with a source from the Source Registry
- Tests cover: pipeline execution order, error propagation, rate limit enforcement, retry backoff

**Guardrails:**
- Do not make actual network calls in tests — use mocks
- Do not implement auto-start or daemon behavior yet (manual trigger only)
- Do not store collected content permanently in the static beta — use a dev store
- Rate limits must respect source terms of service
- Fetch timeout must be configurable per source

**Tests:**
- BaseCollector pipeline executes in correct order
- Middleware in pipeline is called in sequence
- Error in any stage stops the pipeline with appropriate error
- CollectorRegistry can register and discover collectors
- Rate limiter blocks requests that exceed limits
- Retry logic retries on transient errors, stops on fatal errors
- Scheduler triggers collection at specified intervals
- All tests use mocks — no actual network calls

**Documentation Updates:**
- `docs/architecture.md` — add collector framework architecture
- Create `docs/collector-framework.md` with usage guide

**Suggested Commits:**
1. Types and error definitions
2. BaseCollector abstract class
3. CollectorRegistry
4. Rate limiter
5. Retry logic
6. Scheduler
7. Storage interface
8. Test suite

**Rollback Considerations:** The collector framework is additive — it does not modify existing code. Full git revert on any commit.

**Definition of Done:** Base collector framework is built and tested. Collectors can be registered, configured, and triggered. Pipeline enforces fetch -> validate -> normalize -> deduplicate -> store order.

---

#### Prompt M4.1-03: ICJ and ICC Collectors

**Goals:** Implement collectors for the International Court of Justice and International Criminal Court. These are the highest-weight sources and must be implemented first.

**Context:** Base collector framework exists (M4.1-02). Need specific collectors for the two primary international courts.

**Files Affected:**
- `src/lib/collectors/courts/ICJCollector.ts` — ICJ collector: scrapes icj-cij.org for press releases, orders, judgments, case updates
- `src/lib/collectors/courts/ICCCollector.ts` — ICC collector: scrapes icc-cpi.int for press releases, warrants, proceedings, filings
- `src/lib/collectors/courts/Normalizer.ts` — legal document normalizer: extracts case number, parties, document type, date, procedural status, summary
- `src/lib/collectors/courts/__tests__/ICJCollector.test.ts`
- `src/lib/collectors/courts/__tests__/ICCCollector.test.ts`
- `src/lib/collectors/courts/__tests__/LegalNormalizer.test.ts`
- `src/lib/collectors/courts/mockData.ts` — mock court data for tests

**Acceptance Criteria:**
- ICJCollector fetches and normalizes: press releases, orders, judgments, case docket updates, intervention filings
- ICCCollector fetches and normalizes: press releases, arrest warrants, proceeding updates, situation page updates, Prosecutor statements
- Legal normalizer extracts: case number, parties, court, document type, date, procedural posture, key rulings, next steps
- Normalized output conforms to the standard CollectResult format
- URL patterns support both direct document URLs and listing pages
- Error handling for: court website downtime, missing documents, rate limiting, parsing failures
- Mock data covers: order document, press release, docket entry, warrant, proceeding update
- Tests verify: fetch, parse, normalize, error handling

**Guardrails:**
- Do not modify or delete original source text — preserve verbatim quotes
- Do not add legal analysis or commentary in the normalizer
- Procedural status must use the LegalStatus controlled vocabulary from types/content.ts
- Distinguish between: filing, order, judgment, warrant, proceeding update
- Never claim a ruling says something it does not explicitly state

**Tests:**
- ICJCollector fetches and normalizes mock order document
- ICJCollector fetches and normalizes mock press release
- ICCCollector fetches and normalizes mock warrant document
- ICCCollector fetches and normalizes mock proceeding update
- Legal normalizer extracts all required fields
- Error handling returns typed errors for: 404, 503, timeout, parse failure
- Collector registration succeeds for both
- Rate limiting is respected

**Documentation Updates:**
- `docs/collector-framework.md` — add court collector documentation

**Suggested Commits:**
1. Legal document normalizer
2. ICJ collector
3. ICC collector
4. Mock data and test suite

**Rollback Considerations:** Collectors are additive — they do not modify existing code. Revert individual commits.

**Definition of Done:** ICJ and ICC collectors fetch and normalize court documents. Tests pass. Collectors registered in the registry.

---

#### Prompt M4.1-04: UN Collectors (OHCHR, OCHA)

**Goals:** Implement collectors for UN human rights office (OHCHR) and UN humanitarian coordination office (OCHA). These cover reports, statements, flash appeals, and situation reports.

**Context:** Court collectors exist (M4.1-03). Need UN collectors for the next source tier.

**Files Affected:**
- `src/lib/collectors/un/OHCHRCollector.ts` — OHCHR collector: Commission of Inquiry reports, Human Rights Council resolutions, High Commissioner statements, country page updates
- `src/lib/collectors/un/OCHACollector.ts` — OCHA collector: situation reports, flash appeals, humanitarian updates, data portal snapshots
- `src/lib/collectors/un/UNNormalizer.ts` — UN document normalizer: extracts UN document symbol, issuing body, session, agenda item, report type
- `src/lib/collectors/un/__tests__/OHCHRCollector.test.ts`
- `src/lib/collectors/un/__tests__/OCHACollector.test.ts`
- `src/lib/collectors/un/__tests__/UNNormalizer.test.ts`
- `src/lib/collectors/un/mockData.ts`

**Acceptance Criteria:**
- OHCHRCollector fetches: COI reports, HRC resolutions, High Commissioner statements, country-specific pages
- OCHACollector fetches: situation reports, flash updates, humanitarian needs overviews, funding tracking data
- UN normalizer extracts: document symbol (e.g., A/79/232), issuing body, session/meeting, agenda item, report type, geographic scope
- RSS feed support for OCHA updates (ochaopt.org RSS)
- Page listing navigation: detect new reports on listing pages
- Error handling for: document not found, session not active, pagination changes, RSS feed failures

**Guardrails:**
- Do not interpret UN document language — extract metadata only
- Preserve original document classification markings
- Do not summarize or editorialize UN findings in the collector layer
- Respect robots.txt and crawl delays for UN websites

**Tests:**
- OHCHRCollector fetches mock COI report
- OCHACollector fetches mock situation report
- UN normalizer extracts document symbol, issuing body, session
- RSS feed parsing works for OCHA updates
- Error handling for missing documents and pagination failures

**Documentation Updates:**
- `docs/collector-framework.md` — add UN collector documentation

**Suggested Commits:**
1. UN document normalizer
2. OHCHR collector
3. OCHA collector (with RSS support)
4. Mock data and tests

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** OHCHR and OCHA collectors fetch and normalize UN documents. Tests pass.

---

#### Prompt M4.1-05: EU and Belgium Collectors

**Goals:** Implement collectors for EU institutions and Belgium government sources. These cover legal and policy positions of EU member states and institutions.

**Context:** UN collectors exist (M4.1-04). Need EU and Belgium collectors.

**Files Affected:**
- `src/lib/collectors/eu/EUCollector.ts` — EU collector: Council conclusions, Commission statements, Parliament resolutions, EEAS press releases, EUR-Lex document updates
- `src/lib/collectors/eu/BelgiumCollector.ts` — Belgium collector: FPS Foreign Affairs press releases, Chamber of Representatives records, Senate records, regional government positions
- `src/lib/collectors/eu/GovernmentNormalizer.ts` — government document normalizer: extracts issuing institution, document reference, legal basis, vote records
- `src/lib/collectors/eu/__tests__/EUCollector.test.ts`
- `src/lib/collectors/eu/__tests__/BelgiumCollector.test.ts`
- `src/lib/collectors/eu/__tests__/GovernmentNormalizer.test.ts`
- `src/lib/collectors/eu/mockData.ts`

**Acceptance Criteria:**
- EUCollector fetches: Council conclusions, Commission statements, Parliament resolutions, EEAS press releases
- BelgiumCollector fetches: FPS Foreign Affairs press releases and statements, parliamentary questions and records, government decisions
- Government normalizer extracts: issuing institution, document reference/code, legal basis citations, vote tallies, effective dates
- EUR-Lex document tracking for specific legal instruments (Association Agreement, Common Position)
- Multi-language support: EU documents in EN/FR/DE, Belgium documents in NL/FR/EN
- Error handling for: document not published in requested language, EUR-Lex rate limiting, parliamentary recess periods

**Guardrails:**
- Distinguish between EU institution types (Council vs Commission vs Parliament) — each has different legal weight
- Do not conflate proposed legislation with adopted legislation
- Belgium regional competence documents must be labeled with the correct government level
- Respect parliamentary publication embargo periods

**Tests:**
- EUCollector fetches mock Council conclusion
- EUCollector fetches mock EP resolution
- BelgiumCollector fetches mock FPS press release
- BelgiumCollector fetches mock parliamentary question
- Government normalizer extracts reference codes and legal basis
- Multi-language support verified

**Documentation Updates:**
- `docs/collector-framework.md` — add EU and Belgium collector documentation

**Suggested Commits:**
1. Government document normalizer
2. EU collector (Council, Commission, Parliament, EEAS)
3. Belgium collector (federal, parliamentary, regional)
4. Mock data and tests

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** EU and Belgium collectors fetch and normalize government documents. Tests pass.

---

#### Prompt M4.1-06: NGO Collectors

**Goals:** Implement collectors for major human rights and humanitarian NGOs. These provide independent verification and documentation.

**Context:** Government collectors exist (M4.1-05). Need NGO collectors.

**Files Affected:**
- `src/lib/collectors/ngo/AmnestyCollector.ts` — Amnesty International collector
- `src/lib/collectors/ngo/HRWCollector.ts` — Human Rights Watch collector
- `src/lib/collectors/ngo/BtselemCollector.ts` — B'Tselem collector
- `src/lib/collectors/ngo/MSFCollector.ts` — Medecins Sans Frontieres collector
- `src/lib/collectors/ngo/ICRCCollector.ts` — ICRC collector (also humanitarian category)
- `src/lib/collectors/ngo/NGONormalizer.ts` — NGO report normalizer: extracts organization name, report type, publication date, methodology, key findings
- `src/lib/collectors/ngo/__tests__/` — test files for each collector
- `src/lib/collectors/ngo/mockData.ts`

**Acceptance Criteria:**
- AmnestyCollector fetches: research reports, press releases, legal analyses, campaign pages
- HRWCollector fetches: detailed reports, news releases, legal analysis, multimedia documentation
- BtselemCollector fetches: reports, testimony summaries (already public), video documentation, data updates
- MSFCollector fetches: operational updates, press releases, field reports, medical access statements
- ICRCCollector fetches: operational updates, IHL statements, news releases, field reports
- NGO normalizer extracts: organization name, report title, publication date, methodology section, key findings, geographic scope, legal references
- RSS feed support where available
- Rate limiting respects NGO website terms
- Error handling for: website redesigns, URL changes, report retractions

**Guardrails:**
- NGO findings are NOT judicial determinations — label outputs accordingly
- Preserve exact NGO language in key findings quotes
- Do not combine or conflate findings from different NGOs
- Some NGOs have automated blocking — implement respectful crawl delays
- Note in output metadata whether the source is official institutional or NGO research

**Tests:**
- Each NGO collector fetches and normalizes mock report
- NGO normalizer extracts required fields
- RSS parsing works where available
- Error handling for missing pages and rate limits
- All collectors register correctly

**Documentation Updates:**
- `docs/collector-framework.md` — add NGO collector documentation

**Suggested Commits:**
1. NGO normalizer
2. Amnesty collector
3. HRW collector
4. Btselem collector
5. MSF collector
6. ICRC collector
7. Mock data and tests

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** All NGO collectors fetch and normalize reports. Tests pass. Organization-source links preserved.

---

#### Prompt M4.1-07: Journalism and Academic Collectors

**Goals:** Implement RSS-based journalism collector and academic research collector for news and scholarly sources.

**Context:** NGO collectors exist (M4.1-06). Need journalism and academic collection.

**Files Affected:**
- `src/lib/collectors/media/JournalismCollector.ts` — RSS-based journalism collector: parses RSS/Atom feeds, extracts article content, preserves bylines and publication metadata
- `src/lib/collectors/media/AcademicCollector.ts` — academic collector: SSRN, Academia.edu, open-access journal APIs, Google Scholar RSS
- `src/lib/collectors/media/MediaNormalizer.ts` — media normalizer: extracts headline, byline, publication, date, body summary, URL, access date
- `src/lib/collectors/media/__tests__/JournalismCollector.test.ts`
- `src/lib/collectors/media/__tests__/AcademicCollector.test.ts`
- `src/lib/collectors/media/__tests__/MediaNormalizer.test.ts`
- `src/lib/collectors/media/mockData.ts`
- `src/lib/collectors/media/feedConfig.ts` — RSS feed configuration: URLs, polling intervals, source mappings

**Acceptance Criteria:**
- JournalismCollector parses RSS/Atom feeds from configured news sources
- AcademicCollector searches and retrieves: paper metadata, abstracts, author info, publication venue, DOI, open-access URLs
- Feed configuration supports: URL, polling interval, category mapping, language
- Media normalizer extracts: headline, byline, publication name, publication date, access date, URL, body/preview, article category
- Duplicate detection: same article from different feeds creates one record
- Error handling for: feed parsing failures, paywalled content, rate limiting, feed format changes

**Guardrails:**
- Do not bypass paywalls — fetch only publicly available content
- Do not archive full article text without permission — store metadata and excerpts
- Respect RSS feed Terms of Service
- Label content as "subscription required" when only metadata is available
- Academic papers are not automatically evidence — they are analysis
- Distinguish between news reporting and opinion/editorial content

**Tests:**
- JournalismCollector parses mock RSS feed
- JournalismCollector handles Atom and RSS 2.0 formats
- AcademicCollector retrieves mock paper metadata
- Media normalizer extracts all required fields
- Duplicate detection merges identical articles from different feeds
- Error handling for invalid feed XML

**Documentation Updates:**
- `docs/collector-framework.md` — add journalism and academic documentation
- Create `docs/feed-configuration.md` for feed setup guide

**Suggested Commits:**
1. Media normalizer
2. RSS feed parser
3. Journalism collector
4. Academic collector
5. Feed configuration
6. Mock data and tests

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Journalism and academic collectors parse feeds and extract metadata. Tests pass.

---

#### Prompt M4.1-08: Source Health Monitoring and Dashboard

**Goals:** Build source health monitoring system and monitoring dashboard. Track collector status, update detection, and error rates.

**Context:** All collectors exist (M4.1-03 through M4.1-07). Need health monitoring.

**Files Affected:**
- `src/lib/collectors/monitoring/HealthMonitor.ts` — health monitoring: tracks last fetch, success/failure, response times, error rates
- `src/lib/collectors/monitoring/AlertSystem.ts` — alert system: thresholds for failures, stale data, rate limit hits
- `src/lib/collectors/monitoring/MetricsCollector.ts` — metrics aggregation: per-source metrics, per-collector metrics, system-wide metrics
- `src/lib/collectors/monitoring/types.ts` — monitoring types: HealthStatus, HealthReport, AlertRule, AlertEvent, MetricsSnapshot
- `src/pages/admin/MonitoringDashboard.tsx` — monitoring dashboard UI
- `src/components/admin/CollectorStatusTable.tsx` — collector status table with health indicators
- `src/components/admin/SystemHealthPanel.tsx` — system-wide health summary
- `src/components/admin/AlertHistoryPanel.tsx` — alert history log
- `src/lib/collectors/monitoring/__tests__/HealthMonitor.test.ts`
- `src/lib/collectors/monitoring/__tests__/AlertSystem.test.ts`

**Acceptance Criteria:**
- HealthMonitor tracks: last fetch timestamp, success/failure count, consecutive failures, average response time, error rate
- AlertSystem triggers alerts on: N consecutive failures, stale data (no update > configured period), error rate above threshold, rate limit violations
- MetricsCollector aggregates: per-source metrics, per-collector metrics, system-wide metrics over time windows (1h, 24h, 7d)
- Monitoring dashboard shows: all collectors with health status, system-wide health summary, recent alerts, source coverage gaps
- Collector status table: name, type, status, last fetch, success rate, response time, error count
- Alert history: timestamp, source, alert type, severity, status (active/acknowledged/resolved)
- Health status propagation: collector status -> source record health status in Source Registry
- Tests verify: health tracking, alert triggering, metric aggregation, status propagation

**Guardrails:**
- Do not expose monitoring data on public pages — admin access only
- Do not store actual API keys or credentials in monitoring logs
- Alert thresholds must be configurable per source type
- Monitoring data must not include collected content — metadata only
- Alert fatigue prevention: minimum interval between repeated alerts

**Tests:**
- HealthMonitor tracks fetch success/failure correctly
- AlertSystem triggers on consecutive failures
- AlertSystem triggers on stale data
- MetricsCollector aggregates per-source and system-wide metrics
- Status propagation updates SourceRegistry records
- All tests use mocks for time-dependent behavior

**Documentation Updates:**
- `docs/collector-framework.md` — add monitoring documentation
- Create `docs/monitoring-runbook.md` for operational procedures

**Suggested Commits:**
1. Monitoring types and HealthMonitor
2. AlertSystem with configurable thresholds
3. MetricsCollector
4. CollectorStatusTable component
5. SystemHealthPanel and AlertHistoryPanel
6. MonitoringDashboard page
7. Test suite

**Rollback Considerations:** Monitoring is additive. Revert individual commits. The MonitoringDashboard is an admin page that won't affect public routes.

**Definition of Done:** Source health monitoring tracks all collectors. Dashboard displays collector status, alerts, and metrics. Tests pass.

---

### M4.2 — AI Pipeline

#### Prompt M4.2-01: AI Pipeline Foundation

**Goals:** Build the base AI pipeline infrastructure. Define the operation schema, model routing, structured output handling, error handling, rate limiting, and logging.

**Context:** Collector framework (M4.1) delivers normalized content. Now need the AI pipeline to process that content.

**Files Affected:**
- `src/lib/ai/types.ts` — AI types: AIOperationResult<T>, ModelConfig, ModelRoute, PromptTemplate, AIError, AILogEntry
- `src/lib/ai/AIPipeline.ts` — pipeline orchestrator: routes content through configured AI stages, manages context window, handles structured outputs
- `src/lib/ai/ModelRouter.ts` — model routing: selects model based on task type, content length, language, required capabilities
- `src/lib/ai/PromptManager.ts` — prompt management: stores prompt templates, versions prompts, supports template variables
- `src/lib/ai/StructuredOutputHandler.ts` — structured output handling: validates JSON outputs against schemas, retries on malformed output
- `src/lib/ai/RateLimiter.ts` — AI rate limiter: tokens-per-minute, requests-per-minute, queue management
- `src/lib/ai/ErrorHandler.ts` — error handling: classifies errors (transient/permanent/context-length/rate-limit), retry logic
- `src/lib/ai/Logger.ts` — AI operation logging: logs prompt, response, latency, model, token count, confidence score
- `src/lib/ai/__tests__/AIPipeline.test.ts`
- `src/lib/ai/__tests__/ModelRouter.test.ts`
- `src/lib/ai/__tests__/StructuredOutputHandler.test.ts`
- `src/lib/ai/__tests__/RateLimiter.test.ts`

**Acceptance Criteria:**
- AIOperationResult<T> includes: data, confidence, model used, tokens used, latency, warnings, sourceSpans
- Pipeline orchestrator routes content through stages in configured order
- ModelRouter selects appropriate model based on task type and content characteristics
- PromptManager stores versioned prompts with variable substitution
- StructuredOutputHandler validates AI responses against Zod schemas with retry on malformed output
- RateLimiter enforces per-minute and per-token limits with queue
- ErrorHandler classifies errors and retries transient failures
- Logger records: timestamp, prompt (truncated), response summary, model, tokens, latency, confidence, errors
- All components are provider-agnostic (can work with any LLM API)

**Guardrails:**
- Never auto-publish any AI output — AI is assistant-only
- Log all AI operations for audit — do not disable logging
- Do not hardcode API keys — use environment variables
- Rate limits must prevent cost overruns
- Prompt versions must be tracked for reproducibility
- Source spans must reference original collected document IDs

**Tests:**
- Pipeline orchestrates stages in correct order
- ModelRouter selects correct model for each task type
- StructuredOutputHandler validates and retries malformed outputs
- RateLimiter enforces limits
- ErrorHandler classifies error types correctly
- Logger records all required fields
- All components work with mock AI provider

**Documentation Updates:**
- Create `docs/ai-pipeline-overview.md` — architecture and component descriptions
- Create `docs/ai-prompt-guidelines.md` — prompt engineering guidelines

**Suggested Commits:**
1. AI types and schemas
2. ModelRouter
3. PromptManager
4. StructuredOutputHandler
5. RateLimiter and ErrorHandler
6. AIPipeline orchestrator
7. Logger
8. Test suite

**Rollback Considerations:** AI pipeline is additive — it does not modify existing code. Full revert on any commit.

**Definition of Done:** AI pipeline foundation is built and tested. Content can be routed through configured AI stages. All outputs are logged and auditable.

---

#### Prompt M4.2-02: Language Detection and Translation Pipeline

**Goals:** Implement language detection and AI-assisted translation. Translation must have confidence scoring and human review queue for high-risk content (legal, testimony, casualty, identity).

**Context:** AI pipeline foundation exists (M4.2-01). Need language processing capabilities.

**Files Affected:**
- `src/lib/ai/stages/LanguageDetector.ts` — language detection: detects source language, confidence score, handles mixed-language content
- `src/lib/ai/stages/Translator.ts` — AI translation: translates content, preserves formatting/URLs/names, outputs translation + confidence
- `src/lib/ai/stages/TranslationReviewer.ts` — translation review classifier: classifies content risk level (low/medium/high) for human review
- `src/lib/ai/stages/types.ts` — language/translation types: DetectionResult, TranslationResult, RiskClassification, ReviewPriority
- `src/lib/ai/prompts/language-detection.md` — language detection prompt template
- `src/lib/ai/prompts/translation.md` — translation prompt template
- `src/lib/ai/prompts/translation-review.md` — translation risk classification prompt
- `src/lib/ai/__tests__/LanguageDetector.test.ts`
- `src/lib/ai/__tests__/Translator.test.ts`

**Acceptance Criteria:**
- LanguageDetector identifies language with confidence score (0-1)
- LanguageDetector handles: single language, mixed language, short text (<50 chars), text with many proper names
- Translator produces fluent translation in target language while preserving: named entities, URLs, numbers, formatting
- TranslationReviewer classifies content as: low risk (general news, public statements), medium risk (humanitarian reporting, political analysis), high risk (legal documents, casualty figures, testimony, identities)
- High-risk content is flagged for mandatory human review before any use
- Translation confidence score: based on content complexity, language pair difficulty, content length, named entity density
- Source language preservation: original text stored alongside translation
- Translation metadata: model used, confidence score, risk classification, human review status

**Guardrails:**
- High-risk content (legal, casualty, testimony, identity) must NOT be auto-translated without human review
- Never translate names of people, places, or organizations — preserve original
- Translations must include: "AI-assisted translation — human review pending" where not yet reviewed
- Do not translate content that requires specialist legal or medical knowledge without expert review
- Preserve original document formatting and structure where possible

**Tests:**
- LanguageDetector correctly identifies supported languages
- LanguageDetector returns low confidence for ambiguous/short input
- Translator preserves named entities and formatting
- TranslationReviewer correctly classifies risk levels
- High-risk content flagged for human review
- Translation output includes all required metadata

**Documentation Updates:**
- `docs/ai-pipeline-overview.md` — add language/translation documentation
- `docs/translation-review-policy.md` — update with AI translation rules

**Suggested Commits:**
1. Language detection stage
2. Translation stage
3. Translation risk classification
4. Prompt templates
5. Test suite

**Rollback Considerations:** Revert individual commits. Translation stages are disabled by default until human review workflow is active.

**Definition of Done:** Language detection and AI translation work with confidence scoring. High-risk content is flagged for human review. Tests pass.

---

#### Prompt M4.2-03: Summarization Engine

**Goals:** Build AI summarization that extracts key facts, maintains neutrality, preserves source references, and does not introduce claims not in the source.

**Context:** Language processing exists (M4.2-02). Need summarization.

**Files Affected:**
- `src/lib/ai/stages/Summarizer.ts` — summarization stage: extracts key facts, produces neutral summary, preserves source references
- `src/lib/ai/stages/types.ts` — add summarization types: SummaryResult, SummaryType (brief/normal/detailed), FactExtraction
- `src/lib/ai/prompts/summarization.md` — summarization prompt template
- `src/lib/ai/prompts/fact-extraction.md` — fact extraction prompt template
- `src/lib/ai/__tests__/Summarizer.test.ts`

**Acceptance Criteria:**
- Summarizer produces three levels: brief (1-2 sentences), normal (paragraph), detailed (multi-paragraph with structure)
- Summarizer preserves all source references (document symbols, URLs, institution names)
- Summarizer does NOT introduce any claim, number, or finding not present in the source text
- Fact extraction identifies: key numbers (casualties, amounts, dates), named entities, legal findings, policy positions, humanitarian metrics
- Fact extraction includes exact source spans (character ranges from source text)
- Fact extraction confidence score per extracted fact
- Neutrality check: summarizer must not add editorial framing, emotional language, or advocacy
- If source text contains ambiguous or contradictory information, the summary must reflect that ambiguity

**Guardrails:**
- NEVER add information not present in the source — this is the cardinal rule
- Never editorialize or add framing language
- Ambiguity in the source must be preserved as ambiguity in the summary
- Numbers must be exact transcriptions — no rounding without notation
- Do not combine information from multiple sources in a single summary
- Each summary must reference exactly which source document it summarizes

**Tests:**
- Summarizer produces correct output at all three detail levels
- Fact extraction identifies all key facts from test documents
- Fact extraction includes accurate source spans
- Summarizer does not introduce claims not in source
- Neutrality verified: no editorial language in summaries
- Ambiguous source text produces appropriately ambiguous summary
- Source references preserved in all output formats

**Documentation Updates:**
- `docs/ai-pipeline-overview.md` — add summarization documentation
- `docs/evidence-verification-model.md` — update with AI summary guidelines

**Suggested Commits:**
1. Summarization prompt templates
2. Summarizer stage (brief/normal/detailed)
3. Fact extraction stage
4. Neutrality validation
5. Test suite

**Rollback Considerations:** Revert individual commits. Summarization is AI-assist only — no auto-publishing.

**Definition of Done:** Summarization engine produces neutral, source-faithful summaries at three levels. Fact extraction identifies key facts with source spans. Tests pass.

---

#### Prompt M4.2-04: Entity Extraction

**Goals:** Extract people, organizations, locations, dates from content. Link to existing entities where possible. Confidence scoring per extraction.

**Context:** Summarization exists (M4.2-03). Need entity extraction.

**Files Affected:**
- `src/lib/ai/stages/EntityExtractor.ts` — entity extraction stage
- `src/lib/ai/types.ts` — add entity types: ExtractedEntity, EntityType (person/organization/location/date/event/legal_case), EntityLink
- `src/lib/ai/prompts/entity-extraction.md` — entity extraction prompt
- `src/lib/ai/__tests__/EntityExtractor.test.ts`

**Acceptance Criteria:**
- EntityExtractor identifies: persons (full name, role, affiliation), organizations (name, type, acronym), locations (name, type, parent jurisdiction), dates and date ranges, events (name, type), legal cases (case name, court, number)
- Each extraction includes: confidence score (0-1), source span, entity type, canonical name, aliases/variations
- Entity linking: if the same entity appears in multiple documents, link the mentions
- Entity deduplication: "ICJ" and "International Court of Justice" resolve to the same entity
- Entity relationship hints: person-affiliation (works for), location-parent (located in), organization-type (is a)
- Output structured for knowledge graph ingestion (M4.6)
- Confidence thresholds configurable per entity type

**Guardrails:**
- Do not extract private individuals who are not public figures
- Entity canonical names must match official names where possible
- Do not fabricate biographical details not present in the source
- Distinguish between factual entity mentions and hypothetical/speculative ones
- Role/affiliation extraction must be explicit from source, not inferred

**Tests:**
- EntityExtractor identifies persons, organizations, locations, dates
- Entity linking connects variants of the same entity
- Confidence scores are meaningful (test with known ambiguous cases)
- Relationship hints are correctly typed
- No private individuals extracted from test data
- Source spans are accurate

**Documentation Updates:**
- `docs/ai-pipeline-overview.md` — add entity extraction documentation

**Suggested Commits:**
1. Entity types and schemas
2. Entity extraction prompt
3. EntityExtractor stage
4. Entity linking logic
5. Test suite

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Entity extraction identifies and links key entities with confidence scores. Output structured for knowledge graph. Tests pass.

---

#### Prompt M4.2-05: Claim Extraction

**Goals:** Identify factual claims in text, classify claim types, and link claims to source spans.

**Context:** Entity extraction exists (M4.2-04). Need claim extraction.

**Files Affected:**
- `src/lib/ai/stages/ClaimExtractor.ts` — claim extraction stage
- `src/lib/ai/types.ts` — add claim types: ExtractedClaim, ClaimType (legal/humanitarian/political/factual/allegation), ClaimStatus
- `src/lib/ai/prompts/claim-extraction.md` — claim extraction prompt
- `src/lib/ai/__tests__/ClaimExtractor.test.ts`

**Acceptance Criteria:**
- ClaimExtractor identifies distinct claims in text
- Claim type classification: legal (court findings, legal conclusions), humanitarian (aid access, civilian impact), political (policy positions, statements), factual (dates, numbers, events), allegation (unproven accusations)
- Each claim includes: claim text, claim type, confidence score, source span, linked entities, verification status (unverified/verified/contradicted)
- Claims linked to entities from the EntityExtractor
- Claims distinguished from opinions, hypotheticals, and rhetorical statements
- Source span tracking: exact character ranges so claims are traceable to source
- Support for nested claims and compound statements

**Guardrails:**
- Never mark a claim as "verified" based on AI judgment — only "unverified" or source-flagged
- Distinguish between "source says X" and "Accountability Atlas says X"
- Allegations must be labeled as such
- Do not extract claims from clearly marked opinion or editorial content without labeling
- Legal claims must use the LegalStatus controlled vocabulary

**Tests:**
- ClaimExtractor identifies claims from test documents
- Claim types are correctly classified
- Claims link to entities from EntityExtractor
- Confidence scores are meaningful
- Allegations are correctly labeled
- Source spans are accurate

**Documentation Updates:**
- `docs/ai-pipeline-overview.md` — add claim extraction documentation

**Suggested Commits:**
1. Claim types and schemas
2. Claim extraction prompt
3. ClaimExtractor stage
4. Entity-claim linking
5. Test suite

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Claim extraction identifies and classifies factual claims. Claims link to entities and source spans. Tests pass.

---

#### Prompt M4.2-06: Timeline Extraction

**Goals:** Extract dated events from content. Sequence events chronologically. Link events to sources. Flag date ambiguity.

**Context:** Claim extraction exists (M4.2-05). Need timeline extraction.

**Files Affected:**
- `src/lib/ai/stages/TimelineExtractor.ts` — timeline extraction stage
- `src/lib/ai/types.ts` — add timeline types: TimelineEvent, DatePrecision (exact/month/year/range/ambiguous), EventSequence
- `src/lib/ai/prompts/timeline-extraction.md` — timeline extraction prompt
- `src/lib/ai/__tests__/TimelineExtractor.test.ts`

**Acceptance Criteria:**
- TimelineExtractor identifies: dated events, event descriptions, involved entities, source documents
- Date precision classification: exact (2024-01-26), month (2024-01), year (2024), range (2024-2025), ambiguous ("early 2024", "recently")
- Events sequenced chronologically in output
- Multiple dates for same event consolidated with precision notation
- Ambiguous dates flagged with "date_approximate" marker
- Events linked to: source document spans, extracted entities, extracted claims
- Support for relative dates ("last week", "yesterday") — resolve to approximate absolute dates
- Events without dates identified but flagged as "undated"

**Guardrails:**
- Never fabricate or estimate dates beyond what the source provides
- Undated events must be clearly labeled as such
- Approximate dates must include the precision level
- Multiple conflicting date sources must be preserved as alternatives, not resolved

**Tests:**
- TimelineExtractor extracts events with precise dates
- TimelineExtractor handles ambiguous date formats
- Events are sequenced chronologically
- Undated events are flagged
- Events link to entities and source documents
- Relative date resolution works correctly

**Documentation Updates:**
- `docs/ai-pipeline-overview.md` — add timeline extraction documentation

**Suggested Commits:**
1. Timeline types and schemas
2. Timeline extraction prompt
3. TimelineExtractor stage
4. Chronological sequencing
5. Test suite

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Timeline extraction identifies dated events, sequences them chronologically, and links to sources. Tests pass.

---

#### Prompt M4.2-07: Geographic Extraction

**Goals:** Extract locations from text, generate GeoJSON, apply precision rules, link locations to events.

**Context:** Timeline extraction exists (M4.2-06). Need geographic extraction.

**Files Affected:**
- `src/lib/ai/stages/GeographicExtractor.ts` — geographic extraction stage
- `src/lib/ai/types.ts` — add geographic types: ExtractedLocation, GeoPoint, GeoJSONFeature, LocationPrecision (country/region/city/district/exact/safe)
- `src/lib/ai/prompts/geographic-extraction.md` — geographic extraction prompt
- `src/lib/ai/__tests__/GeographicExtractor.test.ts`

**Acceptance Criteria:**
- GeographicExtractor identifies: country, region/state, city/town, district/neighborhood, named location (hospital, school, camp, checkpoint), geographic feature
- Each location has: name, type, parent location, coordinates (if public and safe), precision level
- Location precision rules enforced: country (default), region (if verified), city (if verified and public), district (only for public infrastructure), exact (NEVER for sensitive locations)
- GeoJSON output: Point features for locations, Polygon features for areas/regions
- Locations linked to: source documents, extracted events, extracted entities
- Precision downgrade: if a source gives exact coordinates for a sensitive location, the system records the precision but downgrades it to "safe" level for public display
- Unlocatable references ("here", "there", "nearby") flagged as unresolvable

**Guardrails:**
- NEVER publish exact locations of: shelters, safe houses, medical facilities still in operation, aid distribution points, checkpoints, individual homes
- Schools and hospitals may be published at city/district level only after verification
- Witness locations must never be published
- Coordinates from OSINT sources must be verified against multiple sources
- The system must enforce "safe precision" — always err on the side of less precision

**Tests:**
- GeographicExtractor identifies locations at multiple levels
- Precision rules are correctly applied
- GeoJSON output is valid
- Sensitive locations are precision-downgraded
- Unlocatable references are flagged
- Locations link to events and entities

**Documentation Updates:**
- `docs/ai-pipeline-overview.md` — add geographic extraction documentation
- Update `docs/ethics-and-safety.md` with geographic safety rules

**Suggested Commits:**
1. Geographic types and precision rules
2. Geographic extraction prompt
3. GeographicExtractor stage
4. GeoJSON generation
5. Precision enforcement
6. Test suite

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Geographic extraction identifies locations with safe precision. GeoJSON output is valid. Sensitive locations are protected. Tests pass.

---

#### Prompt M4.2-08: Relationship Detection

**Goals:** Detect relationships between entities. Build relationship graph edges.

**Context:** Entity, claim, timeline, and geographic extraction exist (M4.2-04 through M4.2-07). Need to connect them.

**Files Affected:**
- `src/lib/ai/stages/RelationshipDetector.ts` — relationship detection stage
- `src/lib/ai/types.ts` — add relationship types: EntityRelationship, RelationshipType (affiliation/association/location/temporal/causal/documentary), RelationshipStrength
- `src/lib/ai/prompts/relationship-detection.md` — relationship detection prompt
- `src/lib/ai/__tests__/RelationshipDetector.test.ts`

**Acceptance Criteria:**
- RelationshipDetector identifies relationships between: person-organization (works for, represents, leads), person-person (co-defendant, colleague), organization-organization (partner, member of, funder), event-location (occurred at), event-person (involved), claim-source (supported by), entity-document (mentioned in)
- Each relationship has: source entity, target entity, relationship type, direction (directed/undirected), strength (strong/weak/inferred), source span, confidence score
- Temporal relationships: event A before event B, event during event C
- Causal relationships: event A caused/contributed to event B (only if explicit in source)
- Documentary relationships: entity mentioned in document, claim from source
- Output structured as graph edges for knowledge graph ingestion (M4.6)
- Relationship deduplication: same relationship from multiple sources increases confidence

**Guardrails:**
- Causal relationships must be explicitly stated in source — never infer causation
- "Inferred" relationships must be clearly labeled as such
- Do not create relationships based on speculation or proximity alone
- Person-organization relationships require explicit source mention
- Confidence must reflect source quality, not just quantity

**Tests:**
- RelationshipDetector identifies all required relationship types
- Relationship types are correctly classified
- Source spans are accurate
- Causal relationships only extracted when explicit
- Inferred relationships correctly labeled
- Output formatted as graph edges

**Documentation Updates:**
- `docs/ai-pipeline-overview.md` — add relationship detection documentation

**Suggested Commits:**
1. Relationship types and schemas
2. Relationship detection prompt
3. RelationshipDetector stage
4. Deduplication and confidence scoring
5. Test suite

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Relationship detection identifies and types connections between entities. Output structured for knowledge graph. Tests pass.

---

#### Prompt M4.2-09: Topic Classification

**Goals:** Classify content into the evidence taxonomy. Multi-label classification with confidence scores.

**Context:** Relationship detection exists (M4.2-08). Need topic classification.

**Files Affected:**
- `src/lib/ai/stages/TopicClassifier.ts` — topic classification stage
- `src/lib/ai/types.ts` — add topic types: TopicClassification, EvidenceCategory, MultiLabelResult
- `src/lib/ai/prompts/topic-classification.md` — topic classification prompt
- `src/data/evidenceCategories.ts` — evidence category definitions (extracted from evidence data)
- `src/lib/ai/__tests__/TopicClassifier.test.ts`

**Acceptance Criteria:**
- TopicClassifier classifies content into evidence categories: civilian casualties, infrastructure damage, journalists/media workers, medical workers/healthcare, aid obstruction, food/water/sanitation, forced displacement, housing/cultural destruction, detention/mistreatment, torture allegations, mass graves, public incitement, arms transfers, humanitarian access restrictions, ceasefire violations
- Multi-label classification: content may belong to multiple categories with per-category confidence
- Each classification includes: category, confidence score, supporting evidence from text, alternative categories considered
- Classification at document level and paragraph level
- Hierarchical classification: broad categories (humanitarian, legal, political) -> specific categories
- Content outside defined categories flagged as "uncategorized" for human review
- Category definitions stored in evidenceCategories.ts for transparency

**Guardrails:**
- Never force a classification — "uncategorized" is a valid output
- Do not conflate topic classification with verification status
- A document can be about "civilian casualties" without the casualty numbers being verified
- Classification confidence must be calibrated against human-labeled test data
- Category taxonomy must be versioned

**Tests:**
- TopicClassifier assigns correct categories to test documents
- Multi-label output includes all relevant categories
- Confidence scores differentiate clear vs. borderline cases
- Paragraph-level classification works
- Uncategorized content correctly identified
- Category definitions are valid against evidence taxonomy

**Documentation Updates:**
- `docs/ai-pipeline-overview.md` — add topic classification documentation
- `docs/data-field-dictionary.md` — add evidence category definitions

**Suggested Commits:**
1. Evidence category definitions
2. Topic classification prompt
3. TopicClassifier stage
4. Multi-label output handling
5. Test suite

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Topic classification assigns evidence categories with multi-label confidence. Tests pass.

---

#### Prompt M4.2-10: Duplicate Detection

**Goals:** Detect when new content describes an already-known event. Propose merges. Prevent duplicate events in the system.

**Context:** Topic classification exists (M4.2-09). Need duplicate detection.

**Files Affected:**
- `src/lib/ai/stages/DuplicateDetector.ts` — duplicate detection stage
- `src/lib/ai/types.ts` — add duplicate types: DuplicateGroup, MergeProposal, SimilarityScore, MatchField
- `src/lib/ai/prompts/duplicate-detection.md` — duplicate detection prompt
- `src/lib/ai/__tests__/DuplicateDetector.test.ts`

**Acceptance Criteria:**
- DuplicateDetector compares new content against existing records
- Similarity scoring based on: event description, date proximity, location match, entity overlap, source type
- Match levels: exact duplicate (same event, same source), near duplicate (same event, different source), related (same topic, different event), new (no match)
- Merge proposals include: primary record, duplicate records, merge rationale, confidence score, fields to merge
- Cross-source deduplication: same event reported by different sources is detected
- Date-based deduplication: same event on same date from different sources is flagged
- Text similarity using: named entity overlap, date/location match, temporal proximity, semantic similarity
- Configurable thresholds per match level

**Guardrails:**
- Never auto-merge without human review for sensitive content (legal, casualty)
- Similarity thresholds must be conservative — prefer false negatives over false positives
- Do not merge records with conflicting factual claims
- Source provenance must be preserved in merged records
- Merge proposals are suggestions, not actions

**Tests:**
- DuplicateDetector identifies exact duplicates
- DuplicateDetector identifies near duplicates across sources
- Similarity scoring is consistent
- Merge proposals contain required fields
- No false merges for clearly distinct events
- Date-based deduplication works correctly

**Documentation Updates:**
- `docs/ai-pipeline-overview.md` — add duplicate detection documentation

**Suggested Commits:**
1. Duplicate types and schemas
2. Duplicate detection prompt
3. Similarity scoring
4. DuplicateDetector stage
5. Merge proposal generation
6. Test suite

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Duplicate detection identifies and proposes merges for duplicate events. Tests pass.

---

#### Prompt M4.2-11: Contradiction Detection

**Goals:** Flag when claims contradict existing verified records. Alert for human review. Do NOT auto-resolve contradictions.

**Context:** Duplicate detection exists (M4.2-10). Need contradiction detection.

**Files Affected:**
- `src/lib/ai/stages/ContradictionDetector.ts` — contradiction detection stage
- `src/lib/ai/types.ts` — add contradiction types: ContradictionReport, ContradictionType (numerical/factual/temporal/source/source_quality), ResolutionState
- `src/lib/ai/prompts/contradiction-detection.md` — contradiction detection prompt
- `src/lib/ai/__tests__/ContradictionDetector.test.ts`

**Acceptance Criteria:**
- ContradictionDetector compares new claims against existing verified records
- Contradiction types: numerical (different casualty counts), factual (conflicting event descriptions), temporal (different dates for same event), source-source (two verified sources contradict each other), source-quality (lower-quality source contradicts higher-quality record)
- Each contradiction includes: claim pair, contradiction type, severity (critical/major/minor/informational), conflicting fields, source references for both claims, recommendation (flag for review / request clarification / monitor)
- Contradiction resolution states: unresolved, under_review, resolved_one_correct, resolved_both_partial, resolved_outdated_source
- Resolution tracking: who reviewed, what was decided, when, rationale
- Alert system: critical contradictions trigger immediate notification for human review
- Do NOT auto-resolve — all contradictions require human judgment

**Guardrails:**
- NEVER auto-resolve a contradiction — all require human review
- Do not delete or modify the original claims — preserve both sides
- "Resolved" does not mean "deleted" — the resolution process is transparent
- Contradictions between verified sources must be escalated to expert review
- Numerical contradictions must preserve both numbers with source attribution

**Tests:**
- ContradictionDetector identifies numerical contradictions
- ContradictionDetector identifies factual contradictions
- Contradiction types are correctly classified
- Severity ratings are meaningful
- Resolution states track correctly
- No auto-resolution occurs
- Alert triggers for critical contradictions

**Documentation Updates:**
- `docs/ai-pipeline-overview.md` — add contradiction detection documentation
- `docs/correction-policy.md` — update with contradiction resolution guidance

**Suggested Commits:**
1. Contradiction types and schemas
2. Contradiction detection prompt
3. ContradictionDetector stage
4. Severity classification
5. Alert integration
6. Test suite

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Contradiction detection flags conflicting claims for human review. No auto-resolution. Tests pass.

---

#### Prompt M4.2-12: Confidence Estimation and Hallucination Mitigation

**Goals:** Build confidence scoring for every AI output. Source span verification. Cross-reference checks. Hallucination detection.

**Context:** All AI pipeline stages exist (M4.2-01 through M4.2-11). Need confidence calibration and hallucination safety.

**Files Affected:**
- `src/lib/ai/stages/ConfidenceEstimator.ts` — confidence estimation: calibrates confidence scores across all AI stages, applies source quality weighting
- `src/lib/ai/stages/HallucinationDetector.ts` — hallucination detection: cross-references claims against source text, flags unsupported claims, checks numerical consistency
- `src/lib/ai/types.ts` — add confidence/hallucination types: ConfidenceReport, HallucinationFlag, CrossReferenceResult, SourceSpanVerification
- `src/lib/ai/prompts/confidence-estimation.md` — confidence estimation prompt
- `src/lib/ai/prompts/hallucination-detection.md` — hallucination detection prompt
- `src/lib/ai/__tests__/ConfidenceEstimator.test.ts`
- `src/lib/ai/__tests__/HallucinationDetector.test.ts`

**Acceptance Criteria:**
- ConfidenceEstimator calibrates confidence scores from all AI stages into unified confidence (0-1)
- Source quality weighting: higher-quality sources (court documents, UN reports) increase confidence; lower-quality sources (social media, single-source journalism) decrease confidence
- Confidence factors: source quality, extraction consistency, cross-source agreement, temporal relevance, language confidence
- HallucinationDetector cross-references each claim against source text spans
- Hallucination flags: unsupported_claim (no source evidence), numerical_mismatch (numbers don't match source), entity_hallucination (entity not in source), relationship_hallucination (relationship not in source), temporal_hallucination (date not in source)
- Hallucination severity: critical (factually incorrect), major (unsupported by source), minor (extrapolation beyond source), informational (potential ambiguity)
- Low-confidence outputs (<0.6) are flagged for priority human review
- Hallucination detection tests: known hallucination test cases, adversarial examples, numerical consistency tests

**Guardrails:**
- Confidence scores must never exceed 1.0
- Any output with detected hallucinations must be blocked from publication
- Hallucination detection is a safety layer — it should prefer false positives over false negatives
- Low-confidence outputs must never bypass human review
- Hallucination detection tests must be updated as new failure modes are discovered
- Confidence calibration must use ground-truth test data

**Tests:**
- ConfidenceEstimator calibrates scores correctly
- Source quality weighting affects confidence appropriately
- HallucinationDetector identifies unsupported claims
- HallucinationDetector identifies numerical mismatches
- HallucinationDetector identifies entity hallucinations
- Hallucination severity classification is correct
- Low-confidence outputs flagged for review
- Adversarial test cases: fabricated claims, plausible-sounding falsehoods, source-aware falsehoods

**Documentation Updates:**
- `docs/ai-pipeline-overview.md` — add confidence and hallucination documentation
- `docs/ai-prompt-guidelines.md` — add hallucination mitigation guidelines

**Suggested Commits:**
1. Confidence and hallucination types
2. ConfidenceEstimator stage
3. HallucinationDetector stage
4. Prompt templates
5. Adversarial test suite (known hallucination cases, numerical tests, entity tests)
6. Confidence calibration with ground truth

**Rollback Considerations:** Revert individual commits. This is a safety-critical layer — any regression must be caught by tests.

**Definition of Done:** Every AI output has a calibrated confidence score. Hallucination detection catches unsupported claims. Low-confidence outputs require human review. Adversarial tests pass.

---

### M4.3 — Review Queue System

#### Prompt M4.3-01: Review Queue Data Model and API

**Goals:** Define the review queue schema and build the queue backend. Review items, assignments, states, and transitions.

**Context:** AI pipeline (M4.2) produces outputs that need human review. Need the review queue.

**Files Affected:**
- `src/lib/review/types.ts` — review types: ReviewItem, ReviewState (new/assigned/in_review/changes_requested/approved/published/rejected), ReviewAssignment, ReviewComment, ReviewChecklist
- `src/lib/review/ReviewQueue.ts` — queue management: enqueue, dequeue, reorder, priority sorting
- `src/lib/review/ReviewStateMachine.ts` — state machine: state transitions, valid transitions, transition guards, transition hooks
- `src/lib/review/ReviewPriority.ts` — priority system: priority calculation (high-risk content first), priority factors, SLA tracking
- `src/lib/review/ReviewPersistence.ts` — persistence interface: save, load, query, paginate (initially local storage, later API)
- `src/lib/review/schemas.ts` — Zod schemas for review types
- `src/schemas/index.ts` — add review schemas
- `src/lib/review/__tests__/ReviewQueue.test.ts`
- `src/lib/review/__tests__/ReviewStateMachine.test.ts`
- `src/lib/review/__tests__/ReviewPriority.test.ts`

**Acceptance Criteria:**
- ReviewItem includes: id, source content reference, AI output, content type, priority, state, assigned reviewer, due by, comments, checklists, SLA target
- Review states and transitions: New -> Assigned, Assigned -> In Review, In Review -> Changes Requested, In Review -> Approved, Changes Requested -> In Review, Approved -> Published, Published -> Archived, any -> Rejected
- Priority calculation based on: content risk level (legal > casualty > testimony > humanitarian > general), source type (court > UN > NGO > media), contradiction flags, detection of hallucinations
- SLA tracking: time in each state, expected completion time, overdue alerts
- Queue ordering: priority first, then FIFO within same priority
- Comments: reviewers can add comments at each state, comments are versioned
- Checklists per review type: content-type-specific review checklists
- Persistence interface supports: enqueue, dequeue, update state, add comment, query by state/priority/assignee, paginate
- All state transitions are validated — invalid transitions are rejected

**Guardrails:**
- State transitions must be validated — no skipping required review stages
- High-priority items must always be dequeued before normal priority
- SLA tracking must not pressure reviewers to rush — SLAs are for queue management, not reviewer performance targets
- Review comments must never contain personal identifiable information
- Checklist items must be content-type-specific, not generic

**Tests:**
- ReviewItem can be created with all required fields
- State transitions follow the valid state machine
- Invalid transitions are rejected
- Priority calculation correctly prioritizes high-risk content
- Queue ordering respects priority then FIFO
- Comments are properly versioned
- Checklists validate against content type
- Persistence round-trips correctly

**Documentation Updates:**
- Create `docs/review-queue-overview.md` — architecture and usage

**Suggested Commits:**
1. Review types, schemas, and state machine
2. ReviewQueue with priority ordering
3. ReviewPersistence interface
4. Checklist system
5. Test suite

**Rollback Considerations:** Revert individual commits. Review queue is backend infrastructure — does not affect public pages.

**Definition of Done:** Review queue data model and API are built and tested. Valid state transitions enforced. Priority system works.

---

#### Prompt M4.3-02: Review Assignment and Routing

**Goals:** Build assignment logic: round-robin, expertise-based, load-based. Priority system with SLA tracking.

**Context:** Review queue data model exists (M4.3-01). Need assignment and routing.

**Files Affected:**
- `src/lib/review/AssignmentRouter.ts` — assignment routing: routes review items to appropriate reviewers based on content type, expertise, and workload
- `src/lib/review/ReviewerRegistry.ts` — reviewer registry: reviewer profiles, expertise areas, workload caps, availability status
- `src/lib/review/SLATracker.ts` — SLA tracking: configurable SLAs per content type, overdue detection, escalation triggers
- `src/lib/review/types.ts` — add assignment types: AssignmentStrategy (round_robin/expertise/load_balanced/manual), ReviewerProfile, WorkloadMetrics
- `src/lib/review/__tests__/AssignmentRouter.test.ts`
- `src/lib/review/__tests__/ReviewerRegistry.test.ts`
- `src/lib/review/__tests__/SLATracker.test.ts`

**Acceptance Criteria:**
- AssignmentRouter supports strategies: round_robin (equally distribute), expertise (match by reviewer expertise), load_balanced (consider current workload), manual (human assigns)
- ReviewerRegistry stores: reviewer id, name (internal only), expertise areas (legal, translation, editorial, country, institution), content type skills, max workload, current workload, availability
- Workload tracking: active assignments, completed today, average review time, queue depth per reviewer
- SLA tracking per content type: target review time, warning threshold, overdue threshold, escalation path
- Escalation: when SLA is breached, reassign or notify admin
- Expertise matching uses: content type (legal -> legal reviewers), language (translation -> language reviewers), topic (country data -> country experts)
- Assignment transparency: each assignment records strategy used and rationale
- Reviewer workload caps prevent overload

**Guardrails:**
- Reviewer personal information must be stored securely — never exposed in public code
- Workload caps must be respected — never assign beyond capacity
- SLA escalation must not harass reviewers
- Expertise-based assignment must not create bottlenecks on rare expertise
- Manual override must always be possible

**Tests:**
- AssignmentRouter assigns using round-robin strategy
- AssignmentRouter assigns using expertise strategy
- AssignmentRouter assigns using load-balanced strategy
- ReviewerRegistry tracks workload correctly
- SLATracker detects overdue items
- Escalation triggers correctly
- Workload caps prevent over-assignment

**Documentation Updates:**
- `docs/review-queue-overview.md` — add assignment documentation
- Create `docs/reviewer-guide.md` — reviewer onboarding and expectations

**Suggested Commits:**
1. Reviewer registry types and implementation
2. Assignment router (all strategies)
3. SLA tracker
4. Escalation logic
5. Test suite

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Review assignment routes items to appropriate reviewers. SLA tracking monitors review times. Tests pass.

---

#### Prompt M4.3-03: Legal and Translation Review Interfaces

**Goals:** Build review UI for legal review and translation review. Side-by-side view (AI proposal vs. original source). Quick actions. Review notes.

**Context:** Review assignment exists (M4.3-02). Need the review interfaces.

**Files Affected:**
- `src/pages/review/LegalReviewPage.tsx` — legal review interface
- `src/pages/review/TranslationReviewPage.tsx` — translation review interface
- `src/components/review/SideBySideView.tsx` — side-by-side comparison: AI output vs. original source
- `src/components/review/ReviewChecklist.tsx` — checklist: per-review-type items with pass/fail/na
- `src/components/review/ReviewActions.tsx` — quick actions: approve, request changes, reject, add note
- `src/components/review/ReviewHistory.tsx` — review history: previous reviews, comments, state changes
- `src/components/review/ReviewNotes.tsx` — notes editor: add/edit review notes
- `src/components/review/LegalChecklist.tsx` — legal review checklist: wording accuracy, source attribution, status labeling, terminology compliance
- `src/components/review/TranslationChecklist.tsx` — translation review checklist: terminology consistency, named entity preservation, fluency, accuracy
- `src/lib/review/legalChecklist.ts` — legal review checklist items
- `src/lib/review/translationChecklist.ts` — translation review checklist items

**Acceptance Criteria:**
- Legal review interface shows: AI proposal, original source, legal status labels, source references, wording suggestions
- Translation review interface shows: source language text, translated text, named entity highlight, term consistency check
- Side-by-side view: resizable panels, synchronized scrolling, source highlights
- Legal checklist: legal status accuracy, source attribution correct, terminology policy compliance, no overstatement, appropriate labeling
- Translation checklist: all named entities preserved, legal terms correctly translated, fluency in target language, original meaning preserved, cultural context considered
- Quick actions: approve (with optional notes), request changes (with required notes), reject (with required reason), add note
- Review history shows: all previous reviews, state changes, comments (timeline view)
- Review state updates propagate to the ReviewQueue

**Guardrails:**
- Legal review must use the LegalStatus controlled vocabulary
- Translation review must flag any automated translation as "AI-assisted — human reviewed"
- Review actions are irreversible once published — require confirmation dialog
- Notes must not contain personal identifiable information
- Side-by-side view must respect reduced-motion preferences

**Tests:**
- LegalReviewPage renders with proposal and source
- SideBySideView synchronizes scrolling
- Legal checklist includes all required items
- Translation checklist includes all required items
- Quick actions update review state
- Review history displays correctly
- State changes propagate to ReviewQueue

**Documentation Updates:**
- `docs/review-queue-overview.md` — add legal and translation review documentation
- `docs/legal-wording-review-checklist.md` — update with AI review guidance

**Suggested Commits:**
1. Side-by-side view component
2. Legal checklist and review interface
3. Translation checklist and review interface
4. Quick actions and review history
5. State propagation to queue

**Rollback Considerations:** Revert individual commits. Review pages are admin-only — do not affect public routes.

**Definition of Done:** Legal and translation review interfaces exist with side-by-side view, checklists, and quick actions. Tests pass.

---

#### Prompt M4.3-04: Editorial, Country, and Institution Review Interfaces

**Goals:** Build review UI for editorial review, country review, and institution review. Specialized checklists per review type.

**Context:** Legal/translation review exists (M4.3-03). Need editorial and country/institution review.

**Files Affected:**
- `src/pages/review/EditorialReviewPage.tsx` — editorial review interface
- `src/pages/review/CountryReviewPage.tsx` — country page review interface
- `src/pages/review/InstitutionReviewPage.tsx` — institution page review interface
- `src/components/review/EditorialChecklist.tsx` — editorial checklist: tone, clarity, evidence support, audience appropriateness
- `src/components/review/CountryChecklist.tsx` — country review checklist: position accuracy, voting records, source verification, arms transfer data, aid data
- `src/components/review/InstitutionChecklist.tsx` — institution review checklist: institutional accuracy, competency boundaries, action template relevance
- `src/components/review/ReviewSummary.tsx` — review summary: all checklists passed, key findings, recommendations
- `src/lib/review/editorialChecklist.ts`
- `src/lib/review/countryChecklist.ts`
- `src/lib/review/institutionChecklist.ts`

**Acceptance Criteria:**
- Editorial review checklist: tone matches brand guidelines, moral clarity without dehumanization, evidence supports all claims, appropriate for target audience, sources linked, labels correct, correction route present
- Country review checklist: current federal/institutional position accurate, UN voting records verified, arms transfer policy correctly documented, humanitarian aid data sourced, ICC/ICJ cooperation stance documented, contact routes verified, no accountability score shown
- Institution review checklist: institutional role accurately described, competency boundaries correct, legal basis cited, action templates jurisdiction-appropriate, sources for each position, EU-specific distinctions respected
- Review summary shows: overall status, checklist results (passed/failed/na per item), reviewer notes, recommendation
- All review types share the same base components (SideBySideView, ReviewActions, ReviewHistory) with type-specific checklists
- Review state propagation to the parent content record

**Guardrails:**
- Country and institution reviews must verify source dates — outdated positions must be flagged
- Do not publish country positions without current source verification
- Institutional competency boundaries must be legally accurate (EU vs. national vs. shared)
- Editorial review must check for hate speech, incitement, and dehumanization language
- Review summaries are internal — never published as content

**Tests:**
- EditorialChecklist includes all required items
- CountryChecklist includes all required items
- InstitutionChecklist includes all required items
- ReviewSummary aggregates checklist results
- State changes propagate to parent records
- Base components are shared across review types

**Documentation Updates:**
- `docs/review-queue-overview.md` — add editorial, country, institution review documentation
- Update `docs/content-review-workflow.md` with AI-assisted review workflows

**Suggested Commits:**
1. Editorial checklist and review interface
2. Country checklist and review interface
3. Institution checklist and review interface
4. Review summary component
5. State propagation

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Editorial, country, and institution review interfaces exist with specialized checklists. Tests pass.

---

#### Prompt M4.3-05: Correction Workflow

**Goals:** Build correction submission and review workflow. Categories, moderation, public logging for major corrections.

**Context:** All review interfaces exist (M4.3-03/04). Need correction submission and review.

**Files Affected:**
- `src/pages/review/CorrectionReviewPage.tsx` — correction review interface (admin)
- `src/pages/CorrectionsPage.tsx` — public corrections page (update to show status)
- `src/components/review/CorrectionList.tsx` — correction queue list
- `src/components/review/CorrectionDetail.tsx` — correction detail with apply/reject workflow
- `src/components/review/CorrectionApplyDialog.tsx` — confirmation dialog for applying corrections
- `src/lib/review/CorrectionManager.ts` — correction management: categories, moderation queue, application logic
- `src/lib/review/types.ts` — add correction types: CorrectionSubmission, CorrectionCategory, CorrectionResolution
- `src/data/correctionCategories.ts` — correction categories data
- `src/lib/review/__tests__/CorrectionManager.test.ts`

**Acceptance Criteria:**
- Correction categories: factual_error, outdated_source, wrong_location_date, unsafe_personal_info, mistranslation, legal_wording, broken_link, duplicate, misleading_framing, licensing_attribution
- Correction submission: public form with category, target page/section, description, optional source URL, optional contact
- Correction review workflow: New -> Under Review -> Applied / Rejected / Disputed / Archived
- Correction application: updates target content, records correction in public log, updates version
- Correction types: update (fix content), downgrade (reduce verification level), dispute (maintain content with noted dispute), archive (remove from public), withdraw (submitter retracts), remove (delete content)
- Public correction log: timestamp, category, target, resolution, summary (no personal data)
- Major correction categories (factual_error, unsafe_personal_info, legal_wording) always logged publicly
- Minor corrections (broken_link, duplicate) logged internally but may be batched
- Correction notification: integrated with review queue for affected reviewers

**Guardrails:**
- Correction submissions must not collect personal data beyond optional contact info
- Submitter identity must not be exposed in public correction logs
- Corrections affecting legal or casualty content must be escalated to appropriate reviewer
- Apply correction action must create a versioned record of the change
- Correction rejections must include rationale
- Unsafe personal info corrections must be applied immediately — no unnecessary delay

**Tests:**
- Correction submission creates a correction record
- Correction review workflow state transitions
- Correction application updates target content
- Public log records major corrections
- Correction categories are all valid
- Escalation to appropriate reviewer
- No personal data in public log

**Documentation Updates:**
- `docs/correction-policy.md` — update with AI-assisted correction workflows
- `docs/review-queue-overview.md` — add correction workflow documentation

**Suggested Commits:**
1. Correction types and categories
2. Correction submission form (public)
3. CorrectionManager (moderation queue, application logic)
4. Correction review interface (admin)
5. Public correction log
6. Test suite

**Rollback Considerations:** Revert individual commits. The correction workflow is additive to existing pages.

**Definition of Done:** Correction workflow allows public submission, admin review, and public logging of major corrections. Tests pass.

---

### M4.4 — Intelligence Dashboard

#### Prompt M4.4-01: Pipeline Monitoring Dashboard

**Goals:** Build admin dashboard showing sources monitored, content ingested, AI pipeline throughput and latency, error rates.

**Context:** All collectors and AI pipeline exist (M4.1, M4.2). Need unified monitoring.

**Files Affected:**
- `src/pages/admin/PipelineDashboard.tsx` — main pipeline monitoring dashboard
- `src/components/admin/SourceOverviewPanel.tsx` — sources: monitored/active/degraded/failed counts
- `src/components/admin/IngestionChart.tsx` — content ingested per period (bar/line chart)
- `src/components/admin/AIPipelineMetrics.tsx` — AI pipeline: throughput, latency, error rate per stage
- `src/components/admin/CollectorStatusGrid.tsx` — per-collector status with health indicators
- `src/components/admin/ErrorRateChart.tsx` — error rates over time
- `src/lib/admin/metrics.ts` — metrics aggregation and query functions
- `src/lib/admin/types.ts` — admin types: DashboardMetrics, PipelineMetrics, CollectorMetrics

**Acceptance Criteria:**
- Source overview shows: total sources, active, degraded, failed counts
- Ingestion chart shows: content items per day/week/month, by source type
- AI pipeline metrics: throughput (items processed per period), latency (p50/p95/p99 per stage), error rate per stage
- Collector status grid: all collectors listed with last fetch, health status, items collected, error count
- Error rate chart: errors over time, by source type, by error category
- Time range selector: last hour, 24 hours, 7 days, 30 days, custom
- Auto-refresh: configurable interval (30s, 60s, 5min)
- Data sourced from monitoring system (M4.1-08)

**Guardrails:**
- Dashboard is admin-only — never exposed on public routes
- Do not display actual API keys, credentials, or internal access tokens
- Metrics aggregation must not impact collector performance
- Error rate charts must not identify individual reviewers
- Auto-refresh must have a configurable maximum rate

**Tests:**
- PipelineDashboard renders all panels
- SourceOverviewPanel shows correct counts
- IngestionChart renders with test data
- AIPipelineMetrics shows correct throughput and latency
- ErrorRateChart renders with test data
- Time range selector filters data correctly

**Documentation Updates:**
- Create `docs/admin-dashboard-guide.md` — dashboard usage

**Suggested Commits:**
1. Admin types and metrics functions
2. SourceOverviewPanel and CollectorStatusGrid
3. IngestionChart and ErrorRateChart
4. AIPipelineMetrics
5. PipelineDashboard layout
6. Time range and auto-refresh

**Rollback Considerations:** Revert individual commits. Admin pages do not affect public routes.

**Definition of Done:** Pipeline monitoring dashboard displays source, ingestion, and AI pipeline metrics. Tests pass.

---

#### Prompt M4.4-02: Review Queue Metrics Dashboard

**Goals:** Build dashboard for review queue depth, age, throughput, reviewer performance, SLA compliance, bottleneck detection.

**Context:** Pipeline monitoring dashboard exists (M4.4-01). Need review-specific metrics.

**Files Affected:**
- `src/pages/admin/ReviewMetricsDashboard.tsx` — review queue metrics dashboard
- `src/components/admin/ReviewQueueDepth.tsx` — queue depth per state (new/assigned/in-review/changes-requested)
- `src/components/admin/ReviewAgeChart.tsx` — age distribution of items in queue
- `src/components/admin/ReviewThroughputChart.tsx` — items reviewed per day/week
- `src/components/admin/ReviewerPerformanceTable.tsx` — reviewer metrics: completed, avg time, SLA compliance
- `src/components/admin/SLAComplianceChart.tsx` — SLA compliance rate over time
- `src/components/admin/BottleneckPanel.tsx` — bottleneck detection: items stuck in state, unassigned items, overdue items
- `src/lib/admin/reviewMetrics.ts` — review metrics query functions

**Acceptance Criteria:**
- Queue depth: items per state (new, assigned, in review, changes requested) with counts
- Age distribution: histogram of items by days in queue (0-1d, 1-3d, 3-7d, 7-14d, 14d+)
- Throughput: items reviewed per day/week/month with trend line
- Reviewer performance: name (internal), completed count, average review time, SLA compliance %, current workload
- SLA compliance: overall rate, per content type, per reviewer, trend over time
- Bottleneck detection: items stuck in state > threshold, items unassigned > threshold, items overdue on SLA, reviewers at max capacity
- Exportable reports: CSV download of metrics

**Guardrails:**
- Reviewer performance metrics are internal — never published
- Do not identify individual reviewers in any public-facing output
- Bottleneck detection must distinguish between "waiting for reviewer" and "under active review"
- Metrics should be used for queue management, not individual performance evaluation

**Tests:**
- ReviewMetricsDashboard renders all panels
- Queue depth shows correct counts per state
- Age distribution renders correctly
- Throughput chart shows trend
- ReviewerPerformanceTable renders with test data
- SLA compliance calculates correctly
- Bottleneck detection identifies problem areas

**Documentation Updates:**
- `docs/admin-dashboard-guide.md` — add review metrics documentation

**Suggested Commits:**
1. Review metrics query functions
2. Queue depth and age panels
3. Throughput and SLA charts
4. Reviewer performance table
5. Bottleneck detection
6. CSV export

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Review queue metrics dashboard shows depth, age, throughput, SLA compliance, and bottlenecks. Tests pass.

---

#### Prompt M4.4-03: Data Quality Dashboard

**Goals:** Build dashboard for confidence score distributions, contradiction rates, duplicate rates, source coverage gaps, data freshness.

**Context:** Review metrics dashboard exists (M4.4-02). Need data quality metrics.

**Files Affected:**
- `src/pages/admin/DataQualityDashboard.tsx` — data quality metrics dashboard
- `src/components/admin/ConfidenceDistribution.tsx` — confidence score histogram across all AI outputs
- `src/components/admin/ContradictionRatePanel.tsx` — contradiction rate by content type, by source type
- `src/components/admin/DuplicateRatePanel.tsx` — duplicate detection rate by source type
- `src/components/admin/SourceCoverageMap.tsx` — source coverage: which countries/regions have sources, which are gaps
- `src/components/admin/DataFreshnessPanel.tsx` — data freshness: age of last update per content category
- `src/components/admin/DataQualityTrend.tsx` — quality metrics trend over time
- `src/lib/admin/qualityMetrics.ts` — quality metrics query functions

**Acceptance Criteria:**
- Confidence distribution: histogram of confidence scores across all AI pipeline outputs, per stage
- Contradiction rate: contradictions per content type, contradictions per source type, unresolved contradictions count
- Duplicate rate: duplicate detections per source type, false positive rate, merge rate
- Source coverage: map or grid showing which countries/regions have sources, which are gaps, source type distribution per region
- Data freshness: age of last update per category (evidence, legal cases, countries, institutions, organizations, actions), items not updated within configured freshness threshold
- Quality trends: weekly/monthly trends for confidence, contradiction rate, duplicate rate, freshness score
- Actionable alerts: when data quality metrics fall below thresholds

**Guardrails:**
- Quality metrics are internal — never expose on public pages
- Contradiction and duplicate rates should be used to improve the pipeline, not to judge content
- Source coverage gaps should drive collector prioritization
- Data freshness thresholds must be configurable per content type
- Quality metrics dashboards must not expose underlying content

**Tests:**
- DataQualityDashboard renders all panels
- ConfidenceDistribution renders histogram
- ContradictionRatePanel calculates correct rates
- DuplicateRatePanel shows correct rates
- SourceCoverageMap shows gaps correctly
- DataFreshnessPanel identifies stale content
- Quality trends calculate correctly over time windows

**Documentation Updates:**
- `docs/admin-dashboard-guide.md` — add data quality documentation
- `docs/quality-and-testing.md` — update with quality metrics

**Suggested Commits:**
1. Quality metrics query functions
2. Confidence distribution panel
3. Contradiction and duplicate rate panels
4. Source coverage and freshness panels
5. Quality trends panel
6. Quality threshold alerts

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Data quality dashboard shows confidence, contradiction, duplicate, coverage, and freshness metrics. Tests pass.

---

### M4.5 — Maps and Geospatial

#### Prompt M4.5-01: Map Foundation (MapLibre + GeoJSON)

**Goals:** Set up MapLibre GL with OpenStreetMap base tiles. Build the base map component with GeoJSON layer system and layer toggling.

**Context:** Geographic extraction exists (M4.2-07) produces GeoJSON. Need the map to display it.

**Files Affected:**
- `package.json` — add maplibre-gl dependency
- `src/components/map/MapContainer.tsx` — base map component: MapLibre GL initialization, tile loading, viewport management
- `src/components/map/MapLayer.tsx` — map layer component: adds/removes GeoJSON layers, style configuration
- `src/components/map/MapControls.tsx` — map controls: zoom, fullscreen, layer toggles, legend
- `src/components/map/MapLegend.tsx` — map legend: color/symbol meanings per layer type
- `src/components/map/MapPopup.tsx` — popup: click feature to show details
- `src/lib/map/types.ts` — map types: MapLayerConfig, MapFeature, MapViewport, LayerVisibility
- `src/lib/map/layers.ts` — layer definitions and configurations
- `src/lib/map/sources.ts` — GeoJSON sources management
- `src/components/map/__tests__/MapContainer.test.ts`
- `src/components/map/__tests__/MapLayer.test.ts`

**Acceptance Criteria:**
- MapLibre GL renders with OpenStreetMap base tiles
- Base map component accepts: center, zoom, bounds, style options
- GeoJSON layer system: add/remove/toggle layers, layer ordering, style configuration
- Layer toggling: individual layer visibility, layer groups (events, sources, organizations, legal, infrastructure)
- Map controls: zoom in/out, fullscreen toggle, layer switcher panel, legend
- Popup: click on feature shows title, description, source link, date (safe precision only)
- Responsive: map resizes with container, mobile-friendly controls
- Performance: layer visibility toggling does not re-render entire map
- Multiple coordinate systems supported (WGS84 default)

**Guardrails:**
- Map tiles must respect OpenStreetMap usage policy
- No sensitive locations published at unsafe precision
- Map must work without JavaScript? No — map is interactive only
- No auto-centering on user location without explicit permission
- Coordinate storage must use safe precision for public display

**Tests:**
- MapContainer initializes with MapLibre GL
- MapLayer adds/removes GeoJSON sources and layers
- Layer toggling changes visibility correctly
- Popup displays feature details on click
- Map controls (zoom, fullscreen, layer switcher) work
- Map resizes correctly in responsive container

**Documentation Updates:**
- Create `docs/map-architecture.md` — map implementation guide

**Suggested Commits:**
1. MapLibre GL setup and MapContainer component
2. GeoJSON layer system and MapLayer component
3. Map controls (zoom, fullscreen, layer switcher)
4. Map legend and popup components
5. Layer configuration and types
6. Test suite

**Rollback Considerations:** Revert individual commits. Map components do not affect existing pages.

**Definition of Done:** Base map renders with OpenStreetMap tiles. GeoJSON layer system works. Layer toggling and popups functional. Tests pass.

---

#### Prompt M4.5-02: Event and Source Map Layers

**Goals:** Build map layers for documented events (safe precision) and sources. Timeline integration. Safety rules enforced.

**Context:** Base map exists (M4.5-01). Need event and source layers.

**Files Affected:**
- `src/lib/map/layers/EventLayer.ts` — event data layer: documented events from evidence/claims data, safe precision enforced
- `src/lib/map/layers/SourceLayer.ts` — source layer: source origin locations (where information originates)
- `src/lib/map/utils/safety.ts` — safety utilities: coordinate precision control, sensitivity classification, display precision calculation
- `src/lib/map/utils/timeline.ts` — timeline integration: filter features by date range, animate sequence
- `src/components/map/EventMapPanel.tsx` — event-focused map panel with timeline slider
- `src/data/__tests__/mapSafety.test.ts`

**Acceptance Criteria:**
- Event layer: documented events shown at safe precision (region/city level, never exact coordinates for sensitive events)
- Event markers: color-coded by category, sized by severity/confidence, labeled with event name
- Source layer: source origins shown as points, sized by number of documents from that source
- Source markers: color-coded by source type (court, UN, NGO, journalism, academic)
- Timeline integration: date range slider filters events shown, animation between time periods
- Safety enforcement: all coordinates pass through safety function before display
- Sensitivity classification: events marked "sensitive" are shown at lower precision or aggregated
- Popup for events: title, date (safe), category, verification level, source link
- Popup for sources: source name, type, document count, last checked date
- Legend updates dynamically based on visible layers

**Guardrails:**
- Safety function must be the ONLY way coordinates reach the map — never bypass it
- Sensitive event categories (casualties at specific locations, shelter strikes) must be aggregated or precision-reduced
- No interactive feature that reveals exact coordinates on hover/click
- Timeline animation must respond to reduced-motion preference
- Source layers must not reveal human sources or at-risk locations

**Tests:**
- EventLayer renders events with correct markers
- Safety function enforces precision rules
- Sensitivity classification works correctly
- SourceLayer renders source markers
- Timeline slider filters events by date range
- Popups display correct information for events and sources
- No exact coordinates exposed for sensitive events

**Documentation Updates:**
- `docs/map-architecture.md` — add event and source layer documentation
- `docs/ethics-and-safety.md` — update with map safety rules

**Suggested Commits:**
1. Safety utilities (precision, sensitivity, display calculation)
2. Event layer with safety enforcement
3. Source layer
4. Timeline integration and date slider
5. EventMapPanel component
6. Test suite

**Rollback Considerations:** Revert individual commits. Safety layer is critical — any regression must be caught by tests.

**Definition of Done:** Event and source map layers render with safe precision. Timeline integration works. All coordinates pass through safety function. Tests pass.

---

#### Prompt M4.5-03: Organization, Legal, and Infrastructure Map Layers

**Goals:** Build map layers for organizations, legal jurisdictions, and infrastructure. Safe precision for all location types.

**Context:** Event and source layers exist (M4.5-02). Need org, legal, and infrastructure layers.

**Files Affected:**
- `src/lib/map/layers/OrganizationLayer.ts` — organization layer: where organizations operate (region-level polygons, not office addresses)
- `src/lib/map/layers/LegalLayer.ts` — legal layer: jurisdictions (ICJ, ICC, national courts), thematic regions (Gaza, West Bank)
- `src/lib/map/layers/InfrastructureLayer.ts` — infrastructure layer: hospitals, schools, aid routes (safe precision only)
- `src/lib/map/layers/HumanitarianLayer.ts` — humanitarian layer: aid access routes (safe precision), humanitarian zones, crossing points (public only)
- `src/lib/map/utils/safety.ts` — update with infrastructure-specific safety rules
- `src/components/map/LayerGroupControl.tsx` — nested layer group toggling

**Acceptance Criteria:**
- Organization layer: polygons or regions showing operational areas, NOT exact office addresses
- Organization markers: sized by operational scope, color-coded by type (humanitarian, legal, medical, documentation)
- Legal layer: ICJ peace palace, ICC seat, national court locations (public buildings only), jurisdiction boundaries as regions
- Infrastructure layer: hospitals and schools at city/district level, never exact coordinates for operational facilities
- Humanitarian layer: aid routes at route-level (not exact checkpoints), crossing points that are public, humanitarian zones as regions
- All layers respect safe precision rules
- Nested layer groups: Organization layer can expand to show subtypes (humanitarian / legal / medical / documentation)
- Layer group control: toggle entire groups or individual sub-layers

**Guardrails:**
- Never show exact locations of operational hospitals, shelters, or aid distribution points
- Organization office addresses in conflict zones must not be published
- Aid routes must not reveal security-sensitive crossing procedures
- Infrastructure locations must be verified against safe-precision rules before publication
- Legal layer shows public building locations only (courthouses, ICJ/ICC seats)

**Tests:**
- OrganizationLayer renders operational regions (not addresses)
- LegalLayer renders jurisdictions correctly
- InfrastructureLayer applies safety rules
- HumanitarianLayer renders aid routes at safe precision
- LayerGroupControl toggles nested layers
- No exact addresses exposed for sensitive organizations

**Documentation Updates:**
- `docs/map-architecture.md` — add organization, legal, infrastructure documentation

**Suggested Commits:**
1. Organization layer
2. Legal layer
3. Infrastructure layer
4. Humanitarian layer
5. Layer group controls
6. Test suite

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Organization, legal, infrastructure, and humanitarian map layers render at safe precision. Tests pass.

---

#### Prompt M4.5-04: Map Search, Filter, and Timeline Integration

**Goals:** Build map search, spatial filtering, and timeline integration. Date range filter updates map. Category filter updates visible layers.

**Context:** All map layers exist (M4.5-01/02/03). Need search, filter, and timeline.

**Files Affected:**
- `src/components/map/MapSearch.tsx` — map search: search for locations, events, sources on the map
- `src/components/map/MapFilters.tsx` — map filters: date range, category, source type, verification level, layer visibility
- `src/components/map/MapTimeline.tsx` — map timeline: date range slider, play/pause animation, speed control
- `src/components/map/MapSearchResults.tsx` — search results: list of matching features with map pan/zoom on select
- `src/lib/map/search.ts` — map search functions: geocoding, feature search, spatial queries
- `src/lib/map/filters.ts` — map filter functions: spatial filtering, temporal filtering, category filtering
- `src/lib/map/timeline.ts` — timeline integration: date-driven feature visibility, animation sequencing
- `src/components/map/__tests__/MapSearch.test.ts`
- `src/components/map/__tests__/MapFilters.test.ts`
- `src/components/map/__tests__/MapTimeline.test.ts`

**Acceptance Criteria:**
- Map search: text search for locations (geocoding via OSM Nominatim), feature search (events, sources, organizations by name), results list with pan/zoom on selection
- Map filters: date range slider filters events by date, category checkboxes filter visible event types, source type checkboxes filter source layer, verification level filter, layer visibility toggles
- Map timeline: date range selector with play/pause animation, configurable animation speed (1x, 2x, 5x), events appear/disappear based on date window
- Spacial filtering: draw bounding box on map to filter features, radius search around point
- Filter combination: multiple filters apply simultaneously (AND logic)
- Filter reset: clear all filters button
- Results count: visible feature count updates when filters change

**Guardrails:**
- Search must not reveal exact coordinates of sensitive features
- Geocoding must use only OSM Nominatim with usage policy compliance
- Timeline animation must respect reduced-motion preference
- Search input must not accept or store arbitrary text beyond search queries
- Spatial filters must respect safe precision boundaries

**Tests:**
- MapSearch performs text search and returns results
- Selecting search result pans/zooms to feature
- MapFilters apply AND logic across filter types
- MapTimeline animates events over date range
- Filter reset clears all active filters
- Visible feature count updates correctly
- No sensitive coordinates exposed through search

**Documentation Updates:**
- `docs/map-architecture.md` — add search, filter, timeline documentation

**Suggested Commits:**
1. Map search component and geocoding
2. Map filters (date, category, source type, verification, layers)
3. Map timeline with animation
4. Spatial filtering
5. Filter combination and reset
6. Test suite

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Map search, filters, and timeline integration work. Multiple filters apply simultaneously. Timeline animation functions. Tests pass.

---

### M4.6 — Knowledge Graph

#### Prompt M4.6-01: Knowledge Graph Schema and Storage

**Goals:** Define graph schema: node types, edge types, properties. Set up graph storage (PostgreSQL with graph queries or dedicated graph DB). Entity resolution strategy.

**Context:** All AI pipeline stages produce structured data about entities, claims, events, locations, and relationships. Need to store and query this as a graph.

**Files Affected:**
- `src/lib/graph/types.ts` — graph types: GraphNode, GraphEdge, NodeType, EdgeType, GraphQuery, GraphPath
- `src/lib/graph/schema.ts` — graph schema definition: node types (source, document, entity, event, location, claim, country, institution, organization, action), edge types (mentions, occurs_at, involves, supports, contradicts, related_to, authored_by, published_by)
- `src/lib/graph/GraphDB.ts` — graph storage interface: addNode, addEdge, query, path finding, subgraph extraction
- `src/lib/graph/EntityResolver.ts` — entity resolution: merges duplicate entities, resolves name variants, maintains canonical IDs
- `src/lib/graph/__tests__/GraphDB.test.ts`
- `src/lib/graph/__tests__/EntityResolver.test.ts`

**Acceptance Criteria:**
- Node types: source, document, entity (person/organization/location), event, location (geographic), claim, country, institution, organization, action template
- Edge types: mentions (document -> entity), occurs_at (event -> location), involves (event -> entity), supports (document -> claim), contradicts (claim -> claim), related_to (entity -> entity), authored_by (document -> entity), published_by (document -> source), located_in (entity -> location), part_of (entity -> entity)
- Node properties per type: each node type has required and optional property schemas
- Graph storage supports: add/update/delete nodes and edges, query by type and property, traverse edges, find paths between nodes
- Entity resolution: merges duplicate entities based on name similarity, type match, source overlap; maintains history of merges; preserves original IDs as aliases
- Canonical IDs: each entity has a single canonical ID, all aliases reference it
- Query support: find all nodes of type, find edges of type, find paths between two nodes (BFS, DFS, shortest path), subgraph extraction (nodes within N hops)

**Guardrails:**
- Entity resolution must never merge entities with conflicting type assignments
- Merge operations must be reversible with a merge log
- Graph queries must be efficient — no full-graph scans for common operations
- Edge direction must follow ontological direction (event -> location, not location -> event)
- Do not store sensitive or private information as node properties

**Tests:**
- All node types and edge types are defined
- GraphDB supports add/update/delete operations
- Path finding returns shortest path between nodes
- EntityResolver merges duplicate entities
- EntityResolver preserves original IDs as aliases
- Merge operations are logged and reversible
- Subgraph extraction returns correct nodes within N hops

**Documentation Updates:**
- Create `docs/knowledge-graph-architecture.md` — graph schema and usage guide

**Suggested Commits:**
1. Graph types and schema definitions
2. GraphDB storage interface
3. Entity resolution system
4. Path finding and query support
5. Test suite

**Rollback Considerations:** Revert individual commits. Graph storage is backend infrastructure — does not affect public pages until visualization is built.

**Definition of Done:** Graph schema defines all node and edge types. Graph storage supports CRUD and queries. Entity resolution works. Tests pass.

---

#### Prompt M4.6-02: Graph Population and Relationship Building

**Goals:** Populate the graph from AI pipeline output. Build entity relationships. Deduplicate entities. Link claims, evidence, events, and entities.

**Context:** Graph schema and storage exist (M4.6-01). Need to populate the graph.

**Files Affected:**
- `src/lib/graph/population/SourcePopulator.ts` — ingests source records into graph as source nodes
- `src/lib/graph/population/DocumentPopulator.ts` — ingests collected documents as document nodes with content metadata
- `src/lib/graph/population/EntityPopulator.ts` — ingests entity extraction output as entity nodes with property mapping
- `src/lib/graph/population/ClaimPopulator.ts` — ingests claim extraction output as claim nodes with type and source edges
- `src/lib/graph/population/EventPopulator.ts` — ingests timeline/event extraction as event nodes with temporal and location edges
- `src/lib/graph/population/LocationPopulator.ts` — ingests geographic extraction as location nodes with parent-child hierarchy
- `src/lib/graph/population/RelationshipBuilder.ts` — builds edges between nodes based on relationship detection output
- `src/lib/graph/population/PipelineIntegration.ts` — integration with AI pipeline: triggers graph population after AI processing completes
- `src/lib/graph/__tests__/Population.test.ts`

**Acceptance Criteria:**
- SourcePopulator creates source nodes for each source record with source type, publisher, trust level
- DocumentPopulator creates document nodes for each collected document with title, date, content type, source link
- EntityPopulator creates entity nodes for each extracted entity with type, canonical name, aliases, properties
- ClaimPopulator creates claim nodes for each extracted claim with claim type, text, confidence, provenance
- EventPopulator creates event nodes for each timeline event with date, description, involved entities
- LocationPopulator creates location nodes with geographic hierarchy (country -> region -> city)
- RelationshipBuilder creates edges between nodes based on all relationship types from M4.6-01
- PipelineIntegration triggers population automatically when AI processing completes
- Deduplication runs during population: new entities checked against existing before creation
- Population is idempotent: running again with same data creates no duplicates

**Guardrails:**
- Population must be idempotent — re-running should not create duplicate nodes
- Edge creation must check for existing edges before creating new ones
- Entity resolution must happen during population, not after
- PipelineIntegration must not block the AI pipeline — run asynchronously
- Node properties must be validated against schema before creation

**Tests:**
- Each populator creates correct node types with required properties
- RelationshipBuilder creates all edge types correctly
- PipelineIntegration triggers population after AI processing
- Idempotency: running twice with same data creates no duplicates
- Entity resolution during population prevents duplicates
- Node property validation rejects invalid properties

**Documentation Updates:**
- `docs/knowledge-graph-architecture.md` — add population documentation

**Suggested Commits:**
1. Source, Document, and Entity populators
2. Claim, Event, and Location populators
3. Relationship builder
4. Pipeline integration
5. Idempotency and deduplication
6. Test suite

**Rollback Considerations:** Revert individual commits. Population is backend infrastructure — does not affect public pages.

**Definition of Done:** All AI pipeline output is ingested into the knowledge graph. Relationships between entities are built. Population is idempotent. Tests pass.

---

#### Prompt M4.6-03: Graph Visualization and Navigation

**Goals:** Build graph visualization UI. Entity detail pages with relationship navigation. "Explore connections" view. Path finding between entities.

**Context:** Graph is populated (M4.6-02). Need visualization and navigation.

**Files Affected:**
- `package.json` — add graph visualization library (e.g., d3-force, vis-network, or cytoscape)
- `src/components/graph/GraphExplorer.tsx` — main graph visualization component: force-directed layout, zoom, pan, node selection
- `src/components/graph/GraphNode.tsx` — node rendering: icon, label, type indicator, color coding
- `src/components/graph/GraphEdge.tsx` — edge rendering: line, arrow, label, type indicator
- `src/components/graph/GraphControls.tsx` — controls: zoom, layout options, filter by type, search
- `src/components/graph/GraphInspector.tsx` — inspector panel: selected node details, connected nodes, paths
- `src/components/graph/GraphPathFinder.tsx` — path finder: search for two entities, show shortest path
- `src/pages/explore/EntityDetailPage.tsx` — entity detail page with relationship navigation
- `src/pages/explore/GraphExplorerPage.tsx` — full-page graph explorer
- `src/lib/graph/viz/layout.ts` — graph layout algorithms (force-directed, hierarchical, concentric)
- `src/lib/graph/viz/renderer.ts` — graph rendering utilities
- `src/components/graph/__tests__/GraphExplorer.test.ts`

**Acceptance Criteria:**
- Graph visualization: force-directed layout, zoom and pan, nodes color-coded by type, edges labeled by relationship
- Node interaction: click to select, show details in inspector, highlight connected nodes and edges
- Graph controls: zoom in/out, fit to screen, layout selector (force/hierarchical/concentric), filter by node type, search nodes by name
- Inspector panel: selected node properties (type, name, source count), connected nodes list (grouped by relationship type), path to another selected node
- Path finder: select two nodes, find and highlight shortest path, display path as list of nodes/edges
- Entity detail page: entity properties, timeline of related events, list of related claims, list of related documents, explore connections link to graph explorer
- Graph navigation: from entity detail page, click "explore connections" opens graph focused on that entity
- Performance: graph handles 500+ nodes with acceptable performance
- Node/edge count indicator visible

**Guardrails:**
- Graph visualization is a navigation tool, not a data analysis platform for sensitive patterns
- Entity detail pages must not expose internal processing metadata
- Node labels must respect privacy — no personal data on public entities
- Path finding must not reveal investigative methods
- Force layout must have configurable simulation parameters

**Tests:**
- GraphExplorer renders with force-directed layout
- Node selection highlights connected nodes
- GraphControls provide layout, filter, and search
- Inspector panel shows selected node details
- PathFinder finds and highlights shortest path
- EntityDetailPage renders with relationships
- Navigation between detail and explorer works
- Handles 500+ nodes without crashing

**Documentation Updates:**
- `docs/knowledge-graph-architecture.md` — add visualization documentation
- Create `docs/graph-navigation-guide.md` — user guide for graph explorer

**Suggested Commits:**
1. Graph layout and rendering utilities
2. GraphNode and GraphEdge components
3. GraphExplorer with force-directed layout
4. GraphControls (zoom, layout, filter, search)
5. GraphInspector and GraphPathFinder
6. EntityDetailPage with relationship navigation
7. GraphExplorerPage
8. Test suite

**Rollback Considerations:** Revert individual commits. Graph visualization is additive — does not affect existing pages.

**Definition of Done:** Graph visualization allows navigating entity relationships. Entity detail pages show connections. Path finding works. Tests pass.

---

### M4.7 — Testing, Documentation, Monitoring

#### Prompt M4.7-01: Collector Test Suite

**Goals:** Build comprehensive test suite for all collectors: mock source data, validation tests, normalization tests, end-to-end tests.

**Context:** All collectors exist (M4.1-03 through M4.1-07). Need a thorough test suite.

**Files Affected:**
- `src/lib/collectors/__tests__/allCollectors.test.ts` — integration test: all collectors load and register
- `src/lib/collectors/courts/__tests__/allCourts.test.ts` — court collector integration
- `src/lib/collectors/un/__tests__/allUN.test.ts` — UN collector integration
- `src/lib/collectors/eu/__tests__/allEU.test.ts` — EU/Be collector integration
- `src/lib/collectors/ngo/__tests__/allNGO.test.ts` — NGO collector integration
- `src/lib/collectors/media/__tests__/allMedia.test.ts` — media collector integration
- `src/lib/collectors/__tests__/fixtures/` — standardized test fixtures (one per source type)
- `src/lib/collectors/__tests__/collectorValidation.test.ts` — validation: every collector validates output against CollectResult schema

**Acceptance Criteria:**
- Every collector has unit tests: fetch (with mock responses), validate, normalize, pipeline execution
- Integration tests: combined fetch + validate + normalize for each collector type
- End-to-end tests: pipeline execution with mock data through all stages
- Validation tests: every collector output validates against CollectResult schema
- Fixture data covers: normal response, empty response, error response, malformed response, rate-limited response
- Normalization tests: each normalizer tested with diverse input formats
- Error handling tests: each error type produces correct typed error
- Registration tests: every collector can be registered in CollectorRegistry
- Coverage target: 90%+ line coverage for collector code

**Guardrails:**
- Never make actual network calls in tests — all must use mocks/fixtures
- Fixture data must not include copyrighted content
- Standardized fixtures must cover edge cases (empty, malformed, missing fields)
- Tests must be deterministic — no timing-dependent assertions

**Tests:** (self-referential — this prompt IS about tests)

**Documentation Updates:**
- `docs/quality-and-testing.md` — add collector test documentation

**Suggested Commits:**
1. Standardized test fixtures per source type
2. Court collector tests (ICJ, ICC)
3. UN collector tests (OHCHR, OCHA)
4. EU and Belgium collector tests
5. NGO collector tests (Amnesty, HRW, Btselem, MSF, ICRC)
6. Media collector tests (journalism, academic)
7. Integration and e2e tests

**Rollback Considerations:** Test files are additive — revert individual commits.

**Definition of Done:** All collectors have unit, integration, and schema validation tests. 90%+ line coverage. All tests deterministic and mock-based.

---

#### Prompt M4.7-02: AI Pipeline Test Suite

**Goals:** Build test suite for AI pipeline with ground truth datasets, confidence calibration, hallucination detection, and regression tests.

**Context:** All AI pipeline stages exist (M4.2-01 through M4.2-12). Need comprehensive testing.

**Files Affected:**
- `src/lib/ai/__tests__/groundTruth/` — ground truth datasets: labeled test cases for each AI stage
- `src/lib/ai/__tests__/groundTruth/summarization.json` — summarization test cases with expected outputs
- `src/lib/ai/__tests__/groundTruth/entityExtraction.json` — entity extraction test cases
- `src/lib/ai/__tests__/groundTruth/claimExtraction.json` — claim extraction test cases
- `src/lib/ai/__tests__/groundTruth/timelineExtraction.json` — timeline extraction test cases
- `src/lib/ai/__tests__/groundTruth/geographicExtraction.json` — geographic extraction test cases
- `src/lib/ai/__tests__/groundTruth/contradictionDetection.json` — contradiction detection test cases
- `src/lib/ai/__tests__/groundTruth/hallucinationDetection.json` — hallucination detection test cases (known hallucination patterns)
- `src/lib/ai/__tests__/confidenceCalibration.test.ts` — confidence calibration tests against ground truth
- `src/lib/ai/__tests__/hallucinationRegression.test.ts` — hallucination regression tests
- `src/lib/ai/__tests__/pipelineIntegration.test.ts` — pipeline integration tests: content through all stages

**Acceptance Criteria:**
- Ground truth datasets for each AI stage: labeled examples with expected outputs
- Summarization tests: verify no claims introduced, source references preserved, correct detail level
- Entity extraction tests: precision, recall, F1 against ground truth
- Claim extraction tests: correct claim type classification, source span accuracy
- Timeline extraction tests: date precision, chronological ordering, ambiguous date handling
- Geographic extraction tests: precision level enforcement, safe coordinate output
- Contradiction detection tests: true positives, false positives, severity classification
- Hallucination detection tests: known hallucination patterns, adversarial examples, numerical consistency
- Confidence calibration: confidence scores correlate with actual accuracy on ground truth
- Regression tests: known failure modes are re-tested on every pipeline change
- Pipeline integration: content flows through all stages successfully

**Guardrails:**
- Ground truth datasets must be manually verified — no AI-generated ground truth
- Do not use real content for hallucination tests — use synthetic adversarial examples
- Confidence calibration thresholds must be validated against independent test sets
- Regression test failures must block pipeline changes
- Ground truth data must be versioned alongside pipeline code

**Tests:** (self-referential — this prompt IS about tests)

**Documentation Updates:**
- `docs/ai-pipeline-overview.md` — add testing documentation
- `docs/quality-and-testing.md` — update with AI pipeline testing guide

**Suggested Commits:**
1. Ground truth datasets for all stages
2. Summarization and entity extraction tests
3. Claim, timeline, and geographic extraction tests
4. Contradiction detection tests
5. Hallucination detection tests (adversarial)
6. Confidence calibration tests
7. Pipeline integration tests
8. Regression test suite

**Rollback Considerations:** Test files are additive. Ground truth datasets must be carefully reviewed before committing.

**Definition of Done:** AI pipeline has ground truth tests for every stage. Confidence calibrated against test data. Hallucination tests catch known patterns. Pipeline integration passes.

---

#### Prompt M4.7-03: Integration Test Suite

**Goals:** End-to-end tests from source fetch through normalization, AI processing, and review queue. State transition tests. Map data safety tests.

**Context:** All components exist (collectors, AI pipeline, review queue, maps, knowledge graph). Need full integration tests.

**Files Affected:**
- `src/__tests__/integration/collectorToAI.test.ts` — source fetch through AI pipeline end-to-end
- `src/__tests__/integration/AIToReview.test.ts` — AI output through review queue
- `src/__tests__/integration/reviewToPublish.test.ts` — review through publish workflow
- `src/__tests__/integration/fullWorkflow.test.ts` — complete workflow: collector -> AI -> review -> publish
- `src/__tests__/integration/stateTransitions.test.ts` — state machine transitions across all systems
- `src/__tests__/integration/mapDataSafety.test.ts` — map data safety rules: no sensitive coordinate leakage
- `src/__tests__/integration/graphPopulation.test.ts` — AI output to knowledge graph end-to-end
- `src/__tests__/integration/correctionWorkflow.test.ts` — correction submission through application
- `src/__tests__/integration/fixtures/` — integration test fixtures
- `src/__tests__/integration/__mocks__/` — mocked external services

**Acceptance Criteria:**
- Collector-to-AI test: mock source data -> collector -> normalize -> AI pipeline stages -> structured output
- AI-to-Review test: AI output -> review queue creation -> assignment -> state transitions to approved
- Review-to-Publish test: approved review -> content publication -> public page update
- Full workflow test: end-to-end with mocked external services
- State transition tests: valid and invalid transitions across all state machines
- Map safety tests: every coordinate output passes through safety function; no exact coordinates leak for sensitive events
- Graph population test: AI output correctly populates knowledge graph nodes and edges
- Correction workflow test: submission -> review -> application with public log update
- All tests use mocked external services (no real HTTP calls, no real API keys)
- Tests are deterministic: same input always produces same output

**Guardrails:**
- Never use real API keys in integration tests
- Never make real network calls — all external services must be mocked
- Map safety tests must include adversarial inputs (coordinates close to sensitive locations)
- Integration tests must run in CI alongside unit tests
- Tests must be isolated — no shared state between test cases

**Tests:** (self-referential — this prompt IS about integration tests)

**Documentation Updates:**
- `docs/quality-and-testing.md` — add integration testing documentation

**Suggested Commits:**
1. Integration test fixtures and mocks
2. Collector-to-AI integration test
3. AI-to-Review integration test
4. Review-to-Publish integration test
5. Full workflow integration test
6. State transition tests
7. Map data safety tests
8. Graph population and correction tests

**Rollback Considerations:** Test files are additive. Fixture data must be reviewed for accuracy.

**Definition of Done:** Full integration test suite covers collector-to-publish workflow. Map safety tests prevent coordinate leakage. All tests deterministic. CI passes.

---

#### Prompt M4.7-04: Intelligence Layer Documentation

**Goals:** Complete documentation for all Intelligence Layer components: collector framework, AI pipeline, review queue, maps, knowledge graph.

**Context:** All Intelligence Layer code exists. Need comprehensive documentation.

**Files Affected:**
- `docs/collector-framework.md` — how to add a collector, collector lifecycle, configuration reference
- `docs/ai-pipeline-overview.md` — architecture, stage descriptions, prompt guidelines
- `docs/review-queue-overview.md` — review workflow, state machine, assignment, SLAs
- `docs/map-architecture.md` — map layers, safety rules, coordinate precision
- `docs/knowledge-graph-architecture.md` — graph schema, query examples, population guide
- `docs/admin-dashboard-guide.md` — dashboard usage for pipeline, review, data quality
- `docs/collector-configuration.md` — how to add new sources, configure RSS feeds, set polling intervals
- `docs/ai-prompt-guidelines.md` — prompt engineering best practices, versioning, safety rules
- `docs/map-safety-rules.md` — coordinate precision rules, sensitivity classification, emergency unpublish

**Acceptance Criteria:**
- Collector framework doc: add a new collector in 5 steps, collector lifecycle diagram, configuration reference, error handling guide
- AI pipeline doc: each stage documented with input/output examples, prompt management guide, confidence interpretation
- Review queue doc: state machine diagram, assignment strategies, SLA configuration, checklist customization
- Map architecture doc: layer system, safety rules (with code examples), coordinate precision table
- Knowledge graph doc: schema diagram (node types + edge types), query examples (Cypher or equivalent), population workflow
- Admin dashboard doc: dashboard overview, metrics interpretation, alert configuration
- Collector configuration doc: source types, feed configuration, API setup (key reference only), polling intervals
- AI prompt guidelines: prompt structure, variable naming, version tracking, safety checks, hallucination mitigation
- Map safety rules: precision levels table, sensitivity classification criteria, emergency unpublish procedure

**Guardrails:**
- Documentation must not include any API keys, credentials, or access tokens
- Map safety documentation must not describe how to bypass safety rules
- Prompt guidelines must not include example prompts with real personal data
- All documentation must be accessible to new contributors (assume minimal context)

**Tests:** Documentation links are valid. Code examples are correct.

**Documentation Updates:** (self-referential — this prompt IS about documentation)

**Suggested Commits:**
1. Collector framework documentation
2. AI pipeline documentation
3. Review queue documentation
4. Map architecture and safety documentation
5. Knowledge graph documentation
6. Admin dashboard documentation
7. Collector configuration and AI prompt guidelines

**Rollback Considerations:** Revert individual doc commits.

**Definition of Done:** All Intelligence Layer components have complete, accurate documentation. New contributor can understand each component from the docs alone.

---

#### Prompt M4.7-05: Operational Runbooks

**Goals:** Write operational runbooks for collector failure recovery, AI pipeline troubleshooting, review queue escalation, map data incident response, and security incident response.

**Context:** All Intelligence Layer components are built and documented. Need operations procedures.

**Files Affected:**
- `docs/runbooks/collector-failure-recovery.md` — collector failure recovery
- `docs/runbooks/ai-pipeline-troubleshooting.md` — AI pipeline troubleshooting
- `docs/runbooks/review-queue-escalation.md` — review queue escalation
- `docs/runbooks/map-data-incident-response.md` — map data incident response
- `docs/runbooks/security-incident-response.md` — security incident response
- `docs/runbooks/data-quality-degradation.md` — data quality degradation response

**Acceptance Criteria:**
- Collector failure recovery: per-error-type recovery steps (fetch failure, parse failure, rate limit, auth failure, source redesign), source health check procedure, manual rerun procedure, source suspension criteria, re-activation procedure
- AI pipeline troubleshooting: per-stage troubleshooting (low confidence, hallucination flags, empty output, timeout), prompt debugging guide, confidence degradation investigation, model fallback procedures
- Review queue escalation: SLA breach notification, reviewer unavailability handling, content dispute escalation, legal wording escalation, expertise gap procedure
- Map data incident response: sensitive coordinate exposure detection, immediate unpublish procedure, data correction process, post-incident review template
- Security incident response: classification (credential leak, data breach, defacement, DDoS), containment steps, communication template, recovery procedure, post-mortem process
- Data quality degradation: detection (monitoring alerts, manual review flags), investigation steps, root cause analysis, correction deployment, verification process

**Guardrails:**
- Runbooks must include explicit "do not" sections per incident type
- Security incident runbook must include communication guidelines (who to contact, what to say)
- Map data incident runbook must include safety check before re-publishing
- Runbooks must assume operator has access to monitoring dashboards
- Contact information in runbooks must be role-based, not personal

**Tests:** Runbooks are documentation-only — no automated tests. Review by at least 2 operators recommended.

**Documentation Updates:** (self-referential — this prompt IS about runbooks)

**Suggested Commits:**
1. Collector failure recovery runbook
2. AI pipeline troubleshooting runbook
3. Review queue escalation runbook
4. Map data incident response runbook
5. Security incident response runbook
6. Data quality degradation runbook

**Rollback Considerations:** Revert individual runbook commits.

**Definition of Done:** All runbooks exist with clear procedures for incident detection, response, and recovery. Each runbook reviewed by at least one operator.

---

## Milestone 5 — Backend

### Prompt M5-01: Supabase/PostgreSQL Foundation

**Goals:** Set up Supabase project. Design database schema based on M4 data models. Implement Row-Level Security policies.

**Context:** Intelligence Layer (M4) is built with local data stores. Need production database.

**Files Affected:**
- `supabase/config.toml` — Supabase project configuration
- `supabase/migrations/00001_initial_schema.sql` — initial schema: all tables from PRD data model plus M4 additions
- `supabase/migrations/00002_row_level_security.sql` — RLS policies per table
- `supabase/seed.sql` — seed data from static TypeScript files
- `src/lib/db/client.ts` — Supabase client initialization
- `src/lib/db/types.ts` — database types (generated from schema)
- `src/lib/db/queries/` — query modules: sources, evidence, legal cases, countries, organizations, actions
- `src/data/migration.ts` — migration script from static data to database
- `docs/data-model.md` — update with complete schema

**Acceptance Criteria:**
- Supabase project initialized and configured
- Schema includes all tables from PRD Section 16 (sources, evidence_items, evidence_references, countries, country_positions, actions, organizations, legal_cases, dossiers, corrections) plus M4 additions (collector_runs, ai_operations, review_queue_items, graph_nodes, graph_edges, map_layers)
- Row-Level Security: public read for published content, authenticated write for admin roles, role-based access per table
- RLS policies: public = SELECT on published content only; contributor = SELECT + INSERT on corrections; reviewer = SELECT + UPDATE on assigned review items; admin = full CRUD
- Seed data populated from existing static TypeScript files
- Migration script converts static data to database format
- Query modules for all major data types
- Database types generated from schema for TypeScript safety

**Guardrails:**
- All passwords and secrets via environment variables, never in code
- RLS must be enabled on every table — no exceptions
- Migration must be reversible
- Seed data must not include sensitive or unverified content
- Database connection pooling must be configured for production

**Tests:**
- Schema creates all tables with correct columns and constraints
- RLS policies enforce correct access levels
- Seed data populates without errors
- Migration script transfers all static data
- Query modules return correct results
- Type generation produces correct TypeScript types

**Documentation Updates:**
- `docs/data-model.md` — complete schema documentation
- `docs/architecture.md` — add Supabase backend architecture

**Suggested Commits:**
1. Supabase project setup and initial schema
2. RLS policies
3. Seed data
4. Client initialization and query modules
5. Migration script
6. Type generation

**Rollback Considerations:** Supabase project can be reset. Migration scripts can be rolled back. Full DB restore from backup if needed.

**Definition of Done:** Supabase backend with complete schema, RLS, seed data, and query modules. Static data migration works.

---

### Prompt M5-02: Admin Authentication and 2FA

**Goals:** Set up admin authentication. 2FA requirement. Role-based access control.

**Context:** Database exists (M5-01). Need authentication.

**Files Affected:**
- `supabase/migrations/00003_auth.sql` — auth schema: roles table, user_roles, auth triggers
- `src/lib/auth/client.ts` — Supabase auth client
- `src/lib/auth/roles.ts` — role definitions and permission checks
- `src/lib/auth/session.ts` — session management
- `src/lib/auth/2fa.ts` — 2FA enrollment and verification
- `src/pages/admin/LoginPage.tsx` — admin login page
- `src/pages/admin/TwoFactorSetup.tsx` — 2FA setup page
- `src/pages/admin/TwoFactorVerify.tsx` — 2FA verification page
- `src/components/admin/AuthGuard.tsx` — route guard: checks authentication and role
- `src/components/admin/ProtectedRoute.tsx` — protected route wrapper
- `src/lib/auth/__tests__/roles.test.ts`
- `src/lib/auth/__tests__/session.test.ts`

**Acceptance Criteria:**
- Supabase Auth configured for email/password authentication
- Admin users can sign up (invite-only) and sign in
- 2FA enrollment: generate secret, display QR code, verify TOTP code
- 2FA verification on every login: email/password -> TOTP code
- Role-based access: public, contributor, researcher, moderator, partner_org, legal_reviewer, security_admin, admin
- Permission checks: component-level (hide UI elements), route-level (redirect unauthorized), API-level (enforce via RLS)
- AuthGuard component checks authentication state
- ProtectedRoute redirects unauthenticated users to login
- Session management: session refresh, timeout (configurable), concurrent session limit
- Role assignment: admin-only UI for managing user roles

**Guardrails:**
- 2FA is mandatory for ALL non-public roles — no opt-out
- Failed 2FA attempts must be rate-limited (max 5 attempts, then 15-min lockout)
- Session tokens must be HTTP-only, secure, SameSite=Strict
- Never log passwords, TOTP tokens, or session tokens
- Role assignment must be logged to audit trail
- Auth pages must be on separate subdomain for production

**Tests:**
- Login with valid credentials succeeds
- Login with invalid credentials fails
- TOTP generation produces valid QR code
- TOTP verification accepts valid codes, rejects invalid
- 2FA enforcement: without 2FA, API requests are rejected
- AuthGuard redirects unauthenticated users
- ProtectedRoute enforces role requirements
- Permission checks return correct boolean

**Documentation Updates:**
- Create `docs/admin-authentication.md` — auth setup and role management

**Suggested Commits:**
1. Auth schema and Supabase Auth configuration
2. Auth client, session management, role definitions
3. Login page and auth guards
4. 2FA enrollment and verification
5. Role management UI
6. Test suite

**Rollback Considerations:** Revert auth commits. Auth tables can be dropped and recreated.

**Definition of Done:** Admin authentication with 2FA and RBAC is functional. Login, 2FA, role checks, and protected routes work. Tests pass.

---

### Prompt M5-03: Public Read APIs

**Goals:** Build public API endpoints for evidence, countries, actions, organizations, legal cases, dossiers. Versioning, rate limiting, documentation.

**Context:** Database with RLS exists (M5-01). Need public API.

**Files Affected:**
- `supabase/functions/api/v1/evidence.ts` — evidence list and detail endpoints
- `supabase/functions/api/v1/countries.ts` — countries list and detail endpoints
- `supabase/functions/api/v1/actions.ts` — actions list and detail endpoints
- `supabase/functions/api/v1/organizations.ts` — organizations list and detail endpoints
- `supabase/functions/api/v1/legal-cases.ts` — legal cases list and detail endpoints
- `supabase/functions/api/v1/dossiers.ts` — dossiers list and detail endpoints
- `supabase/functions/api/v1/sources.ts` — source registry endpoints
- `supabase/functions/api/v1/search.ts` — search endpoint
- `src/lib/api/client.ts` — API client for frontend
- `src/lib/api/types.ts` — API response types
- `docs/api-documentation.md` — API reference

**Acceptance Criteria:**
- Versioned API routes: /api/v1/evidence, /api/v1/countries, /api/v1/actions, /api/v1/organizations, /api/v1/legal-cases, /api/v1/dossiers, /api/v1/sources, /api/v1/search
- List endpoints support: pagination (page, per_page), sorting (field, order), filtering (by type, category, date, status, language)
- Detail endpoints return full record with related data
- Search endpoint: full-text search across evidence, sources, countries, legal cases
- Rate limiting: 100 requests/min per IP (public), configurable
- CORS: restricted to allowed origins
- Cache headers: appropriate Cache-Control for list and detail endpoints
- Response format: JSON with consistent structure (data, meta, error)
- Error responses: proper HTTP status codes, error messages, request IDs for debugging
- API documentation: endpoint reference with examples, pagination guide, authentication (if needed), rate limits
- Frontend API client: typed functions for all endpoints

**Guardrails:**
- Public API returns only published/reviewed content — never drafts or unreviewed
- API must not expose internal IDs or personal data
- Rate limits must prevent abuse — no unbounded public access
- Search must not return sensitive content
- Pagination must have a maximum page size (100 items)
- Cache headers must respect content freshness

**Tests:**
- List endpoints return paginated results
- Detail endpoints return full records
- Filter parameters correctly filter results
- Search returns relevant results
- Rate limiting blocks excess requests
- CORS headers are correct
- Error responses have correct status codes
- Frontend API client makes correct requests

**Documentation Updates:**
- `docs/api-documentation.md` — complete API reference

**Suggested Commits:**
1. API types and client
2. Evidence and sources endpoints
3. Countries and actions endpoints
4. Organizations and legal cases endpoints
5. Dossiers and search endpoints
6. Rate limiting, CORS, error handling
7. API documentation

**Rollback Considerations:** API endpoints can be rolled back individually. Rate limiting can be adjusted.

**Definition of Done:** Public read API serves all content types with pagination, filtering, and search. Rate limiting active. Documentation complete.

---

### Prompt M5-04: Admin CRUD APIs

**Goals:** Build admin endpoints for creating/updating evidence, sources, country positions, actions, legal cases, organizations.

**Context:** Public read API exists (M5-03). Need admin write operations.

**Files Affected:**
- `supabase/functions/admin/v1/evidence.ts` — evidence CRUD
- `supabase/functions/admin/v1/sources.ts` — sources CRUD
- `supabase/functions/admin/v1/countries.ts` — country positions CRUD
- `supabase/functions/admin/v1/actions.ts` — actions CRUD
- `supabase/functions/admin/v1/legal-cases.ts` — legal cases CRUD
- `supabase/functions/admin/v1/organizations.ts` — organizations CRUD
- `supabase/functions/admin/v1/dossiers.ts` — dossiers CRUD
- `src/lib/api/admin.ts` — admin API client
- `src/lib/api/types.ts` — admin API types

**Acceptance Criteria:**
- Admin endpoints: create, read, update, delete for all content types
- Authentication: bearer token from Supabase Auth session
- Authorization: role-based (admin=full, moderator=moderate, researcher=create draft, etc.)
- Input validation: Zod schemas validate all request bodies
- Audit logging: every create/update/delete logged with actor, action, timestamp, diff
- Soft delete for most content types (with restore capability)
- Hard delete only for draft/unpublished content or with admin+security_admin approval
- Version management: updates create new version entries
- Bulk operations: batch update status, batch assign review

**Guardrails:**
- Admin endpoints must be on separate subdomain in production
- All input validated against Zod schemas — reject malformed
- Soft delete default — never hard delete published content without audit trail
- Update operations must create version records
- Delete operations must cascade to related records appropriately
- Rate limiting: stricter limits than public API

**Tests:**
- Create endpoint creates record with correct data
- Update endpoint creates versioned update
- Delete performs soft delete
- Authorization: unauthorized roles receive 403
- Validation rejects invalid input
- Audit log records all operations
- Admin API client makes correct authenticated requests

**Documentation Updates:**
- `docs/api-documentation.md` — add admin API documentation

**Suggested Commits:**
1. Admin API shared middleware (auth, validation, audit)
2. Evidence and sources CRUD
3. Countries and actions CRUD
4. Legal cases and organizations CRUD
5. Dossiers CRUD
6. Bulk operations
7. Admin API client and types

**Rollback Considerations:** Admin endpoints are additive. Audit log provides rollback information.

**Definition of Done:** Admin CRUD APIs for all content types. Input validation, audit logging, versioning, and authorization work. Tests pass.

---

### Prompt M5-05: Correction Submission API

**Goals:** Public correction submission endpoint. Moderation queue. Integration with review workflow.

**Context:** Admin CRUD APIs exist (M5-04). Need correction submission.

**Files Affected:**
- `supabase/functions/api/v1/corrections.ts` — public correction submission endpoint
- `supabase/functions/admin/v1/corrections.ts` — admin correction moderation endpoints
- `src/lib/api/corrections.ts` — correction API client
- `src/lib/api/types.ts` — correction API types
- `src/pages/CorrectionsPage.tsx` — update with form submission
- `src/components/corrections/CorrectionForm.tsx` — correction submission form
- `src/components/corrections/CorrectionStatus.tsx` — correction status display

**Acceptance Criteria:**
- Public endpoint POST /api/v1/corrections accepts: target_type, target_id/slug, category, description, optional source_url, optional contact_email (not stored in plaintext — only hash)
- Moderation queue: admin can list, filter, sort, and review correction submissions
- Moderation actions: approve (apply correction), reject (with reason), request clarification, archive
- Correction application: automatically updates target content record with correction metadata
- Correction rejection: notifies submitter (if contact provided) with reason
- Correction moderation logged to audit trail
- Rate limiting: max 5 submissions per IP per day
- Honeypot field to prevent automated spam
- Contact email stored only as hash — never in plaintext

**Guardrails:**
- Never store submitter email in plaintext — hash only
- Do not expose submitter identity to public
- Correction categories must be from controlled vocabulary
- Rate limiting prevents abuse
- Honeypot must be invisible to users but detectable by bots
- Spam submissions must not enter the moderation queue

**Tests:**
- Correction submission creates moderation queue item
- Rate limiting blocks excess submissions
- Honeypot catches automated submissions
- Moderation approval updates target content
- Rejection sends appropriate response
- Audit log records moderation actions
- Email stored only as hash

**Documentation Updates:**
- `docs/api-documentation.md` — add correction API docs
- `docs/correction-policy.md` — update with API workflow

**Suggested Commits:**
1. Correction types and schemas
2. Public submission endpoint
3. Correction form component
4. Admin moderation endpoints
5. Correction application logic
6. Spam prevention (rate limiting, honeypot)
7. Test suite

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Public correction submission works with moderation queue. Spam prevention active. Tests pass.

---

### Prompt M5-06: Document Storage and Search

**Goals:** File storage for evidence documents. PostgreSQL full-text search. Search API.

**Context:** Correction API exists (M5-05). Need document storage and search.

**Files Affected:**
- `supabase/storage/buckets.sql` — storage bucket configuration: evidence-documents, dossier-exports
- `supabase/migrations/00004_search.sql` — full-text search: search configuration, indexes, triggers
- `supabase/functions/api/v1/search.ts` — search endpoint (update)
- `src/lib/search/documents.ts` — document upload/download client
- `src/lib/search/fts.ts` — full-text search query builder
- `src/pages/SearchPage.tsx` — search results page (update from static)
- `src/components/search/SearchResults.tsx` — search results component
- `src/components/search/SearchFilters.tsx` — search filters sidebar
- `src/components/search/SearchResultCard.tsx` — individual result display

**Acceptance Criteria:**
- Storage buckets: evidence-documents (private, reviewed content only), dossier-exports (public, generated dossiers)
- File upload: admin upload of evidence documents (PDF, images, archives) with metadata
- File access: public for reviewed/dossier files, authenticated for unreviewed
- Full-text search indexes on: evidence_items (title, summary, body), sources (title, notes), legal_cases (title, summary), countries (name, position_summary), organizations (name, description)
- Search ranking: relevance ranking with weights (title=1.0, summary=0.5, body=0.3)
- Search API: text query, filtered by content type, category, date range, verification level
- Search results: type-specific result cards with snippets, source badges, verification levels
- Search filters sidebar: content type checkboxes, date range, category, source type, verification level
- SearchPage: updated from static version to use API

**Guardrails:**
- Evidence documents must be reviewed before being accessible via public endpoint
- File upload must validate file types and sizes
- Do not index or search unreviewed content
- Search snippets must not include sensitive information
- File storage must respect copyright — store only documents with appropriate licensing

**Tests:**
- Document upload creates correct storage entry
- File access controls enforce permissions
- Full-text search returns relevant results with correct ranking
- Search filters narrow results correctly
- Search snippets highlight query terms
- Unreviewed content excluded from search

**Documentation Updates:**
- `docs/api-documentation.md` — add search and storage API docs

**Suggested Commits:**
1. Storage buckets and upload functionality
2. Full-text search configuration and indexes
3. Search API with filters
4. Search results component
5. SearchPage update
6. Test suite

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Document storage and full-text search are functional. Search API returns ranked, filtered results. Tests pass.

---

### Prompt M5-07: PostGIS Spatial Queries

**Goals:** Enable PostGIS. Spatial queries for map data. Location-based filtering API.

**Context:** Document storage exists (M5-06). Need geospatial capabilities.

**Files Affected:**
- `supabase/migrations/00005_postgis.sql` — PostGIS extension, spatial columns, spatial indexes
- `supabase/functions/api/v1/locations.ts` — spatial query endpoints
- `src/lib/map/spatial.ts` — spatial query functions (distance, bounding box, containment)
- `src/lib/api/spatial.ts` — spatial API client
- `src/lib/map/safety.ts` — update with database-level safety enforcement

**Acceptance Criteria:**
- PostGIS extension enabled
- Spatial columns added to: evidence_items (location), events (location), sources (region geometry), organizations (operational_area), country_positions (jurisdiction_area)
- Spatial indexes on all geometry columns
- Spatial query endpoints: nearby items (lat/lng + radius), items in bounding box, items in region, distance from location
- Safety enforcement at database level: queries return only safe-precision coordinates
- Location-based filtering in search API: filter by distance, region, bounding box
- Coordinate transformation: WGS84 input/output, internal storage with safe precision
- Map tile generation: GeoJSON endpoints returning filtered feature sets

**Guardrails:**
- Database-level safety must enforce coordinate precision — never return exact coordinates for sensitive content
- Spatial queries must respect safe-precision rules before returning results
- Bounding box queries must have maximum size limits
- Distance queries must not reveal precise locations of sensitive events
- PostGIS functions must be parameterized — no SQL injection

**Tests:**
- PostGIS extension creates correctly
- Spatial columns store valid geometry
- Nearby query returns items within radius
- Bounding box query returns items in area
- Region query returns items in polygon
- Safety enforcement prevents exact coordinate leakage
- Location search filters work correctly

**Documentation Updates:**
- `docs/api-documentation.md` — add spatial API docs
- `docs/map-architecture.md` — update with database spatial queries

**Suggested Commits:**
1. PostGIS extension and spatial columns
2. Spatial indexes and safety functions
3. Spatial query API endpoints
4. Search integration with spatial filters
5. GeoJSON feature generation
6. Test suite

**Rollback Considerations:** Revert individual commits. PostGIS migration can be rolled back.

**Definition of Done:** PostGIS spatial queries work with safety enforcement. Location-based filtering in search API. Tests pass.

---

### Prompt M5-08: Audit Logging, Backups, and Recovery

**Goals:** Comprehensive audit logging. Automated backups. Recovery testing. Data retention policies.

**Context:** All backend services exist (M5-01 through M5-07). Need operational infrastructure.

**Files Affected:**
- `supabase/migrations/00006_audit.sql` — audit log table, triggers for all CRUD operations
- `supabase/migrations/00007_retention.sql` — data retention policies, archival triggers, purge procedures
- `src/lib/audit/logger.ts` — audit logging client
- `src/lib/audit/types.ts` — audit types: AuditEvent, AuditAction, AuditActor
- `src/lib/audit/queries.ts` — audit log queries
- `src/pages/admin/AuditLogPage.tsx` — audit log viewer
- `src/components/admin/AuditLogTable.tsx` — audit log table with filters
- `src/components/admin/AuditEventDetail.tsx` — audit event detail view
- `scripts/backup.sh` — automated backup script
- `scripts/restore-test.sh` — restore test script
- `docs/backup-recovery.md` — backup and recovery procedures

**Acceptance Criteria:**
- Audit log records: timestamp, actor_id, actor_role, action (create/read/update/delete), target_type, target_id, diff (before/after for updates), request_id, ip_address (admin only)
- Automatic audit triggers on all CRUD tables
- Audit log viewer: table with filters (date range, actor, action, target type), search, export CSV
- Audit event detail: full before/after diff, request context, actor information
- Automated backups: daily full backup, hourly WAL archiving, 30-day retention
- Backup verification: automated restore test weekly, integrity check daily
- Data retention policies: published content indefinite, draft content purged after 1 year, audit logs retained 3 years, correction submissions retained 2 years
- Recovery procedures: full restore from backup, point-in-time recovery, selective table restore
- Archival: content superseded by newer version archived (not deleted) for reference
- Purge: automated purge of expired data with audit trail

**Guardrails:**
- Audit logs must never contain passwords, TOTP tokens, API keys, or personal data
- Backup encryption: backups must be encrypted at rest and in transit
- Backup storage: separate from primary database (different region/cloud)
- Restore tests must not affect production data
- Data purging must have a 30-day grace period before actual deletion
- Audit retention must comply with GDPR data minimization requirements

**Tests:**
- Audit trigger fires on CRUD operations
- Audit log stores correct data for create, update, delete
- Audit log viewer filters and searches correctly
- Backup script creates valid backup
- Restore test script successfully restores from backup
- Data retention policies archive/purge correctly
- No sensitive data in audit logs

**Documentation Updates:**
- `docs/backup-recovery.md` — backup and recovery procedures
- `docs/audit-logging.md` — audit log schema and query guide

**Suggested Commits:**
1. Audit log schema and triggers
2. Audit logging client and types
3. Audit log viewer (admin page)
4. Backup automation script
5. Restore test script
6. Data retention and archival policies
7. Documentation

**Rollback Considerations:** Audit log is append-only by design. Backup/restore scripts can be rolled back.

**Definition of Done:** Audit logging captures all CRUD operations. Automated backups run daily. Restore testing passes. Data retention enforced. Tests pass.

---

## Milestone 6 — Editorial Platform

### Prompt M6-01: Admin CMS Foundation

**Goals:** Build the admin content management system. Dashboard, navigation, content CRUD interface.

**Context:** Backend APIs exist (M5). Need admin CMS interface.

**Files Affected:**
- `src/pages/admin/AdminDashboard.tsx` — admin dashboard
- `src/pages/admin/ContentList.tsx` — content list view (all types)
- `src/pages/admin/ContentEditor.tsx` — content editor (shared)
- `src/components/admin/AdminShell.tsx` — admin layout shell (sidebar nav, header, content area)
- `src/components/admin/AdminSidebar.tsx` — admin sidebar navigation
- `src/components/admin/AdminHeader.tsx` — admin header (user info, role, logout)
- `src/components/admin/ContentTable.tsx` — data table with sort, filter, batch actions
- `src/components/admin/ContentForm.tsx` — shared content form with field validation
- `src/components/admin/MediaLibrary.tsx` — media library: upload, browse, select images/documents
- `src/components/admin/StatusSelect.tsx` — status selector with workflow hints
- `src/components/admin/VersionHistory.tsx` — version history panel for content
- `src/hooks/useAdminContent.ts` — admin content CRUD hook

**Acceptance Criteria:**
- Admin dashboard: content counts per type, recent activity, pending reviews, correction queue depth, quick action buttons
- Admin sidebar: navigation to all content types, review queue, correction queue, dashboards, settings
- Content list: data table per content type with sortable columns, text search, filter by status/type/date, batch actions
- Content editor: structured form with field validation, status selector, source linking, preview, save/submit
- Media library: upload images/documents, browse existing, select for content, basic metadata (title, alt text, license)
- Version history: version list, diff between versions, restore to version
- AdminShell: consistent layout, responsive sidebar, breadcrumb navigation
- All admin pages require authentication (AuthGuard/ProtectedRoute)
- Responsive: admin CMS works on desktop and tablet

**Guardrails:**
- Admin CMS is never publicly accessible — must be on separate subdomain or behind auth
- Editor must validate all inputs before save
- Unpublished changes must not affect public content until explicitly published
- Media library must enforce licensing attribution
- Version history must be append-only (no deletion of versions)

**Tests:**
- AdminDashboard renders with correct counts
- ContentList loads and filters data correctly
- ContentEditor saves and loads content
- MediaLibrary uploads and selects files
- VersionHistory displays version list with diffs
- AdminShell navigation works
- Auth guards redirect unauthenticated users

**Documentation Updates:**
- Create `docs/admin-cms-guide.md` — CMS usage guide

**Suggested Commits:**
1. AdminShell layout (sidebar, header, navigation)
2. AdminDashboard
3. ContentList component
4. ContentEditor component
5. MediaLibrary
6. VersionHistory
7. Admin hooks and API integration

**Rollback Considerations:** Revert individual commits. Admin CMS is additive — doesn't affect public routes.

**Definition of Done:** Admin CMS foundation works: dashboard, content list, editor, media library, version history. Tests pass.

---

### Prompt M6-02: Publishing Workflow

**Goals:** Build the publishing workflow: Draft -> Review -> Approved -> Published -> Versioned. Publication approval gates. Rollback capability.

**Context:** Admin CMS exists (M6-01). Need publishing workflow.

**Files Affected:**
- `src/lib/workflow/publishing.ts` — publishing workflow: state machine, transitions, hooks
- `src/lib/workflow/types.ts` — workflow types: PublishState, PublishAction, PublishRequest, ApprovalGate
- `src/lib/workflow/approvalGates.ts` — approval gates: content check, source check, legal check, safety check, language check
- `src/components/admin/PublishWorkflow.tsx` — publishing workflow component (state indicator, actions)
- `src/components/admin/ApprovalGateList.tsx` — approval gate checklist with pass/fail per gate
- `src/components/admin/PublishConfirmDialog.tsx` — publish confirmation dialog with pre-flight checks
- `src/components/admin/RollbackDialog.tsx` — rollback dialog (select version, confirm)

**Acceptance Criteria:**
- Publishing states: draft, in_review, changes_requested, approved, scheduled, published, rolled_back, archived
- Publishing transitions: draft->in_review (submit for review), in_review->approved (reviewer approves), approved->published (publisher publishes), published->rolled_back (revert to previous version)
- Approval gates: all gates must pass before content can be published
- Approval gates: source_check (sources verified), date_check (content current), legal_check (legal wording accurate), safety_check (no unsafe data), language_check (calm, precise wording)
- Pre-flight checks: before publish, run all gates, show results, block if any fail
- Rollback: select a previous version, confirm rollback, revert content to that version, create audit trail
- Scheduled publishing: set future publish date/time
- Version creation: every state transition that changes content creates a new version
- Publish notifications: notify relevant reviewers when content is published

**Guardrails:**
- All approval gates must pass before publication — no override without admin+legal_reviewer approval
- Rollback must be logged in audit trail
- Published content cannot be deleted — only rolled back or marked superseded
- Scheduled publishing must not bypass approval gates
- Gate failures must be documented with specific reasons

**Tests:**
- State machine follows valid transitions
- Invalid transitions are rejected
- Approval gates correctly pass/fail
- Pre-flight checks block content with failing gates
- Rollback restores content to previous version
- Scheduled publishing works
- Version created on each state transition

**Documentation Updates:**
- `docs/admin-cms-guide.md` — add publishing workflow documentation

**Suggested Commits:**
1. Publish workflow types and state machine
2. Approval gates
3. Publishing workflow component
4. Pre-flight checks and confirmation dialog
5. Rollback functionality
6. Scheduled publishing
7. Test suite

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Publishing workflow enforces draft -> review -> approved -> published gates. Rollback works. Tests pass.

---

### Prompt M6-03: Version Management

**Goals:** Content versioning: diff view, version history, rollback. Version metadata (who, when, what changed).

**Context:** Publishing workflow exists (M6-02). Need version management.

**Files Affected:**
- `supabase/migrations/00008_versions.sql` — content_versions table, version triggers, diff functions
- `src/lib/versioning/types.ts` — version types: ContentVersion, VersionDiff, VersionMetadata
- `src/lib/versioning/diff.ts` — diff engine: compare two versions, produce structured diff
- `src/lib/versioning/manager.ts` — version manager: create version, list versions, get version, rollback
- `src/components/admin/VersionList.tsx` — version list: chronological, with metadata
- `src/components/admin/VersionDiff.tsx` — version diff: side-by-side or unified view
- `src/components/admin/VersionRestoreDialog.tsx` — version restore confirmation dialog

**Acceptance Criteria:**
- content_versions table: version_id, content_type, content_id, version_number, data (full snapshot), diff (from previous), created_by, created_at, change_summary, state_at_version
- Automatic version creation on content update (database triggers)
- Version list: chronological, metadata (version number, author, timestamp, change summary), visual indicators for current/reverted
- Diff view: side-by-side for text fields, field-level diff for structured data, highlighted additions/deletions
- Rollback: select version, preview changes, confirm, creates new version with reverted data
- Change summary: auto-generated from diff (e.g., "Updated title, added 2 sources, changed status from draft to review")
- Version metadata: who made the change, when, what state the content was in, change summary
- Compare any two versions (not just adjacent)
- Maximum versions retention: keep last 50 versions per content item, archive older versions

**Guardrails:**
- Version data is append-only — never modify or delete version records
- Rollback creates a NEW version with the reverted data — does not delete intermediate versions
- Change summaries must not contain editorial opinions
- Version comparison must handle large content fields efficiently
- Version metadata must not include personal information beyond actor ID

**Tests:**
- Database trigger creates version on content update
- Version list displays correctly
- Diff view shows accurate changes
- Compare any two versions works
- Rollback creates new version with reverted data
- Change summary is accurate
- Maximum version retention enforces limit

**Documentation Updates:**
- `docs/admin-cms-guide.md` — add version management documentation

**Suggested Commits:**
1. Content versions schema and triggers
2. Diff engine
3. Version manager
4. Version list component
5. Version diff component
6. Version restore dialog
7. Test suite

**Rollback Considerations:** Revert individual commits. Version data is automatically preserved by DB triggers.

**Definition of Done:** Version management tracks all content changes with diff view and rollback capability. Tests pass.

---

### Prompt M6-04: Correction Management

**Goals:** Correction queue in admin. Correction application (update, downgrade, dispute, archive, withdraw, remove). Public correction log.

**Context:** Version management exists (M6-03). Need correction management.

**Files Affected:**
- `src/pages/admin/CorrectionQueuePage.tsx` — correction queue (admin)
- `src/components/admin/CorrectionQueueTable.tsx` — queue table with filters and batch actions
- `src/components/admin/CorrectionResolutionDialog.tsx` — resolution dialog: apply/downgrade/dispute/archive/withdraw/remove
- `src/pages/CorrectionsPage.tsx` — update public corrections page with log
- `src/components/corrections/PublicCorrectionLog.tsx` — public correction log display
- `src/components/corrections/CorrectionLogEntry.tsx` — individual log entry
- `src/lib/review/CorrectionManager.ts` — update with resolution workflows

**Acceptance Criteria:**
- Correction queue: all incoming corrections in table, filterable by category/status/date, sortable
- Correction resolution types: update (fix content, keep versioned history), downgrade (reduce verification level), dispute (maintain content with noted dispute), archive (remove from public view, keep for reference), withdraw (submitter retracts), remove (delete content — requires admin+security_admin)
- Resolution dialog: select resolution type, add notes, confirm action
- Public correction log: list of major corrections, each with: date, category, target page, resolution summary, link to affected page
- Major corrections always logged: factual_error, unsafe_personal_info, legal_wording, outdated_source
- Minor corrections logged internally but available on request: broken_link, duplicate, misleading_framing
- Correction notification: auto-notify affected content reviewers when correction is applied
- Audit integration: all correction actions logged to audit trail

**Guardrails:**
- "Remove" resolution requires dual approval (admin + security_admin)
- Public log must not expose submitter identity or internal notes
- Correction application must create a new content version
- Disputed corrections must show both the content and the dispute notice on the public page
- Downgrade must affect the specific claim/record, not the entire source

**Tests:**
- Correction queue displays all submissions
- Resolution dialog applies correct resolution
- Update resolution creates versioned content update
- Downgrade resolution reduces verification level
- Dispute resolution adds dispute notice
- Archive removes from public view
- Remove requires dual approval
- Public correction log shows major corrections
- No submitter identity in public log

**Documentation Updates:**
- `docs/admin-cms-guide.md` — add correction management documentation

**Suggested Commits:**
1. Correction queue page and table
2. Resolution dialog and workflows
3. Public correction log
4. Notification integration
5. Audit integration
6. Test suite

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Correction management with queue, resolution workflows, public log, and audit integration. Tests pass.

---

### Prompt M6-05: Role-Based Access Control

**Goals:** Implement RBAC: Public, Contributor, Researcher, Moderator, Partner Organization, Legal Reviewer, Security Admin, Admin. Least privilege. Audit logs.

**Context:** Admin CMS exists (M6-01). Need granular access control.

**Files Affected:**
- `supabase/migrations/00009_rbac.sql` — RBAC schema: permissions table, role_permissions, user_roles
- `src/lib/auth/permissions.ts` — permission definitions, permission checks
- `src/lib/auth/roles.ts` — role definitions (update from M5-02)
- `src/components/admin/PermissionGuard.tsx` — permission check component (hide/disable based on permission)
- `src/pages/admin/RoleManagementPage.tsx` — role management UI (admin only)
- `src/components/admin/UserRoleEditor.tsx` — user role assignment UI
- `src/components/admin/PermissionMatrix.tsx` — role-permission matrix display
- `src/lib/auth/__tests__/permissions.test.ts`

**Acceptance Criteria:**
- Roles: public (view only), contributor (suggest sources, create drafts), researcher (create draft evidence records), moderator (review evidence and corrections), partner_organization (edit approved profile, submit verified updates), legal_reviewer (review legal wording and risk flags), security_admin (infrastructure and incident response), admin (full management)
- Permissions per role defined in permissions.ts with granular actions (create/read/update/delete/approve/review per content type)
- Permission checks at: route level (redirect unauthorized), component level (hide/disable UI), API level (enforce via RLS + server-side checks)
- Role management UI: admin can view all users, assign roles, remove roles, view role-permission matrix
- Permission matrix: visual grid showing which roles have which permissions
- Least privilege: each role has minimum permissions needed for its function
- Audit: all role changes logged (who assigned, who received, what role, when)
- Session check: user permissions loaded on login, cached, re-verified on sensitive actions

**Guardrails:**
- Security_admin and admin must never be assigned to the same person
- Role changes must require current password re-verification
- Audit log must record all role changes with before/after
- Permissions must be checked server-side — never trust client-side only
- Default role for new users must be the least privileged (contributor)

**Tests:**
- Each role has correct permissions
- Permission checks block unauthorized access at route, component, and API levels
- Role management UI assigns and removes roles
- Permission matrix displays correctly
- Role changes logged to audit
- Session loads correct permissions

**Documentation Updates:**
- `docs/admin-authentication.md` — update with RBAC documentation

**Suggested Commits:**
1. RBAC schema and permissions definitions
2. Permission checks (route, component, API)
3. PermissionGuard component
4. Role management UI
5. Permission matrix
6. Audit integration
7. Test suite

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** RBAC with 8 roles and granular permissions. Route, component, and API-level enforcement. Role management UI. Tests pass.

---

### Prompt M6-06: Editorial Analytics

**Goals:** Content metrics: review throughput, correction rates, source diversity, review recency, unresolved disputes, legal review coverage, broken links.

**Context:** RBAC exists (M6-05). Need editorial metrics.

**Files Affected:**
- `src/pages/admin/EditorialAnalyticsPage.tsx` — editorial analytics dashboard
- `src/components/admin/ReviewThroughputChart.tsx` — review throughput over time
- `src/components/admin/CorrectionRatePanel.tsx` — correction rate by category, by content type
- `src/components/admin/SourceDiversityPanel.tsx` — source diversity: unique sources per content type, source type distribution
- `src/components/admin/ReviewRecencyPanel.tsx` — content freshness: last review date distribution
- `src/components/admin/DisputePanel.tsx` — unresolved disputes count and list
- `src/components/admin/LegalReviewCoveragePanel.tsx` — legal review coverage: what content has been legally reviewed
- `src/components/admin/BrokenLinkCheckPanel.tsx` — broken link check results
- `src/lib/admin/editorialMetrics.ts` — editorial metrics queries
- `scripts/check-broken-links.ts` — broken link checker script

**Acceptance Criteria:**
- Review throughput: items reviewed per day/week/month, by reviewer role, trend line
- Correction rate: corrections per category, per content type, rate over time, most corrected categories
- Source diversity: unique sources per content type, source type distribution (court/UN/NGO/journalism/academic), source freshness
- Review recency: distribution of contents by last review date, content not reviewed within freshness threshold
- Unresolved disputes: count of active disputes, list with ages, links to disputed content
- Legal review coverage: percentage of content with legal review, by type, legal-reviewed vs not
- Broken links: automated check results, broken URLs, 404s, redirects, last checked date, auto-flagging for review
- Exportable reports for all metrics
- Metric thresholds: configurable alerts when metrics fall below thresholds

**Guardrails:**
- Editorial analytics are admin-only — never public
- Metrics must not identify individual reviewers by name (aggregate only)
- Broken link checker must respect website rate limits
- Source diversity is a quality indicator, not an absolute score
- Legal review coverage must not pressure reviewers to rush

**Tests:**
- EditorialAnalyticsPage renders all panels
- ReviewThroughputChart shows correct data
- CorrectionRatePanel calculates correct rates
- SourceDiversityPanel shows distribution
- ReviewRecencyPanel identifies stale content
- DisputePanel shows unresolved disputes
- LegalReviewCoveragePanel calculates coverage percentage
- BrokenLinkCheckPanel displays check results

**Documentation Updates:**
- `docs/admin-cms-guide.md` — add editorial analytics documentation

**Suggested Commits:**
1. Editorial metrics query functions
2. Review throughput and correction rate panels
3. Source diversity and review recency panels
4. Dispute and legal review coverage panels
5. Broken link checker script
6. Editorial analytics dashboard
7. Test suite

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Editorial analytics dashboard shows review throughput, correction rates, source diversity, freshness, disputes, legal coverage, and broken links. Tests pass.

---

## Milestone 7 — Functional Beta

### Prompt M7-01: System Integration

**Goals:** End-to-end integration of all systems. Data flow verification. Cross-system testing.

**Context:** All individual systems are built (M4 collectors + AI pipeline, M5 backend, M6 editorial). Need full integration.

**Files Affected:**
- `src/__tests__/integration/fullSystem.test.ts` — full system integration test
- `scripts/verify-data-flow.sh` — data flow verification script
- `docs/system-integration-diagram.md` — system integration diagram

**Acceptance Criteria:**
- Integration test: source fetch -> normalize -> AI pipeline -> review queue -> review -> publish -> public API -> search -> map display
- Data flow verification: every pipeline stage produces correct output for next stage
- Cross-system: backend syncs with collector framework, AI pipeline outputs feed review queue, reviewed content appears in public API
- Identity management: users created in auth appear in RBAC, roles propagate to API permissions
- Content lifecycle: create (admin CMS) -> review (review queue) -> publish (publishing workflow) -> correct (correction workflow) -> version (version management) all connected
- Map integration: database spatial queries feed map layers with safety enforcement
- Search integration: published content indexed and searchable via search API
- All 226+ existing tests still pass
- All new integration tests pass

**Guardrails:**
- Integration test must not use production data or services
- All external services mocked in integration tests
- Data flow verification must be automated (CI-compatible)
- Cross-system failures must produce clear error messages
- System integration must be documented with architecture diagram

**Tests:** (self-referential — this prompt IS about integration testing)

**Documentation Updates:**
- `docs/system-integration-diagram.md` — architecture diagram and data flow documentation

**Suggested Commits:**
1. Full system integration test
2. Data flow verification script
3. Cross-system connectivity fixes
4. System integration documentation

**Rollback Considerations:** Revert integration fixes individually.

**Definition of Done:** All systems integrate end-to-end. Data flows correctly through the entire pipeline. Integration tests pass.

---

### Prompt M7-02: Content Population and Review

**Goals:** Populate platform with reviewed content: 50+ evidence items, 10 country/institution pages, 10 legal tracker entries, 30 organization entries, 20 action templates, 5 dossiers.

**Context:** All systems integrated (M7-01). Need substantial content.

**Files Affected:**
- `src/data/sources.ts` — expand to 50+ source records
- `src/data/evidenceItems.ts` — expand to 50+ evidence items with reviewed status
- `src/data/legalCases.ts` — expand to 10+ legal cases
- `src/data/countries.ts` — expand to 10+ countries
- `src/data/institutions.ts` — expand to additional institutions
- `src/data/organizations.ts` — expand to 30+ organizations
- `src/data/actionTemplates.ts` — expand to 20+ action templates
- `src/data/dossiers.ts` — add 5 dossiers
- `src/data/attributions.ts` — update with new media assets

**Acceptance Criteria:**
- 50+ evidence items across all categories with source references, verification levels, review metadata
- 10+ country/institution pages with position records, voting data, arms transfer data, aid data, contact routes
- 10+ legal tracker entries across ICJ, ICC, UN COI, national courts, sanctions
- 30+ organization entries across all categories with relationship labels
- 20+ action templates in EN, with NL and FR translations for Belgium/EU templates
- 5+ dossiers covering: Gaza accountability (one-page + five-page), Belgium action brief, EU action brief, Humanitarian access brief
- All content reviewed (contentStatus: "reviewed") with documented reviewer roles, dates, source references
- Content validation passes with 0 errors
- Source diversity: mix of court, UN, government, humanitarian, NGO, journalism, academic, OSINT sources

**Guardrails:**
- Every factual claim must have a source reference
- No unverified casualty figures presented as established fact
- Legal status labels must accurately distinguish allegations, proceedings, findings, rulings
- Country positions must be current and source-verified
- Organization listings must not imply partnership without written confirmation
- Action templates must be reviewed for jurisdiction, tone, safety

**Tests:**
- `npm run validate:content` passes with 0 errors
- All records have valid source references
- All records have contentStatus, lastReviewedAt, reviewedByRole
- Evidence items have correct verification levels
- Legal cases have correct legal status labels
- Organizations have correct relationship labels
- Dossiers reference valid evidence and legal case IDs

**Documentation Updates:**
- Update `docs/attributions.md` with new media

**Suggested Commits:**
1. Expand source records (50+)
2. Expand evidence items (50+) with review metadata
3. Expand legal cases, countries, institutions
4. Expand organizations (30+)
5. Expand action templates (20+) with NL/FR translations
6. Create 5+ dossiers
7. Validation and review metadata pass

**Rollback Considerations:** Revert individual data file commits.

**Definition of Done:** Platform populated with 100+ reviewed content records. All records validated, sourced, and reviewed. Content validation passes with 0 errors.

---

### Prompt M7-03: Security Hardening

**Goals:** Penetration testing. Dependency audit. CSP and security headers. Rate limiting. WAF configuration. 2FA enforcement.

**Context:** Content populated (M7-02). Need security hardening before beta launch.

**Files Affected:**
- `public/_headers` — update CSP and security headers
- `index.html` — update CSP meta tag
- `supabase/security/policies.sql` — security policies update
- `scripts/security-audit.sh` — security audit script
- `.github/workflows/security-scan.yml` — security scanning workflow
- `docs/security-review-report.md` — security review findings

**Acceptance Criteria:**
- CSP audit: verify all resources match allowed sources, no unsafe-inline (except where necessary for React), upgrade-insecure-requests enabled
- Dependency audit: `npm audit` passes with 0 critical vulnerabilities, all high vulnerabilities reviewed and documented
- WAF configuration: rate limiting rules, SQL injection protection, XSS protection, IP blocklist capability
- 2FA enforcement: all non-public roles have 2FA enabled, verified before API access
- Session security: HTTP-only, Secure, SameSite=Strict cookies; configurable session timeout; refresh token rotation
- API rate limiting: public endpoints (100 req/min/IP), admin endpoints (30 req/min/IP), auth endpoints (10 req/min/IP, 5 failed attempts lockout)
- Input validation: all API inputs validated against Zod schemas, SQL injection prevention parameterized queries
- Security headers audit: CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors all present and correct
- Penetration testing: basic automated pentest completed (OWASP ZAP or equivalent), findings documented and addressed
- Security.txt updated with current contact information

**Guardrails:**
- Do not disable CSP for convenience
- 2FA enforcement must not have opt-out for non-public roles
- Rate limiting must not be disabled for debugging
- Dependency vulnerabilities must be fixed, not ignored
- Pentest findings must be addressed before launch

**Tests:**
- CSP blocks inline scripts not in nonce/hash
- Dependency audit passes
- Rate limiting blocks excess requests
- 2FA enforced for admin roles
- Security headers present and correct
- Input validation rejects malformed data
- Pentest finds no critical vulnerabilities

**Documentation Updates:**
- `docs/security-review-report.md` — security findings
- `SECURITY.md` — update with current procedures

**Suggested Commits:**
1. CSP and security headers audit/update
2. Dependency vulnerability fixes
3. WAF and rate limiting configuration
4. 2FA enforcement verification
5. Input validation audit
6. Automated pentest and remediation
7. Security scanning CI workflow

**Rollback Considerations:** Revert security fix commits individually. CSP changes can be rolled back via git revert.

**Definition of Done:** Security hardening complete. No critical vulnerabilities. CSP, rate limiting, 2FA all enforced. Pentest passes.

---

### Prompt M7-04: Performance Optimization

**Goals:** Load testing. CDN optimization. Image optimization. Code splitting. Bundle analysis. Database query optimization.

**Context:** Security hardening done (M7-03). Need performance optimization for launch.

**Files Affected:**
- `vite.config.ts` — build optimization: code splitting, chunk strategy, manual chunks
- `src/App.tsx` — dynamic imports for all non-critical routes
- `public/_headers` — CDN cache headers
- `supabase/functions/api/v1/` — query optimization across all endpoints
- `src/components/map/MapContainer.tsx` — performance: tile caching, lazy loading
- `scripts/load-test.yaml` — k6 load test configuration
- `scripts/bundle-analysis.sh` — bundle analysis script

**Acceptance Criteria:**
- Bundle analysis: main JS bundle < 300 KB (gzipped), total initial load < 500 KB (gzipped), dynamic chunks for each route
- Code splitting: all page components lazy-loaded, vendor chunk separate from app chunk, map and graph libraries in deferred chunk
- Image optimization: all images in WebP format, responsive image sizes, lazy loading for below-fold images, proper caching headers
- CDN optimization: cache headers (30d for assets, 5min for content), CDN edge caching configured, purge on content update
- Database query optimization: all queries use indexes, N+1 queries eliminated, pagination efficient, spatial queries use spatial indexes
- Load testing: home page < 2s (p95), API response < 500ms (p95), map rendering < 3s (p95), supports 1000 concurrent users
- Lighthouse scores: Performance > 90, Accessibility > 95, Best Practices > 95, SEO > 95
- TTFB: < 500ms for static assets, < 200ms for CDN-cached content
- Map performance: GeoJSON layers < 5MB, smooth rendering at 60fps for 500+ features

**Guardrails:**
- Code splitting must not break lazy-loaded routes (test all routes)
- Image optimization must preserve quality — no aggressive compression
- Caching must not serve stale content — implement cache invalidation on content update
- Load testing must not impact production services (use staging or isolated environment)
- Performance optimization must not reduce accessibility

**Tests:**
- Bundle size checks pass (CI)
- Lighthouse scores meet thresholds
- Load test completes with < 5% error rate
- All routes render correctly after code splitting
- API responses within time budget
- Map renders within performance budget

**Documentation Updates:**
- `docs/quality-and-testing.md` — add performance testing documentation

**Suggested Commits:**
1. Bundle analysis and code splitting
2. Image optimization
3. CDN caching configuration
4. Database query optimization
5. Load testing setup and optimization
6. Performance verification

**Rollback Considerations:** Revert individual optimization commits. Bundle config can be rolled back.

**Definition of Done:** Performance optimization meets all thresholds. Bundle < 300KB initial. Lighthouse > 90. Load test passes for 1000 concurrent users.

---

### Prompt M7-05: Beta User Onboarding

**Goals:** Beta user documentation. Onboarding flow. Feedback collection. Bug reporting workflow.

**Context:** Performance optimization done (M7-04). Need beta user infrastructure.

**Files Affected:**
- `docs/beta-user-guide.md` — beta user guide
- `docs/beta-feedback-process.md` — feedback and bug reporting process
- `src/pages/beta/BetaWelcome.tsx` — beta welcome page (post-login)
- `src/pages/beta/BetaQuickStart.tsx` — quick start guide
- `src/components/beta/BetaFeedbackForm.tsx` — feedback submission form
- `src/components/beta/BetaBugReportForm.tsx` — bug report form
- `src/lib/beta/feedback.ts` — feedback submission API integration
- `src/lib/beta/types.ts` — beta types: FeedbackSubmission, BugReport, UserJourney

**Acceptance Criteria:**
- Beta user guide: platform overview, key features, how to find content, how to use action templates, how to submit corrections, how to report bugs
- Onboarding flow: welcome page on first login, quick start guide, role-specific documentation links, contact/support info
- Feedback form: rating (1-5), category (content/UI/performance/feature/missing), free text, optional screen recording or screenshot
- Bug report form: description, steps to reproduce, expected vs actual behavior, browser/device info, severity, optional screenshot
- Feedback stored in database with user reference, timestamp, page context, browser info
- Feedback moderation queue: admin can review, categorize, prioritize, respond, close
- Bug report triage: auto-categorize by severity, assign to appropriate maintainer, status tracking
- User journey tracking: anonymous aggregate analytics (which pages visited, which features used, time on page) — no personal data
- All feedback/bug forms require authentication (no anonymous spam)
- Rate limiting on submissions

**Guardrails:**
- Feedback must not collect personal data beyond user account (already authenticated)
- Anonymous analytics must be opt-in and privacy-preserving
- User journey tracking must not track individual users — aggregate only
- Bug reports must not accept file uploads without size/type validation
- Feedback moderation must not censor legitimate criticism

**Tests:**
- BetaWelcome page renders for authenticated users
- Feedback form submits correctly
- Bug report form submits correctly
- Feedback stored in database
- Bug report appears in moderation queue
- Rate limiting works
- Anonymous analytics are aggregate-only

**Documentation Updates:**
- `docs/beta-user-guide.md` — beta user documentation
- `docs/beta-feedback-process.md` — feedback process documentation

**Suggested Commits:**
1. Beta user guide and quick start
2. Beta welcome and onboarding pages
3. Feedback form and API
4. Bug report form and triage
5. Feedback moderation queue
6. Anonymous analytics
7. Test suite

**Rollback Considerations:** Revert individual commits.

**Definition of Done:** Beta user onboarding complete with guide, feedback form, bug reporting, and anonymous analytics. Tests pass.

---

### Prompt M7-06: Public Launch Preparation

**Goals:** Pre-launch checklist. Monitoring and alerting setup. Incident response plan. Communication plan. Press kit.

**Context:** Beta user onboarding working (M7-05). Need launch preparation.

**Files Affected:**
- `docs/launch-checklist.md` — pre-launch checklist
- `docs/incident-response-plan.md` — incident response plan
- `docs/communication-plan.md` — launch communication plan
- `docs/press-kit.md` — press kit
- `docs/monitoring-alerting.md` — monitoring and alerting configuration
- `public/social-preview.png` — social preview image (PNG version)
- `public/apple-touch-icon.png` — iOS/touch icon
- `src/data/routeMetadata.ts` — update for indexed pages (enable indexing for public content)
- `docs/indexing-configuration.md` — update with launch indexing instructions

**Acceptance Criteria:**
- Pre-launch checklist complete: all Milestone 7 prompts done, all tests pass, security hardened, performance optimized, content reviewed, beta user infrastructure active
- Monitoring: uptime monitoring configured (status page), error tracking (error budgets), performance monitoring, traffic monitoring
- Alerting: on-call rotation defined, alert channels (email, SMS, Slack), severity levels (critical/warning/info), escalation paths
- Incident response plan: incident classification (security breach, data breach, service outage, content error), response steps per class, communication templates, post-mortem process
- Communication plan: announcement channels (social media, mailing list, partner orgs), talking points, FAQ, spokesperson designation
- Press kit: project one-pager, founder bio (if desired), screenshots (approved), logo package, key statistics, quote policy, contact for press
- Social preview image (PNG) — SVG exists, generate PNG version
- iOS/touch icon generated
- Indexing enabled for public content pages (remove noindex for published pages)
- SEO: all public pages have unique titles, meta descriptions, OG tags, canonical URLs, structured data

**Guardrails:**
- Press kit must not claim partnerships that don't exist
- Communication plan must include prepared statements for potential backlash
- Incident response plan must include legal counsel contact
- Monitoring must not collect personal data
- Spokesperson designation must be explicit and authorized

**Tests:**
- Pre-launch checklist items verified
- Monitoring detects configured test alert
- Incident response plan covers all incident classes
- Social preview PNG renders correctly
- Indexing enabled for content pages
- SEO metadata correct for all public pages

**Documentation Updates:**
- All launch documentation created

**Suggested Commits:**
1. Pre-launch checklist and verification
2. Monitoring and alerting configuration
3. Incident response plan
4. Communication plan
5. Press kit and brand assets
6. SEO and indexing update
7. Launch readiness verification

**Rollback Considerations:** SEO/indexing changes can be reverted. Monitoring can be disabled.

**Definition of Done:** Platform is launch-ready. Pre-launch checklist complete. Monitoring active. Incident response plan in place. Press kit prepared. Launch can proceed.

---

## Appendix A: Migration Paths

This appendix documents how to migrate between milestones and how to handle version transitions.

### Static to Database Migration

1. Verify all static TypeScript data files pass validation (`npm run validate:content`)
2. Run migration script (M5-01) to populate Supabase tables
3. Verify row counts match between static files and database
4. Test public API against migrated data
5. Switch frontend data source from static files to API (feature flag controlled)
6. Keep static files as fallback until API is stable
7. Remove static files after 2 weeks of stable API

### Static Beta to Functional Beta Transition

1. Complete all M3 prompts (Static Product)
2. Complete M4 prompts (Intelligence Layer) — this can overlap with M5/M6
3. Complete M5 prompts (Backend)
4. Complete M6 prompts (Editorial Platform)
5. Complete M7 prompts (Functional Beta)
6. Deploy backend infrastructure in parallel with frontend development
7. Switch DNS when frontend + backend integration is stable

### Development-Only to Production Transition

1. Security hardening (M7-03)
2. Performance optimization (M7-04)
3. Monitoring and alerting (M7-06)
4. Set up production Supabase project (separate from staging)
5. Configure CDN and WAF (Cloudflare)
6. Deploy to production domain
7. Enable indexing for public content
8. Monitor for 48 hours before announcing

---

## Appendix B: Quick Reference — File Locations

| Component | Directory |
|---|---|
| UI Components | `src/components/ui/` |
| Landing Page Components | `src/components/landing/` |
| Layout Components | `src/components/layout/` |
| Evidence Components | `src/components/evidence/` |
| Legal Components | `src/components/legal/` |
| Organization Components | `src/components/organizations/` |
| Action Components | `src/components/actions/` |
| Map Components | `src/components/map/` |
| Graph Components | `src/components/graph/` |
| Admin Components | `src/components/admin/` |
| Review Components | `src/components/review/` |
| Beta Components | `src/components/beta/` |
| Pages | `src/pages/` |
| Data Files | `src/data/` |
| Static Types | `src/types/` |
| Schemas | `src/schemas/` |
| Collectors | `src/lib/collectors/` |
| AI Pipeline | `src/lib/ai/` |
| Review Queue | `src/lib/review/` |
| Monitoring | `src/lib/collectors/monitoring/` |
| Graph (Knowledge) | `src/lib/graph/` |
| Map Utilities | `src/lib/map/` |
| Auth | `src/lib/auth/` |
| Database | `src/lib/db/` |
| API Client | `src/lib/api/` |
| Audit | `src/lib/audit/` |
| Versioning | `src/lib/versioning/` |
| Search | `src/lib/search/` |
| Admin Metrics | `src/lib/admin/` |
| Beta | `src/lib/beta/` |
| Documentation | `docs/` |
| Runbooks | `docs/runbooks/` |
| Database Migrations | `supabase/migrations/` |
| Edge Functions | `supabase/functions/` |
| Scripts | `scripts/` |
| Integration Tests | `src/__tests__/integration/` |

---

## Appendix C: Prompt Dependency Graph

```
M1 (Foundation)
  M2 (Landing Page)
    M3 (Static Product)
      M4.1 (Collector Framework)
        M4.2 (AI Pipeline)
          M4.3 (Review Queue)
            M4.4 (Intelligence Dashboard)
              M4.7 (Testing, Docs, Monitoring)
          M4.5 (Maps)
            M4.6 (Knowledge Graph)
      M5 (Backend)
        M6 (Editorial Platform)
          M7 (Functional Beta)
```

Prompts within a milestone are sequential. Milestone 4 sub-milestones can overlap:
- M4.1 must precede M4.2 (collectors feed the AI pipeline)
- M4.2 must precede M4.3 (AI output needs review)
- M4.2 can run in parallel with M4.5 (maps can use geographic extraction results as they arrive)
- M4.6 can run once M4.2 stages produce entity/relationship data
- M4.4 and M4.7 can run after M4.1-M4.3 are substantially complete
- M5 can begin after M4 data models are stable
- M6 depends on M5 APIs
- M7 depends on all M4-M6

---

## Appendix D: Risk Register for Prompt Execution

| Risk | Mitigation |
|---|---|
| AI pipeline produces hallucinated content | M4.2-12 (Hallucination Detection) is mandatory before any AI output reaches review |
| Collector triggers too many requests to source | M4.1-02 (Rate Limiter) enforces per-source limits |
| Unsafe coordinates published on map | M4.5-02 (Safety Function) is the ONLY coordinate path to the map |
| Database migration loses data | M5-01 migration script is reversible; test on staging first |
| Security breach via admin account | M5-02 requires 2FA for all admin roles; M6-05 enforces RBAC |
| Content published without review | M6-02 (Publishing Workflow) requires all approval gates to pass |
| Correction accidentally deletes content | M6-04 requires dual approval for deletion; M6-03 preserves version history |
| Performance degradation under load | M7-04 includes load testing with 1000 concurrent users |
| Legal liability from content | All prompts include guardrails; M1-03 established legal framework |
| Contributor burnout | M2-04 and M3-11 emphasize "start small" culture; M3-14 includes volunteer wellbeing |


