import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Reveal } from "../components/ui/Reveal";
import { PageIntro } from "../components/pages/PageIntro";
import { PageStatusNotice } from "../components/pages/PageStatusNotice";
import { PolicySection } from "../components/pages/PolicySection";
import { LastUpdated } from "../components/pages/LastUpdated";
import { PreviewNotice } from "../components/pages/PreviewNotice";
import { CorrectionLink } from "../components/pages/CorrectionLink";
import { LegalStatusBadge } from "../components/pages/LegalStatusBadge";
import { legalCases } from "../data/legalCases";
import { LegalCaseCard } from "../components/legal/LegalCaseCard";
import { statusExplanations } from "../components/legal/legalStatusExplanations";

export default function LegalTrackerPage() {
  return (
    <Container className="py-16 lg:py-20">
      <PageIntro
        eyebrow="Accountability System"
        title="Legal Tracker"
        description="Follow court proceedings, investigations, warrants, UN findings, and procedural milestones. Uses consistent legal status labels. Currently a static preview with limited representative entries."
      />

      <PageStatusNotice title="Static preview — review pending" variant="info">
        <p>
          The legal tracker contains source-linked case entries with procedural
          timelines verified against current ICJ, ICC, and UN COI primary
          records as of July 2026. All entries have content status{" "}
          <strong>review_pending</strong>. No content has completed editorial or
          legal review. This is not a comprehensive or real-time legal database.
        </p>
      </PageStatusNotice>

      {/* 1. How This Tracker Works */}
      <PolicySection title="How This Tracker Works" id="how-it-works" delay={0.15}>
        <p>
          Each case is displayed as a card showing the institution, procedural
          status, legal status labels, linked sources, and review metadata.
          Legal status labels use a consistent vocabulary drawn from the{" "}
          <Link
            to="/methodology"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Methodology
          </Link>
          .
        </p>
        <p>
          Sources are linked where publicly available. Every case entry
          indicates its review status — static preview, source pending, or legal
          wording review needed — so readers know what has been editorially
          reviewed and what has not.
        </p>
        <p>
          This tracker does not make legal interpretations. It reports publicly
          available procedural information and links to primary source
          documents.
        </p>
      </PolicySection>

      {/* 2. Case Cards */}
      <PolicySection title="Representative Case Entries" id="cases" delay={0.18}>
        <p>
          The following entries demonstrate how the tracker will display legal
          cases, source documents, legal status labels, and review metadata.
          These are structural examples based on publicly reported proceedings.
        </p>
      </PolicySection>

      <div className="space-y-8 mb-10">
        {legalCases.map((entry, i) => (
          <LegalCaseCard key={entry.id} entry={entry} index={i} />
        ))}
      </div>

      {/* 3. How to Read Legal Status Labels */}
      <PolicySection
        title="How to Read Legal Status Labels"
        id="status-labels"
        delay={0.30}
      >
        <p>
          Every legal status label used on the platform has a defined meaning.
          Labels are applied conservatively — when in doubt, the platform uses
          "not yet judicially determined" or "requires further verification"
          rather than implying certainty.
        </p>
      </PolicySection>

      <div className="space-y-4 mb-10">
        {statusExplanations.map((item, i) => (
          <Reveal key={item.status} delay={0.32 + i * 0.03}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 border-b border-border/50 pb-4">
              <div className="sm:w-52 flex-shrink-0">
                <LegalStatusBadge status={item.status} />
              </div>
              <p className="text-sm text-charcoal/80 leading-relaxed">
                {item.explanation}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* 4. Tracker Limitations */}
      <PolicySection title="Tracker Limitations" id="limitations" delay={0.40}>
        <p>
          <strong>Not comprehensive:</strong> The tracker does not and cannot
          list every legal case, filing, or procedural event. It presents
          representative entries selected for their relevance to the
          platform&rsquo;s accountability framework.
        </p>
        <p>
          <strong>Not real-time:</strong> Entries are updated on a periodic
          basis, not in real time. Dates indicate when information was last
          reviewed by the platform, not when court events occurred.
        </p>
        <p>
          <strong>Not legal advice:</strong> The platform does not provide legal
          advice, legal representation, or legal opinions. Case summaries are
          informational only and should not be relied upon for legal decisions.
        </p>
        <p>
          <strong>Source dependent:</strong> All entries are limited by the
          availability and quality of public source documents. If source URLs
          become unavailable, entries are marked accordingly.
        </p>
      </PolicySection>

      {/* 5. Related Pages */}
      <PolicySection title="Related Pages" id="related" delay={0.43}>
        <ul className="space-y-3">
          <li>
            <Link
              to="/methodology"
              className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
            >
              Methodology
            </Link>
            {" — "}How sources are evaluated, verified, and labelled.
          </li>
          <li>
            <Link
              to="/gaza-dossier"
              className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
            >
              Gaza Dossier
            </Link>
            {" — "}The humanitarian and legal framework connected to these cases.
          </li>
          <li>
            <Link
              to="/corrections"
              className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
            >
              Corrections
            </Link>
            {" — "}How to request a correction to legal tracker entries.
          </li>
        </ul>
      </PolicySection>

      <PreviewNotice title="This tracker is a static preview — all content is review_pending">
        The legal tracker contains source-linked case entries verified against
        current ICJ, ICC, and UN COI primary records as of July 2026. Procedural
        timelines include 2025–2026 developments. All entries attribute legal
        conclusions to the body that made them. All entries require editorial
        and legal wording review before they can be treated as reviewed content.
      </PreviewNotice>

      <CorrectionLink />
      <LastUpdated date="2026-07-24" />
    </Container>
  );
}
