import { Reveal } from "../ui/Reveal";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Card } from "../ui/Card";
import { modules } from "../../data/modules";

export function ModuleGrid() {
  return (
    <section className="py-24 lg:py-32 bg-bone" aria-labelledby="modules-title">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="What We're Building"
            title="Core Modules"
            id="modules-title"
            description="Each module connects verified evidence to lawful civic action — built carefully, without collecting sensitive data prematurely."
          />
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <Card
                accent="amber"
                label={`Module ${String(i + 1).padStart(2, "0")}`}
                title={mod.title}
                className="h-full"
              >
                {mod.description}
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
