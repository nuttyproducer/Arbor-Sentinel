import type { RawGovernmentDocument } from "./GovernmentNormalizer";

export const euCouncilConclusion: RawGovernmentDocument = {
  url: "https://www.consilium.europa.eu/en/press/press-releases/2024/03/18/council-conclusions-middle-east/",
  title: "Council Conclusions on the Middle East — 18 March 2024",
  institution: "Council of the European Union",
  documentReference: "COM(2024) 123",
  legalBasis: ["Article 29 TEU", "Article 215 TFEU"],
  governmentLevel: "eu",
  documentType: "council_conclusion",
  date: "2024-03-18",
  bodyText: "The Council adopted conclusions on the Middle East, reaffirming the EU's commitment to a two-state solution and calling for an immediate humanitarian pause. The Council expressed grave concern about the catastrophic humanitarian situation in Gaza and called for full, rapid, safe, and unhindered humanitarian access.",
  summaryText: "EU Council conclusions on the Middle East calling for humanitarian pause and two-state solution.",
  language: "en",
  isAdopted: true,
};

export const euParliamentResolution: RawGovernmentDocument = {
  url: "https://www.europarl.europa.eu/doceo/document/TA-9-2024-0150_EN.html",
  title: "European Parliament resolution on the humanitarian situation in Gaza (2024/2508(RSP))",
  institution: "European Parliament",
  documentReference: "P9_TA(2024)0150",
  legalBasis: ["Article 144 of the Rules of Procedure"],
  voteTally: { for: 338, against: 85, abstain: 38 },
  governmentLevel: "eu",
  documentType: "parliament_resolution",
  date: "2024-02-29",
  bodyText: "The European Parliament adopted a resolution on the humanitarian situation in Gaza. Parliament called for an immediate and permanent ceasefire and for the EU to review its Association Agreement with Israel. The resolution expressed deep concern about the high number of civilian casualties and the destruction of civilian infrastructure.",
  summaryText: "EP resolution calling for immediate ceasefire and review of EU-Israel Association Agreement.",
  language: "en",
  isAdopted: true,
};

export const belgiumFpsPressRelease: RawGovernmentDocument = {
  url: "https://diplomatie.belgium.be/en/news/press-release-belgium-calls-humanitarian-access-gaza",
  title: "Belgium calls for unhindered humanitarian access to Gaza",
  institution: "FPS Foreign Affairs",
  governmentLevel: "federal",
  documentType: "press_release",
  date: "2024-02-16",
  bodyText: "Belgium calls on all parties to allow full, rapid, safe and unhindered humanitarian access to Gaza. The Minister of Foreign Affairs expressed deep concern about the humanitarian situation and called for respect of international humanitarian law.",
  summaryText: "Belgium FPS Foreign Affairs press release calling for humanitarian access to Gaza.",
  language: "en",
  isAdopted: true,
};

export const belgiumParliamentaryQuestion: RawGovernmentDocument = {
  url: "https://www.lachambre.be/kvvcr/showpage.cfm?section=qrva&language=nl&cfm=qrvaXml.cfm?legislat=56&dossierID=55-K55-2023202401234",
  title: "Schriftelijke vraag — Humanitaire toegang tot Gaza (Written question — Humanitarian access to Gaza)",
  institution: "Chamber of Representatives",
  governmentLevel: "federal",
  documentType: "parliamentary_question",
  date: "2024-02-20",
  bodyText: "Vraag van mevrouw de Volksvertegenwoordiger over de humanitaire toegang tot Gaza aan de Minister van Buitenlandse Zaken. Question de Madame la Députée concernant l'accès humanitaire à Gaza à la Ministre des Affaires étrangères.",
  language: "nl",
  isAdopted: true,
};

export const euCouncilHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Council Conclusions on the Middle East — 18 March 2024 — Consilium</title>
  <meta name="description" content="EU Council conclusions on the Middle East" />
  <meta property="article:published_time" content="2024-03-18" />
</head>
<body>
  <main><article>
    <h1>Council Conclusions on the Middle East</h1>
    <p>The Council adopted conclusions calling for an immediate humanitarian pause. 338 votes in favour, 85 against, and 38 abstained.</p>
    <p>Based on Article 29 TEU and Article 215 TFEU, the Council reaffirmed its commitment.</p>
  </article></main>
</body>
</html>`;
