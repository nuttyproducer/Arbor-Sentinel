# Reviewer Guide

**Status:** Active — applies to all external reviewers contributing to Accountability Atlas.  
**Last reviewed:** 2026-07-24  
**Version:** 0.1.0

---

## Purpose

This guide explains how external reviewers can contribute to Accountability Atlas
in a way that is structured, narrow, safe, and recordable. It defines what review
is, what it is not, and how the platform protects both reviewers and the integrity
of published content.

**This is not a public partnership programme.** Reviewing content for
Accountability Atlas does not create a partnership, endorsement, affiliation,
employment, or official representation relationship.

---

## Who this guide is for

This guide is for anyone invited to review content published or proposed for
publication on Accountability Atlas, including:

- **Source verifiers** — check that sources exist, resolve, and support the summary
- **Editorial reviewers** — check accuracy, clarity, consistency, tone, and terminology
- **Legal reviewers** — check legal terminology, procedural posture, and jurisdictional accuracy
- **Competency reviewers** — check domain-specific facts (country, institution, sector)
- **Safety reviewers** — check for private information, doxing risk, and vulnerable-person exposure
- **Translation reviewers** — check translation accuracy, cultural appropriateness, and source alignment
- **Accessibility reviewers** — check WCAG 2.2 AA compliance, keyboard navigation, and screen-reader support
- **Security / privacy reviewers** — check for vulnerabilities, data leaks, and compliance with the security checklist

---

## What review means on this platform

A review is a **documented, scoped, time-bound check of specific content**
against defined criteria. Each review:

- Has a **review ID** that can be referenced in content metadata
- Covers a **specific scope** (one or more content records, or one aspect of the platform)
- Produces a **written outcome** (approved, changes requested, or blocked)
- May be **public or private** depending on reviewer preference and safety considerations
- Does **not** require the reviewer's identity to be public

A review is **not**:

- An ongoing commitment (each review round is scoped and time-bound)
- A partnership or endorsement of the platform
- A legal relationship with the platform or its maintainers
- Permission for the platform to claim the reviewer as an advisor or representative
- A transfer of intellectual property or confidential information

---

## Review types

The platform uses eight review types, defined in the [Reviewer Matrix](./reviewer-matrix.md):

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

---

## Before you start

### 1. Confirm the scope

Before beginning a review, confirm:

- **Which content records** are in scope (by ID, slug, or page URL)
- **Which review type(s)** you are performing
- **What criteria** apply (see the [Publication Acceptance Criteria](./publication-acceptance-criteria.md) for your content type)
- **What version or commit** you are reviewing
- **The deadline** for submitting your feedback

### 2. Check for conflicts of interest

Review the [Conflict of Interest Policy](./reviewer-conflict-of-interest.md).
If you have a personal, professional, or financial interest in the content you
are being asked to review, disclose it before starting. The maintainer will
decide whether to adjust the scope or seek an alternative reviewer.

### 3. Understand the platform's boundaries

Accountability Atlas:

- **Is not a legal authority.** It organises public records and attributes legal
  conclusions to the bodies that made them.
- **Does not collect or publish private testimony, personal data, or confidential
  material.** If you encounter such material in draft content, flag it immediately.
- **Does not imply partnership without written confirmation.** Your review does
  not make you a partner, advisor, or representative of the platform.
- **May publish your role description** (e.g., "legal reviewer") in content
  metadata. Your name is published **only with your explicit permission**.

---

## How to conduct a review

### Source review (SRC)

1. Open each source URL referenced in the content record.
2. Confirm the URL resolves to the correct page.
3. Verify the publisher, publication date, and access date are correctly recorded.
4. Check that the source supports the claims made in the platform's summary.
5. Confirm the source type assignment is correct (court, UN, government, humanitarian, NGO, academic, journalism, OSINT).
6. Note any sources that are inaccessible, misattributed, or unreliable.

Use the [Source Review Checklist](./source-review-checklist.md) as your working checklist.

### Editorial review (EDI)

1. Read the content record's summary, title, and description.
2. Compare against the referenced sources.
3. Check for accuracy, clarity, and consistency with the platform's tone and terminology policies.
4. Verify that the record does not imply partnership, endorsement, or legal conclusions that have not been made.
5. Confirm that the `contentStatus` and metadata are appropriate for the review stage.
6. Note any wording that should be changed, with suggested replacements.

### Legal review (LEG)

1. Review all legal terminology in the content record.
2. Confirm that legal-status labels use the controlled vocabulary.
3. Check that procedural posture descriptions are accurate (allegation vs. application vs. finding vs. warrant vs. provisional measure vs. ruling vs. judgment).
4. Verify that conclusions are attributed to the court or body that made them.
5. Confirm that the content does not state legal guilt before a final judgment.
6. Flag any wording that could be read as implying a legal determination that has not been made.

