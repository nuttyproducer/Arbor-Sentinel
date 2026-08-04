# Review Round Runbook

**Status:** Active — maintainer procedures for managing review rounds.  
**Last reviewed:** 2026-07-24  
**Version:** 0.1.0

---

## Purpose

This runbook defines the step-by-step procedures for maintainers to initiate,
manage, and close review rounds on Arbor Sentinel. It ensures that every
review is structured, scoped, and recorded consistently — and that no reviewer
is left with an ambiguous assignment.

---

## What is a review round?

A review round is a **scoped, time-bound assignment** for one or more reviewers
to check specific content against defined criteria. Each round:

- Has a unique **review ID** (format: `REV-YYYY-NNN`)
- Covers **one review type** for **one or more content records**
- Has a **deadline** for submission
- Produces **review evidence records** that can be referenced in content metadata
- Is **closed** when all findings are submitted, triaged, and either applied or
  deferred

Multiple review rounds may run in parallel for different review types on the
same content (e.g., a source review and a legal review running concurrently on
the same evidence record).

---

## Phase 1: Prepare the review round

### 1.1 Identify the need

A review round is needed when:

- New content records have been drafted and are approaching `review_pending` status
- Existing `review_pending` records need a specific review type to progress to `reviewed`
- A content record has become stale and needs re-review
- A correction has been applied and the corrected content needs review
- A new content type or page has been developed and needs initial review
- A reviewer has flagged something that warrants a focused review round

### 1.2 Define the scope

For each review round, document:

- **Which content records** are in scope (by ID, slug, or page URL)
- **Which review type** is needed (SRC, EDI, LEG, COM, SAF, TRN, ACC, LIC, SEC)
- **Which criteria apply** (reference specific documents from `docs/`)
- **What version or commit** is to be reviewed
- **Whether any prior reviews exist** for this content (check `reviewedByRole` and `reviewNotes` in the content metadata)

Use the scope worksheet:

```markdown
## Review round scope worksheet

**Review ID:** REV-YYYY-NNN
**Review type:**
**Created by:**
**Created date:**

### Content records in scope

| Record ID | Record type | Title | Current status | Prior reviews |
|---|---|---|---|---|
| | | | | |

### Criteria

- [ ] Publication Acceptance Criteria for [type]
- [ ] Source Review Checklist
- [ ] Legal Language Policy
- [ ] Accessibility and Performance Gate
- [ ] Static Beta Security Checklist
- [ ] Other:

### Version

**Commit or version to review:**
**Branch:**
```

### 1.3 Check separation of duties

Before assigning a reviewer, verify:

- [ ] The proposed reviewer is not the author of the content (self-review prohibition)
- [ ] The proposed reviewer did not add the sources being verified (for SRC reviews on `reviewed` records)
- [ ] The proposed reviewer will not be the only person reviewing content they contributed to
- [ ] If this review type was previously performed by someone else for this content, the new reviewer is a different person (for `reviewed` records)

Reference: [Reviewer Matrix](./reviewer-matrix.md) — Minimum distinct reviewers section.

### 1.4 Identify qualified reviewers

For each review type, identify reviewers who meet the qualification criteria
(see [Editorial Governance](./editorial-governance.md) and the [Reviewer Guide](./reviewer-guide.md)):

| Review type | Qualification check |
|---|---|
| SRC | Can verify URLs, publisher, dates; attention to detail |
| EDI | Strong writing and editing skills; familiarity with platform tone |
| LEG | Demonstrated knowledge of relevant area of law (IHL, ICL, IHRL, or national law) |
| COM | Domain expertise in the specific country, institution, or sector |
| SAF | Understanding of doxing risks, privacy, and vulnerable-population protection |
| TRN | Fluency in both source and target languages; subject-matter familiarity |
| ACC | Knowledge of WCAG 2.2 AA; experience with assistive technology |
| LIC | Understanding of copyright, licensing, and attribution |
| SEC | Security engineering or privacy expertise; familiarity with web security |

**During static beta:** If no qualified reviewer is available for a required
review type, the content remains `review_pending`. Do not mark it `reviewed`.

---

## Phase 2: Invite the reviewer

### 2.1 Send the invitation

Contact the reviewer privately. The invitation must include:

- **What this is:** A time-bound, scoped review for Arbor Sentinel
- **What this is not:** A partnership, employment, advisory role, or ongoing commitment
- **The review type** and what it involves
- **The scope:** which content records, which criteria
- **The deadline** for submitting feedback
- **The [Reviewer Guide](./reviewer-guide.md)** — ask them to read it before starting
- **The [Conflict of Interest Policy](./reviewer-conflict-of-interest.md)** — ask them to disclose any conflicts before starting
- **The [Reviewer Feedback Template](./reviewer-feedback-template.md)** — how they will submit findings
- **Visibility options:** public metadata only, full report public, or private
- **Credit options:** whether and how they wish to be credited
- **That they may decline** without giving a reason

