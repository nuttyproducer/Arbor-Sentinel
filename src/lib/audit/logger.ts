// src/lib/audit/logger.ts
// Client-side audit logging utilities.
// The primary audit trail is maintained by database triggers (00006_audit.sql).
// This module provides query and display utilities.

import { supabase } from '../db/client';
import type { AuditEvent, AuditFilter } from './types';

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getAuditEvents(
  filter: AuditFilter = {},
  page = 1,
  perPage = 50,
): Promise<{ events: AuditEvent[]; total: number }> {
  let query = supabase
    .from('audit_log')
    .select('*', { count: 'exact' });

  if (filter.dateFrom) query = query.gte('created_at', filter.dateFrom);
  if (filter.dateTo) query = query.lte('created_at', filter.dateTo);
  if (filter.action) query = query.eq('action', filter.action);
  if (filter.targetType) query = query.eq('target_type', filter.targetType);

  const offset = (page - 1) * perPage;
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  if (error) {
    console.error('Audit query failed:', error.message);
    return { events: [], total: 0 };
  }

  return {
    events: (data as AuditEvent[]) ?? [],
    total: count ?? 0,
  };
}

export async function getAuditEventById(id: string): Promise<AuditEvent | null> {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Audit event lookup failed:', error.message);
    return null;
  }

  return data as AuditEvent;
}

export async function getAuditEventsForTarget(
  targetType: string,
  targetId: string,
): Promise<AuditEvent[]> {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Target audit query failed:', error.message);
    return [];
  }

  return (data as AuditEvent[]) ?? [];
}

// ── Export ────────────────────────────────────────────────────────────────────

export async function exportAuditCSV(
  filter: AuditFilter = {},
): Promise<string> {
  const { events } = await getAuditEvents(filter, 1, 10000);

  const headers = ['id', 'actor_id', 'actor_role', 'action', 'target_type', 'target_id', 'created_at'];
  const rows = events.map((e) =>
    [e.id, e.actorId, e.actorRole, e.action, e.targetType, e.targetId, e.createdAt].join(','),
  );

  return [headers.join(','), ...rows].join('\n');
}
