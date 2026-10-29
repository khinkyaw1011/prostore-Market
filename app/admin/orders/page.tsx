import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth-guard';
import { deleteOrder, getAllOrders } from '@/lib/actions/order.action';
import DeleteDialog from '@/components/shared/delete-dialog';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import Pagination from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const metadata: Metadata = { title: 'Admin Orders' };

export default async function AdminOrdersPage(props: PageProps<'/admin/orders'>) {
  await requireAdmin();

  const { page = '1', query: searchText = '' } = await props.searchParams;
  const orders = await getAllOrders({ page: Number(page) || 1, query: String(searchText) });

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-3'>
        <h2 className='h2-bold'>Orders</h2>
        {searchText && (
          <div>
            Filtered by <i>&quot;{searchText}&quot;</i>{' '}
            <Link href='/admin/orders'>
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
              <TableHead>BUYER</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead>TOTAL</TableHead>
              <TableHead>PAID</TableHead>
              <TableHead>DELIVERED</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='text-center text-muted-foreground'>
                  No orders yet
                </TableCell>
              </TableRow>
            ) : (
              orders.data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{formatId(order.id)}</TableCell>
                  <TableCell>{order.user?.name}</TableCell>
                  <TableCell>{formatDateTime(order.createdAt).dateTime}</TableCell>
                  <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                  <TableCell>
                    {order.isPaid && order.paidAt
                      ? formatDateTime(order.paidAt).dateTime
                      : 'Not Paid'}
                  </TableCell>
                  <TableCell>
                    {order.isDelivered && order.deliveredAt
                      ? formatDateTime(order.deliveredAt).dateTime
                      : 'Not Delivered'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='outline'
                      size='sm'
                      nativeButton={false}
                      render={<Link href={`/order/${order.id}`} />}
                    >
                      Details
                    </Button>
                    <DeleteDialog id={order.id} action={deleteOrder} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {orders.totalPages > 1 && (
          <Pagination page={Number(page) || 1} totalPages={orders.totalPages} />
        )}
      </div>
    </div>
  );
}
