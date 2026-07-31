# Accountability Atlas — Product Requirements Document (PRD v2)

**Project type:** AI-assisted open civic intelligence platform  
**Architecture:** Pipeline-first, organized around information flow  
**Version:** 2.0 — Fresh Start (Pipeline Architecture)  
**Date:** 2026-07-24  
**Primary launch focus:** Gaza and the wider occupied Palestinian territory, with careful coverage of Lebanon and surrounding humanitarian spillover where verified  
**Expansion model:** Modular atrocity-accountability framework for other documented mass-atrocity and humanitarian-crisis contexts  
**Current implementation stage:** Public static beta in progress  
**Current technical mode:** Static-first React/Vite implementation using structured local TypeScript data before backend/database integration  
**Status:** Builder-ready strategic PRD; legal, security, editorial, accessibility, and partner review are still required before broad public launch  
**Code license:** AGPL-3.0-or-later  
**Documentation license:** CC BY-SA 4.0, subject to the exclusions and third-party-material rules in `NOTICE.md`

---

## How to Use This Document

This PRD replaces PRD.md as the canonical product requirements document. PRD.md has been archived as PRD-v1-archive.md.

**What is preserved in PRD-v1-archive.md and not duplicated here:**
- Detailed page-by-page specifications (sections 9–10 of the old PRD)
- SQL schema definitions for the future database (section 16 of the old PRD)
- Risk register (section 30 of the old PRD)
- Build backlog / sprint plans (sections 27–28 of the old PRD)
- Cost estimates (section 32 of the old PRD)
- Specific UI component architecture and file tree (section 15 of the old PRD)

**What is new in this document:**
- Pipeline-first information architecture
- Intelligence Layer specification (AI subsystem)
- Source Registry schema
- Collector Framework specification
- Event-first data standards
- Entity standards
- ADR Index
- Definition of Done by domain

This document is the single source of truth for product architecture, principles, and pipeline design. For page-level implementation details, data models, risk management, and sprint plans, consult PRD-v1-archive.md.

---

## Table of Contents

01. Vision  
02. Mission  
03. Constitutional Principles  
04. User Personas  
05. Information Architecture  
06. Product Architecture (The 6 Layers)  
07. Intelligence Layer  
08. AI Principles  
09. Review Workflow  
10. Source Registry  
11. Collector Framework  
12. Data Standards  
13. Event Standards  
14. Entity Standards  
15. Publication Standards  
16. UI System  
17. Accessibility  
18. Performance  
19. Security  
20. Privacy  
21. Deployment  
22. Roadmap Summary  
23. ADR Index  
24. Definition of Done  

---

## 01. Vision

Accountability Atlas is an open civic intelligence platform that transforms fragmented humanitarian, legal, governmental, academic, and journalistic information into transparent, source-backed, human-reviewed public knowledge.

The platform moves beyond the traditional website model. It is an information processing pipeline — one that ingests raw public data from hundreds of sources, normalizes it into structured records, applies AI-assisted analysis (never AI decision-making), routes everything through human review, and only then publishes to the public layer where citizens, journalists, researchers, policymakers, and civil society can act on it.

The website is not the project. The website is one visible output of a larger intelligence system.

The vision is a world where accountability information is no longer fragmented across a thousand PDFs, press releases, court dockets, and NGO landing pages, but instead flows through open civic infrastructure that preserves source provenance, confidence metadata, and human judgment at every step.

---

## 02. Mission

1. **Organize** fragmented public evidence from humanitarian, legal, governmental, academic, and journalistic sources into structured, machine-readable, human-verifiable records.

2. **Analyze** information using AI-assisted methods that propose — but never decide — translations, summaries, entity extractions, timelines, relationships, contradictions, and confidence estimates.

3. **Review** every item through a human review pipeline before it reaches the public, with defined states, assignments, and quality gates.

4. **Publish** with versioning, correction mechanisms, confidence metadata, and complete source provenance so the public can trust what they see and verify what they doubt.

5. **Enable action** by connecting published knowledge to lawful civic action: contacting representatives, supporting humanitarian access, demanding arms-transfer review, and advocating for legal accountability.

6. **Expand responsibly** by building a reusable framework — not a copy-paste template — that can serve other documented mass-atrocity and humanitarian-crisis contexts with local expertise, legal review, and region-specific safety decisions.

---

## 03. Constitutional Principles

These principles are NON-NEGOTIABLE. They govern every layer of the pipeline, every line of code, every piece of content, every review decision, and every public interaction.

### 03.1 AI Assists Humans. AI Never Publishes.

No automated pipeline may place content on the public website. AI may propose summaries, translations, classifications, and detections. A human must review and approve every item before publication. This is not a technical preference. It is a constitutional constraint.

### 03.2 Humans Remain Accountable

Every published item has a named or attributed human reviewer responsible for its accuracy. No anonymous AI output may be presented as platform fact. The human may be a staff reviewer, a subject-matter expert, or a verified partner, but accountability must trace to a person.

### 03.3 Every Claim Has Provenance

Every factual statement on the platform must be traceable to a specific source. Sources may be public documents, court records, UN reports, NGO findings, academic publications, investigative journalism, or verified institutional data. Statements that cannot be sourced must be clearly labeled as analysis, opinion, or unreviewed lead.

### 03.4 Every Correction Is Public

When content is corrected, the correction must be visible. The original version must remain in the version history. Users must be able to see what changed, when, and why. Silent edits are prohibited.

### 03.5 Every Edit Is Versioned

Every change to published content creates a new version. Versions are immutable. Version history is preserved for the lifetime of the item.

### 03.6 Every Source Remains Traceable

Source URLs, archive URLs (where lawfully and ethically appropriate), access dates, and source types are preserved alongside every claim derived from that source. If a source disappears, the platform preserves the reference and notes the unavailability.

### 03.7 Every Public Statement Has Confidence Metadata

Every published claim carries a confidence indicator derived from source type, verification level, corroboration status, and review history. Confidence may be updated but never removed; old confidence levels remain in the version history.

### 03.8 Privacy by Default; Collect Minimum Necessary Data

The platform collects only the data required to operate. No tracking, no profiling, no unnecessary personal data. Users are not identified unless they choose to contribute in a capacity that requires attribution.

### 03.9 Never Publish AI-Generated Content Directly

AI-generated text, translations, summaries, or analysis must never appear on the public platform without human review and approval. AI output used internally must be clearly marked as AI-generated until human-approved.

### 03.10 Never Create Unsupported Claims

The platform does not create claims. It organizes, analyzes, and presents claims that exist in source material. AI may identify patterns or contradictions across sources, but the resulting analysis must cite the sources from which it was derived.

### 03.11 Always Preserve Source Provenance

No claim may be separated from its source. When a source is removed or corrected, all claims derived from that source must be re-reviewed.

### 03.12 Never Imply Legal Conclusions Beyond Cited Sources

Legal status labels, procedural status, and legal analysis must always cite the specific source (court document, statute, ruling, filing) on which they are based. The platform does not issue its own legal conclusions.

### 03.13 Civilian Protection First

The platform exists to support civilian protection and lawful accountability. It does not promote violence, revenge, harassment, intimidation, or collective blame.

### 03.14 Evidence Before Emotion

Emotion may motivate the project, but public content must speak the language of evidence, law, journalism, parliaments, research, and humanitarian response.

### 03.15 Moral Clarity Without Dehumanization

The platform may clearly oppose atrocity crimes, starvation, forced displacement, collective punishment, attacks on civilians, obstruction of aid, and impunity. It must not dehumanize populations or treat national, ethnic, or religious identity as guilt.

### 03.16 No Hatred, Incitement, Antisemitism, Islamophobia, or Racism

The platform must distinguish between:
- a state and its people;
- a government and a population;
- political or military leadership and civilians;
- legal accountability and revenge;
- criticism of Israeli state policy or Zionism and hatred of Jewish people;
- criticism of armed groups and hatred of Palestinians, Arabs, or Muslims.

### 03.17 No Doxing

Never publish private addresses, private phone numbers, family details, private accounts of non-public individuals, targeting lists, or data that enables harassment. Permitted when relevant and sourced: public officials, official institutions, public voting records, official roles, public court and sanctions records, documented public corporate and arms-transfer information. Prohibited: private soldiers' home details, revenge lists, family members as pressure targets, non-consensual personal data, calls for physical confrontation, "find this person" workflows.

### 03.18 Legal Accountability, Not Vigilante Justice

Action flows must direct users toward lawful pressure such as contacting representatives, ministries, MEPs/MPs, arms-export authorities, universities, councils, journalists, or official humanitarian organizations.

### 03.19 Source Transparency

Every factual claim must be traceable to a public source or clearly labeled as draft, pending review, disputed, or unverified.

### 03.20 Safety by Design

Witnesses, affected communities, contributors, moderators, partners, and users must be protected from unnecessary collection, exposure, retention, and operational risk.

### 03.21 Protection Before Publication

The fact that information is available does not automatically mean it is safe or ethical to republish.

### 03.22 Do Not Pretend Partnership

Organizations are "public resources" until they provide written approval for another relationship label.

### 03.23 Corrections Strengthen Trust

Corrections, status changes, source upgrades, source downgrades, disputes, and removals must be part of the product model. A platform that never admits error is not trusted.

### 03.24 Genocide Terminology Discipline

The word genocide may be used only with precise attribution and procedural context. Acceptable patterns: "Named state brought a Genocide Convention case before the ICJ," "The ICJ issued provisional measures," "Named organization concluded in its dated report that..." Never claim a court has issued a final genocide judgment when it has not. Never collapse allegations, provisional measures, warrants, findings, and convictions into one status.

---

## 04. User Personas

### 04.1 Concerned Citizen

**Needs:** Clear facts, lawful actions, confidence about what is verified.  
**Pain points:** Overwhelming information, difficulty trusting sources, uncertainty about how to help.  
**Platform use:** Reads dossiers, uses action templates, browses evidence with confidence indicators.  
**Pipeline relevance:** End user of published content and action tools.

### 04.2 Activist and Community Organizer

**Needs:** Sourced templates, dossiers, country-specific information, sharable evidence cards.  
**Pain points:** Time spent researching, risk of sharing unverified claims.  
**Platform use:** Downloads briefs, copies action templates, shares evidence cards, organizes events.  
**Pipeline relevance:** End user of published content and action tools.

### 04.3 Journalist and Researcher

**Needs:** Source trails, timelines, datasets, methodology, versioning, concise briefings.  
**Pain points:** Verifying claims, finding original sources, tracking changes.  
**Platform use:** Searches evidence library, downloads dossiers, reviews source provenance, cites platform records.  
**Pipeline relevance:** End user of published content; potential source contributor.

### 04.4 Policymaker and Staffer

