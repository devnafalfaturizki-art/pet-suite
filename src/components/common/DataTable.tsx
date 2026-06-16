import * as React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { EmptyState } from './EmptyState';
import { Button, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (record: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  pagination?: PaginationProps;
  onPageChange?: (page: number) => void;
  filtersSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  onRowClick?: (record: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Enable virtualization for large datasets (recommended for 100+ rows) */
  virtualized?: boolean;
  /** Estimated row height in pixels for virtualization */
  estimatedRowHeight?: number;
  /** Maximum visible rows before virtualization kicks in */
  virtualizeThreshold?: number;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  pagination,
  onPageChange,
  filtersSlot,
  actionsSlot,
  onRowClick,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your filters or search terms.',
  virtualized = false,
  estimatedRowHeight = 48,
  virtualizeThreshold = 100,
}: DataTableProps<T>) {
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const shouldVirtualize = virtualized && data.length > virtualizeThreshold;

  const rowVirtualizer = useVirtualizer({
    count: shouldVirtualize ? data.length : 0,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 10,
  });

  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <Skeleton width="30%" height="1.25rem" />
              <Skeleton width="15%" height="1.25rem" />
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-4 gap-4 p-4">
                <Skeleton width="100%" height="1rem" />
                <Skeleton width="100%" height="1rem" />
                <Skeleton width="100%" height="1rem" />
                <Skeleton width="100%" height="1rem" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return <EmptyState icon={Loader2} title={emptyTitle} description={emptyDescription} action={actionsSlot ?? null} />;
  }

  return (
    <div className="space-y-4">
      {(filtersSlot || actionsSlot) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>{filtersSlot}</div>
          <div>{actionsSlot}</div>
        </div>
      )}

      <div
        ref={tableContainerRef}
        className={cn(
          'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
          shouldVirtualize && 'overflow-auto'
        )}
        style={shouldVirtualize ? { maxHeight: `${virtualizeThreshold * estimatedRowHeight}px` } : undefined}
      >
        <Table>
          <TableHead>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
              {columns.map((column) => (
                <TableHeader key={column.key} style={column.width ? { width: column.width } : undefined}>
                  <div
                    className={
                      column.align === 'center'
                        ? 'text-center'
                        : column.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                    }
                  >
                    {column.header}
                  </div>
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {shouldVirtualize ? (
              <>
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const record = data[virtualRow.index];
                  return (
                    <TableRow
                      key={record.id}
                      className={cn(
                        onRowClick ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50',
                        'absolute top-0 left-0 w-full'
                      )}
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      onClick={onRowClick ? () => onRowClick(record) : undefined}
                    >
                      {columns.map((column) => (
                        <TableCell
                          key={`${record.id}-${column.key}`}
                          className={
                            column.align === 'center'
                              ? 'text-center'
                              : column.align === 'right'
                                ? 'text-right'
                                : 'text-left'
                          }
                          style={column.width ? { width: column.width } : undefined}
                        >
                          {column.render ? column.render(record) : (record as any)[column.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
                {/* Spacer element to make the table scrollable */}
                <tr style={{ height: `${rowVirtualizer.getTotalSize()}px` }} />
              </>
            ) : (
              data.map((record) => (
                <TableRow
                  key={record.id}
                  className={onRowClick ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'}
                  onClick={onRowClick ? () => onRowClick(record) : undefined}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={`${record.id}-${column.key}`}
                      className={
                        column.align === 'center'
                          ? 'text-center'
                          : column.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                      }
                      style={column.width ? { width: column.width } : undefined}
                    >
                      {column.render ? column.render(record) : (record as any)[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && onPageChange && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <span className="text-slate-500">
            Page {pagination.page} of {totalPages}
            <span className="ml-2 text-slate-400">({pagination.total} total)</span>
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}