# Launch Checklist — Public Launch Preparation

**Status:** Pre-launch gate  
**Milestone:** M7-06 (final task of M7 — Functional Beta)  
**Last reviewed:** 2026-08-04

This checklist gates the transition from public static beta to a broadly
shared public launch. Every item maps to an acceptance criterion from
Milestone 7 (`.superpowers/sdd/m7-functional-beta-plan.md`). Each item must
be verified with a named owner and a date before sign-off.

---

## 1. M7-01 — System Integration

- [ ] Integration test passes end-to-end: `source fetch → normalize → AI pipeline → review queue → review → publish → public API → search → map display` (`src/__tests__/integration/fullSystem.test.ts`)
- [ ] Data flow verification script passes for every pipeline stage (`scripts/verify-data-flow.sh`)
- [ ] Cross-system sync confirmed: collector framework ↔ backend, AI pipeline → review queue, reviewed content → public API
- [ ] Identity management: auth users appear in RBAC, roles propagate to API permissions
- [ ] Content lifecycle connected: create (admin CMS) → review (review queue) → publish → correct (correction workflow) → version (version management)
- [ ] Map integration: database spatial queries feed map layers with safety enforcement
- [ ] Search integration: published content indexed and searchable via the search API
- [ ] Full test suite green (see §9)

## 2. M7-02 — Content Population and Review

- [ ] 50+ evidence items across all categories, each with source references, verification level, review metadata
- [ ] 10+ country/institution pages with position records, voting data, arms-transfer data, aid data, contact routes
- [ ] 10+ legal tracker entries across ICJ, ICC, UN COI, national courts, sanctions
- [ ] 30+ organization entries across all categories with relationship labels
- [ ] 20+ action templates in EN, with NL and FR translations for Belgium/EU templates
- [ ] 5+ dossiers: Gaza accountability (one-page + five-page), Belgium action brief, EU action brief, Humanitarian access brief
- [ ] All content `contentStatus: "reviewed"` with documented reviewer roles, dates, source references
- [ ] Content validation passes with 0 errors (`npm run validate:content`)
- [ ] Source diversity: mix of court, UN, government, humanitarian, NGO, journalism, academic, OSINT sources

## 3. M7-03 — Security Hardening

- [ ] CSP audited — all resources match allowed sources (`public/_headers`, `index.html`)
- [ ] Security headers verified: HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors
- [ ] Rate limiting enforced at API gateway (public / admin / auth tiers)
- [ ] 2FA enforced for all non-public roles with no opt-out
- [ ] Session security: HTTP-only, Secure, SameSite=Strict, refresh-token rotation, 1-hour timeout
- [ ] Input validation via Zod + PostgREST + CHECK constraints
- [ ] `npm audit` passes with 0 critical (2 high reviewed as mitigated — see `docs/security-review-report.md`)
- [ ] Security scanning workflow active in CI (gitleaks + `npm audit` + header audit)
- [ ] `.well-known/security.txt` contact current
- [ ] Pre-launch: OWASP ZAP baseline scan against staging deployment (requires deployed environment)
- [ ] Pre-launch: manual penetration test (requires deployed environment + security engineer)

## 4. M7-04 — Performance Optimization

- [ ] Route-level code splitting in place (`src/App.tsx` lazy imports)
- [ ] Bundle size within budget (179.85 kB gz, target < 300 kB — `scripts/bundle-analysis.sh`)
- [ ] CDN cache headers configured (`public/_headers`: immutable assets, 5-min API cache)
- [ ] k6 load test config committed (`scripts/load-test.yaml`)
- [ ] Load test executed against staging and results reviewed (no latency/SLA regression)

## 5. M7-05 — Beta User Onboarding

- [ ] Beta user guide published (`docs/beta-user-guide.md`)
- [ ] Feedback process documented (`docs/beta-feedback-process.md`)
- [ ] Beta welcome page live at `/beta/welcome` (auth-protected)
- [ ] Quick start guide live at `/beta/quick-start`
- [ ] Feedback form live at `/beta/feedback` (auth-protected, rate-limited)
- [ ] Bug report form live at `/beta/bug-report` (auth-protected, rate-limited)
- [ ] Feedback submission API contract wired (`src/lib/beta/feedback.ts`)

## 6. M7-06 — Public Launch Preparation

