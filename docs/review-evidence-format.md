# Review Evidence Format

**Status:** Active — defines how review evidence is structured and recorded.  
**Last reviewed:** 2026-07-24  
**Version:** 0.1.0

---

## Purpose

This document defines the structured format for recording review evidence on
Arbor Sentinel. It supports the future transition from `review_pending`
to `reviewed` by ensuring that every review produces consistent, machine-
readable evidence that can be referenced in content metadata, audit trails,
and publication decisions.

---

## Design principles

1. **Structured, not narrative.** Review evidence is recorded as discrete,
   queryable fields. Narrative commentary is welcome but must be accompanied
   by structured data.
2. **Public by default, private by option.** Review metadata (type, date,
   outcome, reviewer role) is public. Detailed findings and reviewer identity
   are public only if the reviewer permits.
3. **No sensitive evidence.** Review evidence records do not contain private
   personal data, confidential institutional material, private testimony, or
   unreviewed third-party data.
4. **No partnership implication.** The existence of a review evidence record
   does not imply a partnership, endorsement, or ongoing relationship with
   the reviewer.
5. **Immutable once recorded.** Review evidence records, once associated with
   a published content version, are not edited. Corrections or updates create
   a new review evidence record referencing the prior one.

---

## Review evidence record schema

### Required fields

| Field | Type | Description |
|---|---|---|
| `reviewEvidenceId` | string | Unique identifier for this review evidence record. Format: `REV-EVIDENCE-YYYY-NNN` (e.g., `REV-EVIDENCE-2026-001`) |
| `reviewId` | string | Identifier for the review round. Format: `REV-YYYY-NNN` (e.g., `REV-2026-001`) |
| `contentRecordIds` | string[] | Array of content record IDs reviewed (e.g., `["evidence-0001", "evidence-0002"]`) |
| `reviewType` | enum | One of: `SRC`, `EDI`, `LEG`, `COM`, `SAF`, `TRN`, `ACC`, `LIC`, `SEC` |
| `reviewerRole` | string | Role description for public metadata (e.g., "legal reviewer", "Belgian governance reviewer"). Not a personal name unless the reviewer permits. |
| `reviewDate` | date | `YYYY-MM-DD` — date the review was completed and submitted |
| `scope` | string | Description of what was reviewed and what criteria were applied |
| `outcome` | enum | One of: `approved`, `changes_requested`, `blocked` |
| `commitOrVersion` | string | Git commit hash or content version number reviewed |
| `visibility` | enum | One of: `public_metadata`, `public_full`, `private` |

### Optional fields

| Field | Type | Description |
|---|---|---|
| `issuesFound` | Issue[] | Array of issues identified during review |
| `requiredChanges` | Change[] | Array of specific changes required |
| `unresolvedRisk` | Risk[] | Array of risks that could not be resolved in this review |
| `reviewerName` | string | Reviewer's name — included ONLY if the reviewer has given explicit written permission. Omit otherwise. |
| `reviewerNamePermissionDate` | date | `YYYY-MM-DD` — date the reviewer gave permission for their name to appear. Required if `reviewerName` is set. |
| `criteriaApplied` | string[] | Array of document references applied (e.g., `["publication-acceptance-criteria.md", "legal-language-policy.md"]`) |
| `supersedesReviewEvidenceId` | string | If this review supersedes a previous review of the same content, the ID of the superseded record |
| `notes` | string | Additional context or commentary from the reviewer. Must not contain private personal data or confidential material. |

### Issue sub-schema

| Field | Type | Description |
|---|---|---|
| `issueId` | string | Unique within the review evidence record (e.g., `1`, `2`, `3`) |
| `recordId` | string | The content record ID the issue relates to |
| `severity` | enum | `critical`, `high`, `medium`, `low` |
| `description` | string | Clear, specific description of the issue |
| `suggestedFix` | string | Actionable suggestion for resolving the issue |

### Change sub-schema

| Field | Type | Description |
|---|---|---|
| `changeId` | string | Unique within the review evidence record |
| `recordId` | string | The content record ID the change applies to |
| `currentText` | string | The text or element as it currently appears |
| `requiredChange` | string | The specific, actionable change required |
| `reason` | string | Why the change is needed, with source reference if applicable |

### Risk sub-schema

| Field | Type | Description |
|---|---|---|
| `riskId` | string | Unique within the review evidence record |
| `description` | string | Description of the risk |
| `reasonUnresolved` | string | Why the risk could not be resolved in this review |
| `recommendedFollowUp` | string | What should happen next |

---

## Full schema (YAML representation)

