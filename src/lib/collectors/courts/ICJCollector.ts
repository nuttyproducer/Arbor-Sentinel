import { BaseCollector } from "../BaseCollector";
import { LegalNormalizer } from "./LegalNormalizer";
import { ParseError, ValidationError } from "../errors";
import type { NormalizedContent } from "../types";
import type { RawCourtDocument, CourtDocumentType } from "./LegalNormalizer";

/**
 * Collector for the International Court of Justice (icj-cij.org).
 *
 * Handles:
 * - Press releases
 * - Orders (including provisional measures)
 * - Judgments
 * - Case docket updates
 * - Intervention filings
 * - Advisory opinions
 *
 * URL patterns supported:
 * - Direct document URLs: https://www.icj-cij.org/node/XXXXXX
 * - Case pages: https://www.icj-cij.org/case/XXX
 * - Press release listings: https://www.icj-cij.org/press-releases
 */
export class ICJCollector extends BaseCollector {
  private readonly normalizer = new LegalNormalizer();

  private static readonly BASE_URL = "https://www.icj-cij.org";
  private static readonly PRESS_RELEASES_URL = `${ICJCollector.BASE_URL}/press-releases`;
  private static readonly CASES_URL = `${ICJCollector.BASE_URL}/cases`;

  /**
   * Fetch raw documents from the ICJ website.
   *
   * Strategy: If the source URL points to a specific document (node),
   * fetch it directly. Otherwise, fetch the listing page and extract
   * document links.
   */
  async fetch(): Promise<unknown[]> {
    const url = this.source.url;

    if (this.isDocumentUrl(url)) {
      // Single document fetch
      const doc = await this.fetchDocument(url);
      return [doc];
    }

    if (this.isListingUrl(url)) {
      // Listing page — fetch and extract document URLs
      const docUrls = await this.fetchListing(url);
      const documents: RawCourtDocument[] = [];
      for (const docUrl of docUrls.slice(0, 10)) {
        // Limit to 10 per run
        try {
          const doc = await this.fetchDocument(docUrl);
          documents.push(doc);
        } catch (error) {
          // Skip individual document failures — continue with the rest
          if (error instanceof ParseError || error instanceof ValidationError) {
            continue;
          }
          throw error;
        }
      }
      return documents;
    }

    // Treat as a direct document URL
    const doc = await this.fetchDocument(url);
    return [doc];
  }

  async normalize(raw: unknown): Promise<NormalizedContent> {
    const doc = raw as RawCourtDocument;

    // Validate minimum requirements
    const validation = this.normalizer.validate(doc);
    if (!validation.valid) {
      throw new ValidationError(
        `ICJ document validation failed: ${validation.reason}`,
        { sourceId: this.source.id, url: doc.url, attempt: 1 },
      );
    }

    return this.normalizer.normalize(doc);
  }

  // ── Private: URL classification ──────────────────────────────────────

  private isDocumentUrl(url: string): boolean {
    // ICJ document pages: /node/XXXXXX, /case/XXX/document, /files/XXX
    return /\/node\/\d+/i.test(url) || /\/files\/\d+/i.test(url) || /\/document\b/i.test(url);
  }

  private isListingUrl(url: string): boolean {
    return (
      url.includes("/press-releases") ||
      url.includes("/cases") ||
      url === ICJCollector.BASE_URL ||
      url === `${ICJCollector.BASE_URL}/`
    );
  }

  // ── Private: Fetch operations ────────────────────────────────────────

  private async fetchDocument(url: string): Promise<RawCourtDocument> {
    const response = await this.fetchHtml(url);
    const html = response;

    return {
      url,
      title: this.extractTitle(html),
      court: "ICJ",
      caseName: this.extractCaseName(html, url),
      caseNumber: undefined, // Detected by normalizer
      parties: this.extractPartiesICJ(html),
      documentType: this.classifyICJDocument(html, url),
      date: this.extractDate(html),
      bodyText: this.extractBodyText(html),
      summaryText: this.extractSummary(html),
      keyRulings: this.extractKeyRulingsICJ(html),
      legalBasis: this.extractLegalBasis(html),
      nextSteps: this.extractNextSteps(html),
      language: this.detectLanguage(html),
    };
  }

