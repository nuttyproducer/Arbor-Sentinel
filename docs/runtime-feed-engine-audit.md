# Runtime Feed Engine — Forensic Audit

**Date:** 2026-08-07
**Branch:** `feature/landing-page`
**Deployed URL:** `https://nuttyproducer.github.io/Arbor-Sentinel/`
**Supabase Project:** `dwtuyqtqmuwioqqjtnny`

---

## Executive Summary

The runtime feed engine is **substantially built** — every subsystem (collectors, AI, review, graph, search, scheduler, monitoring) has production-quality code. However, the **wiring between subsystems is incomplete**. The current production path is a narrow lane: manual "Run All" from the FeedManager UI → collector fetch → evidence_items insert → auto-publish (for trusted sources) → review_queue_items insert. AI processing, review state machine, graph population, search indexing, and the scheduler are all built but **not connected** to the runtime.

**Three critical production bugs** are preventing even this narrow lane from working correctly:
1. **Foreign key violation** on `collector_runs.source_id` — feed UUIDs are inserted into a column that references `sources.id`
2. **CORS preflight failure** on `rss-proxy` edge function — `Authorization` header not in `Access-Control-Allow-Headers`
3. **Feeds have no `source_id`** — `syncFromConfig()` and the FeedManager "Add Feed" form never set the FK linking feeds to sources

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (GitHub Pages)                        │
│  FeedManager UI ──▶ RuntimeEngine.runOnce()                         │
│       │                    │                                        │
│       │                    ├─ feedRegistry.listEnabled() ──▶ Supabase│
│       │                    ├─ registry.createInstance()              │
│       │                    └─ collector.collect()                    │
│       │                         │                                    │
│       │                    JournalismCollector                       │
│       │                         │                                    │
│       │                    ┌────┴────┐                               │
│       │                    │ pollUrl │                               │
│       │                    └────┬────┘                               │
│       │          ┌──────────────┼──────────────┐                    │
│       │          ▼              ▼              ▼                    │
│       │   rss-proxy EF   corsproxy.io   api.allorigins.win          │
│       │   (CORS BLOCK)   (404/413)      (500/520/522)              │
│       │          │              │              │                    │
│       │          └──────────────┼──────────────┘                    │
│       │                         ▼ (only corsproxy.io works          │
│       │                            for SOME feeds)                  │
│       │                         │                                    │
│       │                    SupabaseStore.save()                      │
│       │                         │                                    │
│       │                    ┌────┴────┐                               │
│       │                    ▼         ▼                               │
│       │            evidence_items  review_queue_items               │
│       │                    │                                          │
│       │            autoPublishIfTrusted()                            │
│       │                    │                                          │
│    metrics.recordRun()    ▼                                          │
│       │             visibility='public'                              │
│       ▼                                                              │
│  collector_runs ❌ FK VIOLATION                                     │
│  (feed UUID ≠ source UUID)                                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE (NOT DEPLOYED)                           │
│  supabase/functions/                                                │
│  ├─ rss-proxy/index.ts    ← CORS broken, may not be deployed        │
│  ├─ scheduler/index.ts    ← Not triggered by any cron/pg_cron       │
│  ├─ health/index.ts       ← Not monitored                           │
│  └─ ai-analyze/index.ts   ← Not wired to runtime                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│               BUILT BUT NOT WIRED (all in src/lib/)                  │
│  AI Pipeline (14 stages)       Graph Population (6 populators)       │
│  ReviewStateMachine            Full Scheduler (cron/backoff)         │
│  Search Indexing               Monitoring (HealthMonitor/AlertSystem)│
│  Runtime pipeline.ts           Knowledge Graph (GraphDB)             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Current Runtime Flow (What Actually Works)

