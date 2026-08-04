# Accountability Atlas — Current Build, Static-Beta & Launch Plan

**Document type:** Implementation and release plan  
**PRD alignment:** Accountability Atlas PRD v2.1  
**Current stage:** Landing page nearing completion; public static beta in progress  
**Recommended release label:** `Public Static Beta v0.1`  
**Primary objective:** Turn the current landing page into the entrance to a credible, navigable, reviewable platform shell without prematurely adding risky backend features.

---

## 1. Executive Decision

Accountability Atlas should **not** be presented as a finished MVP yet.

The correct next milestone is:

> **Public Static Beta v0.1 — a real, navigable preview of the platform with useful content, explicit status labels, public methodology, source discipline, and no sensitive or high-risk workflows.**

The current landing page is strong enough to become the foundation of that beta. It should receive one final product-oriented pass, but it should not consume endless additional design cycles.

The next work should focus on building the pages that demonstrate the actual system:

- methodology;
- Gaza dossier;
- legal tracker;
- Belgium and EU accountability pages;
- organization directory;
- action hub;
- evidence library;
- press/resources;
- contribution guidance;
- attributions and public policies.

The public static beta should prove:

1. the mission is understandable;
2. the information architecture works;
3. the methodology is credible;
4. the platform can distinguish evidence, legal status, and advocacy;
5. country and institutional responsibility can be displayed clearly;
6. lawful action can be made easier;
7. contributors and reviewers understand how to help;
8. high-risk functionality is deliberately postponed.

---

## 2. Where the Project Stands Now

### Completed or substantially established

- repository and documentation foundation;
- PRD v2.1;
- governance, contribution, security, and licensing documents;
- outreach plan;
- project board and issue structure;
- final project name;
- brand principles;
- visual identity direction;
- image-led landing-page design;
- clear Gaza starting focus;
- strong public language around genocide allegations, mass atrocities, civilian harm, legal accountability, and lawful action;
- safety principles and strict boundaries;
- contributor CTA;
- public roadmap;
- initial methodology and contribute routes;
- open-source license model.

### Current weakness

The website still primarily explains **what will be built**.

It does not yet fully allow a visitor to **enter the platform** and explore:

- a dossier;
- a legal case;
- a country page;
- an organization directory;
- an action route;
- an evidence item;
- a source methodology.

That is the next product gap to close.

---

## 3. Recommended Release Model

Use four clear product states.

### Stage A — Development Preview

**Audience:** Founder, close collaborators, design/technical reviewers  
**Status:** Current or nearly complete  
**Indexing:** Prefer `noindex`  
**Purpose:** Design, content, and route validation

Requirements:

- landing page runs;
- responsive layout exists;
- routes may still be incomplete;
- content can be marked draft;
- links do not need public promotion.

### Stage B — Public Static Beta v0.1

**Audience:** Contributors, researchers, journalists willing to review, civic-tech people, legal/human-rights reviewers, trusted community contacts  
**Recommended next milestone**

Requirements:

- all core static routes exist;
- no dead placeholder pages;
- methodology and attributions are public;
- preview content is useful and clearly labeled;
- every material claim is sourced or marked draft;
- no sensitive forms or data collection;
- project status and limitations are visible;
- accessibility and mobile checks pass;
- privacy, disclaimer, corrections, and security routes exist;
- build and lint/type checks pass.

This is publicly shareable, but should be described as a beta and not a finished evidence platform.

### Stage C — Reviewed Public Beta v0.5

**Audience:** Wider civil society, journalists, academics, policy staff, community groups  
**Purpose:** Publish a limited amount of reviewed, source-linked content

Requirements:

- legal/humanitarian content has expert or documented editorial review;
- first Gaza dossier contains real reviewed sources;
- first legal tracker entries are complete;
- Belgium and EU pages contain verified public information;
- organization directory entries have been manually checked;
- action templates have been reviewed;
- correction channel is active;
- content versioning and last-reviewed dates are visible.

Still no witness vault, public submissions, live map, or direct money handling.

### Stage D — Functional MVP Beta

**Audience:** General public and institutional users  
**Purpose:** Operate a real curated platform

