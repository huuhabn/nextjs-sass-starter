import { auth } from '@clerk/nextjs/server';
import { delay } from '@/const/mock-api';
import { PieGraph } from '@/features/overview/components/pie-graph';

export default async function Stats() {
  await auth.protect();

  await delay(1000);
  return <PieGraph />;
}