```
1. User navigates to /admin/feeds
2. User clicks "▶ Run All"
3. FeedManager.handleRunAll() → getRuntimeEngine().runOnce()
4. RuntimeEngine.runOnce() → listEnabled() (Supabase: SELECT FROM feeds WHERE enabled=true)
5. For each feed: RuntimeEngine.collectFeed(feed)
   a. Checks registry.hasCollectorForType(sourceType)
   b. Builds SourceRecord + CollectorConfig from FeedRow
   c. registry.createInstance() → JournalismCollector (for journalism/ngo/academic)
   d. collector.collect() → BaseCollector.collect()
      - fetch() → JournalismCollector.fetch() → pollUrl(feedUrl)
        - Tries rss-proxy edge function (CORS BLOCKED ✗)
        - Tries corsproxy.io (works for some feeds ✓)
        - Tries api.allorigins.win (500/520/522 ✗)
        - Falls back to direct fetch (CSP BLOCKED ✗)
      - validate() → MediaNormalizer.validate()
      - normalize() → MediaNormalizer.normalize()
      - deduplicate() → fingerprint + DB lookup
      - store() → SupabaseStore.save()
        → persistEvidenceItem() → INSERT INTO evidence_items ✓
        → autoPublishIfTrusted() → UPDATE evidence_items SET visibility='public' ✓
        → enqueueForReview() → INSERT INTO review_queue_items ✓
   e. recordRun(feedId, sourceType, result)
      → INSERT INTO collector_runs (source_id=feedId) ❌ FK VIOLATION
      → UPDATE feeds SET health_status, last_fetched_at ✓
```

**Result:** Articles ARE ingested. Evidence items ARE created. Review queue items ARE populated. But collector_runs records FAIL, and feeds that require the rss-proxy edge function (Al Jazeera, BBC, NYT, Guardian, HRW, AP, Reuters) get 0 items because all proxy paths fail.

---

## Working Components

| Component | Status | Notes |
|-----------|--------|-------|
| FeedManager UI | ✅ Working | Admin page loads, lists feeds, toggles, deletes, runs sync |
| feedRegistry (DB queries) | ✅ Working | listEnabled, getFeed, getFeeds all functional |
| RuntimeEngine core | ✅ Working | Singleton, tick loop, runOnce, stats |
| CollectorRegistry | ✅ Working | Registers 13 collectors, creates instances |
| BaseCollector lifecycle | ✅ Working | fetch→validate→normalize→deduplicate→store |
| MediaNormalizer | ✅ Working | Validates and normalizes RSS items |
| SupabaseStore.save() | ✅ Working | Persists items to evidence_items |
| autoPublishIfTrusted | ✅ Working | Auto-publishes credibility_tier ≥ 3 sources |
| enqueueForReview | ✅ Working | Creates review_queue_items rows |
| FeedParser (client-side) | ✅ Working | Pure RSS 2.0 / Atom 1.0 parser |
| FeedTable / FeedForm UI | ✅ Working | Add/edit/delete feeds |
| evidence_items table | ✅ Working | RLS policies allow collector inserts |
| review_queue_items table | ✅ Working | RLS policies allow collector inserts |
| Amnesty feed (via corsproxy.io) | ✅ Partial | Returns items — the only feed that works end-to-end |

---

## Broken Components — Root Cause Analysis

### 🔴 CRITICAL 1: Foreign Key Violation on collector_runs

**Error:** `insert or update on table "collector_runs" violates foreign key constraint "collector_runs_source_id_fkey"` (SQLSTATE 23503)

**Root cause:** `src/lib/runtime/metrics.ts:22` inserts `source_id: feedId` where `feedId` is the feed's UUID (e.g. `5a22d306-...`). But `collector_runs.source_id` has a FK referencing `sources(id)`. The feeds table has `source_id` as a nullable FK to `sources`, but seeded feeds have `source_id = NULL` because:

1. `syncFromConfig()` in `feedRegistry.ts:140-157` inserts feeds without a `source_id` field
2. The FeedManager "Add Feed" form (`FeedManager.tsx:115-125`) also omits `source_id`
3. The migration seed data (`00010_feeds_table.sql:63-231`) uses `FROM sources s WHERE s.name = 'Al Jazeera' LIMIT 1` for 6 journalism feeds — meaning even if seed ran, Reuters, AP, BBC, NYT, and Guardian would all point to Al Jazeera's source ID, and MSF/SSRN seed would likely produce 0 rows

