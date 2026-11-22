import { requireAuth } from '@/lib/auth-server';
import PageContainer from '@/components/layout/page-container';
import { AiChatDemo } from '@/features/ai-chat/components/ai-chat-demo';

export const metadata = {
  title: 'Dashboard: AI Chat'
};

export default async function Page() {
  await requireAuth();

  return (
    <PageContainer>
      <AiChatDemo />
    </PageContainer>
  );
}
