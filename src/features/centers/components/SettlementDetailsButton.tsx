'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { FileText, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { prettyJson } from '@/features/audit/api';
import { ar } from '@/i18n/ar';
import { formatDateTime, formatMoney } from '@/lib/format';
import { api } from '@/services/api';
import { read, readNumber, readString } from '@/services/normalize';

interface SettlementDetails {
  grossCollected: number;
  centerShare: number;
  netToTeacher: number;
  agreement: string | null;
  disputeNote: string | null;
  paidAt: string | null;
}

/** GET /settlements/{id} — figures + the agreement snapshot used when it was generated. */
const detailsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSettlementDetails: build.query<SettlementDetails, string>({
      query: (id) => `/settlements/${encodeURIComponent(id)}`,
      transformResponse: (raw: unknown) => {
        const source = read(raw, 'settlement') ?? raw;
        return {
          grossCollected: readNumber(source, 'grossCollected') ?? 0,
          centerShare: readNumber(source, 'centerShare') ?? 0,
          netToTeacher: readNumber(source, 'netToTeacher') ?? 0,
          agreement: readString(source, 'agreementSnapshotJson'),
          disputeNote: readString(source, 'disputeNote'),
          paidAt: readString(source, 'paidAtUtc'),
        };
      },
    }),
  }),
});

const { useGetSettlementDetailsQuery } = detailsApi;
const t = ar.settlements;

export function SettlementDetailsButton({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const { data } = useGetSettlementDetailsQuery(id, { skip: !open });
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          size="sm"
          variant="ghost"
          aria-label={`${t.details} ${title}`}
          iconStart={<FileText aria-hidden />}
        />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-4 top-1/2 z-50 mx-auto flex max-w-lg -translate-y-1/2 flex-col items-center gap-4 rounded-xl border border-line bg-surface p-6 text-center shadow-lift">
          <Dialog.Title className="font-display text-xl font-bold text-ink">
            {t.details} · {title}
          </Dialog.Title>
          {data ? (
            <>
              <dl className="grid w-full grid-cols-3 gap-2 text-sm">
                {(
                  [
                    [t.gross, data.grossCollected],
                    [t.centerShare, data.centerShare],
                    [t.net, data.netToTeacher],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="rounded-md bg-canvas p-2">
                    <dt className="text-xs text-muted">{label}</dt>
                    <dd className="font-bold text-ink tabular">{formatMoney(value)}</dd>
                  </div>
                ))}
              </dl>
              {data.paidAt ? (
                <p className="text-sm text-success">{formatDateTime(data.paidAt)}</p>
              ) : null}
              {data.disputeNote ? <p className="text-sm text-danger">{data.disputeNote}</p> : null}
              <div className="w-full text-start">
                <p className="mb-1 text-sm font-medium text-ink">{t.agreementSnapshot}</p>
                <pre
                  dir="ltr"
                  className="max-h-64 overflow-auto rounded-md bg-canvas p-3 text-xs whitespace-pre-wrap text-ink"
                >
                  {prettyJson(data.agreement)}
                </pre>
              </div>
            </>
          ) : (
            <Skeleton className="h-40 w-full rounded-md" />
          )}
          <Dialog.Close asChild>
            <Button variant="neutral" iconStart={<X aria-hidden />}>
              {ar.common.close}
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
