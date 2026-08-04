import { useParams, Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { ExternalLink } from "../components/ui/ExternalLink";
import { LastUpdated } from "../components/pages/LastUpdated";
import { CorrectionLink } from "../components/pages/CorrectionLink";
import { ContentStatusBadge } from "../components/pages/ContentStatusBadge";
import { SourceList } from "../components/pages/SourceList";
import { OrganizationDisclaimer } from "../components/organizations/OrganizationDisclaimer";
import { getOrganizationBySlug } from "../data/organizations";
import { sources } from "../data/sources";
import { RELATIONSHIP_STATUS_LABEL } from "../data/organizations";

export default function OrganizationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const org = slug ? getOrganizationBySlug(slug) : undefined;

  if (!org) {
    return (
      <Container className="py-16 lg:py-20">
        <div className="text-center py-20">
          <p className="font-serif text-3xl font-semibold text-ink mb-4">
            Organization not found
          </p>
          <p className="text-charcoal/70 leading-relaxed mb-6 max-w-md mx-auto">
            The organization you are looking for is not listed in the
            directory. It may not have been added yet, or the URL may be
            incorrect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/organizations"
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-ink/20 bg-paper text-ink hover:bg-ink/5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 min-h-[44px]"
            >
              Browse all organizations
            </Link>
            <Link
              to="/corrections"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm min-h-[44px]"
            >
              Suggest an organization
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  const listingSources = org.sourceIds
    .map((sid) => sources.find((s) => s.id === sid))
    .filter(Boolean) as typeof sources;

  return (
    <Container className="py-16 lg:py-20">
      {/* Back link */}
      <p className="mb-6">
        <Link
          to="/organizations"
          className="text-sm text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
        >
          ← Back to Organization Directory
        </Link>
      </p>

      {/* ── 8. Relationship status badge row ────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="neutral">
          {RELATIONSHIP_STATUS_LABEL[org.relationshipStatus]}
        </Badge>
        <ContentStatusBadge status={org.contentStatus} />
      </div>

      {/* ── 1. Name ─────────────────────────────────────────────────────── */}
      <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-ink leading-tight mb-4">
        {org.name}
      </h1>

      {/* ── 2. Category + 3. Regions ────────────────────────────────────── */}
      <p className="text-lg text-charcoal/70 mb-8">
        {org.category}
        <span className="text-charcoal/50">
          {" — "}{org.regions.join(", ")}
        </span>
      </p>

      {/* ── 4. Short factual description ────────────────────────────────── */}
      <div className="bg-bone border border-border rounded-lg p-6 mb-8">
        <p className="text-charcoal/80 leading-relaxed">
          {org.shortDescription}
        </p>
      </div>

      {/* ── 5. Services ─────────────────────────────────────────────────── */}
      {org.services && org.services.length > 0 && (
        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-ink mb-3">
            Services
          </h2>
          <ul className="space-y-2 bg-bone border border-border rounded-lg p-5">
            {org.services.map((service) => (
              <li
                key={service}
                className="flex items-start gap-2 text-sm text-charcoal/80"
              >
                <span
                  className="text-charcoal/30 mt-1 flex-shrink-0"
                  aria-hidden="true"
                >
                  •
                </span>
                {service}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Metadata grid (6, 7, 11, 12, 13) ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        {/* 6. Official website */}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Official website
          </p>
          <ExternalLink href={org.officialWebsite} showIcon>
            {new URL(org.officialWebsite).hostname}
          </ExternalLink>
        </div>

        {/* 7. Official donation URL */}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Official donation page
          </p>
          {org.officialDonationUrl ? (
            <ExternalLink href={org.officialDonationUrl} showIcon>
              {new URL(org.officialDonationUrl).hostname}
            </ExternalLink>
          ) : (
            <p className="text-sm text-charcoal/50 italic">
              No official donation page recorded.
            </p>
          )}
        </div>

        {/* 11. Last link checks */}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Website last checked
          </p>
          {org.officialWebsiteCheckedAt ? (
            <p className="text-sm text-charcoal/80">
              {org.officialWebsiteCheckedAt}
            </p>
          ) : (
            <p className="text-sm text-charcoal/50 italic">review_pending</p>
          )}
        </div>

        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Donation link last checked
          </p>
          {org.officialDonationUrl ? (
            org.officialDonationUrlCheckedAt ? (
              <p className="text-sm text-charcoal/80">
                {org.officialDonationUrlCheckedAt}
              </p>
            ) : (
              <p className="text-sm text-charcoal/50 italic">review_pending</p>
            )
          ) : (
            <p className="text-sm text-charcoal/50 italic">
              No donation link to check.
            </p>
          )}
        </div>

        {/* 12. Last reviewed */}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Last reviewed
          </p>
          {org.lastReviewedAt ? (
            <p className="text-sm text-charcoal/80">
              {org.lastReviewedAt}
            </p>
          ) : (
            <p className="text-sm text-charcoal/50 italic">review_pending</p>
          )}
        </div>

        {/* 13. Version */}
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-0.5">
            Record version
          </p>
          <p className="text-sm text-charcoal/80">v{org.version}</p>
        </div>
      </div>

      {/* Reviewer role */}
      {org.reviewedByRole && (
        <div className="mb-8 p-4 bg-bone border border-border rounded-lg">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-1">
            Reviewer role
          </p>
          <p className="text-sm text-charcoal/75">
            {org.reviewedByRole}
          </p>
          <p className="text-xs text-charcoal/50 mt-1">
            Reviewers are identified by role, not by name. This role
            description is public and authorised for display.
          </p>
        </div>
      )}

      {/* ── 10. Source records supporting the listing ────────────────────── */}
      <div className="mb-8">
        <h2 className="font-serif text-xl font-semibold text-ink mb-4">
          Listing sources
        </h2>
        {listingSources.length > 0 ? (
          <SourceList
            sources={listingSources}
            title="Sources supporting this listing"
            emptyMessage="No source records are linked to this listing."
          />
        ) : (
          <div className="bg-bone border border-border rounded-lg p-5">
            <p className="text-sm text-charcoal/75 leading-relaxed">
              This organization is listed as a public resource based on its
              own publicly available website. The listing information —
              name, description, services, and regions — is drawn from the
              organization&rsquo;s published materials. No structured source
              records have been linked yet.
            </p>
            <p className="text-xs text-charcoal/50 mt-2">
              During the static beta, listing-source records are being
              developed. The organization&rsquo;s official website serves
              as the primary public reference for the listing.
            </p>
          </div>
        )}
      </div>

      {/* Review notes */}
      {org.reviewNotes && (
        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-ink mb-3">
            Review notes
          </h2>
          <div className="bg-bone border border-border rounded-lg p-5">
            <p className="text-sm text-charcoal/75 leading-relaxed">
              {org.reviewNotes}
            </p>
          </div>
        </div>
      )}

      {/* ── 15. No-partnership disclaimer ────────────────────────────────── */}
      <div className="bg-amber/5 border border-amber/20 rounded-lg p-5 mb-6">
        <p className="font-serif text-base font-semibold text-ink mb-2">
          No partnership implied
        </p>
        <p className="text-sm text-charcoal/75 leading-relaxed">
          Listing does not imply partnership, endorsement, approval, or
          affiliation with Accountability Atlas. This organization is listed
          as a public resource based on publicly available information. It is
          listed as{" "}
          <strong>
            {RELATIONSHIP_STATUS_LABEL[org.relationshipStatus].toLowerCase()}
          </strong>
          . The organization has not requested inclusion and may not be aware
          of this listing.
        </p>
        <p className="text-xs text-charcoal/50 mt-2">
          No logos, staff lists, private contact data, email addresses, or
          partnership language are published. Only official public websites
          and official donation pages are linked.
        </p>
      </div>

      {/* ── 16. Donation-processing disclaimer ───────────────────────────── */}
      {org.officialDonationUrl && (
        <div className="mb-8">
          <OrganizationDisclaimer />
        </div>
      )}

      {/* ── Editorial status explainer ───────────────────────────────────── */}
      <div className="bg-bone border border-border rounded-lg p-5 mb-8">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/45 mb-2">
          About this listing
        </p>
        <p className="text-sm text-charcoal/75 leading-relaxed">
          Relationship status describes how the platform relates to this
          organization. Editorial content status describes whether this
          listing has completed editorial review. These dimensions are kept
          separate.{" "}
          {org.contentStatus !== "reviewed" &&
            "This listing has not been editorially reviewed. Do not describe it as verified or reviewed content."}
        </p>
      </div>

      {/* ── Methodology link ────────────────────────────────────────────── */}
      <p className="text-sm text-charcoal/60 mb-2">
        For details on how organizations are listed, categorised, and reviewed,
        see the{" "}
        <Link
          to="/methodology"
          className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
        >
          Methodology
        </Link>
        {" and "}
        <Link
          to="/corrections"
          className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
        >
          relationship status policy
        </Link>
        .
      </p>

      {/* ── 14. Correction/removal route ─────────────────────────────────── */}
      <div className="border-t border-border pt-6 mt-6">
        <p className="text-sm text-charcoal/60">
          <Link
            to={org.correctionUrl}
            className="text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Request a correction to this listing
          </Link>
          {" — "}
          <Link
            to="/corrections"
            className="text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Request removal
          </Link>
        </p>
      </div>

      <CorrectionLink />
      <LastUpdated date="2026-07-13" />
    </Container>
  );
}
