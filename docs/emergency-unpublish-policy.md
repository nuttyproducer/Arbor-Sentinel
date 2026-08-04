# Emergency Unpublish Policy

**Status:** Active — defines when and how content is urgently removed.  
**Last reviewed:** 2026-07-12

---

## Purpose

Most content changes follow the normal correction and review workflow. This
policy defines the exceptional circumstances in which content must be
removed from public view immediately — before the normal review cycle
completes.

---

## When emergency unpublish may be used

Emergency unpublish is justified only when a published record:

### Safety

- Exposes private personal information (doxing)
- Reveals exact dangerous locations that could put people at risk
- Identifies vulnerable people (children, detainees, medical patients,
  witnesses) who are not public figures
- Contains material that could directly enable harassment, violence, or
  targeting of individuals or communities

### Legal

- Materially misstates a court order, warrant, or judgment in a way that
  could cause legal harm
- Implies a false legal determination (e.g., describing provisional measures
  as a final genocide judgment)
- Violates a court-ordered takedown in a jurisdiction where the platform
  operates

### Attribution / licensing

- Contains an image or asset whose licence has been revoked or challenged by
  the rights holder
- Contains content that the creator has requested be removed, where the
  request appears legitimate and removal does not suppress public-interest
  documentation

### False relationship

- Incorrectly claims or implies partnership, endorsement, or affiliation
  with an organisation that has not consented
- Lists an organisation that has explicitly requested removal

---

## What emergency unpublish is not for

Emergency unpublish must **not** be used for:

- Disagreement about editorial framing where no safety or legal risk exists
- Political pressure to remove accurate, sourced content
- General complaints about the platform's subject matter
- Typographical errors or minor inaccuracies (use normal corrections)
- Content that is merely controversial or attracts criticism

---

## Procedure

### Step 1: Identify and contain

1. Any contributor, reviewer, or external party may flag content for
   emergency unpublish review.
2. The **maintainer** (or safety reviewer, if delegated) assesses whether
   the circumstances meet the criteria above.
3. If the criteria are met, the maintainer immediately:
   - Changes the record's `contentStatus` to `disputed`
   - Removes the concerning content from the public page (while preserving
     the record in version history for review)
   - If the platform is a static site, this means reverting or editing the
     relevant data and redeploying

### Step 2: Document

Within 24 hours, the maintainer documents:

- What content was removed
- Why (which criterion applied)
- Who flagged it
- Date and time of removal
- What review is needed before republication

This documentation is recorded in the record's `reviewNotes` and in the
commit message. It must not republish the concerning content.

### Step 3: Review

The removed content is reviewed by at least two reviewers (including the
relevant domain reviewer — legal, safety, competency) to determine:

- Was the removal justified?
- Can the content be corrected and republished?
- Should the content remain unpublished?
- Is a public correction or retraction note needed?

### Step 4: Resolve

| Outcome | Action |
|---|---|
| Content was safe — removal was precautionary | Correct if needed, republish, update `contentStatus` |
| Content was unsafe — corrected version is safe | Publish corrected version, note the correction |
| Content was unsafe — cannot be safely corrected | Mark `archived`, publish retraction note if material |
| Removal was not justified under this policy | Restore original content, document the decision |

---

## Safety reviewer veto

A **safety reviewer's** determination that content poses a safety risk may
only be overridden by the maintainer after:

1. Documented consultation with at least one other reviewer
2. A written rationale explaining why the safety concern is not substantiated
3. The override decision being logged and available for future review

This is a high bar — safety reviewer blocks should rarely be overridden.

---

## Transparency after emergency unpublish

If content was publicly visible and is later removed:

- For **safety-based removals:** A brief note is published stating that
  content was removed for safety reasons. The removed content is not
  described in detail that could reproduce the harm.
- For **legal-based removals:** A note is published describing the legal
  basis for removal, consistent with any court order.
- For **attribution-based removals:** The attribution page is updated to
  reflect the change in status.
- For **false-relationship removals:** The organisation listing page is
  updated; no detailed public note is required beyond the correction.

---

## Static-beta limitations

During the public static beta:

- The platform is a static site with no backend. "Unpublishing" means
  editing or removing the relevant data file and redeploying.
- There is no automated takedown system. All removals require a commit and
  redeploy.
- The maintainer is the sole person with deployment access. If the
  maintainer is unavailable, emergency unpublish may be delayed.
- A future backend would support instant unpublish via a content-management
  interface.
