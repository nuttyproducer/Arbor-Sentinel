# Legal Wording Review Checklist

**Use when:** Reviewing legal status assignments, procedural descriptions,
or legal terminology on any page or record.

**Last reviewed:** 2026-07-12

**Important:** This checklist is a contributor tool. It is not legal advice.
If you are unsure about a legal characterisation, flag it for legal review
rather than publishing it.

---

## General principles

1. **Attribute, don't assert.** Use language that attributes legal claims to
   the body that made them. "The ICJ found that…" not "It is established
   that…"
2. **State the procedural posture.** Readers should know whether a case is at
   provisional measures, merits, appeal, or concluded. "The Court issued
   provisional measures" is materially different from "The Court issued a
   final judgment."
3. **Distinguish allegations from findings.** An arrest warrant is a judicial
   finding of reasonable grounds — it is not a conviction. Use precise
   language.
4. **Don't imply a final genocide determination unless one exists.** As of
   the current static beta, no international court has issued a final
   judgment that a state has committed genocide. Describe proceedings, not
   conclusions.
5. **Separate legal status from editorial status.** A record may have a legal
   status of "Court proceeding active" while the platform's editorial status
   is "review_pending." These are independent dimensions.

## Legal status label assignments

| Status | Use when | Don't use when |
|---|---|---|
| `court_proceeding_active` | A court case is open and proceedings are ongoing | The case has concluded or been dismissed |
| `provisional_measures_issued` | A court has issued binding interim orders | The court has only scheduled a hearing |
| `arrest_warrant_issued` | An arrest warrant has been publicly confirmed by the issuing court | There are only media reports of a warrant |
| `allegation_under_investigation` | A prosecutor or investigative body has formally opened an investigation | There are only civil-society calls for investigation |
| `un_finding` | A UN body has published an official finding or report | A UN official made an informal statement |
| `ngo_legal_determination` | An established NGO with legal expertise has published a legal analysis | An advocacy group without published legal methodology has made a claim |
| `not_judicially_determined` | A claim or allegation has not been adjudicated by any court | A court has made a determination |
| `contested_claim` | A factual or legal claim is actively disputed by a party with standing | The claim is merely unpopular or politically contested |
| `requires_further_verification` | The legal status itself is unclear and needs expert review | The facts are well-established but legally complex |

## Genocide terminology

The word "genocide" may be used on this platform only when:

- [ ] Attributed to a specific legal proceeding, court filing, UN or NGO
  finding, or named expert/legal determination.
- [ ] The procedural posture is stated (provisional measures, merits phase,
  final judgment, or appeal).
- [ ] The distinction is clear between: (a) a finding that a state has
  obligations under the Genocide Convention, and (b) a finding that genocide
  has occurred.
- [ ] The word is not used as a general descriptor or rhetorical device
  unattributed to a legal or institutional source.

## Institutional competency

When describing what an institution can do:

- [ ] State the institution's legal competence accurately. The EU does not
  control member-state arms-export decisions. Belgium hosts EU institutions
  but does not control them.
- [ ] Distinguish between exclusive competence, shared competence, and
  member-state competence where relevant.
- [ ] Do not imply that an institution has authority it does not possess
  under its founding treaties or legal framework.

## Before publishing

- [ ] Run `npx vitest run src/data/__tests__/validation.test.ts` — confirms
  no invalid legal status labels.
- [ ] If the record's legal statuses changed, verify that the content status
  and `reviewedByRole` are still accurate.
- [ ] If you are not confident about a legal status assignment, use
  `requires_further_verification` and add a `reviewNotes` entry explaining
  what needs review.
