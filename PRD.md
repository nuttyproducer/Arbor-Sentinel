# Accountability Atlas — Product Requirements Document (PRD)

**Project type:** Human-rights civic technology platform  
**Version:** 2.1 — Public Static Beta Update  
**Date:** 2026-07-10  
**Primary launch focus:** Gaza and the wider occupied Palestinian territory, with careful coverage of Lebanon and surrounding humanitarian spillover where verified  
**Expansion model:** Modular atrocity-accountability framework for other documented mass-atrocity and humanitarian-crisis contexts  
**Current implementation stage:** Public static beta in progress  
**Current build focus:** Landing-page completion, methodology, attributions, Gaza dossier preview, legal tracker preview, Belgium/EU accountability page skeletons, organization directory preview, action hub preview, evidence library preview, and press/resources preview  
**Current technical mode:** Static-first React/Vite implementation using structured local TypeScript data before backend/database integration  
**Working status:** Builder-ready strategic PRD; legal, security, editorial, accessibility, and partner review are still required before broad public launch  
**Code license:** AGPL-3.0-or-later  
**Documentation license:** CC BY-SA 4.0, subject to the exclusions and third-party-material rules in `NOTICE.md`

---

## Changelog — v2.1

This version integrates the lessons from the first design and implementation cycle.

Major updates:

- establishes a **Public Static Beta** as a formal phase before the functional MVP;
- confirms the current stack as **React + Vite + TypeScript + Tailwind CSS + restrained Framer Motion**;
- replaces generic civic-tech language with clear, careful framing around genocide allegations, mass atrocities, humanitarian harm, Gaza, legal accountability, and lawful public pressure;
- adds a complete static-beta route map and page-by-page requirements;
- introduces a **no dead placeholder pages** rule;
- introduces a **static data-first** development strategy;
- adds review gates before factual publication;
- adds image licensing, attribution, and documentary-image policies;
- updates homepage, hero, Starting Focus, roadmap, motion, and navigation requirements to match the implemented design direction;
- separates static-beta acceptance criteria from functional-MVP acceptance criteria;
- replaces the former single first sprint with a multi-sprint delivery plan;
- makes contributor and expert-reviewer recruitment an explicit static-beta objective;
- delays backend, admin CMS, public submissions, maps, donations, PDF generation, and other sensitive functionality until the static beta has been reviewed.

---

## 0. Project Identity and Current Status

### 0.1 Final name

**Accountability Atlas**

The name is calm, global, memorable, and suitable for evidence, maps, policy, law, civic action, and future expansion beyond one crisis.

### 0.2 Public tagline

**Evidence for protection. Action for accountability.**

### 0.3 Institutional descriptor

**Verified evidence. Lawful pressure. Civilian protection.**

The public tagline carries the human and civic message. The institutional descriptor is useful in policy briefs, repository descriptions, press materials, and formal outreach.

### 0.4 Product category

An independent, open-source civic documentation and accountability platform.

### 0.5 Current status statement

> Accountability Atlas is an early-stage open-source civic-technology initiative. It is currently being developed as a public static beta and is not yet a registered NGO, charity, court, humanitarian organization, or formal legal entity. Organizations and institutions referenced by the project are public sources or public resources unless a verified partnership is explicitly confirmed in writing.

### 0.6 Current visual identity

- **Brand direction:** 70% institutional archive, 30% civic action platform
- **Tone:** calm, morally clear, evidence-led, human, legally careful, nonviolent
- **Primary colors:** Deep Ink Navy, Warm Paper, Bone White
- **Accents:** Signal Amber, Muted Clay, Trust Blue
- **Headings:** IBM Plex Serif
- **Body:** Inter
- **Metadata:** IBM Plex Mono
- **Logo concept:** globe/grid, protective open circle, illuminated coordinate point
- **Motion:** restrained Framer Motion reveals; CSS for hover and focus states
- **Image direction:** contextual documentary imagery, never gore or spectacle

---

## 1. Executive Summary

**Accountability Atlas** is a multilingual, security-aware, evidence-led civic platform being built to organize verified public evidence, document alleged atrocity crimes and humanitarian harm, track legal and political responsibility, and help citizens, journalists, researchers, civil society, and policymakers take lawful action for civilian protection, humanitarian access, arms-transfer review, and legal accountability.

The platform begins with Gaza and the wider regional humanitarian crisis. It is designed to become a reusable framework for other documented mass-atrocity and humanitarian-crisis contexts, but expansion must never be a copy-paste exercise: every context requires local expertise, legal review, and region-specific safety decisions.

This is **not** a petition website, news outlet, revenge platform, donation intermediary, or unfiltered evidence dump. It is civic accountability infrastructure organized around five long-term product pillars:

1. **Evidence Library** — a curated archive of legal, humanitarian, investigative, academic, governmental, journalistic, and safely reviewed open-source evidence.
2. **Accountability Index** — transparent country and institution pages that track policy, votes, arms-transfer positions, humanitarian action, legal cooperation, and public pressure routes.
3. **Action Hub** — jurisdiction-specific, sourced, polite, firm, lawful action templates and public-pressure routes.
4. **Policy Dossier Generator** — exportable one-page, five-page, and full briefings for MPs, MEPs, journalists, universities, local councils, researchers, and NGOs.
5. **Coalition & Aid Directory** — a carefully maintained public directory of humanitarian, legal, documentation, journalism, academic, and civil-society organizations, with partnership status shown only after written confirmation.

The public product must combine moral clarity with precise legal language. Its position is against atrocity crimes, starvation, unlawful attacks, forced displacement, collective punishment, impunity, censorship, and obstruction of humanitarian aid. It does not promote hatred toward any people, religion, ethnicity, or civilian population.

### 1.1 What We Know Now

Early design and implementation work clarified several strategic lessons:

- The platform must be visually and verbally specific about genocide allegations, mass atrocities, humanitarian obstruction, legal accountability, country responsibility, and lawful pressure.
- Overly generic civic-tech language weakens the project and makes the future product impossible to understand.
- The public product must preserve moral clarity while distinguishing allegations, legal proceedings, findings, rulings, warrants, NGO determinations, and verified humanitarian facts.
- Gaza is the first focus and must be named clearly.
- Contextual documentary imagery helps the site feel concrete and human, but it requires careful licensing, attribution, cropping, alt text, and non-sensational treatment.
- The landing page is the public entry point, not the entire product.
- The next major work is methodology, preview routes, static data structures, content review, and trusted feedback.
- The project should validate its information architecture before introducing databases, admin systems, public submissions, or automation.

### 1.2 Current Build Reality — Static Public Beta First

Accountability Atlas is being built as a **public static beta** before the full functional MVP.

The static beta exists to make the project understandable, navigable, reviewable, and useful before introducing backend complexity, public databases, admin systems, witness submissions, maps, automated dossiers, or user accounts.

This stage is not “just a landing page.” It is the first visible layer of the platform and includes:

- a mission-clear landing page;
- methodology and source-policy content;
- an attributions/image-credits page;
- a Gaza dossier preview;
- a legal tracker preview;
- Belgium and EU accountability page skeletons;
- an organization directory preview;
- an action hub preview;
- an evidence library preview;
- a press/resources preview;
- a contribution page;
- intentional navigation among all of these routes.

The static beta must communicate:

1. what Accountability Atlas is;
2. why Gaza is the first focus;
3. how evidence will be classified and reviewed;
4. how legal and political responsibility will be tracked;
5. how citizens can act lawfully;
6. how contributors and reviewers can help;
7. what is deliberately not built yet;
8. why the project is careful, transparent, and non-reckless.

Local TypeScript data files will be used first. Backend, database, and admin workflows come later.

---

## 2. Problem Statement

### 2.1 The human problem

Civilian populations in Gaza and other conflict zones face death, injury, displacement, destruction of homes and infrastructure, collapse of healthcare, loss of journalists and medical workers, food insecurity, obstruction of aid, detention, and long-term trauma.

Large amounts of relevant material exist, but it is fragmented across:

- UN and humanitarian reports;
- court documents and legal filings;
- NGO investigations and legal analysis;
- parliamentary records and voting databases;
- arms-transfer reports and export-license disclosures;
- investigative journalism;
- academic research;
- satellite and OSINT analysis;
- public statements;
- social media and local documentation that may disappear.

Fragmentation makes evidence difficult to understand, compare, preserve, cite, and convert into responsible public pressure.

### 2.2 The civic problem

People want to act, but often do not know:

- what is verified and what remains alleged;
- which source types carry which evidentiary weight;
- what their government or institution has done;
- which legal processes are active;
- who to contact;
- what to demand;
- how to cite reliable sources;
- how to avoid spreading misinformation;
- where to find official humanitarian resources;
- how to support accountability without harassment or incitement.

### 2.3 The institutional problem

Policymakers, journalists, NGOs, researchers, and lawyers need concise, dated, sourced, jurisdiction-specific information. Public campaigns often provide urgency and slogans but not always the structured evidence, legal distinctions, versioning, corrections, and specific policy asks required for institutional use.

### 2.4 The platform solution

Accountability Atlas turns dispersed public information into structured civic infrastructure:

- source-graded evidence;
- transparent verification methodology;
- legal status tracking;
- country and institution accountability pages;
- lawful action templates;
- policy dossiers;
- humanitarian and civil-society resource directories;
- public correction mechanisms;
- security-aware future submission pathways;
- reusable architecture for other crises.

### 2.5 Theory of change

The platform’s theory of change is:

> Better-organized, transparently sourced, legally careful information makes it easier for citizens, journalists, researchers, organizations, and policymakers to apply sustained, lawful, evidence-based pressure for civilian protection and accountability.

