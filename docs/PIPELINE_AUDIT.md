# Pipeline Audit — End-to-End Validation

**Date:** 2026-08-07
**Source:** Runtime Feed Engine Audit + Dual-Agent Forensic Investigation

---

## Executive Summary

The Arbor Sentinel pipeline is **architecturally complete** — every subsystem from collectors through AI, review, graph, search, and public website is built with production-quality code. However, the pipeline is **almost entirely unwired**. The only functional path is a manual "Run All" button in the admin FeedManager that collects RSS articles and stores them as invisible drafts. Every downstream stage — AI processing, automated review, graph population, search indexing, and public display — is disconnected.

**Key finding:** The public website is 100% static. `VITE_DATA_MODE` defaults to `'static'`, so all pages render hand-curated `src/data/*` content. No collected item ever appears publicly.

---

## Stage-by-Stage Trace

### 1. COLLECTOR — ⚠️ PARTIAL

| Aspect | Status |
|--------|--------|
| Code | `BaseCollector.collect()` → fetch → validate → normalize → dedup → filter → store |
| 13 collectors registered | ✅ |
| Manual trigger (FeedManager "Run All") | ✅ Works |
| Scheduled execution | ❌ `autoStart: false`, `start()` never called |
| Edge function scheduler | ❌ Only inserts status records, doesn't collect |
| HTTP client | ✅ `httpFetch()` with UA/gzip/typed errors |
| Rate limiting | ✅ Per-domain sliding window |
| Retry with backoff | ✅ Wired via `executeWithRetry()` |
| User-Agent | ✅ `Arbor-Sentinel/1.0 (<CollectorName>)` |

**Verdict:** Collection works when manually triggered. No automation exists.

---

### 2. NORMALIZER — ✅ WORKS

| Aspect | Status |
|--------|--------|
| MediaNormalizer (journalism/ngo/academic) | ✅ |
| NGONormalizer (Amnesty, HRW, Btselem, MSF, ICRC) | ✅ |
| LegalNormalizer (ICJ, ICC) | ✅ |
| UNNormalizer (OHCHR, OCHA) | ✅ |
| GovernmentNormalizer (EU, Belgium) | ✅ |
| NormalizedContent contract | ✅ All 5 produce valid output |

**Verdict:** Normalization works correctly for all source types.

---

### 3. DEDUP — ✅ WORKS (session-scoped)

| Aspect | Status |
|--------|--------|
| Fingerprint (URL+title+date) | ✅ |
| In-memory session cache | ✅ |
| Cross-session DB lookup | ✅ Fixed (slug hash bug resolved) |
| Cross-feed GUID/URL dedup | ✅ (JournalismCollector override) |
| Near-duplicate detection | ✅ Built (NearDuplicateDetector), not yet wired |

**Verdict:** Dedup works within and across sessions.

---

### 4. FILTER — ✅ WORKS

| Aspect | Status |
|--------|--------|
| RelevanceFilter built | ✅ |
| Source credibility gate | ✅ |
| URL blacklist | ✅ |
| Keyword blacklist | ✅ |
| Language filter | ✅ |
| Wired into BaseCollector.collect() | ✅ Stage 5 |
| Non-fatal on error | ✅ (items pass through) |

**Verdict:** Filtering is wired and functional. Default config accepts all items.

---

### 5. STORE — ⚠️ PARTIAL

| Aspect | Status |
|--------|--------|
| evidence_items INSERT (draft) | ✅ Anon INSERT allowed (RLS 00013) |
| review_queue_items INSERT | ✅ Anon INSERT allowed |
| source_id FK resolution | ⚠️ `feed.source_id ?? feed.id` — unlinked feeds pass feed UUID |
| Auto-publish (credibility_tier ≥ 3) | ❌ RLS blocked for anon — requires admin/moderator |

**Verdict:** Drafts are stored but invisible. Auto-publish silently fails for anonymous collection.

---

### 6. METRICS — ⚠️ PARTIAL

| Aspect | Status |
|--------|--------|
| collector_runs INSERT | ✅ When source_id FK is valid |
| feeds health UPDATE | ❌ RLS blocked for anon (requires admin/researcher) |
| recordItemOutcome | ✅ Implemented (was no-op) |
| Rolling availability (24h/7d/30d) | ✅ Built (availabilityMetrics.ts) |

**Verdict:** Metrics work for linked feeds under authenticated sessions. Anonymous updates to feeds table are blocked.

---

### 7. AI PIPELINE — ❌ BROKEN / 🔌 UNWIRED

