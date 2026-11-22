import { requireAuth } from '@/lib/auth-server';
import ChatViewPage from '@/features/chat/components/chat-view-page';

export const metadata = {
  title: 'Dashboard: Chat'
};

export default async function Page() {
  await requireAuth();

  return <ChatViewPage />;
}