The platform cannot itself stop atrocities, replace courts, or represent affected communities. It can reduce fragmentation, improve civic understanding, strengthen public records, and make credible action easier.

---

## 3. Non-Negotiable Principles

### 3.1 Civilian protection first

The platform exists to support civilian protection and lawful accountability. It does not promote violence, revenge, harassment, intimidation, or collective blame.

### 3.2 Evidence before emotion

Emotion may motivate the project, but public content must speak the language of evidence, law, journalism, parliaments, research, and humanitarian response.

### 3.3 Moral clarity without dehumanization

The platform may clearly oppose atrocity crimes, starvation, forced displacement, collective punishment, attacks on civilians, obstruction of aid, and impunity. It must not dehumanize populations or treat national, ethnic, or religious identity as guilt.

### 3.4 No hatred, incitement, antisemitism, Islamophobia, or racism

The platform must distinguish between:

- a state and its people;
- a government and a population;
- political or military leadership and civilians;
- legal accountability and revenge;
- criticism of Israeli state policy or Zionism and hatred of Jewish people;
- criticism of armed groups and hatred of Palestinians, Arabs, or Muslims.

### 3.5 No doxing

Never publish private addresses, private phone numbers, family details, private accounts of non-public individuals, targeting lists, or data that enables harassment.

Permitted when relevant and sourced:

- public officials;
- official institutions;
- public voting records;
- official roles;
- public court and sanctions records;
- documented public corporate and arms-transfer information.

Prohibited:

- private soldiers’ home details;
- revenge lists;
- family members as pressure targets;
- non-consensual personal data;
- calls for physical confrontation;
- “find this person” workflows.

### 3.6 Legal accountability, not vigilante justice

Action flows must direct users toward lawful pressure such as contacting representatives, ministries, MEPs/MPs, arms-export authorities, universities, councils, journalists, or official humanitarian organizations.

### 3.7 Source transparency

Every factual claim must be traceable to a public source or clearly labeled as draft, pending review, disputed, or unverified.

### 3.8 Safety by design

Witnesses, affected communities, contributors, moderators, partners, and users must be protected from unnecessary collection, exposure, retention, and operational risk.

### 3.9 Protection before publication

The fact that information is available does not automatically mean it is safe or ethical to republish.

### 3.10 Do not pretend partnership

Organizations are “public resources” until they provide written approval for another relationship label.

### 3.11 Corrections strengthen trust

Corrections, status changes, source upgrades, source downgrades, disputes, and removals must be part of the product model.

---

## 4. Legal and Factual Framing

### 4.1 Public language standard

Recommended framing:

> Accountability Atlas documents alleged atrocity crimes, humanitarian harm, obstruction of aid, attacks affecting civilians and civilian infrastructure, and failures of international response. It supports lawful pressure for ceasefire, humanitarian access, arms-transfer review, civilian protection, transparency, and legal accountability.

Avoid official platform language such as:

- “fight back against Israel”;
- “destroy Israel”;
- “hunt down”;
- “enemy list”;
- “traitor list”;
- “punish supporters”;
- collective accusations against Israelis, Jews, Palestinians, Arabs, Muslims, or any other population.

### 4.2 Genocide terminology policy

The word **genocide** may be used only with precise attribution and procedural context.

Acceptable patterns:

- “[Named state] brought a Genocide Convention case before the ICJ.”
- “The ICJ issued provisional measures in the case.”
- “[Named organization] concluded in its dated report that…”
- “The legal question remains before the court.”
- “This is an NGO legal determination, not a final court judgment.”

Avoid:

- claiming that a court has issued a final genocide judgment when it has not;
- treating all members of a population as guilty;
- collapsing allegations, provisional measures, warrants, findings, and convictions into one status.

All examples involving current cases, dates, office-holders, warrants, votes, policies, or humanitarian conditions must be rechecked against primary sources before publication.

### 4.3 Legal status labels

Approved labels include:

- Court proceeding active
- Provisional measures issued
- Arrest warrant issued
- Allegation under investigation
- NGO legal determination
- UN finding
- National court action
- Parliamentary inquiry
- Not yet judicially determined
- Contested claim
- Requires further verification
- Superseded
- Corrected
- Withdrawn

### 4.4 Separation of content types

The product must visibly distinguish:

- verified factual summaries;
- legal procedural status;
- legal analysis;
- humanitarian situation reporting;
- advocacy and policy asks;
- allegations;
- disputed claims;
- unreviewed leads;
- editorial explanation.

### 4.5 Right of reply and corrections

Serious claims about institutions, companies, or public officials should include a correction or response route without granting the subject editorial control.

---

## 5. Target Audiences

### 5.1 Long-term primary users

1. **Concerned citizens** — need clear facts, context, and lawful actions.
2. **Activists and community organizers** — need sourced templates, dossiers, event and campaign resources, and country-specific information.
3. **Journalists and researchers** — need source trails, timelines, datasets, methodology, versioning, and concise briefings.
4. **Policymakers and staffers** — need dated, jurisdiction-specific briefs with specific asks and citations.
5. **NGOs and humanitarian organizations** — need responsible visibility, safe referral traffic, corrections, and possible future collaboration.
6. **Legal workers and human-rights defenders** — need structured records, legal status, source preservation, and review workflows.

### 5.2 Secondary users

- students and university groups;
- diaspora organizations;
- faith communities;
- local councils and city campaigners;
- social-media creators;
- translators;
- data-visualization volunteers;
- accessibility reviewers;
- open-source contributors.

### 5.3 Current Static Beta Audience

The static beta is not yet optimized for mass public traffic. Its primary audience is:

- developers;
- designers;
- researchers;
- legal and human-rights reviewers;
- OSINT and source-verification reviewers;
- writers and translators;
- security and privacy reviewers;
- accessibility specialists;
- journalists willing to give product feedback;
- civic-tech contributors;
- trusted advisors.

The static beta must make it obvious how someone can help:

- review methodology;
- improve source policy;
- check legal wording;
- design data structures;
- build page components;
- create static page templates;
- review image licensing and attribution;
- translate public materials;
- test mobile and accessibility;
- turn large roadmap items into focused issues.

### 5.4 Audience priority by phase

| Phase | Primary audience |
|---|---|
| Static beta | Contributors, reviewers, advisors, selected journalists and civic-tech peers |
| Functional MVP beta | Citizens, organizers, journalists, researchers, Belgian/EU policy users |
| Public launch | Wider public plus institutional and international audiences |
| Expansion | Region-specific users, local experts, academic and organizational partners |

---

## 6. Platform Positioning

### 6.1 What the platform is

- a documentation hub;
- a source-verification interface;
- a legal-accountability tracker;
- a country and institution accountability system;
- a lawful civic-action tool;
- a humanitarian and civil-society directory;
- a dossier and briefing system;
- a reusable framework for other crises.

### 6.2 What the platform is not

- a revenge or doxing platform;
- a propaganda or hatred site;
- a breaking-news outlet;
- a replacement for courts, journalists, NGOs, or humanitarian agencies;
- a military intelligence tool;
- a fundraising intermediary at launch;
- an unfiltered social-media archive;
- a platform for identifying or targeting private individuals;
- a final legal authority.

### 6.3 Differentiation

Accountability Atlas combines functions often separated across multiple projects:

- evidence organization;
- legal status explanation;
- country responsibility;
- policy asks;
- citizen action;
- dossier generation;
- organization discovery;
- transparent corrections.

The distinguishing product idea is not “more content.” It is a traceable path from evidence to understanding to lawful pressure.

---

## 7. Product Pillars

### Pillar 1 — Evidence Library

#### Purpose

Create a structured, searchable, source-graded public evidence archive.

#### Content types

- court documents and official legal filings;
- ICC/ICJ and national legal updates;
- UN documents;
- humanitarian situation updates;
- NGO reports;
- parliamentary records;
- arms-transfer records;
- official public statements;
- investigative journalism;
- academic research;
- satellite and OSINT analysis;
- incident records after review;
- witness testimony only in a later expert-led phase.

#### Verification levels

| Level | Name | Meaning |
|---:|---|---|
| 0 | Unreviewed lead | Discovered but not reviewed; never presented as established fact |
| 1 | Preserved lead | Archived or preserved, but not verified |
| 2 | Source checked | Source identity, date, provenance, and context checked |
| 3 | Corroborated | Supported by independent sources or robust verification |
| 4 | Trusted organization verified | Verified or formally reported by a recognized institution or expert source |
| 5 | Legal/institutional record | Court, official UN, government, parliamentary, or equivalent institutional record |

#### Evidence-item fields

- ID and slug;
- title and summary;
- body/context;
- incident and publication dates;
- location with safe precision;
- territory/country;
- category and affected groups;
- source type and URL;
- archive reference where permitted;
- verification level and status;
- reviewer and last-reviewed date;
- legal and humanitarian tags;
- media, only when safe and licensed;
- consent status, if testimony ever becomes active;
- visibility and correction history;
- version and change notes.

#### Evidence categories

- civilian casualties;
- hospitals, clinics, schools, shelters, and civilian infrastructure;
- journalists and media workers;
- medical and humanitarian workers;
- aid obstruction or attack;
- food, water, sanitation, and public-health access;
- forced displacement;
- housing and cultural/religious-site destruction;
- detention and mistreatment allegations;
- torture allegations;
- mass graves;
- public incitement by officials;
- arms transfers;
- humanitarian-access restrictions;
- ceasefire violations where reliably documented.

### Pillar 2 — Accountability Index

#### Purpose

Make visible what governments and institutions have done, failed to do, funded, blocked, voted for, or publicly supported.

#### Entity types

