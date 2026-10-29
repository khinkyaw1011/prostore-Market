import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Stripe from 'stripe';
import { getOrderById } from '@/lib/actions/order.action';
import { updateOrderToPaid } from '@/lib/order-payment';
import { Button } from '@/components/ui/button';

const SuccessPage = async (props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment_intent?: string }>;
}) => {
  const { id } = await props.params;
  const { payment_intent: paymentIntentId } = await props.searchParams;

  // Fetch the order
  const order = await getOrderById(id);
  if (!order || !paymentIntentId) notFound();

  // Retrieve the payment intent from Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ['latest_charge'],
  });

  // The payment intent must belong to this order
  if (
    paymentIntent.metadata.orderId == null ||
    paymentIntent.metadata.orderId !== order.id.toString()
  ) {
    notFound();
  }

  // Only show the thank-you page for a successful payment
  const isSuccess = paymentIntent.status === 'succeeded';
  if (!isSuccess) redirect(`/order/${id}`);

  // The webhook normally marks the order paid, but it can't reach a local server and can arrive
  // late. Stripe has just confirmed this payment above, so mark it paid here too.
  if (!order.isPaid) {
    const charge =
      typeof paymentIntent.latest_charge === 'object' ? paymentIntent.latest_charge : null;

    try {
      await updateOrderToPaid({
        orderId: order.id,
        paymentResult: {
          id: paymentIntent.id,
          status: 'COMPLETED',
          email_address: charge?.billing_details.email ?? paymentIntent.receipt_email ?? '',
          pricePaid: (paymentIntent.amount / 100).toFixed(2),
        },
      });
    } catch (error) {
      // The webhook may have marked it paid a moment ago; anything else is a real failure
      if (!(error instanceof Error && error.message === 'Order is already paid')) throw error;
    }
  }

  return (
    <div className='mx-auto w-full max-w-4xl space-y-8'>
      <div className='flex flex-col items-center gap-6'>
        <h1 className='h1-bold'>Thanks for your purchase</h1>
        <div>We are processing your order.</div>
        <Button nativeButton={false} render={<Link href={`/order/${id}`} />}>
          View order
        </Button>
      </div>
    </div>
  );
};

export default SuccessPage;
