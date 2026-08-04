# Reviewer Feedback Template

**Status:** Active — use for all review submissions.  
**Last reviewed:** 2026-07-24  
**Version:** 0.1.0

---

## Purpose

This template standardises how reviewers submit findings to Arbor Sentinel
maintainers. Use it for every review round. Completed templates become review
evidence records (see [Review Evidence Format](./review-evidence-format.md)).

---

## Before you submit

- [ ] You have reviewed only the content records in your assigned scope
- [ ] You have checked the [Conflict of Interest Policy](./reviewer-conflict-of-interest.md) and disclosed any conflicts
- [ ] You understand that submitting a review does not create a partnership,
  endorsement, affiliation, employment, or official representation relationship
- [ ] You have indicated your visibility preference for this review
- [ ] You have confirmed whether you permit your name to appear in public metadata

---

## Review submission form

```markdown
## Review metadata

- **Review ID:** [Assigned by maintainer — e.g., REV-2026-001]
- **Review type:** [SRC / EDI / LEG / COM / SAF / TRN / ACC / LIC / SEC]
- **Reviewer role (for public metadata):** [e.g., "legal reviewer", "Belgian governance reviewer", "translation reviewer (Arabic)"]
- **Review date:** [YYYY-MM-DD]
- **Commit or version reviewed:** [Git commit hash, or version number]

---

## Scope

### Content records reviewed

| Record ID | Record type | Title |
|---|---|---|
| [e.g., evidence-0001] | [EvidenceItem] | [Title] |
| [e.g., belgium] | [CountrySection] | [Title] |

### Review criteria applied

- [ ] [Publication Acceptance Criteria](./publication-acceptance-criteria.md) for [content type]
- [ ] [Source Review Checklist](./source-review-checklist.md)
- [ ] [Legal Language Policy](./legal-language-policy.md)
- [ ] [Accessibility and Performance Gate](./accessibility-and-performance-gate.md)
- [ ] [Static Beta Security Checklist](./static-beta-security-checklist.md)
- [ ] Other: [specify]

---

## Outcome

**Overall outcome:** [Approved / Changes requested / Blocked]

If blocked, the content must not be published until the blocking issues are
resolved. A safety reviewer's block may only be overridden by the maintainer
after documented consultation (see [Editorial Governance](./editorial-governance.md)).

---

## Issues found

### Critical

Issues that must be resolved before publication. Content is blocked until fixed.

| # | Record ID | Issue | Suggested fix |
|---|---|---|---|
| 1 | [ID] | [Clear description of the issue] | [Specific, actionable suggestion] |
| 2 | [ID] | | |

### High

Issues that should be resolved before publication. Content may be published as
`review_pending` with a noted caveat if resolution is not possible.

| # | Record ID | Issue | Suggested fix |
|---|---|---|---|
| 1 | [ID] | [Clear description of the issue] | [Specific, actionable suggestion] |

### Medium

Issues that should be addressed in the next review cycle.

| # | Record ID | Issue | Suggested fix |
|---|---|---|---|
| 1 | [ID] | [Clear description of the issue] | [Specific, actionable suggestion] |

### Low

Minor improvements or suggestions. Optional.

| # | Record ID | Issue | Suggested fix |
|---|---|---|---|
| 1 | [ID] | [Clear description of the issue] | [Specific, actionable suggestion] |

---

## Required changes

List every specific, actionable change required to resolve the issues above.

| # | Record ID | Current text / element | Required change | Reason |
|---|---|---|---|---|
| 1 | [ID] | "[current wording]" | "[corrected wording]" | [Why this change is needed, with source reference if applicable] |

---

## Unresolved risk

Any risks or concerns that could not be resolved within this review round.

| # | Risk | Why unresolved | Recommended follow-up |
|---|---|---|---|
| 1 | [Description of the risk] | [e.g., source inaccessible, expertise gap, time constraint] | [What should happen next] |

---

## Source verification log (SRC reviews only)

| Source ID | URL resolves? | Publisher correct? | Date correct? | Supports summary? | Notes |
|---|---|---|---|---|---|
| [ID] | Yes / No | Yes / No | Yes / No | Yes / No | |

---

## Legal terminology check (LEG reviews only)

| Term used | Record ID | Correct? | If not, what should it be? | Reference |
|---|---|---|---|---|
| [e.g., "provisional measures"] | [ID] | Yes / No | [Corrected term] | [Source: court document, legal reference] |

---

## Accessibility findings (ACC reviews only)

| Criterion | Pass? | Issue (if fail) | Suggested fix |
|---|---|---|---|
| Keyboard navigation | Yes / No | | |
| Focus visibility | Yes / No | | |
| Heading hierarchy | Yes / No | | |
| Alt text | Yes / No | | |
| Contrast (WCAG AA) | Yes / No | | |
| Reduced motion | Yes / No | | |
| 200% zoom | Yes / No | | |
| 375px viewport | Yes / No | | |
| Screen reader | Yes / No | | |

---

## Security / privacy findings (SEC reviews only)

| Check | Pass? | Issue (if fail) | Suggested fix |
|---|---|---|---|
| No external requests | Yes / No | | |
| CSP headers correct | Yes / No | | |
| No personal data exposed | Yes / No | | |
| External links use noopener | Yes / No | | |
| security.txt accessible | Yes / No | | |
| Dependency risk | Yes / No | | |

---

## Visibility and credit

### Visibility preference

- [ ] **Public metadata only** — review type, date, outcome, and reviewer role
  appear in content metadata. Detailed findings are kept internal.
- [ ] **Full report public** — all findings and the reviewer role are public.
  Reviewer identity is not published unless separately permitted.
- [ ] **Private** — nothing publicly attributed. Entire review record is kept
  internal.

### Name credit

- [ ] I permit my name to appear in public metadata as the reviewer for this content.
  Name as it should appear: ____________________________________________
- [ ] I do not permit my name to appear in public metadata. Use my role
  description only.

### Attribution listing

- [ ] I permit my name to be listed on the [Attributions](./attributions.md) page.
- [ ] I do not permit my name to be listed on the Attributions page.

---

## Reviewer declaration

By submitting this review, I confirm that:

- [ ] I have reviewed only the content records listed in the scope above
- [ ] I have disclosed any conflicts of interest to the maintainer
- [ ] I understand that this review does not create a partnership, endorsement,
  affiliation, employment, or official representation relationship with
  Arbor Sentinel
- [ ] I understand that I may describe my contribution ("I reviewed [specific
  content] for [specific aspect]") but may not speak for the project without
  written authorisation
- [ ] I have not submitted, collected, or stored any private personal data,
  confidential institutional material, or sensitive evidence as part of this review
- [ ] My visibility and credit preferences above are accurate

---

## Maintainer use only

| Field | Value |
|---|---|
| Review recorded in content metadata? | Yes / No |
| `reviewedByRole` text | |
| `lastReviewedAt` date | |
| Issues filed in tracker? | Yes / No — issue #s: |
| Reviewer credited in attributions? | Yes / No |
| Follow-up scheduled? | Yes / No — date: |
| Review evidence record ID | [REV-EVIDENCE-YYYY-NNN] |
```

---

## Related documents

- [Reviewer Guide](./reviewer-guide.md) — how to conduct each review type
- [Review Evidence Format](./review-evidence-format.md) — how completed reviews are recorded
- [Reviewer Conflict of Interest Policy](./reviewer-conflict-of-interest.md)
- [Review Round Runbook](./review-round-runbook.md) — maintainer procedures
- [Publication Acceptance Criteria](./publication-acceptance-criteria.md)
- [Editorial Governance](./editorial-governance.md)
