import { requireAuth } from '@/lib/auth-server';
import BillingView from './billing-view';

export default async function Page() {
  await requireAuth();
  return <BillingView />;
}
