import type { SourceType } from "../../types/content";

/**
 * Source hierarchy — ordered by evidentiary weight for accountability
 * contexts. This hierarchy is contextual: a humanitarian report may carry
 * more weight for documenting access restrictions than a court record
 * that does not address that question. The hierarchy guides default
 * weighting; editorial judgment determines relevance.
 */
export const sourceHierarchy: { tier: number; sourceType: SourceType; notes: string }[] = [
  {
    tier: 1,
    sourceType: "court",
    notes:
      "Official court filings, orders, judgments, and transcripts. The highest-weight category for legal accountability questions. A court record proves what the court ordered or found — it does not automatically prove every factual claim recited in the filing.",
  },
  {
    tier: 2,
    sourceType: "un",
    notes:
      "UN Security Council resolutions, General Assembly votes, Human Rights Council reports, Commission of Inquiry findings, and OCHA situation reports. Official UN documents carry institutional weight but may reflect political compromise.",
  },
  {
    tier: 3,
    sourceType: "humanitarian",
    notes:
      "ICRC, IFRC, national Red Cross / Red Crescent societies, and major humanitarian organisations with established operational presence. Humanitarian reporting is often the best source for access restrictions and civilian needs.",
  },
  {
    tier: 4,
    sourceType: "government",
    notes:
      "Official government statements, parliamentary records, voting records, and published policy documents. These prove what a government said or did — they do not independently verify the factual claims within.",
  },
  {
    tier: 5,
    sourceType: "ngo",
    notes:
      "Established human-rights and legal organisations with published methodologies. Organisational findings are distinct from judicial determinations and should be described as such.",
  },
  {
    tier: 6,
    sourceType: "journalism",
    notes:
      "Investigative journalism from outlets with published editorial standards. News reporting can surface information not yet in institutional records — it requires corroboration before being presented as established fact.",
  },
  {
    tier: 7,
    sourceType: "academic",
    notes:
      "Peer-reviewed research, university-published reports, and academic institutional findings. Academic work provides analytical frameworks and longitudinal context.",
  },
  {
    tier: 8,
    sourceType: "osint",
    notes:
      "Open-source intelligence and documentation groups with published methodologies. OSINT can verify specific events through multiple data streams — it is treated as a source, not automatically as verified proof without corroboration.",
  },
];
