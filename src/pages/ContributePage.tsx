import { Container } from "../components/ui/Container";
import { Reveal } from "../components/ui/Reveal";
import { Button, ExternalIcon, ArrowIcon } from "../components/ui/Button";

const roleCategories = [
  {
    title: "Developers",
    description:
      "Frontend, backend, data engineering, and security. TypeScript, Python, or experience with civic-tech tools.",
  },
  {
    title: "Designers",
    description:
      "UI/UX, information architecture, accessibility, and visual design for public-interest tools.",
  },
  {
    title: "Researchers",
    description:
      "Open-source intelligence, legal research, human rights documentation, policy analysis.",
  },
  {
    title: "Reviewers",
    description:
      "Legal, human-rights, security, and editorial review of evidence, copy, and methodology.",
  },
  {
    title: "Writers & Translators",
    description:
      "Documentation, methodology writing, translation, and plain-language summaries.",
  },
];

export function ContributePage() {
  return (
    <div className="py-24 lg:py-32">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <p className="font-mono text-xs font-medium tracking-[0.15em] uppercase text-charcoal/60 mb-4">
              Contribute
            </p>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-ink mb-4">
              Help Build the Platform
            </h1>
            <div className="w-10 h-px bg-border mb-8" aria-hidden="true" />
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-lg text-charcoal/80 leading-relaxed mb-10">
              Accountability Atlas is an open-source project building
              infrastructure against genocide and mass atrocities. We welcome
              developers, designers, researchers, legal and human-rights
              reviewers, OSINT/source-verification people, security auditors,
              writers, and translators. Every contribution is reviewed for
              safety and accuracy.
            </p>
          </Reveal>

          {/* Role categories */}
          <Reveal delay={0.15}>
            <section className="mb-10" aria-labelledby="roles-heading">
              <h2 id="roles-heading" className="font-serif text-2xl font-semibold text-ink mb-6">
                Contributor Roles
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roleCategories.map((role) => (
                  <div
                    key={role.title}
                    className="bg-bone border border-border rounded-lg p-5"
                  >
                    <h3 className="font-serif text-lg font-semibold text-ink mb-2">
                      {role.title}
                    </h3>
                    <p className="text-sm text-charcoal/80 leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          {/* Before contributing */}
          <Reveal delay={0.2}>
            <section className="mb-10" aria-labelledby="before-heading">
              <h2 id="before-heading" className="font-serif text-2xl font-semibold text-ink mb-4">
                Before You Start
              </h2>
              <p className="text-charcoal/80 leading-relaxed mb-4">
                Please read these documents before contributing. They define
                how we work together safely and effectively.
              </p>
              <ul className="space-y-2">
                {[
                  { label: "Contribution Guide", href: "https://github.com/nuttyproducer/accountability-atlas/blob/main/CONTRIBUTING.md" },
                  { label: "Code of Conduct", href: "https://github.com/nuttyproducer/accountability-atlas/blob/main/CODE_OF_CONDUCT.md" },
                  { label: "Security Policy", href: "https://github.com/nuttyproducer/accountability-atlas/blob/main/SECURITY.md" },
                  { label: "Open Roles", href: "https://github.com/nuttyproducer/accountability-atlas/blob/main/docs/open-roles.md" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200"
                    >
                      {link.label}
                      <ExternalIcon />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>

          {/* Links */}
          <Reveal delay={0.25}>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
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
              <Button to="/" variant="ghost" icon={<ArrowIcon />}>
                Back home
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
