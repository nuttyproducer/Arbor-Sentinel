# Evidence Library Review Packet

**Generated:** 2026-07-24  
**Scope:** Evidence library records prepared for human/expert review  
**Status:** 2 records are `reviewed`, 7 are `review_pending` — this packet documents what was prepared, what requires review, what automated checks confirm, and who must sign off before any record can be marked `reviewed`.

---

## Summary of Current State

- **9 evidence items** across **6 categories**
- **2 items** have `contentStatus: "reviewed"` (ICJ provisional measures orders)
- **7 items** have `contentStatus: "review_pending"`
- All 9 items have at least one `sourceId` referencing validated source records
- No item has empty `sourceIds`
- All `reviewed` items have `lastReviewedAt`, `reviewedByRole`, and `sourceQuality ≥ 2`
- **No generic multi-source claims without specific sourceIds** — every summary cites named organizations or documents
- **No raw witness testimony, graphic media, exact sensitive locations, or private personal data**

---

## Evidence Item-by-Item Verification

### Court Records (2 items — both `reviewed`)

| ID | Title | Source IDs | Source Quality | Status |
|---|---|---|---|---|
| icj-provisional-measures-jan-2024 | ICJ provisional measures order — 26 January 2024 | icj-2024-01-26 | 5 (Legal/institutional record) | `reviewed` |
| icj-additional-measures-may-2024 | ICJ additional provisional measures — 24 May 2024 | icj-2024-05-24 | 5 (Legal/institutional record) | `reviewed` |

**Review notes:**
- Both items are based on official ICJ court orders — the highest-weight source type in the verification hierarchy.
- Summaries carefully distinguish provisional measures from final determinations on the merits.
- Both use the Genocide Convention terminology policy: "The Court did not make a final determination on the merits of the genocide allegation at this stage."
- `lastReviewedAt`: 2026-07-11. `reviewedByRole`: "Contributor — legal research background."
- **The `reviewed` status reflects a contributor-level review, not an expert legal review.** These items would benefit from a formal legal reviewer confirming the procedural summaries are accurate.

### Official UN Documents (2 items — both `review_pending`)

| ID | Title | Source IDs | Source Quality | Status |
|---|---|---|---|---|
| un-coi-report-2024 | UN Commission of Inquiry report — 2024 | un-coi-2024 | 5 (Legal/institutional record) | `review_pending` |
| icc-palestine-situation | ICC Situation in the State of Palestine | icc-palestine-2024 | 5 (Legal/institutional record) | `review_pending` |

**Review notes:**
- `un-coi-report-2024`: Summary references "2024" as the publication year. The source record `un-coi-2024` also uses 2024 as year-only. A more specific publication date may be available from the OHCHR COI page. Legal status includes `un_finding` — appropriate for a Commission of Inquiry report that is a fact-finding output, not a judicial ruling.
- `icc-palestine-situation`: Summary describes the ICC's open situation and arrest warrant applications. Legal statuses include `arrest_warrant_issued` and `court_proceeding_active`. The summary correctly notes that "ICC proceedings should not be described as final determinations until concluded." Publication date uses "2024" as year-only. The source record includes arrest warrant issuance on 2024-11-21 — this specific date could be reflected more precisely in the evidence item's `publicationDate` or as a distinct evidence item.

### Humanitarian Updates (2 items — both `review_pending`)

| ID | Title | Source IDs | Source Quality | Status |
|---|---|---|---|---|
| gaza-humanitarian-access-2025 | Humanitarian access restrictions in Gaza | ocha-opt-main, ocha-opt-data | 4 (Trusted org verified) | `review_pending` |
| food-insecurity-ipc-gaza | IPC Gaza food insecurity assessment | ipc-frc-gaza-2024, ipc-frc-gaza-march-2024 | 5 (Legal/institutional record) | `review_pending` |

**Review notes:**
- `gaza-humanitarian-access-2025`: Summary references "UN OCHA and multiple humanitarian organisations." SourceIds include both OCHA data records. The summary avoids naming specific incident dates or locations — appropriate for a general access-restrictions summary. `publicationDate: "2025"` is year-only; could be updated to reference specific OCHA situation report dates.
- `food-insecurity-ipc-gaza`: Uses two source records covering the IPC FRC's 2024 assessments. The summary correctly distinguishes between technical food-security assessment and legal determination: "IPC reports are technical assessments — they do not make legal determinations about causes." The `publicationDate: "2025"` is year-only. A more recent source (`ipc-gaza-snapshot-2026-07`) was added to sources but is not referenced here — consider whether this item should be updated or a new item created for the July 2026 IPC snapshot.

