// src/pages/admin/ReviewMetricsDashboard.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Container } from "../../components/ui/Container";
import { PageIntro } from "../../components/pages/PageIntro";
import { TimeRangeSelector } from "../../components/admin/shared/TimeRangeSelector";
import { AutoRefreshProvider, AutoRefreshControls } from "../../components/admin/shared/AutoRefreshProvider";
import { useAutoRefreshContext } from "../../components/admin/shared/useAutoRefresh";
import { ReviewQueueDepth } from "../../components/admin/ReviewQueueDepth";
import { ReviewAgeChart } from "../../components/admin/ReviewAgeChart";
import { ReviewThroughputChart } from "../../components/admin/ReviewThroughputChart";
import { SLAComplianceChart } from "../../components/admin/SLAComplianceChart";
import { ReviewerPerformanceTable } from "../../components/admin/ReviewerPerformanceTable";
import { BottleneckPanel } from "../../components/admin/BottleneckPanel";
import { getQueueDepth, getAgeDistribution, getThroughput, getReviewerPerformance, getSLACompliance, detectBottlenecks, fetchReviewData } from "../../lib/admin/reviewMetrics";
import type { ReviewItem, ReviewerProfile } from "../../lib/review/types";
import type { TimeRangePreset, DashboardTimeRange } from "../../lib/admin/types";

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function ReviewMetricsDashboardContent() {
  const [preset, setPreset] = useState<TimeRangePreset>("7d");
  const [range, setRange] = useState<DashboardTimeRange>(() => ({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
  }));

  const [data, setData] = useState<{
    items: ReviewItem[];
    profiles: ReviewerProfile[];
  } | null>(null);

  const { interval } = useAutoRefreshContext();
  const [, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const result = await fetchReviewData(range);
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

  const queueDepth = useMemo(() => data ? getQueueDepth(data.items) : null, [data]);
  const ageDistribution = useMemo(() => data ? getAgeDistribution(data.items) : [], [data]);
  const throughput = useMemo(() => data ? getThroughput(data.items, range) : [], [data, range]);
  const reviewerMetrics = useMemo(() => data ? getReviewerPerformance(data.profiles, data.items) : [], [data]);
  const slaCompliance = useMemo(() => data ? getSLACompliance(data.items, range) : [], [data, range]);
  const bottlenecks = useMemo(() => data ? detectBottlenecks(data.items, data.profiles) : [], [data]);

  const handleTimeChange = useCallback(
    (change: { preset: TimeRangePreset; range: DashboardTimeRange }) => {
      setPreset(change.preset);
      setRange(change.range);
    },
    [],
  );

  const handleExportCSV = useCallback(() => {
    const stamp = new Date().toISOString().slice(0, 10);
    const headers = ["Reviewer ID", "Completed", "Avg Time (min)", "SLA %", "Workload"];
    const rows = reviewerMetrics.map((m) => [
      m.id, String(m.completed), String(m.avgTimeMinutes), String(m.slaCompliancePercent), `${m.workload}/${m.maxWorkload}`,
    ]);
    downloadCSV(`review-metrics-${stamp}.csv`, headers, rows);
  }, [reviewerMetrics]);

  return (
    <Container className="py-12">
      <PageIntro title="Review Queue Metrics" description="Queue depth, age distribution, throughput, SLA compliance, and bottleneck detection." />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <TimeRangeSelector value={preset} onChange={handleTimeChange} />
          <AutoRefreshControls />
        </div>
        {data && (
          <button
            type="button"
            onClick={handleExportCSV}
            className="font-mono text-xs text-trust hover:text-trust/80 underline underline-offset-2 transition-colors min-h-[44px]"
          >
            Export CSV
          </button>
        )}
      </div>

      {!data ? (
        <div className="flex items-center justify-center py-20" aria-busy="true">
          <span className="font-mono text-sm text-charcoal/40">Loading review data…</span>
        </div>
      ) : (
        <div className="space-y-8">
          <ReviewQueueDepth data={queueDepth!} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ReviewAgeChart data={ageDistribution} />
            <ReviewThroughputChart data={throughput} />
          </div>
          <SLAComplianceChart data={slaCompliance} targetPercent={90} />
          <ReviewerPerformanceTable data={reviewerMetrics} />
          <BottleneckPanel bottlenecks={bottlenecks} />
        </div>
      )}
    </Container>
  );
}

export default function ReviewMetricsDashboard() {
  return (
    <AutoRefreshProvider>
      <ReviewMetricsDashboardContent />
    </AutoRefreshProvider>
  );
}
