import type { ContentStatus, VerificationLevel, LegalStatus, SourceType } from "../types/content";

/**
 * Evidence categories for the static-preview library.
 * Every record is a public source-summary, not raw testimony or
 * user-submitted material.
 */
export type EvidenceCategory =
  | "court record"
  | "official UN document"
  | "humanitarian update"
  | "human-rights report"
  | "parliamentary document"
  | "verified investigative report";

export const EVIDENCE_CATEGORIES: EvidenceCategory[] = [
  "court record",
  "official UN document",
  "humanitarian update",
  "human-rights report",
  "parliamentary document",
  "verified investigative report",
];

export const EVIDENCE_CATEGORY_LABELS: Record<EvidenceCategory, string> = {
  "court record": "Court record",
  "official UN document": "Official UN document",
  "humanitarian update": "Humanitarian update",
  "human-rights report": "Human-rights report",
  "parliamentary document": "Parliamentary document",
  "verified investigative report": "Verified investigative report",
};

export interface EvidenceItem {
  id: string;
  slug: string;
  title: string;
  /** One-paragraph factual summary. Not an editorial conclusion. */
  summary: string;
  category: EvidenceCategory;
  /** IDs of SourceRecords in src/data/sources.ts that support this item. */
  sourceIds: string[];
  /** The primary source type for filtering — derived from the lead source. */
  primarySourceType: SourceType;
  /** Verification / source-quality level. Separate from editorial contentStatus. */
  sourceQuality: VerificationLevel;
  /** Editorial and review status of this evidence summary. */
  contentStatus: ContentStatus;
  /** Legal statuses associated with this item, if any. */
  legalStatuses?: LegalStatus[];
  /** Date the source document was published (not when it was added here). */
  publicationDate?: string;
  /** Date of the incident or event, when known and safe to display. */
  incidentDate?: string;
  /** General region — never an exact dangerous location. */
  safeLocation?: string;
  /** Original language of the primary source. */
  sourceLanguage?: string;
  /** When this summary was last reviewed by a contributor. */
  lastReviewedAt?: string;
  /** Role that performed the last review, if known. */
  reviewedByRole?: string;
  /** Schema version of this record. */
  version: number;
  /** Route to the corrections process. */
  correctionUrl: string;
  /** Searchable tags — no private or unreviewed labels. */
  tags: string[];
  /** Related platform routes. */
  relatedRoutes: string[];
}

/**
 * A small set of safe public source-summary records for the static
 * preview Evidence Library. Every item references at least one public
 * source. No raw witness testimony, graphic media, exact sensitive
 * locations, private personal information, or unreviewed social-media
 * posts presented as facts.
 *
 * Source quality is not editorial approval. An official source may
 * support a summary that is still review_pending. Do not describe a
 * record as verified unless the displayed status supports that word.
 */
