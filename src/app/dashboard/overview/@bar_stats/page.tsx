import { requireAuth } from '@/lib/auth-server';
import { delay } from '@/const/mock-api';
import { BarGraph } from '@/features/overview/components/bar-graph';

export default async function BarStats() {
  await requireAuth();

  await delay(1000);

  return <BarGraph />;
}
