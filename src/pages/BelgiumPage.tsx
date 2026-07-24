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
import {
  belgiumFederalPositions,
  belgiumCompetencies,
  belgiumOfficialStatements,
  belgiumArmsTransferPolicies,
  belgiumHumanitarianAid,
  belgiumContactRoutes,
} from "../data/belgiumData";

const COMPETENCY_BADGES: Record<string, { variant: "neutral" | "info" | "warning" | "alert"; label: string }> = {
  federal: { variant: "neutral", label: "Federal" },
  regional: { variant: "warning", label: "Regional" },
  shared: { variant: "info", label: "Shared" },
  eu: { variant: "info", label: "EU" },
  international: { variant: "neutral", label: "International" },
};

export default function BelgiumPage() {
  return (
    <Container className="py-16 lg:py-20 country-print">
      <PrintHeader
        title="Belgium — Country Accountability"
        version={1}
        status="Content under review — review_pending"
        dates="Last updated: 2026-07-24"
        extraLines={["Country accountability page tracking government positions, competencies, aid contributions, and contact routes. All content is source-linked and awaits expert review."]}
      />

      <PageIntro
        eyebrow="Country Accountability"
        title="Belgium"
        description="Source-linked records of Belgian federal positions, competency boundaries, arms-transfer policy, humanitarian aid contributions, official statements, and lawful contact routes. All content is review_pending. No scores or rankings are published."
      />

      <PageStatusNotice title="All content review_pending" variant="warning">
        <p>
          Every position, competency statement, aid figure, and contact route on
          this page is linked to official sources. No content has completed
          editorial or competency review. Federal/regional/EU competencies are
          visibly distinguished. No accountability scores appear.
        </p>
      </PageStatusNotice>

      {/* Competency caution */}
      <Reveal delay={0.12}>
        <div
          className="bg-bone border border-amber/30 rounded-lg p-5 mb-10"
          role="note"
        >
          <div className="flex items-start gap-3">
            <Badge variant="warning">Competency note</Badge>
            <p className="text-sm text-charcoal/80 leading-relaxed">
              Belgium hosts EU institutions and NATO headquarters in Brussels.
              This page tracks Belgian federal and regional government
              positions, not EU or NATO decisions. Belgium does not control
              those institutions. The{" "}
              <Link
                to="/institutions/european-union"
                className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
              >
                European Union institution page
              </Link>{" "}
              separately tracks EU-level mechanisms.
            </p>
          </div>
        </div>
      </Reveal>

      {/* 1. Federal & Regional Competencies */}
      <PolicySection title="Federal & Regional Competencies" id="competencies" delay={0.15}>
        <p>
          Belgium is a federal state. Foreign policy, defence, and international
          treaty obligations are federal competencies. Arms-export licensing is a
          regional competency. Humanitarian aid is primarily federal with regional
          programmes. Understanding these divisions is essential for effective
          accountability engagement.
        </p>
      </PolicySection>

      <div className="space-y-5 mb-10">
        {belgiumCompetencies.map((comp, i) => (
          <Reveal key={comp.id} delay={0.17 + i * 0.05}>
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

      {/* 2. Federal Positions */}
      <PolicySection title="Federal Positions" id="federal-positions" delay={0.22}>
        <p>
          Belgium's current federal positions on accountability-related issues.
          Each entry is dated and attributed to the specific government body.
          Distinguish federal government positions from regional government
          actions and from EU-level decisions.
        </p>
      </PolicySection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {belgiumFederalPositions.map((pos, i) => (
          <Reveal key={pos.id} delay={0.24 + i * 0.05}>
            <Card title={pos.area} accent="clay">
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

      {/* 3. Arms-Transfer Policy */}
      <PolicySection title="Arms-Transfer Policy" id="arms-transfer" delay={0.30}>
        <p>
          Belgium's arms-export and arms-transit policy involves federal,
          regional, and judicial actions. Regional governments license arms
          exports independently. Federal authorities enforce airspace
          restrictions and customs controls. Courts have imposed additional
          requirements through litigation.
        </p>
      </PolicySection>

      <div className="space-y-5 mb-10">
        {belgiumArmsTransferPolicies.map((policy, i) => (
          <Reveal key={policy.id} delay={0.32 + i * 0.05}>
            <div className="border border-border/50 rounded-lg p-5 bg-white">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-base font-semibold text-charcoal">
                  {policy.authority}
                </h3>
                <Badge variant={COMPETENCY_BADGES[policy.level]?.variant ?? "neutral"}>
                  {COMPETENCY_BADGES[policy.level]?.label ?? policy.level}
                </Badge>
              </div>
              <p className="text-sm text-charcoal/80 leading-relaxed mb-2">
                {policy.policy}
              </p>
              <p className="text-xs text-charcoal/50">
                {policy.date} — Sources: {policy.sourceIds.length} record{policy.sourceIds.length !== 1 ? "s" : ""} linked.
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* 4. Humanitarian Aid */}
      <PolicySection title="Humanitarian Aid Contributions" id="humanitarian-aid" delay={0.38}>
        <p>
          Belgium's documented humanitarian aid contributions and commitments
          relevant to Gaza and the occupied Palestinian territory. Amounts are
          drawn from official sources (FPS Foreign Affairs, Open Aid platform).
          Disbursement status may differ from announced commitments.
        </p>
      </PolicySection>

      <div className="space-y-4 mb-10">
        {belgiumHumanitarianAid.map((aid, i) => (
          <Reveal key={aid.id} delay={0.40 + i * 0.04}>
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

      {/* 5. Official Statements */}
      <PolicySection title="Official Statements" id="official-statements" delay={0.46}>
        <p>
          Key public statements by Belgian officials on accountability-related
          matters. Statements are dated, attributed, and sourced. This is a
          representative selection — it is not a comprehensive archive.
        </p>
      </PolicySection>

      <div className="space-y-4 mb-10">
        {belgiumOfficialStatements.map((stmt, i) => (
          <Reveal key={stmt.id} delay={0.48 + i * 0.05}>
            <div className="border border-border/40 rounded p-4 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                <h3 className="text-sm font-semibold text-charcoal">
                  {stmt.speaker}, {stmt.office}
                </h3>
                <span className="text-xs text-charcoal/50">{stmt.date}</span>
              </div>
              <p className="text-sm text-charcoal/80 leading-relaxed">
                {stmt.summary}
              </p>
              <p className="text-xs text-charcoal/50 mt-1">
                Sources: {stmt.sourceIds.length} record{stmt.sourceIds.length !== 1 ? "s" : ""} linked.
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* 6. Contact Routes */}
      <PolicySection title="Representatives & Contact Routes" id="contact-routes" delay={0.54}>
        <p>
          Official contact routes for lawful civic engagement with Belgian
          federal and regional representatives. All contact information is
          public. No private personal data is published. All engagement should be
          polite, lawful, and non-harassing.
        </p>
      </PolicySection>

      <div className="space-y-4 mb-10">
        {belgiumContactRoutes.map((route, i) => (
          <Reveal key={route.id} delay={0.56 + i * 0.05}>
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

      {/* 7. Transparency & Data Gaps */}
      <PolicySection title="Transparency & Data Gaps" id="transparency-gaps" delay={0.60}>
        <p>
          <strong>Arms-export reporting:</strong> Belgium's regional licensing
          structure creates coordination gaps. Regional export reports are
          published separately (Flanders, Wallonia, Brussels-Capital). Federal
          customs data is not always aligned with regional licensing data. This
          makes comprehensive arms-transfer tracking difficult.
        </p>
        <p>
          <strong>UN voting records:</strong> Belgium's UN voting records are
          available through the UN Digital Library, but data entry for specific
          resolutions relevant to civilian protection, humanitarian access, and
          accountability requires dedicated retrieval and verification. This
          section will be populated as records are verified.
        </p>
        <p>
          <strong>Aid disbursement vs. commitment:</strong> Announced
          humanitarian aid commitments may differ from actual disbursements.
          Verification of disbursement status requires access to implementation
          reports not always publicly available in real time.
        </p>
        <p>
          <strong>EU Council positions:</strong> Belgium's positions in EU
          Council deliberations on CFSP matters (sanctions, Association Agreement
          suspension) are generally not public. This is a structural
          transparency limitation on tracking member-state influence within EU
          decision-making.
        </p>
      </PolicySection>

      <PreviewNotice title="This page contains review_pending content only">
        All positions, competency statements, aid figures, and contact routes
        are source-linked but have not completed editorial, competency, or
        legal review. No accountability scores appear. Belgium does not control
        EU or NATO institutions hosted in Brussels. Corrections are welcome
        through the corrections process.
      </PreviewNotice>

      <CorrectionLink />
      <LastUpdated date="2026-07-24" />

      <PrintFooter
        canonicalPath="/countries/belgium"
        extraLines={[
          "Content under review. No accountability scores or final policy conclusions are published.",
        ]}
      />
    </Container>
  );
}
