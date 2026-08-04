// src/lib/workflow/types.ts
// Publishing workflow types — state machine, actions, gates.

export type PublishState =
  | 'draft'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'rolled_back'
  | 'archived';

export type PublishAction =
  | 'submit_for_review'
  | 'request_changes'
  | 'approve'
  | 'schedule'
  | 'publish'
  | 'rollback'
  | 'archive';

export interface PublishRequest {
  contentId: string;
  contentType: string;
  action: PublishAction;
  actorId: string;
  scheduledAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ApprovalGate {
  key: string;
  label: string;
  description: string;
  check: (content: Record<string, unknown>) => Promise<GateResult>;
}

export interface GateResult {
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// Valid transitions
export const VALID_TRANSITIONS: Record<PublishState, PublishAction[]> = {
  draft: ['submit_for_review', 'archive'],
  in_review: ['request_changes', 'approve', 'archive'],
  changes_requested: ['submit_for_review', 'archive'],
  approved: ['schedule', 'publish', 'archive'],
  scheduled: ['publish', 'archive'],
  published: ['rollback', 'archive'],
  rolled_back: ['submit_for_review', 'archive'],
  archived: [],
};

export function isValidTransition(from: PublishState, action: PublishAction): boolean {
  return VALID_TRANSITIONS[from]?.includes(action) ?? false;
}

export function nextState(from: PublishState, action: PublishAction): PublishState | null {
  if (!isValidTransition(from, action)) return null;

  const transitions: Record<PublishAction, PublishState> = {
    submit_for_review: 'in_review',
    request_changes: 'changes_requested',
    approve: 'approved',
    schedule: 'scheduled',
    publish: 'published',
    rollback: 'rolled_back',
    archive: 'archived',
  };

  return transitions[action];
}
