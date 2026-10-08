'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZES } from '@/hooks/useListQueryParams';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

/** 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(page: number, total: number): (number | 'gap')[] {
  const pages = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, index) => {
    const previous = sorted[index - 1];
    return previous !== undefined && p - previous > 1 ? (['gap', p] as const) : [p];
  });
}

const pageButton =
  'flex size-11 items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40';

/** Total count, page-size selector and page buttons (RTL: "previous" points right). */
export function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div className="flex items-center gap-3 text-sm text-muted">
        <span className="tabular">{ar.list.total(totalCount)}</span>
        <label className="flex items-center gap-2">
          <span>{ar.list.pageSize}</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-11 rounded-md border border-line bg-surface px-2 text-ink hover:border-primary focus:border-primary focus:outline-none"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {formatNumber(size)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {totalPages > 1 ? (
        <nav aria-label={ar.list.pagination} className="flex items-center gap-1">
          <button
            type="button"
            className={cn(pageButton, 'text-muted hover:bg-primary-tint hover:text-primary')}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label={ar.list.previous}
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
          {pageWindow(page, totalPages).map((item, index) =>
            item === 'gap' ? (
              <span key={`gap-${index}`} className="px-1 text-muted" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-label={ar.list.goToPage(item)}
                aria-current={item === page ? 'page' : undefined}
                className={cn(
                  pageButton,
                  'tabular',
                  item === page ? 'bg-primary text-primary-ink' : 'text-ink hover:bg-primary-tint',
                )}
              >
                {formatNumber(item)}
              </button>
            ),
          )}
          <button
            type="button"
            className={cn(pageButton, 'text-muted hover:bg-primary-tint hover:text-primary')}
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label={ar.list.next}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
        </nav>
      ) : null}
    </div>
  );
}
