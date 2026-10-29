import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth-guard';
import { deleteUser, getAllUsers } from '@/lib/actions/user.action';
import DeleteDialog from '@/components/shared/delete-dialog';
import { formatId } from '@/lib/utils';
import Pagination from '@/components/shared/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const metadata: Metadata = { title: 'Admin Users' };

export default async function AdminUserPage(props: PageProps<'/admin/users'>) {
  await requireAdmin();

  const { page = '1', query: searchText = '' } = await props.searchParams;
  const users = await getAllUsers({ page: Number(page) || 1, query: String(searchText) });

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-3'>
        <h2 className='h2-bold'>Users</h2>
        {searchText && (
          <div>
            Filtered by <i>&quot;{searchText}&quot;</i>{' '}
            <Link href='/admin/users'>
              <Button variant='outline' size='sm'>
                Remove Filter
              </Button>
            </Link>
          </div>
        )}
      </div>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>NAME</TableHead>
              <TableHead>EMAIL</TableHead>
              <TableHead>ROLE</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center text-muted-foreground'>
                  No users yet
                </TableCell>
              </TableRow>
            ) : (
              users.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{formatId(user.id)}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.role === 'user' ? (
                      <Badge variant='secondary' className='rounded-full px-3'>User</Badge>
                    ) : (
                      <Badge variant='default' className='rounded-full px-3'>Admin</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='outline'
                      size='sm'
                      nativeButton={false}
                      render={<Link href={`/admin/users/${user.id}`} />}
                    >
                      Edit
                    </Button>
                    <DeleteDialog id={user.id} action={deleteUser} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {users.totalPages > 1 && (
          <Pagination page={Number(page) || 1} totalPages={users.totalPages} />
        )}
      </div>
    </div>
  );
}
