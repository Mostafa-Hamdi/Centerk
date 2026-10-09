'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from '@/components/feedback/toast';
import { FormActions } from '@/components/form/FormActions';
import { FormField } from '@/components/form/FormField';
import { FormPage } from '@/components/form/FormPage';
import { FormSection } from '@/components/form/FormSection';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Textarea } from '@/components/ui/Textarea';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { toProblem } from '@/lib/problem-details';
import {
  DIFFICULTIES,
  QUESTION_TYPES,
  useGetLessonsQuery,
  useGetQuestionQuery,
  useGetUnitsQuery,
  useSaveQuestionMutation,
  type QuestionOption,
} from '../api';

const t = ar.questions;
const v = ar.validation;
const MCQ_LABELS = ['A', 'B', 'C', 'D'] as const;
const NO_LESSON = 'none';

const trueFalseOptions = (): QuestionOption[] => [
  { label: 'True', text: t.form.true },
  { label: 'False', text: t.form.false },
];

/** Swagger QuestionRequest — MCQ: up to 4 options (≥2 filled) + correct label; T/F: True/False. */
const questionSchema = z
  .object({
    unitId: z.string().min(1, v.required),
    lessonId: z.string(),
    type: z.enum(QUESTION_TYPES),
    difficulty: z.enum(DIFFICULTIES),
    text: z.string().trim().min(3, v.required).max(2000, v.tooLong(2000)),
    explanation: z.string().trim().max(2000, v.tooLong(2000)),
    options: z.array(z.string().trim().max(500, v.tooLong(500))).length(4),
    correctLabel: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.type === 'Mcq') {
      const filled = value.options.filter(Boolean).length;
      if (filled < 2)
        ctx.addIssue({ code: 'custom', path: ['options'], message: t.form.minOptions });
      const index = MCQ_LABELS.findIndex((label) => label === value.correctLabel);
      if (index < 0 || !value.options[index]) {
        ctx.addIssue({ code: 'custom', path: ['correctLabel'], message: t.form.correctMissing });
      }
    }
    if (value.type === 'TrueFalse' && !['True', 'False'].includes(value.correctLabel)) {
      ctx.addIssue({ code: 'custom', path: ['correctLabel'], message: v.required });
    }
  });

type QuestionValues = z.infer<typeof questionSchema>;