### 2.2 Invitation template

```text
Subject: Review invitation — Arbor Sentinel — [Review type] — [Content description]

Hi [name],

I'm writing to invite you to conduct a [review type] review for Accountability
Atlas, an open-source civic-tech project for verified evidence, legal/humanitarian
tracking, and lawful citizen action.

This is not a partnership, employment, or ongoing commitment. It is a one-time,
scoped review of [number] content record(s).

**Review type:** [SRC / EDI / LEG / COM / SAF / TRN / ACC / LIC / SEC]
**Content:** [Brief description of what will be reviewed]
**Estimated time:** [X] hours
**Deadline:** [YYYY-MM-DD]

Before you decide, please read:

- Reviewer Guide: https://github.com/[repo]/blob/main/docs/reviewer-guide.md
- Conflict of Interest Policy: https://github.com/[repo]/blob/main/docs/reviewer-conflict-of-interest.md

If you're interested, I'll send the full scope, criteria, and feedback template.
You may decline without giving a reason — and you may withdraw at any time.

Thank you for considering this.

— [Your name]
  Maintainer, Arbor Sentinel
```

### 2.3 Confirm the assignment

If the reviewer accepts:

- [ ] Send the full scope, criteria, and [Reviewer Feedback Template](./reviewer-feedback-template.md)
- [ ] Confirm the reviewer has read the Reviewer Guide and COI Policy
- [ ] Ask the reviewer to disclose any conflicts before starting
- [ ] Record the assignment internally (reviewer name, role, contact method, assignment date)
- [ ] Assign a review ID (`REV-YYYY-NNN`)
- [ ] Record the deadline

If the reviewer declines:

- [ ] Thank them for considering
- [ ] Do not ask why unless they volunteer the reason
- [ ] Do not pressure them to reconsider
- [ ] Return to Phase 1.4 to identify another reviewer

---

## Phase 3: Grant access

### 3.1 Determine what access is needed

| Review type | Access needed |
|---|---|
| SRC, EDI, LEG, COM, SAF, TRN | Read access to the content records in scope (may be provided as a document, a link to the draft branch, or a preview deployment) |
| ACC | Access to a running instance of the page(s) to be reviewed (preview deployment URL) |
| SEC | Access to the repository for code review, or a preview deployment for runtime checks |

### 3.2 Grant access

- **Public content:** If the content is already published as `review_pending`,
  the reviewer can access it on the public site. No additional access is needed.
- **Draft content:** If the content is not yet public, provide access via:
  - A preview deployment URL (preferred)
  - A shared document containing the draft content
  - Read access to the draft branch (if the reviewer has a GitHub account)
- **Code review (SEC, ACC):** If the review requires inspecting code, grant
  read access to the relevant branch or provide a preview deployment.

### 3.3 Access principles

- Grant the **minimum access** needed for the review
- **Do not** grant write access to the repository unless the reviewer is also
  a contributor making code changes
- **Do not** share internal maintainer communications, private issue trackers,
  or other reviewers' unpublished findings
- **Do not** share access credentials — use the platform's access control
  mechanisms (GitHub permissions, preview deployment URLs)

### 3.4 Preview deployment

If a preview deployment is available, provide the reviewer with:

- The preview URL
- Instructions for accessing it (if authentication is required)
- The commit hash the preview was built from
- Any known differences between the preview and the content to be reviewed

---

## Phase 4: During the review

### 4.1 Be available

- Respond to reviewer questions promptly (target: within 1 business day)
- Clarify scope, criteria, or process questions as they arise
- If the reviewer identifies a safety or privacy concern, prioritise it

### 4.2 Handle conflict disclosures

If the reviewer discloses a conflict of interest:

- [ ] Review the disclosure against the [Conflict of Interest Policy](./reviewer-conflict-of-interest.md)
- [ ] Determine the outcome: no action / scope adjustment / additional reviewer / reassignment / round cancelled
- [ ] Document the determination internally
- [ ] If reassignment is needed, return to Phase 1.4

### 4.3 Handle scope changes

If the reviewer identifies issues outside the assigned scope:

- [ ] Note the out-of-scope finding
- [ ] Determine whether it warrants a separate review round
- [ ] If yes, create a new review round after the current one completes
- [ ] If no, note it for future consideration

Do not expand the scope mid-round without the reviewer's agreement.

