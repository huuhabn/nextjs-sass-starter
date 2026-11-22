import { requireAuth } from '@/lib/auth-server';
import PageContainer from '@/components/layout/page-container';
import FormsShowcasePage from '@/features/forms/components/forms-showcase-page';

export const metadata = {
  title: 'Dashboard: Multi-Step Form'
};

export default async function Page() {
  await requireAuth();

  return (
    <PageContainer pageTitle='Multi-Step Form' pageDescription='Multi-step wizard form pattern.'>
      <FormsShowcasePage />
    </PageContainer>
  );
}
