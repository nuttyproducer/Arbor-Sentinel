import type { ReviewChecklistItem } from "./types";

export const COUNTRY_CHECKLIST_ITEMS: ReviewChecklistItem[] = [
  { id: "position-accuracy", label: "Position accuracy", description: "Current federal/institutional position accurately represented", required: true, category: "Accuracy" },
  { id: "un-voting-verified", label: "UN voting records verified", description: "UN voting records checked against official sources", required: true, category: "Verification" },
  { id: "arms-transfer", label: "Arms transfer policy correct", description: "Arms transfer and export policy correctly documented", required: true, category: "Policy" },
  { id: "aid-data-sourced", label: "Humanitarian aid data sourced", description: "Aid figures sourced and dated", required: true, category: "Data" },
  { id: "icc-icj-stance", label: "ICC/ICJ cooperation stance", description: "Cooperation stance with international courts documented", required: true, category: "Legal" },
  { id: "contact-routes-verified", label: "Contact routes verified", description: "Representative contact routes verified and current", required: true, category: "Action" },
  { id: "no-accountability-score", label: "No accountability score", description: "Accountability score not displayed (policy requirement)", required: true, category: "Policy" },
  { id: "source-dates-current", label: "Source dates current", description: "No outdated positions presented as current", required: true, category: "Currency" },
  { id: "institution-relationships", label: "Institution relationships accurate", description: "Country's relationship to listed institutions correctly stated", required: true, category: "Relationships" },
];
