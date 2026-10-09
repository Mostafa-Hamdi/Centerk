'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Library, Pause, Play, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { FormField } from '@/components/form/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Can } from '@/features/auth/components/Can';
import { useGetGroupsQuery } from '@/features/groups/api';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { formatMoney } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  COURSE_ACCESS,
  useDeleteCourseMutation,
  useGetAssignmentsQuery,
  useGetCoursesQuery,
  useGetVideosQuery,
  useSaveCourseMutation,
  type CourseDto,
} from '../api';
import { ContentHeader } from './ContentHeader';

const t = ar.content.courses;
const v = ar.validation;
const ALL_ITEMS = { page: 1, pageSize: 100, filters: {} };

/** Swagger CourseRequest — a paid bundle of a group's videos and assignments. */
const courseSchema = z.object({
  title: z.string().trim().min(2, v.required).max(150, v.tooLong(150)),
  groupId: z.string().min(1, v.required),
  price: z
    .string()
    .trim()
    .min(1, v.required)
    .transform(Number)
    .pipe(z.number({ error: v.number }).min(0, v.minValue(0)).max(100_000, v.maxValue(100_000))),
  accessDuration: z.enum(COURSE_ACCESS),
  videoIds: z.array(z.string()),
  assignmentIds: z.array(z.string()),
});

type CourseInput = z.input<typeof courseSchema>;
type CourseValues = z.output<typeof courseSchema>;

/** /content/courses — course bundles: quick add with content picker, stop / resume, delete. */
export function CoursesPage() {
  const list = useListQueryParams();
  const { data, isLoading, isFetching, error, refetch } = useGetCoursesQuery(list.params);
  const groups = useGetGroupsQuery(ALL_ITEMS);
  const videos = useGetVideosQuery(ALL_ITEMS);
  const assignments = useGetAssignmentsQuery(ALL_ITEMS);
  const [save] = useSaveCourseMutation();
  const [remove] = useDeleteCourseMutation();
  const [deleting, setDeleting] = useState<CourseDto | null>(null);
  const form = useForm<CourseInput, unknown, CourseValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      groupId: '',
      price: '',
      accessDuration: 'Month',
      videoIds: [],
      assignmentIds: [],
    },
  });
  const { errors, isSubmitting } = form.formState;
  const groupId = form.watch('groupId');

  const columns = useMemo<ColumnDef<CourseDto>[]>(() => {
    const toggle = async (course: CourseDto) => {
      const available = course.status !== 'Available';
      const accessDuration =
        COURSE_ACCESS.find((value) => value === course.accessDuration) ?? 'Month';
      try {
        await save({
          id: course.id,
          title: course.title,
          groupId: course.groupId ?? '',
          price: course.price,
          accessDuration,
          status: available ? 'Available' : 'Stopped',
          videoIds: course.videoIds,
          assignmentIds: course.assignmentIds,
        }).unwrap();
        toast.success(t.toggled(available), course.title);
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
        id: 'contents',
        header: t.contents,
        cell: ({ row }) =>
          t.counts(row.original.videoIds.length, row.original.assignmentIds.length),
      },
      {
        accessorKey: 'price',
        header: t.price,
        meta: { className: 'tabular' },
        cell: ({ getValue }) => formatMoney(getValue<number>()),
      },
      {
        accessorKey: 'accessDuration',
        header: t.access,
        cell: ({ getValue }) => t.accessLabels[getValue<string>()] ?? getValue<string>(),
      },
      {
        accessorKey: 'status',
        header: t.status,
        cell: ({ getValue }) => (
          <Badge tone={getValue<string>() === 'Available' ? 'success' : 'neutral'} dot>
            {t.statuses[getValue<string>()] ?? getValue<string>()}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Can permission="content.update">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                iconStart={
                  row.original.status === 'Available' ? <Pause aria-hidden /> : <Play aria-hidden />
                }
                onClick={() => void toggle(row.original)}
              >
                {row.original.status === 'Available' ? t.stop : t.resume}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-label={`${ar.common.delete} ${row.original.title}`}
                iconStart={<Trash2 aria-hidden />}
                onClick={() => setDeleting(row.original)}
              />
            </div>
          </Can>
        ),
      },
    ];
  }, [groups.data, save]);

  const add = async (values: CourseValues) => {
    try {
      await save({ ...values, status: 'Available' }).unwrap();
      toast.success(t.added, values.title);
      form.reset();
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['title', 'groupId', 'price', 'accessDuration']);
      toast.error(problem.title, problem.detail);
    }
  };

  const picker = (
    name: 'videoIds' | 'assignmentIds',
    label: string,
    items: { id: string; title: string }[],
  ) => (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 text-sm font-medium text-ink">{label}</legend>
          {items.length ? (
            items.map((item) => (
              <Checkbox
                key={item.id}
                checked={field.value.includes(item.id)}
                onCheckedChange={(checked) =>
                  field.onChange(
                    checked
                      ? [...field.value, item.id]
                      : field.value.filter((value) => value !== item.id),
                  )
                }
                label={<span className="text-sm">{item.title}</span>}
              />
            ))
          ) : (
            <p className="text-sm text-muted">{groupId ? t.noContent : t.pickGroup}</p>
          )}
        </fieldset>
      )}
    />
  );

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <ContentHeader />
      <Can permission="content.create">
        <Card className="p-4">
          <form
            noValidate
            className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4"
            onSubmit={(event) => {
              form
                .handleSubmit(
                  add,
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
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('videoIds', []);
                        form.setValue('assignmentIds', []);
                      }}
                      options={(groups.data?.items ?? []).map((group) => ({
                        value: group.id,
                        label: group.name,
                      }))}
                    />
                  )}
                />
              )}
            </FormField>
            <FormField label={t.price} error={errors.price?.message} required>
              {(control) => (
                <Input {...control} {...form.register('price')} inputMode="decimal" dir="ltr" />
              )}
            </FormField>
            <FormField label={t.access} error={errors.accessDuration?.message} required>
              {(control) => (
                <Controller
                  control={form.control}
                  name="accessDuration"
                  render={({ field }) => (
                    <Select
                      {...control}
                      value={field.value}
                      onValueChange={field.onChange}
                      options={COURSE_ACCESS.map((value) => ({
                        value,
                        label: t.accessLabels[value] ?? value,
                      }))}
                    />
                  )}
                />
              )}
            </FormField>
            <div className="grid gap-4 rounded-md bg-canvas p-3 sm:col-span-2 sm:grid-cols-2 lg:col-span-3">
              {picker(
                'videoIds',
                t.videos,
                (videos.data?.items ?? []).filter((video) => video.groupId === groupId),
              )}
              {picker(
                'assignmentIds',
                t.assignments,
                (assignments.data?.items ?? []).filter(
                  (assignment) => assignment.groupId === groupId,
                ),
              )}
            </div>
            <Button type="submit" loading={isSubmitting}>
              {t.add}
            </Button>
          </form>
        </Card>
      </Can>

      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <DataTable
          caption={t.caption}
          data={data?.items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error ? toProblem(error).title : null}
          onRetry={() => void refetch()}
          empty={<EmptyState icon={Library} title={t.empty} />}
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
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        itemName={deleting?.title ?? ''}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove(deleting.id).unwrap();
            toast.success(t.deleted, deleting.title);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}
