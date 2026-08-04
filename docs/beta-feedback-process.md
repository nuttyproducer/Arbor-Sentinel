# Beta Feedback Process

**Status:** Active — M7-05 beta onboarding
**Last reviewed:** 2026-08-04

---

## Overview

Beta feedback and bug reports are collected through authenticated forms and
stored server-side with a user reference, timestamp, page context, and browser
info. This document describes the end-to-end process: submission, moderation,
triage, and resolution.

## Submissions

### Feedback (`POST /api/v1/feedback`)

| Field | Type | Notes |
|---|---|---|
| `rating` | `1`–`5` | Required |
| `category` | `content` / `UI` / `performance` / `feature` / `missing` | Required |
| `message` | string | Required, free text |
| `pageContext` | string | Page where feedback was given |
| `browserInfo` | string | Captured automatically at submission |
| `screenshot` | file | Field wired into the UI; **not uploaded during the beta** |

### Bug reports (`POST /api/v1/bug-reports`)

| Field | Type | Notes |
|---|---|---|
| `title` | string | Required |
| `description` | string | Required |
| `stepsToReproduce` | string | Required |
| `expectedBehavior` | string | Required |
| `actualBehavior` | string | Required |
| `browserInfo` | string | Captured automatically at submission |
| `severity` | `critical` / `major` / `minor` / `cosmetic` | Required |
| `screenshot` | file | Field wired into the UI; **not uploaded during the beta** |

All submissions require authentication. Rate limiting is enforced server-side
(M7-03); clients surface `HTTP_429` as a "too many submissions" message.

## Data model

See `src/lib/beta/types.ts` for the exact TypeScript interfaces:

- `FeedbackSubmission` — `status`: `new` → `reviewed` → `acknowledged` → `closed`
- `BugReport` — `status`: `new` → `triaged` → `assigned` → `in_progress` →
  `resolved` → `closed`
- `UserJourney` — aggregate-only page/feature/time analytics, no user identifiers

## Moderation queue

Feedback and bug reports enter a moderation queue after submission. The `status`
field drives the queue; reviewers use the existing admin review patterns to:

- **Feedback:** review, categorize, prioritize, respond, and close. Moderation
  must not censor legitimate criticism.
- **Bug reports:** auto-categorize by severity, assign to the appropriate
  maintainer, and track status to resolution.

The admin queue UI is built on the existing admin conventions and consumes the
same `FeedbackSubmission` and `BugReport` shapes.

## Bug report triage

- **Critical** — blocks or breaks core functionality. Assigned immediately to an
  on-call maintainer.
- **Major** — significant issue with a workaround. Assigned to the owning
  maintainer within a release cycle.
- **Minor** — noticeable but non-blocking. Prioritized with the backlog.
- **Cosmetic** — visual or formatting only. Batched for periodic cleanup.

## User journey tracking

Anonymous, aggregate analytics (`UserJourney`) record which pages were visited,
which features were used, and time on page. This is opt-in and privacy-preserving:

- No user identifiers are ever collected.
- The client-side opt-in preference is stored in `localStorage`
  (`beta:analytics-opt-in`).
- Tracking is best-effort and never blocks the user experience.

## Guardrails

- Feedback must not collect personal data beyond the user account (already
  authenticated).
- Anonymous analytics must be opt-in and privacy-preserving.
- User journey tracking must not track individual users — aggregate only.
- Bug reports must not accept file uploads without size/type validation (files
  are not uploaded during the beta).
- Feedback moderation must not censor legitimate criticism.

## Client integration

The frontend integration lives in `src/lib/beta/feedback.ts` and follows the
`src/lib/api/client.ts` typed-fetch pattern. Forms live in
`src/components/beta/` and pages under `/beta/*`.
