import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Unauthorized Access' };

const UnauthorizedPage = () => {
  return (
    <div className='container mx-auto flex flex-col items-center justify-center space-y-4 h-[calc(100vh-200px)]'>
      <h1 className='h1-bold text-4xl'>Unauthorized Access</h1>
      <p className='text-muted-foreground'>
        You do not have permission to access this page.
      </p>
      <Button nativeButton={false} render={<Link href='/' />}>
        Return Home
      </Button>
    </div>
  );
};

export default UnauthorizedPage;
