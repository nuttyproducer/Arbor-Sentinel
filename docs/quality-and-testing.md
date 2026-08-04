# Quality and Testing

**Status:** Active — CI runs on every push to `main` and every pull request.  
**Last reviewed:** 2026-07-12

## Local commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck + production build (`tsc -b && vite build`) |
| `npm run typecheck` | TypeScript typecheck only (`tsc -b`) |
| `npm run lint` | ESLint across the project |
| `npm run test` | Vitest — run all tests once |
| `npm run test:watch` | Vitest — watch mode for development |
| `npm run preview` | Preview the production build locally |

## CI jobs

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every
push to `main` and every pull request. It executes, in order:

1. **`npm ci`** — clean install of dependencies
2. **`npm run typecheck`** — TypeScript typecheck
3. **`npm run lint`** — ESLint
4. **`npm run test`** — Vitest test suite
5. **`npm run build`** — Production build

If any step fails, the CI run fails. All steps must pass before merging.

## Test structure

```
src/
├── __tests__/
│   └── accessibility.test.tsx    # Axe a11y checks for core pages
├── components/
│   ├── layout/__tests__/
│   │   └── Header.test.tsx       # Header + mobile menu
│   ├── pages/__tests__/
│   │   ├── CorrectionLink.test.tsx
│   │   ├── LegalStatusBadge.test.tsx
│   │   ├── PreviewNotice.test.tsx
│   │   ├── SourceList.test.tsx
│   │   └── VerificationBadge.test.tsx
│   └── ui/__tests__/
│       └── Badge.test.tsx        # Badge variant mapping
├── pages/__tests__/
│   ├── NotFoundPage.test.tsx     # 404 page
│   └── routeSmoke.test.tsx       # Route rendering smoke tests
└── test-setup.ts                 # jest-dom matchers
```

## What is tested

| Area | Tests |
|---|---|
| **Badge** | Variant CSS class mapping (neutral, info, warning, alert), children rendering, custom className |
| **VerificationBadge** | All 6 verification levels, prefix display, variant mapping (0-1→warning, 2→neutral, 3-5→info) |
| **LegalStatusBadge** | All 9 legal statuses render without error, variant mapping (arrest_warrant→alert, un_finding→info, etc.) |
| **SourceList** | Empty state, source rendering, type badges, dates, archive links, notes, custom title |
| **PreviewNotice** | Children, badge, methodology/corrections links, custom title, role="note" |
| **CorrectionLink** | Default label, custom label/href, arrow icon |
| **Header** | Logo, desktop nav items, GitHub link, mobile menu toggle, active-route highlighting |
| **NotFoundPage** | 404 indicator, heading, explanation, Home/Methodology/Contribute/GitHub buttons |
| **Route smoke** | 11 pages render without throwing (Home, Methodology, Contribute, Corrections, Privacy, Accessibility, Disclaimer, Attributions, Changelog, Press, 404) |
| **Accessibility (Axe)** | Methodology, Corrections, NotFound, Press — axe-core automated violation scan |

## How to add tests

### For a component

1. Create `src/components/.../__tests__/ComponentName.test.tsx`.
2. Import `render`, `screen` from `@testing-library/react`.
3. If the component uses React Router, wrap in `<MemoryRouter>`.
4. Use `vi.mock("framer-motion", ...)` if the component (or its parent tree)
   uses `Reveal` or other framer-motion components. Copy the mock from
   `src/pages/__tests__/routeSmoke.test.tsx`.

Example:

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MyComponent } from "../MyComponent";

describe("MyComponent", () => {
  it("renders the title", () => {
    render(
      <MemoryRouter>
        <MyComponent />
      </MemoryRouter>,
    );
    expect(screen.getByText("Expected text")).toBeInTheDocument();
  });
});
```

### For an Axe accessibility test

```tsx
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axe from "vitest-axe";

