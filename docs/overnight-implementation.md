# Claude Code Overnight Sprint — Accountability Atlas Static Beta Shell

## Sprint name

**Sprint A/B — Landing Page Closure + Trust Pages**

## Goal

Turn the current Accountability Atlas landing page into the entrance to a real **Public Static Beta v0.1** shell.

The landing page is already strong. Do **not** redesign it from scratch. This sprint is about closing the landing-page scope, adding one gateway section, finalizing navigation/footer, and building the trust/policy pages that are safe to publish now.

## Current project context

This is an open-source civic accountability platform called **Accountability Atlas**.

It is being built as public civic infrastructure for:

- genocide allegations;
- mass atrocities;
- humanitarian harm;
- legal accountability;
- country/institution responsibility;
- lawful public pressure;
- civilian protection.

The first focus is **Gaza and the wider regional humanitarian crisis**.

The current stage is **Public Static Beta in progress**, not finished MVP.

Read and follow the repository documents before changing code:

- `PRD-v2.md`
- `README.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `CODE_OF_CONDUCT.md`
- `NOTICE.md`
- `docs/attributions.md` if it exists
- any launch/static-beta plan document in `docs/` if present

If file names differ, inspect the repo and use the closest equivalent.

---

# 1. Strict scope for this run

## Build now

Implement the following:

1. Close the landing-page scope.
2. Add an **Enter the Accountability System** gateway section.
3. Finalize product navigation and footer links.
4. Build `/methodology`.
5. Build `/attributions`.
6. Build `/corrections`.
7. Build `/privacy`.
8. Build `/accessibility`.
9. Build `/disclaimer`.
10. Add or improve 404 fallback if missing.
11. Ensure CTAs and nav links go to real routes.
12. Ensure production build passes.

## Do not build now

Do **not** add:

- database;
- backend;
- admin CMS;
- witness submissions;
- evidence upload;
- donation handling;
- newsletter signup;
- analytics unless already configured;
- live map;
- action tracking;
- user accounts;
- partner dashboard;
- real email sending;
- fake counters;
- fake source numbers;
- fake partnerships;
- current legal/humanitarian claims unless already sourced in repo docs;
- new heavy dependencies unless absolutely necessary.

This is a static-beta shell sprint, not the functional MVP.

---

# 2. Branch and workflow

If not already on a feature branch, create one:

```bash
git checkout main
git pull origin main
git checkout -b feature/static-beta-shell
```

If already on an active landing/static-beta branch, continue there.

Use small commits if possible:

```bash
git add .
git commit -m "Add static beta gateway and trust pages"
```

Do not force push. Do not delete existing project documents.

---

# 3. Required route map

Make sure these routes exist after the sprint:

```txt
/
 /methodology
 /attributions
 /corrections
 /privacy
 /accessibility
 /disclaimer
 /contribute
```

If `/contribute` already exists, improve only if needed.

If routing is handled with React Router, update `App.tsx`.

If the project uses a custom route system, follow the current style.

---

# 4. Landing-page closure

The homepage should remain visually aligned with the current strong design:

- image-led hero;
- strong Gaza/mass-atrocity framing;
- Starting Focus full-width image section;
- core modules;
- safety principles;
- strict boundaries;
- horizontal roadmap;
- contributor CTA;
- dark institutional footer.

Do not redesign the hero or Starting Focus unless required for obvious bugs.

## 4.1 Add beta status language

Somewhere near the top of the page, preferably after the hero or before the gateway section, include a small, calm status note:

```txt
Public Static Beta in progress