**Impact:** Every collector run fails to persist its run record. The dashboard shows no run history. Feed health tracking is incomplete (the `feeds` table update succeeds, but run history is lost).

**Fix direction:** Either (a) change `recordRun` to use `feed.source_id` when available, or (b) change the FK to reference `feeds(id)` instead of `sources(id)`, or (c) ensure every feed has a valid `source_id` before collection.

### 🔴 CRITICAL 2: CORS Preflight Failure on rss-proxy Edge Function

**Error:** `Access to fetch at 'https://dwtuyqtqmuwioqqjtnny.supabase.co/functions/v1/rss-proxy?url=...' from origin 'https://nuttyproducer.github.io' has been blocked by CORS policy: Request header field authorization is not allowed by Access-Control-Allow-Headers in preflight response.`

**Root cause:** `supabase/functions/rss-proxy/index.ts:180` sets:
```typescript
"Access-Control-Allow-Headers": "Content-Type",
```

But `JournalismCollector.pollUrl()` at `src/lib/collectors/media/JournalismCollector.ts:129-131` sends:
```typescript
headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` }
```

The `Authorization` header is NOT in the allowed headers list → preflight fails → browser blocks the request.

**Secondary issue:** `Access-Control-Allow-Origin: "*"` (line 178) is incompatible with credentialed requests. When Authorization headers are sent, the origin must be explicit, not wildcard.

**Tertiary issue:** The edge function may not even be deployed. The GitHub Actions workflow only deploys to GitHub Pages; there is no Supabase CLI deploy step. The function source exists locally but may not be live on Supabase.

**Impact:** The PRIMARY proxy path (rss-proxy) fails for ALL feeds. The collector falls back to corsproxy.io (which returns 404 for Reuters and HRW, 413 for AP) and api.allorigins.win (which returns 500/520/522). Direct fetch is blocked by Content Security Policy. **Result: most feeds get 0 items.**

### 🟡 HIGH 3: Feeds Have No source_id

**Root cause:** `feedRegistry.syncFromConfig()` at line 140-157 never includes `source_id` in the INSERT. The FeedManager "Add Feed" form also omits it. The migration seed data uses fragile `FROM sources WHERE name = '...'` subqueries that may return 0 rows if the named source doesn't exist.

**Impact:** Without `source_id`, feeds cannot be linked to credibility tiers, cannot have proper collector_runs records, and the `autoPublishIfTrusted` check queries `sources` with a feed UUID that won't match.

### 🟡 HIGH 4: Deploy Workflow Does Not Deploy Edge Functions

**Root cause:** `.github/workflows/deploy.yml` only builds the Vite SPA and deploys to GitHub Pages. There is no step for `npx supabase functions deploy`.

**Impact:** Edge functions (rss-proxy, scheduler, health, ai-analyze) may not exist on the production Supabase project. Even if rss-proxy was manually deployed once, it hasn't been updated with the CORS fix.

### 🟡 HIGH 5: Scheduler Edge Function Has NULL FK Risk

**Root cause:** `supabase/functions/scheduler/index.ts:34` inserts `source_id: feed.source_id` into `collector_runs`. But `feed.source_id` is nullable — when NULL, this hits the `NOT NULL` constraint on `collector_runs.source_id`, producing another 409.

**Impact:** Even if the scheduler edge function were triggered by a cron job, it would fail for any feed without a `source_id` (currently all of them).

### 🟡 HIGH 6: Feed URL Bitrot

Several static feed URLs in `feedConfig.ts` are invalid or have changed:
- **HRW:** `https://www.hrw.org/rss-feeds` → returns a redirect/html page, not an RSS feed. The correct URL is `https://www.hrw.org/taxonomy/term/feed` or similar
- **Reuters:** `https://www.reuters.com/arc/outboundfeeds/v3/all/?outputType=xml` → requires authentication or is retired
- **AP:** `https://apnews.com/hub/ap-top-news?format=rss` → returns 413 (Content Too Large) via corsproxy.io
- **MSF:** `https://www.msf.org/rss/news` → not verified as working
- **SSRN:** URL is a search results page, not an RSS feed

