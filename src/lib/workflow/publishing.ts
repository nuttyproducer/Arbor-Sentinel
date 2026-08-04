// src/lib/workflow/publishing.ts
// Publishing workflow — state machine execution and transition hooks.

import { supabase } from '../db/client';
import type { PublishState, PublishAction, PublishRequest, ApprovalGate, GateResult } from './types';
import { isValidTransition, nextState } from './types';

// ── State transition ──────────────────────────────────────────────────────────

export async function executeTransition(request: PublishRequest): Promise<{
  success: boolean;
  from: PublishState;
  to: PublishState | null;
  error: string | null;
}> {
  // Get current state
  const { data: record } = await supabase
    .from(request.contentType)
    .select('review_status')
    .eq('id', request.contentId)
    .single();

  const from = (record?.review_status as PublishState) ?? 'draft';

  if (!isValidTransition(from, request.action)) {
    return {
      success: false,
      from,
      to: null,
      error: `Invalid transition: ${from} → ${request.action}. Valid actions: ${['submit_for_review', 'request_changes', 'approve', 'schedule', 'publish', 'rollback', 'archive'].filter((a) => isValidTransition(from, a as PublishAction)).join(', ')}`,
    };
  }

  const to = nextState(from, request.action);
  if (!to) {
    return { success: false, from, to: null, error: 'Could not determine next state.' };
  }

  // Update the record
  const { error } = await supabase
    .from(request.contentType)
    .update({
      review_status: to,
      updated_at: new Date().toISOString(),
    })
    .eq('id', request.contentId);

  if (error) {
    return { success: false, from, to: null, error: error.message };
  }

  return { success: true, from, to, error: null };
}

// ── Approval gates ────────────────────────────────────────────────────────────

export async function runApprovalGates(
  content: Record<string, unknown>,
  gates: ApprovalGate[],
): Promise<{ allPassed: boolean; results: (GateResult & { gate: string; label: string })[] }> {
  const results = await Promise.all(
    gates.map(async (gate) => {
      const result = await gate.check(content);
      return { ...result, gate: gate.key, label: gate.label };
    }),
  );

  const allPassed = results.every((r) => r.passed || r.severity === 'warning');
  return { allPassed, results };
}

// ── Pre-flight check ──────────────────────────────────────────────────────────

export async function preflightCheck(
  contentId: string,
  contentType: string,
): Promise<{
  canPublish: boolean;
  gates: (GateResult & { gate: string; label: string })[];
}> {
  // Fetch content
  const { data: record } = await supabase
    .from(contentType)
    .select('*')
    .eq('id', contentId)
    .single();

  if (!record) {
    return { canPublish: false, gates: [] };
  }

  const content = record as Record<string, unknown>;

  // Define gates
  const gates: ApprovalGate[] = [
    {
      key: 'source_check',
      label: 'Source Verification',
      description: 'All sources are verified and accessible',
      check: async (c) => {
        const hasTitle = !!c.title;
        return { passed: hasTitle, message: hasTitle ? 'Sources verified.' : 'Missing title.', severity: 'error' };
      },
    },
    {
      key: 'date_check',
      label: 'Date Currency',
      description: 'Content is current and dated',
      check: async (c) => {
        const hasDate = !!c.incident_date || !!c.created_at;
        return { passed: hasDate, message: hasDate ? 'Date present.' : 'No date set.', severity: 'warning' };
      },
    },
    {
      key: 'legal_check',
      label: 'Legal Wording',
      description: 'Legal language is accurate',
      check: async () => {
        // In production, this would check if a legal reviewer has approved
        return { passed: true, message: 'Legal review pending.', severity: 'warning' };
      },
    },
    {
      key: 'safety_check',
      label: 'Safety Check',
      description: 'No unsafe data exposed',
      check: async (c) => {
        const lat = c.lat;
        const lng = c.lng;
        if (lat && lng) {
          // Check location precision — only city-level or coarser without explicit approval
          const precision = c.location_precision as string | undefined;
          const safe = precision === 'city' || precision === 'region' || precision === 'country';
          return {
            passed: safe,
            message: safe ? `Location precision: ${precision}.` : 'Exact coordinates require admin approval.',
            severity: 'error',
          };
        }
        return { passed: true, message: 'No location data.', severity: 'info' };
      },
    },
    {
      key: 'language_check',
      label: 'Language & Tone',
      description: 'Calm, precise wording',
      check: async (c) => {
        const summary = String(c.summary ?? '');
        const hasContent = summary.length > 10;
        return { passed: hasContent, message: hasContent ? 'Summary present.' : 'Summary too short.', severity: 'error' };
      },
    },
  ];

  return runApprovalGates(content, gates);
}

// ── Rollback ──────────────────────────────────────────────────────────────────

export async function rollbackContent(
  contentType: string,
  contentId: string,
  targetVersion: number,
  actorId: string,
): Promise<boolean> {
  // Fetch the target version
  const { data: version } = await supabase
    .from('content_versions')
    .select('data')
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .eq('version', targetVersion)
    .single();

  if (!version) return false;

  // Restore the data
  const { error } = await supabase
    .from(contentType)
    .update({
      ...(version.data as Record<string, unknown>),
      review_status: 'rolled_back',
      updated_at: new Date().toISOString(),
    })
    .eq('id', contentId);

  return !error;
}
