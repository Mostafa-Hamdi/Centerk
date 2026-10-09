'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, ArrowRight, CalendarClock, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { DataTable } from '@/components/data/DataTable';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { FormField } from '@/components/form/FormField';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { useGetStaffQuery } from '@/features/staff/api';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { formatDateTime } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  REPORT_CHANNELS,
  REPORT_FREQUENCIES,
  REPORT_TYPES,
  useDeleteScheduledReportMutation,
  useGetScheduledReportsQuery,
  useSaveScheduledReportMutation,
  type ScheduledReportDto,
} from '../api';

const t = ar.reports.scheduled;
const v = ar.validation;

const scheduleSchema = z.object({
  name: z.string().trim().min(2, v.required).max(100, v.tooLong(100)),
  reportType: z.enum(REPORT_TYPES),
  frequency: z.enum(REPORT_FREQUENCIES),
  channel: z.enum(REPORT_CHANNELS),
  nextRunAt: z.string().min(1, v.required),
  recipientUserIds: z.array(z.string()).min(1, t.noRecipients),
});

type ScheduleValues = z.infer<typeof scheduleSchema>;

/** /reports/scheduled — automatic reports: quick add, on/off switch, delete. */
export function ScheduledReportsPage() {
  const { data, isLoading, isFetching, error, refetch } = useGetScheduledReportsQuery({
    page: 1,
    pageSize: 100,
    filters: {},
  });
  const staff = useGetStaffQuery({ page: 1, pageSize: 100, filters: {} });
  const [save] = useSaveScheduledReportMutation();
  const [remove] = useDeleteScheduledReportMutation();
  const [deleting, setDeleting] = useState<ScheduledReportDto | null>(null);
  const form = useForm<ScheduleValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      name: '',
      reportType: 'DailySummary',
      frequency: 'Daily',
      channel: 'WhatsAppPdf',
      nextRunAt: '',
      recipientUserIds: [],
    },
  });
  const { errors, isSubmitting } = form.formState;
  const workerOff = data?.items.some((report) => !report.workerConfigured) ?? false;

  const columns = useMemo<ColumnDef<ScheduledReportDto>[]>(() => {
    const toggle = async (report: ScheduledReportDto, isActive: boolean) => {
      const reportType = REPORT_TYPES.find((value) => value === report.reportType);
      const frequency = REPORT_FREQUENCIES.find((value) => value === report.frequency);
      const channel = REPORT_CHANNELS.find((value) => value === report.channel);
      if (!reportType || !frequency || !channel || !report.nextRunAt) return;
      try {
        await save({
          id: report.id,
          name: report.name,
          reportType,
          frequency,
          channel,
          recipientUserIds: report.recipientUserIds,
          nextRunAtUtc: report.nextRunAt,
          isActive,
        }).unwrap();
        toast.success(t.toggled(isActive), report.name);
      } catch (caught) {
        toast.error(toProblem(caught).title);
      }
    };
    return [
      { accessorKey: 'name', header: t.name },
      {
        accessorKey: 'reportType',
        header: t.type,
        cell: ({ getValue }) => t.types[getValue<string>()] ?? getValue<string>(),
      },
      {
        accessorKey: 'frequency',
        header: t.frequency,
        cell: ({ getValue }) => t.frequencies[getValue<string>()] ?? getValue<string>(),
      },
      {
        accessorKey: 'channel',
        header: t.channel,
        cell: ({ getValue }) => t.channels[getValue<string>()] ?? getValue<string>(),
      },
      {
        accessorKey: 'nextRunAt',
        header: t.nextRun,
        cell: ({ getValue }) =>
          getValue<string | null>() ? formatDateTime(getValue<string>()) : '—',
      },
      {
        accessorKey: 'isActive',
        header: t.active,
        cell: ({ row }) => (
          <Can permission="reports.schedule" fallback={row.original.isActive ? t.active : '—'}>
            <Switch
              checked={row.original.isActive}
              onCheckedChange={(checked) => void toggle(row.original, checked)}
              label={<span className="sr-only">{`${t.active}: ${row.original.name}`}</span>}
            />
          </Can>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Can permission="reports.schedule">
            <Button
              size="sm"
              variant="ghost"
              aria-label={`${ar.common.delete} ${row.original.name}`}
              iconStart={<Trash2 aria-hidden />}
              onClick={() => setDeleting(row.original)}
            />
          </Can>
        ),
      },
    ];
  }, [save]);

  const add = async ({ nextRunAt, ...values }: ScheduleValues) => {
    try {
      await save({
        ...values,
        nextRunAtUtc: new Date(nextRunAt).toISOString(),
        isActive: true,
      }).unwrap();
      toast.success(t.added, values.name);
      form.reset();
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, [
        'name',
        'reportType',
        'frequency',
        'channel',
        'nextRunAt',
      ]);
      toast.error(problem.title, problem.detail);
    }
  };

  const select = (
    name: 'reportType' | 'frequency' | 'channel',
    label: string,
    values: readonly string[],
    labels: Record<string, string>,
  ) => (
    <FormField label={label} error={errors[name]?.message} required>
      {(control) => (
        <Controller
          control={form.control}
          name={name}
          render={({ field }) => (
            <Select
              {...control}
              value={field.value}
              onValueChange={field.onChange}
              options={values.map((value) => ({ value, label: labels[value] ?? value }))}
            />
          )}
        />
      )}
    </FormField>
  );

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header>
        <Link
          href={routes.reports.list}
          className="flex items-center gap-2 text-sm text-muted hover:text-primary"
        >
          <ArrowRight className="size-4" aria-hidden />
          {ar.reports.title}
        </Link>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">{t.title}</h1>
        <p className="mt-1 text-muted">{t.description}</p>
      </header>

      {workerOff ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-md bg-warning-tint p-3 text-sm text-warning"
        >
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          {t.workerOff}
        </p>
      ) : null}

      <Can permission="reports.schedule">
        <Card className="p-4">
          <form
            noValidate
            className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-5"
            onSubmit={(event) => {
              form
                .handleSubmit(
                  add,
                  toastInvalidForm,
                )(event)
                .catch(() => undefined);
            }}
          >
            <FormField label={t.name} error={errors.name?.message} required>
              {(control) => <Input {...control} {...form.register('name')} />}
            </FormField>
            {select('reportType', t.type, REPORT_TYPES, t.types)}
            {select('frequency', t.frequency, REPORT_FREQUENCIES, t.frequencies)}
            {select('channel', t.channel, REPORT_CHANNELS, t.channels)}
            <FormField label={t.nextRun} error={errors.nextRunAt?.message} required>
              {(control) => (
                <Input
                  {...control}
                  {...form.register('nextRunAt')}
                  type="datetime-local"
                  dir="ltr"
                />
              )}
            </FormField>
            <Controller
              control={form.control}
              name="recipientUserIds"
              render={({ field }) => (
                <fieldset className="flex flex-col gap-2 sm:col-span-2 lg:col-span-4">
                  <legend
                    className={
                      errors.recipientUserIds
                        ? 'mb-1 text-sm font-medium text-danger'
                        : 'mb-1 text-sm font-medium text-ink'
                    }
                  >
                    {errors.recipientUserIds?.message ?? t.recipients}
                  </legend>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {(staff.data?.items ?? [])
                      .filter((member) => member.isActive)
                      .map((member) => (
                        <Checkbox
                          key={member.id}
                          checked={field.value.includes(member.id)}
                          onCheckedChange={(checked) =>
                            field.onChange(
                              checked
                                ? [...field.value, member.id]
                                : field.value.filter((id) => id !== member.id),
                            )
                          }
                          label={<span className="text-sm">{member.name}</span>}
                        />
                      ))}
                  </div>
                </fieldset>
              )}
            />
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
          empty={<EmptyState icon={CalendarClock} title={t.empty} />}
        />
      </section>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        itemName={deleting?.name ?? ''}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove(deleting.id).unwrap();
            toast.success(t.deleted, deleting.name);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}