Adds:

- database-backed content;
- admin-only authentication;
- editorial workflow;
- correction submission and moderation;
- structured content versioning;
- privacy-first analytics;
- basic dossier export;
- security headers, backups, audit logs, and access controls.

---

## 4. Should the Landing Page Be Pushed Further?

Yes, but only through a **final product-navigation pass**, not another full visual redesign.

### Keep

- image-led hero;
- left-aligned hero copy;
- Gaza starting-focus section;
- evidence-led editorial tone;
- core modules;
- safety principles;
- strict boundaries;
- horizontal roadmap;
- contributor section;
- dark institutional footer;
- subtle Framer Motion reveals.

### Add before static-beta release

#### 4.1 Platform-entry section

Add a section after the core modules or roadmap:

## Enter the Accountability System

Use four to six linked cards:

1. **Explore the Gaza Dossier**  
   Understand the humanitarian context, legal processes, documented harm categories, and action priorities.

2. **Track Legal Accountability**  
   Follow court proceedings, warrants, UN findings, national cases, and procedural milestones.

3. **Examine Country Responsibility**  
   Start with Belgium and the European Union: public positions, votes, aid, arms-transfer questions, and pressure routes.

4. **Use Lawful Action Tools**  
   Find sourced, non-harassing templates for contacting representatives, institutions, journalists, and civic bodies.

5. **Browse Public Resources**  
   Find humanitarian, legal, documentation, research, and press-freedom organizations without implying partnership.

6. **Read the Methodology**  
   Understand source hierarchy, verification labels, legal terminology, corrections, and publication safeguards.

These cards must link to real routes.

#### 4.2 Beta-status strip

Add a small but visible status message:

> **Public Static Beta** — The platform structure is under active development. Preview pages are labeled clearly; factual content is source-linked or marked for review. Sensitive evidence submissions are not accepted.

Do not make it an alarming banner.

#### 4.3 Final navigation

Once the routes exist, replace the contributor-only navigation with product navigation.

Recommended desktop navigation:

- Gaza Dossier
- Legal Tracker
- Countries
- Take Action
- Methodology
- More

`More` may contain:

- Evidence
- Organizations
- Press & Resources
- Contribute
- Attributions

Recommended mobile navigation:

- Home
- Gaza
- Legal
- Act
- Menu

#### 4.4 Footer completion

Add:

- Methodology
- Gaza Dossier
- Legal Tracker
- Belgium
- European Union
- Organizations
- Take Action
- Evidence
- Press
- Contribute
- Corrections
- Privacy
- Accessibility
- Security
- Attributions
- GitHub

#### 4.5 Last-updated and versioning language

The homepage may show:

```text
Public Static Beta v0.1
Last updated: YYYY-MM-DD
```

Do not fake update dates; derive them manually or from release metadata.

### Do not add to the homepage yet

- live casualty counters;
- unreviewed “latest updates”;
- visitor counters;
- fake source totals;
- donation widgets;
- petition totals;
- partner logos;
- action counters;
- live maps;
- autoplay footage;
- graphic media.

---

## 5. Pages We Can Build and Publish Now

## 5.1 Methodology

**Route:** `/methodology`  
**Release status:** Can be active in Public Static Beta  
**Priority:** Highest

### Purpose

Demonstrate how the platform separates:

- primary records;
- institutional and humanitarian reporting;
- NGO findings;
- investigative journalism;
- academic research;
- OSINT;
- social-media leads;
- verified evidence;
- allegations;
- legal findings.

### Required sections

1. Mission and scope
2. Source hierarchy
3. Verification levels
4. Legal status labels
5. Genocide terminology policy
6. What qualifies as evidence
7. What remains a lead
8. Corrections and disputes
9. Protection-before-publication rules
10. Anti-doxing policy
11. AI-use policy
12. Citation guidance
13. Current limitations
14. Reviewer/contributor request

### UI opportunities

- source hierarchy diagram;
- verification-level scale;
- legal-label examples;
- publication workflow;
- correction timeline;
- red-line policy panel.

### Launch condition