- countries;
- EU institutions;
- UN bodies;
- NATO where relevant to security-cooperation transparency;
- national parliaments and ministries;
- arms-export authorities;
- universities and municipalities later;
- companies involved in arms or surveillance only after legal review.

#### Country/institution page structure

1. current official position;
2. UN voting record;
3. EU role where relevant;
4. arms export/import position;
5. documented military cooperation where relevant;
6. humanitarian-aid contribution;
7. public statements;
8. ICC/ICJ cooperation stance;
9. sanctions or embargo position;
10. transparency and data gaps;
11. public pressure points;
12. representatives or offices to contact;
13. citizen action templates;
14. downloadable dossier;
15. sources, versions, and corrections.

#### Scoring policy

No accountability score may be published during the static beta. A later score requires:

- a published methodology;
- weighting rationale;
- source rules;
- missing-data policy;
- date/version labels;
- correction route;
- external review;
- clear warning that a score is an analytical model, not a legal judgment.

A draft scoring model may be developed internally but must not be publicly presented as final.

### Pillar 3 — Action Hub

#### Purpose

Turn verified information into lawful, practical action.

#### Action types

- email a representative;
- use a call script;
- send a policy dossier;
- contact an MP, MEP, ministry, or arms-export authority;
- contact a university or council;
- share a verified source card;
- support humanitarian access;
- visit an official donation page;
- attend a lawful event later;
- volunteer;
- submit a correction or public source.

#### Template rules

All templates must be:

- factual and source-linked;
- polite but firm;
- jurisdiction-specific;
- non-threatening and non-harassing;
- free of hate speech and collective blame;
- manually reviewable;
- clear about what the recipient can actually do.

#### Example policy asks

- immediate and sustained humanitarian access;
- protection of civilians, medical workers, journalists, and aid workers;
- support for ceasefire measures;
- transparent review or suspension of arms transfers where serious risk exists;
- cooperation with lawful international processes;
- transparency on export licenses and military cooperation;
- increased support for verified humanitarian organizations;
- protection of refugees and displaced people.

### Pillar 4 — Policy Dossier Generator

#### Purpose

Produce serious, versioned, downloadable evidence packs for defined audiences.

#### Dossier types

- one-page executive brief;
- five-page policy memo;
- full evidence dossier;
- journalist briefing;
- local council motion pack;
- university review/divestment pack;
- MP/MEP contact pack;
- humanitarian-access brief;
- arms-transfer review brief;
- legal-accountability brief.

#### Inputs

- country or institution;
- issue focus;
- date range;
- evidence categories;
- language;
- audience;
- output length.

#### Output structure

- title, version, and generation date;
- methodology note;
- executive summary;
- key facts;
- legal and humanitarian context;
- country/institution role;
- policy asks;
- recommended actions;
- sources and correction link;
- QR code to live page.

#### Formats

- PDF;
- Markdown;
- HTML share page;
- print-friendly page;
- DOCX later.

### Pillar 5 — Coalition & Aid Directory

#### Purpose

Help users find credible organizations without claiming ownership, endorsement, or partnership.

#### Categories

- UN bodies;
- humanitarian organizations;
- Red Cross/Red Crescent movement;
- medical organizations;
- legal and human-rights organizations;
- documentation groups;
- journalist and press-freedom networks;
- diaspora and academic initiatives;
- local grassroots organizations only after careful vetting.

#### Relationship labels

| Label | Meaning |
|---|---|
| Public resource | Listed from public information only |
| Contacted | Outreach sent; no relationship confirmed |
| Permission to list confirmed | Organization confirmed the listing details |
| Verified partner | Written partnership confirmation received |
| Data partner | Approved data/API/content relationship |
| Donation partner | Approved official donation-referral relationship |
| Local partner | Verified on-the-ground relationship |

#### Donation principle

The platform will not process, hold, or distribute donations during the MVP. It may link only to official organization pages and must state:

> Donations go directly to the named organization. Accountability Atlas does not process, hold, or distribute funds.

---

## 8. Product Stages and Scope

### 8.0 Static Beta vs Functional MVP

#### Level 1 — Public Static Beta

The current stage uses static routes and local TypeScript data to validate positioning, navigation, design, trust, methodology, and information architecture.

Included:

- home page;
- methodology;
- attributions;
- Gaza dossier preview;
- legal tracker preview;
- Belgium/EU skeletons;
- organization directory preview;
- action hub preview;
- evidence library preview;
- press/resources preview;
- contribute page.

Excluded:

- database and API;
- admin CMS;
- public evidence or witness submissions;
- PDF generation;
- public maps;
- donation handling;
- user accounts;
- automated email sending;
- AI publication workflows;
- action tracking tied to identity.

#### Level 2 — Functional MVP

The functional MVP adds:

- curated database-backed content;
- admin-only authentication and workflows;
- correction submission and moderation;
- basic dossier export;
- privacy-first analytics;
- structured evidence, legal, organization, country, and action records;
- versioning and public update dates.

Functional development begins only after static-beta review of positioning, safety, legal language, accessibility, and usability.

### 8.1 Functional MVP goal

Build a credible, safe public platform that can be shown to journalists, NGOs, lawyers, EU contacts, researchers, and civic groups without embarrassment, avoidable legal risk, or dangerous data practices.

### 8.2 Functional MVP modules

1. Home
2. Gaza dossier
3. Legal tracker
4. Curated evidence library
5. Belgium and EU accountability pages
6. Additional priority country pages
7. Action hub
8. Organization directory
9. Methodology
10. Press/resources
11. Admin content management
12. Basic dossier export
13. Privacy-first analytics
14. Static and database-backed source references
15. Correction submission and moderation

### 8.3 Priority geography

First:

- Gaza and wider occupied Palestinian territory;
- Belgium;
- European Union.

Next candidates, subject to research capacity:

- Netherlands;
- France;
- Germany;
- Spain;
- Ireland;
- United Kingdom;
- United States.

### 8.4 Phase-one exclusions

- sensitive witness vault;
- public live map of user reports;
- SecureDrop as a core public flow;
- AI translation of testimony;
- direct fundraising for local groups;
- gamified leaderboards;
- private target lists;
- automated social scraping;
- exact-location publishing of sensitive incidents;
- general-public user accounts;
- public comments on evidence items.

### 8.5 No Dead Placeholder Pages Rule

Every public route must provide value even when its final feature is not active.

A preview page must explain:

1. what the page will become;
2. why it matters;
3. what content or data will live there;
4. what is available now;
5. what is intentionally not active;
6. where methodology and source notes can be read;
7. how contributors can help.

Avoid pages that only say “Coming soon.”

Approved preview labels:

- Static preview
- Methodology draft
- Source pending
- Public resource only
- No partnership implied
- Correction welcome
- Feature not active yet
- Backend not connected yet
- Legal wording review needed

---

## 9. Static Beta Information Architecture

### 9.1 Route map

| Route | Purpose | Static-beta status |
|---|---|---|
| `/` | Public gateway and contributor-facing landing page | Active |
| `/methodology` | Source hierarchy, verification, legal terminology, corrections | Active draft |
| `/gaza-dossier` | First crisis-dossier structure | Static preview |
| `/legal-tracker` | Legal-process tracking | Static preview |
| `/countries/belgium` | First country accountability structure | Static preview |
| `/institutions/european-union` | EU accountability and action routes | Static preview |
| `/organizations` | Public-resource directory | Static preview |
| `/take-action` | Lawful action templates and routes | Static preview |
| `/evidence` | Evidence-library structure and labels | Static preview |
| `/press` | Press/resources and project summary | Static preview |
| `/contribute` | Contributor roles, rules, and GitHub pathways | Active |
| `/attributions` | Image and third-party credits | Active |

### 9.2 Initial public navigation

Desktop navigation:

- Gaza Dossier
- Legal Tracker
- Countries
- Take Action
- Methodology
- Contribute

Footer navigation:

- Methodology
- Gaza Dossier
- Legal Tracker
- Organizations
- Take Action
- Evidence
- Press
- Contribute
- Security
- Attributions
- GitHub

### 9.3 Later navigation

When real data exists:

- Evidence
- Countries
- Legal Tracker
- Take Action
- Organizations
- Dossiers
- Methodology

Mobile navigation should prioritize Home, Evidence, Act, Countries, and More.

---

## 10. Page Requirements

### 10.1 Home Page

#### Goal

Explain the mission in under ten seconds, establish moral clarity without reckless legal language, and guide users into the project and future platform.

The homepage must make clear:

- the platform addresses genocide allegations, mass atrocities, humanitarian harm, legal accountability, and lawful pressure;
- Gaza and the wider regional humanitarian crisis are the first focus;
- the future system includes evidence, legal processes, country accountability, organizations, dossiers, and action tools;
- the project is open source and seeking careful contributors;
- doxing, harassment, hatred, false partnership claims, and sensitive submissions are prohibited.

#### Current section order

1. Header
2. Image-led hero
3. Project status notice
4. Why this exists
5. Starting Focus: Gaza and the wider regional humanitarian crisis
6. Core modules
7. Safety principles
8. Strict boundaries
9. Horizontal roadmap
10. Contributor CTA
11. Footer

#### Hero

Pre-headline:

**Building public infrastructure against genocide and mass atrocities.**

Project name:

**Accountability Atlas**

Tagline:

**Evidence for protection. Action for accountability.**

Core description:

> Accountability Atlas is an open-source platform for organizing verified public evidence, tracking legal and political responsibility, and helping people take lawful action in response to genocide allegations, mass civilian harm, humanitarian obstruction, and atrocity crises.
>
> Starting with Gaza and the wider regional crisis, the platform is being designed as a reusable framework for other urgent contexts where documentation, accountability, and public pressure are needed.

