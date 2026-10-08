'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from '@/components/feedback/toast';
import { FormActions } from '@/components/form/FormActions';
import { FormField } from '@/components/form/FormField';
import { FormPage } from '@/components/form/FormPage';
import { FormSection } from '@/components/form/FormSection';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { routes } from '@/config/routes';
import { useGetGroupsQuery } from '@/features/groups/api';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { toProblem } from '@/lib/problem-details';
import { useCreateQuizMutation } from '../api';

const t = ar.quizzes;
const v = ar.validation;

/** Swagger NewQuizV1: title required, maxScore 0–1000, group. */
const quizSchema = z.object({
  groupId: z.string().min(1, v.required),
  title: z.string().trim().min(1, v.required).max(200, v.tooLong(200)),
  maxScore: z
    .string()
    .trim()
    .min(1, v.required)
    .transform(Number)
    .pipe(z.number({ error: v.number }).positive(v.minValue(1)).max(1000, v.maxValue(1000))),
});

type QuizInput = z.input<typeof quizSchema>;
type QuizValues = z.output<typeof quizSchema>;

/** /quizzes/new — create, then go straight to the grade grid. */
export function QuizCreatePage() {
  const router = useRouter();
  const presetGroup = useSearchParams().get('groupId') ?? '';
  const groups = useGetGroupsQuery({ page: 1, pageSize: 100, filters: {} });
  const [createQuiz] = useCreateQuizMutation();
  const form = useForm<QuizInput, unknown, QuizValues>({
    resolver: zodResolver(quizSchema),
    mode: 'onBlur',
    defaultValues: { groupId: presetGroup, title: '', maxScore: '10' },
  });
  const { errors, isSubmitting, isDirty, isSubmitSuccessful } = form.formState;

  const save = async (values: QuizValues) => {
    try {
      const quiz = await createQuiz({
        groupId: values.groupId,
        title: values.title,
        maxScore: values.maxScore,
      }).unwrap();
      toast.success(t.form.created, values.title);
      router.replace(routes.quizzes.detail(quiz.id));
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['groupId', 'title', 'maxScore']);
      toast.error(problem.title, problem.detail);
      throw caught;
    }
  };

  return (
    <FormPage
      title={t.addTitle}
      backHref={routes.quizzes.list}
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
          cancelHref={routes.quizzes.list}
          submitting={isSubmitting || isSubmitSuccessful}
          dirty={isDirty && !isSubmitSuccessful}
        />
      }
    >
      <FormSection title={t.form.section}>
        <FormField
          label={t.form.group}
          error={errors.groupId?.message}
          required
          className="md:col-span-2"
        >
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
                  placeholder={t.form.groupPlaceholder}
                />
              )}
            />
          )}
        </FormField>
        <FormField label={t.form.title} error={errors.title?.message} required>
          {(control) => (
            <Input
              {...control}
              {...form.register('title')}
              placeholder={t.form.titlePlaceholder}
              autoComplete="off"
            />
          )}
        </FormField>
        <FormField label={t.form.maxScore} error={errors.maxScore?.message} required>
          {(control) => (
            <Input
              {...control}
              {...form.register('maxScore')}
              inputMode="decimal"
              dir="ltr"
              className="tabular"
            />
          )}
        </FormField>
      </FormSection>
    </FormPage>
  );
}
