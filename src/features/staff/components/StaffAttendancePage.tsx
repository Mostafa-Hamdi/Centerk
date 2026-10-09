'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CalendarCheck2, Trash2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { DataTable } from '@/components/data/DataTable';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { FormField } from '@/components/form/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DatePicker } from '@/components/ui/DatePicker';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Can } from '@/features/auth/components/Can';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { toProblem } from '@/lib/problem-details';
import {
  STAFF_ATTENDANCE_STATUSES,
  useDeleteStaffAttendanceMutation,
  useGetStaffAttendanceQuery,
  useGetStaffQuery,
  useRecordStaffAttendanceMutation,
  type StaffAttendanceDto,
} from '../api';
import { StaffHeader } from './StaffHeader';

const t = ar.staff.attendance;
const v = ar.validation;
const tones = { Present: 'success', Late: 'warning', Absent: 'danger', Leave: 'info' } as const;

const recordSchema = z.object({
  userId: z.string().min(1, v.required),
  status: z.enum(STAFF_ATTENDANCE_STATUSES),
  checkIn: z.string(),
  checkOut: z.string(),
});

type RecordValues = z.infer<typeof recordSchema>;

/** "HH:mm" → "HH:mm:ss" (TimeOnly) or null. */
const toTime = (value: string) => (value ? `${value}:00` : null);

/** /staff/attendance — a day's staff attendance (date in the URL) + quick record form. */
export function StaffAttendancePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const date = searchParams.get('date') ?? format(new Date(), 'yyyy-MM-dd');
  const { data, isLoading, isFetching, error, refetch } = useGetStaffAttendanceQuery({
    date,
    page: 1,
    pageSize: 100,
    filters: {},
  });
  const staff = useGetStaffQuery({ page: 1, pageSize: 100, filters: {} });
  const [record] = useRecordStaffAttendanceMutation();
  const [remove] = useDeleteStaffAttendanceMutation();
  const [deleting, setDeleting] = useState<StaffAttendanceDto | null>(null);
  const form = useForm<RecordValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      userId: '',
      status: 'Present',
      checkIn: format(new Date(), 'HH:mm'),
      checkOut: '',
    },
  });
  const { errors, isSubmitting } = form.formState;

  const staffName = (id: string | null) =>
    (id && staff.data?.items.find((member) => member.id === id)?.name) ?? '—';

  const columns = useMemo<ColumnDef<StaffAttendanceDto>[]>(
    () => [
      {
        accessorKey: 'userId',
        header: t.staff,
        cell: ({ getValue }) =>
          (getValue<string | null>() &&
            staff.data?.items.find((member) => member.id === getValue<string>())?.name) ??
          '—',
      },
      {
        accessorKey: 'status',
        header: t.status,
        cell: ({ getValue }) => {
          const status = getValue<string>();
          const key = STAFF_ATTENDANCE_STATUSES.find((value) => value === status);
          return (
            <Badge tone={key ? tones[key] : 'neutral'} dot>
              {t.statuses[status] ?? status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'checkIn',
        header: t.checkIn,
        cell: ({ getValue }) => (
          <span dir="ltr" className="tabular">
            {getValue<string | null>()?.slice(0, 5) ?? '—'}
          </span>
        ),
      },
      {
        accessorKey: 'checkOut',
        header: t.checkOut,
        cell: ({ getValue }) => (
          <span dir="ltr" className="tabular">
            {getValue<string | null>()?.slice(0, 5) ?? '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Can permission="staff.update">
            <Button
              size="sm"
              variant="ghost"
              aria-label={ar.common.delete}
              iconStart={<Trash2 aria-hidden />}
              onClick={() => setDeleting(row.original)}
            />
          </Can>
        ),
      },
    ],
    [staff.data],
  );

  const save = async (values: RecordValues) => {
    try {
      await record({
        userId: values.userId,
        date,
        status: values.status,
        checkIn: toTime(values.checkIn),
        checkOut: toTime(values.checkOut),
      }).unwrap();
      toast.success(t.recorded, staffName(values.userId));
      form.reset({ ...values, userId: '' });
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['userId', 'status', 'checkIn', 'checkOut']);
      toast.error(problem.title, problem.detail);
    }
  };

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <StaffHeader />
      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <div className="w-full max-w-xs">
          <DatePicker
            aria-label={t.date}
            value={date}
            onChange={(value) => {
              const next = new URLSearchParams(searchParams.toString());
              if (value) next.set('date', value);
              else next.delete('date');
              router.replace(`${pathname}?${next.toString()}`, { scroll: false });
            }}
          />
        </div>

        <Can permission="staff.update">
          <Card className="bg-canvas p-4 shadow-none">
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
              <FormField label={t.staff} error={errors.userId?.message} required>
                {(control) => (
                  <Controller
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <Select
                        {...control}
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        options={(staff.data?.items ?? [])
                          .filter((member) => member.isActive)
                          .map((member) => ({ value: member.id, label: member.name }))}
                      />
                    )}
                  />
                )}
              </FormField>
              <FormField label={t.status} error={errors.status?.message} required>
                {(control) => (
                  <Controller
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <Select
                        {...control}
                        value={field.value}
                        onValueChange={field.onChange}
                        options={STAFF_ATTENDANCE_STATUSES.map((status) => ({
                          value: status,
                          label: t.statuses[status] ?? status,
                        }))}
                      />
                    )}
                  />
                )}
              </FormField>
              <FormField label={t.checkIn} error={errors.checkIn?.message}>
                {(control) => (
                  <Input {...control} {...form.register('checkIn')} type="time" dir="ltr" />
                )}
              </FormField>
              <FormField label={t.checkOut} error={errors.checkOut?.message}>
                {(control) => (
                  <Input {...control} {...form.register('checkOut')} type="time" dir="ltr" />
                )}
              </FormField>
              <Button type="submit" loading={isSubmitting}>
                {t.record}
              </Button>
            </form>
          </Card>
        </Can>

        <DataTable
          caption={t.caption}
          data={data?.items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error ? toProblem(error).title : null}
          onRetry={() => void refetch()}
          empty={<EmptyState icon={CalendarCheck2} title={t.empty} />}
        />
      </section>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        itemName={deleting ? staffName(deleting.userId) : ''}
        requireReason
        onConfirm={async (reason) => {
          if (!deleting) return;
          try {
            await remove({ id: deleting.id, reason: reason ?? '' }).unwrap();
            toast.success(t.deleted);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}
