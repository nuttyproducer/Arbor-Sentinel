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
  lastReviewedAt?: string;
  version: number;
  active: boolean;
}

/** All institution entities with an active route. Only European Union during the static beta. */
export const institutionIndexEntries: InstitutionIndexEntry[] = [
  {
    id: "european-union",
    slug: "european-union",
    name: "European Union",
    acronym: "EU",
    entityType: "institution",
    region: "Europe",
    route: "/institutions/european-union",
    contentStatus: "review_pending",
    summary:
      "The European Union is a significant actor in foreign policy, trade, humanitarian aid, and arms-export regulation. This page tracks EU-level mechanisms — Commission, Council, Parliament, EEAS — and distinguishes them from member-state competencies. The EU is not a state; its powers vary by policy area.",
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
