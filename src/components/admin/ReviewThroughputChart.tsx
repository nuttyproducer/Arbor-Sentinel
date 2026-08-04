// src/components/admin/ReviewThroughputChart.tsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer } from "./shared/ChartContainer";
import type { ThroughputPoint } from "../../lib/admin/types";

export interface ReviewThroughputChartProps {
  data: ThroughputPoint[];
  isLoading?: boolean;
  error?: string;
}

export function ReviewThroughputChart({ data, isLoading, error }: ReviewThroughputChartProps) {
  return (
    <ChartContainer
      title="Review Throughput"
      subtitle="Items reviewed per day with 7-day moving average trend"
      isLoading={isLoading}
      isEmpty={data.length === 0 && !isLoading}
      error={error}
    >
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D8D6D0" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#1F2937" }} />
          <YAxis tick={{ fontSize: 11, fill: "#1F2937" }} allowDecimals={false} />
          <Tooltip contentStyle={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="reviewed" stroke="#3B6EA8" strokeWidth={2} dot={{ r: 3 }} name="Reviewed" />
          <Line type="monotone" dataKey="trend" stroke="#D99A2B" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="7d Trend" />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
