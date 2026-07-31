# Architecture

This document describes the recommended technical architecture. It is intentionally conservative for the MVP.

---

## Architecture principles

1. Static-first public MVP.
2. No sensitive submissions at launch.
3. No user accounts at launch.
4. Privacy-first analytics or no analytics.
5. Source content as structured files first.
6. Keep deployment simple.
7. Avoid custom cryptography.
8. Separate future sensitive systems from public website.
9. Build for accessibility and low bandwidth.
10. Add complexity only when justified.

---

## Recommended MVP stack

Possible frontend options:

- Astro + Markdown/MDX
- Next.js static export
- Vite + React
- SvelteKit static

Recommended first choice:

```text
Astro or Next.js static-first
Markdown/MDX content
JSON/YAML data files
Static hosting
Privacy-first analytics
```

Reason:

- fast;
- low cost;
- easy for contributors;
- good for documentation-heavy pages;
- safer than a complex app too early.

---

## MVP components

```text
Public site
├── Static content pages
├── Structured data files
├── Country page generator
├── Organization directory generator
├── Legal tracker generator
├── Action template pages
└── PDF dossier export prototype
```

---

## Suggested folders when code starts

```text
src/
├── components/
├── layouts/
├── pages/
├── content/
│   ├── countries/
│   ├── organizations/
│   ├── legal-cases/
│   ├── sources/
│   └── actions/
├── data/
├── styles/
└── utils/
```

---

## Data files first

Use structured files before a database:

```text
content/countries/belgium.yaml
content/countries/eu.yaml
content/organizations/unrwa.yaml
content/legal-cases/icj-south-africa-israel.yaml
content/actions/belgium-email-foreign-minister.yaml
```

This allows review through pull requests.

---

## Collector Framework

The collector framework automates content ingestion from registered sources.
It is designed for the transition from static data to automated collection.

### Pipeline

Every collector follows a five-stage pipeline:

```
fetch → validate → normalize → deduplicate → store
```

Pipeline order is enforced by `BaseCollector`. Each stage is measured and errors
are typed with full source/URL/attempt context.

### Components

| Module | Purpose |
|---|---|
| `BaseCollector` | Abstract base class — subclasses implement `fetch()` |
| `CollectorRegistry` | Registers collector classes by source type; creates cached instances |
| `RateLimiter` | Per-source delays, per-domain request limits, burst handling, domain blocking |
| `Retry` | Exponential backoff with jitter, retryable vs fatal error classification |
| `Scheduler` | Interval-based and manual triggers; health-aware scheduling |
| `DevMemoryStore` | In-memory storage for development — replaced by API-backed store in production |

### Error types

All errors extend `CollectorError` and carry context: `sourceId`, `url`, `attempt`, `stage`.

| Error | Stage | Retryable |
|---|---|---|
| `FetchError` | fetch | Yes |
| `TimeoutError` | fetch | Yes |
| `RateLimitError` | fetch | Yes |
| `ParseError` | normalize | No |
| `ValidationError` | validate | No |
| `AuthError` | fetch | No |

### Usage pattern

```typescript
// 1. Register collectors
registry.register(MyCourtCollector, ["court"], "Handles court records");

// 2. Create instances from Source Registry records
const collector = registry.createInstance(sourceRecord, config);

// 3. Trigger collection
const result = await collector.collect();
// result: { itemsFetched, itemsValidated, ..., stageDurations, success }

// 4. Or schedule recurring collection
scheduler.schedule(sourceRecord, {
  ...config,
  trigger: { type: "interval", intervalMinutes: 60 },
});
```

See `docs/collector-framework.md` for the detailed usage guide.

---

## Future backend

Only add a backend when needed for:

- admin workflow;
- structured review;
- submissions;
- user accounts;
- dynamic search;
- PDF generation at scale;
- partner dashboards.

Possible future stack:

- PostgreSQL + PostGIS;
- OpenSearch/Elasticsearch for search;
- object storage for media;
- Redis for caching;
- queue for report generation;
- role-based admin app.

---

## Search

MVP:

- static site search or simple client-side search.

Later:

- OpenSearch/Elasticsearch if the evidence library grows.

---

## Maps

MVP:

- no live map unless data is reviewed.

Later:

- Leaflet for open maps;
- GeoJSON incident data;
- careful location precision;
- map tile caching;
- safety review for exact locations.

---

## PDF dossier generation

MVP options:

- generate printable HTML pages;
- browser print to PDF;
- static PDF template generated during build.

Later:

- server-side PDF generation;
- selectable country/time/source filters;
- branded policy dossier export.

---

## Analytics

MVP:

- no analytics or privacy-first analytics.

Avoid:

- Meta pixel;
- Google Ads tracking;
- fingerprinting;
- heatmap trackers;
- session replay tools.

---

## Security baseline

Before deploy:

- HTTPS;
- dependency scanning;
- secret scanning;
- branch protection;
- 2FA for maintainers;
- Content Security Policy;
- no exposed secrets;
- minimal third-party scripts.

---

## Future sensitive systems

Sensitive workflows must be separate from the public site.

Examples:

- SecureDrop;
- GlobaLeaks;
- Uwazi/HURIDOCS style evidence management;
- partner-managed intake.

Do not build a custom anonymous evidence system without expert review.
