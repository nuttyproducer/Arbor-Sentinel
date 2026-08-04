# Reviewer Conflict of Interest Policy

**Status:** Active — applies to all reviewers (internal and external).  
**Last reviewed:** 2026-07-24  
**Version:** 0.1.0

---

## Purpose

This policy defines what constitutes a conflict of interest for reviewers of
Arbor Sentinel content, how conflicts must be disclosed, and how they
are managed. It protects the credibility of published content and the integrity
of the review process.

---

## Why this matters

Arbor Sentinel publishes content about legal proceedings, government
positions, institutional actions, humanitarian situations, and alleged atrocity
crimes. Reviewers who have personal, professional, or financial connections to
the subject matter could — even unintentionally — introduce bias, or create the
appearance of bias, that undermines the platform's credibility.

This policy is not a statement of distrust. It is a safeguard that protects
both reviewers and the platform.

---

## What is a conflict of interest?

A conflict of interest exists when a reviewer has a personal, professional, or
financial interest that could — or could reasonably be perceived to — influence
their review.

### Personal conflicts

- The reviewer is a family member or close personal associate of a person named
  in the content
- The reviewer is personally affected by the events described in the content
- The reviewer has a strong personal advocacy position on the subject matter
  that would prevent an impartial review

### Professional conflicts

- The reviewer works for, is a board member of, or is formally affiliated with
  an organisation described or listed in the content
- The reviewer works for, represents, or advises a government or institution
  described in the content
- The reviewer is involved in a legal case described in the content (as a party,
  counsel, expert, or advisor)
- The reviewer's employer has a contractual, funding, or advocacy relationship
  with an entity described in the content
- The reviewer contributed to writing the content they are being asked to review
  (self-review — prohibited for all review types)

### Financial conflicts

- The reviewer has a direct financial interest in the outcome of a legal
  proceeding or policy decision described in the content
- The reviewer's employer or client has a significant financial interest in the
  subject matter
- The reviewer is paid by an entity with an interest in how the content portrays
  that entity

### Institutional conflicts

- The reviewer represents a country whose government positions are described or
  evaluated in the content
- The reviewer represents an institution whose competencies, actions, or
  decisions are described in the content
- The reviewer is employed by a government department or agency that is the
  subject of the content

---

## What is not a conflict of interest

The following are **not** conflicts of interest under this policy:

- Holding a general political or policy view about a topic the platform covers
  (e.g., believing that international humanitarian law should be enforced is
  not a conflict — it is the premise of the platform)
- Being a citizen of a country whose government is described in the content
  (a Belgian citizen may review Belgium content if they have no professional or
  institutional role that creates a conflict)
- Having professional expertise in the subject matter (this is why you were
  asked to review — it is a qualification, not a conflict)
- Having previously reviewed other content for the platform

---

## Disclosure requirement

### When to disclose

Disclose any potential conflict **before** starting a review. If a conflict
arises during a review (e.g., you realise the content describes an organisation
you consult for), disclose it immediately and pause the review until the
maintainer provides guidance.

### What to disclose

A disclosure should include:

- The nature of the conflict (personal, professional, financial, institutional)
- The entity, person, or issue involved
- The timeframe (current, past 2 years, past 5 years)
- Whether you believe the conflict is manageable (you can still review
  impartially) or disqualifying (you should not review this content)

### How to disclose

Disclose to the maintainer privately. Do not post conflict-of-interest
disclosures in public GitHub issues or pull requests. The maintainer records
the disclosure internally and determines the outcome.

### Disclosure template

```markdown
## Conflict of interest disclosure

**Review round:** [Review ID]
**Review type:** [SRC / EDI / LEG / COM / SAF / TRN / ACC / LIC / SEC]
**Content records:** [Record IDs]

**Nature of conflict:**
[Personal / Professional / Financial / Institutional]

**Description:**
[Brief description of the relationship or interest. Include timeframe.]

**Assessment:**
[I believe I can still review impartially / I believe I should not review this content]

**Submitted to maintainer on:** [YYYY-MM-DD]
```

---

## How conflicts are managed

The maintainer reviews each disclosure and determines one of the following:

### 1. No action required

The disclosed interest does not constitute a conflict under this policy.
The reviewer proceeds with the review.

