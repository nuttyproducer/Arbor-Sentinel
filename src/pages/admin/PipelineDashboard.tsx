// src/pages/admin/PipelineDashboard.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Container } from "../../components/ui/Container";
import { PageIntro } from "../../components/pages/PageIntro";
import { TimeRangeSelector } from "../../components/admin/shared/TimeRangeSelector";
import { AutoRefreshProvider, AutoRefreshControls } from "../../components/admin/shared/AutoRefreshProvider";
import { useAutoRefreshContext } from "../../components/admin/shared/useAutoRefresh";
import { SourceOverviewPanel } from "../../components/admin/SourceOverviewPanel";
import { IngestionChart } from "../../components/admin/IngestionChart";
import { AIPipelineMetrics } from "../../components/admin/AIPipelineMetrics";
import { CollectorStatusGrid } from "../../components/admin/CollectorStatusGrid";
import { ErrorRateChart } from "../../components/admin/ErrorRateChart";
import { getSourceOverview, getIngestionSeries, getPipelineMetrics, getCollectorGridItems, getErrorRateSeries, fetchPipelineData } from "../../lib/admin/metrics";
import type { CollectResult } from "../../lib/collectors/types";
import type { HealthReport, AlertEvent } from "../../lib/collectors/monitoring/types";
import type { TimeRangePreset, DashboardTimeRange } from "../../lib/admin/types";

function PipelineDashboardContent() {
  const [preset, setPreset] = useState<TimeRangePreset>("24h");
  const [range, setRange] = useState<DashboardTimeRange>(() => ({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
  }));

  const [data, setData] = useState<{
    runs: CollectResult[];
    report: HealthReport;
    events: AlertEvent[];
  } | null>(null);

  const { interval } = useAutoRefreshContext();
  const [, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const result = await fetchPipelineData(range);
      if (!cancelled) setData(result);
    }
    load();
    return () => { cancelled = true; };
  }, [range, setTick]);

  // Re-fetch on auto-refresh tick
  useEffect(() => {
    if (!interval) return;
    const id = setInterval(() => setTick((t) => t + 1), interval);
    return () => clearInterval(id);
  }, [interval]);

  const sourceOverview = useMemo(() => data ? getSourceOverview(data.report) : null, [data]);
  const ingestionData = useMemo(() => data ? getIngestionSeries(data.runs, range) : [], [data, range]);
  const pipelineMetrics = useMemo(() => data ? getPipelineMetrics(data.runs, range) : [], [data, range]);
  const gridItems = useMemo(() => data ? getCollectorGridItems(data.report) : [], [data]);
  const errorRateData = useMemo(() => data ? getErrorRateSeries(data.events, range) : [], [data, range]);

  const handleTimeChange = useCallback(
    (change: { preset: TimeRangePreset; range: DashboardTimeRange }) => {
      setPreset(change.preset);
      setRange(change.range);
    },
    [],
  );

  return (
    <Container className="py-12">
      <PageIntro
        title="Pipeline Monitoring"
        description="Sources, ingestion, AI pipeline throughput and latency, error rates."
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <TimeRangeSelector value={preset} onChange={handleTimeChange} />
        <AutoRefreshControls />
      </div>

      {!data ? (
        <div className="flex items-center justify-center py-20" aria-busy="true">
          <span className="font-mono text-sm text-charcoal/40">Loading pipeline data…</span>
        </div>
      ) : (
        <div className="space-y-8">
          <SourceOverviewPanel data={sourceOverview!} />
          <IngestionChart data={ingestionData} />
          <AIPipelineMetrics data={pipelineMetrics} />
          <CollectorStatusGrid items={gridItems} />
          <ErrorRateChart data={errorRateData} />
        </div>
      )}
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
