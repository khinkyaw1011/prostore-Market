
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Stripe from 'stripe';

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

  // For unpaid Stripe orders, create a payment intent; its client secret powers the card form
  let client_secret: string | null = null;

  if (order.paymentMethod === 'Stripe' && !order.isPaid) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalPrice) * 100), // in cents
      currency: 'USD',
      metadata: { orderId: order.id },
    });

    client_secret = paymentIntent.client_secret;
  }

  return (
    <OrderDetailsTable
      order={order}
      stripeClientSecret={client_secret}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
      isAdmin={session?.user?.role === 'admin' || false}
    />
  );
}
