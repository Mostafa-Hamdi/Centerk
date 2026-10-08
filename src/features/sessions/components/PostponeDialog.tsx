'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarClock } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from '@/components/feedback/toast';
import { FormField } from '@/components/form/FormField';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { ar } from '@/i18n/ar';
import { toProblem } from '@/lib/problem-details';
import { usePostponeSessionMutation, type SessionDto } from '../api';

const t = ar.sessions;

/** Swagger PostponeSessionRequest: reason (≤500) required; new start must be in the future. */
const postponeSchema = z
  .object({
    date: z.string().min(1, ar.validation.required),
    time: z.string().regex(/^\d{2}:\d{2}$/, ar.validation.required),
    reason: z
      .string()
      .trim()
      .min(1, ar.confirm.reasonRequired)
      .max(500, ar.validation.tooLong(500)),
    notify: z.boolean(),
  })
  .refine((value) => new Date(`${value.date}T${value.time}:00+03:00`).getTime() > Date.now(), {
    path: ['date'],
    message: t.pastDate,
  });

type PostponeInput = z.input<typeof postponeSchema>;

interface PostponeDialogProps {
  session: SessionDto | null;
  onClose: () => void;
}

/** Postpone a session to a new Cairo date/time with a mandatory reason (audited by the backend). */
export function PostponeDialog({ session, onClose }: PostponeDialogProps) {
  const [postpone] = usePostponeSessionMutation();
  const form = useForm<PostponeInput>({
    resolver: zodResolver(postponeSchema),
    defaultValues: { date: '', time: '', reason: '', notify: true },
  });
  const { errors, isSubmitting } = form.formState;

  useEffect(() => {
    if (session) form.reset({ date: '', time: '', reason: '', notify: true });
  }, [session, form]);

  const submit = form.handleSubmit(async (values) => {
    if (!session) return;
    try {
      await postpone({
        id: session.id,
        startsAtUtc: new Date(`${values.date}T${values.time}:00+03:00`).toISOString(),
        reason: values.reason.trim(),
        notify: values.notify,
      }).unwrap();
      toast.success(t.postponed, session.groupName);
      onClose();
    } catch (caught) {
      toast.error(toProblem(caught).title);
    }
  });

  return (
    <Dialog.Root
      open={session !== null}
      onOpenChange={(open) => !open && !isSubmitting && onClose()}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 animate-rise rounded-xl border border-line bg-surface p-6 shadow-lift"
        >
          <span className="mb-4 flex size-12 items-center justify-center rounded-lg bg-warning-tint text-warning">
            <CalendarClock className="size-6" aria-hidden />
          </span>
          <Dialog.Title className="font-display text-xl font-bold text-ink">
            {t.postponeTitle}
          </Dialog.Title>
          <p className="mt-1 text-sm text-muted">{session?.groupName}</p>
          <form
            noValidate
            onSubmit={(event) => void submit(event)}
            className="mt-5 grid grid-cols-2 gap-4"
          >
            <FormField label={t.newDate} error={errors.date?.message} required>
              {(control) => (
                <Controller
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <DatePicker {...control} value={field.value} onChange={field.onChange} />
                  )}
                />
              )}
            </FormField>
            <FormField label={t.newTime} error={errors.time?.message} required>
              {(control) => (
                <Controller
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <DatePicker
                      {...control}
                      mode="time"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              )}
            </FormField>
            <FormField
              label={t.reason}
              error={errors.reason?.message}
              required
              className="col-span-2"
            >
              {(control) => <Textarea {...control} {...form.register('reason')} rows={3} />}
            </FormField>
            <div className="col-span-2">
              <Controller
                control={form.control}
                name="notify"
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} label={t.notify} />
                )}
              />
            </div>
            <div className="col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Dialog.Close asChild>
                <Button variant="neutral" disabled={isSubmitting}>
                  {ar.common.cancel}
                </Button>
              </Dialog.Close>
              <Button type="submit" variant="warning" loading={isSubmitting}>
                {t.postpone}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
