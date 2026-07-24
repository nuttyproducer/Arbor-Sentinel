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
];

/** Look up a legal case by its URL slug. */
export function getLegalCaseBySlug(slug: string): LegalCaseEntry | undefined {
  return legalCases.find((c) => c.slug === slug);
}