Accountability Atlas is currently being built as a static public beta. Preview pages are clearly labeled, methodology is public, corrections are welcome, and sensitive evidence submissions are not accepted at this stage.
```

This should not feel like an error banner.

Use existing `StatusNotice`, `Badge`, or similar components if available.

## 4.2 Add “Enter the Accountability System” section

Add a new section to the homepage.

Suggested placement:

- after `Core Modules`, or
- after `Roadmap`, whichever feels better in the current page flow.

Preferred: after `Core Modules`, because it helps visitors enter the site before they reach the lower sections.

### Section title

```txt
Enter the accountability system.
```

### Eyebrow

```txt
PUBLIC STATIC BETA
```

### Description

```txt
The next layer of Accountability Atlas turns the landing page into a navigable civic platform: methodology, dossiers, legal tracking, country accountability, lawful action tools, and public resource directories.
```

### Gateway cards

Create six linked cards.

#### Card 1

Title:

```txt
Explore the Gaza Dossier
```

Description:

```txt
Understand the planned structure for humanitarian context, legal processes, documented harm categories, policy priorities, and action routes.
```

Link:

```txt
/gaza-dossier
```

If `/gaza-dossier` is not built in this sprint, link may remain disabled only if clearly marked “Coming in next sprint.” Preferred: do not add this link yet unless the route exists. For this sprint, if route does not exist, use `#` and label as “Next sprint preview” only if unavoidable.

#### Card 2

Title:

```txt
Read the Methodology
```

Description:

```txt
See how sources, verification levels, legal labels, corrections, and publication safeguards will work.
```

Link:

```txt
/methodology
```

#### Card 3

Title:

```txt
Track Legal Accountability
```

Description:

```txt
A preview pathway for court proceedings, UN findings, legal status labels, and accountability milestones.
```

Link:

```txt
/legal-tracker
```

If `/legal-tracker` is not built in this sprint, either do not include the card yet or mark it as “Next sprint.”

#### Card 4

Title:

```txt
Use Lawful Action Routes
```

Description:

```txt
Future templates will help citizens contact representatives, institutions, journalists, and civic bodies without harassment or unsafe claims.
```

Link:

```txt
/take-action
```

If not built this sprint, mark as “Next sprint.”

#### Card 5

Title:

```txt
Browse Public Resources
```

Description:

```txt
Humanitarian, legal, documentation, research, and press-freedom organizations will be listed responsibly without implying partnership.
```

Link:

```txt
/organizations
```

If not built this sprint, mark as “Next sprint.”

#### Card 6

Title:

```txt
Help Build the Platform
```

Description:

```txt
Developers, designers, researchers, writers, translators, legal reviewers, and security reviewers can start with small, safe contributions.
```

Link:

```txt
/contribute
```

### Important

If some future routes are not created in this sprint, the cards should not lead to dead pages.

Use one of these approaches:

1. Only include cards for routes that exist now.
2. Include disabled “Next sprint” cards.
3. Create simple useful preview routes if low effort.

Do not create dead links.

### Visual design

Use the existing card system.

Cards should feel:

- institutional;
- source/evidence inspired;
- not SaaS-gimmicky;
- calm but clickable.

Use subtle Framer Motion reveal if the existing page already uses `Reveal.tsx`.

---

# 5. Final navigation

Update the header navigation so it is product-oriented, not only contributor-oriented.

Recommended desktop nav for this sprint:

```txt
Methodology
Contribute
GitHub
```

If the gateway routes exist, use:

```txt
Methodology
Corrections
Contribute
GitHub
```

Do not overcrowd the header yet.

If there is a mobile menu, make sure:

- it closes when a link is clicked;
- it uses `aria-expanded`;
- it uses `aria-controls`;
- it is keyboard accessible;
- links are large enough to tap.

Later product nav will include Gaza Dossier, Legal Tracker, Countries, and Take Action. Do not add them yet unless those pages exist.

---

# 6. Footer links

Expand the footer into a real trust footer.

Required footer groups:

## Project

- Methodology → `/methodology`
- Contribute → `/contribute`
- Corrections → `/corrections`

## Resources

- Attributions → `/attributions`
- Privacy → `/privacy`
- Accessibility → `/accessibility`
- Disclaimer → `/disclaimer`
- Security → link to `SECURITY.md` on GitHub if no route exists

## External

- GitHub repository
- Contribution guide if external link available

Footer language should include:

```txt
Accountability Atlas is an independent open-source civic accountability project. It is not a registered NGO, charity, court, humanitarian organization, or formal partner of listed organizations unless explicitly stated.
```

