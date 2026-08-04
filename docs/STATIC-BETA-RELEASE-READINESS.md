# Public Static Beta — Release Readiness Report

**Date:** 2026-07-12  
**Branch:** `feature/landing-page`  
**Reviewer:** Automated QA pass via Claude Code  
**Scope:** Every active route, component, data record, security control, and CI job

---

## 1. Routes reviewed

| # | Route | Renders | Direct-refresh | Metadata | Notes |
|---|---|---|---|---|---|
| 1 | `/` | ✅ | ✅ (SPA fallback) | ✅ | Homepage — all sections present |
| 2 | `/methodology` | ✅ | ✅ | ✅ | 21 sections, active draft |
| 3 | `/contribute` | ✅ | ✅ | ✅ | Role categories + links |
| 4 | `/changelog` | ✅ | ✅ | ✅ | Timeline entries |
| 5 | `/attributions` | ✅ | ✅ | ✅ | Zero TODOs |
| 6 | `/corrections` | ✅ | ✅ | ✅ | Process + categories |
| 7 | `/privacy` | ✅ | ✅ | ✅ | Self-hosted font disclosure |
| 8 | `/accessibility` | ✅ | ✅ | ✅ | Commitment + limitations |
| 9 | `/disclaimer` | ✅ | ✅ | ✅ | Full legal disclaimer |
| 10 | `/gaza-dossier` | ✅ | ✅ | ✅ | Structural skeleton |
| 11 | `/legal-tracker` | ✅ | ✅ | ✅ | Case entries + legal labels |
| 12 | `/countries/belgium` | ✅ | ✅ | ✅ | 9 competency areas |
| 13 | `/institutions/european-union` | ✅ | ✅ | ✅ | 5 EU institutions |
| 14 | `/organizations` | ✅ | ✅ | ✅ | 13 orgs, 7 categories |
| 15 | `/take-action` | ✅ | ✅ | ✅ | 6 action templates |
| 16 | `/evidence` | ✅ | ✅ | ✅ | 10 records, working filters |
| 17 | `/press` | ✅ | ✅ | ✅ | 12 sections |
| 18 | `/404` | ✅ | ✅ | ✅ | `noindex,nofollow` |

**Total:** 18 routes — all render, all survive direct-refresh, all have unique metadata.

---

## 2. Automated checks

| Check | Result | Details |
|---|---|---|
| TypeScript (`tsc -b`) | ✅ Pass | 0 errors |
| ESLint (`eslint .`) | ✅ Pass | 0 errors, 17 warnings (all `no-non-null-assertion` — pre-existing test patterns + 2 source files) |
| Vitest (`vitest run`) | ✅ Pass | 11 files, 87 tests — 73 component/route/a11y + 14 data validation |
| Vite build (`vite build`) | ✅ Pass | 510 modules, 641 KB JS, 49 KB CSS, fonts self-hosted |
| Data validation | ✅ Pass | 0 errors across 8 collections (51 records) |
| Route metadata | ✅ Pass | All 18 routes have unique title, description, canonical, OG, robots |

---

## 3. Manual checks (code-level)

| Check | Status |
|---|---|
| No public TODOs | ✅ Zero matches in `src/` |
| No fake live data or metrics | ✅ No counters, stats, or "live" claims |
| No false partnership language | ✅ All "partner" mentions are disclaimers |
| No contradictory review/verification labels | ✅ Source quality ≠ editorial status maintained |
| Every factual preview has accurate source/review state | ✅ `reviewed` records have `lastReviewedAt` + `reviewedByRole`; `review_pending` records have honest placeholders |
| Internal links use React Router | ✅ Only `skip-to-content` uses `<a href="#">` — all other internal links are `<Link to>` |
| External links marked safe | ✅ All external links have `rel="noopener noreferrer"` via `ExternalLink` component |
| Images have correct alt/decorative treatment | ✅ Hero/StartingFocus images have descriptive alt text; decorative SVGs have `aria-hidden="true"` |
| Header mobile menu closes on navigation | ✅ `closeMenu` callback on mobile nav links |
| Preview indexing state is deliberate | ✅ `robots.txt`: `Disallow: /`, CSP meta: `noindex,nofollow`, documented in `docs/indexing-configuration.md` |