Primary CTA: **Help Build the Platform**  
Secondary CTA: **Read the Methodology**  
Optional tertiary link: **View GitHub Repository**

#### Starting Focus

Title:

**Gaza and the wider regional humanitarian crisis.**

The section must explain that the platform will track public evidence, legal proceedings, humanitarian obstruction, country responses, institutional failures, and lawful action routes.

Design:

- full-width contextual documentary image;
- strong right-side gradient;
- right-oriented editorial copy on desktop;
- no glass-card UI;
- no visible source metadata on the image;
- attribution on `/attributions` and in repository documentation;
- subtle scroll reveal of eyebrow, title, lead, and body.

#### Future gateway section

After static routes exist, add **Enter the accountability system** with links to:

- Gaza Dossier
- Legal Tracker
- Belgium/EU Accountability
- Action Hub
- Organization Directory
- Methodology

### 10.2 Methodology Page

#### Goal

Make the platform trustworthy before the evidence database exists.

#### Required sections

1. Mission and scope
2. Source hierarchy
3. Verification levels
4. Legal status labels
5. Genocide terminology policy
6. What counts as evidence
7. What counts only as a lead
8. Correction policy
9. Content moderation
10. Anti-doxing and safety
11. Privacy summary
12. Partner-verification policy
13. AI-use policy
14. How to cite Accountability Atlas
15. What is not active yet
16. Reviewer/contributor request

#### UI patterns

- source-hierarchy cards;
- verification table;
- legal-status badge examples;
- review workflow;
- correction timeline;
- red-line policy block;
- “last updated” and version information.

### 10.3 Gaza Dossier Preview

#### Goal

Show the structure of the future Gaza accountability dossier without presenting unreviewed summaries as final.

#### Required sections

1. Overview
2. Scope and current page status
3. Humanitarian situation structure
4. Legal status structure
5. Documented-harm categories
6. Source categories
7. Timeline placeholder
8. Policy asks preview
9. Action routes preview
10. Sources placeholder
11. Correction/review request

#### Labels

- Static preview
- Source pending
- Legal wording review needed
- Methodology-linked
- Correction welcome

### 10.4 Legal Tracker Preview

#### Goal

Demonstrate how international, national, and institutional accountability processes will be tracked.

#### Categories

- ICJ proceedings;
- ICC investigations and warrants;
- UN Commission of Inquiry findings;
- universal-jurisdiction and national legal actions;
- sanctions or restrictive-measure procedures;
- parliamentary inquiries.

#### Fields

- case title;
- institution and jurisdiction;
- parties;
- status;
- opened date;
- latest verified update;
- public persons/entities where legally relevant;
- alleged crimes;
- source documents;
- next milestone;
- action relevance;
- version and last reviewed date.

#### Components

- `LegalCaseCard`
- `LegalStatusBadge`
- `SourceLinkList`
- `TimelineEvent`
- `CaseDetailPreview`

No current status may be published without checking primary sources immediately before publication.

### 10.5 Evidence Library Preview

#### Goal

Design and validate the library structure before creating a full database.

#### Views

- list;
- timeline later;
- source view;
- category view;
- map later;
- saved filters later.

#### Initial static content

- curated source summaries;
- source-type badges;
- verification labels;
- evidence-item template;
- methodology links;
- correction link.

#### Filters to design

- category;
- date range;
- location;
- source type;
- verification level;
- legal/humanitarian relevance;
- language;
- involved country/institution.

#### Do not include in static beta

- raw witness testimony;
- exact sensitive locations;
- unreviewed social posts presented as facts;
- graphic content;
- private personal data.

### 10.6 Belgium Accountability Page

#### Goal

Create the first national accountability-page structure.

#### Sections

1. Overview and status
2. Current federal position
3. UN/EU voting-record area
4. Arms-transfer review area
5. Humanitarian-aid area
6. ICC/ICJ cooperation area
7. Public statements
8. Representatives and official contact routes
9. Action templates in Dutch, French, and English later
10. Dossier preview
11. Sources, last updated, and corrections

No score will be shown during static beta.

### 10.7 European Union Institution Page

#### Goal

Track EU-level responsibility and public-pressure routes.

#### Sections

1. European Council position area
2. European Commission actions/statements area
3. European Parliament resolutions area
4. EU-Israel Association Agreement area
5. EU competence note on arms exports
6. sanctions/restrictive-measures area
7. MEP contact route
8. EU petition route
9. policy asks
10. downloadable brief preview
11. sources and corrections

### 10.8 Organization Directory Preview

#### Goal

Show how organizations will be listed responsibly.

#### Rules

- public-resource listings only during static beta;
- no logo without permission or clear brand-policy allowance;
- official websites and official donation links only;
- last-reviewed date;
- correction/removal route;
- no private contact scraping;
- visible disclaimer:

> Listing does not imply partnership, endorsement, approval, or affiliation.

#### Categories

- UN/humanitarian;
- Red Cross/Red Crescent;
- medical;
- human-rights/legal;
- documentation/data;
- journalism/press freedom;
- civil society/community later.

### 10.9 Action Hub Preview

#### Goal

Show useful lawful action routes without sending messages or tracking identities.

#### Initial action cards

- Contact your representative
- Ask for arms-transfer review
- Support humanitarian access
- Send a dossier to a journalist
- Submit a correction or source
- Volunteer for the project

#### Static-beta rules

- no automatic sending;
- no user identity storage;
- no message-content storage;
- no threats or harassment;
- clear intended recipient and policy ask;
- copy/manual `mailto:` only after review.

#### Later user flow

1. select country;
2. select issue;
3. view appropriate options;
4. choose template;
5. copy or open mail client;
6. optionally record aggregate interaction without personal data.

### 10.10 Dossier Generator

#### Static beta

Show dossier types and a static example layout. Do not claim automated generation works.

#### Functional MVP

Generate approved one-page and five-page outputs from reviewed records.

#### Inputs

- country/institution;
- issue;
- language;
- length;
- audience.

#### Outputs

- PDF;
- Markdown;
- HTML/print page;
- DOCX and slide deck later.

### 10.11 Press and Resources Preview

#### Goal

Help journalists, contributors, and civic-tech reviewers understand and cite the project responsibly.

#### Sections

- project summary;
- founder/project 60-second pitch;
- methodology links;
- public contact route;
- quote policy;
- citation guide;
- logo/brand assets later;
- press note later;
- image/attribution guidance.

### 10.12 Contribute Page

#### Goal

Convert serious visitors into focused contributors and reviewers.

#### Contributor roles

- developers;
- designers;
- researchers;
- legal/human-rights reviewers;
- OSINT/source-verification reviewers;
- security/privacy reviewers;
- accessibility reviewers;
- writers/translators;
- communications contributors.

#### Page requirements

- role descriptions;
- current priorities;
- good first issues;
- contribution guide;
- code of conduct;
- security policy;
- rule against speaking for the project without authorization;
- no sensitive uploads warning.

### 10.13 Attributions Page

#### Goal

Meet licensing obligations and demonstrate transparent media use.

#### Fields per asset

- title;
- creator/photographer;
- original source;
- source URL;
- license and license URL;
- where used;
- modifications;
- date added/accessed.

The page must be linked from the footer.

### 10.14 Later Features

#### Events and campaign calendar

Later only, with moderation, no illegal-action planning, no intimidation, and no private-home targeting.

#### Witness/testimony vault

Later only after legal, security, trauma-informed, consent, retention, deletion, redaction, and expert-partner review.

#### Interactive map

Later only with curated public data, safe location granularity, no shelter/safe-route disclosure, and delayed publication where needed.

#### Live dashboard

Aggregate privacy-preserving metrics only.

#### AI translation and summarization

AI drafts only; humans approve legal, testimony, casualty, identity, and high-risk content.

---

## 11. Source, Evidence, and Publication Methodology

### 11.1 Source hierarchy

Highest-weight source types:

1. court records and official legal filings;
2. UN documents and official humanitarian updates;
3. ICRC/Red Cross/Red Crescent and established humanitarian organizations;
4. established human-rights organizations;
5. investigative journalism and recognized OSINT work;
6. academic research;
7. public social-media material as leads only until verified.

Source weight is contextual. An official statement may prove what an institution said, but not necessarily prove the truth of every underlying claim.

### 11.2 Evidence classification

Every item must display:

- source type;
- verification level;
- publication/review date;
- status;
- correction history where relevant;
- link to methodology.

### 11.3 Review Gates Before Factual Publication

Any current legal, humanitarian, country, institutional, or evidence claim must pass:

1. **Source check** — reliable source attached.
2. **Date check** — information is current or clearly dated.
3. **Legal-status check** — allegation, proceeding, ruling, warrant, finding, and NGO determination are distinguished.
4. **Safety check** — no unsafe personal or location data.
5. **Language check** — calm, precise, non-hateful, non-inciting wording.
6. **Correction path** — users can report errors.
7. **Methodology link** — relevant policy is accessible.
8. **Version check** — change date and page version recorded for dossiers and major pages.

Content that has not passed all gates must be labeled Draft, Static Preview, Source Pending, or Legal Wording Review Needed.

### 11.4 Content review workflow

1. Draft created
2. Source attached
3. Source role identified
4. Verification level assigned
5. Legal wording checked where sensitive
6. Safety review performed
7. Editorial review performed
8. Published with date/version
9. Correction route remains open

### 11.5 Corrections

Correction categories:

- factual error;
- outdated source;
- wrong location/date;
- unsafe personal information;
- mistranslation;
- legal wording issue;
- broken link;
- duplicate item;
- misleading framing.

Major corrections should be publicly logged.

### 11.6 Archival preservation

Public links may disappear. Archive references may be recorded where lawful and ethically appropriate. Preservation must not override privacy, copyright, witness safety, or platform terms without review.

