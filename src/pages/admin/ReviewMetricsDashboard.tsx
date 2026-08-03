// src/pages/admin/ReviewMetricsDashboard.tsx
import { useMemo, useState, useCallback } from "react";
import { Container } from "../../components/ui/Container";
import { PageIntro } from "../../components/pages/PageIntro";
import { PageStatusNotice } from "../../components/pages/PageStatusNotice";
import { TimeRangeSelector } from "../../components/admin/shared/TimeRangeSelector";
import { AutoRefreshProvider, AutoRefreshControls, useAutoRefresh, useAutoRefreshContext } from "../../components/admin/shared/AutoRefreshProvider";
import { ReviewQueueDepth } from "../../components/admin/ReviewQueueDepth";
import { ReviewAgeChart } from "../../components/admin/ReviewAgeChart";
import { ReviewThroughputChart } from "../../components/admin/ReviewThroughputChart";
import { SLAComplianceChart } from "../../components/admin/SLAComplianceChart";
import { ReviewerPerformanceTable } from "../../components/admin/ReviewerPerformanceTable";
import { BottleneckPanel } from "../../components/admin/BottleneckPanel";
import { getQueueDepth, getAgeDistribution, getThroughput, getReviewerPerformance, getSLACompliance, detectBottlenecks } from "../../lib/admin/reviewMetrics";
import { seedReviewItems, seedReviewerProfiles } from "../../lib/admin/seedData";
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

  const { items, profiles } = useMemo(() => ({
    items: seedReviewItems(),
    profiles: seedReviewerProfiles(),
  }), []);

  const queueDepth = useMemo(() => getQueueDepth(items), [items]);
  const ageDistribution = useMemo(() => getAgeDistribution(items), [items]);
  const throughput = useMemo(() => getThroughput(items, range), [items, range]);
  const reviewerMetrics = useMemo(() => getReviewerPerformance(profiles, items), [profiles, items]);
  const slaCompliance = useMemo(() => getSLACompliance(items, range), [items, range]);
  const bottlenecks = useMemo(() => detectBottlenecks(items, profiles), [items, profiles]);

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

  const { interval } = useAutoRefreshContext();
  const [, setTick] = useState(0);
  useAutoRefresh(() => setTick((t) => t + 1), interval);

  return (
    <Container className="py-12">
      <PageIntro title="Review Queue Metrics" description="Queue depth, age distribution, throughput, SLA compliance, and bottleneck detection." />

      <PageStatusNotice label="Static Preview">
        This dashboard shows in-memory development data. Review items and reviewer
        profiles are seeded from realistic mock values. All reviewer IDs are internal
        — no personal names are stored or displayed.
      </PageStatusNotice>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <TimeRangeSelector value={preset} onChange={handleTimeChange} />
          <AutoRefreshControls />
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
          className="font-mono text-xs text-trust hover:text-trust/80 underline underline-offset-2 transition-colors min-h-[44px]"
        >
          Export CSV
        </button>
      </div>

      <div className="space-y-8">
        <ReviewQueueDepth data={queueDepth} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ReviewAgeChart data={ageDistribution} />
          <ReviewThroughputChart data={throughput} />
        </div>
        <SLAComplianceChart data={slaCompliance} targetPercent={90} />
        <ReviewerPerformanceTable data={reviewerMetrics} />
        <BottleneckPanel bottlenecks={bottlenecks} />
      </div>
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