```yaml
reviewEvidenceId: "REV-EVIDENCE-2026-001"
reviewId: "REV-2026-001"
contentRecordIds:
  - "evidence-0001"
  - "evidence-0002"
reviewType: "LEG"
reviewerRole: "legal reviewer"
reviewDate: "2026-07-24"
scope: >
  Legal review of evidence records evidence-0001 and evidence-0002.
  Criteria: Publication Acceptance Criteria for evidence records with
  legal implications, Legal Language Policy, Legal Language Guide.
outcome: "changes_requested"
commitOrVersion: "abc123def456"
visibility: "public_metadata"
criteriaApplied:
  - "publication-acceptance-criteria.md"
  - "legal-language-policy.md"
  - "legal-language-guide.md"

issuesFound:
  - issueId: "1"
    recordId: "evidence-0001"
    severity: "high"
    description: >
      The summary uses "the court found" to describe a provisional
      measures order. Provisional measures are not a finding on the
      merits. Should use "the court ordered provisional measures."
    suggestedFix: >
      Replace "the court found that" with "the court ordered
      provisional measures requiring" and add a procedural note
      explaining that provisional measures do not prejudge the merits.

  - issueId: "2"
    recordId: "evidence-0002"
    severity: "medium"
    description: >
      The legal-status label "investigation" should be "arrest warrant
      issued" based on the referenced ICC source.
    suggestedFix: >
      Update legalStatuses array to replace "investigation" with
      "arrest_warrant_issued". Verify against the ICC public record
      at [source URL].

requiredChanges:
  - changeId: "1"
    recordId: "evidence-0001"
    currentText: "the court found that the respondent must take provisional measures"
    requiredChange: "the court ordered provisional measures requiring the respondent to"
    reason: >
      Accuracy of procedural posture. Under ICJ practice, provisional
      measures are ordered, not found. The distinction matters for
      legal credibility. See Legal Language Policy: "Do not treat
      provisional measures as final genocide findings."

  - changeId: "2"
    recordId: "evidence-0002"
    currentText: "legalStatuses: [\"investigation\"]"
    requiredChange: "legalStatuses: [\"arrest_warrant_issued\"]"
    reason: >
      The ICC Pre-Trial Chamber issued arrest warrants, not merely
      opened an investigation. Source: ICC public record [URL].

unresolvedRisk:
  - riskId: "1"
    description: >
      The ICC proceedings referenced in evidence-0002 are ongoing.
      The procedural posture may change with new filings. A review
      interval of 3 months is recommended rather than the standard
      6 months.
    reasonUnresolved: "Outside the scope of this review round."
    recommendedFollowUp: >
      Set nextReviewAt to 2026-10-24. Schedule a follow-up legal
      review for Q4 2026 or earlier if a new filing occurs.

notes: >
  Both records are well-sourced. The issues identified are about legal
  precision, not about factual accuracy. Once the required changes are
  applied and confirmed, these records can proceed to editorial review
  for `reviewed` status.
```

---

## JSON representation (for machine processing)

```json
{
  "reviewEvidenceId": "REV-EVIDENCE-2026-001",
  "reviewId": "REV-2026-001",
  "contentRecordIds": ["evidence-0001", "evidence-0002"],
  "reviewType": "LEG",
  "reviewerRole": "legal reviewer",
  "reviewDate": "2026-07-24",
  "scope": "Legal review of evidence records evidence-0001 and evidence-0002. Criteria: Publication Acceptance Criteria for evidence records with legal implications, Legal Language Policy, Legal Language Guide.",
  "outcome": "changes_requested",
  "commitOrVersion": "abc123def456",
  "visibility": "public_metadata",
  "criteriaApplied": [
    "publication-acceptance-criteria.md",
    "legal-language-policy.md",
    "legal-language-guide.md"
  ],
  "issuesFound": [
    {
      "issueId": "1",
      "recordId": "evidence-0001",
      "severity": "high",
      "description": "The summary uses 'the court found' to describe a provisional measures order. Provisional measures are not a finding on the merits.",
      "suggestedFix": "Replace 'the court found that' with 'the court ordered provisional measures requiring' and add a procedural note."
    }
  ],
  "requiredChanges": [
    {
      "changeId": "1",
      "recordId": "evidence-0001",
      "currentText": "the court found that the respondent must take provisional measures",
      "requiredChange": "the court ordered provisional measures requiring the respondent to",
      "reason": "Accuracy of procedural posture. See Legal Language Policy."
    }
  ],
  "unresolvedRisk": [],
  "notes": "Both records are well-sourced. Issues are about legal precision, not factual accuracy."
}
```

---

## How review evidence is used

### 1. Recording a completed review

When a reviewer submits their feedback (using the [Reviewer Feedback Template](./reviewer-feedback-template.md)),
the maintainer converts it into a review evidence record. The record is stored:

- **During static beta:** As a structured document in the review evidence
  directory (path to be determined when backend infrastructure exists).
  Currently, review evidence is maintained in internal maintainer records.
- **Post-MVP:** In a structured data store that can be queried by review type,
  content record, date range, and outcome.

