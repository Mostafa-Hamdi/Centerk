'use client';

import { MessageCircle, QrCode } from 'lucide-react';
import { ExportButton } from '@/components/data/ExportButton';
import { toast } from '@/components/feedback/toast';
import { Button } from '@/components/ui/Button';
import { ar } from '@/i18n/ar';
import { toProblem } from '@/lib/problem-details';
import { api } from '@/services/api';

/** PDF download + "send to student / guardian" (DocumentSendRequest) + optional QR rotate. */
const documentsApi = api.injectEndpoints({
  endpoints: (build) => ({
    sendDocument: build.mutation<undefined, { path: string; to: 'student' | 'guardian' }>({
      query: ({ path, to }) => ({ url: path, method: 'POST', body: { to } }),
      transformResponse: () => undefined,
    }),
    rotateQr: build.mutation<undefined, string>({
      query: (studentId) => ({
        url: `/students/${encodeURIComponent(studentId)}/qr/rotate`,
        method: 'POST',
      }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, studentId) => [{ type: 'Student', id: studentId }],
    }),
    resendMessage: build.mutation<undefined, string>({
      query: (id) => ({ url: `/messages/${encodeURIComponent(id)}/resend`, method: 'POST' }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Message', id: 'LIST' }],
    }),
  }),
});

export const { useSendDocumentMutation, useRotateQrMutation, useResendMessageMutation } =
  documentsApi;

const t = ar.documents;

interface DocumentActionsProps {
  pdfPath: string;
  fileName: string;
  pdfLabel: string;
  sendPath: string;
  /** Students get the "rotate QR" action. */
  rotateStudentId?: string;
}

export function DocumentActions({
  pdfPath,
  fileName,
  pdfLabel,
  sendPath,
  rotateStudentId,
}: DocumentActionsProps) {
  const [send, sending] = useSendDocumentMutation();
  const [rotate, rotating] = useRotateQrMutation();

  const sendTo = async (to: 'student' | 'guardian') => {
    try {
      await send({ path: sendPath, to }).unwrap();
      toast.success(t.sent);
    } catch (caught) {
      toast.error(toProblem(caught).title);
    }
  };

  const rotateQr = async () => {
    if (!rotateStudentId) return;
    try {
      await rotate(rotateStudentId).unwrap();
      toast.success(t.rotated);
    } catch (caught) {
      toast.error(toProblem(caught).title);
    }
  };

  return (
    <>
      <ExportButton
        path={pdfPath}
        params={{}}
        fileName={fileName}
        extension="pdf"
        label={pdfLabel}
      />
      <Button
        variant="success"
        iconStart={<MessageCircle aria-hidden />}
        loading={sending.isLoading}
        onClick={() => void sendTo('guardian')}
      >
        {t.sendGuardian}
      </Button>
      <Button variant="neutral" onClick={() => void sendTo('student')} disabled={sending.isLoading}>
        {t.sendStudent}
      </Button>
      {rotateStudentId ? (
        <Button
          variant="warning"
          iconStart={<QrCode aria-hidden />}
          loading={rotating.isLoading}
          onClick={() => void rotateQr()}
        >
          {t.rotate}
        </Button>
      ) : null}
    </>
  );
}
