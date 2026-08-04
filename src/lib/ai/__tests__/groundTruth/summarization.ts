/**
 * Ground truth dataset for summarization stage.
 * Each case has source text and expected summary with facts.
 * Used for confidence calibration and regression testing.
 * All content is synthetic — no actual copyrighted text.
 */

export interface SummarizationTestCase {
  id: string;
  sourceText: string;
  expected: {
    summary: string;
    facts: Array<{
      fact: string;
      category: string;
      startChar: number;
      endChar: number;
      numericValue?: number;
      unit?: string;
    }>;
    preservedAmbiguities: string[];
    sourceReferences: Array<{ text: string; startChar: number; endChar: number }>;
  };
  difficulty: "easy" | "medium" | "hard";
}

export const summarizationGroundTruth: SummarizationTestCase[] = [
  {
    id: "sum-easy-001",
    difficulty: "easy",
    sourceText:
      "On June 15, 2026, the International Court of Justice issued a ruling " +
      "finding that 1500 civilian casualties were documented in the Test Region " +
      "between January and May 2026.",
    expected: {
      summary:
        "The ICJ issued a ruling on June 15, 2026, documenting 1500 civilian " +
        "casualties in Test Region.",
      facts: [
        { fact: "ICJ ruling issued June 15, 2026", category: "legal_finding", startChar: 3, endChar: 54 },
        { fact: "1500 civilian casualties documented", category: "number", startChar: 84, endChar: 118, numericValue: 1500, unit: "people" },
      ],
      preservedAmbiguities: [],
      sourceReferences: [
        { text: "International Court of Justice issued a ruling", startChar: 18, endChar: 64 },
        { text: "1500 civilian casualties were documented", startChar: 84, endChar: 118 },
      ],
    },
  },
  {
    id: "sum-easy-002",
    difficulty: "easy",
    sourceText:
      "OCHA reported that 500,000 people have been displaced in Test Region " +
      "since early 2026. Access to clean water remains severely limited.",
    expected: {
      summary:
        "OCHA reported 500,000 displaced in Test Region with severely limited water access.",
      facts: [
        { fact: "500,000 people displaced in Test Region", category: "number", startChar: 16, endChar: 58, numericValue: 500000, unit: "people" },
        { fact: "Displacement since early 2026", category: "temporal", startChar: 59, endChar: 81 },
      ],
      preservedAmbiguities: [],
      sourceReferences: [
        { text: "500,000 people have been displaced", startChar: 16, endChar: 49 },
      ],
    },
  },
  {
    id: "sum-medium-001",
    difficulty: "medium",
    sourceText:
      "Reports suggest approximately 200-300 people may have been affected by " +
      "the flooding in the eastern districts, though exact figures remain " +
      "unconfirmed pending further assessment.",
    expected: {
      summary:
        "Approximately 200-300 people may have been affected by flooding in " +
        "eastern districts. Exact figures unconfirmed.",
      facts: [
        { fact: "Approximately 200-300 people potentially affected by flooding", category: "number", startChar: 24, endChar: 74, numericValue: 250, unit: "people" },
      ],
      preservedAmbiguities: ["Exact figures remain unconfirmed", "200-300 is an approximate range"],
      sourceReferences: [
        { text: "approximately 200-300 people may have been affected", startChar: 24, endChar: 74 },
      ],
    },
  },
  {
    id: "sum-hard-001",
    difficulty: "hard",
    sourceText:
      "Pre-Trial Chamber I of the International Criminal Court found reasonable " +
      "grounds to believe that crimes against humanity were committed in the " +
      "Test Region between January 2025 and June 2026, involving the use of " +
      "prohibited weapons in densely populated civilian areas resulting in " +
      "disproportionate civilian harm.",
    expected: {
      summary:
        "ICC Pre-Trial Chamber I found reasonable grounds for crimes against " +
        "humanity in Test Region (Jan 2025–Jun 2026), involving prohibited weapons " +
        "in civilian areas.",
      facts: [
        { fact: "ICC Pre-Trial Chamber found reasonable grounds for crimes against humanity", category: "legal_finding", startChar: 0, endChar: 100 },
        { fact: "Crimes occurred Jan 2025–Jun 2026 in Test Region", category: "temporal", startChar: 116, endChar: 170 },
        { fact: "Prohibited weapons used in densely populated civilian areas", category: "legal_finding", startChar: 186, endChar: 248 },
      ],
      preservedAmbiguities: ["Reasonable grounds to believe (not beyond reasonable doubt)"],
      sourceReferences: [
        { text: "reasonable grounds to believe that crimes against humanity", startChar: 57, endChar: 114 },
      ],
    },
  },
];
