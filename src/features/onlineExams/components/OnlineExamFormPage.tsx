'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { SearchInput } from '@/components/data/SearchInput';
import { toast } from '@/components/feedback/toast';
import { FormActions } from '@/components/form/FormActions';
import { FormField } from '@/components/form/FormField';
import { FormPage } from '@/components/form/FormPage';
import { FormSection } from '@/components/form/FormSection';
import { Checkbox } from '@/components/ui/Checkbox';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Switch } from '@/components/ui/Switch';
import { routes } from '@/config/routes';
import { useGetGroupsQuery } from '@/features/groups/api';
import { useGetQuestionsQuery, useGetUnitsQuery } from '@/features/questions/api';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { toProblem } from '@/lib/problem-details';
import { useGetOnlineExamQuery, useSaveOnlineExamMutation } from '../api';

const t = ar.onlineExams;
const v = ar.validation;
const ALL = 'all';

const examSchema = z
  .object({
    title: z.string().trim().min(2, v.required).max(150, v.tooLong(150)),
    groupId: z.string().min(1, v.required),
    opensAt: z.string().min(1, v.required),
    closesAt: z.string().min(1, v.required),
    durationMinutes: z
      .string()
      .trim()
      .min(1, v.required)
      .transform(Number)
      .pipe(
        z
          .number({ error: v.number })
          .int(v.wholeNumber)
          .min(5, v.minValue(5))
          .max(600, v.maxValue(600)),
      ),
    showAnswersAfterClose: z.boolean(),
    questions: z
      .array(
        z.object({
          questionId: z.string(),
          text: z.string(),
          points: z.number().min(0.5).max(100),
        }),
      )
      .min(1, t.form.noQuestions),
  })
  .refine((value) => new Date(value.closesAt) > new Date(value.opensAt), {
    path: ['closesAt'],
    message: t.form.closesAfterOpens,
  });

type ExamInput = z.input<typeof examSchema>;
type ExamValues = z.output<typeof examSchema>;

/** ISO (UTC) → <input type="datetime-local"> value in local time. */
const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

