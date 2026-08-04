import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Reveal } from "../components/ui/Reveal";
import { Badge } from "../components/ui/Badge";
import { Button, ArrowIcon } from "../components/ui/Button";
import { PageIntro } from "../components/pages/PageIntro";
import { PageStatusNotice } from "../components/pages/PageStatusNotice";
import { PolicySection } from "../components/pages/PolicySection";
import { LastUpdated } from "../components/pages/LastUpdated";
import { ExternalLink } from "../components/ui/ExternalLink";

const correctionCategories = [
  "Factual error",
  "Outdated source",
  "Wrong location or date",
  "Unsafe personal information",
  "Mistranslation",
  "Legal wording issue",
  "Broken link",
  "Duplicate item",
  "Misleading framing",
  "Attribution or license issue",
];

const includeInRequest = [
  "The specific page or section where the issue appears",
  "A clear description of the error or issue",
  "A suggested correction if you have one",
  "A source or reference that supports the correction",
  "Your preferred contact method for follow-up (optional)",
];

const doNotInclude = [
  "Sensitive witness information",
  "Private personal data of yourself or others",
  "Confidential or classified material",
  "Graphic content without a content warning",
  "Unverified social media posts as sole evidence",
];

export function CorrectionsPage() {
  return (
    <div className="py-24 lg:py-32">
      <Container>
        <div className="max-w-3xl mx-auto">
          <PageIntro
            eyebrow="Corrections"
            title="Corrections are part of the trust model."
            description="Accountability Atlas welcomes corrections when information is inaccurate, outdated, unsafe, mistranslated, misleading, or missing important context."
          />

          <PageStatusNotice label="Static process" variant="info">
            <p>
              During the public static beta, corrections can be submitted
              through GitHub issues or the public project contact route. A
              dedicated correction email will be added before wider public
              release.
            </p>
          </PageStatusNotice>

          {/* Correction categories */}
          <PolicySection title="What can be corrected" id="categories" delay={0.15}>
            <p>Corrections are welcome for any of the following:</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {correctionCategories.map((cat) => (
                <Badge key={cat} variant="neutral">
                  {cat}
                </Badge>
              ))}
            </div>
          </PolicySection>

          {/* How to submit */}
          <PolicySection title="How to submit a correction" id="how-to-submit" delay={0.18}>
            <p>
              During the public static beta, corrections can be submitted
              through:
            </p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>
                  <strong>GitHub Issues</strong> — open an issue on the{" "}
                  <ExternalLink href="https://github.com/nuttyproducer/accountability-atlas/issues">
                    public repository
                  </ExternalLink>
                  . This is the preferred method during the static beta.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>
                  <strong>Project contact</strong> — a dedicated public contact
                  route will be listed on the{" "}
                  <Link
                    to="/contribute"
                    className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm transition-colors duration-200"
                  >
                    Contribute
                  </Link>{" "}
                  page when available.
                </span>
              </li>
            </ul>
            <div className="bg-bone border border-amber/20 rounded-md p-5 mt-4">
              <p className="text-base text-charcoal/75 leading-relaxed">
                <strong>Important:</strong> Do not submit sensitive witness
                information, private personal data, or confidential material
                through public GitHub issues.
              </p>
            </div>
          </PolicySection>

          {/* What to include */}
          <PolicySection title="What to include in a correction request" id="what-to-include" delay={0.21}>
            <ul className="space-y-2">
              {includeInRequest.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </PolicySection>

          {/* What NOT to include */}
          <PolicySection title="What not to include" id="what-not-to-include" delay={0.24}>
            <ul className="space-y-2">
              {doNotInclude.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </PolicySection>

          {/* Review and limitations */}
          <PolicySection title="Review and limitations" id="review" delay={0.27}>
            <p>
              During the public static beta, correction reviews may be delayed.
              The platform is maintained by a small team of contributors and
              every correction is reviewed for accuracy and safety before being
              applied.
            </p>
            <p>
              Not every suggestion will result in an immediate change — some
              corrections may require source verification, legal review, or
              consultation with subject-matter reviewers.
            </p>
          </PolicySection>

          {/* Public correction log */}
          <PolicySection title="Public correction log" id="correction-log" delay={0.30}>
            <p>
              When the platform moves beyond the static beta phase, major
              corrections will be logged publicly to maintain transparency. At
              this stage, correction records are maintained through the public
              GitHub issue tracker.
            </p>
          </PolicySection>

          {/* Links */}
          <Reveal delay={0.33}>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border mt-10">
              <Button
                href="https://github.com/nuttyproducer/accountability-atlas/issues/new"
                variant="primary"
                external
              >
                Submit a Correction on GitHub
              </Button>
              <Button to="/methodology" variant="secondary" icon={<ArrowIcon />}>
                Read the Methodology
              </Button>
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
