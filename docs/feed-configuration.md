# Feed Configuration Guide

**Status:** Active development  
**Last reviewed:** 2026-08-01

---

## Overview

The feed configuration system centralizes RSS/Atom feed definitions for
journalism, NGO, and academic collectors. Each feed maps to a source in
the Source Registry via `sourceId`.

Configuration is stored in `src/lib/collectors/feeds/feedConfig.ts`.

---

## Adding a new feed

Add an entry to the `feedConfig` array:

```typescript
{
  id: "my-news-outlet",
  url: "https://example.com/rss.xml",
  sourceId: "my-news-outlet",        // matches Source Registry ID
  sourceType: "journalism",          // "journalism" | "ngo" | "academic"
  label: "My News Outlet",
  language: "en",
  pollingIntervalMinutes: 30,
  categoryMapping: {
    "World": "news_report",
    "Politics": "news_report",
    "Opinion": "opinion",
  },
  hasPaywall: false,
  enabled: true,
}
```

### Field Reference

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique feed identifier |
| `url` | string | RSS 2.0 or Atom 1.0 feed URL |
| `sourceId` | string | Maps to a source in the Source Registry |
| `sourceType` | `"journalism" \| "ngo" \| "academic"` | Routes to the correct collector |
| `label` | string | Human-readable outlet name |
| `language` | string | ISO 639-1 language code |
| `pollingIntervalMinutes` | number | How often to check this feed |
| `categoryMapping` | `Record<string, MediaContentType>` | Maps feed categories to standard types |
| `hasPaywall` | boolean | Whether articles typically require subscription |
| `enabled` | boolean | Whether this feed is actively polled |
| `metadata` | `Record<string, unknown>` (optional) | Collector-specific options |

### Media Content Types

```typescript
type MediaContentType =
  | "news_report" | "opinion" | "editorial" | "feature"
  | "investigative" | "interview"
  | "academic_paper" | "working_paper" | "book_chapter"
  | "conference_paper" | "preprint";
```

---

## Polling Intervals

Configured per-feed to respect each source's terms of service:

| Source Type | Recommended Interval |
|---|---|
| News (high-frequency) | 15–30 minutes |
| News (daily) | 60 minutes |
| NGO feeds | 60–120 minutes |
| Academic feeds | 120–360 minutes |

---

## Disabling a Feed

Set `enabled: false` to stop polling without removing the configuration:

```typescript
{
  id: "temporarily-disabled-feed",
  // ...
  enabled: false,
}
```

Disabled feeds are skipped by all collectors.

---

## Paywall Handling

When `hasPaywall: true`, the collector will:
1. Still fetch and parse the feed for metadata (headline, byline, date)
2. Mark all items from this feed as `isSubscriptionOnly: true`
3. Store only the preview/snippet, never full text

Never set `hasPaywall: false` for a known paywalled source or configure
workarounds to bypass paywalls.

---

## Format Support

Both RSS 2.0 and Atom 1.0 feeds are supported. The FeedParser
auto-detects the format. No configuration needed per-feed.
