/**
 * Ground truth dataset for entity extraction stage.
 * Synthetic test cases for precision/recall/F1 measurement.
 */

export interface EntityTestCase {
  id: string;
  sourceText: string;
  expected: {
    persons: Array<{ name: string; role?: string }>;
    organizations: Array<{ name: string; type?: string }>;
    locations: Array<{ name: string; country?: string; safeLocation?: string }>;
    dates: Array<{ text: string; iso?: string }>;
    legalInstruments: Array<{ name: string; article?: string }>;
  };
  difficulty: "easy" | "medium" | "hard";
}

export const entityExtractionGroundTruth: EntityTestCase[] = [
  {
    id: "ent-easy-001",
    difficulty: "easy",
    sourceText:
      "Dr. Maria Santos, Special Rapporteur for the UN Human Rights Council, " +
      "presented her findings on Test Region at the Palais des Nations in Geneva " +
      "on July 15, 2026.",
    expected: {
      persons: [{ name: "Maria Santos", role: "Special Rapporteur" }],
      organizations: [{ name: "UN Human Rights Council", type: "international_body" }],
      locations: [{ name: "Geneva", country: "Switzerland", safeLocation: "Geneva, Switzerland" }],
      dates: [{ text: "July 15, 2026", iso: "2026-07-15" }],
      legalInstruments: [],
    },
  },
  {
    id: "ent-easy-002",
    difficulty: "easy",
    sourceText:
      "The International Court of Justice in The Hague delivered its advisory " +
      "opinion on April 30, 2026, citing the Genocide Convention and the Rome Statute.",
    expected: {
      persons: [],
      organizations: [{ name: "International Court of Justice", type: "court" }],
      locations: [{ name: "The Hague", country: "Netherlands", safeLocation: "The Hague, Netherlands" }],
      dates: [{ text: "April 30, 2026", iso: "2026-04-30" }],
      legalInstruments: [
        { name: "Genocide Convention" },
        { name: "Rome Statute" },
      ],
    },
  },
  {
    id: "ent-medium-001",
    difficulty: "medium",
    sourceText:
      "Amnesty International and Human Rights Watch jointly documented violations " +
      "in the North Test Province and South Test District. MSF reported 15,000 " +
      "patients treated across 12 facilities between March and June 2026. " +
      "The ICC Prosecutor, Dr. James Okonkwo, opened a preliminary examination.",
    expected: {
      persons: [{ name: "James Okonkwo", role: "ICC Prosecutor" }],
      organizations: [
        { name: "Amnesty International", type: "ngo" },
        { name: "Human Rights Watch", type: "ngo" },
        { name: "MSF", type: "humanitarian" },
        { name: "ICC", type: "court" },
      ],
      locations: [
        { name: "North Test Province", safeLocation: "Test Region" },
        { name: "South Test District", safeLocation: "Test Region" },
      ],
      dates: [
        { text: "March 2026", iso: "2026-03" },
        { text: "June 2026", iso: "2026-06" },
      ],
      legalInstruments: [],
    },
  },
  {
    id: "ent-hard-001",
    difficulty: "hard",
    sourceText:
      "The commission examined whether actions in the area bounded by coordinates " +
      "N 32.5°, E 35.2° violated Article 7(1)(a) through (h) of the Rome Statute, " +
      "and whether the parties to Additional Protocols I and II of the Geneva " +
      "Conventions of 12 August 1949 bore command responsibility under the " +
      "doctrine established in the Blaškić Appeals Judgment of 29 July 2004.",
    expected: {
      persons: [],
      organizations: [],
      locations: [
        { name: "area bounded by N 32.5°, E 35.2°", safeLocation: "Near 32.5°N 35.2°E (approximate region)" },
      ],
      dates: [
        { text: "12 August 1949", iso: "1949-08-12" },
        { text: "29 July 2004", iso: "2004-07-29" },
      ],
      legalInstruments: [
        { name: "Rome Statute", article: "Article 7(1)(a)-(h)" },
        { name: "Geneva Conventions", article: "Additional Protocols I and II" },
      ],
    },
  },
];