**Needs:** Dated, jurisdiction-specific briefs with citations and specific policy asks.  
**Pain points:** Time pressure, need for concise and accurate summaries.  
**Platform use:** Downloads dossiers, reviews country/institution pages, accesses action templates.  
**Pipeline relevance:** End user of published content.

### 04.5 NGO and Humanitarian Organization

**Needs:** Responsible visibility, safe referral traffic, corrections, possible collaboration.  
**Pain points:** Misrepresentation, incorrect listing data.  
**Platform use:** Reviews organization listing, submits corrections, receives referral traffic.  
**Pipeline relevance:** Source partner, data subject, end user.

### 04.6 Legal Worker and Human-Rights Defender

**Needs:** Structured records, legal status, source preservation, review workflows.  
**Pain points:** Fragmented legal information, difficulty tracking multiple proceedings.  
**Platform use:** Reviews legal tracker, examines evidence provenance, monitors case status changes.  
**Pipeline relevance:** Subject-matter reviewer, end user.

### 04.7 Intelligence Analyst (New)

**Needs:** Cross-source analysis, trend detection, contradiction alerts, confidence-weighted data.  
**Pain points:** Manual correlation across hundreds of sources, risk of missing critical updates.  
**Platform use:** Uses intelligence dashboard, reviews AI-suggested relationships and contradictions, examines entity profiles.  
**Pipeline relevance:** Power user of the Intelligence Layer after review.

### 04.8 Reviewer and Editor (New)

**Needs:** Review queue, assignment tools, version comparison, source verification, approval workflows.  
**Pain points:** Cognitive load of reviewing atrocity material, need for clear workflows.  
**Platform use:** Works in review interface, approves/rejects/revisions AI proposals, assigns content to subject-matter experts.  
**Pipeline relevance:** Gatekeeper between AI analysis and publication.

### 04.9 Collector Developer (New)

**Needs:** Collector framework documentation, testing tools, monitoring dashboards, error alerts.  
**Pain points:** Source API changes, parsing failures, deduplication complexity.  
**Platform use:** Develops and maintains collector scripts, monitors fetch health, validates normalization output.  
**Pipeline relevance:** Operates the Collection and Normalization layers.

### 04.10 Academic Researcher

**Needs:** Data exports, methodology transparency, citation support, longitudinal analysis.  
**Pain points:** Difficulty accessing structured humanitarian/legal data.  
**Platform use:** Accesses API, downloads datasets, cites platform methodology.  
**Pipeline relevance:** Power user, potential reviewer, potential source contributor.

### 04.11 Open-Source Contributor

**Needs:** Clear contribution paths, good first issues, documentation, code of conduct.  
**Pain points:** Finding safe entry points in a sensitive project.  
**Platform use:** Submits code, documentation, translations, and data improvements.  
**Pipeline relevance:** Builds and maintains the technical platform.

---

## 05. Information Architecture

Accountability Atlas is organized around information flow, not pages. The entire product is a pipeline with defined stages, each with inputs, processes, outputs, and quality gates.

### 05.1 The Pipeline

The information pipeline has nine stages. Every piece of information that reaches the public must pass through all of them.

```
Sources → Collection → Normalization → AI Intelligence → Human Review → Publication → Public Platform → Action → Impact
```

### 05.2 Stage Descriptions

#### Stage 1: Sources

Information originates from external sources. Every source has a registry entry with trust level, verification status, monitoring configuration, and health indicators.