| Aspect | Status |
|--------|--------|
| 14 AI stages built | ✅ All in `src/lib/ai/stages/` |
| AIPipeline DAG orchestrator | ✅ Built (`AIPipeline.ts`) |
| AI provider (OpenAI-compatible) | ✅ Built (`provider.ts`) |
| ModelRouter, PromptManager, Logger | ✅ Built |
| Runtime assembly | ❌ `aiPipelineAssembly.ts` is empty stub |
| `enableAIPipeline` default | ❌ `false` (RuntimeConfig) |
| Production caller | ❌ No code calls `new AIPipeline()` |
| ai-analyze edge function | ⚠️ Exists but never called from frontend |
| ai_operations table writes | ❌ Never written |

**Verdict:** AI is fully built but completely unwired. The 14 stages only run in tests.

---

### 8. REVIEW — ❌ BROKEN / 🔌 UNWIRED

| Aspect | Status |
|--------|--------|
| ReviewStateMachine | ✅ Built with guard conditions |
| ReviewQueue (in-memory) | ✅ Built |
| ReviewerRegistry, AssignmentRouter | ✅ Built |
| SLATracker, CorrectionManager | ✅ Built |
| 5 domain checklists | ✅ Built |
| review_queue_items DB table | ✅ Exists, RLS allows inserts |
| Production wiring | ❌ ReviewQueuePage uses mockReviewItems |
| | ❌ No code reads review_queue_items for workflow |
| | ❌ No path from review → published |

**Verdict:** Review system is a complete in-memory library that never runs against live data.

---

### 9. PUBLISH — ⚠️ PARTIAL

| Aspect | Status |
|--------|--------|
| publishRecord() | ✅ Works (UPDATE review_status/visibility) |
| executeTransition() with gates | ✅ Built (`publishing.ts`) |
| Manual admin publish (ContentEditor) | ✅ Works |
| Auto-publish via credibility_tier | ❌ RLS blocked for anon sessions |
| PublishWorkflow component | ❌ Defined but never mounted in production |

**Verdict:** Manual admin publishing works. Automated publishing is blocked by RLS.

---

### 10. SEARCH — ⚠️ STATIC

| Aspect | Status |
|--------|--------|
| Static search index (buildIndex.ts) | ✅ Built from `src/data/*` at module load |
| SearchPage | ✅ Renders static results |
| FTS (full-text search via Supabase RPC) | ✅ Built (`fts.ts`) |
| `VITE_ENABLE_INDEXING` | ❌ `false` — FTS never used |
| Runtime index updates | ❌ Never triggered after collection |

**Verdict:** Search works over static data. No runtime index updates.

---

### 11. GRAPH — 🔌 UNWIRED

| Aspect | Status |
|--------|--------|
| GraphDB (in-memory) | ✅ Full CRUD, BFS/DFS, path finding |
| graph_nodes/edges DB tables | ✅ Schema exists, RLS: public read, admin write |
| 6 populators + RelationshipBuilder | ✅ Built, idempotent |
| PipelineIntegration | ✅ Built, never called in production |
| EntityResolver | ✅ Built, test-only |
| Cytoscape visualization | ✅ Built, renders static graphData.ts |
| GraphExplorerPage | ⚠️ Shows static preview with "coming soon" notice |
| EntityDetailPage | ⚠️ Renders static graph data |
| GraphPersistence | ✅ Built (this phase) — bridges GraphDB ↔ DB |
| GraphAPI queries | ✅ Built (this phase) — subgraph, timeline, map queries |

**Verdict:** Graph infrastructure is complete but unwired. All visualization uses static data.

---

### 12. ENTITY PAGES — ✅ WORKS but STATIC

| Aspect | Status |
|--------|--------|
| EntityDetailPage | ✅ Built, routed at `/explore/entity/:id` |
| OrganizationDetailPage | ✅ Built |
| CountryDetailPage | ✅ Built |
| InstitutionDetailPage | ✅ Built |
| Data source | ⚠️ All use `StaticRepository` (`VITE_DATA_MODE='static'`) |
| Graph data | ❌ Not integrated — uses static graphData.ts |

**Verdict:** Entity pages work but display only hand-curated static content.

---

### 13. TIMELINE — ⚠️ STATIC

| Aspect | Status |
|--------|--------|
| LegalTimeline component | ✅ Built |
| Data source | ⚠️ `src/data/legalTimeline.ts` (hand-authored) |
| AI TimelineExtractor | ✅ Built, never wired |
| Graph timeline events | ❌ Not queried |

**Verdict:** Timeline is static. AI-extracted events never reach it.

---

### 14. MAPS — ⚠️ STATIC

| Aspect | Status |
|--------|--------|
| MapPage (maplibre-gl) | ✅ Built, routed at `/map` |
| 5 map layers | ✅ EventLayer, SourceLayer, OrganizationLayer, LegalLayer, InfrastructureLayer |
| Data source | ⚠️ `src/data/map/*` (hand-authored GeoJSON) |
| Supabase spatial RPCs | ✅ Built (`spatial.ts`), never used by MapPage |
| AI GeographicExtractor | ✅ Built, never wired |
| map_layers DB table | ✅ Seeded, not used by MapPage |

