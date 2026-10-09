'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { DoorOpen, XCircle } from 'lucide-react';
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
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Can } from '@/features/auth/components/Can';
import { useGetHallsQuery } from '@/features/groups/api';
import { useGetStaffQuery } from '@/features/staff/api';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { formatDateTime } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { selectCurrentBranchId } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import {
  useCancelHallBookingMutation,
  useCreateHallBookingMutation,
  useGetHallBookingsQuery,
  type HallBookingDto,
} from '../api';
import { CentersTabs } from './CentersTabs';

const t = ar.hallBookings;
const v = ar.validation;
const ALL = 'all';

const bookingSchema = z
  .object({
    hallId: z.string().min(1, v.required),
    teacherId: z.string().min(1, v.required),
    startsAt: z.string().min(1, v.required),
    endsAt: z.string().min(1, v.required),
  })
  .refine((value) => new Date(value.endsAt) > new Date(value.startsAt), {
    path: ['endsAt'],
    message: t.endAfterStart,
  });

type BookingValues = z.infer<typeof bookingSchema>;

/** /centers/hall-bookings — hall rentals: hall filter (URL), quick booking, cancel with reason. */
export function HallBookingsPage() {
  const list = useListQueryParams();
  const hallId = list.params.filters.hallId;
  const branchId = useAppSelector(selectCurrentBranchId);
  const { data, isLoading, isFetching, error, refetch } = useGetHallBookingsQuery({
    ...list.params,
    filters: {},
    hallId: hallId || undefined,
  });
  const halls = useGetHallsQuery(branchId ?? undefined);
  const teachers = useGetStaffQuery({ page: 1, pageSize: 100, filters: {}, role: 'Teacher' });
  const [create] = useCreateHallBookingMutation();
  const [cancel] = useCancelHallBookingMutation();
  const [cancelling, setCancelling] = useState<HallBookingDto | null>(null);
  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { hallId: '', teacherId: '', startsAt: '', endsAt: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const hallName = (id: string | null) =>
    (id && halls.data?.find((hall) => hall.id === id)?.name) ?? '—';

  const columns = useMemo<ColumnDef<HallBookingDto>[]>(
    () => [
      {
        accessorKey: 'hallId',
        header: t.hall,
        cell: ({ getValue }) =>
          (getValue<string | null>() &&
            halls.data?.find((hall) => hall.id === getValue<string>())?.name) ??
          '—',
      },
      {
        accessorKey: 'teacherId',
        header: t.teacher,
        cell: ({ getValue }) =>
          (getValue<string | null>() &&
            teachers.data?.items.find((member) => member.id === getValue<string>())?.name) ??
          '—',
      },
      {
        accessorKey: 'startsAt',
        header: t.startsAt,
        cell: ({ getValue }) =>
          getValue<string | null>() ? formatDateTime(getValue<string>()) : '—',
      },
      {
        accessorKey: 'endsAt',
        header: t.endsAt,
        cell: ({ getValue }) =>
          getValue<string | null>() ? formatDateTime(getValue<string>()) : '—',
      },
      {
        accessorKey: 'status',
        header: t.status,
        cell: ({ getValue }) => {
          const status = getValue<string>();
          return (
            <Badge tone={status.toLowerCase() === 'cancelled' ? 'danger' : 'success'} dot>
              {t.statuses[status] ?? status}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) =>
          row.original.status.toLowerCase() === 'cancelled' ? null : (
            <Can permission="centers.halls">
              <Button
                size="sm"
                variant="ghost"
                aria-label={t.cancel}
                iconStart={<XCircle aria-hidden />}
                onClick={() => setCancelling(row.original)}
              />
            </Can>
          ),
      },
    ],
    [halls.data, teachers.data],
  );

  const save = async (values: BookingValues) => {
    try {
      await create({
        hallId: values.hallId,
        teacherId: values.teacherId,
        startsAtUtc: new Date(values.startsAt).toISOString(),
        endsAtUtc: new Date(values.endsAt).toISOString(),
      }).unwrap();
      toast.success(t.added, hallName(values.hallId));
      form.reset();
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['hallId', 'teacherId', 'startsAt', 'endsAt']);
      toast.error(problem.title, problem.detail);
    }
  };

  const picker = (
    name: 'hallId' | 'teacherId',
    label: string,
    options: { value: string; label: string }[],
  ) => (
    <FormField label={label} error={errors[name]?.message} required>
      {(control) => (
        <Controller
          control={form.control}
          name={name}
          render={({ field }) => (
            <Select
              {...control}
              value={field.value || undefined}
              onValueChange={field.onChange}
              options={options}
            />
          )}
        />
      )}
    </FormField>
  );

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
        <p className="mt-1 text-muted">{t.description}</p>
      </header>
      <CentersTabs />

      <Can permission="centers.halls">
        <Card className="p-4">
          <form
            noValidate
            className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-5"
            onSubmit={(event) => {
              form
                .handleSubmit(
                  save,
                  toastInvalidForm,
                )(event)
                .catch(() => undefined);
            }}
          >
            {picker(
              'hallId',
              t.hall,
              (halls.data ?? []).map((hall) => ({ value: hall.id, label: hall.name })),
            )}
            {picker(
              'teacherId',
              t.teacher,
              (teachers.data?.items ?? []).map((member) => ({
                value: member.id,
                label: member.name,
              })),
            )}
            <FormField label={t.startsAt} error={errors.startsAt?.message} required>
              {(control) => (
                <Input
                  {...control}
                  {...form.register('startsAt')}
                  type="datetime-local"
                  dir="ltr"
                />
              )}
            </FormField>
            <FormField label={t.endsAt} error={errors.endsAt?.message} required>
              {(control) => (
                <Input {...control} {...form.register('endsAt')} type="datetime-local" dir="ltr" />
              )}
            </FormField>
            <Button type="submit" loading={isSubmitting}>
              {t.add}
            </Button>
          </form>
        </Card>
      </Can>

      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <div className="w-full max-w-xs">
          <Select
            aria-label={t.hall}
            value={hallId || ALL}
            onValueChange={(value) => list.setFilter('hallId', value === ALL ? null : value)}
            options={[
              { value: ALL, label: t.allHalls },
              ...(halls.data ?? []).map((hall) => ({ value: hall.id, label: hall.name })),
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
          empty={<EmptyState icon={DoorOpen} title={t.empty} />}
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
        open={cancelling !== null}
        onOpenChange={(open) => {
          if (!open) setCancelling(null);
        }}
        title={t.cancel}
        questionPrefix={ar.confirm.voidPrefix}
        itemName={cancelling ? hallName(cancelling.hallId) : ''}
        confirmLabel={t.cancel}
        requireReason
        onConfirm={async (reason) => {
          if (!cancelling) return;
          try {
            await cancel({ id: cancelling.id, reason: reason ?? '' }).unwrap();
            toast.success(t.cancelled);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}
