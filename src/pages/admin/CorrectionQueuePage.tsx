// src/pages/admin/CorrectionQueuePage.tsx
// Correction queue — admin view of all correction submissions.

import { useState } from 'react';
import { ContentTable, type Column } from '../../components/admin/ContentTable';
import { useAdminContent } from '../../hooks/useAdminContent';

const CORRECTION_COLUMNS: Column<Record<string, unknown>>[] = [
  { key: 'target_type', header: 'Target', sortable: true, render: (r) => (
    <span className="text-ink font-medium">
      {String(r.target_type)} / {String(r.target_id).slice(0, 8)}…
    </span>
  )},
  { key: 'reason', header: 'Reason', sortable: true, render: (r) => (
    <span className="text-sm">{String(r.reason ?? '—')}</span>
  )},
  { key: 'status', header: 'Status', sortable: true, render: (r) => (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
      r.status === 'pending' ? 'bg-clay/10 text-clay' :
      r.status === 'approved' ? 'bg-charcoal/10 text-ink' :
      'bg-bone text-charcoal/50'
    }`}>
      {String(r.status)}
    </span>
  )},
  { key: 'created_at', header: 'Submitted', sortable: true, render: (r) =>
    new Date(String(r.created_at)).toLocaleDateString()
  },
];

export function CorrectionQueuePage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('pending');

  const { data, total, isLoading } = useAdminContent<{ id: string } & Record<string, unknown>>({
    contentType: 'corrections',
    search,
    status,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-2xl font-semibold text-ink">Correction Queue</h1>
      </div>

      <ContentTable
        columns={CORRECTION_COLUMNS}
        data={data}
        isLoading={isLoading}
        searchPlaceholder="Search corrections..."
        onSearch={setSearch}
        statusFilter={['pending', 'approved', 'rejected', 'archived']}
        selectedStatus={status}
        onStatusChange={setStatus}
        getId={(row) => row.id as string}
      />

      <p className="font-mono text-xs text-charcoal/40 mt-2">
        {total} corrections total
      </p>
    </div>
  );
}
