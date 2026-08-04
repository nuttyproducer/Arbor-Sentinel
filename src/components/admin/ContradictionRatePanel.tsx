import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer } from "./shared/ChartContainer";
import { StatTile } from "./shared/StatTile";
import type { ContradictionRate } from "../../lib/admin/types";

export function ContradictionRatePanel({ byContentType, bySourceType, unresolvedTotal, isLoading, error }: {
  byContentType: ContradictionRate[];
  bySourceType: ContradictionRate[];
  unresolvedTotal: number;
  isLoading?: boolean;
  error?: string;
}) {
  return (
    <section>
      <StatTile label="Unresolved Contradictions" value={unresolvedTotal} colorClass={unresolvedTotal > 0 ? "text-clay" : "text-green-700"} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <ChartContainer title="By Content Type" isLoading={isLoading} isEmpty={byContentType.length === 0} error={error}>
          <ResponsiveContainer width="100%" height={200}><BarChart data={byContentType.map((c) => ({ ...c, ratePct: Math.round(c.rate * 100) }))}><CartesianGrid strokeDasharray="3 3" stroke="#D8D6D0" /><XAxis dataKey="group" tick={{ fontSize: 10, fill: "#1F2937" }} /><YAxis tick={{ fontSize: 11, fill: "#1F2937" }} /><Tooltip contentStyle={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }} formatter={(v: number) => `${v}%`} /><Bar dataKey="ratePct" fill="#B95C50" name="Rate %" /></BarChart></ResponsiveContainer>
        </ChartContainer>
        <ChartContainer title="By Source Type" isLoading={isLoading} isEmpty={bySourceType.length === 0} error={error}>
          <ResponsiveContainer width="100%" height={200}><BarChart data={bySourceType.map((c) => ({ ...c, ratePct: Math.round(c.rate * 100) }))}><CartesianGrid strokeDasharray="3 3" stroke="#D8D6D0" /><XAxis dataKey="group" tick={{ fontSize: 10, fill: "#1F2937" }} /><YAxis tick={{ fontSize: 11, fill: "#1F2937" }} /><Tooltip contentStyle={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }} formatter={(v: number) => `${v}%`} /><Bar dataKey="ratePct" fill="#D99A2B" name="Rate %" /></BarChart></ResponsiveContainer>
        </ChartContainer>
      </div>
    </section>
  );
}
