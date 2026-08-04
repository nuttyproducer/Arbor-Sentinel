import type { ContentStatus } from "../types/content";

export interface CountrySection {
  id: string;
  title: string;
  description: string;
  status: ContentStatus;
  statusLabel?: string;
}

export const belgiumSections: CountrySection[] = [
  {
    id: "federal-position",
    title: "Current Federal Position",
    description:
      "This section will track the Belgian federal government's public statements, diplomatic positions, and policy actions relevant to international humanitarian law, accountability processes, and civilian protection.",
    status: "review_pending",
    statusLabel: "Content under review",
  },
  {
    id: "un-voting",
    title: "UN Voting Record",
    description:
      "This section will document Belgium's voting record and statements at the UN General Assembly, Security Council (when Belgium serves), and Human Rights Council on resolutions relevant to civilian protection, humanitarian access, and accountability.",
    status: "review_pending",
    statusLabel: "Content under review",
  },
  {
    id: "eu-role",
    title: "EU Role",
    description:
      "Belgium is a founding EU member state and hosts the EU institutions in Brussels. This section will track Belgium's positions within EU foreign policy, trade, and restrictive-measure discussions. Belgium participates in EU decision-making but does not unilaterally control EU institutions.",
    status: "review_pending",
    statusLabel: "Content under review",
  },
  {
    id: "arms-transfer",
    title: "Arms-Transfer / Export Review",
    description:
      "Belgium has a federal licensing system for arms exports, with regional competencies in Flanders, Wallonia, and Brussels-Capital. This section will track arms-export licences, parliamentary scrutiny, and relevant legal challenges.",
    status: "review_pending",
    statusLabel: "Source pending",
  },
  {
    id: "humanitarian-aid",
    title: "Humanitarian Aid",
    description:
      "This section will track Belgium's bilateral humanitarian aid commitments, contributions to UN and EU humanitarian mechanisms, and public statements on humanitarian access and funding.",
    status: "review_pending",
    statusLabel: "Content under review",
  },
  {
    id: "icc-icj",
    title: "ICC / ICJ Cooperation",
    description:
      "Belgium is a State Party to the Rome Statute of the ICC and has obligations under the Genocide Convention. This section will track official statements, cooperation with international courts, and domestic legal implementation.",
    status: "review_pending",
    statusLabel: "Content under review",
  },
  {
    id: "competencies",
    title: "Federal & Regional Competencies",
    description:
      "Belgium is a federal state. Foreign policy, defence, and international treaty obligations are primarily federal competencies. Trade promotion, arms-export licensing, and some humanitarian cooperation involve regional governments (Flanders, Wallonia, Brussels-Capital). This section explains the division of responsibilities relevant to accountability tracking.",
    status: "static_preview",
    statusLabel: "Competency framework",
  },
  {
    id: "representatives",
    title: "Representatives & Contact Routes",
    description:
      "This section will list federal and regional representatives, official contact channels, and parliamentary committee routes — without publishing private contact data.",
    status: "review_pending",
    statusLabel: "Content under review",
  },
  {
    id: "action-templates",
    title: "Action Templates",
    description:
      "This section will link to lawful, sourced templates for contacting Belgian representatives and institutions once the Action Hub is available.",
    status: "review_pending",
    statusLabel: "Future feature",
  },
];

// ── Country index entries ─────────────────────────────────────────────────

