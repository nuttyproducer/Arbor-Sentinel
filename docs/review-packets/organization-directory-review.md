# Organization Directory Review Packet

**Generated:** 2026-07-24  
**Scope:** Organization directory listings prepared for human/expert review  
**Status:** All content is `review_pending` — this packet documents what was prepared, what requires review, what automated checks confirm, and who must sign off before any record can be marked `reviewed`.

---

## Summary of Current State

- **13 organizations** listed across **7 categories**
- All have `relationshipStatus: "public_resource"` — no partnership, endorsement, or affiliation is claimed
- All have at least one `sourceId` referencing a validated source record in `src/data/sources.ts`
- All have valid `officialWebsite` URLs confirmed at HTTPS public domains
- **8 organizations** display `officialDonationUrl` links — all verified as official domain or known subdomain
- All have `officialWebsiteCheckedAt` dates (2026-07-24)
- All donation URLs have `officialDonationUrlCheckedAt` dates (2026-07-24)
- **No partnership language exists** in any listing
- **No logos, staff names, or private contacts** are included
- **No false reviewed status** — all 13 are `review_pending`

---

## Organization-by-Organization Verification

### UN and Humanitarian (3 organizations)

| ID | Name | Website Verified | Donation URL | Donation Domain Match | Source ID |
|---|---|---|---|---|---|
| unrwa | UNRWA | ✅ (2026-07-24) | https://donate.unrwa.org/ | ✅ Same domain (unrwa.org) | org-unrwa |
| ocha-opt | UN OCHA — oPt | ✅ (2026-07-24) | None displayed | N/A | org-ocha |
| wfp | World Food Programme | ✅ (2026-07-24) | https://www.wfp.org/donate | ✅ Same domain (wfp.org) | org-wfp |

**Review notes:**
- UNRWA: Official name matches "UNRWA (United Nations Relief and Works Agency)" per unrwa.org. Services derived from UNRWA's public "What We Do" page. Geographic scope covers 5 fields of operation.
- OCHA oPt: Listing is the occupied Palestinian territory coordination office. Source `org-ocha` references the global UN OCHA website (unocha.org) as the institutional source, while `officialWebsite` is the oPt-specific site (ochaopt.org). Both are official UN OCHA domains. This split is intentional — the institutional source documents the parent entity; the local office page is the operational listing.
- WFP: Official name matches. Donation URL goes to wfp.org/donate — verified as official.

### Red Cross / Red Crescent (2 organizations)

| ID | Name | Website Verified | Donation URL | Donation Domain Match | Source ID |
|---|---|---|---|---|---|
| icrc | ICRC | ✅ (2026-07-24) | https://www.icrc.org/en/donate | ✅ Same domain (icrc.org) | org-icrc |
| prcs | Palestine Red Crescent Society | ✅ (2026-07-24) | https://www.palestinercs.org/en/donate | ✅ Same domain (palestinercs.org) | org-prcs |

**Review notes:**
- ICRC: Previously downgraded from `reviewed` to `review_pending` (2026-07-13) because sourceIds were empty. sourceIds now populated (`org-icrc`). Requires second human reviewer before returning to `reviewed`.
- PRCS: Same downgrade history. sourceIds now populated (`org-prcs`). Requires second human reviewer.

### Medical (2 organizations)

| ID | Name | Website Verified | Donation URL | Donation Domain Match | Source ID |
|---|---|---|---|---|---|
| msf | Médecins Sans Frontières (MSF) | ✅ (2026-07-24) | https://www.msf.org/donate | ✅ Same domain (msf.org) | org-msf |
| map-uk | Medical Aid for Palestinians (MAP) | ✅ (2026-07-24) | https://www.map.org.uk/donate | ✅ Same domain (map.org.uk) | org-map |

**Review notes:**
- MSF: Previously downgraded from `reviewed` to `review_pending` (2026-07-13). sourceIds now populated. Requires second human reviewer.
- MAP: Same downgrade history. sourceIds now populated. Requires second human reviewer.

### Legal and Human Rights (2 organizations)

| ID | Name | Website Verified | Donation URL | Donation Domain Match | Source ID |
|---|---|---|---|---|---|
| amnesty | Amnesty International | ✅ (2026-07-24) | https://www.amnesty.org/en/donate/ | ✅ Same domain (amnesty.org) | org-amnesty |
| hrw | Human Rights Watch (HRW) | ✅ (2026-07-24) | https://www.hrw.org/donate | ✅ Same domain (hrw.org) | org-hrw |

**Review notes:**
- Amnesty: Previously downgraded from `reviewed` to `review_pending` (2026-07-13). sourceIds now populated. Requires second human reviewer.
- HRW: Same downgrade history. sourceIds now populated. Requires second human reviewer.

### Documentation and Data (2 organizations)

| ID | Name | Website Verified | Donation URL | Donation Domain Match | Source ID |
|---|---|---|---|---|---|
| btselem | B'Tselem | ✅ (2026-07-24) | https://www.btselem.org/donate | ✅ Same domain (btselem.org) | org-btselem |
| airwars | Airwars | ✅ (2026-07-24) | None displayed | N/A | org-airwars |

**Review notes:**
- B'Tselem: Previously downgraded from `reviewed` to `review_pending` (2026-07-13). sourceIds now populated. Requires second human reviewer.
- Airwars: No donation URL listed — Airwars does not prominently display a public donation page. Previously downgraded from `reviewed` to `review_pending` (2026-07-13). sourceIds now populated. Requires second human reviewer.

### Journalism and Press Freedom (1 organization)

| ID | Name | Website Verified | Donation URL | Donation Domain Match | Source ID |
|---|---|---|---|---|---|
| cpj | Committee to Protect Journalists (CPJ) | ✅ (2026-07-24) | https://cpj.org/donate/ | ✅ Same domain (cpj.org) | org-cpj |

