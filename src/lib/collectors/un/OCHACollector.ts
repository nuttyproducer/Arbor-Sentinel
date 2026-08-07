import { BaseCollector } from "../BaseCollector";
import { FeedParser, type ParsedFeedItem } from "../feeds/FeedParser";
import { UNNormalizer } from "./UNNormalizer";
import { ParseError, ValidationError } from "../errors";
import type { RawUNDocument, UNDocumentType, NormalizedUNDocument } from "./UNNormalizer";

/**
 * Collector for UN Office for the Coordination of Humanitarian Affairs (ochaopt.org, unocha.org).
 *
 * Fetches:
 * - Situation reports (sitreps)
 * - Flash appeals and humanitarian needs overviews
 * - Humanitarian updates and funding tracking data
 * - RSS feed support for OCHA updates
 */
export class OCHACollector extends BaseCollector {
  private readonly normalizer = new UNNormalizer();
  private readonly feedParser = new FeedParser();
  private static readonly BASE = "https://www.ochaopt.org";
  private static readonly UNOCHA = "https://www.unocha.org";

  async fetch(): Promise<unknown[]> {
    const url = this.source.url;

    // RSS feed support
    if (this.isRssUrl(url)) {
      return this.fetchRss(url);
    }

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

  async normalize(raw: unknown): Promise<NormalizedUNDocument> {
    const doc = raw as RawUNDocument;
    const v = this.normalizer.validate(doc);
    if (!v.valid) throw new ValidationError(`OCHA validation: ${v.reason}`, { sourceId: this.source.id, url: doc.url, attempt: 1 });
    return this.normalizer.normalize(doc);
  }

  // ── Private ──────────────────────────────────────────────────────────

  private isRssUrl(url: string): boolean {
    return /\.(?:rss|xml|atom)(?:\?|$)/i.test(url) || /\/rss\b/i.test(url) || /\/feed\b/i.test(url);
  }

  private isDocumentUrl(url: string): boolean {
    return /\/content\//i.test(url) || /\/publications?\//i.test(url) || /\/reports?\//i.test(url) || /\/updates?\//i.test(url) || /\d{4}\/\d{2}\//.test(url);
  }

  private isListingUrl(url: string): boolean {
    return /\/news(\/|$)/i.test(url) || /\/publications?(\/|$)/i.test(url) || url === OCHACollector.BASE || url === OCHACollector.UNOCHA;
  }

  private async fetchRss(url: string): Promise<RawUNDocument[]> {
    const text = await this.fetchHtml(url);
    const parsed = this.feedParser.parse(text);
    return parsed.items.map((item: ParsedFeedItem) => ({
      url: item.url,
      title: item.title || "OCHA Update",
      issuingBody: "OCHA",
      reportType: "humanitarian_update" as UNDocumentType,
      geographicScope: this.extractGeographicScope(item.title + " " + item.description),
      date: item.publishedAt?.split("T")[0],
      bodyText: item.description,
      summaryText: item.description.slice(0, 500),
      language: "en",
    }));
  }

  private async fetchDocument(url: string): Promise<RawUNDocument> {
    const html = await this.fetchHtml(url);
    return {
      url,
      title: this.extract(html, /<title>([^<]+)<\/title>/i, "OCHA Document"),
      issuingBody: "OCHA",
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
      throw new ParseError(`OCHA fetch ${res.status}: ${url}`, { sourceId: this.source.id, url, attempt: 1 });
    }
    return res.text();
  }

  private async extractLinks(url: string): Promise<string[]> {
    const html = await this.fetchHtml(url);
    const links: string[] = [];
    const re = /href="(\/(?:content|publications?|reports?|updates?)\/[^"]+)/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      const full = m[1].startsWith("http") ? m[1] : `${OCHACollector.BASE}${m[1]}`;
      if (!links.includes(full)) links.push(full);
    }
    return links;
  }

  private extract(html: string, re: RegExp, fallback: string): string {
    return (html.match(re)?.[1] || fallback).replace(/\s*\|\s*(?:United Nations OCHA|OCHA)\s*$/i, "").trim();
  }

  private extractMeta(html: string, name: string): string | undefined {
    return html.match(new RegExp(`<meta[^>]*name="${name}"[^>]*content="([^"]+)"`, "i"))?.[1];
  }

  private extractDate(html: string): string | undefined {
    const m = html.match(/<time[^>]*datetime="([^"]+)"/i) || html.match(/<meta[^>]*property="article:published_time"[^>]*content="([^"]+)"/i);
    if (m) return m[1];
    const d = html.match(/(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/i);
    if (d) { const p = new Date(d[1]); if (!isNaN(p.getTime())) return p.toISOString().split("T")[0]; }
    return undefined;
  }

  private detectLang(html: string): string { return (html.match(/<html[^>]*lang="([^"]+)"/i)?.[1] || "en").split("-")[0]; }

  private stripHtml(html: string): string {
    return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "").replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "").replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  private classifyDoc(html: string, _url: string): UNDocumentType {
    const c = html.toLowerCase();
    if (/flash appeal|flash update/i.test(c)) return "flash_appeal";
    if (/situation report|sitrep/i.test(c)) return "situation_report";
    if (/humanitarian needs overview|hno/i.test(c) || /humanitarian update/i.test(c)) return "humanitarian_update";
    if (/funding|financial tracking|further requirements/i.test(c)) return "funding_update";
    if (/press release|news/i.test(c)) return "press_release";
    return "situation_report";
  }

  private extractGeographicScope(text: string): string[] {
    const regions: string[] = [];
    for (const p of [/Gaza/i, /West Bank/i, /Palestine/i, /Ukraine/i, /Sudan/i, /Yemen/i, /Syria/i, /Lebanon/i, /Myanmar/i, /Afghanistan/i]) {
      if (p.test(text)) regions.push(text.match(p)![0]);
    }
    return [...new Set(regions)];
  }
}
