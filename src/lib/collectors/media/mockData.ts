// ── Journalism Mock Data ──────────────────────────────────────────────────

export const mockRssItem = {
  title: "UN Security Council votes on Gaza resolution",
  url: "https://www.reuters.com/world/unsc-gaza-resolution-2026-08-01/",
  description: "The UN Security Council voted today on a resolution concerning the humanitarian situation in Gaza.",
  publishedAt: "2026-08-01T09:30:00.000Z",
  author: "Jane Smith",
  categories: ["World", "United Nations"],
  guid: "https://www.reuters.com/world/unsc-gaza-resolution-2026-08-01/",
  feedTitle: "Reuters World News",
  language: "en",
};

export const mockAtomItem = {
  title: "ICJ issues new order in genocide case",
  url: "https://apnews.com/article/icj-order-genocide-2026",
  description: "The International Court of Justice issued a new procedural order today.",
  publishedAt: "2026-08-01T08:00:00.000Z",
  updatedAt: "2026-08-01T09:00:00.000Z",
  author: "John Doe",
  categories: ["Law", "International"],
  guid: "urn:uuid:12345678-1234-5678-1234-567812345678",
  contentHtml: "<div>Full article content here.</div>",
  feedTitle: "AP International",
};

export const mockDuplicateRssItem = {
  title: "UN Security Council votes on Gaza resolution",
  url: "https://www.reuters.com/world/unsc-gaza-resolution-2026-08-01/",
  description: "Different feed, same article about the UNSC vote on Gaza.",
  publishedAt: "2026-08-01T09:30:00.000Z",
  author: "Reuters Staff",
  categories: ["Middle East"],
  guid: "https://www.reuters.com/world/unsc-gaza-resolution-2026-08-01/",
  feedTitle: "Reuters Middle East",
};

// ── CrossRef Mock ─────────────────────────────────────────────────────────

export const mockCrossRefResponse = {
  status: "ok",
  message: {
    title: ["International Humanitarian Law and Armed Conflict: A Review of State Practice"],
    author: [
      { given: "Sarah", family: "Johnson" },
      { given: "Michael", family: "Chen" },
    ],
    "container-title": ["Harvard International Law Journal"],
    volume: "45",
    issue: "2",
    published: { "date-parts": [[2026, 6, 15]] },
    abstract: "A comprehensive review of state practice in international humanitarian law compliance across 15 armed conflicts.",
    DOI: "10.1234/hilj.2026.001",
  },
};

// ── Unpaywall Mock ────────────────────────────────────────────────────────

export const mockUnpaywallResponse = {
  doi: "10.1234/hilj.2026.001",
  best_oa_location: {
    url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=123456",
    url_for_pdf: "https://papers.ssrn.com/sol3/Delivery.cfm/SSRN_ID123456.pdf",
    version: "submittedVersion",
    license: "cc-by-nc-nd",
  },
  oa_status: "green",
};