**Source types:** Court records (ICJ, ICC, national courts), UN documents (OCHA, OHCHR, UNRWA, UNDP), humanitarian organizations (ICRC, MSF, Red Cross/Red Crescent), NGOs (Amnesty, HRW, B'Tselem, Al-Haq), investigative journalism, academic publications, open data portals (government, EU), official public statements, parliamentary records, arms-transfer registries, sanctions databases.

**Source Registry schema:** See Section 10.

**Quality gate:** A source is valid for collection only when it has a registry entry with a trust level assigned and a fetch configuration defined.

#### Stage 2: Collection

Collectors fetch data from sources according to defined schedules and protocols.

**Collector types:** RSS feeds, API clients (REST, GraphQL), web scrapers (with terms-of-service compliance), file downloaders (PDF, CSV, JSON), email ingestion (future).

**Collector framework:** See Section 11.

**Output:** Raw fetched data, source-identified, date-stamped, format-tagged.

**Quality gate:** Every fetch is validated for completeness, freshness, and structural integrity. Failed fetches are logged and alerted.

#### Stage 3: Normalization

Raw data from diverse sources is normalized into a unified record format. This is the layer where heterogeneity is absorbed.

**Normalized record types:**
- `NormalizedSourceRecord` — A single item from a source (article, report, press release, filing)
- `EventRecord` — A normalized event extracted from one or more source records
- `EntityRecord` — A person, organization, country, institution, or legal case
- `EvidenceRecord` — A specific factual claim with confidence and source binding

**Normalization operations:** Format conversion, field mapping, date standardization, language detection, encoding normalization, deduplication against existing records.

**Output:** Structured records in the unified schema, ready for AI processing.

**Quality gate:** Every record must pass schema validation. Partial records are flagged for human attention.

#### Stage 4: AI Intelligence

Normalized records are processed by the AI subsystem. AI proposes, it never decides.

**AI operations:** Translation, summarization, entity extraction, date extraction, organization extraction, location extraction, topic classification, duplicate suggestion, relationship suggestion, contradiction detection, confidence estimation, timeline extraction, geographic extraction.

**Output:** AI-enriched records with proposed annotations, suggestions, and confidence scores. Every AI output includes the model version used and a confidence estimate.

**Quality gate:** AI output is always marked as `ai_proposed`. No AI output automatically transitions to any other state. Human review is mandatory for all proposals.

#### Stage 5: Human Review

Every AI-enriched record enters the review queue. Humans review proposals, accept/reject/modify, and advance records toward publication.

**Review states:** New, Reviewing, Approved, Rejected, Revision Requested.

**Review types:** Source verification, evidence review, legal review, editorial review, translation review, country review, institution review.

**Assignment:** Reviewers are assigned by expertise, language, region, and workload. No reviewer reviews their own proposals.

**Quality gate:** Nothing reaches the public without human approval. High-risk content requires multiple reviewers.

#### Stage 6: Publication

Approved records are published with full provenance, versioning, and confidence metadata.

**Publication states:** Static Preview, Published, Versioned, Archived, Corrected, Deprecated.

**Publication includes:** Human reviewer attribution, source links, confidence indicators, publication date, version number, correction history link.

**Quality gate:** Publication requires completed review, source check, date check, legal-status check, safety check, language check, correction path, methodology link, version record.

#### Stage 7: Public Platform

The public-facing website. This is one output of the pipeline, not the entire project.

**Platform components:** Search, maps, timelines, dossiers, action tools, evidence library, country pages, legal tracker, organization directory.

**Platform characteristics:** Static-first, progressively enhanced, privacy-preserving, accessibility-driven (WCAG 2.2 AA), multilingual, security-hardened.

#### Stage 8: Action

Users apply published information to lawful civic action.

**Action types:** Contact representatives, demand arms-transfer review, support humanitarian access, send dossiers to journalists, submit corrections, volunteer, participate in lawful campaigns.

**Action characteristics:** Jurisdiction-specific, source-backed, polite but firm, non-harassing, manually reviewed templates.

#### Stage 9: Impact

The feedback loop. Information about action outcomes, source updates, corrections, and new developments flows back into the pipeline.

**Impact types:** Correction submissions, source change detection, reviewer feedback, user engagement metrics (privacy-preserving), outcome tracking.

**Impact loop:** Impact data informs source priority, collector configuration, review assignments, and public content updates.

### 05.3 Pipeline Rules

1. **No shortcuts.** Every item must pass every stage. There is no express lane to publication.
2. **No automatic transitions.** Every stage transition requires human initiation or explicit configuration. No timer-based publication.
3. **Audit trail.** Every transition is logged with actor, timestamp, and rationale.
4. **Rollback.** Any item can be returned to an earlier stage if problems are found.
5. **Confidence accumulation.** Each stage adds or modifies confidence metadata. Confidence never decreases automatically; it is updated by human review.
6. **Bidirectional flow.** Impact stage feeds back into Sources and Collection stages, creating a learning system.

---

## 06. Product Architecture (The 6 Layers)

The pipeline is implemented as six architectural layers. Each layer maps to one or more pipeline stages.

### Layer 1: Collection

**Pipeline stages:** Sources, Collection

**Components:**
- **Source Registry** — Database of all known sources with trust levels, fetch configurations, and health monitoring (see Section 10).
- **Collector Framework** — Standardized interface for all data fetchers. Every collector implements: `Collector → Fetch → Validate → Normalize → Deduplicate → Store → Route to AI`.
- **Collector instances:** ICJ Collector, ICC Collector, OHCHR Collector, OCHA Collector, EU Collector, Belgium Government Collector, NGO Report Collector, Journalism Feed Collector, Academic Publication Collector, Open Data Portal Collector.
- **Health monitor** — Tracks fetch success rates, freshness, schema compliance, and error rates per source.

**Inputs:** URLs, API endpoints, RSS feeds, file locations.  
**Outputs:** `RawFetchRecord` with source ID, fetch timestamp, raw content, content type, size, checksum.

**Key requirements:**
- Every collector respects robots.txt, terms of service, and rate limits.
- Every fetch is logged with duration, byte count, status code, and error state.
- Failed fetches retry with exponential backoff, then alert.
- Collectors run on schedules defined per source (not one-size-fits-all).
- No collector stores credentials in code. Secrets are in a secure vault.

### Layer 2: Normalization

**Pipeline stage:** Normalization

**Components:**
- **Format adapter** — Converts raw content (HTML, PDF, CSV, JSON, XML, RSS) to internal representation.
- **Schema mapper** — Maps source-specific fields to canonical field names.
- **Date normalizer** — Detects and standardizes dates across timezones and formats.
- **Language detector** — Identifies source language for routing.
- **Deduplicator** — Checks incoming records against existing `NormalizedSourceRecord` entries by URL hash, content fingerprint, and title similarity.
- **Metadata extractor** — Extracts author, publication date, source URL, archive URL, license, and other metadata.

**Inputs:** `RawFetchRecord`.  
**Outputs:** `NormalizedSourceRecord`, or deduplication link to existing record.

**Key requirements:**
- Normalization must never lose data. Unmappable fields are preserved in an `extensions` JSON field.
- Schema validation is strict at this layer. Records that fail validation are quarantined for human inspection.
- Deduplication uses deterministic matching first (exact URL, exact checksum), then approximate matching (title similarity, content overlap).
- Every normalized record preserves a link back to its `RawFetchRecord`.

### Layer 3: AI Intelligence

**Pipeline stage:** AI Intelligence

**Components:**
- **Translation engine** — Translates non-English source text to English (where needed) while preserving original in the record.
- **Summarization engine** — Generates concise summaries at configurable lengths.
- **Entity recognition** — Extracts persons, organizations, locations, dates, legal cases, statutes.
- **Claim extraction** — Identifies factual assertions in source text.
- **Topic classification** — Assigns topics from controlled vocabulary (see Section 12).
- **Duplicate detection** — Suggests duplicate records across sources.
- **Relationship detection** — Identifies relationships between entities, events, and evidence items.
- **Contradiction detection** — Flags statements that contradict other reviewed content.
- **Confidence estimation** — Estimates confidence for each extraction based on source clarity, language, and model confidence.
- **Timeline extraction** — Extracts chronological sequences from narrative text.
- **Geographic extraction** — Extracts locations with coordinate resolution where safe.

**Inputs:** `NormalizedSourceRecord`.  
**Outputs:** `AIEnrichedRecord` with proposed fields from all AI operations.

**Key requirements:**
- Every AI output includes `model_version`, `confidence_score`, `proposed_at` timestamp.
- Every AI output is clearly labeled `ai_proposed` until human-reviewed.
- AI never modifies the original `NormalizedSourceRecord`; proposals are stored in a separate annotation layer.
- AI never deletes or overwrites data.
- All AI processing is auditable per record.

Detailed specification: See Section 07 (Intelligence Layer) and Section 08 (AI Principles).

### Layer 4: Human Review

**Pipeline stage:** Human Review

**Components:**
- **Review Queue** — Items pending review, ordered by priority, type, and reviewer expertise.
- **Assignment Manager** — Routes items to reviewers based on expertise, language, region, workload, and conflict-of-interest checks.
- **Review Interface** — Side-by-side view of source, AI proposals, and current record. Reviewer can accept, reject, or modify each proposal.
- **Review types:**
  - **Source verification** — Is the source authentic, correctly attributed, and accurately represented?
  - **Evidence review** — Is the factual claim supported by the source?
  - **Legal review** — Is legal terminology precise and properly attributed? Are status labels correct?
  - **Editorial review** — Is language calm, precise, non-hateful, non-inciting?
  - **Translation review** — Is the translation accurate and appropriate for the target audience?
  - **Country review** — Are country-specific claims accurate and current?
  - **Institution review** — Are institution-specific claims accurate and current?
- **Dispute resolution** — Process for resolving conflicting reviews. Multiple reviewers, senior reviewer override, or escalation to editorial board.

**Inputs:** `AIEnrichedRecord`.  
**Outputs:** `ReviewedRecord` with reviewer attribution, review timestamp, decisions per proposal, and notes.

**Key requirements:**
- No item can skip review. Zero exceptions.
- High-risk content (legal claims, casualty numbers, allegations against individuals) requires at least two independent reviewers.
- Reviewers are never assigned to content they proposed or sourced.
- Reviewer identities are protected where needed. Internal attribution exists; public attribution is optional and chosen by the reviewer.
- Review decisions are logged immutably.

Detailed specification: See Section 09 (Review Workflow).

### Layer 5: Publication

**Pipeline stage:** Publication

**Components:**
- **Publication Manager** — Transitions reviewed records to published state, assigns version, generates public URLs.
- **Version Controller** — Creates immutable version snapshots. Every change increments the version.
- **Status Manager** — Manages publication states: Static Preview, Published, Versioned, Archived, Corrected, Deprecated.
- **Correction Engine** — Processes correction submissions, links corrections to the corrected records, updates status, creates new versions.
- **Pre-publish check pipeline:**
  1. Source check — reliable source attached
  2. Date check — information is current or clearly dated
  3. Legal-status check — allegation, proceeding, ruling, warrant, finding, NGO determination are distinguished
  4. Safety check — no unsafe personal or location data
  5. Language check — calm, precise, non-hateful, non-inciting wording
  6. Correction path — users can report errors
  7. Methodology link — relevant policy is accessible
  8. Version check — change date and page version recorded

**Inputs:** `ReviewedRecord`.  
**Outputs:** Published item with `published_at`, `version`, `status`, `confidence`, source links, reviewer attribution, correction link.

**Key requirements:**
- Published content is immutable in its current version. Changes create new versions.
- Old versions remain accessible via version history.
- Corrections are linked from the corrected item and visible as part of the version history.
- Deprecated items display a clear warning and link to the replacement or explanation.

Detailed specification: See Section 15 (Publication Standards).

### Layer 6: Public Platform

**Pipeline stage:** Public Platform, Action, Impact

**Components:**
- **Website** — The public-facing interface built on published data.
- **Search** — Full-text search across published items with filters for source type, verification level, date range, location, topic, and language.
- **Maps** — Geographic visualization of events and evidence at safe precision levels.
- **Timelines** — Chronological views of events, legal proceedings, and evidence.
- **Dossiers** — Exportable, versioned evidence packs for defined audiences.
- **Evidence Library** — Structured, searchable, source-graded archive of published evidence.
- **Country Pages** — Accountability profiles showing positions, votes, actions, and pressure routes.
- **Legal Tracker** — Status dashboard for international, national, and institutional legal processes.
- **Organization Directory** — Curated directory of humanitarian, legal, and civil-society organizations with transparent relationship labels.
- **Action Tools** — Jurisdiction-specific action templates, contact routes, and dossier sharing.
- **Correction submission** — Public form to report errors, outdated information, or safety concerns.

**Inputs:** Published records from Layer 5.  
**Outputs:** Public web pages, API responses, downloadable files, email drafts, social share cards.

**Key requirements:**
- The public platform is one output of the pipeline, not the entire project.
- All public data is read from the publication layer, never directly from normalization or AI layers.
- The platform is designed for progressive enhancement. Core content is accessible without JavaScript.
- The platform serves static-first with dynamic enhancements.
- All user interactions (search, navigation, downloads) are privacy-preserving.

---

## 07. Intelligence Layer

The Intelligence Layer is the AI subsystem of Accountability Atlas. Its design is governed by one absolute rule: **AI proposes. Humans decide.**

### 07.1 Architecture

Every item processed by the Intelligence Layer follows this flow:

```
NormalizedSourceRecord
    → Article detected (text, not media)
    → Translate to English (if needed)
    → Extract entities (persons, organizations, locations)
    → Extract dates (event dates, publication dates)
    → Extract organizations (named entities with type)
    → Extract locations (with safe precision)
    → Generate summary (short, medium, full)
    → Suggest duplicates (against existing records)
    → Suggest relationships (entity-event, event-event, entity-entity)
    → Classify topics (from controlled vocabulary)
    → Extract timeline (chronological sequence)
    → Detect contradictions (against reviewed content)
    → Estimate confidence (per extraction)
    → Package as AIEnrichedRecord
    → Route to Review Queue
```

### 07.2 Component Specifications

#### 07.2.1 Translation Engine

**Input:** Source text in any language.  
**Output:** English translation + `source_language` + `model_id` + `confidence`.  
**Rules:**
- Original text is always preserved in the record.
- Translation is `ai_proposed` until human-reviewed.
- High-risk content (legal filings, witness statements, casualty reports) requires human translation review.
- Low-risk content (general NGO reports, news articles) may be published with AI translation after editorial review.

#### 07.2.2 Summarization Engine

**Input:** Source text.  
**Output:** Short summary (1-2 sentences), medium summary (1 paragraph), full summary (3-5 paragraphs).  
**Rules:**
- Summaries are always attributed to the source item.
- Summaries never omit critical context (legal status, disputed claims, methodological limitations).
- AI-generated summaries are `ai_proposed` until human-reviewed.
- Summaries of legal documents must be reviewed by a legal reviewer before publication.

#### 07.2.3 Entity Recognition

**Input:** Source text.  
**Output:** `Entity` list with `type`, `name`, `mention_count`, `confidence`, `context_snippet`.  
**Entity types:** Person, Organization, Country, Institution, LegalCase, Statute, Location.  
**Rules:**
- Entities are linked to `EntityRecord` where one exists.
- New entities are proposed for creation but require human approval.
- Entity recognition includes disambiguation (e.g., "Jordan" as country vs. person).

#### 07.2.4 Claim Extraction

**Input:** Source text.  
**Output:** `Claim` list with `text`, `confidence`, `source_span`, `claim_type`.  
**Claim types:** Factual assertion, Legal allegation, Humanitarian condition, Policy position, Statistical claim, Temporal claim, Causal claim.  
**Rules:**
- Claims are never published directly. They are inputs to evidence items, dossiers, and timelines.
- Claims are always source-bound. A claim without a source span is rejected.

#### 07.2.5 Topic Classification

**Input:** Source text.  
**Output:** Topic tags from controlled vocabulary.  
**Controlled vocabulary:**
- Civilian casualties, Hospital/clinic attack, School attack, Shelter attack, Aid obstruction, Forced displacement, Detention, Torture allegation, Mass graves, Incitement, Arms transfers, Humanitarian access, Ceasefire violation, Cultural property destruction, Journalist attack, Medical worker attack, UNRWA operations, ICJ proceeding, ICC investigation, Universal jurisdiction, Sanctions, Parliamentary inquiry, Arms export review, Humanitarian funding, Refugee protection.

#### 07.2.6 Duplicate Detection

**Input:** NormalizedSourceRecord.  
**Output:** List of `SuggestedDuplicate` records with `match_type` (exact, near-exact, topical).  
**Rules:**
- Exact URL matches are auto-linked.
- Content similarity matches are suggested for human review.
- Duplicate suggestions can be confirmed or rejected by reviewers.

#### 07.2.7 Contradiction Detection

**Input:** New AIEnrichedRecord + existing published/approved records.  
**Output:** List of `SuggestedContradiction` with `contradicted_item_id`, `claim_summary`, `source_excerpt`, `confidence`.  
**Rules:**
- Contradictions are flagged but not resolved by AI.
- A human reviewer determines whether a true contradiction exists, and if so, how to represent it.
- Contradictions may be resolved by source hierarchy (higher-weight source prevails) or may be presented as open disputes.

#### 07.2.8 Confidence Estimation

**Every AI operation outputs a confidence score** (0.0–1.0) representing the model's confidence in its own output. These scores are indicative, not authoritative. Human review may override.

**Factors in confidence estimation:** Source text clarity, language model confidence, cross-validation across models, extraction specificity, ambiguity level.

### 07.3 Processing Rules

1. **AI never decides.** No AI output changes the state of any record without human action.
2. **AI never publishes.** No AI output appears on the public platform without human review.
3. **AI never deletes.** AI may suggest deduplication or deprecation, but only humans may execute.
4. **AI never overwrites human decisions.** Human-reviewed content takes precedence over AI proposals.
5. **AI is versioned.** Every AI output records the model version, prompt template version, and timestamp.
6. **AI is observable.** Every AI action is logged and auditable.
7. **AI may be overridden.** Human reviewers may reject, modify, or ignore any AI proposal.
8. **AI is configured per source type.** Different source types may receive different AI processing pipelines (e.g., legal filings receive deeper entity extraction; humanitarian reports receive more geographic extraction).

### 07.4 Technology Agnosticism

The Intelligence Layer is designed to be model-agnostic. It may use:
- Local models (small, task-specific) for privacy-sensitive or latency-critical operations.
- Remote API models (via authenticated, logged API calls) for complex operations.
- Multiple models for cross-validation.

The architecture accommodates model changes without pipeline redesign.

---

## 08. AI Principles

### 08.1 Core AI Rules

1. **AI assists humans. AI never publishes.** This is the first rule and the hardest boundary. No automated pipeline places content on the public website.

2. **Every AI output is labeled.** AI proposals are always marked `ai_proposed` with model version, confidence score, and timestamp. Users and reviewers can always distinguish AI output from human output.

3. **AI is not a source.** The AI model itself is not a source. All AI outputs derive from source documents. The source documents, not the AI, are the evidence.

4. **AI does not make legal determinations.** AI may extract legal status from source documents. AI may not determine, infer, or suggest legal conclusions beyond what is stated in cited sources.

5. **AI does not identify individuals for targeting.** Entity extraction is limited to public figures, officials, institutional roles, and legally relevant parties. No extraction of private individuals, witnesses without consent, or potential targeting subjects.

6. **AI does not analyze protected characteristics.** No extraction or classification based on race, religion, ethnicity, sexual orientation, gender identity, or other protected characteristics except where explicitly and necessarily present in source documents for factual reporting.

7. **AI is audited.** All AI operations are logged with input, output, model, timestamp, and requesting component. Regular audits check for bias, drift, hallucination rate, and compliance with these principles.

8. **AI is tested for bias.** Model outputs are regularly tested for:
   - Demographic bias in entity recognition
   - Linguistic bias in translation
   - Framing bias in summarization
   - Source-type bias in confidence estimation
   - Geographic bias in topic classification

9. **AI respects privacy.** AI processing of personal data (as defined by GDPR) is minimized. Where processing is necessary, it is logged, justified, and subject to retention limits.

10. **AI is transparent.** The platform publishes a clear description of:
    - What AI is used for
    - What AI is not used for
    - Which models are in use
    - How human review works
    - How to challenge AI-influenced content

### 08.2 Permitted AI Uses

AI may assist with:
- First-draft summaries of public reports
- Translation of low-risk public text
- Entity extraction and disambiguation
- Topic classification and tagging
- Duplicate detection and suggestion
- Relationship detection between entities and events
- Timeline extraction from narrative sources
- Geographic extraction with safe precision
- Contradiction detection across sources
- Search and retrieval augmentation
- Admin search
- Draft action templates
- First-draft briefs for human review

### 08.3 Prohibited AI Uses

AI must never be final authority for:
- Legal conclusions of any kind
- Casualty counts or death toll determinations
- Witness verification or credibility assessment
- Identity confirmation
- Image or video authenticity determination
- Accusations against individuals
- High-risk translation (testimony, legal findings, casualty reports) without human review
- Publication status decisions
- Content moderation decisions
- Automated responses to correction submissions
- Any decision that would, if wrong, cause safety, legal, or reputational harm to an individual or community

### 08.4 Human Oversight Requirements

- Every AI-assisted publication has a human reviewer with attribution (named or pseudonymous).
- High-risk content requires multiple independent human reviewers.
- AI-generated text must be clearly indicated in draft until human-approved.
- Internal users receive explicit hallucination warnings when using AI tools.
- Model version and prompt template are recorded for every AI-assisted publication.
- Annual independent review of AI system compliance with these principles.

### 08.5 Model Selection Criteria

Models used in the Intelligence Layer must be evaluated against:
- **Factuality:** Hallucination rate, source adherence, verifiability of outputs.
- **Bias:** Demographic, linguistic, geographic, and topical bias testing.
- **Privacy:** Data retention policies, training data provenance, inference privacy.
- **Security:** Model access controls, output injection resistance, prompt injection resistance.
- **Transparency:** Model card availability, training data disclosure, capability boundaries.
- **Cost:** Operational sustainability for projected volume.

---

## 09. Review Workflow

### 09.1 Review States

Every item in the review system exists in one of these states:

```
New → Reviewing → Approved → Published → Corrected → Deprecated
            ↘ Rejected ↗
            → Revision Requested
```

| State | Description |
|---|---|
| **New** | Entered the system. No reviewer assigned. Visible in queue. |
| **Reviewing** | Assigned to a reviewer. In progress. |
| **Approved** | Review completed. Ready for publication. |
| **Rejected** | Review completed. Not suitable for publication. Reason recorded. |
| **Revision Requested** | Changes needed before approval. Reviewer provides notes. |
| **Published** | Approved and published. Visible on public platform. |
| **Corrected** | Published item with one or more corrections applied. New version created. |
| **Deprecated** | Item withdrawn or replaced. Deprecation reason and replacement link shown. |

### 09.2 Review Types

| Review Type | Scope | Minimum Reviewers |
|---|---|---|
| Source verification | Authenticity, attribution, representation accuracy | 1 |
| Evidence review | Factual support, source alignment | 1 |
| Legal review | Legal terminology, status labels, procedural accuracy | 1 (2 for high-risk) |
| Editorial review | Tone, clarity, precision, safety, policy compliance | 1 |
| Translation review | Accuracy, cultural appropriateness | 1 (native speaker) |
| Country review | Country-specific claim accuracy | 1 (regional expert) |
| Institution review | Institution-specific claim accuracy | 1 (institution expert) |

### 09.3 Review Queue

The review queue presents items prioritized by:

1. **Priority tier:** Critical (safety/legal), High (time-sensitive), Medium (standard), Low (background).
2. **Age:** Time since entry into queue (older items float up within tier).
3. **Reviewer match:** Items matching a reviewer's expertise, language, and region are surfaced first.

Queue views:
- My queue (assigned to me)
- Unassigned (available for pickup)
- All (supervisor view)

### 09.4 Assignment Rules

- **Self-assignment:** Reviewers may pick items matching their expertise from the unassigned queue.
- **Directed assignment:** Leads may assign specific items to specific reviewers.
- **Conflict avoidance:** No reviewer reviews content they sourced, proposed, or have a personal stake in.
- **Load balancing:** Assignment considers current reviewer workload and capacity.
- **Rotation:** High-risk content reviewers have defined rotation schedules to prevent burnout.

### 09.5 Review Interface

The review interface presents:

1. **Source panel:** Original source document (or link to it) with metadata.
2. **AI proposals panel:** AI-generated summaries, entities, classifications, relationships, with accept/reject/modify controls per proposal.
3. **Record panel:** Current state of the record being reviewed.
4. **Decision panel:** Approve, Reject (with reason), Request Revision (with notes), or Escalate.
5. **Safety check:** Checklist before approval confirmation.

### 09.6 Review Completion Requirements

Before an item transitions to `Approved`:

- [ ] Source verified as authentic and correctly attributed
- [ ] All factual claims supported by source
- [ ] Legal terminology checked and precise
- [ ] No unsafe personal or location data
- [ ] Language is calm, precise, non-hateful, non-inciting
- [ ] AI proposals accepted/rejected/modified as appropriate
- [ ] Confidence score reviewed and adjusted if needed
- [ ] Correction path exists for the published item
- [ ] Methodology link added or verified
- [ ] Version recorded (first version for new items, incremented for corrections)

### 09.7 Reviewer Wellbeing

- **Opt-in:** Reviewers choose which content categories they handle.
- **Rotation:** High-risk content reviewers have recommended maximum session lengths.
- **Permission to stop:** Any reviewer may stop reviewing at any time without explanation.
- **Content warnings:** Review interface shows content category and trigger warnings before item loads.
- **Separation:** General contributors and high-risk reviewers have different queues and workloads.
- **Support:** Mental-health and peer-support guidance available where capacity permits.

---

## 10. Source Registry

The Source Registry is the authoritative database of all information sources used by the platform. It replaces the simple "URL" model with a comprehensive schema.

### 10.1 Source Registry Schema

```
SourceRecord {
    id: UUID (primary, immutable)
    name: string (human-readable, e.g., "ICJ Press Releases RSS")
    publisher: PublisherRecord (the organization responsible)
    type: SourceType (rss, api_rest, api_graphql, web_scraper, file_download, email)
    url: string (primary fetch URL)
    alternative_urls: string[] (failover URLs)
    
    // Trust & Verification
    trust_level: TrustLevel (tiered 1-5, see Section 10.2)
    verification_status: VerificationStatus (unverified, pending, verified, degraded)
    verification_date: datetime
    verification_notes: text
    
    // Licenses & Usage
    license: LicenseType (public_domain, cc_by, cc_by_sa, cc_by_nc, fair_use, custom, unknown)
    license_url: string
    usage_terms: text (free-form)
    attribution_required: boolean
    attribution_template: text (e.g., "Source: {publisher} ({url})")
    
    // Fetch Configuration
    fetch_frequency: cron_expression
    fetch_format: FetchFormat (rss, atom, json, xml, html, pdf, csv)
    fetch_parameters: JSON (API keys referenced by vault key, not stored inline)
    fetch_headers: JSON
    fetch_timeout_seconds: int (default 30)
    retry_policy: RetryPolicy (count, backoff_factor, max_backoff)
    
    // Source Metadata
    language: ISO-639-1 code
    region: string (geographic scope)
    category: SourceCategory (court, un, government, ngo, journalism, academic, open_data, humanitarian, legal)
    subcategories: string[]
    tags: string[]
    
    // Reliability & Monitoring
    reliability_notes: text
    last_checked: datetime
    last_successful_fetch: datetime
    last_failure: datetime
    consecutive_failures: int
    health_status: HealthStatus (healthy, degraded, down, unreachable)
    health_check_url: string
    health_check_interval: cron_expression
    automation_level: AutomationLevel (manual, semi_automated, fully_automated)
    
    // Governance
    collector_id: string (references a specific collector implementation)
    parser_module: string (module path for content parsing)
    is_active: boolean
    deactivated_at: datetime
    deactivation_reason: text
    created_at: datetime
    updated_at: datetime
    created_by: UUID (reviewer reference)
}
```

### 10.2 Trust Levels

| Level | Name | Meaning | Examples |
|---|---|---|---|
| 5 | Institutional/legal record | Official court, government, or treaty-body record | ICJ rulings, ICC filings, UN resolutions, national legislation |
| 4 | Trusted organization verified | Verified report from a recognized institution | Amnesty, HRW, MSF, ICRC, OCHA official reports |
| 3 | Corroborated | Supported by independent sources | Multiple NGO reports on same incident |
| 2 | Source checked | Identity, date, provenance, and context verified | A journalist report whose author and context are verified |
| 1 | Unreviewed lead | Discovered but not verified | Social media post, unverified submission |

### 10.3 Publisher Record

```
PublisherRecord {
    id: UUID
    name: string
    type: PublisherType (court, government, un_agency, ngo, humanitarian, academic, journalistic, corporate)
    country: string
    website: string
    description: text
    trust_baseline: TrustLevel
    is_state_actor: boolean
    is_international_organization: boolean
    relationship_status: RelationshipStatus (public_resource, contacted, confirmed, verified_partner)
    notes: text
}
```

### 10.4 Source Registry Governance

- New sources require approval by a source verification reviewer.
- Source trust levels are reviewed annually, or when significant new information about the source emerges.
- Degraded sources (consecutive failures, outdated content, changed editorial standards) are flagged for re-review.
- Source deactivation is logged with reason and requires lead reviewer approval.
- The Source Registry is itself versioned. Changes to source records are tracked.

---

## 11. Collector Framework

Every collector in the system follows an identical framework. No exceptions.

### 11.1 Collector Lifecycle

```
Collector → Fetch → Validate → Normalize → Deduplicate → Store → Route to AI
```

Every collector implements:

```
interface Collector {
    id: string;
    sourceId: UUID;
    schedule: cron;
    
    async fetch(): Promise<RawFetchResult>;
    async validate(raw: RawFetchResult): Promise<ValidationResult>;
    async normalize(raw: RawFetchResult): Promise<NormalizedSourceRecord[]>;
    async deduplicate(records: NormalizedSourceRecord[]): Promise<DedupResult>;
    async store(result: DedupResult): Promise<StoreResult>;
    async route(result: StoreResult): Promise<RouteResult>;
}
```

### 11.2 Collector Types

| Collector | Sources | Frequency | Format |
|---|---|---|---|
| **ICJ Collector** | ICJ website, press releases, case documents | Daily | HTML, PDF |
| **ICC Collector** | ICC website, situation pages, warrant notices | Daily | HTML, PDF |
| **OHCHR Collector** | OHCHR reports, press releases, country pages | Daily | HTML, PDF |
| **OCHA Collector** | OCHA situation reports, humanitarian updates, data portals | Multiple times daily | HTML, JSON, PDF |
| **EU Collector** | EU Council decisions, Commission statements, Parliament resolutions, EEAS | Daily | HTML, PDF, XML |
| **Belgium Government Collector** | Federal government press releases, foreign affairs, parliament | Daily | HTML, PDF |
| **NGO Report Collector** | Reports from Amnesty, HRW, B'Tselem, Al-Haq, MSF, etc. | Weekly | HTML, PDF |
| **Journalism Feed Collector** | RSS/Atom feeds from verified news sources | Continuous | RSS, Atom |
| **Academic Publication Collector** | Academic journals, papers, preprints | Weekly | HTML, PDF |
| **Open Data Collector** | Government open data portals, UN data, World Bank | Weekly | CSV, JSON, XML |

### 11.3 Fetch Standards

- Every fetch records: start time, end time, HTTP status, byte count, error state.
- Rate limiting is configured per source and enforced by the collector framework.
- Failed fetches retry: count 3, backoff factor 2, max backoff 1 hour.
- Fetch timeouts are configurable per source type.
- Fetches respect robots.txt, terms of service, and rate-limit headers.
- Fetched content is stored as `RawFetchRecord` before any processing.

### 11.4 Validation Standards

- **Structural validation:** Does the fetched content match the expected format (valid XML for RSS, valid JSON for API)?
- **Completeness validation:** Is the content non-empty? Does it contain required fields?
- **Freshness validation:** Is the content newer than the last successful fetch?
- **Policy validation:** Does the content match the expected source type?
- **Safety validation:** Does the content contain indicators of compromise, injection attempts, or malformed data?

### 11.5 Normalization Standards

Every normalized record includes:
- `source_id` — Link to Source Registry entry
- `source_url` — Original URL
- `fetched_at` — When the raw data was fetched
- `normalized_at` — When normalization occurred
- `title` — Normalized title (HTML-entities decoded, whitespace collapsed)
- `body_text` — Plain text content
- `body_html` — Original HTML content (where applicable)
- `author` — Extracted author or publisher name
- `published_at` — Publication date from source
- `language` — Detected language
- `topics` — Extracted or inherited topic tags
- `checksum` — Hash of body text for deduplication

### 11.6 Deduplication Standards

- **Exact deduplication:** By URL, by checksum. Auto-linked.
- **Near-exact deduplication:** Content similarity >95%. Proposed to human for confirmation.
- **Topical deduplication:** Same event/topic from different sources. Proposed as related items, not duplicates.
- **Cross-source deduplication:** When multiple sources report the same event, they are linked to a single `EventRecord`.

### 11.7 Collector Monitoring

Each collector reports:
- Last successful fetch time
- Last failure time and reason
- Records collected in last 24h, 7d, 30d
- Average fetch duration
- Error rate
- Bytes transferred
- Queue depth (records awaiting AI processing)

Alerts fire when:
- Fetch fails 3+ consecutive times
- Records drop to zero for 2+ scheduled cycles
- Fetch duration exceeds 2x baseline
- Source returns 4xx or 5xx status

### 11.8 Adding a New Collector

To add a new source:
1. Create Source Registry entry.
2. Implement the `Collector` interface for the source.
3. Write normalization rules for the source format.
4. Configure fetch schedule in registry.
5. Test with dry-run mode (fetch, normalize, store — no AI routing).
6. Activate and monitor for 7 days before enabling AI routing.

---

## 12. Data Standards

The platform uses four core normalized record types. These are the canonical data shapes that flow through the pipeline.

### 12.1 NormalizedSourceRecord

Represents a single item from a source: an article, report, press release, court filing, or other document.

```
NormalizedSourceRecord {
    id: UUID
    source_id: UUID (references SourceRegistry)
    source_url: string
    archive_url: string (optional, where permitted)
    
    // Core content
    title: string
    body_text: string
    body_html: string (optional, preserved from source)
    summary: string (AI-generated, ai_proposed)
    
    // Attribution
    author: string (extracted)
    publisher: string (from SourceRegistry)
    published_at: datetime
    retrieved_at: datetime
    
    // Classification
    language: ISO-639-1
    topics: string[] (from controlled vocabulary)
    source_type: SourceTypeLabel
    document_type: DocumentType (report, press_release, legal_filing, resolution, statement, article, dataset)
    
    // Processing metadata
    checksum: string (SHA-256 of body_text)
    status: ProcessingStatus (raw, normalized, ai_processed, reviewed, published, deprecated)
    version: int
    created_at: datetime
    updated_at: datetime
    
    // Extensions (unmappable fields preserved here)
    extensions: JSON
}
```

### 12.2 EventRecord

An event extracted from one or more NormalizedSourceRecords. Events are the primary unit around which timelines, dossiers, and evidence are organized.

```
EventRecord {
    id: UUID
    title: string
    slug: string (unique, URL-safe)
    description: text
    event_type: EventType
    
    // Temporal
    event_date: datetime (when the event occurred)
    event_date_precision: DatePrecision (exact, day, week, month, year, range, estimated)
    event_date_end: datetime (for events with duration)
    
    // Geographic
    location_name: string
    location_precision: LocationPrecision (exact, local, regional, national, cross_border)
    country: string
    region: string
    lat: float (safe precision level)
    lng: float (safe precision level)
    
    // Sources
    source_record_ids: UUID[] (references NormalizedSourceRecord)
    primary_source_id: UUID (the highest-weight source for this event)
    
    // Classification
    event_category: EventCategory
    subcategories: string[]
    topics: string[]
    status: EventStatus (alleged, confirmed, disputed, ongoing, concluded)
    
    // Links
    entity_ids: UUID[] (references EntityRecord)
    evidence_ids: UUID[] (references EvidenceRecord)
    parent_event_id: UUID (for hierarchical events)
    related_event_ids: UUID[]
    
    // Governance
    verification_level: int (1-5)
    review_status: ReviewStatus
    version: int
    created_at: datetime
    updated_at: datetime
    
    // AI metadata
    ai_summary: text (ai_proposed)
    ai_confidence: float (0.0-1.0)
}
```

### 12.3 EntityRecord

A person, organization, country, institution, or legal case referenced across the platform.

```
EntityRecord {
    id: UUID
    name: string (canonical name)
    aliases: string[] (alternative names, translations)
    entity_type: EntityType (person, organization, country, institution, legal_case)
    slug: string (unique, URL-safe)
    description: text (brief, sourced)
    
    // Type-specific fields
    // Person
    person_role: string (e.g., "Prime Minister", "ICC Prosecutor")
    person_affiliation: UUID (references organization/institution entity)
    person_is_public_figure: boolean
    
    // Organization
    org_type: OrgType (ngo, humanitarian, government, corporate, academic, media)
    org_country: string
    org_website: string
    org_relationship_status: RelationshipStatus
    
    // Country
    country_iso: string
    country_region: string
    country_eu_member: boolean
    country_nato_member: boolean
    
    // Institution
    institution_type: InstitutionType (court, un_body, government_body, parliamentary)
    institution_country: string
    
    // Legal case
    case_institution: string
    case_jurisdiction: string
    case_status: LegalStatus
    case_opened: date
    case_parties: string[]
    
    // Governance
    source_ids: UUID[]
    verification_level: int (1-5)
    review_status: ReviewStatus
    version: int
    created_at: datetime
    updated_at: datetime
}
```

### 12.4 EvidenceRecord

A specific factual claim extracted from one or more sources, bound to an event and entities.

```
EvidenceRecord {
    id: UUID
    title: string
    slug: string (unique, URL-safe)
    claim_text: text (the specific factual assertion)
    claim_type: ClaimType
    
    // Source binding
    source_record_ids: UUID[] (references NormalizedSourceRecord)
    primary_source_id: UUID
    source_excerpt: text (the passage supporting the claim)
    source_url: string
    archive_url: string
    
    // Event and entity links
    event_id: UUID (references EventRecord)
    entity_ids: UUID[]
    
    // Temporal
    claim_date: datetime
    claim_date_precision: DatePrecision
    
    // Geographic
    location_name: string
    location_precision: LocationPrecision
    country: string
    region: string
    
    // Classification
    category: EvidenceCategory (civilian_casualties, infrastructure_destruction, aid_obstruction, forced_displacement,
                                 detention, torture, mass_graves, incitement, arms_transfer, humanitarian_access,
                                 legal_proceeding, official_statement)
    subcategories: string[]
    tags: string[]
    
    // Confidence
    verification_level: int (1-5)
    confidence_score: float (0.0-1.0, human-reviewed)
    ai_confidence: float (0.0-1.0, unmodified)
    corroboration_count: int (number of independent sources)
    corroboration_status: CorroborationStatus (uncorroborated, single_source, multiple_sources, contradictory)
    
    // Legal
    legal_status: LegalStatusLabel (if applicable)
    legal_review_required: boolean
    legal_review_completed: boolean
    
    // Governance
    review_status: ReviewStatus
    reviewed_by: UUID[]
    version: int
    correction_ids: UUID[]
    is_disputed: boolean
    dispute_notes: text
    created_at: datetime
    updated_at: datetime
}
```

---

## 13. Event Standards

Accountability Atlas uses an event-first architecture. The fundamental organizational unit is the **Event**, not the article, document, or source item.

### 13.1 Event-First Principles

1. **An event is something that happened** at a specific time and place: an airstrike, a legal ruling, a government statement, a humanitarian convoy arrival, a parliamentary vote.

2. **Many sources, one event.** Multiple articles, reports, and documents about the same thing resolve to a single EventRecord. This prevents duplication forever.

3. **Many events, one timeline.** Events are ordered chronologically. A timeline of events (e.g., the Gaza genocide case at the ICJ) is built from many EventRecords.

4. **Events are linked to evidence.** EvidenceRecords attach to EventRecords. An event's evidence set is the union of all EvidenceRecords linked to it.

5. **Events are linked to entities.** Persons, organizations, countries, institutions, and legal cases are all EntityRecords linked to EventRecords.

6. **Events have a primary source.** Among all NormalizedSourceRecords linked to an event, one is designated primary (the highest-weight source, by trust level).

### 13.2 Event Types

```
AIRSTRIKE | SHELLING | MISSILE_STRIKE | DRONE_STRIKE | GROUND_OPERATION
HOSPITAL_ATTACK | SCHOOL_ATTACK | SHELTER_ATTACK | CIVILIAN_INFRASTRUCTURE_ATTACK
AID_CONVOY_ATTACK | AID_OBSTRUCTION | HUMANITARIAN_ACCESS_RESTRICTION
FORCED_DISPLACEMENT | EVACUATION_ORDER | MASS_DETENTION
LEGAL_RULING | LEGAL_FILING | WARRANT_ISSUED | PROCEEDING_UPDATE
GOVERNMENT_STATEMENT | POLICY_CHANGE | VOTE | SANCTION
PARLIAMENTARY_INQUIRY | HEARING | RESOLUTION
ARMS_TRANSFER | EXPORT_LICENSE | MILITARY_COOPERATION_UPDATE
HUMANITARIAN_UPDATE | AID_DELIVERY | FUNDING_ANNOUNCEMENT
PROTEST | CAMPAIGN | PUBLIC_APPEAL
INVESTIGATION_FINDING | REPORT_PUBLICATION | DATA_RELEASE
```

### 13.3 Event Resolution

When multiple NormalizedSourceRecords describe the same event:

1. **Detection:** AI proposes duplicate or related events based on entity overlap, location, time proximity, and content similarity.
2. **Review:** A human reviewer confirms or rejects the proposed event merge.
3. **Resolution:** Confirmed merges create a single EventRecord with multiple source_record_ids. The highest-weight source becomes primary.
4. **Deconfliction:** If sources contradict on event details (date, location, casualties), both versions are recorded with appropriate confidence levels and the contradiction is flagged.

### 13.4 Event to Evidence Relationship

- One event → Many evidence records
- Each evidence record makes a specific factual claim about the event
- Evidence records can be added, corrected, or deprecated independently of the event
- The event's overall confidence is an aggregate of its evidence records' confidence

---

## 14. Entity Standards

### 14.1 Entity Resolution

EntityRecords are the canonical representation of real-world entities across the platform. Entity resolution ensures that references to the same entity from different sources converge on a single record.

**Resolution rules:**
- **Persons:** Resolved by name + role + affiliation. Aliases tracked. Public figures only.
- **Organizations:** Resolved by name + type + country. Acronyms and translations tracked as aliases.
- **Countries:** Resolved by ISO code. All references to the same ISO code point to one record.
- **Institutions:** Resolved by name + type + jurisdiction. Courts, UN bodies, government agencies.
- **Legal cases:** Resolved by case name + institution. ICC Palestine situation, ICJ genocide case, etc.

### 14.2 Entity Relationship Model

Entities relate to each other and to events:

```
Person —affiliated_with→ Organization
Person —role_at→ Institution
Organization —based_in→ Country
Institution —jurisdiction→ Country
LegalCase —institution→ Institution
LegalCase —parties→ Country/Person
Event —involves→ Entity
Evidence —concerns→ Entity
```

### 14.3 Entity Governance

- Entity creation requires human approval.
- Entity records are sourced. Every entity record links to the source(s) establishing its existence and attributes.
- Person records are created only for public figures, officials, and legally relevant parties. No private individuals.
- Organization records include relationship status (see Source Registry relationship labels).
- Entity updates are versioned. Changes to entity records are tracked.

---

## 15. Publication Standards

### 15.1 Publication States

| State | Description | Visible on public platform? |
|---|---|---|
| **Static Preview** | Draft content showing structure only; labeled as preview | Yes, with clear labels |
| **Published** | Reviewed, approved, and live | Yes, full presentation |
| **Versioned** | Published and subsequently updated; old versions preserved in history | Yes, current version; history accessible |
| **Archived** | Published content that is no longer current but preserved for record | Yes, with archival notice |
| **Corrected** | Published content with one or more corrections applied; correction notice visible | Yes, with correction notice linked |
| **Deprecated** | Published content withdrawn; replacement or explanation linked | Yes, with deprecation notice |

### 15.2 Versioning

Every published item has:
- `version`: Integer starting at 1, incremented on every change.
- `published_at`: Initial publication timestamp.
- `updated_at`: Last modification timestamp.
- `version_history`: Array of {version, timestamp, change_summary, reviewer}.

**Versioning rules:**
- Versions are immutable. Once created, a version cannot be modified.
- Corrections create new versions. The old version remains in the history.
- Major corrections (factual errors, legal wording issues) create a public correction notice alongside the new version.
- Minor corrections (typos, broken links) create a new version with update notes.

### 15.3 Status Labels

Labels displayed on public content:

| Label | Meaning |
|---|---|
| Static preview | Content shows structure but is not final |
| Source pending | Content awaiting source verification |
| Public resource only | Listing from public information; no partnership implied |
| No partnership implied | Organization listing; no relationship confirmed |
| Correction welcome | Error reports actively sought |
| Legal wording review needed | Content requiring legal terminology review |
| Reviewed and published | Content has passed all review gates |
| Corrected | Content has been corrected; see correction notice |
| Deprecated | Content is withdrawn; see explanation |
| Disputed | Content accuracy is contested; see dispute details |

### 15.4 Correction Categories

| Category | Example | Requires public notice? |
|---|---|---|
| Factual error | Wrong casualty number, incorrect date | Yes |
| Outdated source | Source replaced by newer data | Yes, if substantive |
| Wrong location/date | Misidentified incident site | Yes |
| Unsafe personal information | Private data accidentally published | Yes, immediate |
| Mistranslation | Incorrect translation of legal term | Yes |
| Legal wording issue | Misstated legal status or terminology | Yes |
| Broken link | Source URL no longer accessible | No |
| Duplicate item | Same content published twice | No |
| Misleading framing | Headline or summary misrepresents source | Yes |

### 15.5 Correction Notice Template

```
=== CORRECTION ===
Item: [title]
URL: [url]
Published: [date]
Corrected: [date]
Correction type: [category]
Previous version: [version]
New version: [version]

What changed:
[clear description of the change]

Why it changed:
[reason for correction]

Reviewed by:
[reviewer attribution]

Correction requested by:
[submitter attribution if public, or "anonymous submission"]
=====================
```

### 15.6 Archival Preservation

- Source URLs are preserved as primary links.
- Archive URLs (Internet Archive, perma.cc, institutional archives) are stored where lawfully and ethically appropriate.
- Preservation may not override privacy, copyright, witness safety, or platform terms of service.
- Deprecated items remain accessible with a deprecation banner, unless removal is legally or ethically required.
- Content removed for legal or safety reasons preserves a redacted stub with removal reason.

---

## 16. UI System

### 16.1 Visual Direction

- Calm and institution-grade
- Human without sentimentality
- Urgent without chaos
- Editorial evidence style
- Not militaristic, not rage-branded, not generic SaaS, not a news-site clone
- 70% institutional archive / 30% civic action platform

### 16.2 Design Tokens

| Token | Value | Usage |
|---|---|---|
| Deep Ink Navy | #0F172A | Authority, footer, overlays, primary buttons |
| Soft Charcoal | #1E293B | Body text |
| Warm Paper | #F5F0E8 | Primary background |
| Bone White | #FAF9F6 | Cards and light text on dark backgrounds |
| Signal Amber | #D97706 | Current phase, evidence point, careful emphasis |
| Muted Clay | #B45309 | Human/safety accent |
| Trust Blue | #2563EB | Legal/institutional states |
| Quiet Border Grey | #D1D5DB | Dividers and document cards |

### 16.3 Typography

| Family | Weight | Usage |
|---|---|---|
| IBM Plex Serif | 400, 600, 700 | Headings (H1-H4), editorial text |
| Inter | 400, 500, 600 | Body text, interface, navigation |
| IBM Plex Mono | 400, 500 | Labels, metadata, source and status language, evidence codes |

Scale: 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48 / 60 / 72 px (with clamp() for responsive sizing).

### 16.4 Motion Rules

**Permitted uses of motion (Framer Motion or CSS):**
- Hero entrance (fade-in, subtle slide-up)
- Section reveals on scroll (fade-in, transform-up)
- Staggered card reveals
- Roadmap line and card reveals
- Hover state transitions (CSS, <300ms)

**Prohibited:**
- Parallax scrolling
- Infinite animations
- Image zoom loops
- Scroll-jacking
- Layout-shifting spectacle
- Bouncy or playful easing on serious content
- Auto-playing video or animation
- Glow effects

**Reduced motion:**
- Respect `prefers-reduced-motion`
- All animations must have reduced-motion fallbacks (no-op or instant reveal)
- No critical content depends on motion

### 16.5 Cards, Badges, and Status Elements

**Cards:**
- Document/evidence visual DNA
- Quiet borders (1px, Quiet Border Grey)
- Mono labels for metadata
- Restrained accent bar (4px, left, color-coded by category)
- Slight hover lift (translateY(-2px), shadow change, CSS only)
- No glow, no bounce, no gradient backgrounds
- Loading state: skeleton, no spinner

**Badges:**
- Static status indicators, not decoration
- Color-coded by status category
- Mono font, uppercase for status, mixed-case for labels
- Examples: `DRAFT`, `REVIEWED`, `CORRECTED`, `STATIC PREVIEW`, `SOURCE PENDING`
- Clear meaning without color reliance (include text label)

### 16.6 Image Policy

**Permitted image sources:**
- Public-domain images
- Open-licensed images (CC0, CC BY, CC BY-SA)
- Permission-cleared images (documented approval)
- Institutional images used under fair use / fair dealing for documentary purposes (with legal review)

**Image requirements:**
- Every image requires attribution (see Attributions section)
- Contextual documentary imagery preferred; no gore, spectacle, or shock value
- Alt text required on every image
- Images must not dehumanize subjects
- No images that could identify vulnerable individuals without consent
- No Getty, wire-service, news-agency, or unclear-license images without explicit legal review

**Image processing:**
- WebP format for production
- Responsive srcset
- Lazy loading
- Compression without quality loss that affects documentary value

### 16.7 Loading and Empty States

- Skeleton loading for content areas
- No spinners for serious content
- Empty states explain why content is absent and what to expect
- Error states provide clear, calm error messages and recovery actions
- Offline state provides cached content where possible

---

## 17. Accessibility

### 17.1 Target Standard

**WCAG 2.2 AA** for all public-facing content and functionality. AAA where practical.

### 17.2 Requirements

**Semantic structure:**
- Logical heading hierarchy (H1-H6). Every page has exactly one H1.
- Landmark elements (header, nav, main, aside, footer) on every page.
- Lists use `<ul>` / `<ol>`, not styled `<div>` elements.
- Tables use `<table>` with `<th>`, `<caption>`, and `scope` attributes.
- Forms use proper `<label>` associations.

**Keyboard navigation:**
- All interactive elements reachable and operable via keyboard.
- Logical tab order matching visual order.
- No keyboard traps.
- Skip-to-content link on every page.

**Focus states:**
- Visible focus indicator on all interactive elements.
- Focus style: 2px solid Trust Blue outline with 2px offset. Not removed on `:focus-visible`.
- Custom focus indicators for branded components (maintain accessibility contrast).

**Color and contrast:**
- All text meets WCAG 2.2 AA contrast ratios (4.5:1 normal, 3:1 large).
- UI components and graphical objects meet 3:1 contrast.
- Information conveyed by color is also conveyed by text, icon, or pattern.
- No color combinations that cause difficulty for color vision deficiency (red/green pairings especially).

**Text and typography:**
- Font size minimum: 16px for body text (no browser zoom less than 100%).
- Line height: 1.5 for body, 1.2 for headings.
- Paragraph max width: 70 characters / 35em.
- No text embedded in images.

**Images and media:**
- Alt text on all meaningful images. Decorative images use `alt=""`.
- Complex images (charts, maps) have long descriptions or data tables.
- No auto-playing video or audio.
- Transcripts for audio content. Captions for video.

**Reduced motion:**
- `prefers-reduced-motion` respected.
- All motion has no-motion fallback.
- No essential content or functionality depends on motion.

**RTL support:**
- Design system accommodates right-to-left languages (Arabic, Hebrew).
- CSS logical properties preferred over physical (margin-inline-start over margin-left).
- Testing with Arabic and Hebrew content before RTL launch.

**Screen reader support:**
- ARIA landmarks and labels where HTML semantics insufficient.
- Status updates via `aria-live` regions.
- Dynamic content changes announced to screen readers.
- Visible labels preferred over `aria-label` where possible.

**Target size:**
- Interactive targets minimum 24x24 CSS pixels (WCAG 2.2).
- 44x44 CSS pixels preferred.

### 17.3 Testing

- Automated accessibility testing in CI pipeline (axe-core, Lighthouse).
- Manual keyboard-only testing before releases.
- Screen reader testing (NVDA / VoiceOver) before major releases.
- Color contrast checking for all new color combinations.
- Zoom testing to 200%.
- Reduced-motion testing.

---

## 18. Performance

### 18.1 Performance Budgets

| Metric | Target | Measurement |
|---|---|---|
| First Contentful Paint (FCP) | <1.5s | Lighthouse, RUM |
| Largest Contentful Paint (LCP) | <2.5s | Lighthouse, RUM |
| Interaction to Next Paint (INP) | <200ms | Lighthouse, RUM |
| Cumulative Layout Shift (CLS) | <0.1 | Lighthouse, RUM |
| Time to Interactive (TTI) | <3.5s | Lighthouse |
| Total page weight | <500KB HTML/CSS/JS initial | Webpack/Vite bundle analysis |
| Image weight per page | <200KB | Build-time audit |
| JavaScript bundle | <150KB initial, code-split | Webpack/Vite analysis |
| Number of requests | <20 initial | Browser DevTools |

### 18.2 Progressive Enhancement

- Core content is readable without JavaScript. HTML-first, enhance after.
- Search, filtering, maps, and interactive features are enhancements, not requirements.
- No-javascript state provides meaningful content and navigation.
- Service worker for offline access to critical content.

### 18.3 Loading Strategies

- Static generation at build time for all public pages.
- Dynamic loading for search results, filtered views, and large datasets.
- Lazy loading for images and below-the-fold content.
- Skeleton loading for dynamic content areas.
- Preload critical resources (hero images, primary fonts).

### 18.4 Caching

- CDN caching for static assets (immutable content: hashed filenames).
- Browser caching for API responses where appropriate.
- Service worker caching for offline access to methodology, attributions, and key content.

### 18.5 Monitoring

- Lighthouse CI in deployment pipeline.
- Real User Monitoring (RUM) via privacy-first analytics.
- Performance regression alerts in CI.
- Regular performance audits (quarterly).

---

## 19. Security

### 19.1 Threat Model

Accountability Atlas faces threats that are not typical for most web projects. As a platform documenting alleged atrocity crimes and tracking political and legal accountability, it is a target for:

| Threat | Likelihood | Impact | Primary Mitigation |
|---|---|---|---|
| DDoS / takedown attacks | High | High | CDN, WAF, DDoS protection, Project Galileo (when eligible) |
| Legal threats / takedown demands | Medium | High | Careful legal wording, primary-source anchoring, review gates, corrections policy, legal counsel |
| Defacement / content manipulation | Medium | Very High | Immutable versioning, audit logs, signed commits, access controls |
| Contributor account compromise | Medium | High | 2FA, least privilege, audit logging, offboarding procedure |
| Disinformation / fake submissions | High | Medium | Source verification, review gates, no automatic publication, source hierarchy |
| Scraping / data misuse | Medium | Medium | Rate limiting, API terms, robots.txt, legal remedies |
| Dependency compromise | Medium | High | Dependency scanning, lock files, automated updates, review |
| Insider threat / volunteer infiltration | Medium | High | Least privilege, PR review, staged access, audit trails |
| Social engineering | Medium | High | Security training, clear processes, verification steps for sensitive actions |

### 19.2 Static Beta Controls

Current phase controls:
- No public user accounts
- No sensitive forms or uploads
- HTTPS enforced (HSTS)
- Dependency scanning in CI
- Branch protection and PR discipline on repository
- Secure environment variables (never committed)
- Security headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- `security.txt` at standard location
- Responsible-disclosure route published
- Source code and image license review before merge
- Minimal third-party scripts (no advertising, tracking, or analytics that share data)

### 19.3 Functional MVP Controls

Planned for functional MVP:
- Cloudflare DNS/CDN/WAF with DDoS protection
- HSTS preload
- Admin authentication with 2FA (hardware keys preferred)
- Strict Role-Based Access Control (RBAC)
- API rate limiting
- Spam protection on correction submissions
- Automated backups with restoration tests
- Comprehensive audit logging
- Least-privilege architecture for all services
- Periodic access review
- Staff and volunteer offboarding procedure

### 19.4 Later Controls

- Project Galileo application when eligible
- Deflect evaluation as backup/alternative
- Tor/onion service feasibility evaluation
- GlobaLeaks/SecureDrop evaluation for sensitive submissions
- Independent security audit
- Separate admin domain
- Hardware security keys for all privileged accounts
- Malware scanning on uploads
- Encrypted object storage
- Key rotation procedures
- Formal incident-response runbook

### 19.5 Development Security

- All code changes via pull request with review
- No direct pushes to `main` or `production` branches
- Signed commits (GPG)
- Secrets detection in CI (no credentials in code)
- Dependency vulnerability scanning
- Regular dependency updates
- Least-privilege service accounts and API keys
- Isolated development environments

---

## 20. Privacy

### 20.1 Privacy Principles

- **Data minimization:** Collect only what is strictly necessary for the stated purpose.
- **Purpose limitation:** Data collected for one purpose is not repurposed.
- **Storage limitation:** Data is retained only as long as necessary.
- **Transparency:** Privacy practices are documented and accessible.
- **User rights:** Users may request access, correction, deletion, and portability of their data.
- **Security:** Appropriate technical and organizational measures protect personal data.

### 20.2 GDPR Compliance

Accountability Atlas operates in compliance with the General Data Protection Regulation (GDPR) as a data controller for platform data and as a data processor where applicable.

**Lawful bases:**
- **Public interest** — For core platform functions (documenting humanitarian and legal information).
- **Legitimate interest** — For corrections, organization listings, and communications.
- **Consent** — For optional communications and contributor attribution.
- **Legal obligation** — Where GDPR or other law requires specific processing.

**Data Protection Impact Assessment (DPIA):**
A DPIA is required before:
- Witness or testimony submission systems
- Sensitive location data collection
- User accounts with personal data
- Partner analytics integration
- Any high-risk profiling workflows

### 20.3 Static Beta Privacy

- No cookies required for site function.
- No analytics during earliest static preview (optional privacy-first analytics later).
- No user accounts.
- No personal data collection.
- No forms that store user data (correction forms are local `mailto:` links).
- All third-party services evaluated for privacy impact.

### 20.4 Data Collected (Future MVP)

| Data type | Purpose | Retention | Legal basis |
|---|---|---|---|
| Contributor GitHub handle | Attribution, coordination | Duration of contribution | Consent, legitimate interest |
| Correction submitter email hash | Anti-spam, follow-up | 12 months after resolution | Legitimate interest |
| Aggregate page visit counts (anonymized) | Platform improvement | Indefinite (aggregate only) | Legitimate interest |
| Organization contact information | Directory accuracy | Until organization requests removal | Public interest |

### 20.5 Data Not Collected

- No political profiles
- No browsing history
- No precise location data
- No message content from action templates
- No recipient responses
- No private notes
- No names or emails without explicit consent
- No personally identifiable evidence without legal and safety review

### 20.6 Privacy by Design

- Privacy-first analytics (Plausible, Matomo, or equivalent — no Meta Pixel, advertising trackers, or behavioral profiling)
- No third-party tracking scripts
- Email addresses (where needed) stored as hashed values where full email is not required
- All personal data processing logged
- Breach response plan documented
- Privacy notice accessible from every page

---

## 21. Deployment

### 21.1 Deployment Phases

#### Phase 1: Static Beta (Current)

**Architecture:** Static site, no backend, no database.

- **Hosting:** Cloudflare Pages, Netlify, or Vercel
- **DNS/CDN/WAF:** Cloudflare
- **Build:** Vite + TypeScript, CI/CD via GitHub Actions or platform-native
- **HTTPS:** Enforced. HSTS enabled.
- **Security headers:** CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Monitoring:** Uptime monitoring (basic)
- **Analytics:** None, or privacy-first with opt-out

#### Phase 2: Functional MVP

**Architecture:** Static frontend + API backend + database.

- **Frontend:** Same React/Vite/TypeScript stack, deployed via CDN
- **Backend:** Supabase (preferred) or Django + PostgreSQL
- **Database:** PostgreSQL with Row-Level Security
- **Admin interface:** Supabase dashboard or Django Admin
- **API:** Public read API + authenticated admin API
- **Auth:** Admin-only authentication (GitHub OAuth or Magic Links with 2FA)
- **Storage:** CDN for public assets; encrypted object storage for unpublished content
- **Monitoring:** Full uptime, error tracking, performance monitoring
- **Analytics:** Privacy-first, aggregate only

#### Phase 3: Public Launch

**Architecture:** Full production deployment with redundancy.

- **Multi-region CDN** for global availability
- **Database replication** for read-heavy workloads
- **DDoS protection** (Cloudflare Enterprise or Project Galileo)
- **Automated backups** with tested restoration
- **Incident response runbook**
- **Load testing** before public launch

### 21.2 Hosting Requirements

| Requirement | Static Beta | Functional MVP | Public Launch |
|---|---|---|---|
| HTTPS/HSTS | Yes | Yes | Yes |
| CDN | Yes | Yes | Yes |
| DDoS protection | Basic | Cloudflare WAF | Cloudflare Enterprise / Galileo |
| Rate limiting | N/A | API level | API + edge |
| WAF | Basic | Yes | Yes with custom rules |
| Backups | N/A | Daily automated | Daily + tested restoration |
| SLA | Best effort | 99.5% | 99.9% |
| Incident response | Manual | Documented | Runbook + on-call |

### 21.3 CI/CD Pipeline

- **Branches:** `main` (production), `feature/*` (development), `preview/*` (deploy previews)
- **CI checks on every PR:** TypeScript compilation, ESLint, automated accessibility (axe-core), Lighthouse performance budget, dependency scan, build test
- **Deployment previews:** Every PR deploys to a unique preview URL
- **Production deployment:** Manual trigger from `main` after successful CI and review
- **Rollback:** One-click rollback to previous deployment; database snapshots for data rollback

### 21.4 Environment Management

- Separate environments: `development`, `staging`, `production`
- Environment variables managed via deployment platform (not committed)
- Secrets in secure vault (not in environment variables for sensitive values where possible)
- Database migrations automated with rollback capability

---

## 22. Roadmap Summary

The detailed roadmap with phased deliverables, exit criteria, and timelines is maintained in `ROADMAP-v2.md`. This section provides a high-level summary.

### Phase 0: Foundation and Safety Design

**Status:** Substantially complete.

Establish the project's legal, ethical, and technical foundation before major development.

**Key deliverables:** Repository, PRD, methodology draft, governance documents, license structure, design system, risk register.

### Phase 1: Public Static Beta

**Status:** In progress.

Build a navigable, credible public static site that validates positioning, information architecture, and design before introducing backend complexity.

**Key deliverables:** Landing page, methodology, attributions, Gaza dossier preview, legal tracker preview, Belgium/EU skeletons, organization directory preview, action hub preview, evidence library preview, press/resources, contribute page, static data files.

### Phase 2: Pipeline Infrastructure

Build the pipeline layers that power the platform.

**Key deliverables:**
- Source Registry database
- Collector Framework (first collectors for ICJ, ICC, OHCHR, OCHA)
- Normalization pipeline
- AI Intelligence Layer (translation, summarization, entity extraction, topic classification)
- Review Queue and Review Interface
- Publication pipeline

### Phase 3: Structured Data MVP

Turn the static beta into a data-driven application.

**Key deliverables:** Backend and database, admin content management, structured country/institution pages, curated evidence library, basic dossier export, correction workflow, security baseline.

### Phase 4: Intelligence Platform

Activate the full AI-assisted pipeline.

**Key deliverables:** Full Intelligence Layer with all AI operations, multi-reviewer workflow, confidence scoring, contradiction detection, timeline extraction, geographic extraction, intelligence dashboard.

### Phase 5: Public Platform Maturity

Mature the public-facing platform.

**Key deliverables:** Search, maps, timelines, multilingual support (English/Dutch/French), public API, advanced dossiers, action hub with jurisdiction-aware templates, country/institution page expansion.

### Phase 6: Secure Submission and Partnership

**Key deliverables:** Partner verification workflow, organization relationship management, secure-submission tool evaluation and pilot (expert-led only), testimony management workflows, security audit.

### Phase 7: Global Framework

**Key deliverables:** Region-specific expansion modules, advanced methodology, multilingual expansion to Arabic, Spanish, German, Hebrew, AI-assisted workflows at scale, public datasets, formal partnerships, annual accountability reporting.

---

## 23. ADR Index

Architecture Decision Records (ADRs) are stored in `docs/adr/` with the format `NNNN-title.md`.

| ADR | Title | Status | Date |
|---|---|---|---|
| 0001 | Pipeline-First Architecture | Accepted | 2026-07-24 |
| 0002 | Event-First Data Model | Proposed | 2026-07-24 |
| 0003 | AI Proposes, Humans Decide | Accepted | 2026-07-24 |
| 0004 | Source Registry as Central Source of Truth | Accepted | 2026-07-24 |
| 0005 | Static-First Development Strategy | Accepted | 2026-07-10 |
| 0006 | Collector Framework Standardization | Proposed | 2026-07-24 |
| 0007 | Review Queue Architecture | Proposed | 2026-07-24 |
| 0008 | Publication State Machine | Proposed | 2026-07-24 |

Future ADRs should be proposed for significant architectural decisions, including:
- Backend technology selection (Supabase vs. Django)
- Model selection for AI operations
- Search technology (Postgres FTS vs. Meilisearch vs. OpenSearch)
- Map technology (MapLibre GL vs. embedded)
- i18n framework selection
- Analytics platform selection
- Secure submission tool selection

---

## 24. Definition of Done

### 24.1 Definition of Done for Features

A feature is Done when:
- [ ] Code is written, reviewed, and merged to `main`.
- [ ] All automated checks pass (TypeScript, lint, tests, build, accessibility, performance budget).
- [ ] Documentation is updated (PRD if scope changed, ADR if architecture decision).
- [ ] Accessibility review completed (automated + manual keyboard test).
- [ ] Mobile responsive behavior verified.
- [ ] Security review completed for any code that handles data or user input.
- [ ] Privacy impact assessed for any code that touches personal data.
- [ ] No dead code, commented code, or placeholder content.
- [ ] Edge cases handled (loading, empty, error, offline states).
- [ ] Reduced-motion tested if the feature includes animation.
- [ ] Correction path exists if the feature publishes content.
- [ ] Version tracking is implemented if the feature manages content.

### 24.2 Definition of Done for Content

A piece of content (page, dossier, evidence item, legal case entry) is Done when:
- [ ] All factual claims are sourced to a specific, accessible source.
- [ ] Source type and verification level are recorded.
- [ ] Legal terminology is precise and properly attributed where applicable.
- [ ] Safety check performed: no unsafe personal data, locations, or targeting information.
- [ ] Language check passed: calm, precise, non-hateful, non-inciting.
- [ ] Review gates passed: source check, date check, legal-status check, safety check, language check, correction path, methodology link, version record.
- [ ] Correction path is accessible from the published content.
- [ ] Methodology link is present.
- [ ] Version and last-reviewed date are displayed.

### 24.3 Definition of Done for AI Output

An AI-assisted operation is Done when:
- [ ] AI output is clearly labeled `ai_proposed`.
- [ ] Model version and confidence score are recorded.
- [ ] Source documents are linked.
- [ ] Human reviewer has accepted, rejected, or modified the proposal.
- [ ] Review decision is logged.
- [ ] AI output has not been published without human review.
- [ ] Hallucination check performed for summary and translation outputs.
- [ ] Bias check performed for entity extraction and classification outputs.

### 24.4 Definition of Done for Reviews

A review is Done when:
- [ ] Reviewer has examined the source material.
- [ ] AI proposals have been accepted, rejected, or modified with rationale.
- [ ] Safety checklist completed.
- [ ] Decision recorded (Approved, Rejected, Revision Requested, Escalated).
- [ ] If Approved: item is queued for publication with version metadata.
- [ ] If Rejected: reason is recorded and submitter notified (if applicable).
- [ ] If Revision Requested: specific revision notes are provided.
- [ ] If Escalated: escalation reason and target reviewer are specified.

### 24.5 Definition of Done for Publications

A publication is Done when:
- [ ] All review gates passed.
- [ ] Version number assigned.
- [ ] Published timestamp recorded.
- [ ] Confidence metadata attached.
- [ ] Source links included.
- [ ] Reviewer attribution included (named or pseudonymous, per reviewer preference).
- [ ] Correction link included.
- [ ] Methodology link included.
- [ ] Status label displayed.
- [ ] Item appears in search and appropriate filtered views.
- [ ] API endpoint returns the published item (where applicable).

### 24.6 Definition of Done for Pipeline Components

A pipeline component (collector, normalizer, AI module, review interface) is Done when:
- [ ] Component implements its specified interface.
- [ ] Input validation is strict; invalid input is rejected or quarantined.
- [ ] Output is schema-validated.
- [ ] All states are handled (success, failure, timeout, partial data).
- [ ] Logging is comprehensive (entry, exit, errors, timings).
- [ ] Monitoring hooks are in place (metrics, alerts).
- [ ] Documentation of the component's behavior is written.
- [ ] Error messages are clear and actionable.
- [ ] No sensitive data is logged.

---

**End of PRD v2 — Pipeline Architecture**

*This document replaces PRD.md as the canonical product requirements document. PRD.md is archived as PRD-v1-archive.md. For detailed page specifications, SQL schemas, risk register, and sprint plans, consult the archive.*

*Next review: 2026-10-24 or earlier if significant architectural changes are proposed.*
