# Intelligence Roadmap — Recommended Build Order

**Date:** 2026-08-05
**Principle:** Extend existing systems. Do not rebuild. Do not restructure.

---

## Phase 1 — Wire What's Already Built (Priority 1)

The codebase has several components that are fully implemented but disconnected. Wire them first — zero new architecture, maximum impact.

### 1.1 Wire MediaLibrary to `/admin/media` route
- **Goal:** Replace PlaceholderPage at `/admin/media` with the existing `MediaLibrary` component
- **Reason:** Component exists (`src/components/admin/MediaLibrary.tsx`), fully built with Supabase Storage integration — just not mounted
- **Files:** `src/App.tsx` (route change), `src/components/admin/MediaLibrary.tsx` (existing)
- **Acceptance criteria:** `/admin/media` shows the Supabase Storage browser/uploader instead of "Coming Soon"
- **Complexity:** Trivial (1 route change)

### 1.2 Wire VersionHistory to ContentEditor
- **Goal:** Add version history tab/panel to the ContentEditor page
- **Reason:** `VersionHistory.tsx` exists with diff view and restore — not wired into any page
- **Files:** `src/components/admin/VersionHistory.tsx` (existing), `src/pages/admin/ContentEditor.tsx` (add tab)
- **Acceptance criteria:** Content editor shows version history for the current record, with diff and restore
- **Complexity:** Low

### 1.3 Wire PublishWorkflow to ContentEditor
- **Goal:** Add publish workflow indicator/actions to the content editor
- **Reason:** `PublishWorkflow.tsx` exists with full state machine — not wired into any page
- **Files:** `src/components/admin/PublishWorkflow.tsx` (existing), `src/pages/admin/ContentEditor.tsx` (add section)
- **Acceptance criteria:** Content editor shows publish state and transition actions for reviewable content
- **Complexity:** Low

### 1.4 Wire RSS Proxy or Remove It
- **Goal:** Either integrate `supabase/functions/rss-proxy` into the JournalismCollector, or delete it
- **Reason:** Orphaned code — CORS-solving proxy for RSS feeds. JournalismCollector currently fetches feeds directly (browser CORS limitations apply)
- **Files:** `supabase/functions/rss-proxy/index.ts`, `src/lib/collectors/media/JournalismCollector.ts`
- **Acceptance criteria:** RSS proxy is called by JournalismCollector, OR the proxy is deleted and decision documented
- **Complexity:** Low

---

## Phase 2 — Persistence Layer (Priority 1)

Collectors run in-memory and lose all state on page refresh. This is the single biggest blocker to production ingestion.

### 2.1 Implement Collector DB Write Path
- **Goal:** Persist collector runs to the `collector_runs` table
- **Reason:** `collector_runs` table exists with full schema; `DevMemoryStore` is the only storage implementation. Write a `SupabaseStore` that implements `StorageInterface`
- **Files:** New: `src/lib/collectors/SupabaseStore.ts`. Modify: `src/lib/db/client.ts` (if admin client needed)
- **Acceptance criteria:**
  - `SupabaseStore` implements `StorageInterface`
  - Collector runs persist to `collector_runs` table
  - Items fetched/validated/stored counts are recorded
  - Stage durations and errors are recorded
  - Existing tests pass with `SupabaseStore` swapped in
- **Complexity:** Medium

### 2.2 Implement Scheduler.executeJob()
- **Goal:** Replace the stub with working collector execution
- **Reason:** `Scheduler.executeJob()` throws a descriptive error but doesn't actually run collectors
- **Files:** `src/lib/collectors/scheduler.ts`
- **Acceptance criteria:**
  - `executeJob()` creates a collector instance via `CollectorRegistry`, runs it, stores results
  - Interval-based jobs fire and complete
  - Health monitor updates on each run
- **Complexity:** Medium

### 2.3 Create `feeds` DB Table + Migration
- **Goal:** Move feed configuration from hardcoded TypeScript to database
- **Reason:** Required for feed management UI; enables dynamic feed management without code changes
- **Files:** New: `supabase/migrations/00010_feeds_table.sql`. Modify: `src/lib/collectors/feeds/feedConfig.ts`
- **Acceptance criteria:**
  - `feeds` table with: id, source_id (FK), url, feed_type (rss/atom), source_type, polling_interval_minutes, category_mapping (jsonb), has_paywall, enabled, last_fetched_at, last_error, created_at, updated_at
  - RLS policies (admin all, researcher select)
  - Seed migration copies existing `feedConfig` entries into the table
