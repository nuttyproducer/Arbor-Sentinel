// src/components/admin/AIPipelineMetrics.tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ChartContainer } from "./shared/ChartContainer";
import type { PipelineStageMetrics } from "../../lib/admin/types";

export interface AIPipelineMetricsProps {
  data: PipelineStageMetrics[];
  isLoading?: boolean;
  error?: string;
}

function latencyColor(ms: number): string {
  if (ms < 1000) return "text-green-700";
  if (ms < 5000) return "text-[#8B6914]";
  return "text-clay";
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function AIPipelineMetrics({ data, isLoading, error }: AIPipelineMetricsProps) {
  const chartData = data.map((d) => ({ stage: d.stageName, throughput: d.throughput }));

  return (
    <ChartContainer
      title="AI Pipeline Metrics"
      subtitle="Throughput per stage and latency percentiles"
      isLoading={isLoading}
      isEmpty={data.length === 0 && !isLoading}
      error={error}
    >
      <div className="space-y-4">
        {/* Throughput bar chart */}
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D8D6D0" />
            <XAxis dataKey="stage" tick={{ fontSize: 10, fill: "#1F2937" }} />
            <YAxis tick={{ fontSize: 11, fill: "#1F2937" }} />
            <Tooltip contentStyle={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }} />
            <Bar dataKey="throughput" fill="#3B6EA8" name="Items Processed" />
          </BarChart>
        </ResponsiveContainer>

        {/* Latency table */}
        <table className="w-full font-mono text-xs" aria-label="Pipeline stage latency percentiles">
          <thead>
            <tr className="border-b border-charcoal/20">
              <th className="text-left py-1.5 text-charcoal/60 font-medium">Stage</th>
              <th className="text-right py-1.5 text-charcoal/60 font-medium">p50</th>
              <th className="text-right py-1.5 text-charcoal/60 font-medium">p95</th>
              <th className="text-right py-1.5 text-charcoal/60 font-medium">p99</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.stageName} className="border-b border-charcoal/5">
                <td className="py-1.5 text-charcoal/80">{row.stageName}</td>
                <td className={`py-1.5 text-right ${latencyColor(row.latency.p50)}`}>{formatMs(row.latency.p50)}</td>
                <td className={`py-1.5 text-right ${latencyColor(row.latency.p95)}`}>{formatMs(row.latency.p95)}</td>
                <td className={`py-1.5 text-right ${latencyColor(row.latency.p99)}`}>{formatMs(row.latency.p99)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartContainer>
  );
}
