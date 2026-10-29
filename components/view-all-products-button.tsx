import Link from 'next/link';
import { Button } from '@/components/ui/button';

const ViewAllProductsButton = () => {
  return (
    <div className='flex justify-center items-center my-8'>
      <Button
        nativeButton={false}
        render={<Link href='/search' />}
        className='px-8 py-4 text-lg font-semibold'
      >
        View All Products
      </Button>
    </div>
  );
};

export default ViewAllProductsButton;