---

## 12. Moderation and Editorial Policy

### 12.1 Prohibited content

- calls for violence or revenge;
- hate speech;
- antisemitism, Islamophobia, racism;
- glorification of attacks on civilians;
- doxing and private personal data;
- harassment campaigns and targeting lists;
- misinformation or manipulated media presented as authentic;
- graphic content without warning, purpose, and review;
- false partner claims;
- fundraising without verification and legal review.

### 12.2 Graphic content

- no autoplay;
- content warnings;
- low-graphic mode later;
- publish only when necessary for documented public-interest purpose;
- prioritize dignity and context;
- avoid thumbnails that sensationalize victims.

### 12.3 Volunteer wellbeing

People reviewing atrocity material need:

- opt-in graphic-content access;
- rotation and limits;
- clear permission to stop;
- content warnings;
- separation between general contributors and high-risk reviewers;
- mental-health and peer-support guidance when capacity permits.

### 12.4 Translation review

Legal and action wording must be reviewed by competent speakers. AI or machine translation may assist drafting but cannot publish automatically.

---

## 13. Design, UX, Brand, and Media

### 13.1 Visual direction

- calm and institution-grade;
- human without sentimentality;
- urgent without chaos;
- editorial evidence style;
- not militaristic;
- not rage-branded;
- not generic SaaS;
- not a news-site clone.

### 13.2 Design system

| Token | Value/role |
|---|---|
| Deep Ink Navy | Authority, footer, overlays, primary buttons |
| Soft Charcoal | Body text |
| Warm Paper | Primary background |
| Bone White | Cards and light text |
| Signal Amber | Current phase, evidence point, careful emphasis |
| Muted Clay | Human/safety accent |
| Trust Blue | Legal/institutional states |
| Quiet Border Grey | Dividers and document cards |

Typography:

- IBM Plex Serif — headings and editorial authority;
- Inter — body and interface;
- IBM Plex Mono — labels, metadata, source and status language.

### 13.3 Image-led hero

- real contextual image allowed;
- left-aligned editorial text;
- strong layered gradients;
- text contrast must meet WCAG requirements;
- contextual evidence-preview detail may appear, but never fake live data;
- no gore, aggressive filters, or war-poster aesthetic.

### 13.4 Starting Focus

- full-width image;
- child/subject remains meaningfully visible;
- right-oriented text on desktop;
- stronger dark gradient on text side;
- no card/glass panel;
- no source metadata on image;
- mobile alignment adapts for readability;
- subtle scroll reveal.

### 13.5 Roadmap

The roadmap should feel like an accountability pipeline, not a generic startup timeline.

Desktop:

- horizontal phase rail;
- connected markers/cards;
- current/next/planned labels;
- Framer Motion line/card reveal;
- no fake progress percentage.

Mobile:

- accessible horizontal scroll-snap or carefully designed stack;
- no auto-scroll;
- all content accessible without hover.

### 13.6 Cards, badges, and status language

Cards use document/evidence DNA:

- quiet borders;
- mono labels;
- restrained accent bars;
- slight hover lift;
- no glow or bouncy motion.

Badges are static status indicators, not decoration.

### 13.7 Motion

Framer Motion may be used for:

- hero entrance;
- section reveals;
- staggered cards;
- roadmap line/cards;
- title and copy scroll entry.

Rules:

- opacity and transform only where possible;
- reduced-motion support;
- no parallax;
- no infinite animation;
- no image zoom loops;
- no scroll-jacking;
- no layout-shifting spectacle.

### 13.8 Accessibility

Target WCAG 2.2 AA:

- semantic structure and logical headings;
- keyboard navigation;
- visible focus states;
- minimum target sizes;
- sufficient contrast;
- alt text and captions;
- reduced motion;
- no text embedded only in images;
- readable mobile typography;
- later RTL support.

### 13.9 Image and Attribution Policy

Accountability Atlas may use open-licensed, public-domain, or permission-cleared images to provide human and historical context.

Images must never be used for shock value, manipulation, dehumanization, or spectacle.

Every third-party image requires:

- title;
- author/photographer;
- original source and URL;
- license and license URL;
- date accessed;
- where used;
- modifications such as crop, compression, tint, overlay, or format conversion;
- required attribution text.

Maintain:

- route: `/attributions`;
- repository file: `docs/attributions.md`;
- footer link: **Attributions** or **Image credits**.

Do not commit Getty, wire-service, news-agency, or unclear-license images to the public repository unless the license clearly permits that website use and repository redistribution.

### 13.10 Media metadata template

```md
## [Image title]

- **Author:** [Name]
- **Source:** [Source]
- **Source URL:** [URL]
- **License:** [License]
- **License URL:** [URL]
- **Where used:** [Route/section]
- **Modifications:** [Crop/compression/overlay/WebP conversion]
- **Date added:** [YYYY-MM-DD]
```

---

## 14. Internationalization

### 14.1 MVP languages

- English
- Dutch
- French

The Belgium/EU launch requires all three, but English may lead during static-beta design.

### 14.2 Next languages

- Arabic
- Spanish
- German
- Hebrew

### 14.3 Translation rules

- legal pages require human review;
- action templates require local-language and jurisdiction review;
- source language is preserved;
- translated pages show status and review date;
- AI can draft low-risk text but cannot publish without human approval;
- Arabic/Hebrew layout requires RTL design testing.

---

## 15. Technical Architecture

### 15.1 Current Static Beta Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion, restrained
- React Router
- static/local TypeScript data
- static hosting on Netlify, Vercel, or Cloudflare Pages
- no backend required for static beta

### 15.2 Static Data-First Strategy

Before introducing a database, use:

```txt
src/data/sources.ts
src/data/legalCases.ts
src/data/organizations.ts
src/data/countries.ts
src/data/actionTemplates.ts
src/data/evidenceItems.ts
src/data/dossierTemplates.ts
src/data/navigation.ts
src/data/roadmap.ts
```

Rules:

- mark draft/preview content;
- no sensitive personal data;
- no raw witness material;
- no unverified social claims as evidence;
- link verification/legal labels to methodology;
- keep interfaces compatible with later API records;
- include `lastReviewed`, `status`, and source references from the start.

Benefits:

- faster design iteration;
- safer review;
- easier onboarding;
- lower cost;
- clearer backend requirements;
- reduced risk of premature data collection.

### 15.3 Functional MVP Backend

Preferred path after review:

- Supabase/PostgreSQL;
- Row-Level Security;
- admin-only authentication;
- public read APIs;
- correction submission;
- public document storage;
- Postgres full-text search first;
- PostGIS later;
- Meilisearch/OpenSearch later if necessary.

Alternative:

- Django + PostgreSQL + Django Admin where editorial workflow and server-side controls justify the added complexity.

The backend choice must be finalized in Sprint 4 after static-beta feedback.

### 15.4 Hosting and edge protection

- static frontend: Cloudflare Pages, Netlify, or Vercel;
- DNS/CDN/WAF: Cloudflare;
- HTTPS and HSTS;
- strict security headers and CSP;
- later Project Galileo application when eligible;
- Deflect evaluated as backup/alternative.

### 15.5 Analytics

- Plausible, Matomo, or equivalent privacy-first analytics;
- no Meta Pixel, advertising trackers, or behavioral profiling;
- analytics not required during the earliest static preview.

### 15.6 PDF generation

Functional MVP:

- server-side Playwright/Puppeteer or approved client-side generation;
- versioned snapshots;
- date and methodology note;
- no automatic dossier generated from unreviewed records.

### 15.7 Static Beta File Architecture

```txt
src/
  assets/
    images/
      hero-gaza-displacement.jpg
      starting-focus-gaza.jpg

  components/
    layout/
    landing/
    ui/

    evidence/
      EvidenceItemCard.tsx
      VerificationBadge.tsx
      SourceTypeBadge.tsx

    legal/
      LegalCaseCard.tsx
      LegalStatusBadge.tsx
      TimelineEvent.tsx

    countries/
      CountryOverviewCard.tsx
      AccountabilitySignal.tsx
      ActionTemplatePreview.tsx

    organizations/
      OrganizationCard.tsx
      OrganizationStatusBadge.tsx

    actions/
      ActionCard.tsx
      TemplatePreview.tsx

    dossiers/
      DossierCard.tsx

    pages/
      PageIntro.tsx
      PageStatusNotice.tsx

  data/
    sources.ts
    legalCases.ts
    organizations.ts
    countries.ts
    actionTemplates.ts
    evidenceItems.ts
    dossierTemplates.ts
    roadmap.ts
    navigation.ts

  pages/
    HomePage.tsx
    MethodologyPage.tsx
    GazaDossierPage.tsx
    LegalTrackerPage.tsx
    BelgiumPage.tsx
    EUInstitutionPage.tsx
    OrganizationsPage.tsx
    ActionHubPage.tsx
    EvidenceLibraryPage.tsx
    PressPage.tsx
    ContributePage.tsx
    AttributionsPage.tsx
```

---

## 16. Future Data Model

The database model is a functional-MVP requirement, not a static-beta requirement.

### 16.1 `sources`

```sql
id uuid primary key
name text not null
type text not null
url text
country text
credibility_tier int
notes text
created_at timestamp
updated_at timestamp
```

### 16.2 `evidence_items`

```sql
id uuid primary key
title text not null
slug text unique not null
summary text not null
body text
category text not null
incident_date timestamp
publication_date date
location_name text
country_or_territory text
lat numeric
lng numeric
location_precision text
verification_level int not null
source_id uuid references sources(id)
legal_tags text[]
humanitarian_tags text[]
visibility text
review_status text
created_by uuid
reviewed_by uuid
last_reviewed_at timestamp
version int
created_at timestamp
updated_at timestamp
```

