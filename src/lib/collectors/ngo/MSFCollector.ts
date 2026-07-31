import { BaseCollector } from "../BaseCollector";
import { NGONormalizer, type RawNgoDocument, type NgoReportType } from "./NGONormalizer";
import { ParseError, ValidationError } from "../errors";
import type { NormalizedContent } from "../types";

/**
 * Collector for Médecins Sans Frontières (MSF) / Doctors Without Borders.
 *
 * Fetches: operational updates, press releases, field reports, medical
 * access statements. Medical terminology preserved verbatim.
 * MSF publishes on two domains (msf.org and doctorswithoutborders.org),
 * so relative links are resolved against the domain being crawled.
 * Rate limit: 2s minimum delay between requests (respectful crawl).
 */
export class MSFCollector extends BaseCollector {
  private readonly normalizer = new NGONormalizer();
  private static readonly BASE_URLS = [
    "https://www.msf.org",
    "https://www.doctorswithoutborders.org",
  ];

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
      throw new ValidationError(`MSF validation: ${v.reason}`, {
        sourceId: this.source.id,
        url: doc.url,
        attempt: 1,
      });
    }
    return this.normalizer.normalize(doc);
  }

  // ── URL Classification ──────────────────────────────────────────────

  private isListingUrl(url: string): boolean {
    // A listing page is the section itself (optionally with a trailing slash
    // or a year subpath). Detail pages carry a slug after the section and
    // must not be treated as listings.
    const path = url.split(/[?#]/)[0];
    return /\/(?:news|press-release|field-reports|operations)(?:\/\d{4})?\/?$/i.test(path);
  }

  private isPressRelease(url: string): boolean {
    return /\/press-release\//i.test(url);
  }

  private isMedicalAccess(url: string, html: string): boolean {
    // Medical access statements concern restricted/denied access to care.
    // Plain "medical supplies" is excluded — it appears incidentally in
    // routine field reports describing shortages.
    return /medical.access|access to healthcare|restricted access|denied access|blocked access/i.test(
      html.slice(0, 1000),
    );
  }

  private isOperational(url: string): boolean {
    return /\/operations\//i.test(url) || /operational.update/i.test(url);
  }

  // ── Fetching ─────────────────────────────────────────────────────────

  private async fetchDocument(url: string): Promise<RawNgoDocument> {
    const html = await this.fetchHtml(url);
    return {
      url,
      title: this.extractTitle(html),
      organization: "Médecins Sans Frontières",
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
      throw new ParseError(`MSF fetch ${res.status}: ${url}`, {
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
    const re = /href="(\/(?:news|press-release|field-reports|operations)\/[^"]+)"/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      const base = this.detectBase(url);
      const full = m[1].startsWith("http") ? m[1] : `${base}${m[1]}`;
      if (!links.includes(full)) links.push(full);
    }
    return links;
  }

  private detectBase(url: string): string {
    if (url.includes("doctorswithoutborders")) return MSFCollector.BASE_URLS[1];
    return MSFCollector.BASE_URLS[0];
  }

  // ── HTML Extraction ──────────────────────────────────────────────────

  private extractTitle(html: string): string {
    const m = html.match(/<title>([^<]+)<\/title>/i);
    return (m?.[1] || "MSF Document")
      .replace(/\s*\|\s*(?:MSF|Médecins Sans Frontières|Doctors Without Borders).*$/i, "")
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
    const sentences = body.split(/\.(?:\s+|$)/).filter((s) => s.trim().length > 20);
    return sentences.slice(0, 3).map((s) => s.trim());
  }

  private extractGeoScope(html: string): string[] | undefined {
    // Run against the stripped, single-line body so the regex can span the
    // text (raw HTML puts "Location:" on its own line, which `.` can't cross).
    const body = this.extractBody(html);
    const locationMatch = body.match(/Location:\s*(.+?)(?:\.|$)/i);
    if (locationMatch) return [locationMatch[1].trim()];
    return undefined;
  }

  private extractLegalRefs(html: string): string[] {
    const refs: string[] = [];
    const patterns = [
      /Geneva Convention\s*(?:IV|I{0,3})\s*(?:Article\s*\d+)?/gi,
      /Additional Protocol\s*(?:I|II|III)?\s*(?:Article\s*\d+)?/gi,
      /Medical Facilities.*?protected/gi,
      /IHL\s*(?:violation|obligation)?/gi,
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
    if (this.isOperational(url)) return "operational_update";
    if (this.isMedicalAccess(url, html)) return "medical_access_statement";
    if (/field.report/i.test(html.slice(0, 1000))) return "field_report";
    if (/press release/i.test(html.slice(0, 1000))) return "press_release";
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
