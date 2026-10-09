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
import { useGetGradeLevelsQuery } from '@/features/lookups/api';
import { ar } from '@/i18n/ar';
import { applyServerErrors, toastInvalidForm } from '@/lib/form-errors';
import { toProblem } from '@/lib/problem-details';
import { useCreateMaterialMutation, useGetMaterialQuery, useUpdateMaterialMutation } from '../api';

const t = ar.materials;
const v = ar.validation;
const ALL_GRADES = 'all';

const numberField = (max: number, whole = false) =>
  z
    .string()
    .trim()
    .min(1, v.required)
    .transform(Number)
    .pipe(
      whole
        ? z
            .number({ error: v.number })
            .int(v.wholeNumber)
            .min(0, v.minValue(0))
            .max(max, v.maxValue(max))
        : z.number({ error: v.number }).min(0, v.minValue(0)).max(max, v.maxValue(max)),
    );

/** Swagger MaterialRequest. */
const materialSchema = z.object({
  name: z.string().trim().min(2, v.required).max(150, v.tooLong(150)),
  gradeLevelId: z.string(),
  price: numberField(100_000),
  minStockAlert: numberField(100_000, true),
  includedInSubscription: z.boolean(),
});

type MaterialFormInput = z.input<typeof materialSchema>;
type MaterialFormValues = z.output<typeof materialSchema>;

/** /materials/new and /materials/[id]/edit. */
export function MaterialFormPage({ id }: { id?: string }) {
  const router = useRouter();
  const editing = Boolean(id);
  const material = useGetMaterialQuery(id ?? '', { skip: !id });
  const grades = useGetGradeLevelsQuery(undefined);
  const [createMaterial] = useCreateMaterialMutation();
  const [updateMaterial] = useUpdateMaterialMutation();
  const form = useForm<MaterialFormInput, unknown, MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      gradeLevelId: ALL_GRADES,
      price: '',
      minStockAlert: '5',
      includedInSubscription: false,
    },
  });
  const { errors, isSubmitting, isDirty, isSubmitSuccessful } = form.formState;

  useEffect(() => {
    if (material.data) {
      form.reset({
        name: material.data.name,
        gradeLevelId: material.data.gradeLevelId ?? ALL_GRADES,
        price: String(material.data.price),
        minStockAlert: String(material.data.minStockAlert),
        includedInSubscription: material.data.includedInSubscription,
      });
    }
  }, [material.data, form]);

  if (editing && material.error) {
    return (
      <ErrorState
        title={toProblem(material.error).status === 404 ? t.details.notFound : ar.list.loadError}
        onRetry={() => void material.refetch()}
      />
    );
  }
  if (editing && !material.data)
    return <Skeleton className="mx-auto h-[28rem] w-full max-w-5xl rounded-xl" />;

  const save = async (values: MaterialFormValues) => {
    const body = {
      ...values,
      gradeLevelId: values.gradeLevelId === ALL_GRADES ? undefined : values.gradeLevelId,
    };
    try {
      const saved = id
        ? await updateMaterial({ id, ...body }).unwrap()
        : await createMaterial(body).unwrap();
      toast.success(id ? t.form.updated : t.form.created, values.name);
      router.replace(routes.materials.detail(saved.id));
    } catch (caught) {
      const problem = toProblem(caught);
      applyServerErrors(problem, form.setError, [
        'name',
        'gradeLevelId',
        'price',
        'minStockAlert',
        'includedInSubscription',
      ]);
      toast.error(problem.title, problem.detail);
      throw caught;
    }
  };

  const backHref = id ? routes.materials.detail(id) : routes.materials.list;

  return (
    <FormPage
      title={id ? t.form.editTitle : t.form.addTitle}
      backHref={backHref}
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
          cancelHref={backHref}
          submitting={isSubmitting || isSubmitSuccessful}
          dirty={isDirty && !isSubmitSuccessful}
        />
      }
    >
      <FormSection title={t.form.basics}>
        <FormField label={t.form.name} error={errors.name?.message} required>
          {(control) => <Input {...control} {...form.register('name')} />}
        </FormField>
        <FormField label={t.form.grade} error={errors.gradeLevelId?.message}>
          {(control) => (
            <Controller
              control={form.control}
              name="gradeLevelId"
              render={({ field }) => (
                <Select
                  {...control}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={[
                    { value: ALL_GRADES, label: t.form.gradePlaceholder },
                    ...(grades.data ?? []).map((grade) => ({ value: grade.id, label: grade.name })),
                  ]}
                />
              )}
            />
          )}
        </FormField>
        <FormField label={t.form.price} error={errors.price?.message} required>
          {(control) => (
            <Input
              {...control}
              {...form.register('price')}
              inputMode="decimal"
              dir="ltr"
              className="tabular"
            />
          )}
        </FormField>
        <FormField label={t.form.minStock} error={errors.minStockAlert?.message} required>
          {(control) => (
            <Input
              {...control}
              {...form.register('minStockAlert')}
              inputMode="numeric"
              dir="ltr"
              className="tabular"
            />
          )}
        </FormField>
        <div className="md:col-span-2">
          <Controller
            control={form.control}
            name="includedInSubscription"
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                label={t.form.included}
              />
            )}
          />
        </div>
      </FormSection>
    </FormPage>
  );
}