### 16.3 `evidence_references`

```sql
id uuid primary key
evidence_item_id uuid references evidence_items(id)
source_id uuid references sources(id)
url text
archive_url text
quote_excerpt text
reference_type text
created_at timestamp
```

### 16.4 `countries`

```sql
id uuid primary key
name text not null
iso_code text unique
region text
eu_member boolean
nato_member boolean
slug text unique
created_at timestamp
updated_at timestamp
```

### 16.5 `country_positions`

```sql
id uuid primary key
country_id uuid references countries(id)
issue text
position_summary text
score int
source_url text
last_verified_at timestamp
created_at timestamp
updated_at timestamp
```

### 16.6 `actions`

```sql
id uuid primary key
country_id uuid references countries(id)
title text not null
slug text unique
action_type text
issue text
template_body text
language text
recipient_type text
recipient_name text
recipient_url text
source_notes text
active boolean default true
created_at timestamp
updated_at timestamp
```

### 16.7 `organizations`

```sql
id uuid primary key
name text not null
slug text unique
type text
website text
official_donation_url text
regions text[]
services text[]
partnership_status text
verification_document_url text
last_verified_at timestamp
notes text
created_at timestamp
updated_at timestamp
```

### 16.8 `legal_cases`

```sql
id uuid primary key
title text not null
institution text
jurisdiction text
status text
summary text
opened_date date
latest_update_date date
source_url text
action_relevance text
last_reviewed_at timestamp
created_at timestamp
updated_at timestamp
```

### 16.9 `dossiers`

```sql
id uuid primary key
title text
slug text unique
country_id uuid references countries(id)
issue text
language text
format text
html_content text
pdf_url text
version int
published boolean
created_at timestamp
updated_at timestamp
```

### 16.10 `corrections`

```sql
id uuid primary key
target_type text
target_id uuid
reason text
message text
submitter_email_hash text
status text
review_notes text
created_at timestamp
updated_at timestamp
```

### 16.11 Additional recommended tables

Later add:

- `content_versions`;
- `review_assignments`;
- `audit_logs`;
- `translations`;
- `organization_relationships`;
- `country_votes`;
- `official_statements`;
- `arms_transfer_records`;
- `page_sources`.

---

## 17. Future API Requirements

APIs are not required in static beta.

### 17.1 Public endpoints

- `GET /api/v1/evidence`
- `GET /api/v1/evidence/:slug`
- `GET /api/v1/countries`
- `GET /api/v1/countries/:slug`
- `GET /api/v1/actions`
- `GET /api/v1/organizations`
- `GET /api/v1/legal-cases`
- `GET /api/v1/dossiers/:slug`
- `POST /api/v1/corrections`

### 17.2 Admin endpoints

- create/update evidence and sources;
- create/update country positions;
- create/update actions;
- create/update legal cases and organizations;
- generate/version dossiers;
- review corrections.

### 17.3 Standards

- versioned routes;
- schema validation;
- rate limiting;
- authentication and authorization;
- audit logging;
- safe logs with no unnecessary sensitive data;
- API documentation;
- stable public IDs.

---

## 18. Security Requirements

### 18.1 Threat model

Likely threats include:

- DDoS;
- spam and fake submissions;
- coordinated disinformation;
- legal and takedown threats;
- contributor identification attempts;
- moderator credential theft;
- malicious uploads;
- scraping or misuse;
- social engineering;
- volunteer infiltration;
- dependency compromise;
- defacement.

### 18.2 Static-beta controls

- no public user accounts;
- no sensitive forms or uploads;
- HTTPS;
- dependency scanning;
- branch/PR discipline;
- secure environment variables;
- security headers and CSP;
- `security.txt`;
- responsible-disclosure route;
- source-code and image-license review;
- minimal third-party scripts.

### 18.3 Functional-MVP controls

- Cloudflare DNS/CDN/WAF;
- HSTS;
- admin 2FA;
- strict RBAC;
- rate limiting;
- spam protection;
- backups and restoration tests;
- audit logs;
- least privilege;
- periodic access review;
- offboarding procedure.

### 18.4 Later controls

- Project Galileo;
- Deflect evaluation;
- Tor/onion feasibility;
- GlobaLeaks/SecureDrop evaluation;
- independent audit;
- separate admin domain;
- hardware security keys;
- malware scanning;
- encrypted object storage;
- key rotation;
- incident-response runbook.

### 18.5 Data minimization

Do not collect unnecessary names, emails, precise user locations, political profiles, message content, recipient replies, or witness details.

---

## 19. Privacy and Compliance

### 19.1 GDPR principles

- lawful basis;
- data minimization;
- purpose limitation;
- storage limitation;
- access control;
- rights handling;
- processor list;
- breach response;
- privacy notice;
- cookie notice only if applicable.

### 19.2 Static beta

Prefer a site that works without cookies, accounts, or analytics.

### 19.3 Analytics

Privacy-first, aggregate, no ad pixels.

### 19.4 Action interactions

If aggregate interaction counts are later used, do not store political profiles, email content, recipient responses, or private notes.

### 19.5 High-risk data protection impact assessment

A DPIA or equivalent formal privacy-risk assessment is required before witness submissions, sensitive locations, partner analytics, or high-risk profiling workflows.

---

## 20. User Roles and Permissions

### Static beta

- public visitor;
- repository contributor;
- maintainer.

No public application accounts.

### Functional MVP roles

| Role | Permissions |
|---|---|
| Public visitor | View, download, act, submit corrections |
| Contributor | Suggest sources, drafts, translations |
| Researcher | Create draft evidence records |
| Moderator | Review evidence and corrections |
| Partner organization | Edit approved profile and submit verified updates |
| Legal reviewer | Review legal wording and risk flags |
| Security admin | Infrastructure and incident response |
| Admin | Full management |

Requirements:

- 2FA for non-public roles;
- least privilege;
- audit logs;
- periodic review;
- rapid offboarding;
- contributors may say they contribute, but may not claim to represent the project without authorization.

---

## 21. Governance

### 21.1 Founder role

The founder coordinates product, design, development, outreach, and community during the early stage but must not remain the sole editorial authority long term.

### 21.2 Core-team target

- technical lead;
- research/methodology lead;
- legal/human-rights reviewer;
- UX/accessibility lead;
- communications/outreach lead;
- privacy/security reviewer.

### 21.3 Advisory circle

Target expertise:

- human-rights law;
- journalism/OSINT;
- humanitarian work;
- Palestinian and Lebanese civil-society voices;
- anti-racism and antisemitism expertise;
- cybersecurity;
- GDPR/data protection;
- trauma-informed documentation.

### 21.4 Editorial board later

Responsible for methodology, high-risk publications, corrections, legal wording, disputes, and annual review.

### 21.5 Representation and affiliation rules

- no contributor speaks officially without approval;
- no organization is called a partner without written confirmation;
- logos require permission or clear usage rights;
- conflicts of interest must be disclosed;
- serious decisions should be documented in a decision log.

---

## 22. Outreach and Collaboration

### 22.1 Static-beta outreach goal

Recruit careful builders and reviewers, not maximum attention.

### 22.2 Before organization outreach

Prepare:

- public beta;
- methodology;
- status/disclaimer language;
- contributor guide;
- security/privacy notes;
- organization-listing disclaimer;
- sample dossier structure;
- specific, small review asks.

### 22.3 Priority outreach order

1. contributors and technical/design reviewers;
2. methodology, legal, OSINT, accessibility, and security reviewers;
3. community/diaspora reviewers;
4. civic-tech networks;
5. organizations for listing corrections;
6. journalists and policy staff for format feedback;
7. formal institutional outreach later.

### 22.4 First asks

Ask for:

- a document review;
- one correction;
- a short design/accessibility review;
- one introduction;
- feedback on dossier format;
- confirmation of official organization links.

Do not begin by asking major organizations for partnership.

### 22.5 Partnership language

Allowed before partnership:

- public resource;
- referenced organization;
- public source;
- correction received.

Requires written confirmation:

- partner;
- verified partner;
- supported by;
- in collaboration with;
- endorsed by.

---

## 23. SEO and Public Visibility

### Static beta priorities

- project name and mission;
- methodology;
- Gaza dossier preview;
- Belgium/EU preview pages;
- attributions and legal clarity.

### Functional SEO pages

- `/gaza-dossier`
- `/legal/icj-...`
- `/legal/icc-...`
- `/countries/belgium`
- `/institutions/european-union`
- `/methodology`

Every public page needs:

- unique title and description;
- canonical URL;
- Open Graph metadata;
- last updated date;
- structured data where appropriate;
- meaningful internal links;
- image alt text;
- no misleading “live” or “verified” claims.

---

## 24. Brand Voice

### Attributes

- precise;
- compassionate;
- calm;
- firm;
- legally literate;
- evidence-led;
- non-sectarian;
- non-dehumanizing;
- direct rather than vague.

### Preferred language

- civilian protection;
- humanitarian access;
- legal accountability;
- verified evidence;
- alleged atrocity crimes;
- documented harm;
- arms-transfer review;
- international humanitarian law;
- genocide allegations;
- mass atrocities;
- public accountability;
- lawful pressure.

### Avoid

- destroy;
- hunt;
- enemy people;
- revenge;
- traitors;
- punish families;
- generalized accusations;
- legally false claims;
- vague corporate language that hides the mission.

---

## 25. Success Metrics

### 25.1 Static-beta metrics

- landing page complete;
- 11 core routes active;
- zero dead placeholders;
- methodology and attributions published;
- five static data models implemented;
- three to five trusted reviews completed;
- at least three external corrections or meaningful feedback items processed;
- mobile/accessibility review completed;
- no false affiliation or licensing complaints.

