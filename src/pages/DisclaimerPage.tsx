import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Reveal } from "../components/ui/Reveal";
import { Button, ArrowIcon } from "../components/ui/Button";
import { PageIntro } from "../components/pages/PageIntro";
import { PageStatusNotice } from "../components/pages/PageStatusNotice";
import { PolicySection } from "../components/pages/PolicySection";
import { LastUpdated } from "../components/pages/LastUpdated";
import { ExternalLink } from "../components/ui/ExternalLink";

export function DisclaimerPage() {
  return (
    <div className="py-24 lg:py-32">
      <Container>
        <div className="max-w-3xl mx-auto">
          <PageIntro
            eyebrow="Disclaimer"
            title="Public disclaimer."
          />

          <PageStatusNotice label="Public disclaimer draft" variant="warning">
            <p>
              This disclaimer is an active draft. It will be reviewed before
              wider public release and updated as the platform scope develops.
            </p>
          </PageStatusNotice>

          {/* Main disclaimer */}
          <Reveal delay={0.15}>
            <div className="bg-bone border border-border rounded-lg p-7 lg:p-9 mb-10">
              <div className="text-charcoal/80 leading-relaxed space-y-5 text-base lg:text-lg">
                <p>
                  Accountability Atlas is an independent open-source civic
                  documentation and accountability project. It is currently in
                  public static beta and is not a registered NGO, charity,
                  court, humanitarian organization, legal authority, or formal
                  partner of any listed organization unless explicitly stated.
                </p>

                <p>
                  The platform does not provide legal advice. It does not
                  replace courts, journalists, humanitarian organizations, legal
                  professionals, or affected communities.
                </p>

                <p>
                  The project does not promote violence, hatred, harassment,
                  doxing, antisemitism, Islamophobia, racism, or collective
                  blame. Its purpose is to organize verified public evidence,
                  support lawful civic action, amplify humanitarian needs, and
                  strengthen accountability under international law.
                </p>

                <p>
                  Public pages may include static previews, draft structures,
                  and source-linked summaries. Corrections are welcome.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Detailed sections */}
          <PolicySection title="Independent project" id="independent" delay={0.18}>
            <p>
              Accountability Atlas is an independent open-source project. It is
              not affiliated with any government, political party, religious
              organization, or advocacy group. The project is maintained by
              contributors who operate under a shared code of conduct,
              contribution guidelines, and safety principles.
            </p>
          </PolicySection>

          <PolicySection title="No legal advice" id="no-legal-advice" delay={0.21}>
            <p>
              Nothing on this platform constitutes legal advice. Legal
              information — such as summaries of court proceedings, legal
              terminology explanations, or references to international law — is
              provided for public educational purposes only. Users who need
              legal advice should consult a qualified legal professional.
            </p>
          </PolicySection>

          <PolicySection title="No partnership implied" id="no-partnership" delay={0.24}>
            <p>
              Listing an organization, institution, or individual on this
              platform does not imply endorsement, partnership, affiliation, or
              formal relationship unless explicitly stated. Organizations are
              listed for informational and reference purposes within the
              accountability framework.
            </p>
          </PolicySection>

          <PolicySection title="External links" id="external-links" delay={0.27}>
            <p>
              This platform links to external websites, documents, and
              resources. Accountability Atlas is not responsible for the
              content, accuracy, or practices of external sites. External links
              do not constitute endorsement.
            </p>
          </PolicySection>

          <PolicySection title="No sensitive submissions" id="no-submissions" delay={0.30}>
            <p>
              During the public static beta, the platform does not accept
              witness testimony, evidence uploads, or sensitive personal data.
              Do not submit sensitive or confidential material through public
              channels such as GitHub issues.
            </p>
          </PolicySection>

          <PolicySection title="Corrections welcome" id="corrections" delay={0.33}>
            <p>
              If you believe information on this platform is inaccurate,
              outdated, misleading, or otherwise problematic, please use the{" "}
              <Link
                to="/corrections"
                className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm transition-colors duration-200"
              >
                corrections process
              </Link>
              . The project is committed to accuracy and transparency.
            </p>
          </PolicySection>

          <PolicySection title="Lawful use only" id="lawful-use" delay={0.36}>
            <p>
              This platform is designed to support lawful civic action,
              documentation, and accountability. It must not be used to
              encourage, coordinate, or facilitate harassment, violence,
              intimidation, doxing, illegal activity, or collective blame.
            </p>
          </PolicySection>

          {/* Related */}
          <PolicySection title="Related policies" id="related" delay={0.39}>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm transition-colors duration-200"
                >
                  Privacy policy →
                </Link>
              </li>
              <li>
                <Link
                  to="/methodology"
                  className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm transition-colors duration-200"
                >
                  Methodology →
                </Link>
              </li>
              <li>
                <Link
                  to="/corrections"
                  className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm transition-colors duration-200"
                >
                  Corrections →
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
          <Reveal delay={0.42}>
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
