import { BaseCollector } from "../BaseCollector";
import { LegalNormalizer } from "./LegalNormalizer";
import { ParseError, ValidationError } from "../errors";
import type { NormalizedContent } from "../types";
import type { RawCourtDocument, CourtDocumentType } from "./LegalNormalizer";

/**
 * Collector for the International Criminal Court (icc-cpi.int).
 *
 * Handles:
 * - Press releases
 * - Arrest warrants
 * - Proceeding updates (confirmation of charges, trial openings, etc.)
 * - Situation page updates
 * - Prosecutor statements
 * - Filings and decisions
 *
 * URL patterns supported:
 * - Direct document URLs: https://www.icc-cpi.int/news/...
 * - Situation pages: https://www.icc-cpi.int/situations/...
 * - Case pages: https://www.icc-cpi.int/defendant/...
 * - Press release listings: https://www.icc-cpi.int/news
 */
export class ICCCollector extends BaseCollector {
  private readonly normalizer = new LegalNormalizer();

  private static readonly BASE_URL = "https://www.icc-cpi.int";

  /**
   * Fetch raw documents from the ICC website.
   *
   * Strategy: If the source URL points to a specific news item or document,
   * fetch it directly. Otherwise, fetch the listing page and extract links.
   */
  async fetch(): Promise<unknown[]> {
    const url = this.source.url;

    if (this.isDocumentUrl(url)) {
      const doc = await this.fetchDocument(url);
      return [doc];
    }

    if (this.isListingUrl(url)) {
      const docUrls = await this.fetchListing(url);
      const documents: RawCourtDocument[] = [];
      for (const docUrl of docUrls.slice(0, 10)) {
        try {
          const doc = await this.fetchDocument(docUrl);
          documents.push(doc);
        } catch (error) {
          if (error instanceof ParseError || error instanceof ValidationError) {
            continue;
          }
          throw error;
        }
      }
      return documents;
    }

    const doc = await this.fetchDocument(url);
    return [doc];
  }

  async normalize(raw: unknown): Promise<NormalizedContent> {
    const doc = raw as RawCourtDocument;

    const validation = this.normalizer.validate(doc);
    if (!validation.valid) {
      throw new ValidationError(
        `ICC document validation failed: ${validation.reason}`,
        { sourceId: this.source.id, url: doc.url, attempt: 1 },
      );
    }

    return this.normalizer.normalize(doc);
  }

  // ── Private: URL classification ──────────────────────────────────────

  private isDocumentUrl(url: string): boolean {
    return (
      /\/news\/[^/]/i.test(url) ||
      /\/defendant\//i.test(url) ||
      /\/cases\//i.test(url) ||
      /\/items\//i.test(url) ||
      /\/documents\//i.test(url)
    );
  }

  private isListingUrl(url: string): boolean {
    return (
      url.includes("/news") ||
      url.includes("/situations") ||
      url === ICCCollector.BASE_URL ||
      url === `${ICCCollector.BASE_URL}/`
    );
  }

  // ── Private: Fetch operations ────────────────────────────────────────

  private async fetchDocument(url: string): Promise<RawCourtDocument> {
    const html = await this.fetchHtml(url);

    return {
      url,
      title: this.extractTitle(html),
      court: "ICC",
      caseName: this.extractCaseName(html, url),
      caseNumber: undefined,
      parties: this.extractPartiesICC(html),
      documentType: this.classifyICCDocument(html, url),
      date: this.extractDate(html),
      bodyText: this.extractBodyText(html),
      summaryText: this.extractSummary(html),
      keyRulings: this.extractKeyRulingsICC(html),
      legalBasis: this.extractLegalBasis(html),
      nextSteps: this.extractNextSteps(html),
      language: this.detectLanguage(html),
    };
  }

