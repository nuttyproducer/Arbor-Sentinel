import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Reveal } from "../components/ui/Reveal";
import { Card } from "../components/ui/Card";
import { PageIntro } from "../components/pages/PageIntro";
import { PageStatusNotice } from "../components/pages/PageStatusNotice";
import { PolicySection } from "../components/pages/PolicySection";
import { LastUpdated } from "../components/pages/LastUpdated";
import { PreviewNotice } from "../components/pages/PreviewNotice";
import { CorrectionLink } from "../components/pages/CorrectionLink";
import { VerificationBadge } from "../components/pages/VerificationBadge";
import {
  harmCategories,
  keyInstitutions,
  policyPriorities,
  sourceCategories,
  gazaTimelinePreview,
  protectionCategories,
  lawfulActionPathways,
} from "../data/gazaDossier";

export default function GazaDossierPage() {
  return (
    <Container className="py-16 lg:py-20">
      <PageIntro
        eyebrow="Accountability System"
        title="Gaza Dossier"
        description="A structured framework for understanding the humanitarian context, legal processes, documented harm categories, and action priorities. All content is source-linked and awaits expert review. No final legal conclusions are implied."
      />

      <PageStatusNotice title="Static preview — review pending" variant="info">
        <p>
          The dossier framework contains source-linked structural content based on
          current primary sources (ICJ, ICC, UN COI, OCHA, ICRC, IPC). All entries
          have content status <strong>review_pending</strong>. No content has
          completed editorial or legal review. This is not a complete dossier.
        </p>
      </PageStatusNotice>

      {/* 1. Scope and Purpose */}
      <PolicySection title="Scope and Purpose" id="scope" delay={0.15}>
        <p>
          The Gaza Dossier organizes verified public information about the
          humanitarian situation, legal accountability processes, and documented
          harm in Gaza and the wider occupied Palestinian territory. It connects
          evidence, legal tracking, country accountability, and lawful action
          routes in one structured starting point.
        </p>
        <p>
          This dossier is not a comprehensive incident database, a real-time
          casualty tracker, or a legal judgment. It is a curated framework that
          distinguishes sourced claims from allegations, separates legal findings
          from advocacy, and links every category to its source methodology.
        </p>
        <p>
          The dossier works together with the{" "}
          <Link
            to="/legal-tracker"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Legal Tracker
          </Link>{" "}
          and country accountability pages to form a complete
          documentation-to-action pathway.
        </p>
      </PolicySection>

      {/* 2. Key Timeline */}
      <PolicySection
        title="Key Events Timeline"
        id="timeline"
        delay={0.18}
      >
        <p>
          A curated subset of source-linked timeline events relevant to the Gaza
          context. The full procedural legal timeline, with detailed source
          references and legal-status distinctions, is available on the{" "}
          <Link
            to="/legal-tracker"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Legal Tracker
          </Link>
          .
        </p>
      </PolicySection>

      <div className="space-y-3 mb-10">
        {gazaTimelinePreview.map((event, i) => (
          <Reveal key={`${event.date}-${i}`} delay={0.2 + i * 0.02}>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 border-b border-border/40 pb-3">
              <div className="sm:w-28 flex-shrink-0 text-sm font-medium text-charcoal/60">
                {event.date}
              </div>
              <p className="text-sm text-charcoal/80 leading-relaxed">
                {event.title}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* 3. Humanitarian Situation Framework */}
      <PolicySection
        title="Humanitarian Situation Framework"
        id="humanitarian-framework"
        delay={0.22}
      >
        <p>
          The dossier tracks documented patterns of harm using the following
          categories. Each category is supported by sourced records from the{" "}
          <Link
            to="/sources"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Source Registry
          </Link>
          . Every claim distinguishes allegation, investigation, and confirmed
          finding — and attributes conclusions to the body that made them.
        </p>
      </PolicySection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {harmCategories.map((cat, i) => (
          <Reveal key={cat.title} delay={0.24 + i * 0.05}>
            <Card
              accent={cat.accent}
              title={cat.title}
              label={`Category ${i + 1}`}
            >
              <p className="text-sm text-charcoal/80 leading-relaxed">
                {cat.description}
              </p>
              {"sourceIds" in cat && cat.sourceIds && cat.sourceIds.length > 0 && (
                <p className="text-xs text-charcoal/50 mt-3">
                  Sources: {cat.sourceIds.length} source record{cat.sourceIds.length !== 1 ? "s" : ""} linked.{" "}
                  <Link
                    to="/sources"
                    className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 rounded-sm"
                  >
                    View source registry →
                  </Link>
                </p>
              )}
            </Card>
          </Reveal>
        ))}
      </div>

      {/* 4. Protection of Vulnerable Groups */}
      <PolicySection
        title="Protection of Vulnerable Groups"
        id="protection"
        delay={0.26}
      >
        <p>
          International humanitarian law grants special protection to specific
          categories of persons and facilities. The following categories document
          what is known from primary sources about protection failures. All
          findings are attributed to the source body — they are not the
          platform's independent conclusions.
        </p>
      </PolicySection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {protectionCategories.map((cat, i) => (
          <Reveal key={cat.title} delay={0.28 + i * 0.05}>
            <Card
              accent={i % 2 === 0 ? "clay" : "amber"}
              title={cat.title}
              label="Protection category"
            >
              <p className="text-sm text-charcoal/80 leading-relaxed">
                {cat.description}
              </p>
              {cat.sourceIds && cat.sourceIds.length > 0 && (
                <p className="text-xs text-charcoal/50 mt-3">
                  {cat.sourceIds.length} source record{cat.sourceIds.length !== 1 ? "s" : ""} linked.
                </p>
              )}
            </Card>
          </Reveal>
        ))}
      </div>

      {/* 5. Legal Accountability Framework */}
      <PolicySection
        title="Legal Accountability Framework"
        id="legal-framework"
        delay={0.30}
      >
        <p>
          The dossier connects to ongoing legal accountability processes at the
          ICJ, ICC, and UN level. Each documented harm category is linked —
          where applicable — to relevant court proceedings, provisional
          measures, arrest warrants, and institutional findings.
        </p>
        <p>
          The platform uses consistent{" "}
          <Link
            to="/legal-tracker"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            legal status labels
          </Link>{" "}
          and verification levels. Every claim is positioned on the source
          hierarchy, from unreviewed lead to legal/institutional record.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <VerificationBadge level={5} />
          <VerificationBadge level={4} />
          <VerificationBadge level={3} />
        </div>
        <p className="text-sm text-charcoal/60 mt-2">
          Verification levels 3 (Corroborated), 4 (Trusted organization verified),
          and 5 (Legal/institutional record) are used in the dossier.
        </p>
      </PolicySection>

      {/* 6. Key Institutions */}
      <PolicySection
        title="Key Institutions"
        id="institutions"
        delay={0.33}
      >
        <p>
          The dossier references the work of international institutions without
          implying partnership, endorsement, or affiliation. Each institution is
          listed because its public mandate, reporting, or legal function is
          relevant to accountability.
        </p>
      </PolicySection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {keyInstitutions.map((inst, i) => (
          <Reveal key={inst.title} delay={0.35 + i * 0.05}>
            <Card label={inst.label} title={inst.title}>
              <p className="text-sm text-charcoal/80 leading-relaxed">
                {inst.description}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>

      {/* 7. Policy Priorities */}
      <PolicySection
        title="Policy Priorities"
        id="policy-priorities"
        delay={0.38}
      >
        <p>
          Each priority below is derived from documented humanitarian needs and
          legal obligations — not from political advocacy. Source links connect
          each priority to the legal instruments, court orders, or humanitarian
          reports that support it.
        </p>
      </PolicySection>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {policyPriorities.map((p, i) => (
          <Reveal key={p.title} delay={0.40 + i * 0.05}>
            <Card accent={p.accent} title={p.title}>
              <p className="text-sm text-charcoal/80 leading-relaxed">
                {p.description}
              </p>
              {"sourceIds" in p && p.sourceIds && p.sourceIds.length > 0 && (
                <p className="text-xs text-charcoal/50 mt-3">
                  Sources: {p.sourceIds.length} legal or institutional record{ p.sourceIds.length !== 1 ? "s" : "" } linked.
                </p>
              )}
            </Card>
          </Reveal>
        ))}
      </div>

      {/* 8. Lawful Action Pathways */}
      <PolicySection
        title="Lawful Action Pathways"
        id="action-pathways"
        delay={0.43}
      >
        <p>
          The dossier connects to specific, lawful, non-harassing action routes
          grounded in documented legal obligations and institutional processes.
          These pathways are informational — they describe what can lawfully be
          done, not what must be done.
        </p>
      </PolicySection>

      <div className="space-y-5 mb-10">
        {lawfulActionPathways.map((pathway, i) => (
          <Reveal key={pathway.title} delay={0.45 + i * 0.04}>
            <div className="border border-border/50 rounded-lg p-5 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-2">
                <h3 className="text-base font-semibold text-charcoal">
                  {pathway.title}
                </h3>
                <span className="text-xs text-charcoal/50 font-medium">
                  {pathway.jurisdiction}
                </span>
              </div>
              <p className="text-sm text-charcoal/80 leading-relaxed">
                {pathway.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* 9. Source Categories */}
      <PolicySection
        title="Source Categories"
        id="source-categories"
        delay={0.48}
      >
        <p>
          The dossier draws on multiple source types, each assigned a position in
          the methodology source hierarchy. No source category implies automatic
          verification — every item must be individually reviewed before it
          receives a verification level above "unreviewed lead."
        </p>
      </PolicySection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {sourceCategories.map((sc, i) => (
          <Reveal key={sc.title} delay={0.50 + i * 0.04}>
            <Card title={sc.title}>
              <p className="text-sm text-charcoal/80 leading-relaxed">
                {sc.description}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>

      {/* 10. Status and Limitations */}
      <PolicySection
        title="Status and Limitations"
        id="limitations"
        delay={0.55}
      >
        <p>
          <strong>What is active now:</strong> Source-linked harm categories,
          protection framework, timeline preview, legal accountability framework,
          policy priorities with legal instrument references, and lawful action
          pathway descriptions. All content is linked to primary sources in the{" "}
          <Link
            to="/sources"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Source Registry
          </Link>
          . The{" "}
          <Link
            to="/methodology"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Methodology
          </Link>{" "}
          page explains how sources, verification, and legal labels work.
        </p>
        <p>
          <strong>What is not active yet:</strong> Individual incident data,
          real-time casualty updates, interactive data visualizations,
          country-specific dossier subsections, and witness documentation are not
          yet published. These require additional source verification, editorial
          review, and safety review before publication.
        </p>
        <p>
          <strong>Editorial status:</strong> All content on this page is{" "}
          <strong>review_pending</strong>. No content has completed editorial
          review or legal wording review. Source data reflects current publicly
          available information as of 24 July 2026. Every claim attributes
          conclusions to the body that made them. No final legal determinations
          are implied by the platform.
        </p>
        <p>
          <strong>How to help:</strong> Reviewers, legal researchers, and
          humanitarian specialists are invited to{" "}
          <Link
            to="/contribute"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            contribute
          </Link>{" "}
          to the dossier content, source verification, and legal wording review.
        </p>
      </PolicySection>

      <PreviewNotice title="This dossier is a static preview — all content is review_pending">
        The Gaza Dossier contains source-linked structural content. All harm
        category data, protection descriptions, policy priorities, and timeline
        events are sourced from current primary records (ICJ, ICC, UN COI,
        OCHA, ICRC, IPC). Every finding is attributed to the source body. No
        content has completed editorial or legal review. No final or reviewed
        content is published here.
      </PreviewNotice>

      <CorrectionLink />
      <LastUpdated date="2026-07-24" />
    </Container>
  );
}
