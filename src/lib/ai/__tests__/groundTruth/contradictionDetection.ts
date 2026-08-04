/**
 * Ground truth dataset for contradiction detection stage.
 * Tests true positives, false positives, and severity classification.
 */

export interface ContradictionTestCase {
  id: string;
  /** The new claim being checked */
  claim: { text: string; sourceId: string; date: string };
  /** Existing records to check against */
  existingRecords: Array<{ id: string; text: string; sourceId: string; date: string }>;
  expected: {
    hasContradiction: boolean;
    severity?: "low" | "medium" | "high" | "critical";
    conflictingRecordIds?: string[];
  };
}

export const contradictionDetectionGroundTruth: ContradictionTestCase[] = [
  {
    id: "contra-001",
    claim: { text: "500 civilian casualties reported in Test Region in June 2026", sourceId: "ngo-a", date: "2026-07-01" },
    existingRecords: [
      { id: "rec-1", text: "500 civilian casualties documented in Test Region in June 2026", sourceId: "un-official", date: "2026-07-15" },
    ],
    expected: { hasContradiction: false },
  },
  {
    id: "contra-002",
    claim: { text: "500 casualties reported", sourceId: "source-a", date: "2026-07-01" },
    existingRecords: [
      { id: "rec-1", text: "1500 casualties documented for the same period", sourceId: "source-b", date: "2026-07-15" },
    ],
    expected: { hasContradiction: true, severity: "high", conflictingRecordIds: ["rec-1"] },
  },
  {
    id: "contra-003",
    claim: { text: "The ICJ found genocide was committed", sourceId: "news-outlet", date: "2026-06-01" },
    existingRecords: [
      { id: "rec-1", text: "The ICJ found plausible grounds for genocide allegations and issued provisional measures", sourceId: "icj-official", date: "2026-01-26" },
    ],
    expected: { hasContradiction: true, severity: "critical", conflictingRecordIds: ["rec-1"] },
  },
  {
    id: "contra-004",
    claim: { text: "Approximately 200,000 people displaced", sourceId: "ngo-b", date: "2026-07-01" },
    existingRecords: [
      { id: "rec-1", text: "An estimated 195,000–210,000 people displaced in the affected area", sourceId: "un-ocha", date: "2026-06-30" },
    ],
    expected: { hasContradiction: false },
  },
  {
    id: "contra-005",
    claim: { text: "Medical facilities were attacked on March 15, 2026", sourceId: "witness-report", date: "2026-03-20" },
    existingRecords: [
      { id: "rec-1", text: "No attacks on medical facilities were recorded on March 15, 2026 — the nearest incident was March 14", sourceId: "monitoring-body", date: "2026-04-01" },
    ],
    expected: { hasContradiction: true, severity: "medium", conflictingRecordIds: ["rec-1"] },
  },
];