Also include:

```txt
The project does not provide legal advice. It does not promote violence, harassment, hatred, doxing, or collective blame.
```

Make footer text readable, not tiny.

---

# 7. Shared page components

Create or reuse these if useful:

```txt
src/components/pages/PageIntro.tsx
src/components/pages/PageStatusNotice.tsx
src/components/pages/PolicySection.tsx
src/components/pages/LastUpdated.tsx
src/components/ui/ExternalLink.tsx
src/components/ui/LinkCard.tsx
```

Do not overengineer. If existing components already do this, reuse them.

## PageStatusNotice

Useful props:

```ts
type PageStatusNoticeProps = {
  label?: string;
  title?: string;
  children: React.ReactNode;
};
```

Common labels:

- Public Static Beta
- Active draft
- Static preview
- Correction welcome
- No sensitive submissions

## ExternalLink

Should:

- open external links safely;
- include `rel="noreferrer noopener"`;
- indicate external destination visually or with accessible label.

---

# 8. Build `/methodology`

Route:

```txt
/methodology
```

Page status:

```txt
Active draft
```

## Goal

Make the platform trustworthy before the evidence database exists.

## Required page intro

Title:

```txt
How Accountability Atlas works with evidence.
```

Description:

```txt
The methodology explains how the platform separates sources, leads, allegations, legal findings, humanitarian reporting, advocacy language, and reviewed public evidence.
```

## Required sections

### 1. Mission and scope

Copy:

```txt
Accountability Atlas is being built to organize verified public evidence, legal and humanitarian sources, country accountability information, and lawful action pathways.

The platform begins with Gaza and the wider regional humanitarian crisis. The structure is intended to become reusable for other mass-atrocity and humanitarian-crisis contexts after local, legal, and security review.
```

### 2. Source hierarchy

Display as cards or table.

Use these tiers:

1. Court records and official legal filings
2. UN documents and official humanitarian updates
3. ICRC / Red Cross / Red Crescent and major humanitarian organizations
4. Established human-rights organizations
5. Investigative journalism and OSINT groups
6. Academic research
7. Public social media leads, only as leads until verified

### 3. Verification levels

Use the PRD levels:

```txt
Level 0 — Unreviewed lead
Level 1 — Preserved lead
Level 2 — Source checked
Level 3 — Corroborated
Level 4 — Trusted organization verified
Level 5 — Legal/institutional record
```

Important note:

```txt
Social media is never automatically treated as verified proof. It may help discover events, preserve leads, or guide further research, but publication requires context, corroboration, and safety review.
```

### 4. Legal terminology policy

Include:

```txt
The platform distinguishes between allegations, investigations, NGO determinations, UN findings, court filings, provisional measures, warrants, rulings, and final judgments.
```

Use labels:

```txt
Court proceeding active
Provisional measures issued
Arrest warrant issued
Allegation under investigation
NGO legal determination
UN finding
Not yet judicially determined
Contested claim
Requires further verification
```

### 5. Genocide terminology policy

Copy:

```txt
The word genocide may be used when attributed to legal proceedings, court filings, UN or NGO findings, or named expert/legal determinations. The platform must not imply a final judicial determination where one has not occurred.
```

### 6. Protection before publication

Include:

```txt
The platform will not publish private personal details, sensitive witness material, exact dangerous locations, or content that exposes vulnerable people without review.
```

### 7. Corrections

Link to `/corrections`.

Copy:

```txt
Corrections are part of the trust model. If a page is inaccurate, outdated, unsafe, mistranslated, or misleading, users should be able to report it.
```

### 8. What is not active yet

List:

- no witness submissions;
- no evidence uploads;
- no live map;
- no country scoring;
- no public user accounts;
- no direct fundraising;
- no automated email sending.

---

# 9. Build `/attributions`

Route:

```txt
/attributions
```

Page status:

```txt
Active
```

## Goal

Document image/source licensing and keep the project compliant.

## Required intro

Title:

```txt
Attributions and image credits.
```

Description:

