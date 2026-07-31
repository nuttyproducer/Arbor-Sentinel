import { BaseCollector } from "../BaseCollector";
import { GovernmentNormalizer } from "./GovernmentNormalizer";
import { ParseError, ValidationError } from "../errors";
import type { NormalizedContent } from "../types";
import type { RawGovernmentDocument, GovernmentDocumentType } from "./GovernmentNormalizer";

/**
 * Collector for EU institutions (Council, Commission, Parliament, EEAS, EUR-Lex).
 *
 * Fetches:
 * - Council conclusions and decisions
 * - Commission statements and communications
 * - Parliament resolutions
 * - EEAS press releases and statements
 * - EUR-Lex legal documents (Association Agreement, Common Position tracking)
 *
 * Multi-language: EN/FR/DE. Distinguishes institution types.
 */
export class EUCollector extends BaseCollector {
  private readonly normalizer = new GovernmentNormalizer();
  private static readonly CONSILIUM = "https://www.consilium.europa.eu";
  private static readonly PARLIAMENT = "https://www.europarl.europa.eu";
  private static readonly COMMISSION = "https://ec.europa.eu";
  private static readonly EEAS = "https://www.eeas.europa.eu";
  private static readonly EURLEX = "https://eur-lex.europa.eu";

  async fetch(): Promise<unknown[]> {
    const url = this.source.url;

    if (this.isDocumentUrl(url)) {
      const doc = await this.fetchDocument(url);
      return [doc];
    }

    if (this.isListingUrl(url)) {
      const links = await this.extractLinks(url);
      const docs: RawGovernmentDocument[] = [];
      for (const link of links.slice(0, 8)) {
        try { docs.push(await this.fetchDocument(link)); } catch { /* skip */ }
      }
      return docs;
    }

    const doc = await this.fetchDocument(url);
    return [doc];
  }

  async normalize(raw: unknown): Promise<NormalizedContent> {
    const doc = raw as RawGovernmentDocument;
    const v = this.normalizer.validate(doc);
    if (!v.valid) throw new ValidationError(`EU validation: ${v.reason}`, { sourceId: this.source.id, url: doc.url, attempt: 1 });
    return this.normalizer.normalize(doc);
  }

  private isDocumentUrl(url: string): boolean {
    return /\/press\//i.test(url) || /\/news\//i.test(url) || /\/legal-content\//i.test(url) || /\/doceo\//i.test(url) || /\/(?:statement|resolution|conclusion|decision)s?\//i.test(url);
  }

  private isListingUrl(url: string): boolean {
    return /\/press(\/|$)/i.test(url) || /\/news(\/|$)/i.test(url) || /\/documents?\//i.test(url);
  }

  private async fetchDocument(url: string): Promise<RawGovernmentDocument> {
    const html = await this.fetchHtml(url);
    const institution = this.detectInstitution(url, html);
    return {
      url,
      title: this.extractTitle(html),
      institution,
      legalBasis: this.extractLegalBasis(html),
      documentReference: this.extractReference(html, url),
      voteTally: this.extractVoteTally(html),
      governmentLevel: "eu",
      documentType: this.classifyDoc(html, url),
      date: this.extractDate(html),
      bodyText: this.stripHtml(html),
      summaryText: this.extractMeta(html, "description"),
      language: this.detectLang(html),
      isAdopted: this.isAdoptedDoc(html),
    };
  }

  private async fetchHtml(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new ParseError(`EU fetch ${res.status}: ${url}`, { sourceId: this.source.id, url, attempt: 1 });
    return res.text();
  }

  private async extractLinks(url: string): Promise<string[]> {
    const html = await this.fetchHtml(url);
    const links: string[] = [];
    const re = /href="(\/(?:press|news|documents|legal-content|doceo)\/[^"]+)"/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      const full = m[1].startsWith("http") ? m[1] : `${this.detectBase(url)}${m[1]}`;
      if (!links.includes(full)) links.push(full);
    }
    return links;
  }

  private detectBase(url: string): string {
    if (url.includes("consilium")) return EUCollector.CONSILIUM;
    if (url.includes("europarl")) return EUCollector.PARLIAMENT;
    if (url.includes("ec.europa")) return EUCollector.COMMISSION;
    if (url.includes("eeas")) return EUCollector.EEAS;
    if (url.includes("eur-lex")) return EUCollector.EURLEX;
    return EUCollector.COMMISSION;
  }

  // ── Extraction ──────────────────────────────────────────────────────

  private extractTitle(html: string): string {
    const m = html.match(/<title>([^<]+)<\/title>/i);
    return (m?.[1] || "EU Document").replace(/\s*\|\s*(?:Council|Commission|Parliament|EEAS|EUR-Lex).*$/i, "").trim();
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

  private detectInstitution(url: string, html: string): string {
    if (url.includes("consilium") || /Council of the European Union/i.test(html)) return "Council of the European Union";
    if (url.includes("europarl") || /European Parliament/i.test(html)) return "European Parliament";
    if (url.includes("ec.europa") || /European Commission/i.test(html)) return "European Commission";
    if (url.includes("eeas") || /External Action/i.test(html)) return "European External Action Service";
    if (url.includes("eur-lex")) return "EUR-Lex";
    return "European Union";
  }

  private classifyDoc(html: string, url: string): GovernmentDocumentType {
    const c = `${html} ${url}`.toLowerCase();
    if (/council conclusion|conclusions of the council/i.test(c)) return "council_conclusion";
    if (/commission.*statement|statement.*commission/i.test(c)) return "commission_statement";
    if (/parliament.*resolution|european parliament resolution|resolution.*adopted/i.test(c)) return "parliament_resolution";
    if (/eeas|external action/i.test(c)) return "eeas_press_release";
    if (/eur-lex|oj l |official journal/i.test(c)) return "eurlex_document";
    if (/press release/i.test(c)) return "press_release";
    return "eeas_press_release";
  }

  private extractLegalBasis(html: string): string[] {
    const basis: string[] = [];
    const patterns = [/Article \d+[^,.<]+/gi, /Regulation\s*\(EU\)\s*\d+\/\d+/gi, /Directive\s*\d+\/\d+/gi, /Decision\s*\d+\/\d+/gi];
    for (const p of patterns) {
      let m;
      while ((m = p.exec(html)) !== null) basis.push(m[0].trim());
    }
    return [...new Set(basis)].slice(0, 20);
  }

  private extractReference(html: string, url: string): string | undefined {
    const m = html.match(/\b((?:COM|JOIN|SWD|C|OJ)\s*[/(]\d{4}[)/]\s*\d+)\b/i);
    if (m) return m[1];
    // EUR-Lex CELEX number
    const celex = url.match(/(\d{4}[A-Z]\d{4})/);
    return celex?.[1];
  }

  private extractVoteTally(html: string): RawGovernmentDocument["voteTally"] | undefined {
    const m = html.match(/(\d{3})\s*(?:votes?\s*)?(?:in favour|for)[,\s]*(\d{1,3})\s*(?:votes?\s*)?against[,\s]*(?:and\s*)?(\d{1,3})\s*(?:abstention|abstained)/i);
    if (m) return { for: parseInt(m[1]), against: parseInt(m[2]), abstain: parseInt(m[3]) };
    return undefined;
  }

  private isAdoptedDoc(html: string): boolean {
    return !/proposal|proposed|not yet adopted|pending/i.test(html);
  }
}