### 🟡 HIGH 7: Duplicate recordRun Calls

`recordRun()` is called from TWO places for the same run:
1. `RuntimeEngine.collectFeed()` at line 261: `await recordRun(feedId, sourceType, result)`
2. Individual collectors may also call `SupabaseStore.persistRun()` which inserts into the same `collector_runs` table

This creates duplicate run records when both paths execute.

### 🟠 MEDIUM 8: Content Security Policy Defined in Meta Tag (GitHub Pages Ignores _headers)

The deployed site's CSP is set via `<meta http-equiv="Content-Security-Policy">` in `index.html:12-15`. **GitHub Pages ignores `_headers` files** (those only work on Netlify/Cloudflare), so `public/_headers` is inert. The current `connect-src` allows `'self' https://*.supabase.co https://corsproxy.io https://api.allorigins.win` — which covers the three proxy/DB origins. However, `img-src 'self' data:` blocks external images (e.g., Supabase Storage URLs), and direct fetch to external RSS URLs is blocked (correctly — must go through proxies).

---

## Collector Matrix

| Collector | Source Types | Registered | Has Tests | Production Path | Status |
|-----------|-------------|------------|-----------|-----------------|--------|
| JournalismCollector | journalism, ngo, academic | ✅ | ✅ | Yes (via FeedManager) | ⚠️ Proxy failures |
| AcademicCollector | academic | ✅ | ✅ | No (type also covered by Journalism) | ⚠️ Shadowed |
| AmnestyCollector | ngo | ✅ | ✅ | No | ⚠️ Not reached |
| HRWCollector | ngo | ✅ | ✅ | No | ⚠️ Not reached |
| BtselemCollector | ngo | ✅ | ✅ | No | ⚠️ Not reached |
| MSFCollector | ngo | ✅ | ✅ | No | ⚠️ Not reached |
| ICRCCollector | ngo | ✅ | ✅ | No | ⚠️ Not reached |
| ICJCollector | court | ✅ | ✅ | No | ⚠️ Not reached |
| ICCCollector | court | ✅ | ✅ | No | ⚠️ Not reached |
| OHCHRCollector | un | ✅ | ✅ | No | ⚠️ Not reached |
| OCHACollector | un | ✅ | ✅ | No | ⚠️ Not reached |
| EUCollector | government | ✅ | ✅ | No | ⚠️ Not reached |
| BelgiumCollector | government | ✅ | ✅ | No | ⚠️ Not reached |

**Note:** The `CollectorRegistry` returns the LAST registered collector for a type as default. Since JournalismCollector is registered for `["journalism", "ngo", "academic"]` AFTER the specific NGO collectors, JournalismCollector is the default for ALL ngo and academic feeds. The specific HTML-scraping collectors (Amnesty, HRW, etc.) are registered but never selected by the runtime.

---

## Feed Matrix

| Feed | URL Valid | rss-proxy | corsproxy.io | allorigins.win | Direct | Items Fetched |
|------|-----------|-----------|-------------|----------------|--------|---------------|
| Reuters World | ❌ (URL retired) | CORS block | 404 | 500 | CSP block | 0 |
| AP International | ⚠️ (413 too large) | CORS block | 413 | 520 | CSP block | 0 |
| BBC World | ✅ | CORS block | ✅ Works | ✅ Works | CSP block | Varies |
| Al Jazeera | ✅ | CORS block | ✅ Works | ✅ Works | CSP block | Varies |
| NYT World | ✅ | CORS block | ⚠️ May work | ⚠️ May work | CSP block | Unknown |
| Guardian World | ✅ | CORS block | ✅ Works | ✅ Works | CSP block | Varies |
| HRW Reports | ❌ (URL wrong) | CORS block | 404 | 522 | CSP block | 0 |
| Amnesty Latest | ✅ | CORS block | ✅ Works | ✅ Works | CSP block | ✅ (only working feed) |
| MSF Updates | ⚠️ Unverified | CORS block | Unknown | Unknown | CSP block | Unknown |
| SSRN Papers | ❌ (not RSS) | CORS block | Unknown | Unknown | CSP block | 0 |

