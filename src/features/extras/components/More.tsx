'use client';

import { format } from 'date-fns';
import { AlertTriangle, CalendarRange, Copy, FileUp, Send, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Combobox } from '@/components/ui/Combobox';
import FileUpload from '@/components/ui/FileUpload';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { routes } from '@/config/routes';
import { Can } from '@/features/auth/components/Can';
import { useGetStudentsQuery } from '@/features/students/api';
import { ar } from '@/i18n/ar';
import { formatDateTime, formatNumber } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import {
  useCancelMaterialRecordMutation,
  useDuplicateGroupMutation,
  useGenerateSessionsMutation,
  useGetMessagingUsageQuery,
  useGetRecurrenceQuery,
  useImportQuestionsMutation,
  useSendDirectMessageMutation,
  useSetRecurrenceMutation,
  type ImportResult,
} from '../api3';

const t = ar.more;
const fail = (caught: unknown) => {
  const problem = toProblem(caught);
  toast.error(problem.title, problem.detail);
};

/** Question bank: Excel import with per-row errors (POST /questions/import, Idempotency-Key). */
export function QuestionImportCard() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importQuestions, importing] = useImportQuestionsMutation();
  return (
    <Can permission="questions.create">
      <Card className="flex flex-col gap-3 p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <FileUp className="size-5 text-primary" aria-hidden />
          {t.importQuestions}
        </h2>
        <p className="text-sm text-muted">{t.importHint}</p>
        <FileUpload preset="xlsx" value={file} onChange={setFile} />
        <div>
          <Button
            disabled={!file}
            loading={importing.isLoading}
            onClick={async () => {
              if (!file) return;
              try {
                const data = await importQuestions(file).unwrap();
                setResult(data);
                setFile(null);
                toast.success(t.imported(data.created, data.skipped));
              } catch (caught) {
                fail(caught);
              }
            }}
          >
            {t.importRun}
          </Button>
        </div>
        {result?.errors.length ? (
          <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto text-sm text-danger">
            {result.errors.map((error, index) => (
              <li key={`${error.rowNumber}-${index}`}>
                {t.row(error.rowNumber)}: {error.message}
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    </Can>
  );
}

/** Messages log: queue counters + a direct message to one student's guardian. */
export function MessagingToolsCard() {
  const usage = useGetMessagingUsageQuery(undefined);
  const [search, setSearch] = useState('');
  const [studentId, setStudentId] = useState<string | undefined>();
  const [channel, setChannel] = useState<'WhatsApp' | 'Sms'>('WhatsApp');
  const [body, setBody] = useState('');
  const students = useGetStudentsQuery({ search, page: 1, pageSize: 20, filters: {} });
  const [send, sending] = useSendDirectMessageMutation();

  return (
    <Card className="grid gap-5 p-5 lg:grid-cols-[1fr_1.4fr]">
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          {(['pending', 'delivered', 'failed', 'cancelled'] as const).map((key) => (
            <div key={key} className="rounded-md bg-canvas p-3 text-center">
              <p className="font-display text-2xl font-bold text-ink tabular">
                {formatNumber(usage.data?.[key] ?? 0)}
              </p>
              <p className="text-xs text-muted">{t.usage[key]}</p>
            </div>
          ))}
        </div>
        {usage.data && !usage.data.providerConfigured ? (
          <p className="flex items-center gap-2 rounded-md bg-warning-tint p-2 text-xs text-warning">
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            {t.providerOff}
          </p>
        ) : null}
      </div>
      <Can permission="messages.create">
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-bold text-ink">{t.direct}</h2>
          <div className="grid gap-2 sm:grid-cols-[1fr_9rem]">
            <Combobox
              aria-label={t.directStudent}
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
            <Select
              aria-label={t.channel}
              value={channel}
              onValueChange={(value) => setChannel(value as 'WhatsApp' | 'Sms')}
              options={(['WhatsApp', 'Sms'] as const).map((value) => ({
                value,
                label: ar.messages.channels[value] ?? value,
              }))}
            />
          </div>
          <Textarea
            rows={3}
            placeholder={t.body}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
          <div>
            <Button
              iconStart={<Send aria-hidden />}
              disabled={!studentId || !body.trim()}
              loading={sending.isLoading}
              onClick={async () => {
                if (!studentId) return;
                try {
                  await send({ studentId, channel, body: body.trim() }).unwrap();
                  toast.success(t.directSent);
                  setBody('');
                } catch (caught) {
                  fail(caught);
                }
              }}
            >
              {t.sendDirect}
            </Button>
          </div>
        </div>
      </Can>
    </Card>
  );
}

/** Group details: duplicate, generate sessions, automatic recurrence settings. */
export function GroupToolsCard({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [duplicate, duplicating] = useDuplicateGroupMutation();
  const [generate, generating] = useGenerateSessionsMutation();
  const recurrence = useGetRecurrenceQuery(groupId);
  const [saveRecurrence, saving] = useSetRecurrenceMutation();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [fromDate, setFromDate] = useState(today);
  const [days, setDays] = useState('14');
  const [enabled, setEnabled] = useState(false);
  const [startsOn, setStartsOn] = useState(today);
  const [endsOn, setEndsOn] = useState('');
  const [horizon, setHorizon] = useState('14');

  useEffect(() => {
    if (!recurrence.data) return;
    setEnabled(recurrence.data.enabled);
    setStartsOn(recurrence.data.startsOn ?? today);
    setEndsOn(recurrence.data.endsOn ?? '');
    setHorizon(String(recurrence.data.horizonDays));
  }, [recurrence.data, today]);

  const dayCount = Number(days);
  const horizonDays = Number(horizon);

  return (
    <Can permission="sessions.manage">
      <Card className="flex flex-col gap-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
            <CalendarRange className="size-5 text-primary" aria-hidden />
            {t.groupTools}
          </h2>
          <Button
            variant="neutral"
            iconStart={<Copy aria-hidden />}
            loading={duplicating.isLoading}
            onClick={async () => {
              try {
                const copy = await duplicate(groupId).unwrap();
                toast.success(t.duplicated);
                if (copy.id) router.push(routes.groups.edit(copy.id));
              } catch (caught) {
                fail(caught);
              }
            }}
          >
            {t.duplicate}
          </Button>
        </div>

        <div className="grid items-end gap-3 rounded-md bg-canvas p-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            {t.fromDate}
            <Input
              type="date"
              dir="ltr"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            {t.days}
            <Input
              inputMode="numeric"
              dir="ltr"
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
          </label>
          <Button
            disabled={!fromDate || !(dayCount >= 1 && dayCount <= 90)}
            loading={generating.isLoading}
            onClick={async () => {
              try {
                const result = await generate({ id: groupId, fromDate, days: dayCount }).unwrap();
                toast.success(t.generated(result.created));
              } catch (caught) {
                fail(caught);
              }
            }}
          >
            {t.generate}
          </Button>
        </div>

        <div className="flex flex-col gap-3 rounded-md bg-canvas p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Switch checked={enabled} onCheckedChange={setEnabled} label={t.recurrence} />
            {recurrence.data?.nextRefreshAt ? (
              <Badge>{t.nextRefresh(formatDateTime(recurrence.data.nextRefreshAt))}</Badge>
            ) : null}
          </div>
          <div className="grid items-end gap-3 sm:grid-cols-4">
            <label className="flex flex-col gap-1 text-sm font-medium text-ink">
              {t.startsOn}
              <Input
                type="date"
                dir="ltr"
                value={startsOn}
                onChange={(event) => setStartsOn(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-ink">
              {t.endsOn}
              <Input
                type="date"
                dir="ltr"
                value={endsOn}
                onChange={(event) => setEndsOn(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-ink">
              {t.horizon}
              <Input
                inputMode="numeric"
                dir="ltr"
                value={horizon}
                onChange={(event) => setHorizon(event.target.value)}
              />
            </label>
            <Button
              disabled={!startsOn || !(horizonDays >= 7 && horizonDays <= 90)}
              loading={saving.isLoading}
              onClick={async () => {
                try {
                  await saveRecurrence({
                    id: groupId,
                    enabled,
                    startsOn,
                    endsOn: endsOn || null,
                    horizonDays,
                  }).unwrap();
                  toast.success(t.recurrenceSaved);
                } catch (caught) {
                  fail(caught);
                }
              }}
            >
              {ar.common.save}
            </Button>
          </div>
        </div>
      </Card>
    </Can>
  );
}

/** Materials: cancel a manual stock movement or a delivery (reverses stock, needs a reason). */
export function CancelMaterialRecordButton({
  kind,
  id,
  materialId,
  label,
}: {
  kind: 'stock-movements' | 'material-deliveries';
  id: string;
  materialId: string;
  label: string;
}) {
  const [cancel] = useCancelMaterialRecordMutation();
  const [open, setOpen] = useState(false);
  const title = kind === 'stock-movements' ? t.cancelMovement : t.cancelDelivery;
  return (
    <Can permission="materials.update">
      <Button
        size="sm"
        variant="ghost"
        aria-label={`${title} ${label}`}
        iconStart={<Trash2 aria-hidden />}
        onClick={() => setOpen(true)}
      />
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        questionPrefix={t.cancelQuestion}
        itemName={label}
        description=""
        confirmLabel={title}
        requireReason
        onConfirm={async (reason) => {
          try {
            await cancel({ kind, id, materialId, reason: reason ?? '' }).unwrap();
            toast.success(t.cancelledDone);
          } catch (caught) {
            fail(caught);
            throw caught;
          }
        }}
      />
    </Can>
  );
}
