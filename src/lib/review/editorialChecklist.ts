import type { ReviewChecklistItem } from "./types";

export const EDITORIAL_CHECKLIST_ITEMS: ReviewChecklistItem[] = [
  { id: "tone-brand", label: "Tone matches brand guidelines", description: "Moral clarity without dehumanization", required: true, category: "Tone" },
  { id: "evidence-support", label: "Evidence supports all claims", description: "Every factual claim backed by cited source", required: true, category: "Accuracy" },
  { id: "audience-appropriate", label: "Appropriate for target audience", description: "Language and framing match intended audience", required: true, category: "Audience" },
  { id: "sources-linked", label: "Sources correctly linked", description: "All source references resolve to correct source records", required: true, category: "Attribution" },
  { id: "labels-correct", label: "Labels correct", description: "Content status, verification level, and metadata labels accurate", required: true, category: "Metadata" },
  { id: "correction-route", label: "Correction route present", description: "Clear path for readers to report errors", required: true, category: "Accessibility" },
  { id: "no-hate-speech", label: "No hate speech or incitement", description: "Content checked for hate speech, incitement, dehumanization", required: true, category: "Safety" },
  { id: "clarity", label: "Clarity and readability", description: "Content is clear, well-structured, and free of jargon where possible", required: false, category: "Quality" },
];
