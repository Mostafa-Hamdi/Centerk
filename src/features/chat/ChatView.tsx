'use client';

import { MessagesSquare, Plus, Send, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Combobox } from '@/components/ui/Combobox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Textarea } from '@/components/ui/Textarea';
import { useGetStudentsQuery } from '@/features/students/api';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { api } from '@/services/api';
import { normalizePaged, readString } from '@/services/normalize';
import type { Paged } from '@/services/types';
import { selectMe } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';

/** Staff ↔ guardian text threads — /threads (staff) and /portal/threads (portal), same contract. */
export interface ThreadDto {
  id: string;
  studentName: string | null;
  teacherName: string | null;
  subject: string;
  status: string;
  createdAt: string | null;
}

export interface ThreadMessageDto {
  id: string;
  senderId: string | null;
  senderKind: string | null;
  body: string;
  createdAt: string | null;
}

type Base = '/threads' | '/portal/threads';

const chatApi = api.injectEndpoints({
  endpoints: (build) => ({
    getThreads: build.query<Paged<ThreadDto>, Base>({
      query: (base) => ({ url: base, params: { page: 1, pageSize: 50 } }),
      transformResponse: (raw: unknown) =>
        normalizePaged(
          raw,
          (item, index): ThreadDto => ({
            id: readString(item, 'id') ?? `thread-${index}`,
            studentName: readString(item, 'studentName'),
            teacherName: readString(item, 'teacherName'),
            subject: readString(item, 'subject') ?? '—',
            status: readString(item, 'status') ?? 'Open',
            createdAt: readString(item, 'createdAt'),
          }),
          { page: 1, pageSize: 50 },
          'threads',
        ),
      providesTags: (_result, _error, base) => [{ type: 'Message', id: `THREADS-${base}` }],
    }),
    getThreadMessages: build.query<ThreadMessageDto[], { base: Base; id: string }>({
      query: ({ base, id }) => ({
        url: `${base}/${encodeURIComponent(id)}/messages`,
        params: { page: 1, pageSize: 100 },
      }),
      transformResponse: (raw: unknown) =>
        normalizePaged(
          raw,
          (item, index): ThreadMessageDto => ({
            id: readString(item, 'id') ?? `message-${index}`,
            senderId: readString(item, 'senderId'),
            senderKind: readString(item, 'senderKind'),
            body: readString(item, 'body') ?? '',
            createdAt: readString(item, 'createdAt'),
          }),
          { page: 1, pageSize: 100 },
          'thread-messages',
        ).items.sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? '')),
      providesTags: (_result, _error, { id }) => [{ type: 'Message', id: `THREAD-${id}` }],
    }),
    sendThreadMessage: build.mutation<undefined, { base: Base; id: string; body: string }>({
      query: ({ base, id, body }) => ({
        url: `${base}/${encodeURIComponent(id)}/messages`,
        method: 'POST',
        body: { body },
      }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Message', id: `THREAD-${id}` }],
    }),
    startThread: build.mutation<
      { id: string },
      { base: Base; studentId: string; teacherId: string; subject: string }
    >({
      query: ({ base, ...body }) => ({ url: base, method: 'POST', body }),
      transformResponse: (raw: unknown) => ({ id: readString(raw, 'id') ?? '' }),
      invalidatesTags: (_result, _error, { base }) => [{ type: 'Message', id: `THREADS-${base}` }],
    }),
    closeThread: build.mutation<undefined, { base: Base; id: string }>({
      query: ({ base, id }) => ({ url: `${base}/${encodeURIComponent(id)}`, method: 'DELETE' }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { base }) => [{ type: 'Message', id: `THREADS-${base}` }],
    }),
  }),
});

const {
  useGetThreadsQuery,
  useGetThreadMessagesQuery,
  useSendThreadMessageMutation,
  useStartThreadMutation,
  useCloseThreadMutation,
} = chatApi;

const t = ar.chat;

