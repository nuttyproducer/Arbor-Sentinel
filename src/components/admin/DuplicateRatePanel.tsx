import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer } from "./shared/ChartContainer";
import { StatTile } from "./shared/StatTile";
import type { DuplicateRates } from "../../lib/admin/types";

export function DuplicateRatePanel({ data, isLoading, error }: {
  data: DuplicateRates;
  isLoading?: boolean;
  error?: string;
}) {
  const chartData = Object.entries(data.bySourceType).map(([type, count]) => ({ type, count }));

  return (
    <section>
      <h3 className="font-serif text-lg font-semibold text-ink mb-3">Duplicate Detection</h3>
      <dl className="grid grid-cols-3 gap-3 mb-4">
        <StatTile label="Detection Rate" value={`${data.detectionRate}%`} />
        <StatTile label="False Positive Rate" value={`${data.falsePositiveRate}%`} colorClass={data.falsePositiveRate > 20 ? "text-clay" : "text-ink"} />
        <StatTile label="Merge Rate" value={`${data.mergeRate}%`} colorClass="text-green-700" />
      </dl>
      <ChartContainer title="Duplicates by Source Type" isLoading={isLoading} isEmpty={chartData.length === 0} error={error}>
        <ResponsiveContainer width="100%" height={200}><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#D8D6D0" /><XAxis dataKey="type" tick={{ fontSize: 10, fill: "#1F2937" }} /><YAxis tick={{ fontSize: 11, fill: "#1F2937" }} allowDecimals={false} /><Tooltip contentStyle={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }} /><Bar dataKey="count" fill="#3B6EA8" name="Detected" /></BarChart></ResponsiveContainer>
      </ChartContainer>
    </section>
  );
}