**Verdict:** Maps work with static data. AI-extracted locations never reach them.

---

### 15. DASHBOARD — ⚠️ PARTIAL

| Aspect | Status |
|--------|--------|
| PipelineDashboard | ✅ Reads real `collector_runs`/`feeds`/`sources` |
| MonitoringDashboard | ⚠️ In-memory from static sources.ts |
| AdminDashboard | ✅ Real DB counts (mostly empty) |
| FeedManager | ✅ Real CRUD operations |
| Health metrics (availability) | ✅ Built (this phase) |

**Verdict:** Pipeline dashboard reads real data. Monitoring dashboard is still static.

---

### 16. PUBLIC WEBSITE — ✅ WORKS but ENTIRELY STATIC

| Aspect | Status |
|--------|--------|
| HomePage | ✅ Static content |
| GazaDossierPage | ✅ Static dossier data |
| BelgiumPage, EuropeanUnionPage | ✅ Static country/EU data |
| SearchPage | ✅ Static search index |
| Evidence pages | ✅ Static evidence items |
| `VITE_DATA_MODE` | ❌ Unset → defaults to `'static'` |
| `SupabaseRepository` | ⚠️ Built but only active when `VITE_DATA_MODE='live'` |

**Verdict:** The entire public website is a static beta. No collected content ever surfaces.

---

## Database Write Verification

| Stage | Table | Query | RLS Policy | Succeeds? |
|-------|-------|-------|------------|-----------|
| Store | `evidence_items` | INSERT draft | `evidence_items_collector_insert` (anon OK) | ✅ If source_id FK valid |
| Store | `review_queue_items` | INSERT | `review_queue_items_collector_insert` (anon OK) | ✅ |
| Metrics | `collector_runs` | INSERT | `collector_runs_collector_insert` (anon OK) | ✅ If source_id FK valid |
| Auto-publish | `evidence_items` | UPDATE to public | `evidence_items_admin_moderator_update` (admin only) | ❌ Blocked for anon |
| Feed health | `feeds` | UPDATE | `feeds_admin_update` (admin/researcher) | ❌ Blocked for anon |
| Graph | `graph_nodes/edges` | UPSERT | `graph_nodes_admin_all` (admin) | ❌ Never called |
| AI | `ai_operations` | INSERT | Admin only | ❌ Never called |
| Scheduler | `feeds.metadata` | UPDATE | `feeds_admin_update` | ❌ Blocked for anon |

---

## Where Execution Stops

```
Manual "Run All" click
    ↓
Collector.fetch() ✅ (RSS via proxy)
    ↓
Normalizer ✅
    ↓
Dedup ✅
    ↓
Filter ✅
    ↓
Store → evidence_items INSERT ✅ (draft, invisible)
    ↓
Auto-publish ❌ (RLS blocked for anon)
    ↓
recordRun() → collector_runs INSERT ✅ (if FK valid)
    ↓
processItem() 🔌 (gated: enableAIPipeline=false)
    ↓
AI pipeline 🔌 (stub)
    ↓
Review 🔌 (bypassed, in-memory only)
    ↓
Graph 🔌 (test-only, never persisted)
    ↓
Search 🔌 (static index, not updated)
    ↓
Public website 🔌 (VITE_DATA_MODE=static)
```

**The pipeline effectively stops at Store.** Items are written as invisible drafts. Nothing downstream is triggered.

---

## Prioritized Fix Plan

### Immediate (unblock the narrow lane):
1. Fix RLS for auto-publish — allow collector inserts to auto-publish trusted sources
2. Fix `source_id` resolution — ensure feeds have valid source records
3. Set `VITE_DATA_MODE=live` — or make the public site read from Supabase

### High (wire existing subsystems):
4. Wire `processItem()` — remove the `enableAIPipeline` gate for review_queue stage
5. Wire `ReviewQueue` to read from `review_queue_items` DB table
6. Wire graph population into pipeline (graph persistence built this phase)
7. Deploy and trigger edge functions (rss-proxy, scheduler)

### Medium (AI pipeline):
8. Implement `aiPipelineAssembly.ts` — assemble and run the 14 AI stages
9. Wire AI output → graph population → GraphPersistence
10. Wire AI output → search index update

### Lower (frontend wiring):
11. Wire entity pages to query GraphAPI
12. Wire timeline to graph event nodes
13. Wire maps to graph location nodes
14. Replace static data sources with Supabase queries

---

## Investigation Methodology

This audit was produced through:
1. **Dual-agent forensic investigation** — one agent traced every stage from collector to public website; another audited the knowledge graph runtime
2. **100+ source files examined** across `src/lib/`, `src/pages/`, `supabase/`
3. **Database schema review** — all migrations, RLS policies, seed data
4. **Runtime code tracing** — every import, every function call, every config gate
5. **Cross-referenced with prior audit** (`docs/runtime-feed-engine-audit.md`)