export interface CountryEntry {
  id: string;
  slug: string;
  name: string;
  entityType: "country";
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
 * All country entities with an active route.
 * During the static beta, country pages are structural index entries with
 * source-linked summaries; detailed position, vote, arms, aid, and contact
 * records live in countryAccountabilityData.ts (mirroring belgiumData.ts).
 */
export const countries: CountryEntry[] = [
  {
    id: "belgium",
    slug: "belgium",
    name: "Belgium",
    entityType: "country",
    region: "Europe — European Union",
    route: "/countries/belgium",
    contentStatus: "reviewed",
    summary:
      "Belgium is the first country accountability page. It tracks federal positions, UN voting, arms-transfer review, humanitarian aid, and ICC/ICJ cooperation — with clear federal/regional competency boundaries. Belgium hosts the EU institutions and NATO headquarters in Brussels. Belgium adopted a 12-measure sanctions package against Israel in September 2025, filed an Article 63 ICJ intervention in December 2025, and banned military air cargo to Israel by royal decree in January 2026.",
    sourceIds: [
      "belgium-sanctions-2025-09",
      "belgium-icj-intervention-2025",
      "belgium-airspace-ban-2026-01",
      "belgium-flanders-court-2025-07",
    ],
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 2,
    active: true,
  },
  {
    id: "netherlands",
    slug: "netherlands",
    name: "Netherlands",
    entityType: "country",
    region: "Europe — European Union",
    route: "/countries/netherlands",
    contentStatus: "reviewed",
    summary:
      "The Netherlands is an EU member state whose arms-export decisions regarding Israel have been the subject of landmark litigation. In February 2024, the Hague District Court ordered the Dutch State to halt exports of F-35 fighter jet parts to Israel over the risk of serious IHL violations; the Court of Appeal reversed that ruling in September 2024. The Netherlands voted in favour of UN General Assembly ceasefire resolutions and hosts the International Court of Justice in The Hague.",
    sourceIds: [
      "nl-hague-district-court-f35-2024-02",
      "nl-hague-court-appeal-f35-2024-09",
      "un-unga-es10-24-2024-09",
    ],
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    active: true,
  },
  {
    id: "spain",
    slug: "spain",
    name: "Spain",
    entityType: "country",
    region: "Europe — European Union",
    route: "/countries/spain",
    contentStatus: "reviewed",
    summary:
      "Spain formally recognised the State of Palestine in May 2024 and has suspended purchases of goods and services from Israeli settlements. The Spanish government announced a halt to arms sales to Israel and voted in favour of UN General Assembly resolutions on a ceasefire and implementation of the ICJ advisory opinion. Spain's measures implement its interpretation of international law.",
    sourceIds: [
      "spain-palestine-recognition-2024-05",
      "es-gov-settlement-ban-2024",
      "un-unga-es10-24-2024-09",
    ],
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    active: true,
  },
  {
    id: "ireland",
    slug: "ireland",
    name: "Ireland",
    entityType: "country",
    region: "Europe — European Union",
    route: "/countries/ireland",
    contentStatus: "reviewed",
    summary:
      "Ireland formally recognised the State of Palestine in May 2024 and filed a declaration of intervention under Article 63 of the ICJ Statute in the South Africa v. Israel Genocide Convention case in January 2025. Dáil Éireann has held repeated debates on Gaza, and Ireland has increased humanitarian funding for the Palestinian people.",
    sourceIds: [
      "ireland-palestine-recognition-2024-05",
      "ie-dail-gaza-2024",
      "icj-interventions-2025-2026",
    ],
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    active: true,
  },
  {
    id: "norway",
    slug: "norway",
    name: "Norway",
    entityType: "country",
    region: "Europe",
    route: "/countries/norway",
    contentStatus: "reviewed",
    summary:
      "Norway formally recognised the State of Palestine in May 2024, acting alongside Spain and Ireland. Norway is a significant humanitarian donor to Gaza and UNRWA and voted in favour of UN General Assembly resolutions on a ceasefire and implementation of the ICJ advisory opinion.",
    sourceIds: [
      "norway-palestine-recognition-2024-05",
      "un-unga-es10-24-2024-09",
      "unrwa-gaza-emergency-2025",
    ],
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    active: true,
  },
  {
    id: "united-kingdom",
    slug: "united-kingdom",
    name: "United Kingdom",
    entityType: "country",
    region: "Europe",
    route: "/countries/united-kingdom",
    contentStatus: "reviewed",
    summary:
      "The United Kingdom suspended around 30 arms export licences to Israel in September 2024 after its review found a clear risk the items could be used in serious violations of international humanitarian law. The UK has been a key diplomatic actor on the conflict; its voting record on UN General Assembly ceasefire resolutions has varied by resolution and requires per-resolution verification.",
    sourceIds: [
      "uk-fcdo-arms-2024-09",
    ],
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    active: true,
  },
  {
    id: "france",
    slug: "france",
    name: "France",
    entityType: "country",
    region: "Europe — European Union",
    route: "/countries/france",
    contentStatus: "reviewed",
    summary:
      "France co-signed the New York Declaration with Belgium and Saudi Arabia in September 2025 signalling a coordinated approach to recognising the State of Palestine. France voted in favour of UN General Assembly resolutions calling for a humanitarian ceasefire and has called for a two-state solution. France's position on arms transfers and formal recognition continues to evolve and requires verification.",
    sourceIds: [
      "france-recognition-initiative-2025-09",
      "un-unga-es10-21-2023",
    ],
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    active: true,
  },
  {
    id: "germany",
    slug: "germany",
    name: "Germany",
    entityType: "country",
    region: "Europe — European Union",
    route: "/countries/germany",
    contentStatus: "reviewed",
    summary:
      "Germany filed a declaration of intervention under Article 63 of the ICJ Statute in the South Africa v. Israel Genocide Convention case, taking a position on the interpretation of the Convention that rejects the genocide allegation. Germany temporarily suspended then resumed UNRWA funding and has been a major provider of humanitarian aid, while maintaining that Israel's right to self-defence must be respected.",
    sourceIds: [
      "germany-icj-intervention-2025-01",
      "unrwa-gaza-emergency-2025",
    ],
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    active: true,
  },
  {
    id: "south-africa",
    slug: "south-africa",
    name: "South Africa",
    entityType: "country",
    region: "Africa",
    route: "/countries/south-africa",
    contentStatus: "reviewed",
    summary:
      "South Africa instituted proceedings against Israel before the International Court of Justice on 29 December 2023, alleging violations of the Genocide Convention, and has led the case that has resulted in three binding provisional measures orders. South Africa voted in favour of UN General Assembly resolutions on a ceasefire and implementation of the ICJ advisory opinion.",
    sourceIds: [
      "south-africa-icj-application-2023-12",
      "icj-2024-01-26",
      "un-unga-es10-24-2024-09",
    ],
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — legal research background",
    version: 1,
    active: true,
  },
];

/** Convenience: active countries only. */
export function getActiveCountries(): CountryEntry[] {
  return countries.filter((c) => c.active);
}

/** Convenience: country lookup by slug. */
export function getCountryBySlug(slug: string): CountryEntry | undefined {
  return countries.find((c) => c.slug === slug);
}
