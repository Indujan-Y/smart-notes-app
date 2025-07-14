import { getInitialUser } from '@/lib/firebase-admin';
import { getUserNotes } from '@/services/notes';
import { DashboardClient } from '@/components/DashboardClient';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getInitialUser();

  if (!user) {
    // This should theoretically not be reached if middleware is set up correctly,
    // but it's a good fallback.
    redirect('/');
  }

  const notes = await getUserNotes(user.uid);

  return <DashboardClient initialNotes={notes} user={user} />;
}
