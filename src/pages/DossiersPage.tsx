import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Reveal } from "../components/ui/Reveal";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { PageIntro } from "../components/pages/PageIntro";
import { PageStatusNotice } from "../components/pages/PageStatusNotice";
import { PreviewNotice } from "../components/pages/PreviewNotice";
import { CorrectionLink } from "../components/pages/CorrectionLink";
import { LastUpdated } from "../components/pages/LastUpdated";
import { dossierTemplates } from "../data/dossierTemplates";
import { dossiers } from "../data/dossiers";
import { DOSSIER_TYPE_LABELS } from "../types/content";

export default function DossiersPage() {
  return (
    <Container className="py-16 lg:py-20">
      <PageIntro
        eyebrow="Policy Dossiers"
        title="Dossier Library"
        description="Structured, source-linked evidence briefs for policymakers, journalists, researchers, and citizens. During the static beta, one manually-constructed example dossier is available. Automated generation from reviewed records will be implemented in a later phase."
      />

      <PageStatusNotice title="Dossier generation not yet active" variant="info">
        <p>
          Dossiers are designed to be generated automatically from reviewed
          evidence records, legal cases, and country/institution data. During
          the static beta, automated generation is inactive. One static preview
          dossier —{" "}
          <Link
            to="/dossiers/gaza-accountability-one-page"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Gaza Accountability — One-Page Executive Brief
          </Link>{" "}
          — demonstrates the planned format.
        </p>
      </PageStatusNotice>

      {/* ── Available Dossiers ────────────────────────────────────────── */}
      <section className="mb-14" aria-labelledby="available-dossiers">
        <h2
          id="available-dossiers"
          className="font-serif text-2xl font-semibold text-ink mb-4"
        >
          Available Dossiers
        </h2>
        <p className="text-charcoal/80 leading-relaxed mb-6">
          One static example is available now. It demonstrates the one-page
          executive brief format with source-linked facts, legal context, policy
          asks, and a print-friendly layout.
        </p>

        <div className="grid grid-cols-1 gap-4">
          {dossiers.map((dossier, i) => (
            <Reveal key={dossier.id} delay={0.15 + i * 0.05}>
              <Link
                to={`/dossiers/${dossier.slug}`}
                className="block group rounded-lg border border-border hover:border-trust/30 bg-bone/60 hover:bg-bone transition-colors duration-200 p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2"
              >
                <div className="flex flex-wrap items-start gap-3 mb-3">
                  <Badge variant="neutral">Static preview</Badge>
                  <Badge variant="info">
                    {DOSSIER_TYPE_LABELS[dossier.dossierType]}
                  </Badge>
                  <span className="font-mono text-[10px] text-charcoal/50 uppercase pt-1">
                    v{dossier.version}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-semibold text-ink group-hover:text-trust/80 transition-colors duration-200 mb-2">
                  {dossier.title}
                </h3>
                <p className="text-sm text-charcoal/70 leading-relaxed mb-2">
                  {dossier.executiveSummary}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal/50">
                  <span>Jurisdiction: {dossier.jurisdiction}</span>
                  <span>Language: {dossier.language.toUpperCase()}</span>
                  <span>Created: {dossier.createdAt}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Available Dossier Types ───────────────────────────────────── */}
      <section className="mb-14" aria-labelledby="dossier-types">
        <h2
          id="dossier-types"
          className="font-serif text-2xl font-semibold text-ink mb-4"
        >
          Future Dossier Types
        </h2>
        <p className="text-charcoal/80 leading-relaxed mb-6">
          When automated generation is active, the following dossier types will
          be available. Each type is designed for a specific audience and use
          case, with inputs for country/institution, issue focus, and language.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dossierTemplates.map((template, i) => (
            <Reveal key={template.id} delay={0.2 + i * 0.04}>
              <Card
                title={template.label}
                label={
                  template.generationActive ? "Active" : "Generation inactive"
                }
              >
                <p className="text-sm text-charcoal/70 leading-relaxed mb-3">
                  {template.description}
                </p>
                <div className="text-xs text-charcoal/50">
                  <span className="font-mono font-medium uppercase tracking-[0.1em]">
                    Output:
                  </span>{" "}
                  {template.outputStructure.length} sections —{" "}
                  {template.outputStructure.slice(0, 3).join("; ")}
                  {template.outputStructure.length > 3 ? "…" : ""}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Methodology Note ──────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="methodology-note">
        <h2
          id="methodology-note"
          className="font-serif text-2xl font-semibold text-ink mb-4"
        >
          How Dossiers Work
        </h2>
        <div className="text-charcoal/80 leading-relaxed space-y-3">
          <p>
            Dossiers are assembled from reviewed platform records — evidence
            items, legal cases, country/institution data, and source documents.
            Every fact in a dossier traces back to a specific record ID, which
            in turn references a public source document or official record.
          </p>
          <p>
            The dossier format follows a consistent structure designed for
            institutional use: executive summary, key facts with source
            references, legal and procedural context, jurisdiction-specific
            responsibility analysis, policy asks, and recommended lawful
            actions.
          </p>
          <p>
            During the static beta, dossiers are manually constructed and
            clearly labeled as static previews. In the functional MVP,
            dossiers will be generated automatically from reviewed records —
            but only records that have passed source verification, editorial
            review, and any required domain review (legal, competency, safety).
          </p>
          <p>
            Read the{" "}
            <Link
              to="/methodology"
              className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
            >
              full methodology
            </Link>{" "}
            for details on source hierarchy, verification levels, and
            publication criteria.
          </p>
        </div>
      </section>

      <PreviewNotice title="Automated generation is not yet active">
        The dossier types listed above describe planned functionality. Only one
        manually-constructed static preview dossier is available now. Do not
        rely on dossiers as independently reviewed publications during the
        static beta.
      </PreviewNotice>

      <CorrectionLink />
      <LastUpdated date="2026-07-14" />
    </Container>
  );
}
