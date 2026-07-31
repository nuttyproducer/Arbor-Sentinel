# Collector Framework

**Status:** Active development — base framework complete (M4.1-02).  
**Last reviewed:** 2026-07-31

---

## Purpose

The collector framework provides the runtime infrastructure for automated
content ingestion from sources registered in the Source Registry. It defines
a standardized pipeline, typed errors, rate limiting, retry logic, and
scheduling — usable by both one-off manual collection runs and recurring
scheduled jobs.

During the static beta, collectors are triggered manually. Auto-start and
daemon behavior will be added in a later milestone.

---

## Architecture

```
┌────────────────────────────────────────────────┐
│                  Scheduler                      │
│  interval / cron / manual triggers              │
│  health-aware: skips "failed" collectors        │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────┐
│             CollectorRegistry                   │
│  register(class, sourceTypes, description)      │
│  createInstance(source, config) → BaseCollector  │
│  health tracking, instance caching              │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────┐
│               BaseCollector                     │
│  Pipeline:                                      │
│    fetch → validate → normalize                 │
│              → deduplicate → store              │
│  RateLimiter integration                        │
│  Retry with exponential backoff                 │
│  Timeout enforcement                            │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────┐
│           StorageInterface                      │
│  DevMemoryStore (in-memory, static beta)        │
│  Future: API-backed persistent store            │
└────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Register a collector class

```typescript
import { BaseCollector } from "./BaseCollector";
import { CollectorRegistry } from "./CollectorRegistry";
import { RateLimiter } from "./rateLimiter";
import { DevMemoryStore } from "./store";
import type { NormalizedContent } from "./types";

// Subclass the abstract BaseCollector
class CourtCollector extends BaseCollector {
  async fetch(): Promise<unknown[]> {
    const response = await fetch(this.source.url);
    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  }

  async normalize(raw: unknown): Promise<NormalizedContent> {
    const item = raw as Record<string, unknown>;
    return {
      title: (item.title as string) || "Untitled",
      body: (item.summary as string) || "",
      publishedAt: item.date as string,
      url: (item.url as string) || this.source.url,
      tags: [],
      metadata: { raw: item },
    };
  }
}

// Create the registry
const storage = new DevMemoryStore();
const rateLimiter = new RateLimiter();
const registry = new CollectorRegistry(storage, rateLimiter);

