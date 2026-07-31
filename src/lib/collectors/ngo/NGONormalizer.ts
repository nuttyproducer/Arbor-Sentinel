import type { NormalizedContent } from "../types";

// ── Types ─────────────────────────────────────────────────────────────

export type NgoReportType =
  | "research_report"
  | "press_release"
  | "legal_analysis"
  | "campaign_page"
  | "testimony_summary"
  | "video_documentation"
  | "data_update"
  | "operational_update"
  | "field_report"
  | "medical_access_statement"
  | "ihl_statement"
  | "news_release"
  | "multimedia_documentation";

export interface RawNgoDocument {
  url: string;
  title: string;
  organization: string;
  reportType: NgoReportType;
  date?: string;
  bodyText: string;
  summaryText?: string;
  methodology?: string;
  keyFindings: string[];
  geographicScope?: string[];
  legalReferences: string[];
  language: string;
  /** NGO findings are NOT judicial determinations. This must always be false for NGO sources. */
  isOfficialSource: boolean;
}

export interface NormalizedNgoDocument extends NormalizedContent {
  organization: string;
  reportType: NgoReportType;
  methodology?: string;
  keyFindings: string[];
  geographicScope?: string[];
  legalReferences: string[];
  isOfficialSource: boolean;
}

/**
 * Normalizer for NGO documents (Amnesty, HRW, B'Tselem, MSF, ICRC).
 *
 * Extracts: organization name, report type, publication date,
 * methodology section, key findings (verbatim quotes), geographic scope,
 * legal references.
 *
 * Guardrails:
 * - NGO findings are NOT judicial determinations — label outputs accordingly
 * - Preserve exact NGO language in key findings quotes
 * - Do not combine or conflate findings from different NGOs
 * - Note in output metadata whether the source is official institutional or NGO research
 */
export class NGONormalizer {
  /**
   * Normalize a raw NGO document into NormalizedContent.
   * Key findings are preserved as exact verbatim quotes.
   */
  normalize(raw: RawNgoDocument): NormalizedNgoDocument {
    return {
      title: raw.title,
      body: raw.summaryText || raw.bodyText.slice(0, 500),
      publishedAt: raw.date,
      url: raw.url,
      language: raw.language || "en",
      tags: this.generateTags(raw),
      metadata: {
        organization: raw.organization,
        reportType: raw.reportType,
        methodology: raw.methodology,
        keyFindings: raw.keyFindings,
        geographicScope: raw.geographicScope,
        legalReferences: raw.legalReferences,
        isOfficialSource: raw.isOfficialSource,
        sourceCategory: "ngo-research",
        disclaimer: "NGO findings are not judicial determinations",
      },
      organization: raw.organization,
      reportType: raw.reportType,
      methodology: raw.methodology,
      keyFindings: raw.keyFindings,
      geographicScope: raw.geographicScope,
      legalReferences: raw.legalReferences,
      isOfficialSource: raw.isOfficialSource,
    };
  }

  /**
   * Validate a raw NGO document before normalization.
   */
  validate(raw: RawNgoDocument): { valid: boolean; reason?: string } {
    if (!raw.url?.trim()) return { valid: false, reason: "Missing URL" };
    if (!raw.title?.trim()) return { valid: false, reason: "Missing title" };
    if (!raw.organization?.trim()) return { valid: false, reason: "Missing organization" };
    if (!raw.bodyText?.trim()) return { valid: false, reason: "Missing body text" };
    return { valid: true };
  }

  /** Generate tags from document metadata. */
  private generateTags(raw: RawNgoDocument): string[] {
    const tags: string[] = [
      "ngo-research",
      raw.reportType,
      raw.organization.toLowerCase().replace(/\s+/g, "-"),
    ];

    if (raw.geographicScope) {
      for (const geo of raw.geographicScope) {
        tags.push(geo.toLowerCase().replace(/\s+/g, "-"));
      }
    }

    return [...new Set(tags)];
  }
}
