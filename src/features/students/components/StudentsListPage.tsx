'use client';

import type { RowSelectionState } from '@tanstack/react-table';
import { Plus, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { BulkActionsBar } from '@/components/data/BulkActionsBar';
import { DataTable } from '@/components/data/DataTable';
import { ExportButton } from '@/components/data/ExportButton';
import { FilterBar } from '@/components/data/FilterBar';
import { Pagination } from '@/components/data/Pagination';
import { SearchInput } from '@/components/data/SearchInput';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Button, buttonVariants } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { ar } from '@/i18n/ar';
import { toProblem } from '@/lib/problem-details';
import { useDeleteStudentMutation, useGetStudentsQuery, useStudentsPrefetch } from '../api';
import { useStudentColumns } from '../columns';
import type { StudentListItemDto } from '../types';

const t = ar.students;

type PendingDelete = { kind: 'one'; student: StudentListItemDto } | { kind: 'bulk'; ids: string[] };

/** /students — reference list page (section 6): URL-synced search & paging, prefetch, delete, bulk. */
export function StudentsListPage() {
  const router = useRouter();
  const list = useListQueryParams();
  const { data, isLoading, isFetching, error, refetch } = useGetStudentsQuery(list.params);
  const [deleteStudent] = useDeleteStudentMutation();
  const prefetchStudent = useStudentsPrefetch('getStudent');
  const [selection, setSelection] = useState<RowSelectionState>({});
  const [pending, setPending] = useState<PendingDelete | null>(null);

  const askDelete = useCallback((student: StudentListItemDto) => {
    setPending({ kind: 'one', student });
  }, []);
  const columns = useStudentColumns(askDelete);

  const confirmDelete = async () => {
    if (!pending) return;
    if (pending.kind === 'one') {
      try {
        await deleteStudent(pending.student.id).unwrap();
        toast.success(t.deleted, pending.student.fullName);
      } catch (caught) {
        toast.error(toProblem(caught).title);
        throw caught;
      }
      return;
    }
    // No bulk endpoint in the live API: archive one by one, report partial failures.
    const results = await Promise.allSettled(pending.ids.map((id) => deleteStudent(id).unwrap()));
    const failed = results.filter((result) => result.status === 'rejected').length;
    setSelection({});
    if (failed === 0) toast.success(t.bulkDeleted(pending.ids.length));
    else toast.warning(t.bulkPartial(pending.ids.length - failed, failed));
  };

  const searching = Boolean(list.params.search);
  const selectedIds = Object.keys(selection);

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
          <p className="mt-1 text-muted">{t.description}</p>
        </div>
        <Can permission="students.create">
          <Link href={routes.students.new} className={buttonVariants({ size: 'lg' })}>
            <Plus className="size-4" aria-hidden />
            {t.add}
          </Link>
        </Can>
      </header>

      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <FilterBar
          search={<SearchInput value={list.params.search ?? ''} onSearch={list.setSearch} />}
          activeFilters={
            searching
              ? [{ key: 'search', label: `${ar.common.search}: ${list.params.search ?? ''}` }]
              : []
          }
          onRemoveFilter={() => list.setSearch('')}
          onClearAll={list.clearFilters}
          actions={
            <Can permission="students.export">
              <ExportButton
                path="/reports/students.csv"
                params={{}}
                fileName={t.exportName}
                extension="csv"
              />
            </Can>
          }
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
          rowSelection={selection}
          onRowSelectionChange={setSelection}
          onRowIntent={(row) => prefetchStudent(row.id)}
          onRowClick={(row) => router.push(routes.students.detail(row.id))}
          empty={
            searching ? (
              <EmptyState title={ar.list.noMatchTitle} description={ar.list.noMatchDesc} />
            ) : (
              <EmptyState
                icon={Users}
                title={t.emptyTitle}
                description={t.emptyDesc}
                action={
                  <Can permission="students.create">
                    <Link href={routes.students.new} className={buttonVariants()}>
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

      <Can permission="students.delete">
        <BulkActionsBar count={selectedIds.length} onClear={() => setSelection({})}>
          <Button
            size="sm"
            variant="danger"
            iconStart={<Trash2 aria-hidden />}
            onClick={() => setPending({ kind: 'bulk', ids: selectedIds })}
          >
            {t.archive}
          </Button>
        </BulkActionsBar>
      </Can>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title={t.archive}
        itemName={
          pending?.kind === 'one' ? pending.student.fullName : t.bulkItemName(selectedIds.length)
        }
        description={t.deleteDesc}
        confirmLabel={t.archive}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
