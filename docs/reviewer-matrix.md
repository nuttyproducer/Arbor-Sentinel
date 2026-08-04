# Reviewer Matrix

**Status:** Active — defines required reviews for every content type.  
**Last reviewed:** 2026-07-12

---

## Purpose

This matrix maps every content type on Accountability Atlas to the reviews
required before it may be marked `reviewed`. Use this as a checklist when
preparing content for publication.

---

## Review types

| Code | Review | Performed by | Verifies |
|---|---|---|---|
| SRC | Source review | Source verifier | URLs, publisher, dates, access dates; source supports the summary |
| EDI | Editorial review | Editor | Accuracy, clarity, consistency, tone, terminology |
| LEG | Legal review | Legal reviewer | Legal terminology, procedural posture, jurisdictional accuracy, legal-status labels |
| COM | Competency review | Competency reviewer | Domain-specific facts (country, institution, sector) |
| SAF | Safety review | Safety reviewer | No private info, doxing risk, sensitive locations, vulnerable-person exposure |
| TRN | Translation review | Translation reviewer | Accuracy, cultural appropriateness, source alignment |
| ACC | Accessibility review | Accessibility reviewer | WCAG 2.2 AA, keyboard, focus, headings, alt text |
| LIC | Licensing review | Source verifier | Image/asset licence compliance, attribution completeness |
| REL | Relationship review | Editor + maintainer | Relationship status accuracy, no false partnership implication |

---

## Content-type matrix

### Source record

| Review | Required | Notes |
|---|---|---|
| SRC | ✅ | One source verifier may add AND verify — sources are factual references |
| EDI | — | Not applicable |
| LEG | — | Not applicable |

### Evidence record — with legal implications

| Review | Required | Notes |
|---|---|---|
| SRC | ✅ | Must be a different person from the editor |
| EDI | ✅ | |
| LEG | ✅ | Required if `legalStatuses` is set |
| SAF | Recommended | Required if content describes vulnerable contexts |

### Evidence record — without legal implications

| Review | Required | Notes |
|---|---|---|
| SRC | ✅ | Must be a different person from the editor |
| EDI | ✅ | |
| SAF | Recommended | |

### Legal case summary

| Review | Required | Notes |
|---|---|---|
| SRC | ✅ | Primary court documents must be verified |
| EDI | ✅ | |
| LEG | ✅ | Required for all legal case summaries |
| SAF | — | Not typically required (public court records) |

### Country position

| Review | Required | Notes |
|---|---|---|
| SRC | ✅ | Government records, parliamentary documents, UN voting records |
| EDI | ✅ | |
| COM | ✅ | Country-specific governance expertise |
| LEG | Recommended | If the position involves legal obligations |

### Institution description

| Review | Required | Notes |
|---|---|---|
| SRC | ✅ | Institutional websites, founding documents |
| EDI | ✅ | |
| COM | ✅ | Institution-specific expertise (e.g., EU institutional competency) |
| LEG | Recommended | If describing legal competencies |

### Organization listing

| Review | Required | Notes |
|---|---|---|
| SRC | ✅ | Org's own website is the primary source |
| EDI | ✅ | |
| REL | ✅ | Must confirm `public_resource` status; no partnership implied |
| LIC | — | No logos used; licensing review not needed |

### Action template — with legal implications

| Review | Required | Notes |
|---|---|---|
| SRC | ✅ | Legal/procedural basis documented |
| EDI | ✅ | |
| LEG | ✅ | Required if template involves legal claims or jurisdiction-specific law |
| SAF | ✅ | Required for all action templates |
| COM | Recommended | If jurisdiction-specific |

### Action template — without legal implications

| Review | Required | Notes |
|---|---|---|
| SRC | ✅ | Procedural basis documented |
| EDI | ✅ | |
| SAF | ✅ | Required for all action templates |

### Translation

| Review | Required | Notes |
|---|---|---|
| TRN | ✅ | Must be fluent in both languages |
| EDI | ✅ | Editor reviews the translated text for consistency |
| COM | Recommended | If the content is domain-specific |

### Image attribution

| Review | Required | Notes |
|---|---|---|
| LIC | ✅ | Licence terms verified; attribution complete |
| SRC | ✅ | Source URL confirmed where available |
| EDI | — | Not applicable |

### Trust / policy page

| Review | Required | Notes |
|---|---|---|
| EDI | ✅ | Editor confirms accuracy |
| SAF | Recommended | If the page describes safety/privacy behaviour |
| LEG | Recommended | If the page makes legal claims (disclaimer, methodology) |

### Dossier

| Review | Required | Notes |
|---|---|---|
| SRC | ✅ | All referenced sources verified |
| EDI | ✅ | |
| LEG | Recommended | If the dossier describes legal proceedings |
| SAF | Recommended | If the dossier covers vulnerable contexts |
| COM | Recommended | If region/country-specific |

---

## Minimum distinct reviewers

The following reviews must be performed by **different people** to maintain
separation of duties:

| Content type | Minimum distinct people | Roles |
|---|---|---|
| Evidence record with legal implications | 3 | SRC + EDI + LEG |
| Evidence record without legal implications | 2 | SRC + EDI |
| Legal case summary | 3 | SRC + EDI + LEG |
| Country/institution position | 3 | SRC + EDI + COM |
| Organization listing | 2 | SRC + EDI |
| Action template with legal implications | 4 | SRC + EDI + LEG + SAF |
| Action template without legal implications | 3 | SRC + EDI + SAF |
| Translation | 2 | TRN + EDI |

---

## Self-review restrictions

A contributor **must not**:

- Mark their own content as `reviewed`
- Be the only source verifier for content they wrote
- Be the legal reviewer for content about a case or jurisdiction in which
  they have a personal or professional involvement
- Be the competency reviewer for a country they represent or an institution
  they work for

---

## Static-beta accommodations

During the public static beta, when the contributor pool is small:

- The **separation-of-duties** rules for `reviewed` records still apply.
  If only one contributor is available, content may be published as
  `review_pending` or `static_preview` but must not be marked `reviewed`.
- The **reviewedByRole** field must use honest placeholder language
  describing which reviews are complete and which are pending.
- Records marked `reviewed` must have been reviewed by at least one other
  person. AI-assisted review alone does not satisfy this requirement.
