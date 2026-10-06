import {z} from 'zod'
import { insertProductSchema } from '@/lib/validators';
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
