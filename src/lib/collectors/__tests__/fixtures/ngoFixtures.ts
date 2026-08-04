/**
 * Standardized test fixtures for NGO collectors (Amnesty, HRW, Btselem, MSF, ICRC).
 * Types match RawNgoDocument from NGONormalizer.
 * All data is synthetic — no actual copyrighted content.
 */

import type { RawNgoDocument } from "../../ngo/NGONormalizer";

// ── Normal responses ──────────────────────────────────────────────────────────

export const validAmnestyDocument: RawNgoDocument = {
  url: "https://www.amnesty.org/en/latest/news/2026/07/test-region-human-rights-report/",
  title: "Test Region: Evidence of Serious Human Rights Violations Must Be Investigated",
  organization: "Amnesty International",
  reportType: "research_report",
  date: "2026-07-20",
  bodyText:
    "New evidence gathered by Amnesty International documents serious violations " +
    "of international humanitarian law in Test Region. The organization documented " +
    "at least 50 incidents involving civilian casualties between January and June 2026. " +
    "Amnesty International calls for an immediate, independent international investigation.",
  summaryText: "Amnesty International documents 50+ incidents of IHL violations in Test Region.",
  methodology: "Interviews with 200 witnesses, satellite imagery analysis, document review.",
  keyFindings: [
    "At least 50 incidents involving civilian casualties documented.",
    "Patterns of attacks on protected civilian infrastructure observed.",
    "Use of prohibited weapons in populated areas confirmed.",
  ],
  geographicScope: ["Test Region"],
  legalReferences: ["Geneva Convention IV", "Additional Protocol I", "Rome Statute Article 7"],
  language: "en",
  isOfficialSource: false,
};

export const validHRWDocument: RawNgoDocument = {
  url: "https://www.hrw.org/report/2026/08/01/test-region-documenting-violations",
  title: "Test Region: Systematic Documentation of Violations Needed",
  organization: "Human Rights Watch",
  reportType: "research_report",
  date: "2026-08-01",
  bodyText:
    "Human Rights Watch has documented patterns of violations against civilians " +
    "in Test Region, including attacks on medical facilities and schools. " +
    "The findings are based on interviews with 150 witnesses and analysis of " +
    "satellite imagery, photographs, and medical records.",
  summaryText: "HRW documents attacks on medical facilities and schools in Test Region.",
  methodology: "150 witness interviews, satellite imagery, photographic evidence, medical records.",
  keyFindings: [
    "Patterns of attacks on medical facilities documented.",
    "Schools and educational infrastructure targeted.",
    "Evidence collected from 150 witnesses across 15 locations.",
  ],
  geographicScope: ["Test Region"],
  legalReferences: ["Geneva Convention IV Article 18", "Additional Protocol I Article 12"],
  language: "en",
  isOfficialSource: false,
};

export const validBtselemDocument: RawNgoDocument = {
  url: "https://www.btselem.org/press_releases/20260715_test_area",
  title: "Human Rights Organization Calls for Accountability in Test Area",
  organization: "Btselem",
  reportType: "press_release",
  date: "2026-07-15",
  bodyText:
    "Btselem documented extensive human rights concerns in Test Area, " +
    "including restrictions on movement, access to water, and medical care. " +
    "The organization calls for accountability mechanisms to address these violations.",
  summaryText: "Btselem calls for accountability mechanisms addressing rights violations.",
  methodology: "Field research, testimonies from affected communities, documentation over 12 months.",
  keyFindings: [
    "Freedom of movement severely restricted across Test Area.",
    "Access to clean water reduced by 60% in affected communities.",
    "Medical care access impeded for over 200,000 residents.",
  ],
  geographicScope: ["Test Area"],
  legalReferences: ["Geneva Convention IV Article 33", "ICCPR Article 12"],
  language: "en",
  isOfficialSource: false,
};

export const validMSFDocument: RawNgoDocument = {
  url: "https://www.msf.org/test-region-medical-crisis-report-2026",
  title: "Test Region: Medical Facilities Overwhelmed as Crisis Deepens",
  organization: "Médecins Sans Frontières",
  reportType: "field_report",
  date: "2026-07-25",
  bodyText:
    "Médecins Sans Frontières (MSF) reports that medical facilities in Test Region " +
    "are overwhelmed. Over 200,000 people lack access to basic healthcare. " +
    "MSF teams have treated over 15,000 patients in the past three months. " +
    "Medical supplies are critically low and humanitarian access is severely restricted.",
  summaryText: "MSF: 200,000 lack healthcare access in Test Region, medical supplies critically low.",
  methodology: "Field reports from MSF medical teams operating in 12 health facilities.",
  keyFindings: [
    "200,000+ people lack access to basic healthcare.",
    "15,000 patients treated by MSF in three months.",
    "Medical supply shortages reported across all facilities.",
    "Humanitarian access severely restricted.",
  ],
  geographicScope: ["Test Region"],
  legalReferences: [],
  language: "en",
  isOfficialSource: false,
};

