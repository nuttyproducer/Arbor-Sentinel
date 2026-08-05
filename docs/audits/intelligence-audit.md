# Intelligence Audit — RSS, API Collectors & Intelligence Dashboard

**Date:** 2026-08-05
**Branch:** `feature/landing-page`
**Scope:** Data collection, ingestion, AI processing, dashboards

---

## Source Registry

### Source Model
**Status:** ✅ Complete

- **Type definitions:** `src/types/content.ts` — `SourceType` enum (10 types: court, un, government, humanitarian, ngo, academic, journalism, osint, etc.), `HealthStatus`, `AutomationStatus`, `FeedConfig`, `SourceRecord`
- **Static registry:** `src/data/sources.ts` — all sources listed with `healthStatus: "unknown"`, `automationStatus: "manual"`
- **DB table:** `sources` in `00001_initial_schema.sql` — name, type, url, country, credibility_tier (1–5), notes
- **Seed data:** 12 sources in `supabase/seed.sql` (ICJ, ECHR, ICC, OCHA, OHCHR, UNRWA, Amnesty, HRW, B'Tselem, Belgian Gov, EEAS, Al Jazeera)
- **Admin UI:** Generic `ContentList`/`ContentEditor` on `/admin/sources` via `contentConfig.tsx` — CRUD on sources table

**Weaknesses:**
- All sources are `automationStatus: "manual"` — no source has automation wired
- `SourceRecord` has automation fields (`apiEndpoint`, `apiKeyRef`, `rssFeedUrl`, `feedConfig`) but none are populated
- No automated source discovery or suggestion

**Recommended:** Keep as-is. Populate automation fields when wiring collectors to sources.

---

### Source Metadata & Trust Levels
**Status:** ✅ Complete

- `credibility_tier` (1–5) on sources table
- `verification_level` (0–5) on evidence_items
- Source type categorization in `SourceType` enum
- RLS policies: public read, admin write

**Weaknesses:** Credibility tiers are manually assigned, no automated re-evaluation.

**Recommended:** Keep as-is. Add automated credibility re-scoring when collector reliability metrics accumulate.

---

## RSS Support

**Status:** 🟡 Partial

### Parser
- `src/lib/collectors/feeds/FeedParser.ts` — hand-rolled RSS 2.0 + Atom 1.0 parser
- Regex-based, no external XML library
- Handles CDATA, HTML stripping, date normalization, auto-format detection
- Tests: `FeedParser.test.ts`
- **Weakness:** Regex-based parsing is fragile for edge cases; no support for RSS 1.0 (RDF), JSON Feed, or namespaced extensions (Media RSS, GeoRSS)

### Feed Configuration
- `src/lib/collectors/feeds/feedConfig.ts` — 12+ feed definitions:
  - **Journalism:** Reuters, AP, BBC, Al Jazeera, NYT, Guardian
  - **NGO:** HRW, Amnesty, MSF
  - **Academic:** SSRN
- Each feed has: URL, `sourceId`, `sourceType`, `pollingIntervalMinutes`, `categoryMapping`, `hasPaywall`, `enabled`
- Helpers: `getFeedsBySourceType()`, `getEnabledFeeds()`
- **Weakness:** Feed configuration is hardcoded; no admin UI to add/edit/delete feeds

### Proxy
- `supabase/functions/rss-proxy/index.ts` — Deno edge function for server-side RSS→JSON
- **Orphaned:** Not referenced anywhere in `src/` or docs, not wired to any collector

### Scheduler
- `src/lib/collectors/scheduler.ts` — `Scheduler` class with `manual`/`interval`/`cron` trigger types
- Interval runs via `setInterval` (in-process, no persistence)
- `executeJob()` is a **stub** — throws descriptive error, expects caller to wire collectors
- Cron trigger type exists but has no parser; defaults to hourly placeholder
- External cron: only `.github/workflows/security-scan.yml` (weekly, unrelated)

### Duplicate Detection
- `BaseCollector.ts` generates fingerprints and deduplicates in the `deduplicate` pipeline stage
- `src/lib/collectors/media/JournalismCollector.ts` cross-feed dedup by GUID + URL
- `src/lib/ai/stages/DuplicateDetector.ts` — AI-powered near-duplicate detection against existing records

### Missing:
- ❌ Persistent scheduler (no cron jobs, no pg-boss/bull)
- ❌ Feed management admin UI
- ❌ RSS proxy integration
- ❌ Proper XML library (no `rss-parser` or `fast-xml-parser` in package.json)
- ❌ Feed update detection beyond GUID/URL fingerprinting

**Recommended:** Keep existing FeedParser and feedConfig. Add feed management UI. Wire rss-proxy edge function. Consider adding `fast-xml-parser` for robust XML. Implement persistent scheduling when moving beyond static beta.

---

## API Collectors

### Court/Legal Collectors
**Status:** ✅ Complete

| Collector | Source | File | Method |
|-----------|--------|------|--------|
| ICCCollector | icc-cpi.int | `src/lib/collectors/courts/ICCCollector.ts` | HTML scraping |
| ICJCollector | icj-cij.org | `src/lib/collectors/courts/ICJCollector.ts` | HTML scraping |
| LegalNormalizer | Shared | `src/lib/collectors/courts/LegalNormalizer.ts` | Normalization |

### UN Collectors
**Status:** ✅ Complete

| Collector | Source | File | Method |
|-----------|--------|------|--------|
| OCHACollector | ochaopt.org, unocha.org | `src/lib/collectors/un/OCHACollector.ts` | HTML scraping + RSS |
| OHCHRCollector | ohchr.org | `src/lib/collectors/un/OHCHRCollector.ts` | HTML scraping |
| UNNormalizer | Shared | `src/lib/collectors/un/UNNormalizer.ts` | Normalization |

### NGO Collectors
**Status:** ✅ Complete

| Collector | Source | File |
|-----------|--------|------|
| AmnestyCollector | amnesty.org | `src/lib/collectors/ngo/AmnestyCollector.ts` |
| HRWCollector | hrw.org | `src/lib/collectors/ngo/HRWCollector.ts` |
| BtselemCollector | btselem.org | `src/lib/collectors/ngo/BtselemCollector.ts` |
| MSFCollector | msf.org | `src/lib/collectors/ngo/MSFCollector.ts` |
| ICRCCollector | icrc.org | `src/lib/collectors/ngo/ICRCCollector.ts` |
| NGONormalizer | Shared | `src/lib/collectors/ngo/NGONormalizer.ts` |

### Government/EU Collectors
**Status:** ✅ Complete

| Collector | Source | File |
|-----------|--------|------|
| EUCollector | Council, Commission, Parliament, EEAS, EUR-Lex | `src/lib/collectors/eu/EUCollector.ts` |
| BelgiumCollector | FPS Foreign Affairs, Chamber, Senate | `src/lib/collectors/eu/BelgiumCollector.ts` |
| GovernmentNormalizer | Shared | `src/lib/collectors/eu/GovernmentNormalizer.ts` |

### Media/Academic Collectors
**Status:** ✅ Complete

| Collector | Source | File | Method |
|-----------|--------|------|--------|
| JournalismCollector | RSS feeds (Reuters, AP, BBC, Al Jazeera, NYT, Guardian) | `src/lib/collectors/media/JournalismCollector.ts` | RSS polling |
| AcademicCollector | SSRN RSS + CrossRef API + Unpaywall API | `src/lib/collectors/media/AcademicCollector.ts` | RSS + API enrichment |
| MediaNormalizer | Shared | `src/lib/collectors/media/MediaNormalizer.ts` | Normalization |

### Missing Collectors (specified in PRD/spec but not implemented):
- ❌ ReliefWeb collector
- ❌ UNHCR collector
- ❌ WHO collector
- ❌ Additional country-specific collectors (France, Germany, Netherlands, etc.)
- ❌ Official API-based collectors (all current collectors use scraping, not official APIs where available)

**Recommended:** 10 collectors implemented across 5 domains — substantial coverage. Prioritize wiring existing collectors before adding new ones. Add ReliefWeb (has a clean API) as the next collector.

---

## Collector Framework

**Status:** ✅ Complete

### Core Components

| Component | File | Description |
|-----------|------|-------------|
| BaseCollector | `src/lib/collectors/BaseCollector.ts` | Abstract base enforcing 5-stage pipeline |
| CollectorRegistry | `src/lib/collectors/CollectorRegistry.ts` | Registers, caches, and creates collector instances |
| Scheduler | `src/lib/collectors/scheduler.ts` | Interval/cron job scheduling (in-process) |
| RateLimiter | `src/lib/collectors/rateLimiter.ts` | Per-domain sliding-window + per-source min-delay + concurrency |
| Retry | `src/lib/collectors/retry.ts` | Exponential backoff + jitter + retryable status detection |
| Errors | `src/lib/collectors/errors.ts` | Typed error hierarchy with retryability flags |
| Store | `src/lib/collectors/store.ts` | DevMemoryStore (in-memory, no persistence) |
| Types | `src/lib/collectors/types.ts` | All shared types + defaults |

### Pipeline (enforced by BaseCollector)
```
fetch → validate → normalize → deduplicate → store
```
Each stage timed, errors isolated, rate-limited, retried.

### Configuration
- `DEFAULT_RETRY_CONFIG`: maxRetries 3, initialDelay 1s, multiplier 2.0, maxDelay 30s, jitter on
- `DEFAULT_FETCH_TIMEOUT_MS`: 30s
- `DEFAULT_RATE_LIMIT`: minDelay 1s, 30 req/min, maxConcurrent 2, burstSize 5
- Per-domain rate limiting
- `Retry-After` header respect

### Monitoring
- `src/lib/collectors/monitoring/` — HealthMonitor, AlertSystem, MetricsCollector
- Status lifecycle: `unknown → active → degraded → failed`
- Per-collector metrics (fetches, success rate, response time, errors)
- Alert rules: consecutive failures (warn@3, critical@5), stale data, high error rate (>50%), rate-limit spikes
- Cooldown enforcement to prevent alert fatigue
- Coverage gap detection

### Strengths:
- Well-architected plugin system — new collectors extend `BaseCollector`
- Typed error hierarchy with automatic retry classification
- Comprehensive test coverage (unit + integration)
- 10 concrete collectors demonstrating the pattern works

### Weaknesses:
- `DevMemoryStore` — no persistence; collector runs are lost on page refresh
- `Scheduler.executeJob()` is a stub
- No persistent scheduling infrastructure
- `collector_runs` DB table exists but has no code path persisting to it

**Recommended:** Keep the framework architecture. Wire `DevMemoryStore` → `collector_runs` table. Implement `executeJob()`. Add persistent scheduling (Supabase cron or pg-boss) when ready for production ingestion.

---

## Fetch Pipeline

**Status:** ✅ Complete

### Download
- Native `fetch` with AbortController timeouts
- RSS polling via `FeedParser`
- HTML scraping via regex-based extraction
- API calls via CrossRef and Unpaywall (AcademicCollector)
- RSS proxy edge function available but unwired

### Normalize
- Domain-specific normalizers: MediaNormalizer, NGONormalizer, UNNormalizer, GovernmentNormalizer, LegalNormalizer
- All produce `NormalizedContent` with `sourceId`, `url`, `title`, `summary`, `content`, `publishedAt`, `language`, `category`, `metadata`

### Validate
- `BaseCollector.validate()` enforces schema validation
- Typed `ValidationError` for malformed content

### Store
- `DevMemoryStore` — in-memory only
- Fingerprint-based dedup in `BaseCollector.deduplicate()`

### Missing:
- ❌ Persistent storage (DB write path for collector runs)
- ❌ Content versioning on fetch (content_versions table not used by collectors)
- ❌ Fetch provenance tracking (which collector/run produced which content)

**Recommended:** Wire `DevMemoryStore` to `collector_runs` table. Add content versioning for fetched items.

---

## AI Processing

**Status:** ✅ Complete

### Pipeline Engine
- `src/lib/ai/AIPipeline.ts` — DAG orchestrator, topological sort, parallel stage execution, failure isolation
- 14 stages defined in `src/lib/ai/stages/`
- Provider: DeepSeek (`deepseek-chat`) via OpenAI-compatible adapter in `provider.ts`
- No external AI SDK dependencies

### 14 Pipeline Stages

| Stage | File | Status |
|-------|------|--------|
| LanguageDetector | `stages/LanguageDetector.ts` | ✅ |
| Translator | `stages/Translator.ts` | ✅ |
| TranslationReviewer | `stages/TranslationReviewer.ts` | ✅ |
| Summarizer | `stages/Summarizer.ts` | ✅ |
| EntityExtractor | `stages/EntityExtractor.ts` | ✅ |
| ClaimExtractor | `stages/ClaimExtractor.ts` | ✅ |
| TimelineExtractor | `stages/TimelineExtractor.ts` | ✅ |
| GeographicExtractor | `stages/GeographicExtractor.ts` | ✅ |
| RelationshipDetector | `stages/RelationshipDetector.ts` | ✅ |
| TopicClassifier | `stages/TopicClassifier.ts` | ✅ |
| DuplicateDetector | `stages/DuplicateDetector.ts` | ✅ |
| ContradictionDetector | `stages/ContradictionDetector.ts` | ✅ |
| HallucinationDetector | `stages/HallucinationDetector.ts` | ✅ |
| ConfidenceEstimator | `stages/ConfidenceEstimator.ts` | ✅ (algorithmic, no LLM call) |

### Infrastructure
- `ModelRouter.ts` — routes tasks by type, content length, language; 15 default routes
- `PromptManager.ts` — versioned prompt templates with variable substitution
- `StructuredOutputHandler.ts` — Zod-validated JSON extraction with self-correction retries
- `RateLimiter.ts` — token-bucket (1M tokens/min, 60 req/min, 5 concurrent)
- `ErrorHandler.ts` — AI error classification + per-type retry configs
- `Logger.ts` — immutable audit log for every AI call

### Edge Function
- `supabase/functions/ai-analyze/index.ts` — Deno edge function; classify/summarize/extract_entities/analyze tasks

### Knowledge Graph Integration
- `src/lib/graph/population/PipelineIntegration.ts` — maps `AIProcessedContent` → graph nodes/edges
- 7 graph populators: Source, Document, Entity, Claim, Event, Location, Relationship
- Entity resolution/dedup via `EntityResolver.ts`

### Testing
- Per-stage unit tests (20+ files)
- Integration tests: `collectorToAI.test.ts`, `AIToReview.test.ts`, `graphPopulation.test.ts`, `fullWorkflow.test.ts`
- Ground truth datasets for 7 stages
- Confidence calibration and hallucination regression suites

### DB
- `ai_operations` table: operation_type, model_used, confidence (0–1 CHECK), token counts, latency, source_spans, warnings, status
- RLS: admin + researcher select; admin-only all

### Weaknesses:
- No embeddings/vector search (lexical FTS only via Postgres `tsvector`)
- DeepSeek coupling — provider swap requires adapter changes
- No content-length guardrails for very large documents

### Missing:
- ❌ Embedding generation
- ❌ Vector similarity search
- ❌ Multi-model provider support (single DeepSeek provider)
- ❌ AI operations queue (processing is synchronous in-memory)

**Recommended:** Keep as-is. The pipeline is complete and well-tested. Plan embeddings/vector search as a future enhancement (not in current milestone scope). Add Anthropic/Claude as second provider when multi-model routing is needed.

---

## Dashboards

**Status:** 🟡 Partial

### Existing Dashboards

| Dashboard | Route | File | Status |
|-----------|-------|------|--------|
| Admin Overview | `/admin` | `AdminDashboard.tsx` | ✅ — content counts, pending review/corrections |
| Monitoring | `/admin/monitoring` | `MonitoringDashboard.tsx` | ✅ — collector health, alerts, coverage gaps |
| Pipeline | `/admin/pipeline` | `PipelineDashboard.tsx` | ✅ — source overview, ingestion, AI metrics |
| Review Metrics | `/admin/review-metrics` | `ReviewMetricsDashboard.tsx` | ✅ — queue depth, age, throughput, SLA, bottlenecks |
| Data Quality | `/admin/data-quality` | `DataQualityDashboard.tsx` | ✅ — confidence, contradictions, duplicates, coverage |
| Editorial Analytics | `/admin/editorial-analytics` | `EditorialAnalyticsPage.tsx` | ✅ — KPIs, source diversity, stale content, disputes |

### Dashboard Components (20+)
- `src/components/admin/` — StatTile, TimeRangeSelector, ChartContainer, AutoRefreshProvider, CollectorStatusGrid, SystemHealthPanel, AlertHistoryPanel, IngestionChart, AIPipelineMetrics, ErrorRateChart, SourceOverviewPanel, CollectorStatusTable, ReviewQueueDepth, ReviewAgeChart, ReviewThroughputChart, SLAComplianceChart, ReviewerPerformanceTable, BottleneckPanel, ConfidenceDistribution, ContradictionRatePanel, DuplicateRatePanel, SourceCoverageMap, DataFreshnessPanel, DataQualityTrend

### Admin Components (Unwired)
- `MediaLibrary.tsx` — exists but not wired to `/admin/media` route (uses PlaceholderPage instead)
- `VersionHistory.tsx` — exists but not wired to ContentEditor
- `PublishWorkflow.tsx` — exists but not wired anywhere

### Source Management UI
- **No dedicated feed management UI.** Feed configuration is hardcoded in `feedConfig.ts`
- Sources are managed via generic CMS at `/admin/sources` (ContentList + ContentEditor)
- No UI for: viewing collector status per source, editing feed URLs, enabling/disabling feeds, manual refresh triggers

### Missing:
- ❌ **Intelligence Dashboard** — unified view combining collector status + AI pipeline + data quality + coverage gaps. Referenced in `lib/admin/types.ts` comments ("M4.4 intelligence dashboards") but no page exists
- ❌ **Feed Management UI** — add/edit/delete RSS feeds from admin panel
- ❌ **Source → Collector wiring UI** — no admin interface to connect a source record to its collector
- ❌ Media Library integration
- ❌ Version History integration

**Recommended:** Build the Intelligence Dashboard (unified collector + AI + quality view). Add feed management UI. Wire existing unwired components (MediaLibrary, VersionHistory). Keep existing 6 dashboards unchanged.

---

## Database

**Status:** ✅ Complete

### Collector-Related Tables
| Table | Migration | Purpose |
|-------|-----------|---------|
| `sources` | 00001 | Source registry — name, type, url, credibility_tier |
| `collector_runs` | 00001 | Collector run log — source_id, collector_type, status, items counts, stage_durations, errors |
| `ai_operations` | 00001 | AI operation log — operation_type, model_used, confidence, tokens, latency, warnings |

### Supporting Tables
| Table | Migration | Purpose |
|-------|-----------|---------|
| `evidence_items` | 00001 | Normalized content destination |
| `review_queue_items` | 00001 | AI output → human review queue |
| `graph_nodes` / `graph_edges` | 00001 | Knowledge graph |
| `content_versions` | 00001 | Content versioning |
| `audit_log` | 00006 | Audit trail (includes collector_runs) |
| `archived_content` | 00007 | Retention/archival |

### RLS
- `collector_runs`: admin/researcher select; admin-only insert/update/delete
- `ai_operations`: admin/researcher select; admin-only insert/update/delete

### Missing:
- ❌ `feeds` table — feed configuration is hardcoded, not in DB
- ❌ `collector_errors` table — errors are in `collector_runs.errors[]` JSON array, no dedicated error log table
- ❌ `processing_queue` table — no job queue table

**Recommended:** Keep existing tables. Add `feeds` table when implementing feed management UI. Collector errors in JSON array is sufficient for now.

---

## Monitoring

**Status:** ✅ Complete

### Components
- `HealthMonitor.ts` — per-collector health state with coverage gap detection
- `AlertSystem.ts` — rule evaluation, cooldown, lifecycle management
- `MetricsCollector.ts` — 1h/24h/7d windowed metrics
- `MonitoringContext.tsx` — React context provider
- Dashboard UI: `MonitoringDashboard.tsx`, `SystemHealthPanel.tsx`, `AlertHistoryPanel.tsx`, `CollectorStatusTable.tsx`

### Alert Rules (default)
- Consecutive failures: warning ≥3, critical ≥5
- Stale data (24h without update)
- High error rate (>50%)
- Rate-limit spike detection

### AI Logging
- `src/lib/ai/Logger.ts` — always-on audit log for every AI call

### Audit Logging
- `src/lib/audit/logger.ts` — query helpers for `audit_log` table
- DB-level audit triggers on all 18 tables (00006_audit.sql)

### Missing:
- ❌ External health endpoint (no `/health` route — SPA-only app)
- ❌ Structured logging (no winston/pino/sentry)
- ❌ `ERROR_TRACKING_DSN` env var exists but has no code consumer
- ❌ Alert notifications (email, Slack webhook) — alerting is UI-only

**Recommended:** Keep existing monitoring. Add structured logging when adding server-side components. Wire `ERROR_TRACKING_DSN` to Sentry-compatible SDK.

---

## Configuration

**Status:** ✅ Complete

### Environment Variables
- `.env.example` — 30 documented env vars (Supabase, auth, rate limiting, monitoring, deployment, feature flags)
- `VITE_API_URL` — API base path (default `/api/v1`)
- `DEEPSEEK_API_KEY` — set via Supabase secrets for edge functions (not in .env)
- Rate limiting config: 100/30/10 RPM tiers, 5 failed auth → 900s lockout

### Feature Flags
- `VITE_ENABLE_PUBLIC_REGISTRATION=false`
- `VITE_ENABLE_ANALYTICS=false`
- `VITE_ENABLE_INDEXING=false`

### Collector Configuration
- Feed config: `src/lib/collectors/feeds/feedConfig.ts` (hardcoded)
- Retry/rate-limit defaults: `src/lib/collectors/types.ts`
- Monitoring config: `src/lib/collectors/monitoring/types.ts`

### Missing:
- ❌ No collector-specific env vars (collector API keys not in .env.example)
- ❌ Feed polling intervals are hardcoded

**Recommended:** Keep existing config. Move feed configuration to DB when implementing feed management UI.

---

## Summary

| Subsystem | Status |
|-----------|--------|
| Source Registry | ✅ Complete |
| Source Metadata & Trust | ✅ Complete |
| RSS Parser | 🟡 Partial (regex-based, no library) |
| RSS Feed Config | ✅ Complete (12+ feeds, hardcoded) |
| RSS Proxy | 🟡 Partial (orphaned edge function) |
| API Collectors (10 total) | ✅ Complete |
| Collector Framework | ✅ Complete |
| Collector Scheduler | 🟡 Partial (in-process, stub) |
| Collector Storage | 🟡 Partial (in-memory only) |
| Rate Limiting | ✅ Complete (collector + AI) |
| Retry Logic | ✅ Complete |
| Error Handling | ✅ Complete |
| AI Pipeline (14 stages) | ✅ Complete |
| Knowledge Graph | ✅ Complete |
| Monitoring (collector health) | ✅ Complete |
| Admin Dashboards (6) | ✅ Complete |
| Intelligence Dashboard | ❌ Missing |
| Feed Management UI | ❌ Missing |
| Media Library UI | 🟡 Partial (component exists, unwired) |
| Database Schema | ✅ Complete |
| Collector DB Persistence | 🟡 Partial (table exists, no write path) |
| Persistent Scheduling | ❌ Missing |
| Embeddings / Vector Search | ❌ Missing |
| Health Endpoint | ❌ Missing |
| Structured Logging | ❌ Missing |
| External Alert Notifications | ❌ Missing |

**Overall:** The collector framework, AI pipeline, and dashboard infrastructure are substantially complete — 10 collectors, 14 AI stages, 6 dashboards, comprehensive tests. The primary gaps are in **persistence** (in-memory storage, no persistent scheduling), **wiring** (several components built but not connected), and **operational readiness** (no health endpoint, no structured logging, no alert notifications).
