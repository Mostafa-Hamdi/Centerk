'use client';

import { ArrowRight, CheckCircle2, FileSearch, Upload } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from '@/components/feedback/toast';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import FileUpload from '@/components/ui/FileUpload';
import { Select } from '@/components/ui/Select';
import { routes } from '@/config/routes';
import { ar } from '@/i18n/ar';
import { toProblem } from '@/lib/problem-details';
import { selectCurrentBranchId } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import {
  guessMapping,
  IMPORT_FIELDS,
  REQUIRED_IMPORT_FIELDS,
  useCommitStudentImportMutation,
  usePreviewStudentImportMutation,
  type ImportField,
  type ImportPreview,
  type ImportResult,
} from '../importApi';

const t = ar.studentImport;
const SKIP = '__skip__';
const PREVIEW_ROWS = 8;

/** /students/import — upload → map columns (auto-guessed) → commit, with per-row errors. */
export function StudentImportPage() {
  const branchId = useAppSelector(selectCurrentBranchId);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [mapping, setMapping] = useState<Partial<Record<ImportField, string>>>({});
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [runPreview, previewing] = usePreviewStudentImportMutation();
  const [commit, committing] = useCommitStudentImportMutation();

  const reset = () => {
    setFile(null);
    setPreview(null);
    setMapping({});
    setConsent(false);
    setResult(null);
  };

  const loadPreview = async () => {
    if (!file) return;
    try {
      const data = await runPreview(file).unwrap();
      setPreview(data);
      setMapping(guessMapping(data.columns));
    } catch (caught) {
      const problem = toProblem(caught);
      toast.error(problem.title, problem.detail);
    }
  };

  const missing = REQUIRED_IMPORT_FIELDS.filter((field) => !mapping[field]);

  const runCommit = async () => {
    if (!preview) return;
    if (missing.length) {
      toast.error(t.requiredMissing);
      return;
    }
    if (!consent) {
      toast.error(t.consentRequired);
      return;
    }
    try {
      const data = await commit({
        previewId: preview.previewId,
        mapping,
        guardianConsent: consent,
        branchId: branchId ?? undefined,
      }).unwrap();
      setResult(data);
      toast.success(t.result(data.created, data.skipped));
    } catch (caught) {
      const problem = toProblem(caught);
      toast.error(problem.title, problem.detail);
    }
  };

  const invalidRows = preview?.rows.filter((row) => row.errors.length).length ?? 0;
  const step = result ? 'done' : preview ? 'map' : 'upload';

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-(--shell-gap)">
      <header>
        <Link
          href={routes.students.list}
          className="flex items-center gap-2 text-sm text-muted hover:text-primary"
        >
          <ArrowRight className="size-4" aria-hidden />
          {ar.students.title}
        </Link>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">{t.title}</h1>
        <p className="mt-1 text-muted">{t.description}</p>
      </header>

      <ol className="flex flex-wrap gap-2" aria-label={t.title}>
        {(['upload', 'map', 'done'] as const).map((key, index) => (
          <li key={key}>
            <Badge
              tone={key === step ? 'primary' : 'neutral'}
              aria-current={key === step ? 'step' : undefined}
            >
              {index + 1}. {t.steps[key]}
            </Badge>
          </li>
        ))}
      </ol>

      {step === 'upload' ? (
        <Card className="flex flex-col gap-4 p-6">
          <FileUpload preset="xlsx" value={file} onChange={setFile} />
          <div>
            <Button
              iconStart={<FileSearch aria-hidden />}
              disabled={!file}
              loading={previewing.isLoading}
              onClick={() => void loadPreview()}
            >
              {t.preview}
            </Button>
          </div>
        </Card>
      ) : null}

      {step === 'map' && preview ? (
        <>
          <Card className="flex flex-col gap-4 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-lg font-bold text-ink">{t.mappingTitle}</h2>
              <Badge>{t.rowsCount(preview.rows.length)}</Badge>
              {invalidRows ? <Badge tone="danger">{t.invalidCount(invalidRows)}</Badge> : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {IMPORT_FIELDS.map((field) => {
                const required = REQUIRED_IMPORT_FIELDS.includes(field);
                return (
                  <label key={field} className="flex flex-col gap-1 text-sm font-medium text-ink">
                    <span>
                      {t.fields[field]}
                      {required ? <span className="text-danger"> *</span> : null}
                    </span>
                    <Select
                      value={mapping[field] ?? SKIP}
                      onValueChange={(value) =>
                        setMapping((current) =>
                          Object.fromEntries(
                            Object.entries({ ...current, [field]: value }).filter(
                              ([, column]) => column !== SKIP,
                            ),
                          ),
                        )
                      }
                      options={[
                        { value: SKIP, label: t.skipColumn },
                        ...preview.columns.map((column) => ({ value: column, label: column })),
                      ]}
                    />
                  </label>
                );
              })}
            </div>
            {missing.length ? <p className="text-sm text-danger">{t.requiredMissing}</p> : null}
          </Card>

          <Card className="flex flex-col gap-3 p-6">
            <h2 className="font-semibold text-ink">{t.previewTitle}</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-sm">
                <thead>
                  <tr className="border-b border-line text-start text-muted">
                    <th className="p-2 text-start font-medium">#</th>
                    {preview.columns.map((column) => (
                      <th key={column} className="p-2 text-start font-medium">
                        {column}
                      </th>
                    ))}
                    <th className="p-2 text-start font-medium">{t.rowErrors}</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.slice(0, PREVIEW_ROWS).map((row) => (
                    <tr
                      key={row.rowNumber}
                      className={row.errors.length ? 'bg-danger-tint/40' : undefined}
                    >
                      <td className="p-2 text-muted tabular">{row.rowNumber}</td>
                      {preview.columns.map((column) => (
                        <td key={column} className="p-2 text-ink">
                          {row.values[column] ?? ''}
                        </td>
                      ))}
                      <td className="p-2 text-danger">{row.errors.join('، ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
            <Checkbox checked={consent} onCheckedChange={setConsent} label={t.consent} />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={reset}>
                {ar.common.cancel}
              </Button>
              <Button
                variant="success"
                iconStart={<Upload aria-hidden />}
                loading={committing.isLoading}
                onClick={() => void runCommit()}
              >
                {t.commit}
              </Button>
            </div>
          </Card>
        </>
      ) : null}

      {step === 'done' && result ? (
        <Card className="flex flex-col gap-4 p-6">
          <p className="flex items-center gap-2 font-display text-lg font-bold text-success">
            <CheckCircle2 className="size-6" aria-hidden />
            {t.result(result.created, result.skipped)}
          </p>
          {result.errors.length ? (
            <div>
              <h2 className="mb-2 font-semibold text-ink">{t.resultErrors}</h2>
              <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto text-sm">
                {result.errors.map((error, index) => (
                  <li key={`${error.rowNumber}-${index}`} className="text-danger">
                    {t.row(error.rowNumber)}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex gap-2">
            <Link href={routes.students.list} className={buttonVariants()}>
              {ar.students.title}
            </Link>
            <Button variant="ghost" onClick={reset}>
              {t.another}
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