// Register
registry.register(CourtCollector, ["court"], "Collects court records from official sources");
```

### 2. Create a collector instance and run

```typescript
import { sources } from "../data/sources";
import { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from "./types";

const icjSource = sources.find((s) => s.id === "icj-2024-01-26")!;

const config = {
  sourceId: icjSource.id,
  label: "CourtCollector",
  sourceType: icjSource.sourceType,
  enabled: true,
  trigger: { type: "manual" as const },
  rateLimit: DEFAULT_RATE_LIMIT,
  retry: DEFAULT_RETRY_CONFIG,
  fetchTimeoutMs: 30000,
  maxContentAgeMs: 24 * 60 * 60 * 1000,
  storeRawResponse: false,
};

const collector = registry.createInstance(icjSource, config);
const result = await collector.collect();

console.log(result);
// {
//   runId: "run-1754000000000-1",
//   sourceId: "icj-2024-01-26",
//   itemsFetched: 5,
//   itemsValidated: 5,
//   itemsNormalized: 5,
//   itemsDeduplicated: 5,
//   itemsStored: 5,
//   stageDurations: { fetch: 1234, validate: 5, normalize: 23, deduplicate: 2, store: 1 },
//   success: true,
// }
```

### 3. Schedule recurring collection

```typescript
import { Scheduler } from "./scheduler";

const scheduler = new Scheduler(registry);

// Schedule a source for hourly collection
scheduler.schedule(icjSource, {
  ...config,
  trigger: { type: "interval", intervalMinutes: 60 },
});

// Trigger all enabled jobs manually (catch-up / maintenance)
const results = await scheduler.triggerAll();

// Trigger a single source immediately
const singleResult = await scheduler.trigger("icj-2024-01-26");
```

---

## Pipeline Stages

### Stage 1: fetch()
**Abstract method — subclasses must implement.**

Returns an array of raw items from the source. The base class wraps
this with timeout enforcement and rate limiting.

### Stage 2: validate(raw) → boolean
**Override for custom validation rules. Default: accepts all non-null items.**

Called once per raw item returned by fetch(). Items that fail validation
are dropped. Throw `ValidationError` for validation failures that should
stop the entire pipeline.

### Stage 3: normalize(raw) → NormalizedContent
**Override for source-specific normalization. Default: wraps raw content.**

Transforms a raw item into a `NormalizedContent` structure with title,
body, URL, publication date, language, tags, and metadata.

### Stage 4: deduplicate
**Uses `StorageInterface.exists(fingerprint)`. Override `createFingerprint()` for custom dedup logic.**

Each item is fingerprinted (by default: hash of URL + title + date).
Items whose fingerprints already exist in storage are skipped.

### Stage 5: store
**Override `store(item)` for custom storage. Default: calls `storage.save(item)`.**

Persists the collected item to the configured storage backend.

---

## Rate Limiting

The `RateLimiter` enforces three levels of control:

1. **Per-source minimum delay** — `minDelayMs` between requests to the same source.
2. **Per-domain request limits** — `maxRequestsPerMinute` sliding window, `maxConcurrent` in-flight cap.
3. **Burst handling** — `burstSize` limits how many requests can fire within 1 second.

### Domain blocking

When a source returns a 429 (Too Many Requests), the rate limiter can
block the domain for the duration specified in the `Retry-After` header:

```typescript
// Block a domain for 5 minutes after a rate limit response
rateLimiter.blockDomain("api.example.com", 5 * 60 * 1000);

// Check if a domain is blocked
if (rateLimiter.isBlocked("api.example.com")) {
  // Skip or reschedule
}
```

---

## Retry Logic

`withRetry` implements exponential backoff with configurable jitter and
retry/fatal error classification.

### Retryable errors (transient)
- `FetchError` — network failures
- `TimeoutError` — request exceeded timeout
- `RateLimitError` — rate limit responses (429)
- HTTP 5xx status codes (configurable)

### Fatal errors (not retried)
- `ParseError` — content cannot be parsed
- `ValidationError` — content fails validation rules
- `AuthError` — bad credentials or expired tokens

### Backoff formula

```
delay = min(initialDelay × multiplier^attempt, maxDelay)

With jitter: delay = delay × random(0.5, 1.0)
```

### Configuration

```typescript
const retryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,      // 1 second
  backoffMultiplier: 2.0,    // Double each attempt
  maxDelayMs: 30000,         // Cap at 30 seconds
  jitter: true,              // Add randomness to prevent thundering herd
  retryableStatuses: [429, 500, 502, 503, 504],
};
```

---

## Scheduling

### Trigger types

| Trigger | Behavior |
|---|---|
| `{ type: "manual" }` | No automatic scheduling — only `scheduler.trigger()` |
| `{ type: "interval", intervalMinutes: N }` | Runs every N minutes via `setInterval` |
| `{ type: "cron", expression: "0 */6 * * *" }` | Cron-like expression (simple hourly default; full cron parser planned) |

### Health-based scheduling

Collectors in `"failed"` health status are skipped by the scheduler.
Health transitions:

```
unknown → active (on first success)
active → degraded (on first failure)
degraded → failed (after 3+ consecutive failures)
failed → active (on next success after recovery)
```

### Manual triggers

Manual triggers run regardless of health status and do not affect
the regular schedule:

```typescript
await scheduler.trigger("source-id");
```

---

## Storage

### DevMemoryStore (static beta)

In-memory store for development and testing. Data is NOT persisted
across page reloads or server restarts.

```typescript
const store = new DevMemoryStore();

await store.save(item);
const items = await store.getBySource("source-id");
const recent = await store.getByDate("2026-07-01", "2026-07-31");
const unprocessed = await store.getUnprocessed();
const exists = await store.exists("fingerprint-hash");
const total = await store.count();
await store.clear(); // Reset for testing
```

### Production store (planned)

A persistent `StorageInterface` implementation backed by a REST API
and database. The interface contract is identical — swap the
implementation without changing collector code.

---

## Error Handling

All errors extend `CollectorError` and include structured context:

```typescript
try {
  await collector.collect();
} catch (error) {
  if (error instanceof CollectorError) {
    console.log({
      type: error.type,        // "fetch" | "parse" | "timeout" | ...
      sourceId: error.sourceId,
      url: error.url,
      attempt: error.attempt,
      stage: error.stage,      // which pipeline stage failed
      retryable: error.retryable,
    });

    // Convert to a CollectError record for logging
    const record = error.toCollectError();
  }
}
```

Type guards for classification:

```typescript
import { isRetryableError, isFatalError } from "./errors";

