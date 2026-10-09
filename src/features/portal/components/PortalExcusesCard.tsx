'use client';

import { MailPlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ar } from '@/i18n/ar';
import { formatDate } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { api } from '@/services/api';
import { read, readString } from '@/services/normalize';

interface PortalExcuse {
  id: string;
  date: string | null;
  reason: string | null;
  wantsMakeup: boolean;
  status: string;
}

/** Guardian absence excuses — /portal/students/{id}/excuses (+ withdraw a pending one). */
const portalExcusesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPortalExcuses: build.query<PortalExcuse[], string>({
      query: (studentId) => `/portal/students/${encodeURIComponent(studentId)}/excuses`,
      transformResponse: (raw: unknown) => {
        const items = Array.isArray(raw) ? raw : read(raw, 'items');
        return Array.isArray(items)
          ? (items as unknown[]).map((item, index) => ({
              id: readString(item, 'id') ?? `excuse-${index}`,
              date: readString(item, 'dateUtc'),
              reason: readString(item, 'reason'),
              wantsMakeup: read(item, 'wantsMakeup') === true,
              status: readString(item, 'status') ?? 'Pending',
            }))
          : [];
      },
      providesTags: (_result, _error, studentId) => [
        { type: 'Attendance', id: `PEX-${studentId}` },
      ],
    }),
    submitExcuse: build.mutation<
      undefined,
      { studentId: string; dateUtc: string; reason: string; wantsMakeup: boolean }
    >({
      query: ({ studentId, ...body }) => ({
        url: `/portal/students/${encodeURIComponent(studentId)}/excuses`,
        method: 'POST',
        body,
      }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { studentId }) => [
        { type: 'Attendance', id: `PEX-${studentId}` },
      ],
    }),
    withdrawExcuse: build.mutation<undefined, { id: string; studentId: string }>({
      query: ({ id }) => ({ url: `/portal/excuses/${encodeURIComponent(id)}`, method: 'DELETE' }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { studentId }) => [
        { type: 'Attendance', id: `PEX-${studentId}` },
      ],
    }),
  }),
});

const { useGetPortalExcusesQuery, useSubmitExcuseMutation, useWithdrawExcuseMutation } =
  portalExcusesApi;

const t = ar.portal.excuses;
const tones = { Pending: 'warning', Approved: 'success', Rejected: 'danger' } as const;

export function PortalExcusesCard({ studentId }: { studentId: string }) {
  const { data } = useGetPortalExcusesQuery(studentId);
  const [submit, submitting] = useSubmitExcuseMutation();
  const [withdraw] = useWithdrawExcuseMutation();
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [wantsMakeup, setWantsMakeup] = useState(false);
  const valid = Boolean(date) && reason.trim().length >= 3;

  const send = async () => {
    if (!valid) return;
    try {
      await submit({
        studentId,
        dateUtc: new Date(`${date}T12:00:00`).toISOString(),
        reason: reason.trim(),
        wantsMakeup,
      }).unwrap();
      toast.success(t.sent);
      setDate('');
      setReason('');
      setWantsMakeup(false);
    } catch (caught) {
      toast.error(toProblem(caught).title);
    }
  };

  return (
    <Card className="flex flex-col gap-3 p-5">
      <h2 className="font-display text-lg font-bold text-ink">{t.title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          {t.date}
          <Input
            type="date"
            dir="ltr"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <div className="flex items-end">
          <Checkbox checked={wantsMakeup} onCheckedChange={setWantsMakeup} label={t.makeup} />
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium text-ink sm:col-span-2">
          {t.reason}
          <Textarea
            rows={2}
            placeholder={t.reason}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
      </div>
      <div>
        <Button
          iconStart={<MailPlus aria-hidden />}
          disabled={!valid}
          loading={submitting.isLoading}
          onClick={() => void send()}
        >
          {t.send}
        </Button>
      </div>
      {data?.length ? (
        <ul className="flex flex-col divide-y divide-line">
          {data.map((excuse) => {
            const key = (['Pending', 'Approved', 'Rejected'] as const).find(
              (s) => s === excuse.status,
            );
            return (
              <li key={excuse.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span>
                  <span className="font-medium text-ink">
                    {excuse.date ? formatDate(excuse.date) : '—'}
                  </span>
                  <span className="text-muted"> · {excuse.reason}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Badge tone={key ? tones[key] : 'neutral'} dot>
                    {ar.excuses.statuses[excuse.status] ?? excuse.status}
                  </Badge>
                  {excuse.status === 'Pending' ? (
                    <Button
                      size="sm"
                      variant="neutral"
                      aria-label={t.withdraw}
                      iconStart={<Trash2 aria-hidden />}
                      onClick={async () => {
                        try {
                          await withdraw({ id: excuse.id, studentId }).unwrap();
                          toast.success(t.withdrawn);
                        } catch (caught) {
                          toast.error(toProblem(caught).title);
                        }
                      }}
                    />
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </Card>
  );
}
