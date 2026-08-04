import { BaseCollector } from "../BaseCollector";
import { FeedParser, type ParsedFeedItem } from "../feeds/FeedParser";
import { getFeedsBySourceType, type FeedDefinition } from "../feeds/feedConfig";
import { MediaNormalizer, type RawMediaDocument, type MediaContentType } from "./MediaNormalizer";
import { ParseError, ValidationError } from "../errors";
import type { NormalizedContent, CollectedItem } from "../types";

/**
 * Collector for journalism sources via RSS/Atom feeds.
 *
 * Consumes feedConfig to know which feeds to poll. Parses feeds via
 * FeedParser. Normalizes parsed items through MediaNormalizer.
 *
 * Guardrails:
 * - Never stores full article text — body is the preview/snippet only
 * - Distinguishes news reporting from opinion/editorial
 * - Labels paywalled content appropriately
 * - Does not bypass paywalls
 */
export class JournalismCollector extends BaseCollector {
  private readonly normalizer = new MediaNormalizer();
  private readonly feedParser = new FeedParser();

  /**
   * Fetch: poll all enabled journalism feeds, parse, return ParsedFeedItems.
   */
  async fetch(): Promise<unknown[]> {
    const feeds = getFeedsBySourceType("journalism").filter((f) => f.enabled);

    // If the source URL is a specific feed, only poll that one
    const targetFeeds = feeds.filter((f) => f.url === this.source.url);
    const feedsToPoll = targetFeeds.length > 0 ? targetFeeds : feeds;

    const allItems: ParsedFeedItem[] = [];

    for (const feed of feedsToPoll) {
      try {
        const items = await this.pollFeed(feed);
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

  private async pollFeed(feed: FeedDefinition): Promise<ParsedFeedItem[]> {
    const res = await fetch(feed.url);
    if (!res.ok) {
      throw new ParseError(
        `Feed poll ${res.status} for "${feed.id}": ${feed.url}`,
        { sourceId: this.source.id, url: feed.url, attempt: 1 },
      );
    }

    const xml = await res.text();
    const parsed = this.feedParser.parse(xml);
    return parsed.items;
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
