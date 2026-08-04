export type PhaseStatus = "current" | "next" | "planned" | "reviewed-later";

export interface RoadmapPhase {
  phase: string;
  title: string;
  description: string;
  status: PhaseStatus;
}

export const roadmap: RoadmapPhase[] = [
  {
    phase: "Phase 1",
    title: "Public Foundation",
    description:
      "Landing page, methodology preview, contribution flow, safety rules, source policy, and open project documentation.",
    status: "current",
  },
  {
    phase: "Phase 2",
    title: "Gaza Accountability Dossier",
    description:
      "First public dossier structure for Gaza and the wider regional crisis: legal status, humanitarian context, source categories, key institutions, and action routes.",
    status: "next",
  },
  {
    phase: "Phase 3",
    title: "Country Accountability Pages",
    description:
      "Belgium and EU pages first: public statements, votes, arms-transfer positions, humanitarian aid policy, representatives, and lawful action templates.",
    status: "planned",
  },
  {
    phase: "Phase 4",
    title: "Legal & Organization Trackers",
    description:
      "Structured legal tracker, humanitarian organization directory, civil society directory, and correction process.",
    status: "planned",
  },
  {
    phase: "Phase 5",
    title: "Reviewed Dynamic Platform",
    description:
      "Only after legal, security, and methodology review: search, maps, structured datasets, dossier generation, and secure workflows.",
    status: "reviewed-later",
  },
];
