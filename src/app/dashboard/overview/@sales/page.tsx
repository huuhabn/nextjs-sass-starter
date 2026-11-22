import { requireAuth } from '@/lib/auth-server';
import { delay } from '@/const/mock-api';
import { RecentSales } from '@/features/overview/components/recent-sales';

export default async function Sales() {
  await requireAuth();

  await delay(3000);
  return <RecentSales />;
}