### Human-Rights Reports (1 item — `review_pending`)

| ID | Title | Source IDs | Source Quality | Status |
|---|---|---|---|---|
| civilian-harm-documentation | Civilian harm documentation — multiple human-rights organisations | amnesty-opt-2024, hrw-israel-palestine | 4 (Trusted org verified) | `review_pending` |

**Review notes:**
- This item explicitly names "Amnesty International and Human Rights Watch" and links to their respective research hubs. The sources are organizational research portals, not individual reports — this is appropriate for a summary-level item covering broad documentation patterns rather than a single report.
- The summary distinguishes organizational findings from judicial determinations: "Organisational findings are distinct from judicial determinations."
- Legal status includes `ngo_legal_determination` — appropriate.
- `publicationDate: "2025"` is year-only. The source records for Amnesty and HRW do not have specific publication dates since they are research hubs, not individual reports.
- **Consideration:** This broad item could potentially be split into narrower records if specific Amnesty or HRW reports are selected for detailed summary. The current form is appropriate for a structural preview.

### Parliamentary Documents (1 item — `review_pending`)

| ID | Title | Source IDs | Source Quality | Status |
|---|---|---|---|---|
| arms-export-parliamentary-scrutiny | Arms export parliamentary scrutiny — multiple jurisdictions | arms-trade-treaty, eu-common-position-2008-944, belgium-chamber, eu-parliament | 5 (Legal/institutional record) | `review_pending` |

**Review notes:**
- This is the broadest evidence item, spanning multiple jurisdictions. Source IDs cover the Arms Trade Treaty (international), EU Common Position (EU-level), Belgian Chamber (national parliamentary), and European Parliament (supranational parliamentary).
- The summary notes that "Parliamentary records are official public documents and do not themselves constitute legal findings, but they are indicators of democratic accountability processes in action." — appropriate framing.
- `publicationDate: "2025"` — the sources span from 2008 (EU Common Position) to 2024–2025 (ATT, parliamentary references). This date may benefit from narrowing or splitting into jurisdiction-specific records.
- **Consideration:** This item spans multiple jurisdictions. It is coherent as a structural overview but could be split into: (1) ATT/treaty-level obligations, (2) EU-level parliamentary scrutiny, and (3) Belgian parliamentary scrutiny — with detailed summaries for each.

### Verified Investigative Reports (1 item — `review_pending`)

| ID | Title | Source IDs | Source Quality | Status |
|---|---|---|---|---|
| airwars-casualty-monitoring | Civilian casualty monitoring — Airwars and open-source investigations | airwars-gaza | 4 (Trusted org verified) | `review_pending` |

**Review notes:**
- Single source: `airwars-gaza` — Airwars's Gaza monitoring page. The summary describes Airwars's transparent methodology and notes it "does not rely on classified or non-public information."
- `publicationDate: "2025"` is year-only. Airwars publishes ongoing monitoring data without a single publication date.
- Source quality of 4 (Trusted organization verified) is appropriate — Airwars is an established civilian-harm monitoring organization with published methodology.

---

## Source Quality Distribution

| Level | Count | Items |
|---|---|---|
| 5 — Legal/institutional record | 6 | icj-provisional-measures-jan-2024, icj-additional-measures-may-2024, un-coi-report-2024, icc-palestine-situation, food-insecurity-ipc-gaza, arms-export-parliamentary-scrutiny |
| 4 — Trusted organization verified | 3 | gaza-humanitarian-access-2025, civilian-harm-documentation, airwars-casualty-monitoring |

All items have source quality ≥ 4. No item relies on unreviewed leads (level 0) or preserved-only leads (level 1).

---

## Content Status Distribution

| Status | Count | Items |
|---|---|---|
| `reviewed` | 2 | icj-provisional-measures-jan-2024, icj-additional-measures-may-2024 |
| `review_pending` | 7 | All others |

---

## Automated Checks — Evidence-Specific

### New validation rules (Rules 21, 24)

| Rule | What it checks | Result |
|---|---|---|
| Rule 21 | Every publishable evidence item has ≥ 1 sourceId | ✅ All 9 items pass |
| Rule 24 | `reviewed` items have `sourceQuality` ≥ 2 | ✅ Both reviewed items have sourceQuality 5 |

