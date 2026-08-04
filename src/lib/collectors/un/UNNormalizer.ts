import type { NormalizedContent } from "../types";

// ── Raw UN document types ──────────────────────────────────────────────────

/** Type of UN report or document. */
export type UNDocumentType =
  | "coi_report"
  | "hrc_resolution"
  | "hc_statement"
  | "situation_report"
  | "flash_appeal"
  | "humanitarian_update"
  | "funding_update"
  | "country_page"
  | "press_release";

/** Raw data extracted from a UN document. */
export interface RawUNDocument {
  url: string;
  title: string;
  issuingBody: string;
  documentSymbol?: string;
  session?: string;
  agendaItem?: string;
  reportType: UNDocumentType;
  geographicScope: string[];
  date?: string;
  bodyText: string;
  summaryText?: string;
  language: string;
}

/** Normalized UN document — extends NormalizedContent. */
export interface NormalizedUNDocument extends NormalizedContent {
  issuingBody: string;
  documentSymbol?: string;
  session?: string;
  agendaItem?: string;
  reportType: UNDocumentType;
  geographicScope: string[];
}

// ── Extractor ───────────────────────────────────────────────────────────────

/**
 * Normalizer for UN documents.
 *
 * Extracts structured metadata: UN document symbol, issuing body,
 * session/meeting identifiers, agenda items, report type, geographic scope.
 * Does NOT interpret, summarize, or editorialize UN findings.
 */
export class UNNormalizer {
  normalize(raw: RawUNDocument): NormalizedUNDocument {
    return {
      title: raw.title,
      body: raw.summaryText || raw.bodyText.slice(0, 500),
      publishedAt: raw.date,
      url: raw.url,
      language: raw.language || "en",
      tags: this.generateTags(raw),
      metadata: {
        documentSymbol: raw.documentSymbol,
        issuingBody: raw.issuingBody,
        session: raw.session,
        reportType: raw.reportType,
      },
      issuingBody: raw.issuingBody,
      documentSymbol: raw.documentSymbol || this.detectSymbol(raw),
      session: raw.session,
      agendaItem: raw.agendaItem,
      reportType: raw.reportType,
      geographicScope: raw.geographicScope,
    };
  }

  validate(raw: RawUNDocument): { valid: boolean; reason?: string } {
    if (!raw.url?.trim()) return { valid: false, reason: "Missing URL" };
    if (!raw.title?.trim()) return { valid: false, reason: "Missing title" };
    if (!raw.bodyText?.trim()) return { valid: false, reason: "Missing body text" };
    if (!raw.issuingBody?.trim()) return { valid: false, reason: "Missing issuing body" };
    return { valid: true };
  }

  // ── Symbol detection ──────────────────────────────────────────────────

  private detectSymbol(raw: RawUNDocument): string | undefined {
    const text = `${raw.title} ${raw.bodyText}`;

    // A/79/232, A/HRC/55/2, S/2024/123, E/CN.4/...
    const match = text.match(
      /\b([AES]\/\w+(?:\/\w+)*(?:\/\d+)?)\b/,
    );
    return match?.[1];
  }

  private generateTags(raw: RawUNDocument): string[] {
    const tags: string[] = [raw.reportType, raw.issuingBody.toLowerCase().replace(/\s+/g, "-")];
    for (const scope of raw.geographicScope) {
      tags.push(scope.toLowerCase());
    }
    return [...new Set(tags)];
  }
}
