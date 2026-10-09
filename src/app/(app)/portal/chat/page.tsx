import type { Metadata } from 'next';
import { ChatView } from '@/features/chat/ChatView';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.chat.title };

export default function Page() {
  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <h1 className="font-display text-2xl font-bold text-ink">{ar.chat.title}</h1>
      <ChatView base="/portal/threads" />
    </div>
  );
}
