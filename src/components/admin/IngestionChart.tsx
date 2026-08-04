// src/components/admin/IngestionChart.tsx
import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer } from "./shared/ChartContainer";
import type { IngestionSeries } from "../../lib/admin/types";

const COLORS = ["#3B6EA8", "#B95C50", "#D99A2B", "#1F2937", "#6B8E4E", "#8B6B4E", "#6B4E8E"];

export interface IngestionChartProps {
  data: IngestionSeries[];
  isLoading?: boolean;
  error?: string;
}

export function IngestionChart({ data, isLoading, error }: IngestionChartProps) {
  const sourceTypes = useMemo(() => {
    const types = new Set<string>();
    for (const point of data) {
      for (const key of Object.keys(point.bySourceType)) {
        types.add(key);
      }
    }
    return Array.from(types);
  }, [data]);

  const shortPeriod = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        period: shortPeriod(d.period),
        ...d.bySourceType,
      })),
    [data],
  );

  return (
    <ChartContainer
      title="Content Ingestion"
      subtitle="Items ingested per period, grouped by source type"
      isLoading={isLoading}
      isEmpty={data.length === 0 && !isLoading}
      error={error}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D8D6D0" />
          <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#1F2937" }} />
          <YAxis tick={{ fontSize: 11, fill: "#1F2937" }} />
          <Tooltip
            contentStyle={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {sourceTypes.map((st, i) => (
            <Bar key={st} dataKey={st} stackId="a" fill={COLORS[i % COLORS.length]} name={st} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
