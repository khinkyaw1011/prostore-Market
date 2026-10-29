'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, User } from 'lucide-react';
import type { Review } from '@/types';
import { getReviews } from '@/lib/actions/review.actions';
import { formatDateTime } from '@/lib/utils';
import Rating from '@/components/shared/product/rating';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import ReviewForm from './review-form';

const ReviewList = ({
  userId,
  productId,
  productSlug,
}: {
  userId: string;
  productId: string;
  productSlug: string;
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  const loadReviews = async () => {
    const res = await getReviews({ productId });
    setReviews(res.data as unknown as Review[]);
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Refetch the reviews after one is submitted
  const reload = async () => {
    await loadReviews();
  };

  return (
    <div className='space-y-4'>
      {reviews.length === 0 && <div>No reviews yet</div>}
      {userId ? (
        <ReviewForm
          userId={userId}
          productId={productId}
          onReviewSubmitted={reload}
        />
      ) : (
        <div>
          Please{' '}
          <Link
            className='px-2 text-blue-700'
            href={`/sign-in?callbackUrl=/product/${productSlug}`}
          >
            sign in
          </Link>{' '}
          to write a review
        </div>
      )}
      <div className='flex flex-col gap-3'>
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className='flex-between'>
                <CardTitle>{review.title}</CardTitle>
              </div>
              <CardDescription>{review.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex space-x-4 text-sm text-muted-foreground'>
                <Rating value={review.rating} />
                <div className='flex items-center'>
                  <User className='mr-1 size-3' />
                  {review.user ? review.user.name : 'User'}
                </div>
                <div className='flex items-center'>
                  <Calendar className='mr-1 size-3' />
                  {formatDateTime(review.createdAt).dateTime}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
