# Relationship Status Policy

**Status:** Active — governs how the platform describes its relationship
with listed organisations, institutions, and individuals.  
**Last reviewed:** 2026-07-12

---

## Purpose

Accountability Atlas references many organisations, institutions, and
individuals. It is essential that the nature of each relationship is
accurately described and that no false implication of partnership,
endorsement, or affiliation is created.

---

## Relationship statuses

### `public_resource` — Public resource (current static-beta default)

**Definition:** The organisation's publicly available work — its published
reports, data, statements, and services — is relevant to the accountability
contexts the platform covers. The organisation has been listed based on
publicly available information.

**Required disclaimer:**
> Listing does not imply partnership, endorsement, approval, or
> affiliation. This organisation has not requested inclusion and may not
> be aware of it.

**Requirements for this status:**
- [ ] Organisation has a public website with verifiable information
- [ ] The listing is based on that public information
- [ ] No claim of relationship is made
- [ ] The disclaimer is displayed

**May be upgraded to a stronger status only with:**
- Written confirmation from an authorised representative of the organisation

---

### `reviewed_listing` — Reviewed listing

**Definition:** The organisation has reviewed its directory entry for
accuracy but has not entered into any formal relationship with the
platform.

**Required disclaimer:**
> This organisation reviewed its directory entry for accuracy. This does
> not imply partnership or endorsement.

**Requirements for this status:**
- [ ] All `public_resource` requirements are met
- [ ] An authorised representative of the organisation has confirmed in
  writing that the listing is accurate
- [ ] The confirmation is documented (email from official domain, signed
  letter, or equivalent)
- [ ] The date of confirmation is recorded

**Not yet used in static beta.** No organisation has been asked to review
its listing.

---

### `confirmed_relationship` — Confirmed relationship

**Definition:** The organisation has entered into a defined, documented
relationship with the platform (research collaboration, methodology review,
content partnership, advisory role, etc.). The scope, terms, and
limitations of the relationship are published.

**Required disclaimer:**
> [Organisation] and Accountability Atlas have a defined relationship for
> [scope]. This relationship is limited to [specific activities]. It does
> not imply endorsement of all platform content or of all positions of
> either party.

**Requirements for this status:**
- [ ] Written agreement between authorised representatives of both parties
- [ ] The scope, terms, and limitations of the relationship are documented
  and published
- [ ] The agreement is reviewed for conflicts of interest
- [ ] Both parties have the right to terminate the relationship with notice
- [ ] The relationship does not grant the organisation editorial control
  over the platform

**Not yet used in static beta.** No formal relationships have been
established.

---

### `advisor` — Advisor

**Definition:** A named individual has agreed to serve as an advisor to the
project in a defined capacity.

**Requirements for this status:**
- [ ] Written confirmation from the individual
- [ ] The scope of the advisory role is documented
- [ ] The individual's name and role are published only with their explicit
  consent
- [ ] The individual may request removal at any time

**Not yet used in static beta.**

---

### `anonymous_advisor` — Anonymous advisor

**Definition:** An individual advises the project but does not wish to be
publicly named.

**Requirements for this status:**
- [ ] Written confirmation from the individual
- [ ] The individual's identity is stored securely, not in the public
  repository
- [ ] The advisory role is acknowledged publicly without naming the
  individual
- [ ] The individual may request removal at any time

**Not yet used in static beta.**

---

## Prohibited relationship claims

The following must **never** be stated or implied without written
confirmation:

- "Partner" / "Verified partner" / "Official partner"
- "Supported by" / "Endorsed by" / "Approved by"
- "In collaboration with" / "Working with"
- "Advised by" (unless the individual has explicitly consented)
- "[Organisation] supports our work"
- "We are affiliated with [organisation]"
- Any language that could reasonably be read as claiming a relationship
  that does not exist

---

## Organization safety and removal

### Safety concerns

Some organisations face political, legal, or operational risks. The
platform must respect requests to:

- Avoid public listing entirely
- Use specific wording
- Remove contact details
- Avoid showing logos
- Avoid implying any relationship

### Removal requests

If an organisation asks to be removed from the directory:

- The request is processed promptly (target: within 5 business days during
  static beta).
- No justification is required from the organisation.
- The listing is removed or changed to `removed` status.
- If the organisation's work remains publicly relevant, the platform may
  continue to reference it in evidence records (as a source) but not as a
  directory listing.

### Disputes

If an organisation disputes its categorisation, description, or any other
aspect of its listing:

- The listing is marked `disputed` during review.
- The organisation's preferred description is considered.
- The platform is not obligated to adopt the organisation's preferred
  wording if the original description is factually accurate and based on
  the organisation's own public materials.

---

## Outreach ethics

When contacting organisations about their listing or about potential
relationships:

- Do not pressure organisations to support the project.
- Do not use crisis language to create urgency.
- Do not imply that silence equals approval.
- Do not contact organisations repeatedly without response.
- Respect a "no" or a non-response as a decision.

---

## Static-beta state

During the public static beta (2026-07-12):

- **All 13 listed organisations have `relationshipStatus: "public_resource"`.**
- No organisation has been contacted about its listing.
- No organisation has requested review, correction, or removal.
- No formal relationships exist with any listed organisation.
- The `confirmed_relationship`, `advisor`, and `anonymous_advisor` statuses
  are defined for future use but are not currently active.
- The `reviewed_listing` status is defined but has not been used — no
  organisation has been asked to review its entry.
