import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { PageIntro } from "../components/pages/PageIntro";
import { PageStatusNotice } from "../components/pages/PageStatusNotice";
import { PolicySection } from "../components/pages/PolicySection";
import { LastUpdated } from "../components/pages/LastUpdated";
import { PreviewNotice } from "../components/pages/PreviewNotice";
import { CorrectionLink } from "../components/pages/CorrectionLink";
import { ExternalLink } from "../components/ui/ExternalLink";
import { CitationGuide } from "../components/press/CitationGuide";

export default function PressPage() {
  return (
    <Container className="py-16 lg:py-20">
      <PageIntro
        eyebrow="Press & Resources"
        title="Press and Resources"
        description="How to understand, describe, cite, and represent Accountability Atlas. For journalists, researchers, contributors, and civic-tech reviewers."
      />

      <PageStatusNotice
        title="Public Static Beta"
        variant="info"
      >
        <p>
          Accountability Atlas is in public static beta. Content may include
          draft structures, structural previews, and reviewed public-source
          summaries. This page will be updated as the platform develops.
          Corrections and clarifications are welcome.
        </p>
      </PageStatusNotice>

      {/* 1. Project summary */}
      <PolicySection title="Project summary" id="project-summary" delay={0.15}>
        <p>
          Accountability Atlas is an independent open-source civic
          accountability project. It is being built as public infrastructure
          for organizing verified public evidence, tracking legal and political
          responsibility, and helping people take lawful action in response to
          genocide allegations, mass civilian harm, humanitarian obstruction,
          and atrocity crises.
        </p>
        <p>
          The platform starts with Gaza and the wider regional crisis. Its
          structure is intended to become reusable for other contexts where
          documentation is scattered, accountability is delayed, and public
          pressure needs better infrastructure.
        </p>
      </PolicySection>

      {/* 2. Current public status */}
      <PolicySection title="Current public status" id="public-status" delay={0.18}>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Phase:</strong> Public Static Beta — no backend, no
              database, no user accounts, no automated actions.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Licence:</strong> Code under AGPL-3.0-or-later. Content
              under CC BY-SA 4.0.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Repository:</strong>{" "}
              <ExternalLink href="https://github.com/nuttyproducer/accountability-atlas">
                github.com/nuttyproducer/accountability-atlas
              </ExternalLink>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Maintained by:</strong> Open-source contributors
              operating under a shared code of conduct and contribution
              guidelines. No single organizational affiliation.
            </span>
          </li>
        </ul>
      </PolicySection>

      {/* 3. Founder/project pitch */}
      <PolicySection title="Project pitch" id="pitch" delay={0.21}>
        <p>
          Accountability Atlas exists because the gap between what is
          documented and what the public can effectively act on is too wide.
          Courts, UN bodies, human-rights organisations, and journalists
          produce extensive public documentation of mass-atrocity and
          humanitarian-crisis contexts — but that documentation is scattered
          across dozens of websites, formats, and languages.
        </p>
        <p>
          This platform does not replace any of those institutions. It
          organises what they have already made public — linking sources,
          tracking legal and political accountability, and helping people
          find lawful, effective ways to act.
        </p>
        <p>
          The project starts with Gaza because the volume of public
          documentation is immense, the legal and institutional
          accountability questions are active in multiple jurisdictions, and
          the need for better civic infrastructure is urgent. The structure
          is designed to be reusable.
        </p>
      </PolicySection>

      {/* 4. What Accountability Atlas is */}
      <PolicySection title="What Accountability Atlas is" id="what-it-is" delay={0.24}>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              An independent open-source civic accountability project.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              A platform for organising verified public evidence, legal
              proceedings, humanitarian data, country accountability
              information, and lawful action routes.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              Built in public, with transparent methodology, source
              references, verification levels, content-status labels,
              correction processes, and clear legal terminology.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              Designed to separate evidence quality from editorial review
              status — an official source may support a summary that is still
              under editorial review.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              Currently in public static beta. Pages are structural
              skeletons, reviewed summaries, or source-linked previews — not
              a live data application.
            </span>
          </li>
        </ul>
      </PolicySection>

      {/* 5. What Accountability Atlas is not */}
      <PolicySection title="What Accountability Atlas is not" id="what-it-is-not" delay={0.27}>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>A court, legal authority, or legal adviser.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>A registered NGO, charity, or humanitarian organisation.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>A government body or official authority.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              A substitute for professional legal, humanitarian, or
              journalistic work.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              A witness-submission platform, evidence-upload tool, or
              sensitive-data repository.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              A live incident tracker, real-time map, or breaking-news service.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>A fundraising platform or donation processor.</span>
          </li>
        </ul>
      </PolicySection>

      {/* 6. Methodology and corrections */}
      <PolicySection title="Methodology and corrections" id="methodology" delay={0.30}>
        <p>
          The platform&rsquo;s{" "}
          <Link
            to="/methodology"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            methodology
          </Link>{" "}
          explains how sources are categorised, how verification levels work,
          how legal terminology is used, and how corrections are handled.
          The methodology is versioned and published in the project
          repository alongside the platform.
        </p>
        <p>
          Corrections are part of the trust model. The{" "}
          <Link
            to="/corrections"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            corrections process
          </Link>{" "}
          explains how to submit corrections for factual errors, outdated
          sources, legal wording issues, or misrepresentation.
        </p>
      </PolicySection>

      {/* 7. Citation guide */}
      <PolicySection title="Citation guide" id="citation" delay={0.33}>
        <p>
          When citing Accountability Atlas, please use the following format.
          This ensures readers can find the exact version of the page you
          referenced.
        </p>
        <CitationGuide exampleTitle="Methodology" exampleDate="2026-07-10" exampleUrl="https://accountabilityatlas.org/methodology" />
        <p className="mt-3">
          For pages with a &ldquo;Page structure last updated&rdquo; footer,
          use that date. For evidence records, cite the original source — not
          this platform&rsquo;s summary. The platform is a finding aid, not
          the primary source.
        </p>
      </PolicySection>

      {/* 8. Quote and representation policy */}
      <PolicySection title="Quote and representation policy" id="representation" delay={0.36}>
        <p>
          If you are writing about Accountability Atlas, please represent it
          accurately:
        </p>
        <ul className="space-y-2 mt-3">
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              Describe it as an independent open-source civic accountability
              project — not as a court, NGO, charity, or official authority.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              Note that it is in public static beta. Pages may include draft
              structures, structural previews, and reviewed public-source
              summaries.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              Do not describe the platform as having &ldquo;verified&rdquo;
              content unless the specific page or record carries an explicit
              reviewed/verified content status.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              No partnership, endorsement, approval, or affiliation with any
              listed organisation, institution, or individual is implied
              unless confirmed in writing by an authorised representative of
              both parties.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              If you are unsure about a representation, contact the project
              through GitHub before publishing.
            </span>
          </li>
        </ul>
      </PolicySection>

      {/* 9. Image and attribution guidance */}
      <PolicySection title="Image and attribution guidance" id="images" delay={0.39}>
        <p>
          Images used on the platform are open-licensed or permission-cleared
          materials used to support public understanding without
          sensationalism. Every image has a record on the{" "}
          <Link
            to="/attributions"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            attributions page
          </Link>
          , including author, source, licence, modifications, and where it is
          used.
        </p>
        <p>
          If you reproduce an image from this platform, you must comply with
          the image&rsquo;s original licence terms — not this platform&rsquo;s
          content licence. Most images are licensed under Creative Commons
          licences requiring attribution to the original creator. Attribution
          details are on the attributions page.
        </p>
      </PolicySection>

      {/* 10. Brand assets status */}
      <PolicySection title="Brand assets" id="brand-assets" delay={0.42}>
        <div className="bg-bone border border-border rounded-md p-5">
          <p className="text-sm text-charcoal/75 leading-relaxed">
            <strong>Downloadable brand assets are not yet available.</strong>{" "}
            The logo mark and wordmark are original works created for
            Accountability Atlas and licensed under CC BY-SA 4.0. When the
            platform moves beyond the public static beta phase, a brand
            assets package — including SVG, PNG, and usage guidelines — will
            be published.
          </p>
          <p className="text-sm text-charcoal/75 leading-relaxed mt-3">
            In the meantime, the logo mark (SVG) can be found in the project
            repository at{" "}
            <code className="font-mono text-xs bg-ink/5 px-1.5 py-0.5 rounded-sm">
              src/assets/logo-mark.svg
            </code>
            . Please follow the{" "}
            <Link
              to="/attributions"
              className="text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
            >
              attribution guidance
            </Link>{" "}
            when using any project assets.
          </p>
        </div>
      </PolicySection>

      {/* 11. Contact and review requests */}
      <PolicySection title="Contact and review requests" id="contact" delay={0.45}>
        <p>
          During the public static beta, the preferred contact method is
          through the project&rsquo;s public channels:
        </p>
        <ul className="space-y-2 mt-3">
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>GitHub Issues — </strong>
              <ExternalLink href="https://github.com/nuttyproducer/accountability-atlas/issues">
                github.com/nuttyproducer/accountability-atlas/issues
              </ExternalLink>
              . For corrections, suggestions, bug reports, and
              clarifications. This is the preferred method during the static
              beta.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Corrections process — </strong>
              <Link
                to="/corrections"
                className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
              >
                /corrections
              </Link>
              . For factual errors, outdated sources, unsafe information,
              mistranslations, or attribution issues.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Contribution inquiries — </strong>
              <Link
                to="/contribute"
                className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
              >
                /contribute
              </Link>
              . For developers, designers, researchers, reviewers, writers,
              and translators.
            </span>
          </li>
        </ul>
        <div className="bg-bone border border-border rounded-md p-5 mt-5">
          <p className="text-sm text-charcoal/75 leading-relaxed">
            <strong>No dedicated press email has been configured yet.</strong>{" "}
            A press contact route will be added before wider public release.
            In the meantime, please use GitHub Issues for press inquiries and
            representation questions. The project maintainers monitor the
            repository and will respond as capacity allows.
          </p>
        </div>
      </PolicySection>

      {/* 12. Known limitations */}
      <PolicySection title="Known limitations" id="limitations" delay={0.48}>
        <p>
          Journalists and researchers should be aware of the following when
          using or referencing this platform:
        </p>
        <ul className="space-y-2 mt-3">
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Static beta.</strong> The platform is not a live
              application. Pages are static previews and may not reflect
              current events in real time. Check the &ldquo;Page structure
              last updated&rdquo; date on each page.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>No original reporting.</strong> The platform organises
              and links to public documentation. It does not conduct original
              investigations, field reporting, or witness interviews.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Source-linked, not source-verified.</strong> Evidence
              records reference public sources with verification levels, but
              not all summaries have completed editorial review. Check the
              content status on each record.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>No real-time data.</strong> The platform does not
              maintain live casualty figures, conflict-event tracking, or
              automated data feeds.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Limited jurisdiction coverage.</strong> Country
              accountability pages are structural skeletons. Most
              jurisdictions are not yet covered.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Small contributor team.</strong> Corrections, reviews,
              and updates may be delayed. The project welcomes additional
              contributors.
            </span>
          </li>
        </ul>
      </PolicySection>

      <PreviewNotice title="This page will be updated as the platform develops">
        The Press and Resources page reflects the current public static beta
        phase. It will be updated when brand assets are published, a press
        contact route is configured, and the platform moves toward wider
        public release. Suggestions for additional information useful to
        journalists and researchers are welcome.
      </PreviewNotice>

      <CorrectionLink />
      <LastUpdated date="2026-07-12" />
    </Container>
  );
}
