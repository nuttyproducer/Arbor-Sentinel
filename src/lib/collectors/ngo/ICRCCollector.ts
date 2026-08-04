import { BaseCollector } from "../BaseCollector";
import { NGONormalizer, type RawNgoDocument, type NgoReportType } from "./NGONormalizer";
import { ParseError, ValidationError } from "../errors";
import type { NormalizedContent } from "../types";

/**
 * Collector for the International Committee of the Red Cross (ICRC).
 *
 * Fetches: operational updates, IHL statements, news releases, field reports.
 *
 * IMPORTANT: ICRC has a unique legal status under the Geneva Conventions.
 * This collector registers for "humanitarian" source type (not "ngo") and
 * labels content as "humanitarian organization" rather than "NGO research."
 * It uses NGONormalizer internally because the raw document structure is
 * identical, but the source type and labeling differentiate ICRC content.
 *
 * Rate limit: 2s minimum delay between requests.
 */
export class ICRCCollector extends BaseCollector {
  private readonly normalizer = new NGONormalizer();
  private static readonly BASE_URL = "https://www.icrc.org";

  async fetch(): Promise<unknown[]> {
    const url = this.source.url;

    if (this.isListingUrl(url)) {
      const links = await this.extractLinks(url);
      const docs: RawNgoDocument[] = [];
      for (const link of links.slice(0, 8)) {
        try {
          docs.push(await this.fetchDocument(link));
        } catch {
          // Skip individual fetch failures on listing pages
        }
      }
      return docs;
    }

    const doc = await this.fetchDocument(url);
    return [doc];
  }

  async normalize(raw: unknown): Promise<NormalizedContent> {
    const doc = raw as RawNgoDocument;
    // Override isOfficialSource: ICRC is a humanitarian organization with
    // a unique mandate under the Geneva Conventions — still not a government
    doc.isOfficialSource = false;

    const v = this.normalizer.validate(doc);
    if (!v.valid) {
      throw new ValidationError(`ICRC validation: ${v.reason}`, {
        sourceId: this.source.id,
        url: doc.url,
        attempt: 1,
      });
    }

    const result = this.normalizer.normalize(doc);
    // Override the source category label for ICRC
    result.metadata.sourceCategory = "humanitarian-organization";
    result.metadata.disclaimer =
      "ICRC has a unique legal mandate under the Geneva Conventions. Its findings are not judicial determinations.";

    // The normalizer always tags content as "ngo-research"; relabel for ICRC
    result.tags = result.tags.filter((tag) => tag !== "ngo-research");
    result.tags.push("humanitarian-organization");

    return result;
  }

  // ── URL Classification ──────────────────────────────────────────────

