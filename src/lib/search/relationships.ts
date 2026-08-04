/**
 * Cross-record relationship resolver.
 *
 * Builds bidirectional relationship maps from explicit record IDs.
 * Relationships are derived from:
 *  - sourceIds (evidence, legal cases, organizations, actions, dossiers)
 *  - keyFactRecordIds (dossiers → evidence)
 *  - legalCaseIds (dossiers → legal cases)
 *  - countryOrInstitutionIds (dossiers → countries/institutions)
 *  - relatedRoutes (evidence items, action templates → resolved to records)
 *
 * No relationships are inferred from name similarity at runtime.
 */

import type { RelatedRecord, RecordRelationships, SearchableRecordType } from "./types";
import { getSourceById } from "../../data/sources";
import { evidenceItems, getEvidenceBySlug } from "../../data/evidenceItems";
import { legalCases, getLegalCaseBySlug } from "../../data/legalCases";
import { organizationRecords } from "../../data/organizations";
import { actionTemplates } from "../../data/actionTemplates";
import { getCountryBySlug } from "../../data/countries";
import { getInstitutionEntryBySlug } from "../../data/institutions";
import { dossiers } from "../../data/dossiers";

// ── Resolvers for record IDs → route/title ──────────────────────────────────

function resolveSource(id: string): RelatedRecord | null {
  const s = getSourceById(id);
  if (!s) return null;
  return {
    id: `source:${s.id}`,
    type: "source",
    title: s.title.length > 80 ? s.title.slice(0, 77) + "…" : s.title,
    route: `/sources/${s.slug}`,
    relationship: "source document",
  };
}

function resolveEvidence(slugOrId: string): RelatedRecord | null {
  const e = getEvidenceBySlug(slugOrId);
  if (!e) return null;
  return {
    id: `evidence:${e.id}`,
    type: "evidence",
    title: e.title,
    route: `/evidence/${e.slug}`,
    relationship: "evidence record",
  };
}

function resolveLegalCase(slugOrId: string): RelatedRecord | null {
  const lc = getLegalCaseBySlug(slugOrId);
  if (!lc) return null;
  return {
    id: `legal_case:${lc.id}`,
    type: "legal_case",
    title: lc.title,
    route: `/legal-tracker/${lc.slug}`,
    relationship: "legal case",
  };
}

function resolveCountry(slug: string): RelatedRecord | null {
  const c = getCountryBySlug(slug);
  if (!c) return null;
  return {
    id: `country:${c.id}`,
    type: "country",
    title: c.name,
    route: c.route,
    relationship: "country page",
  };
}

function resolveInstitution(slug: string): RelatedRecord | null {
  const inst = getInstitutionEntryBySlug(slug);
  if (!inst) return null;
  return {
    id: `institution:${inst.id}`,
    type: "institution",
    title: inst.name + (inst.acronym ? ` (${inst.acronym})` : ""),
    route: inst.route,
    relationship: "institution page",
  };
}

// ── Route → record resolver (for relatedRoutes) ─────────────────────────────

/** Map platform routes to the records they represent. */
function resolveRoute(route: string): RelatedRecord | null {
  // Evidence items reference routes like /gaza-dossier, /legal-tracker, etc.
  // Try to find a record that "owns" this route.
  if (route === "/gaza-dossier") {
    return {
      id: "trust-gaza-dossier",
      type: "trust_page",
      title: "Gaza Dossier",
      route: "/gaza-dossier",
      relationship: "related page",
    };
  }
  if (route === "/legal-tracker") {
    return {
      id: "trust-legal-tracker",
      type: "trust_page",
      title: "Legal Tracker",
      route: "/legal-tracker",
      relationship: "related page",
    };
  }
  if (route === "/methodology") {
    return {
      id: "trust-methodology",
      type: "trust_page",
      title: "Methodology",
      route: "/methodology",
      relationship: "related page",
    };
  }
  if (route === "/corrections") {
    return {
      id: "trust-corrections",
      type: "trust_page",
      title: "Corrections",
      route: "/corrections",
      relationship: "related page",
    };
  }
  if (route === "/organizations") {
    return {
      id: "trust-organizations",
      type: "trust_page",
      title: "Organization Directory",
      route: "/organizations",
      relationship: "related page",
    };
  }
  if (route === "/contribute") {
    return {
      id: "trust-contribute",
      type: "trust_page",
      title: "Contribute",
      route: "/contribute",
      relationship: "related page",
    };
  }
  if (route === "/take-action") {
    return {
      id: "trust-action-hub",
      type: "trust_page",
      title: "Action Hub",
      route: "/take-action",
      relationship: "related page",
    };
  }
  if (route === "/evidence") {
    return {
      id: "trust-evidence-library",
      type: "trust_page",
      title: "Evidence Library",
      route: "/evidence",
      relationship: "related page",
    };
  }

  // Country and institution routes
  if (route.startsWith("/countries/")) {
    const slug = route.replace("/countries/", "");
    const c = getCountryBySlug(slug);
    if (c) return resolveCountry(slug);
  }
  if (route.startsWith("/institutions/")) {
    const slug = route.replace("/institutions/", "");
    const inst = getInstitutionEntryBySlug(slug);
    if (inst) return resolveInstitution(slug);
  }

  return null;
}

