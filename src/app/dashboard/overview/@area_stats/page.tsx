import { requireAuth } from '@/lib/auth-server';
import { delay } from '@/const/mock-api';
import { AreaGraph } from '@/features/overview/components/area-graph';

export default async function AreaStats() {
  await requireAuth();

  await delay(2000);
  return <AreaGraph />;
}