- [ ] Launch checklist published (this document) and signed off
- [ ] Monitoring configured: uptime, error tracking/error budgets, performance, traffic (`docs/monitoring-alerting.md`)
- [ ] Alerting configured: on-call rotation, channels (email, SMS, Slack), severity levels, escalation paths (`docs/monitoring-alerting.md`)
- [ ] Incident response plan published (`docs/incident-response-plan.md`) with legal counsel contact
- [ ] Communication plan published (`docs/communication-plan.md`) with spokesperson designation and backlash statements
- [ ] Press kit published (`docs/press-kit.md`) — no false partnership claims
- [ ] Social preview PNG generated at 1200×630 (`public/social-preview.png`)
- [ ] iOS/touch icon generated at 180×180 (`public/apple-touch-icon.png`)
- [ ] Indexing enabled for public content (see §7)

## 7. Indexing and SEO

- [ ] `src/data/routeMetadata.ts` — `DEFAULT_ROBOTS = "index,follow"`; admin/beta/404 keep `noindex,nofollow`
- [ ] `public/robots.txt` — `Allow: /`, `Disallow: /admin/`, `Disallow: /beta/`
- [ ] `index.html` — static `<meta name="robots" content="index,follow">`
- [ ] `index.html` — `<meta property="og:image" content="/social-preview.png">` (PNG, not SVG)
- [ ] Every public page has a unique title, meta description, canonical URL, OG tags (`src/data/routeMetadata.ts` — audited in `docs/STATIC-BETA-RELEASE-READINESS.md`)
- [ ] Structured data present in `index.html` (Organization + WebSite JSON-LD)
- [ ] **Production domain confirmed** and pinned at runtime:
  - [ ] Call `setCanonicalBase("https://[production-domain]")` in the app bootstrap (`src/main.tsx`)
  - [ ] Verify canonical URLs use the production domain
- [ ] **Sitemap** generated and submitted (Google Search Console + Bing Webmaster Tools)
- [ ] `<meta name="robots">` verified per route after deployment (public = `index,follow`, admin/beta = `noindex,nofollow`)

## 8. Operational Readiness

- [ ] Monitoring dashboards accessible to the on-call engineer
- [ ] On-call rotation roster current and each member has runbook access
- [ ] Alert channels configured (email list, SMS, Slack) and test alert sent
- [ ] Incident response contacts (including legal counsel) confirmed and reachable
- [ ] Spokesperson authorized in writing; all public statements routed through them
- [ ] Backlash / crisis statements reviewed and approved (see `docs/communication-plan.md`)
- [ ] Press contact mailbox monitored by an authorized person
- [ ] Privacy posture confirmed: monitoring and analytics collect no personal data (see `docs/privacy-principles.md`)
- [ ] Backup/recovery procedure tested (`docs/backup-recovery.md`)
- [ ] Emergency unpublish procedure reviewed by an editor (`docs/emergency-unpublish-policy.md`)

## 9. Test and Build Gate

- [ ] Full Vitest suite passes: **1608 tests across 173 test files** (exit 0)
- [ ] `npx tsc -b` passes for all modified files (known pre-existing errors documented in M7-02…M7-05 reports)
- [ ] `npx eslint` clean on all modified files
- [ ] `npm run build` succeeds and bundle is within budget
- [ ] `npm run validate:content` passes with 0 errors

## 10. Sign-off

| Role | Name | Date | Status |
|---|---|---|---|
| Engineering lead |  |  |  |
| Security contact |  |  |  |
| Editorial lead |  |  |  |
| Spokesperson |  |  |  |
| Legal counsel |  |  |  |
| Release manager |  |  |  |

**Launch go/no-go:** All items above must be checked before a broad public
announcement. A limited beta may proceed while items marked *pre-launch
(requires deployed environment)* remain open.

---

## Related documents

- `.superpowers/sdd/m7-functional-beta-plan.md` — milestone definition and acceptance criteria
- `docs/monitoring-alerting.md` — monitoring and alerting configuration
- `docs/incident-response-plan.md` — incident response plan
- `docs/communication-plan.md` — launch communication plan
- `docs/press-kit.md` — press kit
- `docs/indexing-configuration.md` — indexing procedure
- `docs/security-review-report.md` — M7-03 security findings
- `docs/STATIC-BETA-RELEASE-READINESS.md` — earlier QA gate
