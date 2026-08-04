import type { ContentStatus } from "../types/content";

/**
 * Organization categories for the public resource directory.
 * These describe the primary function of each listed organization.
 */
export type OrganizationCategory =
  | "UN and humanitarian"
  | "Red Cross / Red Crescent"
  | "medical"
  | "legal and human rights"
  | "documentation and data"
  | "journalism and press freedom"
  | "academic and research";

export const ORGANIZATION_CATEGORIES: OrganizationCategory[] = [
  "UN and humanitarian",
  "Red Cross / Red Crescent",
  "medical",
  "legal and human rights",
  "documentation and data",
  "journalism and press freedom",
  "academic and research",
];

/**
 * Relationship status for the static beta.
 * All listed organizations are public resources only.
 * No partnership, endorsement, or affiliation is implied.
 */
export type RelationshipStatus = "public_resource";

export const RELATIONSHIP_STATUS_LABEL: Record<RelationshipStatus, string> = {
  public_resource: "Public resource",
};

export interface OrganizationRecord {
  id: string;
  slug: string;
  name: string;
  category: OrganizationCategory;
  regions: string[];
  shortDescription: string;
  officialWebsite: string;
  officialDonationUrl?: string;
  services?: string[];
  relationshipStatus: RelationshipStatus;
  contentStatus: ContentStatus;
  sourceIds: string[];
  /** When the official website URL was last verified as resolving correctly. */
  officialWebsiteCheckedAt?: string;
  /** When the official donation URL was last verified as resolving correctly. */
  officialDonationUrlCheckedAt?: string;
  lastReviewedAt?: string;
  reviewedByRole?: string;
  version: number;
  correctionUrl: string;
  reviewNotes?: string;
}

/**
 * A small, carefully selected sample of organizations with official
 * public websites. Every entry is a real organization whose public
 * website confirms the information listed here.
 *
 * Listing does not imply partnership, endorsement, approval, or
 * affiliation. Donation links point directly to the named
 * organization. Accountability Atlas does not process, hold, or
 * distribute funds.
 */
