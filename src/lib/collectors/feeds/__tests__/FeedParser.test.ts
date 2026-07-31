import { describe, it, expect } from "vitest";
import { FeedParser } from "../FeedParser";
import {
  rss2FullFeed,
  rss2MinimalFeed,
  atomFullFeed,
  atomMinimalFeed,
  malformedXml,
  emptyRssFeed,
  rssWithCdata,
  atomWithHtmlTitle,
} from "../mockData";

describe("FeedParser", () => {
  let parser: FeedParser;

  beforeEach(() => {
    parser = new FeedParser();
  });

  describe("detectFormat", () => {
    it("detects RSS 2.0 format", () => {
      expect(parser.detectFormat(rss2FullFeed)).toBe("rss2");
    });

    it("detects Atom 1.0 format", () => {
      expect(parser.detectFormat(atomFullFeed)).toBe("atom1");
    });

    it("returns unknown for non-feed XML", () => {
      expect(parser.detectFormat("<html><body>Not a feed</body></html>")).toBe("unknown");
    });
  });

  describe("parse RSS 2.0", () => {
    it("parses a full RSS 2.0 feed with all optional fields", () => {
      const result = parser.parse(rss2FullFeed);

      expect(result.meta.title).toBe("Reuters World News");
      expect(result.meta.description).toBe("Reuters world news feed");
      expect(result.meta.link).toBe("https://www.reuters.com/world");
      expect(result.meta.language).toBe("en");
      expect(result.meta.lastBuildDate).toBe("Mon, 01 Aug 2026 10:00:00 GMT");
      expect(result.meta.itemCount).toBe(1);

      expect(result.items).toHaveLength(1);
      const item = result.items[0];
      expect(item.title).toBe("UN Security Council votes on Gaza resolution");
      expect(item.url).toBe("https://www.reuters.com/world/unsc-gaza-resolution-2026-08-01/");
      expect(item.description).toBe("The UN Security Council voted today on a resolution concerning the humanitarian situation in Gaza.");
      expect(item.publishedAt).toBe("2026-08-01T09:30:00.000Z");
      expect(item.author).toBe("Jane Smith");
      expect(item.categories).toEqual(["World", "United Nations"]);
      expect(item.guid).toBe("https://www.reuters.com/world/unsc-gaza-resolution-2026-08-01/");
      expect(item.feedTitle).toBe("Reuters World News");
    });

    it("parses RSS 2.0 with minimal optional fields", () => {
      const result = parser.parse(rss2MinimalFeed);

      expect(result.meta.title).toBe("Minimal Feed");
      expect(result.items).toHaveLength(1);
      const item = result.items[0];
      expect(item.title).toBe("Minimal Item");
      expect(item.url).toBe("https://example.com/item-1");
      expect(item.description).toBe("Minimal description");
      expect(item.author).toBeUndefined();
      expect(item.categories).toEqual([]);
      expect(item.publishedAt).toBeUndefined();
      expect(item.guid).toBeUndefined();
    });

    it("handles CDATA sections in title and description", () => {
      const result = parser.parse(rssWithCdata);

      const item = result.items[0];
      expect(item.title).toBe("Report: Findings on <illegal> actions");
      expect(item.description).toBe("This description has HTML that should be stripped.");
    });
  });

  describe("parse Atom 1.0", () => {
    it("parses a full Atom 1.0 feed with all optional fields", () => {
      const result = parser.parse(atomFullFeed);

      expect(result.meta.title).toBe("AP International");
      expect(result.meta.link).toBe("https://apnews.com/international");
      expect(result.meta.itemCount).toBe(1);

      expect(result.items).toHaveLength(1);
      const item = result.items[0];
      expect(item.title).toBe("ICJ issues new order in genocide case");
      expect(item.url).toBe("https://apnews.com/article/icj-order-genocide-2026");
      expect(item.publishedAt).toBe("2026-08-01T08:00:00.000Z");
      expect(item.updatedAt).toBe("2026-08-01T09:00:00.000Z");
      expect(item.author).toBe("John Doe");
      expect(item.description).toBe("The International Court of Justice issued a new procedural order today.");
      expect(item.categories).toEqual(["Law", "International"]);
      expect(item.guid).toBe("urn:uuid:12345678-1234-5678-1234-567812345678");
      expect(item.contentHtml).toBe("<div>Full article content here.</div>");
      expect(item.feedTitle).toBe("AP International");
    });

    it("parses Atom 1.0 with minimal optional fields", () => {
      const result = parser.parse(atomMinimalFeed);

      expect(result.meta.title).toBe("Minimal Atom");
      expect(result.items).toHaveLength(1);
      const item = result.items[0];
      expect(item.title).toBe("Single Entry");
      expect(item.url).toBe("https://example.com/entry-1");
      expect(item.guid).toBe("urn:uuid:00000000-0000-0000-0000-000000000001");
      expect(item.description).toBe("");
      expect(item.author).toBeUndefined();
      expect(item.publishedAt).toBeUndefined();
      expect(item.categories).toEqual([]);
    });

    it("strips HTML from type=html title elements", () => {
      const result = parser.parse(atomWithHtmlTitle);

      const item = result.items[0];
      expect(item.title).toBe("Breaking: Major development in case");
    });
  });

  describe("error handling", () => {
    it("throws ParseError for malformed XML", () => {
      expect(() => parser.parse(malformedXml)).toThrow();
    });

    it("returns empty items array for feed with no items", () => {
      const result = parser.parse(emptyRssFeed);

      expect(result.meta.title).toBe("Empty Feed");
      expect(result.items).toHaveLength(0);
      expect(result.meta.itemCount).toBe(0);
    });
  });
});
