/**
 * Source-linked Belgium accountability records.
 *
 * Every factual position or competency statement has source IDs.
 * Federal/regional/EU competencies are visibly distinguished.
 * No accountability scores. No rankings.
 * Content status is review_pending throughout.
 */

import type {
  CountryPositionRecord,
  CompetencyRecord,
  OfficialStatementRecord,
  ArmsTransferPolicyRecord,
  HumanitarianAidRecord,
  ContactRouteRecord,
} from "../types/content";

// ── Federal Positions ──────────────────────────────────────────────────────

export const belgiumFederalPositions: CountryPositionRecord[] = [
  {
    id: "belgium-position-sanctions-2025-09",
    area: "Sanctions and restrictive measures",
    position:
      "Belgium adopted a 12-measure sanctions package against Israel in September 2025, including asset freezes, entry bans, a ban on settlement goods imports, persona non grata declarations for far-right Israeli ministers, expansion of the arms embargo, and a push for EU-level suspension of trade, research, and aviation agreements with Israel.",
    attribution: "Belgian Council of Ministers",
    date: "2025-09",
    sourceIds: ["belgium-sanctions-2025-09"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-position-settlement-ban-2026-07",
    area: "Trade restrictions — settlement goods",
    position:
      "Belgium advanced a royal decree in July 2026 banning imports from Israeli settlements in the West Bank, East Jerusalem, and Gaza. A 120-day transitional period allows adaptation. The ban is justified by the ICJ's July 2024 advisory opinion finding Israeli settlements illegal. Belgium joined Spain, the Netherlands, and Ireland as EU nations imposing such bans.",
    attribution: "Belgian Federal Government",
    date: "2026-07",
    sourceIds: ["belgium-settlement-ban-2026-07"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-position-icc-cooperation",
    area: "ICC cooperation",
    position:
      "Belgium is a State Party to the Rome Statute and has a legal duty to cooperate with the ICC, including executing arrest warrants on its territory. The Brussels-Capital Region Parliament voted unanimously in May 2025 for a resolution calling on the federal government to implement ICC arrest warrants against Israeli leaders. The resolution rejected Prime Minister Bart De Wever's statement that Belgium would 'unlikely' arrest Netanyahu as a violation of the Rome Statute.",
    attribution: "Brussels-Capital Region Parliament / Belgian Rome Statute obligations",
    date: "2025-05",
    sourceIds: ["belgium-brussels-parliament-icc-2025-05", "icc-arrest-warrants-2024-11"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-position-icj-intervention",
    area: "ICJ cooperation — Genocide Convention intervention",
    position:
      "Belgium filed a declaration of intervention under Article 63 of the ICJ Statute in the South Africa v. Israel case on 23 December 2025. An Article 63 intervention concerns the construction of the Genocide Convention — Belgium accepts that the Court's interpretation will be binding upon it. This is a procedural step, not a ruling on the merits of whether violations have occurred.",
    attribution: "Kingdom of Belgium / ICJ case docket",
    date: "2025-12-23",
    sourceIds: ["belgium-icj-intervention-2025"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-position-palestine-recognition",
    area: "Palestine recognition",
    position:
      "Belgium joined the New York Declaration alongside France and Saudi Arabia signalling recognition of the State of Palestine. Formal recognition was conditioned on hostage release and exclusion of Hamas from Palestinian governance to avoid being 'interpreted as a reward for terrorism.' The status of formal recognition as of July 2026 requires verification.",
    attribution: "Belgian Federal Government — FPS Foreign Affairs",
    date: "2025-09",
    sourceIds: ["belgium-fps-foreign-affairs"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── Federal & Regional Competencies ─────────────────────────────────────────

export const belgiumCompetencies: CompetencyRecord[] = [
  {
    id: "belgium-competency-foreign-policy",
    level: "federal",
    area: "Foreign policy, defence, and international treaty obligations",
    description:
      "Foreign policy, defence, and international treaty obligations are federal competencies exercised by the federal government and the Minister of Foreign Affairs. Belgium's positions at the UN, EU Council, and in diplomatic démarches are determined at the federal level.",
    belongsTo: "Belgian Federal Government — FPS Foreign Affairs, Minister of Foreign Affairs, Council of Ministers",
    doesNotBelongTo: "Regional governments (Flanders, Wallonia, Brussels-Capital); EU institutions (Belgium participates in EU CFSP but does not unilaterally determine it)",
    sourceIds: ["belgium-fps-foreign-affairs"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-competency-arms-export",
    level: "regional",
    area: "Arms-export licensing",
    description:
      "Arms-export licensing in Belgium is a regional competency. Each of the three regions — Flanders, Wallonia, and Brussels-Capital — has its own arms-licensing decree and administration. Flanders uses a 2012 decree covering transit with and without transshipment. Wallonia uses a 2012 decree covering only transit with transshipment (a 2024 decree adding transit without transshipment was annulled by the Council of State in May 2025). Brussels-Capital's 2013 ordinance covers only transit with transshipment. These differences create variations in enforcement scope across regions.",
    belongsTo: "Flanders, Wallonia, and Brussels-Capital Region (each independently)",
    doesNotBelongTo: "Federal government (federal government may take complementary measures such as airspace restrictions and customs enforcement, but primary licensing authority is regional)",
    sourceIds: ["belgium-flanders-court-2025-07", "belgium-wallonia-block-2025-10", "belgium-fps-foreign-affairs"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-competency-humanitarian-aid",
    level: "shared",
    area: "Humanitarian aid and development cooperation",
    description:
      "Humanitarian aid is primarily a federal competency managed through the Directorate-General for Development Cooperation (DGD) and the Minister of Development Cooperation. Some regional cooperation programmes exist in Flanders, Wallonia, and Brussels-Capital. Belgium is a significant donor to UNRWA, OCHA, WFP, and FAO humanitarian operations in Gaza.",
    belongsTo: "Belgian Federal Government — DGD; regional governments (complementary programmes)",
    doesNotBelongTo: "EU institutions (Belgium contributes to but does not control EU humanitarian aid allocations through ECHO)",
    sourceIds: ["belgium-humanitarian-2025-09", "belgium-open-aid"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-competency-eu-hosting",
    level: "international",
    area: "Hosting EU and NATO institutions",
    description:
      "Belgium hosts the EU institutions (Brussels) and NATO headquarters (Evere). Hosting confers no control over EU or NATO decisions. Belgium participates in EU and NATO decision-making as a member state according to the rules of those organisations. Hosting responsibilities include security, diplomatic protocol, and infrastructure — not policy direction.",
    belongsTo: "Belgium (host nation responsibilities only)",
    doesNotBelongTo: "Belgium (does not control EU or NATO decisions made in Brussels; does not determine EU institution staffing, agenda, or outcomes)",
    sourceIds: ["belgium-fps-foreign-affairs"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── Public Statements ───────────────────────────────────────────────────────

export const belgiumOfficialStatements: OfficialStatementRecord[] = [
  {
    id: "belgium-statement-prevot-unga-2025-09",
    speaker: "Maxime Prévot",
    office: "Belgian Minister of Foreign Affairs",
    date: "2025-09-24",
    summary:
      "At the UN General Assembly, Foreign Minister Maxime Prévot stated: 'I think there is only one thing to do: sanctions, sanctions, sanctions against the Israeli government... It's really the only way to ever change the attitude of the Israeli government.' He described starvation of civilians as 'totally unacceptable' and 'a war crime.' This statement accompanied Belgium's announcement of its 12-sanction package.",
    sourceIds: ["belgium-prevot-statement-2025-09"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-statement-prevot-humanitarian-2025-12",
    speaker: "Maxime Prévot",
    office: "Belgian Minister of Foreign Affairs",
    date: "2025-12",
    summary:
      "Foreign Minister Prévot urged Israel to lift all humanitarian access constraints on Gaza, stating that aid should not be 'conditional or politicized,' and referenced the ICJ's assertion of Israel's unconditional obligation to ensure aid delivery to civilians in Gaza.",
    sourceIds: ["belgium-fps-foreign-affairs"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── Arms-Transfer Policy ────────────────────────────────────────────────────

export const belgiumArmsTransferPolicies: ArmsTransferPolicyRecord[] = [
  {
    id: "belgium-arms-federal-sanctions-2025-09",
    level: "federal",
    authority: "Belgian Council of Ministers",
    date: "2025-09",
    policy:
      "The federal government expanded the arms embargo to cover all military goods and dual-use items destined for Israel, and committed to lobbying the EU for a full arms embargo. Belgium adopted a royal decree on 18 January 2026 prohibiting flights carrying military equipment to Israel over Belgian airspace. The Council of Ministers also rejected requests for Israeli military overflights.",
    sourceIds: ["belgium-sanctions-2025-09", "belgium-airspace-ban-2026-01"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-arms-flanders-court-2025-07",
    level: "regional",
    authority: "Brussels Court of First Instance (Flanders)",
    date: "2025-07",
    policy:
      "The Brussels Court of First Instance ordered the Flemish government to halt all transit to Israel of defense-related products unless there was firm assurance of exclusive civilian use, imposing a €50,000 fine per violation (up to €5 million). This created a de facto arms embargo through Flanders. The Flemish government appealed the ruling. This is a judicial order — not a policy enacted by the executive or legislature.",
    sourceIds: ["belgium-flanders-court-2025-07"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-arms-wallonia-block-2025-10",
    level: "regional",
    authority: "Walloon Government",
    date: "2025-10",
    policy:
      "Wallonia blocked a Swiss military shipment (antennas and radio frequency components from Swissto12 destined for Israeli defense firm Elbit Systems) at Liège Airport in October 2025. The shipment had no transit license. Wallonia's 2024 decree banning all transit of military material to Israel via Walloon airports was annulled by the Council of State in May 2025 for procedural reasons, but transit licensing requirements remain in force under the 2012 decree.",
    sourceIds: ["belgium-wallonia-block-2025-10"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-arms-federal-seizure-2026-04",
    level: "federal",
    authority: "Belgian Customs / Federal Government",
    date: "2026-04",
    policy:
      "Belgian authorities seized two British cargoes of military components (fire control systems and aircraft spare parts from Moog) at Liège Airport in April 2026, invoking the ban on military-laden aircraft using Belgian facilities or airspace. A criminal investigation was opened. This action demonstrates federal-level enforcement capability complementary to regional licensing authority.",
    sourceIds: ["belgium-seizure-2026-04"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── Humanitarian Aid ────────────────────────────────────────────────────────

export const belgiumHumanitarianAid: HumanitarianAidRecord[] = [
  {
    id: "belgium-aid-gaza-2025",
    recipient: "Gaza humanitarian response (multilateral)",
    amount: "€19.5 million (2025 total: €7 million + €12.5 million additional committed September 2025)",
    period: "2025",
    channel: "UN agencies and humanitarian organisations operating in Gaza",
    sourceIds: ["belgium-humanitarian-2025-09"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-aid-unrwa-2025-2026",
    recipient: "UNRWA — core funding and programme support",
    amount: "$10 million core contribution (2025–2026); €9 million programme support ('Support to UNRWA's Education, Health, Emergency Relief, and Digital Archiving Programmes')",
    period: "2025–2026",
    channel: "UNRWA — bilateral contribution",
    sourceIds: ["belgium-open-aid", "org-unrwa"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-aid-wfp-2025-2026",
    recipient: "World Food Programme — Immediate Response Account",
    amount: "€10 million",
    period: "2025–2026",
    channel: "WFP — bilateral contribution",
    sourceIds: ["belgium-open-aid", "org-wfp"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-aid-fao-2025",
    recipient: "FAO — Gaza farming and livestock support (SFERA)",
    amount: "$1 million",
    period: "2025",
    channel: "FAO Special Fund for Emergency and Rehabilitation Activities (SFERA)",
    sourceIds: ["belgium-open-aid"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-aid-ocha",
    recipient: "UN OCHA — general operating costs and oPt office",
    amount: "Unearmarked contribution (exact amount not specified in public data)",
    period: "2024–2026",
    channel: "UN OCHA — general and oPt-specific contributions; past contribution of €2 million to oPt Country-Based Pooled Fund (2023)",
    sourceIds: ["belgium-open-aid", "ocha-opt-main"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── Contact Routes ──────────────────────────────────────────────────────────

export const belgiumContactRoutes: ContactRouteRecord[] = [
  {
    id: "belgium-contact-federal-parliament",
    entity: "Belgian Federal Parliament — Chamber of Representatives and Senate",
    route:
      "Contact members of the Chamber of Representatives or Senate through the official parliamentary directory. Committee routes: Foreign Affairs Committee, Justice Committee (ICC/ICJ matters), Defence Committee (arms export scrutiny). Contact information is public — only use official parliamentary contact channels.",
    url: "https://www.dekamer.be/",
    notes:
      "Contact representatives about: enforcement of ICC arrest warrants, parliamentary review of arms transfers, humanitarian aid funding, Belgium's ICJ intervention follow-up. All contact should be polite, lawful, and non-harassing. Do not contact representatives at private addresses or personal phone numbers.",
    sourceIds: ["belgium-parliament-contact", "belgium-chamber", "belgium-senate"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-contact-fps-foreign-affairs",
    entity: "Belgian FPS Foreign Affairs — Minister of Foreign Affairs",
    route:
      "Contact the Minister of Foreign Affairs and the FPS Foreign Affairs through official channels listed on diplomatie.belgium.be. The FPS handles Belgium's diplomatic positions, ICC/ICJ cooperation, arms-export policy coordination, and humanitarian aid policy.",
    url: "https://diplomatie.belgium.be/en/contact",
    notes:
      "The Minister of Foreign Affairs is the primary federal contact for Belgium's positions on international accountability, sanctions, and diplomatic engagement. Contact should be through official public channels only.",
    sourceIds: ["belgium-fps-foreign-affairs"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-contact-regional-parliaments",
    entity: "Regional Parliaments — Flanders, Wallonia, Brussels-Capital",
    route:
      "Contact members of the Flemish Parliament, Walloon Parliament, or Brussels-Capital Region Parliament through their official websites. These parliaments hold scrutiny power over regional arms-export licensing — a key accountability pathway distinct from the federal parliament.",
    notes:
      "Regional parliaments are the appropriate contact point for arms-export licensing scrutiny — this is a regional competency. Federal parliament is the appropriate contact point for foreign policy, ICC/ICJ cooperation, and international treaty obligations — these are federal competencies. Do not confuse the two.",
    sourceIds: ["belgium-fps-foreign-affairs"],
    contentStatus: "review_pending",
    version: 1,
    correctionUrl: "/corrections",
  },
];
