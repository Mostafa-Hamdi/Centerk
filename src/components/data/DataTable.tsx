'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { memo, type MouseEvent, type ReactNode } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- generics must match the library
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Label used in the stacked mobile card (defaults to the header string). */
    label?: string;
    hideOnMobile?: boolean;
    /** Extra classes for th/td (e.g. "text-end tabular"). */
    className?: string;
  }
}

export interface DataTableProps<T> {
  data: T[] | undefined;
  /** Memoize with useMemo — columns are compared by reference. */
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Server-side sorting (ids map to backend sort fields). */
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  /** Enables the checkbox column. */
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  /** Prefetch details on hover/focus (RTK Query `usePrefetch`). */
  onRowIntent?: (row: T) => void;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  caption: string;
  skeletonRows?: number;
  /** Rows before this page (page − 1) × pageSize, so the # column keeps counting across pages. */
  startIndex?: number;
}

/** Clicks on controls inside a row (actions, links, checkboxes) must not also open the row. */
const INTERACTIVE =
  'a, button, input, select, textarea, label, [role="checkbox"], [role="menuitem"]';

const checkboxClass =
  'size-5 cursor-pointer rounded-[6px] border-2 border-line accent-primary align-middle';

function SortIcon({ direction }: { direction: false | 'asc' | 'desc' }) {
  if (direction === 'asc') return <ArrowUp className="size-3.5 text-primary" aria-hidden />;
  if (direction === 'desc') return <ArrowDown className="size-3.5 text-primary" aria-hidden />;
  return <ArrowUpDown className="size-3.5 opacity-40 group-hover/sort:opacity-100" aria-hidden />;
}

/**
 * Server-driven table (TanStack v8): sortable headers with aria-sort, bulk selection,
 * hover/intent prefetch, skeleton/empty/error states, and stacked cards below 768px.
 */
