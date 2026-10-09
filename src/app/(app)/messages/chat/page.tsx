import type { Metadata } from 'next';
import { ChatView } from '@/features/chat/ChatView';
import { MessagesHeader } from '@/features/messages/components/MessagesHeader';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: ar.chat.title };

export default function Page() {
  return (
    <div className="flex flex-col gap-(--shell-gap)">
      <MessagesHeader />
      <ChatView base="/threads" />
    </div>
  );
}
