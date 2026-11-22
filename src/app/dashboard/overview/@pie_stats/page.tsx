import { requireAuth } from '@/lib/auth-server';
import { delay } from '@/const/mock-api';
import { PieGraph } from '@/features/overview/components/pie-graph';

export default async function Stats() {
  await requireAuth();

  await delay(1000);
  return <PieGraph />;
}
