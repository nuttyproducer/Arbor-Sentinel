import { BaseCollector } from "../BaseCollector";
import { type ParsedFeedItem } from "../feeds/FeedParser";
import { getFeedsBySourceType } from "../feeds/feedConfig";
import { MediaNormalizer, type RawMediaDocument, type MediaContentType } from "./MediaNormalizer";
import { ParseError, ValidationError } from "../errors";
import type { NormalizedContent, CollectedItem } from "../types";

/**
 * CORS proxies for fetching RSS feeds from the browser.
 * Tried in order — first successful response wins.
 */
const CORS_PROXIES = [
  { url: "https://dwtuyqtqmuwioqqjtnny.supabase.co/functions/v1/rss-proxy?url=", needsAuth: true },
  { url: "https://corsproxy.io/?", needsAuth: false },
  { url: "https://api.allorigins.win/raw?url=", needsAuth: false },
];

/** Publishable key for calling our own edge function. */
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/**
 * Collector for journalism, NGO, and academic sources via RSS/Atom feeds.
 *
 * Routes all RSS fetches through the rss-proxy Edge Function to avoid
 * browser CORS restrictions. Reads the feed URL from the collector config
 * metadata (set by RuntimeEngine from the DB feeds table), falling back
 * to the static feedConfig for development/testing.
 *
 * Guardrails:
 * - Never stores full article text — body is the preview/snippet only
 * - Distinguishes news reporting from opinion/editorial
 * - Labels paywalled content appropriately
 * - Does not bypass paywalls
 */
export class JournalismCollector extends BaseCollector {
  private readonly normalizer = new MediaNormalizer();

  /**
   * Fetch: poll the feed URL from config metadata (DB-sourced), falling
   * back to static feedConfig entries if no URL is in metadata.
   */
  async fetch(): Promise<unknown[]> {
    // Primary path: use the URL from config metadata (set by RuntimeEngine from DB)
    const feedUrl = this.config.metadata?.url as string | undefined;

    if (feedUrl) {
      try {
        const items = await this.pollUrl(feedUrl);
        return items;
      } catch {
        // Fall through to static config fallback
      }
    }

    // Fallback: poll from static feedConfig (development/testing)
    const feeds = getFeedsBySourceType("journalism")
      .filter((f) => f.enabled)
      .filter((f) => f.url === this.source.url || this.source.url === "");

    const feedsToPoll = feeds.length > 0 ? feeds : getFeedsBySourceType("journalism").filter((f) => f.enabled);

    const allItems: ParsedFeedItem[] = [];
    for (const feed of feedsToPoll) {
      try {
        const items = await this.pollUrl(feed.url);
        allItems.push(...items);
      } catch {
        // Skip failed feeds, continue with others
      }
    }

    return allItems;
  }

  /**
   * Normalize a ParsedFeedItem into NormalizedContent via MediaNormalizer.
   */
  async normalize(raw: unknown): Promise<NormalizedContent> {
    const parsed = raw as ParsedFeedItem;
    const rawDoc = this.parsedToRaw(parsed);
    const v = this.normalizer.validate(rawDoc);
    if (!v.valid) {
      throw new ValidationError(`Journalism validation: ${v.reason}`, {
        sourceId: this.source.id,
        url: rawDoc.url,
        attempt: 1,
      });
    }
    return this.normalizer.normalize(rawDoc);
  }

  /**
   * Override: detect duplicates by GUID and URL across feeds.
   */
  async isDuplicate(item: CollectedItem): Promise<boolean> {
    const exists = await this.storage.exists(item.fingerprint);
    if (exists) return true;

    const allItems = await this.storage.getBySource(this.source.id);
    const raw = item.raw as ParsedFeedItem | null | undefined;

    // Cross-feed dedup by GUID (e.g. same article syndicated under a different URL)
    if (raw?.guid) {
      const matchByGuid = allItems.some((stored) => {
        const storedRaw = stored.raw as ParsedFeedItem | null | undefined;
        return storedRaw?.guid !== undefined && storedRaw.guid === raw.guid;
      });
      if (matchByGuid) return true;
    }

    // Cross-feed dedup by URL
    const matchByUrl = allItems.some((stored) => stored.url === item.url);
    if (matchByUrl) return true;

    return false;
  }

  // ── Feed Polling ─────────────────────────────────────────────────────

