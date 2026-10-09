'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Calculator, HandCoins, MessageSquareWarning, Scale } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/data/DataTable';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Can } from '@/features/auth/components/Can';
import { useGetCurrentShiftQuery } from '@/features/cash/api';
import { useGetStaffQuery } from '@/features/staff/api';
import { ar } from '@/i18n/ar';
import { formatMoney } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { selectCurrentBranchId } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import {
  useGenerateSettlementsMutation,
  useGetSettlementsQuery,
  useSettlementActionMutation,
  type SettlementDto,
} from '../api';
import { SettlementDetailsButton } from './SettlementDetailsButton';
import { CentersTabs } from './CentersTabs';

const t = ar.settlements;
const tones = { pending: 'warning', paid: 'success', disputed: 'danger' } as const;

type Pending = { settlement: SettlementDto; action: 'pay' | 'dispute' };

/** /centers/settlements — monthly teacher settlements: generate, pay from the drawer, dispute. */
export function SettlementsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const month = searchParams.get('month') ?? format(new Date(), 'yyyy-MM');
  const branchId = useAppSelector(selectCurrentBranchId);
  const { data, isLoading, isFetching, error, refetch } = useGetSettlementsQuery({
    month,
    page: 1,
    pageSize: 100,
    filters: {},
  });
  const teachers = useGetStaffQuery({ page: 1, pageSize: 100, filters: {}, role: 'Teacher' });
  const shift = useGetCurrentShiftQuery(undefined);
  const [generate, generating] = useGenerateSettlementsMutation();
  const [run] = useSettlementActionMutation();
  const [pending, setPending] = useState<Pending | null>(null);

  const teacherName = (id: string | null) =>
    (id && teachers.data?.items.find((member) => member.id === id)?.name) ?? '—';

  const columns = useMemo<ColumnDef<SettlementDto>[]>(
    () => [
      {
        accessorKey: 'teacherId',
        header: t.teacher,
        cell: ({ row, getValue }) =>
          row.original.teacherName ??
          (getValue<string | null>() &&
            teachers.data?.items.find((member) => member.id === getValue<string>())?.name) ??
          '—',
      },
      ...(['grossCollected', 'centerShare', 'netToTeacher'] as const).map(
        (key): ColumnDef<SettlementDto> => ({
          accessorKey: key,
          header: { grossCollected: t.gross, centerShare: t.centerShare, netToTeacher: t.net }[key],
          meta: { className: key === 'netToTeacher' ? 'tabular font-bold' : 'tabular' },
          cell: ({ getValue }) => formatMoney(getValue<number>()),
        }),
      ),
      {
        accessorKey: 'status',
        header: t.status,
        cell: ({ row }) => {
          const status = row.original.status;
          const key = status.toLowerCase();
          return (
            <Badge
              tone={key in tones ? tones[key as keyof typeof tones] : 'neutral'}
              dot
              title={row.original.disputeNote ?? undefined}
            >
              {t.statuses[status] ?? status}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <span className="flex items-center justify-center gap-1">
            <SettlementDetailsButton
              id={row.original.id}
              title={teacherName(row.original.teacherId)}
            />
            {row.original.status.toLowerCase() === 'paid' ? null : (
              <div className="flex gap-1">
                <Can permission="centers.settle">
                  <Button
                    size="sm"
                    variant="success"
                    iconStart={<HandCoins aria-hidden />}
                    onClick={() => setPending({ settlement: row.original, action: 'pay' })}
                  >
                    {t.pay}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    iconStart={<MessageSquareWarning aria-hidden />}
                    onClick={() => setPending({ settlement: row.original, action: 'dispute' })}
                  >
                    {t.dispute}
                  </Button>
                </Can>
              </div>
            )}
          </span>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- teacherName only reads teachers.data
    [teachers.data],
  );

  const recalculate = async () => {
    try {
      const result = await generate(month).unwrap();
      toast.success(t.generated(result.created, result.skipped));
    } catch (caught) {
      toast.error(toProblem(caught).title);
    }
  };

  const paying = pending?.action === 'pay';

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">{t.title}</h1>
        <p className="mt-1 text-muted">{ar.hallBookings.description}</p>
      </header>
      <CentersTabs />
      <section className="list-panel">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            {t.month}
            <Input
              type="month"
              dir="ltr"
              className="w-48"
              value={month}
              onChange={(event) => {
                const next = new URLSearchParams(searchParams.toString());
                if (event.target.value) next.set('month', event.target.value);
                else next.delete('month');
                router.replace(`${pathname}?${next.toString()}`, { scroll: false });
              }}
            />
          </label>
          <Can permission="centers.settle">
            <Button
              variant="info"
              iconStart={<Calculator aria-hidden />}
              loading={generating.isLoading}
              onClick={() => void recalculate()}
            >
              {t.generate}
            </Button>
          </Can>
        </div>
        <DataTable
          caption={t.caption}
          data={data?.items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error ? toProblem(error).title : null}
          onRetry={() => void refetch()}
          empty={<EmptyState icon={Scale} title={t.empty} />}
        />
      </section>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title={paying ? t.pay : t.dispute}
        questionPrefix={paying ? t.payQuestion : t.disputeQuestion}
        itemName={
          pending
            ? `${teacherName(pending.settlement.teacherId)} · ${formatMoney(pending.settlement.netToTeacher)}`
            : ''
        }
        description={paying ? t.payDesc : ''}
        confirmLabel={paying ? t.pay : t.dispute}
        tone="warning"
        requireReason={!paying}
        onConfirm={async (reason) => {
          if (!pending) return;
          try {
            if (paying) {
              await run({
                id: pending.settlement.id,
                action: 'pay',
                branchId: branchId ?? undefined,
                cashShiftId: shift.data?.id,
              }).unwrap();
              toast.success(t.paid, formatMoney(pending.settlement.netToTeacher));
            } else {
              await run({
                id: pending.settlement.id,
                action: 'dispute',
                reason: reason ?? '',
              }).unwrap();
              toast.success(t.disputed);
            }
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}
