'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowRight, Pencil, Trash2, UsersRound, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { SearchInput } from '@/components/data/SearchInput';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { FormField } from '@/components/form/FormField';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { phoneSchema } from '@/features/auth/schemas';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { formatPhone } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  useDeleteGuardianMutation,
  useGetGuardiansQuery,
  useSaveGuardianMutation,
  type GuardianDto,
} from '../api';

const t = ar.guardians;

const guardianSchema = z.object({
  fullName: z.string().trim().min(3, ar.validation.fullName).max(100, ar.validation.tooLong(100)),
  phone: phoneSchema,
});

type GuardianValues = z.infer<typeof guardianSchema>;
const EMPTY: GuardianValues = { fullName: '', phone: '' };

/** /guardians — guardians by phone search (URL), add / edit inline, delete. */
export function GuardiansPage() {
  const list = useListQueryParams();
  const { data, isLoading, isFetching, error, refetch } = useGetGuardiansQuery({
    phone: list.params.search,
    page: list.params.page,
    pageSize: list.params.pageSize,
  });
  const [save] = useSaveGuardianMutation();
  const [remove] = useDeleteGuardianMutation();
  const [editing, setEditing] = useState<GuardianDto | null>(null);
  const [deleting, setDeleting] = useState<GuardianDto | null>(null);
  const form = useForm<GuardianValues>({
    resolver: zodResolver(guardianSchema),
    defaultValues: EMPTY,
  });
  const { errors, isSubmitting } = form.formState;

  const stopEdit = () => {
    setEditing(null);
    form.reset(EMPTY);
  };

  const columns = useMemo<ColumnDef<GuardianDto>[]>(
    () => [
      { accessorKey: 'fullName', header: t.name },
      {
        accessorKey: 'phone',
        header: t.phone,
        cell: ({ getValue }) =>
          getValue<string | null>() ? (
            <span dir="ltr" className="tabular">
              {formatPhone(getValue<string>())}
            </span>
          ) : (
            '—'
          ),
      },
      {
        id: 'actions',
        header: t.actions,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Can permission="students.update">
              <Button
                size="sm"
                variant="ghost"
                aria-label={`${ar.common.edit} ${row.original.fullName}`}
                iconStart={<Pencil aria-hidden />}
                onClick={() => {
                  setEditing(row.original);
                  form.reset({ fullName: row.original.fullName, phone: row.original.phone ?? '' });
                }}
              />
            </Can>
            <Can permission="students.delete">
              <Button
                size="sm"
                variant="ghost"
                aria-label={`${ar.common.delete} ${row.original.fullName}`}
                iconStart={<Trash2 aria-hidden />}
                onClick={() => setDeleting(row.original)}
              />
            </Can>
          </div>
        ),
      },
    ],
    [form],
  );

  const submit = async (values: GuardianValues) => {
    try {
      await save({ id: editing?.id, ...values }).unwrap();
      toast.success(t.saved, values.fullName);
      stopEdit();
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['fullName', 'phone']);
      toast.error(problem.title, problem.detail);
    }
  };

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header>
        <Link
          href={routes.students.list}
          className="flex items-center gap-2 text-sm text-muted hover:text-primary"
        >
          <ArrowRight className="size-4" aria-hidden />
          {ar.students.title}
        </Link>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">{t.title}</h1>
        <p className="mt-1 text-muted">{t.description}</p>
      </header>

      <Can permission="students.update">
        <Card className="p-4">
          <form
            noValidate
            className="grid items-end gap-3 sm:grid-cols-3"
            onSubmit={(event) => {
              form
                .handleSubmit(
                  submit,
                  toastInvalidForm,
                )(event)
                .catch(() => undefined);
            }}
          >
            <FormField label={t.name} error={errors.fullName?.message} required>
              {(control) => <Input {...control} {...form.register('fullName')} />}
            </FormField>
            <FormField label={t.phone} error={errors.phone?.message} required>
              {(control) => (
                <Input {...control} {...form.register('phone')} inputMode="tel" dir="ltr" />
              )}
            </FormField>
            <div className="flex gap-2">
              <Button type="submit" loading={isSubmitting}>
                {editing ? t.save : t.add}
              </Button>
              {editing ? (
                <Button
                  type="button"
                  variant="ghost"
                  iconStart={<X aria-hidden />}
                  onClick={stopEdit}
                >
                  {ar.common.cancel}
                </Button>
              ) : null}
            </div>
          </form>
        </Card>
      </Can>

      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <SearchInput
          value={list.params.search ?? ''}
          onSearch={list.setSearch}
          placeholder={t.searchPlaceholder}
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
          empty={<EmptyState icon={UsersRound} title={t.empty} />}
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
        itemName={deleting?.fullName ?? ''}
        description={t.deleteDesc}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove(deleting.id).unwrap();
            toast.success(t.deleted, deleting.fullName);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}
