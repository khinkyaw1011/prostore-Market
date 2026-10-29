'use client';

import { useState } from 'react';
import { Controller, Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StarIcon } from 'lucide-react';
import { insertReviewSchema } from '@/lib/validators';
import { reviewFormDefaultValues } from '@/lib/constants';
import {
  createUpdateReview,
  getReviewByProductId,
} from '@/lib/actions/review.actions';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type ReviewFormInput = z.input<typeof insertReviewSchema>;
type ReviewFormValues = z.output<typeof insertReviewSchema>;

const ReviewForm = ({
  userId,
  productId,
  onReviewSubmitted,
}: {
  userId: string;
  productId: string;
  onReviewSubmitted: () => void;
}) => {
  const [open, setOpen] = useState(false);

  const form = useForm<ReviewFormInput, unknown, ReviewFormValues>({
    resolver: zodResolver(insertReviewSchema) as unknown as Resolver<
      ReviewFormInput,
      unknown,
      ReviewFormValues
    >,
    defaultValues: reviewFormDefaultValues as ReviewFormInput,
  });

  // Open the form with the user and product already set
  const handleOpenForm = async () => {
    form.setValue('productId', productId);
    form.setValue('userId', userId);

    // If the user already reviewed this product, load their review into the form
    try {
      const review = await getReviewByProductId({ productId });
      if (review) {
        form.setValue('title', review.title);
        form.setValue('description', review.description);
        form.setValue('rating', review.rating);
      }
    } catch {
      // Not signed in or the lookup failed: just open an empty form
    }

    setOpen(true);
  };

  // Submit form handler
  const onSubmit: SubmitHandler<ReviewFormValues> = async (values) => {
    const res = await createUpdateReview({ ...values, productId });

    if (!res.success) {
      toast.add({ type: 'error', title: 'Error', description: res.message });
      return;
    }

    setOpen(false);
    onReviewSubmitted();
    toast.add({ type: 'success', title: 'Success', description: res.message });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button onClick={handleOpenForm} variant='default' />}
      >
        Write a review
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <form method='POST' onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Write a review</DialogTitle>
            <DialogDescription>
              Share your thoughts with other customers
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            {/* Title */}
            <Controller
              control={form.control}
              name='title'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='review-title'>Title</FieldLabel>
                  <Input
                    {...field}
                    id='review-title'
                    placeholder='Enter title'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            {/* Description */}
            <Controller
              control={form.control}
              name='description'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='review-description'>Description</FieldLabel>
                  <Textarea
                    {...field}
                    id='review-description'
                    placeholder='Enter description'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            {/* Rating */}
            <Controller
              control={form.control}
              name='rating'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='review-rating'>Rating</FieldLabel>
                  <select
                    id='review-rating'
                    value={String(field.value ?? 0)}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid}
                    className='h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
                  >
                    <option value='0' disabled>
                      Select a rating
                    </option>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <option key={index} value={(index + 1).toString()}>
                        {'★'.repeat(index + 1)} {index + 1}
                      </option>
                    ))}
                  </select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
          <DialogFooter>
            <Button
              type='submit'
              size='lg'
              className='w-full'
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewForm;
