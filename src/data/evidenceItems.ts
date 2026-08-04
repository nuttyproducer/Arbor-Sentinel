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