if (isFatalError(error)) {
  // Stop: parse error, validation error, or auth error
}

if (isRetryableError(error)) {
  // Can retry: network error, timeout, or rate limit
}
```

---

## Guardrails

- **No auto-start:** The scheduler does not auto-start. All jobs must be
  explicitly scheduled and triggered.
- **No daemon behavior:** The scheduler runs in the browser/Node event loop
  — no background workers or service workers yet.
- **No persistent storage:** DevMemoryStore is in-memory only. Collected
  content is lost on page reload.
- **Rate limits must respect TOS:** Configure `RateLimitConfig` per source
  to respect the source's terms of service.
- **No API keys in code:** `apiKeyRef` in source config references a key
  name — the actual key value is never stored in code or data files.
- **All tests use mocks:** No actual network calls in tests.

---

## Extending

### Creating a new collector

1. Subclass `BaseCollector`
2. Implement `fetch()` — return raw items from the source
3. Override `normalize()` — transform raw items into `NormalizedContent`
4. Optionally override `validate()`, `createFingerprint()`, `store()`
5. Register with `CollectorRegistry`

### Court collectors (ICJ / ICC)

Two court collectors are implemented for the highest-weight legal sources:

#### ICJCollector

Fetches and normalizes documents from icj-cij.org:
- Press releases, orders, judgments, advisory opinions
- Case docket updates, intervention filings
- URL support: direct document URLs (`/node/XXXXXX`), listing pages, case pages

```typescript
import { ICJCollector } from "./courts/ICJCollector";

registry.register(ICJCollector, ["court"], "ICJ court records collector");

const source = sources.find((s) => s.id === "icj-2024-01-26")!;
const collector = registry.createInstance(source, {
  sourceId: source.id,
  label: "ICJCollector",
  sourceType: source.sourceType,
  enabled: true,
  trigger: { type: "interval", intervalMinutes: 1440 }, // Daily
  rateLimit: DEFAULT_RATE_LIMIT,
  retry: DEFAULT_RETRY_CONFIG,
  fetchTimeoutMs: 30000,
  maxContentAgeMs: 24 * 60 * 60 * 1000,
  storeRawResponse: false,
});

