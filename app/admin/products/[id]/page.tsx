import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ProductForm from '@/components/admin/product-form';
import { getProductById } from '@/lib/actions/product.action';
import { requireAdmin } from '@/lib/auth-guard';

export const metadata: Metadata = { title: 'Update Product' };

export default async function UpdateProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

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
          <h2 className='h2-bold'>Update Product</h2>
          <p className='text-sm text-muted-foreground'>
            Edit the details below and save your changes.
          </p>
        </div>
      </div>
      <div className='my-8'>
        <ProductForm type='update' product={product} productId={product.id} />
      </div>
    </>
  );
}