- **Complexity:** Low

---

## Phase 3 — Feed Management (Priority 2)

### 3.1 Build Feed Management Admin Page
- **Goal:** Admin UI for viewing, adding, editing, enabling/disabling, and manually refreshing feeds
- **Reason:** Currently feeds are hardcoded — no operational control without code changes
- **Files:** New: `src/pages/admin/FeedManager.tsx`, `src/components/admin/FeedTable.tsx`, `src/components/admin/FeedForm.tsx`. Modify: `src/components/admin/AdminSidebar.tsx` (add link), `src/App.tsx` (add route)
- **Acceptance criteria:**
  - Table lists all feeds with status (enabled/disabled), source, last fetch, errors
  - Add/edit feed form with validation
  - Enable/disable toggle
  - Manual "Fetch Now" trigger per feed
  - Route: `/admin/feeds`
- **Complexity:** Medium

### 3.2 Replace Regex RSS Parser with Library
- **Goal:** Add `fast-xml-parser` dependency and rewrite `FeedParser` to use it
- **Reason:** Regex-based XML parsing is fragile; edge cases (namespaced elements, encodings, CDATA nesting) will cause silent data loss
- **Files:** `src/lib/collectors/feeds/FeedParser.ts` (rewrite), `package.json` (add `fast-xml-parser`)
- **Acceptance criteria:**
  - Parse RSS 2.0, Atom 1.0, RDF/RSS 1.0
  - Handle all current feed config entries
  - Existing FeedParser tests pass
  - Add tests for known edge cases (HTML entities, non-UTF8, missing fields)
- **Complexity:** Low

---

## Phase 4 — Intelligence Dashboard (Priority 2)

### 4.1 Build Unified Intelligence Dashboard
- **Goal:** Single page combining collector health + pipeline throughput + data quality + coverage gaps
- **Reason:** Referenced in specs ("M4.4 intelligence dashboards") but no page exists. The 6 existing dashboards are isolated — no unified operational view
- **Files:** New: `src/pages/admin/IntelligenceDashboard.tsx`. Modify: `src/components/admin/AdminSidebar.tsx`, `src/App.tsx`
- **Acceptance criteria:**
  - Combines key panels from existing dashboards: SystemHealthPanel, CollectorStatusGrid, IngestionChart, AIPipelineMetrics, ConfidenceDistribution, SourceCoverageMap
  - Single-page operational overview
  - Auto-refresh support
  - Route: `/admin/intelligence`
- **Complexity:** Medium

### 4.2 Add Content Gap Detection
- **Goal:** Detect coverage gaps (regions, source types, evidence categories with insufficient collection)
- **Reason:** HealthMonitor already detects coverage gaps at the collector level — extend to content-level gap analysis
- **Files:** `src/lib/collectors/monitoring/HealthMonitor.ts` (extend), `src/lib/admin/metrics.ts` (extend)
- **Acceptance criteria:**
  - Gap report by: region, source type, evidence category, language
  - Visualized on Intelligence Dashboard
  - Alert when a category has 0 items in last 30 days
- **Complexity:** Medium

---

## Phase 5 — Operations Readiness (Priority 3)

### 5.1 Add Health Endpoint
- **Goal:** Expose a `/health` endpoint for external uptime monitoring
- **Reason:** No health endpoint exists — external monitoring tools can't verify app health
- **Files:** New: `supabase/functions/health-check/index.ts`. Modify: `supabase/config.toml`
- **Acceptance criteria:**
  - `GET /health` returns JSON: `{status: "ok", timestamp, db: "connected"|"error", functions: "ok"|"degraded"}`
  - HTTP 200 when healthy, 503 when degraded
- **Complexity:** Low