export const validICRCDocument: RawNgoDocument = {
  url: "https://www.icrc.org/en/document/test-region-ihl-compliance-2026",
  title: "Test Region: ICRC Calls for Compliance with International Humanitarian Law",
  organization: "International Committee of the Red Cross",
  reportType: "ihl_statement",
  date: "2026-08-02",
  bodyText:
    "The International Committee of the Red Cross (ICRC) reminds all parties " +
    "to the conflict in Test Region of their obligations under international " +
    "humanitarian law. The ICRC has facilitated the delivery of humanitarian aid " +
    "to 100,000 people and calls for unimpeded humanitarian access.",
  summaryText: "ICRC reminds parties of IHL obligations, facilitated aid to 100,000 people.",
  methodology: "ICRC field operations, confidential dialogue with parties, needs assessments.",
  keyFindings: [
    "All parties must comply with IHL obligations.",
    "Humanitarian access remains a critical concern.",
    "100,000 people received ICRC-facilitated aid.",
  ],
  geographicScope: ["Test Region"],
  legalReferences: [
    "Geneva Conventions I-IV",
    "Additional Protocol I",
    "Customary IHL",
  ],
  language: "en",
  isOfficialSource: false,
};

// ── Empty / minimal responses ─────────────────────────────────────────────────

export const emptyNGODocument: RawNgoDocument = {
  url: "https://www.amnesty.org/en/empty-test",
  title: "",
  organization: "",
  reportType: "press_release",
  date: undefined,
  bodyText: "",
  language: "en",
  keyFindings: [],
  legalReferences: [],
  isOfficialSource: false,
};

export const minimalNGODocument: RawNgoDocument = {
  url: "https://www.hrw.org/minimal-test",
  title: "Brief Statement",
  organization: "Human Rights Watch",
  reportType: "press_release",
  date: "2026-07-01",
  bodyText: "Statement issued regarding recent events.",
  language: "en",
  keyFindings: [],
  legalReferences: [],
  isOfficialSource: false,
};

// ── Malformed documents ───────────────────────────────────────────────────────

export const malformedNGODocument: RawNgoDocument = {
  url: "",
  title: "",
  organization: "",
  reportType: "press_release",
  date: undefined,
  bodyText: "",
  language: "en",
  keyFindings: [],
  legalReferences: [],
  isOfficialSource: false,
};

export const missingOrganizationDocument: RawNgoDocument = {
  url: "https://www.example.org/report",
  title: "Report Without Organization Attribution",
  organization: "",
  reportType: "research_report",
  date: "2026-07-15",
  bodyText: "This report has no identifiable source organization.",
  language: "en",
  keyFindings: ["Finding one."],
  legalReferences: ["Geneva Convention IV"],
  isOfficialSource: false,
};

// ── Normalization variants ────────────────────────────────────────────────────

export const normalizationVariants: RawNgoDocument[] = [
  validAmnestyDocument,
  validHRWDocument,
  validBtselemDocument,
  validMSFDocument,
  validICRCDocument,
  // Multi-category with methodology
  {
    url: "https://www.amnesty.org/en/multi-test",
    title: "Multi-Category Crisis Report",
    organization: "Amnesty International",
    reportType: "research_report",
    date: "2026-06-15",
    bodyText: "Comprehensive report covering human rights, humanitarian, and legal dimensions.",
    summaryText: "Comprehensive multi-sector report on Test Region crisis.",
    methodology: "Mixed methods: interviews, satellite imagery, document analysis, legal review.",
    keyFindings: [
      "Violations span human rights, humanitarian, and legal domains.",
      "Crisis requires coordinated international response.",
    ],
    geographicScope: ["Test Region", "Neighboring Areas"],
    legalReferences: [
      "Geneva Convention IV",
      "Rome Statute",
      "ICCPR",
      "UN Security Council Resolution 9999",
    ],
    language: "en",
    isOfficialSource: false,
  },
  // No date
  {
    url: "https://www.msf.org/no-date-report",
    title: "Urgent Medical Appeal",
    organization: "Médecins Sans Frontières",
    reportType: "field_report",
    bodyText: "Medical teams need immediate support. Supplies are critically low.",
    language: "en",
    keyFindings: ["Medical supplies critically low."],
    legalReferences: [],
    isOfficialSource: false,
  },
  // French language with methodology
  {
    url: "https://www.msf.fr/rapport-test",
    title: "Rapport sur la crise médicale dans la région Test",
    organization: "Médecins Sans Frontières",
    reportType: "field_report",
    date: "2026-07-10",
    bodyText: "La situation médicale dans la région Test est critique.",
    summaryText: "Situation médicale critique dans la région Test.",
    methodology: "Rapports des équipes MSF sur le terrain.",
    keyFindings: ["Accès aux soins limité pour 200 000 personnes."],
    geographicScope: ["Région Test"],
    legalReferences: [],
    language: "fr",
    isOfficialSource: false,
  },
];

// ── Error simulation fixtures ─────────────────────────────────────────────────

export interface NGOFetchErrorFixture {
  status: number;
  statusText: string;
}

export const notFoundError: NGOFetchErrorFixture = {
  status: 404,
  statusText: "Not Found",
};

export const serverError: NGOFetchErrorFixture = {
  status: 500,
  statusText: "Internal Server Error",
};

export const rateLimitedError: NGOFetchErrorFixture = {
  status: 429,
  statusText: "Too Many Requests",
};
