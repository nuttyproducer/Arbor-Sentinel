import { BaseCollector } from "../BaseCollector";
import { UNNormalizer } from "./UNNormalizer";
import { ParseError, ValidationError } from "../errors";
import type { NormalizedContent } from "../types";
import type { RawUNDocument, UNDocumentType } from "./UNNormalizer";

/**
 * Collector for UN Human Rights Office (ohchr.org).
 *
 * Fetches:
 * - Commission of Inquiry (COI) reports
 * - Human Rights Council (HRC) resolutions
 * - High Commissioner statements and press releases
 * - Country-specific human rights pages
 */
export class OHCHRCollector extends BaseCollector {
  private readonly normalizer = new UNNormalizer();
  private static readonly BASE = "https://www.ohchr.org";

  async fetch(): Promise<unknown[]> {
    const url = this.source.url;

    if (this.isDocumentUrl(url)) {
      const doc = await this.fetchDocument(url);
      return [doc];
    }

    if (this.isListingUrl(url)) {
      const links = await this.extractLinks(url);
      const docs: RawUNDocument[] = [];
      for (const link of links.slice(0, 8)) {
        try {
          docs.push(await this.fetchDocument(link));
        } catch { /* skip individual failures */ }
      }
      return docs;
    }

    const doc = await this.fetchDocument(url);
    return [doc];
  }

  async normalize(raw: unknown): Promise<NormalizedContent> {
    const doc = raw as RawUNDocument;
    const v = this.normalizer.validate(doc);
    if (!v.valid) throw new ValidationError(`OHCHR validation: ${v.reason}`, { sourceId: this.source.id, url: doc.url, attempt: 1 });
    return this.normalizer.normalize(doc);
  }

  // ── Private ──────────────────────────────────────────────────────────

  private isDocumentUrl(url: string): boolean {
    return /\/documents\//i.test(url) || /\/news\//i.test(url) || /\/statements\//i.test(url) || /\/(?:en|fr|es|ar|zh|ru)\//i.test(url) && /\d{4}/.test(url);
  }

  private isListingUrl(url: string): boolean {
    return /\/documents(\/|$)/i.test(url) || /\/news(\/|$)/i.test(url) || /\/countries\//i.test(url) || url === OHCHRCollector.BASE;
  }

  private async fetchDocument(url: string): Promise<RawUNDocument> {
    const html = await this.fetchHtml(url);
    return {
      url,
      title: this.extract(html, /<title>([^<]+)<\/title>/i, "OHCHR Document"),
      issuingBody: this.detectIssuingBody(html, url),
      reportType: this.classifyDoc(html, url),
      geographicScope: this.extractGeographicScope(html),
      date: this.extractDate(html),
      bodyText: this.stripHtml(html),
      summaryText: this.extractMeta(html, "description"),
      language: this.detectLang(html),
    };
  }

  private async fetchHtml(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new ParseError(`OHCHR fetch ${res.status}: ${url}`, { sourceId: this.source.id, url, attempt: 1 });
    }
    return res.text();
  }

  private async extractLinks(url: string): Promise<string[]> {
    const html = await this.fetchHtml(url);
    const links: string[] = [];
    const re = /href="(\/(?:en|fr|es|ar|zh|ru)\/[^"]*\b(?:document|statement|report|news|resolution)\b[^"]*)"/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      const full = m[1].startsWith("http") ? m[1] : `${OHCHRCollector.BASE}${m[1]}`;
      if (!links.includes(full)) links.push(full);
    }
    return links;
  }

  // ── Helpers ─────────────────────────────────────────────────────────

  private extract(html: string, re: RegExp, fallback: string): string {
    return (html.match(re)?.[1] || fallback).replace(/\s*\|\s*OHCHR\s*$/i, "").trim();
  }

  private extractMeta(html: string, name: string): string | undefined {
    const m = html.match(new RegExp(`<meta[^>]*name="${name}"[^>]*content="([^"]+)"`, "i"));
    return m?.[1];
  }

  private extractDate(html: string): string | undefined {
    const m = html.match(/<time[^>]*datetime="([^"]+)"/i) || html.match(/<meta[^>]*property="article:published_time"[^>]*content="([^"]+)"/i);
    if (m) return m[1];
    const d = html.match(/(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/i);
    if (d) { const p = new Date(d[1]); if (!isNaN(p.getTime())) return p.toISOString().split("T")[0]; }
    return undefined;
  }

  private detectLang(html: string): string {
    const m = html.match(/<html[^>]*lang="([^"]+)"/i);
    return m ? m[1].split("-")[0] : "en";
  }

  private stripHtml(html: string): string {
    return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "").replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "").replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  private detectIssuingBody(html: string, _url: string): string {
    if (/Human Rights Council/i.test(html)) return "Human Rights Council";
    if (/Commission of Inquiry/i.test(html)) return "Commission of Inquiry";
    if (/High Commissioner/i.test(html)) return "Office of the High Commissioner for Human Rights";
    if (/Special Rapporteur/i.test(html)) return "Special Rapporteur";
    if (/Committee on/i.test(html)) return html.match(/Committee on [^<,.]+/i)?.[0] || "OHCHR";
    return "OHCHR";
  }

  private classifyDoc(html: string, url: string): UNDocumentType {
    const c = `${html} ${url}`.toLowerCase();
    if (/commission of inquiry|coi/i.test(c)) return "coi_report";
    if (/human rights council.*resolution|resolution.*adopted|hrc\d/i.test(c)) return "hrc_resolution";
    if (/high commissioner.*statement|statement.*high commissioner/i.test(c)) return "hc_statement";
    if (/country|situation in/i.test(c)) return "country_page";
    if (/press release|news/i.test(c)) return "press_release";
    return "country_page";
  }

  private extractGeographicScope(html: string): string[] {
    const regions: string[] = [];
    const patterns = [/Gaza/i, /Palestine/i, /Ukraine/i, /Myanmar/i, /Sudan/i, /Yemen/i, /Syria/i, /Afghanistan/i, /Haiti/i, /Democratic Republic of the Congo/i];
    for (const p of patterns) {
      if (p.test(html)) {
        const m = html.match(p);
        if (m) regions.push(m[0]);
      }
    }
    return [...new Set(regions)];
  }
}
