/**
 * Standardized test fixtures for EU and Belgium government collectors.
 * Types match RawGovernmentDocument from GovernmentNormalizer.
 * All data is synthetic — no actual copyrighted content.
 */

import type { RawGovernmentDocument } from "../../eu/GovernmentNormalizer";

// ── Normal responses ──────────────────────────────────────────────────────────

export const validEUDocument: RawGovernmentDocument = {
  url: "https://www.europarl.europa.eu/doceo/document/TEST-2026-0001_EN.html",
  title: "European Parliament Resolution on Human Rights in Test Region",
  institution: "European Parliament",
  documentReference: "EP-P9_TA(2026)0999",
  legalBasis: [
    "Article 21 TEU",
    "Article 215 TFEU",
    "EU Strategic Framework on Human Rights",
  ],
  voteTally: { for: 450, against: 120, abstain: 35 },
  effectiveDate: "2026-07-15",
  governmentLevel: "eu",
  documentType: "parliament_resolution",
  date: "2026-07-10",
  bodyText:
    "The European Parliament, having regard to its previous resolutions on Test Region, " +
    "calls on all parties to respect international humanitarian law. " +
    "The Parliament condemns attacks on civilians and calls for an immediate ceasefire.",
  summaryText: "European Parliament calls for IHL compliance and ceasefire in Test Region.",
  language: "en",
  isAdopted: true,
};

export const validBelgiumDocument: RawGovernmentDocument = {
  url: "https://www.dekamer.be/kvvcr/showpage.cfm?section=flwb&language=nl&cfm=TEST",
  title: "Wetsvoorstel betreffende de verantwoordingsplicht voor mensenrechtenschendingen",
  institution: "Belgian Chamber of Representatives",
  documentReference: "DOC 55 9999/001",
  legalBasis: ["Belgian Constitution — Article 167", "EU Due Diligence Directive"],
  effectiveDate: undefined,
  governmentLevel: "federal",
  documentType: "parliamentary_question",
  date: "2026-06-20",
  bodyText:
    "Het wetsvoorstel beoogt een kader te scheppen voor de beoordeling van " +
    "mensenrechtenschendingen door Belgische rechtspersonen in het buitenland.",
  summaryText: "Belgian legislative proposal on accountability for human rights violations.",
  language: "nl",
  isAdopted: false,
};

export const validCouncilConclusion: RawGovernmentDocument = {
  url: "https://www.consilium.europa.eu/en/press/test-2026/",
  title: "Council Conclusions on the Situation in Test Region",
  institution: "Council of the European Union",
  documentReference: "ST 9999/26",
  legalBasis: ["Article 29 TEU", "Common Foreign and Security Policy"],
  effectiveDate: "2026-07-01",
  governmentLevel: "eu",
  documentType: "council_conclusion",
  date: "2026-06-30",
  bodyText:
    "The Council adopted conclusions on the deteriorating situation in Test Region. " +
    "The Council calls for an immediate cessation of hostilities and full compliance " +
    "with international humanitarian law.",
  summaryText: "EU Council calls for cessation of hostilities in Test Region.",
  language: "en",
  isAdopted: true,
};

// ── Empty / minimal responses ─────────────────────────────────────────────────

export const emptyGovernmentDocument: RawGovernmentDocument = {
  url: "https://www.europarl.europa.eu/empty-test",
  title: "",
  institution: "",
  legalBasis: [],
  governmentLevel: "eu",
  documentType: "press_release",
  date: undefined,
  bodyText: "",
  language: "en",
  isAdopted: false,
};

export const minimalGovernmentDocument: RawGovernmentDocument = {
  url: "https://www.dekamer.be/minimal-test",
  title: "Brief Parliamentary Question",
  institution: "Belgian Chamber of Representatives",
  legalBasis: [],
  governmentLevel: "federal",
  documentType: "parliamentary_question",
  date: "2026-07-01",
  bodyText: "Written question submitted.",
  language: "nl",
  isAdopted: false,
};

// ── Malformed documents ───────────────────────────────────────────────────────

export const malformedGovernmentDocument: RawGovernmentDocument = {
  url: "",
  title: "",
  institution: "",
  legalBasis: [],
  governmentLevel: "eu",
  documentType: "press_release",
  date: undefined,
  bodyText: "",
  language: "en",
  isAdopted: false,
};

export const missingInstitutionDocument: RawGovernmentDocument = {
  url: "https://www.europarl.europa.eu/no-institution",
  title: "Document Without Institution Metadata",
  institution: "",
  legalBasis: [],
  governmentLevel: "eu",
  documentType: "press_release",
  date: "2026-07-15",
  bodyText: "This document has no institution metadata.",
  language: "en",
  isAdopted: false,
};

// ── Normalization variants ────────────────────────────────────────────────────

export const normalizationVariants: RawGovernmentDocument[] = [
  validEUDocument,
  validBelgiumDocument,
  validCouncilConclusion,
  // French-language document
  {
    url: "https://www.europarl.europa.eu/fr/test",
    title: "Résolution du Parlement européen sur la région Test",
    institution: "Parlement européen",
    documentReference: "EP-P9_TA(2026)1000",
    legalBasis: ["Article 21 TUE"],
    governmentLevel: "eu",
    documentType: "parliament_resolution",
    date: "2026-07-12",
    bodyText: "Le Parlement européen exprime sa vive préoccupation.",
    summaryText: "Préoccupation du Parlement européen concernant la région Test.",
    language: "fr",
    isAdopted: true,
  },
  // Regional government
  {
    url: "https://www.parlement-wallonie.be/test",
    title: "Résolution relative aux droits humains",
    institution: "Parlement de Wallonie",
    documentReference: "RW-2026-001",
    legalBasis: [],
    governmentLevel: "regional",
    documentType: "regional_position",
    date: "2026-05-15",
    bodyText: "Le Parlement de Wallonie adopte une résolution relative à la situation humanitaire.",
    language: "fr",
    isAdopted: true,
  },
  // No date
  {
    url: "https://www.europarl.europa.eu/no-date",
    title: "Resolution Without Publication Date",
    institution: "European Parliament",
    legalBasis: ["Article 215 TFEU"],
    governmentLevel: "eu",
    documentType: "parliament_resolution",
    bodyText: "Resolution text without a clear publication date.",
    language: "en",
    isAdopted: false,
  },
];

// ── Error simulation fixtures ─────────────────────────────────────────────────

export interface GovernmentFetchErrorFixture {
  status: number;
  statusText: string;
}

export const notFoundError: GovernmentFetchErrorFixture = {
  status: 404,
  statusText: "Not Found",
};

export const serverError: GovernmentFetchErrorFixture = {
  status: 503,
  statusText: "Service Unavailable",
};

export const rateLimitedError: GovernmentFetchErrorFixture = {
  status: 429,
  statusText: "Too Many Requests",
};
