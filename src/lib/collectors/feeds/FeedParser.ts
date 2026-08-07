import { ParseError } from "../errors";

/** A parsed enclosure / media attachment. */
export interface ParsedEnclosure {
  url: string;
  type?: string;
  length?: number;
}

/** A parsed item from an RSS 2.0, Atom 1.0, or RDF/RSS 1.0 feed. */
export interface ParsedFeedItem {
  title: string;
  url: string;
  description: string;
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
  categories: string[];
  contentHtml?: string;
  guid?: string;
  feedTitle: string;
  language?: string;
  enclosures: ParsedEnclosure[];
}

/** Metadata about the feed itself (channel or feed element). */
export interface FeedMeta {
  title: string;
  description: string;
  link: string;
  language?: string;
  lastBuildDate?: string;
  itemCount: number;
}

type FeedFormat = "rss2" | "atom1" | "rdf1" | "unknown";

/**
 * Parses RSS 2.0 and Atom 1.0 feeds. Auto-detects format.
 *
 * Pure parsing layer — no network calls, no side effects.
 * HTML in titles and descriptions is stripped to plain text.
 * CDATA sections are unwrapped transparently.
 */
export class FeedParser {
  /**
   * Parse raw XML into structured feed data.
   * Auto-detects RSS 2.0 vs Atom 1.0.
   *
   * @throws {ParseError} if the XML is malformed.
   */
  parse(rawXml: string): { meta: FeedMeta; items: ParsedFeedItem[] } {
    if (!this.isWellFormed(rawXml)) {
      throw new ParseError("Malformed XML — cannot parse feed", {
        sourceId: "feed-parser",
        attempt: 1,
      });
    }

    const format = this.detectFormat(rawXml);

    if (format === "rss2") {
      return this.parseRss2(rawXml);
    }

    if (format === "atom1") {
      return this.parseAtom(rawXml);
    }

    if (format === "rdf1") {
      return this.parseRdf(rawXml);
    }

    throw new ParseError("Unrecognized feed format — expected RSS 2.0, Atom 1.0, or RDF", {
      sourceId: "feed-parser",
      attempt: 1,
    });
  }

