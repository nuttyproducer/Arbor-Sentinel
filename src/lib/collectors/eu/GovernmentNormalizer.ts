import type { NormalizedContent } from "../types";

// ── Raw government document types ──────────────────────────────────────────

export type GovernmentDocumentType =
  | "council_conclusion"
  | "commission_statement"
  | "parliament_resolution"
  | "eeas_press_release"
  | "eurlex_document"
  | "press_release"
  | "parliamentary_question"
  | "parliamentary_record"
  | "government_decision"
  | "regional_position";

export interface RawGovernmentDocument {
  url: string;
  title: string;
  institution: string;
  documentReference?: string;
  legalBasis: string[];
  voteTally?: { for: number; against: number; abstain: number };
  effectiveDate?: string;
  governmentLevel: "eu" | "federal" | "regional" | "community";
  documentType: GovernmentDocumentType;
  date?: string;
  bodyText: string;
  summaryText?: string;
  language: string;
  /** Whether this is adopted legislation or a proposal. */
  isAdopted: boolean;
}

export interface NormalizedGovernmentDocument extends NormalizedContent {
  institution: string;
  documentReference?: string;
  legalBasis: string[];
  voteTally?: { for: number; against: number; abstain: number };
  governmentLevel: "eu" | "federal" | "regional" | "community";
  documentType: GovernmentDocumentType;
  isAdopted: boolean;
}

/**
 * Normalizer for government documents (EU, Belgium, member states).
 *
 * Extracts: issuing institution, document reference/code, legal basis
 * citations, vote tallies, effective dates. Distinguishes between
 * EU institution types and government levels.
 *
 * Guardrails:
 * - Distinguish EU Council vs Commission vs Parliament
 * - Distinguish proposed vs adopted legislation
 * - Belgium regional documents labeled with correct government level
 */
export class GovernmentNormalizer {
  normalize(raw: RawGovernmentDocument): NormalizedGovernmentDocument {
    return {
      title: raw.title,
      body: raw.summaryText || raw.bodyText.slice(0, 500),
      publishedAt: raw.date,
      url: raw.url,
      language: raw.language || "en",
      tags: this.generateTags(raw),
      metadata: {
        institution: raw.institution,
        documentReference: raw.documentReference,
        governmentLevel: raw.governmentLevel,
        documentType: raw.documentType,
      },
      institution: raw.institution,
      documentReference: raw.documentReference,
      legalBasis: raw.legalBasis,
      voteTally: raw.voteTally,
      governmentLevel: raw.governmentLevel,
      documentType: raw.documentType,
      isAdopted: raw.isAdopted,
    };
  }

  validate(raw: RawGovernmentDocument): { valid: boolean; reason?: string } {
    if (!raw.url?.trim()) return { valid: false, reason: "Missing URL" };
    if (!raw.title?.trim()) return { valid: false, reason: "Missing title" };
    if (!raw.bodyText?.trim()) return { valid: false, reason: "Missing body text" };
    if (!raw.institution?.trim()) return { valid: false, reason: "Missing institution" };
    return { valid: true };
  }

  private generateTags(raw: RawGovernmentDocument): string[] {
    const tags: string[] = [
      raw.governmentLevel,
      raw.documentType,
      raw.institution.toLowerCase().replace(/\s+/g, "-"),
    ];
    if (raw.isAdopted) tags.push("adopted");
    else tags.push("proposed");
    return [...new Set(tags)];
  }
}
