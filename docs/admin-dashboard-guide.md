# Admin Dashboard Guide

**Status:** Active development — M4.4 intelligence dashboards
**Last reviewed:** 2026-08-03

---

## Overview

The admin dashboards provide operational visibility into the collector pipeline,
AI processing, review queue, and data quality. All dashboards are admin-only —
not linked from public navigation.

## Dashboard Access

| Dashboard | Route | Purpose |
|---|---|---|
| Monitoring | `/admin/monitoring` | Collector health, system metrics, alerts |
| Pipeline | `/admin/pipeline` | Source overview, ingestion, AI pipeline throughput/latency, error rates |
| Review Metrics | `/admin/review-metrics` | Queue depth, age distribution, throughput, SLA compliance, bottlenecks |
| Data Quality | `/admin/data-quality` | Confidence scores, contradiction/duplicate rates, source coverage, freshness |

Access is by direct URL entry only. No authentication in the static beta.

## Data Source

All dashboards use in-memory development data during the static beta. Data resets on
page reload. Realistic seed data populates charts and tables for preview purposes.

When a backend arrives, the data-fetching layer (lib/admin query functions) will be
swapped for API calls — component props remain unchanged.

## Pipeline Dashboard

### Panels

- **Source Overview:** Stat tiles showing total, active, degraded, and failed sources
- **Content Ingestion:** Stacked bar chart of items ingested per period, grouped by source type
- **AI Pipeline Metrics:** Throughput bar chart per pipeline stage + latency table (p50/p95/p99)
- **Collector Status:** Card grid showing each collector's health, last fetch, items, and errors
- **Error Rates:** Line chart of errors over time, toggleable by source type or error category

### Controls

- **Time Range:** 1 hour, 24 hours, 7 days, 30 days
- **Auto-Refresh:** Off, 30s, 60s, 5 min (minimum 30s enforced)

## Review Queue Metrics Dashboard

### Panels

- **Queue Depth:** Stat tiles for key states + grouped bar chart of all states
- **Age Distribution:** Histogram of items by days in queue (0-1d through 14d+)
- **Throughput:** Items reviewed per day with 7-day moving average trend line
- **SLA Compliance:** Overall and per-content-type compliance rates over time with target line
- **Reviewer Performance:** Table of reviewer metrics (internal IDs only, no personal names)
- **Bottlenecks:** Alert cards for stuck items, unassigned items, overdue items, and reviewers at capacity

### CSV Export

The "Export CSV" button downloads the current reviewer performance data as a CSV file.

## Data Quality Dashboard

### Panels

- **Confidence Distribution:** Histogram of AI confidence scores across stages, with stage filter
- **Contradiction Rates:** Bar charts by content type and source type, plus unresolved count
- **Duplicate Detection:** Stat tiles for detection/false-positive/merge rates + bar chart by source type
- **Source Coverage:** Matrix table of countries × source types with coverage status cells
- **Data Freshness:** Table of content categories with last update age and status
- **Quality Trends:** Multi-metric line chart (confidence, contradiction, duplicate, freshness over time)
- **Quality Alerts:** Warning banner when metrics cross configured thresholds

## Threshold Configuration

### Review Bottlenecks

| Type | Default Threshold |
|---|---|
| Stuck in review | > 48 hours |
| Stuck in assigned | > 24 hours |
| Unassigned | > 24 hours |
| Reviewer at capacity | ≥ 90% |

### Quality Alerts

| Metric | Default Threshold |
|---|---|
| Avg confidence | < 0.5 (50%) |
| Contradiction rate | > 0.2 (20%) |
| Duplicate false positive rate | > 0.3 (30%) |
| Freshness score | < 70% |

Thresholds are defined as constants in `src/lib/admin/qualityMetrics.ts` and
`src/lib/admin/reviewMetrics.ts`. Adjust per deployment needs.

## Guardrails

- All dashboards are admin-only — not linked from public navigation
- No API keys, credentials, or internal access tokens are displayed
- Reviewer tables use internal IDs only — never personal names
- All panels show aggregate statistics — no individual content items exposed
- Auto-refresh has a configurable maximum rate (minimum 30s interval)