  /**
   * Poll a single feed URL. Tries CORS proxies in order, falling back to
   * direct fetch for feeds that allow CORS or non-browser environments.
   */
  private async pollUrl(feedUrl: string): Promise<ParsedFeedItem[]> {
    // 1. Try each CORS proxy
    for (const proxy of CORS_PROXIES) {
      try {
        const proxyUrl = `${proxy.url}${encodeURIComponent(feedUrl)}`;
        const fetchOpts: RequestInit = proxy.needsAuth && SUPABASE_PUBLISHABLE_KEY
          ? { headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` } }
          : {};
        const res = await fetch(proxyUrl, fetchOpts);
        if (!res.ok) continue;

        const text = await res.text();
        if (!text.trim()) continue;

        // Detect if response is JSON (rss-proxy) or XML (corsproxy.io returns raw XML)
        if (text.startsWith("{")) {
          const body = JSON.parse(text) as {
            success?: boolean;
            items?: Array<{
              title: string; url: string; description: string;
              publishedAt?: string; author?: string; categories?: string[];
              guid?: string; feedTitle: string;
            }>;
            error?: string;
          };
          if (body.success && body.items?.length) {
            return body.items.map((item) => ({
              title: item.title,
              url: item.url,
              description: item.description || "",
              publishedAt: item.publishedAt,
              author: item.author,
              categories: item.categories ?? [],
              guid: item.guid,
              feedTitle: item.feedTitle || "",
              language: undefined,
            }));
          }
        } else if (text.includes("<rss") || text.includes("<feed") || text.includes("<channel") || text.includes("<entry")) {
          // Raw XML returned by CORS proxy — parse it inline
          return this.parseXmlItems(text);
        }
      } catch {
        // Proxy failed, try next
      }
    }

    // 2. Fallback: direct fetch (works in Node.js tests)
    const res = await fetch(feedUrl);
    if (!res.ok) {
      throw new ParseError(
        `All proxies + direct fetch failed for "${feedUrl}" (${res.status})`,
        { sourceId: this.source.id, url: feedUrl, attempt: 1 },
      );
    }
    return this.parseXmlItems(await res.text());
  }

  /** Lightweight inline RSS/Atom parser for the fallback path. */
  private parseXmlItems(xml: string): ParsedFeedItem[] {
    const itemPattern = /<(item|entry)\b[^>]*>([\s\S]*?)<\/(item|entry)>/gi;
    const items: ParsedFeedItem[] = [];
    let match;
    while ((match = itemPattern.exec(xml)) !== null) {
      const el = match[2];
      items.push({
        title: this.extractXml(el, "title"),
        url: this.extractXml(el, "link") || this.extractLinkHref(el),
        description: this.stripHtml(this.extractXml(el, "description") || this.extractXml(el, "summary") || "").slice(0, 280),
        publishedAt: this.extractXml(el, "pubDate") || this.extractXml(el, "published") || this.extractXml(el, "updated"),
        author: this.extractXml(el, "author") || this.extractXml(el, "name") || undefined,
        categories: [],
        guid: this.extractXml(el, "guid") || this.extractXml(el, "id") || undefined,
        feedTitle: this.extractXml(xml, "title"),
        language: undefined,
      });
    }
    return items;
  }

  private extractXml(xml: string, tag: string): string {
    const m = xml.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
    return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ").trim() : "";
  }

  private extractLinkHref(xml: string): string {
    const m = xml.match(/<link\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*\/?>/i);
    return m ? m[1] : "";
  }

  private stripHtml(text: string): string {
    return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  // ── Conversion ─────────────────────────────────────────────────────────

  private parsedToRaw(parsed: ParsedFeedItem): RawMediaDocument {
    const today = new Date().toISOString().split("T")[0];

    return {
      url: parsed.url,
      headline: parsed.title,
      byline: parsed.author,
      publication: parsed.feedTitle,
      date: parsed.publishedAt,
      accessDate: today,
      bodyPreview: parsed.description.slice(0, 280),
      contentType: this.detectContentType(parsed.categories),
      categories: parsed.categories,
      language: parsed.language,
      isSubscriptionOnly: this.feedHasPaywall(),
    };
  }

  /** Whether this source's feed is known to be paywalled (from feedConfig). */
  private feedHasPaywall(): boolean {
    return (
      getFeedsBySourceType("journalism")
        .find((f) => f.sourceId === this.source.id || f.url === this.source.url)
        ?.hasPaywall ?? false
    );
  }

  private detectContentType(categories: string[]): MediaContentType {
    const cats = categories.map((c) => c.toLowerCase());
    if (cats.some((c) => c.includes("opinion")) || cats.some((c) => c.includes("commentary"))) {
      return "opinion";
    }
    if (cats.some((c) => c.includes("editorial"))) {
      return "editorial";
    }
    if (cats.some((c) => c.includes("investigat"))) {
      return "investigative";
    }
    if (cats.some((c) => c.includes("feature"))) {
      return "feature";
    }
    return "news_report";
  }
}
