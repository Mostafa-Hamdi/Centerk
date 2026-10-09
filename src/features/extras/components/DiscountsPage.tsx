'use client';

import { Pencil, Percent, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Switch } from '@/components/ui/Switch';
import { Can } from '@/features/auth/components/Can';
import { ar } from '@/i18n/ar';
import { formatMoney, formatNumber } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  useDeleteDiscountMutation,
  useGetDiscountsQuery,
  useSaveDiscountMutation,
  type DiscountDto,
  type DiscountType,
} from '../api';

const t = ar.discounts;

/** /payments/discounts — discount catalogue: add / edit inline, delete. */
export function DiscountsPage() {
  const { data, isLoading } = useGetDiscountsQuery(undefined);
  const [save, saving] = useSaveDiscountMutation();
  const [remove] = useDeleteDiscountMutation();
  const [editing, setEditing] = useState<DiscountDto | null>(null);
  const [deleting, setDeleting] = useState<DiscountDto | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<DiscountType>('Percent');
  const [value, setValue] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const amount = Number(value);
  const valid =
    name.trim().length >= 2 &&
    amount > 0 &&
    !Number.isNaN(amount) &&
    (type === 'Fixed' || amount <= 100);

  const reset = () => {
    setEditing(null);
    setName('');
    setType('Percent');
    setValue('');
    setRequiresApproval(false);
  };

  const submit = async () => {
    if (!valid) return;
    try {
      await save({
        id: editing?.id,
        name: name.trim(),
        type,
        value: amount,
        requiresApproval,
      }).unwrap();
      toast.success(t.saved, name);
      reset();
    } catch (caught) {
      const problem = toProblem(caught);
      toast.error(problem.title, problem.detail);
    }
  };

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
        <p className="mt-1 text-muted">{t.description}</p>
      </header>

      <Can permission="payments.update">
        <Card className="grid items-end gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            {t.name}
            <Input
              placeholder={t.name}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            {t.type}
            <Select
              value={type}
              onValueChange={(next) => setType(next as DiscountType)}
              options={(['Percent', 'Fixed'] as const).map((item) => ({
                value: item,
                label: t.types[item] ?? item,
              }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            {t.value}
            <Input
              placeholder={t.value}
              inputMode="decimal"
              dir="ltr"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </label>
          <Switch
            checked={requiresApproval}
            onCheckedChange={setRequiresApproval}
            label={t.requiresApproval}
          />
          <div className="flex gap-2">
            <Button disabled={!valid} loading={saving.isLoading} onClick={() => void submit()}>
              {editing ? t.save : t.add}
            </Button>
            {editing ? (
              <Button variant="ghost" iconStart={<X aria-hidden />} onClick={reset}>
                {ar.common.cancel}
              </Button>
            ) : null}
          </div>
        </Card>
      </Can>

      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : data?.length ? (
        <ul className="grid gap-(--shell-gap) sm:grid-cols-2 xl:grid-cols-3">
          {data.map((discount) => (
            <li key={discount.id}>
              <Card className="flex h-full flex-col gap-2 p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-lg font-bold text-ink">{discount.name}</p>
                  <span className="font-display text-xl font-bold text-primary tabular">
                    {discount.type === 'Percent'
                      ? `${formatNumber(discount.value)}٪`
                      : formatMoney(discount.value)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {discount.requiresApproval ? (
                    <Badge tone="warning">{t.needsApproval}</Badge>
                  ) : null}
                  {discount.isActive ? null : <Badge>{ar.messages.templates.inactive}</Badge>}
                </div>
                <Can permission="payments.update">
                  <div className="mt-auto flex justify-end gap-1 border-t border-line pt-3">
                    <Button
                      size="sm"
                      variant="neutral"
                      iconStart={<Pencil aria-hidden />}
                      onClick={() => {
                        setEditing(discount);
                        setName(discount.name);
                        setType(discount.type === 'Fixed' ? 'Fixed' : 'Percent');
                        setValue(String(discount.value));
                        setRequiresApproval(discount.requiresApproval);
                      }}
                    >
                      {ar.common.edit}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      aria-label={`${ar.common.delete} ${discount.name}`}
                      iconStart={<Trash2 aria-hidden />}
                      onClick={() => setDeleting(discount)}
                    />
                  </div>
                </Can>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={Percent} title={t.empty} />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        itemName={deleting?.name ?? ''}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove(deleting.id).unwrap();
            toast.success(t.deleted, deleting.name);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}
