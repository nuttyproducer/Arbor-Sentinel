// src/data/correctionCategories.ts

import type { CorrectionCategory } from "../lib/review/types";
import type { ReviewType } from "../lib/review/types";

export interface CorrectionCategoryDef {
  id: CorrectionCategory;
  label: string;
  description: string;
  isMajor: boolean; // major corrections are always logged publicly
  urgency: "immediate" | "high" | "normal";
  requiresEscalation: boolean; // escalate to specific reviewer type
  escalateTo?: ReviewType;
}

export const CORRECTION_CATEGORIES: CorrectionCategoryDef[] = [
  {
    id: "unsafe_personal_info",
    label: "Unsafe personal information",
    description: "Doxing risk, private data exposure",
    isMajor: true,
    urgency: "immediate",
    requiresEscalation: true,
    escalateTo: "safety",
  },
  {
    id: "factual_error",
    label: "Factual error",
    description: "Incorrect factual claim",
    isMajor: true,
    urgency: "high",
    requiresEscalation: true,
  },
  {
    id: "legal_wording",
    label: "Legal wording error",
    description: "Misstated legal status or terminology",
    isMajor: true,
    urgency: "high",
    requiresEscalation: true,
    escalateTo: "legal",
  },
  {
    id: "mistranslation",
    label: "Mistranslation",
    description: "Translation error changing meaning",
    isMajor: true,
    urgency: "high",
    requiresEscalation: true,
    escalateTo: "translation",
  },
  {
    id: "misleading_framing",
    label: "Misleading framing",
    description: "Accurate facts but misleading presentation",
    isMajor: true,
    urgency: "high",
    requiresEscalation: true,
    escalateTo: "editorial",
  },
  {
    id: "outdated_source",
    label: "Outdated source",
    description: "Source no longer reflects current position",
    isMajor: false,
    urgency: "normal",
    requiresEscalation: false,
  },
  {
    id: "wrong_location_date",
    label: "Wrong location or date",
    description: "Incorrect location or date metadata",
    isMajor: false,
    urgency: "normal",
    requiresEscalation: false,
  },
  {
    id: "broken_link",
    label: "Broken link",
    description: "URL no longer resolves",
    isMajor: false,
    urgency: "normal",
    requiresEscalation: false,
  },
  {
    id: "duplicate",
    label: "Duplicate content",
    description: "Content duplicates another record",
    isMajor: false,
    urgency: "normal",
    requiresEscalation: false,
  },
  {
    id: "licensing_attribution",
    label: "Licensing / attribution",
    description: "Incorrect or missing license/attribution",
    isMajor: false,
    urgency: "normal",
    requiresEscalation: false,
  },
];
