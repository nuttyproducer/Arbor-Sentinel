// src/lib/audit/queries.ts
// Audit log query utilities — aggregation, statistics, common queries.

import { supabase } from '../db/client';

// ── Summary statistics ────────────────────────────────────────────────────────

export async function getAuditSummary(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('audit_log')
    .select('action, target_type')
    .gte('created_at', since.toISOString());

  if (error || !data) {
    return { totalActions: 0, byAction: {}, byTargetType: {} };
  }

  const byAction: Record<string, number> = {};
  const byTargetType: Record<string, number> = {};

  for (const row of data as Array<{ action: string; target_type: string }>) {
    byAction[row.action] = (byAction[row.action] ?? 0) + 1;
    byTargetType[row.target_type] = (byTargetType[row.target_type] ?? 0) + 1;
  }

  return {
    totalActions: data.length,
    byAction,
    byTargetType,
  };
}

// ── Recent activity ───────────────────────────────────────────────────────────

export async function getRecentActivity(limit = 20) {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Recent activity query failed:', error.message);
    return [];
  }

  return data ?? [];
}

// ── Actor activity ────────────────────────────────────────────────────────────

export async function getActorActivity(actorId: string, limit = 50) {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('actor_id', actorId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Actor activity query failed:', error.message);
    return [];
  }

  return data ?? [];
}
