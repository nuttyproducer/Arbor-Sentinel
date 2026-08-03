// src/components/admin/ReviewQueueDepth.tsx
import { StatTile } from "./shared/StatTile";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { ReviewQueueDepth as ReviewQueueDepthType } from "../../lib/admin/types";

const STATE_LABELS: Record<string, string> = {
  new: "New", assigned: "Assigned", in_review: "In Review",
  changes_requested: "Changes Req.", approved: "Approved",
  published: "Published", rejected: "Rejected", archived: "Archived",
};

export interface ReviewQueueDepthProps {
  data: ReviewQueueDepthType;
}

export function ReviewQueueDepth({ data }: ReviewQueueDepthProps) {
  const chartData = Object.entries(data).map(([state, count]) => ({
    state: STATE_LABELS[state] ?? state,
    count,
  }));

  return (
    <section aria-labelledby="queue-depth-heading">
      <h3 id="queue-depth-heading" className="font-serif text-lg font-semibold text-ink mb-3">
        Queue Depth
      </h3>
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatTile label="New" value={data.new} colorClass="text-trust" />
        <StatTile label="Assigned" value={data.assigned} />
        <StatTile label="In Review" value={data.in_review} />
        <StatTile label="Changes Requested" value={data.changes_requested} colorClass={data.changes_requested > 0 ? "text-[#8B6914]" : "text-ink"} />
      </dl>
      <div className="bg-white border border-charcoal/10 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D8D6D0" />
            <XAxis dataKey="state" tick={{ fontSize: 10, fill: "#1F2937" }} />
            <YAxis tick={{ fontSize: 11, fill: "#1F2937" }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }} />
            <Bar dataKey="count" fill="#3B6EA8" name="Items" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