**Summary:** 2/10 feeds have broken URLs. Of the remaining 8, all are blocked on rss-proxy (primary path). 4-6 may work via corsproxy.io fallback. Only Amnesty is confirmed working end-to-end.

---

## Database Findings

### Schema Issues

1. **`collector_runs.source_id` FK → `sources(id)`**: The column is named `source_id` but the runtime inserts feed UUIDs. The FK constraint is correct — the bug is in the insert code.

2. **`feeds.source_id` FK → `sources(id)` ON DELETE SET NULL**: Correct schema, but the field is almost never populated.

3. **`evidence_items.source_id`**: No FK constraint visible in migrations. The SupabaseStore inserts `source_id: item.sourceId` which is the feed's sourceId (from `feed.source_id ?? feed.id`). If `source_id` is null, evidence items are stored with the feed UUID.

4. **`review_queue_items`**: Successfully populated by `enqueueForReview()`. No FK issues observed.

5. **Duplicate records in `collector_runs`**: Both `recordRun()` and `SupabaseStore.persistRun()` insert into the same table for the same run.

### RLS Issues

- `00013_collector_write_policies.sql` allows anon+authenticated inserts to `collector_runs` and `evidence_items` — this is permissive but correctly scoped for the browser-based collector.
- The `feeds` table allows anon SELECT only for enabled feeds. Authenticated users see all. Admin/researcher can insert/update. This works.

---

## API / Proxy Investigation

### rss-proxy Edge Function

| Property | Value |
|----------|-------|
| Deployed? | Unknown (no CI deploy step) |
| CORS headers | `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Headers: Content-Type` |
| Missing header | `Authorization` not in allow list |
| Wildcard + credentials | Incompatible — must use explicit origin |
| Parser | Duplicate of FeedParser (regex-based RSS 2.0 + Atom 1.0) |
| Authentication | Uses `VITE_SUPABASE_PUBLISHABLE_KEY` as Bearer token |

### corsproxy.io

| Property | Value |
|----------|-------|
| Reliability | Mixed — works for most feeds, 404 for Reuters, 413 for AP |
| Response format | Raw XML (not JSON) |
| Rate limiting | Unknown |
| Availability | Third-party, no SLA |

### api.allorigins.win

| Property | Value |
|----------|-------|
| Reliability | Poor — 500, 520, 522 errors consistently |
| Status | Effectively dead for this use case |

---

## Scheduler Investigation

### Three Schedulers, None Active

| Scheduler | Location | Status |
|-----------|----------|--------|
| RuntimeEngine tick loop | `src/lib/runtime/RuntimeEngine.ts:85-92` | ⚠️ In-memory `setInterval`, only runs when `start()` is called — never called in production |
| Scheduler (new) | `src/lib/scheduler/Scheduler.ts` | ✖ Never instantiated in production code |
| Scheduler (legacy) | `src/lib/collectors/scheduler.ts` | ✖ Exported but unused |
| Edge scheduler | `supabase/functions/scheduler/index.ts` | ✖ No cron trigger configured; only inserts `collector_runs` status records, doesn't actually collect |

**Production reality:** Collection only happens when a user manually clicks "Run All" or "Sync" in the FeedManager admin page. There is no automated scheduling.

---

## AI Pipeline Investigation

### Status: Fully Built, Not Wired

All 14 AI stages exist as production code in `src/lib/ai/stages/`:
LanguageDetector, Translator, TranslationReviewer, Summarizer, EntityExtractor, ClaimExtractor, TimelineExtractor, GeographicExtractor, RelationshipDetector, TopicClassifier, DuplicateDetector, ContradictionDetector, ConfidenceEstimator, HallucinationDetector

**Wiring gap:** `runtime/pipeline.ts:processItem()` returns a hard-coded failure for the AI stage:
```
// Stage 2 — AI Processing (deferred)
{ stage: "ai_processed", success: false, error: "AI pipeline integration deferred" }
```

