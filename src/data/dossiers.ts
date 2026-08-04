import type { DossierRecord } from "../types/content";

/**
 * Static dossier records.
 *
 * During the static beta, dossiers are manually constructed previews.
 * Automated generation from reviewed records is not yet active.
 *
 * Every dossier fact resolves from a referenced record ID
 * (evidence, legal case, country/institution, or source).
 * No unsourced facts are included.
 *
 * Dossiers marked "static_preview" are structural demonstrations
 * of the future dossier format — they are not independently reviewed
 * publications.
 */

export const dossiers: DossierRecord[] = [
  {
    id: "gaza-accountability-one-page",
    slug: "gaza-accountability-one-page",
    title: "Gaza Accountability — One-Page Executive Brief",
    dossierType: "one_page_brief",
    audience: "policymaker",
    issueFocus: "Gaza accountability",
    jurisdiction: "International",
    language: "en",
    executiveSummary:
      "This one-page brief summarises the current legal accountability landscape for the Gaza crisis, drawing from publicly available court records, UN documents, humanitarian reporting, and human-rights organisation findings. It is a static preview demonstrating the future dossier format — automated generation is not yet active. All facts are derived from referenced platform records with source links. No claim is presented as a final legal determination unless supported by a court or institutional record.",
    keyFactRecordIds: [
      "icj-provisional-measures-jan-2024",
      "icj-additional-measures-may-2024",
      "icc-palestine-situation",
      "un-coi-report-2024",
      "civilian-harm-documentation",
    ],
    legalCaseIds: [
      "icj-genocide-convention",
      "icc-palestine-situation",
      "un-coi-opt",
    ],
    countryOrInstitutionIds: [
      "belgium",
      "european-union",
    ],
    policyAsks: [
      "Support unimpeded humanitarian access and protection of aid workers in line with IHL obligations.",
      "Support lawful review of arms transfers where there is a clear risk of IHL violations, consistent with the Arms Trade Treaty and EU Common Position.",
      "Support diplomatic engagement and multilateral accountability mechanisms through lawful, public channels.",
      "Support ICC cooperation, universal jurisdiction cases, and domestic legal processes that advance accountability for international crimes.",
    ],
    recommendedActions: [
      "Contact your representative to ask about their position on humanitarian access, arms-transfer review, and ICC cooperation — using sourced templates from the Action Hub.",
      "Share verified source records and evidence summaries with journalists, researchers, and civic groups.",
      "Support verified humanitarian organisations providing aid in Gaza — visit their official donation pages directly.",
      "Submit corrections or additional public sources through the platform corrections process.",
    ],
    sourceIds: [
      "icj-2024-01-26",
      "icj-2024-05-24",
      "icc-palestine-2024",
      "un-coi-2024",
    ],
    contentStatus: "static_preview",
    generationStatus: "manual_static_preview",
    version: 1,
    createdAt: "2026-07-14",
    lastReviewedAt: "2026-07-14",
    reviewedByRole: "Static beta — editorial review pending",
    correctionUrl: "/corrections",
  },
];

/** Convenience: dossier lookup by slug. */
export function getDossierBySlug(slug: string): DossierRecord | undefined {
  return dossiers.find((d) => d.slug === slug);
}
