// ── RSS 2.0 Mock ──────────────────────────────────────────────────────────

export const rss2FullFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Reuters World News</title>
    <link>https://www.reuters.com/world</link>
    <description>Reuters world news feed</description>
    <language>en</language>
    <lastBuildDate>Mon, 01 Aug 2026 10:00:00 GMT</lastBuildDate>
    <item>
      <title><![CDATA[UN Security Council votes on Gaza resolution]]></title>
      <link>https://www.reuters.com/world/unsc-gaza-resolution-2026-08-01/</link>
      <description><![CDATA[The UN Security Council voted today on a resolution concerning the humanitarian situation in Gaza.]]></description>
      <pubDate>Mon, 01 Aug 2026 09:30:00 GMT</pubDate>
      <author>reuters@reuters.com (Jane Smith)</author>
      <category>World</category>
      <category>United Nations</category>
      <guid isPermaLink="true">https://www.reuters.com/world/unsc-gaza-resolution-2026-08-01/</guid>
    </item>
  </channel>
</rss>`;

export const rss2MinimalFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Minimal Feed</title>
    <link>https://example.com</link>
    <description>Feed with minimal optional fields</description>
    <item>
      <title>Minimal Item</title>
      <link>https://example.com/item-1</link>
      <description>Minimal description</description>
    </item>
  </channel>
</rss>`;

// ── Atom 1.0 Mock ─────────────────────────────────────────────────────────

export const atomFullFeed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>AP International</title>
  <link href="https://apnews.com/international" rel="alternate"/>
  <id>https://apnews.com/feed/international</id>
  <updated>2026-08-01T10:00:00Z</updated>
  <entry>
    <title type="html">&lt;strong&gt;ICJ&lt;/strong&gt; issues new order in genocide case</title>
    <link href="https://apnews.com/article/icj-order-genocide-2026" rel="alternate"/>
    <id>urn:uuid:12345678-1234-5678-1234-567812345678</id>
    <published>2026-08-01T08:00:00Z</published>
    <updated>2026-08-01T09:00:00Z</updated>
    <author>
      <name>John Doe</name>
    </author>
    <summary type="html">&lt;p&gt;The International Court of Justice issued a new procedural order today.&lt;/p&gt;</summary>
    <category term="Law"/>
    <category term="International"/>
    <content type="html">&lt;div&gt;Full article content here.&lt;/div&gt;</content>
  </entry>
</feed>`;

export const atomMinimalFeed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Minimal Atom</title>
  <id>https://example.com/feed</id>
  <entry>
    <title>Single Entry</title>
    <link href="https://example.com/entry-1" rel="alternate"/>
    <id>urn:uuid:00000000-0000-0000-0000-000000000001</id>
  </entry>
</feed>`;

// ── Edge Cases ────────────────────────────────────────────────────────────

export const malformedXml = `<rss version="2.0">
  <channel>
    <title>Broken Feed</title>
    <item>
      <title>Unclosed tag
    </item>
  </channel>
</rss>`;

export const emptyRssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Empty Feed</title>
    <link>https://example.com</link>
    <description>Feed with no items</description>
  </channel>
</rss>`;

export const rssWithCdata = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>CDATA Feed</title>
    <link>https://example.com</link>
    <description>Testing CDATA</description>
    <item>
      <title><![CDATA[Report: Findings on <illegal> actions]]></title>
      <link>https://example.com/cdata-item</link>
      <description><![CDATA[<p>This description has <strong>HTML</strong> that should be stripped.</p>]]></description>
      <pubDate>Fri, 01 Aug 2026 12:00:00 GMT</pubDate>
      <guid>cdata-guid-001</guid>
    </item>
  </channel>
</rss>`;

export const atomWithHtmlTitle = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>HTML Title Feed</title>
  <id>https://example.com/feed-html</id>
  <entry>
    <title type="html">&lt;em&gt;Breaking:&lt;/em&gt; Major development in case</title>
    <link href="https://example.com/html-title" rel="alternate"/>
    <id>urn:uuid:11111111-1111-1111-1111-111111111111</id>
    <published>2026-08-01T12:00:00Z</published>
  </entry>
</feed>`;
