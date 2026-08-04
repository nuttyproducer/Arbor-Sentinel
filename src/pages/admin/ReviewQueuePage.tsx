// src/pages/admin/ReviewQueuePage.tsx
// Admin review queue — lists pending review items and links to the
// type-specific review pages under /admin/review/*.
//
// During the functional beta the queue is populated from the in-memory
// review system and representative mock items. When a live queue store
// is connected, this page will read from the same ReviewQueue used by
// the review pages.

import { Link } from "react-router-dom";
import type { ReviewItem } from "../../lib/review/types";
import {
  mockCountryReviewItem,
  mockEditorialReviewItem,
  mockInstitutionReviewItem,
  mockLegalReviewItem,
  mockTranslationReviewItem,
} from "../review/mockReviewItems";

interface QueueEntry {
  item: ReviewItem;
  reviewPath: string;
  typeLabel: string;
}

const QUEUE_ENTRIES: QueueEntry[] = [
  { item: mockLegalReviewItem, reviewPath: "/admin/review/legal/legal-case-icj-gaza", typeLabel: "Legal" },
  { item: mockTranslationReviewItem, reviewPath: "/admin/review/translation/evidence-un-report-001", typeLabel: "Translation" },
  { item: mockEditorialReviewItem, reviewPath: "/admin/review/editorial/evidence-gaza-briefing-001", typeLabel: "Editorial" },
  { item: mockCountryReviewItem, reviewPath: "/admin/review/country/country-belgium-001", typeLabel: "Country" },
  { item: mockInstitutionReviewItem, reviewPath: "/admin/review/institution/institution-eu-commission-001", typeLabel: "Institution" },
];

function stateLabel(state: string): string {
  return state.replace(/_/g, " ");
}

export function ReviewQueuePage() {
  const pending = QUEUE_ENTRIES.filter((e) => e.item.state === "new" || e.item.state === "assigned" || e.item.state === "in_review");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-2xl font-semibold text-ink">Review Queue</h1>
      </div>

      {pending.length === 0 ? (
        <div className="bg-bone border border-charcoal/10 rounded-lg p-6 text-center">
          <p className="font-mono text-sm text-charcoal/50">No items awaiting review.</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-charcoal/10 rounded-lg bg-white">
          <table className="w-full text-left">
            <thead className="bg-bone/60 border-b border-charcoal/10">
              <tr className="font-mono text-[10px] uppercase tracking-widest text-charcoal/50">
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Priority</th>
                <th className="px-4 py-2">State</th>
                <th className="px-4 py-2">Assigned</th>
                <th className="px-4 py-2">Due</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {pending.map(({ item, reviewPath, typeLabel }) => (
                <tr key={item.id} className="hover:bg-bone/40">
                  <td className="px-4 py-2 font-mono text-xs text-charcoal/70">{typeLabel}</td>
                  <td className="px-4 py-2 text-sm text-ink">{item.sourceContentRef.slug}</td>
                  <td className="px-4 py-2 font-mono text-xs text-charcoal/70 capitalize">{item.priority}</td>
                  <td className="px-4 py-2 font-mono text-xs text-charcoal/70">{stateLabel(item.state)}</td>
                  <td className="px-4 py-2 font-mono text-xs text-charcoal/50">{item.assignedReviewer ?? "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs text-charcoal/50">
                    {item.dueBy ? new Date(item.dueBy).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      to={reviewPath}
                      className="inline-block px-3 py-1 bg-charcoal text-white font-mono text-xs rounded hover:bg-charcoal/90 transition-colors"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="font-mono text-xs text-charcoal/40 mt-2">
        {pending.length} item{pending.length === 1 ? "" : "s"} in queue
      </p>
    </div>
  );
}
