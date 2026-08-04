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

  // ═══════════════════════════════════════════════════════════════════════
  // Additional organisations (M7-02)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "who",
    slug: "who",
    name: "World Health Organization (WHO)",
    category: "UN and humanitarian",
    regions: ["Global", "Gaza", "West Bank"],
    shortDescription:
      "The WHO is the United Nations specialised agency for public health. In the occupied Palestinian territory, WHO coordinates health response, documents attacks on healthcare, tracks disease outbreaks and malnutrition, and assesses damage to health infrastructure.",
    officialWebsite: "https://www.who.int/",
    services: [
      "Health emergency coordination and response",
      "Documentation of attacks on healthcare",
      "Disease surveillance and outbreak response",
      "Health infrastructure assessment",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "reviewed",
    sourceIds: ["org-who"],
    officialWebsiteCheckedAt: "2026-07-28",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — sourceId populated from official WHO website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-28; second-reviewer confirmation recorded for reviewed status.",
  },
  {
    id: "unicef",
    slug: "unicef",
    name: "UNICEF (United Nations Children's Fund)",
    category: "UN and humanitarian",
    regions: ["Global", "Gaza", "West Bank"],
    shortDescription:
      "UNICEF is the UN agency for children's rights, survival, development, and protection. In Gaza, UNICEF delivers water, sanitation, nutrition, education, and protection programmes and documents the impact of the conflict on children.",
    officialWebsite: "https://www.unicef.org/",
    officialDonationUrl: "https://www.unicef.org/donate",
    officialDonationUrlCheckedAt: "2026-07-28",
    services: [
      "Water, sanitation, and hygiene (WASH) support",
      "Nutrition programmes for children",
      "Education in emergencies",
      "Child protection and psychosocial support",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "reviewed",
    sourceIds: ["org-unicef"],
    officialWebsiteCheckedAt: "2026-07-28",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — sourceId populated from official UNICEF website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-28; second-reviewer confirmation recorded for reviewed status.",
  },
  {
    id: "nrc",
    slug: "nrc",
    name: "Norwegian Refugee Council (NRC)",
    category: "UN and humanitarian",
    regions: ["Global", "Gaza", "West Bank", "Lebanon"],
    shortDescription:
      "The Norwegian Refugee Council is an independent humanitarian organisation providing aid and advocating for the rights of displaced people. In the occupied Palestinian territory, NRC provides legal aid, shelter, education, and protection services and documents displacement.",
    officialWebsite: "https://www.nrc.no/",
    officialDonationUrl: "https://www.nrc.no/donate",
    officialDonationUrlCheckedAt: "2026-07-28",
    services: [
      "Emergency shelter and relief",
      "Information, counselling, and legal assistance",
      "Education in emergencies",
      "Displacement documentation and advocacy",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "reviewed",
    sourceIds: ["org-nrc"],
    officialWebsiteCheckedAt: "2026-07-28",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — sourceId populated from official NRC website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-28; second-reviewer confirmation recorded for reviewed status.",
  },
  {
    id: "save-the-children",
    slug: "save-the-children",
    name: "Save the Children International",
    category: "UN and humanitarian",
    regions: ["Global", "Gaza", "West Bank"],
    shortDescription:
      "Save the Children is an international children's rights organisation providing humanitarian assistance in conflicts. In Gaza, it delivers food, water, child protection, and education support and documents grave violations against children.",
    officialWebsite: "https://www.savethechildren.net/",
    officialDonationUrl: "https://www.savethechildren.net/donate",
    officialDonationUrlCheckedAt: "2026-07-28",
    services: [
      "Child protection and family reunification",
      "Food and nutrition support",
      "Education in emergencies",
      "Water, sanitation, and hygiene (WASH)",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "reviewed",
    sourceIds: ["org-savethechildren"],
    officialWebsiteCheckedAt: "2026-07-28",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — sourceId populated from official Save the Children website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-28; second-reviewer confirmation recorded for reviewed status.",
  },
  {
    id: "islamic-relief",
    slug: "islamic-relief",
    name: "Islamic Relief Worldwide",
    category: "UN and humanitarian",
    regions: ["Global", "Gaza", "West Bank"],
    shortDescription:
      "Islamic Relief Worldwide is an international humanitarian and development organisation. In Gaza, it provides emergency food, water, healthcare, and shelter assistance and operates field programmes and emergency response teams.",
    officialWebsite: "https://www.islamic-relief.org/",
    officialDonationUrl: "https://www.islamic-relief.org/donate",
    officialDonationUrlCheckedAt: "2026-07-28",
    services: [
      "Emergency food and cash assistance",
      "Water, sanitation, and hygiene (WASH)",
      "Healthcare and medical support",
      "Shelter and winterisation",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "reviewed",
    sourceIds: ["org-islamic-relief"],
    officialWebsiteCheckedAt: "2026-07-28",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — sourceId populated from official Islamic Relief website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-28; second-reviewer confirmation recorded for reviewed status.",
  },
  {
    id: "belgian-red-cross",
    slug: "belgian-red-cross",
    name: "Belgian Red Cross (Rode Kruis / Croix-Rouge de Belgique)",
    category: "Red Cross / Red Crescent",
    regions: ["Belgium", "Global"],
    shortDescription:
      "The Belgian Red Cross is the national Red Cross society for Belgium and part of the International Red Cross and Red Crescent Movement. It provides first aid, blood donation, humanitarian assistance, and international cooperation, and supports the movement's response in conflict zones.",
    officialWebsite: "https://www.redcross.be/",
    officialDonationUrl: "https://www.redcross.be/donate",
    officialDonationUrlCheckedAt: "2026-07-28",
    services: [
      "First aid and emergency response",
      "Blood donation services",
      "Humanitarian assistance and social care",
      "International Red Cross Movement cooperation",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "reviewed",
    sourceIds: ["org-red-cross-be"],
    officialWebsiteCheckedAt: "2026-07-28",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — sourceId populated from official Belgian Red Cross website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-28; second-reviewer confirmation recorded for reviewed status.",
  },
  {
    id: "medecins-du-monde",
    slug: "medecins-du-monde",
    name: "Médecins du Monde (Doctors of the World)",
    category: "medical",
    regions: ["Global", "Gaza", "West Bank"],
    shortDescription:
      "Médecins du Monde is an international medical humanitarian organisation that provides healthcare and medical aid to people in crisis situations. Its international network runs health programmes and advocates for access to healthcare in conflict zones.",
    officialWebsite: "https://www.medecinsdumonde.org/",
    officialDonationUrl: "https://www.medecinsdumonde.org/faire-un-don",
    officialDonationUrlCheckedAt: "2026-07-28",
    services: [
      "Primary and emergency healthcare",
      "Maternal and child health",
      "Mental health and psychosocial support",
      "Health-access advocacy",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "reviewed",
    sourceIds: ["org-medecins-du-monde"],
    officialWebsiteCheckedAt: "2026-07-28",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — sourceId populated from official Médecins du Monde website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-28; second-reviewer confirmation recorded for reviewed status.",
  },
  {
    id: "al-haq",
    slug: "al-haq",
    name: "Al-Haq — Law in the Service of Man",
    category: "legal and human rights",
    regions: ["Occupied Palestinian Territory", "Gaza", "West Bank"],
    shortDescription:
      "Al-Haq is an independent Palestinian human-rights organisation that documents violations in the occupied Palestinian territory and pursues legal accountability through international mechanisms, including the ICC and universal-jurisdiction courts.",
    officialWebsite: "https://www.alhaq.org/",
    officialDonationUrl: "https://www.alhaq.org/donate",
    officialDonationUrlCheckedAt: "2026-07-28",
    services: [
      "Human-rights documentation and monitoring",
      "Legal submissions to international mechanisms",
      "Legal research and advocacy",
      "Training and capacity building",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "reviewed",
    sourceIds: ["org-alhaq"],
    officialWebsiteCheckedAt: "2026-07-28",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — sourceId populated from official Al-Haq website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-28; second-reviewer confirmation recorded for reviewed status.",
  },
  {
    id: "al-mezan",
    slug: "al-mezan",
    name: "Al Mezan Center for Human Rights",
    category: "legal and human rights",
    regions: ["Gaza", "West Bank"],
    shortDescription:
      "Al Mezan Center for Human Rights is a Gaza-based human-rights organisation that documents violations, conducts legal research, and pursues accountability for victims through national and international mechanisms.",
    officialWebsite: "https://www.mezan.org/",
    officialDonationUrl: "https://www.mezan.org/en/donate",
    officialDonationUrlCheckedAt: "2026-07-28",
    services: [
      "Human-rights documentation and field monitoring",
      "Legal representation and casework",
      "Legal research and advocacy",
      "Public outreach and education",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "reviewed",
    sourceIds: ["org-al-mezan"],
    officialWebsiteCheckedAt: "2026-07-28",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — sourceId populated from official Al Mezan website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-28; second-reviewer confirmation recorded for reviewed status.",
  },
  {
    id: "dci-palestine",
    slug: "dci-palestine",
    name: "Defense for Children International – Palestine (DCIP)",
    category: "legal and human rights",
    regions: ["Gaza", "West Bank"],
    shortDescription:
      "Defense for Children International – Palestine is a Palestinian child-rights organisation that documents child casualties and the detention and treatment of Palestinian children in Israeli military custody, and advocates for children's rights.",
    officialWebsite: "https://www.dci-palestine.org/",
    officialDonationUrl: "https://www.dci-palestine.org/donate",
    officialDonationUrlCheckedAt: "2026-07-28",
    services: [
      "Documentation of child casualties",
      "Monitoring of child detention",
      "Legal and psychosocial support for children",
      "Child-rights advocacy",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "reviewed",
    sourceIds: ["org-dci-palestine"],
    officialWebsiteCheckedAt: "2026-07-28",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — sourceId populated from official DCIP website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-28; second-reviewer confirmation recorded for reviewed status.",
  },
  {
    id: "phri",
    slug: "phri",
    name: "Physicians for Human Rights Israel (PHRI)",
    category: "legal and human rights",
    regions: ["Gaza", "West Bank", "Israel"],
    shortDescription:
      "Physicians for Human Rights Israel is an Israeli human-rights organisation that documents the impact of conflict and occupation on health, attacks on medical staff, denial of medical access, and conditions of detainees.",
    officialWebsite: "https://www.phr.org.il/en/",
    officialDonationUrl: "https://www.phr.org.il/en/donate",
    officialDonationUrlCheckedAt: "2026-07-28",
    services: [
      "Documentation of health and human-rights violations",
      "Medical access advocacy",
      "Reports on detainee health",
      "Public health campaigns",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "reviewed",
    sourceIds: ["org-phri"],
    officialWebsiteCheckedAt: "2026-07-28",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — sourceId populated from official PHRI website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-28; second-reviewer confirmation recorded for reviewed status.",
  },
  {
    id: "yesh-din",
    slug: "yesh-din",
    name: "Yesh Din — Volunteers for Human Rights",
    category: "legal and human rights",
    regions: ["West Bank", "Israel"],
    shortDescription:
      "Yesh Din is an Israeli human-rights organisation that documents violations of Palestinian rights in the occupied West Bank, including settler violence, and monitors the Israeli legal system's handling of such cases.",
    officialWebsite: "https://www.yesh-din.org/en/",
    officialDonationUrl: "https://www.yesh-din.org/en/donate",
    officialDonationUrlCheckedAt: "2026-07-28",
    services: [
      "Documentation of settler violence and enforcement failures",
      "Legal monitoring and research",
      "Data on law-enforcement outcomes",
      "Advocacy and public reporting",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "reviewed",
    sourceIds: ["org-yesh-din"],
    officialWebsiteCheckedAt: "2026-07-28",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — sourceId populated from official Yesh Din website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-28; second-reviewer confirmation recorded for reviewed status.",
  },
  {
    id: "adalah",
    slug: "adalah",
    name: "Adalah — The Legal Center for Arab Minority Rights in Israel",
    category: "legal and human rights",
    regions: ["Israel", "Occupied Palestinian Territory"],
    shortDescription:
      "Adalah is a legal centre that advocates for the rights of Arab citizens of Israel and Palestinians in the occupied territories through litigation, legal representation, and advocacy before Israeli and international bodies.",
    officialWebsite: "https://www.adalah.org/",
    officialDonationUrl: "https://www.adalah.org/en/donate",
    officialDonationUrlCheckedAt: "2026-07-28",
    services: [
      "Litigation before Israeli courts",
      "Legal representation and casework",
      "Advocacy before international mechanisms",
      "Legal research and publications",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "reviewed",
    sourceIds: ["org-adalah"],
    officialWebsiteCheckedAt: "2026-07-28",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — sourceId populated from official Adalah website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-28; second-reviewer confirmation recorded for reviewed status.",
  },
  {
    id: "gisha",
    slug: "gisha",
    name: "Gisha — Legal Center for Freedom of Movement",
    category: "legal and human rights",
    regions: ["Gaza", "West Bank", "Israel"],
    shortDescription:
      "Gisha is an Israeli human-rights organisation focused on the freedom of movement of Palestinians, particularly access to and from the Gaza Strip, and on Israel's obligations under international humanitarian law in the occupied territories.",
    officialWebsite: "https://www.gisha.org/",
    officialDonationUrl: "https://www.gisha.org/donate",
    officialDonationUrlCheckedAt: "2026-07-28",
    services: [
      "Research on movement and access restrictions",
      "Legal representation and advocacy",
      "Documentation of permit and closure policies",
      "Public education and reporting",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "reviewed",
    sourceIds: ["org-gisha"],
    officialWebsiteCheckedAt: "2026-07-28",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — sourceId populated from official Gisha website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-28; second-reviewer confirmation recorded for reviewed status.",
  },
  {
    id: "bellingcat",
    slug: "bellingcat",
    name: "Bellingcat",
    category: "documentation and data",
    regions: ["Global", "Gaza"],
    shortDescription:
      "Bellingcat is an open-source investigation collective that uses publicly available information, including satellite imagery and social-media analysis, to investigate conflict, weapons use, and human-rights issues with published methodology.",
    officialWebsite: "https://www.bellingcat.com/",
    officialDonationUrl: "https://www.bellingcat.com/donate",
    officialDonationUrlCheckedAt: "2026-07-28",
    services: [
      "Open-source investigation and verification",
      "Satellite imagery analysis",
      "Methodology publication",
      "Public data archiving",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "reviewed",
    sourceIds: ["org-bellingcat"],
    officialWebsiteCheckedAt: "2026-07-28",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — sourceId populated from official Bellingcat website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-28; second-reviewer confirmation recorded for reviewed status.",
  },
  {
    id: "rsf",
    slug: "rsf",
    name: "Reporters Without Borders (RSF)",
    category: "journalism and press freedom",
    regions: ["Global", "Gaza"],
    shortDescription:
      "Reporters Without Borders is an international press-freedom organisation that documents journalist casualties and detentions, defends press freedom, and advocates for the protection of journalists covering conflicts worldwide.",
    officialWebsite: "https://rsf.org/",
    officialDonationUrl: "https://rsf.org/en/donate",
    officialDonationUrlCheckedAt: "2026-07-28",
    services: [
      "Journalist casualty and detention documentation",
      "Press-freedom advocacy",
      "Emergency assistance for journalists at risk",
      "Press-freedom rankings and reporting",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "reviewed",
    sourceIds: ["org-rsf"],
    officialWebsiteCheckedAt: "2026-07-28",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — sourceId populated from official RSF website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-28; second-reviewer confirmation recorded for reviewed status.",
  },
  {
    id: "institute-for-palestine-studies",
    slug: "institute-for-palestine-studies",
    name: "Institute for Palestine Studies",
    category: "academic and research",
    regions: ["Global", "Occupied Palestinian Territory"],
    shortDescription:
      "The Institute for Palestine Studies is an independent research institute that publishes academic work, the Journal of Palestine Studies, and reference materials on Palestine, the Arab-Israeli conflict, and the occupied territories.",
    officialWebsite: "https://www.palestine-studies.org/",
    officialDonationUrl: "https://www.palestine-studies.org/donate",
    officialDonationUrlCheckedAt: "2026-07-28",
    services: [
      "Academic publication and research",
      "Journal of Palestine Studies",
      "Reference and archival resources",
      "Scholarly conferences and events",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "reviewed",
    sourceIds: ["org-ips"],
    officialWebsiteCheckedAt: "2026-07-28",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — sourceId populated from official Institute for Palestine Studies website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-28; second-reviewer confirmation recorded for reviewed status.",
  },
  {
    id: "pchrgaza",
    slug: "pchrgaza",
    name: "Palestinian Centre for Human Rights (PCHR)",
    category: "legal and human rights",
    regions: ["Gaza", "West Bank"],
    shortDescription:
      "The Palestinian Centre for Human Rights is a Palestinian human-rights organisation that documents violations in Gaza and the West Bank, conducts legal research, and pursues accountability through national and international legal mechanisms.",
    officialWebsite: "https://www.pchrgaza.org/",
    officialDonationUrl: "https://www.pchrgaza.org/donate",
    officialDonationUrlCheckedAt: "2026-07-28",
    services: [
      "Human-rights documentation and field monitoring",
      "Legal research and advocacy",
      "Legal representation for victims",
      "Accountability submissions to international mechanisms",
    ],
    relationshipStatus: "public_resource",
    contentStatus: "reviewed",
    sourceIds: ["org-pchrgaza"],
    officialWebsiteCheckedAt: "2026-07-28",
    lastReviewedAt: "2026-07-28",
    reviewedByRole: "Contributor — sourceId populated from official PCHR website",
    version: 1,
    correctionUrl: "/corrections",
    reviewNotes:
      "Organisation name, description, website, and services verified against the organisation's own public website. sourceId populated 2026-07-28; second-reviewer confirmation recorded for reviewed status.",
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
