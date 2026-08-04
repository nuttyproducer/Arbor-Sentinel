/**
 * Source-linked country accountability records for the countries added
 * during M7-02 content population.
 *
 * Mirrors the belgiumData.ts pattern: every factual position, vote,
 * arms-transfer, aid, or contact statement carries source IDs and is
 * marked reviewed. Federal/national competencies are distinguished from
 * regional, EU-level, or international competencies. No accountability
 * scores and no rankings.
 *
 * Where a specific figure or vote could not be verified against public
 * records, the record states that verification is required rather than
 * presenting the figure as established fact.
 */

import type {
  CountryPositionRecord,
  VoteRecord,
  ArmsTransferPolicyRecord,
  HumanitarianAidRecord,
  ContactRouteRecord,
} from "../types/content";

// ── Netherlands ─────────────────────────────────────────────────────────────

export const netherlandsPositions: CountryPositionRecord[] = [
  {
    id: "netherlands-position-f35-export-litigation",
    area: "Arms exports — judicial review of F-35 parts export",
    position:
      "The Netherlands' arms-export policy towards Israel was challenged in court by NGOs (Oxfam Novib, PAX, The Rights Forum). In February 2024 the Hague District Court ordered the State to halt exports of F-35 fighter jet parts to Israel, finding a clear risk of serious IHL violations. The Court of Appeal reversed that ruling in September 2024, holding that the State's policy assessment was entitled to considerable judicial deference. The case illustrates the limits of judicial review of arms-export licensing.",
    attribution: "Hague District Court / Hague Court of Appeal",
    date: "2024-09-12",
    sourceIds: ["nl-hague-district-court-f35-2024-02", "nl-hague-court-appeal-f35-2024-09"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const netherlandsVotes: VoteRecord[] = [
  {
    id: "netherlands-vote-unga-es10-24-2024",
    body: "United Nations General Assembly",
    resolution: "ES-10/24 — implementation of the ICJ advisory opinion on the illegality of the occupation",
    date: "2024-09-18",
    vote: "yes",
    sourceIds: ["un-unga-es10-24-2024-09"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const netherlandsArmsTransferPolicies: ArmsTransferPolicyRecord[] = [
  {
    id: "netherlands-arms-f35-export-litigation",
    level: "federal",
    authority: "Dutch State — Ministry of Economic Affairs / Ministry of Foreign Affairs",
    date: "2024-09-12",
    policy:
      "The F-35 parts export to Israel continued after the Court of Appeal reversed the District Court's February 2024 halt order. The case assessed the export against the Arms Trade Treaty and EU Common Position 2008/944/CFSP criteria. Further cassation proceedings by the NGO plaintiffs were pursued before the Dutch Supreme Court.",
    sourceIds: ["nl-hague-district-court-f35-2024-02", "nl-hague-court-appeal-f35-2024-09"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const netherlandsHumanitarianAid: HumanitarianAidRecord[] = [
  {
    id: "netherlands-aid-gaza-2024",
    recipient: "Gaza humanitarian response",
    amount: "Bilateral humanitarian commitments through UN and humanitarian channels (exact 2024–2025 amount requires verification)",
    period: "2024–2025",
    channel: "UN agencies and humanitarian organisations operating in Gaza",
    sourceIds: ["ocha-opt-main"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const netherlandsContactRoutes: ContactRouteRecord[] = [
  {
    id: "netherlands-contact-tweede-kamer",
    entity: "Dutch House of Representatives (Tweede Kamer der Staten-Generaal)",
    route:
      "Contact members of the House of Representatives through the official parliamentary website. Relevant committees: Foreign Affairs Committee, Defence Committee, and Foreign Trade and Development Cooperation Committee. Constituents can submit written questions to ministers through their representatives.",
    url: "https://www.tweedekamer.nl/",
    notes:
      "Contact representatives about: arms-export licensing and the F-35 case follow-up, humanitarian aid funding, and the Netherlands' positions at the UN and in the EU. All contact should be polite, lawful, and non-harassing.",
    sourceIds: ["nl-hague-district-court-f35-2024-02"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── Spain ───────────────────────────────────────────────────────────────────

export const spainPositions: CountryPositionRecord[] = [
  {
    id: "spain-position-recognition-and-trade-measures",
    area: "Palestine recognition, settlement trade ban, and arms policy",
    position:
      "Spain formally recognised the State of Palestine on 28 May 2024 and has suspended purchases of goods and services from Israeli settlements. The Spanish government announced a halt to arms sales to Israel and voted in favour of UN General Assembly resolutions on a ceasefire and implementation of the ICJ advisory opinion.",
    attribution: "Government of Spain — Ministry of Foreign Affairs",
    date: "2024-05-28",
    sourceIds: ["spain-palestine-recognition-2024-05", "es-gov-settlement-ban-2024"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const spainVotes: VoteRecord[] = [
  {
    id: "spain-vote-unga-es10-24-2024",
    body: "United Nations General Assembly",
    resolution: "ES-10/24 — implementation of the ICJ advisory opinion on the illegality of the occupation",
    date: "2024-09-18",
    vote: "yes",
    sourceIds: ["un-unga-es10-24-2024-09"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const spainArmsTransferPolicies: ArmsTransferPolicyRecord[] = [
  {
    id: "spain-arms-halt-2024",
    level: "federal",
    authority: "Government of Spain",
    date: "2024-05",
    policy:
      "Spain announced the suspension of arms sales to Israel in May 2024 and has suspended purchases from companies operating in Israeli settlements. The measures implement Spain's interpretation of international law, including the illegality of settlements under the Fourth Geneva Convention.",
    sourceIds: ["spain-palestine-recognition-2024-05", "es-gov-settlement-ban-2024"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const spainHumanitarianAid: HumanitarianAidRecord[] = [
  {
    id: "spain-aid-gaza-2024",
    recipient: "UNRWA and Gaza humanitarian response",
    amount: "Additional humanitarian contributions following the recognition decision (exact 2024 amount requires verification)",
    period: "2024",
    channel: "UNRWA and UN humanitarian channels",
    sourceIds: ["es-gov-settlement-ban-2024", "org-unrwa"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const spainContactRoutes: ContactRouteRecord[] = [
  {
    id: "spain-contact-congreso",
    entity: "Congress of Deputies (Congreso de los Diputados)",
    route:
      "Contact members of the Congress of Deputies through the official parliamentary website. Relevant committees: Foreign Affairs Committee, Defence Committee, and International Development Cooperation Committee.",
    url: "https://www.congreso.es/",
    notes:
      "Contact representatives about: implementation of the Palestine recognition decision, arms-transfer policy, settlement trade measures, and humanitarian funding. All contact should be polite, lawful, and non-harassing.",
    sourceIds: ["es-gov-settlement-ban-2024"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── Ireland ─────────────────────────────────────────────────────────────────

export const irelandPositions: CountryPositionRecord[] = [
  {
    id: "ireland-position-recognition-and-icj-intervention",
    area: "Palestine recognition and ICJ intervention",
    position:
      "Ireland formally recognised the State of Palestine on 28 May 2024 and filed a declaration of intervention under Article 63 of the ICJ Statute in the South Africa v. Israel Genocide Convention case in January 2025. Dáil Éireann has held repeated debates on Gaza, and Ireland has increased humanitarian funding for the Palestinian people.",
    attribution: "Government of Ireland — Department of Foreign Affairs",
    date: "2024-05-28",
    sourceIds: ["ireland-palestine-recognition-2024-05", "ie-dail-gaza-2024"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const irelandVotes: VoteRecord[] = [
  {
    id: "ireland-vote-unga-es10-24-2024",
    body: "United Nations General Assembly",
    resolution: "ES-10/24 — implementation of the ICJ advisory opinion on the illegality of the occupation",
    date: "2024-09-18",
    vote: "yes",
    sourceIds: ["un-unga-es10-24-2024-09"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const irelandArmsTransferPolicies: ArmsTransferPolicyRecord[] = [
  {
    id: "ireland-arms-export-controls",
    level: "federal",
    authority: "Government of Ireland — Department of Enterprise, Trade and Employment",
    date: "2024",
    policy:
      "Ireland applies restrictive arms-export controls under the Control of Exports Act 2008 and the EU Common Position 2008/944/CFSP, and has not been a significant arms exporter to Israel. Its licensing record is subject to annual reporting to the EU.",
    sourceIds: ["eu-common-position-2008-944"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const irelandHumanitarianAid: HumanitarianAidRecord[] = [
  {
    id: "ireland-aid-gaza-2024",
    recipient: "Gaza humanitarian response",
    amount: "Increased humanitarian funding announced alongside recognition (exact 2024 amount requires verification)",
    period: "2024",
    channel: "UN and humanitarian organisations operating in Gaza",
    sourceIds: ["ie-dail-gaza-2024"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const irelandContactRoutes: ContactRouteRecord[] = [
  {
    id: "ireland-contact-oireachtas",
    entity: "Houses of the Oireachtas (Irish Parliament)",
    route:
      "Contact members of Dáil Éireann and Seanad Éireann through the official parliamentary website. Relevant committees: Committee on Foreign Affairs and Defence and the Joint Committee on European Union Affairs.",
    url: "https://www.oireachtas.ie/",
    notes:
      "Contact representatives about: Ireland's ICJ intervention follow-up, humanitarian funding, and the implementation of the recognition decision. All contact should be polite, lawful, and non-harassing.",
    sourceIds: ["ie-dail-gaza-2024"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── Norway ──────────────────────────────────────────────────────────────────

export const norwayPositions: CountryPositionRecord[] = [
  {
    id: "norway-position-recognition",
    area: "Palestine recognition",
    position:
      "Norway formally recognised the State of Palestine on 28 May 2024, acting alongside Spain and Ireland. Norway is a significant humanitarian donor to Gaza and UNRWA and voted in favour of UN General Assembly resolutions on a ceasefire and implementation of the ICJ advisory opinion.",
    attribution: "Government of Norway — Ministry of Foreign Affairs",
    date: "2024-05-28",
    sourceIds: ["norway-palestine-recognition-2024-05"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const norwayVotes: VoteRecord[] = [
  {
    id: "norway-vote-unga-es10-24-2024",
    body: "United Nations General Assembly",
    resolution: "ES-10/24 — implementation of the ICJ advisory opinion on the illegality of the occupation",
    date: "2024-09-18",
    vote: "yes",
    sourceIds: ["un-unga-es10-24-2024-09"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const norwayArmsTransferPolicies: ArmsTransferPolicyRecord[] = [
  {
    id: "norway-arms-export-controls",
    level: "federal",
    authority: "Government of Norway — Ministry of Foreign Affairs",
    date: "2024",
    policy:
      "Norway applies national arms-export control criteria consistent with the Arms Trade Treaty and is not a significant arms exporter to Israel. Its licensing decisions require risk assessment for IHL violations.",
    sourceIds: ["arms-trade-treaty"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const norwayHumanitarianAid: HumanitarianAidRecord[] = [
  {
    id: "norway-aid-gaza-2024",
    recipient: "Gaza humanitarian response and UNRWA",
    amount: "Major humanitarian donor (exact 2024–2025 amounts require verification)",
    period: "2024–2025",
    channel: "UNRWA and UN humanitarian channels",
    sourceIds: ["unrwa-gaza-emergency-2025", "org-unrwa"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const norwayContactRoutes: ContactRouteRecord[] = [
  {
    id: "norway-contact-storting",
    entity: "Storting (Norwegian Parliament)",
    route:
      "Contact members of the Storting through the official parliamentary website. Relevant committees: Standing Committee on Foreign Affairs and Defence and the Standing Committee on Scrutiny and Constitutional Affairs.",
    url: "https://www.stortinget.no/",
    notes:
      "Contact representatives about: implementation of the recognition decision, humanitarian funding, and Norway's positions at the UN. All contact should be polite, lawful, and non-harassing.",
    sourceIds: ["norway-palestine-recognition-2024-05"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── United Kingdom ──────────────────────────────────────────────────────────

export const unitedKingdomPositions: CountryPositionRecord[] = [
  {
    id: "uk-position-arms-licence-suspension",
    area: "Arms exports — licence suspension",
    position:
      "The UK government suspended around 30 of 350 arms export licences to Israel in September 2024 after a review found a clear risk the items could be used in serious violations of international humanitarian law. The decision was announced to Parliament. The UK's voting record on UN General Assembly ceasefire resolutions has varied by resolution and requires per-resolution verification.",
    attribution: "UK Foreign, Commonwealth and Development Office",
    date: "2024-09-02",
    sourceIds: ["uk-fcdo-arms-2024-09"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const unitedKingdomVotes: VoteRecord[] = [
  {
    id: "uk-vote-unga-es10-22-2023",
    body: "United Nations General Assembly",
    resolution: "ES-10/22 — protection of civilians and upholding legal and humanitarian obligations",
    date: "2023-12-12",
    vote: "yes",
    sourceIds: ["un-unga-es10-22-2023-12"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const unitedKingdomArmsTransferPolicies: ArmsTransferPolicyRecord[] = [
  {
    id: "uk-arms-licence-suspension-2024",
    level: "federal",
    authority: "UK Foreign, Commonwealth and Development Office",
    date: "2024-09-02",
    policy:
      "The UK suspended approximately 30 arms export licences to Israel following a review under the Strategic Export Licensing Criteria, which reflect the EU Common Position and the Arms Trade Treaty. The suspension covered items usable in the Gaza conflict; F-35 components supplied through a global joint-strike-fighter arrangement were excluded.",
    sourceIds: ["uk-fcdo-arms-2024-09"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const unitedKingdomHumanitarianAid: HumanitarianAidRecord[] = [
  {
    id: "uk-aid-gaza-2024",
    recipient: "Gaza humanitarian response",
    amount: "Increased humanitarian aid announced alongside the licence review (exact 2024 amount requires verification)",
    period: "2024",
    channel: "UN and humanitarian organisations operating in Gaza",
    sourceIds: ["uk-fcdo-arms-2024-09"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const unitedKingdomContactRoutes: ContactRouteRecord[] = [
  {
    id: "uk-contact-parliament",
    entity: "UK Parliament — House of Commons and House of Lords",
    route:
      "Contact your Member of Parliament through the official Parliament website. Relevant committees: Foreign Affairs Committee, International Development Committee, and the Committees on Arms Export Controls.",
    url: "https://www.parliament.uk/",
    notes:
      "Contact representatives about: arms-export licensing and the September 2024 suspension, humanitarian funding, and the UK's positions at the UN. All contact should be polite, lawful, and non-harassing.",
    sourceIds: ["uk-fcdo-arms-2024-09"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── France ──────────────────────────────────────────────────────────────────

export const francePositions: CountryPositionRecord[] = [
  {
    id: "france-position-recognition-initiative",
    area: "Palestine recognition initiative and two-state solution",
    position:
      "France co-signed the New York Declaration with Belgium and Saudi Arabia in September 2025, signalling a coordinated approach to recognising the State of Palestine. France has called for a two-state solution and voted in favour of UN General Assembly resolutions calling for a humanitarian ceasefire.",
    attribution: "Government of France — Ministry for Europe and Foreign Affairs",
    date: "2025-09",
    sourceIds: ["france-recognition-initiative-2025-09"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const franceVotes: VoteRecord[] = [
  {
    id: "france-vote-unga-es10-21-2023",
    body: "United Nations General Assembly",
    resolution: "ES-10/21 — immediate, durable and sustained humanitarian truce",
    date: "2023-10-27",
    vote: "yes",
    sourceIds: ["un-unga-es10-21-2023"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const franceArmsTransferPolicies: ArmsTransferPolicyRecord[] = [
  {
    id: "france-arms-policy",
    level: "federal",
    authority: "Government of France — Ministry of Armed Forces / Ministry for Europe and Foreign Affairs",
    date: "2024",
    policy:
      "France has called for an immediate ceasefire and a two-state solution. Its position on arms transfers to Israel requires verification against current French export-licensing records, which are subject to parliamentary oversight under the Code de la défense.",
    sourceIds: ["france-recognition-initiative-2025-09"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const franceHumanitarianAid: HumanitarianAidRecord[] = [
  {
    id: "france-aid-gaza-2024",
    recipient: "Gaza humanitarian response",
    amount: "Humanitarian aid provided through UN and EU channels (exact 2024–2025 amounts require verification)",
    period: "2024–2025",
    channel: "UN agencies and EU humanitarian mechanisms",
    sourceIds: ["france-recognition-initiative-2025-09", "eu-echo-hip-2025"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const franceContactRoutes: ContactRouteRecord[] = [
  {
    id: "france-contact-assemblee",
    entity: "French National Assembly (Assemblée nationale)",
    route:
      "Contact members of the National Assembly through the official parliamentary website. Relevant committees: Foreign Affairs Committee, National Defence and Armed Forces Committee, and the Sustainable Development Committee.",
    url: "https://www.assemblee-nationale.fr/",
    notes:
      "Contact representatives about: the recognition initiative, arms-transfer policy, humanitarian funding, and France's positions at the UN and EU. All contact should be polite, lawful, and non-harassing.",
    sourceIds: ["france-recognition-initiative-2025-09"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── Germany ─────────────────────────────────────────────────────────────────

export const germanyPositions: CountryPositionRecord[] = [
  {
    id: "germany-position-icj-intervention",
    area: "ICJ Genocide Convention case — Article 63 intervention",
    position:
      "Germany filed a declaration of intervention under Article 63 of the ICJ Statute in the South Africa v. Israel Genocide Convention case in January 2025, taking a position on the interpretation of the Convention that rejects the genocide allegation. Germany temporarily suspended then resumed UNRWA funding and has been a major provider of humanitarian aid, while maintaining that Israel's right to self-defence must be respected.",
    attribution: "Federal Republic of Germany",
    date: "2025-01",
    sourceIds: ["germany-icj-intervention-2025-01"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const germanyVotes: VoteRecord[] = [
  {
    id: "germany-vote-unga-es10-22-2023",
    body: "United Nations General Assembly",
    resolution: "ES-10/22 — protection of civilians and upholding legal and humanitarian obligations",
    date: "2023-12-12",
    vote: "yes",
    sourceIds: ["un-unga-es10-22-2023-12"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const germanyArmsTransferPolicies: ArmsTransferPolicyRecord[] = [
  {
    id: "germany-arms-policy",
    level: "federal",
    authority: "Government of Germany — Federal Foreign Office / Federal Ministry for Economic Affairs",
    date: "2024",
    policy:
      "Germany's arms-export policy towards Israel has been the subject of Bundestag debate and legal challenge. Specific licensing decisions and their risk assessments require verification against official German export records, which are published in part through annual arms-export reports.",
    sourceIds: ["germany-icj-intervention-2025-01"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const germanyHumanitarianAid: HumanitarianAidRecord[] = [
  {
    id: "germany-aid-unrwa-gaza-2024",
    recipient: "UNRWA and Gaza humanitarian response",
    amount: "Germany temporarily suspended then resumed UNRWA funding in 2024; exact amounts require verification",
    period: "2024",
    channel: "UNRWA and UN humanitarian channels",
    sourceIds: ["unrwa-gaza-emergency-2025", "org-unrwa"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const germanyContactRoutes: ContactRouteRecord[] = [
  {
    id: "germany-contact-bundestag",
    entity: "German Bundestag",
    route:
      "Contact members of the Bundestag through the official parliamentary website. Relevant committees: Foreign Affairs Committee, Defence Committee, and the Committee on Human Rights and Humanitarian Aid.",
    url: "https://www.bundestag.de/",
    notes:
      "Contact representatives about: the ICJ intervention, arms-export policy, humanitarian funding, and Germany's positions at the UN and EU. All contact should be polite, lawful, and non-harassing.",
    sourceIds: ["germany-icj-intervention-2025-01"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── South Africa ────────────────────────────────────────────────────────────

export const southAfricaPositions: CountryPositionRecord[] = [
  {
    id: "south-africa-position-icj-application",
    area: "ICJ Genocide Convention case — applicant state",
    position:
      "South Africa instituted proceedings against Israel before the International Court of Justice on 29 December 2023, alleging violations of the Genocide Convention, and has led the case that has resulted in three binding provisional measures orders. South Africa voted in favour of UN General Assembly resolutions on a ceasefire and implementation of the ICJ advisory opinion.",
    attribution: "Republic of South Africa",
    date: "2023-12-29",
    sourceIds: ["south-africa-icj-application-2023-12"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const southAfricaVotes: VoteRecord[] = [
  {
    id: "south-africa-vote-unga-es10-24-2024",
    body: "United Nations General Assembly",
    resolution: "ES-10/24 — implementation of the ICJ advisory opinion on the illegality of the occupation",
    date: "2024-09-18",
    vote: "yes",
    sourceIds: ["un-unga-es10-24-2024-09"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const southAfricaArmsTransferPolicies: ArmsTransferPolicyRecord[] = [
  {
    id: "south-africa-accountability-measures",
    level: "federal",
    authority: "Government of South Africa",
    date: "2023-12-29",
    policy:
      "South Africa has pursued diplomatic and legal accountability measures — principally the ICJ Genocide Convention case — rather than arms-transfer measures. South Africa is not a significant arms exporter to Israel.",
    sourceIds: ["south-africa-icj-application-2023-12"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const southAfricaHumanitarianAid: HumanitarianAidRecord[] = [
  {
    id: "south-africa-aid-gaza-2024",
    recipient: "Gaza humanitarian response",
    amount: "Humanitarian support through bilateral and multilateral channels (exact amounts require verification)",
    period: "2024",
    channel: "Bilateral and multilateral humanitarian channels",
    sourceIds: ["south-africa-icj-application-2023-12"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

export const southAfricaContactRoutes: ContactRouteRecord[] = [
  {
    id: "south-africa-contact-parliament",
    entity: "Parliament of the Republic of South Africa",
    route:
      "Contact members of the National Assembly and the National Council of Provinces through the official parliamentary website. Relevant committees: International Relations and Cooperation Committee and the Joint Standing Committee on Defence.",
    url: "https://www.parliament.gov.za/",
    notes:
      "Contact representatives about: South Africa's ICJ case, diplomatic positions on the conflict, and humanitarian support. All contact should be polite, lawful, and non-harassing.",
    sourceIds: ["south-africa-icj-application-2023-12"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];
