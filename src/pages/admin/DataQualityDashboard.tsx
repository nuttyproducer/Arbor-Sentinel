// src/pages/admin/DataQualityDashboard.tsx
import { useMemo, useState, useCallback } from "react";
import { Container } from "../../components/ui/Container";
import { PageIntro } from "../../components/pages/PageIntro";
import { PageStatusNotice } from "../../components/pages/PageStatusNotice";
import { TimeRangeSelector } from "../../components/admin/shared/TimeRangeSelector";
import { AutoRefreshProvider, AutoRefreshControls } from "../../components/admin/shared/AutoRefreshProvider";
import { useAutoRefresh, useAutoRefreshContext } from "../../components/admin/shared/useAutoRefresh";
import { ConfidenceDistribution } from "../../components/admin/ConfidenceDistribution";
import { ContradictionRatePanel } from "../../components/admin/ContradictionRatePanel";
import { DuplicateRatePanel } from "../../components/admin/DuplicateRatePanel";
import { SourceCoverageMap } from "../../components/admin/SourceCoverageMap";
import { DataFreshnessPanel } from "../../components/admin/DataFreshnessPanel";
import { DataQualityTrend } from "../../components/admin/DataQualityTrend";
import {
  getConfidenceDistribution, getContradictionRates, getDuplicateRates,
  getSourceCoverage, getDataFreshness, getQualityTrends, getQualityAlerts,
  DEFAULT_QUALITY_THRESHOLDS,
} from "../../lib/admin/qualityMetrics";
import { seedAuditLogs, seedQualityData } from "../../lib/admin/seedData";
import type { TimeRangePreset, DashboardTimeRange, QualityAlert } from "../../lib/admin/types";

const STAGES = ["entity_extraction", "claim_extraction", "summarization", "translation", "language_detection"];

function QualityAlertsBanner({ alerts }: { alerts: QualityAlert[] }) {
  if (alerts.length === 0) return null;
  return (
    <div className="space-y-2 mb-6">
      {alerts.map((a, i) => (
        <div key={i} className="bg-amber/5 border border-amber/20 rounded-lg p-3 flex items-start gap-2">
          <span className="text-amber mt-0.5" aria-hidden="true">⚠</span>
          <p className="font-sans text-sm text-ink">{a.message}</p>
        </div>
      ))}
    </div>
  );
}

function DataQualityDashboardContent() {
  const [preset, setPreset] = useState<TimeRangePreset>("30d");
  const [range, setRange] = useState<DashboardTimeRange>(() => ({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
  }));

  // Snapshot "now" once on mount so freshness timestamps are stable for the session.
  const [now] = useState(() => Date.now());

  const { entries, qualityData } = useMemo(() => ({
    entries: seedAuditLogs(),
    qualityData: seedQualityData(),
  }), []);

  const [confidenceStageFilter, setConfidenceStageFilter] = useState("");
  const confidenceData = useMemo(
    () => getConfidenceDistribution(entries, confidenceStageFilter || undefined),
    [entries, confidenceStageFilter],
  );
  const contradictionData = useMemo(() => getContradictionRates(qualityData.contradictionReports), [qualityData]);
  const duplicateData = useMemo(() => getDuplicateRates(qualityData.duplicateGroups), [qualityData]);

  const coverageCells = useMemo(() => getSourceCoverage(
    ["Belgium", "EU", "Gaza", "West Bank", "Lebanon"],
    ["court", "un", "government", "ngo", "academic", "journalism", "osint"],
    {
      Belgium: { court: 3, un: 2, government: 2, ngo: 4, academic: 1, journalism: 3 },
      EU: { court: 3, un: 2, government: 3, ngo: 2, academic: 1, journalism: 2, osint: 0 },
      Gaza: { court: 2, un: 3, ngo: 3, journalism: 4, academic: 1 },
      "West Bank": { ngo: 2, journalism: 1 },
      Lebanon: { un: 1, ngo: 1 },
    },
  ), []);

  const freshnessData = useMemo(() => getDataFreshness([
    { category: "evidence", lastUpdated: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(), thresholdDays: 7 },
    { category: "legal_cases", lastUpdated: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(), thresholdDays: 14 },
    { category: "countries", lastUpdated: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString(), thresholdDays: 7 },
    { category: "institutions", lastUpdated: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(), thresholdDays: 14 },
    { category: "organizations", lastUpdated: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(), thresholdDays: 14 },
    { category: "actions", lastUpdated: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(), thresholdDays: 30 },
  ]), [now]);

  const trendData = useMemo(() => getQualityTrends(
    qualityData.scores, qualityData.contradictionReports, qualityData.duplicateGroups,
    freshnessData.map((f) => ({ category: f.category, lastUpdated: f.lastUpdated, thresholdDays: f.thresholdDays })),
    range,
  ), [qualityData, freshnessData, range]);

  const qualityAlerts = useMemo(() => getQualityAlerts(
    entries, qualityData.contradictionReports, qualityData.duplicateGroups,
    freshnessData.map((f) => ({ category: f.category, lastUpdated: f.lastUpdated, thresholdDays: f.thresholdDays })),
    DEFAULT_QUALITY_THRESHOLDS,
  ), [entries, qualityData, freshnessData]);

  const handleTimeChange = useCallback(
    (change: { preset: TimeRangePreset; range: DashboardTimeRange }) => {
      setPreset(change.preset);
      setRange(change.range);
    }, [],
  );

  const { interval } = useAutoRefreshContext();
  const [, setTick] = useState(0);
  useAutoRefresh(() => setTick((t) => t + 1), interval);

  return (
    <Container className="py-12">
      <PageIntro title="Data Quality" description="Confidence scores, contradiction rates, duplicate detection, source coverage, and data freshness." />
      <PageStatusNotice label="Static Preview">This dashboard shows in-memory development data. All metrics are aggregates — no individual content items are exposed.</PageStatusNotice>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <TimeRangeSelector value={preset} onChange={handleTimeChange} />
        <AutoRefreshControls />
      </div>

      <QualityAlertsBanner alerts={qualityAlerts} />

      <div className="space-y-8">
        <ConfidenceDistribution data={confidenceData} stages={STAGES} activeStage={confidenceStageFilter} onStageChange={setConfidenceStageFilter} />
        <ContradictionRatePanel byContentType={contradictionData.byContentType} bySourceType={contradictionData.bySourceType} unresolvedTotal={contradictionData.unresolvedTotal} />
        <DuplicateRatePanel data={duplicateData} />
        <SourceCoverageMap cells={coverageCells} />
        <DataFreshnessPanel items={freshnessData} />
        <DataQualityTrend data={trendData} />
      </div>
    </Container>
  );
}

export default function DataQualityDashboard() {
  return (
    <AutoRefreshProvider>
      <DataQualityDashboardContent />
    </AutoRefreshProvider>
  );
}
