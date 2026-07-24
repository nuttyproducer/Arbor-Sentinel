/**
 * Source-linked European Union accountability records.
 *
 * Every factual position or competency statement has source IDs.
 * EU-level competencies are distinguished from member-state competencies.
 * No accountability scores. No rankings.
 * EU powers are described only within their legal competencies.
 * Content status is review_pending throughout.
 */

import type {
  InstitutionPositionRecord,
  CompetencyRecord,
  HumanitarianAidRecord,
  ContactRouteRecord,
} from "../types/content";

// ── EU Institution Positions ────────────────────────────────────────────────

export const euInstitutionPositions: InstitutionPositionRecord[] = [
  {
    id: "eu-position-council-hamas-sanctions-2025-01",
    institution: "Council of the European Union",
    area: "Restrictive measures — Hamas and PIJ",
    position:
      "The Council extended restrictive measures against Hamas and Palestinian Islamic Jihad by one year on 13 January 2025 until 20 January 2026. Measures target 12 individuals and 3 entities with asset freezes and EU travel bans. The regime was first established in January 2024 following the 7 October 2023 attacks.",
    attribution: "Council of the European Union — press release, 13 January 2025",
    date: "2025-01-13",
    sourceIds: ["eu-council-hamas-sanctions-2025-01"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "eu-position-commission-association-review-2025-06",
    institution: "European Commission / High Representative / EEAS",
    area: "EU-Israel Association Agreement — Article 2 compliance review",
    position:
      "The High Representative presented a review to the Foreign Affairs Council in June 2025 concluding that there were indications Israel was in breach of Article 2 of the EU-Israel Association Agreement, which makes respect for human rights and democratic principles an essential element. The review cited the deteriorating humanitarian situation in Gaza, the blockade of humanitarian aid, military operations, and settlement expansion.",
    attribution: "High Representative of the Union for Foreign Affairs and Security Policy — Foreign Affairs Council, June 2025",
    date: "2025-06",
    sourceIds: ["eu-commission-association-review-2025-06"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "eu-position-commission-sanctions-proposal-2025-09",
    institution: "European Commission",
    area: "Association Agreement suspension and sanctions proposal",
    position:
      "The Commission proposed on 17 September 2025: (1) partial suspension of trade-related provisions of the EU-Israel Association Agreement — requiring qualified majority in Council; (2) new listings under the EU Global Human Rights Sanctions Regime targeting extremist Israeli ministers and violent settlers — requiring unanimity; and (3) putting bilateral financial support to Israel on hold (approximately €14 million). The package followed a famine declaration in North Gaza on 22 August 2025. As of July 2026, the status of Council adoption of these proposals requires verification.",
    attribution: "European Commission — press release, 17 September 2025",
    date: "2025-09-17",
    sourceIds: ["eu-commission-sanctions-proposal-2025-09"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "eu-position-parliament-resolution-2025-09",
    institution: "European Parliament",
    area: "Gaza humanitarian crisis and accountability",
    position:
      "The European Parliament adopted a joint resolution (RC-B10-0372/2025) in September 2025: expressing alarm at the IPC-confirmed man-made famine in northern Gaza; strongly condemning obstruction of humanitarian aid by the Israeli government; calling for an immediate and permanent ceasefire and unconditional release of all hostages; demanding unimpeded humanitarian assistance; supporting partial suspension of the Association Agreement; calling for an arms embargo on Israel; and urging member states to enforce ICC arrest warrants. EP resolutions are political statements — they are not legally binding on EU institutions or member states.",
    attribution: "European Parliament — joint resolution RC-B10-0372/2025, September 2025",
    date: "2025-09",
    sourceIds: ["eu-parliament-resolution-2025-09"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "eu-position-commission-support-programme-2025",
    institution: "European Commission",
    area: "Palestinian recovery and resilience support",
    position:
      "The Commission announced a €1.6 billion Comprehensive Support Programme for Palestinian recovery and resilience in 2025. The programme is conditioned on a political and security framework acceptable to both parties and no future role for Hamas. As of July 2026, no specific reconstruction budget had been allocated and the programme's implementation status requires verification.",
    attribution: "European Commission — 2025 announcement",
    date: "2025",
    sourceIds: ["eu-commission-support-programme-2025"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── EU Competencies ─────────────────────────────────────────────────────────

export const euCompetencies: CompetencyRecord[] = [
  {
    id: "eu-competency-trade",
    level: "eu",
    area: "Trade policy — Association Agreements and trade preferences",
    description:
      "The EU has exclusive competence over common commercial policy, including trade agreements like the EU-Israel Association Agreement. The Commission negotiates on behalf of member states. Suspension or modification of trade provisions requires a Council decision — qualified majority for trade-related provisions. The Commission proposed partial suspension in September 2025. As of July 2026, the Council has not adopted the proposal (verification required).",
    belongsTo: "European Union — exclusive competence (Article 207 TFEU); Commission proposes, Council decides, Parliament consents",
    doesNotBelongTo: "Individual member states (member states may not independently suspend EU trade agreements; Belgium's settlement goods ban operates under national law, not EU trade suspension)",
    sourceIds: ["eu-commission-sanctions-proposal-2025-09", "eu-israel-association-agreement"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "eu-competency-cfsp",
    level: "shared",
    area: "Common Foreign and Security Policy (CFSP) — sanctions and restrictive measures",
    description:
      "CFSP decisions, including sanctions and restrictive measures, require unanimity in the Council of the EU. Any single member state can veto a CFSP decision. The Commission may propose but does not decide. The European Parliament has no formal role in CFSP decision-making (it is consulted and adopts resolutions, which are political, not binding). This unanimity requirement is a key structural constraint on EU-level sanctions.",
    belongsTo: "Council of the European Union — unanimity required for CFSP decisions; member states collectively",
    doesNotBelongTo: "European Commission (proposes but does not decide); European Parliament (political oversight only, no decision-making power); any single member state alone",
    sourceIds: ["eu-council", "eu-commission-sanctions-proposal-2025-09"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "eu-competency-arms-export",
    level: "eu",
    area: "Arms-export regulation — EU Common Position",
    description:
      "Arms-export licensing is a national competency of EU member states. The EU Common Position (2008/944/CFSP) sets shared criteria — including respect for IHL (Criterion 2) and internal situation/armed conflicts (Criterion 3) — but licensing decisions are made by national governments. Belgium, uniquely among EU states, further devolves licensing to its three regions. The EU does not issue or deny arms-export licences. The European Parliament has called for an EU arms embargo but has no power to impose one — this would require a unanimous Council decision.",
    belongsTo: "EU member states individually (national competency); EU Common Position (2008/944/CFSP) sets shared criteria",
    doesNotBelongTo: "European Commission (no licensing authority); European Parliament (no licensing authority); EU as a whole (no central licensing body)",
    sourceIds: ["eu-common-position-2008-944", "eu-council"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "eu-competency-humanitarian-aid",
    level: "eu",
    area: "Humanitarian aid — ECHO",
    description:
      "The EU, through DG ECHO (European Civil Protection and Humanitarian Aid Operations), is one of the world's largest humanitarian donors. The Commission manages the humanitarian aid budget and implements funding through UN agencies, NGOs, and international organisations. The 2026 Humanitarian Implementation Plan for Palestine has a total indicative allocation of €124.4 million. EU humanitarian aid is a shared competence — member states also provide bilateral humanitarian assistance independently. EU aid allocations do not require unanimity.",
    belongsTo: "European Commission — DG ECHO; shared competence with member states",
    doesNotBelongTo: "Member states exclusively (member states retain their own bilateral humanitarian aid programmes); Council (does not decide individual aid allocations)",
    sourceIds: ["eu-echo-hip-2026", "eu-echo-hip-2025"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "eu-competency-association-agreement",
    level: "eu",
    area: "Association Agreement — human rights clause and suspension",
    description:
      "The EU-Israel Association Agreement (in force since 2000) includes Article 2 establishing that relations are based on respect for human rights and democratic principles as an essential element. Suspension of the Agreement in whole or in part is possible under Article 60 of the Vienna Convention on the Law of Treaties (material breach). Partial suspension of trade provisions requires qualified majority in the Council. Full suspension would require unanimity. The Agreement is an EU-level instrument — individual member states cannot independently suspend its provisions.",
    belongsTo: "European Union — the Agreement is between the EU (and member states) and Israel; suspension requires Council decision",
    doesNotBelongTo: "Individual member states (Belgium cannot unilaterally suspend the Association Agreement; it can only apply national measures consistent with EU law, such as the settlement goods ban)",
    sourceIds: ["eu-israel-association-agreement", "eu-commission-association-review-2025-06"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── EU Humanitarian Aid ─────────────────────────────────────────────────────

export const euHumanitarianAid: HumanitarianAidRecord[] = [
  {
    id: "eu-aid-echo-palestine-2026",
    recipient: "Palestine (Gaza and West Bank) — humanitarian response",
    amount: "€124.4 million indicative allocation (including €18.5 million for Education in Emergencies)",
    period: "2026",
    channel: "DG ECHO — UN agencies, international organisations, and NGOs; entire Gaza Strip qualifies for Exceptional Extreme Operational Conditions; UN-led aid architecture only",
    sourceIds: ["eu-echo-hip-2026"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "eu-aid-echo-palestine-2025",
    recipient: "Palestine (Gaza and West Bank) — humanitarian response",
    amount: "€219.9 million indicative allocation (Version 4, September 2025)",
    period: "2025",
    channel: "DG ECHO — pre-selected partners include IOM, UNICEF, UNRWA, WFP, WHO, NRC; revised upward multiple times during 2025",
    sourceIds: ["eu-echo-hip-2025"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "eu-aid-support-programme-palestine-2025",
    recipient: "Palestinian recovery and resilience",
    amount: "€1.6 billion Comprehensive Support Programme (announced; implementation status requires verification)",
    period: "2025 onward",
    channel: "European Commission — conditioned on political/security framework and no future role for Hamas",
    sourceIds: ["eu-commission-support-programme-2025"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── EU Contact Routes ───────────────────────────────────────────────────────

export const euContactRoutes: ContactRouteRecord[] = [
  {
    id: "eu-contact-mep",
    entity: "Members of the European Parliament (MEPs)",
    route:
      "Contact your MEPs through the European Parliament's official directory. Relevant committees: Foreign Affairs Committee (AFET), Human Rights Subcommittee (DROI), Development Committee (DEVE). MEPs can ask parliamentary questions, table resolutions, and hold hearings. Contact should be through official parliamentary channels only.",
    url: "https://www.europarl.europa.eu/",
    notes:
      "MEP contact is a lawful civic-engagement route. Belgian citizens elect 22 MEPs. Contact should reference specific EP resolutions, pending Council decisions, or humanitarian funding questions. All contact should be polite, lawful, and non-harassing.",
    sourceIds: ["eu-parliament"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "eu-contact-petition",
    entity: "European Parliament — Petitions Committee (PETI)",
    route:
      "Submit a petition to the European Parliament on any matter within the EU's fields of activity that affects you directly. Petitions can address EU policy, law implementation, or institutional actions. The Petitions Committee reviews admissible petitions and may request information from the Commission, hold hearings, or issue recommendations.",
    url: "https://www.europarl.europa.eu/petitions/en/home",
    notes:
      "The petitions process is a formal EU citizen right under Article 227 TFEU. It is not a complaint mechanism for individual legal disputes. Petitions must relate to EU (not national) matters. This route is appropriate for issues such as: EU-Israel Association Agreement implementation, EU arms-export common position enforcement, or EU humanitarian aid policy.",
    sourceIds: ["eu-petitions-portal", "eu-parliament"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "eu-contact-eeas",
    entity: "European External Action Service (EEAS) — High Representative",
    route:
      "The EEAS implements EU foreign policy under the High Representative. While the EEAS does not have a public petition mechanism, its human rights dialogues, country statements, and diplomatic démarches are a matter of public record. Contact through the EEAS public information service for inquiries about official EU foreign policy positions.",
    url: "https://www.eeas.europa.eu/",
    notes:
      "The EEAS is the appropriate contact for inquiries about: EU diplomatic statements on the Middle East, EU human-rights dialogue outcomes, and EU positions at UN forums. Distinguish from member-state diplomatic channels — member states conduct their own foreign policy alongside EU-level action.",
    sourceIds: ["eu-eeas"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── EU Transparency & Data Gaps ─────────────────────────────────────────────

export const euDataGaps = [
  {
    area: "Arms-export data",
    description:
      "The EU Common Position requires member states to report arms-export data, but reporting is inconsistent, delayed, and often aggregated in ways that obscure end-use and end-user details. Individual member-state export data is published through national reports (COARM). Belgium publishes arms-export data through its three regional governments — coordination gaps between regions and with federal customs data create transparency challenges.",
    sourceIds: ["eu-common-position-2008-944", "eu-council"],
  },
  {
    area: "Council CFSP decision-making",
    description:
      "CFSP decisions require unanimity. Individual member-state positions in Council deliberations are generally not public. When a sanctions proposal is blocked or delayed, it is often not possible to determine from public records which member state(s) withheld consent. This is a structural transparency limitation on EU foreign policy accountability.",
    sourceIds: ["eu-council"],
  },
  {
    area: "Association Agreement suspension status",
    description:
      "As of July 2026, the Commission has proposed partial suspension. The Council has not publicly adopted the proposal. The timing, scope, and member-state positions on suspension are not fully transparent. The proposal's status requires verification — it may be under active negotiation, stalled, or withdrawn.",
    sourceIds: ["eu-commission-sanctions-proposal-2025-09"],
  },
  {
    area: "EU aid implementation and conditionality",
    description:
      "EU humanitarian aid and development support to Palestine involves complex conditionality frameworks (no role for Hamas, acceptable political/security framework). The implementation status of these conditions and the exact disbursement status of announced funding (particularly the €1.6 billion Comprehensive Support Programme) is not fully transparent from public records. Verification of actual disbursement requires access to Commission implementation reports.",
    sourceIds: ["eu-commission-support-programme-2025", "eu-echo-hip-2026"],
  },
];