This page should be useful even before any evidence library exists.

---

## 5.2 Attributions

**Route:** `/attributions`  
**Release status:** Active  
**Priority:** Highest

### Required content

For every image:

- title;
- author;
- source;
- source URL;
- license;
- license URL;
- where used;
- modifications;
- date added.

Also link to:

- repository `docs/attributions.md`;
- relevant Creative Commons license;
- contact route for attribution corrections.

---

## 5.3 Contribute

**Route:** `/contribute`  
**Release status:** Active  
**Priority:** Highest

### Required content

- project status;
- current contributor needs;
- available role groups;
- best first issues;
- contribution guide;
- code of conduct;
- security policy;
- methodology review requests;
- warning not to submit sensitive evidence;
- authority/representation rule;
- public communication rule.

### Conversion goal

A visitor should know exactly how to make one small, safe contribution.

---

## 5.4 Gaza Dossier Preview

**Route:** `/gaza-dossier`  
**Release status:** Static preview first; reviewed content later  
**Priority:** High

### What can be published now

- purpose of the dossier;
- planned information structure;
- legal-status categories;
- humanitarian topic categories;
- source categories;
- policy-ask categories;
- action-route structure;
- methodology links;
- preview cards;
- explicit draft labels.

### Suggested structure

1. Page introduction
2. Beta-status notice
3. Scope and limitations
4. Humanitarian situation framework
5. Legal accountability framework
6. Documented-harm categories
7. Key institutions
8. Policy priorities
9. Lawful action pathways
10. Planned source register
11. Corrections/reviewer request

### What not to publish casually

- current casualty numbers without date/source;
- definitive legal conclusions without attribution;
- incident lists copied from social media;
- names/locations creating safety risks;
- unreviewed claims;
- fake “live” data.

---

## 5.5 Legal Tracker Preview

**Route:** `/legal-tracker`  
**Release status:** Static preview; limited reviewed entries may follow  
**Priority:** High

### What can be built now

- tracker layout;
- filters by institution/status;
- legal-status badges;
- case-card component;
- timeline component;
- source-document list;
- case-detail template;
- procedural explanation.

### Initial categories

- ICJ proceedings;
- ICC proceedings and warrants;
- UN Commission of Inquiry findings;
- national legal actions;
- arms-export litigation;
- sanctions or restrictive-measure processes;
- parliamentary inquiries.

### Static preview requirements

Each case card must distinguish:

- allegation;
- application/filing;
- investigation;
- provisional measure;
- warrant;
- judgment/ruling;
- NGO determination;
- UN finding;
- current procedural status.

### Initial release approach

Publish only a very small number of primary-source-backed entries after checking dates and wording.

---

## 5.6 Belgium Accountability Page

**Route:** `/countries/belgium`  
**Release status:** Static skeleton, then reviewed beta page  
**Priority:** High

### Static structure

1. Scope and page status
2. Current federal position
3. UN voting record
4. EU role
5. Arms-transfer/export questions
6. Humanitarian aid
7. ICC/ICJ cooperation
8. Federal and regional competencies
9. Representatives and official contact routes
10. Action-template previews
11. Sources and corrections
12. Dossier preview

### Important rule

Do not publish an accountability score during the static beta.

A score requires:

- completed scoring methodology;
- source standards;
- weighting rationale;
- update policy;
- dispute/correction process;
- expert review.

---

## 5.7 European Union Institution Page

**Route:** `/institutions/european-union`  
**Release status:** Static skeleton, then reviewed beta page  
**Priority:** High

### Static structure

1. Scope and competencies
2. European Council
3. European Commission
4. European Parliament
5. External Action Service
6. Association Agreement area
7. Humanitarian and diplomatic measures
8. Sanctions/restrictive-measure mechanisms
9. Arms-export competency explanation
10. MEP contact route
11. European Parliament petition route
12. Policy asks
13. Sources and corrections

Do not make the EU appear to have powers it does not possess. Competency explanations are essential.

---

## 5.8 Organization Directory Preview

**Route:** `/organizations`  
**Release status:** Safe to launch with manually checked public-resource listings  
**Priority:** Medium-high

