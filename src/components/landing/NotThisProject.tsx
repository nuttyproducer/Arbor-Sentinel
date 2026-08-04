import { Reveal } from "../ui/Reveal";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";

export function NotThisProject() {
  return (
    <section className="py-24 lg:py-32 bg-bone" aria-labelledby="boundaries-title">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Clarity"
            title="Strict Boundaries"
            id="boundaries-title"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="max-w-3xl mx-auto bg-bone border border-charcoal/15 rounded-lg p-8 lg:p-10">
            <p className="text-charcoal leading-relaxed text-xl">
              Accountability Atlas will not publish doxing material, encourage
              harassment, collect sensitive witness submissions before secure
              review, claim false partnerships, or treat unverified social media
              posts as verified evidence.
            </p>
            <p className="text-charcoal/80 leading-relaxed text-lg mt-5">
              The platform exists to support documentation, accountability,
              humanitarian protection, and lawful public action — not revenge,
              intimidation, or reckless exposure.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
