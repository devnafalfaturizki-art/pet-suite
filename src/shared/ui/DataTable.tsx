/**
 * Dense, professional data table optimized for operational speed.
 * 
 * Design principles:
 * - Compact rows for high information density
 * - Keyboard navigable
 * - Sortable columns
 * - Search/filter built in
 * - Minimal visual noise
 */

import { useState, useMemo, useCallback, type ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  compact?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading,
  emptyMessage = 'No data',
  searchable = true,
  searchPlaceholder = 'Search...',
  pageSize = 20,
  compact = true,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let items = data;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((row) =>
        columns.some((col) => {
          const val = row[col.key];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }
    if (sortKey) {
      items = [...items].sort((a, b) => {
        const aVal = a[sortKey] ?? '';
        const bVal = b[sortKey] ?? '';
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return items;
  }, [data, search, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  if (isLoading) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            className="h-8 w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            aria-label={searchPlaceholder}
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-3 py-2 font-medium text-slate-600 dark:text-slate-400',
                    col.sortable !== false && 'cursor-pointer select-none hover:text-slate-900 dark:hover:text-slate-200',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  scope="col"
                >
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <span className="shrink-0">
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className={cn(
                    'transition-colors',
                    onRowClick
                      ? 'cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-950/20'
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30',
                  )}
                  onClick={() => onRowClick?.(row)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onRowClick(row);
                    }
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-3 py-2 text-slate-700 dark:text-slate-300',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center',
                      )}
                    >
                      {col.render ? col.render(row) : row[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded px-2 py-1 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
            >
              Prev
            </button>
            <span className="px-2">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded px-2 py-1 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}