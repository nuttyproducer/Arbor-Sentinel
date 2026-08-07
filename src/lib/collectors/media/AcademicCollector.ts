import { BaseCollector } from "../BaseCollector";
import { FeedParser, type ParsedFeedItem } from "../feeds/FeedParser";
import { MediaNormalizer, type RawMediaDocument } from "./MediaNormalizer";
import { ValidationError } from "../errors";
import type { NormalizedContent } from "../types";

/**
 * Collector for academic research sources.
 *
 * Two-phase fetch:
 * 1. RSS feeds (Google Scholar alerts, SSRN subject feeds) via FeedParser
 * 2. DOI enrichment via CrossRef API (free, no auth) and Unpaywall API for OA URL
 *
 * Rate limit: 10 req/min for CrossRef (respectful, well under the ~50/s free tier).
 *
 * Guardrails:
 * - Academic papers are labeled "analysis" not "evidence"
 * - Preprints distinguished from peer-reviewed
 * - OA links provided when available; never bypass paywalls
 * - Labels items without OA URL as subscription-only
 */
export class AcademicCollector extends BaseCollector {
  private readonly normalizer = new MediaNormalizer();
  private readonly feedParser = new FeedParser();
  private static readonly CROSSREF_API = "https://api.crossref.org/works";
  private static readonly UNPAYWALL_API = "https://api.unpaywall.org/v2";

  async fetch(): Promise<unknown[]> {
    // The feed URL is set in config metadata by RuntimeEngine from the DB feeds table.
    const feedUrl = this.config.metadata?.url as string | undefined;
    if (!feedUrl) return [];
    try {
      return await this.pollFeed(feedUrl);
    } catch {
      return [];
    }
  }

  async normalize(raw: unknown): Promise<NormalizedContent> {
    const parsed = raw as ParsedFeedItem;
    const doi = this.extractDoi(parsed);

    // Enrich with CrossRef metadata when DOI is available
    let enriched = parsed;
    if (doi) {
      try {
        enriched = await this.enrichFromCrossRef(parsed, doi);
      } catch {
        // Degrade gracefully — use original parsed item without enrichment
      }
    }

    // Check Unpaywall for OA URL
    let openAccessUrl: string | undefined;
    if (doi) {
      try {
        openAccessUrl = await this.checkUnpaywall(doi);
      } catch {
        // No OA link available
      }
    }

    const rawDoc = this.parsedToRaw(enriched, doi, openAccessUrl);
    const v = this.normalizer.validate(rawDoc);
    if (!v.valid) {
      throw new ValidationError(`Academic validation: ${v.reason}`, {
        sourceId: this.source.id,
        url: rawDoc.url,
        attempt: 1,
      });
    }
    return this.normalizer.normalize(rawDoc);
  }

  // ── Feed Polling ─────────────────────────────────────────────────────

  private async pollFeed(feedUrl: string): Promise<ParsedFeedItem[]> {
    const res = await this.httpFetch(feedUrl);
    const xml = await res.text();
    const parsed = this.feedParser.parse(xml);
    return parsed.items;
  }

  // ── DOI Enrichment ────────────────────────────────────────────────────

  private extractDoi(item: ParsedFeedItem): string | undefined {
    // Check guid for DOI pattern
    if (item.guid && /^10\.\d{4,}\//.test(item.guid)) {
      return item.guid;
    }
    // Check URL for DOI pattern
    const doiMatch = item.url.match(/\b(10\.\d{4,}\/[^\s?#]+)/);
    if (doiMatch) return doiMatch[1];
    return undefined;
  }

  private async enrichFromCrossRef(
    item: ParsedFeedItem,
    doi: string,
  ): Promise<ParsedFeedItem> {
    const url = `${AcademicCollector.CROSSREF_API}/${encodeURIComponent(doi)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) return item;

      const data = await res.json() as { message?: Record<string, unknown> };
      const msg = data.message;
      if (!msg) return item;

      const authors = (msg.author as Array<{ given?: string; family?: string }>) || [];
      const authorStr = authors
        .map((a) => [a.given, a.family].filter(Boolean).join(" "))
        .join(", ");

      const container = (msg["container-title"] as string[]) || [];
      const volume = msg.volume as string | undefined;
      const issue = msg.issue as string | undefined;
      const venue = [container[0], volume ? `Vol. ${volume}` : null, issue ? `Issue ${issue}` : null]
        .filter(Boolean)
        .join(", ");

      const titles = (msg.title as string[]) || [];
      const title = titles[0] || item.title;

      const abstract = msg.abstract as string | undefined;
      const publishedDate = (msg.published as Record<string, unknown>)?.date_parts as number[][] | undefined;
      const pubDate = publishedDate?.[0]?.join("-");

      return {
        ...item,
        title,
        author: authorStr || item.author,
        description: abstract || item.description,
        publishedAt: pubDate || item.publishedAt,
        feedTitle: venue || item.feedTitle,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  private async checkUnpaywall(doi: string): Promise<string | undefined> {
    const url = `${AcademicCollector.UNPAYWALL_API}/${encodeURIComponent(doi)}?email=collector@arborsentinel.org`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) return undefined;

      const data = await res.json() as {
        best_oa_location?: { url?: string; url_for_pdf?: string };
        oa_status?: string;
      };

      return data.best_oa_location?.url || data.best_oa_location?.url_for_pdf || undefined;
    } catch {
      return undefined;
    } finally {
      clearTimeout(timer);
    }
  }

  // ── Conversion ─────────────────────────────────────────────────────────

  private parsedToRaw(
    parsed: ParsedFeedItem,
    doi?: string,
    openAccessUrl?: string,
  ): RawMediaDocument {
    const today = new Date().toISOString().split("T")[0];
    const isSubscriptionOnly = !openAccessUrl && !this.isLikelyOpenAccess(parsed.url);

    return {
      url: parsed.url,
      headline: parsed.title,
      byline: parsed.author,
      publication: parsed.feedTitle,
      date: parsed.publishedAt?.split("T")[0],
      accessDate: today,
      bodyPreview: parsed.description.slice(0, 280),
      contentType: "academic_paper",
      categories: parsed.categories,
      language: parsed.language,
      abstract: parsed.description.slice(0, 500),
      doi,
      publicationVenue: parsed.feedTitle !== parsed.title ? parsed.feedTitle : undefined,
      openAccessUrl,
      isSubscriptionOnly,
    };
  }

  private isLikelyOpenAccess(url: string): boolean {
    const oaDomains = ["ssrn.com", "arxiv.org", "escholarship.org", "researchgate.net",
      "academia.edu", "doi.org", "pubmedcentral", "ncbi.nlm.nih.gov/pmc"];
    return oaDomains.some((d) => url.includes(d));
  }
}
