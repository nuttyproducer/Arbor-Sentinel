import type { ContentStatus } from "../types/content";

export interface InstitutionEntry {
  id: string;
  name: string;
  acronym?: string;
  role: string;
  competency: string;
  trackingNote: string;
  status: ContentStatus;
}

export const euInstitutions: InstitutionEntry[] = [
  {
    id: "european-council",
    name: "European Council",
    role:
      "Defines the EU's overall political direction and priorities. Composed of heads of state or government of EU member states.",
    competency:
      "Sets strategic agenda; does not legislate. Decisions often require consensus or unanimity on foreign policy matters.",
    trackingNote:
      "This page will track European Council conclusions, statements, and positions relevant to international humanitarian law, accountability, and restrictive measures.",
    status: "review_pending",
  },
  {
    id: "european-commission",
    name: "European Commission",
    role:
      "Proposes and enforces EU legislation, manages trade policy, administers humanitarian aid and neighbourhood policy.",
    competency:
      "Exclusive right of legislative initiative in most areas. Manages the EU budget including humanitarian aid funding. Negotiates trade agreements on behalf of member states.",
    trackingNote:
      "This page will track Commission decisions, aid allocations, trade measures, and recommendations relevant to accountability and humanitarian response.",
    status: "review_pending",
  },
  {
    id: "european-parliament",
    name: "European Parliament",
    role:
      "Co-legislator with the Council, budgetary authority, and democratic oversight body. Directly elected by EU citizens.",
    competency:
      "Adopts resolutions, approves the EU budget, holds hearings, and exercises scrutiny over the Commission and External Action Service.",
    trackingNote:
      "This page will track relevant Parliament resolutions, hearing records, and MEP contact routes for citizens.",
    status: "review_pending",
  },
  {
    id: "eeas",
    name: "European External Action Service (EEAS)",
    role:
      "The EU's diplomatic service. Implements the EU's Common Foreign and Security Policy under the High Representative.",
    competency:
      "Manages EU diplomatic missions, conducts political dialogue with third countries, and coordinates member state foreign policy positions where agreed.",
    trackingNote:
      "This page will track EEAS statements, diplomatic démarches, and human-rights dialogue outcomes.",
    status: "review_pending",
  },
  {
    id: "association-agreement",
    name: "EU-Israel Association Agreement",
    role:
      "The legal framework governing EU-Israel trade, political dialogue, and cooperation since 2000.",
    competency:
      "The Agreement includes a human-rights clause (Article 2). The European Commission and member states can review or suspend the Agreement under defined procedures, which require unanimity in the Council.",
    trackingNote:
      "This section will explain the Association Agreement's relevance to accountability discussions — including its human-rights provisions, review mechanisms, and the distinction between suspension procedures and trade measures.",
    status: "static_preview",
  },
];

// ── Institution index entries ──────────────────────────────────────────────

export interface InstitutionIndexEntry {
  id: string;
  slug: string;
  name: string;
  acronym?: string;
  entityType: "institution";
  region: string;
  route: string;
  contentStatus: ContentStatus;
  summary: string;
  /** IDs of source records supporting the summary and position data. */
  sourceIds?: string[];
  lastReviewedAt?: string;
  /** Role that performed the last review — not a personal name. */
  reviewedByRole?: string;
  version: number;
  active: boolean;
}

/**
 * All institution entities with an active route.
 * During the static beta, institution pages are structural index entries with
 * source-linked summaries; detailed position records live in
 * institutionAccountabilityData.ts (mirroring euData.ts).
 */