```txt
Accountability Atlas uses open-licensed or permission-cleared visual materials only when they support public understanding without sensationalism. This page records image credits, licenses, modifications, and where materials are used.
```

## Required content

Include every current image used on the site.

At minimum, if these assets exist:

### Hero image

Fields:

- Title
- Author
- Source
- Source URL
- License
- License URL
- Where used: Hero section
- Modifications: cropped, compressed, overlay applied, converted if applicable
- Date added

### Starting Focus image

Fields:

- Title: Destruction of Gaza 1.jpg
- Author: gloucester2gaza
- Source: Flickr / Wikimedia Commons
- Source URL: `https://commons.wikimedia.org/wiki/File:Destruction_of_Gaza_1.jpg`
- License: CC BY-SA 2.0
- License URL: `https://creativecommons.org/licenses/by-sa/2.0/`
- Where used: Starting Focus section
- Modifications: cropped, compressed, dark overlay applied in UI if applicable
- Date added: use current project date or leave as TODO if unknown

If the hero image source is known in repo docs, include it. If unknown, add TODO:

```txt
TODO: Confirm source, author, license, and attribution for the hero image before public beta release.
```

Also include:

```txt
If an attribution is incomplete or inaccurate, please submit a correction through the correction process.
```

---

# 10. Build `/corrections`

Route:

```txt
/corrections
```

Page status:

```txt
Static process
```

## Goal

Explain how corrections work before a backend form exists.

## Required intro

Title:

```txt
Corrections are part of the trust model.
```

Description:

```txt
Accountability Atlas welcomes corrections when information is inaccurate, outdated, unsafe, mistranslated, misleading, or missing important context.
```

## Correction categories

- factual error;
- outdated source;
- wrong location/date;
- unsafe personal information;
- mistranslation;
- legal wording issue;
- broken link;
- duplicate item;
- misleading framing;
- attribution or license issue.

## Static-beta process

Explain:

```txt
During the public static beta, corrections can be submitted through GitHub issues or the public project contact route. Do not submit sensitive witness information, private personal data, or confidential material through public GitHub issues.
```

If no public contact email exists yet, say:

```txt
A dedicated correction email will be added before wider public release.
```

## Include

- what to include in correction request;
- what not to include;
- expected review limitations;
- major corrections will later be logged publicly.

---

# 11. Build `/privacy`

Route:

```txt
/privacy
```

Page status:

```txt
Public static beta policy
```

## Required intro

Title:

```txt
Privacy in the public static beta.
```

Description:

```txt
The current version of Accountability Atlas is designed to avoid collecting sensitive personal data.
```

## Required sections

### What we do not collect at this stage

- no user accounts;
- no witness submissions;
- no evidence uploads;
- no political-profile data;
- no email message content;
- no representative response data;
- no donation/payment data.

### What may exist technically

- hosting logs;
- GitHub contribution records;
- browser requests to external links;
- privacy-first analytics only if explicitly configured.

If analytics are not configured, say:

```txt
At this stage, the project does not use analytics.
```

If uncertain, use:

```txt
Analytics configuration must be confirmed before public static beta release.
```

### External links

Explain:

```txt
External websites have their own privacy policies.
```

### Future changes

Explain:

```txt
If corrections, analytics, backend records, or contact forms are introduced later, this policy must be updated before those features launch.
```

---

# 12. Build `/accessibility`

Route:

```txt
/accessibility
```

Page status:

```txt
Accessibility commitment
```

## Required intro

Title:

```txt
Accessibility commitment.
```

Description:

```txt
Accountability Atlas aims to be usable by people with different devices, abilities, languages, bandwidth constraints, and motion preferences.
```

## Required sections

- WCAG 2.2 AA target;
- keyboard navigation;
- visible focus states;
- readable typography;
- color contrast;
- alt text for meaningful images;
- reduced motion support;
- mobile responsiveness;
- low-graphic and trauma-informed design direction later;
- known limitations;
- how to report accessibility problems.

Add:

```txt
The project is still in static beta. Accessibility issues should be reported through GitHub issues or the project correction route.
```