export const organizationRecords: OrganizationRecord[] = [
  // ── UN and humanitarian ────────────────────────────────────────────
  {
    id: "unrwa",
    slug: "unrwa",
    name: "UNRWA (United Nations Relief and Works Agency)",
    category: "UN and humanitarian",
    regions: ["Gaza", "West Bank", "Jordan", "Lebanon", "Syria"],
    shortDescription:
      "UN agency established in 1949 providing education, healthcare, relief, and social services to Palestine refugees across five fields of operation. UNRWA is a major humanitarian actor in Gaza and the wider region.",
    officialWebsite: "https://www.unrwa.org/",
    officialDonationUrl: "https://donate.unrwa.org/",
    officialDonationUrlCheckedAt: "2026-07-24",
    services: [
      "Primary and secondary education",
      "Primary healthcare and medical services",
      "Emergency food and cash assistance",
      "Shelter and infrastructure repair",
      "Microfinance and poverty alleviation",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "review_pending",
    sourceIds: ["org-unrwa"],
    officialWebsiteCheckedAt: "2026-07-24",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Contributor — sourceId populated from official UNRWA website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-24.",
  },
  {
    id: "ocha-opt",
    slug: "ocha-opt",
    name: "UN OCHA (Office for the Coordination of Humanitarian Affairs) — oPt",
    category: "UN and humanitarian",
    regions: ["Gaza", "West Bank"],
    shortDescription:
      "UN OCHA's occupied Palestinian territory office coordinates humanitarian response, publishes situation reports, tracks access restrictions, and manages the humanitarian notification system.",
    officialWebsite: "https://www.ochaopt.org/",
    services: [
      "Humanitarian coordination and planning",
      "Situation reporting and data collection",
      "Access monitoring and casualty tracking",
      "Humanitarian funding tracking",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "review_pending",
    sourceIds: ["org-ocha"],
    officialWebsiteCheckedAt: "2026-07-24",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Contributor — sourceId populated from official UN OCHA website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-24.",
  },
  {
    id: "wfp",
    slug: "wfp",
    name: "World Food Programme (WFP)",
    category: "UN and humanitarian",
    regions: ["Gaza", "West Bank", "Global"],
    shortDescription:
      "The UN's food-assistance branch and the world's largest humanitarian organization addressing hunger. WFP delivers emergency food aid during crises including in Gaza.",
    officialWebsite: "https://www.wfp.org/",
    officialDonationUrl: "https://www.wfp.org/donate",
    officialDonationUrlCheckedAt: "2026-07-24",
    services: [
      "Emergency food distribution",
      "Nutrition programmes for children",
      "Logistics and supply-chain support",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "review_pending",
    sourceIds: ["org-wfp"],
    officialWebsiteCheckedAt: "2026-07-24",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Contributor — sourceId populated from official WFP website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-24.",
  },

  // ── Red Cross / Red Crescent ───────────────────────────────────────
  {
    id: "icrc",
    slug: "icrc",
    name: "ICRC (International Committee of the Red Cross)",
    category: "Red Cross / Red Crescent",
    regions: ["Global", "Gaza", "West Bank", "Israel"],
    shortDescription:
      "The ICRC is an independent, neutral organisation ensuring humanitarian protection and assistance for victims of armed conflict. It operates under the Geneva Conventions and provides medical care, water, and family-reunification services in Gaza.",
    officialWebsite: "https://www.icrc.org/",
    officialDonationUrl: "https://www.icrc.org/en/donate",
    officialDonationUrlCheckedAt: "2026-07-24",
    services: [
      "War surgery and medical support",
      "Water and sanitation in conflict zones",
      "Detention visits under international humanitarian law",
      "Family reunification and tracing",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "review_pending",
    sourceIds: ["org-icrc"],
    officialWebsiteCheckedAt: "2026-07-24",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Contributor — sourceId populated from official website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. Downgraded from reviewed to review_pending (2026-07-13): sourceIds must be populated and a second reviewer must confirm before returning to reviewed status.",
  },
  {
    id: "prcs",
    slug: "prcs",
    name: "Palestine Red Crescent Society (PRCS)",
    category: "Red Cross / Red Crescent",
    regions: ["Gaza", "West Bank"],
    shortDescription:
      "The PRCS is the national Red Crescent society for Palestine and part of the International Red Cross and Red Crescent Movement. It provides emergency medical services, ambulance transport, and primary healthcare.",
    officialWebsite: "https://www.palestinercs.org/",
    officialDonationUrl: "https://www.palestinercs.org/en/donate",
    officialDonationUrlCheckedAt: "2026-07-24",
    services: [
      "Emergency medical and ambulance services",
      "Primary healthcare and rehabilitation",
      "Psychosocial support",
      "Disaster response",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "review_pending",
    sourceIds: ["org-prcs"],
    officialWebsiteCheckedAt: "2026-07-24",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Contributor — sourceId populated from official website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. Downgraded from reviewed to review_pending (2026-07-13): sourceIds must be populated and a second reviewer must confirm before returning to reviewed status.",
  },

  // ── Medical ─────────────────────────────────────────────────────────
  {
    id: "msf",
    slug: "msf",
    name: "Médecins Sans Frontières (MSF / Doctors Without Borders)",
    category: "medical",
    regions: ["Global", "Gaza", "West Bank"],
    shortDescription:
      "MSF is an independent international medical humanitarian organisation that delivers emergency medical care to people affected by armed conflict, epidemics, and disasters. MSF runs clinics, supports hospitals, and provides surgical care in Gaza.",
    officialWebsite: "https://www.msf.org/",
    officialDonationUrl: "https://www.msf.org/donate",
    officialDonationUrlCheckedAt: "2026-07-24",
    services: [
      "Emergency and trauma surgery",
      "Primary and secondary healthcare",
      "Mental health and psychosocial support",
      "Vaccination and disease-outbreak response",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "review_pending",
    sourceIds: ["org-msf"],
    officialWebsiteCheckedAt: "2026-07-24",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Contributor — sourceId populated from official website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. Downgraded from reviewed to review_pending (2026-07-13): sourceIds must be populated and a second reviewer must confirm before returning to reviewed status.",
  },
  {
    id: "map-uk",
    slug: "map-uk",
    name: "Medical Aid for Palestinians (MAP)",
    category: "medical",
    regions: ["Gaza", "West Bank", "Lebanon"],
    shortDescription:
      "MAP is a UK-based charity working for the health and dignity of Palestinians living under occupation and as refugees. It provides medical aid, supports local health services, and advocates for health rights.",
    officialWebsite: "https://www.map.org.uk/",
    officialDonationUrl: "https://www.map.org.uk/donate",
    officialDonationUrlCheckedAt: "2026-07-24",
    services: [
      "Medical supplies and equipment to hospitals",
      "Mobile clinics and community health programmes",
      "Surgical training and capacity building",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "review_pending",
    sourceIds: ["org-map"],
    officialWebsiteCheckedAt: "2026-07-24",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Contributor — sourceId populated from official website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. Downgraded from reviewed to review_pending (2026-07-13): sourceIds must be populated and a second reviewer must confirm before returning to reviewed status.",
  },

  // ── Legal and human rights ──────────────────────────────────────────
  {
    id: "amnesty",
    slug: "amnesty",
    name: "Amnesty International",
    category: "legal and human rights",
    regions: ["Global", "Gaza", "West Bank", "Israel"],
    shortDescription:
      "Amnesty International is a global human-rights movement that researches, documents, and campaigns against human-rights abuses. It publishes regular reports on international humanitarian law compliance, arms transfers, and civilian harm.",
    officialWebsite: "https://www.amnesty.org/",
    officialDonationUrl: "https://www.amnesty.org/en/donate/",
    officialDonationUrlCheckedAt: "2026-07-24",
    services: [
      "Human-rights research and reporting",
      "Advocacy and campaigning",
      "Legal analysis of international law compliance",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "review_pending",
    sourceIds: ["org-amnesty"],
    officialWebsiteCheckedAt: "2026-07-24",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Contributor — sourceId populated from official website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. Downgraded from reviewed to review_pending (2026-07-13): sourceIds must be populated and a second reviewer must confirm before returning to reviewed status.",
  },
  {
    id: "hrw",
    slug: "hrw",
    name: "Human Rights Watch (HRW)",
    category: "legal and human rights",
    regions: ["Global", "Gaza", "West Bank", "Israel"],
    shortDescription:
      "HRW is an independent international human-rights organisation that investigates and reports on abuses worldwide. It publishes detailed documentation on civilian harm, weapons use, and compliance with international humanitarian law.",
    officialWebsite: "https://www.hrw.org/",
    officialDonationUrl: "https://www.hrw.org/donate",
    officialDonationUrlCheckedAt: "2026-07-24",
    services: [
      "Human-rights documentation and investigation",
      "Arms and conflict research",
      "International law and policy analysis",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "review_pending",
    sourceIds: ["org-hrw"],
    officialWebsiteCheckedAt: "2026-07-24",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Contributor — sourceId populated from official website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. Downgraded from reviewed to review_pending (2026-07-13): sourceIds must be populated and a second reviewer must confirm before returning to reviewed status.",
  },

  // ── Documentation and data ──────────────────────────────────────────
  {
    id: "btselem",
    slug: "btselem",
    name: "B'Tselem — The Israeli Information Center for Human Rights in the Occupied Territories",
    category: "documentation and data",
    regions: ["Gaza", "West Bank", "Israel"],
    shortDescription:
      "B'Tselem is an Israeli human-rights organisation that documents human-rights violations in the occupied territories. It publishes data on casualties, displacement, demolitions, and settlement expansion using verified field research.",
    officialWebsite: "https://www.btselem.org/",
    officialDonationUrl: "https://www.btselem.org/donate",
    officialDonationUrlCheckedAt: "2026-07-24",
    services: [
      "Documentation of human-rights violations",
      "Casualty and displacement data collection",
      "Public reporting and advocacy",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "review_pending",
    sourceIds: ["org-btselem"],
    officialWebsiteCheckedAt: "2026-07-24",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Contributor — sourceId populated from official website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. Downgraded from reviewed to review_pending (2026-07-13): sourceIds must be populated and a second reviewer must confirm before returning to reviewed status.",
  },
  {
    id: "airwars",
    slug: "airwars",
    name: "Airwars",
    category: "documentation and data",
    regions: ["Global", "Gaza"],
    shortDescription:
      "Airwars is a UK-based civilian-harm monitoring organisation that tracks, assesses, and archives civilian-harm claims from international military actions. It maintains transparent, open-source methodology and publishes all data.",
    officialWebsite: "https://airwars.org/",
    services: [
      "Civilian casualty monitoring and archiving",
      "Open-source incident documentation",
      "Transparent methodology and published datasets",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "review_pending",
    sourceIds: ["org-airwars"],
    officialWebsiteCheckedAt: "2026-07-24",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Contributor — sourceId populated from official website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. Downgraded from reviewed to review_pending (2026-07-13): sourceIds must be populated and a second reviewer must confirm before returning to reviewed status.",
  },

  // ── Journalism and press freedom ────────────────────────────────────
  {
    id: "cpj",
    slug: "cpj",
    name: "Committee to Protect Journalists (CPJ)",
    category: "journalism and press freedom",
    regions: ["Global", "Gaza"],
    shortDescription:
      "CPJ is an independent non-profit organisation that promotes press freedom and defends the rights of journalists. It documents journalist casualties, detentions, and press-freedom violations worldwide.",
    officialWebsite: "https://cpj.org/",
    officialDonationUrl: "https://cpj.org/donate/",
    officialDonationUrlCheckedAt: "2026-07-24",
    services: [
      "Journalist casualty and detention tracking",
      "Press-freedom advocacy",
      "Emergency assistance for journalists at risk",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "review_pending",
    sourceIds: ["org-cpj"],
    officialWebsiteCheckedAt: "2026-07-24",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Contributor — sourceId populated from official website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. Downgraded from reviewed to review_pending (2026-07-13): sourceIds must be populated and a second reviewer must confirm before returning to reviewed status.",
  },

  // ── Academic and research ───────────────────────────────────────────
  {
    id: "forensic-architecture",
    slug: "forensic-architecture",
    name: "Forensic Architecture",
    category: "academic and research",
    regions: ["Global", "Gaza", "West Bank"],
    shortDescription:
      "Forensic Architecture is a research group based at Goldsmiths, University of London, that uses architectural and spatial analysis techniques to investigate human-rights violations. Its work has been presented in international courts and UN proceedings.",
    officialWebsite: "https://forensic-architecture.org/",
    services: [
      "Spatial and architectural analysis of conflict events",
      "Open-source evidence reconstruction",
      "Submissions to international courts and UN bodies",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "review_pending",
    sourceIds: ["org-forensic-architecture"],
    officialWebsiteCheckedAt: "2026-07-24",
    lastReviewedAt: "2026-07-24",
    reviewedByRole: "Contributor — sourceId populated from official website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. Downgraded from reviewed to review_pending (2026-07-13): sourceIds must be populated and a second reviewer must confirm before returning to reviewed status.",
  },
];

/** Look up an organization by its URL slug. */
export function getOrganizationBySlug(slug: string): OrganizationRecord | undefined {
  return organizationRecords.find((o) => o.slug === slug);
}

/** Convenience: records grouped by category. */
export function getOrganizationsByCategory(): Record<
  OrganizationCategory,
  OrganizationRecord[]
> {
  const grouped: Record<OrganizationCategory, OrganizationRecord[]> = {} as Record<
    OrganizationCategory,
    OrganizationRecord[]
  >;
  for (const cat of ORGANIZATION_CATEGORIES) {
    grouped[cat] = [];
  }
  for (const record of organizationRecords) {
    grouped[record.category].push(record);
  }
  return grouped;
}
