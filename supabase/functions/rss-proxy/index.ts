// RSS Proxy — Edge Function
// Fetches RSS/Atom feeds server-side and returns parsed JSON.
// Solves the CORS problem: browsers can't fetch RSS feeds directly,
// but Deno (Edge Functions) can.

// ── Types ──────────────────────────────────────────────────────────────────

interface ParsedFeedItem {
  title: string;
  url: string;
  description: string;
  publishedAt?: string;
  author?: string;
  categories: string[];
  guid?: string;
  feedTitle: string;
}

interface FeedResponse {
  success: boolean;
  meta?: {
    title: string;
    description: string;
    link: string;
    language?: string;
    itemCount: number;
  };
  items: ParsedFeedItem[];
  error?: string;
}

// ── XML Parsing (lightweight — no DOM parser in Deno) ──────────────────────

function extractText(parentXml: string, tagName: string): string {
  const pattern = new RegExp(
    `<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`,
    "i",
  );
  const match = parentXml.match(pattern);
  if (!match) return "";
  return match[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
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

function extractElements(parentXml: string, tagName: string): string[] {
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

function stripHtml(text: string): string {
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

// ── RSS 2.0 Parser ─────────────────────────────────────────────────────────

function parseRss2(xml: string): FeedResponse {
  const channelMatch = xml.match(/<channel\b[^>]*>([\s\S]*?)<\/channel>/i);
  if (!channelMatch) {
    return { success: false, items: [], error: "Missing <channel> element" };
  }

  const channel = channelMatch[1];
  const feedTitle = extractText(channelMatch[0], "title");
  const itemXmls = extractElements(channel, "item");

  const items: ParsedFeedItem[] = itemXmls.map((itemXml) => {
    const pubDate = extractText(itemXml, "pubDate");
    const guidMatch = itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);

    return {
      title: extractText(itemXml, "title"),
      url: extractText(itemXml, "link"),
      description: stripHtml(extractText(itemXml, "description")).slice(0, 280),
      publishedAt: pubDate ? new Date(pubDate).toISOString() : undefined,
      author: extractText(itemXml, "author") || undefined,
      categories: extractElements(itemXml, "category").map((el) =>
        el.replace(/<[^>]+>/g, "").trim(),
      ),
      guid: guidMatch ? guidMatch[1].trim() : undefined,
      feedTitle,
    };
  });

  return {
    success: true,
    meta: {
      title: feedTitle,
      description: extractText(channelMatch[0], "description"),
      link: extractText(channelMatch[0], "link"),
      language: extractText(channelMatch[0], "language") || undefined,
      itemCount: items.length,
    },
    items,
  };
}

// ── Atom 1.0 Parser ────────────────────────────────────────────────────────

function parseAtom(xml: string): FeedResponse {
  const feedTitle = extractText(xml, "title");
  const entryXmls = extractElements(xml, "entry");

  const items: ParsedFeedItem[] = entryXmls.map((entryXml) => {
    const published = extractText(entryXml, "published");
    const updated = extractText(entryXml, "updated");
    const idMatch = entryXml.match(/<id[^>]*>([\s\S]*?)<\/id>/i);

    // Atom link href
    const linkMatch = entryXml.match(
      /<link\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*\/?>/i,
    );

    return {
      title: stripHtml(extractText(entryXml, "title")),
      url: linkMatch ? linkMatch[1] : "",
      description: stripHtml(
        extractText(entryXml, "summary") || extractText(entryXml, "content"),
      ).slice(0, 280),
      publishedAt: published
        ? new Date(published).toISOString()
        : updated
          ? new Date(updated).toISOString()
          : undefined,
      author: extractText(entryXml, "name") || undefined,
      categories: [],
      guid: idMatch ? idMatch[1].trim() : undefined,
      feedTitle,
    };
  });

  return {
    success: true,
    meta: {
      title: feedTitle,
      description: extractText(xml, "subtitle") || "",
      link: "",
      itemCount: items.length,
    },
    items,
  };
}

// ── Main Handler ────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // CORS headers for browser access
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  const url = new URL(req.url);
  const feedUrl = url.searchParams.get("url");

  if (!feedUrl) {
    return new Response(
      JSON.stringify({
        success: false,
        items: [],
        error: 'Missing "url" query parameter. Usage: ?url=https://example.com/rss',
      }),
      { headers, status: 400 },
    );
  }

  try {
    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Arbor-Sentinel/1.0 RSS Proxy",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          items: [],
          error: `Feed returned HTTP ${response.status}`,
        }),
        { headers, status: 502 },
      );
    }

    const xml = await response.text();

    // Auto-detect format
    let result: FeedResponse;
    if (/<rss\b/i.test(xml)) {
      result = parseRss2(xml);
    } else if (/<feed\b[^>]*xmlns\s*=\s*["']http:\/\/www\.w3\.org\/2005\/Atom["']/i.test(xml)) {
      result = parseAtom(xml);
    } else if (/<feed\b/i.test(xml)) {
      result = parseAtom(xml);
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          items: [],
          error: "Unrecognized feed format — expected RSS 2.0 or Atom 1.0",
        }),
        { headers, status: 400 },
      );
    }

    return new Response(JSON.stringify(result), { headers });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        items: [],
        error: error instanceof Error ? error.message : "Unknown error fetching feed",
      }),
      { headers, status: 500 },
    );
  }
});
