import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Reveal } from "../components/ui/Reveal";
import { PageIntro } from "../components/pages/PageIntro";
import { PageStatusNotice } from "../components/pages/PageStatusNotice";
import { PolicySection } from "../components/pages/PolicySection";
import { LastUpdated } from "../components/pages/LastUpdated";
import { PreviewNotice } from "../components/pages/PreviewNotice";
import { CorrectionLink } from "../components/pages/CorrectionLink";
import {
  ORGANIZATION_CATEGORIES,
  type OrganizationCategory,
  type OrganizationRecord,
} from "../data/organizations";
import { useRepository } from "../hooks/useRepository";
import { OrganizationCard } from "../components/organizations/OrganizationCard";
import { OrganizationDisclaimer } from "../components/organizations/OrganizationDisclaimer";

/** Group repository records by directory category. */
function groupOrganizationsByCategory(
  records: OrganizationRecord[],
): Record<OrganizationCategory, OrganizationRecord[]> {
  const grouped = {} as Record<OrganizationCategory, OrganizationRecord[]>;
  for (const cat of ORGANIZATION_CATEGORIES) grouped[cat] = [];
  for (const record of records) grouped[record.category].push(record);
  return grouped;
}

export default function OrganizationsPage() {
  const repo = useRepository();
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    repo.getOrganizations().then((orgs) => {
      if (cancelled) return;
      setOrganizations(orgs);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  const organizationsByCategory = useMemo(
    () => groupOrganizationsByCategory(organizations),
    [organizations],
  );

  return (
    <Container className="py-16 lg:py-20">
      <PageIntro
        eyebrow="Public Resource Directory"
        title="Organizations"
        description="A directory of humanitarian, legal, documentation, medical, research, and press-freedom organisations whose public work is relevant to the accountability contexts this platform covers. Every listing links to the organisation's own public website."
      />

      <PageStatusNotice title="Public resources only" variant="info">
        <p>
          This directory lists organisations as public resources. Listing does
          not imply partnership, endorsement, approval, affiliation, or any
          formal relationship with Arbor Sentinel. Organisations listed
          here have not requested inclusion and may not be aware of it.
        </p>
      </PageStatusNotice>

      {/* How listings work */}
      <PolicySection title="How listings work" id="how-listings-work" delay={0.15}>
        <p>
          Every organisation is linked to its official public website. The
          short description summarises the organisation&rsquo;s publicly stated
          mission and activities, drawn from its own published materials.
          Categories describe the primary function, not the entirety of an
          organisation&rsquo;s work.
        </p>
        <p>
          During the static beta, organisations are listed when their work is
          clearly relevant to the humanitarian and accountability contexts the
          platform covers. The directory will expand as additional categories
          and regions are reviewed. Organisations are not ranked, scored, or
          compared.
        </p>
        <ul className="space-y-2 mt-3">
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>Official websites only.</strong> Every link goes to the
              organisation&rsquo;s own domain. No third-party profiles or
              intermediary pages are used.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>No logos.</strong> Logos are not reproduced without
              clear permission.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>No private contact information.</strong> Only public
              websites and official donation pages are linked.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>
              <strong>No staff details.</strong> Individual staff, board, or
              expert names are not scraped or published.
            </span>
          </li>
        </ul>
      </PolicySection>

      {/* Category-grouped organisation cards */}
      {loading ? (
        <div
          className="flex items-center justify-center min-h-[40vh]"
          role="status"
          aria-label="Loading organizations"
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-16 h-[2px] bg-amber rounded-full motion-safe:animate-pulse"
              aria-hidden="true"
            />
            <p className="font-mono text-xs tracking-[0.15em] uppercase text-charcoal/50">
              Loading
            </p>
            <span className="sr-only" aria-live="polite">
              Organization records are loading.
            </span>
          </div>
        </div>
      ) : (
        ORGANIZATION_CATEGORIES.map((category, catIdx) => {
          const orgs = organizationsByCategory[category];
          if (!orgs || orgs.length === 0) return null;

          return (
            <section key={category} aria-labelledby={`cat-${category}`}>
              <Reveal delay={0.18 + catIdx * 0.04}>
                <h2
                  id={`cat-${category}`}
                  className="font-serif text-2xl font-semibold text-ink mb-5 mt-12 first:mt-0"
                >
                  {category}
                </h2>
              </Reveal>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {orgs.map((org, i) => (
                  <OrganizationCard
                    key={org.id}
                    org={org}
                    category={category}
                    index={catIdx * 10 + i}
                  />
                ))}
              </div>
            </section>
          );
        })
      )}

      {/* Relationship status explanation */}
      <PolicySection
        title="What &ldquo;public resource&rdquo; means"
        id="relationship-status"
        delay={0.55}
      >
        <p>
          Every organisation in this directory is listed as a public resource.
          This means the organisation&rsquo;s publicly available work — its
          published reports, data, statements, and services — is potentially
          useful to people researching or engaging with accountability
          contexts.
        </p>
        <p>
          It does <strong>not</strong> mean:
        </p>
        <ul className="space-y-2 mt-2">
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>The organisation endorses or partners with this platform.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>The organisation has reviewed or approved its listing.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>The organisation shares this platform&rsquo;s views or analysis.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clay mt-1.5" aria-hidden="true">•</span>
            <span>Arbor Sentinel speaks for or represents the organisation.</span>
          </li>
        </ul>
      </PolicySection>

      {/* Donation-link disclaimer */}
      <PolicySection
        title="About donation links"
        id="donation-disclaimer"
        delay={0.58}
      >
        <OrganizationDisclaimer />
      </PolicySection>

      {/* Correction / removal process */}
      <PolicySection
        title="Correction and removal"
        id="correction-removal"
        delay={0.61}
      >
        <p>
          If a listing is inaccurate, out of date, miscategorised, or should
          not appear in this directory, please use the{" "}
          <Link
            to="/corrections"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            corrections process
          </Link>
          . Organisations can request removal at any time — no justification is
          required. Removals are processed promptly during the static beta.
        </p>
      </PolicySection>

      {/* Contributor / reviewer request */}
      <PolicySection
        title="Help expand this directory"
        id="contributor-request"
        delay={0.64}
      >
        <p>
          During the static beta, the directory is maintained by a small team.
          If you have expertise in humanitarian, legal, medical, human-rights,
          or press-freedom organisations — and can help review or suggest
          additional listings — please see{" "}
          <Link
            to="/contribute"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            how to contribute
          </Link>
          .
        </p>
      </PolicySection>

      <PreviewNotice title="This directory is a static preview">
        The organisation directory lists a small, carefully selected sample of
        public resources relevant to the accountability contexts the platform
        covers. The directory will expand as additional categories, regions,
        and organisations are reviewed. Corrections and suggestions are welcome.
      </PreviewNotice>

      <CorrectionLink />
      <LastUpdated date="2026-07-24" />
    </Container>
  );
}
