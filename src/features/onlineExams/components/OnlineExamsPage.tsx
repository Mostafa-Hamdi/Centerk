'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { EyeOff, MonitorCheck, Pencil, Plus, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { useGetGroupsQuery } from '@/features/groups/api';
import { QuestionsTabs } from '@/features/questions/components/QuestionsTabs';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { ar } from '@/i18n/ar';
import { formatDateTime } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  isDraft,
  useGetOnlineExamsQuery,
  useOnlineExamActionMutation,
  type OnlineExamDto,
} from '../api';

const t = ar.onlineExams;
const ALL = 'all';
const tones = { draft: 'neutral', published: 'success', closed: 'info' } as const;

type Pending = { exam: OnlineExamDto; action: 'publish' | 'unpublish' | 'delete' };

/** /online-exams — exams per group (URL filter), publish / unpublish, edit drafts, delete. */
export function OnlineExamsPage() {
  const router = useRouter();
  const list = useListQueryParams();
  const groupId = list.params.filters.groupId;
  const { data, isLoading, isFetching, error, refetch } = useGetOnlineExamsQuery({
    ...list.params,
    filters: {},
    groupId: groupId || undefined,
  });
  const groups = useGetGroupsQuery({ page: 1, pageSize: 100, filters: {} });
  const [run] = useOnlineExamActionMutation();
  const [pending, setPending] = useState<Pending | null>(null);

  const columns = useMemo<ColumnDef<OnlineExamDto>[]>(() => {
    const groupName = (id: string | null) =>
      (id && groups.data?.items.find((group) => group.id === id)?.name) ?? '—';
    return [
      {
        accessorKey: 'title',
        header: t.columns.title,
        cell: ({ row }) => (
          <Link
            href={routes.onlineExams.detail(row.original.id)}
            className="font-medium hover:text-primary"
          >
            {row.original.title}
          </Link>
        ),
      },
      {
        accessorKey: 'groupId',
        header: t.columns.group,
        cell: ({ getValue }) => groupName(getValue<string | null>()),
      },
      {
        id: 'window',
        header: t.columns.window,
        cell: ({ row }) => (
          <div className="flex flex-col text-xs text-muted">
            <span>{row.original.opensAt ? formatDateTime(row.original.opensAt) : '—'}</span>
            <span>{row.original.closesAt ? formatDateTime(row.original.closesAt) : '—'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'durationMinutes',
        header: t.columns.duration,
        cell: ({ getValue }) => t.minutes(getValue<number>()),
      },
      {
        accessorKey: 'status',
        header: t.columns.status,
        cell: ({ getValue }) => {
          const status = getValue<string>();
          const key = status.toLowerCase();
          return (
            <Badge tone={key in tones ? tones[key as keyof typeof tones] : 'neutral'} dot>
              {t.status[status] ?? status}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: t.columns.actions,
        cell: ({ row }) => {
          const exam = row.original;
          const draft = isDraft(exam);
          return (
            <div className="flex flex-wrap gap-1">
              <Can permission="onlineExams.manage">
                {draft ? (
                  <>
                    <Button
                      size="sm"
                      variant="success"
                      iconStart={<Send aria-hidden />}
                      onClick={() => setPending({ exam, action: 'publish' })}
                    >
                      {t.publish}
                    </Button>
                    <Link
                      href={routes.onlineExams.edit(exam.id)}
                      aria-label={`${ar.common.edit} ${exam.title}`}
                      className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`${ar.common.delete} ${exam.title}`}
                      iconStart={<Trash2 aria-hidden />}
                      onClick={() => setPending({ exam, action: 'delete' })}
                    />
                  </>
                ) : exam.status.toLowerCase() === 'published' ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    iconStart={<EyeOff aria-hidden />}
                    onClick={() => setPending({ exam, action: 'unpublish' })}
                  >
                    {t.unpublish}
                  </Button>
                ) : null}
              </Can>
            </div>
          );
        },
      },
    ];
  }, [groups.data]);

  const dialog = pending
    ? {
        publish: {
          title: t.publish,
          question: t.publishQuestion,
          description: t.publishDesc,
          confirm: t.publish,
          done: t.published,
          tone: 'warning' as const,
        },
        unpublish: {
          title: t.unpublish,
          question: t.unpublishQuestion,
          description: '',
          confirm: t.unpublish,
          done: t.unpublished,
          tone: 'warning' as const,
        },
        delete: {
          title: undefined,
          question: undefined,
          description: undefined,
          confirm: undefined,
          done: t.deleted,
          tone: 'danger' as const,
        },
      }[pending.action]
    : null;

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
          <p className="mt-1 text-muted">{t.description}</p>
        </div>
        <Can permission="onlineExams.manage">
          <Link
            href={routes.onlineExams.new}
            className={buttonVariants({ variant: 'primary', size: 'lg' })}
          >
            <Plus className="size-4" aria-hidden />
            {t.add}
          </Link>
        </Can>
      </header>
      <QuestionsTabs />
      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <div className="w-full max-w-xs">
          <Select
            aria-label={t.columns.group}
            value={groupId || ALL}
            onValueChange={(value) => list.setFilter('groupId', value === ALL ? null : value)}
            options={[
              { value: ALL, label: t.allGroups },
              ...(groups.data?.items ?? []).map((group) => ({
                value: group.id,
                label: group.name,
              })),
            ]}
          />
        </div>
        <DataTable
          caption={t.caption}
          data={data?.items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error ? toProblem(error).title : null}
          onRetry={() => void refetch()}
          onRowClick={(row) => router.push(routes.onlineExams.detail(row.id))}
          empty={<EmptyState icon={MonitorCheck} title={t.empty} />}
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
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title={dialog?.title}
        questionPrefix={dialog?.question}
        itemName={pending?.exam.title ?? ''}
        description={dialog?.description}
        confirmLabel={dialog?.confirm}
        tone={dialog?.tone}
        onConfirm={async () => {
          if (!pending || !dialog) return;
          try {
            await run({ id: pending.exam.id, action: pending.action }).unwrap();
            toast.success(dialog.done, pending.exam.title);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}
