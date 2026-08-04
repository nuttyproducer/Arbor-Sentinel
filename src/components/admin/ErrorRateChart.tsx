// src/components/admin/ErrorRateChart.tsx
import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer } from "./shared/ChartContainer";
import type { ErrorRatePoint } from "../../lib/admin/types";

const COLORS = ["#B95C50", "#3B6EA8", "#D99A2B", "#6B8E4E", "#1F2937", "#8B6B4E", "#6B4E8E"];

export interface ErrorRateChartProps {
  data: ErrorRatePoint[];
  isLoading?: boolean;
  error?: string;
}

type ErrorView = "bySourceType" | "byCategory";

export function ErrorRateChart({ data, isLoading, error }: ErrorRateChartProps) {
  const [view, setView] = useState<ErrorView>("bySourceType");

  const { seriesKeys, chartData } = useMemo(() => {
    const keys = new Set<string>();
    const formatted = data.map((d) => {
      const record: Record<string, unknown> = { timestamp: new Date(d.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
      const source = d[view];
      for (const [k, v] of Object.entries(source)) {
        keys.add(k);
        record[k] = v;
      }
      return record;
    });
    return { seriesKeys: Array.from(keys), chartData: formatted };
  }, [data, view]);

  return (
    <ChartContainer
      title="Error Rates"
      subtitle="Errors over time"
      isLoading={isLoading}
      isEmpty={data.length === 0 && !isLoading}
      error={error}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-[10px] text-charcoal/50">Group by:</span>
        <button
          type="button"
          onClick={() => setView("bySourceType")}
          className={`font-mono text-xs px-2 py-1 rounded border min-h-[32px] ${
            view === "bySourceType" ? "bg-ink text-paper border-ink" : "bg-white text-charcoal/60 border-charcoal/20"
          }`}
        >
          Source Type
        </button>
        <button
          type="button"
          onClick={() => setView("byCategory")}
          className={`font-mono text-xs px-2 py-1 rounded border min-h-[32px] ${
            view === "byCategory" ? "bg-ink text-paper border-ink" : "bg-white text-charcoal/60 border-charcoal/20"
          }`}
        >
          Error Category
        </button>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D8D6D0" />
          <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: "#1F2937" }} />
          <YAxis tick={{ fontSize: 11, fill: "#1F2937" }} allowDecimals={false} />
          <Tooltip contentStyle={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {seriesKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 2 }}
              name={key}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
