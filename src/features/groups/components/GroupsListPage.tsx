'use client';

import { CalendarDays, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { DataTable } from '@/components/data/DataTable';
import { FilterBar } from '@/components/data/FilterBar';
import { Pagination } from '@/components/data/Pagination';
import { SearchInput } from '@/components/data/SearchInput';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { buttonVariants } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { ar } from '@/i18n/ar';
import { toProblem } from '@/lib/problem-details';
import { useGetGroupsQuery, useGroupsPrefetch, useSetGroupPausedMutation } from '../api';
import { useGroupColumns } from '../columns';
import type { GroupListItemDto } from '../types';

const t = ar.groups;

/** /groups — list with URL-synced search & paging, pause/resume (warning action), prefetch. */
export function GroupsListPage() {
  const router = useRouter();
  const list = useListQueryParams();
  const { data, isLoading, isFetching, error, refetch } = useGetGroupsQuery(list.params);
  const [setPaused] = useSetGroupPausedMutation();
  const prefetchGroup = useGroupsPrefetch('getGroup');
  const [pending, setPending] = useState<GroupListItemDto | null>(null);

  const askToggle = useCallback((group: GroupListItemDto) => {
    setPending(group);
  }, []);
  const columns = useGroupColumns(askToggle);
  const pausing = pending?.status !== 'Paused';

  const confirmToggle = async () => {
    if (!pending) return;
    try {
      await setPaused({ id: pending.id, paused: pausing }).unwrap();
      toast.success(pausing ? t.paused : t.resumed, pending.name);
    } catch (caught) {
      toast.error(toProblem(caught).title);
      throw caught;
    }
  };

  const searching = Boolean(list.params.search);

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
          <p className="mt-1 text-muted">{t.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={routes.sessions.list}
            className={buttonVariants({ variant: 'info', size: 'lg' })}
          >
            <CalendarDays className="size-4" aria-hidden />
            {ar.sessions.scheduleLink}
          </Link>
          <Can permission="groups.create">
            <Link href={routes.groups.new} className={buttonVariants({ size: 'lg' })}>
              <Plus className="size-4" aria-hidden />
              {t.add}
            </Link>
          </Can>
        </div>
      </header>

      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <FilterBar
          search={
            <SearchInput
              value={list.params.search ?? ''}
              onSearch={list.setSearch}
              placeholder={ar.common.search}
            />
          }
          activeFilters={
            searching
              ? [{ key: 'search', label: `${ar.common.search}: ${list.params.search ?? ''}` }]
              : []
          }
          onRemoveFilter={() => list.setSearch('')}
          onClearAll={list.clearFilters}
        />
        <DataTable
          caption={t.caption}
          data={data?.items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error ? toProblem(error).title : null}
          onRetry={() => void refetch()}
          onRowIntent={(row) => prefetchGroup(row.id)}
          onRowClick={(row) => router.push(routes.groups.detail(row.id))}
          empty={
            searching ? (
              <EmptyState title={ar.list.noMatchTitle} description={ar.list.noMatchDesc} />
            ) : (
              <EmptyState
                icon={CalendarDays}
                title={t.emptyTitle}
                description={t.emptyDesc}
                action={
                  <Can permission="groups.create">
                    <Link href={routes.groups.new} className={buttonVariants()}>
                      <Plus className="size-4" aria-hidden />
                      {t.add}
                    </Link>
                  </Can>
                }
              />
            )
          }
        />
        {data && data.totalCount > 0 ? (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            pageSize={list.params.pageSize}
            onPageChange={list.setPage}
            onPageSizeChange={list.setPageSize}
          />
        ) : null}
      </section>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        tone="warning"
        title={pausing ? t.pause : t.resume}
        questionPrefix={pausing ? t.pause : t.resume}
        itemName={pending?.name ?? ''}
        description={pausing ? t.pauseDesc : undefined}
        confirmLabel={pausing ? t.pause : t.resume}
        onConfirm={confirmToggle}
      />
    </div>
  );
}