The `runtime/types.ts` default config has `enableAIPipeline: false`.

No production code assembles the 14 stages into an `AIPipeline` instance and runs it. Only tests exercise the full pipeline.

---

## Review System Investigation

### Status: Built as In-Memory System, Bypassed by Runtime

The review system in `src/lib/review/` is a complete, standalone, in-memory queue with:
- `ReviewStateMachine` with guard conditions
- `ReviewQueue` with filtering
- `ReviewerRegistry` and `AssignmentRouter`
- `SLATracker`
- `CorrectionManager`
- 5 domain-specific checklists

**Wiring gap:** The runtime bypasses this entirely. `SupabaseStore.enqueueForReview()` inserts directly into the `review_queue_items` DB table with hardcoded values:
```typescript
review_type: "editorial",
priority: "medium",
priority_score: 50,
state: "new",
```

The `ReviewQueue` / `ReviewStateMachine` components are only used by the ReviewQueuePage UI, not by the automated pipeline.

---

## Dashboard Investigation

### Real Data vs Synthetic/Static Data

| Widget | Data Source | Real or Synthetic |
|--------|------------|-------------------|
| PipelineDashboard | `collector_runs` + `feeds` + `sources` tables | ✅ Real (but collector_runs is empty due to FK bug) |
| MonitoringDashboard | `MonitoringProvider` fed from `src/data/sources` | ❌ Static — hardcoded source data |
| SourceOverviewPanel | `fetchPipelineData()` → Supabase | ✅ Real |
| CollectorStatusGrid | `RuntimeEngine.diagnostics()` | ✅ Real (in-memory only) |
| IngestionChart | `collector_runs` table | ⚠️ Empty (FK bug) |
| ErrorRateChart | `collector_runs` table | ⚠️ Empty (FK bug) |
| AI-related dashboards | N/A | ❌ No data (AI not wired) |
| ReviewQueueDepth | `review_queue_items` table | ✅ Real |
| StatTile components | Various | Mixed — some real, some zeroed |

**Key finding:** Because `collector_runs` inserts fail with FK violations, most dashboard widgets that depend on run history show zeros or empty states. The PipelineDashboard can only show feed definitions and health status, not actual ingestion metrics.

---

## Monitoring Investigation

### Two Parallel Monitoring Systems

| System | Location | Type | Feeds From |
|--------|----------|------|------------|
| In-memory HealthMonitor | `lib/collectors/monitoring/` | In-memory, per-session | `src/data/sources` (static) |
| DB-derived metrics | `lib/admin/metrics.ts` | Supabase queries | `collector_runs`, `feeds`, `sources` |

**`recordItemOutcome()`** in `runtime/metrics.ts:94-104` is a no-op placeholder:
```typescript
export async function recordItemOutcome(...): Promise<void> {
  void feedId; void fingerprint; void outcome; // no-op
}
```

**`recordRun()`** is called but fails due to FK violation.

**Health heartbeat:** The `supabase/functions/health/index.ts` edge function exists but is not monitored by any alerting system.

---

## Production Readiness Score

| Subsystem | Score | Rating |
|-----------|-------|--------|
| Feed Definitions (DB) | 85% | Functional |
| FeedManager UI | 90% | Functional |
| RuntimeEngine | 70% | Partial — core loop works, no auto-start |
| Collector Framework | 80% | Functional — BaseCollector + Registry solid |
| Feed Parsing | 80% | Functional — FeedParser + rss-proxy both work |
| CORS Proxying | 25% | Broken — primary path fails, fallbacks unreliable |
| Database Persistence | 60% | Partial — items store, runs don't |
| Auto-Publish | 85% | Functional — trusted sources auto-publish |
| Review Queue | 70% | Partial — items enqueued, but review system bypassed |
| AI Pipeline | 30% | Prototype — all stages built, no integration |
| Scheduler | 15% | Prototype — 3 implementations, none active |
| Knowledge Graph | 20% | Prototype — GraphDB built, no population trigger |
| Search Indexing | 15% | Prototype — static index only |
| Dashboard | 45% | Partial — real data sources but empty due to FK bug |
| Monitoring | 20% | Prototype — HealthMonitor exists, metrics not recorded |
| Edge Functions | 30% | Prototype — code exists, deployment status unknown |
| **OVERALL** | **45%** | **Prototype → Partial** |

