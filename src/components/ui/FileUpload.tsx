'use client';

import { FileSpreadsheet, UploadCloud, X } from 'lucide-react';
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';

/** Size limits from backend-spec §19: images ≤ 5 MB, PDF ≤ 15 MB, xlsx ≤ 5 MB. */
export const UPLOAD_PRESETS = {
  xlsx: {
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    maxMb: 5,
    label: 'Excel (.xlsx)',
  },
  image: { accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }, maxMb: 5, label: 'صور' },
  pdf: { accept: { 'application/pdf': ['.pdf'] }, maxMb: 15, label: 'PDF' },
} satisfies Record<string, { accept: Accept; maxMb: number; label: string }>;

interface FileUploadProps {
  preset: keyof typeof UPLOAD_PRESETS;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  id?: string;
  disabled?: boolean;
}

function rejectionMessage(rejections: FileRejection[], maxMb: number): string | undefined {
  const code = rejections[0]?.errors[0]?.code;
  if (!code) return undefined;
  return code === 'file-too-large' ? ar.upload.tooLarge(maxMb) : ar.upload.badType;
}

/** Single-file drop zone (keyboard accessible) validated against the backend limits. Load with next/dynamic. */
export default function FileUpload({
  preset,
  value,
  onChange,
  error,
  id,
  disabled,
}: FileUploadProps) {
  const { accept, maxMb, label } = UPLOAD_PRESETS[preset];
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept,
    maxFiles: 1,
    maxSize: maxMb * 1024 * 1024,
    disabled,
    onDropAccepted: ([file]) => onChange(file ?? null),
  });
  const message = error ?? rejectionMessage([...fileRejections], maxMb);

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-primary-soft bg-primary-tint p-3">
        <span className="flex size-11 items-center justify-center rounded-sm bg-surface text-primary">
          <FileSpreadsheet className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink" dir="ltr">
            {value.name}
          </p>
          <p className="text-xs text-muted tabular">
            {formatNumber(Math.ceil(value.size / 1024))} KB
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label={ar.upload.remove}
          className="flex size-11 items-center justify-center rounded-sm text-muted hover:bg-danger-tint hover:text-danger"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        {...getRootProps({
          className: cn(
            'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-line bg-canvas px-4 py-8 text-center transition-colors duration-200',
            'hover:border-primary hover:bg-primary-tint focus-visible:border-primary',
            isDragActive && 'border-cyan bg-cyan-tint',
            message && 'border-danger bg-danger-tint',
            disabled && 'pointer-events-none opacity-60',
          ),
        })}
      >
        <input {...getInputProps({ id })} />
        <UploadCloud
          className={cn(
            'size-9 text-primary transition-transform duration-300',
            isDragActive && '-translate-y-1 scale-110',
          )}
          aria-hidden
        />
        <p className="font-medium text-ink">
          {isDragActive ? ar.upload.dropNow : ar.upload.prompt}
        </p>
        <p className="text-xs text-muted">{ar.upload.limits(label, maxMb)}</p>
      </div>
      {message ? (
        <p role="alert" className="text-sm text-danger">
          {message}
        </p>
      ) : null}
    </div>
  );
}
