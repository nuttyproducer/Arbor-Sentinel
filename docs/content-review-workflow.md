# Content Review Workflow

**Status:** Active — applies to all static-beta content records.  
**Last reviewed:** 2026-07-12

## Purpose

Every content record published on Accountability Atlas must pass through a
defined review workflow. This document describes the stages, roles, and
metadata requirements.

## Roles

| Role | Description | Example placeholder |
|---|---|---|
| Source reviewer | Checks source URLs, publisher, dates, and access dates | `source reviewer pending` |
| Editorial reviewer | Checks summary accuracy, clarity, and consistency | `editorial reviewer pending` |
| Legal reviewer | Checks legal terminology, procedural posture, and jurisdictional accuracy | `legal reviewer pending` |
| Subject-matter reviewer | Context-specific expertise (country, institution, humanitarian sector) | `Belgian governance reviewer pending` |
| Safety reviewer | Checks for private information, doxing risk, sensitive location disclosure | `safety reviewer pending` |

## Workflow stages

```
Lead identification  →  Lead preservation  →  Source checking  →
Corroboration  →  Editorial review  →  Publication  →  Ongoing review
```

| Stage | Content status | Required metadata |
|---|---|---|
| 1. Lead identified | `draft` | id, slug, title |
| 2. Lead preserved | `draft` | + sourceIds (at least 1) |
| 3. Source checked | `review_pending` | + sourceQuality, publicationDate |
| 4. Corroborated | `review_pending` | + additional sourceIds |
| 5. Editorial review | `reviewed` | + lastReviewedAt, reviewedByRole |
| 6. Published | `reviewed` | + version ≥ 1, correctionUrl |
| 7. Correction filed | `disputed` | + reviewNotes explaining dispute |
| 8. Correction applied | `corrected` | + version incremented, lastReviewedAt updated |
| 9. Archived | `archived` | + reviewNotes explaining archival reason |

## Metadata requirements per status

### `draft`
- Not visible on public pages.
- Used for internal work-in-progress records.

### `static_preview`
- Visible publicly with a "Static preview" badge.
- Describes structural skeletons and future content areas.
- Must have: id, title, version, correctionUrl.
- Should have: reviewedByRole (placeholder OK).

### `review_pending`
- Visible publicly with a "Review pending" badge.
- Summary is based on at least one public source but has not completed editorial review.
- Must have: id, title, sourceIds (≥1), sourceQuality, version, correctionUrl.
- Should have: lastReviewedAt, reviewedByRole (placeholder OK).

### `reviewed`
- Visible publicly with a "Reviewed" badge.
- Summary has completed editorial review.
- Must have: id, title, sourceIds (≥1), sourceQuality, version, correctionUrl, lastReviewedAt, reviewedByRole.
- For organizations: `sourceIds` may be empty if `officialWebsite` is valid (the organization's own website is the primary source).

### `disputed`
- A correction or dispute has been filed.
- Must have: reviewNotes explaining the dispute.

### `corrected`
- A correction has been applied.
- Must have: version incremented, lastReviewedAt updated.

### `archived`
- No longer displayed publicly.
- Must have: reviewNotes explaining archival reason.

## Review cycle

Every publishable record should have a `nextReviewAt` or stale-after date:

| Record type | Suggested review interval |
|---|---|
| Court records | Every 6 months or when new filings occur |
| UN documents | Every 6 months or when new reports are published |
| Humanitarian updates | Every 3 months |
| Human-rights reports | Every 6 months |
| Parliamentary documents | Every 3 months |
| Organization listings | Every 6 months |
| Action templates | Every 6 months or when legal context changes |
| Attributions | Every 12 months |

## Validation

Static data is validated on every CI run via `src/data/__tests__/validation.test.ts`.
The validation checks:

- Duplicate IDs
- Unreferenced source IDs
- Invalid status values
- Impossible verification levels
- Missing version numbers
- Reviewed records missing review metadata
- Invalid URLs
- Invalid relationship statuses

Run locally:
```bash
npx vitest run src/data/__tests__/validation.test.ts
```
