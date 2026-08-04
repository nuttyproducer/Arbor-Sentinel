/**
 * Standardized test fixtures for court collectors (ICJ, ICC).
 *
 * Each fixture set covers: normal, empty, error, malformed, rate-limited responses.
 * No actual copyrighted content — all data is synthetic.
 */

import type { RawCourtDocument } from "../../courts/LegalNormalizer";

// ── Normal response ───────────────────────────────────────────────────────────

export const validCourtDocument: RawCourtDocument = {
  url: "https://www.icj-cij.org/node/200001",
  title: "Order on Provisional Measures in Case Concerning Test Alpha v. Test Beta",
  court: "ICJ",
  caseName: "Test Alpha v. Test Beta",
  caseNumber: "ICJ Case No. 999",
  parties: ["Test Alpha", "Test Beta"],
  documentType: "order",
  date: "2026-06-15",
  bodyText:
    "The Court finds that provisional measures are warranted in this case. " +
    "The respondent shall take all measures to prevent irreparable harm pending final judgment. " +
    "Both parties shall report to the Court within 90 days on compliance with this Order.",
  summaryText: "Provisional measures ordered, compliance reporting required within 90 days.",
  keyRulings: [
    "The respondent shall take all measures to prevent irreparable harm.",
    "Both parties shall report within 90 days on compliance.",
  ],
  legalBasis: [
    "Statute of the International Court of Justice — Article 41",
    "Genocide Convention — Article IX",
  ],
  nextSteps: ["Compliance report due within 90 days.", "Oral hearings scheduled for October 2026."],
  language: "en",
};

export const validCourtDocumentAlt: RawCourtDocument = {
  url: "https://www.icc-cpi.int/case/999/document/001",
  title: "Decision on the Prosecutor's Request for an Arrest Warrant — Situation in Test Region",
  court: "ICC",
  caseName: "Prosecutor v. Test Defendant",
  caseNumber: "ICC-01/99",
  parties: ["Prosecutor", "Test Defendant"],
  documentType: "arrest_warrant",
  date: "2026-07-01",
  bodyText:
    "Pre-Trial Chamber I hereby issues a warrant of arrest for Test Defendant. " +
    "There are reasonable grounds to believe the suspect committed crimes against humanity " +
    "including widespread and systematic attacks against civilian populations in Test Region.",
  summaryText: "Arrest warrant issued for Test Defendant on charges of crimes against humanity.",
  keyRulings: [
    "Arrest warrant issued for Test Defendant.",
    "Reasonable grounds found for crimes against humanity charges.",
  ],
  legalBasis: ["Rome Statute — Article 7", "Rome Statute — Article 58"],
  nextSteps: ["Arrest warrant transmitted to States Parties.", "Registry to notify victims."],
  language: "en",
};

// ── Empty / minimal responses ─────────────────────────────────────────────────

export const emptyCourtDocument: RawCourtDocument = {
  url: "https://www.icj-cij.org/node/200002",
  title: "",
  court: "ICJ",
  caseName: undefined,
  caseNumber: undefined,
  parties: [],
  documentType: "press_release",
  date: undefined,
  bodyText: "",
  summaryText: undefined,
  keyRulings: [],
  legalBasis: [],
  nextSteps: [],
  language: "en",
};

export const minimalCourtDocument: RawCourtDocument = {
  url: "https://www.icj-cij.org/node/200003",
  title: "Minimal Document",
  court: "ICJ",
  caseName: undefined,
  caseNumber: undefined,
  parties: [],
  documentType: "press_release",
  date: "2026-01-01",
  bodyText: "Short press release with minimal content.",
  summaryText: undefined,
  keyRulings: [],
  legalBasis: [],
  nextSteps: [],
  language: "en",
};

// ── Malformed / missing field responses ───────────────────────────────────────

export const malformedCourtDocument: RawCourtDocument = {
  url: "",
  title: "",
  court: "ICJ",
  caseName: undefined,
  caseNumber: undefined,
  parties: [],
  documentType: "press_release",
  date: undefined,
  bodyText: "",
  summaryText: undefined,
  keyRulings: [],
  legalBasis: [],
  nextSteps: [],
  language: "en",
};

