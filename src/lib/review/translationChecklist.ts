import type { ReviewChecklistItem } from "./types";

export const TRANSLATION_CHECKLIST_ITEMS: ReviewChecklistItem[] = [
  { id: "named-entities-preserved", label: "Named entities preserved", description: "All person, place, institution names correctly preserved/translated", required: true, category: "Accuracy" },
  { id: "legal-terms-correct", label: "Legal terms correctly translated", description: "Legal terminology uses correct target-language equivalents", required: true, category: "Terminology" },
  { id: "fluency-target", label: "Fluency in target language", description: "Translation reads naturally in target language", required: true, category: "Fluency" },
  { id: "meaning-preserved", label: "Original meaning preserved", description: "No distortion of factual claims, legal posture, or attribution", required: true, category: "Accuracy" },
  { id: "cultural-context", label: "Cultural context considered", description: "Translation is culturally appropriate for target audience", required: true, category: "Context" },
  { id: "terminology-consistency", label: "Terminology consistency", description: "Same source terms translated consistently throughout", required: true, category: "Consistency" },
  { id: "ai-assisted-flag", label: "AI-assisted translation flagged", description: "If automated translation used, flagged as AI-assisted — human reviewed", required: true, category: "Disclosure" },
  { id: "tone-match", label: "Tone matches editorial standards", description: "Translation tone aligns with platform's editorial standards", required: false, category: "Style" },
];
