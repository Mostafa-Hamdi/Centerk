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
  'pager-btn flex size-10 items-center justify-center rounded-full text-sm font-semibold disabled:pointer-events-none disabled:opacity-35';

/**
 * Total count + page-size selector (`pager-summary`, shown above the table next to the search
 * inside a `.list-panel`) and the centered page buttons (`pager-nav`, below the table).
 */
export function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  return (
    <div className="pager">
      <div className="pager-summary flex items-center gap-3 text-sm text-muted">
        <span className="pager-total tabular">{ar.list.total(totalCount)}</span>
        <label className="flex items-center gap-2">
          <span>{ar.list.pageSize}</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="pager-size h-10 cursor-pointer rounded-full border border-line bg-surface px-3 text-ink focus:outline-none"
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
        <nav aria-label={ar.list.pagination} className="pager-nav">
          <button
            type="button"
            className={pageButton}
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
                className={cn(pageButton, 'tabular')}
              >
                {formatNumber(item)}
              </button>
            ),
          )}
          <button
            type="button"
            className={pageButton}
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
