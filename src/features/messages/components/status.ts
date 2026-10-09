import type { VariantProps } from 'class-variance-authority';
import type { badgeVariants } from '@/components/ui/Badge';
import { ar } from '@/i18n/ar';

type Tone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;

const tones: Record<string, Tone> = {
  failed: 'danger',
  cancelled: 'danger',
  sent: 'success',
  delivered: 'success',
  read: 'success',
  completed: 'success',
  draft: 'neutral',
};

/** Outbox / campaign status → badge tone + Arabic label (unknown values pass through). */
export const messageStatus = (status: string): { tone: Tone; label: string } => ({
  tone: tones[status.toLowerCase()] ?? 'info',
  label: ar.messages.status[status] ?? status,
});
