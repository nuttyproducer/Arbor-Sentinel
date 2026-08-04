/**
 * Static search index builder.
 *
 * Converts every public record from all data collections into
 * a normalized SearchableRecord for client-side search.
 *
 * The index is built once at module load time. In the static beta,
 * with a small number of records, this is instant. When the dataset
 * grows, this can be replaced with a lazy build or a precomputed
 * JSON index.
 */

import type { SearchableRecord } from "./types";
import { sources } from "../../data/sources";
import { evidenceItems } from "../../data/evidenceItems";
import { legalCases } from "../../data/legalCases";
import { organizationRecords } from "../../data/organizations";
import { getActiveTemplates } from "../../data/actionTemplates";
import { getActiveCountries } from "../../data/countries";
import { getActiveInstitutionEntries } from "../../data/institutions";
import { dossiers } from "../../data/dossiers";

// ── Trust / methodology pages ───────────────────────────────────────────────

const TRUST_PAGES: Omit<SearchableRecord, "active">[] = [
  {
    id: "trust-methodology",
    type: "trust_page",
    title: "Methodology",
    description:
      "How Accountability Atlas separates sources, leads, allegations, legal findings, and reviewed public evidence — with verification levels, legal status labels, and publication workflow.",
    route: "/methodology",
    tags: ["methodology", "verification", "source hierarchy", "legal labels", "publication"],
    publisher: "Accountability Atlas",
  },
  {
    id: "trust-corrections",
    type: "trust_page",
    title: "Corrections",
    description:
      "Corrections are part of the trust model. Submit corrections for factual errors, outdated sources, unsafe information, mistranslations, or misrepresentation.",
    route: "/corrections",
    tags: ["corrections", "trust", "factual errors", "transparency"],
    publisher: "Accountability Atlas",
  },
  {
    id: "trust-privacy",
    type: "trust_page",
    title: "Privacy",
    description:
      "Privacy in the public static beta: no user accounts, no tracking scripts, no witness submissions, no evidence uploads. Static site by design.",
    route: "/privacy",
    tags: ["privacy", "data protection", "GDPR", "tracking", "security"],
    publisher: "Accountability Atlas",
  },
  {
    id: "trust-accessibility",
    type: "trust_page",
    title: "Accessibility",
    description:
      "Accessibility commitment: WCAG 2.2 AA target, keyboard navigation, visible focus states, reduced motion support, mobile responsiveness, and readable typography.",
    route: "/accessibility",
    tags: ["accessibility", "WCAG", "keyboard", "screen reader", "inclusive design"],
    publisher: "Accountability Atlas",
  },
  {
    id: "trust-disclaimer",
    type: "trust_page",
    title: "Public Disclaimer",
    description:
      "Accountability Atlas is an independent open-source civic accountability project — not a court, NGO, charity, or official authority. Public static beta. Corrections welcome.",
    route: "/disclaimer",
    tags: ["disclaimer", "legal", "status", "limitations"],
    publisher: "Accountability Atlas",
  },
  {
    id: "trust-attributions",
    type: "trust_page",
    title: "Attributions",
    description:
      "Image credits, licences, modifications, and attribution records for every image used on Accountability Atlas — open-licensed or permission-cleared only.",
    route: "/attributions",
    tags: ["attributions", "image credits", "licensing", "open source"],
    publisher: "Accountability Atlas",
  },
  {
    id: "trust-contribute",
    type: "trust_page",
    title: "Contribute",
    description:
      "Help build Accountability Atlas: developers, designers, researchers, reviewers, writers, and translators — open-source contribution with safety review.",
    route: "/contribute",
    tags: ["contribute", "volunteer", "open source", "contributors", "GitHub"],
    publisher: "Accountability Atlas",
  },
  {
    id: "trust-press",
    type: "trust_page",
    title: "Press & Resources",
    description:
      "How to understand, describe, cite, and represent Accountability Atlas responsibly. For journalists, researchers, contributors, and civic-tech reviewers.",
    route: "/press",
    tags: ["press", "journalists", "citation", "brand", "resources"],
    publisher: "Accountability Atlas",
  },
  {
    id: "trust-changelog",
    type: "trust_page",
    title: "Changelog",
    description:
      "A record of features, improvements, and fixes on the Accountability Atlas platform — maintained by contributors during the public static beta.",
    route: "/changelog",
    tags: ["changelog", "updates", "releases", "version history"],
    publisher: "Accountability Atlas",
  },
  {
    id: "trust-gaza-dossier",
    type: "trust_page",
    title: "Gaza Dossier",
    description:
      "A structured framework for understanding the humanitarian context, legal proceedings, documented harm categories, and policy priorities in the Gaza regional crisis.",
    route: "/gaza-dossier",
    tags: ["Gaza", "dossier", "humanitarian", "legal", "policy"],
    publisher: "Accountability Atlas",
  },
  {
    id: "trust-legal-tracker",
    type: "trust_page",
    title: "Legal Tracker",
    description:
      "Track court proceedings, investigations, warrants, UN findings, and procedural milestones with consistent legal status labels.",
    route: "/legal-tracker",
    tags: ["legal", "court", "ICC", "ICJ", "warrants", "proceedings"],
    publisher: "Accountability Atlas",
  },
];

// ── Build the index ─────────────────────────────────────────────────────────