it("has no a11y violations", async () => {
  const { container } = render(
    <MemoryRouter><MyPage /></MemoryRouter>,
  );
  const results = await axe(container);
  expect(results.violations).toEqual([]);
});
```

## Expected failures

Currently none. All tests pass.

### Pre-existing issues not covered by automation

| Issue | Why not automated | How verified |
|---|---|---|
| ESLint config format | Fixed in this quality pass — flat config created | CI |
| Social preview SVG rendering | Requires real browser / platform debugger (Facebook, Twitter) | Manual with opie.link |
| Reduced-motion compliance | Framer Motion is mocked in tests; real animation behavior requires manual testing | Manual — toggle OS reduced-motion setting |
| Screen-reader navigation | Axe catches structural issues; actual screen-reader UX requires manual testing | Manual with VoiceOver/NVDA |
| Color contrast on image overlays | Axe runs against DOM, not rendered pixels; overlaid text on images requires visual review | Manual — check each page with a contrast analyzer |
| Mobile viewport layout | jsdom doesn't render at specific viewport widths | Manual — resize browser to 375px |
| Keyboard navigation through animation sequences | Reveal components stagger content; keyboard order should match visual order | Manual — Tab through each page |
| Touch target size on small interactive elements | Axe checks some but not all touch-target rules | Manual — check interactive elements ≥ 44px |
| Trauma-informed design | Cannot be automated — requires human judgment about content framing | Manual — review by subject-matter experts |
| HTTPS and deployment headers | CI doesn't deploy | Manual — check after deploy |

## Manual QA checklist

Before public release, manually verify:

- [ ] Every page has a unique `<title>` (check browser tab on each route)
- [ ] Canonical URLs are correct (view source, check `<link rel="canonical">`)
- [ ] OG metadata renders on Facebook Sharing Debugger and Twitter Card Validator
- [ ] `robots.txt` is `Disallow: /` during beta (or `Allow: /` for production)
- [ ] Keyboard Tab order is logical on every page
- [ ] Focus rings are visible on every interactive element
- [ ] No horizontal overflow at 375px viewport width
- [ ] All internal links use React Router navigation (no full-page reload)
- [ ] All external links have `rel="noopener noreferrer"`
- [ ] Reduced-motion setting disables scroll-triggered reveals
- [ ] Images have alt text or are marked `aria-hidden`

---

## Data Quality Dashboards (M4.4-03)

The Data Quality Dashboard at `/admin/data-quality` provides aggregate visibility into
pipeline output quality. It complements the content validation rules (see §8 of
CURRENT-IMPLEMENTATION-STATE.md) by surfacing:

- **Confidence score distributions** across AI pipeline stages — low-confidence outputs
  may warrant human review priority
- **Contradiction rates** by content type and source type — helps identify source quality
  patterns and areas where the contradiction detector needs tuning
- **Duplicate rates** — monitors the duplicate detector's false positive and merge rates
- **Source coverage gaps** — identifies regions and source types with insufficient coverage,
  driving collector prioritization
- **Data freshness** — unified view of content staleness across all categories, using the
  same REVIEW_CADENCE thresholds from the content validation rules

### Relationship to content validation

The dashboard metrics and content validation rules serve different purposes:

- **Content validation** (Rule 17, `checkStaleReviews`): CI-time checks that flag specific
  records that need review. Deterministic pass/fail.
- **Quality dashboards**: Runtime aggregate views for operational monitoring. Shows trends
  and distributions, not individual record-level issues.

Both use the same freshness thresholds defined in `src/lib/content-validation/types.ts`.

---

## Collector Test Suite (M4.7-01)

The collector test suite provides comprehensive coverage for all source collectors:
court (ICJ, ICC), UN (OHCHR, OCHA), government (EU, Belgium), NGO (Amnesty, HRW,
Btselem, MSF, ICRC), and media (Journalism, Academic).

### Structure

```
src/lib/collectors/
├── __tests__/
│   ├── fixtures/                        # Standardized test fixtures per source type
│   │   ├── index.ts                     # Re-exports all fixture modules
│   │   ├── courtFixtures.ts             # Court: normal, empty, malformed, error, HTML, normalization variants
│   │   ├── unFixtures.ts                # UN: OHCHR/OCHA normal, RSS, normalization variants
│   │   ├── governmentFixtures.ts        # EU/BE: resolutions, legislation, vote tallies
│   │   ├── ngoFixtures.ts               # NGO: all 5 orgs, report types, methodology, legal refs
│   │   └── mediaFixtures.ts             # Media: journalism/academic, RSS, paywalled content
│   ├── allCollectors.test.ts            # Integration: all 13 collectors register and instantiate
│   ├── collectorValidation.test.ts      # Validation: CollectResult Zod schema, pipeline invariants
│   ├── BaseCollector.test.ts            # Base class: pipeline stages, fingerprinting, timeout
│   ├── CollectorRegistry.test.ts        # Registry: registration, instance caching, health tracking
│   ├── retry.test.ts                    # Retry: backoff, jitter, retryable status codes
│   └── rateLimiter.test.ts              # Rate limiter: concurrency, burst, domain isolation
├── courts/__tests/
│   ├── allCourts.test.ts                # Integration: ICJ + ICC pipeline, normalization, errors
│   ├── ICJCollector.test.ts             # Unit: ICJ-specific HTML parsing, document type detection
│   ├── ICCCollector.test.ts             # Unit: ICC-specific content handling
│   └── LegalNormalizer.test.ts          # Unit: court document normalization, validation
├── un/__tests__/
│   ├── allUN.test.ts                    # Integration: OHCHR + OCHA pipeline, RSS feeds
│   ├── OHCHRCollector.test.ts           # Unit: OHCHR-specific parsing
│   ├── OCHACollector.test.ts            # Unit: OCHA-specific RSS handling
│   └── UNNormalizer.test.ts             # Unit: UN document normalization, document symbols
├── eu/__tests__/
│   ├── allEU.test.ts                    # Integration: EU + Belgium pipeline, multilingual
│   ├── EUCollector.test.ts              # Unit: EU Parliament/Council parsing
│   ├── BelgiumCollector.test.ts         # Unit: Belgian parliamentary document parsing
│   └── GovernmentNormalizer.test.ts     # Unit: gov doc validation, vote tallies, adoption status
├── ngo/__tests__/
│   ├── allNGO.test.ts                   # Integration: all 5 NGOs pipeline, registration
│   ├── AmnestyCollector.test.ts         # Unit: Amnesty-specific HTML parsing
│   ├── HRWCollector.test.ts             # Unit: HRW-specific report handling
│   ├── BtselemCollector.test.ts         # Unit: Btselem-specific content
│   ├── MSFCollector.test.ts             # Unit: MSF field report parsing
│   ├── ICRCCollector.test.ts            # Unit: ICRC IHL statement handling
│   ├── NGONormalizer.test.ts            # Unit: NGO document validation, disclaimer enforcement
│   └── registry.test.ts                 # Unit: NGO-specific registry configuration
├── media/__tests__/
│   ├── allMedia.test.ts                 # Integration: journalism + academic pipeline
│   ├── JournalismCollector.test.ts      # Unit: RSS-based journalism feed parsing
│   ├── AcademicCollector.test.ts        # Unit: academic paper metadata extraction
│   └── MediaNormalizer.test.ts          # Unit: media doc normalization, content types
└── monitoring/__tests__/
    ├── HealthMonitor.test.ts            # Unit: collector health monitoring
    └── AlertSystem.test.ts              # Unit: alert generation and thresholds
