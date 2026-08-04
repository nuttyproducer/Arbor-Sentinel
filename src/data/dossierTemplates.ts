import type { DossierTemplate } from "../types/content";

/**
 * Dossier template definitions.
 *
 * Each template describes a dossier type that will eventually be
 * available for automated generation from reviewed records. During
 * the static beta, automated generation is inactive and only a
 * manually-constructed static preview is available.
 *
 * See PRD §7 Pillar 4 — Policy Dossier Generator for full requirements.
 */

export const dossierTemplates: DossierTemplate[] = [
  {
    id: "one-page-brief",
    dossierType: "one_page_brief",
    label: "One-page executive brief",
    description:
      "A concise, single-page summary for policymakers, journalists, and citizens. Covers executive summary, key facts, legal context, jurisdiction-specific responsibilities, and recommended actions — all sourced from reviewed records.",
    inputs: [
      "Country or institution",
      "Issue focus",
      "Date range (optional)",
      "Evidence categories (optional)",
      "Language",
      "Audience",
    ],
    outputStructure: [
      "Title, version, and generation date",
      "Methodology note",
      "Executive summary",
      "Key facts (from reviewed evidence records)",
      "Legal and procedural context",
      "Country or institution responsibility context",
      "Policy asks",
      "Recommended lawful actions",
      "Full source list",
      "Correction link",
      "QR code to live canonical route",
    ],
    generationActive: false,
  },
  {
    id: "five-page-memo",
    dossierType: "five_page_memo",
    label: "Five-page policy memo",
    description:
      "A more detailed policy memorandum with expanded context, timeline, and analysis. Suitable for parliamentary staff, NGO policy teams, and journalists preparing in-depth coverage.",
    inputs: [
      "Country or institution",
      "Issue focus",
      "Date range (optional)",
      "Evidence categories (optional)",
      "Language",
      "Audience",
    ],
    outputStructure: [
      "Title, version, and generation date",
      "Methodology and limitations note",
      "Executive summary (extended)",
      "Detailed key facts and evidence summary",
      "Legal and procedural context with timeline",
      "Country/institution role and responsibility analysis",
      "Policy asks with source basis",
      "Recommended actions by audience type",
      "Full source list with verification levels",
      "Related dossier and platform links",
      "Correction link",
      "QR code to live canonical route",
    ],
    generationActive: false,
  },
  {
    id: "full-dossier",
    dossierType: "full_dossier",
    label: "Full evidence dossier",
    description:
      "A comprehensive evidence pack with all available reviewed records, full source documentation, legal analysis, and multi-jurisdiction context. For legal researchers, human-rights defenders, and institutional use.",
    inputs: [
      "Country or institution",
      "Issue focus",
      "Date range (optional)",
      "Evidence categories (optional)",
      "Language",
      "Audience",
    ],
    outputStructure: [
      "Title, version, and generation date",
      "Methodology and review status",
      "Executive summary",
      "Full key facts with evidence record references",
      "Legal and procedural context (extended)",
      "Country/institution responsibility analysis",
      "Harm-category breakdown with source links",
      "Timeline of key events and legal milestones",
      "Policy asks and action recommendations",
      "Complete source registry with verification levels",
      "Related platform routes",
      "Correction link",
      "QR code to live canonical route",
    ],
    generationActive: false,
  },
  {
    id: "journalist-briefing",
    dossierType: "journalist_briefing",
    label: "Journalist briefing",
    description:
      "A briefing pack designed for journalists: key facts, source trail, legal context, institutional contacts, and citation guidance — all structured for editorial use under deadline pressure.",
    inputs: [
      "Issue focus",
      "Date range (optional)",
      "Language",
    ],
    outputStructure: [
      "Title, version, and generation date",
      "One-paragraph story summary",
      "Key verified facts with direct source links",
      "Legal and procedural posture",
      "Key institutions and official contacts",
      "Citation guidance",
      "Correction and update route",
      "QR code to live canonical route",
    ],
    generationActive: false,
  },
  {
    id: "council-motion-pack",
    dossierType: "council_motion_pack",
    label: "Local council motion pack",
    description:
      "A briefing pack for local councils, universities, and civic bodies: sourced facts, model motion language, and relevant jurisdiction context for institutional accountability action.",
    inputs: [
      "Country or institution",
      "Issue focus",
      "Language",
    ],
    outputStructure: [
      "Title, version, and generation date",
      "Why this matters — local context",
      "Key verified facts",
      "Relevant legal and institutional context",
      "Model motion language (jurisdiction-adapted)",
      "Policy asks appropriate to local authority",
      "Source list",
      "Correction link",
    ],
    generationActive: false,
  },
  {
    id: "mp-contact-pack",
    dossierType: "mp_contact_pack",
    label: "MP/MEP contact pack",
    description:
      "A briefing pack for contacting members of parliament or the European Parliament: jurisdiction-specific facts, policy asks the representative can act on, and sourced template language.",
    inputs: [
      "Country or institution",
      "Issue focus",
      "Language",
    ],
    outputStructure: [
      "Title, version, and generation date",
      "Who this is for and how to use it",
      "Key verified facts relevant to the representative",
      "What the representative can do (specific, sourced asks)",
      "Template contact language (polite, firm, sourced)",
      "Full source list",
      "Correction and update route",
    ],
    generationActive: false,
  },
  {
    id: "humanitarian-access-brief",
    dossierType: "humanitarian_access_brief",
    label: "Humanitarian access brief",
    description:
      "A focused brief on humanitarian access: documented restrictions, applicable IHL provisions, institutional responsibilities, and actionable policy asks for improving humanitarian access.",
    inputs: [
      "Country or institution",
      "Date range (optional)",
      "Language",
    ],
    outputStructure: [
      "Title, version, and generation date",
      "Humanitarian access situation summary",
      "Key documented access restrictions",
      "Applicable IHL provisions",
      "Institutional responsibilities",
      "Policy asks for improving access",
      "Source list",
      "Correction link",
    ],
    generationActive: false,
  },
  {
    id: "arms-transfer-brief",
    dossierType: "arms_transfer_brief",
    label: "Arms-transfer review brief",
    description:
      "A focused brief on arms transfers: documented transfers, applicable treaty obligations, parliamentary scrutiny, and policy asks for lawful review where serious IHL risk exists.",
    inputs: [
      "Country or institution",
      "Date range (optional)",
      "Language",
    ],
    outputStructure: [
      "Title, version, and generation date",
      "Arms-transfer context summary",
      "Applicable treaty obligations (ATT, EU Common Position)",
      "Documented transfers and licensing (source-backed)",
      "Parliamentary and judicial scrutiny",
      "Policy asks for lawful review",
      "Source list",
      "Correction link",
    ],
    generationActive: false,
  },
  {
    id: "legal-accountability-brief",
    dossierType: "legal_accountability_brief",
    label: "Legal accountability brief",
    description:
      "A focused brief on legal accountability processes: active court proceedings, institutional findings, jurisdiction-specific obligations, and actions to support lawful accountability mechanisms.",
    inputs: [
      "Country or institution",
      "Issue focus",
      "Language",
    ],
    outputStructure: [
      "Title, version, and generation date",
      "Legal accountability overview",
      "Active court proceedings and procedural posture",
      "Institutional findings (UN, NGO, parliamentary)",
      "Jurisdiction-specific obligations",
      "Actions to support lawful accountability",
      "Source list with document links",
      "Correction link",
    ],
    generationActive: false,
  },
];

/** Convenience: lookup a template by its dossier type. */
export function getTemplateByType(
  dossierType: string,
): DossierTemplate | undefined {
  return dossierTemplates.find((t) => t.dossierType === dossierType);
}
