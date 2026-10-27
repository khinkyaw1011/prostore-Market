import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { APP_NAME } from '@/lib/constants';
import Menu from '@/components/shared/header/menu';
import { Input } from '@/components/ui/input';
import MainNav from './main-nav';
export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  const session = await auth();
  if (session?.user?.role !== 'admin') redirect('/');

  return (
    <div className='flex flex-col'>
      <header className='glass-nav sticky top-0 z-40 border-b'>
        <div className='container mx-auto flex h-16 items-center px-4'>
          <Link href='/' className='w-22'>
            <Image src='/images/logo.svg' width={48} height={48} alt={APP_NAME} />
          </Link>
          <MainNav className='mx-6' />
          <div className='ml-auto flex items-center gap-4'>
            <Input type='search' placeholder='Search...' className='md:w-25 lg:w-75' />
            <Menu />
          </div>
        </div>
      </header>
      <main className='container mx-auto flex-1 space-y-4 p-8 pt-6'>
        {children}
      </main>
    </div>
  );
}