### Categories

- UN and humanitarian;
- Red Cross/Red Crescent;
- medical;
- legal and human rights;
- documentation/data;
- journalism/press freedom;
- academic/research;
- civil-society groups later.

### Entry fields

- name;
- type;
- region;
- short factual description;
- official website;
- official donation page, where relevant;
- services;
- status: `Public resource`;
- last reviewed date;
- correction/removal route.

### Required disclaimer

> Listing does not imply partnership, endorsement, approval, or affiliation.

### Restrictions

- no logos without permission;
- no private contact data;
- no scraped staff details;
- no “partner” label without written confirmation;
- no embedded donation processing.

---

## 5.9 Action Hub Preview

**Route:** `/take-action`  
**Release status:** Can launch as static guidance/templates  
**Priority:** Medium-high

### Initial actions

- contact a representative;
- contact a foreign ministry;
- ask for arms-transfer review;
- support humanitarian access;
- send a source-linked brief to a journalist;
- submit a correction;
- volunteer to the project;
- visit official humanitarian donation pages.

### Static-beta interaction model

- read template;
- copy text;
- open official contact page;
- use `mailto:` only where appropriate;
- no automated sending;
- no user accounts;
- no identity storage;
- no political-profile tracking.

### Each action page should include

- purpose;
- audience;
- source basis;
- safe wording;
- action steps;
- what not to do;
- related dossier or country page.

---

## 5.10 Evidence Library Preview

**Route:** `/evidence`  
**Release status:** Structural preview; curated source summaries only  
**Priority:** Medium

### Build now

- list/card design;
- source-type filters;
- verification badges;
- evidence-item page template;
- source list;
- last-reviewed date;
- correction link;
- citation controls;
- methodology link.

### Initial content approach

Start with source summaries such as:

- court record;
- official UN document;
- official humanitarian update;
- human-rights report;
- parliamentary document;
- verified investigative report.

Avoid incident-level user-generated material in this stage.

---

## 5.11 Press & Resources

**Route:** `/press`  
**Release status:** Can launch  
**Priority:** Medium

### Include

- project summary;
- founder/project status;
- 60-second pitch;
- methodology links;
- brand usage guidance;
- public contact route;
- source-citation guidance;
- quote policy;
- beta limitations;
- logo files later;
- press briefing later.

Do not describe the founder as representing affected communities or organizations.

---

## 5.12 Corrections

**Route:** `/corrections`  
**Release status:** Can launch without backend  
**Priority:** High

### Static-beta version

Use a clear process and an email or GitHub issue route.

Explain:

- what may be corrected;
- what details to provide;
- what not to submit;
- expected response limitations;
- major corrections will later be logged publicly;
- sensitive personal information must not be sent through public GitHub issues.

A backend correction form belongs to the functional MVP.

---

## 5.13 Privacy

**Route:** `/privacy`  
**Release status:** Required before public beta  
**Priority:** High

### Static-beta privacy position

The site should state:

- no public accounts;
- no witness submissions;
- no sensitive evidence collection;
- no ad pixels;
- no Meta/Google tracking;
- what hosting logs may exist;
- whether analytics are used;
- external-link behavior;
- contact route for privacy questions.

If there is no analytics, say so.

---

## 5.14 Accessibility

**Route:** `/accessibility`  
**Release status:** Recommended before public beta  
**Priority:** Medium-high

Include:

- WCAG 2.2 AA target;
- keyboard support;
- reduced motion;
- image alt text;
- contrast;
- responsive behavior;
- known limitations;
- contact route for accessibility problems.

---

## 5.15 Disclaimer / Terms of Use

**Route:** `/disclaimer` or `/terms`  
**Release status:** Recommended before wider public sharing  
**Priority:** Medium-high

State:

- independent open-source project;
- not a court, NGO, charity, legal adviser, or official authority;
- no implied partnerships;
- informational/advocacy purpose;
- no legal advice;
- content may be updated/corrected;
- external organizations control their own websites/donation pages;
- prohibited misuse.

Obtain legal review before treating this as final legal language.

---

## 5.16 404 / Route Error Page

