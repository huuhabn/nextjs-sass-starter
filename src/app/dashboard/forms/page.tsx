import { requireAuth } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

export default async function Page() {
  await requireAuth();

  redirect('/dashboard/forms/basic');
}