### 25.2 Functional-MVP metrics

- 10 country/institution pages;
- 50 curated evidence items;
- 10 legal tracker entries;
- 30 organization entries;
- 20 action templates;
- five dossiers;
- correction process active;
- five expert reviewers identified.

### 25.3 Year-one metrics

Targets should be treated as directional, not promises:

- 100,000 unique visitors;
- 50 country/institution pages;
- 1,000 curated evidence items;
- 100 action templates;
- meaningful references by journalists/organizations;
- verified organizational relationships;
- multilingual support;
- zero security incidents exposing witnesses.

### 25.4 Quality metrics

- correction response time;
- source diversity;
- multi-source coverage;
- review recency;
- unresolved disputes;
- legal review coverage;
- broken-link rate;
- accessibility defects;
- attribution completeness.

---

## 26. Roadmap

### Phase 0 — Foundation and Safety Design

Status: substantially complete / ongoing.

Deliverables:

- final name and repository;
- mission and PRD;
- license structure;
- contribution, conduct, security, governance documents;
- source methodology draft;
- legal wording rules;
- design direction;
- outreach plan;
- risk register.

### Phase 0.5 — Public Static Beta, Weeks 2–6

#### Goal

Turn the project from a landing page into a navigable, credible static beta.

#### Deliverables

- polished landing page;
- methodology;
- attributions;
- Gaza dossier preview;
- legal tracker preview;
- Belgium and EU skeletons;
- organization directory preview;
- action hub preview;
- evidence library preview;
- press/resources preview;
- contribute page;
- static data;
- updated navigation/footer;
- deployment preview.

#### Strict exclusions

- backend/database;
- public submissions;
- witness uploads;
- live map;
- accounts;
- automatic email sending;
- donations;
- admin CMS;
- PDF generator;
- AI translation;
- partner dashboards;
- sensitive data.

#### Done when

- routes are intentional and responsive;
- no dead placeholders;
- safe wording and review labels;
- methodology and attribution visible;
- no false partnerships;
- build passes;
- shareable with trusted reviewers.

### Phase 1 — Functional Credible MVP, approximately Weeks 7–16

- backend and admin workflow;
- reviewed Gaza dossier;
- reviewed legal tracker;
- Belgium/EU pages;
- curated evidence library;
- organization directory;
- action hub;
- correction form;
- basic one-page dossier export;
- privacy-first analytics;
- security baseline.

Launch as limited beta with clear methodology and corrections messaging.

### Phase 2 — Expansion

- more countries and records;
- five-page dossiers;
- social cards;
- fuller press page;
- events calendar after policy review;
- public read API;
- contributor workflow;
- curated map;
- English/Dutch/French completeness.

### Phase 3 — Secure Submission and Partner Layer

- partner verification and approved profile editing;
- secure-submission tool evaluation;
- expert-led pilot only;
- testimony consent, retention, and deletion workflows;
- security audit;
- Tor feasibility;
- stricter access controls.

### Phase 4 — Global Framework

- region-specific modular support;
- advanced accountability methodology;
- multilingual expansion;
- AI-assisted/human-reviewed workflows;
- public datasets;
- academic and journalistic partnerships;
- annual accountability reporting.

---

## 27. Updated Development Sprints

### Sprint 1 — Landing Page and Brand Foundation

**Status:** largely implemented; final polish and QA remain.

#### Deliverables

- React/Vite foundation;
- Tailwind design system;
- image-led homepage;
- hero and Starting Focus;
- status notice;
- why-this-exists content;
- modules, principles, boundaries;
- horizontal roadmap;
- contributor CTA;
- footer;
- motion and responsive behavior;
- image attribution documentation.

#### Definition of done

- deployed preview;
- mission is clear;
- Gaza focus unmistakable;
- no false partnerships or sensitive forms;
- image credits documented;
- mobile, accessibility, and build checks pass.

### Sprint 2 — Trust and Product Shell

#### Goal

Turn the site into a navigable static beta.

#### Deliverables

- complete methodology page;
- attributions page;
- Gaza dossier preview;
- legal tracker preview;
- Belgium page;
- EU page;
- organization directory preview;
- action hub preview;
- evidence library preview;
- press/resources preview;
- updated navigation/footer;
- shared preview components.

#### Definition of done

- all routes work;
- no dead placeholders;
- responsive and accessible;
- safe copy and review labels;
- source/methodology links;
- no backend or sensitive feature required.

### Sprint 3 — Static Data and Content Review

#### Deliverables

- `sources.ts`;
- `legalCases.ts`;
- `organizations.ts`;
- `countries.ts`;
- `actionTemplates.ts`;
- `evidenceItems.ts`;
- first ten draft source summaries;
- legal and organization status systems;
- correction-pathway design;
- trusted reviewer feedback.

#### Definition of done

- public-source-safe data;
- cautious legal status;
- linked sources;
- methodology references;
- visible review state;
- no sensitive or unverified claim presented as fact.

### Sprint 4 — Functional MVP Planning

#### Deliverables

- backend decision;
- refined data model;
- admin workflow;
- correction-form plan;
- dossier-export plan;
- privacy/security checklist;
- static-beta feedback report;
- cost and hosting decision.

#### Definition of done

- backend scope agreed;
- content workflow understood;
- risks documented;
- no high-risk workflow begins prematurely.

### Sprint 5 — Functional MVP Foundation

Begins only after Sprint 4 approval.

- Supabase/Django setup;
- admin authentication and 2FA plan;
- core tables;
- migration from local static data;
- audit logs;
- correction moderation;
- reviewed public read endpoints.

---

## 28. Build Backlog

### Epic 1 — Static Public Shell

- finish landing page;
- build routes;
- reusable page intro/status components;
- navigation/footer;
- attributions;
- responsive/accessibility QA.

### Epic 2 — Methodology and Trust

- source hierarchy;
- verification levels;
- legal terminology;
- corrections;
- partner policy;
- AI policy;
- citation guidance;
- public disclaimer.

### Epic 3 — Static Product Previews

- Gaza dossier;
- legal tracker;
- Belgium/EU;
- organizations;
- action hub;
- evidence library;
- press/resources.

### Epic 4 — Static Content Models

- TypeScript interfaces and data;
- status badges;
- source lists;
- last-reviewed labels;
- shared filters and cards.

### Epic 5 — Backend and Admin

- authentication;
- tables;
- editorial workflow;
- correction queue;
- audit logs;
- backups.

### Epic 6 — Dossier Engine

- templates;
- approved record selection;
- HTML/PDF export;
- versioning;
- QR link.

### Epic 7 — Security and Privacy

- Cloudflare;
- CSP/headers;
- rate limiting;
- 2FA;
- backups;
- scanning;
- privacy notices;
- incident response.

### Epic 8 — Internationalization

- i18n framework;
- language selection;
- English/Dutch/French;
- translation review;
- future RTL.

---

## 29. Initial Content Plan

### First ten source/evidence summaries

Treat these as research targets requiring current primary-source verification:

1. ICJ genocide-convention case procedural overview
2. ICJ provisional-measures overview
3. ICC Palestine situation and public warrant/proceeding overview
4. OCHA humanitarian situation overview
5. UNRWA emergency appeal/operations overview
6. Amnesty legal determination/report summary
7. Human Rights Watch relevant legal/humanitarian analysis
8. B’Tselem relevant report summary
9. MSF medical-access summary
10. ICRC/Red Cross humanitarian-role summary

### First five dossier concepts

1. Gaza Accountability — one-page brief
2. Gaza Accountability — five-page policy memo
3. Belgium Gaza Policy Action Brief
4. EU Gaza Policy Action Brief
5. Humanitarian Access Brief

### First action-template set

- Belgian MP email in Dutch/French/English;
- Belgian foreign-ministry request;
- MEP email;
- arms-transfer review request;
- humanitarian-access request;
- ICC/ICJ cooperation request;
- journalist briefing email;
- university/city-council request;
- phone script;
- correction/source submission;
- volunteer translator/reviewer call.

No template is published before jurisdiction, source, tone, and legal review.

---

## 30. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---:|---:|---|
| DDoS | High | High | Cloudflare, later Galileo, backup evaluation |
| Legal threats | Medium | High | careful wording, primary sources, review, corrections |
| Misinformation | High | High | source hierarchy, review labels, no unreviewed public submissions |
| Doxing misuse | Medium | Extreme | strict policy, no private targets, moderation |
| Witness exposure | Medium | Extreme | delay vault, expert partners, minimization |
| Founder burnout | High | High | static beta, small sprints, team recruitment |
| Antisemitism accusations or actual hateful misuse | High | High | explicit policy, precise language, diverse sources, moderation |
| Propaganda perception | Medium | High | methodology, transparent sources, corrections, versioning |
| Partner rejection | Medium | Medium | public-resource status, small asks, no implied affiliation |
| Funding constraints | Medium | Medium | low-cost static phase, grants later |
| Volunteer infiltration | Medium | High | least privilege, PR review, role progression |
| Copyright/license breach | Medium | High | attribution inventory, open licenses, no unclear media |
| Outdated legal/policy content | High | High | last-reviewed dates, source checks, scheduled review |
| Accessibility failure | Medium | High | WCAG target, keyboard/mobile testing, external review |

---

## 31. Launch Strategy

### Internal preview

Founder and trusted technical/design reviewers.

### Trusted static-beta review

Audience:

- 3–5 legal, methodology, security, accessibility, and civic-tech reviewers;
- selected journalists/researchers;
- affected-community reviewers where appropriate.

Goal:

- correct framing;
- identify missing safety controls;
- test navigation and copy;
- validate whether previews communicate the product.

