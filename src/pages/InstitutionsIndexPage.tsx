import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { PageIntro } from "../components/pages/PageIntro";
import { PageStatusNotice } from "../components/pages/PageStatusNotice";
import { PolicySection } from "../components/pages/PolicySection";
import { LastUpdated } from "../components/pages/LastUpdated";
import { PreviewNotice } from "../components/pages/PreviewNotice";
import { CorrectionLink } from "../components/pages/CorrectionLink";
import { getActiveInstitutionEntries } from "../data/institutions";
import { InstitutionIndexCard } from "../components/institutions/InstitutionIndexCard";

const activeInstitutions = getActiveInstitutionEntries();

export default function InstitutionsIndexPage() {
  return (
    <Container className="py-16 lg:py-20">
      <PageIntro
        eyebrow="Accountability Index"
        title="Institutions"
        description="Institution accountability pages track what supranational bodies — the EU, UN bodies, and other international organisations — can do, have done, and are legally competent to decide. This is not a ranking or a comprehensive survey."
      />

      <PageStatusNotice title="Limited coverage — static beta" variant="info">
        <p>
          During the static beta, institution coverage is limited to the
          European Union. Additional institution pages will be added as
          research, source review, and legal-competency review are completed.
          This index page reflects only institutions with an active route on
          the platform.
        </p>
      </PageStatusNotice>

      {/* Country vs. institution distinction */}
      <PolicySection
        title="Country responsibility vs. institutional competency"
        id="country-vs-institution"
        delay={0.15}
      >
        <p>
          A fundamental design choice in Accountability Atlas is the separation
          of country pages from institution pages. Countries and institutions
          have different legal natures, different decision-making procedures,
          and different accountability pathways. Conflating them produces
          misleading analysis.
        </p>
        <ul className="space-y-2 mt-3">
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Countries</strong> are sovereign states. Country pages
              track national-government positions, parliamentary votes,
              arms-export licences, bilateral aid, and national legal
              obligations.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Institutions</strong> are bodies created by treaty or
              agreement among states. Their powers are defined and limited by
              their founding documents. Institution pages track what the body
              is legally competent to decide — and what it cannot decide.
            </span>
          </li>
        </ul>
      </PolicySection>

      {/* EU competency note */}
      <PolicySection
        title="EU competencies: a worked example"
        id="eu-competency"
        delay={0.18}
      >
        <p>
          The European Union is not a state. Its powers vary dramatically by
          policy area:
        </p>
        <ul className="space-y-2 mt-3">
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Exclusive competence</strong> (trade, competition,
              customs union) — the EU alone can legislate and adopt binding
              acts. Member states may do so only if empowered by the EU.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Shared competence</strong> (environment, consumer
              protection, transport) — both the EU and member states can
              legislate, but member states may only act to the extent the EU
              has not.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Supporting competence</strong> (health, culture,
              education) — the EU can support, coordinate, or supplement member
              state actions but cannot harmonise national laws.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Common Foreign and Security Policy</strong> — distinct
              rules apply. Decisions often require unanimity in the Council.
              Arms-export licensing remains a national competency. The EU sets
              shared criteria but does not issue export licences.
            </span>
          </li>
        </ul>
        <p className="mt-3">
          This is why institution pages are separate from country pages. Asking
          &ldquo;what did the EU do?&rdquo; and &ldquo;what did Belgium
          do?&rdquo; are different questions with different legal answers.
        </p>
      </PolicySection>

      {/* No scoring */}
      <PolicySection
        title="No scores, no rankings"
        id="no-scores"
        delay={0.21}
      >
        <p>
          Institutions are not scored, ranked, or compared on a numerical
          scale. An institution&rsquo;s accountability profile is described
          through its competencies, decisions, and documented actions — not
          reduced to a single metric. The platform does not publish
          &ldquo;best&rdquo; or &ldquo;worst&rdquo; institution framings.
        </p>
      </PolicySection>

      {/* Institution cards */}
      <section aria-labelledby="institution-cards-heading">
        <h2
          id="institution-cards-heading"
          className="font-serif text-2xl font-semibold text-ink mb-5 mt-6"
        >
          Active institution pages
        </h2>

        {activeInstitutions.length === 0 ? (
          <div className="bg-bone border border-border rounded-lg p-6 text-center">
            <p className="text-charcoal/70 leading-relaxed">
              No institution pages are active yet. The first institution page
              is under development.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {activeInstitutions.map((inst, i) => (
              <InstitutionIndexCard
                key={inst.id}
                institution={inst}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      {/* Coverage limitations */}
      <PolicySection
        title="Coverage is limited, not comprehensive"
        id="coverage-limits"
        delay={0.40}
      >
        <p>
          The institutions listed here reflect only those for which an active
          route exists on the platform. Absence does not imply that an
          institution is unimportant or unaccountable — it means the platform
          has not yet built and reviewed a page for that institution. Pages are
          built one at a time with careful competency review and legal-language
          review.
        </p>
        <p>
          If you have expertise in EU institutional law, UN mechanisms, NATO
          governance, or other international organisations — and can help
          review institutional competency descriptions — see{" "}
          <Link
            to="/contribute"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            how to contribute
          </Link>
          .
        </p>
      </PolicySection>

      {/* Methodology */}
      <PolicySection
        title="Methodology and corrections"
        id="methodology-corrections"
        delay={0.43}
      >
        <p>
          For details on how institution competencies are sourced, verified,
          and reviewed, see the{" "}
          <Link
            to="/methodology"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Methodology
          </Link>
          . Corrections to institution page structures, competency
          descriptions, or future substantive content are welcome through the{" "}
          <Link
            to="/corrections"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            corrections process
          </Link>
          .
        </p>
      </PolicySection>

      {/* Related: countries */}
      <PolicySection
        title="Related: country accountability pages"
        id="related-countries"
        delay={0.46}
      >
        <p>
          Country pages track national-government positions separately from
          institutional mechanisms. See the{" "}
          <Link
            to="/countries"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Countries index
          </Link>{" "}
          for country-specific accountability tracking (starting with
          Belgium).
        </p>
      </PolicySection>

      <PreviewNotice title="Institution index is a static preview">
        Institution pages are structural skeletons during the static beta.
        Content status labels reflect the current state of review. Policy
        summaries and institutional positions are not yet published.
      </PreviewNotice>

      <CorrectionLink />
      <LastUpdated date="2026-07-14" />
    </Container>
  );
}