**Route:** fallback  
**Release status:** Required  
**Priority:** Medium

Provide:

- calm explanation;
- home link;
- methodology link;
- GitHub link;
- no generic framework error screen.

---

## 6. Homepage Gateway Evolution

After the static pages exist, the homepage should evolve into three layers.

### Layer 1 — Mission

- Hero
- Why this exists
- Gaza starting focus

### Layer 2 — System

- Core modules
- Enter the Accountability System
- Methodology trust block
- Selected static previews

### Layer 3 — Participation

- Roadmap
- Contributor roles
- Review request
- Footer/policies

### Selected preview blocks for homepage

Add only when the pages have useful content:

- two legal case previews;
- Belgium/EU accountability preview;
- three organization categories;
- three action pathways;
- evidence-methodology example.

Do not use “latest verified updates” until there is an editorial update process.

---

## 7. Static Data Architecture to Build Now

Use local TypeScript data with types that can later map cleanly to database records.

```text
src/data/
  navigation.ts
  roadmap.ts
  sources.ts
  legalCases.ts
  organizations.ts
  countries.ts
  institutions.ts
  actionTemplates.ts
  evidenceItems.ts
  dossierSections.ts
  attributions.ts
```

### Common record metadata

Every public record should support:

```ts
type ContentStatus =
  | "draft"
  | "static_preview"
  | "review_pending"
  | "reviewed"
  | "disputed"
  | "corrected"
  | "archived";

interface ReviewMetadata {
  status: ContentStatus;
  lastReviewedAt?: string;
  reviewedBy?: string;
  methodologyUrl?: string;
  sourceCount?: number;
  correctionUrl?: string;
}
```

Do not show a source count unless it is real.

### Source record

```ts
interface SourceRecord {
  id: string;
  title: string;
  publisher: string;
  sourceType:
    | "court"
    | "un"
    | "government"
    | "humanitarian"
    | "ngo"
    | "academic"
    | "journalism"
    | "osint";
  url: string;
  publicationDate?: string;
  accessedAt: string;
  archiveUrl?: string;
  language?: string;
  notes?: string;
}
```

### Page-status component

Create a reusable component:

```text
PageStatusNotice
```

It should display:

- static preview / reviewed / draft;
- what is active now;
- what is not active;
- last updated date;
- methodology link;
- correction link.

---

## 8. Cross-Site Components to Build Now

```text
PageShell
PageIntro
PageStatusNotice
Breadcrumbs
LastUpdated
SourceLink
SourceList
CitationNote
VerificationBadge
LegalStatusBadge
OrganizationStatusBadge
EmptyState
PreviewNotice
CorrectionLink
ExternalLink
ContentWarning
ResponsiveDataTable
MobileFilterDrawer
```

### Required behaviors

- keyboard accessible;
- visible focus rings;
- screen-reader labels;
- no content hidden only on hover;
- reduced-motion support;
- mobile-first layouts;
- external-link indication;
- safe wrapping of long URLs/titles.

---

## 9. Content-State Language

Use consistent labels across the site.

### Approved labels

- Public Static Beta
- Static preview
- Draft structure
- Review pending
- Source pending
- Reviewed
- Corrected
- Disputed
- Archived
- Public resource
- No partnership implied
- Feature not active
- Backend not connected
- Correction welcome

### Avoid

- Verified, unless the defined verification standard is met;
- Official, unless it is an official source or relationship;
- Partner, without written confirmation;
- Live, when data is not live;
- Complete;
- Final;
- Comprehensive;
- Definitive.

---

## 10. Sprint Plan From This Point

## Sprint A — Landing Page Closure & Site Shell

**Length:** 3–5 focused development days

### Deliverables

- final desktop/mobile homepage pass;
- platform-entry gateway section;
- beta-status language;
- final product navigation;
- footer expansion;
- global `PageShell`;
- global route layout;
- 404 page;
- responsive and accessibility checks;
- image optimization;
- attributions link;
- production build test.

### Definition of done

- no dead homepage links;
- all CTA destinations exist;
- image licensing is documented;
- hero and starting-focus images perform well;
- navigation works by keyboard and mobile;
- build/lint/type checks pass.

