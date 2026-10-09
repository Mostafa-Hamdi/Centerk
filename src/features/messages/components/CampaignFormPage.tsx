'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from '@/components/feedback/toast';
import { FormActions } from '@/components/form/FormActions';
import { FormField } from '@/components/form/FormField';
import { FormPage } from '@/components/form/FormPage';
import { FormSection } from '@/components/form/FormSection';
import { Combobox } from '@/components/ui/Combobox';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Textarea } from '@/components/ui/Textarea';
import { routes } from '@/config/routes';
import { useGetStudentsQuery } from '@/features/students/api';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { toProblem } from '@/lib/problem-details';
import { CHANNELS, useGetCampaignQuery, useSaveCampaignMutation } from '../api';

const t = ar.messages.campaigns;
const v = ar.validation;

/** Swagger CampaignRequest; scheduledAt is a local datetime turned into UTC ISO (…Z). */
const campaignSchema = z.object({
  title: z.string().trim().min(2, v.required).max(150, v.tooLong(150)),
  body: z.string().trim().min(1, v.required).max(1000, v.tooLong(1000)),
  channel: z.enum(CHANNELS),
  scheduledAt: z.string(),
  students: z.array(z.object({ id: z.string(), label: z.string() })).min(1, t.form.noRecipients),
});

type CampaignValues = z.infer<typeof campaignSchema>;

/** ISO (UTC) → value for <input type="datetime-local"> in local time. */
const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

/** /messages/campaigns/new and /messages/campaigns/[id]/edit. */
export function CampaignFormPage({ id }: { id?: string }) {
  const router = useRouter();
  const campaign = useGetCampaignQuery(id ?? '', { skip: !id });
  const [saveCampaign] = useSaveCampaignMutation();
  const [search, setSearch] = useState('');
  const students = useGetStudentsQuery({ search, page: 1, pageSize: 20, filters: {} });
  const form = useForm<CampaignValues>({
    resolver: zodResolver(campaignSchema),
    mode: 'onBlur',
    defaultValues: { title: '', body: '', channel: 'WhatsApp', scheduledAt: '', students: [] },
  });
  const { errors, isSubmitting, isDirty, isSubmitSuccessful } = form.formState;

  useEffect(() => {
    const data = campaign.data;
    if (!data) return;
    form.reset({
      title: data.title,
      body: data.body,
      channel: CHANNELS.find((channel) => channel === data.channel) ?? 'WhatsApp',
      scheduledAt: toLocalInput(data.scheduledAt),
      // The API returns ids only; names show once the student appears in a search.
      students: data.studentIds.map((studentId) => ({
        id: studentId,
        label: studentId.slice(0, 8),
      })),
    });
  }, [campaign.data, form]);

  if (id && campaign.error)
    return <ErrorState title={ar.list.loadError} onRetry={() => void campaign.refetch()} />;
  if (id && !campaign.data)
    return <Skeleton className="mx-auto h-[28rem] w-full max-w-5xl rounded-xl" />;

  const save = async (values: CampaignValues) => {
    try {
      await saveCampaign({
        id,
        title: values.title,
        body: values.body,
        channel: values.channel,
        studentIds: values.students.map((student) => student.id),
        scheduledAtUtc: values.scheduledAt ? new Date(values.scheduledAt).toISOString() : null,
      }).unwrap();
      toast.success(id ? t.form.updated : t.form.created, values.title);
      router.replace(routes.campaigns.list);
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['title', 'body', 'channel', 'scheduledAt']);
      toast.error(problem.title, problem.detail);
      throw caught;
    }
  };

  return (
    <FormPage
      title={id ? t.form.editTitle : t.form.addTitle}
      backHref={routes.campaigns.list}
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
          cancelHref={routes.campaigns.list}
          submitting={isSubmitting || isSubmitSuccessful}
          dirty={isDirty && !isSubmitSuccessful}
        />
      }
    >
      <FormSection title={t.form.content}>
        <FormField label={t.form.title} error={errors.title?.message} required>
          {(control) => <Input {...control} {...form.register('title')} />}
        </FormField>
        <FormField label={t.form.channel} error={errors.channel?.message} required>
          {(control) => (
            <Controller
              control={form.control}
              name="channel"
              render={({ field }) => (
                <Select
                  {...control}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={CHANNELS.map((channel) => ({
                    value: channel,
                    label: ar.messages.channels[channel] ?? channel,
                  }))}
                />
              )}
            />
          )}
        </FormField>
        <FormField
          label={t.form.body}
          hint={t.form.bodyHint}
          error={errors.body?.message}
          required
          className="md:col-span-2"
        >
          {(control) => <Textarea {...control} {...form.register('body')} rows={5} />}
        </FormField>
        <FormField label={t.form.scheduledAt} error={errors.scheduledAt?.message}>
          {(control) => (
            <Input {...control} {...form.register('scheduledAt')} type="datetime-local" dir="ltr" />
          )}
        </FormField>
      </FormSection>

      <FormSection title={t.form.recipients} columns={1}>
        <Controller
          control={form.control}
          name="students"
          render={({ field }) => (
            <div className="flex flex-col gap-3">
              <FormField
                label={t.form.addStudent}
                error={errors.students?.message ?? errors.students?.root?.message}
                required
              >
                {(control) => (
                  <Combobox
                    {...control}
                    value={undefined}
                    onValueChange={(value) => {
                      const student = students.data?.items.find((item) => item.id === value);
                      if (!student || field.value.some((item) => item.id === student.id)) return;
                      field.onChange([
                        ...field.value,
                        { id: student.id, label: `${student.fullName} · ${student.code}` },
                      ]);
                    }}
                    onSearch={setSearch}
                    loading={students.isFetching}
                    placeholder={ar.payments.form.studentPlaceholder}
                    options={(students.data?.items ?? []).map((student) => ({
                      value: student.id,
                      label: `${student.fullName} · ${student.code}`,
                    }))}
                  />
                )}
              </FormField>
              <p className="text-sm font-medium text-muted">
                {t.form.selected(field.value.length)}
              </p>
              {field.value.length ? (
                <ul className="flex flex-wrap gap-2">
                  {field.value.map((student) => (
                    <li
                      key={student.id}
                      className="flex items-center gap-1 rounded-full bg-primary-tint py-1 ps-3 pe-1 text-sm text-primary"
                    >
                      {student.label}
                      <button
                        type="button"
                        aria-label={`${t.form.remove} ${student.label}`}
                        className="flex size-6 items-center justify-center rounded-full hover:bg-surface"
                        onClick={() =>
                          field.onChange(field.value.filter((item) => item.id !== student.id))
                        }
                      >
                        <X className="size-3.5" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        />
      </FormSection>
    </FormPage>
  );
}
