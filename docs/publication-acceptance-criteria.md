# Publication Acceptance Criteria

**Status:** Active — every publishable record must meet the criteria for its type.  
**Last reviewed:** 2026-07-12

---

## Purpose

Before any content record is published on Accountability Atlas, it must
satisfy the criteria defined in this document. These criteria are the gates
that separate internal drafts from public-facing content.

---

## General criteria (all record types)

Every publishable record must:

- [ ] Have a unique `id` (no duplicates in its collection).
- [ ] Have a meaningful `title`.
- [ ] Have a `contentStatus` that is one of: `static_preview`,
  `review_pending`, `reviewed`, `disputed`, or `corrected`.
- [ ] Have `version` ≥ 1.
- [ ] Have a `correctionUrl` pointing to the corrections process.
- [ ] Pass the data validation suite (`npx vitest run src/data/__tests__/validation.test.ts`).
- [ ] Not contain private personal information, doxing content, exact
  dangerous locations, or unreviewed social-media claims presented as facts.
- [ ] Not imply partnership, endorsement, or affiliation unless confirmed in
  writing and published through the relationship-status policy.

---

## Source record

A `SourceRecord` in `src/data/sources.ts`.

| Criterion | Required |
|---|---|
| `id` is unique | ✅ |
| `title` is the exact or summarised title of the source document | ✅ |
| `publisher` is the institution or organisation that published it | ✅ |
| `sourceType` is one of the 8 valid values | ✅ |
| `url` resolves to the source document | ✅ |
| `publicationDate` is recorded (year minimum) | ✅ |
| `accessedAt` is the date the source was last checked | ✅ |
| `archiveUrl` is provided if the source may disappear | Recommended |
| `language` uses ISO 639-1 code | Recommended |

**May be published when:** All required fields are present and the URL
resolves.

**May be marked `reviewed` when:** Not applicable — sources are factual
references. They do not carry a `contentStatus`.

---

## Evidence record

An `EvidenceItem` in `src/data/evidenceItems.ts`.

| Criterion | `static_preview` | `review_pending` | `reviewed` |
|---|---|---|---|
| `id`, `title`, `summary` present | ✅ | ✅ | ✅ |
| `category` is valid | ✅ | ✅ | ✅ |
| `sourceQuality` is 0–5 | — | ✅ | ✅ |
| `sourceIds` references ≥ 1 SourceRecord | — | ✅ | ✅ |
| `primarySourceType` is valid | ✅ | ✅ | ✅ |
| Summary matches the referenced sources | — | — | ✅ |
| Source verification completed (different person) | — | — | ✅ |
| Editorial review completed | — | — | ✅ |
| `lastReviewedAt` set to review date | — | — | ✅ |
| `reviewedByRole` describes actual reviewers | — | — | ✅ |
| Legal review (if `legalStatuses` is set) | — | — | ✅ |
| Safety review (if content describes vulnerable contexts) | — | — | ✅ |
| `correctionUrl` set | ✅ | ✅ | ✅ |
| `version` ≥ 1 | ✅ | ✅ | ✅ |

**May be marked `reviewed` when:** All `reviewed`-column criteria are met
and at least two distinct reviewers (source verifier + editor) have approved
the record.

---

## Legal case

A `LegalCaseEntry` in `src/data/legalCases.ts`.

| Criterion | `review_pending` | `reviewed` |
|---|---|---|
| `id`, `slug`, `title` present | ✅ | ✅ |
| `institution`, `jurisdiction`, `parties` correct | ✅ | ✅ |
| `summary` accurately describes procedural posture | ✅ | ✅ |
| `legalStatuses` values are valid and accurate | ✅ | ✅ |
| `sourceIds` references ≥ 1 SourceRecord | ✅ | ✅ |
| `sourceQuality` is 0–5 | ✅ | ✅ |
| Procedural note explains status accurately | ✅ | ✅ |
| Source verification completed (different person) | — | ✅ |
| Editorial review completed | — | ✅ |
| Legal review completed | — | ✅ |
| `lastReviewedAt` set | — | ✅ |
| `reviewedByRole` describes actual reviewers | — | ✅ |
| `version` ≥ 1 | ✅ | ✅ |

**May be marked `reviewed` when:** Source verifier + editor + legal
reviewer have all approved. The procedural posture description has been
checked against the primary court document.

---

## Country / institution position

A `CountrySection` or `InstitutionEntry`.

| Criterion | `static_preview` | `review_pending` | `reviewed` |
|---|---|---|---|
| `id`, `title`, `description` present | ✅ | ✅ | ✅ |
| Description explains what the section will track | ✅ | ✅ | ✅ |
| Competency boundaries are correctly stated | ✅ | ✅ | ✅ |
| `sourceIds` references ≥ 1 SourceRecord | — | ✅ | ✅ |
| `sourceQuality` is 0–5 | — | ✅ | ✅ |
| Source verification completed (different person) | — | — | ✅ |
| Editorial review completed | — | — | ✅ |
| Competency review completed | — | — | ✅ |
| `lastReviewedAt` set | — | — | ✅ |
| `reviewedByRole` describes actual reviewers | — | — | ✅ |