function DataTableInner<T>({
  data,
  columns,
  getRowId,
  isLoading,
  isFetching,
  error,
  onRetry,
  sorting = [],
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  onRowIntent,
  onRowClick,
  empty,
  caption,
  skeletonRows = 8,
  startIndex = 0,
}: DataTableProps<T>) {
  const selectable = Boolean(rowSelection && onRowSelectionChange);
  const handleRowClick = (event: MouseEvent, row: T) => {
    if ((event.target as Element).closest(INTERACTIVE)) return;
    onRowClick?.(row);
  };
  const table = useReactTable({
    data: data ?? [],
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    enableRowSelection: selectable,
    enableSortingRemoval: true,
    state: { sorting, rowSelection: rowSelection ?? {} },
    onSortingChange: (updater) =>
      onSortingChange?.(typeof updater === 'function' ? updater(sorting) : updater),
    onRowSelectionChange: (updater) => {
      const current = rowSelection ?? {};
      onRowSelectionChange?.(typeof updater === 'function' ? updater(current) : updater);
    },
  });

  if (error)
    return (
      <div className="table-card">
        <ErrorState title={ar.list.loadError} description={error} onRetry={onRetry} />
      </div>
    );

  const rows = table.getRowModel().rows;
  const columnCount = columns.length + (selectable ? 2 : 1);

  if (!isLoading && rows.length === 0) {
    return <div className="table-card">{empty ?? <EmptyState title={ar.list.emptyTitle} />}</div>;
  }

  return (
    <div
      className={cn(
        'table-card transition-opacity duration-200',
        isFetching && !isLoading && 'opacity-60',
      )}
      aria-busy={isLoading || isFetching}
    >
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto overflow-y-hidden px-1.5 py-1 md:block">
        <table className="data-table w-full border-separate border-spacing-y-1.5 text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {selectable ? (
                  <th scope="col" className="w-12 px-3 py-3.5">
                    <input
                      type="checkbox"
                      className={checkboxClass}
                      aria-label={ar.list.selectAll}
                      checked={table.getIsAllRowsSelected()}
                      ref={(element) => {
                        if (element) element.indeterminate = table.getIsSomeRowsSelected();
                      }}
                      onChange={table.getToggleAllRowsSelectedHandler()}
                    />
                  </th>
                ) : null}
                <th scope="col" className="w-14 px-3 py-3.5 text-center text-xs font-semibold">
                  {ar.list.rowNumber}
                </th>
                {group.headers.map((header) => {
                  const sortable = header.column.getCanSort() && Boolean(onSortingChange);
                  const direction = header.column.getIsSorted();
                  const label = flexRender(header.column.columnDef.header, header.getContext());
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={
                        direction === 'asc'
                          ? 'ascending'
                          : direction === 'desc'
                            ? 'descending'
                            : undefined
                      }
                      className={cn(
                        'px-3 py-3.5 text-center text-xs font-semibold whitespace-nowrap',
                        header.column.columnDef.meta?.className,
                      )}
                    >
                      {sortable ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="group/sort inline-flex min-h-9 items-center gap-1.5 rounded-sm hover:text-ink"
                        >
                          {label}
                          <SortIcon direction={direction} />
                        </button>
                      ) : (
                        label
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: skeletonRows }, (_, index) => (
                  <tr key={index}>
                    <td colSpan={columnCount} className="px-1">
                      <Skeleton className="h-14 w-full rounded-md" />
                    </td>
                  </tr>
                ))
              : rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                    onPointerEnter={() => onRowIntent?.(row.original)}
                    onFocus={() => onRowIntent?.(row.original)}
                    onClick={
                      onRowClick ? (event) => handleRowClick(event, row.original) : undefined
                    }
                    className={cn(
                      'group/row bg-surface transition-[background-color,box-shadow] duration-200 ease-brand hover:bg-primary-tint data-[state=selected]:bg-primary-tint',
                      onRowClick && 'cursor-pointer',
                    )}
                  >
                    {selectable ? (
                      <td
                        className="rounded-s-md px-3 py-3"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className={checkboxClass}
                          aria-label={ar.list.selectRow}
                          checked={row.getIsSelected()}
                          onChange={row.getToggleSelectedHandler()}
                        />
                      </td>
                    ) : null}
                    <td className={cn('px-3 py-3 text-center', !selectable && 'rounded-s-md')}>
                      <span className="row-num tabular">
                        {formatNumber(startIndex + row.index + 1)}
                      </span>
                    </td>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          'px-3 py-3 text-center text-ink last:rounded-e-md',
                          cell.column.columnDef.meta?.className,
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <ul className="flex flex-col gap-3 md:hidden" aria-label={caption}>
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => (
              <li key={index}>
                <Skeleton className="h-32 w-full rounded-lg" />
              </li>
            ))
          : rows.map((row) => (
              <li
                key={row.id}
                onClick={onRowClick ? (event) => handleRowClick(event, row.original) : undefined}
                onPointerEnter={() => onRowIntent?.(row.original)}
                className={cn(
                  'rounded-lg border border-line bg-surface p-4 shadow-card',
                  row.getIsSelected() && 'border-primary bg-primary-tint',
                )}
              >
                <dl className="flex flex-col gap-2">
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta;
                    if (meta?.hideOnMobile) return null;
                    const header = cell.column.columnDef.header;
                    const label = meta?.label ?? (typeof header === 'string' ? header : '');
                    return (
                      <div key={cell.id} className="flex items-start justify-between gap-3 text-sm">
                        {label ? <dt className="shrink-0 text-muted">{label}</dt> : null}
                        <dd className="min-w-0 text-end text-ink">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
                {selectable ? (
                  <label className="mt-3 flex min-h-11 items-center gap-2 border-t border-line pt-3 text-sm text-muted">
                    <input
                      type="checkbox"
                      className={checkboxClass}
                      checked={row.getIsSelected()}
                      onChange={row.getToggleSelectedHandler()}
                      onClick={(event) => event.stopPropagation()}
                    />
                    {ar.list.selectRow}
                  </label>
                ) : null}
              </li>
            ))}
      </ul>
    </div>
  );
}

export const DataTable = memo(DataTableInner) as typeof DataTableInner;
