'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { auth } from '@/auth';
import { db } from '@/db/prisma';
import { formatError } from '../utils';
import { insertReviewSchema } from '../validators';

// Matches the Product.rating column, Numeric(3, 2)
type Rating = string & {
  readonly __numericPrecision: 3;
  readonly __numericScale: 2;
};

// Create a review, or update the user's existing review of the same product
export async function createUpdateReview(data: z.infer<typeof insertReviewSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('User is not authenticated');

    // Validate and store the review; the user always comes from the session
    const review = insertReviewSchema.parse({
      ...data,
      userId: session.user.id,
    });

    // Get the product that is being reviewed
    const product = await db.orm.public.Product
      .where({ id: review.productId })
      .first();
    if (!product) throw new Error('Product not found');

    // Check if the user already reviewed this product
    const reviewExists = await db.orm.public.Review
      .where({ productId: review.productId, userId: review.userId })
      .first();

    // Transaction: save the review, then refresh the product's rating and review count
    await db.transaction(async (tx) => {
      if (reviewExists) {
        await tx.orm.public.Review.where({ id: reviewExists.id }).update({
          title: review.title,
          description: review.description,
          rating: review.rating,
        });
      } else {
        await tx.orm.public.Review.create(review);
      }

      const { averageRating, numReviews } = await tx.orm.public.Review
        .where({ productId: review.productId })
        .aggregate((a) => ({
          averageRating: a.avg('rating'),
          numReviews: a.count(),
        }));

      await tx.orm.public.Product.where({ id: review.productId }).update({
        rating: (Number(averageRating) || 0).toFixed(2) as Rating,
        numReviews: Number(numReviews) || 0,
      });
    });

    revalidatePath(`/product/${product.slug}`);

    return { success: true, message: 'Review updated successfully' };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}

// Get all reviews for a product, newest first, with the reviewer's name
export async function getReviews({ productId }: { productId: string }) {
  const data = await db.orm.public.Review
    .where({ productId })
    .include('user', (user) => user.select('name'))
    .orderBy((review) => review.createdAt.desc())
    .all();

  return { data };
}

// Get the current user's review of a product, if they wrote one
export async function getReviewByProductId({ productId }: { productId: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('User is not authenticated');

  return await db.orm.public.Review
    .where({ productId, userId: session.user.id })
    .first();
}
