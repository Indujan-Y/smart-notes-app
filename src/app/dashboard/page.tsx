import { auth } from '@/lib/firebase-admin';
import { getUserNotes } from '@/services/notes';
import { DashboardClient } from '@/components/DashboardClient';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  let user;
  try {
    user = await auth.getInitialUser();
  } catch (e) {
    // Not logged in, redirect to login
    redirect('/');
  }

  if (!user) {
    redirect('/');
  }

  const notes = await getUserNotes(user.uid);

  return <DashboardClient initialNotes={notes} user={user} />;
}
