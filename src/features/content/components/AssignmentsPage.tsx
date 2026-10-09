'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { FileCheck2, Lock, LockOpen } from 'lucide-react';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { SearchInput } from '@/components/data/SearchInput';
import { toast } from '@/components/feedback/toast';
import { FormField } from '@/components/form/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Can } from '@/features/auth/components/Can';
import { useGetGroupsQuery } from '@/features/groups/api';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { formatDateTime, formatNumber } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  ASSIGNMENT_KINDS,
  useCreateAssignmentMutation,
  useGetAssignmentsQuery,
  useSetAssignmentOpenMutation,
  type AssignmentDto,
} from '../api';
import { ContentHeader } from './ContentHeader';

const t = ar.content.assignments;
const v = ar.validation;

/** Swagger AssignmentRequest. */
const assignmentSchema = z.object({
  title: z.string().trim().min(2, v.required).max(150, v.tooLong(150)),
  groupId: z.string().min(1, v.required),
  kind: z.enum(ASSIGNMENT_KINDS),
  description: z.string().trim().min(1, v.required).max(2000, v.tooLong(2000)),
  dueAt: z.string(),
  maxScore: z
    .string()
    .trim()
    .transform((value) => (value === '' ? null : Number(value)))
    .pipe(
      z.number({ error: v.number }).min(1, v.minValue(1)).max(1000, v.maxValue(1000)).nullable(),
    ),
});

type AssignmentInput = z.input<typeof assignmentSchema>;
type AssignmentValues = z.output<typeof assignmentSchema>;

/** /content/assignments — homework per group: quick add, open / close. */
export function AssignmentsPage() {
  const list = useListQueryParams();
  const { data, isLoading, isFetching, error, refetch } = useGetAssignmentsQuery(list.params);
  const groups = useGetGroupsQuery({ page: 1, pageSize: 100, filters: {} });
  const [create] = useCreateAssignmentMutation();
  const [setOpen] = useSetAssignmentOpenMutation();
  const form = useForm<AssignmentInput, unknown, AssignmentValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: '',
      groupId: '',
      kind: 'Homework',
      description: '',
      dueAt: '',
      maxScore: '',
    },
  });
  const { errors, isSubmitting } = form.formState;

  const columns = useMemo<ColumnDef<AssignmentDto>[]>(() => {
    const toggle = async (assignment: AssignmentDto, open: boolean) => {
      try {
        await setOpen({ id: assignment.id, open }).unwrap();
        toast.success(open ? t.opened : t.closed, assignment.title);
      } catch (caught) {
        toast.error(toProblem(caught).title);
      }
    };
    return [
      { accessorKey: 'title', header: t.title },
      {
        accessorKey: 'groupId',
        header: ar.content.group,
        cell: ({ getValue }) =>
          (getValue<string | null>() &&
            groups.data?.items.find((group) => group.id === getValue<string>())?.name) ??
          '—',
      },
      {
        accessorKey: 'kind',
        header: t.kind,
        cell: ({ getValue }) => t.kinds[getValue<string>()] ?? getValue<string>(),
      },
      {
        accessorKey: 'dueAt',
        header: t.dueAt,
        cell: ({ getValue }) =>
          getValue<string | null>() ? formatDateTime(getValue<string>()) : '—',
      },
      {
        accessorKey: 'maxScore',
        header: t.maxScore,
        meta: { className: 'tabular' },
        cell: ({ getValue }) =>
          getValue<number | null>() === null ? '—' : formatNumber(getValue<number>()),
      },
      {
        accessorKey: 'status',
        header: t.status,
        cell: ({ getValue }) => (
          <Badge tone={getValue<string>().toLowerCase() === 'open' ? 'success' : 'neutral'} dot>
            {t.statuses[getValue<string>()] ?? getValue<string>()}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const open = row.original.status.toLowerCase() === 'open';
          return (
            <Can permission="content.update">
              <Button
                size="sm"
                variant="ghost"
                iconStart={open ? <Lock aria-hidden /> : <LockOpen aria-hidden />}
                onClick={() => void toggle(row.original, !open)}
              >
                {open ? t.close : t.open}
              </Button>
            </Can>
          );
        },
      },
    ];
  }, [groups.data, setOpen]);

  const save = async (values: AssignmentValues) => {
    try {
      await create({
        title: values.title,
        groupId: values.groupId,
        kind: values.kind,
        description: values.description,
        dueAtUtc: values.dueAt ? new Date(values.dueAt).toISOString() : null,
        maxScore: values.maxScore,
      }).unwrap();
      toast.success(t.added, values.title);
      form.reset();
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, [
        'title',
        'groupId',
        'kind',
        'description',
        'dueAt',
        'maxScore',
      ]);
      toast.error(problem.title, problem.detail);
    }
  };

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <ContentHeader />
      <Can permission="content.create">
        <Card className="p-4">
          <form
            noValidate
            className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-3"
            onSubmit={(event) => {
              form
                .handleSubmit(
                  save,
                  toastInvalidForm,
                )(event)
                .catch(() => undefined);
            }}
          >
            <FormField label={t.title} error={errors.title?.message} required>
              {(control) => <Input {...control} {...form.register('title')} />}
            </FormField>
            <FormField label={ar.content.group} error={errors.groupId?.message} required>
              {(control) => (
                <Controller
                  control={form.control}
                  name="groupId"
                  render={({ field }) => (
                    <Select
                      {...control}
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      options={(groups.data?.items ?? []).map((group) => ({
                        value: group.id,
                        label: group.name,
                      }))}
                    />
                  )}
                />
              )}
            </FormField>
            <FormField label={t.kind} error={errors.kind?.message} required>
              {(control) => (
                <Controller
                  control={form.control}
                  name="kind"
                  render={({ field }) => (
                    <Select
                      {...control}
                      value={field.value}
                      onValueChange={field.onChange}
                      options={ASSIGNMENT_KINDS.map((kind) => ({
                        value: kind,
                        label: t.kinds[kind] ?? kind,
                      }))}
                    />
                  )}
                />
              )}
            </FormField>
            <FormField
              label={t.description}
              error={errors.description?.message}
              required
              className="sm:col-span-2 lg:col-span-3"
            >
              {(control) => <Textarea {...control} {...form.register('description')} rows={2} />}
            </FormField>
            <FormField label={t.dueAt} error={errors.dueAt?.message}>
              {(control) => (
                <Input {...control} {...form.register('dueAt')} type="datetime-local" dir="ltr" />
              )}
            </FormField>
            <FormField label={t.maxScore} error={errors.maxScore?.message}>
              {(control) => (
                <Input {...control} {...form.register('maxScore')} inputMode="numeric" dir="ltr" />
              )}
            </FormField>
            <Button type="submit" loading={isSubmitting}>
              {t.add}
            </Button>
          </form>
        </Card>
      </Can>

      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <SearchInput
          value={list.params.search ?? ''}
          onSearch={list.setSearch}
          className="w-full max-w-sm"
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
          empty={<EmptyState icon={FileCheck2} title={t.empty} />}
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
    </div>
  );
}
