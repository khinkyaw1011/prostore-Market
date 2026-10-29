import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-guard';
import { getUserById } from '@/lib/actions/user.action';
import UpdateUserForm from './update-user-form';

export const metadata: Metadata = { title: 'Update User' };

export default async function AdminUserUpdatePage(props: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await props.params;

  // getUserById throws when the user doesn't exist
  const user = await getUserById(id).catch(() => null);
  if (!user) notFound();

  return (
    <div className='space-y-8 max-w-lg mx-auto'>
      <h1 className='h2-bold'>Update User</h1>
      <UpdateUserForm
        user={{ id: user.id, name: user.name ?? '', email: user.email, role: user.role ?? 'user' }}
      />
    </div>
  );
}
