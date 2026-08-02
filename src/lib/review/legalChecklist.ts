import type { ReviewChecklistItem } from "./types";

export const LEGAL_CHECKLIST_ITEMS: ReviewChecklistItem[] = [
  { id: "legal-status-accuracy", label: "Legal status accuracy", description: "Legal status label uses correct controlled vocabulary", required: true, category: "Legal Terminology" },
  { id: "source-attribution", label: "Source attribution correct", description: "All legal conclusions attributed to the body that made them", required: true, category: "Attribution" },
  { id: "terminology-compliance", label: "Terminology policy compliance", description: "Legal terms match Legal Language Policy", required: true, category: "Legal Terminology" },
  { id: "no-overstatement", label: "No legal overstatement", description: "Content does not state legal guilt before final judgment", required: true, category: "Accuracy" },
  { id: "appropriate-labeling", label: "Appropriate labeling", description: "Procedural posture correctly labeled (allegation vs finding vs ruling)", required: true, category: "Labeling" },
  { id: "procedural-accuracy", label: "Procedural posture accuracy", description: "Current procedural stage correctly described", required: true, category: "Accuracy" },
  { id: "jurisdictional-accuracy", label: "Jurisdictional accuracy", description: "Court or body jurisdiction correctly identified", required: true, category: "Jurisdiction" },
  { id: "no-partnership-implication", label: "No partnership implication", description: "Content does not imply legal partnership with listed bodies", required: true, category: "Boundaries" },
];
