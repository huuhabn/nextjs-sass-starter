import { requireAuth } from '@/lib/auth-server';
import IconsViewPage from '@/features/elements/components/icons-view-page';

export const metadata = {
  title: 'Dashboard : Icons'
};

export default async function page() {
  await requireAuth();

  return <IconsViewPage />;
}
