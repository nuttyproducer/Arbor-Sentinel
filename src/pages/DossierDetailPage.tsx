import { useParams, Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Reveal } from "../components/ui/Reveal";
import { Badge } from "../components/ui/Badge";
import { PageIntro } from "../components/pages/PageIntro";
import { PageStatusNotice } from "../components/pages/PageStatusNotice";
import { CorrectionLink } from "../components/pages/CorrectionLink";
import { LastUpdated } from "../components/pages/LastUpdated";
import { ContentStatusBadge } from "../components/pages/ContentStatusBadge";
import { SourceList } from "../components/pages/SourceList";
import { getDossierBySlug } from "../data/dossiers";
import { getSourceById } from "../data/sources";
import { getEvidenceBySlug } from "../data/evidenceItems";
import { getLegalCaseBySlug } from "../data/legalCases";
import { getCountryBySlug } from "../data/countries";
import { getInstitutionEntryBySlug } from "../data/institutions";
import {
  DOSSIER_TYPE_LABELS,
  DOSSIER_AUDIENCE_LABELS,
  DOSSIER_GENERATION_STATUS_LABELS,
  VERIFICATION_LEVEL_LABELS,
  type SourceRecord,
} from "../types/content";
import type { DossierRecord } from "../types/content";
import type { EvidenceItem } from "../data/evidenceItems";
import type { LegalCaseEntry } from "../data/legalCases";
import type { CountryEntry } from "../data/countries";
import type { InstitutionIndexEntry } from "../data/institutions";

// ── Resolve referenced records ──────────────────────────────────────────────

interface ResolvedDossier {
  dossier: DossierRecord;
  evidenceItems: EvidenceItem[];
  legalCases: LegalCaseEntry[];
  countryEntries: CountryEntry[];
  institutionEntries: InstitutionIndexEntry[];
  sources: SourceRecord[];
}

function resolveDossier(dossier: DossierRecord): ResolvedDossier {
  const evidenceItems = dossier.keyFactRecordIds
    .map((id) => getEvidenceBySlug(id))
    .filter((e): e is EvidenceItem => e !== undefined);

  const legalCases = dossier.legalCaseIds
    .map((id) => getLegalCaseBySlug(id))
    .filter((c): c is LegalCaseEntry => c !== undefined);

  const countryEntries: CountryEntry[] = [];
  const institutionEntries: InstitutionIndexEntry[] = [];

  for (const id of dossier.countryOrInstitutionIds) {
    const country = getCountryBySlug(id);
    if (country) {
      countryEntries.push(country);
      continue;
    }
    const institution = getInstitutionEntryBySlug(id);
    if (institution) {
      institutionEntries.push(institution);
    }
  }

  const sources = dossier.sourceIds
    .map((id) => getSourceById(id))
    .filter((s): s is SourceRecord => s !== undefined);

  return { dossier, evidenceItems, legalCases, countryEntries, institutionEntries, sources };
}

// ── QR Code placeholder ─────────────────────────────────────────────────────

function QRPlaceholder() {
  return (
    <div
      className="border border-border rounded-md p-4 text-center text-xs text-charcoal/50 print:border-charcoal/30"
      aria-label="QR code placeholder — links to live canonical route when generated"
    >
      <div className="w-24 h-24 mx-auto mb-2 border border-dashed border-border rounded flex items-center justify-center print:hidden">
        <span className="font-mono text-[10px]">QR</span>
      </div>
      <p className="print:hidden">
        QR code will link to the live canonical route.<br />
        Generated locally — not yet active.
      </p>
      <p className="hidden print:block text-xs text-charcoal/60">
        View live at: [canonical URL pending]
      </p>
    </div>
  );
}

// ── Print button ────────────────────────────────────────────────────────────

function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-charcoal bg-bone border border-border rounded-md hover:bg-border/20 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 6V2h8v4M4 11H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 9h8v5H4V9z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Print / Save as PDF
    </button>
  );
}

// ── Page component ──────────────────────────────────────────────────────────

