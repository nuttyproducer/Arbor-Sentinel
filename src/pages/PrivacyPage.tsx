import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Reveal } from "../components/ui/Reveal";
import { Button, ArrowIcon } from "../components/ui/Button";
import { PageIntro } from "../components/pages/PageIntro";
import { PageStatusNotice } from "../components/pages/PageStatusNotice";
import { PolicySection } from "../components/pages/PolicySection";
import { LastUpdated } from "../components/pages/LastUpdated";
import { ExternalLink } from "../components/ui/ExternalLink";

const doesNotCollect = [
  "No user accounts",
  "No witness submissions",
  "No evidence uploads",
  "No political-profile data",
  "No email message content",
  "No representative response data",
  "No donation or payment data",
];

const mayExist = [
  "Hosting provider access logs (standard for all websites)",
  "GitHub contribution records (public by nature of open-source contribution)",
  "Browser requests to external links (standard web behavior)",
];

export function PrivacyPage() {
  return (
    <div className="py-24 lg:py-32">
      <Container>
        <div className="max-w-3xl mx-auto">
          <PageIntro
            eyebrow="Privacy"
            title="Privacy in the public static beta."
            description="The current version of Accountability Atlas is designed to avoid collecting sensitive personal data."
          />

          <PageStatusNotice label="Public static beta policy" variant="info">
            <p>
              This privacy description applies to the current static beta. It
              will be updated before any data-collecting features are introduced.
            </p>
          </PageStatusNotice>

          {/* What we do not collect */}
          <PolicySection title="What we do not collect at this stage" id="no-collect" delay={0.15}>
            <p>
              The platform is intentionally built as a static site during the
              beta phase. We do not operate features that would collect:
            </p>
            <ul className="space-y-2 mt-3">
              {doesNotCollect.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </PolicySection>

          {/* What may exist technically */}
          <PolicySection title="What may exist technically" id="technical" delay={0.18}>
            <p>
              Even without intentional data collection, some technical records
              may exist as part of normal web infrastructure:
            </p>
            <ul className="space-y-2 mt-3">
              {mayExist.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </PolicySection>

          {/* Analytics */}
          <PolicySection title="Analytics" id="analytics" delay={0.21}>
            <p>
              At this stage, the project does not use analytics, tracking
              scripts, or third-party data collection tools.
            </p>
            <p>
              If privacy-first analytics are introduced later, this policy will
              be updated before those tools are deployed, and details about what
              is collected, how it is stored, and how to opt out will be
              published here.
            </p>
          </PolicySection>

          {/* Third-party requests and font delivery */}
          <PolicySection title="Third-party requests and fonts" id="third-party" delay={0.23}>
            <p>
              During the public static beta, the platform makes no third-party
              browser requests by default.
            </p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>
                  <strong>Fonts are self-hosted.</strong> IBM Plex Serif, IBM
                  Plex Mono, and Inter are served from the platform&rsquo;s own
                  domain using the <code className="font-mono text-xs bg-ink/5 px-1 py-0.5 rounded-sm">@fontsource</code> package. No requests are
                  made to Google Fonts or any external font provider.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>
                  <strong>No analytics or tracking scripts.</strong> No
                  third-party JavaScript is loaded.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>
                  <strong>No embedded content from third parties.</strong> Maps,
                  videos, social-media embeds, and iframes are not used.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>
                  <strong>External links are plain anchors.</strong> When you
                  click an external link, your browser navigates to that site.
                  The platform does not track or redirect through intermediary
                  URLs.
                </span>
              </li>
            </ul>
          </PolicySection>

          {/* External links */}
          <PolicySection title="External links" id="external-links" delay={0.24}>
            <p>
              This site links to external websites including GitHub, Wikimedia
              Commons, and referenced source websites. External websites have
              their own privacy policies and data practices. Accountability
              Atlas is not responsible for the privacy practices of external
              sites.
            </p>
          </PolicySection>

          {/* Future changes */}
          <PolicySection title="Future changes" id="future-changes" delay={0.27}>
            <p>
              If corrections, analytics, backend records, or contact forms are
              introduced later, this policy must be updated before those
              features launch. Users will be notified of material changes
              through the platform changelog and repository updates.
            </p>
          </PolicySection>

          {/* Related */}
          <PolicySection title="Related policies" id="related" delay={0.30}>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/disclaimer"
                  className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm transition-colors duration-200"
                >
                  Public disclaimer →
                </Link>
              </li>
              <li>
                <Link
                  to="/accessibility"
                  className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm transition-colors duration-200"
                >
                  Accessibility commitment →
                </Link>
              </li>
              <li>
                <ExternalLink href="https://github.com/nuttyproducer/accountability-atlas/blob/main/SECURITY.md">
                  Security policy
                </ExternalLink>
              </li>
            </ul>
          </PolicySection>

          {/* Links */}
          <Reveal delay={0.33}>
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
