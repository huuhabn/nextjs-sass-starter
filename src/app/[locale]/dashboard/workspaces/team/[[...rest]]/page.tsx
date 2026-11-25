import { requireAuth } from '@/lib/auth-server';
import TeamView from './team-view';

export default async function Page() {
  await requireAuth();
  return <TeamView />;
}