/** Two-pane chat: threads list + conversation (polled every 15 s) + composer. */
export function ChatView({ base }: { base: Base }) {
  const me = useAppSelector(selectMe);
  const threads = useGetThreadsQuery(base);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const active = threads.data?.items.find((thread) => thread.id === activeId) ?? null;
  const isStaff = base === '/threads';

  return (
    <div className="grid min-h-[60vh] gap-(--shell-gap) lg:grid-cols-[20rem_minmax(0,1fr)]">
      <Card className="flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <h2 className="font-display text-lg font-bold text-ink">{t.threads}</h2>
          {isStaff ? (
            <Button size="sm" iconStart={<Plus aria-hidden />} onClick={() => setStarting(true)}>
              {t.new}
            </Button>
          ) : null}
        </div>
        {threads.isLoading ? (
          <Skeleton className="h-40 w-full rounded-md" />
        ) : threads.data?.items.length ? (
          <ul className="flex flex-col gap-1">
            {threads.data.items.map((thread) => (
              <li key={thread.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(thread.id);
                    setStarting(false);
                  }}
                  className={cn(
                    'flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-start transition-colors',
                    thread.id === activeId ? 'bg-primary-tint' : 'hover:bg-canvas',
                  )}
                >
                  <span className="line-clamp-1 font-medium text-ink">{thread.subject}</span>
                  <span className="line-clamp-1 text-xs text-muted">
                    {[thread.studentName, thread.teacherName].filter(Boolean).join(' · ')}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4 text-center text-sm text-muted">{t.empty}</p>
        )}
      </Card>

      {starting && me ? (
        <StartThread
          base={base}
          teacherId={me.id}
          onStarted={(id) => {
            setStarting(false);
            setActiveId(id);
          }}
        />
      ) : active ? (
        <Conversation
          base={base}
          thread={active}
          myId={me?.id ?? ''}
          onClosed={() => setActiveId(null)}
        />
      ) : (
        <Card className="flex items-center justify-center p-6">
          <EmptyState icon={MessagesSquare} title={t.pick} />
        </Card>
      )}
    </div>
  );
}

function Conversation({
  base,
  thread,
  myId,
  onClosed,
}: {
  base: Base;
  thread: ThreadDto;
  myId: string;
  onClosed: () => void;
}) {
  const messages = useGetThreadMessagesQuery(
    { base, id: thread.id },
    { pollingInterval: 15_000, skipPollingIfUnfocused: true },
  );
  const [send, sending] = useSendThreadMessageMutation();
  const [close] = useCloseThreadMutation();
  const [body, setBody] = useState('');
  const closed = thread.status.toLowerCase() === 'closed';

  const submit = async () => {
    const text = body.trim();
    if (!text) return;
    try {
      await send({ base, id: thread.id, body: text }).unwrap();
      setBody('');
    } catch (caught) {
      toast.error(toProblem(caught).title);
    }
  };

  return (
    <Card className="flex flex-col p-0">
      <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-3">
        <div>
          <p className="font-display text-lg font-bold text-ink">{thread.subject}</p>
          <p className="text-xs text-muted">
            {[thread.studentName, thread.teacherName].filter(Boolean).join(' · ')}
          </p>
        </div>
        {closed ? (
          <Badge>{t.closed}</Badge>
        ) : (
          <Button
            size="sm"
            variant="neutral"
            iconStart={<X aria-hidden />}
            onClick={async () => {
              try {
                await close({ base, id: thread.id }).unwrap();
                toast.success(t.closedDone);
                onClosed();
              } catch (caught) {
                toast.error(toProblem(caught).title);
              }
            }}
          >
            {t.close}
          </Button>
        )}
      </div>
      <ol className="flex max-h-[55vh] min-h-64 flex-1 flex-col gap-3 overflow-y-auto p-5">
        {messages.isLoading ? (
          <Skeleton className="h-24 w-full rounded-md" />
        ) : messages.data?.length ? (
          messages.data.map((message) => {
            const mine = message.senderId === myId;
            return (
              <li
                key={message.id}
                className={cn(
                  'rounded-2xl max-w-[80%] px-4 py-2 text-sm',
                  mine
                    ? 'self-start rounded-ss-sm bg-primary text-primary-ink'
                    : 'self-end rounded-se-sm bg-canvas text-ink',
                )}
              >
                <p className="whitespace-pre-line">{message.body}</p>
                <p className={cn('mt-1 text-[11px]', mine ? 'text-primary-ink/75' : 'text-muted')}>
                  {message.createdAt ? formatDateTime(message.createdAt) : ''}
                </p>
              </li>
            );
          })
        ) : (
          <p className="m-auto text-sm text-muted">{t.noMessages}</p>
        )}
      </ol>
      {closed ? null : (
        <div className="flex items-end gap-2 border-t border-line p-3">
          <Textarea
            rows={2}
            value={body}
            placeholder={t.placeholder}
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void submit();
              }
            }}
            aria-label={t.placeholder}
          />
          <Button
            iconStart={<Send aria-hidden />}
            disabled={!body.trim()}
            loading={sending.isLoading}
            onClick={() => void submit()}
          >
            {t.send}
          </Button>
        </div>
      )}
    </Card>
  );
}

function StartThread({
  base,
  teacherId,
  onStarted,
}: {
  base: Base;
  teacherId: string;
  onStarted: (id: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [studentId, setStudentId] = useState<string | undefined>();
  const [subject, setSubject] = useState('');
  const students = useGetStudentsQuery({ search, page: 1, pageSize: 20, filters: {} });
  const [start, startState] = useStartThreadMutation();
  const valid = Boolean(studentId) && subject.trim().length >= 3;

  return (
    <Card className="flex flex-col gap-4 p-5">
      <h2 className="font-display text-lg font-bold text-ink">{t.new}</h2>
      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
        {t.student}
        <Combobox
          value={studentId}
          onValueChange={setStudentId}
          onSearch={setSearch}
          loading={students.isFetching}
          placeholder={ar.enrollment.pick}
          options={(students.data?.items ?? []).map((student) => ({
            value: student.id,
            label: `${student.fullName} · ${student.code}`,
          }))}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
        {t.subject}
        <Input
          value={subject}
          placeholder={t.subject}
          maxLength={150}
          onChange={(event) => setSubject(event.target.value)}
        />
      </label>
      <div>
        <Button
          disabled={!valid}
          loading={startState.isLoading}
          onClick={async () => {
            if (!studentId) return;
            try {
              const thread = await start({
                base,
                studentId,
                teacherId,
                subject: subject.trim(),
              }).unwrap();
              toast.success(t.started);
              onStarted(thread.id);
            } catch (caught) {
              toast.error(toProblem(caught).title);
            }
          }}
        >
          {t.start}
        </Button>
      </div>
    </Card>
  );
}
