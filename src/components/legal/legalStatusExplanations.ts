import type { LegalStatus } from "../../types/content";

/** Human-readable explanations for each legal status label. */
export const statusExplanations: { status: LegalStatus; explanation: string }[] = [
  {
    status: "court_proceeding_active",
    explanation:
      "A case is actively pending before a court or tribunal. Procedural steps — hearings, filings, deliberations — are ongoing.",
  },
  {
    status: "provisional_measures_issued",
    explanation:
      "A court has issued binding provisional (interim) measures before reaching a final judgment. These measures aim to preserve rights and prevent irreparable harm during proceedings.",
  },
  {
    status: "arrest_warrant_issued",
    explanation:
      "A court has issued an arrest warrant. Warrants are subject to judicial review processes. All persons are presumed innocent until proven guilty.",
  },
  {
    status: "allegation_under_investigation",
    explanation:
      "An allegation has been made and is under formal investigation by a competent body. No determination has been reached.",
  },
  {
    status: "un_finding",
    explanation:
      "A United Nations body — such as a Commission of Inquiry, Human Rights Council mechanism, or Special Rapporteur — has published findings. UN findings are fact-finding outputs, not judicial rulings.",
  },
  {
    status: "ngo_legal_determination",
    explanation:
      "An established non-governmental organization with relevant legal expertise has published a determination based on documented evidence and legal analysis.",
  },
  {
    status: "not_judicially_determined",
    explanation:
      "The matter has not been determined by a court or tribunal. It may be under investigation, subject to public reporting, or categorized for future tracking.",
  },
  {
    status: "contested_claim",
    explanation:
      "The claim is contested by one or more parties or credible sources. The platform flags contested status to avoid presenting one-sided accounts as settled.",
  },
  {
    status: "requires_further_verification",
    explanation:
      "The information has been recorded but requires additional source verification before it can be upgraded to a higher verification level.",
  },
];
