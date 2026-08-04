# Editorial Governance

**Status:** Active — governs all content published on Accountability Atlas.  
**Last reviewed:** 2026-07-12  
**Applies to:** All contributors, reviewers, and maintainers.

---

## Purpose

This document defines who may do what, how decisions are made, and how
conflicts are resolved when preparing, reviewing, publishing, correcting,
and unpublishing content on Accountability Atlas.

---

## Roles and responsibilities

### Researcher

Identifies public sources, documents them in `src/data/sources.ts`, and
prepares draft summaries for evidence records, legal cases, country
sections, and institution descriptions.

**May:**
- Create `draft` records
- Add SourceRecord entries
- Propose `review_pending` summaries with at least one documented source

**May not:**
- Mark records as `reviewed`
- Publish content without reviewer approval
- Make legal determinations

**Conflict of interest:** Must disclose if they have a personal,
professional, or financial relationship with an entity they are researching.
Must not research themselves or their own organisation.

---

### Source verifier

Checks that every source referenced in a record exists at the stated URL,
was published by the stated publisher on the stated date, and supports the
claims made in the platform's summary.

**May:**
- Assign verification levels 0–5
- Confirm or challenge source-quality assignments
- Flag sources that are inaccessible, misattributed, or unreliable

**May not:**
- Edit the editorial summary beyond source-accuracy corrections
- Mark records as `reviewed` (source verification ≠ editorial review)

**Separation of duties:** The person who adds a source should not be the
only person who verifies it for a record marked `reviewed`. At least one
other contributor should independently check sources before editorial
review is complete.

---

### Editor

Reviews summaries for accuracy, clarity, consistency with sources, and
compliance with the platform's tone and terminology policies.

**May:**
- Edit summaries, descriptions, and template text
- Mark records as `reviewed` after source verification is complete
- Request reviewer input on legal, safety, or competency questions

**May not:**
- Mark records as `reviewed` without confirming that source verification
  has been completed by a different person
- Override legal reviewer determinations about legal terminology
- Publish content that has not met the publication acceptance criteria

**Conflict of interest:** Must not edit content about an organisation they
work for, a legal case they are involved in, or a country whose government
they represent.

---

### Legal reviewer

Reviews legal terminology, procedural descriptions, and legal-status
assignments for accuracy under the relevant jurisdiction.

**May:**
- Assign or correct `legalStatuses` labels
- Review and approve legal language in summaries, templates, and methodology
- Flag content that could be read as implying a legal determination that has
  not been made

**May not:**
- Provide legal advice to users (the platform does not provide legal advice)
- Mark records as `reviewed` (legal review is one dimension; editorial
  review is separate)
- Override editorial decisions about non-legal content

**Required for:** Any record with `legalStatuses` values, any page that
describes court proceedings, any action template with legal implications.

**Qualification:** Legal review must be performed by someone with
demonstrated knowledge of the relevant area of law. For international law
content, this means familiarity with IHL, ICL, or IHRL. For domestic law
content, this means familiarity with the relevant national legal system.

---

### Competency reviewer

Provides domain-specific expertise for content about a particular country,
institution, humanitarian sector, or accountability mechanism.

**May:**
- Review factual accuracy of institutional descriptions
- Confirm or challenge competency boundaries
- Flag content that misrepresents what an institution can or cannot do

**May not:**
- Mark records as `reviewed` on their own
- Override legal or safety determinations

**Examples:**
- Belgian governance reviewer — reviews Belgium country-page content
- EU institutional reviewer — reviews EU institution descriptions
- Humanitarian sector reviewer — reviews humanitarian-access and
  aid-delivery descriptions
- OSINT methodology reviewer — reviews open-source investigation
  descriptions

---

### Safety reviewer

Checks content for private personal information, doxing risk, sensitive
location disclosure, and material that could expose vulnerable people to
harm.

**May:**
- Block publication of content that fails safety criteria
- Require redaction of specific details before publication
- Flag content for emergency unpublish review

**May not:**
- Be overridden on safety grounds without a documented rationale
- Have their identity published without explicit consent

**Veto power:** A safety reviewer's block on publication for safety reasons
may only be overridden by the maintainer after documented consultation with
at least one other reviewer. The override rationale must be recorded.

---

### Translation reviewer

Reviews translations for accuracy, cultural appropriateness, and
consistency with the source-language text.

**May:**
- Approve translations for publication
- Flag translations that misrepresent the source text
- Request retranslation of inaccurate passages

**May not:**
- Mark original-language records as `reviewed`
- Publish machine translations without human review