---

# 13. Build `/disclaimer`

Route:

```txt
/disclaimer
```

Page status:

```txt
Public disclaimer draft
```

## Required intro

Title:

```txt
Public disclaimer.
```

## Required copy

```txt
Accountability Atlas is an independent open-source civic documentation and accountability project. It is currently in public static beta and is not a registered NGO, charity, court, humanitarian organization, legal authority, or formal partner of any listed organization unless explicitly stated.

The platform does not provide legal advice. It does not replace courts, journalists, humanitarian organizations, legal professionals, or affected communities.

The project does not promote violence, hatred, harassment, doxing, antisemitism, Islamophobia, racism, or collective blame. Its purpose is to organize verified public evidence, support lawful civic action, amplify humanitarian needs, and strengthen accountability under international law.

Public pages may include static previews, draft structures, and source-linked summaries. Corrections are welcome.
```

## Required sections

- independent project status;
- no legal advice;
- no partnership implied;
- external links;
- no sensitive submissions;
- corrections welcome;
- lawful use only.

---

# 14. Build or improve 404 page

If the app has no 404 route, add one.

Title:

```txt
Page not found.
```

Body:

```txt
This page may not exist yet, or it may have moved as the public static beta is being built.
```

Links:

- Home
- Methodology
- Contribute
- GitHub

Keep tone calm and institutional.

---

# 15. Styling requirements for all new pages

All new pages should share the current brand:

- warm paper background;
- deep ink text;
- IBM Plex Serif headings;
- Inter body;
- IBM Plex Mono labels;
- quiet borders;
- document-card elements;
- generous spacing;
- dark footer;
- subtle grid texture where already used;
- Framer Motion only through existing `Reveal.tsx` if available.

Do not make policy pages look like raw Markdown dumps.

Use:

- page intro;
- status note;
- sections;
- cards/tables where useful;
- readable line lengths;
- mobile-first layout;
- clear hierarchy.

---

# 16. Accessibility requirements

For all new pages:

- semantic `<main>`;
- one clear `<h1>`;
- logical heading order;
- keyboard navigable;
- visible focus states;
- external links labelled;
- color contrast suitable;
- no hover-only content;
- reduced motion respected;
- mobile no horizontal overflow.

---

# 17. Build and QA commands

After implementation, run:

```bash
npm run build
```

Also run any available checks if present:

```bash
npm run lint
npm run typecheck
```

If scripts do not exist, do not invent tooling. Report what exists.

Check:

- all routes load;
- direct refresh works on routes;
- nav links work;
- footer links work;
- CTAs work;
- mobile layout works;
- console has no major errors.

If Vite + React Router needs SPA redirects for Netlify, ensure:

```txt
public/_redirects
```

contains:

```txt
/* /index.html 200
```

Only add this if Netlify/Vite SPA routing needs it and it does not already exist.

---

# 18. Final deliverable summary

At the end, report:

1. files created;
2. files modified;
3. routes added;
4. checks run;
5. any failing checks;
6. any TODOs;
7. any attribution gaps;
8. any recommendations for the next sprint.

Do not hide failures.

---

# 19. Success criteria

This run is successful when:

- homepage has an “Enter the Accountability System” gateway section;
- navigation/footer are updated;
- `/methodology` exists and is useful;
- `/attributions` exists and includes current image credits or TODOs;
- `/corrections` exists;
- `/privacy` exists;
- `/accessibility` exists;
- `/disclaimer` exists;
- no page is a dead placeholder;
- no sensitive forms are added;
- no fake partnership or fake live data is added;
- all CTAs point to real pages or are clearly marked next sprint;
- build passes;
- the site can be safely shown to a trusted reviewer.

---

# 20. Next sprint after this run

Do not implement these unless the current sprint is complete and clean.

Next sprint will build:

- `/gaza-dossier`
- `/legal-tracker`
- `/countries/belgium`
- `/institutions/european-union`
- `/organizations`
- `/take-action`
- `/evidence`
- `/press`

Those pages belong to the next product-preview sprint.