Reference the [Legal Language Policy](./legal-language-policy.md) and
[Legal Language Guide](./legal-language-guide.md) for specific terminology standards.

### Competency review (COM)

1. Verify factual claims about the country, institution, or sector against primary sources.
2. Confirm that competency boundaries are correctly stated (what an institution can and cannot do).
3. Check that institutional names, titles, and structures are accurate.
4. Flag any misrepresentations of institutional authority or jurisdiction.
5. Note any missing context that a domain expert would consider essential.

### Safety review (SAF)

1. Scan the content for private personal information (names, contact details, addresses).
2. Check for exact dangerous locations that could expose vulnerable people.
3. Look for identifying details about witnesses, victims, or at-risk individuals.
4. Verify that no doxing content or targeting language is present.
5. Confirm that graphic content has appropriate warnings.
6. Block publication if any safety criterion is not met — document the reason.

A safety reviewer's block may only be overridden by the maintainer after documented
consultation with at least one other reviewer (see [Editorial Governance](./editorial-governance.md)).

### Translation review (TRN)

1. Compare the translation against the source (English) text.
2. Verify that legal terminology is correctly translated.
3. Check that institutional names use the official or widely-accepted translation.
4. Confirm that the tone matches the platform's editorial standards in the target language.
5. Note any passages that are misleading, culturally inappropriate, or mistranslated.
6. If machine translation was used in the draft, confirm that a human has reviewed every passage.

Reference the [Translation Review Policy](./translation-review-policy.md).

### Accessibility review (ACC)

1. Navigate the page using only the keyboard — check tab order, focus visibility, and skip-link.
2. Test with a screen reader (VoiceOver on macOS, or NVDA on Windows).
3. Verify heading hierarchy is logical (no skipped levels).
4. Check that all images have appropriate alt text.
5. Confirm that `prefers-reduced-motion` is respected.
6. Check contrast ratios meet WCAG AA minimums.
7. Test at 200% and 400% zoom — all content must remain readable.
8. Test at 375px viewport — no horizontal overflow.

Reference the [Accessibility and Performance Gate](./accessibility-and-performance-gate.md)
for the complete checklist.

### Security / privacy review (SEC)

1. Verify that no external requests are made to third-party domains (static-beta requirement).
2. Check that CSP headers are correctly configured.
3. Confirm that no personal data is collected, stored, or exposed.
4. Review any dependency changes for supply-chain risk.
5. Verify that external links use `rel="noopener noreferrer"`.
6. Check that `security.txt` is accessible and current.

Reference the [Static Beta Security Checklist](./static-beta-security-checklist.md).

---

## Submitting your review

Use the [Reviewer Feedback Template](./reviewer-feedback-template.md) to submit
your findings. Every review submission should include:

- **Review ID** (assigned by the maintainer when the review round is created)
- **Content/record IDs** reviewed
- **Review type**
- **Reviewer role** (as you wish it to appear in metadata — may be a role description, not your name)
- **Review date**
- **Scope** (what was reviewed)
- **Outcome** (approved / changes requested / blocked)
- **Issues found** (with severity: critical / high / medium / low)
- **Required changes** (specific, actionable)
- **Unresolved risk** (anything that could not be resolved within this review)
- **Visibility preference** (public metadata only / full report public / private)
- **Commit or version reviewed**

### Visibility preferences

You control how your review is recorded:

| Visibility | What appears publicly | What stays private |
|---|---|---|
| **Public metadata only** | Review type, date, outcome, reviewer role | Reviewer identity, detailed findings |
| **Full report public** | All findings and the reviewer role | Reviewer identity (unless you choose to be named) |
| **Private** | Nothing publicly attributed | Entire review record kept internal |

The default is **public metadata only**. You may choose a different visibility
for each review.

**Reviewer identity:** Your name is never published without your explicit,
written permission. The `reviewedByRole` field in content metadata uses role
descriptions (e.g., "legal reviewer", "Belgian governance reviewer"), not
personal names.

---

## What reviewers must not do

Reviewers must not:

- **Mark content as `reviewed`.** Only an editor may change `contentStatus` to
  `reviewed`, and only after all required reviews are complete.
