
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import { getOrderById } from '@/lib/actions/order.action';
import OrderDetailsTable from './order-details-table';

export const metadata: Metadata = {
  title: 'Order Details',
};

type OrderDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const { id } = await params;

  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const session = await auth();

  return (
    <OrderDetailsTable
      order={order}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
      isAdmin={session?.user?.role === 'admin' || false}
    />
  );
}
