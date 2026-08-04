# Review Queue Escalation Runbook

**Status:** Active
**Last reviewed:** 2026-08-03
**Audience:** Review coordinators and platform operators

---

## Purpose

Escalation procedures for review queue issues: SLA breaches, reviewer
unavailability, content disputes, legal wording concerns, and expertise gaps.

---

## SLA Breach Notification

### SLA definitions

| Content Type | SLA | Escalation Trigger |
|---|---|---|
| Urgent (active conflict, casualties) | 4 hours | 3 hours elapsed, no reviewer assigned |
| High (legal finding, court ruling) | 24 hours | 18 hours elapsed, no reviewer assigned |
| Standard (NGO report, news) | 72 hours | 60 hours elapsed, no reviewer assigned |
| Low (background, methodology) | 7 days | 6 days elapsed, no reviewer assigned |

### When an SLA breaches

1. **Automated alert** fires to the review coordinator dashboard
2. Check why no reviewer was assigned:
   - No available reviewers with required expertise
   - Reviewer assigned but didn't accept
   - Content flagged for specialist review and pending
3. **Escalate to backup reviewer pool** if primary pool exhausted
4. For urgent items approaching SLA: the on-call reviewer must handle or delegate
5. Document the breach and reason

**Do NOT:**
- Auto-approve content to clear the queue — every item needs human review
- Skip review steps to meet SLA — accuracy > speed

---

## Reviewer Unavailability Handling

### Planned unavailability (vacation, leave)

1. Reviewer updates their availability in the reviewer matrix
2. Coordinator reassigns their in-progress items
3. Temporary load balancing across remaining reviewers

### Unplanned unavailability (illness, emergency)

1. After 24h of no response to a review assignment:
   - System auto-reassigns to next available reviewer
   - Coordinator is notified
2. Items in "in review" status >2x the SLA are escalated
3. Coordinator manually reassigns if needed

### Reviewer shortage

If the reviewer pool drops below minimum coverage:

1. Coordinator notifies volunteer coordinator (`docs/volunteer-onboarding.md`)
2. Existing reviewers may need to take extra items temporarily
3. SLA targets may need adjustment — communicate to stakeholders
4. Content priority: urgent/high items continue, standard/low may be delayed

---

## Content Dispute Escalation

### When a dispute arises

A content dispute occurs when:
- Two reviewers disagree on a finding
- A source organization disputes the interpretation of their content
- A subject of a report disputes factual claims

### Escalation path

1. **Level 1 — Reviewer discussion:** Assigned reviewers discuss and attempt resolution
2. **Level 2 — Coordinator review:** If reviewers cannot agree, coordinator reviews
3. **Level 3 — Subject matter expert:** For complex legal/factual disputes, engage SME
4. **Level 4 — Editorial board:** For policy-level disputes affecting multiple records

### Dispute resolution timeline

| Level | Target Resolution | Max |
|---|---|---|
| Level 1 | 24 hours | 48 hours |
| Level 2 | 48 hours | 72 hours |
| Level 3 | 7 days | 14 days |
| Level 4 | 14 days | 30 days |

Content marked as `disputed` is published with a visible dispute notice while
resolution is pending.

---

## Legal Wording Escalation

### When legal review is required

Trigger legal wording review when content contains:
- Characterization of actions as "war crimes", "genocide", "crimes against humanity"
- Attribution of legal responsibility to specific individuals or entities
- Reference to ongoing legal proceedings
- Description of evidence as "proves", "conclusively shows", "confirms"

### Escalation procedure

1. Flag the content for legal wording review in the review queue
2. Assign to a reviewer with legal expertise (see `docs/reviewer-matrix.md`)
3. Legal reviewer checks against `docs/legal-language-guide.md` and `docs/legal-language-policy.md`
4. If language is non-compliant: revise and re-submit for review
5. If legal implications are unclear: escalate to legal advisor
6. Document the legal review decision in the review packet

**Do NOT:**
- Publish without legal wording review if content makes legal characterizations
- Allow non-lawyers to make final decisions on legal wording
- Skip legal review to meet publishing timelines

---

## Expertise Gap Procedure

### When an expertise gap is identified

An expertise gap exists when content requires specialized knowledge not available
in the current reviewer pool (e.g., specific regional expertise, technical legal
knowledge, language-specific review).

### Procedure

1. Flag the item with the required expertise tag
2. Coordinator checks the reviewer matrix for matching expertise
3. If no match: pause the review, mark as `awaiting_expertise`
4. Coordinator reaches out to volunteer network or partner organizations
5. External reviewer is onboarded following `docs/volunteer-onboarding.md`
6. Review proceeds once expertise is available

### While waiting

- Content is not published (remains in `review_pending` status)
- SLA clock is paused (document when expertise gap was identified)
- If the gap persists >30 days: escalate to editorial board for decision

---

## Escalation Contacts

All contacts are **role-based** (not personal). Current role holders are in the
operations manual (not published in this document for privacy).

| Role | Escalation Path | When to Contact |
|---|---|---|
| Review Coordinator | Primary | Queue management, assignments, SLA breaches |
| Legal Advisor | Secondary | Legal wording disputes, liability concerns |
| Editorial Board | Tertiary | Policy disputes, systemic issues |
| Data Safety Officer | Immediate (urgent) | Map coordinate exposure, PII leaks |

---

## Related Documents

- `docs/review-queue-overview.md` — review workflow and state machine
- `docs/reviewer-matrix.md` — reviewer expertise and availability
- `docs/reviewer-guide.md` — reviewer instructions
- `docs/legal-language-guide.md` — legal wording standards
- `docs/legal-language-policy.md` — legal content policy
- `docs/volunteer-onboarding.md` — adding new reviewers
