# Collector Configuration

**Status:** Active — all collectors implement standard configuration.
**Last reviewed:** 2026-08-03

---

## Purpose

This document describes how to add new sources, configure RSS feeds, set polling
intervals, and manage collector instances. It is the operational reference for
the collector framework documented in `docs/collector-framework.md`.

---

## Quick Start: Add a New Source

### Step 1: Register the source in the Source Registry

Add a `SourceRecord` entry with:
- `id`: Unique source identifier (kebab-case)
- `sourceType`: One of `court`, `un`, `government`, `ngo`, `journalism`, `academic`
- `url`: The source's base URL or specific document URL
- `publisher`: Human-readable publisher name
- `automationStatus`: `"manual"` during beta, `"scheduled"` later

### Step 2: Create a collector configuration

```typescript
const config: CollectorConfig = {
  sourceId: "my-new-source",
  label: "My New Source",
  sourceType: "ngo",
  enabled: true,
  trigger: { type: "manual" },  // or { type: "interval", intervalMinutes: 360 }
  rateLimit: DEFAULT_RATE_LIMIT,
  retry: DEFAULT_RETRY_CONFIG,
  fetchTimeoutMs: 30000,
  maxContentAgeMs: 24 * 60 * 60 * 1000,  // 24 hours
  storeRawResponse: false,
};
```

### Step 3: Select the appropriate collector class

No new collector class is needed if your source matches an existing source type:

| Source Type | Collector Class | What it handles |
|---|---|---|
| `court` | `ICJCollector`, `ICCCollector` | Court documents, rulings, press releases |
| `un` | `OHCHRCollector`, `OCHACollector` | UN reports, resolutions, humanitarian updates |
| `government` | `EUCollector`, `BelgiumCollector` | EU/BE parliamentary documents, legislation |
| `ngo` | `AmnestyCollector`, `HRWCollector`, etc. | NGO reports, press releases, legal analyses |
| `journalism` | `JournalismCollector` | RSS-based news and investigative journalism |
| `academic` | `AcademicCollector` | Academic papers, preprints, working papers |

### Step 4: Register the collector

```typescript
import { AmnestyCollector } from "./collectors/ngo/AmnestyCollector";

registry.register(
  AmnestyCollector,
  ["ngo"],
  "Amnesty International collector",
);
```

### Step 5: Run a manual collection

```typescript
const source = getSourceFromRegistry("my-new-source");
const config = getConfig("my-new-source");
const collector = registry.createInstance(source, config);
const result = await collector.collect();
// result: CollectResult with itemsFetched, itemsStored, success, etc.
```

---

## Configuration Reference

### CollectorConfig

```typescript
interface CollectorConfig {
  sourceId: string;            // Source ID from Source Registry
  label: string;               // Human-readable for logging
  sourceType: SourceType;      // Determines which collector class is used
  enabled: boolean;            // Disabled collectors are skipped by scheduler
  trigger: CollectorTrigger;   // How collection is triggered
  rateLimit: RateLimitConfig;  // Per-source rate limiting
  retry: RetryConfig;          // Per-source retry behavior
  fetchTimeoutMs: number;      // Max fetch duration (ms)
  maxContentAgeMs: number;     // Force re-fetch after this age
  storeRawResponse: boolean;   // Store raw HTML/JSON alongside normalized
  metadata?: Record<string, unknown>;  // Collector-specific options
}
```

### CollectorTrigger

Three trigger types:

```typescript
// Manual — triggered by operator or API call
{ type: "manual" }

// Interval — poll at fixed intervals
{ type: "interval"; intervalMinutes: number }

// Cron — poll on a cron schedule
{ type: "cron"; expression: string }
```

During static beta, all sources should use `{ type: "manual" }`.

### RateLimitConfig

```typescript
interface RateLimitConfig {
  minDelayMs: number;           // Min delay between requests (default: 1000)
  maxRequestsPerMinute: number; // Max requests/minute per domain (default: 30)
  maxConcurrent: number;        // Max concurrent requests per domain (default: 2)
  burstSize: number;            // Max burst before throttling (default: 5)
  respectRetryAfter: boolean;   // Honor Retry-After headers (default: true)
}
```

**Per-source recommendations:**

| Source Type | minDelayMs | maxRequestsPerMinute | Notes |
|---|---|---|---|
| ICJ/ICC courts | 2000 | 10 | Small sites, be respectful |
| UN (OHCHR/OCHA) | 1000 | 30 | APIs with generous limits |
| EU institutions | 1500 | 20 | Multiple subdomains |
| NGO websites | 2000 | 10 | Various hosting, be conservative |
| News outlets | 3000 | 5 | Respect robots.txt and paywalls |
| Academic | 2000 | 10 | Often rate-limited via APIs |

### RetryConfig

```typescript
interface RetryConfig {
  maxRetries: number;        // Max attempts (0 = no retry). Default: 3
  initialDelayMs: number;    // First backoff. Default: 1000
  backoffMultiplier: number; // Exponential factor. Default: 2.0
  maxDelayMs: number;        // Backoff ceiling. Default: 30000
  jitter: boolean;           // Add random jitter. Default: true
  retryableStatuses: number[]; // Status codes to retry. Default: [429, 500, 502, 503, 504]
}
```

---

## RSS Feed Configuration

Journalism and some NGO collectors use RSS/Atom feeds. Configure feeds in
`src/lib/collectors/feeds/feedConfig.ts`:

```typescript
interface FeedDefinition {
  id: string;        // Unique feed identifier
  url: string;        // Feed URL (RSS 2.0 or Atom 1.0)
  sourceId: string;   // Maps to Source Registry ID
  sourceType: "journalism" | "ngo" | "academic";
  enabled: boolean;   // Enable/disable this feed
}
```

**Adding a new RSS feed:**
1. Add the `FeedDefinition` entry to the feeds array
2. Ensure the `sourceId` matches a Source Registry entry
3. Set `enabled: true`
4. The collector will pick it up on next run

---

## Polling Intervals

For scheduled collectors (post-beta), choose intervals appropriate to the source:

| Source Type | Recommended Interval | Rationale |
|---|---|---|
| Courts (ICJ/ICC) | 360 min (6h) | Documents published infrequently |
| UN (OHCHR) | 180 min (3h) | Press releases and reports daily |
| UN (OCHA) | 120 min (2h) | Humanitarian updates may be urgent |
| EU institutions | 240 min (4h) | Parliamentary cycle is weekly |
| Belgium | 480 min (8h) | National legislative pace |
| NGO reports | 360 min (6h) | Research reports published weekly |
| NGO press releases | 180 min (3h) | Time-sensitive statements |
| Journalism RSS | 60 min (1h) | News cycle |
| Academic | 720 min (12h) | Papers published infrequently |

---

## Error Handling by Source Type

Each source type may produce specific error patterns:

| Source Type | Common Errors | Recovery |
|---|---|---|
| Courts | 404 for unpublished documents | Skip, retry next run |
| UN | API auth expiry | Update API key |
| EU | Session timeout on parlament sites | Retry with fresh session |
| NGO | CMS restructuring changes HTML | Alert operator, manual fix |
| Journalism | Paywall blocks | Respect, store metadata only |
| Academic | DOI resolution failures | Try alternate resolver |

---

## Related Documents

- `docs/collector-framework.md` — framework architecture and lifecycle
- `docs/feed-configuration.md` — RSS/Atom feed configuration details
- `docs/monitoring-runbook.md` — collector health monitoring
- `docs/runbooks/collector-failure-recovery.md` — failure recovery procedures
