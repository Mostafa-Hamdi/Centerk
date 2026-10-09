'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, DoorOpen, Pencil, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { FormField } from '@/components/form/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Switch } from '@/components/ui/Switch';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { toProblem } from '@/lib/problem-details';
import { selectCurrentBranchId } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import {
  useDeleteHallMutation,
  useGetHallsAdminQuery,
  useSaveHallMutation,
  type HallDto,
} from '../api';

const t = ar.halls;
const v = ar.validation;

const hallSchema = z.object({
  name: z.string().trim().min(1, v.required).max(100, v.tooLong(100)),
  capacity: z
    .string()
    .trim()
    .min(1, v.required)
    .transform(Number)
    .pipe(
      z
        .number({ error: v.number })
        .int(v.wholeNumber)
        .min(1, v.minValue(1))
        .max(1000, v.maxValue(1000)),
    ),
  equipment: z.string().trim().max(300, v.tooLong(300)),
});

type HallInput = z.input<typeof hallSchema>;
type HallValues = z.output<typeof hallSchema>;

const EMPTY: HallInput = { name: '', capacity: '', equipment: '' };

/** /halls — the current branch's halls: add / edit inline, availability switch, delete. */
export function HallsPage() {
  const branchId = useAppSelector(selectCurrentBranchId);
  const { data, error, refetch, isLoading } = useGetHallsAdminQuery(branchId ?? undefined);
  const [saveHall] = useSaveHallMutation();
  const [deleteHall] = useDeleteHallMutation();
  const [editing, setEditing] = useState<HallDto | null>(null);
  const [deleting, setDeleting] = useState<HallDto | null>(null);
  const form = useForm<HallInput, unknown, HallValues>({
    resolver: zodResolver(hallSchema),
    defaultValues: EMPTY,
  });
  const { errors, isSubmitting } = form.formState;

  const startEdit = (hall: HallDto) => {
    setEditing(hall);
    form.reset({
      name: hall.name,
      capacity: hall.capacity === null ? '' : String(hall.capacity),
      equipment: hall.equipment ?? '',
    });
  };
  const stopEdit = () => {
    setEditing(null);
    form.reset(EMPTY);
  };

  const save = async (values: HallValues) => {
    try {
      await saveHall({
        id: editing?.id,
        branchId: branchId ?? undefined,
        name: values.name,
        capacity: values.capacity,
        equipment: values.equipment || null,
        isAvailable: editing?.isAvailable ?? true,
      }).unwrap();
      toast.success(t.saved, values.name);
      stopEdit();
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['name', 'capacity', 'equipment']);
      toast.error(problem.title, problem.detail);
    }
  };

  const toggle = async (hall: HallDto, isAvailable: boolean) => {
    try {
      await saveHall({
        id: hall.id,
        name: hall.name,
        capacity: hall.capacity ?? 1,
        equipment: hall.equipment,
        isAvailable,
      }).unwrap();
      toast.success(t.toggled(isAvailable), hall.name);
    } catch (caught) {
      toast.error(toProblem(caught).title);
    }
  };

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header>
        <Link
          href={routes.groups.list}
          className="flex items-center gap-2 text-sm text-muted hover:text-primary"
        >
          <ArrowRight className="size-4" aria-hidden />
          {ar.groups.title}
        </Link>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">{t.title}</h1>
        <p className="mt-1 text-muted">{t.description}</p>
      </header>

      <Can permission="halls.manage">
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
            <FormField label={t.name} error={errors.name?.message} required>
              {(control) => <Input {...control} {...form.register('name')} />}
            </FormField>
            <FormField label={t.capacity} error={errors.capacity?.message} required>
              {(control) => (
                <Input
                  {...control}
                  {...form.register('capacity')}
                  inputMode="numeric"
                  dir="ltr"
                  className="tabular"
                />
              )}
            </FormField>
            <FormField label={t.equipment} error={errors.equipment?.message}>
              {(control) => <Input {...control} {...form.register('equipment')} />}
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

      {error ? (
        <ErrorState title={ar.list.loadError} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : data?.length ? (
        <ul className="grid gap-(--shell-gap) sm:grid-cols-2 xl:grid-cols-3">
          {data.map((hall) => (
            <li key={hall.id}>
              <Card className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-lg font-bold text-ink">{hall.name}</p>
                    <p className="text-sm text-muted">
                      {hall.capacity === null ? '—' : t.seats(hall.capacity)}
                    </p>
                  </div>
                  <Badge tone={hall.isAvailable ? 'success' : 'neutral'} dot>
                    {hall.isAvailable ? t.available : t.unavailable}
                  </Badge>
                </div>
                {hall.equipment ? <p className="text-sm text-ink">{hall.equipment}</p> : null}
                <Can permission="halls.manage">
                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
                    <Switch
                      checked={hall.isAvailable}
                      onCheckedChange={(checked) => void toggle(hall, checked)}
                      label={<span className="text-sm text-muted">{t.available}</span>}
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`${t.edit} ${hall.name}`}
                        iconStart={<Pencil aria-hidden />}
                        onClick={() => startEdit(hall)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`${ar.common.delete} ${hall.name}`}
                        iconStart={<Trash2 aria-hidden />}
                        onClick={() => setDeleting(hall)}
                      />
                    </div>
                  </div>
                </Can>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={DoorOpen} title={t.empty} />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        itemName={deleting?.name ?? ''}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteHall(deleting.id).unwrap();
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
