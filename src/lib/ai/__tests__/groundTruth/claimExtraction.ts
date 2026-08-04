/**
 * Ground truth dataset for claim extraction stage.
 * Tests claim type classification and source span accuracy.
 */

export interface ClaimTestCase {
  id: string;
  sourceText: string;
  expected: Array<{
    claimText: string;
    claimType: "factual" | "legal" | "numerical" | "testimony" | "allegation";
    startChar: number;
    endChar: number;
    confidence?: number;
  }>;
}

export const claimExtractionGroundTruth: ClaimTestCase[] = [
  {
    id: "claim-001",
    sourceText:
      "The Court found that the respondent failed to comply with provisional " +
      "measures ordered on January 26, 2026. The Court also noted that 500 " +
      "civilian structures were damaged. A witness testified that attacks " +
      "occurred on three consecutive days.",
    expected: [
      { claimText: "respondent failed to comply with provisional measures", claimType: "legal", startChar: 18, endChar: 72 },
      { claimText: "500 civilian structures were damaged", claimType: "numerical", startChar: 104, endChar: 138 },
      { claimText: "attacks occurred on three consecutive days", claimType: "testimony", startChar: 160, endChar: 202 },
    ],
  },
  {
    id: "claim-002",
    sourceText:
      "Allegations of prohibited weapons use were reported by multiple sources. " +
      "The Ministry denied all allegations in a statement issued on March 3, 2026.",
    expected: [
      { claimText: "prohibited weapons use were reported", claimType: "allegation", startChar: 14, endChar: 51 },
      { claimText: "Ministry denied all allegations", claimType: "factual", startChar: 79, endChar: 109 },
    ],
  },
  {
    id: "claim-003",
    sourceText:
      "Article 7 of the Rome Statute defines crimes against humanity. " +
      "The investigation confirmed 150 cases matching this definition. " +
      "An estimated 10,000 people remain at risk according to the report.",
    expected: [
      { claimText: "Article 7 of the Rome Statute defines crimes against humanity", claimType: "legal", startChar: 0, endChar: 62 },
      { claimText: "150 cases matching this definition", claimType: "numerical", startChar: 91, endChar: 125 },
      { claimText: "10,000 people remain at risk", claimType: "numerical", startChar: 139, endChar: 170 },
    ],
  },
];
