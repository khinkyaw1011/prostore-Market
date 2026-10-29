import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import Stripe from 'stripe';
import { updateOrderToPaid } from '@/lib/order-payment';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  // Verify the request really came from Stripe
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      req.headers.get('stripe-signature') as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  // Only a successful charge marks the order as paid
  if (event.type === 'charge.succeeded') {
    const charge = event.data.object as Stripe.Charge;
    const orderId = charge.metadata.orderId;

    if (!orderId) {
      return NextResponse.json({ message: 'Charge has no order ID' }, { status: 400 });
    }

    try {
      await updateOrderToPaid({
        orderId,
        paymentResult: {
          id: charge.id,
          status: 'COMPLETED',
          email_address: charge.billing_details.email ?? '',
          pricePaid: (charge.amount / 100).toFixed(2),
        },
      });
    } catch (error) {
      // Stripe retries on errors; an already-paid order is a successful repeat, not a failure
      if (error instanceof Error && error.message === 'Order is already paid') {
        return NextResponse.json({ message: 'Order already paid' });
      }
      return NextResponse.json(
        { message: error instanceof Error ? error.message : 'Update failed' },
        { status: 500 }
      );
    }

    revalidatePath(`/order/${orderId}`);

    return NextResponse.json({ message: 'updateOrderToPaid was successful' });
  }

  return NextResponse.json({ message: 'Event is not charge.succeeded' });
}
