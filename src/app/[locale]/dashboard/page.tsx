import { requireAuth } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  await requireAuth();
  redirect('/');
}
