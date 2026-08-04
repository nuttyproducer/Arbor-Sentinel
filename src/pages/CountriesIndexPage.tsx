import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { PageIntro } from "../components/pages/PageIntro";
import { PageStatusNotice } from "../components/pages/PageStatusNotice";
import { PolicySection } from "../components/pages/PolicySection";
import { LastUpdated } from "../components/pages/LastUpdated";
import { PreviewNotice } from "../components/pages/PreviewNotice";
import { CorrectionLink } from "../components/pages/CorrectionLink";
import { getActiveCountries } from "../data/countries";
import { CountryIndexCard } from "../components/countries/CountryIndexCard";

const activeCountries = getActiveCountries();

export default function CountriesIndexPage() {
  return (
    <Container className="py-16 lg:py-20">
      <PageIntro
        eyebrow="Accountability Index"
        title="Countries"
        description="Country accountability pages track what governments have done, failed to do, funded, blocked, voted for, or publicly supported — always within their legal competencies. This is not a ranking, a scorecard, or a comprehensive survey."
      />

      <PageStatusNotice title="Limited coverage — static beta" variant="info">
        <p>
          During the static beta, country coverage is limited to a small number
          of countries whose accountability architecture is being mapped.
          Belgium is the first country page. Additional country pages will be
          added as research, source review, and legal review are completed.
          This index page reflects only countries with an active route on the
          platform.
        </p>
      </PageStatusNotice>

      {/* What a country page tracks */}
      <PolicySection
        title="What a country accountability page tracks"
        id="what-country-pages-track"
        delay={0.15}
      >
        <p>
          A country accountability page is not a profile, a ranking, or a
          government-endorsed summary. It is a structured documentation of
          publicly verifiable positions, votes, policies, and actions —
          sourced, dated, and open to correction.
        </p>
        <ul className="space-y-2 mt-3">
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Current official position</strong> — as stated in public
              government communications.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>UN voting record</strong> — on resolutions relevant to
              civilian protection, humanitarian access, and accountability.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>EU role</strong> — where the country is an EU member
              state, its positions within EU foreign policy and
              restrictive-measure discussions.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Arms-export / transfer position</strong> — public
              licensing data, parliamentary scrutiny, and relevant legal
              challenges.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Humanitarian aid contribution</strong> — bilateral and
              multilateral funding, and public statements on humanitarian
              access.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>ICC / ICJ cooperation stance</strong> — statements,
              cooperation, and domestic legal implementation.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Competency boundaries</strong> — what the national
              government controls versus regional, EU-level, or international
              competencies.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Representative contact routes</strong> — official public
              channels for constituents, without private contact data.
            </span>
          </li>
        </ul>
      </PolicySection>

      {/* No scoring policy */}
      <PolicySection
        title="No accountability scores — and why"
        id="no-scores"
        delay={0.18}
      >
        <p>
          Accountability Atlas does not publish numerical accountability
          scores, country rankings, or comparative indices during the static
          beta. A score requires a published methodology, weighting rationale,
          source rules, missing-data policy, date/version labels, correction
          route, and external review. None of these conditions are met yet.
        </p>
        <p>
          Even when methodology and review processes are in place, any future
          score would be clearly labelled as an analytical model — not a legal
          judgment, not a moral ranking, and not a substitute for reading the
          underlying evidence.
        </p>
      </PolicySection>

      {/* Country cards */}
      <section aria-labelledby="country-cards-heading">
        <h2
          id="country-cards-heading"
          className="font-serif text-2xl font-semibold text-ink mb-5 mt-6"
        >
          Active country pages
        </h2>

        {activeCountries.length === 0 ? (
          <div className="bg-bone border border-border rounded-lg p-6 text-center">
            <p className="text-charcoal/70 leading-relaxed">
              No country pages are active yet. The first country page is under
              development.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {activeCountries.map((country, i) => (
              <CountryIndexCard
                key={country.id}
                country={country}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      {/* Coverage limitations */}
      <PolicySection
        title="Coverage is limited, not a ranking"
        id="coverage-limits"
        delay={0.45}
      >
        <p>
          The countries listed here reflect only those for which an active
          route exists on the platform. Absence does not imply anything about a
          country&rsquo;s accountability record — it means the platform has
          not yet built and reviewed a page for that country. Countries are
          not ordered by importance, severity, or any normative criterion.
        </p>
        <p>
          Country pages are built one at a time with careful sourcing,
          competency review, and legal-language review. This is slow work by
          design. If you have expertise in a specific country&rsquo;s
          governance, parliamentary processes, or international legal
          obligations — and can help review a draft country structure — see{" "}
          <Link
            to="/contribute"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            how to contribute
          </Link>
          .
        </p>
      </PolicySection>

      {/* Institution distinction */}
      <PolicySection
        title="Country responsibility vs. institutional competency"
        id="country-vs-institution"
        delay={0.48}
      >
        <p>
          Country pages track national-government positions, votes, and
          actions. Institution pages (such as the{" "}
          <Link
            to="/institutions"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            European Union
          </Link>
          ) track supranational bodies whose powers and competencies differ
          from those of member states. The platform keeps these categories
          separate to avoid conflating national decisions with institutional
          mechanisms.
        </p>
        <p>
          For example, Belgium hosts EU institutions but does not control them.
          The EU Common Position sets shared arms-export criteria, but
          individual export-licence decisions remain national competencies.
          Understanding these boundaries is essential to effective
          accountability work.
        </p>
      </PolicySection>

      {/* Related methodology */}
      <PolicySection
        title="Methodology and corrections"
        id="methodology-corrections"
        delay={0.51}
      >
        <p>
          For details on how country positions are sourced, verified, and
          reviewed, see the{" "}
          <Link
            to="/methodology"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Methodology
          </Link>
          . Corrections to country page structures, competency descriptions,
          or future substantive content are welcome through the{" "}
          <Link
            to="/corrections"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            corrections process
          </Link>
          .
        </p>
      </PolicySection>

      <PreviewNotice title="Country index is a static preview">
        Country pages are structural skeletons during the static beta. Content
        status labels reflect the current state of review. Government
        positions, voting records, and policy summaries are not yet published.
      </PreviewNotice>

      <CorrectionLink />
      <LastUpdated date="2026-07-14" />
    </Container>
  );
}
