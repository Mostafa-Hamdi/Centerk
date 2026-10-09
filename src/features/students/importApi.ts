import { api } from '@/services/api';
import { read, readNumber, readString } from '@/services/normalize';

/** Excel import — live POST /students/import/preview (multipart) → commit {previewId, mapping}. */
export interface ImportPreview {
  previewId: string;
  columns: string[];
  rows: { rowNumber: number; values: Record<string, string>; errors: string[] }[];
}

export interface ImportResult {
  created: number;
  skipped: number;
  errors: { rowNumber: number; message: string }[];
}

/** Student fields a sheet column can map to (mapping is sent as { field: column }). */
export const IMPORT_FIELDS = [
  'fullName',
  'phone',
  'parentName',
  'parentPhone',
  'gradeLevel',
  'school',
  'code',
  'notes',
] as const;
export type ImportField = (typeof IMPORT_FIELDS)[number];
export const REQUIRED_IMPORT_FIELDS: readonly ImportField[] = ['fullName', 'parentPhone'];

const strings = (value: unknown): string[] =>
  Array.isArray(value)
    ? (value as unknown[]).filter((item): item is string => typeof item === 'string')
    : [];

const importApi = api.injectEndpoints({
  endpoints: (build) => ({
    previewStudentImport: build.mutation<ImportPreview, File>({
      query: (file) => {
        const body = new FormData();
        body.append('file', file);
        return { url: '/students/import/preview', method: 'POST', body };
      },
      transformResponse: (raw: unknown) => {
        const rows = read(raw, 'rows');
        return {
          previewId: readString(raw, 'previewId') ?? '',
          columns: strings(read(raw, 'columns')),
          rows: Array.isArray(rows)
            ? (rows as unknown[]).map((row, index) => {
                const values = read(row, 'values');
                return {
                  rowNumber: readNumber(row, 'rowNumber') ?? index + 2,
                  values:
                    values && typeof values === 'object'
                      ? Object.fromEntries(
                          Object.entries(values).map(([key, value]) => [key, String(value ?? '')]),
                        )
                      : {},
                  errors: strings(read(row, 'errors')),
                };
              })
            : [],
        };
      },
    }),
    commitStudentImport: build.mutation<
      ImportResult,
      {
        previewId: string;
        mapping: Partial<Record<ImportField, string>>;
        guardianConsent: boolean;
        branchId?: string;
      }
    >({
      query: (body) => ({ url: '/students/import/commit', method: 'POST', body }),
      transformResponse: (raw: unknown) => {
        const errors = read(raw, 'errors');
        return {
          created: readNumber(raw, 'created') ?? 0,
          skipped: readNumber(raw, 'skipped') ?? 0,
          errors: Array.isArray(errors)
            ? (errors as unknown[]).map((error) => ({
                rowNumber: readNumber(error, 'rowNumber') ?? 0,
                message: readString(error, 'message', 'code') ?? '',
              }))
            : [],
        };
      },
      invalidatesTags: [{ type: 'Student', id: 'LIST' }, 'Dashboard'],
    }),
  }),
});

export const { usePreviewStudentImportMutation, useCommitStudentImportMutation } = importApi;

/** Guesses the sheet column for each field from Arabic / English headers. */
export function guessMapping(columns: readonly string[]): Partial<Record<ImportField, string>> {
  const hints: Record<ImportField, RegExp> = {
    fullName: /(اسم الطالب|^الاسم|full ?name|student ?name|^name)/i,
    phone: /(موبايل الطالب|تليفون الطالب|رقم الطالب|student ?phone|^phone|^mobile)/i,
    parentName: /(ولي الأمر|اسم الأب|parent ?name|guardian ?name)/i,
    parentPhone: /(موبايل ولي|رقم ولي|تليفون ولي|parent ?phone|guardian ?phone)/i,
    gradeLevel: /(الصف|السنة|grade)/i,
    school: /(المدرسة|school)/i,
    code: /(الكود|code)/i,
    notes: /(ملاحظات|notes)/i,
  };
  const mapping: Partial<Record<ImportField, string>> = {};
  // Most specific first so «موبايل ولي الأمر» lands on parentPhone, not parentName.
  const order: readonly ImportField[] = [
    'parentPhone',
    'phone',
    'parentName',
    'fullName',
    'gradeLevel',
    'school',
    'code',
    'notes',
  ];
  for (const field of order) {
    const match = columns.find(
      (column) => hints[field].test(column.trim()) && !Object.values(mapping).includes(column),
    );
    if (match) mapping[field] = match;
  }
  return mapping;
}
