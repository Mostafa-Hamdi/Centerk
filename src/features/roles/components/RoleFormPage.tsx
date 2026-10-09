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
import { Checkbox } from '@/components/ui/Checkbox';
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
  BASE_ROLES,
  useGetPermissionCatalogueQuery,
  useGetRoleQuery,
  useSaveRoleMutation,
} from '../api';

const t = ar.roles;
const v = ar.validation;

/** "students" / "Students" → Arabic module label; "payments.void" → action label. */
const moduleLabel = (module: string) =>
  t.modules[module] ?? t.modules[module.charAt(0).toLowerCase() + module.slice(1)] ?? module;
const actionLabel = (code: string, action: string) => {
  const key = action || code.split('.').pop() || code;
  return t.actions[key] ?? t.actions[key.charAt(0).toLowerCase() + key.slice(1)] ?? key;
};

/** Swagger RoleRequest — permissions are the full code list. */
const roleSchema = z.object({
  name: z.string().trim().min(2, v.required).max(100, v.tooLong(100)),
  description: z.string().trim().max(300, v.tooLong(300)),
  baseRole: z.enum(BASE_ROLES),
  isActive: z.boolean(),
  codes: z.array(z.string()).min(1, t.form.noPermissions),
});

type RoleValues = z.infer<typeof roleSchema>;

/** /roles/new and /roles/[id]/edit — name, base role and the permission matrix. */
export function RoleFormPage({ id }: { id?: string }) {
  const router = useRouter();
  const role = useGetRoleQuery(id ?? '', { skip: !id });
  const catalogue = useGetPermissionCatalogueQuery(undefined);
  const [saveRole] = useSaveRoleMutation();
  const form = useForm<RoleValues>({
    resolver: zodResolver(roleSchema),
    mode: 'onBlur',
    defaultValues: { name: '', description: '', baseRole: 'Assistant', isActive: true, codes: [] },
  });
  const { errors, isSubmitting, isDirty, isSubmitSuccessful } = form.formState;

  useEffect(() => {
    const data = role.data;
    if (!data) return;
    form.reset({
      name: data.name,
      description: data.description ?? '',
      baseRole: BASE_ROLES.find((value) => value === data.baseRole) ?? 'Assistant',
      isActive: data.isActive,
      codes: data.codes,
    });
  }, [role.data, form]);

  if (id && role.error)
    return <ErrorState title={ar.list.loadError} onRetry={() => void role.refetch()} />;
  if (id && !role.data)
    return <Skeleton className="mx-auto h-[28rem] w-full max-w-5xl rounded-xl" />;

  const save = async (values: RoleValues) => {
    try {
      await saveRole({ id, ...values, description: values.description || null }).unwrap();
      toast.success(id ? t.form.updated : t.form.created, values.name);
      router.replace(routes.roles.list);
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, ['name', 'description', 'baseRole', 'codes']);
      toast.error(problem.title, problem.detail);
      throw caught;
    }
  };

  const total = (catalogue.data ?? []).reduce((sum, group) => sum + group.permissions.length, 0);

  return (
    <FormPage
      title={id ? t.form.editTitle : t.form.addTitle}
      backHref={routes.roles.list}
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
          cancelHref={routes.roles.list}
          submitting={isSubmitting || isSubmitSuccessful}
          dirty={isDirty && !isSubmitSuccessful}
        />
      }
    >
      <FormSection title={t.form.basics}>
        <FormField label={t.form.name} error={errors.name?.message} required>
          {(control) => <Input {...control} {...form.register('name')} />}
        </FormField>
        <FormField label={t.form.baseRole} error={errors.baseRole?.message} required>
          {(control) => (
            <Controller
              control={form.control}
              name="baseRole"
              render={({ field }) => (
                <Select
                  {...control}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={BASE_ROLES.map((value) => ({
                    value,
                    label: ar.staff.roles[value] ?? value,
                  }))}
                />
              )}
            />
          )}
        </FormField>
        <FormField
          label={t.form.description}
          error={errors.description?.message}
          className="md:col-span-2"
        >
          {(control) => <Input {...control} {...form.register('description')} />}
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

      <FormSection title={t.form.permissions} description={t.form.permissionsHint} columns={1}>
        <Controller
          control={form.control}
          name="codes"
          render={({ field }) => {
            const selected = new Set(field.value);
            const set = (codes: string[], checked: boolean) => {
              const next = new Set(selected);
              for (const code of codes) {
                if (checked) next.add(code);
                else next.delete(code);
              }
              field.onChange([...next]);
            };
            return (
              <div className="flex flex-col gap-3">
                <p
                  className={
                    errors.codes ? 'text-sm font-medium text-danger' : 'text-sm text-muted'
                  }
                >
                  {errors.codes?.message ?? t.form.selected(selected.size, total)}
                </p>
                {catalogue.isLoading ? (
                  <Skeleton className="h-64 w-full rounded-md" />
                ) : (
                  <div className="grid gap-3 lg:grid-cols-2">
                    {(catalogue.data ?? []).map((group) => {
                      const codes = group.permissions.map((permission) => permission.code);
                      const count = codes.filter((code) => selected.has(code)).length;
                      return (
                        <fieldset
                          key={group.module}
                          className="rounded-md border border-line bg-canvas p-4"
                        >
                          <legend className="sr-only">{moduleLabel(group.module)}</legend>
                          <div className="mb-3 flex items-center justify-between gap-2 border-b border-line pb-2">
                            <span className="font-semibold text-ink">
                              {moduleLabel(group.module)}
                            </span>
                            <Checkbox
                              checked={count === codes.length}
                              onCheckedChange={(checked) => set(codes, checked)}
                              label={
                                <span className="text-xs text-muted">
                                  {t.form.selectAll} ({t.form.selected(count, codes.length)})
                                </span>
                              }
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                            {group.permissions.map((permission) => (
                              <Checkbox
                                key={permission.code}
                                checked={selected.has(permission.code)}
                                onCheckedChange={(checked) => set([permission.code], checked)}
                                label={
                                  <span className="text-sm" title={permission.code}>
                                    {actionLabel(permission.code, permission.action)}
                                  </span>
                                }
                              />
                            ))}
                          </div>
                        </fieldset>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }}
        />
      </FormSection>
    </FormPage>
  );
}