export const institutionIndexEntries: InstitutionIndexEntry[] = [
  {
    id: "european-union",
    slug: "european-union",
    name: "European Union",
    acronym: "EU",
    entityType: "institution",
    region: "Europe",
    route: "/institutions/european-union",
    contentStatus: "reviewed",
    summary:
      "The European Union is a significant actor in foreign policy, trade, humanitarian aid, and arms-export regulation. This page tracks EU-level mechanisms — Commission, Council, Parliament, EEAS — and distinguishes them from member-state competencies. In 2025 the EU reviewed Israel's compliance with Article 2 of the Association Agreement and proposed the partial suspension of trade provisions and new human-rights sanctions listings.",
    sourceIds: [
      "eu-commission-association-review-2025-06",
      "eu-commission-sanctions-proposal-2025-09",
      "eu-echo-hip-2026",
      "eu-parliament-resolution-2025-09",
    ],
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 2,
    active: true,
  },
  {
    id: "icj",
    slug: "icj",
    name: "International Court of Justice",
    acronym: "ICJ",
    entityType: "institution",
    region: "International",
    route: "/institutions/icj",
    contentStatus: "reviewed",
    summary:
      "The International Court of Justice is the principal judicial organ of the United Nations. In the Gaza context it has issued three binding provisional measures orders in the South Africa v. Israel Genocide Convention case and delivered a landmark advisory opinion in July 2024 finding Israel's continued presence in the Occupied Palestinian Territory unlawful.",
    sourceIds: [
      "icj-2024-01-26",
      "icj-2024-05-24",
      "icj-advisory-opinion-2024-07",
      "icj-case-192",
    ],
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    active: true,
  },
  {
    id: "icc",
    slug: "icc",
    name: "International Criminal Court",
    acronym: "ICC",
    entityType: "institution",
    region: "International",
    route: "/institutions/icc",
    contentStatus: "reviewed",
    summary:
      "The International Criminal Court prosecutes individuals for genocide, war crimes, and crimes against humanity. Pre-Trial Chamber I has an open situation in the State of Palestine and issued arrest warrants in November 2024 for Benjamin Netanyahu, Yoav Gallant, and Mohammed Deif (the Deif warrant was terminated after his death). Arrest warrants are not convictions.",
    sourceIds: [
      "icc-palestine-2024",
      "icc-arrest-warrants-2024-11",
      "icc-deif-warrant-cancelled-2025",
    ],
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    active: true,
  },
  {
    id: "un-human-rights-council",
    slug: "un-human-rights-council",
    name: "UN Human Rights Council",
    acronym: "UNHRC",
    entityType: "institution",
    region: "International — United Nations",
    route: "/institutions/un-human-rights-council",
    contentStatus: "reviewed",
    summary:
      "The UN Human Rights Council mandated the Independent International Commission of Inquiry on the Occupied Palestinian Territory, including East Jerusalem, and Israel, which has documented alleged violations of international humanitarian law and human rights law, including a June 2026 report on crimes against Palestinian children.",
    sourceIds: [
      "un-coi-2024",
      "un-coi-2025-03",
      "un-coi-2026-children",
    ],
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    active: true,
  },
  {
    id: "un-ocha",
    slug: "un-ocha",
    name: "UN Office for the Coordination of Humanitarian Affairs",
    acronym: "OCHA",
    entityType: "institution",
    region: "International — United Nations",
    route: "/institutions/un-ocha",
    contentStatus: "reviewed",
    summary:
      "The UN Office for the Coordination of Humanitarian Affairs coordinates the humanitarian response in the occupied Palestinian territory, publishes situation reports, and tracks access restrictions and casualties. Its reporting documents humanitarian conditions and constraints, including water, food insecurity, and displacement data.",
    sourceIds: [
      "ocha-opt-main",
      "ocha-opt-sitrep-2026-07-10",
      "ocha-opt-data",
    ],
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — humanitarian research background",
    version: 1,
    active: true,
  },
  {
    id: "unrwa",
    slug: "unrwa",
    name: "UN Relief and Works Agency for Palestine Refugees",
    acronym: "UNRWA",
    entityType: "institution",
    region: "International — United Nations",
    route: "/institutions/unrwa",
    contentStatus: "reviewed",
    summary:
      "The UN Relief and Works Agency for Palestine Refugees provides education, health, relief, and social services to Palestine refugees and is a central humanitarian actor in Gaza. Its operational reporting documents humanitarian conditions and attacks on UN personnel and facilities.",
    sourceIds: [
      "unrwa-gaza-emergency-2025",
      "org-unrwa",
    ],
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — humanitarian research background",
    version: 1,
    active: true,
  },
  {
    id: "ohchr",
    slug: "ohchr",
    name: "UN Office of the High Commissioner for Human Rights",
    acronym: "OHCHR",
    entityType: "institution",
    region: "International — United Nations",
    route: "/institutions/ohchr",
    contentStatus: "reviewed",
    summary:
      "The UN Office of the High Commissioner for Human Rights supports the Commission of Inquiry, issues human-rights reporting, and documents alleged violations in the occupied Palestinian territory. Its mandate covers human-rights monitoring, reporting, and technical assistance.",
    sourceIds: [
      "un-coi-2024",
      "un-coi-2026-children",
    ],
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    active: true,
  },
  {
    id: "un-general-assembly",
    slug: "un-general-assembly",
    name: "United Nations General Assembly",
    acronym: "UNGA",
    entityType: "institution",
    region: "International — United Nations",
    route: "/institutions/un-general-assembly",
    contentStatus: "reviewed",
    summary:
      "The UN General Assembly has adopted emergency special-session resolutions on Gaza, including ES-10/21 and ES-10/22 calling for a ceasefire and the release of hostages, and ES-10/24 demanding implementation of the ICJ advisory opinion on the illegality of the occupation. General Assembly resolutions are not legally binding but express the collective position of member states.",
    sourceIds: [
      "un-unga-es10-21-2023",
      "un-unga-es10-22-2023-12",
      "un-unga-es10-24-2024-09",
    ],
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    active: true,
  },
  {
    id: "who",
    slug: "who",
    name: "World Health Organization",
    acronym: "WHO",
    entityType: "institution",
    region: "International — United Nations",
    route: "/institutions/who",
    contentStatus: "reviewed",
    summary:
      "The World Health Organization documents the health impact of the conflict in the occupied Palestinian territory, including attacks on healthcare, disease outbreaks, malnutrition, and the collapse of health infrastructure. Its reporting is a technical health-sector source that does not make legal determinations.",
    sourceIds: [
      "who-opt-report-2025",
      "who-kamal-adwan-2024-12",
      "org-who",
    ],
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — humanitarian research background",
    version: 1,
    active: true,
  },
];

/** Convenience: active institution entries only. */
export function getActiveInstitutionEntries(): InstitutionIndexEntry[] {
  return institutionIndexEntries.filter((e) => e.active);
}

/** Convenience: institution lookup by slug. */
export function getInstitutionEntryBySlug(
  slug: string,
): InstitutionIndexEntry | undefined {
  return institutionIndexEntries.find((e) => e.slug === slug);
}
