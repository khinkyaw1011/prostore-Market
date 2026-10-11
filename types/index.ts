import {z} from 'zod'
import { insertProductSchema,insertCartSchema,cartItemSchema } from '@/lib/validators';
export type Product= Omit<z.infer<typeof insertProductSchema>,'images'> &{
    id:string;
    rating:string;
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
