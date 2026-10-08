'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { ListParams } from '@/services/types';

export const PAGE_SIZES = [10, 20, 50, 100] as const;
const RESERVED = new Set(['search', 'page', 'pageSize', 'sort']);

export interface SortState {
  id: string;
  desc: boolean;
}

/** "fullName,-createdAt" ↔ [{id:'fullName',desc:false},{id:'createdAt',desc:true}] */
export const parseSort = (value: string | null): SortState[] =>
  (value ?? '')
    .split(',')
    .filter(Boolean)
    .map((part) => ({ id: part.replace(/^-/, ''), desc: part.startsWith('-') }));

export const serializeSort = (sort: SortState[]) =>
  sort.map((item) => (item.desc ? `-${item.id}` : item.id)).join(',');

/**
 * List state (search, filters, sort, page, pageSize) stored in the URL query string —
 * shareable links and back-button safe. Any change other than `page` resets to page 1.
 */
export function useListQueryParams({ defaultPageSize = 20 }: { defaultPageSize?: number } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params: ListParams = useMemo(() => {
    const filters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (!RESERVED.has(key) && value) filters[key] = value;
    });
    const pageSize = Number(searchParams.get('pageSize'));
    return {
      search: searchParams.get('search') ?? undefined,
      page: Math.max(1, Number(searchParams.get('page')) || 1),
      pageSize: PAGE_SIZES.includes(pageSize as (typeof PAGE_SIZES)[number])
        ? pageSize
        : defaultPageSize,
      sort: searchParams.get('sort') ?? undefined,
      filters,
    };
  }, [searchParams, defaultPageSize]);

  const update = useCallback(
    (changes: Record<string, string | number | null | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === undefined || value === '') next.delete(key);
        else next.set(key, String(value));
      }
      if (!('page' in changes)) next.delete('page');
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return {
    params,
    sort: parseSort(params.sort ?? null),
    setSearch: (search: string) => update({ search }),
    setPage: (page: number) => update({ page: page > 1 ? page : null }),
    setPageSize: (pageSize: number) => update({ pageSize }),
    setSort: (sort: SortState[]) => update({ sort: serializeSort(sort) || null }),
    setFilter: (key: string, value: string | null) => update({ [key]: value }),
    clearFilters: () =>
      update(
        Object.fromEntries([...Object.keys(params.filters), 'search'].map((key) => [key, null])),
      ),
  };
}
