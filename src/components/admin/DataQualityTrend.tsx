import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer } from "./shared/ChartContainer";
import type { QualityTrendPoint } from "../../lib/admin/types";

export function DataQualityTrend({ data, isLoading, error }: {
  data: QualityTrendPoint[];
  isLoading?: boolean;
  error?: string;
}) {
  return (
    <ChartContainer title="Quality Trends" subtitle="Weekly/monthly quality metrics (all normalized to 0–100%)" isLoading={isLoading} isEmpty={data.length === 0 && !isLoading} error={error}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D8D6D0" />
          <XAxis dataKey="period" tick={{ fontSize: 10, fill: "#1F2937" }} />
          <YAxis tick={{ fontSize: 11, fill: "#1F2937" }} domain={[0, 100]} />
          <Tooltip contentStyle={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }} formatter={(v: number) => `${v}%`} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="confidence" stroke="#3B6EA8" strokeWidth={2} dot={{ r: 3 }} name="Avg Confidence" />
          <Line type="monotone" dataKey="contradictionRate" stroke="#B95C50" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Contradiction Rate" />
          <Line type="monotone" dataKey="duplicateRate" stroke="#D99A2B" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Duplicate Rate" />
          <Line type="monotone" dataKey="freshnessScore" stroke="#6B8E4E" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Freshness Score" />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
