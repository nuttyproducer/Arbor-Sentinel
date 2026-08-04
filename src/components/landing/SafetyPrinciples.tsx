import { Reveal } from "../ui/Reveal";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { principles } from "../../data/principles";

export function SafetyPrinciples() {
  return (
    <section className="py-24 lg:py-32" aria-labelledby="principles-title">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="How We Work"
            title="Safety Principles"
            id="principles-title"
            description="This project deals with genocide allegations, atrocity documentation, humanitarian harm, and political responsibility. That means safety is not decoration — it is core infrastructure."
          />
        </Reveal>
        <div className="max-w-3xl mx-auto space-y-4">
          {principles.map((principle, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className="flex items-center gap-5 bg-bone border border-charcoal/15 rounded-lg p-5 lg:p-6 transition duration-300 hover:shadow-soft hover:border-charcoal/30 group">
                {/* Numbered marker with clay dot */}
                <span
                  className="flex-shrink-0 w-9 h-9 rounded-full border border-clay/30 flex items-center justify-center font-mono text-xs font-medium text-clay group-hover:bg-clay/5 transition-colors duration-300"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-lg text-charcoal leading-relaxed">
                  {principle}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
