import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Reveal } from "../components/ui/Reveal";
import { Badge } from "../components/ui/Badge";
import { Button, ArrowIcon } from "../components/ui/Button";
import { PageIntro } from "../components/pages/PageIntro";
import { PageStatusNotice } from "../components/pages/PageStatusNotice";
import { PolicySection } from "../components/pages/PolicySection";
import { LastUpdated } from "../components/pages/LastUpdated";
import { PrintHeader, PrintFooter } from "../components/pages/PrintOnly";
import {
  VERIFICATION_LEVEL_LABELS,
  LEGAL_STATUS_LABELS,
  SOURCE_TYPE_LABELS,
  type VerificationLevel,
} from "../types/content";
import { sourceHierarchy } from "../components/methodology/sourceHierarchyData";
import { PublicationWorkflow } from "../components/methodology/PublicationWorkflow";
import { CitationGuide } from "../components/press/CitationGuide";

const notActiveItems = [
  "No witness submissions accepted",
  "No evidence uploads from the public",
  "No live incident map or real-time tracking",
  "No country ranking or scoring",
  "No public user accounts or profiles",
  "No direct fundraising on the platform",
  "No automated email or message sending",
  "No representative/district lookup tool",
];

export function MethodologyPage() {
  return (
    <div className="py-24 lg:py-32">
      <Container>
        <div className="max-w-3xl mx-auto methodology-print">
          {/* ── Print header (visible only when printing) ────────────────── */}
          <PrintHeader
            title="Methodology"
            version={1}
            status="Active draft"
            dates="Last updated: 2026-07-12"
            extraLines={["Evidence, sources, verification, and review methodology for the platform."]}
          />

          <PageIntro
            eyebrow="Methodology"
            title="How Accountability Atlas works with evidence."
            description="The methodology explains how the platform separates sources, leads, allegations, legal findings, humanitarian reporting, advocacy language, and reviewed public evidence. This is an active draft — it will be updated as the platform develops."
          />

          <PageStatusNotice label="Active draft" variant="warning">
            <p>
              This methodology is an active draft and will be updated as the
              platform develops through the public static beta. It has not been
              externally reviewed by legal or humanitarian organisations. The
              full versioned methodology is also published in the project
              repository. Corrections and suggestions are welcome.
            </p>
          </PageStatusNotice>

          {/* 1. Mission and scope */}
          <PolicySection title="Mission and scope" id="mission-scope" delay={0.15}>
            <p>
              Accountability Atlas is an independent open-source civic
              accountability project being built to organize verified public
              evidence, legal and humanitarian sources, country accountability
              information, and lawful action pathways.
            </p>
            <p>
              The platform begins with Gaza and the wider regional humanitarian
              crisis. The structure is intended to become reusable for other
              mass-atrocity and humanitarian-crisis contexts after local, legal,
              and security review.
            </p>
            <p>
              The platform is not a court, a legal adviser, a registered NGO,
              a charity, a humanitarian organisation, or an official authority.
              It does not conduct original field investigations. It organises
              what others have made public — linking sources, tracking
              accountability, and helping people act lawfully on documented
              information.
            </p>
          </PolicySection>

          {/* 2. Source hierarchy */}
          <PolicySection title="Source hierarchy" id="source-hierarchy" delay={0.18}>
            <p>
              Sources are organised in a structured hierarchy — not all sources
              carry the same weight for every question. The platform separates
              court records from advocacy reports, UN findings from news
              coverage, and verified documentation from unverified leads.
            </p>
            <p>
              <strong>This hierarchy is contextual.</strong> A humanitarian
              organisation&rsquo;s report may be the strongest available source
              for questions about aid access restrictions, even though it ranks
              below a court record in the general hierarchy. A court filing
              proves what a party argued or a court ordered — it does not
              automatically verify every factual claim recited within it.
              Editorial judgment determines which source carries the most
              weight for a specific claim.
            </p>
            <div className="space-y-2 mt-4">
              {sourceHierarchy.map((item) => (
                <div
                  key={item.tier}
                  className="flex items-start gap-3 bg-bone border border-border rounded-md p-4"
                >
                  <span className="font-mono text-xs font-medium text-charcoal/40 w-5 flex-shrink-0 mt-0.5">
                    {item.tier}
                  </span>
                  <div>
                    <Badge variant={item.tier <= 3 ? "info" : item.tier <= 6 ? "neutral" : "warning"}>
                      {SOURCE_TYPE_LABELS[item.sourceType]}
                    </Badge>
                    <p className="text-sm text-charcoal/60 leading-relaxed mt-1.5">
                      {item.notes}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </PolicySection>

          {/* 3. Verification levels */}
          <PolicySection title="Verification levels" id="verification-levels" delay={0.21}>
            <p>
              Every piece of evidence is assigned a verification level. This
              system tells readers how confident the platform is in each source.
              Verification level describes the <strong>source quality</strong> —
              it is separate from editorial content status, which describes
              whether the platform&rsquo;s own summary has been reviewed.
            </p>
            <p>
              An item at verification level 5 (legal/institutional record) may
              still have a content status of <em>review_pending</em> if the
              platform&rsquo;s written summary has not yet completed editorial
              review. Do not describe a record as &ldquo;verified&rdquo; unless
              both dimensions support that word.
            </p>
            <div className="space-y-3 mt-4">
              {([0, 1, 2, 3, 4, 5] as VerificationLevel[]).map((level) => (
                <div
                  key={level}
                  className={`bg-bone border rounded-md p-5 ${
                    level <= 1 ? "border-amber/30" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm font-medium text-charcoal/50">
                      Level {level}
                    </span>
                    <span className="font-serif text-lg font-semibold text-ink">
                      {VERIFICATION_LEVEL_LABELS[level]}
                    </span>
                    {level <= 1 && (
                      <Badge variant="warning">Lead only</Badge>
                    )}
                  </div>
                  <p className="text-sm text-charcoal/70 leading-relaxed pl-0">
                    {level === 0
                      ? "Raw information that has not yet been reviewed by the platform. Not suitable for publication. Preserved for internal review only."
                      : level === 1
                        ? "Information that has been saved for review but not yet checked against any public source. Not published as evidence."
                        : level === 2
                          ? "Information verified against at least one documented public source with a URL, publisher, and access date."
                          : level === 3
                            ? "Information confirmed by multiple independent sources or documentation types — for example, a news report corroborated by a UN situation update and a humanitarian organisation statement."
                            : level === 4
                              ? "Information verified by an established human-rights, legal, or humanitarian organisation with a published methodology."
                              : "Official court record, UN document, or formal institutional finding. The highest verification level. The source is authoritative — the platform&rsquo;s summary may still be under editorial review."}
                  </p>
                </div>
              ))}
            </div>
          </PolicySection>

          {/* 4. Legal status labels */}
          <PolicySection title="Legal status labels" id="legal-status" delay={0.24}>
            <p>
              The platform uses a controlled vocabulary of legal status labels
              to describe the procedural posture of legal proceedings,
              allegations, and findings. These labels are applied to evidence
              records, legal-tracker entries, and country/institution pages.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.entries(LEGAL_STATUS_LABELS).map(([key, label]) => (
                <Badge key={key} variant="neutral">
                  {label}
                </Badge>
              ))}
            </div>
          </PolicySection>

          {/* 5. Genocide terminology policy */}
          <PolicySection title="Genocide terminology policy" id="genocide-terms" delay={0.27}>
            <p>
              The word <em>genocide</em> may be used on this platform only when
              attributed to a specific legal proceeding, court filing, UN or
              NGO finding, or named expert/legal determination. The platform
              must not imply that a final judicial determination of genocide
              has been made where one has not occurred.
            </p>
            <p>
              When reporting on genocide allegations, the platform will:
            </p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Attribute the allegation to the specific body or proceeding that made it.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>State the procedural posture — provisional measures, merits phase, final judgment, or appeal.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Distinguish between a finding that a state has obligations under the Genocide Convention and a finding that genocide has occurred.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Not use the word as a general descriptor or rhetorical device unattributed to a legal or institutional source.</span>
              </li>
            </ul>
          </PolicySection>

          {/* 6. What qualifies as evidence */}
          <PolicySection title="What qualifies as evidence" id="what-is-evidence" delay={0.30}>
            <p>
              For the purpose of this platform, <strong>evidence</strong> is
              information that has been checked against at least one documented
              public source (verification level 2 or above) and that has clear
              provenance — a publisher, a publication date, a URL or archive
              reference, and an access date.
            </p>
            <p>An evidence record on this platform includes:</p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span><strong>The source.</strong> What document, report, or record — with a link or archive reference.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span><strong>The summary.</strong> A factual, one-paragraph description of what the source contains — not an editorial conclusion.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span><strong>The source-quality level.</strong> How the source ranks in the verification hierarchy.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span><strong>The editorial status.</strong> Whether the platform&rsquo;s summary has completed review.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span><strong>Legal status labels.</strong> If applicable — what legal proceeding, finding, or determination is involved.</span>
              </li>
            </ul>
          </PolicySection>

          {/* 7. What is only a lead */}
          <PolicySection title="What is only a lead" id="what-is-a-lead" delay={0.33}>
            <p>
              A <strong>lead</strong> is information that has not yet been
              checked against a documented public source. Leads include:
            </p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Social media posts that may indicate an event worth investigating.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>News reports that have not yet been cross-referenced.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Tips, suggestions, or references submitted by contributors that lack a public source.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Documents whose provenance has not yet been confirmed.</span>
              </li>
            </ul>
            <p className="mt-4">
              Leads are assigned verification level 0 (unreviewed) or 1
              (preserved). They are <strong>not published</strong> as evidence
              records. They are preserved for internal review and may be
              promoted to evidence status after source checking and editorial
              review. Social media is never automatically treated as verified
              proof — it may help discover events or preserve leads, but
              publication requires context, corroboration, and safety review.
            </p>
          </PolicySection>

          {/* 8. Publication and review workflow */}
          <PolicySection title="Publication and review workflow" id="workflow" delay={0.36}>
            <p>
              Every piece of information follows a defined path before it
              appears as a published evidence record. The workflow is designed
              to keep source quality and editorial review separate at every
              stage.
            </p>
            <PublicationWorkflow />
          </PolicySection>

          {/* 9. Corrections and disputes */}
          <PolicySection title="Corrections and disputes" id="corrections" delay={0.39}>
            <p>
              Corrections are part of the trust model. If any page, evidence
              record, or source summary is inaccurate, outdated, unsafe,
              mistranslated, misleading, or missing important context, readers
              can submit a correction through the{" "}
              <Link
                to="/corrections"
                className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm transition-colors duration-200"
              >
                corrections process
              </Link>
              .
            </p>
            <p>
              When a correction is submitted, the relevant record&rsquo;s
              content status is updated to <em>disputed</em> while the
              correction is reviewed. If the correction is accepted, the
              record is updated with a new version number and the content
              status changes to <em>corrected</em>. Major corrections may be
              logged publicly to maintain transparency — at this stage,
              correction records are maintained through GitHub Issues.
            </p>
          </PolicySection>

          {/* 10-20. Remaining sections continue with same content */}
          {/* 10. Institutional right of reply */}
          <PolicySection title="Institutional right of reply" id="right-of-reply" delay={0.42}>
            <p>
              Institutions, organisations, and government bodies referenced on
              this platform have a right of reply. If an institution believes
              it has been misrepresented, inaccurately summarised, or quoted
              out of context, it may submit a correction or response through
              the same{" "}
              <Link
                to="/corrections"
                className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm transition-colors duration-200"
              >
                corrections process
              </Link>
              .
            </p>
            <p>
              The platform will review institutional responses promptly. Where
              a response raises a substantive factual or representational
              issue, the relevant page or record will be updated or annotated
              to reflect the institution&rsquo;s position. This is not a
              negotiation over editorial conclusions — it is a commitment to
              accuracy and fair representation of what institutions have said
              and done.
            </p>
          </PolicySection>

          {/* 11. Protection before publication */}
          <PolicySection title="Protection before publication" id="protection" delay={0.45}>
            <p>The platform will not publish:</p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Private personal details — names, addresses, contact information, or identifying details of private individuals who are not public figures.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Sensitive witness material — testimony, statements, or documentation that could expose a witness to risk.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Exact dangerous locations — coordinates, addresses, or specific locations that could expose people to ongoing risk.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Graphic imagery of casualties or vulnerable people — the platform uses images only when they support public understanding without sensationalism and when attribution and licence requirements are met.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Identifying information about children, detainees, or medical patients who are not public figures.</span>
              </li>
            </ul>
          </PolicySection>

          {/* 12-20. Content moderation through Versioning */}
          <PolicySection title="Content moderation" id="content-moderation" delay={0.48}>
            <p>
              During the public static beta, all content is reviewed by
              contributors before publication. The platform does not accept
              public submissions or user-generated content. When
              contributor-suggested content is introduced, it will be subject
              to the same review workflow as all other content.
            </p>
            <p>Content that does not meet the following standards will not be published:</p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Must reference at least one documented public source.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Must not contain threats, harassment, hate speech, doxing, or incitement.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Must not contain private personal information about non-public figures.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Must separate factual claims from advocacy language and editorial conclusions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Must not present unverified social-media content as established fact.</span>
              </li>
            </ul>
          </PolicySection>

          {/* 13. Anti-doxing and safety */}
          <PolicySection title="Anti-doxing and safety" id="anti-doxing" delay={0.51}>
            <p>
              The platform has a zero-tolerance policy for doxing — the
              publication of private personal information with the intent or
              effect of exposing someone to harassment, threats, or harm.
            </p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Personal contact information is never published — for any person, in any context.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Public officials are identified by their official role and public office contact channels only.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Organisational representatives are identified by their organisational role, not personal details.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Contributors to this project are never listed by name without their explicit consent.</span>
              </li>
            </ul>
          </PolicySection>

          {/* 14. Privacy summary */}
          <PolicySection title="Privacy" id="privacy" delay={0.54}>
            <p>
              During the public static beta, the platform is designed to avoid
              collecting sensitive personal data. There are no user accounts,
              no witness submissions, no evidence uploads, and no tracking
              scripts. The full privacy description is on the{" "}
              <Link
                to="/privacy"
                className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm transition-colors duration-200"
              >
                privacy page
              </Link>
              .
            </p>
            <p>
              If features that involve data collection are introduced — such
              as contact forms, correction tracking, or privacy-first
              analytics — the privacy policy will be updated before those
              features launch, and users will be notified through the
              changelog and repository.
            </p>
          </PolicySection>

          {/* 15. Organization relationships */}
          <PolicySection title="Organization relationships" id="org-relationships" delay={0.57}>
            <p>
              Organisations listed in the{" "}
              <Link
                to="/organizations"
                className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm transition-colors duration-200"
              >
                public resource directory
              </Link>{" "}
              are listed as <strong>public resources</strong> only. This means
              their publicly available work is relevant to the accountability
              contexts the platform covers.
            </p>
            <p>
              Listing does <strong>not</strong> imply partnership, endorsement,
              approval, affiliation, or any formal relationship. Organisations
              listed in the directory have not requested inclusion and may not
              be aware of it.
            </p>
            <p>
              If a formal relationship is established with an organisation in
              the future — such as a research collaboration, methodology
              review, or content partnership — that relationship will be:
            </p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Confirmed in writing by authorised representatives of both parties.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Published transparently on the platform with the scope, terms, and limitations of the relationship.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Distinct from the public-resource listing — the directory and any formal relationships are separate systems.</span>
              </li>
            </ul>
            <p className="mt-4">
              No organisation listed on this platform should be described as a
              &ldquo;partner&rdquo; or &ldquo;verified partner&rdquo; of
              Accountability Atlas unless that relationship has been confirmed
              in writing and published on the platform.
            </p>
          </PolicySection>

          {/* 16. Ethical AI-use policy */}
          <PolicySection title="Ethical AI-use policy" id="ai-policy" delay={0.60}>
            <p>
              This platform may use AI tools to assist contributors with
              drafting, formatting, and source organisation — under human
              review. AI assistance is never a substitute for editorial
              judgment, legal analysis, or subject-matter expertise.
            </p>
            <p>
              The following content <strong>must not be generated by or
              delegated to AI</strong> without explicit human review and
              approval by a contributor with relevant subject-matter expertise:
            </p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Legal conclusions, legal-status assignments, or descriptions of court proceedings.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Casualty figures, civilian-harm estimates, or quantitative claims about conflict events.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Identification of individuals, organisations, or entities as perpetrators of specific acts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Witness testimony, victim accounts, or sensitive personal narratives.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Content that could increase risk to vulnerable people if inaccurate.</span>
              </li>
            </ul>
            <p className="mt-4">
              When AI tools are used in the preparation of platform content,
              the contribution process should record that fact. Published
              content generated with AI assistance must be identified as such
              in the review metadata when that metadata system is implemented.
            </p>
          </PolicySection>

          {/* 17. Translation policy */}
          <PolicySection title="Translation policy" id="translation" delay={0.63}>
            <p>
              During the public static beta, the platform is published in
              English. Translations into additional languages — prioritising
              languages relevant to the regions covered — are a planned future
              feature.
            </p>
            <p>When translations are introduced:</p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Translations will be produced by human translators with relevant language and subject-matter competency. Machine translation may be used for initial drafts but must be reviewed by a human translator before publication.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Translated pages will carry a language label, translator credit (where the translator consents), and the date of translation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Where a translation differs from the English source in a substantive way, the English version is the authoritative text until the translation is reviewed and aligned.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Corrections to translations follow the same process as corrections to English content.</span>
              </li>
            </ul>
          </PolicySection>

          {/* 18. How to cite */}
          <PolicySection title="How to cite Accountability Atlas" id="citation" delay={0.66}>
            <p>
              When citing this platform in research, journalism, legal
              submissions, or other work, please use the following format:
            </p>
            <CitationGuide />
            <p className="mt-3">
              For evidence records, cite the <strong>original source</strong> —
              not this platform&rsquo;s summary. This platform is a finding aid
              and organiser, not the primary source. The source URL, publisher,
              and publication date are provided on every evidence record.
            </p>
          </PolicySection>

          {/* 19. What is not active yet */}
          <PolicySection title="What is not active yet" id="not-active" delay={0.69}>
            <ul className="space-y-2">
              {notActiveItems.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </PolicySection>

          {/* 20. Contributor request */}
          <PolicySection title="Reviewer and contributor request" id="contributor-request" delay={0.72}>
            <p>
              This methodology is an active draft. It needs review by people
              with expertise in:
            </p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>International humanitarian law and international criminal law.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Human-rights documentation and verification methodology.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Humanitarian coordination and access.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Open-source investigation and OSINT methodology.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Information security, privacy, and trauma-informed design.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                <span>Journalism safety and media law.</span>
              </li>
            </ul>
            <p className="mt-4">
              If you have relevant expertise and would like to contribute to
              the methodology, please see{" "}
              <Link
                to="/contribute"
                className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm transition-colors duration-200"
              >
                how to contribute
              </Link>
              . No contributor may claim to represent the project, its
              methodology, or its editorial position without explicit written
              authorisation from the project maintainers.
            </p>
          </PolicySection>

          {/* 21. Versioning */}
          <PolicySection title="Versioning" id="versioning" delay={0.75}>
            <p>
              The methodology is versioned. Each substantive update increments
              the version number. The current version and last-reviewed date
              are published at the bottom of this page. The version history is
              maintained in the project repository.
            </p>
            <p>
              Individual evidence records, country pages, institution pages,
              and organisation listings carry their own version numbers and
              last-reviewed dates — independent of the methodology version.
            </p>
          </PolicySection>

          {/* Links */}
          <Reveal delay={0.78}>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border mt-10">
              <Button
                href="https://github.com/nuttyproducer/accountability-atlas/blob/main/docs/methodology.md"
                variant="secondary"
                external
              >
                Full Methodology on GitHub
              </Button>
              <Button to="/" variant="ghost" icon={<ArrowIcon />}>
                Back home
              </Button>
            </div>
          </Reveal>

          <LastUpdated date="2026-07-12" />

          {/* ── Print footer (visible only when printing) ────────────────── */}
          <PrintFooter
            canonicalPath="/methodology"
            extraLines={[
              "The methodology is an active draft and will be updated as the platform develops.",
            ]}
          />
        </div>
      </Container>
    </div>
  );
}