  private isListingUrl(url: string): boolean {
    // A listing page is the section itself (optionally with a trailing slash
    // or a year subpath). Detail pages carry a slug after the section and
    // must not be treated as listings.
    const path = url.split(/[?#]/)[0];
    return /\/(?:en\/)?(?:document|news-release|operational-update)(?:\/\d{4})?\/?$/i.test(path);
  }

  private isIhlStatement(html: string): boolean {
    return /international humanitarian law|IHL|Geneva Convention/i.test(
      html.slice(0, 1000),
    );
  }

  private isOperational(html: string, url: string): boolean {
    return /operational.update/i.test(url) ||
      /operational|field operation/i.test(html.slice(0, 500));
  }

  private isNewsRelease(html: string): boolean {
    return /news release|press release/i.test(html.slice(0, 500));
  }

  // ── Fetching ─────────────────────────────────────────────────────────

  private async fetchDocument(url: string): Promise<RawNgoDocument> {
    const html = await this.fetchHtml(url);
    return {
      url,
      title: this.extractTitle(html),
      organization: "International Committee of the Red Cross",
      reportType: this.classifyDoc(html, url),
      date: this.extractDate(html),
      bodyText: this.extractBody(html),
      summaryText: this.extractMeta(html, "description"),
      methodology: undefined,
      keyFindings: this.extractFindings(html),
      geographicScope: this.extractGeoScope(html),
      legalReferences: this.extractLegalRefs(html),
      language: this.detectLang(html),
      isOfficialSource: false,
    };
  }

  private async fetchHtml(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new ParseError(`ICRC fetch ${res.status}: ${url}`, {
        sourceId: this.source.id,
        url,
        attempt: 1,
      });
    }
    return res.text();
  }

  private async extractLinks(url: string): Promise<string[]> {
    const html = await this.fetchHtml(url);
    const links: string[] = [];
    const re = /href="(\/(?:en\/)?(?:document|news-release|operational-update)\/[^"]+)"/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      const full = m[1].startsWith("http") ? m[1] : `${ICRCCollector.BASE_URL}${m[1]}`;
      if (!links.includes(full)) links.push(full);
    }
    return links;
  }

  // ── HTML Extraction ──────────────────────────────────────────────────

  private extractTitle(html: string): string {
    const m = html.match(/<title>([^<]+)<\/title>/i);
    return (m?.[1] || "ICRC Document")
      .replace(/\s*\|\s*(?:ICRC|International Committee of the Red Cross).*$/i, "")
      .trim();
  }

  private extractMeta(html: string, name: string): string | undefined {
    const re = new RegExp(`<meta[^>]*name="${name}"[^>]*content="([^"]+)"`, "i");
    return html.match(re)?.[1];
  }

  private extractDate(html: string): string | undefined {
    const m =
      html.match(/<time[^>]*datetime="([^"]+)"/i) ||
      html.match(/<meta[^>]*property="article:published_time"[^>]*content="([^"]+)"/i);
    return m?.[1]?.split("T")[0];
  }

  private extractBody(html: string): string {
    const div = html.match(/<div[^>]*class="[^"]*body[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const content = div?.[1] || html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] || html;
    return this.stripHtml(content);
  }

  private extractFindings(html: string): string[] {
    const body = this.extractBody(html);
    // Extract key statements from ICRC body
    const sentences = body.split(/\.(?:\s+|$)/).filter((s) => s.trim().length > 20);
    return sentences.slice(0, 3).map((s) => s.trim());
  }

  private extractGeoScope(html: string): string[] | undefined {
    const knownContexts = ["Gaza", "West Bank", "Israel", "Palestine", "Lebanon",
      "Syria", "Yemen", "Ukraine", "Sudan", "Myanmar", "Afghanistan"];
    const found = knownContexts.filter((r) =>
      html.toLowerCase().includes(r.toLowerCase()),
    );
    return found.length > 0 ? found : undefined;
  }

  private extractLegalRefs(html: string): string[] {
    const refs: string[] = [];
    const patterns = [
      /Geneva Convention\s*(?:IV|I{1,3})\s*(?:Article\s*\d+)?/gi,
      /Additional Protocol\s*(?:I|II|III)(?:\s*Article\s*\d+)?/gi,
      /Common Article\s*\d+/gi,
      /Customary IHL/gi,
      /Rome Statute\s*(?:Article\s*\d+)?/gi,
      /Hague Convention/gi,
    ];
    for (const p of patterns) {
      let m;
      while ((m = p.exec(html)) !== null) {
        refs.push(m[0].trim());
      }
    }
    return [...new Set(refs)].slice(0, 20);
  }

  private detectLang(html: string): string {
    return (html.match(/<html[^>]*lang="([^"]+)"/i)?.[1] || "en").split("-")[0];
  }

  private classifyDoc(html: string, url: string): NgoReportType {
    if (this.isIhlStatement(html)) return "ihl_statement";
    if (this.isOperational(html, url)) return "operational_update";
    if (this.isNewsRelease(html)) return "news_release";
    return "field_report";
  }

  private stripHtml(text: string): string {
    return text
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
}
