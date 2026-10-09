'use client';

import { CloudDownload, CloudUpload, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Can } from '@/features/auth/components/Can';
import { ar } from '@/i18n/ar';
import { formatNumber } from '@/lib/format';
import { toProblem } from '@/lib/problem-details';
import { api } from '@/services/api';
import { read, readString } from '@/services/normalize';

interface PackStudent {
  id: string;
  code: string | null;
  fullName: string;
}

interface QueuedScan {
  sessionId: string;
  code: string;
  scannedAt: string;
  clientRecordId: string;
  deviceId: string;
}

/** Offline attendance — GET /sessions/{id}/offline-pack, queue scans locally, POST /attendance/sync. */
const offlineApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOfflinePack: build.mutation<PackStudent[], string>({
      query: (sessionId) => `/sessions/${encodeURIComponent(sessionId)}/offline-pack`,
      transformResponse: (raw: unknown) => {
        const roster = read(raw, 'roster');
        return Array.isArray(roster)
          ? (roster as unknown[]).map((item, index) => ({
              id: readString(item, 'id') ?? `student-${index}`,
              code: readString(item, 'code'),
              fullName: readString(item, 'fullName') ?? '—',
            }))
          : [];
      },
    }),
    syncAttendance: build.mutation<undefined, { deviceId: string; items: QueuedScan[] }>({
      query: (body) => ({ url: '/attendance/sync', method: 'POST', body }),
      transformResponse: () => undefined,
      invalidatesTags: ['Attendance', 'Dashboard'],
    }),
  }),
});

const { useGetOfflinePackMutation, useSyncAttendanceMutation } = offlineApi;
const t = ar.offline;

// Local storage is best-effort: private mode or blocked storage just disables offline mode.
const load = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};
const save = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
};
const deviceId = () => {
  const existing = load<string | null>('ck.deviceId', null);
  if (existing) return existing;
  const id = crypto.randomUUID();
  save('ck.deviceId', id);
  return id;
};

export function OfflineAttendanceCard({ sessionId }: { sessionId: string }) {
  const packKey = `ck.offline.pack.${sessionId}`;
  const queueKey = `ck.offline.queue.${sessionId}`;
  const [pack, setPack] = useState<PackStudent[]>([]);
  const [queue, setQueue] = useState<QueuedScan[]>([]);
  const [download, downloading] = useGetOfflinePackMutation();
  const [sync, syncing] = useSyncAttendanceMutation();

  useEffect(() => {
    setPack(load<PackStudent[]>(packKey, []));
    setQueue(load<QueuedScan[]>(queueKey, []));
  }, [packKey, queueKey]);

  const marked = new Set(queue.map((item) => item.code));

  const mark = (student: PackStudent) => {
    if (!student.code || marked.has(student.code)) return;
    const next = [
      ...queue,
      {
        sessionId,
        code: student.code,
        scannedAt: new Date().toISOString(),
        clientRecordId: crypto.randomUUID(),
        deviceId: deviceId(),
      },
    ];
    setQueue(next);
    save(queueKey, next);
  };

  const unmark = (code: string | null) => {
    const next = queue.filter((item) => item.code !== code);
    setQueue(next);
    save(queueKey, next);
  };

  return (
    <Can permission="attendance.create">
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
            <WifiOff className="size-5 text-muted" aria-hidden />
            {t.title}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="neutral"
              iconStart={<CloudDownload aria-hidden />}
              loading={downloading.isLoading}
              onClick={async () => {
                try {
                  const roster = await download(sessionId).unwrap();
                  setPack(roster);
                  save(packKey, roster);
                  toast.success(t.ready(roster.length));
                } catch (caught) {
                  toast.error(toProblem(caught).title);
                }
              }}
            >
              {t.prepare}
            </Button>
            <Button
              variant="success"
              iconStart={<CloudUpload aria-hidden />}
              disabled={!queue.length}
              loading={syncing.isLoading}
              onClick={async () => {
                try {
                  for (let index = 0; index < queue.length; index += 200) {
                    await sync({
                      deviceId: deviceId(),
                      items: queue.slice(index, index + 200),
                    }).unwrap();
                  }
                  toast.success(t.synced(queue.length));
                  setQueue([]);
                  save(queueKey, []);
                } catch (caught) {
                  toast.error(toProblem(caught).title, t.keepQueue);
                }
              }}
            >
              {t.sync(queue.length)}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted">{t.hint}</p>
        {pack.length ? (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {pack.map((student) => {
              const present = student.code ? marked.has(student.code) : false;
              return (
                <li key={student.id}>
                  <button
                    type="button"
                    disabled={!student.code}
                    onClick={() => (present ? unmark(student.code) : mark(student))}
                    className={
                      present
                        ? 'flex w-full items-center justify-between gap-2 rounded-md border border-success bg-success-tint px-3 py-2 text-start text-sm'
                        : 'flex w-full items-center justify-between gap-2 rounded-md border border-line px-3 py-2 text-start text-sm hover:border-primary'
                    }
                  >
                    <span className="font-medium text-ink">{student.fullName}</span>
                    {present ? <Badge tone="success">{t.present}</Badge> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t.noPack}</p>
        )}
        {queue.length ? (
          <p className="text-xs text-muted">{t.queued(formatNumber(queue.length))}</p>
        ) : null}
      </Card>
    </Can>
  );
}
