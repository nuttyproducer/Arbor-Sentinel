// src/pages/admin/AdminDashboard.tsx
// Admin dashboard — content counts, recent activity, pending reviews, quick actions.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/db/client';
import { StatTile } from '../../components/admin/shared/StatTile';

interface ContentCounts {
  evidenceItems: number;
  sources: number;
  countries: number;
  organizations: number;
  legalCases: number;
  actions: number;
  dossiers: number;
  pendingReviews: number;
  pendingCorrections: number;
}

async function fetchCounts(): Promise<ContentCounts> {
  const tables = [
    'evidence_items',
    'sources',
    'countries',
    'organizations',
    'legal_cases',
    'actions',
    'dossiers',
  ] as const;

  const counts: Record<string, number> = {};

  for (const table of tables) {
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    counts[table] = count ?? 0;
  }

  const { count: reviewCount } = await supabase
    .from('review_queue_items')
    .select('*', { count: 'exact', head: true })
    .in('state', ['new', 'assigned', 'in_review']);

  const { count: correctionCount } = await supabase
    .from('corrections')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  return {
    evidenceItems: counts.evidence_items ?? 0,
    sources: counts.sources ?? 0,
    countries: counts.countries ?? 0,
    organizations: counts.organizations ?? 0,
    legalCases: counts.legal_cases ?? 0,
    actions: counts.actions ?? 0,
    dossiers: counts.dossiers ?? 0,
    pendingReviews: reviewCount ?? 0,
    pendingCorrections: correctionCount ?? 0,
  };
}

export function AdminDashboard() {
  const [counts, setCounts] = useState<ContentCounts | null>(null);

  useEffect(() => {
    fetchCounts().then(setCounts);
  }, []);

  if (!counts) {
    return (
      <div className="flex items-center justify-center py-20" aria-busy="true">
        <span className="font-mono text-sm text-charcoal/40">Loading dashboard…</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink mb-6">Dashboard</h1>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link to="/admin/evidence/new" className="px-4 py-2 bg-charcoal text-white font-mono text-xs rounded hover:bg-charcoal/90 transition-colors">
          + New Evidence
        </Link>
        <Link to="/admin/sources/new" className="px-4 py-2 border border-charcoal/20 text-charcoal font-mono text-xs rounded hover:bg-bone transition-colors">
          + New Source
        </Link>
        <Link to="/admin/review-queue" className="px-4 py-2 border border-charcoal/20 text-charcoal font-mono text-xs rounded hover:bg-bone transition-colors">
          Review Queue {counts.pendingReviews > 0 && `(${counts.pendingReviews})`}
        </Link>
        <Link to="/admin/corrections" className="px-4 py-2 border border-charcoal/20 text-charcoal font-mono text-xs rounded hover:bg-bone transition-colors">
          Corrections {counts.pendingCorrections > 0 && `(${counts.pendingCorrections})`}
        </Link>
      </div>

      {/* Content counts */}
      <section aria-labelledby="content-counts-heading">
        <h2 id="content-counts-heading" className="font-serif text-lg font-semibold text-ink mb-3">
          Content Overview
        </h2>
        <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatTile label="Evidence Items" value={counts.evidenceItems} />
          <StatTile label="Sources" value={counts.sources} />
          <StatTile label="Countries" value={counts.countries} />
          <StatTile label="Organizations" value={counts.organizations} />
          <StatTile label="Legal Cases" value={counts.legalCases} />
          <StatTile label="Actions" value={counts.actions} />
          <StatTile label="Dossiers" value={counts.dossiers} />
          <StatTile
            label="Pending Reviews"
            value={counts.pendingReviews}
            colorClass={counts.pendingReviews > 10 ? 'text-clay' : 'text-ink'}
          />
          <StatTile
            label="Open Corrections"
            value={counts.pendingCorrections}
            colorClass={counts.pendingCorrections > 5 ? 'text-clay' : 'text-ink'}
          />
        </dl>
      </section>
    </div>
  );
}
