// src/lib/collectors/ngo/NgoBaseCollector.ts
// Shared base for all NGO collectors (Amnesty, HRW, Btselem, MSF, ICRC).
// Extracts the duplicated HTML-parsing helpers that were byte-for-byte
// identical across the five collectors into a single shared class.

import { BaseCollector } from "../BaseCollector";

/** Shared HTML extraction helpers used by all NGO collectors. */
export abstract class NgoBaseCollector extends BaseCollector {
  // ── Shared extraction helpers ────────────────────────────────────────────

  /** Fetch HTML from a URL using the unified BaseCollector HTTP client. */
  public async fetchHtml(url: string): Promise<string> {
    const res = await this.httpFetch(url);
    return res.text();
  }

  /** Extract title from HTML <title> tag, stripping org suffixes. */
  public extractTitle(html: string, fallback: string): string {
    const match = html.match(/<title>([^<]+)<\/title>/i);
    if (!match) return fallback;
    return match[1]
      .replace(/\s*\|\s*(?:Amnesty International|Human Rights Watch|B['']Tselem|M[eé]decins Sans Fronti[eè]res|MSF|ICRC|International Committee of the Red Cross)\s*$/i, "")
      .trim();
  }

  /** Extract meta tag content by name or property. */
  public extractMeta(html: string, name: string): string | undefined {
    const patterns = [
      new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta[^>]*property=["']${name}["'][^>]*content=["']([^"']+)["']`, "i"),
    ];
    for (const p of patterns) {
      const m = html.match(p);
      if (m) return m[1];
    }
    return undefined;
  }

  /** Extract a date from HTML using common patterns. */
  public extractDate(html: string): string | undefined {
    const timeMatch = html.match(/<time[^>]*datetime=["']([^"']+)["']/i);
    if (timeMatch) return timeMatch[1].split("T")[0];

    const metaMatch = html.match(/<meta[^>]*property=["']article:published_time["'][^>]*content=["']([^"']+)["']/i);
    if (metaMatch) return metaMatch[1].split("T")[0];

    const months = "January|February|March|April|May|June|July|August|September|October|November|December";
    const d = html.match(new RegExp(`(\\d{1,2}\\s+(?:${months})\\s+\\d{4})`, "i"));
    if (d) {
      const parsed = new Date(d[1]);
      if (!isNaN(parsed.getTime())) return parsed.toISOString().split("T")[0];
    }

    return undefined;
  }

  /** Detect language from <html lang="..."> attribute. */
  public detectLang(html: string): string {
    const m = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
    return (m?.[1] ?? "en").split("-")[0];
  }

  /** Strip HTML tags, scripts, styles, and navigation elements from markup. */
  public stripHtml(html: string): string {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /** Extract legal references from text (treaties, resolutions, conventions). */
  public extractLegalRefs(text: string): string[] {
    const refs: string[] = [];
    const patterns = [
      /\b(?:Geneva Conventions?(?:\s+(?:I+V?|IV|III|II|I))\b)?/gi,
      /\b(?:UN\s)?Security Council\s+Resolution\s+\d+/gi,
      /\b(?:UN\s)?General Assembly\s+Resolution\s+\d+/gi,
      /\bRome Statute\b/gi,
      /\bInternational (?:Criminal|Humanitarian|Human Rights)\s+Law\b/gi,
      /\bConvention (?:on|Against)\s+[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/gi,
    ];
    for (const p of patterns) {
      const matches = text.match(p);
      if (matches) refs.push(...matches);
    }
    return [...new Set(refs.map((r) => r.trim()))];
  }

  /** Classify NGO document type from HTML and URL. */
  protected classifyDoc(_html: string, url: string): string {
    if (/\/news\b|\/press-release|\/statement/i.test(url)) return "press_release";
    if (/\/report\b|\/publication/i.test(url)) return "research_report";
    if (/\/testimony\b|\/video|\/multimedia/i.test(url)) return "testimony";
    if (/\/emergency\b|\/crisis|\/field/i.test(url)) return "field_report";
    return "research_report";
  }

  /** Extract document links from listing-page HTML. */
  protected async extractLinks(html: string, baseUrl: string, maxLinks = 8): Promise<string[]> {
    const links: string[] = [];
    const seen = new Set<string>();
    const re = /href=["'](\/(?:en\/)?(?:news|press-releases?|statements?|reports?|publications?|testimon(?:y|ies)|multimedia|videos?|emergenc(?:y|ies)|cris(?:is|es)|field|campaigns?|documents?|research)\/[^"']+)/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      const full = m[1].startsWith("http") ? m[1] : `${baseUrl}${m[1]}`;
      if (!seen.has(full)) {
        seen.add(full);
        links.push(full);
        if (links.length >= maxLinks) break;
      }
    }
    return links;
  }

  // ── URL classifiers (override per collector) ─────────────────────────────

  protected isRssUrl(url: string): boolean {
    return /\.(?:rss|xml|atom)(?:\?|$)/i.test(url) || /\/rss\b/i.test(url) || /\/feed\b/i.test(url);
  }

  protected isDocumentUrl(url: string): boolean {
    return /\/news\b|\/press-release|\/statement|\/report\b|\/publication|\/testimony\b|\/video|\/multimedia|\/emergency\b|\/crisis|\/field|\/campaign|\/document\b|\/research\b/i.test(url) && !this.isListingUrl(url);
  }

  protected isListingUrl(url: string): boolean {
    return /\/news\/?$/i.test(url) || /\/publications?\/?$/i.test(url) || /\/statements?\/?$/i.test(url)
      || /\/press-releases?\/?$/i.test(url) || /\/reports?\/?$/i.test(url);
  }
}
