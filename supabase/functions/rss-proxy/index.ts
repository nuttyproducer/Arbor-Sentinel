// RSS Proxy — Edge Function
// Fetches RSS/Atom feeds server-side and returns parsed JSON.
// Solves the CORS problem: browsers can't fetch RSS feeds directly,
// but Deno (Edge Functions) can.

// ── Types ──────────────────────────────────────────────────────────────────

interface ParsedEnclosure {
  url: string;
  type?: string;
  length?: number;
}

interface ParsedFeedItem {
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

/** Extract text from a namespaced element (e.g., dc:creator, content:encoded). */
function extractTextNS(parentXml: string, tagName: string): string {
  const parts = tagName.split(":");
  const pattern = new RegExp(
    `<${parts[0]}:${parts[1]}\\b[^>]*>([\\s\\S]*?)</${parts[0]}:${parts[1]}>`,
    "i",
  );
  const match = parentXml.match(pattern);
  if (!match) return "";
  return match[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .trim();
}

/** Extract a single attribute value from an XML element string. */
function extractAttr(el: string, attr: string): string {
  const pattern = new RegExp(`\\b${attr}\\s*=\\s*["']([^"']*)["']`, "i");
  const m = el.match(pattern);
  return m ? m[1] : "";
}

/** Extract all attribute values for a given attr from matching elements. */
function extractAllAttributes(parentXml: string, tagName: string, attr: string): string[] {
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

/** Extract enclosures and media attachments from RSS 2.0 items. */
function extractRssEnclosures(itemXml: string): ParsedEnclosure[] {
  const result: ParsedEnclosure[] = [];

  // Standard <enclosure> tags
  const enclosurePattern = /<enclosure\b[^>]*\/?>/gi;
  let match;
  while ((match = enclosurePattern.exec(itemXml)) !== null) {
    const el = match[0];
    const url = extractAttr(el, "url");
    if (url) {
      result.push({
        url,
        type: extractAttr(el, "type") || undefined,
        length: parseInt(extractAttr(el, "length") || "0", 10) || undefined,
      });
    }
  }

  // <media:content> tags
  const mediaContentPattern = /<media:content\b[^>]*\/?>/gi;
  while ((match = mediaContentPattern.exec(itemXml)) !== null) {
    const el = match[0];
    const url = extractAttr(el, "url");
    if (url && !result.some((e) => e.url === url)) {
      result.push({ url, type: extractAttr(el, "type") || undefined });
    }
  }

  // <media:thumbnail> tags
  const mediaThumbPattern = /<media:thumbnail\b[^>]*\/?>/gi;
  while ((match = mediaThumbPattern.exec(itemXml)) !== null) {
    const el = match[0];
    const url = extractAttr(el, "url");
    if (url && !result.some((e) => e.url === url)) {
      result.push({ url, type: "image/thumbnail" });
    }
  }

  return result;
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
    const authorRaw = extractText(itemXml, "author") || extractTextNS(itemXml, "dc:creator");
    const author = authorRaw ? authorRaw.replace(/^[^@]+@[^\s]+\s*\(?/, "").replace(/\)$/, "").trim() : undefined;
    const contentEncoded = extractTextNS(itemXml, "content:encoded");

    return {
      title: extractText(itemXml, "title"),
      url: extractText(itemXml, "link"),
      description: stripHtml(extractText(itemXml, "description")).slice(0, 280),
      publishedAt: pubDate ? new Date(pubDate).toISOString() : undefined,
      author: author || undefined,
      categories: extractElements(itemXml, "category").map((el) =>
        el.replace(/<[^>]+>/g, "").trim(),
      ),
      contentHtml: contentEncoded || undefined,
      guid: guidMatch ? guidMatch[1].trim() : undefined,
      feedTitle,
      enclosures: extractRssEnclosures(itemXml),
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

    // Prefer rel="alternate" link, fall back to any link with href
    const altLinkMatch = entryXml.match(
      /<link\b[^>]*rel\s*=\s*["']alternate["'][^>]*href\s*=\s*["']([^"']+)["'][^>]*\/?>/i,
    );
    const anyLinkMatch = entryXml.match(
      /<link\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*\/?>/i,
    );
    const linkHref = altLinkMatch ? altLinkMatch[1] : anyLinkMatch ? anyLinkMatch[1] : "";

    // Content element for full HTML
    const contentMatch = entryXml.match(/<content\b[^>]*>([\s\S]*?)<\/content>/i);
    const contentHtml = contentMatch ? contentMatch[1]
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'") : undefined;

    // Extract Atom <link rel="enclosure">
    const enclosureLinks: ParsedEnclosure[] = [];
    const enclosurePattern = /<link\b[^>]*rel\s*=\s*["']enclosure["'][^>]*\/?>/gi;
    let encMatch;
    while ((encMatch = enclosurePattern.exec(entryXml)) !== null) {
      const encUrl = extractAttr(encMatch[0], "href");
      if (encUrl) {
        enclosureLinks.push({
          url: encUrl,
          type: extractAttr(encMatch[0], "type") || undefined,
          length: parseInt(extractAttr(encMatch[0], "length") || "0", 10) || undefined,
        });
      }
    }

    return {
      title: stripHtml(extractText(entryXml, "title")),
      url: linkHref,
      description: stripHtml(
        extractText(entryXml, "summary") || extractText(entryXml, "content"),
      ).slice(0, 280),
      publishedAt: published
        ? new Date(published).toISOString()
        : undefined,
      updatedAt: updated ? new Date(updated).toISOString() : undefined,
      author: extractText(entryXml, "name") || undefined,
      categories: extractAllAttributes(entryXml, "category", "term"),
      contentHtml,
      guid: idMatch ? idMatch[1].trim() : undefined,
      feedTitle,
      enclosures: enclosureLinks,
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

// ── RDF / RSS 1.0 Parser ────────────────────────────────────────────────────

function parseRdf(xml: string): FeedResponse {
  const channelMatch = xml.match(/<channel\b[^>]*>([\s\S]*?)<\/channel>/i);
  const feedTitle = channelMatch ? extractText(channelMatch[0], "title") : extractText(xml, "title");
  const feedDesc = channelMatch ? extractText(channelMatch[0], "description") : "";
  const feedLink = channelMatch ? extractText(channelMatch[0], "link") : "";

  const itemXmls = extractElements(xml, "item");

  const items: ParsedFeedItem[] = itemXmls.map((itemXml) => {
    const authorRaw = extractText(itemXml, "author") || extractTextNS(itemXml, "dc:creator");
    const author = authorRaw ? authorRaw.replace(/^[^@]+@[^\s]+\s*\(?/, "").replace(/\)$/, "").trim() : undefined;
    const pubDate = extractText(itemXml, "dc:date") || extractText(itemXml, "pubDate");
    const contentEncoded = extractTextNS(itemXml, "content:encoded");
    const rdfAbout = extractAttr(itemXml, "rdf:about");

    return {
      title: extractText(itemXml, "title"),
      url: extractText(itemXml, "link") || "",
      description: stripHtml(extractText(itemXml, "description")).slice(0, 280),
      publishedAt: pubDate ? new Date(pubDate).toISOString() : undefined,
      author: author || undefined,
      categories: extractElements(itemXml, "dc:subject").map((el) =>
        el.replace(/<[^>]+>/g, "").trim(),
      ),
      contentHtml: contentEncoded || undefined,
      guid: rdfAbout || undefined,
      feedTitle,
      enclosures: extractRssEnclosures(itemXml),
    };
  });

  return {
    success: true,
    meta: {
      title: feedTitle,
      description: feedDesc,
      link: feedLink,
      itemCount: items.length,
    },
    items,
  };
}

// ── Main Handler ────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // CORS headers for browser access.
  // The origin is reflected from the request so credentialed requests
  // (which carry an Authorization header) are not blocked. Wildcard ("*")
  // is incompatible with credentialed fetches.
  const origin = req.headers.get("Origin") ?? "*";

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
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
    if (/<rdf:RDF\b/i.test(xml)) {
      result = parseRdf(xml);
    } else if (/<rss\b/i.test(xml)) {
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