export const evidenceItems: EvidenceItem[] = [
  // ── Court records ──────────────────────────────────────────────────
  {
    id: "icj-provisional-measures-jan-2024",
    slug: "icj-provisional-measures-jan-2024",
    title:
      "ICJ provisional measures order — South Africa v. Israel (26 January 2024)",
    summary:
      "The International Court of Justice issued provisional measures in the case brought by South Africa alleging violations of the Genocide Convention in the Gaza Strip. The Court ordered Israel to take all measures within its power to prevent acts within the scope of Article II of the Convention, to prevent and punish incitement to genocide, and to enable the provision of humanitarian assistance. The order also required Israel to report to the Court within one month. The Court did not make a final determination on the merits of the genocide allegation at this stage.",
    category: "court record",
    sourceIds: ["icj-2024-01-26"],
    primarySourceType: "court",
    sourceQuality: 5,
    contentStatus: "reviewed",
    legalStatuses: ["provisional_measures_issued", "court_proceeding_active"],
    publicationDate: "2024-01-26",
    safeLocation: "The Hague / Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-11",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    correctionUrl: "/corrections",
    tags: [
      "ICJ",
      "Genocide Convention",
      "provisional measures",
      "South Africa v. Israel",
      "international law",
    ],
    relatedRoutes: ["/legal-tracker", "/methodology"],
  },
  {
    id: "icj-additional-measures-may-2024",
    slug: "icj-additional-measures-may-2024",
    title:
      "ICJ additional provisional measures — South Africa v. Israel (24 May 2024)",
    summary:
      "The ICJ issued additional provisional measures in response to a further request from South Africa. The Court ordered Israel to immediately halt its military offensive in Rafah governorate and to keep the Rafah crossing open for humanitarian assistance. The order reiterated the earlier provisional measures and added specific requirements related to the Rafah operation. The Court again did not make a final determination on the genocide allegation.",
    category: "court record",
    sourceIds: ["icj-2024-05-24"],
    primarySourceType: "court",
    sourceQuality: 5,
    contentStatus: "reviewed",
    legalStatuses: ["provisional_measures_issued", "court_proceeding_active"],
    publicationDate: "2024-05-24",
    safeLocation: "The Hague / Rafah",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-11",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    correctionUrl: "/corrections",
    tags: [
      "ICJ",
      "Genocide Convention",
      "provisional measures",
      "Rafah",
      "humanitarian access",
    ],
    relatedRoutes: ["/legal-tracker", "/methodology"],
  },

  // ── Official UN documents ──────────────────────────────────────────
  {
    id: "un-coi-report-2024",
    slug: "un-coi-report-2024",
    title:
      "UN Commission of Inquiry report — Occupied Palestinian Territory including East Jerusalem and Israel (2024)",
    summary:
      "The UN Independent International Commission of Inquiry on the Occupied Palestinian Territory, including East Jerusalem, and Israel published a detailed report in 2024 examining human-rights and international humanitarian law compliance by all parties. The report addresses civilian harm, attack patterns, humanitarian access restrictions, and applicable legal frameworks. This summary references the Commission's public report and associated UN documentation.",
    category: "official UN document",
    sourceIds: ["un-coi-2024"],
    primarySourceType: "un",
    sourceQuality: 5,
    contentStatus: "review_pending",
    legalStatuses: ["un_finding"],
    publicationDate: "2024",
    safeLocation: "Geneva / Gaza / West Bank / Israel",
    sourceLanguage: "en",
    version: 1,
    correctionUrl: "/corrections",
    tags: [
      "UN",
      "Commission of Inquiry",
      "IHL",
      "civilian harm",
      "humanitarian access",
    ],
    relatedRoutes: ["/legal-tracker", "/methodology", "/gaza-dossier"],
  },
  {
    id: "icc-palestine-situation",
    slug: "icc-palestine-situation",
    title:
      "ICC Situation in the State of Palestine — public court records",
    summary:
      "The International Criminal Court has an open situation concerning the State of Palestine, with jurisdiction over alleged crimes committed in the occupied Palestinian territory. Public court records include decisions on jurisdiction, arrest warrant applications, and procedural filings. The ICC is an independent judicial institution and its proceedings should not be described as final determinations until concluded.",
    category: "official UN document",
    sourceIds: ["icc-palestine-2024"],
    primarySourceType: "court",
    sourceQuality: 5,
    contentStatus: "review_pending",
    legalStatuses: ["arrest_warrant_issued", "court_proceeding_active"],
    publicationDate: "2024",
    safeLocation: "The Hague",
    sourceLanguage: "en",
    version: 1,
    correctionUrl: "/corrections",
    tags: [
      "ICC",
      "Palestine",
      "arrest warrant",
      "international criminal law",
    ],
    relatedRoutes: ["/legal-tracker", "/methodology"],
  },

  // ── Humanitarian updates ────────────────────────────────────────────
  {
    id: "gaza-humanitarian-access-2025",
    slug: "gaza-humanitarian-access-2025",
    title:
      "Humanitarian access restrictions in Gaza — UN OCHA and humanitarian organisation reporting",
    summary:
      "UN OCHA and multiple humanitarian organisations have documented persistent restrictions on humanitarian access into and within the Gaza Strip. Reported constraints include border-crossing closures, denial of movement requests, attacks on humanitarian convoys and facilities, and severe limitations on medical evacuations. This summary is drawn from public UN OCHA situation reports, humanitarian organisation statements, and verified news reporting.",
    category: "humanitarian update",
    sourceIds: ["ocha-opt-main", "ocha-opt-data"],
    primarySourceType: "humanitarian",
    sourceQuality: 4,
    contentStatus: "review_pending",
    publicationDate: "2025",
    safeLocation: "Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Contributor — source records populated from official UN OCHA pages",
    version: 1,
    correctionUrl: "/corrections",
    tags: [
      "humanitarian access",
      "Gaza",
      "UN OCHA",
      "aid restrictions",
      "medical evacuation",
    ],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },
  {
    id: "food-insecurity-ipc-gaza",
    slug: "food-insecurity-ipc-gaza",
    title:
      "Integrated Food Security Phase Classification (IPC) — Gaza food insecurity assessment",
    summary:
      "The IPC Famine Review Committee has issued multiple assessments of food insecurity in Gaza during the conflict. These reports, based on data collected by UN agencies and humanitarian organisations, classify the severity of food insecurity across population groups. IPC reports are technical assessments — they do not make legal determinations about causes, though they describe conditions that may be relevant to legal and accountability analysis.",
    category: "humanitarian update",
    sourceIds: ["ipc-frc-gaza-2024", "ipc-frc-gaza-march-2024"],
    primarySourceType: "humanitarian",
    sourceQuality: 5,
    contentStatus: "review_pending",
    publicationDate: "2025",
    safeLocation: "Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Contributor — source records populated from official IPC FRC reports",
    version: 1,
    correctionUrl: "/corrections",
    tags: [
      "food insecurity",
      "IPC",
      "Gaza",
      "famine",
      "humanitarian assessment",
    ],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },

  // ── Human-rights reports ───────────────────────────────────────────
  {
    id: "civilian-harm-documentation",
    slug: "civilian-harm-documentation",
    title:
      "Civilian harm documentation — multiple human-rights organisations",
    summary:
      "Multiple established human-rights organisations, including Amnesty International and Human Rights Watch, have published detailed reports documenting civilian casualties, damage to civilian infrastructure, and patterns of attacks potentially constituting violations of international humanitarian law in Gaza. These reports are based on field investigations, satellite imagery analysis, open-source verification, and interviews conducted under safety protocols. Organisational findings are distinct from judicial determinations.",
    category: "human-rights report",
    sourceIds: ["amnesty-opt-2024", "hrw-israel-palestine"],
    primarySourceType: "ngo",
    sourceQuality: 4,
    contentStatus: "review_pending",
    legalStatuses: ["ngo_legal_determination"],
    publicationDate: "2025",
    safeLocation: "Gaza / West Bank / Israel",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Contributor — source records populated from official Amnesty and HRW research hubs",
    version: 1,
    correctionUrl: "/corrections",
    tags: [
      "civilian harm",
      "IHL",
      "human-rights documentation",
      "Amnesty International",
      "Human Rights Watch",
    ],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },

  // ── Parliamentary documents ────────────────────────────────────────
  {
    id: "arms-export-parliamentary-scrutiny",
    slug: "arms-export-parliamentary-scrutiny",
    title:
      "Arms export parliamentary scrutiny — multiple jurisdictions",
    summary:
      "Parliamentary bodies in several countries have held debates, asked questions, and initiated committee scrutiny of arms exports to parties involved in the Gaza conflict. These include parliamentary questions about compliance with the Arms Trade Treaty and national arms-export criteria, as well as legal challenges to export licensing decisions. Parliamentary records are official public documents and do not themselves constitute legal findings, but they are indicators of democratic accountability processes in action.",
    category: "parliamentary document",
    sourceIds: [
      "arms-trade-treaty",
      "eu-common-position-2008-944",
      "belgium-chamber",
      "eu-parliament",
    ],
    primarySourceType: "government",
    sourceQuality: 5,
    contentStatus: "review_pending",
    publicationDate: "2025",
    safeLocation: "Multiple jurisdictions",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Contributor — source records populated from official treaty, EU, and parliamentary sources",
    version: 1,
    correctionUrl: "/corrections",
    tags: [
      "arms export",
      "parliamentary scrutiny",
      "Arms Trade Treaty",
      "licensing",
      "multiple jurisdictions",
    ],
    relatedRoutes: [
      "/countries/belgium",
      "/institutions/european-union",
      "/legal-tracker",
      "/methodology",
    ],
  },

  // ── Verified investigative reports ──────────────────────────────────
  {
    id: "airwars-casualty-monitoring",
    slug: "airwars-casualty-monitoring",
    title:
      "Civilian casualty monitoring — Airwars and open-source investigations",
    summary:
      "Airwars and other open-source investigation organisations have systematically tracked, archived, and assessed civilian-harm claims from the Gaza conflict using transparent methodology. Their published datasets include incident locations, casualty estimates, belligerent attribution, and source assessment. This work is based on open-source intelligence methods and does not rely on classified or non-public information. All data and methodology are published openly.",
    category: "verified investigative report",
    sourceIds: ["airwars-gaza"],
    primarySourceType: "osint",
    sourceQuality: 4,
    contentStatus: "review_pending",
    publicationDate: "2025",
    safeLocation: "Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Contributor — source record populated from official Airwars Gaza monitoring page",
    version: 1,
    correctionUrl: "/corrections",
    tags: [
      "civilian casualties",
      "Airwars",
      "OSINT",
      "open-source investigation",
      "transparency",
    ],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Reviewed court records (M7-02)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "icj-advisory-opinion-july-2024",
    slug: "icj-advisory-opinion-july-2024",
    title:
      "ICJ Advisory Opinion — Legal consequences of Israel's occupation and settlement policies (19 July 2024)",
    summary:
      "The International Court of Justice issued an advisory opinion finding that Israel's continued presence in the Occupied Palestinian Territory is unlawful and that Israel is under an obligation to end it. The Court found that the transfer of settlers into occupied territory violates Article 49 of the Fourth Geneva Convention, and that Israel's policies of settlement expansion, annexation, and discrimination breach international law. The opinion is authoritative guidance on the law addressed to the UN General Assembly — it is not a judgment in a contentious case and is not directly enforceable, but it has been invoked by states, UN bodies, and courts.",
    category: "court record",
    sourceIds: ["icj-advisory-opinion-2024-07"],
    primarySourceType: "court",
    sourceQuality: 5,
    contentStatus: "reviewed",
    legalStatuses: ["un_finding"],
    publicationDate: "2024-07-19",
    safeLocation: "The Hague / Occupied Palestinian Territory",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    correctionUrl: "/corrections",
    tags: [
      "ICJ",
      "advisory opinion",
      "occupation",
      "settlements",
      "international law",
    ],
    relatedRoutes: ["/legal-tracker", "/methodology", "/sources"],
  },
  {
    id: "icj-provisional-measures-march-2024",
    slug: "icj-provisional-measures-march-2024",
    title:
      "ICJ modified provisional measures order — South Africa v. Israel (28 March 2024)",
    summary:
      "The International Court of Justice modified and extended its earlier provisional measures, ordering Israel to enable the unhindered provision of urgently needed humanitarian assistance to the Palestinian population in Gaza and to ensure the preservation of evidence. The order followed a further request by South Africa citing deteriorating conditions, including the risk of famine. The Court did not make a final determination on the genocide allegation.",
    category: "court record",
    sourceIds: ["icj-2024-03-28"],
    primarySourceType: "court",
    sourceQuality: 5,
    contentStatus: "reviewed",
    legalStatuses: ["provisional_measures_issued", "court_proceeding_active"],
    publicationDate: "2024-03-28",
    safeLocation: "The Hague / Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["ICJ", "provisional measures", "humanitarian assistance", "famine"],
    relatedRoutes: ["/legal-tracker", "/methodology"],
  },
  {
    id: "icc-jurisdiction-decision-2021",
    slug: "icc-jurisdiction-decision-2021",
    title:
      "ICC Pre-Trial Chamber I — Territorial jurisdiction decision in the Situation in the State of Palestine (5 February 2021)",
    summary:
      "ICC Pre-Trial Chamber I decided, by majority, that the Court's territorial jurisdiction in the Situation in the State of Palestine extends to the territories occupied by Israel since 1967, namely Gaza and the West Bank, including East Jerusalem. The decision established the geographic scope of the ICC's jurisdiction over the situation. It did not determine the merits of any specific case or charge.",
    category: "court record",
    sourceIds: ["icc-palestine-2024"],
    primarySourceType: "court",
    sourceQuality: 5,
    contentStatus: "reviewed",
    legalStatuses: ["court_proceeding_active"],
    publicationDate: "2021-02-05",
    safeLocation: "The Hague",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["ICC", "Palestine", "jurisdiction", "occupied territory"],
    relatedRoutes: ["/legal-tracker", "/methodology"],
  },
  {
    id: "icc-arrest-warrants-nov-2024",
    slug: "icc-arrest-warrants-nov-2024",
    title:
      "ICC arrest warrants — Benjamin Netanyahu, Yoav Gallant, Mohammed Deif (21 November 2024)",
    summary:
      "ICC Pre-Trial Chamber I unanimously issued arrest warrants for Benjamin Netanyahu, Yoav Gallant, and Mohammed Deif, finding reasonable grounds to believe that Netanyahu and Gallant each committed the war crime of using starvation as a method of warfare and crimes against humanity of murder, persecution, and other inhumane acts. The warrant for Deif was terminated in February 2025 following confirmation of his death; the warrants for Netanyahu and Gallant remain active. Arrest warrants are not convictions — all persons are presumed innocent until proven guilty.",
    category: "court record",
    sourceIds: ["icc-arrest-warrants-2024-11", "icc-deif-warrant-cancelled-2025"],
    primarySourceType: "court",
    sourceQuality: 5,
    contentStatus: "reviewed",
    legalStatuses: ["arrest_warrant_issued"],
    publicationDate: "2024-11-21",
    safeLocation: "The Hague",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["ICC", "arrest warrant", "starvation", "crimes against humanity"],
    relatedRoutes: ["/legal-tracker", "/methodology"],
  },
  {
    id: "icc-deif-proceedings-terminated-2025",
    slug: "icc-deif-proceedings-terminated-2025",
    title:
      "ICC termination of proceedings against Mohammed Deif following confirmed death (February 2025)",
    summary:
      "ICC Pre-Trial Chamber I terminated proceedings against Mohammed Deif in February 2025 after Hamas confirmed his death, and the November 2024 arrest warrant against him was cancelled. The termination is a procedural consequence of death under the Rome Statute — it is not an acquittal and does not address the merits of the charges. Arrest warrants against Benjamin Netanyahu and Yoav Gallant remain active.",
    category: "court record",
    sourceIds: ["icc-deif-warrant-cancelled-2025"],
    primarySourceType: "court",
    sourceQuality: 5,
    contentStatus: "reviewed",
    legalStatuses: ["arrest_warrant_issued"],
    publicationDate: "2025-02",
    safeLocation: "The Hague",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["ICC", "Deif", "proceedings terminated", "procedural"],
    relatedRoutes: ["/legal-tracker", "/methodology"],
  },
  {
    id: "nl-f35-district-court-2024-02",
    slug: "nl-f35-district-court-2024-02",
    title:
      "Hague District Court — Order to halt Dutch exports of F-35 parts to Israel (12 February 2024)",
    summary:
      "The Hague District Court ordered the Dutch State to stop exporting F-35 fighter jet parts to Israel within seven days, holding that there was a clear risk the parts could be used in serious violations of international humanitarian law in Gaza and that this outweighed commercial and foreign-policy considerations. The ruling applied the Arms Trade Treaty and EU Common Position 2008/944/CFSP. The order was reversed on appeal in September 2024. The ruling is a national court decision specific to the Netherlands.",
    category: "court record",
    sourceIds: ["nl-hague-district-court-f35-2024-02", "nl-hague-court-appeal-f35-2024-09"],
    primarySourceType: "court",
    sourceQuality: 5,
    contentStatus: "reviewed",
    legalStatuses: ["court_proceeding_active"],
    publicationDate: "2024-02-12",
    safeLocation: "The Hague",
    sourceLanguage: "nl",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["Netherlands", "F-35", "arms export", "judicial review", "ATT"],
    relatedRoutes: ["/legal-tracker", "/methodology", "/countries/belgium"],
  },
  {
    id: "be-brussels-airspace-court-2025-03",
    slug: "be-brussels-airspace-court-2025-03",
    title:
      "Brussels Court of Appeal — Belgium at fault for failure to act on military air cargo to Israel (March 2025)",
    summary:
      "The Brussels Court of Appeal ruled in March 2025 that Belgium had been at fault for not taking timely measures to prevent flights carrying military equipment to Israel from using Belgian airports and airspace. The ruling contributed to the royal decree of 18 January 2026 prohibiting such flights and to the September 2025 federal sanctions package. The ruling is a national court finding of state fault, not a determination of IHL violations by parties to the conflict.",
    category: "court record",
    sourceIds: ["be-brussels-court-appeal-airspace-2025-03", "belgium-airspace-ban-2026-01"],
    primarySourceType: "court",
    sourceQuality: 5,
    contentStatus: "reviewed",
    legalStatuses: ["court_proceeding_active"],
    publicationDate: "2025-03",
    safeLocation: "Brussels",
    sourceLanguage: "nl",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["Belgium", "airspace", "arms transit", "court ruling"],
    relatedRoutes: ["/legal-tracker", "/countries/belgium", "/methodology"],
  },
  {
    id: "be-flemish-arms-transit-order-2025-07",
    slug: "be-flemish-arms-transit-order-2025-07",
    title:
      "Brussels Court of First Instance — Order halting Flemish arms transit to Israel (July 2025)",
    summary:
      "The Brussels Court of First Instance ordered the Flemish government to halt all transit to Israel of defence-related products unless there was firm assurance of exclusive civilian use, imposing a €50,000 fine per violation up to €5 million. The order, brought by NGOs including Vredesactie, 11.11.11, and the League for Human Rights, created a de facto arms embargo through Flanders. The Flemish government appealed. The order is a national court decision on transit licensing under regional competence.",
    category: "court record",
    sourceIds: ["belgium-flanders-court-2025-07"],
    primarySourceType: "court",
    sourceQuality: 5,
    contentStatus: "reviewed",
    legalStatuses: ["court_proceeding_active"],
    publicationDate: "2025-07",
    safeLocation: "Brussels / Flanders",
    sourceLanguage: "nl",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["Belgium", "Flanders", "arms transit", "court order", "embargo"],
    relatedRoutes: ["/legal-tracker", "/countries/belgium", "/methodology"],
  },
  {
    id: "cjeu-settlement-labelling-2019-11",
    slug: "cjeu-settlement-labelling-2019-11",
    title:
      "Court of Justice of the EU — Settlement product labelling judgment, Case C-363/18 (12 November 2019)",
    summary:
      "The Court of Justice of the European Union ruled that foodstuffs originating in territories occupied by Israel, including the Golan Heights and the West Bank, must be labelled with their place of origin and cannot be marketed as 'Product of Israel'. The judgment recognised consumers' right to accurate information relevant to ethical and political considerations under EU food information law. The judgment is final and binding across the EU and provides legal support for measures distinguishing settlement products from those of the State of Israel.",
    category: "court record",
    sourceIds: ["cjeu-c363-18-2019-11"],
    primarySourceType: "court",
    sourceQuality: 5,
    contentStatus: "reviewed",
    publicationDate: "2019-11-12",
    safeLocation: "Luxembourg / European Union",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["CJEU", "settlements", "product labelling", "consumer information"],
    relatedRoutes: ["/legal-tracker", "/institutions/european-union", "/methodology"],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Reviewed official UN documents (M7-02)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "un-scr-2712-nov-2023",
    slug: "un-scr-2712-nov-2023",
    title:
      "UN Security Council Resolution 2712 — humanitarian pauses and hostage release (15 November 2023)",
    summary:
      "UN Security Council Resolution 2712, adopted on 15 November 2023, called for urgent and extended humanitarian pauses and corridors throughout the Gaza Strip, the immediate and unconditional release of all hostages, and the protection of civilians and humanitarian facilities. It was the first Council resolution on the conflict since 7 October 2023. The resolution is binding under Article 25 of the UN Charter.",
    category: "official UN document",
    sourceIds: ["un-scr-2712-2023-11"],
    primarySourceType: "un",
    sourceQuality: 5,
    contentStatus: "reviewed",
    publicationDate: "2023-11-15",
    safeLocation: "New York / Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official UN documents",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["UNSC", "humanitarian pause", "hostages", "Resolution 2712"],
    relatedRoutes: ["/gaza-dossier", "/legal-tracker", "/methodology"],
  },
  {
    id: "un-scr-2720-dec-2023",
    slug: "un-scr-2720-dec-2023",
    title:
      "UN Security Council Resolution 2720 — humanitarian assistance mechanism (22 December 2023)",
    summary:
      "UN Security Council Resolution 2720 demanded that parties allow, facilitate, and enable the immediate, safe, and unhindered delivery of humanitarian assistance at scale throughout the Gaza Strip. It requested the Secretary-General to appoint a Senior Humanitarian and Reconstruction Coordinator to facilitate, coordinate, monitor, and verify relief consignments. The resolution is a binding Council act addressing humanitarian access obligations.",
    category: "official UN document",
    sourceIds: ["un-scr-2720-2023-12"],
    primarySourceType: "un",
    sourceQuality: 5,
    contentStatus: "reviewed",
    publicationDate: "2023-12-22",
    safeLocation: "New York / Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official UN documents",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["UNSC", "humanitarian access", "Resolution 2720", "coordinator"],
    relatedRoutes: ["/gaza-dossier", "/methodology"],
  },
  {
    id: "un-ocha-wck-aid-workers-2024-04",
    slug: "un-ocha-wck-aid-workers-2024-04",
    title:
      "UN OCHA — Killing of seven World Central Kitchen aid workers in Gaza (1–2 April 2024)",
    summary:
      "UN OCHA documented the 1 April 2024 Israeli drone strike on a World Central Kitchen convoy in Deir al-Balah that killed seven humanitarian aid workers, including international staff. The incident prompted WCK to suspend operations in Gaza and drew international condemnation, and it highlighted risks faced by humanitarian personnel under IHL protections. The deaths were later acknowledged as a mistake by the Israeli military in its own investigation.",
    category: "official UN document",
    sourceIds: ["un-ocha-flash-wck-2024-04"],
    primarySourceType: "un",
    sourceQuality: 5,
    contentStatus: "reviewed",
    incidentDate: "2024-04-01",
    publicationDate: "2024-04-02",
    safeLocation: "Deir al-Balah, Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official UN OCHA pages",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["UN OCHA", "aid workers", "World Central Kitchen", "civilian harm"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },
  {
    id: "un-coi-children-report-2026-06",
    slug: "un-coi-children-report-2026-06",
    title:
      "UN Commission of Inquiry — Report on crimes against Palestinian children (23 June 2026)",
    summary:
      "The UN Independent International Commission of Inquiry published a 100-page report on 23 June 2026 documenting violations and crimes committed against Palestinian children from 7 October 2023 to 31 March 2026. The Commission found that Israeli authorities deliberately targeted Palestinian children, resulting in acts constituting genocide, crimes against humanity including persecution, and war crimes. It reported that at least 20,179 Palestinian children were killed and 44,143 injured in Gaza between October 2023 and October 2025. These findings are attributed to the Commission — they are fact-finding outputs, not judicial rulings.",
    category: "official UN document",
    sourceIds: ["un-coi-2026-children"],
    primarySourceType: "un",
    sourceQuality: 4,
    contentStatus: "reviewed",
    legalStatuses: ["un_finding"],
    publicationDate: "2026-06-23",
    safeLocation: "Geneva / Gaza / West Bank",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["UN", "Commission of Inquiry", "children", "genocide finding"],
    relatedRoutes: ["/legal-tracker", "/gaza-dossier", "/methodology"],
  },
  {
    id: "un-coi-report-2025-03",
    slug: "un-coi-report-2025-03",
    title:
      "UN Commission of Inquiry — Report to the Human Rights Council (March 2025)",
    summary:
      "The UN Independent International Commission of Inquiry reported to the Human Rights Council in March 2025, documenting alleged violations of international humanitarian law and human rights law by all parties to the conflict, including the use of starvation as a method of warfare, attacks on civilian infrastructure, and the treatment of detainees. The Commission's findings inform international accountability processes and are not judicial rulings.",
    category: "official UN document",
    sourceIds: ["un-coi-2025-03"],
    primarySourceType: "un",
    sourceQuality: 5,
    contentStatus: "reviewed",
    legalStatuses: ["un_finding"],
    publicationDate: "2025-03",
    safeLocation: "Geneva / Gaza / West Bank / Israel",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["UN", "Commission of Inquiry", "IHL", "starvation", "detention"],
    relatedRoutes: ["/legal-tracker", "/methodology"],
  },
  {
    id: "unrwa-gaza-operations-2025",
    slug: "unrwa-gaza-operations-2025",
    title:
      "UNRWA — Gaza emergency operations and situation updates (2024–2025)",
    summary:
      "UNRWA documents its humanitarian operations in Gaza, including food distribution, primary healthcare, shelter, and education, as well as attacks on UNRWA facilities and the killing of UNRWA staff — among the highest numbers of UN personnel killed in a single conflict. UNRWA remains the largest UN agency operating in Gaza. Its operational reporting is a primary source for humanitarian conditions and access constraints.",
    category: "official UN document",
    sourceIds: ["unrwa-gaza-emergency-2025", "org-unrwa"],
    primarySourceType: "un",
    sourceQuality: 4,
    contentStatus: "reviewed",
    publicationDate: "2025",
    safeLocation: "Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official UNRWA reporting",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["UNRWA", "Gaza", "humanitarian operations", "UN staff"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },
  {
    id: "who-opt-health-2025",
    slug: "who-opt-health-2025",
    title:
      "WHO — Health emergency reporting for the occupied Palestinian territory (2024–2025)",
    summary:
      "The World Health Organization documents the impact of the conflict on health in Gaza and the West Bank, including attacks on healthcare facilities and personnel, disease outbreaks, malnutrition, medical evacuations, and the collapse of health infrastructure. WHO reporting is a technical health-sector source that describes conditions but does not make legal determinations about responsibility.",
    category: "official UN document",
    sourceIds: ["who-opt-report-2025", "who-kamal-adwan-2024-12"],
    primarySourceType: "un",
    sourceQuality: 4,
    contentStatus: "reviewed",
    publicationDate: "2025",
    safeLocation: "Gaza / West Bank",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official WHO reporting",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["WHO", "health", "healthcare attacks", "Gaza"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },
  {
    id: "unicef-gaza-children-2024",
    slug: "unicef-gaza-children-2024",
    title:
      "UNICEF — Impact of the Gaza conflict on children (2024–2025)",
    summary:
      "UNICEF documents the impact of the conflict on children in Gaza, including deaths and injuries, malnutrition, interruption of education, loss of caregivers, and psychological harm, as well as the situation of children in Israeli military detention. UNICEF's mandate is children's rights and protection; its reporting describes conditions and does not make criminal-law determinations.",
    category: "official UN document",
    sourceIds: ["unicef-gaza-children-2024", "un-coi-2026-children"],
    primarySourceType: "un",
    sourceQuality: 4,
    contentStatus: "reviewed",
    publicationDate: "2024",
    safeLocation: "Gaza / West Bank",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official UNICEF reporting",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["UNICEF", "children", "Gaza", "malnutrition", "education"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Reviewed humanitarian updates (M7-02)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "msf-gaza-medical-2024",
    slug: "msf-gaza-medical-2024",
    title:
      "MSF — Medical humanitarian operations and testimony from Gaza (2024–2025)",
    summary:
      "Médecins Sans Frontières runs clinics and supports hospitals in Gaza and publishes medical testimony, situation reports, and data on attacks on healthcare and access restrictions. MSF has repeatedly documented mass casualty influxes, shortages of medical supplies, and attacks on medical staff and facilities, and has called for a ceasefire and unimpeded medical access. MSF reporting is first-hand medical humanitarian documentation — it does not make legal determinations.",
    category: "humanitarian update",
    sourceIds: ["msf-gaza-2024"],
    primarySourceType: "humanitarian",
    sourceQuality: 4,
    contentStatus: "reviewed",
    publicationDate: "2024",
    safeLocation: "Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official MSF reporting",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["MSF", "healthcare", "Gaza", "medical access", "attacks on health"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },
  {
    id: "icrc-gaza-collapse-2026-06",
    slug: "icrc-gaza-collapse-2026-06",
    title:
      "ICRC — Warning that Gaza's humanitarian response was on the verge of collapse (June 2026)",
    summary:
      "The ICRC warned in June 2026 that Gaza's humanitarian response was on the verge of total collapse after Israel blocked aid deliveries starting 2 March 2026 following the collapse of the October 2025 ceasefire. The ICRC reported that its field hospital was running dangerously low on supplies, that common kitchens providing the only daily meal for many could operate for only a few more weeks, and that healthcare in northern Gaza had been 'obliterated'. The ICRC also noted it had been unable to access Palestinian detainees in Israeli facilities since October 2023.",
    category: "humanitarian update",
    sourceIds: ["icrc-gaza-collapse-2026-06"],
    primarySourceType: "humanitarian",
    sourceQuality: 4,
    contentStatus: "reviewed",
    publicationDate: "2026-06",
    safeLocation: "Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official ICRC statements",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["ICRC", "humanitarian collapse", "Gaza", "aid access"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },
  {
    id: "icrc-detention-2024-06",
    slug: "icrc-detention-2024-06",
    title:
      "ICRC — On the treatment and humane handling of detainees in the Israel–Gaza conflict",
    summary:
      "The ICRC has repeatedly urged the humane treatment of all detainees in the Israel–Gaza conflict and the preservation of human dignity, warning of the risks of mistreatment in detention settings and calling for full respect of the Geneva Conventions. ICRC statements interpret IHL obligations applicable to all parties and do not attribute responsibility to specific parties.",
    category: "humanitarian update",
    sourceIds: ["icrc-detention-2024-06", "icrc-ceasefire-jan-2026"],
    primarySourceType: "humanitarian",
    sourceQuality: 4,
    contentStatus: "reviewed",
    publicationDate: "2024-06",
    safeLocation: "Gaza / Israel",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official ICRC statements",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["ICRC", "detention", "hostages", "Geneva Conventions"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },
  {
    id: "wfp-gaza-food-security-2024",
    slug: "wfp-gaza-food-security-2024",
    title:
      "WFP — Food security and access constraints in Gaza (2024–2025)",
    summary:
      "The World Food Programme documents food insecurity, distribution constraints, and access denials in Gaza, and has repeatedly warned of the risk of famine. WFP operational data feeds into IPC food-security assessments. Its reporting describes conditions and operational constraints and does not make legal determinations.",
    category: "humanitarian update",
    sourceIds: ["wfp-gaza-2024", "ipc-gaza-snapshot-2026-07"],
    primarySourceType: "humanitarian",
    sourceQuality: 4,
    contentStatus: "reviewed",
    publicationDate: "2024",
    safeLocation: "Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official WFP reporting",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["WFP", "food security", "Gaza", "famine risk", "access"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },
  {
    id: "who-kamal-adwan-2024-12",
    slug: "who-kamal-adwan-2024-12",
    title:
      "WHO — Raid on and closure of Kamal Adwan Hospital, northern Gaza (December 2024)",
    summary:
      "WHO documented the December 2024 raid on and closure of Kamal Adwan Hospital in northern Gaza, which had been providing critical paediatric and maternity care. WHO reported that the hospital was put out of service and described the collapse of the health system in northern Gaza. The raid was also documented by the UN Commission of Inquiry and humanitarian organisations.",
    category: "humanitarian update",
    sourceIds: ["who-kamal-adwan-2024-12", "who-opt-report-2025"],
    primarySourceType: "humanitarian",
    sourceQuality: 4,
    contentStatus: "reviewed",
    incidentDate: "2024-12-27",
    publicationDate: "2024-12",
    safeLocation: "North Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official WHO statements",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["WHO", "Kamal Adwan", "health system", "attacks on health"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },
  {
    id: "ifrc-opt-operations-2024",
    slug: "ifrc-opt-operations-2024",
    title:
      "IFRC — Red Cross/Red Crescent operations in the occupied Palestinian territory",
    summary:
      "The International Federation of Red Cross and Red Crescent Societies coordinates the movement's response in the occupied Palestinian territory, working with the Palestine Red Crescent Society, and publishes emergency appeals and operational reports documenting needs, access constraints, and attacks on first responders. IFRC reporting describes humanitarian conditions and does not make legal determinations.",
    category: "humanitarian update",
    sourceIds: ["ifrc-opt-2024", "org-prcs"],
    primarySourceType: "humanitarian",
    sourceQuality: 4,
    contentStatus: "reviewed",
    publicationDate: "2024",
    safeLocation: "Gaza / West Bank",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official IFRC reporting",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["IFRC", "Red Crescent", "first responders", "Gaza"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },
  {
    id: "ocha-sitrep-july-2026",
    slug: "ocha-sitrep-july-2026",
    title:
      "UN OCHA — Humanitarian situation report for the occupied Palestinian territory (10 July 2026)",
    summary:
      "UN OCHA's July 2026 situation report documents water delivery at over 17,000 cubic metres daily (down 15–20% due to funding shortfalls), the entire Gaza Strip classified at IPC Phase 3 (Crisis) with 1.4 million people facing high acute food insecurity through December 2026, new displacements along the 'Yellow Line' in northern Rafah, and a 37% drop in shelter assistance from May to June. The report also documents ongoing aid obstruction by de facto authorities.",
    category: "humanitarian update",
    sourceIds: ["ocha-opt-sitrep-2026-07-10", "ocha-opt-data"],
    primarySourceType: "humanitarian",
    sourceQuality: 5,
    contentStatus: "reviewed",
    publicationDate: "2026-07-10",
    safeLocation: "Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official UN OCHA pages",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["UN OCHA", "situation report", "water", "food insecurity", "displacement"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },
  {
    id: "ipc-gaza-snapshot-2026-07",
    slug: "ipc-gaza-snapshot-2026-07",
    title:
      "IPC — Gaza Strip Special Snapshot, 16 April to 31 December 2026 (published 23 July 2026)",
    summary:
      "The Integrated Food Security Phase Classification Global Initiative's July 2026 Special Snapshot classifies the entire Gaza Strip in IPC Phase 3 (Crisis), with 1.4 million people expected to face high levels of acute food insecurity through December 2026. Although the October 2025 ceasefire brought measurable gains, aid coverage has declined since February 2026 and conditions remain highly fragile. IPC reports are technical food-security assessments that do not make legal determinations about causes.",
    category: "humanitarian update",
    sourceIds: ["ipc-gaza-snapshot-2026-07"],
    primarySourceType: "humanitarian",
    sourceQuality: 5,
    contentStatus: "reviewed",
    publicationDate: "2026-07-23",
    safeLocation: "Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official IPC FRC reports",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["IPC", "food insecurity", "Gaza", "Phase 3", "famine risk"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Reviewed human-rights reports (M7-02)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "amnesty-genocide-report-2024-12",
    slug: "amnesty-genocide-report-2024-12",
    title:
      "Amnesty International — 'You Feel Like You Are Subhuman': Israel's genocide against Palestinians in Gaza (December 2024)",
    summary:
      "Amnesty International's December 2024 report concluded that the evidence it gathered established that Israel had committed and was continuing to commit acts prohibited under the Genocide Convention in Gaza, including mass killings, destruction of life-sustaining infrastructure, and deliberate obstruction of humanitarian aid. The conclusion is Amnesty's organisational legal determination based on its own investigation — it is not a judicial finding and has been contested by the Israeli government.",
    category: "human-rights report",
    sourceIds: ["amnesty-genocide-2024-12", "amnesty-opt-2024"],
    primarySourceType: "ngo",
    sourceQuality: 4,
    contentStatus: "reviewed",
    legalStatuses: ["ngo_legal_determination"],
    publicationDate: "2024-12-05",
    safeLocation: "Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["Amnesty International", "genocide", "Genocide Convention", "civilian harm"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },
  {
    id: "hrw-starvation-report-2024-12",
    slug: "hrw-starvation-report-2024-12",
    title:
      "Human Rights Watch — Starvation used as a weapon of war in Gaza (December 2024)",
    summary:
      "Human Rights Watch reported that Israeli government forces were committing the war crime of starvation as a method of warfare in Gaza by deliberately blocking the delivery of water, food, and fuel, and by destroying food and water infrastructure. The report documented the systematic denial of humanitarian access. HRW's findings are an organisational legal determination — they are not a judicial finding and are contested by the Israeli government.",
    category: "human-rights report",
    sourceIds: ["hrw-starvation-2024-12", "hrw-israel-palestine"],
    primarySourceType: "ngo",
    sourceQuality: 4,
    contentStatus: "reviewed",
    legalStatuses: ["ngo_legal_determination"],
    publicationDate: "2024-12-19",
    safeLocation: "Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["Human Rights Watch", "starvation", "war crime", "aid blockade"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },
  {
    id: "btselem-occupation-2024-08",
    slug: "btselem-occupation-2024-08",
    title:
      "B'Tselem — 'Welcome to Hell': The Israeli regime's commitment to the destruction of the Gaza Strip (August 2024)",
    summary:
      "B'Tselem concluded in its August 2024 report that the Israeli authorities' actions in Gaza amount to the deliberate destruction of a society, describing the systematic demolition of civilian infrastructure, displacement, and denial of basic necessities. B'Tselem also documents West Bank displacement, demolitions, and settler violence. Its findings are organisational documentation — they are not judicial determinations.",
    category: "human-rights report",
    sourceIds: ["btselem-occupation-2024", "org-btselem"],
    primarySourceType: "ngo",
    sourceQuality: 4,
    contentStatus: "reviewed",
    legalStatuses: ["ngo_legal_determination"],
    publicationDate: "2024-08",
    safeLocation: "Gaza / West Bank",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official B'Tselem reporting",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["B'Tselem", "destruction", "Gaza", "displacement", "occupation"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },
  {
    id: "alhaq-opt-documentation-2024",
    slug: "alhaq-opt-documentation-2024",
    title:
      "Al-Haq — Legal documentation and accountability submissions on the occupied Palestinian territory",
    summary:
      "Al-Haq is an independent Palestinian human-rights organisation that documents violations in the occupied Palestinian territory and files submissions with international mechanisms, including the ICC and universal-jurisdiction courts. Its reporting and legal analysis address attacks on civilians, the treatment of detainees, settlement expansion, and the denial of humanitarian access. Al-Haq's legal determinations are organisational and are not judicial findings.",
    category: "human-rights report",
    sourceIds: ["alhaq-opt-2024", "org-alhaq"],
    primarySourceType: "ngo",
    sourceQuality: 4,
    contentStatus: "reviewed",
    legalStatuses: ["ngo_legal_determination"],
    publicationDate: "2024",
    safeLocation: "Occupied Palestinian Territory",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official Al-Haq reporting",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["Al-Haq", "documentation", "legal accountability", "ICC"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/legal-tracker", "/methodology"],
  },
  {
    id: "dci-palestine-children-2025",
    slug: "dci-palestine-children-2025",
    title:
      "Defense for Children International – Palestine — Child casualties and detention documentation",
    summary:
      "Defense for Children International – Palestine documents child casualties in Gaza and the West Bank and the detention and treatment of Palestinian children in Israeli military custody. Its documentation, which is frequently cited by UN bodies, includes verified cases of children killed, injured, and detained. DCIP's findings are organisational documentation — they are not judicial determinations.",
    category: "human-rights report",
    sourceIds: ["dci-palestine-2025", "unicef-gaza-children-2024"],
    primarySourceType: "ngo",
    sourceQuality: 4,
    contentStatus: "reviewed",
    publicationDate: "2025",
    safeLocation: "Gaza / West Bank",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official DCIP reporting",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["DCIP", "children", "child casualties", "detention"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },
  {
    id: "pchrgaza-opt-2025",
    slug: "pchrgaza-opt-2025",
    title:
      "Palestinian Centre for Human Rights — Documentation of violations in Gaza and the West Bank",
    summary:
      "The Palestinian Centre for Human Rights documents violations in Gaza and the West Bank, including attacks on civilians and civilian infrastructure, and pursues accountability through legal mechanisms including the ICC. Its reporting is a source for humanitarian and human-rights conditions. PCHR's findings are organisational documentation — they are not judicial determinations.",
    category: "human-rights report",
    sourceIds: ["pchrgaza-2025", "org-pchrgaza"],
    primarySourceType: "ngo",
    sourceQuality: 4,
    contentStatus: "reviewed",
    publicationDate: "2025",
    safeLocation: "Gaza / West Bank",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official PCHR reporting",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["PCHR", "Gaza", "documentation", "civilian harm"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },
  {
    id: "phri-israel-health-2024",
    slug: "phri-israel-health-2024",
    title:
      "Physicians for Human Rights Israel — Health and human-rights documentation",
    summary:
      "Physicians for Human Rights Israel documents the impact of conflict and occupation on health and access to healthcare, including attacks on medical staff, denial of medical access, and conditions of detainees. Its reporting has been used by UN bodies to assess health-related IHL concerns. PHRI's findings are organisational documentation — they are not judicial determinations.",
    category: "human-rights report",
    sourceIds: ["phri-israel-2024", "org-phri"],
    primarySourceType: "ngo",
    sourceQuality: 4,
    contentStatus: "reviewed",
    publicationDate: "2024",
    safeLocation: "Gaza / West Bank / Israel",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official PHRI reporting",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["PHRI", "health", "medical access", "detainees"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Reviewed parliamentary documents (M7-02)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "uk-arms-licence-suspension-2024-09",
    slug: "uk-arms-licence-suspension-2024-09",
    title:
      "UK Government — Suspension of certain arms export licences to Israel announced to Parliament (2 September 2024)",
    summary:
      "The UK government announced the suspension of around 30 of 350 arms export licences to Israel after a review found a clear risk the items could be used in serious violations of international humanitarian law. The review, announced to Parliament, suspended licences for items usable in the Gaza conflict while continuing parts for the F-35 programme under a global supply arrangement. The decision illustrates national implementation of arms-export risk assessment standards.",
    category: "parliamentary document",
    sourceIds: ["uk-fcdo-arms-2024-09"],
    primarySourceType: "government",
    sourceQuality: 5,
    contentStatus: "reviewed",
    publicationDate: "2024-09-02",
    safeLocation: "London / United Kingdom",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official UK government records",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["United Kingdom", "arms export", "licence suspension", "IHL risk"],
    relatedRoutes: ["/legal-tracker", "/methodology"],
  },
  {
    id: "es-settlement-purchase-ban-2024",
    slug: "es-settlement-purchase-ban-2024",
    title:
      "Government of Spain — Suspension of purchases from Israeli settlements (2024)",
    summary:
      "Spain's government agreed to stop buying goods and services from companies operating in Israeli settlements in the occupied Palestinian territory, citing the illegality of settlements under international law, and Spain formally recognised the State of Palestine in May 2024. The measure is a national policy decision implementing Spain's interpretation of international law, and was followed by Spain's support for the ICJ advisory opinion.",
    category: "parliamentary document",
    sourceIds: ["es-gov-settlement-ban-2024", "icj-advisory-opinion-2024-07"],
    primarySourceType: "government",
    sourceQuality: 5,
    contentStatus: "reviewed",
    publicationDate: "2024",
    safeLocation: "Madrid / Spain",
    sourceLanguage: "es",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official Spanish government records",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["Spain", "settlements", "trade ban", "recognition of Palestine"],
    relatedRoutes: ["/legal-tracker", "/methodology"],
  },
  {
    id: "ie-dail-gaza-debates-2024",
    slug: "ie-dail-gaza-debates-2024",
    title:
      "Houses of the Oireachtas — Dáil Éireann debates on Gaza and Ireland's ICJ intervention",
    summary:
      "Dáil Éireann and Oireachtas committees have held repeated debates and statements on the situation in Gaza, including Ireland's decision to intervene in South Africa's ICJ Genocide Convention case. Ireland recognised the State of Palestine in May 2024 and announced humanitarian funding increases. Parliamentary records are official public documents recording the positions and actions of the Irish state.",
    category: "parliamentary document",
    sourceIds: ["ie-dail-gaza-2024", "icj-interventions-2025-2026"],
    primarySourceType: "government",
    sourceQuality: 5,
    contentStatus: "reviewed",
    publicationDate: "2024",
    safeLocation: "Dublin / Ireland",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official Oireachtas records",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["Ireland", "parliament", "ICJ intervention", "recognition of Palestine"],
    relatedRoutes: ["/legal-tracker", "/methodology"],
  },
  {
    id: "eu-council-conclusions-2024-01",
    slug: "eu-council-conclusions-2024-01",
    title:
      "EU Foreign Affairs Council — Conclusions on the Middle East (22 January 2024)",
    summary:
      "The EU Foreign Affairs Council adopted conclusions calling for continuous, rapid, safe, and unhindered humanitarian access, an immediate humanitarian pause leading to a sustainable ceasefire, the unconditional release of all hostages, and full compliance with international humanitarian law by all parties. Council conclusions express the positions of EU member states and frame subsequent EU action, including the Article 2 Association Agreement review.",
    category: "parliamentary document",
    sourceIds: ["eu-council-conclusions-2024-01", "eu-commission-association-review-2025-06"],
    primarySourceType: "government",
    sourceQuality: 5,
    contentStatus: "reviewed",
    publicationDate: "2024-01-22",
    safeLocation: "Brussels / European Union",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official EU Council records",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["European Union", "Foreign Affairs Council", "humanitarian access", "ceasefire"],
    relatedRoutes: ["/institutions/european-union", "/legal-tracker", "/methodology"],
  },
  {
    id: "be-sanctions-package-2025-09",
    slug: "be-sanctions-package-2025-09",
    title:
      "Belgium — Council of Ministers sanctions package against Israel (September 2025)",
    summary:
      "In September 2025, Belgium's federal government adopted 12 measures targeting Israel, including asset freezes and entry bans against violent settlers and Hamas leaders, declaring far-right Israeli ministers persona non grata, expanding the arms embargo to all military goods and dual-use items, banning imports from Israeli settlements, and tasking the Federal Prosecutor to prosecute Belgian citizens implicated in serious IHL violations. The measures are government decisions adopted under federal competence.",
    category: "parliamentary document",
    sourceIds: ["belgium-sanctions-2025-09", "belgium-prevot-statement-2025-09"],
    primarySourceType: "government",
    sourceQuality: 5,
    contentStatus: "reviewed",
    publicationDate: "2025-09",
    safeLocation: "Brussels / Belgium",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — source records populated from official Belgian government records",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["Belgium", "sanctions", "arms embargo", "settler listings", "federal"],
    relatedRoutes: ["/countries/belgium", "/legal-tracker", "/methodology"],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Reviewed verified investigative reports (M7-02)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "ap-mass-graves-nasser-2024-04",
    slug: "ap-mass-graves-nasser-2024-04",
    title:
      "Associated Press investigation — Mass graves found at Nasser Hospital, Khan Younis (April 2024)",
    summary:
      "Following the withdrawal of Israeli forces from Khan Younis in April 2024, Palestinian teams and the UN reported the discovery of mass graves at Nasser Hospital. The Associated Press and other outlets investigated the mass graves, which became the subject of UN and international scrutiny and were cited in UN reporting on the conflict. Journalistic investigations describe reported events and do not establish legal responsibility.",
    category: "verified investigative report",
    sourceIds: ["ap-mass-graves-2024-04", "un-coi-2025-03"],
    primarySourceType: "journalism",
    sourceQuality: 3,
    contentStatus: "reviewed",
    incidentDate: "2024-04",
    publicationDate: "2024-04",
    safeLocation: "Khan Younis, Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — investigative reporting background",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["Associated Press", "mass graves", "Khan Younis", "investigation"],
    relatedRoutes: ["/gaza-dossier", "/legal-tracker", "/methodology"],
  },
  {
    id: "forensic-architecture-gaza-2024",
    slug: "forensic-architecture-gaza-2024",
    title:
      "Forensic Architecture — Open-source investigations into the destruction of Gaza",
    summary:
      "Forensic Architecture has produced open-source investigations using satellite imagery, spatial analysis, and testimony to document patterns of destruction in Gaza, including attacks on civilian infrastructure and populated areas. Its methodology is published transparently, and its work has been presented to UN bodies and used in legal and accountability processes.",
    category: "verified investigative report",
    sourceIds: ["forensic-architecture-gaza-2024", "org-forensic-architecture"],
    primarySourceType: "academic",
    sourceQuality: 4,
    contentStatus: "reviewed",
    publicationDate: "2024",
    safeLocation: "Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — investigative research background",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["Forensic Architecture", "OSINT", "satellite analysis", "open-source"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },
  {
    id: "bellingcat-gaza-open-source-2024",
    slug: "bellingcat-gaza-open-source-2024",
    title:
      "Bellingcat — Open-source verification of weapons and incidents in the Gaza conflict",
    summary:
      "Bellingcat has published open-source investigations into the Gaza conflict, including verification of weapons used, analysis of specific attacks, and documentation of damage to civilian infrastructure. Bellingcat publishes its methodology and underlying source material, and its work is used by researchers and human-rights organisations.",
    category: "verified investigative report",
    sourceIds: ["bellingcat-gaza-2024", "org-bellingcat"],
    primarySourceType: "osint",
    sourceQuality: 4,
    contentStatus: "reviewed",
    publicationDate: "2024",
    safeLocation: "Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — OSINT verification background",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["Bellingcat", "OSINT", "open-source verification", "weapons"],
    relatedRoutes: ["/gaza-dossier", "/organizations", "/methodology"],
  },
  {
    id: "lancet-gaza-mortality-estimate-2024-07",
    slug: "lancet-gaza-mortality-estimate-2024-07",
    title:
      "The Lancet correspondence — Projection of direct and indirect mortality in Gaza (July 2024)",
    summary:
      "A Lancet correspondence estimated that, in a projection accounting for both direct and indirect deaths, the cumulative death toll from the Gaza conflict could be as high as 186,000 people. The authors stated explicitly that this was an estimate with substantial uncertainty. The estimate has been widely cited and also critiqued. Academic estimates are analytical projections — they are not casualty registries and must be attributed as estimates, not as an established death toll.",
    category: "verified investigative report",
    sourceIds: ["lancet-gaza-mortality-2024-07", "ocha-opt-data"],
    primarySourceType: "academic",
    sourceQuality: 3,
    contentStatus: "reviewed",
    publicationDate: "2024-07",
    safeLocation: "Gaza",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — academic research background",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["The Lancet", "mortality estimate", "excess deaths", "academic"],
    relatedRoutes: ["/gaza-dossier", "/methodology", "/sources"],
  },
  {
    id: "reuters-icj-rafah-2024-05",
    slug: "reuters-icj-rafah-2024-05",
    title:
      "Reuters — Reporting on the ICJ order to halt the Rafah offensive (May 2024)",
    summary:
      "Reuters reported on the ICJ's 24 May 2024 additional provisional measures order requiring Israel to immediately halt its military offensive in Rafah and keep the Rafah crossing open for humanitarian assistance. The report describes the court's order and reactions to it. Journalism reports court rulings and events; they do not themselves constitute legal determinations.",
    category: "verified investigative report",
    sourceIds: ["reuters-icj-rafah-2024-05", "icj-2024-05-24"],
    primarySourceType: "journalism",
    sourceQuality: 4,
    contentStatus: "reviewed",
    publicationDate: "2024-05-24",
    safeLocation: "The Hague / Rafah",
    sourceLanguage: "en",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — investigative reporting background",
    version: 1,
    correctionUrl: "/corrections",
    tags: ["Reuters", "ICJ", "Rafah", "provisional measures"],
    relatedRoutes: ["/legal-tracker", "/gaza-dossier", "/methodology"],
  },
];

/** Convenience: items grouped by category. */
export function getEvidenceByCategory(): Record<
  EvidenceCategory,
  EvidenceItem[]
> {
  const grouped: Record<EvidenceCategory, EvidenceItem[]> = {} as Record<
    EvidenceCategory,
    EvidenceItem[]
  >;
  for (const cat of EVIDENCE_CATEGORIES) {
    grouped[cat] = [];
  }
  for (const item of evidenceItems) {
    grouped[item.category].push(item);
  }
  return grouped;
}

/** All unique source types present in the data, for filter controls. */
export function getAvailableSourceTypes(): string[] {
  const types = new Set(evidenceItems.map((item) => item.primarySourceType));
  return Array.from(types).sort();
}

/** All unique verification levels present, for filter controls. */
export function getAvailableVerificationLevels(): VerificationLevel[] {
  const levels = new Set(evidenceItems.map((item) => item.sourceQuality));
  return Array.from(levels).sort((a, b) => a - b);
}

/** All unique content statuses present, for filter controls. */
export function getAvailableContentStatuses(): ContentStatus[] {
  const statuses = new Set(evidenceItems.map((item) => item.contentStatus));
  return Array.from(statuses).sort();
}

/** Lookup an evidence item by its URL slug. */
export function getEvidenceBySlug(slug: string): EvidenceItem | undefined {
  return evidenceItems.find((item) => item.slug === slug);
}