// ── Relationship resolver ───────────────────────────────────────────────────

/**
 * Get all relationships for a given record.
 *
 * `referencedBy` = records that point TO this record (reverse references).
 * `references`   = records that this record points TO.
 */
export function getRelationships(recordId: string): RecordRelationships {
  const referencedBy: RelatedRecord[] = [];
  const references: RelatedRecord[] = [];

  // Parse the scoped ID: "source:icj-2024-01-26" → type=source, id=icj-2024-01-26
  const colonIdx = recordId.indexOf(":");
  if (colonIdx === -1) {
    return { recordId, referencedBy, references };
  }
  const recordType = recordId.slice(0, colonIdx) as SearchableRecordType;
  const nativeId = recordId.slice(colonIdx + 1);

  switch (recordType) {
    case "source": {
      // Who references this source?
      referencedBy.push(
        ...findReferencingEvidence(nativeId),
        ...findReferencingLegalCases(nativeId),
        ...findReferencingOrganizations(nativeId),
        ...findReferencingActions(nativeId),
        ...findReferencingDossiersBySource(nativeId),
      );
      break;
    }
    case "evidence": {
      // What does this evidence reference?
      const ev = getEvidenceBySlug(nativeId);
      if (ev) {
        references.push(...ev.sourceIds.map((sid) => resolveSource(sid)).filter(Boolean) as RelatedRecord[]);
        references.push(...ev.relatedRoutes.map((r) => resolveRoute(r)).filter(Boolean) as RelatedRecord[]);
      }
      // Who references this evidence?
      referencedBy.push(...findReferencingDossiersByEvidence(nativeId));
      break;
    }
    case "legal_case": {
      const lc = getLegalCaseBySlug(nativeId);
      if (lc) {
        references.push(...lc.sourceIds.map((sid) => resolveSource(sid)).filter(Boolean) as RelatedRecord[]);
      }
      referencedBy.push(...findReferencingDossiersByLegalCase(nativeId));
      break;
    }
    case "organization": {
      const org = organizationRecords.find((o) => o.id === nativeId || o.slug === nativeId);
      if (org) {
        references.push(...org.sourceIds.map((sid) => resolveSource(sid)).filter(Boolean) as RelatedRecord[]);
      }
      break;
    }
    case "action": {
      const at = actionTemplates.find((a) => a.id === nativeId || a.slug === nativeId);
      if (at) {
        references.push(...at.sourceIds.map((sid) => resolveSource(sid)).filter(Boolean) as RelatedRecord[]);
        references.push(...at.relatedRoutes.map((r) => resolveRoute(r)).filter(Boolean) as RelatedRecord[]);
      }
      break;
    }
    case "country": {
      const c = getCountryBySlug(nativeId);
      if (c) {
        referencedBy.push(...findReferencingDossiersByCountry(nativeId));
      }
      break;
    }
    case "institution": {
      referencedBy.push(...findReferencingDossiersByInstitution(nativeId));
      break;
    }
    case "dossier": {
      const d = dossiers.find((d) => d.id === nativeId || d.slug === nativeId);
      if (d) {
        references.push(...d.sourceIds.map((sid) => resolveSource(sid)).filter(Boolean) as RelatedRecord[]);
        references.push(...d.keyFactRecordIds.map((eid) => resolveEvidence(eid)).filter(Boolean) as RelatedRecord[]);
        references.push(...d.legalCaseIds.map((lid) => resolveLegalCase(lid)).filter(Boolean) as RelatedRecord[]);
        references.push(
          ...d.countryOrInstitutionIds
            .map((cid) => resolveCountry(cid) ?? resolveInstitution(cid))
            .filter(Boolean) as RelatedRecord[],
        );
      }
      break;
    }
    case "trust_page": {
      // Trust pages don't have ID-based relationships — they link via routes.
      break;
    }
  }

  // Deduplicate by ID
  const seen = new Set<string>();
  const dedupeRefs = (arr: RelatedRecord[]): RelatedRecord[] =>
    arr.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

  return {
    recordId,
    referencedBy: dedupeRefs(referencedBy),
    references: dedupeRefs(references),
  };
}