/** /online-exams/new and /online-exams/[id]/edit — exam settings + question picker from the bank. */
export function OnlineExamFormPage({ id }: { id?: string }) {
  const router = useRouter();
  const exam = useGetOnlineExamQuery(id ?? '', { skip: !id });
  const groups = useGetGroupsQuery({ page: 1, pageSize: 100, filters: {} });
  const units = useGetUnitsQuery(undefined);
  const [unitId, setUnitId] = useState(ALL);
  const [search, setSearch] = useState('');
  const bank = useGetQuestionsQuery({
    page: 1,
    pageSize: 50,
    filters: {},
    search: search || undefined,
    unitId: unitId === ALL ? undefined : unitId,
  });
  const [saveExam] = useSaveOnlineExamMutation();
  const form = useForm<ExamInput, unknown, ExamValues>({
    resolver: zodResolver(examSchema),
    mode: 'onBlur',
    defaultValues: {
      title: '',
      groupId: '',
      opensAt: '',
      closesAt: '',
      durationMinutes: '30',
      showAnswersAfterClose: true,
      questions: [],
    },
  });
  const { errors, isSubmitting, isDirty, isSubmitSuccessful } = form.formState;

  useEffect(() => {
    const data = exam.data;
    if (!data) return;
    form.reset({
      title: data.title,
      groupId: data.groupId ?? '',
      opensAt: toLocalInput(data.opensAt),
      closesAt: toLocalInput(data.closesAt),
      durationMinutes: String(data.durationMinutes),
      showAnswersAfterClose: data.showAnswersAfterClose,
      questions: data.questions,
    });
  }, [exam.data, form]);

  if (id && exam.error)
    return <ErrorState title={ar.list.loadError} onRetry={() => void exam.refetch()} />;
  if (id && !exam.data)
    return <Skeleton className="mx-auto h-[28rem] w-full max-w-5xl rounded-xl" />;

  const save = async (values: ExamValues) => {
    try {
      const saved = await saveExam({
        id,
        title: values.title,
        groupId: values.groupId,
        opensAtUtc: new Date(values.opensAt).toISOString(),
        closesAtUtc: new Date(values.closesAt).toISOString(),
        durationMinutes: values.durationMinutes,
        showAnswersAfterClose: values.showAnswersAfterClose,
        questions: values.questions.map(({ questionId, points }) => ({ questionId, points })),
      }).unwrap();
      toast.success(id ? t.form.updated : t.form.created, values.title);
      router.replace(routes.onlineExams.detail(saved.id || id || ''));
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, [
        'title',
        'groupId',
        'opensAt',
        'closesAt',
        'durationMinutes',
      ]);
      toast.error(problem.title, problem.detail);
      throw caught;
    }
  };

  return (
    <FormPage
      title={id ? t.form.editTitle : t.form.addTitle}
      backHref={routes.onlineExams.list}
      onSubmit={(event) => {
        form
          .handleSubmit(
            save,
            toastInvalidForm,
          )(event)
          .catch(() => undefined);
      }}
      actions={
        <FormActions
          cancelHref={routes.onlineExams.list}
          submitting={isSubmitting || isSubmitSuccessful}
          dirty={isDirty && !isSubmitSuccessful}
        />
      }
    >
      <FormSection title={t.form.basics}>
        <FormField label={t.form.title} error={errors.title?.message} required>
          {(control) => <Input {...control} {...form.register('title')} />}
        </FormField>
        <FormField label={t.form.group} error={errors.groupId?.message} required>
          {(control) => (
            <Controller
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <Select
                  {...control}
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  placeholder={t.form.groupPlaceholder}
                  options={(groups.data?.items ?? []).map((group) => ({
                    value: group.id,
                    label: group.name,
                  }))}
                />
              )}
            />
          )}
        </FormField>
        <FormField label={t.form.opensAt} error={errors.opensAt?.message} required>
          {(control) => (
            <Input {...control} {...form.register('opensAt')} type="datetime-local" dir="ltr" />
          )}
        </FormField>
        <FormField label={t.form.closesAt} error={errors.closesAt?.message} required>
          {(control) => (
            <Input {...control} {...form.register('closesAt')} type="datetime-local" dir="ltr" />
          )}
        </FormField>
        <FormField label={t.form.duration} error={errors.durationMinutes?.message} required>
          {(control) => (
            <Input
              {...control}
              {...form.register('durationMinutes')}
              inputMode="numeric"
              dir="ltr"
              className="tabular"
            />
          )}
        </FormField>
        <div className="flex items-end">
          <Controller
            control={form.control}
            name="showAnswersAfterClose"
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                label={t.form.showAnswers}
              />
            )}
          />
        </div>
      </FormSection>

      <FormSection title={t.form.questions} description={t.form.questionsHint} columns={1}>
        <Controller
          control={form.control}
          name="questions"
          render={({ field }) => {
            const selected = new Map(field.value.map((item) => [item.questionId, item]));
            const totalPoints = field.value.reduce((sum, item) => sum + item.points, 0);
            const toggle = (questionId: string, text: string, checked: boolean) =>
              field.onChange(
                checked
                  ? [...field.value, { questionId, text, points: 1 }]
                  : field.value.filter((item) => item.questionId !== questionId),
              );
            return (
              <div className="flex flex-col gap-4">
                <p
                  className={
                    errors.questions
                      ? 'text-sm font-medium text-danger'
                      : 'text-sm font-medium text-muted'
                  }
                >
                  {errors.questions?.message ??
                    errors.questions?.root?.message ??
                    t.form.selected(field.value.length, totalPoints)}
                </p>

                {field.value.length ? (
                  <ol className="flex flex-col gap-2">
                    {field.value.map((item, index) => (
                      <li
                        key={item.questionId}
                        className="flex items-center gap-3 rounded-md border border-line bg-canvas p-3"
                      >
                        <span className="text-sm text-muted tabular">{index + 1}.</span>
                        <p className="line-clamp-2 flex-1 text-sm text-ink">{item.text || '—'}</p>
                        <label className="flex items-center gap-2 text-sm text-muted">
                          {t.form.points}
                          <Input
                            type="number"
                            min={0.5}
                            max={100}
                            step={0.5}
                            dir="ltr"
                            className="w-20 tabular"
                            value={item.points}
                            onChange={(event) => {
                              const points = Number(event.target.value) || 1;
                              field.onChange(
                                field.value.map((entry) =>
                                  entry.questionId === item.questionId
                                    ? { ...entry, points }
                                    : entry,
                                ),
                              );
                            }}
                          />
                        </label>
                        <Checkbox
                          checked
                          onCheckedChange={() => toggle(item.questionId, item.text, false)}
                          aria-label={ar.common.delete}
                        />
                      </li>
                    ))}
                  </ol>
                ) : null}

                <div className="flex flex-wrap items-center gap-3 border-t border-dashed border-line pt-4">
                  <SearchInput
                    value={search}
                    onSearch={setSearch}
                    placeholder={ar.questions.searchPlaceholder}
                    className="w-full max-w-sm"
                  />
                  <div className="w-full sm:w-56">
                    <Select
                      aria-label={ar.questions.columns.unit}
                      value={unitId}
                      onValueChange={setUnitId}
                      options={[
                        { value: ALL, label: ar.questions.allUnits },
                        ...(units.data ?? []).map((unit) => ({ value: unit.id, label: unit.name })),
                      ]}
                    />
                  </div>
                </div>
                {bank.isLoading ? (
                  <Skeleton className="h-40 w-full rounded-md" />
                ) : (
                  <ul className="flex max-h-96 flex-col gap-1 overflow-y-auto">
                    {(bank.data?.items ?? []).map((question) => (
                      <li key={question.id} className="rounded-md px-2 py-1 hover:bg-canvas">
                        <Checkbox
                          checked={selected.has(question.id)}
                          onCheckedChange={(checked) => toggle(question.id, question.text, checked)}
                          label={
                            <span className="text-sm">
                              {question.text}{' '}
                              <span className="text-xs text-muted">
                                · {ar.questions.types[question.type] ?? question.type} ·{' '}
                                {ar.questions.difficulties[question.difficulty] ??
                                  question.difficulty}
                              </span>
                            </span>
                          }
                        />
                      </li>
                    ))}
                    {bank.data && !bank.data.items.length ? (
                      <li className="p-3 text-sm text-muted">{ar.questions.empty}</li>
                    ) : null}
                  </ul>
                )}
              </div>
            );
          }}
        />
      </FormSection>
    </FormPage>
  );
}
