// src/components/admin/SLAComplianceChart.tsx
import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { ChartContainer } from "./shared/ChartContainer";
import type { SLACompliancePoint } from "../../lib/admin/types";

const COLORS = ["#3B6EA8", "#B95C50", "#D99A2B", "#6B8E4E", "#1F2937", "#8B6B4E"];

export interface SLAComplianceChartProps {
  data: SLACompliancePoint[];
  targetPercent?: number;
  isLoading?: boolean;
  error?: string;
}

export function SLAComplianceChart({
  data, targetPercent = 90, isLoading, error,
}: SLAComplianceChartProps) {
  const contentTypes = useMemo(() => {
    const types = new Set<string>();
    for (const point of data) {
      for (const key of Object.keys(point.byContentType)) {
        types.add(key);
      }
    }
    return Array.from(types);
  }, [data]);

  return (
    <ChartContainer
      title="SLA Compliance"
      subtitle={`Overall compliance rate over time (target: ${targetPercent}%)`}
      isLoading={isLoading}
      isEmpty={data.length === 0 && !isLoading}
      error={error}
    >
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D8D6D0" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#1F2937" }} />
          <YAxis tick={{ fontSize: 11, fill: "#1F2937" }} domain={[0, 100]} />
          <Tooltip contentStyle={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }} formatter={(v: number) => `${v}%`} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine y={targetPercent} stroke="#B95C50" strokeDasharray="4 4" label={{ value: `${targetPercent}% target`, fontSize: 10, fill: "#B95C50" }} />
          <Line type="monotone" dataKey="overall" stroke="#3B6EA8" strokeWidth={2.5} dot={{ r: 3 }} name="Overall" />
          {contentTypes.map((ct, i) => (
            <Line key={ct} type="monotone" dataKey={`byContentType.${ct}`} stroke={COLORS[(i + 1) % COLORS.length]} strokeWidth={1} strokeDasharray="4 3" dot={false} name={ct} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