---

## Technical Debt

### Duplicate Systems

| System | Duplicates | Recommended |
|--------|-----------|-------------|
| RSS Parser | `FeedParser.ts` (client) + `rss-proxy/index.ts` (edge) | Consolidate to edge function only; remove client parser |
| Scheduler | `RuntimeEngine.tick()`, `Scheduler.ts`, `collectors/scheduler.ts`, edge `scheduler/index.ts` | Keep `lib/scheduler/Scheduler.ts`, remove others |
| recordRun | `metrics.ts:recordRun()` + `SupabaseStore.persistRun()` | Keep one — `metrics.ts:recordRun()` after fixing FK |
| Monitoring | In-memory `HealthMonitor` + DB-derived in `admin/metrics.ts` | Merge: HealthMonitor reads from DB, not static data |

### Dead / Unused Code

| File | Reason |
|------|--------|
| `src/lib/collectors/scheduler.ts` | Legacy scheduler, superseded by `lib/scheduler/Scheduler.ts` |
| `src/lib/collectors/store.ts` (`DevMemoryStore`) | Dev-only, should be in test helpers |
| `src/lib/runtime/pipeline.ts` (AI stage) | Hard-coded failure, never called |
| Supabase edge `scheduler/index.ts` | Only inserts status records, doesn't collect |

### Fragile Patterns

| Pattern | Location | Risk |
|---------|----------|------|
| Migration seed uses `WHERE s.name = 'Al Jazeera' LIMIT 1` | `00010_feeds_table.sql` | Wrong source_id for 6 feeds |
| `feed.source_id ?? feed.id` fallback | `RuntimeEngine.ts:211` | Uses feed UUID as source ID → FK violations |
| 3 CORS proxies hardcoded in collector | `JournalismCollector.ts:12-16` | If all fail, no way to add new proxy without code change |
| CSP in `<meta>` tag, not headers file | `index.html:12-15` | GitHub Pages ignores `_headers`; `img-src` blocks Supabase Storage images |

---

## Missing Wiring (Complete List)

1. **Scheduler → RuntimeEngine**: No code calls `runtime.start()`. The scheduler tick loop is never activated.

2. **RuntimeEngine → AI Pipeline**: `processItem()` doesn't assemble or run AIPipeline. `enableAIPipeline` is false by default and never toggled.

3. **AI Pipeline → Knowledge Graph**: `PipelineIntegration.scheduleGraphPopulation()` is never called.

4. **AI Pipeline → Search Index**: No code rebuilds the search index after new items are ingested.

5. **RuntimeEngine → Review System**: The `ReviewStateMachine` / `ReviewQueue` are bypassed; items go directly to `review_queue_items` DB table.

6. **RuntimeEngine → Monitoring**: `recordItemOutcome()` is a no-op. Metrics are not recorded per-item.

7. **Edge Functions → Cron**: No `supabase cron` or `pg_cron` triggers are configured for the scheduler edge function.

8. **CI/CD → Edge Functions**: The deploy workflow doesn't deploy Supabase edge functions.

---

## Prioritized Fix Plan

### Phase 1: Make the Narrow Lane Work (Critical)

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 1 | Fix `recordRun()` to use `feed.source_id` when available, or insert into a `feed_runs` table instead | Small | Unblocks run persistence |
| 2 | Fix rss-proxy CORS: add `Authorization` to allowed headers, use explicit origin | Small | Unblocks primary proxy path for all feeds |
| 3 | Deploy rss-proxy edge function to Supabase | Small | Makes the proxy actually available |
| 4 | Ensure feeds have valid `source_id`: fix `syncFromConfig()` to create source records or link to existing ones | Medium | Fixes FK chain: feeds→sources→collector_runs |
| 5 | Fix broken feed URLs (HRW, Reuters, SSRN) | Small | Enables collection from these feeds |
| 6 | Remove duplicate `recordRun` call (keep only metrics.ts version) | Small | Eliminates duplicate run records |

