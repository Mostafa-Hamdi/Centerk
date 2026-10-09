'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowRight, Banknote, BellRing, PackageOpen, Pencil, Truck } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { FormField } from '@/components/form/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Combobox } from '@/components/ui/Combobox';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/ui/StatCard';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { useGetStudentsQuery } from '@/features/students/api';
import { CancelMaterialRecordButton } from '@/features/extras/components/More';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { formatDateTime, formatMoney, formatNumber } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  isLowStock,
  MOVEMENT_TYPES,
  useAddStockMovementMutation,
  useCollectDeliveryMutation,
  useDeliverMaterialMutation,
  useGetDeliveriesQuery,
  useGetMaterialQuery,
  useGetStockMovementsQuery,
  type DeliveryDto,
  type MaterialDto,
  type StockMovementDto,
} from '../api';

const t = ar.materials;
const v = ar.validation;
const PAGE_SIZE = 10;

/** /materials/[id] — stock overview, stock movements and deliveries to students. */
export function MaterialDetailPage({ id }: { id: string }) {
  const { data: material, error, refetch } = useGetMaterialQuery(id);

  if (error)
    return (
      <ErrorState
        title={toProblem(error).status === 404 ? t.details.notFound : ar.list.loadError}
        onRetry={() => void refetch()}
      />
    );
  if (!material) return <Skeleton className="h-96 w-full rounded-xl" />;

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={routes.materials.list}
            className="flex items-center gap-2 text-sm text-muted hover:text-primary"
          >
            <ArrowRight className="size-4" aria-hidden />
            {t.title}
          </Link>
          <h1 className="mt-1 flex flex-wrap items-center gap-2 font-display text-2xl font-bold text-ink">
            {material.name}
            {material.includedInSubscription ? <Badge tone="info">{t.included}</Badge> : null}
          </h1>
        </div>
        <Can permission="materials.update">
          <Link
            href={routes.materials.edit(id)}
            className={buttonVariants({ variant: 'info', size: 'lg' })}
          >
            <Pencil className="size-4" aria-hidden />
            {ar.common.edit}
          </Link>
        </Can>
      </div>

      <div className="grid gap-(--shell-gap) sm:grid-cols-3">
        <StatCard
          label={t.details.stock}
          value={formatNumber(material.stockQty)}
          icon={PackageOpen}
          tone={isLowStock(material) ? 'warning' : 'success'}
          footer={isLowStock(material) ? t.lowStock : undefined}
        />
        <StatCard
          label={t.details.minStock}
          value={formatNumber(material.minStockAlert)}
          icon={BellRing}
          tone="cyan"
        />
        <StatCard label={t.columns.price} value={formatMoney(material.price)} icon={Banknote} />
      </div>

      <div className="grid gap-(--shell-gap) xl:grid-cols-2">
        <MovementsSection material={material} />
        <DeliveriesSection material={material} />
      </div>
    </div>
  );
}

const movementSchema = z.object({
  type: z.enum(MOVEMENT_TYPES),
  quantity: z
    .string()
    .trim()
    .min(1, v.required)
    .transform(Number)
    .pipe(
      z
        .number({ error: v.number })
        .int(v.wholeNumber)
        .min(1, v.minValue(1))
        .max(100_000, v.maxValue(100_000)),
    ),
  note: z.string().trim().max(300, v.tooLong(300)),
});

