# Intelligence Gap Analysis

**Date:** 2026-08-05

## Gap Table

| # | Subsystem | Current % | Missing % | Priority | Difficulty | Est. Effort | Dependencies |
|---|-----------|-----------|-----------|----------|------------|-------------|--------------|
| 1 | Source Registry | 95% | 5% | 🟡 Medium | Low | 2h | None |
| 2 | Source Metadata & Trust | 90% | 10% | 🟢 Low | Low | 2h | Collector metrics |
| 3 | RSS Parser | 70% | 30% | 🟡 Medium | Low | 4h | None |
| 4 | RSS Feed Config | 85% | 15% | 🟠 High | Low | 3h | DB feeds table |
| 5 | RSS Proxy (edge function) | 60% | 40% | 🟡 Medium | Low | 2h | Feed config |
| 6 | API Collectors (10 implemented) | 85% | 15% | 🟡 Medium | Medium | 8h each | Collector framework |
| 7 | Collector Framework | 90% | 10% | 🟢 Low | Medium | 4h | None |
| 8 | Collector Scheduler | 40% | 60% | 🔴 Critical | High | 16h | DB persistence |
| 9 | Collector Storage (DB persistence) | 30% | 70% | 🔴 Critical | Medium | 8h | collector_runs table |
| 10 | Rate Limiting | 95% | 5% | 🟢 Low | Low | 1h | None |
| 11 | Retry Logic | 95% | 5% | 🟢 Low | Low | 1h | None |
| 12 | Error Handling | 90% | 10% | 🟢 Low | Low | 2h | None |
| 13 | AI Pipeline (14 stages) | 95% | 5% | 🟢 Low | High | 4h | None |
| 14 | Knowledge Graph | 90% | 10% | 🟢 Low | Medium | 4h | AI pipeline |
| 15 | Collector Health Monitoring | 85% | 15% | 🟡 Medium | Medium | 6h | DB persistence |
| 16 | Admin Dashboards (6 existing) | 90% | 10% | 🟢 Low | Medium | 4h | None |
| 17 | Intelligence Dashboard (unified) | 0% | 100% | 🟠 High | Medium | 12h | Existing dashboards |
| 18 | Feed Management UI | 0% | 100% | 🟠 High | Medium | 8h | DB feeds table |
| 19 | Media Library Integration | 80% | 20% | 🟡 Medium | Low | 2h | None (component exists) |
| 20 | Version History Integration | 80% | 20% | 🟡 Medium | Low | 2h | None (component exists) |
| 21 | PublishWorkflow Integration | 80% | 20% | 🟡 Medium | Low | 2h | None (component exists) |
| 22 | Database Schema | 95% | 5% | 🟢 Low | Low | 2h | None |
| 23 | `feeds` DB Table | 0% | 100% | 🟠 High | Low | 2h | None |
| 24 | Collector DB Write Path | 0% | 100% | 🔴 Critical | Medium | 8h | collector_runs table |
| 25 | Persistent Scheduling (cron) | 0% | 100% | 🔴 Critical | High | 12h | DB write path |
| 26 | Processing Queue | 0% | 100% | 🟡 Medium | High | 16h | Persistent scheduling |
| 27 | Embeddings / Vector Search | 0% | 100% | 🟢 Low | High | 24h | AI pipeline |
| 28 | Health Endpoint | 0% | 100% | 🟡 Medium | Low | 2h | None |
| 29 | Structured Logging | 0% | 100% | 🟡 Medium | Medium | 6h | None |
| 30 | Alert Notifications (email/Slack) | 0% | 100% | 🟡 Medium | Medium | 6h | Monitoring |
| 31 | Content Gap Detection | 50% | 50% | 🟡 Medium | Medium | 8h | Collector metrics |
| 32 | Multi-Model AI Provider | 30% | 70% | 🟢 Low | Medium | 8h | AI pipeline |

## Priority Breakdown

### 🔴 Critical (deploy-blocking for production ingestion)
1. **#8 Collector Scheduler** — `executeJob()` is a stub; no collectors can run automatically
2. **#9 Collector Storage** — in-memory only; all collector output is lost on page refresh
3. **#24 Collector DB Write Path** — `collector_runs` table exists with zero code paths writing to it
4. **#25 Persistent Scheduling** — no cron/pg-boss/queue; ingestion stops when browser closes

### 🟠 High (before functional use)
5. **#4 RSS Feed Config** — hardcoded feeds; no way to add/remove without code changes
6. **#17 Intelligence Dashboard** — no unified view of the intelligence pipeline
7. **#18 Feed Management UI** — no admin interface to manage feeds
8. **#23 `feeds` DB Table** — feed configuration should be in DB, not hardcoded

### 🟡 Medium (before M7 Functional Beta)
9. **#3 RSS Parser** — regex-based; should add proper XML library
10. **#5 RSS Proxy** — orphaned edge function; wire or remove
11. **#15 Health Monitoring** — UI-only; no external alerts
12. **#19-21 Component Integration** — MediaLibrary, VersionHistory, PublishWorkflow are built but unwired
13. **#26 Processing Queue** — needed for scale beyond single-collector runs
14. **#28-30 Operations** — health endpoint, structured logging, alert notifications
15. **#31 Content Gap Detection** — detect missing coverage areas

### 🟢 Low (future enhancement)
16. **#6 New Collectors** — ReliefWeb, UNHCR, WHO, additional countries
17. **#27 Embeddings/Vector Search** — semantic search capabilities
18. **#32 Multi-Model AI** — Anthropic/Claude as second provider

## Dependency Graph

```
Persistent Scheduling (25)
    └── Collector DB Write Path (24)
            └── Collector Storage (9)
                    └── Collector Framework (7) ✅

Intelligence Dashboard (17)
    └── Existing Dashboards (16) ✅
    └── Collector Health Monitoring (15)

Feed Management UI (18)
    └── feeds DB Table (23)
    └── RSS Feed Config (4)
            └── RSS Parser (3)

Processing Queue (26)
    └── Persistent Scheduling (25)

Alert Notifications (30)
    └── Collector Health Monitoring (15)
    └── Structured Logging (29)
```

## Effort Summary

| Priority | Items | Total Est. Effort |
|----------|-------|-------------------|
| 🔴 Critical | 4 | 44h (~5.5 days) |
| 🟠 High | 4 | 25h (~3 days) |
| 🟡 Medium | 11 | 56h (~7 days) |
| 🟢 Low | 5 | 46h (~6 days) |
| **Total** | **24** | **~171h (~21 days)** |