### 4.4 Handle deadline adjustments

If the reviewer needs more time:

- [ ] Agree on a new deadline
- [ ] Update the internal assignment record
- [ ] If the delay affects other review rounds (e.g., editorial review waiting
  on legal review), adjust the schedule accordingly

---

## Phase 5: Receive and triage findings

### 5.1 Receive the feedback

The reviewer submits their findings using the [Reviewer Feedback Template](./reviewer-feedback-template.md).

- [ ] Confirm that the submission is complete (all required sections filled)
- [ ] Confirm the reviewer's visibility and credit preferences are recorded
- [ ] Thank the reviewer for their contribution

### 5.2 Triage issues

Classify every issue by severity and actionability:

| Severity | Action |
|---|---|
| **Critical** | Content is blocked. Fix before any further publication step. |
| **High** | Fix before marking `reviewed`. Content may remain `review_pending` with a noted caveat. |
| **Medium** | Schedule for the next review cycle. Do not block current publication. |
| **Low** | Optional. Apply at editor's discretion. |

### 5.3 Create issue tickets

For issues that cannot be resolved immediately:

- [ ] Create a GitHub issue for each finding that requires tracking
- [ ] Use the appropriate issue template (legal-review, source-review, etc.)
- [ ] Reference the review ID in the issue
- [ ] Assign to the appropriate person (editor, researcher, developer)
- [ ] Set priority label based on severity

### 5.4 Apply required changes

For each required change:

- [ ] Assign to a contributor (editor, researcher, or developer)
- [ ] Apply the change in a branch
- [ ] Verify the change against the reviewer's requirement
- [ ] If the change is substantive, request the reviewer to confirm it was applied correctly
- [ ] Update the content record's `version` number
- [ ] Record the change in `reviewNotes`

---

## Phase 6: Sign-off

### 6.1 Confirm all required reviews are complete

Before an editor may mark a content record as `reviewed`:

- [ ] All required review types for this content type are complete (per [Reviewer Matrix](./reviewer-matrix.md))
- [ ] At least the minimum number of distinct reviewers have contributed
- [ ] All critical and high issues are resolved
- [ ] All review evidence records are created and stored
- [ ] Separation-of-duties rules are satisfied

### 6.2 Editor sign-off

The editor:

- [ ] Confirms source verification is complete (by a different person)
- [ ] Confirms all required domain reviews (legal, competency, safety) are complete
- [ ] Confirms the record meets the [Publication Acceptance Criteria](./publication-acceptance-criteria.md) for its type
- [ ] Updates `reviewedByRole` with a summary of all reviewer roles
- [ ] Sets `lastReviewedAt` to the current date
- [ ] Changes `contentStatus` to `reviewed`

### 6.3 Publish

The maintainer:

- [ ] Confirms the editor's sign-off is valid
- [ ] Merges the content to the default branch
- [ ] Deploys the updated site
- [ ] Verifies the content appears correctly on the public site

---

## Phase 7: Credit and acknowledgement

### 7.1 Record credit preferences

For each reviewer in the round:

- [ ] Role credit: Record the `reviewerRole` text to appear in `reviewedByRole`
- [ ] Name credit: If the reviewer permitted their name to appear, record the
  exact name and the permission date
- [ ] Attribution listing: If the reviewer permitted listing on the
  [Attributions](./attributions.md) page, add them
- [ ] Do not publish any reviewer's name without explicit, written permission
- [ ] Do not list any reviewer as a partner, advisor, or endorser

### 7.2 What reviewers may say about their contribution

Reviewers may describe their contribution publicly:

> "I served as a [legal reviewer / source verifier / etc.] for Accountability
> Atlas content on [topic]."

They may **not**:

- Claim to speak for the platform
- Claim a relationship that does not exist (partnership, employment, advisory role)
- Disclose unpublished content, internal discussions, or other reviewers' findings
- Use the platform's name to endorse or oppose any position the platform has not taken

### 7.3 Do not claim partnership

- The `reviewedByRole` field records reviewer roles, not partnerships
- The [Attributions](./attributions.md) page lists contributors and reviewers
  — it does not list partners unless separately confirmed in writing
- No reviewer is described as a "partner," "verified partner," "supporter,"
  or "collaborator" based solely on having performed a review
- The [Partnership Policy](./partnership-policy.md) and
  [Relationship Status Policy](./relationship-status-policy.md) govern all
  relationship claims

---

## Phase 8: Close the review round

### 8.1 Confirm completion

- [ ] All reviewer feedback has been received
- [ ] All issues have been triaged
- [ ] All required changes have been applied or deferred with a tracking issue
- [ ] All review evidence records have been created
- [ ] Content metadata has been updated
- [ ] Credit preferences have been recorded and applied

