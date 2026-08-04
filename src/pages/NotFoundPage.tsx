import { Container } from "../components/ui/Container";
import { Reveal } from "../components/ui/Reveal";
import { Button, ArrowIcon, ExternalIcon } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="py-24 lg:py-32 min-h-[60vh] flex items-center">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <Reveal>
            <p className="font-mono text-sm font-medium tracking-[0.15em] uppercase text-charcoal/45 mb-6">
              404
            </p>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-ink mb-6">
              Page not found.
            </h1>
            <div className="w-10 h-px bg-border mx-auto mb-8" aria-hidden="true" />
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-lg text-charcoal/70 leading-relaxed mb-10 max-w-xl mx-auto">
              This page may not exist yet, or it may have moved as the public
              static beta is being built.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button to="/" variant="primary" icon={<ArrowIcon />}>
                Home
              </Button>
              <Button to="/methodology" variant="secondary" icon={<ArrowIcon />}>
                Methodology
              </Button>
              <Button to="/contribute" variant="secondary" icon={<ArrowIcon />}>
                Contribute
              </Button>
              <Button
                href="https://github.com/nuttyproducer/accountability-atlas"
                variant="ghost"
                icon={<ExternalIcon />}
                external
              >
                GitHub
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
