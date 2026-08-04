import { Reveal } from "../ui/Reveal";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { LinkCard } from "../ui/LinkCard";

const gatewayCards = [
  {
    label: "Module 01",
    title: "Explore the Gaza Dossier",
    description:
      "Understand the humanitarian context, legal processes, documented harm categories, policy priorities, and action routes through a structured framework preview.",
    to: "/gaza-dossier",
    disabled: false,
    accent: "amber" as const,
  },
  {
    label: "Module 02",
    title: "Track Legal Accountability",
    description:
      "Follow court proceedings, investigations, warrants, UN findings, and procedural milestones with consistent legal status labels.",
    to: "/legal-tracker",
    disabled: false,
    accent: "clay" as const,
  },
  {
    label: "Module 03",
    title: "Examine Country Responsibility",
    description:
      "Start with Belgium: federal positions, UN voting, arms-transfer review, humanitarian aid, and ICC/ICJ cooperation — tracked with clear competency boundaries between national governments and supranational institutions.",
    to: "/countries",
    disabled: false,
    accent: "blue" as const,
  },
  {
    label: "Module 04",
    title: "Read the Methodology",
    description:
      "See how sources, verification levels, legal labels, corrections, and publication safeguards work.",
    to: "/methodology",
    disabled: false,
    accent: "amber" as const,
  },
  {
    label: "Module 05",
    title: "Browse the Evidence Library",
    description:
      "Explore a structured evidence library: court records, UN documents, humanitarian updates, human-rights reports, and verified investigations — each with clear source-quality levels and editorial status labels.",
    to: "/evidence",
    disabled: false,
    accent: "clay" as const,
  },
  {
    label: "Module 06",
    title: "Browse Public Resources",
    description:
      "Humanitarian, legal, documentation, medical, research, and press-freedom organisations listed responsibly as public resources — without implying partnership, endorsement, or affiliation.",
    to: "/organizations",
    disabled: false,
    accent: "clay" as const,
  },
  {
    label: "Module 07",
    title: "Take Lawful Action",
    description:
      "Structured guidance for calm, lawful civic actions: contact representatives, support humanitarian access, share public documentation, and volunteer — all manual, copy-only during the static beta.",
    to: "/take-action",
    disabled: false,
    accent: "amber" as const,
  },
  {
    label: "Module 08",
    title: "Help Build the Platform",
    description:
      "Developers, designers, researchers, writers, translators, legal reviewers, and security reviewers can start with small, safe contributions.",
    to: "/contribute",
    disabled: false,
    accent: "blue" as const,
  },
];

export function GatewaySection() {
  return (
    <section className="py-24 lg:py-32" aria-labelledby="gateway-title">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Public Static Beta"
            title="Enter the accountability system."
            id="gateway-title"
            description="The next layer of Accountability Atlas turns the landing page into a navigable civic platform: methodology, dossiers, legal tracking, country accountability, lawful action tools, and public resource directories."
          />
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gatewayCards.map((card, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <LinkCard
                label={card.label}
                title={card.title}
                to={card.to}
                disabled={card.disabled}
                disabledLabel={"disabledLabel" in card ? (card as { disabledLabel?: string }).disabledLabel : undefined}
                accent={card.accent}
              >
                {card.description}
              </LinkCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