function buildIndex(): SearchableRecord[] {
  const index: SearchableRecord[] = [];

  // ── Sources ──────────────────────────────────────────────────────────
  for (const s of sources) {
    index.push({
      id: `source:${s.id}`,
      type: "source",
      title: s.title,
      description: s.notes ?? `Source document published by ${s.publisher}.`,
      route: `/sources/${s.slug}`,
      tags: [s.publisher, s.sourceType, s.documentType ?? "", s.jurisdiction ?? "", s.language ?? ""].filter(Boolean),
      publisher: s.publisher,
      category: s.documentType,
      jurisdiction: s.jurisdiction,
      language: s.language,
      active: true,
    });
  }

  // ── Evidence items ───────────────────────────────────────────────────
  for (const e of evidenceItems) {
    index.push({
      id: `evidence:${e.id}`,
      type: "evidence",
      title: e.title,
      description: e.summary,
      route: `/evidence/${e.slug}`,
      tags: [...e.tags, e.category, e.safeLocation ?? "", e.sourceLanguage ?? ""].filter(Boolean),
      publisher: e.primarySourceType,
      category: e.category,
      jurisdiction: e.safeLocation,
      sourceType: e.primarySourceType,
      contentStatus: e.contentStatus,
      sourceQuality: e.sourceQuality,
      legalStatuses: e.legalStatuses,
      language: e.sourceLanguage,
      active: true,
    });
  }

  // ── Legal cases ──────────────────────────────────────────────────────
  for (const lc of legalCases) {
    index.push({
      id: `legal_case:${lc.id}`,
      type: "legal_case",
      title: lc.title,
      description: lc.summary,
      route: `/legal-tracker/${lc.slug}`,
      tags: [lc.institution, lc.jurisdiction, ...lc.parties, lc.legalBasisOrAllegedCrimes ?? ""].filter(Boolean),
      publisher: lc.institution,
      jurisdiction: lc.jurisdiction,
      contentStatus: lc.contentStatus,
      sourceQuality: lc.sourceQuality,
      legalStatuses: lc.legalStatuses,
      active: true,
    });
  }

  // ── Organizations ────────────────────────────────────────────────────
  for (const org of organizationRecords) {
    index.push({
      id: `organization:${org.id}`,
      type: "organization",
      title: org.name,
      description: org.shortDescription,
      route: `/organizations/${org.slug}`,
      tags: [org.category, ...org.regions, ...(org.services ?? [])],
      publisher: org.category,
      category: org.category,
      contentStatus: org.contentStatus,
      active: true,
    });
  }

  // ── Action templates (active only) ───────────────────────────────────
  for (const at of getActiveTemplates()) {
    index.push({
      id: `action:${at.id}`,
      type: "action",
      title: at.title,
      description: at.purpose,
      route: `/take-action/${at.slug}`,
      tags: [at.actionType, at.jurisdiction, at.intendedAudience, at.language].filter(Boolean),
      publisher: at.jurisdiction,
      category: at.actionType,
      jurisdiction: at.jurisdiction,
      contentStatus: at.contentStatus,
      language: at.language,
      active: at.active,
    });
  }

  // ── Countries (active only) ─────────────────────────────────────────
  for (const c of getActiveCountries()) {
    index.push({
      id: `country:${c.id}`,
      type: "country",
      title: c.name,
      description: c.summary,
      route: c.route,
      tags: [c.region, "country", "accountability"],
      publisher: c.region,
      jurisdiction: c.region,
      contentStatus: c.contentStatus,
      active: c.active,
    });
  }

  // ── Institutions (active only) ───────────────────────────────────────
  for (const inst of getActiveInstitutionEntries()) {
    index.push({
      id: `institution:${inst.id}`,
      type: "institution",
      title: inst.name + (inst.acronym ? ` (${inst.acronym})` : ""),
      description: inst.summary,
      route: inst.route,
      tags: [inst.region, "institution", "accountability", inst.acronym ?? ""].filter(Boolean),
      publisher: inst.region,
      jurisdiction: inst.region,
      contentStatus: inst.contentStatus,
      active: inst.active,
    });
  }

  // ── Dossiers ─────────────────────────────────────────────────────────
  for (const d of dossiers) {
    index.push({
      id: `dossier:${d.id}`,
      type: "dossier",
      title: d.title,
      description: d.executiveSummary,
      route: `/dossiers/${d.slug}`,
      tags: [d.issueFocus, d.jurisdiction, d.language, d.dossierType],
      publisher: d.jurisdiction,
      category: d.dossierType,
      jurisdiction: d.jurisdiction,
      contentStatus: d.contentStatus,
      language: d.language,
      active: true,
    });
  }

  // ── Trust / methodology pages ───────────────────────────────────────
  for (const tp of TRUST_PAGES) {
    index.push({
      ...tp,
      active: true,
    });
  }

  return index;
}

// ── Singleton index ─────────────────────────────────────────────────────────

let _index: SearchableRecord[] | null = null;

export function getSearchIndex(): SearchableRecord[] {
  if (!_index) {
    _index = buildIndex();
  }
  return _index;
}

/** Force rebuild — useful in tests. */
export function rebuildIndex(): SearchableRecord[] {
  _index = buildIndex();
  return _index;
}

/** Count of indexed records. */
export function getIndexedCount(): number {
  return getSearchIndex().length;
}
