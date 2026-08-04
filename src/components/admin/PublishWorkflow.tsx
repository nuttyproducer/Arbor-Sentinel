// src/components/admin/PublishWorkflow.tsx
// Publishing workflow component — state indicator and action buttons.

import { useState } from 'react';
import type { PublishState, PublishAction } from '../../lib/workflow/types';
import { VALID_TRANSITIONS, nextState } from '../../lib/workflow/types';
import { executeTransition } from '../../lib/workflow/publishing';

interface PublishWorkflowProps {
  contentId: string;
  contentType: string;
  currentState: PublishState;
  onStateChange?: (newState: PublishState) => void;
}

const STATE_LABELS: Record<PublishState, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-bone text-charcoal/50' },
  in_review: { label: 'In Review', className: 'bg-clay/10 text-clay' },
  changes_requested: { label: 'Changes Requested', className: 'bg-clay/20 text-clay' },
  approved: { label: 'Approved', className: 'bg-charcoal/10 text-ink' },
  scheduled: { label: 'Scheduled', className: 'bg-bone text-charcoal/70' },
  published: { label: 'Published', className: 'bg-charcoal text-white' },
  rolled_back: { label: 'Rolled Back', className: 'bg-clay/10 text-clay' },
  archived: { label: 'Archived', className: 'bg-bone text-charcoal/30' },
};

export function PublishWorkflow({ contentId, contentType, currentState, onStateChange }: PublishWorkflowProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const validActions = VALID_TRANSITIONS[currentState] ?? [];

  async function handleAction(action: PublishAction) {
    setIsTransitioning(true);
    setError(null);

    const result = await executeTransition({
      contentId,
      contentType,
      action,
      actorId: 'current-user',
    });

    if (result.success && result.to) {
      onStateChange?.(result.to);
    } else {
      setError(result.error ?? 'Transition failed.');
    }
    setIsTransitioning(false);
  }

  const stateInfo = STATE_LABELS[currentState] ?? STATE_LABELS.draft;

  return (
    <div className="bg-white border border-charcoal/10 rounded-lg p-4">
      <h3 className="font-serif text-sm font-semibold text-ink mb-2">Publishing Workflow</h3>

      {/* State indicator */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-[10px] text-charcoal/50">Status:</span>
        <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${stateInfo.className}`}>
          {stateInfo.label}
        </span>
      </div>

      {/* Workflow steps visual */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto">
        {(['draft', 'in_review', 'approved', 'published'] as PublishState[]).map((state, i) => (
          <div key={state} className="flex items-center gap-1">
            <div
              className={`w-3 h-3 rounded-full ${
                currentState === state ? 'bg-charcoal' :
                ['published'].includes(currentState) && ['published'].includes(state) ? 'bg-charcoal' :
                ['approved', 'published', 'rolled_back'].includes(currentState) && ['draft', 'in_review', 'approved'].includes(state) ? 'bg-charcoal/40' :
                'bg-charcoal/10'
              }`}
            />
            {i < 3 && <div className="w-4 h-px bg-charcoal/20" />}
          </div>
        ))}
        <span className="font-mono text-[10px] text-charcoal/40 ml-2">
          Draft → Review → Approved → Published
        </span>
      </div>

      {/* Action buttons */}
      {validActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {validActions.map((action) => (
            <button
              key={action}
              type="button"
              disabled={isTransitioning}
              onClick={() => handleAction(action)}
              className="px-3 py-1.5 border border-charcoal/20 rounded font-mono text-xs
                hover:bg-bone disabled:opacity-30 transition-colors"
            >
              {action.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="font-mono text-[10px] text-clay mt-2" role="alert">{error}</p>
      )}
    </div>
  );
}
