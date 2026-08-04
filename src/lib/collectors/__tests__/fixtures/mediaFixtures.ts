/**
 * Standardized test fixtures for media collectors (Journalism, Academic).
 * Types match RawMediaDocument from MediaNormalizer.
 * All data is synthetic — no actual copyrighted content.
 */

import type { RawMediaDocument } from "../../media/MediaNormalizer";

// ── Normal responses ──────────────────────────────────────────────────────────

export const validJournalismDocument: RawMediaDocument = {
  url: "https://www.test-news-outlet.org/investigations/2026/07/test-region-crisis",
  headline: "Investigation: The Unfolding Crisis in Test Region",
  byline: "Jane Investigative Reporter",
  publication: "Test News Outlet",
  date: "2026-07-20",
  accessDate: "2026-08-03",
  bodyPreview:
    "A six-month investigation by Test News Outlet reveals the scale of the " +
    "humanitarian crisis unfolding in Test Region. Through interviews with over " +
    "200 witnesses, analysis of satellite imagery, and review of official documents, " +
    "this investigation documents systematic patterns of international humanitarian law violations.",
  contentType: "investigative",
  categories: ["investigation", "human_rights", "Test Region"],
  language: "en",
  isSubscriptionOnly: false,
};

export const validAcademicDocument: RawMediaDocument = {
  url: "https://doi.org/10.9999/test-journal.2026.001",
  headline: "Accountability Mechanisms in International Law: A Case Study of Test Region",
  byline: "Dr. Academic Researcher, University of Test",
  publication: "Test Journal of International Law",
  date: "2026-06-15",
  accessDate: "2026-08-03",
  bodyPreview:
    "This article examines the effectiveness of international accountability mechanisms " +
    "through a case study of Test Region. The research finds that while legal frameworks " +
    "exist, political will and enforcement mechanisms remain insufficient.",
  contentType: "academic_paper",
  categories: ["academic", "international_law", "accountability"],
  language: "en",
  abstract: "Examination of accountability mechanisms in international law via Test Region case study.",
  doi: "10.9999/test-journal.2026.001",
  publicationVenue: "Test Journal of International Law, Vol. 99, No. 1",
  isSubscriptionOnly: false,
  openAccessUrl: "https://doi.org/10.9999/test-journal.2026.001",
};

export const validPaywalledArticle: RawMediaDocument = {
  url: "https://www.test-paywall-outlet.com/analysis/2026/07/test-analysis",
  headline: "Analysis: Diplomatic Responses to the Test Region Crisis",
  byline: "Senior Diplomatic Correspondent",
  publication: "Test Paywall Outlet",
  date: "2026-07-18",
  accessDate: "2026-08-03",
  bodyPreview:
    "Diplomatic sources indicate growing international concern over the Test Region crisis. " +
    "Several states are considering coordinated action through multilateral forums.",
  contentType: "news_report",
  categories: ["diplomacy", "international_relations"],
  language: "en",
  isSubscriptionOnly: true,
};

// ── Empty / minimal responses ─────────────────────────────────────────────────

export const emptyMediaDocument: RawMediaDocument = {
  url: "https://www.test-news-outlet.org/empty",
  headline: "",
  publication: "",
  date: undefined,
  accessDate: "2026-08-03",
  bodyPreview: "",
  contentType: "news_report",
  categories: [],
  language: "en",
  isSubscriptionOnly: false,
};

export const minimalMediaDocument: RawMediaDocument = {
  url: "https://www.test-journal.org/minimal",
  headline: "Brief Research Note",
  publication: "Test Academic Journal",
  date: "2026-07-01",
  accessDate: "2026-08-03",
  bodyPreview: "A short research note on recent developments.",
  contentType: "working_paper",
  categories: [],
  language: "en",
  isSubscriptionOnly: false,
};

// ── Malformed documents ───────────────────────────────────────────────────────

export const malformedMediaDocument: RawMediaDocument = {
  url: "",
  headline: "",
  publication: "",
  date: undefined,
  accessDate: "",
  bodyPreview: "",
  contentType: "news_report",
  categories: [],
  language: "en",
  isSubscriptionOnly: false,
};

export const missingPublicationDocument: RawMediaDocument = {
  url: "https://www.example-article.com/opinion",
  headline: "Opinion: Thoughts on Current Events",
  byline: "Anonymous Author",
  publication: "",
  date: "2026-07-15",
  accessDate: "2026-08-03",
  bodyPreview: "An opinion piece without clear publication metadata.",
  contentType: "opinion",
  categories: ["opinion"],
  language: "en",
  isSubscriptionOnly: false,
};