### 8.2 Notify the reviewer

Send a closing message to the reviewer:

```text
Subject: Review round complete — REV-YYYY-NNN — Thank you

Hi [name],

Thank you for completing the [review type] review for Arbor Sentinel
(REV-YYYY-NNN).

**Outcome:** [Summary of what was found and what actions were taken]

**How your contribution is credited:**
- Your role ("[reviewerRole]") appears in the content metadata for [record IDs]
- Your name [is / is not] published, per your preference
- You [are / are not] listed on the Attributions page, per your preference

This review round is now closed. There is no expectation of further work from
you unless you choose to accept a future review invitation.

If you have any questions or would like your credit preferences changed, please
let me know.

Thank you again for your contribution.

— [Your name]
  Maintainer, Arbor Sentinel
```

### 8.3 Archive the round

- [ ] Store all review evidence records in the designated location
- [ ] Update internal records: round status = closed
- [ ] Record the closing date

---

## Phase 9: Reviewer offboarding

Offboarding is the process of ending a reviewer's active relationship with the
platform, whether initiated by the reviewer or the maintainer.

### 9.1 Reviewer-initiated offboarding

If a reviewer wishes to stop reviewing:

- [ ] Acknowledge their request promptly
- [ ] Confirm whether they want to complete any in-progress review rounds
- [ ] Reassign any in-progress rounds they do not wish to complete
- [ ] Remove any access granted for review purposes
- [ ] Confirm their credit preferences for completed reviews remain unchanged
  (unless they request changes)
- [ ] Thank them for their contribution
- [ ] Do not ask for a reason unless they volunteer one

### 9.2 Maintainer-initiated offboarding

If the maintainer needs to end a reviewer's involvement:

- [ ] Document the reason internally
- [ ] Notify the reviewer calmly and respectfully
- [ ] Reassign any in-progress review rounds
- [ ] Remove any access granted for review purposes
- [ ] Confirm whether their credit preferences for completed reviews remain
  unchanged (reviewers may request removal of their role annotation)
- [ ] Do not disclose the reason publicly

### 9.3 Access removal checklist

- [ ] GitHub repository access (if granted)
- [ ] Preview deployment access (if granted)
- [ ] Shared document access (if granted)
- [ ] Communication channel access (if granted)
- [ ] Any other access granted for review purposes

### 9.4 Post-offboarding

- Completed review evidence records remain valid — offboarding does not
  retroactively invalidate past reviews
- The reviewer's role annotation in `reviewedByRole` may be changed or
  removed at their request
- The reviewer's name (if published) may be removed at their request
- The reviewer may re-join as a reviewer in the future if both parties agree

---

## Quick-reference checklist

### For each review round

- [ ] **Prepare:** Scope defined, separation of duties checked, reviewer identified
- [ ] **Invite:** Invitation sent with scope, guide, COI policy, deadline
- [ ] **Confirm:** Reviewer accepted, conflicts disclosed, assignment recorded
- [ ] **Grant access:** Minimum access provided (preview URL, shared doc, or repo read)
- [ ] **Support:** Available for questions during the review period
- [ ] **Receive:** Feedback submitted via template, visibility/credit preferences recorded
- [ ] **Triage:** Issues classified by severity, tracking issues created
- [ ] **Apply:** Required changes applied, verified, and recorded
- [ ] **Sign off:** All required reviews complete, editor confirms, `contentStatus` updated
- [ ] **Credit:** `reviewedByRole` updated, attributions updated, no false partnership claims
- [ ] **Close:** Reviewer notified, round archived
- [ ] **Offboard (if applicable):** Access removed, preferences confirmed, contribution acknowledged

---

## Related documents

- [Reviewer Guide](./reviewer-guide.md) — how reviewers conduct reviews
- [Reviewer Feedback Template](./reviewer-feedback-template.md) — how reviewers submit findings
- [Reviewer Conflict of Interest Policy](./reviewer-conflict-of-interest.md)
- [Review Evidence Format](./review-evidence-format.md) — how reviews are recorded
- [Reviewer Matrix](./reviewer-matrix.md) — required reviews per content type
- [Content Review Workflow](./content-review-workflow.md) — content statuses and stages
- [Editorial Governance](./editorial-governance.md) — roles and decision paths
- [Publication Acceptance Criteria](./publication-acceptance-criteria.md) — gates per content type
- [Partnership Policy](./partnership-policy.md) — relationship claims and disclaimers
- [Attributions](./attributions.md) — contributor and reviewer credits
- [Correction Policy](./correction-policy.md) — how errors are handled
