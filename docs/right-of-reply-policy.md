# Right of Reply Policy

**Status:** Active — governs how the platform handles institutional responses.  
**Last reviewed:** 2026-07-12

---

## Purpose

Institutions, organisations, and government bodies referenced on
Accountability Atlas have a right to respond when they believe they have
been misrepresented, inaccurately summarised, or quoted out of context. This
policy defines how the platform handles such responses.

---

## Scope

This policy applies to:

- Government bodies and public institutions
- International organisations (UN, ICC, ICJ, etc.)
- Humanitarian and human-rights organisations
- Organisations listed in the public resource directory
- Any entity whose actions, positions, or statements are described on the
  platform

This policy does not apply to:

- Private individuals (the platform does not publish private individual
  information)
- Organisations that have not been mentioned on the platform
- General complaints about the platform's existence or mission

---

## How to submit a reply

Institutions may submit a reply through:

1. The platform's [corrections process](/corrections)
2. GitHub Issues on the public repository
3. Direct contact with the maintainer (once a contact route is configured)

A reply should include:

- The specific page, record, or statement at issue
- A clear description of what is inaccurate or misleading
- The institution's corrected position or preferred characterisation
- Supporting documentation where available
- Contact information for follow-up

---

## How replies are handled

### Upon receipt

1. The reply is acknowledged within **5 business days** (static-beta
   timeframe; may be longer during early development).
2. The relevant record's `contentStatus` is changed to `disputed` while the
   reply is under review.
3. A `reviewNotes` entry records the date and nature of the reply.

### Review

1. The original source material is re-checked against the institution's
   reply.
2. The editor consults with the relevant domain reviewer (legal, competency,
   etc.) as needed.
3. The platform determines whether:
   - The original summary was accurate → reply is noted but no change is
     made. The institution's position may be added as additional context.
   - The original summary was inaccurate → the record is corrected.
   - The original summary was incomplete → the record is updated with the
     institution's additional context.
   - The dispute is about interpretation, not fact → both positions are
     presented, clearly attributed.

### Resolution

1. If the record is corrected, `contentStatus` changes to `corrected`,
   `version` is incremented, and `lastReviewedAt` is updated.
2. If the record is unchanged but the institution's position is added,
   `contentStatus` returns to its previous state (typically `reviewed`) and
   the institution's response is included as additional context.
3. If the dispute cannot be resolved, the record remains `disputed` with a
   note presenting both positions.

---

## What a reply may result in

| Outcome | When |
|---|---|
| **Correction applied** | The platform's summary was factually wrong |
| **Context added** | The platform's summary was accurate but incomplete; the institution's position is added alongside |
| **Both positions presented** | The dispute is about interpretation, not verifiable fact |
| **No change** | The platform's summary is accurate and the institution's objection is not based on factual error |
| **Record removed** | The institution demonstrates that the listing causes harm (safety, legal risk, misrepresentation) and removal is the appropriate response |
| **Response published** | The institution provides a formal statement for publication alongside the original record |

---

## What a reply does not create

- A reply does **not** create a partnership, endorsement, or formal
  relationship with the institution.
- A reply does **not** give the institution editorial control over the
  platform.
- A reply does **not** obligate the platform to adopt the institution's
  preferred characterisation if the original summary is factually accurate.
- A reply does **not** prevent the platform from continuing to reference
  public information about the institution.

---

## Transparency

When a reply results in a material change to a published record:

1. The record's `reviewNotes` is updated with a summary of the change.
2. If the change is significant, a public correction note is added to the
   affected page.
3. The change history is preserved in version control.

When a reply does not result in a change:

1. The reply is logged internally for reference.
2. The record's `reviewNotes` may note that a reply was received and
   reviewed.

---

## Urgent replies

If an institution asserts that a published record:

- Exposes people to safety risk
- Contains private or protected information
- Materially misrepresents a legal finding or court order
- Implies a false partnership or endorsement

The maintainer may immediately:

1. Change `contentStatus` to `disputed`
2. Remove the concerning content from public display
3. Initiate review without waiting for the normal cycle
4. Document the action

---

## Distinction from corrections

A right-of-reply is **not** the same as a general correction:

| | Correction | Right of reply |
|---|---|---|
| **Who submits** | Anyone | The institution being described |
| **What it addresses** | Factual errors, broken links, outdated info | The institution's own characterisation or position |
| **Outcome** | Fix the error | Correct, add context, or present both positions |
| **Visibility** | Correction note on the record | May include the institution's own statement |

---

## Static-beta limitations

During the public static beta:

- Response times may be longer than the 5-business-day target.
- The platform is maintained by a small volunteer team.
- The preferred contact method is GitHub Issues.
- A dedicated institutional-contact email is not yet configured.