**Qualification:** Must have demonstrated fluency in both the source and
target languages, plus familiarity with the relevant subject matter.

---

### Accessibility reviewer

Reviews pages for compliance with the platform's accessibility commitments:
WCAG 2.2 AA, keyboard navigation, visible focus states, semantic heading
hierarchy, alt text, and reduced-motion support.

**May:**
- Flag accessibility violations
- Block publication of pages with critical accessibility barriers
- Recommend remediation steps

**May not:**
- Mark content records as `reviewed`

---

### Security / privacy reviewer

Reviews the platform for security vulnerabilities, privacy leaks, and
compliance with the security checklist and privacy policy.

**May:**
- Flag security or privacy issues
- Require fixes before deployment
- Review dependency changes for supply-chain risk

**May not:**
- Mark content records as `reviewed`

---

### Maintainer / publisher

Has the authority to merge content to the default branch, deploy the site,
and make final publication decisions.

**May:**
- Merge reviewed content
- Deploy the platform
- Override reviewer blocks with documented rationale
- Initiate emergency unpublish

**May not:**
- Bypass the review workflow for content that requires it
- Publish content that has been blocked by a safety reviewer without
  documented consultation
- Mark their own content as `reviewed` without independent review

**2FA required.** Maintainers must have two-factor authentication enabled
on their GitHub account.

---

## Separation of duties

For any record marked `reviewed`, the following roles must be performed
by different people:

| Record type | Minimum distinct reviewers |
|---|---|
| Evidence record with legal implications | Source verifier + editor + legal reviewer |
| Evidence record without legal implications | Source verifier + editor |
| Legal case summary | Source verifier + editor + legal reviewer |
| Country/institution position | Source verifier + editor + competency reviewer |
| Organization listing | Source verifier + editor |
| Action template with legal implications | Source verifier + editor + legal reviewer + safety reviewer |
| Action template without legal implications | Source verifier + editor + safety reviewer |
| Translation | Translation reviewer + editor |

---

## Who may mark a record reviewed

Only an **editor** may change a record's `contentStatus` to `reviewed`.
Before doing so, the editor must confirm:

1. Source verification is complete (by a different person).
2. All required domain reviews (legal, competency, safety) are complete.
3. The record meets the publication acceptance criteria for its type.
4. The `reviewedByRole` field accurately describes who performed each review.
5. The `lastReviewedAt` date is today's date.

**AI output alone is never sufficient for any review.** An AI tool may
assist with drafting, formatting, or source organisation, but a human
reviewer with the relevant expertise must approve the final content.

---

## Who may publish or unpublish

Only a **maintainer** may publish (merge to `main` and deploy) or unpublish
(remove from public view).

For **routine unpublishing** (stale content, superseded records), the
maintainer changes `contentStatus` to `archived` with a `reviewNotes`
explanation.

For **emergency unpublishing**, see `docs/emergency-unpublish-policy.md`.

---

## Urgent corrections

If a correction involves urgent safety or legal risk (see
`docs/correction-policy.md` for priority definitions), the maintainer may:

1. Immediately change `contentStatus` to `disputed`.
2. Remove the specific concerning content from the public page while
   preserving the record in version history.
3. Initiate the correction workflow without waiting for the normal review
   cycle.
4. Document the action in `reviewNotes`.

---

## Disputed content

When a correction or dispute is filed, the record's `contentStatus` changes
to `disputed`. Public display of disputed content:

- **Factual disputes:** The record remains visible with a "Disputed" badge
  and a note explaining the nature of the dispute.
- **Safety disputes:** The concerning content is removed immediately;
  non-concerning portions may remain visible.
- **Legal disputes:** The record remains visible with a "Disputed" badge;
  legal-status labels are reviewed promptly.
- **Attribution disputes:** The record is marked `disputed`; if the dispute
  concerns image use, the image may be replaced with a placeholder during
  review.

---

## Stale content

A record is stale when its `lastReviewedAt` date exceeds the review
interval for its type (see `docs/content-review-workflow.md`).

When a record becomes stale:
1. Its `contentStatus` is downgraded from `reviewed` to `review_pending`.
2. A `reviewNotes` entry records the staleness.
3. A new review is scheduled.

Staleness is not a correction — it is a routine maintenance action. No
public correction note is required.

---

## Reviewer privacy

- Reviewers are identified by role, not by name, in public metadata.
- The `reviewedByRole` field must use role descriptions, not personal names.
- Internal records mapping roles to individuals may be maintained privately
  but must not be committed to the public repository.
- Reviewers may request that their role annotation be changed or removed.
- No reviewer's personal contact information may be published.
