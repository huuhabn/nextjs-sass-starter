import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers()
  });
}

export async function requireAuth(redirectTo: string = '/sign-in') {
  const session = await getServerSession();

  if (!session) {
    redirect(redirectTo);
  }

  return session;
}
