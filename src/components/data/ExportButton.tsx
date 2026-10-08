'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/feedback/toast';
import { Button } from '@/components/ui/Button';
import { ar } from '@/i18n/ar';
import { env } from '@/lib/env';
import { toProblem } from '@/lib/problem-details';
import { selectAccessToken, selectCurrentBranchId } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';

interface ExportButtonProps {
  /** e.g. "/students/export" — backend-spec §10: same filters as the list, `format=xlsx`. */
  path: string;
  params: Record<string, string | number>;
  fileName: string;
  /** "csv" for endpoints that already return CSV (e.g. /reports/students.csv). */
  extension?: 'xlsx' | 'csv';
  label?: string;
}

/** Downloads `GET {resource}/export?format=xlsx&…filters` (or a CSV endpoint) as a file (needs `*.export`). */
export function ExportButton({
  path,
  params,
  fileName,
  extension = 'xlsx',
  label = ar.common.export,
}: ExportButtonProps) {
  const token = useAppSelector(selectAccessToken);
  const branchId = useAppSelector(selectCurrentBranchId);
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    const query = new URLSearchParams({
      ...(extension === 'xlsx' ? { format: 'xlsx' } : {}),
      ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    });
    try {
      const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}?${query.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(branchId ? { 'X-Branch-Id': branchId } : {}),
          'Accept-Language': 'ar',
        },
      });
      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        toast.error(toProblem({ status: response.status, data }).title);
        return;
      }
      const url = URL.createObjectURL(await response.blob());
      const link = Object.assign(document.createElement('a'), {
        href: url,
        download: `${fileName}.${extension}`,
      });
      link.click();
      URL.revokeObjectURL(url);
      toast.success(ar.list.exported);
    } catch (error) {
      toast.error(toProblem(error).title);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant="info"
      loading={busy}
      iconStart={<Download aria-hidden />}
      onClick={() => void download()}
    >
      {label}
    </Button>
  );
}
