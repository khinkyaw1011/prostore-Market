import { db } from '@/db/prisma';
import { Temporal } from 'temporal-polyfill';
import type { Order, PaymentResult } from '@/types';
import { sendPurchaseReceipt } from '@/email';

// Mark an order as paid and take its items out of stock.
// Deliberately NOT in a 'use server' file: it must only be callable from trusted
// server code (PayPal capture, admin COD action, Stripe webhook), never from the browser.
export async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  // Get the order, including its items
  const order = await db.orm.public.Order
    .include('orderitems')
    .where({ id: orderId })
    .first();

  if (!order) throw new Error('Order not found');
  if (order.isPaid) throw new Error('Order is already paid');

  // Transaction: reduce product stock and mark the order as paid
  await db.transaction(async (tx) => {
    for (const item of order.orderitems) {
      const product = await tx.orm.public.Product
        .where({ id: item.productId })
        .first();
      if (!product) throw new Error('Product not found');
      if (product.stock < item.qty) throw new Error('Not enough stock');

      await tx.orm.public.Product
        .where({ id: item.productId })
        .update({ stock: product.stock - item.qty });
    }

    await tx.orm.public.Order.where({ id: orderId }).update({
      isPaid: true,
      paidAt: Temporal.Now.zonedDateTimeISO('UTC').toPlainDateTime(),
      paymentResult,
    });
  });

  // Email the receipt. The order is already saved as paid, so a mail failure must not undo it.
  try {
    const paidOrder = await db.orm.public.Order
      .include('orderitems')
      .include('user', (user) => user.select('name', 'email'))
      .where({ id: orderId })
      .first();

    if (paidOrder) {
      await sendPurchaseReceipt({
        order: JSON.parse(JSON.stringify(paidOrder)) as Order,
      });
    }
  } catch (error) {
    console.error('Failed to send purchase receipt', error);
  }
}