**May be marked `reviewed` when:** Source verifier + editor + competency
reviewer have all approved. The competency boundaries have been checked
against the institution's or country's own constitutional/legal framework.

---

## Organization listing

An `OrganizationRecord` in `src/data/organizations.ts`.

| Criterion | `reviewed` |
|---|---|
| `id`, `slug`, `name` present | ✅ |
| `category` is one of the 7 valid values | ✅ |
| `shortDescription` is factual and drawn from the org's own website | ✅ |
| `officialWebsite` resolves and matches the organisation | ✅ |
| `officialDonationUrl` (if present) resolves to the org's own donation page | ✅ |
| `relationshipStatus` is `public_resource` (only valid status in static beta) | ✅ |
| Source verification completed (different person) | ✅ |
| Editorial review completed | ✅ |
| `lastReviewedAt` set | ✅ |
| `reviewedByRole` describes actual reviewers | ✅ |
| `reviewNotes` explains source basis | ✅ |
| `version` ≥ 1 | ✅ |
| `correctionUrl` set | ✅ |

**May be marked `reviewed` when:** Source verifier + editor have both
confirmed the listing against the organisation's official website. The
`reviewNotes` field explains the verification basis.

**Note:** In the static beta, `sourceIds` may be empty if `officialWebsite`
is valid — the organisation's own website is the primary source. If
additional SourceRecords are created (e.g., for third-party verification),
they should be added to `sourceIds`.

---

## Action template

An `ActionTemplate` in `src/data/actionTemplates.ts`.

| Criterion | `static_preview` | `reviewed` |
|---|---|---|
| `id`, `title`, `actionType` present | ✅ | ✅ |
| `jurisdiction`, `intendedAudience`, `purpose` described | ✅ | ✅ |
| `policyAsk` accurately describes what the recipient can do | ✅ | ✅ |
| `sourceBasis` is documented | ✅ | ✅ |
| `instructions` are clear and safe | ✅ | ✅ |
| `templateBody` (if present) reviewed for safety and legality | — | ✅ |
| `warnings` are comprehensive | ✅ | ✅ |
| All static-beta criteria met | ✅ | ✅ |
| Source verification completed | — | ✅ |
| Editorial review completed | — | ✅ |
| Legal review (if template has legal implications) | — | ✅ |
| Safety review completed | — | ✅ |
| `lastReviewedAt` set | — | ✅ |
| `reviewedByRole` describes actual reviewers | — | ✅ |
| `version` ≥ 1 | ✅ | ✅ |

**May be marked `reviewed` when:** Source verifier + editor + safety
reviewer (and legal reviewer if applicable) have all approved. Template
language has been checked against the relevant jurisdiction's laws.

**Static-beta rule:** No `mailto:` links until jurisdiction and wording
review is complete. No representative finder until supported by reviewed
public data.

---

## Translation

A translated version of any publishable record.

| Criterion | Required |
|---|---|
| Source record has been published in the original language | ✅ |
| Translation accurately represents the source text | ✅ |
| Translation reviewer has approved (fluent in both languages) | ✅ |
| Machine translation has been human-reviewed if used as a draft | ✅ |
| Language code is recorded | ✅ |
| Translation date is recorded | ✅ |
| Translator credit is included (if translator consents) | ✅ |
| Corrections to the source have been reflected in the translation | ✅ |

**May be published when:** All criteria are met. The original-language
version is the authoritative text until the translation is reviewed and
aligned.

---

## Trust / policy page

A static page such as Methodology, Privacy, Corrections, Disclaimer,
Accessibility, Attributions, or Press.

| Criterion | Required |
|---|---|
| Content accurately describes current platform behaviour | ✅ |
| No false claims about review status or platform capabilities | ✅ |
| "Active draft" or "Static beta" label where content is not final | ✅ |
| Links to related pages are correct | ✅ |
| Correction route is linked | ✅ |
| `LastUpdated` date is current | ✅ |
| Security/privacy claims match actual behaviour | ✅ |

**May be published when:** The maintainer confirms the page accurately
describes the current state of the platform. Trust pages do not carry a
`contentStatus` — they are versioned by their `LastUpdated` date.

---

## What AI may and may not do

| Task | AI role | Human role |
|---|---|---|
| Draft a summary from a source | May assist | Must review and approve |
| Assign verification level | Must not | Source verifier |
| Assign legal status | Must not | Legal reviewer |
| Mark a record `reviewed` | Must not | Editor |
| Translate content | May assist (machine translation) | Translation reviewer must review |
| Check for broken URLs | May assist | Source verifier must confirm |
| Generate template language | May assist | Editor + safety reviewer must approve |
| Make publication decisions | Must not | Maintainer |

**AI output is never a substitute for human editorial judgment, legal
analysis, or subject-matter expertise.**

---

## Publication gate summary

```
All required fields present?
  → Source verification complete? (different person)
    → Domain reviews complete? (legal, competency, safety as applicable)
      → Editorial review complete?
        → maintainer merges and deploys
          → Published
```