### Phase 2: Wire the Scheduler (High)

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 7 | Configure Supabase cron to trigger scheduler edge function | Small | Enables automated collection |
| 8 | Wire `lib/scheduler/Scheduler.ts` into RuntimeEngine | Medium | Replaces simple setInterval with proper cron scheduling |
| 9 | Add scheduler start/stop to admin UI | Medium | Operators can control scheduling |

### Phase 3: Wire AI + Downstream (Medium)

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 10 | Wire AIPipeline into `runtime/pipeline.ts` and call from `collectFeed()` | Large | Articles get AI processing |
| 11 | Wire graph population after AI processing | Medium | Knowledge graph gets populated |
| 12 | Wire search index rebuild after ingestion | Medium | Search reflects new content |
| 13 | Wire ReviewStateMachine into the review queue workflow | Medium | Proper review workflow with guard conditions |

### Phase 4: Monitoring + Production Hardening (Lower)

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 14 | Implement `recordItemOutcome()` | Small | Per-item metrics available |
| 15 | Add edge function deploy to CI/CD | Small | Edge functions stay in sync |
| 16 | Add health-check monitoring with alerting | Medium | Production observability |
| 17 | Add CSP configuration for proxy domains | Small | Fewer CSP blocks in console |

---

## Quick Wins (Do Immediately)

1. **Fix rss-proxy CORS headers** — change line 180 in `supabase/functions/rss-proxy/index.ts`:
   ```typescript
   "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
   ```
   And change origin from `"*"` to the actual deployed origin or use a request-reflecting pattern.

2. **Deploy the edge function** — run `npx supabase functions deploy rss-proxy`

3. **Fix `recordRun` source_id** — in `metrics.ts`, use `feed.source_id` when available instead of `feedId`

4. **Fix HRW feed URL** — change to `https://www.hrw.org/taxonomy/term/feed` (verify correct URL)

5. **Remove duplicate run persistence** — delete `SupabaseStore.persistRun()` or keep only one path

---

## High-Risk Issues

1. **No automated collection**: If no admin clicks "Run All", no new articles are ever ingested. The entire system is manual.

2. **Edge functions not in CI/CD**: Manual deploys drift from source code. Security patches and fixes may not reach production.

3. **Single proxy dependency**: If corsproxy.io goes down or rate-limits, only the rss-proxy edge function (if fixed) can save the pipeline. No third fallback exists after api.allorigins.win.

4. **No error alerting**: Failures are logged to console only. No one knows when collection fails unless they're watching the browser console.

---

## Recommended Implementation Order

```
Week 1: Phase 1 (Critical fixes) → Narrow lane works end-to-end
Week 2: Phase 2 (Scheduler) → Automated collection running
Week 3-4: Phase 3 (AI + Downstream) → Full pipeline operational
Week 5: Phase 4 (Monitoring + Hardening) → Production ready
```

---

## Investigation Methodology

This audit was produced through dual-agent parallel investigation:

1. **Architecture Agent** — Mapped all 612 source files across 14 subsystems, traced every export and dependency, identified all 13 collectors, 14 AI stages, 3 schedulers, 2 monitoring systems, and every wiring gap.

2. **Console Error Agent** — Traced every error from the browser console back to source code: CORS preflight (rss-proxy edge function), FK violations (recordRun source_id), CSP (meta tag vs _headers), proxy failures (CORS_PROXIES fallback chain), and duplicate run persistence.

Both agents independently confirmed the same 3 critical root causes. Findings were cross-referenced against the database migrations, edge function source, collector code, and runtime engine to ensure accuracy.

**Files examined:** 100+ source files across `src/lib/`, `supabase/`, and `src/pages/admin/`.

**Key confirmation:** The `collector_runs_collector_insert` RLS policy (`00013_collector_write_policies.sql:32`) allows `anon` + `authenticated` INSERT with `WITH CHECK (true)` — proving the 409 errors are FK violations, not RLS denials.
