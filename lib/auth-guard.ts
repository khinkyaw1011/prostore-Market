import { auth } from '@/auth';
import { redirect } from 'next/navigation';

// Only allow admins; everyone else goes to the unauthorized page
export async function requireAdmin() {
  const session = await auth();

  if (session?.user?.role !== 'admin') {
    redirect('/unauthorized');
  }

  return session;
}
