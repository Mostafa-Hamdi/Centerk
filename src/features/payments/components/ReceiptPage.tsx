'use client';

import { ArrowRight, Ban, Printer } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { ar } from '@/i18n/ar';
import { formatDateTime, formatMoney } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { useGetPaymentQuery, useVoidPaymentMutation } from '../api';

const t = ar.payments;

/** /payments/[id] — receipt view, print (browser print styles) and void with a mandatory reason. */
export function ReceiptPage({ id }: { id: string }) {
  const { data: payment, error, refetch } = useGetPaymentQuery(id);
  const [voidPayment] = useVoidPaymentMutation();
  const [voidOpen, setVoidOpen] = useState(false);

  if (error)
    return (
      <ErrorState
        title={ar.list.loadError}
        description={toProblem(error).title}
        onRetry={() => void refetch()}
      />
    );
  if (!payment) return <Skeleton className="mx-auto h-96 max-w-2xl rounded-xl" />;

  const rows = [
    [t.columns.amount, formatMoney(payment.amount)],
    [t.columns.method, t.methods[payment.method] ?? payment.method],
    [t.receipt.collectedAt, payment.collectedAt ? formatDateTime(payment.collectedAt) : '—'],
    [t.form.reference, payment.referenceNo ?? '—'],
    [t.form.notes, payment.notes ?? '—'],
    ...(payment.voidReason ? [[t.receipt.voidReason, payment.voidReason]] : []),
  ] as const;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-(--shell-gap)">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={routes.payments.list}
          className="flex items-center gap-2 text-sm text-muted hover:text-primary"
        >
          <ArrowRight className="size-4" aria-hidden />
          {t.title}
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button variant="info" iconStart={<Printer aria-hidden />} onClick={() => window.print()}>
            {t.receipt.print}
          </Button>
          {payment.status === 'Active' ? (
            <Can permission="payments.void">
              <Button
                variant="danger"
                iconStart={<Ban aria-hidden />}
                onClick={() => setVoidOpen(true)}
              >
                {t.receipt.void}
              </Button>
            </Can>
          ) : null}
        </div>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-3 border-b border-dashed border-line pb-4">
          <div>
            <p className="text-sm text-muted">{ar.app.name}</p>
            <h1 className="font-display text-2xl font-bold text-ink">
              {t.receipt.title('')}
              <span dir="ltr" className="tabular">
                {payment.receiptNumber}
              </span>
            </h1>
          </div>
          <Badge tone={payment.status === 'Voided' ? 'danger' : 'success'} dot>
            {t.status[payment.status]}
          </Badge>
        </div>
        <dl className="mt-4 flex flex-col gap-3">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 text-sm">
              <dt className="text-muted">{label}</dt>
              <dd className="text-end font-medium text-ink tabular">{value}</dd>
            </div>
          ))}
        </dl>
        {payment.allocations.length ? (
          <div className="mt-6 border-t border-dashed border-line pt-4">
            <h2 className="mb-2 text-sm font-semibold text-muted">{t.receipt.allocations}</h2>
            <ul className="flex flex-col gap-1 text-sm">
              {payment.allocations.map((allocation) => (
                <li key={allocation.chargeId} className="flex justify-between text-ink tabular">
                  <span dir="ltr" className="text-muted">
                    {allocation.chargeId.slice(0, 8)}
                  </span>
                  {formatMoney(allocation.amount)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>

      <ConfirmDialog
        open={voidOpen}
        onOpenChange={setVoidOpen}
        title={t.receipt.void}
        questionPrefix={t.receipt.voidQuestion}
        itemName={payment.receiptNumber}
        description={t.receipt.voidDesc}
        confirmLabel={t.receipt.void}
        requireReason
        onConfirm={async (reason) => {
          try {
            await voidPayment({ id, reason: reason ?? '' }).unwrap();
            toast.success(t.receipt.voided, payment.receiptNumber);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}