// ── Reverse-reference helpers ───────────────────────────────────────────────

function findReferencingEvidence(sourceId: string): RelatedRecord[] {
  return evidenceItems
    .filter((e) => e.sourceIds.includes(sourceId))
    .map((e) => ({
      id: `evidence:${e.id}`,
      type: "evidence" as SearchableRecordType,
      title: e.title,
      route: `/evidence/${e.slug}`,
      relationship: "references this source",
    }));
}

function findReferencingLegalCases(sourceId: string): RelatedRecord[] {
  return legalCases
    .filter((lc) => lc.sourceIds.includes(sourceId))
    .map((lc) => ({
      id: `legal_case:${lc.id}`,
      type: "legal_case" as SearchableRecordType,
      title: lc.title,
      route: `/legal-tracker/${lc.slug}`,
      relationship: "references this source",
    }));
}

function findReferencingOrganizations(sourceId: string): RelatedRecord[] {
  return organizationRecords
    .filter((org) => org.sourceIds.includes(sourceId))
    .map((org) => ({
      id: `organization:${org.id}`,
      type: "organization" as SearchableRecordType,
      title: org.name,
      route: `/organizations/${org.slug}`,
      relationship: "references this source",
    }));
}

function findReferencingActions(sourceId: string): RelatedRecord[] {
  return actionTemplates
    .filter((at) => at.sourceIds.includes(sourceId))
    .map((at) => ({
      id: `action:${at.id}`,
      type: "action" as SearchableRecordType,
      title: at.title,
      route: `/take-action/${at.slug}`,
      relationship: "references this source",
    }));
}

function findReferencingDossiersBySource(sourceId: string): RelatedRecord[] {
  return dossiers
    .filter((d) => d.sourceIds.includes(sourceId))
    .map((d) => ({
      id: `dossier:${d.id}`,
      type: "dossier" as SearchableRecordType,
      title: d.title,
      route: `/dossiers/${d.slug}`,
      relationship: "includes this source",
    }));
}

function findReferencingDossiersByEvidence(evidenceSlug: string): RelatedRecord[] {
  return dossiers
    .filter((d) => d.keyFactRecordIds.includes(evidenceSlug))
    .map((d) => ({
      id: `dossier:${d.id}`,
      type: "dossier" as SearchableRecordType,
      title: d.title,
      route: `/dossiers/${d.slug}`,
      relationship: "includes this evidence",
    }));
}

function findReferencingDossiersByLegalCase(legalCaseSlug: string): RelatedRecord[] {
  return dossiers
    .filter((d) => d.legalCaseIds.includes(legalCaseSlug))
    .map((d) => ({
      id: `dossier:${d.id}`,
      type: "dossier" as SearchableRecordType,
      title: d.title,
      route: `/dossiers/${d.slug}`,
      relationship: "includes this legal case",
    }));
}

function findReferencingDossiersByCountry(countrySlug: string): RelatedRecord[] {
  return dossiers
    .filter((d) => d.countryOrInstitutionIds.includes(countrySlug))
    .map((d) => ({
      id: `dossier:${d.id}`,
      type: "dossier" as SearchableRecordType,
      title: d.title,
      route: `/dossiers/${d.slug}`,
      relationship: "includes this country context",
    }));
}

function findReferencingDossiersByInstitution(institutionSlug: string): RelatedRecord[] {
  return dossiers
    .filter((d) => d.countryOrInstitutionIds.includes(institutionSlug))
    .map((d) => ({
      id: `dossier:${d.id}`,
      type: "dossier" as SearchableRecordType,
      title: d.title,
      route: `/dossiers/${d.slug}`,
      relationship: "includes this institution context",
    }));
}
