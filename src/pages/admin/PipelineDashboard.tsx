// src/pages/admin/PipelineDashboard.tsx
import { useMemo, useState, useCallback } from "react";
import { Container } from "../../components/ui/Container";
import { PageIntro } from "../../components/pages/PageIntro";
import { PageStatusNotice } from "../../components/pages/PageStatusNotice";
import { TimeRangeSelector } from "../../components/admin/shared/TimeRangeSelector";
import { AutoRefreshProvider, AutoRefreshControls } from "../../components/admin/shared/AutoRefreshProvider";
import { useAutoRefresh, useAutoRefreshContext } from "../../components/admin/shared/useAutoRefresh";
import { SourceOverviewPanel } from "../../components/admin/SourceOverviewPanel";
import { IngestionChart } from "../../components/admin/IngestionChart";
import { AIPipelineMetrics } from "../../components/admin/AIPipelineMetrics";
import { CollectorStatusGrid } from "../../components/admin/CollectorStatusGrid";
import { ErrorRateChart } from "../../components/admin/ErrorRateChart";
import { getSourceOverview, getIngestionSeries, getPipelineMetrics, getCollectorGridItems, getErrorRateSeries } from "../../lib/admin/metrics";
import { seedCollectorRuns, seedHealthReport, seedAlertEvents } from "../../lib/admin/seedData";
import type { TimeRangePreset, DashboardTimeRange } from "../../lib/admin/types";

function PipelineDashboardContent() {
  const [preset, setPreset] = useState<TimeRangePreset>("24h");
  const [range, setRange] = useState<DashboardTimeRange>(() => ({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
  }));

  // Seed data once on mount (in-memory, resets on reload)
  const { runs, report, events } = useMemo(() => ({
    runs: seedCollectorRuns(),
    report: seedHealthReport(),
    events: seedAlertEvents(),
  }), []);

  const sourceOverview = useMemo(() => getSourceOverview(report), [report]);
  const ingestionData = useMemo(() => getIngestionSeries(runs, range), [runs, range]);
  const pipelineMetrics = useMemo(() => getPipelineMetrics(runs, range), [runs, range]);
  const gridItems = useMemo(() => getCollectorGridItems(report), [report]);
  const errorRateData = useMemo(() => getErrorRateSeries(events, range), [events, range]);

  const handleTimeChange = useCallback(
    (change: { preset: TimeRangePreset; range: DashboardTimeRange }) => {
      setPreset(change.preset);
      setRange(change.range);
    },
    [],
  );

  // Auto-refresh: re-render on each tick (simulates live data)
  const { interval } = useAutoRefreshContext();
  const [, setTick] = useState(0);
  useAutoRefresh(() => setTick((t) => t + 1), interval);

  return (
    <Container className="py-12">
      <PageIntro
        title="Pipeline Monitoring"
        description="Sources, ingestion, AI pipeline throughput and latency, error rates."
      />

      <PageStatusNotice label="Static Preview">
        This dashboard shows in-memory development data. Metrics reset on page
        reload. Data is seeded from realistic mock values for preview purposes.
      </PageStatusNotice>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <TimeRangeSelector value={preset} onChange={handleTimeChange} />
        <AutoRefreshControls />
      </div>

      {/* Panels */}
      <div className="space-y-8">
        <SourceOverviewPanel data={sourceOverview} />
        <IngestionChart data={ingestionData} />
        <AIPipelineMetrics data={pipelineMetrics} />
        <CollectorStatusGrid items={gridItems} />
        <ErrorRateChart data={errorRateData} />
      </div>
    </Container>
  );
}

export default function PipelineDashboard() {
  return (
    <AutoRefreshProvider>
      <PipelineDashboardContent />
    </AutoRefreshProvider>
  );
}
