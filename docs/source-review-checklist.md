# Source Review Checklist

**Use when:** Adding or reviewing a source in `src/data/sources.ts` or
reviewing a record that references sources.

**Last reviewed:** 2026-07-12

---

## Before adding a source

- [ ] **Is the source public?** Do not add sources that require login,
  payment, or special access unless the access method is documented.
- [ ] **Is the source stable?** Prefer URLs that are likely to remain
  accessible (official institutional websites, court registers, UN document
  repositories). If the source may disappear, add an `archiveUrl`.
- [ ] **Is the source appropriate for the claim?** A court record is
  authoritative for what a court ordered — not for every factual claim
  recited in a party's submission. Match source type to the type of claim.
- [ ] **Is the publisher documented?** Every source must have a publisher
  field identifying the institution or organisation that published it.
- [ ] **Is the publication date recorded?** If the exact date is unknown, use
  the year. Do not invent dates.
- [ ] **Is the access date recorded?** The date you accessed the source.
- [ ] **Is the language recorded?** Use ISO 639-1 codes (`en`, `ar`, `he`,
  `fr`, `nl`).
- [ ] **Does the URL resolve?** Open the URL in a browser. Redirect chains
  should resolve to the correct page.

## Source type assignment

| Source type | Use when | Not for |
|---|---|---|
| `court` | Official court filings, orders, judgments, transcripts | News reports about court proceedings |
| `un` | UN Security Council resolutions, General Assembly votes, HRC reports, OCHA updates | NGO summaries of UN documents |
| `government` | Official government statements, parliamentary records, policy documents | Party-political statements |
| `humanitarian` | ICRC, IFRC, national Red Cross/Crescent, UN OCHA, major operational humanitarian orgs | Advocacy statements by non-operational groups |
| `ngo` | Established human-rights organisations with published methodology | Organisations without published methodology |
| `academic` | Peer-reviewed research, university-published reports | Student papers, preprints, opinion pieces |
| `journalism` | Investigative journalism from outlets with editorial standards | Opinion columns, unverified social-media reporting |
| `osint` | Open-source intelligence/documentation groups with published methodology | Anonymous social-media accounts |

## Source quality (verification level)

| Level | Label | Criteria |
|---|---|---|
| 0 | Unreviewed lead | Not yet checked — do not reference publicly |
| 1 | Preserved lead | Saved for review — do not reference publicly |
| 2 | Source checked | Verified against at least one public source |
| 3 | Corroborated | Confirmed by multiple independent sources |
| 4 | Trusted org verified | Verified by an established organisation |
| 5 | Legal/institutional record | Official court, UN, or formal institutional record |

## Common mistakes

- **Don't confuse the publisher with the platform.** If an NGO report is
  hosted on ReliefWeb, the publisher is the NGO, not ReliefWeb.
- **Don't use a news article when the primary source is available.** If a
  court order is publicly available on the court's website, link to the court
  website — not a news article about the order.
- **Don't cite this platform as the source.** Every source record should
  point to the original publisher. Accountability Atlas is a finding aid.
- **Don't assume a source verifies every claim within it.** An official
  government statement proves what the government said. It does not
  independently verify the factual claims the government made.

## After adding a source

- [ ] Run `npx vitest run src/data/__tests__/validation.test.ts` — confirms
  no duplicate IDs, valid URLs, and referenced source IDs resolve.
- [ ] If the source supports a reviewed record, ensure the record's metadata
  is updated: `sourceIds` includes the new source ID, `lastReviewedAt` is
  current, `version` is incremented if the record changed.
