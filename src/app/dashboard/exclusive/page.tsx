import { requireAuth } from '@/lib/auth-server';
import ExclusiveView from './exclusive-view';

export default async function Page() {
  await requireAuth();
  return <ExclusiveView />;
}
