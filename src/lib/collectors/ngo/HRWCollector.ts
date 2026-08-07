import { BaseCollector } from "../BaseCollector";
import { NGONormalizer, type RawNgoDocument, type NgoReportType } from "./NGONormalizer";
import { ValidationError } from "../errors";
import type { NormalizedContent } from "../types";

/**
 * Collector for Human Rights Watch content.
 *
 * Fetches: detailed reports, news releases, legal analysis, multimedia documentation.
 * Detects World Report annual publications. Extracts methodology, key findings,
 * and legal references from HRW's HTML structure.
 * Rate limit: 2s minimum delay between requests.
 */
export class HRWCollector extends BaseCollector {
  private readonly normalizer = new NGONormalizer();
  private static readonly BASE_URL = "https://www.hrw.org";

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
    const v = this.normalizer.validate(doc);
    if (!v.valid) {
      throw new ValidationError(`HRW validation: ${v.reason}`, {
        sourceId: this.source.id,
        url: doc.url,
        attempt: 1,
      });
    }
    return this.normalizer.normalize(doc);
  }

  // ── URL Classification ──────────────────────────────────────────────

  private isListingUrl(url: string): boolean {
    return /\/(?:news|reports|video-photos|world-report)(?:\/|$)/i.test(url) &&
      !/\/\d{4}\//i.test(url);
  }

  private isMultimedia(url: string): boolean {
    return /\/video-photos\//i.test(url);
  }

  private isWorldReport(url: string, html: string): boolean {
    return /\/world-report\//i.test(url) || /World Report/i.test(html.slice(0, 500));
  }

  // ── Fetching ─────────────────────────────────────────────────────────

  private async fetchDocument(url: string): Promise<RawNgoDocument> {
    const html = await this.fetchHtml(url);
    return {
      url,
      title: this.extractTitle(html),
      organization: "Human Rights Watch",
      reportType: this.classifyDoc(html, url),
      date: this.extractDate(html),
      bodyText: this.extractBody(html),
      summaryText: this.extractMeta(html, "description"),
      methodology: this.extractMethodology(html),
      keyFindings: this.extractKeyFindings(html),
      geographicScope: this.extractGeoScope(html, url),
      legalReferences: this.extractLegalRefs(html),
      language: this.detectLang(html),
      isOfficialSource: false,
    };
  }

  private async fetchHtml(url: string): Promise<string> {
    return this.httpFetch(url).then((r) => r.text());
  }

  private async extractLinks(url: string): Promise<string[]> {
    const html = await this.fetchHtml(url);
    const links: string[] = [];
    const re = /href="(\/(?:report|news|video-photos|world-report)\/[^"]+)"/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      const full = m[1].startsWith("http") ? m[1] : `${HRWCollector.BASE_URL}${m[1]}`;
      if (!links.includes(full)) links.push(full);
    }
    return links;
  }

  // ── HTML Extraction ──────────────────────────────────────────────────

  private extractTitle(html: string): string {
    const m = html.match(/<title>([^<]+)<\/title>/i);
    return (m?.[1] || "Human Rights Watch Document")
      .replace(/\s*\|\s*Human Rights Watch.*$/i, "")
      .replace(/\s*\|\s*HRW.*$/i, "")
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
    const article = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    const content = article?.[1] || html;
    return this.stripHtml(content);
  }

  private extractMethodology(html: string): string | undefined {
    const m = html.match(/<section[^>]*class="[^"]*methodology[^"]*"[^>]*>([\s\S]*?)<\/section>/i);
    if (m) return this.stripHtml(m[1]);
    const fallback = html.match(/<h2[^>]*>Methodology<\/h2>\s*<p[^>]*>([\s\S]*?)<\/p>/i);
    return fallback ? this.stripHtml(fallback[1]) : undefined;
  }

  private extractKeyFindings(html: string): string[] {
    const findings: string[] = [];
    const section = html.match(
      /<div[^>]*class="[^"]*findings[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    );
    const content = section?.[1] || "";
    const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let m;
    while ((m = liRe.exec(content)) !== null) {
      const text = this.stripHtml(m[1]);
      if (text) findings.push(text);
    }
    return findings;
  }

  private extractGeoScope(html: string, url: string): string[] | undefined {
    const knownRegions = ["Gaza", "West Bank", "Israel", "Palestine", "Lebanon", "Syria",
      "Yemen", "Ukraine", "Sudan", "Myanmar"];
    const found = knownRegions.filter((r) =>
      html.toLowerCase().includes(r.toLowerCase()) ||
      url.toLowerCase().includes(r.toLowerCase()),
    );
    return found.length > 0 ? found : undefined;
  }

  private extractLegalRefs(html: string): string[] {
    const refs: string[] = [];
    const patterns = [
      /Geneva Convention\s*(?:IV|I{0,3})\s*(?:Article\s*\d+)?/gi,
      /Additional Protocol\s*(?:I|II|III)(?:\s*Article\s*\d+)?/gi,
      /Rome Statute\s*(?:Article\s*\d+)?/gi,
      /(?:ICCPR|ICESCR)\s*(?:Article\s*\d+)?/gi,
      /UN\s*(?:Security Council|General Assembly)\s*Resolution\s*\d+/gi,
      /Customary IHL/gi,
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
    if (this.isMultimedia(url)) return "multimedia_documentation";
    if (this.isWorldReport(url, html)) return "research_report";
    if (/news release|press release/i.test(html.slice(0, 1000))) return "news_release";
    if (/legal analysis|legal memo/i.test(html.slice(0, 1000))) return "legal_analysis";
    return "research_report";
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
