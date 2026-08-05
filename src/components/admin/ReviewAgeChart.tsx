// src/components/admin/ReviewAgeChart.tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { ChartContainer } from "./shared/ChartContainer";
import type { AgeBucket } from "../../lib/admin/types";

const BAR_COLORS = ["#6B8E4E", "#3B6EA8", "#D99A2B", "#B95C50", "#8B4513"];

export interface ReviewAgeChartProps {
  data: AgeBucket[];
  isLoading?: boolean;
  error?: string;
}

export function ReviewAgeChart({ data, isLoading, error }: ReviewAgeChartProps) {
  const total = data.reduce((sum, b) => sum + b.count, 0);

  return (
    <ChartContainer
      title="Queue Age Distribution"
      subtitle="Items by days since creation"
      isLoading={isLoading}
      isEmpty={data.length === 0 && !isLoading}
      error={error}
    >
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data.map((b) => ({ ...b, pct: total > 0 ? Math.round((b.count / total) * 100) : 0 }))}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D8D6D0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#1F2937" }} />
          <YAxis tick={{ fontSize: 11, fill: "#1F2937" }} allowDecimals={false} />
          <Tooltip
            formatter={(value: number, _name: string, props: unknown) => {
              const pct = (props as { payload?: { pct?: number } } | undefined)?.payload?.pct ?? 0;
              return [`${value} (${pct}%)`, "Items"];
            }}
            contentStyle={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}
          />
          <Bar dataKey="count" name="Items">
            {data.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