  /**
   * Detect feed format from XML content.
   */
  detectFormat(rawXml: string): FeedFormat {
    if (/<rss\b[^>]*version\s*=\s*["'][^"']*2\.0/i.test(rawXml)) {
      return "rss2";
    }
    if (/<feed\b[^>]*xmlns\s*=\s*["']http:\/\/www\.w3\.org\/2005\/Atom["']/i.test(rawXml)) {
      return "atom1";
    }
    // RDF/RSS 1.0 detection
    if (/<rdf:RDF\b/i.test(rawXml)) {
      return "rdf1";
    }

    // Loose detection
    if (/<rss\b/i.test(rawXml)) {
      return "rss2";
    }
    if (/<feed\b/i.test(rawXml)) {
      return "atom1";
    }
    return "unknown";
  }

  /**
   * Basic XML well-formedness check: every opened tag must be closed.
   * CDATA and comment contents are ignored, since they may legitimately
   * contain unescaped "<" characters.
   */
  private isWellFormed(xml: string): boolean {
    const sanitized = xml
      .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "")
      .replace(/<!--[\s\S]*?-->/g, "");

    const stack: string[] = [];
    const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9:]*)\b[^>]*\/?>/g;
    let match;
    while ((match = tagPattern.exec(sanitized)) !== null) {
      const full = match[0];
      const tag = match[1];
      if (full.startsWith("</")) {
        const top = stack.pop();
        if (top !== tag) return false;
      } else if (!full.endsWith("/>")) {
        stack.push(tag);
      }
    }
    return stack.length === 0;
  }

  // ── RSS 2.0 ──────────────────────────────────────────────────────────

  private parseRss2(rawXml: string): { meta: FeedMeta; items: ParsedFeedItem[] } {
    const channel = this.extractElement(rawXml, "channel");
    if (!channel) {
      throw new ParseError("RSS feed missing <channel> element", {
        sourceId: "feed-parser",
        attempt: 1,
      });
    }

    const feedTitle = this.extractText(channel, "title");
    const itemSegments = this.extractElements(channel, "item");

    const meta: FeedMeta = {
      title: feedTitle,
      description: this.extractText(channel, "description"),
      link: this.extractText(channel, "link"),
      language: this.extractText(channel, "language") || undefined,
      lastBuildDate: this.extractText(channel, "lastBuildDate") || undefined,
      itemCount: itemSegments.length,
    };

    const items: ParsedFeedItem[] = itemSegments.map((itemXml) => {
      const authorRaw = this.extractText(itemXml, "author") || this.extractTextNS(itemXml, "dc:creator");
      // Strip email portion from RSS author (e.g. "email@example.com (Name)" → "Name")
      const author = authorRaw ? authorRaw.replace(/^[^@]+@[^\s]+\s*\(?/, "").replace(/\)$/, "").trim() : undefined;

      const pubDate = this.extractText(itemXml, "pubDate");
      const guidEl = this.extractElement(itemXml, "guid");
      const guid = guidEl ? this.extractTextFromContent(guidEl) : undefined;

      // Extract enclosures + media attachments
      const enclosures = this.extractRssEnclosures(itemXml);

      // Full-text content (WordPress content:encoded extension)
      const contentEncoded = this.extractTextNS(itemXml, "content:encoded");

      return {
        title: this.extractTextCdata(itemXml, "title"),
        url: this.extractText(itemXml, "link") || (guidEl && /isPermaLink\s*=\s*["']true["']/i.test(guidEl) ? guid : "") || "",
        description: this.stripHtml(this.extractTextCdata(itemXml, "description")).slice(0, 280),
        publishedAt: pubDate ? this.rfc2822ToIso(pubDate) : undefined,
        author: author || undefined,
        categories: this.extractAllText(itemXml, "category"),
        contentHtml: contentEncoded || undefined,
        guid,
        feedTitle,
        enclosures,
      };
    });

    return { meta, items };
  }

  // ── Atom 1.0 ──────────────────────────────────────────────────────────

  private parseAtom(rawXml: string): { meta: FeedMeta; items: ParsedFeedItem[] } {
    const feedTitle = this.extractText(rawXml, "title");
    const entrySegments = this.extractElements(rawXml, "entry");

    const meta: FeedMeta = {
      title: feedTitle,
      description: this.extractText(rawXml, "subtitle") || "",
      link: this.extractAtomLinkHref(rawXml) || "",
      language: this.extractAttribute(rawXml, "xml:lang") || undefined,
      itemCount: entrySegments.length,
    };

    const items: ParsedFeedItem[] = entrySegments.map((entryXml) => {
      const titleRaw = this.extractAtomTitle(entryXml);
      const summaryRaw = this.extractText(entryXml, "summary") || this.extractText(entryXml, "content");
      const published = this.extractText(entryXml, "published");
      const updated = this.extractText(entryXml, "updated");
      const contentEl = this.extractElement(entryXml, "content");

      // Extract Atom link enclosures
      const enclosures = this.extractAtomEnclosures(entryXml);

      return {
        title: this.stripHtml(titleRaw),
        url: this.extractAtomLinkHref(entryXml) || "",
        description: this.stripHtml(summaryRaw).slice(0, 280),
        publishedAt: published ? this.atomDateToIso(published) : undefined,
        updatedAt: updated ? this.atomDateToIso(updated) : undefined,
        author: this.extractText(entryXml, "name") || undefined,
        categories: this.extractAllAttributes(entryXml, "category", "term"),
        contentHtml: contentEl ? this.decodeEntities(this.extractTextFromContent(contentEl)) : undefined,
        guid: this.extractText(entryXml, "id") || undefined,
        feedTitle,
        enclosures,
      };
    });

    return { meta, items };
  }

  // ── RDF / RSS 1.0 ──────────────────────────────────────────────────────

  /**
   * Parse RDF/RSS 1.0 feeds.
   * RDF items are at the document root (not inside channel),
   * referenced by <rdf:Seq><rdf:li rdf:resource="..."/></rdf:Seq>.
   */
  private parseRdf(rawXml: string): { meta: FeedMeta; items: ParsedFeedItem[] } {
    const channel = this.extractElement(rawXml, "channel");
    const feedTitle = channel ? this.extractText(channel, "title") : this.extractText(rawXml, "title");
    const feedDesc = channel ? this.extractText(channel, "description") : "";
    const feedLink = channel ? this.extractText(channel, "link") : "";

    // RDF items are at root level as <item rdf:about="...">
    const itemSegments = this.extractElements(rawXml, "item");

    const items: ParsedFeedItem[] = itemSegments.map((itemXml) => {
      const authorRaw = this.extractText(itemXml, "author") || this.extractTextNS(itemXml, "dc:creator");
      const author = authorRaw ? authorRaw.replace(/^[^@]+@[^\s]+\s*\(?/, "").replace(/\)$/, "").trim() : undefined;
      const pubDate = this.extractText(itemXml, "dc:date") || this.extractText(itemXml, "pubDate");

      const enclosures = this.extractRssEnclosures(itemXml);
      const contentEncoded = this.extractTextNS(itemXml, "content:encoded");

      return {
        title: this.extractTextCdata(itemXml, "title"),
        url: this.extractText(itemXml, "link") || "",
        description: this.stripHtml(this.extractTextCdata(itemXml, "description")).slice(0, 280),
        publishedAt: pubDate ? (pubDate.includes("T") ? pubDate : this.rfc2822ToIso(pubDate)) : undefined,
        author: author || undefined,
        categories: this.extractAllText(itemXml, "dc:subject"),
        contentHtml: contentEncoded || undefined,
        guid: this.extractAttribute(itemXml, "rdf:about") || undefined,
        feedTitle,
        enclosures,
      };
    });

    return {
      meta: {
        title: feedTitle,
        description: feedDesc,
        link: feedLink,
        itemCount: items.length,
      },
      items,
    };
  }

  // ── Enclosure extraction ────────────────────────────────────────────────

  /** Extract enclosures and media attachments from RSS 2.0 / RDF items. */
  private extractRssEnclosures(itemXml: string): ParsedEnclosure[] {
    const result: ParsedEnclosure[] = [];

    // Standard RSS <enclosure> tags
    const enclosurePattern = /<enclosure\b[^>]*\/?>/gi;
    let match;
    while ((match = enclosurePattern.exec(itemXml)) !== null) {
      const el = match[0];
      const url = this.extractAttr(el, "url");
      if (url) {
        result.push({
          url,
          type: this.extractAttr(el, "type") || undefined,
          length: parseInt(this.extractAttr(el, "length") || "0", 10) || undefined,
        });
      }
    }

    // <media:content> tags
    const mediaContentPattern = /<media:content\b[^>]*\/?>/gi;
    while ((match = mediaContentPattern.exec(itemXml)) !== null) {
      const el = match[0];
      const url = this.extractAttr(el, "url");
      if (url && !result.some((e) => e.url === url)) {
        result.push({
          url,
          type: this.extractAttr(el, "type") || undefined,
        });
      }
    }

    // <media:thumbnail> tags
    const mediaThumbPattern = /<media:thumbnail\b[^>]*\/?>/gi;
    while ((match = mediaThumbPattern.exec(itemXml)) !== null) {
      const el = match[0];
      const url = this.extractAttr(el, "url");
      if (url && !result.some((e) => e.url === url)) {
        result.push({
          url,
          type: "image/thumbnail",
        });
      }
    }

    return result;
  }

  /** Extract Atom <link rel="enclosure"> elements. */
  private extractAtomEnclosures(entryXml: string): ParsedEnclosure[] {
    const result: ParsedEnclosure[] = [];
    const pattern = /<link\b[^>]*rel\s*=\s*["']enclosure["'][^>]*\/?>/gi;
    let match;
    while ((match = pattern.exec(entryXml)) !== null) {
      const el = match[0];
      const url = this.extractAttr(el, "href");
      if (url) {
        result.push({
          url,
          type: this.extractAttr(el, "type") || undefined,
          length: parseInt(this.extractAttr(el, "length") || "0", 10) || undefined,
        });
      }
    }
    return result;
  }

  /** Extract a single attribute value from an XML element string. */
  private extractAttr(el: string, attr: string): string {
    const pattern = new RegExp(`\\b${attr}\\s*=\\s*["']([^"']*)["']`, "i");
    const m = el.match(pattern);
    return m ? m[1] : "";
  }

  // ── XML Extraction Helpers ────────────────────────────────────────────

  /** Extract a child element's text content, stripping nested tags. */
  private extractText(parentXml: string, tagName: string): string {
    const el = this.extractElement(parentXml, tagName);
    if (!el) return "";
    // Unwrap CDATA before stripping tags — CDATA markers (<![CDATA[...]]>)
    // would otherwise be matched by the tag regex and stripped with their content.
    return this.stripHtml(this.unwrapCdata(el).replace(/<\/?[^>]+>/g, ""));
  }

  /** Extract text content while preserving CDATA content. Used for RSS items where CDATA wraps the value. */
  private extractTextCdata(parentXml: string, tagName: string): string {
    const el = this.extractElement(parentXml, tagName);
    if (!el) return "";
    return this.unwrapCdata(this.stripTagsExceptCdata(el));
  }

  /** Extract the full inner content of an element including any child elements. */
  private extractTextFromContent(elContent: string): string {
    // Remove the outer tag if present, return inner content
    return elContent.replace(/^<[^>]+>/, "").replace(/<\/[^>]+>$/, "");
  }

  /** Extract a single XML element's content including its tags. */
  private extractElement(parentXml: string, tagName: string): string | null {
    const pattern = new RegExp(
      `<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`,
      "i",
    );
    const match = parentXml.match(pattern);
    return match ? match[0] : null;
  }

  /** Extract all matching elements from a parent. */
  private extractElements(parentXml: string, tagName: string): string[] {
    const results: string[] = [];
    const pattern = new RegExp(
      `<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`,
      "gi",
    );
    let match;
    while ((match = pattern.exec(parentXml)) !== null) {
      results.push(match[0]);
    }
    return results;
  }

  /** Extract all occurrences of a tag's text content. */
  private extractAllText(parentXml: string, tagName: string): string[] {
    const elPattern = new RegExp(
      `<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`,
      "gi",
    );
    const results: string[] = [];
    let match;
    while ((match = elPattern.exec(parentXml)) !== null) {
      results.push(this.stripHtml(this.unwrapCdata(match[1])));
    }
    return results;
  }

  /** Extract values of a specific attribute from all matching elements. */
  private extractAllAttributes(parentXml: string, tagName: string, attr: string): string[] {
    const results: string[] = [];
    const pattern = new RegExp(
      `<${tagName}\\b[^>]*\\b${attr}\\s*=\\s*["']([^"']+)["'][^>]*>`,
      "gi",
    );
    let match;
    while ((match = pattern.exec(parentXml)) !== null) {
      results.push(match[1]);
    }
    return results;
  }

  /** Extract an attribute value from the first matching element. */
  private extractAttribute(parentXml: string, attr: string): string | null {
    const pattern = new RegExp(`\\b${attr}\\s*=\\s*["']([^"']+)["']`, "i");
    const match = parentXml.match(pattern);
    return match ? match[1] : null;
  }

  /** Extract text from a namespaced element (e.g., dc:creator). */
  private extractTextNS(parentXml: string, tagName: string): string {
    const [prefix, local] = tagName.split(":");
    const pattern = new RegExp(
      `<${prefix}:${local}\\b[^>]*>([\\s\\S]*?)</${prefix}:${local}>`,
      "i",
    );
    const match = parentXml.match(pattern);
    return match ? this.stripHtml(this.unwrapCdata(match[1])) : "";
  }

  /** Extract the href from an Atom <link rel="alternate"> element. */
  private extractAtomLinkHref(xml: string): string | null {
    const pattern = /<link\b[^>]*rel\s*=\s*["']alternate["'][^>]*href\s*=\s*["']([^"']+)["'][^>]*\/?>/i;
    const match = xml.match(pattern);
    if (match) return match[1];

    // Fallback: any <link> with href
    const fallback = xml.match(/<link\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*\/?>/i);
    return fallback ? fallback[1] : null;
  }

  /** Extract an Atom title, stripping HTML when type="html". */
  private extractAtomTitle(entryXml: string): string {
    const el = this.extractElement(entryXml, "title");
    if (!el) return "";
    const isHtml = /type\s*=\s*["']html["']/i.test(el);
    const inner = this.extractTextFromContent(el);
    if (isHtml) {
      return this.stripHtml(this.unwrapCdata(inner));
    }
    return this.unwrapCdata(inner);
  }

  // ── Text Sanitization ─────────────────────────────────────────────────

  /** Strip HTML tags from a string, returning plain text. */
  private stripHtml(text: string): string {
    if (!text) return "";
    return text
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
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

  /** Decode common XML/HTML entities back to their literal characters. */
  private decodeEntities(text: string): string {
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");
  }

  /** Unwrap CDATA section markers. */
  private unwrapCdata(text: string): string {
    return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  }

  /** Like extractTextFromContent but handles self-closing tags. */
  private stripTagsExceptCdata(elContent: string): string {
    // Remove the opening/closing tags but keep inner content
    return elContent.replace(/^<[^>]+>/, "").replace(/<\/[^>]+>$/, "");
  }

  // ── Date Conversion ────────────────────────────────────────────────────

  /** Convert RFC 2822 date to ISO 8601. */
  private rfc2822ToIso(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toISOString();
    } catch {
      return dateStr;
    }
  }

  /** Convert Atom date to ISO 8601 (already close, but normalize). */
  private atomDateToIso(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toISOString();
    } catch {
      return dateStr;
    }
  }
}