---

## Sprint B — Trust & Public Policies

**Length:** 5–7 focused development days

### Deliverables

- methodology;
- attributions;
- contribute;
- corrections;
- privacy;
- accessibility;
- disclaimer;
- press/resources foundation;
- shared status/source components.

### Definition of done

- public trust pages are useful;
- project limitations are explicit;
- no placeholder-only route;
- no sensitive data collection;
- policy links appear in footer;
- external links are safe and labeled.

---

## Sprint C — Accountability Product Previews

**Length:** 7–12 focused development days

### Deliverables

- Gaza dossier preview;
- legal tracker preview;
- Belgium skeleton;
- EU skeleton;
- organizations preview;
- action hub preview;
- evidence library preview;
- static data models.

### Definition of done

- each route explains its future function;
- each route contains useful static content;
- no fake metrics/data;
- all legal and verification labels are consistent;
- scores remain disabled;
- source and correction routes are visible.

---

## Sprint D — Reviewed Seed Content

**Length:** Content-dependent; likely 1–3 weeks

### Deliverables

- first primary-source legal entries;
- first reviewed source summaries;
- checked organization entries;
- Belgium/EU sourced sections;
- reviewed action templates;
- content versioning;
- last-reviewed dates;
- reviewer notes stored privately.

### Definition of done

- source/date/legal/safety/language checks completed;
- review status is visible;
- corrections are possible;
- no unverified claim is presented as fact;
- content can be shown to trusted external reviewers.

---

## Sprint E — Public Static Beta Release

**Length:** 3–5 days

### Deliverables

- trusted reviewer feedback incorporated;
- final QA;
- SEO metadata;
- social preview;
- sitemap/robots settings;
- privacy/security checks;
- release notes;
- version label `v0.1`;
- deployment;
- limited outreach.

### Definition of done

- static-beta acceptance criteria pass;
- public disclaimer visible;
- attributions complete;
- all routes work;
- no test content;
- no broken links;
- no unsafe claims;
- no unnecessary tracking.

---

## 11. Pre-MVP Launch Gate

Use this gate before calling the site “Public Static Beta.”

### Mission and clarity

- [ ] Project purpose is understood in under 10 seconds.
- [ ] Gaza is clearly identified as the starting focus.
- [ ] The future platform modules are concrete.
- [ ] The site avoids generic civic-tech language.
- [ ] Moral clarity is preserved without collective blame.

### Routes

- [ ] Methodology is useful.
- [ ] Attributions are complete.
- [ ] Contribute is actionable.
- [ ] Gaza dossier preview exists.
- [ ] Legal tracker preview exists.
- [ ] Belgium page exists.
- [ ] EU page exists.
- [ ] Organizations exists.
- [ ] Take Action exists.
- [ ] Evidence exists.
- [ ] Press/resources exists.
- [ ] Corrections exists.
- [ ] Privacy exists.
- [ ] Accessibility exists.
- [ ] Disclaimer exists.
- [ ] 404 exists.

### Content integrity

- [ ] Claims are sourced or marked draft.
- [ ] Dates are visible where material.
- [ ] Legal statuses are precise.
- [ ] No false partnerships.
- [ ] No unsafe personal information.
- [ ] No exact sensitive locations.
- [ ] No unreviewed social-media claim is presented as evidence.
- [ ] Every preview has a methodology or contribution path.

### UX/accessibility

- [ ] Keyboard navigation works.
- [ ] Mobile menu works and closes correctly.
- [ ] Focus states are visible.
- [ ] Reduced motion works.
- [ ] Images have correct alt text.
- [ ] Contrast passes.
- [ ] Tables work on mobile.
- [ ] No horizontal overflow.
- [ ] Headings are hierarchical.

### Technical

- [ ] Production build passes.
- [ ] Type checking passes.
- [ ] Lint passes.
- [ ] No console errors.
- [ ] No exposed secrets.
- [ ] Security headers configured where possible.
- [ ] `security.txt` exists.
- [ ] Image assets are optimized.
- [ ] Hero image does not destroy LCP.
- [ ] Routes work on direct refresh.
- [ ] 404 and error behavior work.

