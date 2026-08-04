import { Reveal } from "../ui/Reveal";
import { Container } from "../ui/Container";
import { Button, ExternalIcon } from "../ui/Button";

const contributorTypes = [
  "Developers",
  "Designers",
  "Researchers",
  "Legal & human-rights reviewers",
  "OSINT & source-verification",
  "Security reviewers",
  "Writers & translators",
  "Civic-tech contributors",
];

export function ContributorCTA() {
  return (
    <section className="py-24 lg:py-32 bg-bone" aria-labelledby="cta-title">
      <Container>
        <Reveal amount={0.15}>
          <div className="max-w-2xl mx-auto text-center">
            <h2
              id="cta-title"
              className="font-serif text-3xl lg:text-4xl font-semibold text-ink mb-6"
            >
              Help build accountability infrastructure.
            </h2>
            <p className="text-xl text-charcoal/80 leading-relaxed mb-4 max-w-xl mx-auto">
              This project needs careful builders.
            </p>
            <p className="text-lg text-charcoal/70 leading-relaxed mb-6 max-w-xl mx-auto">
              We are looking for developers, designers, researchers, legal and
              human-rights reviewers, OSINT/source-verification people, security
              reviewers, writers, translators, and civic-tech contributors.
            </p>

            {/* Contributor type pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-lg mx-auto">
              {contributorTypes.map((type) => (
                <span
                  key={type}
                  className="font-mono text-[11px] text-charcoal/60 bg-bone border border-border rounded-full px-3 py-1"
                >
                  {type}
                </span>
              ))}
            </div>

            <p className="text-base text-charcoal/60 mb-10 max-w-md mx-auto leading-relaxed">
              You do not need to carry the whole mission. Start with one focused
              issue, one review, one page, one component, one source policy
              improvement, or one translation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                href="https://github.com/nuttyproducer/accountability-atlas/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22"
                variant="primary"
                icon={<ExternalIcon />}
                external
              >
                View Good First Issues
              </Button>
              <Button
                href="https://github.com/nuttyproducer/accountability-atlas/blob/main/CONTRIBUTING.md"
                variant="secondary"
                icon={<ExternalIcon />}
                external
              >
                Read the Contribution Guide
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
