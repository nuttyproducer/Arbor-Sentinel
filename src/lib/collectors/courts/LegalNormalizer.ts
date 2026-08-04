import type { LegalStatus, LegalTimelineEventType } from "../../../types/content";
import type { NormalizedContent } from "../types";

// ── Raw document types ─────────────────────────────────────────────────────

/** Raw document type as surfaced by court websites. */
export type CourtDocumentType =
  | "order"
  | "judgment"
  | "press_release"
  | "docket_update"
  | "warrant"
  | "proceeding_update"
  | "filing"
  | "prosecutor_statement"
  | "advisory_opinion"
  | "intervention";

/** Raw data extracted from a court document before normalization. */
export interface RawCourtDocument {
  /** URL of the original document or page. */
  url: string;
  /** Full title as displayed on the court website. */
  title: string;
  /** The court that issued this document. */
  court: "ICJ" | "ICC";
  /** Case name or situation name. */
  caseName?: string;
  /** Case or situation reference number. */
  caseNumber?: string;
  /** Parties involved (applicant, respondent, etc.). */
  parties: string[];
  /** Document type classification. */
  documentType: CourtDocumentType;
  /** Publication or filing date in ISO format. */
  date?: string;
  /** Verbatim body text from the document — never modified. */
  bodyText: string;
  /** Verbatim summary or excerpt from the court. */
  summaryText?: string;
  /** Key procedural or legal conclusions (verbatim). */
  keyRulings: string[];
  /** Cited legal basis (statutes, conventions, articles). */
  legalBasis: string[];
  /** Next procedural steps mentioned in the document. */
  nextSteps: string[];
  /** Language of the document (ISO 639-1). */
  language: string;
}

/**
 * Result of normalizing a court document.
 *
 * Extends NormalizedContent with court-specific metadata.
 */
export interface NormalizedCourtDocument extends NormalizedContent {
  /** The court that issued this document. */
  court: "ICJ" | "ICC";
  /** Case name. */
  caseName?: string;
  /** Case or situation reference number. */
  caseNumber?: string;
  /** Parties involved. */
  parties: string[];
  /** Document type classification. */
  documentType: CourtDocumentType;
  /** Mapped legal status from the controlled vocabulary. */
  legalStatus: LegalStatus[];
  /** Mapped timeline event type. */
  timelineEventType: LegalTimelineEventType;
  /** Verbatim key rulings — never modified. */
  keyRulings: string[];
  /** Verbatim cited legal basis. */
  legalBasis: string[];
  /** Verbatim next procedural steps. */
  nextSteps: string[];
  /** Verbatim body text — never modified. */
  bodyText: string;
}

// ── Mapping tables ─────────────────────────────────────────────────────────

/** Map court document types to legal statuses. */
const DOCUMENT_TYPE_TO_LEGAL_STATUS: Record<CourtDocumentType, LegalStatus[]> = {
  order: ["court_proceeding_active", "provisional_measures_issued"],
  judgment: ["court_proceeding_active"],
  press_release: ["court_proceeding_active"],
  docket_update: ["court_proceeding_active"],
  warrant: ["arrest_warrant_issued", "court_proceeding_active"],
  proceeding_update: ["court_proceeding_active"],
  filing: ["allegation_under_investigation", "court_proceeding_active"],
  prosecutor_statement: ["allegation_under_investigation"],
  advisory_opinion: ["court_proceeding_active"],
  intervention: ["court_proceeding_active"],
};

/** Map court document types to timeline event types. */
const DOCUMENT_TYPE_TO_TIMELINE_EVENT: Record<CourtDocumentType, LegalTimelineEventType> = {
  order: "order",
  judgment: "judgment",
  press_release: "official_report_update",
  docket_update: "official_report_update",
  warrant: "arrest_warrant_issued",
  proceeding_update: "hearing",
  filing: "filing",
  prosecutor_statement: "official_report_update",
  advisory_opinion: "order",
  intervention: "intervention",
};

