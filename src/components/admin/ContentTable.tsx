// src/components/admin/ContentTable.tsx
// Data table with sortable columns, text search, status filter, and batch actions.

import { useState, useMemo, type ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render: (row: T) => ReactNode;
}

export interface ContentTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  statusFilter?: string[];
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
  batchActions?: { label: string; action: (ids: string[]) => void }[];
  getId?: (row: T) => string;
}

export function ContentTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder = 'Search...',
  onSearch,
  statusFilter,
  selectedStatus,
  onStatusChange,
  batchActions,
  getId,
}: ContentTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = String(a[sortKey] ?? '');
      const bVal = String(b[sortKey] ?? '');
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }, [data, sortKey, sortDir]);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function toggleSelectAll() {
    if (!getId) return;
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map(getId)));
    }
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  return (
    <div className="bg-white border border-charcoal/10 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3 border-b border-charcoal/10 bg-bone/50">
        {onSearch && (
          <input
            type="search"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch(e.target.value)}
            className="px-3 py-1.5 border border-charcoal/20 rounded font-mono text-sm text-ink
              focus:outline-none focus:border-charcoal/50 flex-1 min-w-[200px]"
          />
        )}
        {statusFilter && onStatusChange && (
          <select
            value={selectedStatus ?? ''}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-1.5 border border-charcoal/20 rounded font-mono text-sm bg-white"
          >
            <option value="">All statuses</option>
            {statusFilter.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        )}
        {batchActions && selectedIds.size > 0 && (
          <div className="flex gap-2">
            {batchActions.map((ba) => (
              <button
                key={ba.label}
                type="button"
                onClick={() => ba.action([...selectedIds])}
                className="px-3 py-1.5 bg-charcoal text-white font-mono text-xs rounded
                  hover:bg-charcoal/90 transition-colors"
              >
                {ba.label} ({selectedIds.size})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="grid">
          <thead>
            <tr className="border-b border-charcoal/10 bg-bone/30">
              {getId && (
                <th className="w-10 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === data.length && data.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                    aria-label="Select all"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2 text-left font-mono text-[11px] uppercase tracking-wider text-charcoal/50 ${
                    col.sortable ? 'cursor-pointer hover:text-charcoal/80 select-none' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  {col.header}
                  {sortKey === col.key && (
                    <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (getId ? 1 : 0)} className="px-3 py-12 text-center">
                  <span className="font-mono text-sm text-charcoal/40">Loading…</span>
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (getId ? 1 : 0)} className="px-3 py-12 text-center">
                  <span className="font-mono text-sm text-charcoal/40">No items found</span>
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <tr
                  key={getId ? getId(row) : i}
                  className={`border-b border-charcoal/5 hover:bg-bone/50 transition-colors ${
                    getId && selectedIds.has(getId(row)) ? 'bg-charcoal/5' : ''
                  }`}
                >
                  {getId && (
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(getId(row))}
                        onChange={() => toggleSelect(getId(row))}
                        className="rounded"
                        aria-label={`Select ${getId(row)}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-2 font-mono text-sm text-charcoal/70">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