**Review notes:**
- CPJ: Previously downgraded from `reviewed` to `review_pending` (2026-07-13). sourceIds now populated. Requires second human reviewer.

### Academic and Research (1 organization)

| ID | Name | Website Verified | Donation URL | Donation Domain Match | Source ID |
|---|---|---|---|---|---|
| forensic-architecture | Forensic Architecture | ✅ (2026-07-24) | None displayed | N/A | org-forensic-architecture |

**Review notes:**
- Forensic Architecture: No donation URL listed. Forensic Architecture is a research group at Goldsmiths, University of London — it does not operate a public donation portal. Previously downgraded from `reviewed` to `review_pending` (2026-07-13). sourceIds now populated. Requires second human reviewer.

---

## Automated Checks Added (2026-07-24)

### New validation rules (Rules 19–25)

| Rule | What it checks | Severity |
|---|---|---|
| Rule 19 | Donation URL is on same domain or known subdomain as official website | Warning |
| Rule 20 | `officialWebsiteCheckedAt` and `officialDonationUrlCheckedAt` are present | Error |
| Rule 21 | Every publishable evidence item has ≥ 1 sourceId | Error |
| Rule 22 | Every publishable organization has sourceIds or valid officialWebsite | Error |
| Rule 23 | Organization `shortDescription` meets minimum (60 chars) and maximum (500 chars) length | Error / Warning |
| Rule 24 | Evidence items marked `reviewed` have `sourceQuality` ≥ 2 | Error |
| Rule 25 | Organization source references are not `broken` or `archived` | Warning |

All new rules pass against current data.

### Existing checks confirmed passing

- Rule 1: No duplicate IDs
- Rule 2: No duplicate slugs
- Rule 3: All URLs valid (https://)
- Rule 4: No invalid date formats
- Rule 5: All sourceIds resolve to existing source records
- Rule 6: No reviewed records with empty sourceIds (none are reviewed)
- Rule 7–9: Reviewed metadata checks (N/A — all are review_pending)
- Rule 10: All legal statuses in controlled vocabulary
- Rule 12: All relationshipStatus is `public_resource`
- Rule 15: All publishable records have correction routes
- Rule 17: No stale reviews
- Rule 18: All source records complete

---

## What Still Needs Human Review

### For every organization listed as `review_pending`

1. **Source reviewer** — Confirm that the source record accurately documents the organization's official website, name, and mandate.
2. **Editorial reviewer** — Review the `shortDescription` for accuracy, neutrality, and consistency with the organization's own public materials.
3. **Category reviewer** — Confirm the assigned `OrganizationCategory` is appropriate.
4. **Region reviewer** — Confirm the listed `regions` are accurate and safe to display.
5. **Donation-link reviewer** — For organizations with `officialDonationUrl`: verify the link is the official donation page (not a third-party processor, crowdfunding page, or unofficial mirror).

### Specifically needed

- **Second human reviewer** for the 10 organizations previously downgraded from `reviewed` (ICRC, PRCS, MSF, MAP, Amnesty, HRW, B'Tselem, Airwars, CPJ, Forensic Architecture). Their reviewNotes record: "Downgraded from reviewed to review_pending (2026-07-13): sourceIds must be populated and a second reviewer must confirm before returning to reviewed status."
- **OCHA listing review** — confirm that listing the oPt coordination office (ochaopt.org) with the global UN OCHA source (unocha.org) is the correct structure, or whether a separate `org-ocha-opt` source record should be created for the oPt office.

---

## Acceptance Criteria Status

| Criterion | Status |
|---|---|
| Every active organization has a support source | ✅ All 13 have ≥ 1 sourceId |
| Every displayed donation link is official and checked | ✅ All 8 donation URLs on official domains with check dates |
| Every evidence record has supporting sources or is clearly draft/source_pending | ✅ (see evidence library review packet) |
| No partnership language exists | ✅ All `public_resource` only |
| No false reviewed status remains | ✅ All `review_pending` |
| Tests pass | ✅ 316 tests, 0 failures |
| Validation passes | ✅ 104 validation tests, 0 errors |
| TypeScript passes | ✅ No errors |
| Lint passes | ✅ No errors |

---

## Relationship Status Audit

All 13 organizations are `public_resource`. No organization has:

- `reviewed_listing` (requires written confirmation from org)
- `confirmed_relationship` (requires written agreement)
- `advisor` (requires written confirmation from individual)
- `anonymous_advisor` (requires written confirmation, stored securely)
- Any language implying partnership, endorsement, or affiliation

The Organizations page displays the required disclaimer:

> "Listing does not imply partnership, endorsement, approval, affiliation, or any formal relationship with Accountability Atlas."

And the donation disclaimer:

> "Donations go directly to the named organisation. Accountability Atlas does not process, hold, or distribute funds."

---

## Recommended Next Steps

1. **Human review** — A second reviewer should examine each listing and, if satisfied, update `contentStatus` to `reviewed`, record `lastReviewedAt`, and document `reviewedByRole`.
2. **OCHA source** — Consider whether the oPt office listing needs its own dedicated source record (`org-ocha-opt`) separate from the global OCHA source.
3. **Category expansion** — As the directory grows, consider adding "civil society and community" as a category per PRD §10.8.
4. **Translation** — Prepare Dutch and French versions of organization descriptions per the Belgium/EU launch requirement.
5. **Outreach** — Per the outreach ethics policy, no organization has been contacted about its listing. Before any outreach, prepare: public beta, methodology, status/disclaimer language, contributor guide, security/privacy notes, organization-listing disclaimer, and specific small review asks.

---

**End of Organization Directory Review Packet**