---

## 4. Issues fixed during QA

| Issue | Resolution |
|---|---|
| `GatewaySection` `disabledLabel` type error | Fixed — conditional access on `card` object |
| Unused imports (EvidenceLibraryPage, MethodologyPage, OrganizationsPage, PressPage) | Removed unused `i`, `CONTENT_STATUS_LABELS`, `organizationRecords`, `Reveal` |
| Data validation: 31 violations | All resolved — organizations now have `lastReviewedAt` + `reviewedByRole`; 2 action templates downgraded to `static_preview`; 1 evidence item downgraded to `review_pending` |
| routeMetadata unused `DEFAULT_OG_IMAGE` | Removed |

---

## 5. Known limitations

### Accessibility

| Item | Status | Notes |
|---|---|---|
| Axe automated tests | ✅ 4 pages pass | Methodology, Corrections, NotFound, Press |
| Screen-reader testing | ⬜ Not automated | Requires manual testing with VoiceOver/NVDA |
| Reduced-motion compliance | ✅ CSS + React | `prefers-reduced-motion` respected; Framer Motion mocked in tests |
| Color contrast on image overlays | ⬜ Manual only | Axe can't evaluate contrast on CSS background images |
| Mobile viewport (375px) | ⬜ Manual only | JSDOM doesn't render at specific viewports |
| Touch targets ≥ 44px | ✅ Button component | `min-h-[44px]` on all buttons |
| Heading hierarchy | ⬜ Manual review | Automated tests render pages but don't validate h1→h2→h3 sequence |
| Focus states visible | ✅ CSS | `focus-visible:ring-2` on all interactive elements |

### Security

| Item | Status | Notes |
|---|---|---|
| CSP (HTTP header) | ✅ `_headers` file | Honoured by Netlify, Cloudflare Pages |
| CSP (meta fallback) | ✅ `index.html` | Fallback for hosts without `_headers` support |
| HSTS | ✅ `_headers` file | `max-age=2yr; includeSubDomains; preload` |
| Frame-ancestors | ✅ `'none'` | Prevents clickjacking |
| Third-party requests | ✅ Zero | Fonts self-hosted, no analytics, no embeds |
| Dependabot | ✅ Configured | Weekly npm, monthly Actions |
| Secret scanning | ⬜ Not enabled | Enable in GitHub repo Settings |
| Branch protection | ⬜ Not enabled | Recommended — require PR + passing CI |
| Security email | ⬜ Not configured | Documented in `security.txt` and `SECURITY.md` |
| PGP key | ⬜ Not published | Optional — RFC 9116 §4 |

### Content / legal review

| Item | Status | Notes |
|---|---|---|
| Methodology | Active draft | Marked as "not externally reviewed" |
| Legal terminology | Honest labels | All records use controlled vocabulary from shared types |
| Country/institution content | Structural skeletons | Descriptive only — no policy positions published |
| Action templates | Draft only | Templates marked "Draft — not yet reviewed" |
| Organization listings | Contributor-reviewed | Verified against official websites; no formal second-reviewer process |
| Evidence records | Mixed | Court records reviewed; most others `review_pending` |
| Attributions | 1 complete, 1 pending | Hero image source URL not yet confirmed |

### Data coverage

| Collection | Records | Reviewed | Review Pending | Static Preview |
|---|---|---|---|---|
| Sources | 4 | N/A (sources are factual references) | N/A | N/A |
| Legal cases | 3 | 0 | 3 | 0 |
| Belgium sections | 9 | 0 | 7 | 2 |
| EU institutions | 5 | 0 | 4 | 1 |
| Organizations | 13 | 13 | 0 | 0 |
| Action templates | 6 | 0 | 0 | 6 |
| Evidence items | 10 | 2 | 6 | 2 |
| Attributions | 2 | 1 | 1 | 0 |

---

## 6. Indexing status

| Layer | Status |
|---|---|
| `robots.txt` | `Disallow: /` |
| `<meta name="robots">` (static fallback) | `noindex,nofollow` |
| `<meta name="robots">` (per-route, dynamic) | Inherits `DEFAULT_ROBOTS` = `noindex,nofollow` |
| 404 route | Hardcoded `noindex,nofollow` |

