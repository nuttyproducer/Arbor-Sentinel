import { Reveal } from "../ui/Reveal";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";

export function MissionSection() {
  return (
    <section className="pt-8 pb-16 md:pt-12 md:pb-20 lg:pt-16 lg:pb-24" aria-labelledby="mission-title">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Why This Exists"
            title="Evidence is scattered. Accountability needs structure."
            id="mission-title"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="max-w-3xl mx-auto space-y-5">
            <p className="text-xl text-charcoal/80 leading-relaxed border-l-2 border-amber/30 pl-6 lg:pl-8 py-2">
              Genocide allegations and mass atrocity crises are often documented
              across thousands of reports, legal filings, videos, statements,
              archives, and news sources — but the evidence is scattered, hard
              to navigate, and rarely connected to clear civic action.
            </p>
            <p className="text-lg text-charcoal/70 leading-relaxed">
              Accountability Atlas is being built to organize that information
              into a structured public platform: what happened, who documented
              it, what legal processes exist, how governments responded, which
              organizations are helping, and what lawful pressure citizens can
              apply.
            </p>
            <p className="text-lg text-charcoal/70 leading-relaxed">
              The first focus is Gaza and the wider regional humanitarian
              crisis. The long-term goal is a reusable accountability framework
              for other crises as well.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
