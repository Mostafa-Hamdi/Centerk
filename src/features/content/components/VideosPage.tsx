'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { EyeOff, Video } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { SearchInput } from '@/components/data/SearchInput';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { FormField } from '@/components/form/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Can } from '@/features/auth/components/Can';
import { useGetGroupsQuery } from '@/features/groups/api';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { formatMoney } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  useCreateVideoMutation,
  useGetVideosQuery,
  useHideVideoMutation,
  type VideoDto,
} from '../api';
import { ContentHeader } from './ContentHeader';

const t = ar.content.videos;
const v = ar.validation;

const wholeNumber = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, v.required)
    .transform(Number)
    .pipe(
      z
        .number({ error: v.number })
        .int(v.wholeNumber)
        .min(min, v.minValue(min))
        .max(max, v.maxValue(max)),
    );

/** Swagger VideoRequest (upload/playback endpoints are still pending on the backend). */
const videoSchema = z.object({
  title: z.string().trim().min(2, v.required).max(150, v.tooLong(150)),
  groupId: z.string().min(1, v.required),
  providerVideoId: z.string().trim().max(200, v.tooLong(200)),
  durationMinutes: wholeNumber(1, 600),
  maxViewsPerStudent: wholeNumber(1, 100),
  price: z
    .string()
    .trim()
    .transform((value) => (value === '' ? null : Number(value)))
    .pipe(
      z
        .number({ error: v.number })
        .min(0, v.minValue(0))
        .max(10_000, v.maxValue(10_000))
        .nullable(),
    ),
  watermark: z.boolean(),
});

type VideoInput = z.input<typeof videoSchema>;
type VideoValues = z.output<typeof videoSchema>;

/** /content/videos — videos per group: quick add, hide. */
export function VideosPage() {
  const list = useListQueryParams();
  const { data, isLoading, isFetching, error, refetch } = useGetVideosQuery(list.params);
  const groups = useGetGroupsQuery({ page: 1, pageSize: 100, filters: {} });
  const [create] = useCreateVideoMutation();
  const [hide] = useHideVideoMutation();
  const [hiding, setHiding] = useState<VideoDto | null>(null);
  const form = useForm<VideoInput, unknown, VideoValues>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: '',
      groupId: '',
      providerVideoId: '',
      durationMinutes: '',
      maxViewsPerStudent: '3',
      price: '',
      watermark: true,
    },
  });
  const { errors, isSubmitting } = form.formState;

  const columns = useMemo<ColumnDef<VideoDto>[]>(
    () => [
      {
        accessorKey: 'title',
        header: t.title,
        cell: ({ row }) => (
          <span className="flex flex-wrap items-center gap-2 font-medium">
            {row.original.title}
            {row.original.isActive ? null : <Badge>{t.hiddenBadge}</Badge>}
          </span>
        ),
      },
      {
        accessorKey: 'groupId',
        header: ar.content.group,
        cell: ({ getValue }) =>
          (getValue<string | null>() &&
            groups.data?.items.find((group) => group.id === getValue<string>())?.name) ??
          '—',
      },
      {
        accessorKey: 'durationSeconds',
        header: t.duration,
        cell: ({ getValue }) => t.minutes(Math.round(getValue<number>() / 60)),
      },
      {
        accessorKey: 'maxViewsPerStudent',
        header: t.maxViews,
        cell: ({ getValue }) => t.views(getValue<number>()),
      },
      {
        accessorKey: 'price',
        header: t.price,
        meta: { className: 'tabular' },
        cell: ({ getValue }) =>
          getValue<number | null>() ? formatMoney(getValue<number>()) : t.free,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) =>
          row.original.isActive ? (
            <Can permission="content.update">
              <Button
                size="sm"
                variant="ghost"
                iconStart={<EyeOff aria-hidden />}
                onClick={() => setHiding(row.original)}
              >
                {t.hide}
              </Button>
            </Can>
          ) : null,
      },
    ],
    [groups.data],
  );

  const save = async ({ durationMinutes, providerVideoId, ...values }: VideoValues) => {
    try {
      await create({
        ...values,
        providerVideoId: providerVideoId || null,
        durationSeconds: durationMinutes * 60,
      }).unwrap();
      toast.success(t.added, values.title);
      form.reset();
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, [
        'title',
        'groupId',
        'providerVideoId',
        'maxViewsPerStudent',
        'price',
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
            className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4"
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
            <FormField label={t.providerId} error={errors.providerVideoId?.message}>
              {(control) => <Input {...control} {...form.register('providerVideoId')} dir="ltr" />}
            </FormField>
            <FormField label={t.duration} error={errors.durationMinutes?.message} required>
              {(control) => (
                <Input
                  {...control}
                  {...form.register('durationMinutes')}
                  inputMode="numeric"
                  dir="ltr"
                />
              )}
            </FormField>
            <FormField label={t.maxViews} error={errors.maxViewsPerStudent?.message} required>
              {(control) => (
                <Input
                  {...control}
                  {...form.register('maxViewsPerStudent')}
                  inputMode="numeric"
                  dir="ltr"
                />
              )}
            </FormField>
            <FormField label={t.price} error={errors.price?.message}>
              {(control) => (
                <Input {...control} {...form.register('price')} inputMode="decimal" dir="ltr" />
              )}
            </FormField>
            <Controller
              control={form.control}
              name="watermark"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  label={t.watermark}
                />
              )}
            />
            <Button type="submit" loading={isSubmitting}>
              {t.add}
            </Button>
          </form>
        </Card>
      </Can>

      <section className="list-panel">
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
          empty={<EmptyState icon={Video} title={t.empty} />}
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
        open={hiding !== null}
        onOpenChange={(open) => {
          if (!open) setHiding(null);
        }}
        title={t.hide}
        questionPrefix={t.hideQuestion}
        itemName={hiding?.title ?? ''}
        description={t.hideDesc}
        confirmLabel={t.hide}
        tone="warning"
        onConfirm={async () => {
          if (!hiding) return;
          try {
            await hide(hiding.id).unwrap();
            toast.success(t.hidden, hiding.title);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}
