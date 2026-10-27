'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Controller, Resolver, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import slugify from 'slugify';
import {
  ImagePlus,
  Loader2,
  type LucideIcon,
  Package,
  Sparkles,
  Star,
  Tags,
  Wallet,
  X,
} from 'lucide-react';
import { UploadButton } from '@/lib/uploadthing';
import { insertProductSchema, updateProductSchema } from '@/lib/validators';
import { productDefaultValues } from '@/lib/constants';
import { createProduct, updateProduct } from '@/lib/actions/product.action';
import { Product } from '@/types';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';

type ProductFormInput = z.input<typeof insertProductSchema>;
type ProductFormValues = z.output<typeof insertProductSchema>;

const inputClass = 'h-10 text-sm';

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className='glass-card p-6 space-y-5'>
      <div className='flex items-start gap-3'>
        <span className='glass-pill flex size-9 shrink-0 items-center justify-center'>
          <Icon className='size-4' />
        </span>
        <div>
          <h3 className='text-sm font-semibold'>{title}</h3>
          <p className='text-xs text-muted-foreground'>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function ProductForm({
  type,
  product,
  productId,
}: {
  type: 'create' | 'update';
  product?: Product;
  productId?: string;
}) {
  const router = useRouter();

  const form = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver:
      type === 'update'
        ? (zodResolver(updateProductSchema) as unknown as Resolver<ProductFormInput, unknown, ProductFormValues>)
        : zodResolver(insertProductSchema),
    defaultValues:
      product && type === 'update'
        ? { ...product, images: [...product.images] }
        : productDefaultValues,
  });

  const onSubmit: SubmitHandler<ProductFormValues> = async (values) => {
    // On create
    if (type === 'create') {
      const res = await createProduct(values);

      if (!res.success) {
        toast.add({ type: 'error', title: 'Error', description: res.message });
      } else {
        toast.add({ type: 'success', title: 'Success', description: res.message });
        router.push('/admin/products');
      }
    }

    // On update
    if (type === 'update') {
      if (!productId) {
        router.push('/admin/products');
        return;
      }

      const res = await updateProduct({ ...values, id: productId });

      if (!res.success) {
        toast.add({ type: 'error', title: 'Error', description: res.message });
      } else {
        toast.add({ type: 'success', title: 'Success', description: res.message });
        router.push('/admin/products');
      }
    }
  };

  const images = useWatch({ control: form.control, name: 'images' });
  const isSubmitting = form.formState.isSubmitting;

  return (
    <form
      method='POST'
      onSubmit={form.handleSubmit(onSubmit)}
      className='grid gap-6 lg:grid-cols-3'
    >
      <div className='space-y-6 lg:col-span-2'>
        <FormSection
          icon={Package}
          title='Product details'
          description='The name, URL and description customers will see.'
        >
          <div className='flex flex-col md:flex-row gap-5'>
            {/* Name */}
            <Controller
              control={form.control}
              name='name'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='w-full'>
                  <FieldLabel htmlFor='name'>Name</FieldLabel>
                  <Input
                    {...field}
                    id='name'
                    placeholder='Enter product name'
                    className={inputClass}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            {/* Slug */}
            <Controller
              control={form.control}
              name='slug'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='w-full'>
                  <FieldLabel htmlFor='slug'>Slug</FieldLabel>
                  <div className='relative'>
                    <Input
                      {...field}
                      id='slug'
                      placeholder='Enter slug'
                      className={`${inputClass} pr-28`}
                      aria-invalid={fieldState.invalid}
                    />
                    <button
                      type='button'
                      className='absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-lg bg-[#2a9d8f] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#1f786e]'
                      onClick={() => {
                        form.setValue(
                          'slug',
                          slugify(form.getValues('name'), { lower: true }),
                          { shouldValidate: true }
                        );
                      }}
                    >
                      <Sparkles className='size-3.5' />
                      Generate
                    </button>
                  </div>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription className='truncate'>
                      /product/{field.value || 'your-product'}
                    </FieldDescription>
                  )}
                </Field>
              )}
            />
          </div>
          {/* Description */}
          <Controller
            control={form.control}
            name='description'
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='w-full'>
                <FieldLabel htmlFor='description'>Description</FieldLabel>
                <Textarea
                  {...field}
                  id='description'
                  placeholder='Enter product description'
                  className='glass-input min-h-36 resize-none text-sm'
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : (
                  <FieldDescription className='text-right'>
                    {field.value.length} characters
                  </FieldDescription>
                )}
              </Field>
            )}
          />
        </FormSection>

        <FormSection
          icon={ImagePlus}
          title='Images'
          description='Add one or more photos of the product.'
        >
          <div className='upload-field'>
            {/* Images */}
            <Controller
              control={form.control}
              name='images'
              render={({ fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='w-full'>
                  <div className='flex min-h-48 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-foreground/15 bg-white/30 p-6 dark:bg-white/5'>
                    {images.length > 0 ? (
                      <div className='grid w-full grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5'>
                        {images.map((image) => (
                          <div key={image} className='group relative aspect-square'>
                            <Image
                              src={image}
                              alt='product image'
                              width={100}
                              height={100}
                              className='size-full rounded-lg object-cover object-center shadow-sm'
                            />
                            <button
                              type='button'
                              aria-label='Remove image'
                              onClick={() =>
                                form.setValue(
                                  'images',
                                  images.filter((i) => i !== image)
                                )
                              }
                              className='absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'
                            >
                              <X className='size-3.5' />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='flex flex-col items-center gap-1 text-center'>
                        <ImagePlus className='size-8 text-muted-foreground' />
                        <p className='text-sm font-medium'>No images yet</p>
                      </div>
                    )}
                    <UploadButton
                      endpoint='imageUploader'
                      onClientUploadComplete={(res: { url: string }[]) => {
                        form.setValue(
                          'images',
                          [...images, ...res.map((file) => file.url)],
                          { shouldValidate: true }
                        );
                      }}
                      onUploadError={(error: Error) => {
                        toast.add({
                          type: 'error',
                          title: 'Error',
                          description: `ERROR! ${error.message}`,
                        });
                      }}
                      appearance={{
                        button:
                          'h-9 rounded-lg bg-[#2a9d8f] px-4 text-xs font-medium text-white hover:bg-[#1f786e] focus-within:ring-[#2a9d8f]/50 ut-uploading:bg-[#1f786e]',
                        allowedContent: 'text-xs text-muted-foreground',
                      }}
                    />
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </FormSection>
      </div>

      <div className='space-y-6 lg:sticky lg:top-24 lg:self-start'>
        <FormSection
          icon={Tags}
          title='Organization'
          description='Help customers find this product.'
        >
          {/* Category */}
          <Controller
            control={form.control}
            name='category'
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='w-full'>
                <FieldLabel htmlFor='category'>Category</FieldLabel>
                <Input
                  {...field}
                  id='category'
                  placeholder='Enter category'
                  className={inputClass}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          {/* Brand */}
          <Controller
            control={form.control}
            name='brand'
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='w-full'>
                <FieldLabel htmlFor='brand'>Brand</FieldLabel>
                <Input
                  {...field}
                  id='brand'
                  placeholder='Enter brand'
                  className={inputClass}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FormSection>

        <FormSection
          icon={Wallet}
          title='Pricing & inventory'
          description='Set the price and how many are in stock.'
        >
          <div className='flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-5'>
            {/* Price */}
            <Controller
              control={form.control}
              name='price'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='w-full'>
                  <FieldLabel htmlFor='price'>Price</FieldLabel>
                  <div className='relative'>
                    <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                      $
                    </span>
                    <Input
                      {...field}
                      id='price'
                      inputMode='decimal'
                      placeholder='0.00'
                      className={`${inputClass} pl-7`}
                      aria-invalid={fieldState.invalid}
                    />
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            {/* Stock */}
            <Controller
              control={form.control}
              name='stock'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='w-full'>
                  <FieldLabel htmlFor='stock'>Stock</FieldLabel>
                  <div className='relative'>
                    <Input
                      {...field}
                      value={field.value as number}
                      id='stock'
                      inputMode='numeric'
                      placeholder='Enter stock'
                      className={`${inputClass} pr-14`}
                      aria-invalid={fieldState.invalid}
                    />
                    <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
                      units
                    </span>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </FormSection>

        <FormSection
          icon={Star}
          title='Featured'
          description='Show this product in the home page banner.'
        >
          <div className='upload-field'>
            {/* isFeatured */}
            <p className='text-xs text-muted-foreground'>Featured settings coming soon.</p>
          </div>
        </FormSection>

        {/* Submit */}
        <div className='glass-card p-4 flex flex-col gap-2'>
          <Button
            type='submit'
            size='lg'
            disabled={isSubmitting}
            className='h-11 w-full text-sm'
          >
            {isSubmitting && <Loader2 className='size-4 animate-spin' />}
            {isSubmitting
              ? 'Submitting...'
              : `${type === 'create' ? 'Create' : 'Update'} Product`}
          </Button>
          <Button
            variant='ghost'
            nativeButton={false}
            render={<Link href='/admin/products' />}
            className='h-10 w-full rounded-full text-sm'
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