function MovementsSection({ material }: { material: MaterialDto }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error, refetch } = useGetStockMovementsQuery({
    materialId: material.id,
    page,
    pageSize: PAGE_SIZE,
    filters: {},
  });
  const [addMovement] = useAddStockMovementMutation();
  const form = useForm<z.input<typeof movementSchema>, unknown, z.output<typeof movementSchema>>({
    resolver: zodResolver(movementSchema),
    defaultValues: { type: 'In', quantity: '', note: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const columns = useMemo<ColumnDef<StockMovementDto>[]>(
    () => [
      {
        accessorKey: 'type',
        header: t.details.movementType,
        cell: ({ getValue }) => t.movementTypes[getValue<string>()] ?? getValue<string>(),
      },
      {
        accessorKey: 'quantity',
        header: t.details.quantity,
        meta: { className: 'tabular' },
        cell: ({ getValue }) => formatNumber(getValue<number>()),
      },
      {
        accessorKey: 'note',
        header: t.details.note,
        cell: ({ getValue }) => getValue<string | null>() ?? '—',
      },
      {
        accessorKey: 'createdAt',
        header: t.details.deliveredAt,
        cell: ({ getValue }) =>
          getValue<string | null>() ? formatDateTime(getValue<string>()) : '—',
      },
      {
        id: 'cancel',
        header: '',
        cell: ({ row }) => (
          <CancelMaterialRecordButton
            kind="stock-movements"
            id={row.original.id}
            materialId={material.id}
            label={`${t.movementTypes[row.original.type] ?? row.original.type} · ${formatNumber(row.original.quantity)}`}
          />
        ),
      },
    ],
    [material.id],
  );

  const save = async (values: z.output<typeof movementSchema>) => {
    try {
      await addMovement({ materialId: material.id, ...values }).unwrap();
      toast.success(t.details.movementAdded, t.movementTypes[values.type]);
      form.reset();
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['type', 'quantity', 'note']);
      toast.error(problem.title, problem.detail);
    }
  };

  return (
    <section className="list-panel">
      <h2 className="font-display text-lg font-bold text-ink">{t.details.movements}</h2>
      <Can permission="materials.update">
        <Card className="bg-canvas p-4 shadow-none">
          <form
            noValidate
            className="grid gap-3 sm:grid-cols-3"
            onSubmit={(event) => {
              form
                .handleSubmit(
                  save,
                  toastInvalidForm,
                )(event)
                .catch(() => undefined);
            }}
          >
            <FormField label={t.details.movementType} error={errors.type?.message} required>
              {(control) => (
                <Controller
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <Select
                      {...control}
                      value={field.value}
                      onValueChange={field.onChange}
                      options={MOVEMENT_TYPES.map((type) => ({
                        value: type,
                        label: t.movementTypes[type] ?? type,
                      }))}
                    />
                  )}
                />
              )}
            </FormField>
            <FormField label={t.details.quantity} error={errors.quantity?.message} required>
              {(control) => (
                <Input
                  {...control}
                  {...form.register('quantity')}
                  inputMode="numeric"
                  dir="ltr"
                  className="tabular"
                />
              )}
            </FormField>
            <FormField label={t.details.note} error={errors.note?.message}>
              {(control) => <Input {...control} {...form.register('note')} />}
            </FormField>
            <div className="sm:col-span-3">
              <Button type="submit" loading={isSubmitting}>
                {t.details.addMovement}
              </Button>
            </div>
          </form>
        </Card>
      </Can>
      <DataTable
        startIndex={((data?.page ?? 1) - 1) * PAGE_SIZE}
        caption={t.details.movements}
        data={data?.items}
        columns={columns}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error ? toProblem(error).title : null}
        onRetry={() => void refetch()}
        skeletonRows={4}
        empty={<EmptyState icon={PackageOpen} title={t.details.movementsEmpty} />}
      />
      {data && data.totalPages > 1 ? (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          totalCount={data.totalCount}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          onPageSizeChange={() => undefined}
        />
      ) : null}
    </section>
  );
}

const deliverySchema = z.object({
  studentId: z.string().min(1, v.required),
  paymentStatus: z.enum(['Free', 'Owed']),
});

