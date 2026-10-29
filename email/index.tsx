import { Resend } from 'resend';
import { APP_NAME, SENDER_EMAIL } from '@/lib/constants';
import { Order } from '@/types';
import PurchaseReceiptEmail from './purchase-receipt';

// Next.js already loads .env, so no dotenv call is needed here
const resend = new Resend(process.env.RESEND_API_KEY as string);

// Not a 'use server' file on purpose: only trusted server code should send receipts
export const sendPurchaseReceipt = async ({ order }: { order: Order }) => {
  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: order.user.email,
    subject: `Order Confirmation ${order.id}`,
    react: <PurchaseReceiptEmail order={order} />,
  });
};
