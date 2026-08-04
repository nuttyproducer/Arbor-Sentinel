// src/pages/admin/ContentList.tsx
// Content list view — reusable data table for any content type.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentTable, type Column } from '../../components/admin/ContentTable';
import { useAdminContent, type ContentType } from '../../hooks/useAdminContent';

interface ContentListProps {
  contentType: ContentType;
  title: string;
  newItemPath: string;
  columns: Column<Record<string, unknown>>[];
  statusFilter?: string[];
}

export function ContentList({
  contentType,
  title,
  newItemPath,
  columns,
  statusFilter,
}: ContentListProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, total, isLoading, error } = useAdminContent<{ id: string } & Record<string, unknown>>({
    contentType,
    page,
    perPage: 20,
    search,
    status,
  });

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-2xl font-semibold text-ink">{title}</h1>
        <button
          type="button"
          onClick={() => navigate(newItemPath)}
          className="px-4 py-2 bg-charcoal text-white font-mono text-xs rounded
            hover:bg-charcoal/90 transition-colors"
        >
          + New
        </button>
      </div>

      {error && (
        <div className="bg-clay/5 border border-clay/20 rounded p-3 mb-4" role="alert">
          <p className="font-mono text-xs text-clay">{error}</p>
        </div>
      )}

      <ContentTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        searchPlaceholder={`Search ${title.toLowerCase()}...`}
        onSearch={setSearch}
        statusFilter={statusFilter}
        selectedStatus={status}
        onStatusChange={setStatus}
        getId={(row) => row.id as string}
        batchActions={[
          {
            label: 'Delete',
            action: (ids) => console.log('Batch delete:', ids),
          },
        ]}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 font-mono text-xs text-charcoal/60">
          <span>
            {total} items ({page} of {totalPages} pages)
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1 border border-charcoal/20 rounded disabled:opacity-30"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-2 py-1 border border-charcoal/20 rounded disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pre-built column sets ─────────────────────────────────────────────────────

export const EVIDENCE_COLUMNS: Column<Record<string, unknown>>[] = [
  { key: 'title', header: 'Title', sortable: true, render: (r) => (
    <span className="text-ink font-medium">{String(r.title).slice(0, 60)}{String(r.title).length > 60 ? '…' : ''}</span>
  )},
  { key: 'category', header: 'Category', sortable: true, render: (r) => String(r.category) },
  { key: 'review_status', header: 'Status', sortable: true, render: (r) => (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
      r.review_status === 'published' ? 'bg-charcoal/10 text-ink' :
      r.review_status === 'draft' ? 'bg-bone text-charcoal/50' : 'bg-clay/10 text-clay'
    }`}>
      {String(r.review_status).replace(/_/g, ' ')}
    </span>
  )},
  { key: 'updated_at', header: 'Updated', sortable: true, render: (r) =>
    new Date(String(r.updated_at)).toLocaleDateString()
  },
];

export const SOURCE_COLUMNS: Column<Record<string, unknown>>[] = [
  { key: 'name', header: 'Name', sortable: true, render: (r) => (
    <span className="text-ink font-medium">{String(r.name)}</span>
  )},
  { key: 'type', header: 'Type', sortable: true, render: (r) => String(r.type) },
  { key: 'country', header: 'Country', sortable: true, render: (r) => String(r.country ?? '—') },
  { key: 'credibility_tier', header: 'Tier', sortable: true, render: (r) => String(r.credibility_tier ?? '—') },
];

export const ORGANIZATION_COLUMNS: Column<Record<string, unknown>>[] = [
  { key: 'name', header: 'Name', sortable: true, render: (r) => (
    <span className="text-ink font-medium">{String(r.name)}</span>
  )},
  { key: 'type', header: 'Type', sortable: true, render: (r) => String(r.type ?? '—') },
  { key: 'partnership_status', header: 'Partnership', sortable: true, render: (r) => String(r.partnership_status ?? '—') },
];

export const LEGAL_CASE_COLUMNS: Column<Record<string, unknown>>[] = [
  { key: 'title', header: 'Title', sortable: true, render: (r) => (
    <span className="text-ink font-medium">{String(r.title).slice(0, 60)}</span>
  )},
  { key: 'institution', header: 'Institution', sortable: true, render: (r) => String(r.institution) },
  { key: 'status', header: 'Status', sortable: true, render: (r) => String(r.status) },
  { key: 'opened_date', header: 'Opened', sortable: true, render: (r) =>
    r.opened_date ? new Date(String(r.opened_date)).toLocaleDateString() : '—'
  },
];