// ── Normalization variants ────────────────────────────────────────────────────

export const normalizationVariants: RawMediaDocument[] = [
  validJournalismDocument,
  validAcademicDocument,
  validPaywalledArticle,
  // Opinion piece
  {
    url: "https://www.test-news-outlet.org/opinion/2026/08/editorial-test",
    headline: "Editorial: The International Community Must Act on Test Region",
    byline: "Editorial Board",
    publication: "Test News Outlet",
    date: "2026-08-01",
    accessDate: "2026-08-03",
    bodyPreview:
      "The international community can no longer stand by while the crisis in Test Region deepens.",
    contentType: "editorial",
    categories: ["editorial", "international_community"],
    language: "en",
    isSubscriptionOnly: false,
  },
  // French language
  {
    url: "https://www.test-news-outlet.org/fr/reportage",
    headline: "Reportage: La crise humanitaire dans la région Test",
    byline: "Jean Reporter",
    publication: "Test News Outlet",
    date: "2026-07-10",
    accessDate: "2026-08-03",
    bodyPreview: "Un reportage approfondi sur la situation humanitaire dans la région Test.",
    contentType: "feature",
    categories: ["reportage", "humanitaire"],
    language: "fr",
    isSubscriptionOnly: false,
  },
  // Preprint (academic)
  {
    url: "https://doi.org/10.9999/preprint.2026.001",
    headline: "Accountability Gap Analysis: A Preprint Study",
    byline: "Prof. Early Career",
    publication: "Preprint Server",
    date: "2026-06-01",
    accessDate: "2026-08-03",
    bodyPreview: "A preprint analysis of accountability gaps in international legal frameworks.",
    contentType: "preprint",
    categories: ["academic", "preprint", "accountability"],
    language: "en",
    abstract: "Analysis of accountability gaps in international legal frameworks.",
    doi: "10.9999/preprint.2026.001",
    publicationVenue: "Test Preprint Repository",
    isSubscriptionOnly: false,
    openAccessUrl: "https://doi.org/10.9999/preprint.2026.001",
  },
  // No date
  {
    url: "https://www.test-journal.org/no-date",
    headline: "Research Without Publication Date",
    byline: "Unknown Researcher",
    publication: "Test Journal",
    accessDate: "2026-08-03",
    bodyPreview: "Academic article with missing publication date metadata.",
    contentType: "academic_paper",
    categories: ["academic"],
    language: "en",
    isSubscriptionOnly: false,
  },
];

// ── Error simulation fixtures ─────────────────────────────────────────────────

export interface MediaFetchErrorFixture {
  status: number;
  statusText: string;
}

export const notFoundError: MediaFetchErrorFixture = {
  status: 404,
  statusText: "Not Found",
};

export const serverError: MediaFetchErrorFixture = {
  status: 500,
  statusText: "Internal Server Error",
};

export const rateLimitedError: MediaFetchErrorFixture = {
  status: 429,
  statusText: "Too Many Requests",
};

// ── RSS feed fixtures ─────────────────────────────────────────────────────────

export const journalismRssFixture = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test News Outlet — Investigations</title>
    <link>https://www.test-news-outlet.org</link>
    <description>Investigative journalism covering international affairs and human rights.</description>
    <item>
      <title>Investigation: The Unfolding Crisis in Test Region</title>
      <link>https://www.test-news-outlet.org/investigations/2026/07/test-region-crisis</link>
      <description>A six-month investigation reveals the scale of the humanitarian crisis.</description>
      <pubDate>Sun, 20 Jul 2026 00:00:00 GMT</pubDate>
      <category>Investigation</category>
    </item>
    <item>
      <title>Analysis: International Law and Accountability Gaps</title>
      <link>https://www.test-news-outlet.org/analysis/2026/07/accountability-gaps</link>
      <description>Analysis of international legal frameworks and accountability enforcement.</description>
      <pubDate>Fri, 18 Jul 2026 00:00:00 GMT</pubDate>
      <category>Analysis</category>
    </item>
  </channel>
</rss>`;

export const journalismEmptyRssFixture = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test News Outlet</title>
    <link>https://www.test-news-outlet.org</link>
    <description>Investigative journalism</description>
  </channel>
</rss>`;
