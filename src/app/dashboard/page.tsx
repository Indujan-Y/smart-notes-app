import { auth, getInitialUser } from '@/lib/firebase-admin';
import { getUserNotes } from '@/services/notes';
import { DashboardClient } from '@/components/DashboardClient';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  let user;
  try {
    user = await getInitialUser();
  } catch (e) {
    // Errors during token verification can happen, we'll treat as not logged in.
    console.error("Auth error:", e);
  }

  if (!user) {
    // If no user is found after checking, then redirect.
    redirect('/');
  }

  const notes = await getUserNotes(user.uid);

  return <DashboardClient initialNotes={notes} user={user} />;
}
