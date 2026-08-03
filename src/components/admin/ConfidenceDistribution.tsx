import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { ChartContainer } from "./shared/ChartContainer";
import type { ConfidenceBucket } from "../../lib/admin/types";

const COLORS = ["#B95C50", "#D99A2B", "#D99A2B", "#3B6EA8", "#6B8E4E"];

export function ConfidenceDistribution({ data, stages = [], activeStage = "", onStageChange, isLoading, error }: {
  data: ConfidenceBucket[];
  stages?: string[];
  activeStage?: string;
  onStageChange?: (stage: string) => void;
  isLoading?: boolean;
  error?: string;
}) {
  return (
    <ChartContainer title="Confidence Distribution" subtitle="Histogram of AI confidence scores" isLoading={isLoading} isEmpty={data.length === 0 && !isLoading} error={error}>
      {stages.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-[10px] text-charcoal/50">Stage:</span>
          <button type="button" onClick={() => onStageChange?.("")} className={`font-mono text-xs px-2 py-1 rounded border min-h-[28px] ${activeStage === "" ? "bg-ink text-paper border-ink" : "bg-white text-charcoal/60 border-charcoal/20"}`}>All</button>
          {stages.map((s) => (
            <button key={s} type="button" onClick={() => onStageChange?.(s)} className={`font-mono text-xs px-2 py-1 rounded border min-h-[28px] ${activeStage === s ? "bg-ink text-paper border-ink" : "bg-white text-charcoal/60 border-charcoal/20"}`}>{s.replace(/_/g, " ")}</button>
          ))}
        </div>
      )}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D8D6D0" />
          <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#1F2937" }} />
          <YAxis tick={{ fontSize: 11, fill: "#1F2937" }} allowDecimals={false} />
          <Tooltip contentStyle={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }} />
          <Bar dataKey="count" name="Items">
            {data.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
