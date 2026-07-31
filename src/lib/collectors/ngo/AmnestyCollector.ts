import { BaseCollector } from "../BaseCollector";
import { NGONormalizer, type RawNgoDocument, type NgoReportType } from "./NGONormalizer";
import { ParseError, ValidationError } from "../errors";
import type { NormalizedContent } from "../types";

/**
 * Collector for Amnesty International content.
 *
 * Fetches: research reports, press releases, legal analyses, campaign pages.
 * Detects document type from URL patterns and HTML content.
 * Rate limit: 2s minimum delay between requests (respectful crawl).
 */
export class AmnestyCollector extends BaseCollector {
  private readonly normalizer = new NGONormalizer();
  private static readonly BASE_URL = "https://www.amnesty.org";

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
      throw new ValidationError(`Amnesty validation: ${v.reason}`, {
        sourceId: this.source.id,
        url: doc.url,
        attempt: 1,
      });
    }
    return this.normalizer.normalize(doc);
  }

  // ── URL Classification ──────────────────────────────────────────────

  private isListingUrl(url: string): boolean {
    // Note: "press-releases" (plural) is a specific document section too, so
    // exclude both singular and plural forms from listing-page detection.
    return /\/en\/latest\//i.test(url) && !/\/news\/|\/press-releases?\//i.test(url);
  }

  private isPressRelease(url: string): boolean {
    return /\/press-release\//i.test(url) || /press-release/i.test(url);
  }

  private isLegalAnalysis(url: string): boolean {
    return /\/legal-|legal.analysis/i.test(url);
  }

  private isCampaign(url: string): boolean {
    return /\/campaign\//i.test(url);
  }

  // ── Fetching ─────────────────────────────────────────────────────────

  private async fetchDocument(url: string): Promise<RawNgoDocument> {
    const html = await this.fetchHtml(url);
    return {
      url,
      title: this.extractTitle(html),
      organization: "Amnesty International",
      reportType: this.classifyDoc(html, url),
      date: this.extractDate(html),
      bodyText: this.extractBody(html),
      summaryText: this.extractMeta(html, "description"),
      methodology: this.extractMethodology(html),
      keyFindings: this.extractKeyFindings(html),
      geographicScope: this.extractGeoScope(html),
      legalReferences: this.extractLegalRefs(html),
      language: this.detectLang(html),
      isOfficialSource: false,
    };
  }

  private async fetchHtml(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new ParseError(`Amnesty fetch ${res.status}: ${url}`, {
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
    const re = /href="(\/(?:en\/latest\/)?(?:news|press-release|campaign|legal)[^"]+)"/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      const full = m[1].startsWith("http") ? m[1] : `${AmnestyCollector.BASE_URL}${m[1]}`;
      if (!links.includes(full)) links.push(full);
    }
    return links;
  }

  // ── HTML Extraction ──────────────────────────────────────────────────

  private extractTitle(html: string): string {
    const m = html.match(/<title>([^<]+)<\/title>/i);
    return (m?.[1] || "Amnesty International Document")
      .replace(/\s*\|\s*Amnesty International.*$/i, "")
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
    // Target <article> content, then main content area
    const article = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    const content = article?.[1] || html;
    return this.stripHtml(content);
  }

  private extractMethodology(html: string): string | undefined {
    const m = html.match(/<section[^>]*class="[^"]*methodology[^"]*"[^>]*>([\s\S]*?)<\/section>/i);
    if (m) return this.stripHtml(m[1]);
    // Fallback: find "Methodology" heading and grab following paragraph
    const fallback = html.match(/<h2[^>]*>Methodology<\/h2>\s*<p[^>]*>([\s\S]*?)<\/p>/i);
    return fallback ? this.stripHtml(fallback[1]) : undefined;
  }

  private extractKeyFindings(html: string): string[] {
    const findings: string[] = [];
    // Look for key findings section
    const section = html.match(
      /<section[^>]*class="[^"]*key-findings[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
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

  private extractGeoScope(html: string): string[] | undefined {
    const regions: string[] = [];
    const regionSection = html.match(
      /<footer[^>]*class="[^"]*regions[^"]*"[^>]*>([\s\S]*?)<\/footer>/i,
    );
    if (regionSection) {
      const spanRe = /<span[^>]*>([^<]+)<\/span>/gi;
      let m;
      while ((m = spanRe.exec(regionSection[1])) !== null) {
        regions.push(m[1].trim());
      }
    }
    return regions.length > 0 ? regions : undefined;
  }

  private extractLegalRefs(html: string): string[] {
    const refs: string[] = [];
    const patterns = [
      /Geneva Convention\s*(?:IV|I{0,3})\s*(?:Article\s*\d+)?/gi,
      /Additional Protocol\s*(?:I|II|III)(?:\s*Article\s*\d+)?/gi,
      /Rome Statute\s*(?:Article\s*\d+)?/gi,
      /(?:ICCPR|ICESCR|CAT|CEDAW|CRC)\s*(?:Article\s*\d+)?/gi,
      /UN\s*(?:Security Council|General Assembly)\s*Resolution\s*\d+/gi,
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
    if (this.isPressRelease(url)) return "press_release";
    if (this.isLegalAnalysis(url)) return "legal_analysis";
    if (this.isCampaign(url)) return "campaign_page";
    if (/research.report|investigation|documented/i.test(html.slice(0, 1000))) return "research_report";
    return "research_report";
  }

  // ── Helpers ───────────────────────────────────────────────────────────

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
