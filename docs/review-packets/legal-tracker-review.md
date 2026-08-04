# Legal Tracker Review Packet

**Generated:** 2026-07-24  
**Scope:** Legal Tracker content prepared for human/expert review  
**Status:** All content is `review_pending` — this packet documents what was prepared, what requires review, and who must sign off.

---

## Claims Added or Changed

### ICJ — South Africa v. Israel (Genocide Convention)

| Claim | Change | Source |
|---|---|---|
| Case is in written proceedings phase (Reply/Rejoinder) | Added | icj-2026-05-21 |
| ICJ fixed time-limits by Order of 21 May 2026 | Added | icj-2026-05-21 |
| 20+ states have filed interventions (2024–2026) | Updated | icj-interventions-2025-2026 |
| Belgium filed Article 63 intervention on 23 December 2025 | Added | belgium-icj-intervention-2025 |
| Netherlands, Iceland, Namibia, US, Hungary, Fiji intervened March 2026 | Added | icj-interventions-2025-2026 |
| Ireland, Cuba, Belize intervened January 2025 | Added | icj-interventions-2025-2026 |
| Brazil, Comoros intervened September–October 2025 | Added | icj-interventions-2025-2026 |
| Nicaragua withdrew intervention application (April 2025) | Added | icj-interventions-2025-2026 |
| Case opened 2023-12-29 (unchanged) | Verified | icj-case-192 |
| Three provisional measures orders (Jan, Mar, May 2024) | Verified | icj-2024-01-26, icj-2024-03-28, icj-2024-05-24 |

### ICC — Situation in the State of Palestine

| Claim | Change | Source |
|---|---|---|
| Arrest warrants issued 21 November 2024 for Netanyahu, Gallant, Deif | Specified | icc-arrest-warrants-2024-11 |
| Deif warrant terminated February 2025 (death confirmed) | Added | icc-deif-warrant-cancelled-2025 |
| Warrants for Netanyahu and Gallant remain active | Verified | icc-arrest-warrants-2024-11 |
| Prosecutor Karim Khan stepped aside May 2025 | Added | icc-khan-2025-2026 |
| Independent panel concluded no misconduct established (March 2026) | Added | icc-khan-2025-2026 |
| ASP special session on Prosecutor removal scheduled 24 July 2026 | Added | icc-khan-2025-2026 |
| Arrest warrants unaffected by Prosecutor leadership status | Added | icc-khan-2025-2026 |

### UN Commission of Inquiry on the OPT

| Claim | Change | Source |
|---|---|---|
| June 2026 report on crimes against Palestinian children | Added | un-coi-2026-children |
| Commission found deliberate targeting of children constitutes genocide, crimes against humanity, war crimes | Added | un-coi-2026-children |
| 20,179 children killed, 44,143 injured (Oct 2023 – Oct 2025) | Added | un-coi-2026-children |
| 58,054 children lost one or both parents | Added | un-coi-2026-children |
| September 2024 UNGA report (A/79/232) on detainees and medical facilities | Added | un-coi-unga-2024 |
| COI finding attributed to the Commission — not platform endorsement | Structural | N/A (legal-wording safeguard) |

---

## Sources Added

| Source ID | Publisher | Type | Publication Date |
|---|---|---|---|
| icj-case-192 | ICJ | Court docket | 2023-12-29 (ongoing) |
| icj-2026-05-21 | ICJ | Procedural order | 2026-05-21 |
| icj-interventions-2025-2026 | ICJ | Court records | 2025–2026 |
| icc-deif-warrant-cancelled-2025 | ICC | Judicial decision | 2025-02 |
| icc-khan-2025-2026 | ICC / ASP | Institutional record | 2025-05 (ongoing) |
| un-coi-2026-children | OHCHR / UN HRC | COI report | 2026-06-23 |
| belgium-icj-intervention-2025 | ICJ / Belgium | Declaration of intervention | 2025-12-23 |

All source URLs verified as resolving correctly as of 2026-07-24.

---

## Legal Terminology Decisions

