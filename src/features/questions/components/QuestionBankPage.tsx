'use client';

import { ExportButton } from '@/components/data/ExportButton';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Copy, FolderPlus, Library, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { useGetGradeLevelsQuery } from '@/features/lookups/api';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { CurriculumCard } from '@/features/extras/components/Tools';
import { QuestionImportCard } from '@/features/extras/components/More';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { toProblem } from '@/lib/problem-details';
import {
  DIFFICULTIES,
  QUESTION_TYPES,
  useAddUnitMutation,
  useGetQuestionsQuery,
  useGetSubjectsQuery,
  useGetUnitsQuery,
  useQuestionActionMutation,
  type QuestionDto,
} from '../api';
import { QuestionsTabs } from './QuestionsTabs';

const t = ar.questions;
const ALL = 'all';
const difficultyTone = { Easy: 'success', Medium: 'warning', Hard: 'danger' } as const;

/** /question-bank — questions filtered by unit / type / difficulty (URL), duplicate, delete. */
export function QuestionBankPage() {
  const router = useRouter();
  const list = useListQueryParams();
  const { unitId, type, difficulty } = list.params.filters;
  const { data, isLoading, isFetching, error, refetch } = useGetQuestionsQuery({
    ...list.params,
    filters: {},
    unitId: unitId || undefined,
    type: QUESTION_TYPES.find((value) => value === type),
    difficulty: DIFFICULTIES.find((value) => value === difficulty),
  });
  const units = useGetUnitsQuery(undefined);
  const [run] = useQuestionActionMutation();
  const [deleting, setDeleting] = useState<QuestionDto | null>(null);
  const [addingUnit, setAddingUnit] = useState(false);

  const columns = useMemo<ColumnDef<QuestionDto>[]>(() => {
    const unitName = (id: string | null) =>
      (id && units.data?.find((unit) => unit.id === id)?.name) ?? '—';
    const duplicate = async (question: QuestionDto) => {
      try {
        await run({ id: question.id, action: 'duplicate' }).unwrap();
        toast.success(t.duplicated);
      } catch (caught) {
        toast.error(toProblem(caught).title);
      }
    };
    return [
      {
        accessorKey: 'text',
        header: t.columns.text,
        cell: ({ getValue }) => (
          <p className="line-clamp-2 max-w-lg font-medium" title={getValue<string>()}>
            {getValue<string>()}
          </p>
        ),
      },
      {
        accessorKey: 'unitId',
        header: t.columns.unit,
        cell: ({ getValue }) => unitName(getValue<string | null>()),
      },
      {
        accessorKey: 'type',
        header: t.columns.type,
        cell: ({ getValue }) => t.types[getValue<string>()] ?? getValue<string>(),
      },
      {
        accessorKey: 'difficulty',
        header: t.columns.difficulty,
        cell: ({ getValue }) => {
          const value = getValue<string>();
          const tone = DIFFICULTIES.find((item) => item === value);
          return (
            <Badge tone={tone ? difficultyTone[tone] : 'neutral'}>
              {t.difficulties[value] ?? value}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: t.columns.actions,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Can permission="questions.update">
              <Link
                href={routes.questions.edit(row.original.id)}
                aria-label={ar.common.edit}
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                <Pencil className="size-4" aria-hidden />
              </Link>
            </Can>
            <Can permission="questions.create">
              <Button
                size="sm"
                variant="ghost"
                aria-label={ar.materials.duplicate}
                iconStart={<Copy aria-hidden />}
                onClick={() => void duplicate(row.original)}
              />
            </Can>
            <Can permission="questions.delete">
              <Button
                size="sm"
                variant="ghost"
                aria-label={ar.common.delete}
                iconStart={<Trash2 aria-hidden />}
                onClick={() => setDeleting(row.original)}
              />
            </Can>
          </div>
        ),
      },
    ];
  }, [units.data, run]);

  const filterSelect = (
    key: string,
    label: string,
    allLabel: string,
    options: { value: string; label: string }[],
  ) => (
    <div className="w-full sm:w-48">
      <Select
        aria-label={label}
        value={list.params.filters[key] || ALL}
        onValueChange={(value) => list.setFilter(key, value === ALL ? null : value)}
        options={[{ value: ALL, label: allLabel }, ...options]}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
          <p className="mt-1 text-muted">{t.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Can permission="questions.create">
            <Button
              variant="info"
              size="lg"
              iconStart={<FolderPlus aria-hidden />}
              aria-expanded={addingUnit}
              onClick={() => setAddingUnit((open) => !open)}
            >
              {t.units.add}
            </Button>
            <Link
              href={routes.questions.new}
              className={buttonVariants({ variant: 'primary', size: 'lg' })}
            >
              <Plus className="size-4" aria-hidden />
              {t.add}
            </Link>
          </Can>
        </div>
      </header>

      <QuestionsTabs />

      {addingUnit ? (
        <>
          <AddUnitForm onDone={() => setAddingUnit(false)} />
          <CurriculumCard />
          <QuestionImportCard />
        </>
      ) : null}

      <section className="list-panel">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={list.params.search ?? ''}
            onSearch={list.setSearch}
            placeholder={t.searchPlaceholder}
            className="w-full max-w-sm"
          />
          {filterSelect(
            'unitId',
            t.columns.unit,
            t.allUnits,
            (units.data ?? []).map((unit) => ({ value: unit.id, label: unit.name })),
          )}
          {filterSelect(
            'type',
            t.columns.type,
            t.allTypes,
            QUESTION_TYPES.map((value) => ({ value, label: t.types[value] ?? value })),
          )}
          <Can permission="questions.export">
            <ExportButton path="/questions/export" params={{}} fileName="questions" />
          </Can>
          {filterSelect(
            'difficulty',
            t.columns.difficulty,
            t.allDifficulties,
            DIFFICULTIES.map((value) => ({ value, label: t.difficulties[value] ?? value })),
          )}
        </div>
        <DataTable
          startIndex={((data?.page ?? 1) - 1) * list.params.pageSize}
          caption={t.caption}
          data={data?.items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error ? toProblem(error).title : null}
          onRetry={() => void refetch()}
          onRowClick={(row) => router.push(routes.questions.edit(row.id))}
          empty={<EmptyState icon={Library} title={t.empty} description={t.emptyDesc} />}
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
        itemName={deleting ? deleting.text.slice(0, 60) : ''}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await run({ id: deleting.id, action: 'delete' }).unwrap();
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

const unitSchema = z.object({
  name: z.string().trim().min(2, ar.validation.required).max(100, ar.validation.tooLong(100)),
  subjectId: z.string().min(1, ar.validation.required),
  gradeLevelId: z.string().min(1, ar.validation.required),
});

type UnitValues = z.infer<typeof unitSchema>;

/** Inline "add unit" (POST /units) — questions must belong to a unit. */
function AddUnitForm({ onDone }: { onDone: () => void }) {
  const subjects = useGetSubjectsQuery(undefined);
  const grades = useGetGradeLevelsQuery(undefined);
  const [addUnit] = useAddUnitMutation();
  const form = useForm<UnitValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: { name: '', subjectId: '', gradeLevelId: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const save = async (values: UnitValues) => {
    try {
      await addUnit(values).unwrap();
      toast.success(t.units.added, values.name);
      onDone();
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['name', 'subjectId', 'gradeLevelId']);
      toast.error(problem.title, problem.detail);
    }
  };

  const picker = (
    name: 'subjectId' | 'gradeLevelId',
    label: string,
    items: { id: string; name: string }[],
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
              options={items.map((item) => ({ value: item.id, label: item.name }))}
            />
          )}
        />
      )}
    </FormField>
  );

  return (
    <Card className="p-5">
      <form
        noValidate
        className="grid items-end gap-3 md:grid-cols-4"
        onSubmit={(event) => {
          form
            .handleSubmit(
              save,
              toastInvalidForm,
            )(event)
            .catch(() => undefined);
        }}
      >
        <FormField label={t.units.name} error={errors.name?.message} required>
          {(control) => <Input {...control} {...form.register('name')} />}
        </FormField>
        {picker('subjectId', t.units.subject, subjects.data ?? [])}
        {picker('gradeLevelId', t.units.grade, grades.data ?? [])}
        <div className="flex gap-2 pb-0.5">
          <Button type="submit" loading={isSubmitting}>
            {t.units.add}
          </Button>
          <Button type="button" variant="ghost" onClick={onDone}>
            {ar.common.cancel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
