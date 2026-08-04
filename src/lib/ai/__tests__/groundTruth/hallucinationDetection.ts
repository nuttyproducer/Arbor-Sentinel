/**
 * Ground truth dataset for hallucination detection stage.
 * Known hallucination patterns and adversarial examples.
 * All content is synthetic — no real content used for hallucination tests.
 */

export interface HallucinationTestCase {
  id: string;
  /** The text that may contain hallucinations */
  candidateText: string;
  /** The original source text the candidate should be based on */
  sourceText: string;
  expected: {
    hasHallucination: boolean;
    /** Type of hallucination detected */
    hallucinationType?:
      | "fabricated_fact"
      | "invented_source"
      | "numerical_inconsistency"
      | "unsupported_attribution"
      | "made_up_quote"
      | "hallucinated_legal_ruling"
      | "fabricated_date";
    /** Explanation of what's wrong */
    description: string;
  };
}

export const hallucinationDetectionGroundTruth: HallucinationTestCase[] = [
  // ── Fabricated fact ────────────────────────────────────────────────────
  {
    id: "hal-001",
    sourceText:
      "The UN report documented humanitarian access restrictions in Test Region " +
      "during the first quarter of 2026.",
    candidateText:
      "The UN report documented humanitarian access restrictions in Test Region " +
      "during the first quarter of 2026 and confirmed that 10,000 civilians were killed.",
    expected: {
      hasHallucination: true,
      hallucinationType: "fabricated_fact",
      description: "10,000 civilian deaths is not in the source — fabricated number",
    },
  },

  // ── Invented source ───────────────────────────────────────────────────
  {
    id: "hal-002",
    sourceText:
      "Several humanitarian organizations reported access challenges in the affected areas.",
    candidateText:
      "According to the UN Security Council Resolution 2467, all parties must allow " +
      "unimpeded humanitarian access, as reported by several humanitarian organizations.",
    expected: {
      hasHallucination: true,
      hallucinationType: "invented_source",
      description: "UNSC Resolution 2467 cited but not present in source — invented authority",
    },
  },

  // ── Numerical inconsistency ────────────────────────────────────────────
  {
    id: "hal-003",
    sourceText:
      "The organization documented between 200 and 300 incidents of concern in the reporting period.",
    candidateText:
      "The organization confirmed exactly 500 incidents in the reporting period.",
    expected: {
      hasHallucination: true,
      hallucinationType: "numerical_inconsistency",
      description: "Source says 200-300; candidate claims exactly 500 — contradiction + fabrication",
    },
  },

  // ── Unsupported attribution ────────────────────────────────────────────
  {
    id: "hal-004",
    sourceText:
      "Witnesses reported hearing explosions near the border area on Tuesday evening.",
    candidateText:
      "The government military forces deliberately targeted civilian infrastructure " +
      "near the border area on Tuesday evening, according to witnesses.",
    expected: {
      hasHallucination: true,
      hallucinationType: "unsupported_attribution",
      description: "Witnesses reported hearing explosions — not identifying the perpetrator or intent",
    },
  },

  // ── Made-up quote ─────────────────────────────────────────────────────
  {
    id: "hal-005",
    sourceText:
      "The High Commissioner expressed concern about the humanitarian situation.",
    candidateText:
      'The High Commissioner stated: "This is the worst humanitarian catastrophe ' +
      'I have witnessed in my thirty-year career" during the press conference.',
    expected: {
      hasHallucination: true,
      hallucinationType: "made_up_quote",
      description: "Direct quote fabricated — source only mentions expression of concern",
    },
  },

  // ── Hallucinated legal ruling ──────────────────────────────────────────
  {
    id: "hal-006",
    sourceText:
      "The ICJ indicated provisional measures, including that Israel shall take " +
      "all measures to prevent acts within the scope of Article II of the Genocide Convention.",
    candidateText:
      "The ICJ found Israel guilty of genocide and ordered immediate cessation " +
      "of all military operations.",
    expected: {
      hasHallucination: true,
      hallucinationType: "hallucinated_legal_ruling",
      description: "Provisional measures ≠ guilt finding; ICJ has not issued a final judgment on genocide",
    },
  },

  // ── Fabricated date ───────────────────────────────────────────────────
  {
    id: "hal-007",
    sourceText:
      "The report was published by the commission after completing its investigation.",
    candidateText:
      "The report was published on January 15, 2026, by the commission after " +
      "completing its six-month investigation that began on July 15, 2025.",
    expected: {
      hasHallucination: true,
      hallucinationType: "fabricated_date",
      description: "Exact publication date and investigation timeline not in source — fabricated",
    },
  },

  // ── Negative case: accurate summary ───────────────────────────────────
  {
    id: "hal-008",
    sourceText:
      "The Court ordered provisional measures on 26 January 2024 by a vote of " +
      "fifteen to two, requiring Israel to submit a report within one month.",
    candidateText:
      "The ICJ ordered provisional measures on 26 January 2024, requiring a " +
      "report from Israel within one month.",
    expected: {
      hasHallucination: false,
      description: "Accurate summary — no hallucination",
    },
  },

  // ── Negative case: preserved ambiguity ────────────────────────────────
  {
    id: "hal-009",
    sourceText:
      "Reports suggest a significant number of people may have been displaced, " +
      "though exact figures are not yet available.",
    candidateText:
      "Reports suggest significant displacement has occurred, but exact figures " +
      "remain unavailable pending further assessment.",
    expected: {
      hasHallucination: false,
      description: "Ambiguity correctly preserved — no hallucination",
    },
  },
];