export default function DossierDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const dossier = slug ? getDossierBySlug(slug) : undefined;

  if (!dossier) {
    return (
      <Container className="py-16 lg:py-20">
        <PageIntro title="Dossier not found" />
        <p className="text-charcoal/70 mb-4">
          The requested dossier does not exist or has not been published yet.
        </p>
        <Link
          to="/dossiers"
          className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
        >
          ← Back to Dossier Library
        </Link>
      </Container>
    );
  }

  const resolved = resolveDossier(dossier);

  return (
    <Container className="py-16 lg:py-20 dossier-print">
      {/* ── Print header (visible only when printing) ────────────────── */}
      <div className="hidden print:block mb-8">
        <div className="border-b border-charcoal/30 pb-4 mb-4">
          <h1 className="font-serif text-2xl font-bold text-ink mb-1">
            {dossier.title}
          </h1>
          <p className="font-mono text-xs text-charcoal/60">
            Version {dossier.version} · {dossier.createdAt} ·{" "}
            {DOSSIER_TYPE_LABELS[dossier.dossierType]} ·{" "}
            {DOSSIER_GENERATION_STATUS_LABELS[dossier.generationStatus]}
          </p>
        </div>
      </div>

      {/* ── Page intro (hidden when printing) ────────────────────────── */}
      <div className="print:hidden">
        <PageIntro
          eyebrow="Policy Dossier"
          title={dossier.title}
          description={dossier.executiveSummary}
        />
      </div>

      {/* ── Toolbar (hidden when printing) ────────────────────────────── */}
      <div className="print:hidden flex flex-wrap items-center gap-3 mb-10">
        <Badge variant="warning">Static preview</Badge>
        <ContentStatusBadge status={dossier.contentStatus} />
        <span className="font-mono text-xs text-charcoal/50">
          v{dossier.version} · {dossier.createdAt}
        </span>
        <PrintButton />
      </div>

      <PageStatusNotice
        title="Static preview — generation not active"
        variant="warning"
      >
        <p>
          This dossier is a manually-constructed static preview demonstrating
          the planned format. Automated generation from reviewed records is not
          yet active. Facts are derived from referenced platform records — check
          individual record statuses for review state. Do not rely on this
          dossier as an independently reviewed publication.
        </p>
      </PageStatusNotice>

      {/* ── Print metadata bar ───────────────────────────────────────── */}
      <div className="hidden print:block mb-6 p-3 border border-charcoal/30 rounded text-xs text-charcoal/60">
        <strong>Static preview</strong> —{" "}
        {DOSSIER_GENERATION_STATUS_LABELS[dossier.generationStatus]}.{" "}
        Automated generation from reviewed records is not yet active. Facts
        derived from referenced platform records.
      </div>

      {/* ── 1. Dossier metadata ──────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="dossier-meta">
        <Reveal>
          <h2
            id="dossier-meta"
            className="font-serif text-xl font-semibold text-ink mb-3"
          >
            Dossier Information
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <MetaItem label="Type" value={DOSSIER_TYPE_LABELS[dossier.dossierType]} />
          <MetaItem label="Audience" value={DOSSIER_AUDIENCE_LABELS[dossier.audience]} />
          <MetaItem label="Jurisdiction" value={dossier.jurisdiction} />
          <MetaItem label="Language" value={dossier.language.toUpperCase()} />
          <MetaItem label="Version" value={`v${dossier.version}`} />
          <MetaItem label="Created" value={dossier.createdAt} />
          <MetaItem
            label="Generation status"
            value={DOSSIER_GENERATION_STATUS_LABELS[dossier.generationStatus]}
          />
          <MetaItem label="Issue focus" value={dossier.issueFocus} />
        </div>
      </section>

      {/* ── 2. Methodology note ──────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="methodology">
        <Reveal delay={0.1}>
          <h2
            id="methodology"
            className="font-serif text-xl font-semibold text-ink mb-3"
          >
            Methodology Note
          </h2>
        </Reveal>
        <div className="text-charcoal/80 leading-relaxed space-y-2 text-sm">
          <p>
            This dossier is assembled from public platform records. Every fact
            traces back to an evidence item or legal case record, which in turn
            references a public source document (court filing, UN document,
            humanitarian report, or other official record).
          </p>
          <p>
            Source quality, verification levels, and editorial review status
            vary across referenced records. Check individual record status
            labels — "reviewed" records have passed source verification and
            editorial review; "review_pending" records have not. This dossier
            itself is a <strong>static preview</strong> and has not passed
            independent editorial review.
          </p>
          <p className="print:hidden">
            Read the{" "}
            <Link
              to="/methodology"
              className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
            >
              full methodology
            </Link>{" "}
            for source hierarchy and verification criteria.
          </p>
          <p className="hidden print:block">
            Full methodology: /methodology
          </p>
        </div>
      </section>

      {/* ── 3. Executive summary ─────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="exec-summary">
        <Reveal delay={0.13}>
          <h2
            id="exec-summary"
            className="font-serif text-xl font-semibold text-ink mb-3"
          >
            Executive Summary
          </h2>
        </Reveal>
        <div className="bg-bone/60 border border-border rounded-lg p-5 print:bg-white print:border-charcoal/30">
          <p className="text-charcoal/80 leading-relaxed">
            {dossier.executiveSummary}
          </p>
        </div>
      </section>

      {/* ── 4. Key facts ─────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="key-facts">
        <Reveal delay={0.16}>
          <h2
            id="key-facts"
            className="font-serif text-xl font-semibold text-ink mb-3"
          >
            Key Facts
          </h2>
        </Reveal>
        <p className="text-sm text-charcoal/60 mb-4">
          Derived from referenced evidence records. Check each record's content
          status and source quality level.
        </p>
        {resolved.evidenceItems.length === 0 ? (
          <p className="text-sm text-charcoal/60 italic">
            No evidence records referenced in this dossier.
          </p>
        ) : (
          <div className="space-y-4">
            {resolved.evidenceItems.map((item) => (
              <div
                key={item.id}
                className="border border-border/60 rounded-md p-4 print:border-charcoal/30"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="neutral">
                    {VERIFICATION_LEVEL_LABELS[item.sourceQuality]}
                  </Badge>
                  <ContentStatusBadge status={item.contentStatus} />
                </div>
                <h3 className="font-serif text-base font-semibold text-ink mb-1">
                  <Link
                    to={`/evidence/${item.slug}`}
                    className="hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm print:no-underline print:text-ink"
                  >
                    {item.title}
                  </Link>
                </h3>
                <p className="text-sm text-charcoal/70 leading-relaxed">
                  {item.summary}
                </p>
                {item.publicationDate && (
                  <p className="text-xs text-charcoal/50 mt-1.5">
                    Source published: {item.publicationDate}
                    {item.lastReviewedAt &&
                      ` · Last reviewed: ${item.lastReviewedAt}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 5. Legal / procedural context ────────────────────────────── */}
      <section className="mb-10" aria-labelledby="legal-context">
        <Reveal delay={0.19}>
          <h2
            id="legal-context"
            className="font-serif text-xl font-semibold text-ink mb-3"
          >
            Legal & Procedural Context
          </h2>
        </Reveal>
        {resolved.legalCases.length === 0 ? (
          <p className="text-sm text-charcoal/60 italic">
            No legal case records referenced in this dossier.
          </p>
        ) : (
          <div className="space-y-4">
            {resolved.legalCases.map((legalCase) => (
              <div
                key={legalCase.id}
                className="border border-border/60 rounded-md p-4 print:border-charcoal/30"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="info">{legalCase.institution}</Badge>
                  <ContentStatusBadge status={legalCase.contentStatus} />
                </div>
                <h3 className="font-serif text-base font-semibold text-ink mb-1">
                  <Link
                    to={`/legal-tracker/${legalCase.slug}`}
                    className="hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm print:no-underline print:text-ink"
                  >
                    {legalCase.title}
                  </Link>
                </h3>
                <p className="text-sm text-charcoal/70 leading-relaxed mb-1">
                  {legalCase.summary}
                </p>
                {legalCase.proceduralNote && (
                  <p className="text-xs text-charcoal/50 italic">
                    {legalCase.proceduralNote}
                  </p>
                )}
                <p className="text-xs text-charcoal/50 mt-1">
                  Parties: {legalCase.parties.join(", ")}
                  {legalCase.openedDate &&
                    ` · Opened: ${legalCase.openedDate}`}
                  {legalCase.latestVerifiedUpdateDate &&
                    ` · Last verified update: ${legalCase.latestVerifiedUpdateDate}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 6. Country / Institution responsibility context ──────────── */}
      {(resolved.countryEntries.length > 0 ||
        resolved.institutionEntries.length > 0) && (
        <section
          className="mb-10"
          aria-labelledby="jurisdiction-context"
        >
          <Reveal delay={0.22}>
            <h2
              id="jurisdiction-context"
              className="font-serif text-xl font-semibold text-ink mb-3"
            >
              Country & Institution Context
            </h2>
          </Reveal>
          <p className="text-sm text-charcoal/60 mb-4">
            The following country and institution pages are referenced for
            jurisdiction-specific accountability tracking. Country and
            institution pages are under development during the static beta.
          </p>

          {resolved.countryEntries.length > 0 && (
            <div className="mb-4">
              <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-charcoal/50 mb-2">
                Countries
              </h3>
              <div className="space-y-3">
                {resolved.countryEntries.map((country) => (
                  <div
                    key={country.id}
                    className="border border-border/60 rounded-md p-3 print:border-charcoal/30"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <ContentStatusBadge status={country.contentStatus} />
                    </div>
                    <Link
                      to={country.route}
                      className="text-sm font-medium text-ink hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm print:no-underline print:text-ink"
                    >
                      {country.name}
                    </Link>
                    <p className="text-xs text-charcoal/60 mt-1">
                      {country.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resolved.institutionEntries.length > 0 && (
            <div>
              <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-charcoal/50 mb-2">
                Institutions
              </h3>
              <div className="space-y-3">
                {resolved.institutionEntries.map((inst) => (
                  <div
                    key={inst.id}
                    className="border border-border/60 rounded-md p-3 print:border-charcoal/30"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <ContentStatusBadge status={inst.contentStatus} />
                    </div>
                    <Link
                      to={inst.route}
                      className="text-sm font-medium text-ink hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm print:no-underline print:text-ink"
                    >
                      {inst.name}{" "}
                      {inst.acronym && (
                        <span className="text-charcoal/50">
                          ({inst.acronym})
                        </span>
                      )}
                    </Link>
                    <p className="text-xs text-charcoal/60 mt-1">
                      {inst.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── 7. Policy asks ───────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="policy-asks">
        <Reveal delay={0.25}>
          <h2
            id="policy-asks"
            className="font-serif text-xl font-semibold text-ink mb-3"
          >
            Policy Asks
          </h2>
        </Reveal>
        {dossier.policyAsks.length === 0 ? (
          <p className="text-sm text-charcoal/60 italic">
            No policy asks listed.
          </p>
        ) : (
          <ul className="space-y-2">
            {dossier.policyAsks.map((ask, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-charcoal/80">
                <span className="text-trust mt-0.5 flex-shrink-0" aria-hidden="true">
                  ◆
                </span>
                <span>{ask}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── 8. Recommended lawful actions ────────────────────────────── */}
      <section className="mb-10" aria-labelledby="recommended-actions">
        <Reveal delay={0.28}>
          <h2
            id="recommended-actions"
            className="font-serif text-xl font-semibold text-ink mb-3"
          >
            Recommended Lawful Actions
          </h2>
        </Reveal>
        {dossier.recommendedActions.length === 0 ? (
          <p className="text-sm text-charcoal/60 italic">
            No recommended actions listed.
          </p>
        ) : (
          <ul className="space-y-2">
            {dossier.recommendedActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-charcoal/80">
                <span className="text-amber mt-0.5 flex-shrink-0 font-bold" aria-hidden="true">
                  ›
                </span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-charcoal/50 mt-3 print:hidden">
          Browse the{" "}
          <Link
            to="/take-action"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Action Hub
          </Link>{" "}
          for detailed templates.
        </p>
        <p className="hidden print:block text-xs text-charcoal/50 mt-3">
          Action templates: /take-action
        </p>
      </section>

      {/* ── 9. Full sources ──────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="sources">
        <Reveal delay={0.31}>
          <h2
            id="sources"
            className="font-serif text-xl font-semibold text-ink mb-3"
          >
            Sources
          </h2>
        </Reveal>
        <SourceList
          sources={resolved.sources}
          emptyMessage="No source records directly referenced by this dossier. Facts are derived from evidence and legal case records which carry their own source references."
        />
        {resolved.sources.length > 0 && (
          <p className="text-xs text-charcoal/50 mt-2">
            Additional sources may be referenced within individual evidence and
            legal case records. View each record for its complete source list.
          </p>
        )}
      </section>

      {/* ── 10. Correction link ──────────────────────────────────────── */}
      <Reveal delay={0.34}>
        <CorrectionLink />
      </Reveal>

      {/* ── 11. QR code placeholder ──────────────────────────────────── */}
      <section className="mt-10" aria-labelledby="qr-code">
        <Reveal delay={0.37}>
          <h2
            id="qr-code"
            className="font-serif text-lg font-semibold text-ink mb-3"
          >
            QR Code
          </h2>
        </Reveal>
        <QRPlaceholder />
        <p className="text-xs text-charcoal/50 mt-2">
          QR code will be generated locally (client-side) linking to the live
          canonical route. Not yet active during static beta.
        </p>
      </section>

      {/* ── Print footer ─────────────────────────────────────────────── */}
      <Reveal delay={0.40}>
        <LastUpdated date={dossier.createdAt} label="Dossier assembled" />
      </Reveal>

      {/* ── Print-only footer ────────────────────────────────────────── */}
      <div className="hidden print:block mt-8 pt-4 border-t border-charcoal/30 text-xs text-charcoal/50 space-y-1">
        <p>
          Generated by Accountability Atlas — accountabilityatlas.org
        </p>
        <p>
          Static preview · Version {dossier.version} · {dossier.createdAt}
        </p>
        <p>
          Corrections: /corrections · Methodology: /methodology
        </p>
        <p>
          This dossier is a static preview. Automated generation from reviewed
          records is not yet active. Do not rely on this dossier as an
          independently reviewed publication.
        </p>
      </div>
    </Container>
  );
}

// ── Helper: metadata item ───────────────────────────────────────────────────

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border/60 rounded-md p-3 print:border-charcoal/30">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-charcoal/50 mb-0.5">
        {label}
      </p>
      <p className="text-sm text-ink">{value}</p>
    </div>
  );
}