- **Speak for the platform.** Reviewers may describe their contribution ("I
  reviewed the legal terminology for the Belgium country page") but may not
  speak for the project, its maintainers, or its positions without written
  authorisation.
- **Share unpublished content.** Draft records, internal discussions, and
  pre-publication content must not be shared outside the review process.
- **Collect or submit sensitive personal data.** If you encounter private
  personal information in draft content, flag it — do not collect, store, or
  forward it.
- **Use the review relationship to imply endorsement.** You may say "I reviewed
  [specific content] for [specific aspect]" but not "I endorse Accountability
  Atlas" or "I am a partner of Accountability Atlas" unless you have separately
  entered into a written partnership agreement.
- **Contact listed organisations about their listing.** Only authorised
  maintainers may conduct outreach to listed organisations.

---

## Privacy and safety for reviewers

### Your privacy

- Your identity as a reviewer is stored privately by the maintainer.
- Your name is never published in the public repository without your explicit consent.
- You may use a role description instead of your name in all public metadata.
- You may request that your role annotation be changed or removed at any time.
- You may withdraw from a review round at any time before the review is recorded
  in content metadata.

### Your safety

- If reviewing content related to a country, institution, or legal case creates
  risk for you, disclose this to the maintainer before starting.
- You may decline any review assignment without giving a reason.
- The platform does not publish reviewer contact information.
- If you receive unwanted contact as a result of your review role, inform the
  maintainer immediately.

---

## Credit and attribution

Reviewers may be credited **only with permission**:

- **Role credit:** Your role (e.g., "legal reviewer") may appear in the
  `reviewedByRole` field of content metadata. This is the default and does not
  require additional permission beyond your participation in the review.
- **Name credit:** Your name appears in public metadata **only** if you provide
  explicit, written permission. You may grant or withdraw this permission at
  any time.
- **Public acknowledgement:** You may be listed in the [Attributions](./attributions.md)
  page or contributor list **only** with your permission.
- **Self-description:** You may describe your contribution publicly ("I served
  as a legal reviewer for Accountability Atlas content on [topic]") without
  needing platform permission, provided you do not claim to speak for the
  platform.

---

## Ending a review relationship

Either the reviewer or the maintainer may end a review relationship at any time:

- **Reviewer withdraws:** Notify the maintainer. Any completed review work
  already recorded in content metadata remains valid. In-progress work is
  returned to the maintainer for reassignment.
- **Maintainer ends the round:** The maintainer notifies the reviewer. Any
  completed review work is recorded. The reviewer is removed from active
  review assignments.
- **Offboarding:** The maintainer removes the reviewer's access (if any was
  granted), updates any internal records, and confirms that no further review
  assignments will be created.

---

## Static-beta accommodations

During the public static beta (2026-07-12 onward):

- The reviewer pool is small. Content may be published as `review_pending` if
  the required reviewers are not available. It must not be marked `reviewed`.
- AI-assisted review may assist with drafting and formatting but **must not**
  substitute for human review. AI output alone is never sufficient for any
  review.
- The `reviewedByRole` field must use honest placeholder language describing
  which reviews are complete and which are pending.
- Records marked `reviewed` must have been reviewed by at least one other person.
  The separation-of-duties rules in the [Reviewer Matrix](./reviewer-matrix.md)
  apply even when the contributor pool is small.

---

## Related documents

- [Reviewer Matrix](./reviewer-matrix.md) — required reviews per content type
- [Reviewer Feedback Template](./reviewer-feedback-template.md) — how to submit findings
- [Reviewer Conflict of Interest Policy](./reviewer-conflict-of-interest.md)
- [Review Evidence Format](./review-evidence-format.md) — how reviews are recorded
- [Review Round Runbook](./review-round-runbook.md) — maintainer procedures
- [Content Review Workflow](./content-review-workflow.md) — content statuses and stages
- [Editorial Governance](./editorial-governance.md) — roles, responsibilities, and decision paths
- [Publication Acceptance Criteria](./publication-acceptance-criteria.md) — gates per content type
- [Source Review Checklist](./source-review-checklist.md) — source verification checklist
- [Legal Language Policy](./legal-language-policy.md) — legal terminology standards
- [Partnership Policy](./partnership-policy.md) — relationship claims and disclaimers
- [Relationship Status Policy](./relationship-status-policy.md) — organisation relationship statuses
- [Privacy Principles](./privacy-principles.md) — data minimisation and protection
- [Ethics and Safety Policy](./ethics-and-safety.md) — ethical boundaries
- [Communications Playbook](./communications-playbook.md) — how to talk about the platform
- [Correction Policy](./correction-policy.md) — how errors are handled
- [Translation Review Policy](./translation-review-policy.md) — translation standards
- [Accessibility and Performance Gate](./accessibility-and-performance-gate.md) — accessibility standards
- [Static Beta Security Checklist](./static-beta-security-checklist.md)
- [Attributions](./attributions.md) — contributor and reviewer credits