const result = await collector.collect();
```

#### ICCCollector

Fetches and normalizes documents from icc-cpi.int:
- Press releases, arrest warrants, proceeding updates
- Situation page updates, Prosecutor statements
- Detects: warrants, judgments, confirmation proceedings, prosecutor statements

#### LegalNormalizer

Shared normalizer used by both court collectors:

- **Extracts:** case number, parties, court, document type, date
- **Maps** document types to `LegalStatus` controlled vocabulary
- **Maps** document types to `LegalTimelineEventType` vocabulary
- **Preserves** verbatim body text, key rulings, legal basis, and next steps
- **Never** adds legal analysis or commentary

| Court Document Type | Legal Status | Timeline Event |
|---|---|---|
| order | court_proceeding_active, provisional_measures_issued | order |
| judgment | court_proceeding_active | judgment |
| warrant | arrest_warrant_issued, court_proceeding_active | arrest_warrant_issued |
| press_release | court_proceeding_active | official_report_update |
| prosecutor_statement | allegation_under_investigation | official_report_update |
| filing | allegation_under_investigation, court_proceeding_active | filing |

**Guardrails for court documents:**
- Do not modify or delete original source text — preserve verbatim quotes
- Do not add legal analysis or commentary in the normalizer
- Procedural status must use the `LegalStatus` controlled vocabulary
- Distinguish between: filing, order, judgment, warrant, proceeding update
- Never claim a ruling says something it does not explicitly state

### UN collectors (OHCHR / OCHA)

#### OHCHRCollector

Fetches from ohchr.org:
- Commission of Inquiry (COI) reports
- Human Rights Council (HRC) resolutions
- High Commissioner statements and press releases
- Country-specific human rights pages

#### OCHACollector

Fetches from ochaopt.org and unocha.org:
- Situation reports (sitreps)
- Flash appeals and humanitarian needs overviews
- Humanitarian updates and funding tracking data
- **RSS feed support** for recurring OCHA updates

#### UNNormalizer

Shared normalizer for UN documents:

- **Extracts:** UN document symbol (A/HRC/55/28, S/2024/123), issuing body (OHCHR, OCHA, HRC, COI), session/meeting, agenda item, report type, geographic scope
- **Preserves** original document classification markings
- **Does not** interpret, summarize, or editorialize UN findings

| UN Document Type | Collector |
|---|---|
| coi_report | OHCHRCollector |
| hrc_resolution | OHCHRCollector |
| hc_statement | OHCHRCollector |
| situation_report | OCHACollector |
| flash_appeal | OCHACollector |
| humanitarian_update | OCHACollector (incl. RSS) |
| funding_update | OCHACollector |

**Guardrails for UN documents:**
- Do not interpret UN document language — extract metadata only
- Preserve original document classification markings
- Do not summarize or editorialize UN findings in the collector layer
- Respect robots.txt and crawl delays for UN websites

### EU & Belgium collectors

#### EUCollector

Fetches from EU institutions:
- **Council** (consilium.europa.eu): Conclusions, decisions
- **Commission** (ec.europa.eu): Statements, communications
- **Parliament** (europarl.europa.eu): Resolutions, reports
- **EEAS** (eeas.europa.eu): Press releases, statements
- **EUR-Lex** (eur-lex.europa.eu): Legal documents (Association Agreement, Common Position tracking)

#### BelgiumCollector

Fetches from Belgium government sources:
- **FPS Foreign Affairs** (diplomatie.belgium.be): Press releases, statements
- **Chamber of Representatives** (lachambre.be): Written questions, debates, records
- **Senate** (senate.be): Senate records
- **Regional governments**: Flanders, Wallonia, Brussels-Capital

Multi-language support: EU (EN/FR/DE), Belgium (NL/FR/EN).

#### GovernmentNormalizer

Shared normalizer for government documents:

- **Extracts:** issuing institution, document reference/code (COM, JOIN, CELEX), legal basis citations, vote tallies (for/against/abstain), effective dates
- **Distinguishes** EU institution types (Council vs Commission vs Parliament) — each has different legal weight
- **Labels** Belgium documents with correct government level: federal, regional, community
- **Marks** adopted vs proposed legislation

| Government Level | Institution Examples |
|---|---|
| eu | Council, Commission, Parliament, EEAS, EUR-Lex |
| federal | FPS Foreign Affairs, Chamber, Senate |
| regional | Flemish Government, Walloon Government, Brussels-Capital |
| community | French Community, German-speaking Community |

**Guardrails for government documents:**
- Distinguish between EU institution types — each has different legal weight
- Do not conflate proposed legislation with adopted legislation
- Belgium regional documents must be labeled with the correct government level
- Respect parliamentary publication embargo periods

### Adding a new storage backend

Implement `StorageInterface`:

```typescript
class ApiBackedStore implements StorageInterface {
  async save(item: CollectedItem): Promise<void> { /* POST to API */ }
  async getBySource(sourceId: string): Promise<CollectedItem[]> { /* GET from API */ }
  async getByDate(start: string, end: string): Promise<CollectedItem[]> { /* GET with query */ }
  async getUnprocessed(): Promise<CollectedItem[]> { /* GET unprocessed */ }
  async exists(fingerprint: string): Promise<boolean> { /* HEAD request */ }
  async count(): Promise<number> { /* GET count */ }
  async clear(): Promise<void> { /* DELETE all for testing */ }
}
```

---

## Future Milestones

- **Cron parser:** Replace simple hourly default with full cron expression support
- **Persistent store:** API-backed storage with database persistence
- **Dashboard:** Collector health dashboard showing run history and failure trends
- **Auto-start:** Daemon/service worker for background collection
- **Webhook triggers:** Trigger collection from external events (new document published, etc.)
- **Content diffing:** Compare collected content against previously stored versions
- **Notification alerts:** Alert on consecutive failures or health degradation
