// src/components/admin/StatusSelect.tsx
// Status selector with workflow hints for content items.

const STATUS_OPTIONS: Record<string, { label: string; description: string }> = {
  draft: { label: 'Draft', description: 'Not visible to public. Editable by author.' },
  in_review: { label: 'In Review', description: 'Submitted for editorial review.' },
  changes_requested: { label: 'Changes Requested', description: 'Reviewer requested changes.' },
  approved: { label: 'Approved', description: 'Ready for publishing.' },
  published: { label: 'Published', description: 'Visible to public. Changes create new version.' },
  archived: { label: 'Archived', description: 'Hidden from public. Retained for reference.' },
};

export interface StatusSelectProps {
  value: string;
  onChange: (status: string) => void;
  disabled?: boolean;
}

export function StatusSelect({ value, onChange, disabled = false }: StatusSelectProps) {
  return (
    <div>
      <label className="block font-mono text-xs text-charcoal/70 mb-1">Status</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-charcoal/20 rounded font-mono text-sm text-ink
          bg-white focus:outline-none focus:border-charcoal/50 focus:ring-1 focus:ring-charcoal/20
          disabled:bg-bone disabled:text-charcoal/40"
      >
        {Object.entries(STATUS_OPTIONS).map(([key, { label }]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
      <p className="font-mono text-[10px] text-charcoal/40 mt-1">
        {STATUS_OPTIONS[value]?.description ?? ''}
      </p>
    </div>
  );
}
