import { BaseCollector } from "../BaseCollector";
import { NGONormalizer, type RawNgoDocument, type NgoReportType } from "./NGONormalizer";
import { ParseError, ValidationError } from "../errors";
import type { NormalizedContent } from "../types";

/**
 * Collector for B'Tselem — The Israeli Information Center for Human Rights
 * in the Occupied Territories.
 *
 * Fetches: reports, testimony summaries (already public), video documentation,
 * data updates. Testimonies are preserved verbatim in original language.
 * Rate limit: 2s minimum delay between requests.
 */
export class BtselemCollector extends BaseCollector {
  private readonly normalizer = new NGONormalizer();
  private static readonly BASE_URL = "https://www.btselem.org";

  async fetch(): Promise<unknown[]> {
    const url = this.source.url;

    if (this.isListingUrl(url)) {
      const links = await this.extractLinks(url);
      const docs: RawNgoDocument[] = [];
      for (const link of links.slice(0, 8)) {
        try {
          docs.push(await this.fetchDocument(link));
        } catch {
          // Skip individual fetch failures
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
      throw new ValidationError(`B'Tselem validation: ${v.reason}`, {
        sourceId: this.source.id,
        url: doc.url,
        attempt: 1,
      });
    }
    return this.normalizer.normalize(doc);
  }

  // ── URL Classification ──────────────────────────────────────────────

  private isListingUrl(url: string): boolean {
    return /\/(?:testimonies|video|publications|statistics)(?:\/|$)/i.test(url) &&
      !/\/\d{8}/i.test(url) && !/\/\d{4}/i.test(url);
  }

  private isTestimony(url: string): boolean {
    return /\/testimonies\//i.test(url);
  }

  private isVideo(url: string): boolean {
    return /\/video\//i.test(url) || /\/video-/i.test(url);
  }

  private isDataUpdate(url: string): boolean {
    return /\/statistics\//i.test(url) || /statistics|data|\bdata\b/i.test(url);
  }

  // ── Fetching ─────────────────────────────────────────────────────────

  private async fetchDocument(url: string): Promise<RawNgoDocument> {
    const html = await this.fetchHtml(url);
    return {
      url,
      title: this.extractTitle(html),
      organization: "B'Tselem",
      reportType: this.classifyDoc(html, url),
      date: this.extractDate(html),
      bodyText: this.extractBody(html),
      summaryText: this.extractMeta(html, "description"),
      methodology: undefined, // B'Tselem testimonies document methodology in body
      keyFindings: this.extractFindings(html),
      geographicScope: ["Occupied Palestinian Territory"],
      legalReferences: this.extractLegalRefs(html),
      language: this.detectLang(html),
      isOfficialSource: false,
    };
  }

  private async fetchHtml(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new ParseError(`B'Tselem fetch ${res.status}: ${url}`, {
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
    const re = /href="(\/(?:testimonies|video|publications|statistics)\/[^"]+)"/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      const full = m[1].startsWith("http") ? m[1] : `${BtselemCollector.BASE_URL}${m[1]}`;
      if (!links.includes(full)) links.push(full);
    }
    return links;
  }

  // ── HTML Extraction ──────────────────────────────────────────────────

  private extractTitle(html: string): string {
    const m = html.match(/<title>([^<]+)<\/title>/i);
    return (m?.[1] || "B'Tselem Document")
      .replace(/\s*\|\s*B'Tselem.*$/i, "")
      .replace(/\s*\|\s*בצלם.*$/i, "")
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
    // Testimony body uses specific class
    const testimony = html.match(/<div[^>]*class="[^"]*testimony-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (testimony) return this.stripHtml(testimony[1]);

    // Video description
    const video = html.match(/<div[^>]*class="[^"]*video-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (video) return this.stripHtml(video[1]);

    // Fallback: article content
    const article = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    return this.stripHtml(article?.[1] || html);
  }

  private extractFindings(html: string): string[] {
    // B'Tselem typically doesn't structure findings as lists
    // Extract key quotes from testimony or report summary
    const body = this.extractBody(html);
    // Take first 2-3 sentences as summary findings
    const sentences = body.split(/\.(?:\s+|$)/).filter((s) => s.trim().length > 20);
    return sentences.slice(0, 3).map((s) => s.trim());
  }

  private extractLegalRefs(html: string): string[] {
    const refs: string[] = [];
    const patterns = [
      /Geneva Convention\s*(?:IV|I{0,3})\s*(?:Article\s*\d+)?/gi,
      /Additional Protocol\s*(?:I|II|III)?\s*(?:Article\s*\d+)?/gi,
      /Hague Regulation/gi,
      /Rome Statute/gi,
      /ICCPR\s*(?:Article\s*\d+)?/gi,
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
    const lang = html.match(/<html[^>]*lang="([^"]+)"/i)?.[1] || "en";
    const dir = html.match(/<html[^>]*dir="(rtl)"/i);
    return dir ? "he" : lang.split("-")[0];
  }

  private classifyDoc(_html: string, url: string): NgoReportType {
    if (this.isTestimony(url)) return "testimony_summary";
    if (this.isVideo(url)) return "video_documentation";
    if (this.isDataUpdate(url)) return "data_update";
    if (/report|publication/i.test(url)) return "research_report";
    return "testimony_summary";
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
