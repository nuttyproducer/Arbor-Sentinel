import type { RawUNDocument } from "./UNNormalizer";

export const ohchrCoiReport: RawUNDocument = {
  url: "https://www.ohchr.org/en/documents/reports/ahrc5528-report-independent-international-commission-inquiry-occupied",
  title: "Report of the Independent International Commission of Inquiry on the Occupied Palestinian Territory, including East Jerusalem, and Israel (A/HRC/55/28)",
  issuingBody: "Commission of Inquiry",
  documentSymbol: "A/HRC/55/28",
  session: "55th session of the Human Rights Council",
  agendaItem: "Item 7 — Human rights situation in Palestine and other occupied Arab territories",
  reportType: "coi_report",
  geographicScope: ["Palestine", "Israel"],
  date: "2024-03-18",
  bodyText: "The Independent International Commission of Inquiry on the Occupied Palestinian Territory, including East Jerusalem, and Israel, submits its report to the Human Rights Council. The Commission found reasonable grounds to believe that parties to the conflict have committed serious violations of international humanitarian law and international human rights law. The report documents attacks on civilians, destruction of civilian infrastructure, and denial of humanitarian access.",
  summaryText: "COI report documenting serious violations of international humanitarian law and human rights law in the Occupied Palestinian Territory and Israel.",
  language: "en",
};

export const ohchrHrcResolution: RawUNDocument = {
  url: "https://www.ohchr.org/en/hr-bodies/hrc/regular-sessions/session55/resolutions",
  title: "Human Rights Council Resolution 55/2 — Human rights situation in the Occupied Palestinian Territory, including East Jerusalem",
  issuingBody: "Human Rights Council",
  documentSymbol: "A/HRC/RES/55/2",
  session: "55th session",
  reportType: "hrc_resolution",
  geographicScope: ["Palestine"],
  date: "2024-04-05",
  bodyText: "The Human Rights Council adopted resolution 55/2 on the human rights situation in the Occupied Palestinian Territory including East Jerusalem. The resolution calls for an immediate ceasefire, unhindered humanitarian access, and accountability for violations of international law.",
  summaryText: "HRC resolution calling for ceasefire, humanitarian access, and accountability for violations of international law.",
  language: "en",
};

export const ochaSituationReport: RawUNDocument = {
  url: "https://www.ochaopt.org/content/humanitarian-situation-update-180-gaza-strip",
  title: "Humanitarian Situation Update #180 — Gaza Strip",
  issuingBody: "OCHA",
  reportType: "situation_report",
  geographicScope: ["Gaza"],
  date: "2024-07-12",
  bodyText: "Key highlights: Hostilities continue across the Gaza Strip resulting in further civilian casualties and displacement. Access constraints continue to impede humanitarian operations. Food security remains critical with the entire population facing crisis-level food insecurity or worse.",
  summaryText: "OCHA situation report on the humanitarian situation in Gaza — hostilities, displacement, access constraints, food insecurity.",
  language: "en",
};

export const ochaFlashAppeal: RawUNDocument = {
  url: "https://www.ochaopt.org/content/flash-appeal-2024-occupied-palestinian-territory",
  title: "Flash Appeal 2024 — Occupied Palestinian Territory",
  issuingBody: "OCHA",
  reportType: "flash_appeal",
  geographicScope: ["Gaza", "West Bank"],
  date: "2024-04-17",
  bodyText: "The 2024 Flash Appeal requests $2.8 billion to meet the most critical humanitarian needs of 3 million people in Gaza and the West Bank. Priorities include food, water, shelter, health, protection, and education.",
  summaryText: "$2.8 billion flash appeal for 3 million people in Gaza and West Bank — food, water, shelter, health, protection priorities.",
  language: "en",
};

export const ochaRssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>OCHA Occupied Palestinian Territory</title>
  <link>https://www.ochaopt.org</link>
  <description>Humanitarian updates from the Occupied Palestinian Territory</description>
  <item>
    <title><![CDATA[Humanitarian Situation Update #180 — Gaza Strip]]></title>
    <link>https://www.ochaopt.org/content/humanitarian-situation-update-180-gaza-strip</link>
    <description><![CDATA[Hostilities continue across the Gaza Strip. Access constraints impede humanitarian operations. Food security remains critical.]]></description>
    <pubDate>Sat, 13 Jul 2024 00:00:00 GMT</pubDate>
  </item>
  <item>
    <title><![CDATA[Hostilities in the Gaza Strip and Israel — Flash Update #85]]></title>
    <link>https://www.ochaopt.org/content/hostilities-gaza-strip-and-israel-flash-update-85</link>
    <description><![CDATA[Intense Israeli bombardments from air, land, and sea continued across much of the Gaza Strip.]]></description>
    <pubDate>Fri, 12 Jul 2024 00:00:00 GMT</pubDate>
  </item>
</channel>
</rss>`;

export const ohchrCoiHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Report of the Independent International Commission of Inquiry (A/HRC/55/28) | OHCHR</title>
  <meta name="description" content="COI report on the Occupied Palestinian Territory" />
  <meta property="article:published_time" content="2024-03-18" />
</head>
<body>
  <main><article>
    <h1>Report of the Commission of Inquiry on the Occupied Palestinian Territory</h1>
    <p>The Commission found reasonable grounds to believe that parties to the conflict have committed serious violations of international humanitarian law.</p>
  </article></main>
</body>
</html>`;
