/**
 * Content category type for normalized media.
 *
 * Defined inline here because MediaNormalizer (which would normally own this
 * type) is implemented in a later task. When MediaNormalizer lands, it should
 * import this from feedConfig or redefine it identically.
 */
export type MediaContentType =
  | "news_report"
  | "opinion"
  | "editorial"
  | "feature"
  | "investigative"
  | "interview"
  | "academic_paper"
  | "working_paper"
  | "book_chapter"
  | "conference_paper"
  | "preprint";

/** Configuration for a single RSS/Atom feed source. */
export interface FeedDefinition {
  /** Unique feed identifier. */
  id: string;
  /** Feed URL (RSS 2.0 or Atom 1.0). */
  url: string;
  /** Source ID this feed maps to in the Source Registry. */
  sourceId: string;
  /** Source type for collector routing. */
  sourceType: "journalism" | "ngo" | "academic";
  /** Human-readable outlet/organization name. */
  label: string;
  /** ISO 639-1 language code. */
  language: string;
  /** How often to poll this feed (minutes). */
  pollingIntervalMinutes: number;
  /** Content category mapping: feed category string → MediaContentType. */
  categoryMapping: Record<string, MediaContentType>;
  /** Whether this outlet is known to have a paywall. */
  hasPaywall: boolean;
  /** Whether this feed is currently enabled. */
  enabled: boolean;
  /** Arbitrary metadata for collector-specific options. */
  metadata?: Record<string, unknown>;
}

/**
 * Central feed configuration.
 *
 * Add new feeds here. Each feed maps to a source in the Source Registry
 * via `sourceId`. The JournalismCollector and AcademicCollector consume
 * this configuration to know which feeds to poll.
 */
export const feedConfig: FeedDefinition[] = [
  // ── Journalism Feeds ─────────────────────────────────────────────────

  {
    id: "reuters-world",
    url: "https://www.reuters.com/arc/outboundfeeds/v3/all/?outputType=xml",
    sourceId: "reuters",
    sourceType: "journalism",
    label: "Reuters World News",
    language: "en",
    pollingIntervalMinutes: 30,
    categoryMapping: {
      World: "news_report",
      Politics: "news_report",
      Opinion: "opinion",
    },
    hasPaywall: false,
    enabled: true,
  },

  {
    id: "ap-international",
    url: "https://apnews.com/hub/ap-top-news?format=rss",
    sourceId: "ap-news",
    sourceType: "journalism",
    label: "Associated Press International",
    language: "en",
    pollingIntervalMinutes: 30,
    categoryMapping: {
      "AP Top News": "news_report",
      Politics: "news_report",
    },
    hasPaywall: false,
    enabled: true,
  },

  {
    id: "bbc-world",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    sourceId: "bbc-news",
    sourceType: "journalism",
    label: "BBC World News",
    language: "en",
    pollingIntervalMinutes: 30,
    categoryMapping: {
      World: "news_report",
      Politics: "news_report",
    },
    hasPaywall: false,
    enabled: true,
  },

  {
    id: "aljazeera-world",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    sourceId: "aljazeera",
    sourceType: "journalism",
    label: "Al Jazeera News",
    language: "en",
    pollingIntervalMinutes: 30,
    categoryMapping: {
      News: "news_report",
      "Middle East": "news_report",
      Opinion: "opinion",
      Features: "feature",
    },
    hasPaywall: false,
    enabled: true,
  },

  {
    id: "nyt-world",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    sourceId: "nyt",
    sourceType: "journalism",
    label: "New York Times World",
    language: "en",
    pollingIntervalMinutes: 60,
    categoryMapping: {
      World: "news_report",
      Opinion: "opinion",
    },
    hasPaywall: true,
    enabled: true,
  },

  {
    id: "guardian-world",
    url: "https://www.theguardian.com/world/rss",
    sourceId: "guardian",
    sourceType: "journalism",
    label: "The Guardian World News",
    language: "en",
    pollingIntervalMinutes: 30,
    categoryMapping: {
      "World news": "news_report",
      Opinion: "opinion",
      "Middle East": "news_report",
    },
    hasPaywall: false,
    enabled: true,
  },

  // ── NGO Feeds (RSS-capable NGOs) ──────────────────────────────────────

  {
    id: "hrw-reports",
    url: "https://www.hrw.org/rss-feeds",
    sourceId: "hrw",
    sourceType: "ngo",
    label: "Human Rights Watch Reports",
    language: "en",
    pollingIntervalMinutes: 60,
    categoryMapping: {},
    hasPaywall: false,
    enabled: true,
  },

  {
    id: "amnesty-latest",
    url: "https://www.amnesty.org/en/feed/",
    sourceId: "amnesty",
    sourceType: "ngo",
    label: "Amnesty International Latest",
    language: "en",
    pollingIntervalMinutes: 60,
    categoryMapping: {},
    hasPaywall: false,
    enabled: true,
  },

  {
    id: "msf-updates",
    url: "https://www.msf.org/rss/news",
    sourceId: "msf",
    sourceType: "ngo",
    label: "MSF News & Updates",
    language: "en",
    pollingIntervalMinutes: 60,
    categoryMapping: {},
    hasPaywall: false,
    enabled: true,
  },

  // ── Academic Feeds ────────────────────────────────────────────────────

  {
    id: "ssrn-human-rights",
    url: "https://papers.ssrn.com/sol3/Jeljour_results.cfm?form_name=journalBrowse&journal_id=1234567&Network=no",
    sourceId: "ssrn",
    sourceType: "academic",
    label: "SSRN Human Rights Papers",
    language: "en",
    pollingIntervalMinutes: 120,
    categoryMapping: {
      "Human Rights": "academic_paper",
      "International Law": "academic_paper",
    },
    hasPaywall: false,
    enabled: true,
  },
];

// Query functions removed — the `feeds` Supabase table is the single source of truth.
// Use `feedRegistry.listEnabled()` / `feedRegistry.getFeedsBySourceType()` for runtime queries.
// This file is now seed-only: `feedConfig` is only consumed by `feedRegistry.syncFromConfig()`.