### Limited public beta

Requirements:

- methodology and attributions live;
- correction contact;
- core static routes;
- review labels;
- security headers;
- no false affiliations;
- no sensitive collection.

### Functional beta

Requires reviewed content, backend security, correction workflow, privacy notice, and editorial process.

### Broad public launch

Requires:

- mature methodology;
- meaningful reviewed content;
- legal and security input;
- privacy compliance;
- correction operations;
- reliable hosting;
- a team larger than one founder for editorial risk.

---

## 32. Cost Estimate

### Static beta

| Item | Approximate monthly cost |
|---|---:|
| Domain | €1–€3 averaged |
| Static hosting | €0–€25 |
| Email/contact | €0–€15 |
| Monitoring | €0–€20 |
| Analytics | €0–€20, optional |
| Total | **€0–€83/month** |

### Functional MVP

| Item | Approximate monthly cost |
|---|---:|
| Frontend/hosting | €0–€50 |
| Database/backend | €0–€75 initially |
| Storage/backups | €0–€25 initially |
| Email | €0–€25 |
| Monitoring/analytics | €0–€40 |
| Total | **€0–€215/month**, excluding professional reviews |

Legal, translation, security, accessibility, and trauma-informed review may be project-based and materially more expensive than hosting.

---

## 33. Ethical AI Policy

AI may assist with:

- first-draft summaries of public reports;
- translation of low-risk public text;
- clustering and tagging;
- admin search;
- draft action templates;
- first-draft briefs.

AI must never be final authority for:

- legal conclusions;
- casualty claims;
- witness verification;
- identity confirmation;
- image/video authenticity;
- accusations against individuals;
- high-risk translation;
- publication status.

Requirements:

- retain original source;
- record human reviewer;
- log model/version where material;
- warn internal users about hallucination;
- no automatic public publishing.

---

## 34. Additional Ethical and Operational Requirements

### Trauma-informed design

Avoid manipulative gore. Provide warnings and future low-graphic mode.

### Versioning

Dossiers, legal pages, country pages, and major summaries require version and updated date.

### Institutional right of reply

Provide a response/correction channel without giving subjects veto power.

### Regional expansion

No new crisis is launched without local expertise and dedicated methodology adaptation.

### Founder credibility

The founder coordinates infrastructure and should not claim to represent victims, communities, organizations, courts, or states.

### Legal counsel

Obtain pro bono or funded review in defamation, GDPR, nonprofit/civic tech, copyright, and conflict-related speech before major publicity.

### Sustainability

Design editorial workload, source review, and update cadence before scaling content volume.

---

## 35. Acceptance Criteria

### 35.1 Static Beta Acceptance Criteria

Ready for trusted review when:

- homepage is live and mission-clear;
- methodology exists;
- attributions exists;
- Gaza dossier preview exists;
- legal tracker preview exists;
- Belgium and EU skeletons exist;
- organization directory preview exists;
- action hub preview exists;
- evidence library preview exists;
- press/resources and contribute pages exist;
- routes are responsive and accessible;
- no dead placeholders;
- claims are sourced or marked draft/preview;
- no false partnership claims;
- no doxing or unsafe links;
- no sensitive submissions;
- media attribution is complete;
- footer includes legal, safety, and attribution links;
- build and lint/type checks pass;
- three to five trusted reviewers can evaluate it.

### 35.2 Functional MVP Acceptance Criteria

Ready for functional beta when:

- methodology is complete;
- at least 50 evidence items are reviewed;
- Gaza dossier is published;
- Belgium and EU pages are reviewed;
- legal tracker has reviewed primary-source entries;
- organization relationships are accurately labeled;
- action templates are lawful, sourced, and reviewed;
- correction form and moderation work;
- admin workflow and audit logs work;
- analytics are privacy-first;
- security headers, backups, and access controls are configured;
- privacy policy is published;
- legal and security review have begun;
- founder can explain the project accurately in 60 seconds.

---

## 36. Founder 60-Second Pitch

Accountability Atlas is an open-source civic accountability platform that turns verified human-rights, legal, and humanitarian information into structured public understanding and lawful pressure. We begin with Gaza, connecting court records, UN and humanitarian updates, human-rights research, country policy tracking, organization directories, and action templates. Citizens can understand what their governments have done and use responsible pressure routes; journalists and researchers can find source-linked structures; policymakers can receive concise evidence-based briefs. We do not promote hatred, harassment, violence, doxing, or false partnership claims. We document, verify, explain, and help people act lawfully for civilian protection, humanitarian access, and accountability.

---

## 37. Public Disclaimer Draft

> Accountability Atlas is an independent open-source civic documentation and accountability project. It is currently in public static beta and is not yet a registered NGO, charity, legal entity, court, humanitarian organization, or formal partner of any listed organization unless explicitly stated.
>
> The platform does not promote violence, hatred, harassment, doxing, antisemitism, Islamophobia, racism, or collective blame. Its purpose is to organize verified public evidence, support lawful civic action, amplify humanitarian needs, and strengthen accountability under international law.
>
> Public pages may include static previews, draft structures, and source-linked summaries. Factual claims should be sourced where possible, clearly dated, and open to correction.

---

## 38. Appendix — Homepage Copy Baseline

### Hero

**Building public infrastructure against genocide and mass atrocities.**

# Accountability Atlas

**Evidence for protection.  
Action for accountability.**

Accountability Atlas is an open-source platform for organizing verified public evidence, tracking legal and political responsibility, and helping people take lawful action in response to genocide allegations, mass civilian harm, humanitarian obstruction, and atrocity crises.

Starting with Gaza and the wider regional crisis, the platform is being designed as a reusable framework for other urgent contexts where documentation, accountability, and public pressure are needed.

### Why this exists

**Evidence is scattered. Accountability needs structure.**

Genocide allegations and mass-atrocity crises are documented across court filings, humanitarian updates, NGO reports, journalism, archives, statements, and open sources. The information is difficult to navigate and rarely connected to clear lawful action.

### Starting Focus

**Gaza and the wider regional humanitarian crisis.**

The platform will track public evidence, legal proceedings, humanitarian obstruction, country responses, institutional failures, and lawful civic action routes.

### Contributor CTA

**Help build accountability infrastructure.**

Start with one focused issue, one review, one component, one source-policy improvement, or one translation.

---

## 39. Appendix — Safe Action Email Template

**Subject:** Request for action on civilian protection and humanitarian access in Gaza

Dear [Representative Name],

I am writing as a constituent to ask you to support urgent, lawful action to protect civilians in Gaza and uphold international humanitarian law.

I ask you to support:

1. immediate and sustained humanitarian access;
2. protection of civilians, medical workers, journalists, and aid workers;
3. cooperation with lawful international legal processes;
4. transparent review of arms transfers where there is a serious risk of misuse;
5. increased support for verified humanitarian organizations.

This request is based on documented humanitarian reporting, public legal proceedings, and findings from international institutions and human-rights organizations.

Please clarify publicly what steps you and your party will take.

Respectfully,

[Name]  
[City/Region]

Every deployed version must be adapted to the jurisdiction and reviewed.

---

## 40. Appendix — Correction Policy Draft

We welcome corrections. If a page contains inaccurate, outdated, misleading, unsafe, or improperly sourced information, users should be able to submit a correction request.

Each correction is reviewed. Depending on the result, content may be updated, downgraded, disputed, archived, withdrawn, or removed. Major corrections should be logged publicly.

Categories:

- factual error;
- outdated source;
- incorrect date/location;
- unsafe personal information;
- mistranslation;
- legal wording issue;
- broken link;
- duplicate;
- misleading framing;
- licensing/attribution issue.

---

## 41. Appendix — Red-Line Policy

Forbidden:

- private addresses or contact details;
- harassment targets;
- calls for violence or revenge;
- antisemitic, Islamophobic, racist, or collective-blame claims;
- glorification of attacks on civilians;
- unverified accusation pages against private people;
- unsafe witness exposure;
- graphic content without warning and purpose;
- false partnership claims;
- fundraising without verification and legal review;
- presenting AI output as verified evidence;
- using copyrighted media without rights.

---

## 42. Updated Next Immediate Actions

1. Finish landing-page visual, mobile, accessibility, and copy QA.
2. Add `/attributions` and complete image records.
3. Build the complete `/methodology` page.
4. Build `/gaza-dossier` static preview.
5. Build `/legal-tracker` static preview.
6. Build `/countries/belgium` skeleton.
7. Build `/institutions/european-union` skeleton.
8. Build `/organizations` preview.
9. Build `/take-action` preview.
10. Build `/evidence` preview.
11. Build `/press` preview.
12. Add shared page components and static TypeScript data files.
13. Update navigation and footer.
14. Run mobile, keyboard, reduced-motion, contrast, and build checks.
15. Ask three to five trusted reviewers for structured feedback.
16. Record feedback and corrections.
17. Only then finalize backend, database, and admin architecture.

---

## 43. Final Strategic Recommendation

Continue building Accountability Atlas as a **static-first, evidence-led public beta**.

Do not rush into the largest features. Build the trustworthy path in order:

1. Methodology
2. Attributions
3. Gaza dossier preview
4. Legal tracker preview
5. Belgium/EU accountability pages
6. Organization directory
7. Action hub
8. Evidence library
9. Press/resources
10. Static data review
11. Trusted expert feedback
12. Functional backend planning

The landing page now gives the project a recognizable face. The next objective is to make the rest of the site prove that the concept can become useful civic infrastructure.

The goal is not to shout louder than everyone else.

The goal is to make verified evidence easier to understand, harder to ignore, and safer to turn into lawful action.

---

**End of PRD v2.1**