### Legal/licensing

- [ ] Images are licensed and attributed.
- [ ] License modifications are recorded.
- [ ] Disclaimer is visible.
- [ ] No third-party logos used without permission.
- [ ] External donation links go to official organizations.
- [ ] Public status does not imply NGO/legal authority.

---

## 12. What Is Near-MVP and What Is Not

### Near-MVP work

These activities move directly toward the functional MVP:

- methodology;
- structured static records;
- page schemas;
- legal status model;
- source model;
- country/institution page structures;
- organization relationship labels;
- action-template model;
- correction workflow design;
- reusable UI components;
- content versioning;
- editorial review gates;
- security/privacy documentation.

### Not near-MVP yet

These features create disproportionate risk or complexity:

- witness/testimony intake;
- user-uploaded media;
- public incident submission;
- live maps;
- exact-location databases;
- social scraping;
- individual target pages;
- direct fundraising;
- public comments;
- public accounts;
- gamification;
- AI-generated public legal summaries;
- auto-translated testimony;
- real-time dashboards;
- partner admin portals.

---

## 13. When to Start the Backend

Begin backend implementation only after:

1. static page schemas are stable;
2. content types are proven through real static examples;
3. verification and legal labels are accepted;
4. methodology is publicly coherent;
5. review workflow is documented;
6. correction requirements are clear;
7. privacy/security risks are reviewed;
8. trusted reviewers have provided feedback.

### First backend scope

When ready, implement only:

- admin authentication;
- sources;
- legal cases;
- organizations;
- countries/institutions;
- action templates;
- evidence/source summaries;
- corrections;
- audit trail.

Do not begin with witness submissions.

---

## 14. Recommended Public Messaging

### Current development preview

> Accountability Atlas is currently being built as an open-source civic accountability platform. The public static beta is under development.

### Static-beta launch

> Accountability Atlas is now available as a public static beta. The beta presents the platform’s methodology, information architecture, Gaza starting focus, legal and country-accountability structures, public-resource directory, and lawful action pathways. Preview pages are clearly labeled, corrections are welcome, and sensitive evidence submissions are not accepted.

### What not to claim

Do not claim that the static beta:

- is a complete evidence archive;
- provides live data;
- represents victims or affected communities;
- has NGO or UN partnerships;
- has legally verified every public claim;
- is a replacement for courts, journalists, or humanitarian organizations;
- accepts secure witness material;
- can itself stop atrocities.

---

## 15. Immediate Priority Order

1. Close landing-page scope.
2. Build platform-entry gateway.
3. Finalize site navigation and footer.
4. Build Methodology.
5. Build Attributions.
6. Build Corrections, Privacy, Accessibility, and Disclaimer.
7. Upgrade Contribute.
8. Build Gaza Dossier preview.
9. Build Legal Tracker preview.
10. Build Belgium page.
11. Build EU page.
12. Build Organization Directory.
13. Build Action Hub.
14. Build Evidence Library preview.
15. Build Press & Resources.
16. Populate reviewed static seed content.
17. Request trusted review.
18. Release Public Static Beta v0.1.
19. Plan functional backend.
20. Begin functional MVP only after review.

---

## 16. Final Recommendation

Do not market the current website as a finished MVP.

Do not stay trapped in landing-page polishing either.

The correct path is:

```text
Strong landing page
        ↓
Trust and policy pages
        ↓
Static product previews
        ↓
Reviewed seed content
        ↓
Public Static Beta v0.1
        ↓
Trusted review
        ↓
Functional MVP
```

The public static beta is not a compromise. It is a deliberate risk-reduction stage.

It gives Accountability Atlas:

- a real public identity;
- a navigable platform shell;
- concrete contribution opportunities;
- a credible methodology;
- page structures that can be reviewed;
- proof that the project is more than a landing page;
- time to obtain legal, security, editorial, and community feedback before sensitive functionality exists.

The landing page is now strong enough to stop being the main project.

The next milestone is to make the rest of Accountability Atlas visible.
