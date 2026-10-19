'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { auth } from '@/auth';
import { db } from '@/db/prisma';
import { getMyCart } from './cart.action';
import { getUserById } from './user.action';
import { insertOrderSchema } from '../validators';
import { convertToPlainObject, formatError } from '../utils';
import { Order } from '@/types';
import { z } from 'zod';
import { paypal } from '../paypal';
import { revalidatePath } from 'next/cache';
import { PaymentResult } from '@/types';
import { Temporal } from 'temporal-polyfill';
// Create order and order items
export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error('User is not authenticated');

    const cart = await getMyCart();
    const userId = session.user?.id;
    if (!userId) throw new Error('User not found');

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return { success: false, message: 'Your cart is empty', redirectTo: '/cart' };
    }
    if (!user.address) {
      return { success: false, message: 'No shipping address', redirectTo: '/shipping-address' };
    }
    if (!user.paymentMethod) {
      return { success: false, message: 'No payment method', redirectTo: '/payment-method' };
    }

    // Create order object (validated, not saved yet)
    const order = insertOrderSchema.parse({
      userId,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemPrice, // your Cart uses itemPrice (no s)
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    // Transaction: create order + order items + clear cart, all or nothing
    type Price = string & {
  readonly __numericPrecision: 12;
  readonly __numericScale: 2;
};

    const toPrice = (value: string | number) => Number(value).toFixed(2) as Price;
    const insertedOrderId = await db.transaction(async (tx) => {
    const insertedOrder = await tx.orm.public.Order.create({
    ...order,
    itemsPrice: toPrice(order.itemsPrice),
    shippingPrice: toPrice(order.shippingPrice),
    taxPrice: toPrice(order.taxPrice),
    totalPrice: toPrice(order.totalPrice),
  });

  await tx.orm.public.OrderItem.createAll(
    cart.items.map((item) => ({
      ...item,
      price: toPrice(item.price),
      orderId: insertedOrder.id,
    }))
  );

  await tx.orm.public.Cart.where({ id: cart.id }).update({
  items: [],
  itemPrice: toPrice(0),
  shippingPrice: toPrice(0),
  taxPrice: toPrice(0),
  totalPrice: toPrice(0),
});
  return insertedOrder.id;
});

    if (!insertedOrderId) throw new Error('Order not created');

    return {
      success: true,
      message: 'Order created',
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}
// Get order by id
export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!z.uuid().safeParse(orderId).success) return null;

  const data = await db.orm.public.Order
    .include('orderitems')
    .include('user', (user) => user.select('name', 'email'))
    .where({ id: orderId })
    .first();

  if (!data) return null;

  return JSON.parse(JSON.stringify(data)) as Order;
}

// Create a new PayPal order
export async function createPayPalOrder(orderId: string) {
  try {
    // Get the order from the database
    const order = await db.orm.public.Order.where({ id: orderId }).first();

    if (!order) throw new Error('Order not found');

    // Create a PayPal order for the total price (includes shipping and tax)
    const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

    // Store PayPal's order ID in the payment result
    await db.orm.public.Order.where({ id: orderId }).update({
      paymentResult: {
        id: paypalOrder.id,
        email_address: '',
        status: '',
        pricePaid: '0',
      },
    });

    return {
      success: true,
      message: 'Item order created successfully',
      data: paypalOrder.id,
    };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

// Approve PayPal order and update order to paid
export async function approvePayPalOrder(
  orderId: string,
  data: { orderID: string }
) {
  try {
    // Get the order from the database
    const order = await db.orm.public.Order.where({ id: orderId }).first();
    if (!order) throw new Error('Order not found');
 
    // Capture the payment using PayPal's order ID
    const captureData = await paypal.capturePayment(data.orderID);
 
    // Make sure the capture matches our order and was completed
    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResult)?.id ||
      captureData.status !== 'COMPLETED'
    ) {
      throw new Error('Error in PayPal payment');
    }
 
    // Update the order to paid
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value ?? '0',
      },
    });
 
    // Refresh the order page so it shows as paid
    revalidatePath(`/order/${orderId}`);
 
    return { success: true, message: 'Your order has been paid' };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}
 
// Update order to paid (not exported)
async function updateOrderToPaid({
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
      // If your OrderItem field is named quantity instead of qty, change it in both places below
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
}