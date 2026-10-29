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

// All products, newest first (used by the admin search)
function getProductRows() {
    return db.orm.public.Product
        .orderBy((product)=>product.createdAt.desc())
        .all();
}

//get all products

// Filters: query (name), category, price ("min-max"), rating (minimum), sort
export async function getAllProducts({
    query,
    limit = PAGE_SIZE,
    page,
    category,
    price,
    rating,
    sort,
}: {
    query: string;
    limit?: number;
    page: number;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
}): Promise<{ data: Product[]; totalPages: number }> {
    const currentPage = Math.max(1, page);
    const search = query.trim().toLowerCase();
    const hasCategory = !!category && category !== 'all';
    const [minPrice, maxPrice] =
        price && price !== 'all' ? price.split('-').map(Number) : [];
    const minRating = rating && rating !== 'all' ? Number(rating) : undefined;
    const sortBy = sort && sort !== 'newest' ? sort : undefined;

    const toProduct = (product: Awaited<ReturnType<typeof getProductRows>>[number]) => ({
        ...product,
        price: String(product.price),
        rating: String(product.rating),
        createdAt: String(product.createdAt),
    });

    const hasFilter =
        !!search ||
        hasCategory ||
        minPrice !== undefined ||
        minRating !== undefined ||
        !!sortBy;

    // The ORM only has a case-sensitive LIKE, so filter and sort in code when needed
    if (hasFilter) {
        const matches = (await getProductRows()).filter((product) => {
            if (search && !product.name.toLowerCase().includes(search)) return false;
            if (hasCategory && product.category !== category) return false;
            if (minPrice !== undefined && Number(product.price) < minPrice) return false;
            if (maxPrice !== undefined && !Number.isNaN(maxPrice) && Number(product.price) > maxPrice) return false;
            if (minRating !== undefined && Number(product.rating) < minRating) return false;
            return true;
        });

        if (sortBy === 'lowest') matches.sort((a, b) => Number(a.price) - Number(b.price));
        else if (sortBy === 'highest') matches.sort((a, b) => Number(b.price) - Number(a.price));
        else if (sortBy === 'rating') matches.sort((a, b) => Number(b.rating) - Number(a.rating));

        return {
            data: matches
                .slice((currentPage - 1) * limit, currentPage * limit)
                .map(toProduct),
            totalPages: Math.ceil(matches.length / limit),
        };
    }

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

// Get a single product by id
export async function getProductById(id: string): Promise<Product | null> {
    const product = await db.orm.public.Product.where({ id }).first();
    if (!product) return null;

    return {
        ...product,
        price: String(product.price),
        rating: String(product.rating),
        createdAt: String(product.createdAt),
    };
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
// Get all categories with the number of products in each
export async function getAllCategories() {
    const products = await db.orm.public.Product.select('category').all();

    const counts = new Map<string, number>();
    for (const { category } of products) {
        counts.set(category, (counts.get(category) ?? 0) + 1);
    }

    return [...counts.entries()]
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => a.category.localeCompare(b.category));
}

// Get the latest featured products (for the home page banner carousel)
export async function getFeaturedProducts(): Promise<Product[]> {
    const products = await db.orm.public.Product
        .where({ isFeatured: true })
        .orderBy((product)=>product.createdAt.desc())
        .limit(4)
        .all();

    return products.map((product)=>({
        ...product,
        price:String(product.price),
        rating:String(product.rating),
        createdAt:String(product.createdAt),
    }));
}
