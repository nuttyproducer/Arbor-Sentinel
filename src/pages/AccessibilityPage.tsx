import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Reveal } from "../components/ui/Reveal";
import { Button, ArrowIcon } from "../components/ui/Button";
import { PageIntro } from "../components/pages/PageIntro";
import { PageStatusNotice } from "../components/pages/PageStatusNotice";
import { PolicySection } from "../components/pages/PolicySection";
import { LastUpdated } from "../components/pages/LastUpdated";
import { ExternalLink } from "../components/ui/ExternalLink";

const commitments = [
  {
    title: "WCAG 2.2 AA target",
    desc: "The platform targets Web Content Accessibility Guidelines (WCAG) 2.2 Level AA conformance. Full conformance auditing will be completed before wider public release.",
  },
  {
    title: "Keyboard navigation",
    desc: "All interactive elements should be reachable and operable using a keyboard. Focus order should follow a logical sequence.",
  },
  {
    title: "Visible focus states",
    desc: "Keyboard focus is indicated with visible focus rings on all interactive elements. If you encounter an element without a visible focus indicator, please report it.",
  },
  {
    title: "Readable typography",
    desc: "The platform uses IBM Plex Serif for headings, Inter for body text, and IBM Plex Mono for labels — all designed for legibility. Text sizing uses relative units and respects browser zoom.",
  },
  {
    title: "Color contrast",
    desc: "Text and interactive elements are designed to meet WCAG AA contrast minimums. If you encounter low-contrast text, please report it.",
  },
  {
    title: "Alt text for meaningful images",
    desc: "Images that convey information include descriptive alt text. Purely decorative images are marked as decorative.",
  },
  {
    title: "Low-graphic display mode",
    desc: "A privacy-safe local preference (standard / low-graphic) lets you replace contextual documentary images with calm non-graphic surfaces. All text and functionality are preserved. The preference is stored only in your browser — no account is needed. Toggle it from the Display button in the header.",
  },
  {
    title: "Reduced motion support",
    desc: "Animations respect the prefers-reduced-motion browser setting. When enabled, scroll-triggered reveals and motion effects are disabled.",
  },
  {
    title: "Mobile responsiveness",
    desc: "Pages are designed to adapt to different screen sizes and orientations — from mobile phones to large desktop displays.",
  },
];

const knownLimitations = [
  "The platform is in static beta — some pages may have incomplete content structures that affect screen-reader navigation.",
  "Full WCAG 2.2 AA audit has not yet been completed by an external accessibility specialist.",
  "Some interactive components (such as the roadmap carousel) may require additional screen-reader testing.",
  "Content in languages other than English is not yet available, which may affect comprehension for non-English speakers.",
  "A trauma-informed design review is planned for a future phase but has not yet been conducted.",
];

export function AccessibilityPage() {
  return (
    <div className="py-24 lg:py-32">
      <Container>
        <div className="max-w-3xl mx-auto">
          <PageIntro
            eyebrow="Accessibility"
            title="Accessibility commitment."
            description="Accountability Atlas aims to be usable by people with different devices, abilities, languages, bandwidth constraints, and motion preferences."
          />

          <PageStatusNotice label="Accessibility commitment" variant="info">
            <p>
              The project is still in static beta. Accessibility issues should
              be reported through GitHub issues or the project correction route.
            </p>
          </PageStatusNotice>

          {/* Commitments */}
          <PolicySection title="What we commit to" id="commitments" delay={0.15}>
            <div className="space-y-4">
              {commitments.map((item, i) => (
                <div
                  key={i}
                  className="bg-bone border border-border rounded-md p-5"
                >
                  <h3 className="font-serif text-lg font-semibold text-ink mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-charcoal/70 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </PolicySection>

          {/* Future direction */}
          <PolicySection title="Future direction" id="future" delay={0.18}>
            <p>
              As the platform develops, we plan to address:
            </p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>
                  <strong>Trauma-informed design review</strong> —
                  expert review of content presentation for contexts involving
                  atrocity documentation and humanitarian crisis reporting.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>
                  <strong>Multilingual support</strong> — content availability
                  in languages beyond English, prioritising languages relevant to
                  the regions covered.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>
                  <strong>External accessibility audit</strong> — formal
                  conformance review by an accessibility specialist.
                </span>
              </li>
            </ul>
          </PolicySection>

          {/* Known limitations */}
          <PolicySection title="Known limitations" id="limitations" delay={0.21}>
            <ul className="space-y-2">
              {knownLimitations.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-clay mt-1.5 flex-shrink-0" aria-hidden="true">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </PolicySection>

          {/* Report issues */}
          <PolicySection title="Report an accessibility issue" id="report" delay={0.24}>
            <p>
              Accessibility issues can be reported through:
            </p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>
                  <ExternalLink href="https://github.com/nuttyproducer/accountability-atlas/issues/new">
                    GitHub Issues
                  </ExternalLink>{" "}
                  — preferred during the static beta
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>
                  The{" "}
                  <Link
                    to="/corrections"
                    className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm transition-colors duration-200"
                  >
                    corrections process
                  </Link>
                </span>
              </li>
            </ul>
          </PolicySection>

          {/* Links */}
          <Reveal delay={0.27}>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border mt-10">
              <Button to="/" variant="ghost" icon={<ArrowIcon />}>
                Back home
              </Button>
            </div>
          </Reveal>

          <LastUpdated date="2026-07-10" />
        </div>
      </Container>
    </div>
  );
}
