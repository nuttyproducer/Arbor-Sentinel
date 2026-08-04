import type { LegalStatus, VerificationLevel, ContentStatus } from "../types/content";

export interface LegalCaseEntry {
  id: string;
  slug: string;
  title: string;
  institution: string;
  jurisdiction: string;
  parties: string[];
  summary: string;
  legalStatuses: LegalStatus[];
  openedDate?: string;
  latestVerifiedUpdateDate?: string;
  nextMilestone?: string;
  legalBasisOrAllegedCrimes?: string;
  actionRelevance?: string;
  sourceIds: string[];
  sourceQuality: VerificationLevel;
  contentStatus: ContentStatus;
  lastReviewedAt?: string;
  reviewedByRole?: string;
  version: number;
  proceduralNote?: string;
  correctionUrl: string;
}

export const legalCases: LegalCaseEntry[] = [
  {
    id: "icj-genocide-convention",
    slug: "icj-genocide-convention",
    title: "Application of the Genocide Convention (South Africa v. Israel)",
    institution: "International Court of Justice (ICJ)",
    jurisdiction: "International — United Nations principal judicial organ",
    parties: ["South Africa", "Israel"],
    summary:
      "South Africa instituted proceedings against Israel alleging violations of the Genocide Convention. The ICJ has issued three provisional measures orders (26 January 2024, 28 March 2024, 24 May 2024). Twenty-plus states have filed declarations of intervention or applications to intervene. The case is in the written proceedings phase — no final judgment has been rendered.",
    legalStatuses: [
      "court_proceeding_active",
      "provisional_measures_issued",
    ],
    openedDate: "2023-12-29",
    latestVerifiedUpdateDate: "2026-05-21",
    nextMilestone: "Written proceedings: South Africa's Reply and Israel's Rejoinder; time-limits fixed by Order of 21 May 2026",
    legalBasisOrAllegedCrimes:
      "Alleged violations of the Convention on the Prevention and Punishment of the Crime of Genocide (1948)",
    actionRelevance:
      "Provisional measures are binding under international law. Member states may submit interventions or make declarations of intervention under Articles 62 and 63 of the Court's Statute.",
    sourceIds: [
      "icj-2024-01-26",
      "icj-2024-03-28",
      "icj-2024-05-24",
      "icj-case-192",
      "icj-2026-05-21",
      "icj-interventions-2025-2026",
    ],
    sourceQuality: 5,
    contentStatus: "review_pending",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Static beta — editorial review pending; sourceIds expanded with 2025–2026 procedural developments and intervention records",
    version: 1,
    proceduralNote:
      "Provisional measures are binding orders issued before a final judgment. They do not constitute a final ruling on the merits of the case. Interventions under Article 63 concern the construction of the Genocide Convention — they do not constitute rulings on whether violations have occurred. The case remains in the written proceedings phase as of July 2026.",
    correctionUrl: "/corrections",
  },
  {
    id: "icc-palestine-situation",
    slug: "icc-palestine-situation",
    title: "Situation in the State of Palestine",
    institution: "International Criminal Court (ICC)",
    jurisdiction: "International — Rome Statute, State of Palestine referral",
    parties: ["Office of the Prosecutor", "State of Palestine"],
    summary:
      "The ICC Office of the Prosecutor opened an investigation into the Situation in the State of Palestine. In November 2024, Pre-Trial Chamber I issued arrest warrants for Benjamin Netanyahu, Yoav Gallant, and Mohammed Deif. The warrant for Deif was terminated in February 2025 following confirmation of his death. The warrants for Netanyahu and Gallant remain active. The proceedings address alleged crimes within the Court's jurisdiction.",
    legalStatuses: ["arrest_warrant_issued"],
    openedDate: "2021-03-03",
    latestVerifiedUpdateDate: "2025-02",
    nextMilestone: "Further judicial proceedings pending; ASP special session on Prosecutor leadership scheduled 24 July 2026",
    legalBasisOrAllegedCrimes:
      "Alleged war crimes and crimes against humanity within the Court's jurisdiction under the Rome Statute",
    actionRelevance:
      "ICC arrest warrants are binding on all States Parties to the Rome Statute. States Parties have a duty to cooperate with the Court. The ICC prosecutes individuals — arrest warrants are not convictions and all persons are presumed innocent until proven guilty.",
    sourceIds: [
      "icc-palestine-2024",
      "icc-arrest-warrants-2024-11",
      "icc-deif-warrant-cancelled-2025",
      "icc-khan-2025-2026",
    ],
    sourceQuality: 5,
    contentStatus: "review_pending",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Static beta — editorial review pending; sourceIds expanded with Deif warrant termination and Prosecutor leadership status",
    version: 1,
    proceduralNote:
      "The ICC prosecutes individuals, not states. Arrest warrants are issued by Pre-Trial Chambers and are subject to judicial review. All persons are presumed innocent until proven guilty. The termination of proceedings against Mohammed Deif is a procedural consequence of confirmed death — it does not constitute an acquittal or a finding on the merits of the charges.",
    correctionUrl: "/corrections",
  },
  {
    id: "un-coi-opt",
    slug: "un-coi-opt",
    title:
      "UN Commission of Inquiry on the Occupied Palestinian Territory, including East Jerusalem, and Israel",
    institution: "United Nations Human Rights Council",
    jurisdiction: "International — United Nations Human Rights Council mandate",
    parties: [
      "Independent International Commission of Inquiry",
      "UN Human Rights Council",
    ],
    summary:
      "The Independent International Commission of Inquiry has published multiple reports documenting findings related to international humanitarian law, human rights law, and alleged violations by all parties. In June 2026, the Commission published a 100-page specialised report focused on violations and crimes committed against Palestinian children from 7 October 2023 to 31 March 2026. The Commission found that Israeli authorities deliberately targeted Palestinian children, substantiating its earlier finding that Israel committed genocide in Gaza. Reports are publicly available through OHCHR.",
    legalStatuses: ["un_finding"],
    openedDate: "2021-05-27",
    latestVerifiedUpdateDate: "2026-06-23",
    nextMilestone: "Periodic reporting to UN Human Rights Council and UN General Assembly",
    legalBasisOrAllegedCrimes:
      "Mandate to investigate alleged violations of international humanitarian law and international human rights law by all parties",
    actionRelevance:
      "UN COI findings inform international accountability processes and may be referenced in court proceedings or UN resolutions. The Commission's findings are attributed to the Commission — they are fact-finding outputs, not judicial rulings.",
    sourceIds: [
      "un-coi-2024",
      "un-coi-unga-2024",
      "un-coi-2026-children",
    ],
    sourceQuality: 4,
    contentStatus: "review_pending",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Static beta — editorial review pending; sourceIds expanded with September 2024 UNGA report and June 2026 children report",
    version: 1,
    proceduralNote:
      "UN Commissions of Inquiry are fact-finding bodies. Their findings inform international accountability processes but are not judicial rulings. The Commission's June 2026 finding that acts constitute genocide, crimes against humanity, and war crimes is attributed to the Commission, not to Accountability Atlas. The platform reports the Commission's public findings — it does not independently verify or endorse them.",
    correctionUrl: "/corrections",
  },
  {
    id: "icj-advisory-opinion-occupation",
    slug: "icj-advisory-opinion-occupation",
    title:
      "Legal Consequences arising from the Policies and Practices of Israel in the Occupied Palestinian Territory, including East Jerusalem (Advisory Opinion)",
    institution: "International Court of Justice (ICJ)",
    jurisdiction: "International — United Nations General Assembly request (A/RES/77/247)",
    parties: ["International Court of Justice", "United Nations General Assembly", "52 written statements"],
    summary:
      "The UN General Assembly requested an advisory opinion on the legal consequences of Israel's occupation and settlement policies. In its opinion of 19 July 2024, the ICJ found that Israel's continued presence in the Occupied Palestinian Territory is unlawful, that Israel must end it promptly, cease new settlement activity, and make reparation, and that all states and international organisations must not recognize the occupation as lawful or render aid or assistance in maintaining it. The opinion found the transfer of settlers into the occupied territory violates Article 49 of the Fourth Geneva Convention.",
    legalStatuses: ["un_finding"],
    openedDate: "2022-12-30",
    latestVerifiedUpdateDate: "2024-07-19",
    nextMilestone: "Implementation and follow-up before the UN General Assembly; states and UN bodies citing the opinion in their own decisions",
    legalBasisOrAllegedCrimes:
      "Interpretation of the UN Charter, the Fourth Geneva Convention (1949), the International Covenant on Civil and Political Rights, and the International Convention on the Elimination of All Forms of Racial Discrimination",
    actionRelevance:
      "The advisory opinion is authoritative guidance on the law. States have invoked it to justify measures such as settlement-goods bans and arms-export restrictions. Advisory opinions are not directly enforceable, but they carry significant legal weight and are cited by courts, UN bodies, and states.",
    sourceIds: [
      "icj-advisory-opinion-2024-07",
      "belgium-settlement-ban-2026-07",
      "es-gov-settlement-ban-2024",
    ],
    sourceQuality: 5,
    contentStatus: "reviewed",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    proceduralNote:
      "An advisory opinion is not a judgment in a contentious case. It is an authoritative statement of the law provided at the request of the General Assembly and is not binding in the same way as a judgment between litigating states. The opinion's legal findings have nonetheless been relied on by states and international bodies. This entry tracks the advisory opinion as a legal record, not as an enforceable ruling.",
    correctionUrl: "/corrections",
  },
  {
    id: "nl-f35-export-case",
    slug: "nl-f35-export-case",
    title: "Oxfam Novib, PAX and The Rights Forum v. State of the Netherlands (F-35 parts export)",
    institution: "Dutch courts — District Court and Court of Appeal of The Hague",
    jurisdiction: "Netherlands — national courts",
    parties: ["Oxfam Novib", "PAX", "The Rights Forum", "State of the Netherlands"],
    summary:
      "NGOs challenged the Dutch State's continued export of F-35 fighter jet parts to Israel. On 12 February 2024, the Hague District Court ordered the State to halt the exports within seven days, finding a clear risk of serious IHL violations. On 12 September 2024, the Hague Court of Appeal reversed that ruling, holding that the State's policy assessment was entitled to considerable judicial deference. The case illustrates the limits of judicial review of arms-export licensing under the Arms Trade Treaty and EU Common Position.",
    legalStatuses: ["court_proceeding_active"],
    openedDate: "2023-12-04",
    latestVerifiedUpdateDate: "2024-09-12",
    nextMilestone: "Further cassation proceedings by the NGO plaintiffs before the Dutch Supreme Court",
    legalBasisOrAllegedCrimes:
      "Review of arms-export licensing against the Arms Trade Treaty (Article 6–7), EU Common Position 2008/944/CFSP, and international humanitarian law obligations",
    actionRelevance:
      "The case is a model of civil-society legal challenge to arms-export decisions and has been cited in debates in other countries, including Belgium, on the scope of judicial review of licensing decisions.",
    sourceIds: [
      "nl-hague-district-court-f35-2024-02",
      "nl-hague-court-appeal-f35-2024-09",
    ],
    sourceQuality: 5,
    contentStatus: "reviewed",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    proceduralNote:
      "The two rulings are national court decisions on the standard of judicial review of arms-export licensing. Neither ruling determines whether IHL violations are occurring in Gaza — the District Court found a 'clear risk' of such violations, and the Court of Appeal held that the State's contrary assessment could not be regarded as clearly incorrect. Proceedings continue before the Dutch Supreme Court.",
    correctionUrl: "/corrections",
  },
  {
    id: "be-flemish-arms-transit-case",
    slug: "be-flemish-arms-transit-case",
    title: "Vredesactie and others v. Flemish Region (arms transit to Israel)",
    institution: "Brussels Court of First Instance",
    jurisdiction: "Belgium — national court (regional competence)",
    parties: ["Vredesactie", "11.11.11", "League for Human Rights", "Flemish Region"],
    summary:
      "In July 2025, the Brussels Court of First Instance ordered the Flemish government to halt all transit to Israel of defence-related products unless there was firm assurance of exclusive civilian use, imposing a €50,000 fine per violation up to €5 million. The order created a de facto arms embargo through Flanders, the main transit route for defence goods. The Flemish government appealed. The case concerns the scope of regional competence over arms transit under Belgian federalism.",
    legalStatuses: ["court_proceeding_active"],
    openedDate: "2024-11",
    latestVerifiedUpdateDate: "2025-07",
    nextMilestone: "Appeal proceedings before the Brussels Court of Appeal",
    legalBasisOrAllegedCrimes:
      "Review of arms-transit licensing against EU Common Position 2008/944/CFSP, the Arms Trade Treaty, and the risk of serious IHL violations",
    actionRelevance:
      "The case is a landmark national ruling linking regional arms-transit licensing to IHL risk assessment in Belgium, and it contributed to subsequent federal enforcement actions, including customs seizures at Liège Airport.",
    sourceIds: [
      "belgium-flanders-court-2025-07",
      "belgium-seizure-2026-04",
      "belgium-wallonia-block-2025-10",
    ],
    sourceQuality: 5,
    contentStatus: "reviewed",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    proceduralNote:
      "The order is an interim decision of a first-instance court. The Flemish government's appeal is pending; the ruling does not constitute a final determination on the merits and has been described as creating a de facto embargo while it remains in force.",
    correctionUrl: "/corrections",
  },
  {
    id: "be-airspace-arms-case",
    slug: "be-airspace-arms-case",
    title: "Legal challenge concerning Belgium's failure to prevent military air cargo to Israel",
    institution: "Brussels Court of Appeal",
    jurisdiction: "Belgium — national courts",
    parties: ["NGO plaintiffs", "Belgian State (Federal Government)"],
    summary:
      "In March 2025, the Brussels Court of Appeal ruled that Belgium had been at fault for not taking timely measures to prevent flights carrying military equipment to Israel from using Belgian airports and airspace. The ruling contributed to the adoption of a royal decree on 18 January 2026 prohibiting such flights, and to subsequent customs seizures of military cargo bound for Israel. The case concerns Belgium's obligations as a state under IHL to avoid facilitating serious violations.",
    legalStatuses: ["court_proceeding_active"],
    openedDate: "2024",
    latestVerifiedUpdateDate: "2026-01-18",
    nextMilestone: "Implementation and enforcement of the royal decree; any further challenges before the Council of State",
    legalBasisOrAllegedCrimes:
      "Belgian state responsibility for facilitating arms transfers in circumstances creating a risk of IHL violations; consistency with the EU Common Position and Arms Trade Treaty",
    actionRelevance:
      "The case is a national precedent on state responsibility for facilitating arms transfers and on the duty to take timely preventive measures. It directly informed Belgium's 2025 sanctions package and 2026 airspace and settlement-goods measures.",
    sourceIds: [
      "be-brussels-court-appeal-airspace-2025-03",
      "belgium-airspace-ban-2026-01",
      "belgium-sanctions-2025-09",
    ],
    sourceQuality: 5,
    contentStatus: "reviewed",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    proceduralNote:
      "The Court of Appeal's finding that Belgium was at fault is a national court determination on state conduct. It is not a determination that IHL violations occurred in Gaza, and it does not engage the responsibility of parties to the conflict. Enforcement of the resulting measures continues.",
    correctionUrl: "/corrections",
  },
  {
    id: "eu-association-agreement-suspension",
    slug: "eu-association-agreement-suspension",
    title:
      "EU-Israel Association Agreement — Article 2 review and proposed partial suspension (2025–2026)",
    institution: "European Commission and Council of the European Union",
    jurisdiction: "European Union",
    parties: ["European Commission", "High Representative", "Council of the European Union", "State of Israel"],
    summary:
      "In June 2025, the High Representative presented a review to the Foreign Affairs Council concluding there were indications Israel was in breach of Article 2 of the EU-Israel Association Agreement, which makes respect for human rights and democratic principles an essential element. In September 2025, the European Commission proposed the partial suspension of trade-related provisions of the Agreement, alongside reinforced sanctions. The proposal requires a qualified majority in the Council. The European Parliament adopted a resolution supporting suspension.",
    legalStatuses: ["allegation_under_investigation"],
    openedDate: "2024-11",
    latestVerifiedUpdateDate: "2025-09-17",
    nextMilestone: "Council decision on the Commission's proposal to partially suspend trade-related provisions (requires qualified majority)",
    legalBasisOrAllegedCrimes:
      "EU-Israel Association Agreement (2000), Article 2 (essential elements — human rights and democratic principles); Article 7 TEU procedures; suspension mechanism under the Agreement",
    actionRelevance:
      "A decision to suspend the Association Agreement would condition EU trade preferences on compliance with IHL and human rights, and is a lawful mechanism for EU accountability action available to member states and EU institutions.",
    sourceIds: [
      "eu-israel-association-agreement",
      "eu-commission-association-review-2025-06",
      "eu-commission-sanctions-proposal-2025-09",
      "eu-parliament-resolution-2025-09",
    ],
    sourceQuality: 5,
    contentStatus: "reviewed",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    proceduralNote:
      "This entry tracks an EU institutional review and legislative process, not a criminal investigation. The High Representative's finding of 'indications' of breach is an institutional assessment, and the suspension proposal has not yet been adopted. The label 'allegation under investigation' reflects that the breach allegation is the subject of an ongoing review procedure before EU institutions; it does not imply a criminal-law investigation.",
    correctionUrl: "/corrections",
  },
  {
    id: "eu-global-human-rights-sanctions-israel",
    slug: "eu-global-human-rights-sanctions-israel",
    title:
      "EU Global Human Rights Sanctions Regime — proposed listings targeting Israeli ministers and violent settlers (2025)",
    institution: "Council of the European Union (proposed by the European Commission)",
    jurisdiction: "European Union",
    parties: ["European Commission", "Council of the European Union", "Listed individuals"],
    summary:
      "In September 2025, the European Commission proposed new listings under the EU Global Human Rights Sanctions Regime (a 'Magnitsky-type' instrument) targeting extremist Israeli ministers and violent settlers, alongside a reinforced package against Hamas politburo members. The listings would impose asset freezes and travel bans. They require unanimity in the Council. Sanctions listings are administrative measures subject to legal challenge before the EU General Court.",
    legalStatuses: ["allegation_under_investigation"],
    openedDate: "2025-09-17",
    latestVerifiedUpdateDate: "2025-09-17",
    nextMilestone: "Council decision on the proposed listings (requires unanimity)",
    legalBasisOrAllegedCrimes:
      "Council Regulation (EU) 2020/1998 establishing the EU Global Human Rights Sanctions Regime; alleged responsibility for serious human rights violations (violent settler violence, incitement)",
    actionRelevance:
      "Sanctions listings are a lawful EU accountability tool that does not depend on criminal conviction and can be adopted where there is a credible assessment of responsibility for serious human rights violations. Listings are subject to judicial review before the General Court.",
    sourceIds: [
      "eu-commission-ghrs-israel-2025-09",
      "eu-commission-sanctions-proposal-2025-09",
    ],
    sourceQuality: 5,
    contentStatus: "reviewed",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    proceduralNote:
      "Sanctions listings are administrative measures based on the Council's assessment; they are not criminal findings and do not constitute a judicial determination of guilt. The underlying allegations of serious human rights violations remain subject to administrative and judicial review. The proposed listings had not been adopted as of the July 2026 dataset review.",
    correctionUrl: "/corrections",
  },
  {
    id: "be-settlement-goods-ban-2026",
    slug: "be-settlement-goods-ban-2026",
    title:
      "Belgium — Royal decree banning imports from Israeli settlements (July 2026)",
    institution: "Belgian Federal Government (administrative measure)",
    jurisdiction: "Belgium — federal administrative action",
    parties: ["Belgian Federal Government", "Traders and importers"],
    summary:
      "In July 2026, the Belgian government advanced a royal decree banning imports from Israeli communities in the West Bank, East Jerusalem, and Gaza, with a 120-day transitional period and exemptions for Palestinian producers and humanitarian supplies. Belgium joined Spain, the Netherlands, and Ireland in imposing such bans. The measure is justified by reference to the ICJ's July 2024 advisory opinion finding Israeli settlements illegal. The decree implements the government's September 2025 sanctions package.",
    legalStatuses: ["court_proceeding_active"],
    openedDate: "2025-09",
    latestVerifiedUpdateDate: "2026-07",
    nextMilestone: "Publication and entry into force of the royal decree; potential administrative challenges before the Council of State",
    legalBasisOrAllegedCrimes:
      "Implementation of the ICJ advisory opinion (July 2024) on the illegality of settlements; EU law on the indication of origin (CJEU C-363/18); Belgian trade and consumer protection law",
    actionRelevance:
      "The ban is a lawful national measure distinguishing settlement products from products of the State of Israel, consistent with CJEU labelling law, and an example of state implementation of the ICJ advisory opinion.",
    sourceIds: [
      "belgium-settlement-ban-2026-07",
      "icj-advisory-opinion-2024-07",
      "cjeu-c363-18-2019-11",
    ],
    sourceQuality: 5,
    contentStatus: "reviewed",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    proceduralNote:
      "The royal decree is an administrative trade measure. It is subject to administrative and judicial challenge before entry into force and after. The status label reflects that the measure is adopted and in a transitional period, with its implementation and any legal challenges ongoing; it is not a judicial finding about the underlying conflict.",
    correctionUrl: "/corrections",
  },
];

/** Look up a legal case by its URL slug. */
export function getLegalCaseBySlug(slug: string): LegalCaseEntry | undefined {
  return legalCases.find((c) => c.slug === slug);
}