  private async fetchListing(url: string): Promise<string[]> {
    const html = await this.fetchHtml(url);
    const links: string[] = [];

    // Extract document links from listing pages
    const linkPattern = /href="(\/(?:node|case|files)\/[^"]+)"/gi;
    let match;
    while ((match = linkPattern.exec(html)) !== null) {
      const href = match[1];
      const fullUrl = href.startsWith("http") ? href : `${ICJCollector.BASE_URL}${href}`;
      if (this.isDocumentUrl(fullUrl) && !links.includes(fullUrl)) {
        links.push(fullUrl);
      }
    }

    return links;
  }

  private async fetchHtml(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        throw new ParseError(`ICJ document not found: ${url}`, {
          sourceId: this.source.id,
          url,
          attempt: 1,
        });
      }
      if (response.status === 503) {
        throw new ParseError(`ICJ website unavailable (503): ${url}`, {
          sourceId: this.source.id,
          url,
          attempt: 1,
        });
      }
      throw new ParseError(
        `ICJ fetch failed with status ${response.status}: ${url}`,
        { sourceId: this.source.id, url, attempt: 1 },
      );
    }

    return response.text();
  }

  // ── Private: HTML extraction ─────────────────────────────────────────

  private extractTitle(html: string): string {
    // Try <title> tag first
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      return titleMatch[1]
        .replace(/\s*\|\s*International Court of Justice\s*$/i, "")
        .trim();
    }

    // Try h1
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) return h1Match[1].trim();

    return "Untitled ICJ Document";
  }

  private extractCaseName(html: string, _url: string): string | undefined {
    // ICJ case name patterns in HTML
    const patterns = [
      /(?:case|affaire)[:\s]+([^<]+?)(?:\([^)]*\))?\s*<\/h[12]>/i,
      /(?:Application of the|Case concerning the)[^<]+/i,
      /([^(]+)\s*\(([^)]+)\s*v\.?\s*([^)]+)\)/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[0].trim();
    }

    return undefined;
  }

  private extractPartiesICJ(html: string): string[] {
    const parties: string[] = [];

    // ICJ: "X v. Y" or "X c. Y" patterns
    const vMatch = html.match(/([A-Z][^<]+?)\s+(?:v\.?|c\.)\s+([A-Z][^<]+?)(?:<\/|\(|,)/i);
    if (vMatch) {
      parties.push(vMatch[1].trim());
      parties.push(vMatch[2].trim());
    }

    return parties;
  }

  private classifyICJDocument(html: string, url: string): CourtDocumentType {
    const combined = `${html} ${url}`.toLowerCase();

    if (/\bjudgment\b/i.test(combined) || /\barrêt\b/i.test(combined)) return "judgment";
    if (/\badvisory opinion\b/i.test(combined) || /\bavis consultatif\b/i.test(combined))
      return "advisory_opinion";
    if (/\border\b/i.test(combined) || /\bordonnance\b/i.test(combined)) return "order";
    if (/\bintervention\b/i.test(combined) || /\bintervening\b/i.test(combined))
      return "intervention";
    if (/\bfiling\b/i.test(combined) || /\bapplication\s+instituting\b/i.test(combined))
      return "filing";
    if (/\bpress release\b/i.test(combined) || /\bcommuniqué\b/i.test(combined))
      return "press_release";
    if (/\bdocket\b/i.test(combined)) return "docket_update";

    return "press_release";
  }

  private extractDate(html: string): string | undefined {
    // Try <time> element
    const timeMatch = html.match(/<time[^>]*datetime="([^"]+)"/i);
    if (timeMatch) return timeMatch[1];

    // Try meta tags
    const metaMatch = html.match(
      /<meta[^>]*(?:property="article:published_time"|name="date")[^>]*content="([^"]+)"/i,
    );
    if (metaMatch) return metaMatch[1];

    // Try date patterns in text: "26 January 2024"
    const dateMatch = html.match(
      /(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/i,
    );
    if (dateMatch) {
      const d = new Date(dateMatch[1]);
      if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
    }

    return undefined;
  }

  private extractBodyText(html: string): string {
    // Remove scripts, styles, and navigation
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");

    // Extract main content area
    const mainMatch = text.match(
      /<(?:main|article|div[^>]*class="[^"]*content[^"]*")[^>]*>([\s\S]*?)<\/(?:main|article|div)>/i,
    );
    if (mainMatch) text = mainMatch[1];

    // Strip remaining HTML tags
    text = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    return text;
  }

  private extractSummary(html: string): string | undefined {
    // Try meta description
    const metaMatch = html.match(
      /<meta[^>]*name="description"[^>]*content="([^"]+)"/i,
    );
    if (metaMatch) return metaMatch[1];

    // Try first paragraph after stripping tags
    const body = this.extractBodyText(html);
    const firstPara = body.split(/\.\s+/)[0];
    if (firstPara && firstPara.length < 500) return firstPara;

    return body.slice(0, 500);
  }

  private extractKeyRulingsICJ(html: string): string[] {
    const rulings: string[] = [];
    const body = this.extractBodyText(html);

    // Find ruling indicators
    const rulingPatterns = [
      /(?:The Court|finds|concludes|decides|orders|unanimously|by \d+ votes to \d+)[^.]*\./gi,
    ];

    for (const pattern of rulingPatterns) {
      let match;
      while ((match = pattern.exec(body)) !== null) {
        const ruling = match[0].trim();
        if (ruling.length > 20 && ruling.length < 1000) {
          rulings.push(ruling);
        }
      }
    }

    return rulings.slice(0, 20); // Limit to 20 key rulings
  }

  private extractLegalBasis(html: string): string[] {
    const basis: string[] = [];
    const body = this.extractBodyText(html);

    // Common legal instruments cited in ICJ documents
    const instruments = [
      "Genocide Convention",
      "Statute of the International Court of Justice",
      "Vienna Convention",
      "International Covenant on Civil and Political Rights",
      "Convention on the Rights of the Child",
      "Geneva Convention",
      "Universal Declaration of Human Rights",
      "Rome Statute",
    ];

    for (const instrument of instruments) {
      const pattern = new RegExp(instrument.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      if (pattern.test(body) || pattern.test(html)) {
        const match = body.match(new RegExp(`.{0,50}${instrument}.{0,50}`, "i"));
        basis.push(match ? match[0].trim() : instrument);
      }
    }

    return [...new Set(basis)];
  }

  private extractNextSteps(html: string): string[] {
    const steps: string[] = [];
    const body = this.extractBodyText(html);

    // Find statements about future actions
    const stepPatterns = [
      /(?:The Court will|will hold|scheduled for|next|future|will convene|will deliver|will issue|to be held)[^.]*\./gi,
      /(?:deadline|time.?limit|fixed|submission|oral argument|hearing)[^.]*\./gi,
    ];

    for (const pattern of stepPatterns) {
      let match;
      while ((match = pattern.exec(body)) !== null) {
        const step = match[0].trim();
        if (step.length > 20 && step.length < 500) {
          steps.push(step);
        }
      }
    }

    return steps.slice(0, 10);
  }

  private detectLanguage(html: string): string {
    const langMatch = html.match(/<html[^>]*lang="([^"]+)"/i);
    if (langMatch) {
      const lang = langMatch[1].split("-")[0].toLowerCase();
      return lang === "fr" ? "fr" : "en";
    }
    return "en";
  }
}
