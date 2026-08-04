/**
 * Ground truth dataset for timeline extraction stage.
 * Tests date precision, chronological ordering, and ambiguous date handling.
 */

export interface TimelineTestCase {
  id: string;
  sourceText: string;
  expected: Array<{
    date: string;
    event: string;
    precision: "exact" | "month" | "year" | "range" | "approximate";
    endDate?: string;
  }>;
}

export const timelineExtractionGroundTruth: TimelineTestCase[] = [
  {
    id: "tl-001",
    sourceText:
      "The first order was issued on January 26, 2026. A second order followed " +
      "on March 15, 2026. The judgment was delivered on June 30, 2026.",
    expected: [
      { date: "2026-01-26", event: "First order issued", precision: "exact" },
      { date: "2026-03-15", event: "Second order issued", precision: "exact" },
      { date: "2026-06-30", event: "Judgment delivered", precision: "exact" },
    ],
  },
  {
    id: "tl-002",
    sourceText:
      "Hostilities began in early 2026 and intensified throughout the spring. " +
      "By mid-July 2026, an estimated 500,000 people had been displaced. " +
      "The ceasefire was announced sometime in August 2026.",
    expected: [
      { date: "2026-01", event: "Hostilities began", precision: "month" },
      { date: "2026-07", event: "500,000 people displaced by mid-July", precision: "month" },
      { date: "2026-08", event: "Ceasefire announced", precision: "month" },
    ],
  },
  {
    id: "tl-003",
    sourceText:
      "Between March and June 2026, the situation deteriorated significantly. " +
      "The commission documented events throughout the first half of 2026. " +
      "Prior to January 2025, the region had been relatively stable.",
    expected: [
      { date: "2026-03", event: "Situation deterioration began", precision: "range", endDate: "2026-06" },
      { date: "2026-01", event: "Commission documentation period start", precision: "range", endDate: "2026-06" },
      { date: "2025-01", event: "Region was relatively stable before this date", precision: "approximate" },
    ],
  },
  {
    id: "tl-004",
    sourceText:
      "The ICJ issued provisional measures on 26 January 2024. Israel submitted " +
      "its first compliance report on 26 February 2024, and a second report on " +
      "24 May 2024. The Court held hearings on the preliminary objections " +
      "in October 2024.",
    expected: [
      { date: "2024-01-26", event: "ICJ issued provisional measures", precision: "exact" },
      { date: "2024-02-26", event: "Israel submitted first compliance report", precision: "exact" },
      { date: "2024-05-24", event: "Israel submitted second compliance report", precision: "exact" },
      { date: "2024-10", event: "Court held hearings on preliminary objections", precision: "month" },
    ],
  },
];