  private async fetchListing(url: string): Promise<string[]> {
    const html = await this.fetchHtml(url);
    const links: string[] = [];

    const linkPattern = /href="(\/(?:news|defendant|cases|items|documents)\/[^"]+)/gi;
    let match;
    while ((match = linkPattern.exec(html)) !== null) {
      const href = match[1];
      const fullUrl = href.startsWith("http") ? href : `${ICCCollector.BASE_URL}${href}`;
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
        throw new ParseError(`ICC document not found: ${url}`, {
          sourceId: this.source.id,
          url,
          attempt: 1,
        });
      }
      if (response.status === 503) {
        throw new ParseError(`ICC website unavailable (503): ${url}`, {
          sourceId: this.source.id,
          url,
          attempt: 1,
        });
      }
      throw new ParseError(
        `ICC fetch failed with status ${response.status}: ${url}`,
        { sourceId: this.source.id, url, attempt: 1 },
      );
    }

    return response.text();
  }

  // ── Private: HTML extraction ─────────────────────────────────────────

  private extractTitle(html: string): string {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      return titleMatch[1]
        .replace(/\s*\|\s*International Criminal Court\s*$/i, "")
        .replace(/\s*\|\s*ICC[-\s]CPI\s*$/i, "")
        .trim();
    }

    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) return h1Match[1].trim();

    return "Untitled ICC Document";
  }

  private extractCaseName(html: string, url: string): string | undefined {
    const patterns = [
      /(?:The Prosecutor\s+(?:v\.?|c\.)\s+[^<]+)/i,
      /(?:Situation (?:in|en)\s+[^<]+)/i,
      /(?:Case[:\s]+[^<]+)/i,
      /(?:The Prosecutor v\.?\s+[^<,]+)/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[0].trim();
    }

    // Try URL-based extraction
    const urlMatch = url.match(/\/(?:defendant|situations)\/([^/]+)/i);
    if (urlMatch) {
      return urlMatch[1].replace(/-/g, " ");
    }

    return undefined;
  }

  private extractPartiesICC(html: string): string[] {
    const parties: string[] = [];

    // ICC: "The Prosecutor v. X"
    const prosecutorMatch = html.match(/The Prosecutor\s+(?:v\.?|c\.)\s+([A-Z][^<,]+)/i);
    if (prosecutorMatch) {
      parties.push("The Prosecutor");
      parties.push(prosecutorMatch[1].trim());
    }

    return parties;
  }

  private classifyICCDocument(html: string, url: string): CourtDocumentType {
    const combined = `${html} ${url}`.toLowerCase();

    if (/\b(arrest warrant|warrant of arrest)\b/i.test(combined)) return "warrant";
    if (/\b(judgment|trial judgment|appeals judgment|decision on the appeal)\b/i.test(combined))
      return "judgment";
    if (/\b(confirmation of charges|pre-trial|trial chamber|appeals chamber)\b/i.test(combined))
      return "proceeding_update";
    if (/\b(prosecutor(?:'s)?\s+statement|statement of the prosecutor)\b/i.test(combined))
      return "prosecutor_statement";
    if (/\b(filing|submission|application|request)\b/i.test(combined)) return "filing";
    if (/\b(decision|order|direction)\b/i.test(combined)) return "order";
    if (/\b(press release|news item)\b/i.test(combined)) return "press_release";
    if (/\b(situation in|preliminary examination)\b/i.test(combined)) return "docket_update";

    return "press_release";
  }

  private extractDate(html: string): string | undefined {
    const timeMatch = html.match(/<time[^>]*datetime="([^"]+)"/i);
    if (timeMatch) return timeMatch[1];

    const metaMatch = html.match(
      /<meta[^>]*(?:property="article:published_time"|name="date")[^>]*content="([^"]+)"/i,
    );
    if (metaMatch) return metaMatch[1];

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
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");

    const mainMatch = text.match(
      /<(?:main|article|div[^>]*class="[^"]*content[^"]*")[^>]*>([\s\S]*?)<\/(?:main|article|div)>/i,
    );
    if (mainMatch) text = mainMatch[1];

    text = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    return text;
  }

  private extractSummary(html: string): string | undefined {
    const metaMatch = html.match(
      /<meta[^>]*name="description"[^>]*content="([^"]+)"/i,
    );
    if (metaMatch) return metaMatch[1];

    const body = this.extractBodyText(html);
    return body.slice(0, 500);
  }

  private extractKeyRulingsICC(html: string): string[] {
    const rulings: string[] = [];
    const body = this.extractBodyText(html);

    const rulingPatterns = [
      /(?:The Chamber|finds|concludes|decides|orders|hereby|issued a warrant|confirmed the charges|sentenced|acquitted)[^.]*\./gi,
      /(?:warrant of arrest|summons to appear|decision on)[^.]*\./gi,
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

    return rulings.slice(0, 20);
  }

  private extractLegalBasis(html: string): string[] {
    const basis: string[] = [];
    const body = this.extractBodyText(html);

    const instruments = [
      "Rome Statute",
      "Elements of Crimes",
      "Rules of Procedure and Evidence",
      "Regulations of the Court",
      "Regulations of the Registry",
      "Code of Professional Conduct for Counsel",
      "Geneva Convention",
    ];

    for (const instrument of instruments) {
      const pattern = new RegExp(instrument.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      if (pattern.test(body) || pattern.test(html)) {
        const match = body.match(new RegExp(`.{0,50}${instrument}.{0,50}`, "i"));
        basis.push(match ? match[0].trim() : instrument);
      }
    }

    // ICC-specific: extract articles of the Rome Statute
    const articlePattern = /[Aa]rticles?\s+(\d+[\s,]*(?:and\s+\d+)*)\s*of\s+the\s+(?:Rome\s+)?Statute/gi;
    let match;
    while ((match = articlePattern.exec(body)) !== null) {
      basis.push(match[0].trim());
    }

    return [...new Set(basis)];
  }

  private extractNextSteps(html: string): string[] {
    const steps: string[] = [];
    const body = this.extractBodyText(html);

    const stepPatterns = [
      /(?:The Chamber will|will proceed|scheduled for|next|future|will convene|will deliver|will issue|to be held|will commence|commencing on)[^.]*\./gi,
      /(?:deadline|time.?limit|fixed|submission|confirmation hearing|opening statements)[^.]*\./gi,
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
