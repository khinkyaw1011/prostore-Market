'use server'
import {db} from '@/db/prisma'
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import type {Product} from '@/types';
import { revalidatePath } from 'next/cache';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { requireAdmin } from '../auth-guard';
import { insertProductSchema,updateProductSchema } from '../validators';
import {formatError,toPrice} from '../utils'
import { z } from 'zod';
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

//get all products

// query and category aren't used yet; filtering is added later
export async function getAllProducts({
    query,
    limit = PAGE_SIZE,
    page,
    category,
}: {
    query: string;
    limit?: number;
    page: number;
    category?: string;
}): Promise<{ data: Product[]; totalPages: number }> {
    const currentPage = Math.max(1, page);

    const [products, { total }] = await Promise.all([
        db.orm.public.Product
            .orderBy((product)=>product.createdAt.desc())
            .limit(limit)
            .offset((currentPage - 1) * limit)
            .all(),
        db.orm.public.Product.aggregate((a) => ({ total: a.count() })),
    ]);

    return {
        data: products.map((product)=>({
            ...product,
            price:String(product.price),
            rating:String(product.rating),
            createdAt:String(product.createdAt),
        })),
        totalPages: Math.ceil(total / limit),
    };
}

// Delete a product (admin)
export async function deleteProduct(id: string) {
    try {
        await requireAdmin();

        const productExists = await db.orm.public.Product.where({ id }).first();
        if (!productExists) throw new Error('Product not found');

        await db.orm.public.Product.where({ id }).delete();

        revalidatePath('/admin/products');

        return { success: true, message: 'Product deleted successfully' };
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { success: false, message: formatError(error) };
    }
}

//Get single product by it's slug
export async function getProductBySlug(slug:string) {
    return await db.orm.public.Product.where({ slug }).first();
}

// Create a product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const product = insertProductSchema.parse(data);

    await db.orm.public.Product.create({
      ...product,
      price: toPrice(product.price),
    });

    revalidatePath('/admin/products');

    return { success: true, message: 'Product created successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const { id, ...fields } = updateProductSchema.parse(data);

    const productExists = await db.orm.public.Product.where({ id }).first();
    if (!productExists) throw new Error('Product not found');

    await db.orm.public.Product.where({ id }).update({
      ...fields,
      price: toPrice(fields.price),
    });

    revalidatePath('/admin/products');

    return { success: true, message: 'Product updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}