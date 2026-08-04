// src/lib/audit/types.ts
// Audit log types for the Accountability Atlas.

export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'restore' | 'archive' | 'purge';

export interface AuditEvent {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  action: AuditAction;
  targetType: string;
  targetId: string;
  diff: Record<string, unknown> | null;
  requestId: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AuditFilter {
  dateFrom?: string;
  dateTo?: string;
  actor?: string;
  action?: AuditAction;
  targetType?: string;
  search?: string;
}
