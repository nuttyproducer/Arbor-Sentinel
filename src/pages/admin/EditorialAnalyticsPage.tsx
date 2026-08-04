// src/pages/admin/EditorialAnalyticsPage.tsx
// Editorial analytics dashboard — review throughput, correction rates, etc.

import { useState, useEffect } from 'react';
import {
  getReviewThroughput,
  getCorrectionRate,
  getSourceDiversity,
  getReviewRecency,
  getUnresolvedDisputes,
  getLegalReviewCoverage,
} from '../../lib/admin/editorialMetrics';
import { StatTile } from '../../components/admin/shared/StatTile';

export function EditorialAnalyticsPage() {
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    async function load() {
      const [throughput, correctionRate, diversity, recency, disputes, legalCoverage] =
        await Promise.all([
          getReviewThroughput(30),
          getCorrectionRate(),
          getSourceDiversity(),
          getReviewRecency(),
          getUnresolvedDisputes(),
          getLegalReviewCoverage(),
        ]);

      setMetrics({
        throughput,
        correctionRate,
        diversity,
        recency,
        disputes,
        legalCoverage,
      });
    }
    load();
  }, []);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center py-20" aria-busy="true">
        <span className="font-mono text-sm text-charcoal/40">Loading analytics…</span>
      </div>
    );
  }

  const throughput = metrics.throughput as { total: number };
  const correctionRate = metrics.correctionRate as { total: number; rate: string };
  const diversity = metrics.diversity as { distribution: Record<string, number>; total: number };
  const recency = metrics.recency as { stale: Array<unknown>; fresh: number; total: number };
  const disputes = metrics.disputes as Array<unknown>;
  const legalCoverage = metrics.legalCoverage as { total: number; legallyReviewed: number; percentage: string };

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink mb-6">Editorial Analytics</h1>

      {/* KPI row */}
      <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatTile label="Reviewed (30d)" value={throughput.total} />
        <StatTile label="Correction Rate" value={`${correctionRate.rate}%`} />
        <StatTile label="Unique Sources" value={diversity.total} />
        <StatTile label="Fresh Content" value={recency.fresh} subtitle={`${recency.stale.length} stale`} />
        <StatTile
          label="Open Disputes"
          value={disputes.length}
          colorClass={disputes.length > 5 ? 'text-clay' : 'text-ink'}
        />
        <StatTile label="Legal Coverage" value={`${legalCoverage.percentage}%`} />
      </dl>

      {/* Source diversity */}
      <section className="bg-white border border-charcoal/10 rounded-lg p-5 mb-6" aria-labelledby="source-diversity">
        <h3 id="source-diversity" className="font-serif text-lg font-semibold text-ink mb-3">
          Source Diversity
        </h3>
        <div className="space-y-2">
          {Object.entries(diversity.distribution).map(([type, count]) => (
            <div key={type} className="flex items-center gap-3">
              <span className="font-mono text-xs text-charcoal/70 w-24">{type}</span>
              <div className="flex-1 bg-bone rounded h-4 overflow-hidden">
                <div
                  className="h-full bg-charcoal/60 rounded"
                  style={{ width: `${Math.min(100, (count / diversity.total) * 100)}%` }}
                />
              </div>
              <span className="font-mono text-xs text-charcoal/50 w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stale content */}
      <section className="bg-white border border-charcoal/10 rounded-lg p-5 mb-6" aria-labelledby="stale-content">
        <h3 id="stale-content" className="font-serif text-lg font-semibold text-ink mb-3">
          Content Requiring Review ({recency.stale.length} items)
        </h3>
        {recency.stale.length === 0 ? (
          <p className="font-mono text-sm text-charcoal/40">All published content is fresh.</p>
        ) : (
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {(recency.stale as Array<{ title: string; lastReviewed: string }>).slice(0, 10).map((item, i) => (
              <div key={i} className="flex justify-between font-mono text-xs text-charcoal/60 py-1 border-b border-charcoal/5">
                <span>{item.title.slice(0, 60)}</span>
                <span className="text-charcoal/40">{item.lastReviewed}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Open disputes */}
      <section className="bg-white border border-charcoal/10 rounded-lg p-5" aria-labelledby="open-disputes">
        <h3 id="open-disputes" className="font-serif text-lg font-semibold text-ink mb-3">
          Unresolved Disputes ({disputes.length})
        </h3>
        {disputes.length === 0 ? (
          <p className="font-mono text-sm text-charcoal/40">No unresolved disputes.</p>
        ) : (
          <div className="space-y-2">
            {(disputes as Array<Record<string, unknown>>).slice(0, 10).map((d, i) => (
              <div key={i} className="font-mono text-xs text-charcoal/60 py-1">
                {String(d.target_type)} — {String(d.reason)} ({new Date(String(d.created_at)).toLocaleDateString()})
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