### 5.2 Add Structured Logging
- **Goal:** Replace `console.warn`/`console.error` with a structured logger
- **Reason:** No structured logging exists; debugging collector failures requires browser console access
- **Files:** New: `src/lib/logging/logger.ts`. Modify: collector and AI files to use structured logger
- **Acceptance criteria:**
  - JSON-structured log entries with: level, timestamp, component, message, data
  - Log levels: debug, info, warn, error
  - Collector runs and AI operations emit structured logs
  - Logs available in admin dashboard (new LogViewer panel)
- **Complexity:** Medium

### 5.3 Add Alert Notifications
- **Goal:** Send alerts to email/Slack when collectors fail or data quality drops
- **Reason:** Alerting is UI-only — requires someone watching the dashboard to notice failures
- **Files:** `src/lib/collectors/monitoring/AlertSystem.ts` (extend), new: `supabase/functions/alert-notify/index.ts`
- **Acceptance criteria:**
  - Alerts fire to configurable webhook URL
  - Slack webhook integration
  - Email notification via Supabase Edge Function
  - Alert rules configurable via env vars
- **Complexity:** Medium

---

## Phase 6 — Future Enhancements (Priority 3)

### 6.1 Add Persistent Scheduling
- **Goal:** Replace in-process `setInterval` with Supabase Cron or pg-boss
- **Reason:** Current scheduler stops when browser closes; production ingestion needs server-side scheduling
- **Complexity:** High
- **Dependencies:** Phase 2 (DB persistence)

### 6.2 Add Processing Queue
- **Goal:** Queue-based processing for collector output → AI pipeline → review
- **Reason:** Direct synchronous processing won't scale; need queue for retries, prioritization, backpressure
- **Complexity:** High
- **Dependencies:** Phase 6.1 (persistent scheduling)

### 6.3 Add New Collectors
- **Goal:** ReliefWeb (clean API), UNHCR, WHO, additional EU member states (France, Germany, Netherlands)
- **Reason:** Expand coverage; ReliefWeb has a well-documented API (low-hanging fruit)
- **Complexity:** Medium per collector
- **Dependencies:** Phase 2 (DB persistence)

### 6.4 Add Embeddings / Vector Search
- **Goal:** Semantic search via pgvector embeddings
- **Reason:** Current search is lexical FTS only; semantic search would improve discoverability
- **Complexity:** High
- **Dependencies:** AI pipeline

### 6.5 Add Multi-Model AI Provider Support
- **Goal:** Add Anthropic/Claude as second AI provider alongside DeepSeek
- **Reason:** Provider diversity for reliability and capability matching
- **Complexity:** Medium
- **Dependencies:** AI pipeline

---

## Build Order Summary

```
Phase 1: Wire existing (4 items, ~8h) ───────────────────┐
  MediaLibrary, VersionHistory, PublishWorkflow, RSS Proxy  │
                                                           │
Phase 2: Persistence (3 items, ~18h) ─────────────────────┤
  SupabaseStore, Scheduler.executeJob(), feeds table        │
                                                           │
Phase 3: Feed Management (2 items, ~11h) ──────────────────┤
  Feed Manager UI, XML parser library                      │
                                                           │
Phase 4: Intelligence Dashboard (2 items, ~20h) ───────────┤
  Unified dashboard, content gap detection                 │
                                                           │
Phase 5: Operations (3 items, ~14h) ───────────────────────┘
  Health endpoint, structured logging, alert notifications

Phase 6: Future (5 items, ~64h) ─── separate planning
  Cron, queue, new collectors, embeddings, multi-model
```

**Total Phase 1–5:** ~71 hours (~9 days)
**Total Phase 6:** ~64 hours (~8 days)

---

## What NOT to Do

- ❌ Do NOT rebuild the collector framework — it works, is well-tested, and has 10 concrete implementations
- ❌ Do NOT replace the AI pipeline — 14 stages, comprehensive tests, production-quality error handling
- ❌ Do NOT redesign the database schema — 9 migrations, 18+ tables, full RLS, audit trails, retention policies
- ❌ Do NOT restructure the admin dashboard — 6 dashboards with 20+ reusable components
- ❌ Do NOT add a server framework (Express/Fastify) — the architecture is static SPA + Supabase; keep it
- ❌ Do NOT create speculative abstractions — only extend what exists
- ❌ Do NOT rebuild the RSS parser from scratch — add `fast-xml-parser`, keep FeedParser's interface
