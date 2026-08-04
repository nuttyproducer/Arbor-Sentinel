// src/lib/admin/editorialMetrics.ts
// Editorial metrics queries — review throughput, correction rates, source diversity.

import { supabase } from '../db/client';

// ── Review throughput ─────────────────────────────────────────────────────────

export async function getReviewThroughput(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('evidence_items')
    .select('review_status, updated_at')
    .gte('updated_at', since.toISOString())
    .neq('review_status', 'draft');

  if (error) return { daily: [], total: 0 };

  const byDate: Record<string, number> = {};
  for (const row of (data as Array<{ updated_at: string }>) ?? []) {
    const day = row.updated_at.slice(0, 10);
    byDate[day] = (byDate[day] ?? 0) + 1;
  }

  return {
    daily: Object.entries(byDate).map(([date, count]) => ({ date, count })),
    total: data.length,
  };
}

// ── Correction rate ──────────────────────────────────────────────────────────

export async function getCorrectionRate(days = 90) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { count } = await supabase
    .from('corrections')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', since.toISOString());

  const { count: evidenceCount } = await supabase
    .from('evidence_items')
    .select('*', { count: 'exact', head: true });

  return {
    total: count ?? 0,
    rate: evidenceCount ? ((count ?? 0) / evidenceCount).toFixed(3) : '0',
  };
}

// ── Source diversity ──────────────────────────────────────────────────────────

export async function getSourceDiversity() {
  const { data, error } = await supabase
    .from('sources')
    .select('type');

  if (error || !data) return { distribution: {}, total: 0 };

  const distribution: Record<string, number> = {};
  for (const row of data as Array<{ type: string }>) {
    distribution[row.type] = (distribution[row.type] ?? 0) + 1;
  }

  return {
    distribution,
    total: data.length,
  };
}

// ── Review recency ────────────────────────────────────────────────────────────

export async function getReviewRecency() {
  const { data, error } = await supabase
    .from('evidence_items')
    .select('title, last_reviewed_at, review_status');

  if (error || !data) return { stale: [], fresh: 0, total: 0 };

  const now = new Date();
  const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));

  const stale: Array<{ title: string; lastReviewed: string }> = [];
  let fresh = 0;

  for (const row of data as Array<{ title: string; last_reviewed_at: string | null; review_status: string }>) {
    if (row.review_status === 'published') {
      if (!row.last_reviewed_at || new Date(row.last_reviewed_at) < sixMonthsAgo) {
        stale.push({ title: row.title, lastReviewed: row.last_reviewed_at ?? 'never' });
      } else {
        fresh++;
      }
    }
  }

  return { stale, fresh, total: data.length };
}

// ── Unresolved disputes ──────────────────────────────────────────────────────

export async function getUnresolvedDisputes() {
  const { data, error } = await supabase
    .from('corrections')
    .select('id, target_type, target_id, reason, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) return [];

  return (data as Array<Record<string, unknown>>) ?? [];
}

// ── Legal review coverage ────────────────────────────────────────────────────

export async function getLegalReviewCoverage() {
  const { count: total } = await supabase
    .from('evidence_items')
    .select('*', { count: 'exact', head: true });

  // Check for legal review: records with legal-tagged content
  const { data } = await supabase
    .from('review_queue_items')
    .select('id')
    .eq('review_type', 'legal')
    .eq('state', 'approved');

  const legallyReviewed = data?.length ?? 0;

  return {
    total: total ?? 0,
    legallyReviewed,
    percentage: total ? ((legallyReviewed / total) * 100).toFixed(1) : '0',
  };
}