/** Detect document type from title and body text keywords. */
function detectDocumentType(title: string, bodyText: string, court: "ICJ" | "ICC"): CourtDocumentType {
  const combined = `${title} ${bodyText.slice(0, 1000)}`.toLowerCase();

  // Order of checks matters — more specific first
  if (/\b(arrest warrant|warrant of arrest)\b/i.test(combined)) return "warrant";
  if (/\b(judgment|jugement|arrêt)\b/i.test(combined)) return "judgment";
  if (/\b(advisory opinion|avis consultatif)\b/i.test(combined)) return "advisory_opinion";
  if (/\b(intervention|intervening)\b/i.test(title.toLowerCase())) return "intervention";
  if (/\b(filing|application instituting|requête introductive)\b/i.test(combined)) return "filing";
  if (/\b(prosecutor(?:'s)? statement|statement of the prosecutor)\b/i.test(combined))
    return "prosecutor_statement";
  if (/\b(order|ordonnance)\b/i.test(combined)) return "order";
  if (/\b(proceeding|hearing|audience|confirmation of charges)\b/i.test(combined))
    return "proceeding_update";
  if (/\b(press release|communiqué de presse)\b/i.test(combined)) return "press_release";
  if (/\b(docket|case information|situation)\b/i.test(combined)) return "docket_update";

  // Default: press release for ICJ, proceeding update for ICC
  return court === "ICJ" ? "press_release" : "proceeding_update";
}

/** Detect case number from text using court-specific patterns. */
function detectCaseNumber(text: string, court: "ICJ" | "ICC"): string | undefined {
  if (court === "ICJ") {
    // ICJ patterns: "Case No. 192", "General List No. 192"
    const icjMatch = text.match(/(?:Case|General List)\s*(?:No\.?|Number)\s*(\d+)/i);
    if (icjMatch) return `ICJ Case No. ${icjMatch[1]}`;
  }
  if (court === "ICC") {
    // ICC patterns: "ICC-01/18", "Situation in...", "The Prosecutor v..."
    const iccMatch = text.match(/\b(ICC[-–]\d{2}\/\d{2}(?:\/\d{2})?)\b/i);
    if (iccMatch) return iccMatch[1];
    // Try situation reference
    const sitMatch = text.match(/Situation (?:in|en) ([^,]+)/i);
    if (sitMatch) return `Situation: ${sitMatch[1].trim()}`;
  }
  return undefined;
}

/** Detect parties from text. */
function detectParties(text: string, title: string): string[] {
  const parties: string[] = [];

  // Common patterns for party extraction
  const applicantMatch = title.match(/([^(]+)\s*\(([^)]+)\s*v\.?\s*([^)]+)\)/i);
  if (applicantMatch) {
    parties.push(applicantMatch[2].trim());
    parties.push(applicantMatch[3].trim());
    return parties;
  }

  // ICJ pattern: "X v. Y" or "X c. Y"
  const vMatch = title.match(/(.+?)\s+(?:v\.?|c\.)\s+(.+)/i);
  if (vMatch) {
    parties.push(vMatch[1].trim());
    parties.push(vMatch[2].trim());
    return parties;
  }

  // ICC pattern: "The Prosecutor v. X"
  const prosecutorMatch = title.match(/The Prosecutor\s+(?:v\.?|c\.)\s+(.+)/i);
  if (prosecutorMatch) {
    parties.push("The Prosecutor");
    parties.push(prosecutorMatch[1].trim());
    return parties;
  }

  return parties;
}

/**
 * Legal document normalizer.
 *
 * Extracts structured metadata from raw court documents while preserving
 * verbatim text. Does NOT add legal analysis, commentary, or interpretation.
 * Procedural status uses the LegalStatus controlled vocabulary.
 */
export class LegalNormalizer {
  /**
   * Normalize a raw court document into a NormalizedCourtDocument.
   *
   * @param raw - Raw extracted document data.
   * @returns Normalized document ready for deduplication and storage.
   */
  normalize(raw: RawCourtDocument): NormalizedCourtDocument {
    const documentType = raw.documentType || detectDocumentType(raw.title, raw.bodyText, raw.court);
    const caseNumber = raw.caseNumber || detectCaseNumber(raw.bodyText || raw.title, raw.court);
    const parties = raw.parties.length > 0 ? raw.parties : detectParties(raw.title, raw.title);
    const legalStatus = DOCUMENT_TYPE_TO_LEGAL_STATUS[documentType];
    const timelineEventType = DOCUMENT_TYPE_TO_TIMELINE_EVENT[documentType];

    return {
      title: raw.title,
      body: raw.summaryText || raw.bodyText.slice(0, 500),
      publishedAt: raw.date,
      url: raw.url,
      language: raw.language || "en",
      tags: this.generateTags(raw, documentType, parties),
      metadata: {
        court: raw.court,
        caseName: raw.caseName,
        caseNumber,
        documentType,
      },
      // Court-specific extensions
      court: raw.court,
      caseName: raw.caseName,
      caseNumber,
      parties,
      documentType,
      legalStatus,
      timelineEventType,
      keyRulings: raw.keyRulings,
      legalBasis: raw.legalBasis,
      nextSteps: raw.nextSteps,
      bodyText: raw.bodyText,
    };
  }

  /**
   * Validate a raw document has the minimum required fields.
   */
  validate(raw: RawCourtDocument): { valid: boolean; reason?: string } {
    if (!raw.url || raw.url.trim() === "") {
      return { valid: false, reason: "Missing URL" };
    }
    if (!raw.title || raw.title.trim() === "") {
      return { valid: false, reason: "Missing title" };
    }
    if (!raw.bodyText || raw.bodyText.trim() === "") {
      return { valid: false, reason: "Missing body text" };
    }
    if (!["ICJ", "ICC"].includes(raw.court)) {
      return { valid: false, reason: `Invalid court: "${raw.court}". Must be "ICJ" or "ICC".` };
    }
    return { valid: true };
  }

  // ── Private ───────────────────────────────────────────────────────────

  private generateTags(
    raw: RawCourtDocument,
    documentType: CourtDocumentType,
    parties: string[],
  ): string[] {
    const tags: string[] = [raw.court.toLowerCase(), documentType];

    if (raw.caseName) tags.push(raw.caseName.toLowerCase());
    if (raw.caseNumber) tags.push(raw.caseNumber.toLowerCase());

    // Add jurisdiction tags from known case contexts
    if (raw.title.toLowerCase().includes("gaza")) tags.push("gaza");
    if (raw.title.toLowerCase().includes("ukraine")) tags.push("ukraine");
    if (raw.title.toLowerCase().includes("myanmar")) tags.push("myanmar");
    if (raw.title.toLowerCase().includes("palestine")) tags.push("palestine");
    if (raw.title.toLowerCase().includes("drc") || raw.title.toLowerCase().includes("congo"))
      tags.push("drc");

    return [...new Set(tags)];
  }
}
