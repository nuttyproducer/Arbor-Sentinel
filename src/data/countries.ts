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
  lastReviewedAt?: string;
  version: number;
  active: boolean;
}

/** All country entities with an active route. Only Belgium during the static beta. */
export const countries: CountryEntry[] = [
  {
    id: "belgium",
    slug: "belgium",
    name: "Belgium",
    entityType: "country",
    region: "Europe — European Union",
    route: "/countries/belgium",
    contentStatus: "review_pending",
    summary:
      "Belgium is the first country accountability page. It tracks federal positions, UN voting, arms-transfer review, humanitarian aid, and ICC/ICJ cooperation — with clear federal/regional competency boundaries. Belgium hosts the EU institutions and NATO headquarters in Brussels.",
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