**Result:** No search engine can index any page. This is correct for the public static beta.

**To enable indexing:** Follow the procedure in `docs/indexing-configuration.md` (update `robots.txt`, change `DEFAULT_ROBOTS`, set `canonicalBase`).

---

## 7. Attribution status

| Asset | Status | Notes |
|---|---|---|
| Hero background (Gaza displacement) | `review_pending` | Author: Jaber Jehad Badwan, CC BY-SA 4.0. Exact Wikimedia Commons file URL not yet confirmed. |
| Starting Focus (Destruction of Gaza 1) | `complete` | Author: gloucester2gaza, CC BY-SA 2.0. Full attribution with source URL. |
| Logo and wordmark | Original work | CC BY-SA 4.0 |
| Grid pattern texture | Original work | CC BY-SA 4.0 |
| Typography | Self-hosted | IBM Plex Serif/Mono + Inter via `@fontsource` |

---

## 8. Issues that can be closed

None — this is the first comprehensive QA pass. No tracked issues existed prior.

## 9. Issues that must remain open

| Issue | Priority | Owner |
|---|---|---|
| Enable GitHub branch protection on `main` | Medium | Repo maintainer |
| Enable secret scanning with push protection | Medium | Repo maintainer |
| Enable private vulnerability reporting | Medium | Repo maintainer |
| Enforce 2FA for all collaborators | Medium | Repo maintainer |
| Configure security email + PGP key | Low | Repo maintainer |
| Generate PNG social preview image | Low | Design contributor |
| Confirm hero image Wikimedia Commons URL | Medium | Attribution reviewer |
| External accessibility audit (WCAG 2.2 AA) | Medium | Accessibility specialist |
| Formal second-reviewer process for organization listings | Low | Editorial reviewer |
| Legal review of methodology | Medium | Legal reviewer |
| Screen-reader manual testing | Medium | Accessibility reviewer |
| Mobile viewport manual testing | Low | QA reviewer |
| Color contrast review on image overlays | Low | Design reviewer |
| Heading hierarchy audit | Low | Accessibility reviewer |

---

## 10. Recommended next milestone

**Priority order for the next sprint:**

1. **Enable GitHub security controls** (branch protection, secret scanning, 2FA) — ~30 minutes, high impact.
2. **Generate PNG social preview** — ~15 minutes with image tools, improves link sharing on Facebook/Twitter/LinkedIn.
3. **Confirm hero image source URL** — research task, resolves the last `review_pending` attribution.
4. **Manual QA on real devices** — test mobile viewport, screen reader, keyboard navigation, and reduced motion on actual hardware.
5. **Begin code-splitting** — the JS bundle (641 KB) is large. Dynamic imports for heavy pages (EvidenceLibrary, Methodology, ActionHub) would improve initial load time.
6. **External methodology review** — before content expansion, the methodology should be reviewed by at least one person with IHL/human-rights expertise.

---

## 11. Release recommendation

### ✅ Ready for limited public static beta

The platform meets all criteria for a limited, clearly-labeled public static beta:

- **Every route renders.** 18 routes, all stable.
- **No security blockers.** CSP, HSTS, frame-ancestors, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy are configured. Fonts are self-hosted. Zero third-party requests.
- **No privacy issues.** No user data collection. No analytics. No tracking.
- **No fake functionality.** No "send" buttons, no live counters, no automated actions.
- **No misleading claims.** Every page is clearly labeled as static preview/draft/review_pending. Partner language is explicitly disclaimed.
- **Attributions are documented.** Both images have attribution records.
- **Indexing is off.** `robots.txt` + `<meta>` + per-route directive — triple-layered.
- **CI passes.** TypeScript, ESLint, tests, data validation, and build all green.
- **Corrections process exists.** `/corrections` page + GitHub Issues route.

**Recommended audience for the beta:** Trusted reviewers, contributors, researchers, and journalists who understand the static-preview nature of the content. Not yet recommended for general public distribution without context.

**Next gate:** The platform graduates from "limited public static beta" to "public beta v0.1" when the open issues in section 9 are resolved and at least one external reviewer has assessed the methodology.
