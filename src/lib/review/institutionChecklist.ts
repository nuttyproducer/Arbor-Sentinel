import type { ReviewChecklistItem } from "./types";

export const INSTITUTION_CHECKLIST_ITEMS: ReviewChecklistItem[] = [
  { id: "role-accuracy", label: "Institutional role accurate", description: "Institutional role and mandate correctly described", required: true, category: "Accuracy" },
  { id: "competency-boundaries", label: "Competency boundaries correct", description: "What institution can/cannot do is legally accurate", required: true, category: "Legal" },
  { id: "legal-basis-cited", label: "Legal basis cited", description: "Constituting treaty or legal basis referenced", required: true, category: "Legal" },
  { id: "action-templates", label: "Action templates appropriate", description: "Action templates match institution's jurisdiction", required: true, category: "Action" },
  { id: "sources-per-position", label: "Sources for each position", description: "Each factual claim about institution has source", required: true, category: "Attribution" },
  { id: "eu-distinctions", label: "EU-specific distinctions", description: "EU vs national vs shared competency correctly distinguished", required: true, category: "Legal" },
  { id: "current-mandate", label: "Current mandate verified", description: "Institutional mandate is current, not historical", required: true, category: "Currency" },
];
