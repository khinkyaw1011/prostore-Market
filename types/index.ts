import {z} from 'zod'
import { insertProductSchema,insertCartSchema,cartItemSchema, insertOrderSchema ,insertOrderItemSchema, paymentResultSchema} from '@/lib/validators';
import { shippingAddressSchema, insertReviewSchema } from '@/lib/validators';
export type Product= Omit<z.infer<typeof insertProductSchema>,'images'> &{
    id:string;
    rating:string;
    numReviews:number;
    createdAt:string;
    images:readonly string[];
}

export type ActionState = {
    success:boolean;
    message:string;
    errors?:Record<string,string[]>;
}
export type Cart= z.infer<typeof insertCartSchema>;
export type CartItem= z.infer<typeof cartItemSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export type OrderItem = z.infer<typeof insertOrderItemSchema>;

export type Order = z.infer<typeof insertOrderSchema> & {
  id: string;
  createdAt: Date;
  isPaid: boolean;
  paidAt: Date | null;
  isDelivered: boolean;
  deliveredAt: Date | null;
  orderitems: OrderItem[];
  paymentResult?: PaymentResult | null;
  user: { name: string; email: string };
};
export type PaymentResult = z.infer<typeof paymentResultSchema>;
export type Review = z.infer<typeof insertReviewSchema> & {
  id: string;
  createdAt: Date;
  user?: { name: string };
};
