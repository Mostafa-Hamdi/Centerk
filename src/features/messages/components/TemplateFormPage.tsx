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
import { Textarea } from '@/components/ui/Textarea';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { toProblem } from '@/lib/problem-details';
import {
  CHANNELS,
  LANGUAGES,
  TEMPLATE_TYPES,
  useGetTemplateQuery,
  useSaveTemplateMutation,
} from '../api';

const t = ar.messages.templates;
const v = ar.validation;

/** Swagger TemplateRequest. */
const templateSchema = z.object({
  name: z.string().trim().min(2, v.required).max(100, v.tooLong(100)),
  type: z.enum(TEMPLATE_TYPES),
  channel: z.enum(CHANNELS),
  language: z.enum(LANGUAGES),
  body: z.string().trim().min(1, v.required).max(1000, v.tooLong(1000)),
  whatsAppTemplateName: z.string().trim().max(100, v.tooLong(100)),
  isActive: z.boolean(),
});

type TemplateValues = z.infer<typeof templateSchema>;

/** /messages/templates/new and /messages/templates/[id]/edit. */
export function TemplateFormPage({ id }: { id?: string }) {
  const router = useRouter();
  const template = useGetTemplateQuery(id ?? '', { skip: !id });
  const [saveTemplate] = useSaveTemplateMutation();
  const form = useForm<TemplateValues>({
    resolver: zodResolver(templateSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      type: 'General',
      channel: 'WhatsApp',
      language: 'ar',
      body: '',
      whatsAppTemplateName: '',
      isActive: true,
    },
  });
  const { errors, isSubmitting, isDirty, isSubmitSuccessful } = form.formState;

  useEffect(() => {
    const data = template.data;
    if (!data) return;
    form.reset({
      name: data.name,
      type: TEMPLATE_TYPES.find((type) => type === data.type) ?? 'General',
      channel: CHANNELS.find((channel) => channel === data.channel) ?? 'WhatsApp',
      language: LANGUAGES.find((language) => language === data.language) ?? 'ar',
      body: data.body,
      whatsAppTemplateName: data.whatsAppTemplateName ?? '',
      isActive: data.isActive,
    });
  }, [template.data, form]);

  if (id && template.error)
    return <ErrorState title={ar.list.loadError} onRetry={() => void template.refetch()} />;
  if (id && !template.data)
    return <Skeleton className="mx-auto h-[28rem] w-full max-w-5xl rounded-xl" />;

  const save = async (values: TemplateValues) => {
    try {
      await saveTemplate({
        id,
        ...values,
        whatsAppTemplateName: values.whatsAppTemplateName || null,
      }).unwrap();
      toast.success(id ? t.form.updated : t.form.created, values.name);
      router.replace(routes.messageTemplates.list);
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, [
        'name',
        'type',
        'channel',
        'language',
        'body',
        'whatsAppTemplateName',
      ]);
      toast.error(problem.title, problem.detail);
      throw caught;
    }
  };

  const selects = [
    { name: 'type', label: t.form.type, values: TEMPLATE_TYPES, labels: t.types },
    { name: 'channel', label: t.form.channel, values: CHANNELS, labels: ar.messages.channels },
    { name: 'language', label: t.form.language, values: LANGUAGES, labels: t.languages },
  ] as const;

  return (
    <FormPage
      title={id ? t.form.editTitle : t.form.addTitle}
      backHref={routes.messageTemplates.list}
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
          cancelHref={routes.messageTemplates.list}
          submitting={isSubmitting || isSubmitSuccessful}
          dirty={isDirty && !isSubmitSuccessful}
        />
      }
    >
      <FormSection title={t.form.basics}>
        <FormField label={t.form.name} error={errors.name?.message} required>
          {(control) => <Input {...control} {...form.register('name')} />}
        </FormField>
        {selects.map((select) => (
          <FormField
            key={select.name}
            label={select.label}
            error={errors[select.name]?.message}
            required
          >
            {(control) => (
              <Controller
                control={form.control}
                name={select.name}
                render={({ field }) => (
                  <Select
                    {...control}
                    value={field.value}
                    onValueChange={field.onChange}
                    options={select.values.map((value) => ({
                      value,
                      label: select.labels[value] ?? value,
                    }))}
                  />
                )}
              />
            )}
          </FormField>
        ))}
        <FormField
          label={t.form.body}
          hint={t.form.bodyHint}
          error={errors.body?.message}
          required
          className="md:col-span-2"
        >
          {(control) => <Textarea {...control} {...form.register('body')} rows={5} />}
        </FormField>
        <FormField label={t.form.waName} error={errors.whatsAppTemplateName?.message}>
          {(control) => <Input {...control} {...form.register('whatsAppTemplateName')} dir="ltr" />}
        </FormField>
        <div className="flex items-end">
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
