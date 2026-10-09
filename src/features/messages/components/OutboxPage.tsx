'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { MessageSquareText, Send } from 'lucide-react';
import { useMemo } from 'react';
import { DataTable } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useResendMessageMutation } from '@/features/account/components/DocumentActions';
import { Can } from '@/features/auth/components/Can';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { ar } from '@/i18n/ar';
import { formatDateTime, formatPhone } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { useGetOutboxQuery, type OutboxMessageDto } from '../api';
import { MessagesHeader } from './MessagesHeader';
import { messageStatus } from './status';

const t = ar.messages;

/** /messages — outbox log (live GET /messages), newest first. */
export function OutboxPage() {
  const list = useListQueryParams();
  const { data, isLoading, isFetching, error, refetch } = useGetOutboxQuery(list.params);
  const [resend] = useResendMessageMutation();

  const columns = useMemo<ColumnDef<OutboxMessageDto>[]>(() => {
    const retry = async (message: OutboxMessageDto) => {
      try {
        await resend(message.id).unwrap();
        toast.success(ar.documents.resent);
      } catch (caught) {
        toast.error(toProblem(caught).title);
      }
    };
    return [
      {
        accessorKey: 'recipientPhone',
        header: t.log.columns.recipient,
        cell: ({ getValue }) =>
          getValue<string | null>() ? (
            <span dir="ltr" className="tabular">
              {formatPhone(getValue<string>())}
            </span>
          ) : (
            '—'
          ),
      },
      {
        accessorKey: 'channel',
        header: t.log.columns.channel,
        cell: ({ getValue }) => t.channels[getValue<string>()] ?? getValue<string>(),
      },
      {
        accessorKey: 'body',
        header: t.log.columns.body,
        cell: ({ getValue }) => (
          <p className="line-clamp-2 max-w-md text-sm" title={getValue<string>()}>
            {getValue<string>()}
          </p>
        ),
      },
      {
        accessorKey: 'status',
        header: t.log.columns.status,
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
        accessorKey: 'createdAt',
        header: t.log.columns.time,
        cell: ({ getValue }) =>
          getValue<string | null>() ? formatDateTime(getValue<string>()) : '—',
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) =>
          row.original.status.toLowerCase() === 'failed' ? (
            <Can permission="messages.create">
              <Button
                size="sm"
                variant="ghost"
                iconStart={<Send aria-hidden />}
                onClick={() => void retry(row.original)}
              >
                {ar.documents.resend}
              </Button>
            </Can>
          ) : null,
      },
    ];
  }, [resend]);

  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <MessagesHeader />
      <section className="list-panel">
        <DataTable
          startIndex={((data?.page ?? 1) - 1) * list.params.pageSize}
          caption={t.log.caption}
          data={data?.items}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error ? toProblem(error).title : null}
          onRetry={() => void refetch()}
          empty={<EmptyState icon={MessageSquareText} title={t.log.empty} />}
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
    </div>
  );
}
