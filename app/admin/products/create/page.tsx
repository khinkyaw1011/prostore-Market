import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductForm from '@/components/admin/product-form';

export const metadata: Metadata = { title: 'Create Product' };

export default function CreateProductPage() {
  return (
    <>
      <div className='space-y-3'>
        <Link
          href='/admin/products'
          className='glass-pill inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium'
        >
          <ArrowLeft className='size-3.5' />
          Products
        </Link>
        <div>
          <h2 className='h2-bold'>Create Product</h2>
          <p className='text-sm text-muted-foreground'>
            Fill in the details below to add a new product to your store.
          </p>
        </div>
      </div>
      <div className='my-8'>
        <ProductForm type='create' />
      </div>
    </>
  );
}
