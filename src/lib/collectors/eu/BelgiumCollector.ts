import { BaseCollector } from "../BaseCollector";
import { GovernmentNormalizer } from "./GovernmentNormalizer";
import { ParseError, ValidationError } from "../errors";
import type { NormalizedContent } from "../types";
import type { RawGovernmentDocument, GovernmentDocumentType } from "./GovernmentNormalizer";

/**
 * Collector for Belgium government sources.
 *
 * Fetches:
 * - FPS Foreign Affairs press releases and statements
 * - Chamber of Representatives records (questions, debates, votes)
 * - Senate records
 * - Regional government positions (Flanders, Wallonia, Brussels-Capital)
 *
 * Multi-language: NL/FR/EN. Labels documents with correct government level.
 */
export class BelgiumCollector extends BaseCollector {
  private readonly normalizer = new GovernmentNormalizer();
  private static readonly FPS = "https://diplomatie.belgium.be";
  private static readonly CHAMBER = "https://www.lachambre.be";
  private static readonly SENATE = "https://www.senate.be";

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
    if (!v.valid) throw new ValidationError(`Belgium validation: ${v.reason}`, { sourceId: this.source.id, url: doc.url, attempt: 1 });
    return this.normalizer.normalize(doc);
  }

  private isDocumentUrl(url: string): boolean {
    return /\/news\//i.test(url) || /\/press\//i.test(url) || /\/documents?\//i.test(url) || /\/questions?\//i.test(url) || /\/plenary\//i.test(url);
  }

  private isListingUrl(url: string): boolean {
    return /\/news(\/|$)/i.test(url) || /\/press(\/|$)/i.test(url);
  }

  private async fetchDocument(url: string): Promise<RawGovernmentDocument> {
    const html = await this.fetchHtml(url);
    const govLevel = this.detectGovernmentLevel(url, html);
    return {
      url,
      title: this.extractTitle(html),
      institution: this.detectInstitution(url, html),
      legalBasis: this.extractLegalBasis(html),
      governmentLevel: govLevel,
      documentType: this.classifyDoc(html, url),
      date: this.extractDate(html),
      bodyText: this.stripHtml(html),
      summaryText: this.extractMeta(html, "description"),
      language: this.detectLang(html),
      isAdopted: !/proposal|voorstel|proposition/i.test(html),
    };
  }

  private async fetchHtml(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new ParseError(`Belgium fetch ${res.status}: ${url}`, { sourceId: this.source.id, url, attempt: 1 });
    return res.text();
  }

  private async extractLinks(url: string): Promise<string[]> {
    const html = await this.fetchHtml(url);
    const links: string[] = [];
    const re = /href="(\/(?:nl|fr|en|de)\/[^"]*(?:news|press|question|document|plenary)[^"]*)"/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      const base = this.detectBase(url);
      const full = m[1].startsWith("http") ? m[1] : `${base}${m[1]}`;
      if (!links.includes(full)) links.push(full);
    }
    return links;
  }

  private detectBase(url: string): string {
    if (url.includes("lachambre")) return BelgiumCollector.CHAMBER;
    if (url.includes("senate")) return BelgiumCollector.SENATE;
    return BelgiumCollector.FPS;
  }

  // ── Extraction ──────────────────────────────────────────────────────

  private extractTitle(html: string): string {
    const m = html.match(/<title>([^<]+)<\/title>/i);
    return (m?.[1] || "Belgium Government Document").replace(/\s*\|\s*(?:FPS|FOD|Chamber|Senate|Belgium\.be).*$/i, "").trim();
  }

  private extractMeta(html: string, name: string): string | undefined {
    return html.match(new RegExp(`<meta[^>]*name="${name}"[^>]*content="([^"]+)"`, "i"))?.[1];
  }

  private extractDate(html: string): string | undefined {
    const m = html.match(/<time[^>]*datetime="([^"]+)"/i) || html.match(/<meta[^>]*property="article:published_time"[^>]*content="([^"]+)"/i);
    if (m) return m[1];
    // Belgian date: "31 juli 2026" or "31 juillet 2026"
    const d = html.match(/(\d{1,2})\s+(?:januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december|janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre)\s+(\d{4})/i);
    if (d) {
      const nlMonths = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
      const frMonths = ["janvier","février","fevrier","mars","avril","mai","juin","juillet","août","aout","septembre","octobre","novembre","décembre","decembre"];
      const all = [...nlMonths, ...frMonths];
      const idx = all.findIndex(m => m.toLowerCase() === d[2].toLowerCase());
      const monthIdx = idx >= nlMonths.length ? idx - nlMonths.length : idx;
      const month = monthIdx >= 0 ? monthIdx : 0;
      return `${d[3]}-${String(month + 1).padStart(2, "0")}-${String(parseInt(d[1])).padStart(2, "0")}`;
    }
    return undefined;
  }

  private detectLang(html: string): string {
    const m = html.match(/<html[^>]*lang="([^"]+)"/i);
    if (m) {
      const lang = m[1].split("-")[0];
      if (lang === "nl") return "nl";
      if (lang === "fr") return "fr";
    }
    // Guess from content
    if (/het|deze|wordt|worden|zijn|niet|voor|van/i.test(html)) return "nl";
    if (/le|la|les|des|est|sont|pas|pour|dans/i.test(html)) return "fr";
    return "nl"; // default Dutch for FPS
  }

  private stripHtml(html: string): string {
    return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "").replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "").replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  private detectInstitution(url: string, html: string): string {
    if (url.includes("lachambre") || /Chamber of Representatives|Kamer van|Chambre des/i.test(html)) return "Chamber of Representatives";
    if (url.includes("senate") || /Senate|Senaat|Sénat/i.test(html)) return "Senate";
    if (/Flemish|Vlaams|Flanders/i.test(html)) return "Flemish Government";
    if (/Walloon|Wallon|Wallonia/i.test(html)) return "Walloon Government";
    if (/Brussels.Capital|Brussels Hoofdstedelijk/i.test(html)) return "Brussels-Capital Region";
    if (/Foreign Affairs|Buitenlandse Zaken|Affaires [eÉ]trangères/i.test(html)) return "FPS Foreign Affairs";
    return "Federal Government of Belgium";
  }

  private detectGovernmentLevel(url: string, html: string): RawGovernmentDocument["governmentLevel"] {
    if (/Flemish|Vlaams|Flanders|Vlaanderen/i.test(html + url)) return "regional";
    if (/Walloon|Wallon|Wallonia|Wallonie/i.test(html + url)) return "regional";
    if (/Brussels.Capital|Brussels Hoofdstedelijk/i.test(html + url)) return "regional";
    if (/Community|Gemeenschap|Communauté|German.sprechende/i.test(html + url)) return "community";
    return "federal";
  }

  private classifyDoc(_html: string, url: string): GovernmentDocumentType {
    const c = url.toLowerCase();
    if (/question/i.test(c)) return "parliamentary_question";
    if (/plenary|record|report/i.test(c)) return "parliamentary_record";
    if (/decision|besluit|d[eé]cision/i.test(c)) return "government_decision";
    if (/region|gewest|r[eé]gion/i.test(c)) return "regional_position";
    if (/press|news/i.test(c)) return "press_release";
    return "press_release";
  }

  private extractLegalBasis(html: string): string[] {
    const basis: string[] = [];
    const patterns = [/Article \d+[^,.<]+/gi, /(?:wet|loi|decreet|ordonnantie)\s+\d+/gi, /(?:Koninklijk Besluit|Arrêté Royal|KB)\s+\d+/gi];
    for (const p of patterns) {
      let m;
      while ((m = p.exec(html)) !== null) basis.push(m[0].trim());
    }
    return [...new Set(basis)].slice(0, 15);
  }
}
