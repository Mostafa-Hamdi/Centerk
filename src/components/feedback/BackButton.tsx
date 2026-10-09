'use client';

import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

/** Goes back one entry in the browser history. */
export function BackButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <Button
      variant="neutral"
      size="lg"
      iconStart={<ArrowRight aria-hidden />}
      onClick={() => router.back()}
    >
      {label}
    </Button>
  );
}