```

### Fixture coverage

Each fixture module covers five response scenarios:

| Scenario | What it tests |
|---|---|
| **Normal** | Valid document with all fields populated — happy path |
| **Empty** | Document with empty/minimal fields — graceful degradation |
| **Malformed** | Missing required fields (URL, title, body) — validation rejection |
| **Error** | HTTP errors (404, 500, 429, timeout) — typed error handling |
| **Rate-limited** | 429 responses with retry-after headers — backoff behavior |

Normalization variant fixtures exercise: multilingual documents (EN, FR, NL),
missing dates, multi-region scope, diverse document types, and edge cases.

### Key test categories

| Category | What is verified |
|---|---|
| **Registration** | Every collector registers in CollectorRegistry, source type coverage |
| **Pipeline** | fetch → validate → normalize → deduplicate → store executes end-to-end |
| **Schema validation** | Every collect() output validates against Zod CollectResult schema |
| **Pipeline invariants** | itemsValidated ≤ itemsFetched, itemsStored ≤ itemsDeduplicated, etc. |
| **Error handling** | 404, 500, 429, network errors produce CollectResult with success: false |
| **Normalization** | Each normalizer tested with diverse input formats, field extraction verified |
| **Timestamp consistency** | startedAt ≤ completedAt, both valid ISO 8601 |
| **Run ID uniqueness** | Each collect() call produces a unique run ID |

### Guardrails

- **Never make actual network calls** — all tests use `vi.stubGlobal("fetch", ...)` mocks
- **Fixture data is synthetic** — no copyrighted content from real sources
- **Tests are deterministic** — no timing-dependent assertions, no real API calls
- **Coverage target** — 90%+ line coverage for collector code

### Running collector tests

```bash
# Run all collector tests
npx vitest run src/lib/collectors/

# Run a specific collector's tests
npx vitest run src/lib/collectors/courts/

# Run only the new integration tests
npx vitest run src/lib/collectors/__tests__/allCollectors.test.ts
npx vitest run src/lib/collectors/__tests__/collectorValidation.test.ts
```
