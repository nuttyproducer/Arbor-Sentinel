import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Reveal } from "../components/ui/Reveal";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { PageIntro } from "../components/pages/PageIntro";
import { PageStatusNotice } from "../components/pages/PageStatusNotice";
import { PolicySection } from "../components/pages/PolicySection";
import { LastUpdated } from "../components/pages/LastUpdated";
import { PreviewNotice } from "../components/pages/PreviewNotice";
import { CorrectionLink } from "../components/pages/CorrectionLink";
import { PrintHeader, PrintFooter } from "../components/pages/PrintOnly";
import { euInstitutions } from "../data/institutions";
import {
  euInstitutionPositions,
  euCompetencies,
  euHumanitarianAid,
  euContactRoutes,
  euDataGaps,
} from "../data/euData";
import { CONTENT_STATUS_LABELS } from "../types/content";

const COMPETENCY_BADGES: Record<string, { variant: "neutral" | "info" | "warning" | "alert"; label: string }> = {
  eu: { variant: "info", label: "EU" },
  shared: { variant: "warning", label: "Shared — member states" },
};

export default function EuropeanUnionPage() {
  return (
    <Container className="py-16 lg:py-20 institution-print">
      <PrintHeader
        title="European Union — Institution Accountability"
        version={1}
        status="Content under review — review_pending"
        dates="Last updated: 2026-07-24"
        extraLines={["Institution accountability page tracking EU positions, competencies, aid, and citizen routes. All content is source-linked and awaits expert review."]}
      />

      <PageIntro
        eyebrow="Institution Accountability"
        title="European Union"
        description="Source-linked records of EU institutional positions, competency boundaries, humanitarian aid contributions, and lawful citizen-engagement routes. EU powers are described only within their legal competencies. All content is review_pending. No scores or rankings are published."
      />

      <PageStatusNotice title="All content review_pending" variant="warning">
        <p>
          Every position, competency statement, and aid figure on this page is
          linked to official EU sources. EU competencies are distinguished from
          member-state competencies. EU powers are described within legal
          limits only. No content has completed editorial or competency review.
        </p>
      </PageStatusNotice>

      {/* Competency note */}
      <Reveal delay={0.12}>
        <div
          className="bg-bone border border-amber/30 rounded-lg p-5 mb-10"
          role="note"
        >
          <div className="flex items-start gap-3">
            <Badge variant="warning">Competency note</Badge>
            <p className="text-sm text-charcoal/80 leading-relaxed">
              The EU is not a state. Its powers vary by policy area. Some
              decisions sit with EU institutions, some with member states, and
              some require unanimity or national implementation. This page
              tracks what the EU can do, what it has done, and where the boundary
              between EU and national responsibility lies.{" "}
              <Link
                to="/countries/belgium"
                className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
              >
                Country pages
              </Link>{" "}
              (starting with Belgium) track member-state-level accountability
              separately.
            </p>
          </div>
        </div>
      </Reveal>

      {/* 1. Institution Roles & Competencies */}
      <PolicySection title="EU Institutions" id="institutions" delay={0.15}>
        <p>
          The roles, legal competencies, and tracking focus for each EU
          institution relevant to accountability. Institutional descriptions
          reflect legal competencies under the EU Treaties.
        </p>
      </PolicySection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {euInstitutions.map((inst, i) => (
          <Reveal key={inst.id} delay={0.17 + i * 0.06}>
            <Card
              title={inst.name}
              label={inst.acronym}
              accent={
                inst.status === "static_preview"
                  ? "blue"
                  : inst.status === "review_pending"
                    ? "amber"
                    : "clay"
              }
            >
              <p className="text-charcoal/80 leading-relaxed mb-2">
                <span className="font-semibold text-ink">Role: </span>
                {inst.role}
              </p>
              <p className="text-charcoal/80 leading-relaxed mb-2">
                <span className="font-semibold text-ink">Competency: </span>
                {inst.competency}
              </p>
              <p className="text-charcoal/80 leading-relaxed mb-3">
                <span className="font-semibold text-ink">Tracking: </span>
                {inst.trackingNote}
              </p>
              <Badge
                variant={
                  inst.status === "static_preview"
                    ? "info"
                    : inst.status === "review_pending"
                      ? "warning"
                      : "neutral"
                }
              >
                {CONTENT_STATUS_LABELS[inst.status]}
              </Badge>
            </Card>
          </Reveal>
        ))}
      </div>

      {/* 2. EU Competencies by Policy Area */}
      <PolicySection title="Competencies by Policy Area" id="eu-competencies" delay={0.25}>
        <p>
          EU competence varies by policy area. The following records distinguish
          exclusive EU competence, shared competence, and areas where member
          states retain primary authority. EU powers are described only within
          their legal basis under the Treaties.
        </p>
      </PolicySection>

      <div className="space-y-5 mb-10">
        {euCompetencies.map((comp, i) => (
          <Reveal key={comp.id} delay={0.27 + i * 0.05}>
            <div className="border border-border/50 rounded-lg p-5 bg-white">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-base font-semibold text-charcoal">
                  {comp.area}
                </h3>
                <Badge variant={COMPETENCY_BADGES[comp.level]?.variant ?? "neutral"}>
                  {COMPETENCY_BADGES[comp.level]?.label ?? comp.level}
                </Badge>
              </div>
              <p className="text-sm text-charcoal/80 leading-relaxed mb-2">
                {comp.description}
              </p>
              <p className="text-xs text-charcoal/60 leading-relaxed">
                <span className="font-semibold">Belongs to:</span> {comp.belongsTo}
              </p>
              <p className="text-xs text-charcoal/60 leading-relaxed">
                <span className="font-semibold">Does not belong to:</span>{" "}
                {comp.doesNotBelongTo}
              </p>
              <p className="text-xs text-charcoal/50 mt-2">
                Sources: {comp.sourceIds.length} source record{comp.sourceIds.length !== 1 ? "s" : ""} linked.
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* 3. Institution Positions */}
      <PolicySection title="EU Institutional Positions" id="eu-positions" delay={0.35}>
        <p>
          Current EU institutional positions and actions relevant to
          accountability. Each entry is dated and attributed to the specific
          institution. EP resolutions are political statements — they are not
          legally binding. Commission proposals require Council adoption to take
          effect.
        </p>
      </PolicySection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {euInstitutionPositions.map((pos, i) => (
          <Reveal key={pos.id} delay={0.37 + i * 0.05}>
            <Card title={pos.area} label={pos.institution} accent="clay">
              <p className="text-sm text-charcoal/80 leading-relaxed mb-2">
                {pos.position}
              </p>
              <p className="text-xs text-charcoal/50">
                {pos.attribution} — {pos.date}
              </p>
              <p className="text-xs text-charcoal/50 mt-1">
                Sources: {pos.sourceIds.length} record{pos.sourceIds.length !== 1 ? "s" : ""} linked.
              </p>
            </Card>
          </Reveal>
        ))}
      </div>

      {/* 4. Humanitarian Aid */}
      <PolicySection title="Humanitarian Aid Contributions" id="eu-humanitarian-aid" delay={0.45}>
        <p>
          EU humanitarian aid allocations and commitments for Palestine through
          DG ECHO (European Civil Protection and Humanitarian Aid Operations).
          Amounts are indicative allocations — actual disbursements may differ.
          The EU is one of the world's largest humanitarian donors. Member states
          also provide bilateral humanitarian assistance independently.
        </p>
      </PolicySection>

      <div className="space-y-4 mb-10">
        {euHumanitarianAid.map((aid, i) => (
          <Reveal key={aid.id} delay={0.47 + i * 0.04}>
            <div className="border border-border/40 rounded p-4 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                <h3 className="text-sm font-semibold text-charcoal">
                  {aid.recipient}
                </h3>
                <span className="text-sm font-medium text-charcoal/70">
                  {aid.amount}
                </span>
              </div>
              <p className="text-xs text-charcoal/60 leading-relaxed">
                {aid.period} — via {aid.channel}
              </p>
              <p className="text-xs text-charcoal/50 mt-1">
                Sources: {aid.sourceIds.length} record{aid.sourceIds.length !== 1 ? "s" : ""} linked.
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* 5. Citizen & Civil-Society Routes */}
      <PolicySection title="Citizen & Civil-Society Routes" id="citizen-routes" delay={0.53}>
        <p>
          Lawful, official routes for EU citizens and residents to engage with
          EU institutions on accountability-related matters. All routes use
          official EU channels. All engagement should be polite, lawful, and
          non-harassing.
        </p>
      </PolicySection>

      <div className="space-y-5 mb-10">
        {euContactRoutes.map((route, i) => (
          <Reveal key={route.id} delay={0.55 + i * 0.05}>
            <div className="border border-border/50 rounded-lg p-5 bg-white">
              <h3 className="text-base font-semibold text-charcoal mb-1">
                {route.entity}
              </h3>
              <p className="text-sm text-charcoal/80 leading-relaxed mb-1">
                {route.route}
              </p>
              {route.url && (
                <p className="text-xs text-charcoal/50 mb-1">
                  Official page:{" "}
                  <a
                    href={route.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 rounded-sm"
                  >
                    {route.url}
                  </a>
                </p>
              )}
              <p className="text-xs text-charcoal/60 leading-relaxed mt-2 border-t border-border/30 pt-2">
                {route.notes}
              </p>
              <p className="text-xs text-charcoal/50 mt-1">
                Sources: {route.sourceIds.length} record{route.sourceIds.length !== 1 ? "s" : ""} linked.
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* 6. Transparency & Data Gaps */}
      <PolicySection title="Transparency & Data Gaps" id="transparency-gaps" delay={0.60}>
        {euDataGaps.map((gap, i) => (
          <div key={gap.area} className={i > 0 ? "mt-4" : ""}>
            <h3 className="text-base font-semibold text-charcoal mb-1">
              {gap.area}
            </h3>
            <p className="text-sm text-charcoal/80 leading-relaxed">
              {gap.description}
            </p>
            <p className="text-xs text-charcoal/50 mt-1">
              Sources: {gap.sourceIds.length} record{gap.sourceIds.length !== 1 ? "s" : ""} linked.
            </p>
          </div>
        ))}
      </PolicySection>

      {/* 7. Sources and Corrections */}
      <PolicySection title="Sources and Corrections" id="sources" delay={0.65}>
        <p>
          Every factual position or competency statement on this page is linked
          to a source record in the{" "}
          <Link
            to="/sources"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            Source Registry
          </Link>
          . Sources are categorized by type and assigned a verification level
          according to the{" "}
          <Link
            to="/methodology"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            methodology
          </Link>
          .
        </p>
        <p>
          EU institutional content requires review by contributors familiar with
          EU law, decision-making procedures, and foreign policy. Corrections
          are welcome through the{" "}
          <Link
            to="/corrections"
            className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
          >
            corrections process
          </Link>
          .
        </p>
      </PolicySection>

      <PreviewNotice title="This page contains review_pending content only">
        All positions, competency statements, aid figures, and contact routes
        are source-linked but have not completed editorial, competency, or
        legal review. EU powers are described only within their legal
        competencies. No accountability scores appear. The EU is not a state —
        its powers vary by policy area.
      </PreviewNotice>

      <CorrectionLink />
      <LastUpdated date="2026-07-24" />

      <PrintFooter
        canonicalPath="/institutions/european-union"
        extraLines={[
          "Content under review. No accountability scores or final policy conclusions are published.",
        ]}
      />
    </Container>
  );
}