### Existing checks confirmed passing

- Rule 5: All sourceIds resolve (0 missing refs)
- Rule 6: No reviewed records with empty sourceIds
- Rule 7–9: Reviewed metadata complete (lastReviewedAt, reviewedByRole, version)
- Rule 10: All legal statuses in controlled vocabulary
- Rule 11: All verification levels in 0–5 range
- Rule 14: Evidence reviewed source support passes
- Rule 15: All items have correction routes
- Rule 16: All relatedRoutes reference valid platform routes

---

## What Still Needs Human Review

### For the 7 `review_pending` items

1. **Source reviewer** — Confirm each source record is the correct and most current public document for the claim.
2. **Editorial reviewer** — Review each summary for accuracy, neutrality, and appropriate framing. For items spanning multiple sources, verify the summary accurately reflects the scope of the referenced sources.
3. **Legal reviewer** — For items with `legalStatuses`: confirm the legal status labels are accurate and the procedural posture is correctly described.
4. **Date reviewer** — Where `publicationDate` is year-only, determine if a more specific date is available from the source.

### For the 2 `reviewed` items

1. **Legal reviewer** — Both ICJ items reflect a contributor-level legal review. A formal legal reviewer should confirm the procedural summaries are accurate, particularly the description of what the Court ordered vs. what it did not determine.
2. **Currency check** — Both were last reviewed 2026-07-11. The ICJ case is active with filings through 2026. Confirm the summaries remain current.

### Structural considerations

1. **`arms-export-parliamentary-scrutiny`** — This item covers multiple jurisdictions. Consider splitting into narrower records: (a) Arms Trade Treaty obligations, (b) EU Common Position on arms exports, (c) Belgian parliamentary scrutiny, (d) European Parliament resolutions.
2. **`civilian-harm-documentation`** — References research hubs (Amnesty, HRW portal pages) rather than individual reports. Consider whether specific landmark reports should receive dedicated evidence items.
3. **`food-insecurity-ipc-gaza`** — A newer IPC snapshot (`ipc-gaza-snapshot-2026-07`, published 2026-07-23) exists in sources but is not referenced. Either update this item or create a new one for the July 2026 assessment.
4. **`icc-palestine-situation`** — The source record includes the November 2024 arrest warrant issuance. A separate, more specific evidence item for the arrest warrants could be created.

---

## Acceptance Criteria Status

| Criterion | Status |
|---|---|
| Every evidence record has supporting sources or is clearly draft/source_pending | ✅ All 9 have sourceIds; 7 are `review_pending` |
| No empty sourceIds on publishable records | ✅ All 9 have ≥ 1 sourceId |
| Source IDs verified | ✅ All resolve to existing source records |
| Source types verified | ✅ All use controlled vocabulary |
| Publication dates recorded | ✅ All have dates (some year-only — acceptable per date validation) |
| Content-status accuracy verified | ✅ 2 reviewed (with proper metadata), 7 review_pending |
| Source-quality accuracy verified | ✅ All ≥ 4 |
| No unsupported generic multi-source claims | ✅ All summaries name specific organizations or documents |
| No false reviewed status | ✅ Reviewed items have source support, review metadata |
| Tests pass | ✅ 316 tests, 0 failures |
| Validation passes | ✅ 104 validation tests, 0 errors |

---

## Recommended Next Steps

1. **Legal review** — A legal reviewer should examine all 9 evidence summaries for procedural accuracy.
2. **Date precision** — Upgrade year-only `publicationDate` fields where specific dates are available from source records.
3. **IPC update** — Reference `ipc-gaza-snapshot-2026-07` in the food insecurity item or create a new item.
4. **Split broad items** — Consider splitting `arms-export-parliamentary-scrutiny` into jurisdiction-specific records.
5. **New items** — Consider adding dedicated evidence items for:
   - ICC arrest warrants (November 2024) — currently covered within `icc-palestine-situation`
   - ICRC operational updates (January 2026 ceasefire operations, June 2026 collapse warning)
   - UN COI children report (June 2026)
   - IPC July 2026 Special Snapshot
6. **Second human reviewer** — All 7 `review_pending` items require a second reviewer before status can be upgraded to `reviewed`.

---

**End of Evidence Library Review Packet**
