'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from '@/components/feedback/toast';
import { FormField } from '@/components/form/FormField';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Switch } from '@/components/ui/Switch';
import { Can } from '@/features/auth/components/Can';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { toProblem } from '@/lib/problem-details';
import {
  useGetPoliciesQuery,
  useGetTenantProfileQuery,
  useUpdatePoliciesMutation,
  useUpdateTenantProfileMutation,
  type Policies,
} from '../api';
import { SettingsHeader } from './SettingsHeader';

const t = ar.settings;

/** /settings — center profile + operating policies. */
export function GeneralSettingsPage() {
  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <SettingsHeader />
      <div className="grid items-start gap-(--shell-gap) xl:grid-cols-2">
        <ProfileCard />
        <PoliciesCard />
      </div>
    </div>
  );
}

const profileSchema = z.object({
  name: z.string().trim().min(2, ar.validation.required).max(150, ar.validation.tooLong(150)),
});

function ProfileCard() {
  const { data, error, refetch } = useGetTenantProfileQuery(undefined);
  const [update] = useUpdateTenantProfileMutation();
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '' },
  });
  const { errors, isSubmitting, isDirty } = form.formState;

  useEffect(() => {
    if (data) form.reset({ name: data.name });
  }, [data, form]);

  if (error) return <ErrorState title={ar.list.loadError} onRetry={() => void refetch()} />;
  if (!data) return <Skeleton className="h-56 w-full rounded-xl" />;

  const save = async (values: z.infer<typeof profileSchema>) => {
    try {
      await update(values).unwrap();
      toast.success(t.profile.saved, values.name);
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['name']);
      toast.error(problem.title, problem.detail);
    }
  };

  const facts = [
    [t.profile.slug, data.slug],
    [t.profile.plan, data.plan],
    [t.profile.timeZone, data.timeZone],
  ] as const;

  return (
    <Card className="flex flex-col gap-4 p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
        <Building className="size-5 text-muted" aria-hidden />
        {t.profile.title}
      </h2>
      <form
        noValidate
        className="flex flex-wrap items-end gap-3"
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
          label={t.profile.name}
          error={errors.name?.message}
          required
          className="min-w-56 flex-1"
        >
          {(control) => <Input {...control} {...form.register('name')} />}
        </FormField>
        <Can permission="settings.update">
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            {ar.common.save}
          </Button>
        </Can>
      </form>
      <dl className="grid gap-3 sm:grid-cols-3">
        {facts.map(([label, value]) => (
          <div key={label} className="rounded-md bg-canvas p-3">
            <dt className="text-xs text-muted">{label}</dt>
            <dd dir="ltr" className="mt-1 text-start font-medium text-ink">
              {value ?? '—'}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

/** "maxConsecutiveAbsences" → "max consecutive absences" (policies come as a free-form map). */
const humanize = (key: string) => key.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();

function PoliciesCard() {
  const { data, error, refetch } = useGetPoliciesQuery(undefined);
  const [update, updating] = useUpdatePoliciesMutation();
  const [draft, setDraft] = useState<Policies | null>(null);

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  if (error) return <ErrorState title={ar.list.loadError} onRetry={() => void refetch()} />;
  if (!draft) return <Skeleton className="h-56 w-full rounded-xl" />;

  const entries = Object.entries(draft);
  const set = (key: string, value: string | number | boolean) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  const dirty = JSON.stringify(draft) !== JSON.stringify(data);

  const save = async () => {
    try {
      await update(draft).unwrap();
      toast.success(t.policies.saved);
    } catch (caught) {
      toast.error(toProblem(caught).title);
    }
  };

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div>
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <SlidersHorizontal className="size-5 text-muted" aria-hidden />
          {t.policies.title}
        </h2>
        <p className="mt-1 text-sm text-muted">{t.policies.hint}</p>
      </div>
      {entries.length ? (
        <ul className="flex flex-col divide-y divide-line">
          {entries.map(([key, value]) => (
            <li key={key} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <label htmlFor={`policy-${key}`} dir="ltr" className="text-sm font-medium text-ink">
                {humanize(key)}
              </label>
              {typeof value === 'boolean' ? (
                <Switch
                  id={`policy-${key}`}
                  checked={value}
                  onCheckedChange={(checked) => set(key, checked)}
                  label={<span className="text-sm text-muted">{t.policies.enabled}</span>}
                />
              ) : (
                <Input
                  id={`policy-${key}`}
                  dir="ltr"
                  className="w-40 tabular"
                  inputMode={typeof value === 'number' ? 'decimal' : undefined}
                  value={String(value)}
                  onChange={(event) =>
                    set(
                      key,
                      typeof value === 'number'
                        ? Number(event.target.value) || 0
                        : event.target.value,
                    )
                  }
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{t.policies.empty}</p>
      )}
      {entries.length ? (
        <Can permission="settings.update">
          <div>
            <Button loading={updating.isLoading} disabled={!dirty} onClick={() => void save()}>
              {ar.common.save}
            </Button>
          </div>
        </Can>
      ) : null}
    </Card>
  );
}