### 2. Scope adjustment

The conflict affects only part of the assigned scope. The maintainer removes
the affected content records from the reviewer's scope. The reviewer proceeds
with the remaining records.

### 3. Additional reviewer

The conflict is manageable but warrants an additional independent reviewer
for the affected content. Both reviews must be complete before the content
may be marked `reviewed`.

### 4. Reassignment

The conflict is disqualifying. The maintainer reassigns the review to a
different reviewer. This is not a negative reflection on the reviewer — it
is a routine safeguard.

### 5. Review round cancelled

The conflict cannot be resolved within the current review round (e.g., no
alternative reviewer is available for a required review type). The review
round is postponed until a qualified reviewer without a conflict can be found.
The content remains `review_pending`.

---

## Specific prohibitions

A reviewer **must not**:

- Review content they wrote, edited, or substantially contributed to
  (self-review prohibition — applies to all review types)
- Be the only source verifier for content they wrote (separation of duties —
  see [Reviewer Matrix](./reviewer-matrix.md))
- Be the legal reviewer for content about a case or jurisdiction in which they
  have a personal or professional involvement
- Be the competency reviewer for a country they represent in an official
  capacity or an institution they work for
- Be the safety reviewer for content that describes events in which they were
  personally involved
- Review content about an organisation that currently employs them, funds their
  work, or with which they have a formal affiliation

---

## Past affiliations

A past affiliation (employment, board membership, advisory role) that ended
more than **2 years** before the review date is generally not considered a
conflict, unless:

- The content specifically covers events or decisions from the period of the
  affiliation
- The reviewer had a senior or decision-making role in the organisation
- The affiliation was with a government, political party, or institution
  directly described in the content

When in doubt, disclose. The maintainer will determine whether the past
affiliation creates a conflict for the specific content being reviewed.

---

## Reviewer obligations

By accepting a review assignment, the reviewer agrees to:

1. Disclose any actual or potential conflicts of interest before starting the review
2. Disclose any conflicts that arise during the review as soon as they become apparent
3. Not begin or continue a review if they have an undisclosed conflict
4. Accept the maintainer's determination about how the conflict is managed
5. Not use information gained through the review process for personal, professional,
   or financial benefit

---

## Maintainer obligations

The maintainer agrees to:

1. Ask every reviewer about potential conflicts before assigning a review round
2. Handle all disclosures confidentially — disclosure details are not published
   and are not committed to the public repository
3. Make a timely determination about how each disclosed conflict is managed
4. Document the determination (nature of conflict, management decision, date)
   in internal records only
5. Not penalise or disadvantage a reviewer for disclosing a conflict
6. Reassign reviews when necessary to maintain the integrity of the review process

---

## Transparency

The public content metadata does **not** include conflict-of-interest
disclosures. However:

- The existence of a review process is public
- The roles of reviewers are recorded in the `reviewedByRole` field
- The separation-of-duties rules in the [Reviewer Matrix](./reviewer-matrix.md)
  are public and verifiable
- If a review round is delayed or reassigned due to a conflict that cannot be
  resolved, the content remains `review_pending` with honest metadata about
  which reviews are complete

The public can see that review integrity is maintained without seeing the
private details of individual disclosures.

---

## Static-beta note

During the public static beta, when the reviewer pool is small, conflicts of
interest may be harder to avoid. In such cases:

- The maintainer documents the conflict and the management decision
- Content that cannot be reviewed by a conflict-free reviewer remains
  `review_pending` — it is not marked `reviewed`
- The `reviewedByRole` field uses honest placeholder language describing which
  reviews are complete and which could not be completed due to reviewer
  availability
- The maintainer prioritises recruiting reviewers without conflicts for
  content types that require separation of duties

---

## Related documents

- [Reviewer Guide](./reviewer-guide.md) — how to conduct reviews
- [Reviewer Matrix](./reviewer-matrix.md) — required reviews and separation of duties
- [Editorial Governance](./editorial-governance.md) — roles and responsibilities
- [Review Round Runbook](./review-round-runbook.md) — maintainer procedures
- [Partnership Policy](./partnership-policy.md) — relationship claims
- [Relationship Status Policy](./relationship-status-policy.md) — organisation statuses
