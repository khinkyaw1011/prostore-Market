import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgeDollarSign, Barcode, CreditCard, Users } from 'lucide-react';
import { requireAdmin } from '@/lib/auth-guard';
import { getOrderSummary } from '@/lib/actions/order.action';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Charts from './charts';
import CountUp from './count-up';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default async function AdminOverviewPage() {
  const session = await requireAdmin();

  const summary = await getOrderSummary();

  const stats = [
    { title: 'Sales', value: summary.ordersCount, icon: CreditCard },
    { title: 'Customers', value: summary.usersCount, icon: Users },
    { title: 'Products', value: summary.productsCount, icon: Barcode },
  ];

  return (
    <div className='space-y-4'>
      <div>
        <h1 className='h2-bold'>Welcome back, {session?.user?.name}</h1>
        <p className='text-sm text-muted-foreground'>
          Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='glass-card-accent'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-white/80'>Total Revenue</CardTitle>
            <span className='flex size-9 items-center justify-center rounded-full bg-white/20'>
              <BadgeDollarSign className='size-5' />
            </span>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              <CountUp value={summary.totalSales._sum.totalPrice || 0} format='currency' />
            </div>
          </CardContent>
        </Card>

        {stats.map(({ title, value, icon: Icon }) => (
          <Card key={title} className='glass-card'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>{title}</CardTitle>
              <span className='glass-pill flex size-9 items-center justify-center'>
                <Icon className='size-5' />
              </span>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                <CountUp value={value} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='glass-card col-span-4'>
          <CardHeader>
            <CardTitle className='text-base'>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Charts data={{ salesData: summary.salesData }} />
          </CardContent>
        </Card>

        <Card className='glass-card col-span-3'>
          <CardHeader>
            <CardTitle className='text-base'>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className='border-white/60'>
                  <TableHead>BUYER</TableHead>
                  <TableHead>DATE</TableHead>
                  <TableHead>TOTAL</TableHead>
                  <TableHead>ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.latestSales.map((order) => (
                  <TableRow key={order.id} className='border-white/60 hover:bg-white/40'>
                    <TableCell>
                      {order?.user?.name ? order.user.name : 'Deleted User'}
                    </TableCell>
                    <TableCell>{formatDateTime(order.createdAt).dateOnly}</TableCell>
                    <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                    <TableCell>
                      <Link
                        href={`/order/${order.id}`}
                        className='glass-pill inline-block px-3 py-1 text-xs font-medium'
                      >
                        Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
