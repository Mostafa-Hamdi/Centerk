'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Ban, Copy, Megaphone, Pencil, Plus, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { SearchInput } from '@/components/data/SearchInput';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { ar } from '@/i18n/ar';
import { formatDateTime, formatNumber } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { useCampaignActionMutation, useGetCampaignsQuery, type CampaignDto } from '../api';
import { MessagesHeader } from './MessagesHeader';
import { messageStatus } from './status';

const t = ar.messages.campaigns;
const EDITABLE = new Set(['draft', 'scheduled']);

type Pending = { campaign: CampaignDto; action: 'send-now' | 'cancel' | 'delete' };

/** /messages/campaigns — bulk campaigns: send now, cancel, duplicate, edit drafts, delete. */
export function CampaignsPage() {
  const list = useListQueryParams();
  const { data, isLoading, isFetching, error, refetch } = useGetCampaignsQuery(list.params);
  const [run] = useCampaignActionMutation();
  const [pending, setPending] = useState<Pending | null>(null);

  const columns = useMemo<ColumnDef<CampaignDto>[]>(() => {
    const duplicate = async (campaign: CampaignDto) => {
      try {
        await run({ id: campaign.id, action: 'duplicate' }).unwrap();
        toast.success(t.duplicated, campaign.title);
      } catch (caught) {
        toast.error(toProblem(caught).title);
      }
    };
    return [
      { accessorKey: 'title', header: t.columns.title },
      {
        accessorKey: 'channel',
        header: t.columns.channel,
        cell: ({ getValue }) => ar.messages.channels[getValue<string>()] ?? getValue<string>(),
      },
      {
        accessorKey: 'recipientCount',
        header: t.columns.recipients,
        meta: { className: 'tabular' },
        cell: ({ getValue }) => formatNumber(getValue<number>()),
      },
      {
        accessorKey: 'status',
        header: t.columns.status,
        cell: ({ getValue }) => {
          const status = messageStatus(getValue<string>());
          return (
            <Badge tone={status.tone} dot>
              {status.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'scheduledAt',
        header: t.columns.scheduled,
        cell: ({ getValue }) =>
          getValue<string | null>() ? formatDateTime(getValue<string>()) : t.immediate,
      },
      {
        id: 'actions',
        header: t.columns.actions,
        cell: ({ row }) => {
          const campaign = row.original;
          const editable = EDITABLE.has(campaign.status.toLowerCase());
          return (
            <div className="flex flex-wrap gap-1">
              {editable ? (
                <Can permission="messages.bulkSend">
                  <Button
                    size="sm"
                    variant="success"
                    iconStart={<Send aria-hidden />}
                    onClick={() => setPending({ campaign, action: 'send-now' })}
                  >
                    {t.sendNow}
                  </Button>
                </Can>
              ) : null}
              {editable ? (
                <Can permission="messages.update">
                  <Link
                    href={routes.campaigns.edit(campaign.id)}
                    aria-label={`${ar.common.edit} ${campaign.title}`}
                    className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                  >
                    <Pencil className="size-4" aria-hidden />
                  </Link>
                </Can>
              ) : null}
              {campaign.status.toLowerCase() === 'scheduled' ? (
                <Can permission="messages.update">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`${t.cancel} ${campaign.title}`}
                    iconStart={<Ban aria-hidden />}
                    onClick={() => setPending({ campaign, action: 'cancel' })}
                  />
                </Can>
              ) : null}
              <Can permission="messages.create">
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`${ar.materials.duplicate} ${campaign.title}`}
                  iconStart={<Copy aria-hidden />}
                  onClick={() => void duplicate(campaign)}
                />
              </Can>
              {editable ? (
                <Can permission="messages.delete">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`${ar.common.delete} ${campaign.title}`}
                    iconStart={<Trash2 aria-hidden />}
                    onClick={() => setPending({ campaign, action: 'delete' })}
                  />
                </Can>
              ) : null}
            </div>
          );
        },
      },
    ];
  }, [run]);

  const dialog = pending
    ? {
        'send-now': {
          title: t.sendNow,
          question: t.sendQuestion,
          description: t.sendDesc,
          confirm: t.sendNow,
          done: t.sent,
          tone: 'warning' as const,
        },
        cancel: {
          title: t.cancel,
          question: t.cancelQuestion,
          description: undefined,
          confirm: t.cancel,
          done: t.cancelled,
          tone: 'danger' as const,
        },
        delete: {
          title: undefined,
          question: undefined,
          description: undefined,
          confirm: undefined,
          done: t.deleted,
          tone: 'danger' as const,
        },
      }[pending.action]
    : null;

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <MessagesHeader
        action={
          <Can permission="messages.create">
            <Link
              href={routes.campaigns.new}
              className={buttonVariants({ variant: 'primary', size: 'lg' })}
            >
              <Plus className="size-4" aria-hidden />
              {t.add}
            </Link>
          </Can>
        }
      />
      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <SearchInput
          value={list.params.search ?? ''}
          onSearch={list.setSearch}
          className="w-full max-w-sm"
        />
        <DataTable
          caption={t.caption}
          data={data?.items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error ? toProblem(error).title : null}
          onRetry={() => void refetch()}
          empty={<EmptyState icon={Megaphone} title={t.empty} />}
        />
        {data && data.totalCount > 0 ? (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            pageSize={list.params.pageSize}
            onPageChange={list.setPage}
            onPageSizeChange={list.setPageSize}
          />
        ) : null}
      </section>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title={dialog?.title}
        questionPrefix={dialog?.question}
        itemName={pending?.campaign.title ?? ''}
        description={dialog?.description}
        confirmLabel={dialog?.confirm}
        tone={dialog?.tone}
        onConfirm={async () => {
          if (!pending || !dialog) return;
          try {
            await run({ id: pending.campaign.id, action: pending.action }).unwrap();
            toast.success(dialog.done, pending.campaign.title);
          } catch (caught) {
            toast.error(toProblem(caught).title);
            throw caught;
          }
        }}
      />
    </div>
  );
}
