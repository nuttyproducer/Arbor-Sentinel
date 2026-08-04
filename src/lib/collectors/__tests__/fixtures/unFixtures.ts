/**
 * Standardized test fixtures for UN collectors (OHCHR, OCHA).
 * Types match RawUNDocument from UNNormalizer.
 * All data is synthetic — no actual copyrighted content.
 */

import type { RawUNDocument } from "../../un/UNNormalizer";

// ── Normal responses ──────────────────────────────────────────────────────────

export const validOHCHRDocument: RawUNDocument = {
  url: "https://www.ohchr.org/en/press-releases/2026/07/test-human-rights-situation",
  title: "UN Expert Calls for Investigation into Human Rights Situation in Test Region",
  issuingBody: "Office of the High Commissioner for Human Rights",
  documentSymbol: "A/HRC/99/999",
  session: "99th session",
  agendaItem: "Human rights situations that require the Council's attention",
  reportType: "press_release",
  geographicScope: ["Test Region"],
  date: "2026-07-15",
  bodyText:
    "A UN human rights expert today called for an independent investigation into " +
    "alleged violations of international humanitarian law in Test Region. " +
    "The expert expressed concern over reports of civilian casualties and " +
    "called on all parties to respect their obligations under international law.",
  summaryText: "UN expert calls for investigation into human rights violations in Test Region.",
  language: "en",
};

export const validOCHADocument: RawUNDocument = {
  url: "https://www.unocha.org/publications/report/2026/test-humanitarian-update",
  title: "Test Region: Humanitarian Update — August 2026",
  issuingBody: "UN Office for the Coordination of Humanitarian Affairs",
  documentSymbol: undefined,
  reportType: "humanitarian_update",
  geographicScope: ["Test Region", "Neighboring Region"],
  date: "2026-08-01",
  bodyText:
    "The humanitarian situation in Test Region continues to deteriorate. " +
    "An estimated 500,000 people have been displaced since January 2026. " +
    "Access to food, water, and medical care remains severely limited.",
  summaryText: "500,000 displaced in Test Region. Humanitarian access severely limited.",
  language: "en",
};

export const validCOIDocument: RawUNDocument = {
  url: "https://www.ohchr.org/en/hr-bodies/hrc/coi-test-region/report",
  title: "Report of the Commission of Inquiry on Test Region",
  issuingBody: "Commission of Inquiry on Test Region",
  documentSymbol: "A/HRC/99/COI/1",
  session: "99th session",
  agendaItem: "4",
  reportType: "coi_report",
  geographicScope: ["Test Region"],
  date: "2026-06-30",
  bodyText:
    "The Commission of Inquiry finds reasonable grounds to believe that serious " +
    "violations of international humanitarian law and international human rights law " +
    "have been committed in Test Region between January and June 2026.",
  summaryText: "COI finds reasonable grounds of serious IHL and IHRL violations in Test Region.",
  language: "en",
};

// ── Empty / minimal responses ─────────────────────────────────────────────────

export const emptyUNDocument: RawUNDocument = {
  url: "https://www.ohchr.org/en/empty-test",
  title: "",
  issuingBody: "OHCHR",
  reportType: "press_release",
  geographicScope: [],
  date: undefined,
  bodyText: "",
  language: "en",
};

export const minimalUNDocument: RawUNDocument = {
  url: "https://www.ohchr.org/en/minimal-test",
  title: "Brief Statement",
  issuingBody: "OHCHR",
  reportType: "hc_statement",
  geographicScope: [],
  date: "2026-07-01",
  bodyText: "Statement issued.",
  language: "en",
};

// ── Malformed documents ───────────────────────────────────────────────────────

export const malformedUNDocument: RawUNDocument = {
  url: "",
  title: "",
  issuingBody: "",
  reportType: "press_release",
  geographicScope: [],
  date: undefined,
  bodyText: "",
  language: "en",
};

export const missingBodyText: RawUNDocument = {
  url: "https://www.ohchr.org/en/missing-body",
  title: "Document With No Body Text",
  issuingBody: "OHCHR",
  documentSymbol: "A/HRC/99/NB",
  reportType: "press_release",
  geographicScope: ["Test Region"],
  date: "2026-07-15",
  bodyText: "",
  summaryText: "A summary exists but no body text.",
  language: "en",
};

// ── Normalization variants ────────────────────────────────────────────────────

export const normalizationVariants: RawUNDocument[] = [
  validOHCHRDocument,
  validOCHADocument,
  validCOIDocument,
  // French language document
  {
    url: "https://www.ohchr.org/fr/test-fr",
    title: "Rapport sur la situation des droits humains — Région Test",
    issuingBody: "Haut-Commissariat des Nations Unies aux droits de l'homme",
    documentSymbol: "A/HRC/99/FR/1",
    reportType: "coi_report",
    geographicScope: ["Région Test"],
    date: "2026-06-15",
    bodyText: "Le rapport documente les violations présumées du droit international humanitaire.",
    summaryText: "Violations documentées du droit international humanitaire dans la région Test.",
    language: "fr",
  },
  // No date
  {
    url: "https://www.ohchr.org/en/no-date-report",
    title: "Human Rights Situation Overview — No Date",
    issuingBody: "OHCHR",
    reportType: "situation_report",
    geographicScope: ["Global"],
    bodyText: "Overview of human rights situations requiring attention.",
    language: "en",
  },
  // Multi-region
  {
    url: "https://www.unocha.org/multi-region",
    title: "Multi-Region Humanitarian Snapshot",
    issuingBody: "OCHA",
    reportType: "humanitarian_update",
    geographicScope: ["Region A", "Region B", "Region C"],
    date: "2026-07-01",
    bodyText: "Humanitarian overview across three regions.",
    language: "en",
  },
];

// ── Error simulation fixtures ─────────────────────────────────────────────────

export interface UNFetchErrorFixture {
  status: number;
  statusText: string;
}

export const notFoundError: UNFetchErrorFixture = {
  status: 404,
  statusText: "Not Found",
};

export const serverError: UNFetchErrorFixture = {
  status: 500,
  statusText: "Internal Server Error",
};

export const rateLimitedError: UNFetchErrorFixture = {
  status: 429,
  statusText: "Too Many Requests",
};

// ── RSS/feed fixture for OCHA ─────────────────────────────────────────────────

export const ochaRssFixture = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>OCHA — Latest Updates</title>
    <link>https://www.unocha.org</link>
    <description>UN Office for the Coordination of Humanitarian Affairs</description>
    <item>
      <title>Test Region Humanitarian Update #1</title>
      <link>https://www.unocha.org/publications/test-1</link>
      <description>Humanitarian update from Test Region covering displacement and food security.</description>
      <pubDate>Mon, 01 Aug 2026 00:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Emergency Funding Appeal — Test Region</title>
      <link>https://www.unocha.org/publications/test-2</link>
      <description>OCHA appeals for emergency funding for Test Region operations.</description>
      <pubDate>Wed, 15 Jul 2026 00:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

export const ochaEmptyRssFixture = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>OCHA — Latest Updates</title>
    <link>https://www.unocha.org</link>
    <description>UN Office for the Coordination of Humanitarian Affairs</description>
  </channel>
</rss>`;
