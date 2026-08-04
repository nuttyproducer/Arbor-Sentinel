/**
 * Source-linked institution accountability records for the institutions
 * added during M7-02 content population.
 *
 * Mirrors the euData.ts pattern: every factual position statement carries
 * source IDs and is marked reviewed. Institutional competencies are
 * described only within their legal mandates. No accountability scores and
 * no rankings.
 */

import type { InstitutionPositionRecord } from "../types/content";

// ── International Court of Justice ──────────────────────────────────────────

export const icjPositions: InstitutionPositionRecord[] = [
  {
    id: "icj-position-provisional-measures",
    institution: "International Court of Justice (ICJ)",
    area: "South Africa v. Israel — Genocide Convention case",
    position:
      "The ICJ has issued three binding provisional measures orders in the case brought by South Africa (26 January, 28 March, and 24 May 2024), ordering Israel to take all measures within its power to prevent acts within the scope of Article II of the Genocide Convention, to enable the provision of humanitarian assistance, and to immediately halt its military offensive in Rafah. These are binding interim orders issued before a final judgment on the merits — they do not constitute a finding that genocide has occurred.",
    attribution: "International Court of Justice — orders in case 192",
    date: "2024-05-24",
    sourceIds: ["icj-2024-01-26", "icj-2024-03-28", "icj-2024-05-24"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
  {
    id: "icj-position-advisory-opinion",
    institution: "International Court of Justice (ICJ)",
    area: "Legal consequences of Israel's occupation",
    position:
      "In its advisory opinion of 19 July 2024, the ICJ found that Israel's continued presence in the Occupied Palestinian Territory is unlawful, that Israel must end it promptly and make reparation, and that the transfer of settlers violates Article 49 of the Fourth Geneva Convention. An advisory opinion is authoritative guidance on the law requested by the UN General Assembly — it is not a binding judgment in a contentious case.",
    attribution: "International Court of Justice — Advisory Opinion, 19 July 2024",
    date: "2024-07-19",
    sourceIds: ["icj-advisory-opinion-2024-07"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── International Criminal Court ────────────────────────────────────────────

export const iccPositions: InstitutionPositionRecord[] = [
  {
    id: "icc-position-arrest-warrants",
    institution: "International Criminal Court (ICC)",
    area: "Situation in the State of Palestine — arrest warrants",
    position:
      "ICC Pre-Trial Chamber I issued arrest warrants on 21 November 2024 for Benjamin Netanyahu, Yoav Gallant, and Mohammed Deif, finding reasonable grounds to believe they committed war crimes and crimes against humanity. The warrant against Deif was terminated in February 2025 following confirmation of his death; the warrants against Netanyahu and Gallant remain active. Arrest warrants are not convictions — all persons are presumed innocent until proven guilty.",
    attribution: "ICC Pre-Trial Chamber I",
    date: "2024-11-21",
    sourceIds: ["icc-arrest-warrants-2024-11", "icc-deif-warrant-cancelled-2025"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── UN Human Rights Council ─────────────────────────────────────────────────

export const unHumanRightsCouncilPositions: InstitutionPositionRecord[] = [
  {
    id: "unhrc-position-coi",
    institution: "UN Human Rights Council",
    area: "Commission of Inquiry mandate and findings",
    position:
      "The Human Rights Council mandated the Independent International Commission of Inquiry on the Occupied Palestinian Territory, including East Jerusalem, and Israel. The Commission's reports have documented alleged violations of international humanitarian law and human rights law by all parties, including a June 2026 report finding that Israeli authorities deliberately targeted Palestinian children. Commission findings are fact-finding outputs that inform international accountability processes — they are not judicial rulings.",
    attribution: "UN Human Rights Council / Independent International Commission of Inquiry",
    date: "2026-06-23",
    sourceIds: ["un-coi-2024", "un-coi-2025-03", "un-coi-2026-children"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── UN OCHA ─────────────────────────────────────────────────────────────────

export const unOchaPositions: InstitutionPositionRecord[] = [
  {
    id: "ocha-position-humanitarian-access",
    institution: "UN Office for the Coordination of Humanitarian Affairs (OCHA)",
    area: "Humanitarian access and situation reporting",
    position:
      "UN OCHA coordinates the humanitarian response in the occupied Palestinian territory and publishes situation reports documenting access restrictions, water and food insecurity, displacement, and attacks on humanitarian workers. Its July 2026 report documented water delivery at over 17,000 cubic metres daily and the entire Gaza Strip classified at IPC Phase 3 (Crisis). OCHA reporting describes humanitarian conditions and does not make legal determinations.",
    attribution: "UN OCHA occupied Palestinian territory office",
    date: "2026-07-10",
    sourceIds: ["ocha-opt-main", "ocha-opt-sitrep-2026-07-10", "ocha-opt-data"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── UNRWA ───────────────────────────────────────────────────────────────────

export const unrwaPositions: InstitutionPositionRecord[] = [
  {
    id: "unrwa-position-operations",
    institution: "UN Relief and Works Agency for Palestine Refugees (UNRWA)",
    area: "Humanitarian operations and funding",
    position:
      "UNRWA provides education, health, relief, and social services to Palestine refugees and is a central humanitarian actor in Gaza. Its operational reporting documents food distribution, healthcare, shelter, attacks on UNRWA facilities, and the killing of UNRWA staff. UNRWA's operational reporting is a primary source for humanitarian conditions and access constraints.",
    attribution: "UNRWA",
    date: "2025",
    sourceIds: ["unrwa-gaza-emergency-2025", "org-unrwa"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── OHCHR ───────────────────────────────────────────────────────────────────

export const ohchrPositions: InstitutionPositionRecord[] = [
  {
    id: "ohchr-position-monitoring",
    institution: "UN Office of the High Commissioner for Human Rights (OHCHR)",
    area: "Human-rights monitoring and reporting",
    position:
      "OHCHR supports the Commission of Inquiry, issues human-rights reporting, and documents alleged violations in the occupied Palestinian territory, including attacks on civilians, detention conditions, and humanitarian-access restrictions. OHCHR reporting is a human-rights monitoring source that informs international accountability processes — it is not a judicial finding.",
    attribution: "UN Office of the High Commissioner for Human Rights",
    date: "2026-06-23",
    sourceIds: ["un-coi-2024", "un-coi-2026-children"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── UN General Assembly ─────────────────────────────────────────────────────

export const unGeneralAssemblyPositions: InstitutionPositionRecord[] = [
  {
    id: "unga-position-es10-resolutions",
    institution: "United Nations General Assembly",
    area: "Emergency special-session resolutions on Gaza",
    position:
      "The General Assembly has adopted emergency special-session resolutions on the Gaza conflict: ES-10/21 (October 2023) called for an immediate humanitarian truce; ES-10/22 (December 2023) demanded an immediate humanitarian ceasefire and the unconditional release of all hostages; and ES-10/24 (September 2024) demanded that Israel end its unlawful presence in the Occupied Palestinian Territory within 12 months. General Assembly resolutions are not legally binding but express the collective position of member states.",
    attribution: "United Nations General Assembly",
    date: "2024-09-18",
    sourceIds: ["un-unga-es10-21-2023", "un-unga-es10-22-2023-12", "un-unga-es10-24-2024-09"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];

// ── World Health Organization ───────────────────────────────────────────────

export const whoPositions: InstitutionPositionRecord[] = [
  {
    id: "who-position-health",
    institution: "World Health Organization (WHO)",
    area: "Health emergency reporting for the occupied Palestinian territory",
    position:
      "WHO documents the health impact of the conflict in the occupied Palestinian territory, including attacks on healthcare facilities and personnel, disease outbreaks, malnutrition, medical evacuations, and the collapse of health infrastructure. Its reporting is a technical health-sector source that describes conditions but does not make legal determinations about responsibility.",
    attribution: "World Health Organization — Regional Office for the Eastern Mediterranean",
    date: "2025",
    sourceIds: ["who-opt-report-2025", "who-kamal-adwan-2024-12", "org-who"],
    contentStatus: "reviewed",
    version: 1,
    correctionUrl: "/corrections",
  },
];