/** /question-bank/new and /question-bank/[id]/edit. */
export function QuestionFormPage({ id }: { id?: string }) {
  const router = useRouter();
  const question = useGetQuestionQuery(id ?? '', { skip: !id });
  const units = useGetUnitsQuery(undefined);
  const lessons = useGetLessonsQuery(undefined);
  const [saveQuestion] = useSaveQuestionMutation();
  const form = useForm<QuestionValues>({
    resolver: zodResolver(questionSchema),
    mode: 'onBlur',
    defaultValues: {
      unitId: '',
      lessonId: NO_LESSON,
      type: 'Mcq',
      difficulty: 'Medium',
      text: '',
      explanation: '',
      options: ['', '', '', ''],
      correctLabel: '',
    },
  });
  const { errors, isSubmitting, isDirty, isSubmitSuccessful } = form.formState;
  const type = form.watch('type');
  const unitId = form.watch('unitId');

  useEffect(() => {
    const data = question.data;
    if (!data) return;
    const options = MCQ_LABELS.map(
      (label) => data.options.find((option) => option.label === label)?.text ?? '',
    );
    form.reset({
      unitId: data.unitId ?? '',
      lessonId: data.lessonId ?? NO_LESSON,
      type: QUESTION_TYPES.find((value) => value === data.type) ?? 'Mcq',
      difficulty: DIFFICULTIES.find((value) => value === data.difficulty) ?? 'Medium',
      text: data.text,
      explanation: data.explanation ?? '',
      options,
      correctLabel: data.correctLabel ?? '',
    });
  }, [question.data, form]);

  if (id && question.error)
    return <ErrorState title={ar.list.loadError} onRetry={() => void question.refetch()} />;
  if (id && !question.data)
    return <Skeleton className="mx-auto h-[28rem] w-full max-w-5xl rounded-xl" />;

  const save = async (values: QuestionValues) => {
    const options =
      values.type === 'Mcq'
        ? MCQ_LABELS.flatMap((label, index) =>
            values.options[index] ? [{ label, text: values.options[index] }] : [],
          )
        : values.type === 'TrueFalse'
          ? trueFalseOptions()
          : [];
    try {
      await saveQuestion({
        id,
        unitId: values.unitId,
        lessonId: values.lessonId === NO_LESSON ? null : values.lessonId,
        type: values.type,
        difficulty: values.difficulty,
        text: values.text,
        explanation: values.explanation || null,
        options,
        correctLabel: values.type === 'Essay' ? null : values.correctLabel,
      }).unwrap();
      toast.success(id ? t.form.updated : t.form.created);
      router.replace(routes.questions.list);
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, [
        'unitId',
        'lessonId',
        'type',
        'difficulty',
        'text',
        'explanation',
        'correctLabel',
      ]);
      toast.error(problem.title, problem.detail);
      throw caught;
    }
  };

  const unitLessons = (lessons.data ?? []).filter((lesson) => lesson.unitId === unitId);
  const filledLabels = MCQ_LABELS.filter((_label, index) => form.watch(`options.${index}`));

  return (
    <FormPage
      title={id ? t.form.editTitle : t.form.addTitle}
      description={units.data && !units.data.length ? t.units.none : undefined}
      backHref={routes.questions.list}
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
          cancelHref={routes.questions.list}
          submitting={isSubmitting || isSubmitSuccessful}
          dirty={isDirty && !isSubmitSuccessful}
        />
      }
    >
      <FormSection title={t.form.placement}>
        <FormField label={t.form.unit} error={errors.unitId?.message} required>
          {(control) => (
            <Controller
              control={form.control}
              name="unitId"
              render={({ field }) => (
                <Select
                  {...control}
                  value={field.value || undefined}
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue('lessonId', NO_LESSON);
                  }}
                  placeholder={t.form.unitPlaceholder}
                  options={(units.data ?? []).map((unit) => ({ value: unit.id, label: unit.name }))}
                />
              )}
            />
          )}
        </FormField>
        <FormField label={t.form.lesson} error={errors.lessonId?.message}>
          {(control) => (
            <Controller
              control={form.control}
              name="lessonId"
              render={({ field }) => (
                <Select
                  {...control}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!unitId}
                  options={[
                    { value: NO_LESSON, label: t.form.noLesson },
                    ...unitLessons.map((lesson) => ({ value: lesson.id, label: lesson.name })),
                  ]}
                />
              )}
            />
          )}
        </FormField>
        <FormField label={t.form.type} error={errors.type?.message} required>
          {(control) => (
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <Select
                  {...control}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue('correctLabel', '');
                  }}
                  options={QUESTION_TYPES.map((value) => ({
                    value,
                    label: t.types[value] ?? value,
                  }))}
                />
              )}
            />
          )}
        </FormField>
        <FormField label={t.form.difficulty} error={errors.difficulty?.message} required>
          {(control) => (
            <Controller
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <Select
                  {...control}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={DIFFICULTIES.map((value) => ({
                    value,
                    label: t.difficulties[value] ?? value,
                  }))}
                />
              )}
            />
          )}
        </FormField>
      </FormSection>

      <FormSection title={t.form.content}>
        <FormField
          label={t.form.text}
          error={errors.text?.message}
          required
          className="md:col-span-2"
        >
          {(control) => <Textarea {...control} {...form.register('text')} rows={3} />}
        </FormField>

        {type === 'Mcq'
          ? MCQ_LABELS.map((label, index) => (
              <FormField
                key={label}
                label={t.form.option(label)}
                error={
                  index === 0
                    ? (errors.options?.message ?? errors.options?.root?.message)
                    : undefined
                }
                required={index < 2}
              >
                {(control) => <Input {...control} {...form.register(`options.${index}`)} />}
              </FormField>
            ))
          : null}

        {type === 'Essay' ? null : (
          <FormField label={t.form.correct} error={errors.correctLabel?.message} required>
            {(control) => (
              <Controller
                control={form.control}
                name="correctLabel"
                render={({ field }) => (
                  <Select
                    {...control}
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    options={
                      type === 'TrueFalse'
                        ? trueFalseOptions().map((option) => ({
                            value: option.label,
                            label: option.text,
                          }))
                        : filledLabels.map((label) => ({
                            value: label,
                            label: t.form.option(label),
                          }))
                    }
                  />
                )}
              />
            )}
          </FormField>
        )}

        <FormField
          label={t.form.explanation}
          error={errors.explanation?.message}
          className="md:col-span-2"
        >
          {(control) => <Textarea {...control} {...form.register('explanation')} rows={2} />}
        </FormField>
      </FormSection>
    </FormPage>
  );
}