| Decision | Rationale |
|---|---|
| "The Commission found that acts constitute genocide" not "Genocide has occurred" | COI findings are fact-finding outputs, not judicial rulings. Attribution to the Commission preserves this distinction. |
| "Arrest warrants are not convictions" repeated in procedural notes | Required by Legal Language Policy. ICC warrants establish reasonable grounds, not guilt. |
| "Provisional measures do not constitute a final judgment on the merits" repeated | Required by Legal Language Policy. ICJ provisional measures are binding interim orders, not merits rulings. |
| "Termination of proceedings against Deif is a procedural consequence of confirmed death — not an acquittal" | Required for accuracy. Death terminates ICC jurisdiction over an individual; it does not imply innocence or guilt. |
| "All persons are presumed innocent until proven guilty" on ICC entries | Required by Legal Language Policy and Rome Statute Article 66. |
| Genocide finding by COI always prefaced: "The Commission found…" | Required by Methodology: "Attribute, don't assert." The platform reports the COI's finding — it does not independently find genocide. |

---

## Open Questions

1. **ICJ Merits Timeline:** No date has been set for oral hearings on the merits. When should the `nextMilestone` be updated?
2. **ICC Arrest Warrant Enforcement:** Which States Parties have publicly confirmed they would execute the warrants? Should this be tracked?
3. **Prosecutor Leadership:** The ASP vote on 24 July 2026 may resolve the Prosecutor question today. This entry will need updating regardless of outcome.
4. **COI Report Scope:** The June 2026 report covers through 31 March 2026. Should the dossier note the gap between March and July 2026?
5. **Additional Legal Cases:** Should the tracker add the Nicaragua v. Germany ICJ case (alleged complicity in genocide)? Should it add universal jurisdiction cases in European states?

---

## Required Reviewer Roles

Per the [Reviewer Matrix](../reviewer-matrix.md):

| Review Type | Required | Status | Reviewer |
|---|---|---|---|
| Source review (SRC) | ✅ | Pending | Source verifier needed |
| Editorial review (EDI) | ✅ | Pending | Editor needed |
| Legal review (LEG) | ✅ | Pending | Legal reviewer needed |
| Competency review (COM) | Recommended | Not assigned | International law expertise |
| Safety review (SAF) | Not required | — | (public court records) |

**Minimum distinct reviewers:** 3 (SRC + EDI + LEG must be different people per separation-of-duties rules).

---

## Unresolved Disagreement or Uncertainty

- **None recorded.** This is the first review-ready version of the expanded legal tracker content. Disagreements will be documented here as they arise during review.

---

## Exact Pages/Records Needing Sign-Off

| Record | File | Sign-off Required |
|---|---|---|
| ICJ Genocide Convention case entry | `src/data/legalCases.ts` (line 28) | SRC + EDI + LEG |
| ICC Palestine Situation case entry | `src/data/legalCases.ts` (line 68) | SRC + EDI + LEG |
| UN COI case entry | `src/data/legalCases.ts` (line 108) | SRC + EDI + LEG |
| ICJ timeline events (all 13 events) | `src/data/legalTimeline.ts` | SRC + LEG |
| ICC timeline events (all 8 events) | `src/data/legalTimeline.ts` | SRC + LEG |
| UN COI timeline events (all 5 events) | `src/data/legalTimeline.ts` | SRC + LEG |
| All new source records (7 sources) | `src/data/sources.ts` | SRC |
| Legal Tracker page | `src/pages/LegalTrackerPage.tsx` | EDI |
| Legal status explanations | `src/components/legal/legalStatusExplanations.ts` | LEG |
| Legal Case Card component | `src/components/legal/LegalCaseCard.tsx` | EDI |

---

## Pre-Review Validation

Run before submitting for review:
```bash
npx vitest run src/data/__tests__/validation.test.ts
npx tsc --noEmit
npx eslint src/data/legalCases.ts src/data/legalTimeline.ts src/data/sources.ts
```

Confirm:
- [ ] No duplicate IDs in source registry
- [ ] All sourceIds referenced in legal cases exist in sources.ts
- [ ] All sourceIds referenced in timeline events exist in sources.ts
- [ ] No invalid legalStatus values
- [ ] No invalid eventType values
- [ ] All records have version ≥ 1
- [ ] All records have correctionUrl set