export const missingTitleOnly: RawCourtDocument = {
  url: "https://www.icj-cij.org/node/200004",
  title: "  ",
  court: "ICJ",
  caseName: "Test Case",
  caseNumber: "ICJ-99",
  parties: ["Alpha"],
  documentType: "judgment",
  date: "2026-02-15",
  bodyText: "Judgment text with no valid title.",
  summaryText: "Summary text.",
  keyRulings: ["Ruling one."],
  legalBasis: ["Statute"],
  nextSteps: [],
  language: "en",
};

// ── Error simulation fixtures ─────────────────────────────────────────────────

export interface CourtFetchErrorFixture {
  status: number;
  statusText: string;
  body: string;
}

export const notFoundError: CourtFetchErrorFixture = {
  status: 404,
  statusText: "Not Found",
  body: "<html><body><h1>404 - Page Not Found</h1></body></html>",
};

export const serverError: CourtFetchErrorFixture = {
  status: 503,
  statusText: "Service Unavailable",
  body: "<html><body><h1>503 - Service Temporarily Unavailable</h1><p>Please try again later.</p></body></html>",
};

export const rateLimitedError: CourtFetchErrorFixture = {
  status: 429,
  statusText: "Too Many Requests",
  body: '<html><body><h1>429 - Too Many Requests</h1><p>Rate limit exceeded.</p></body></html>',
};

export const timeoutError: CourtFetchErrorFixture = {
  status: 0,
  statusText: "Timeout",
  body: "",
};

// ── HTML fixture for HTML-parsing collectors (ICJ) ────────────────────────────

export const icjHtmlFixture = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Order of 15 June 2026 — Test Alpha v. Test Beta | International Court of Justice</title>
  <meta name="description" content="Provisional measures ordered in the case concerning Test Alpha v. Test Beta.">
  <meta property="article:published_time" content="2026-06-15">
</head>
<body>
  <main>
    <h1>Order of 15 June 2026</h1>
    <article>
      <p>The International Court of Justice today delivered its Order on provisional measures in the case concerning Test Alpha v. Test Beta.</p>
      <p>The Court finds that provisional measures are warranted. The respondent shall take all measures to prevent irreparable harm.</p>
      <p>The Court orders by fifteen votes to two that the respondent submit a compliance report within 90 days.</p>
    </article>
  </main>
</body>
</html>`;

export const icjEmptyHtmlFixture = `<!DOCTYPE html>
<html lang="en">
<head><title>ICJ — No Content</title></head>
<body><main></main></body>
</html>`;

export const icjMalformedHtmlFixture = `<!DOCTYPE html>
<html>
<head><title></title></head>
<body>
  <script>console.log('injected');</script>
  <div>No semantic structure here</div>
</body>
</html>`;

// ── Document variants for normalization tests ─────────────────────────────────

/** Documents with diverse formats for normalization testing. */
export const normalizationVariants: RawCourtDocument[] = [
  validCourtDocument,
  validCourtDocumentAlt,
  {
    ...validCourtDocument,
    documentType: "judgment",
    date: "2025-12-01",
    language: "fr",
    bodyText: "La Cour rend son arrêt. Les mesures sont ordonnées.",
    title: "Arrêt du 1er décembre 2025",
    keyRulings: ["La Cour ordonne les mesures suivantes."],
  },
  {
    ...validCourtDocument,
    documentType: "advisory_opinion",
    date: "2025-06-20",
    language: "en",
    title: "Advisory Opinion on Test Question",
    bodyText: "The Court is of the opinion that international law requires States to act in accordance with the principles set forth herein.",
    keyRulings: ["Advisory opinion delivered."],
  },
  {
    ...validCourtDocument,
    documentType: "press_release",
    date: undefined,
    bodyText: "Press release announcing forthcoming hearings.",
    keyRulings: [],
  },
];

// ── Raw JSON fixtures for ICC collector ───────────────────────────────────────

export const iccJsonFixture = {
  court: "ICC",
  case_id: "ICC-01/99",
  case_name: "Prosecutor v. Test Defendant",
  document_type: "Decision",
  date: "2026-07-01",
  title: "Decision on the Prosecutor's Request",
  chamber: "Pre-Trial Chamber I",
  content: "The Chamber decides that the Prosecutor's request is granted.",
  judges: ["Judge Alpha", "Judge Beta", "Judge Gamma"],
  situation: "Test Region",
};

export const iccEmptyJsonFixture = {
  court: "ICC",
  case_id: "",
  case_name: "",
  document_type: "",
  date: "",
  title: "",
  content: "",
};
