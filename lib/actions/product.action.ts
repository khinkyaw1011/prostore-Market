'use server'
import {db} from '@/db/prisma'
import { LATEST_PRODUCTS_LIMIT } from "../constants";
import type {Product} from '@/types';
//get latest products

export async function getLatestProducts():Promise<Product[]> {
   
    const products=await db.orm.public.Product
        .orderBy((product)=>product.createdAt.desc())
        .limit(LATEST_PRODUCTS_LIMIT)
        .all();

    return products.map((product)=>({
        ...product,
        price:String(product.price),
        rating:String(product.rating),
        createdAt:String(product.createdAt),
    }));
}

//Get single product by it's slug
export async function getProductBySlug(slug:string) {
    return await db.orm.public.Product.where({ slug }).first();
}
