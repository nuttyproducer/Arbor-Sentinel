import type { MediaContentType } from "../feeds/feedConfig";
import type { NormalizedContent } from "../types";

// ── Types ─────────────────────────────────────────────────────────────

// MediaContentType is defined in feedConfig.ts (Task 2) and re-exported
// here for collector code that consumes this normalizer directly.
export type { MediaContentType } from "../feeds/feedConfig";

export interface RawMediaDocument {
  url: string;
  headline: string;
  byline?: string;
  publication: string;
  date?: string;
  /** When this article was accessed/fetched. Required for citation. */
  accessDate: string;
  /** Short preview — max 280 chars stored, 500 chars accepted. */
  bodyPreview: string;
  contentType: MediaContentType;
  categories: string[];
  language?: string;
  // Academic-specific
  abstract?: string;
  doi?: string;
  publicationVenue?: string;
  openAccessUrl?: string;
  /** true = paywalled, metadata only; never bypass paywalls. */
  isSubscriptionOnly: boolean;
}

export interface NormalizedMediaDocument extends NormalizedContent {
  byline?: string;
  publication: string;
  accessDate: string;
  contentType: MediaContentType;
  abstract?: string;
  doi?: string;
  publicationVenue?: string;
  openAccessUrl?: string;
  isSubscriptionOnly: boolean;
}

/**
 * Normalizer for journalism and academic content.
 *
 * Extracts: headline, byline, publication, date, access date, body preview,
 * URL, content type. Distinguishes news reporting from opinion/editorial.
 * Academic papers are labeled as "analysis" not "evidence."
 *
 * Guardrails:
 * - Never store full article text — body is the preview/snippet only
 * - Distinguish news_report from opinion/editorial
 * - Never bypass paywalls — label content as subscription-required
 * - Academic papers are analysis, not evidence
 */
export class MediaNormalizer {
  /**
   * Normalize a raw media document into NormalizedContent.
   * Body text is bodyPreview (never full text).
   */
  normalize(raw: RawMediaDocument): NormalizedMediaDocument {
    return {
      title: raw.headline,
      body: raw.bodyPreview.slice(0, 280),
      publishedAt: raw.date,
      url: raw.url,
      language: raw.language || "en",
      tags: this.generateTags(raw),
      metadata: {
        byline: raw.byline,
        publication: raw.publication,
        accessDate: raw.accessDate,
        contentType: raw.contentType,
        isSubscriptionOnly: raw.isSubscriptionOnly,
        abstract: raw.abstract,
        doi: raw.doi,
        publicationVenue: raw.publicationVenue,
        openAccessUrl: raw.openAccessUrl,
        disclaimer: raw.contentType.startsWith("academic_")
          ? "Academic papers are analysis, not evidence"
          : undefined,
      },
      byline: raw.byline,
      publication: raw.publication,
      accessDate: raw.accessDate,
      contentType: raw.contentType,
      abstract: raw.abstract,
      doi: raw.doi,
      publicationVenue: raw.publicationVenue,
      openAccessUrl: raw.openAccessUrl,
      isSubscriptionOnly: raw.isSubscriptionOnly,
    };
  }

  /**
   * Validate a raw media document before normalization.
   */
  validate(raw: RawMediaDocument): { valid: boolean; reason?: string } {
    if (!raw.url?.trim()) return { valid: false, reason: "Missing URL" };
    if (!raw.headline?.trim()) return { valid: false, reason: "Missing headline" };
    if (!raw.publication?.trim()) return { valid: false, reason: "Missing publication name" };
    if (!raw.accessDate?.trim()) return { valid: false, reason: "Missing access date" };
    if (raw.bodyPreview && raw.bodyPreview.length > 500) {
      return { valid: false, reason: "Body preview exceeds 500 characters" };
    }
    return { valid: true };
  }

  /** Generate tags from document metadata. */
  private generateTags(raw: RawMediaDocument): string[] {
    const tags: string[] = [
      raw.publication.toLowerCase().replace(/\s+/g, "-"),
    ];

    // Content type tag
    if (raw.contentType.startsWith("academic_")) {
      tags.push("academic");
      tags.push("analysis");
    } else if (raw.contentType === "opinion" || raw.contentType === "editorial") {
      tags.push("opinion");
    } else {
      tags.push("news");
    }

    // Category tags
    for (const cat of raw.categories) {
      tags.push(cat.toLowerCase().replace(/\s+/g, "-"));
    }

    // Subscription status
    if (raw.isSubscriptionOnly) {
      tags.push("subscription-required");
    }

    return [...new Set(tags)];
  }
}
