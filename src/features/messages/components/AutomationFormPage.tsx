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
import { Switch } from '@/components/ui/Switch';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { toProblem } from '@/lib/problem-details';
import {
  AUTOMATION_EVENTS,
  AUTOMATION_TIMINGS,
  useGetAutomationRuleQuery,
  useGetTemplatesQuery,
  useSaveAutomationRuleMutation,
} from '../api';

const t = ar.messages.automation;
const v = ar.validation;

/** Swagger AutomationRequest. */
const ruleSchema = z.object({
  name: z.string().trim().min(2, v.required).max(100, v.tooLong(100)),
  event: z.enum(AUTOMATION_EVENTS),
  templateId: z.string().min(1, v.required),
  timing: z.enum(AUTOMATION_TIMINGS),
  isActive: z.boolean(),
});

type RuleValues = z.infer<typeof ruleSchema>;

/** /messages/automation/new and /messages/automation/[id]/edit. */
export function AutomationFormPage({ id }: { id?: string }) {
  const router = useRouter();
  const rule = useGetAutomationRuleQuery(id ?? '', { skip: !id });
  const templates = useGetTemplatesQuery({ page: 1, pageSize: 100, filters: {} });
  const [saveRule] = useSaveAutomationRuleMutation();
  const form = useForm<RuleValues>({
    resolver: zodResolver(ruleSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      event: 'SessionClosedAbsent',
      templateId: '',
      timing: 'Immediate',
      isActive: true,
    },
  });
  const { errors, isSubmitting, isDirty, isSubmitSuccessful } = form.formState;

  useEffect(() => {
    const data = rule.data;
    if (!data) return;
    form.reset({
      name: data.name,
      event: AUTOMATION_EVENTS.find((event) => event === data.event) ?? 'SessionClosedAbsent',
      templateId: data.templateId ?? '',
      timing: AUTOMATION_TIMINGS.find((timing) => timing === data.timing) ?? 'Immediate',
      isActive: data.isActive,
    });
  }, [rule.data, form]);

  if (id && rule.error)
    return <ErrorState title={ar.list.loadError} onRetry={() => void rule.refetch()} />;
  if (id && !rule.data)
    return <Skeleton className="mx-auto h-[28rem] w-full max-w-5xl rounded-xl" />;

  const save = async (values: RuleValues) => {
    try {
      await saveRule({ id, ...values }).unwrap();
      toast.success(id ? t.form.updated : t.form.created, values.name);
      router.replace(routes.automationRules.list);
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, [
        'name',
        'event',
        'templateId',
        'timing',
        'isActive',
      ]);
      toast.error(problem.title, problem.detail);
      throw caught;
    }
  };

  return (
    <FormPage
      title={id ? t.form.editTitle : t.form.addTitle}
      backHref={routes.automationRules.list}
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
          cancelHref={routes.automationRules.list}
          submitting={isSubmitting || isSubmitSuccessful}
          dirty={isDirty && !isSubmitSuccessful}
        />
      }
    >
      <FormSection title={t.form.basics}>
        <FormField label={t.form.name} error={errors.name?.message} required>
          {(control) => <Input {...control} {...form.register('name')} />}
        </FormField>
        <FormField label={t.form.event} error={errors.event?.message} required>
          {(control) => (
            <Controller
              control={form.control}
              name="event"
              render={({ field }) => (
                <Select
                  {...control}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={AUTOMATION_EVENTS.map((event) => ({
                    value: event,
                    label: t.events[event] ?? event,
                  }))}
                />
              )}
            />
          )}
        </FormField>
        <FormField label={t.form.template} error={errors.templateId?.message} required>
          {(control) => (
            <Controller
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <Select
                  {...control}
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  placeholder={t.form.templatePlaceholder}
                  options={(templates.data?.items ?? [])
                    .filter((template) => template.isActive)
                    .map((template) => ({ value: template.id, label: template.name }))}
                />
              )}
            />
          )}
        </FormField>
        <FormField label={t.form.timing} error={errors.timing?.message} required>
          {(control) => (
            <Controller
              control={form.control}
              name="timing"
              render={({ field }) => (
                <Select
                  {...control}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={AUTOMATION_TIMINGS.map((timing) => ({
                    value: timing,
                    label: t.timings[timing] ?? timing,
                  }))}
                />
              )}
            />
          )}
        </FormField>
        <div className="md:col-span-2">
          <Controller
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                label={t.form.active}
              />
            )}
          />
        </div>
      </FormSection>
    </FormPage>
  );
}
