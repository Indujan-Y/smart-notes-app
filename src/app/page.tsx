import { getUserNotes } from '@/services/notes';
import { DashboardClient } from '@/components/DashboardClient';

// Hardcoded user for a single-user experience
const FAKE_USER_ID = 'default-user';

export default async function DashboardPage() {
  const notes = await getUserNotes(FAKE_USER_ID);

  return <DashboardClient initialNotes={notes} userId={FAKE_USER_ID} />;
}