function DeliveriesSection({ material }: { material: MaterialDto }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const students = useGetStudentsQuery({ search, page: 1, pageSize: 20, filters: {} });
  const { data, isLoading, isFetching, error, refetch } = useGetDeliveriesQuery({
    materialId: material.id,
    page,
    pageSize: PAGE_SIZE,
    filters: {},
  });
  const [deliver] = useDeliverMaterialMutation();
  const [collect] = useCollectDeliveryMutation();
  const [collecting, setCollecting] = useState<DeliveryDto | null>(null);
  const form = useForm<z.input<typeof deliverySchema>, unknown, z.output<typeof deliverySchema>>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      studentId: '',
      paymentStatus: material.includedInSubscription || material.price === 0 ? 'Free' : 'Owed',
    },
  });
  const { errors, isSubmitting } = form.formState;

  const columns = useMemo<ColumnDef<DeliveryDto>[]>(
    () => [
      {
        id: 'student',
        header: t.details.student,
        cell: ({ row }) =>
          row.original.studentId ? (
            <Link
              href={routes.students.detail(row.original.studentId)}
              className="font-medium hover:text-primary"
            >
              {row.original.studentName ?? row.original.studentId.slice(0, 8)}
            </Link>
          ) : (
            '—'
          ),
      },
      {
        accessorKey: 'paymentStatus',
        header: t.details.payment,
        cell: ({ getValue }) => (
          <Badge tone={getValue<string>() === 'Owed' ? 'warning' : 'success'}>
            {t.paymentStatus[getValue<string>()] ?? getValue<string>()}
          </Badge>
        ),
      },
      {
        accessorKey: 'deliveredAt',
        header: t.details.deliveredAt,
        cell: ({ getValue }) =>
          getValue<string | null>() ? formatDateTime(getValue<string>()) : '—',
      },
      {
        id: 'collect',
        header: '',
        cell: ({ row }) => (
          <span className="flex items-center justify-center gap-1">
            {row.original.paymentStatus === 'Owed' && row.original.studentId ? (
              <Can permission="payments.create">
                <Button
                  size="sm"
                  variant="success"
                  iconStart={<Banknote aria-hidden />}
                  onClick={() => setCollecting(row.original)}
                >
                  {t.details.collect}
                </Button>
              </Can>
            ) : null}
            <CancelMaterialRecordButton
              kind="material-deliveries"
              id={row.original.id}
              materialId={material.id}
              label={row.original.studentName ?? material.name}
            />
          </span>
        ),
      },
    ],
    [material.id, material.name],
  );

  const save = async (values: z.output<typeof deliverySchema>) => {
    try {
      await deliver({ materialId: material.id, ...values }).unwrap();
      toast.success(t.details.delivered, material.name);
      form.reset({ studentId: '', paymentStatus: values.paymentStatus });
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['studentId', 'paymentStatus']);
      toast.error(problem.title, problem.detail);
    }
  };

  return (
    <section className="list-panel">
      <h2 className="font-display text-lg font-bold text-ink">{t.details.deliveries}</h2>
      <Can permission="materials.update">
        <Card className="bg-canvas p-4 shadow-none">
          <form
            noValidate
            className="grid gap-3 sm:grid-cols-3"
            onSubmit={(event) => {
              form
                .handleSubmit(
                  save,
                  toastInvalidForm,
                )(event)
                .catch(() => undefined);
            }}
          >
            <FormField
              label={t.details.student}
              error={errors.studentId?.message}
              required
              className="sm:col-span-2"
            >
              {(control) => (
                <Controller
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <Combobox
                      {...control}
                      value={field.value || undefined}
                      onValueChange={(value) => field.onChange(value ?? '')}
                      onSearch={setSearch}
                      loading={students.isFetching}
                      placeholder={ar.payments.form.studentPlaceholder}
                      options={(students.data?.items ?? []).map((student) => ({
                        value: student.id,
                        label: `${student.fullName} · ${student.code}`,
                      }))}
                    />
                  )}
                />
              )}
            </FormField>
            <FormField label={t.details.payment} error={errors.paymentStatus?.message} required>
              {(control) => (
                <Controller
                  control={form.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <Select
                      {...control}
                      value={field.value}
                      onValueChange={field.onChange}
                      options={(['Free', 'Owed'] as const).map((status) => ({
                        value: status,
                        label:
                          status === 'Owed'
                            ? `${t.paymentStatus.Owed ?? status} (${formatMoney(material.price)})`
                            : (t.paymentStatus.Free ?? status),
                      }))}
                    />
                  )}
                />
              )}
            </FormField>
            <div className="sm:col-span-3">
              <Button
                type="submit"
                variant="success"
                loading={isSubmitting}
                disabled={material.stockQty <= 0}
                iconStart={<Truck aria-hidden />}
              >
                {t.details.deliver}
              </Button>
            </div>
          </form>
        </Card>
      </Can>
      <DataTable
        startIndex={((data?.page ?? 1) - 1) * PAGE_SIZE}
        caption={t.details.deliveries}
        data={data?.items}
        columns={columns}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error ? toProblem(error).title : null}
        onRetry={() => void refetch()}
        skeletonRows={4}
        empty={<EmptyState icon={Truck} title={t.details.deliveriesEmpty} />}
      />
      {data && data.totalPages > 1 ? (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          totalCount={data.totalCount}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          onPageSizeChange={() => undefined}
        />
      ) : null}
      <ConfirmDialog
        open={collecting !== null}
        onOpenChange={(open) => {
          if (!open) setCollecting(null);
        }}
        title={t.details.collect}
        questionPrefix={t.details.collectQuestion}
        itemName={`${collecting?.studentName ?? ''} · ${formatMoney(material.price)}`}
        description={t.details.collectDesc}
        confirmLabel={t.details.collect}
        tone="warning"
        onConfirm={async () => {
          if (!collecting?.studentId) return;
          try {
            await collect({
              id: collecting.id,
              materialId: material.id,
              studentId: collecting.studentId,
              amount: material.price,
            }).unwrap();
            toast.success(t.details.collected, formatMoney(material.price));
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </section>
  );
}