### 2. Supporting a `reviewed` content status

Before an editor may change a content record's `contentStatus` to `reviewed`,
the following review evidence must exist:

- For each required review type (per the [Reviewer Matrix](./reviewer-matrix.md)),
  a review evidence record with `outcome: "approved"` (or `"changes_requested"`
  where all required changes have been confirmed as applied)
- Each review evidence record must have a `reviewDate` on or before the
  `lastReviewedAt` date of the content record
- At least the minimum number of distinct reviewers (per the Reviewer Matrix)
  must be represented across the review evidence records

### 3. Audit trail

Review evidence records form an audit trail for each content record:

- Every `reviewed` content record can be traced back to specific review
  evidence records
- Corrections and updates can reference the review evidence that supported
  the previous version
- Disputes can be evaluated against the review evidence that supported the
  original publication

### 4. Staleness and re-review

When a content record becomes stale (its `lastReviewedAt` exceeds the review
interval), the existing review evidence records are not deleted. A new review
round is created, producing new review evidence records that may:
- Confirm the original findings (no changes needed)
- Identify new issues (content has become outdated)
- Supersede specific findings from the previous review

---

## What this format does not capture

This format deliberately does **not** capture:

- **Private personal data.** No names, contact details, addresses, or
  identifying information about individuals who are not public officials
  in their official capacity.
- **Confidential institutional material.** No internal documents, private
  correspondence, or unpublished data from reviewed institutions.
- **Private testimony.** No witness statements, personal accounts, or
  testimony that has not been published through official channels.
- **Unreviewed third-party data.** No data from third parties that has not
  itself been verified.
- **Reviewer private information.** No personal contact details, private
  communications, or internal deliberations between reviewer and maintainer.
- **Legal advice.** Review evidence describes what was checked and what was
  found. It does not constitute legal advice to the platform, to users, or
  to any third party.

---

## Public visibility rules

| Field | `public_metadata` | `public_full` | `private` |
|---|---|---|---|
| `reviewEvidenceId` | ✅ Public | ✅ Public | ❌ Private |
| `reviewId` | ✅ Public | ✅ Public | ❌ Private |
| `contentRecordIds` | ✅ Public | ✅ Public | ❌ Private |
| `reviewType` | ✅ Public | ✅ Public | ❌ Private |
| `reviewerRole` | ✅ Public | ✅ Public | ❌ Private |
| `reviewDate` | ✅ Public | ✅ Public | ❌ Private |
| `outcome` | ✅ Public | ✅ Public | ❌ Private |
| `scope` | ✅ Public | ✅ Public | ❌ Private |
| `issuesFound` | ❌ Private | ✅ Public | ❌ Private |
| `requiredChanges` | ❌ Private | ✅ Public | ❌ Private |
| `unresolvedRisk` | ❌ Private | ✅ Public | ❌ Private |
| `reviewerName` | ❌ Private | ❌ Private* | ❌ Private |
| `notes` | ❌ Private | ✅ Public | ❌ Private |

\* `reviewerName` is never automatically public. It is included only with the
reviewer's explicit, written permission, regardless of the `visibility` setting.
A reviewer may choose `public_full` visibility for their findings while still
keeping their name private.

---

## Relationship to content metadata

Review evidence records complement — but do not replace — content record
metadata:

| Content metadata field | Relationship to review evidence |
|---|---|
| `contentStatus` | Changes to `reviewed` only when all required review evidence records exist with approved outcomes |
| `reviewedByRole` | Summarises the `reviewerRole` values from all review evidence records for this content version |
| `lastReviewedAt` | Set to the most recent `reviewDate` among the review evidence records |
| `reviewNotes` | May reference specific `reviewEvidenceId` values for traceability |
| `version` | Incremented when changes from a review evidence record are applied |

---

## Static-beta storage

During the public static beta, review evidence records are maintained as
structured documents in the maintainer's internal records. They are **not**
committed to the public repository because:

- The repository is public and review evidence may contain information the
  reviewer has chosen to keep private
- Review evidence records may reference internal deliberations
- A permanent storage location for structured review evidence has not yet
  been designed

When a backend or structured data store is introduced (post-MVP), review
evidence records will be migrated to a queryable, access-controlled store.

---

## Related documents

- [Reviewer Guide](./reviewer-guide.md) — how to conduct reviews
- [Reviewer Feedback Template](./reviewer-feedback-template.md) — how to submit findings
- [Reviewer Matrix](./reviewer-matrix.md) — required reviews per content type
- [Content Review Workflow](./content-review-workflow.md) — content statuses and stages
- [Editorial Governance](./editorial-governance.md) — roles and decision paths
- [Publication Acceptance Criteria](./publication-acceptance-criteria.md) — gates per content type
- [Review Round Runbook](./review-round-runbook.md) — maintainer procedures
- [Data Model](./data-model.md) — content record schemas
