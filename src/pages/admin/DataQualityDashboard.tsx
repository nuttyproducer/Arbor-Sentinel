// src/pages/admin/DataQualityDashboard.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Container } from "../../components/ui/Container";
import { PageIntro } from "../../components/pages/PageIntro";
import { TimeRangeSelector } from "../../components/admin/shared/TimeRangeSelector";
import { AutoRefreshProvider, AutoRefreshControls } from "../../components/admin/shared/AutoRefreshProvider";
import { useAutoRefreshContext } from "../../components/admin/shared/useAutoRefresh";
import { ConfidenceDistribution } from "../../components/admin/ConfidenceDistribution";
import { ContradictionRatePanel } from "../../components/admin/ContradictionRatePanel";
import { DuplicateRatePanel } from "../../components/admin/DuplicateRatePanel";
import { SourceCoverageMap } from "../../components/admin/SourceCoverageMap";
import { DataFreshnessPanel } from "../../components/admin/DataFreshnessPanel";
import { DataQualityTrend } from "../../components/admin/DataQualityTrend";
import {
  getConfidenceDistribution, getContradictionRates, getDuplicateRates,
  getDataFreshness, getQualityTrends, getQualityAlerts,
  DEFAULT_QUALITY_THRESHOLDS, fetchQualityData,
} from "../../lib/admin/qualityMetrics";
import type { AILogEntry } from "../../lib/ai/types";
import type { TimeRangePreset, DashboardTimeRange, QualityAlert, CoverageCell } from "../../lib/admin/types";
import type { FreshnessInput } from "../../lib/admin/qualityMetrics";

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

interface QualityDashboardData {
  entries: AILogEntry[];
  qualityData: {
    scores: Array<{ stage: string; score: number; timestamp: string }>;
    contradictionReports: Array<{ contentType: string; sourceType: string; unresolved: number; total: number }>;
    duplicateGroups: Array<{ sourceType: string; detected: number; falsePositives: number; merged: number }>;
  };
  coverageCells: CoverageCell[];
  freshnessInputs: FreshnessInput[];
}

function DataQualityDashboardContent() {
  const [preset, setPreset] = useState<TimeRangePreset>("30d");
  const [range, setRange] = useState<DashboardTimeRange>(() => ({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
  }));

  const [data, setData] = useState<QualityDashboardData | null>(null);
  const [confidenceStageFilter, setConfidenceStageFilter] = useState("");

  const { interval } = useAutoRefreshContext();
  const [, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const result = await fetchQualityData(range);
      if (!cancelled) setData(result);
    }
    load();
    return () => { cancelled = true; };
  }, [range, setTick]);

  useEffect(() => {
    if (!interval) return;
    const id = setInterval(() => setTick((t) => t + 1), interval);
    return () => clearInterval(id);
  }, [interval]);

  const confidenceData = useMemo(
    () => data ? getConfidenceDistribution(data.entries, confidenceStageFilter || undefined) : [],
    [data, confidenceStageFilter],
  );
  const contradictionData = useMemo(
    () => data ? getContradictionRates(data.qualityData.contradictionReports) : { byContentType: [], bySourceType: [], unresolvedTotal: 0 },
    [data],
  );
  const duplicateData = useMemo(
    () => data ? getDuplicateRates(data.qualityData.duplicateGroups) : { detectionRate: 0, falsePositiveRate: 0, mergeRate: 0, bySourceType: {} },
    [data],
  );
  const freshnessData = useMemo(
    () => data ? getDataFreshness(data.freshnessInputs) : [],
    [data],
  );
  const trendData = useMemo(
    () => data ? getQualityTrends(
      data.qualityData.scores, data.qualityData.contradictionReports, data.qualityData.duplicateGroups,
      data.freshnessInputs, range,
    ) : [],
    [data, range],
  );
  const qualityAlerts = useMemo(
    () => data ? getQualityAlerts(
      data.entries, data.qualityData.contradictionReports, data.qualityData.duplicateGroups,
      data.freshnessInputs, DEFAULT_QUALITY_THRESHOLDS,
    ) : [],
    [data],
  );

  const handleTimeChange = useCallback(
    (change: { preset: TimeRangePreset; range: DashboardTimeRange }) => {
      setPreset(change.preset);
      setRange(change.range);
    }, [],
  );

  return (
    <Container className="py-12">
      <PageIntro title="Data Quality" description="Confidence scores, contradiction rates, duplicate detection, source coverage, and data freshness." />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <TimeRangeSelector value={preset} onChange={handleTimeChange} />
        <AutoRefreshControls />
      </div>

      {!data ? (
        <div className="flex items-center justify-center py-20" aria-busy="true">
          <span className="font-mono text-sm text-charcoal/40">Loading quality data…</span>
        </div>
      ) : (
        <>
          <QualityAlertsBanner alerts={qualityAlerts} />

          <div className="space-y-8">
            <ConfidenceDistribution data={confidenceData} stages={STAGES} activeStage={confidenceStageFilter} onStageChange={setConfidenceStageFilter} />
            <ContradictionRatePanel byContentType={contradictionData.byContentType} bySourceType={contradictionData.bySourceType} unresolvedTotal={contradictionData.unresolvedTotal} />
            <DuplicateRatePanel data={duplicateData} />
            <SourceCoverageMap cells={data.coverageCells} />
            <DataFreshnessPanel items={freshnessData} />
            <DataQualityTrend data={trendData} />
          </div>
        </>
      )}
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
