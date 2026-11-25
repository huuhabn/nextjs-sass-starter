import { getServerSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await getServerSession();

  if (!session?.user) {
    return redirect('/sign-in');
  }

  redirect('/');
}
