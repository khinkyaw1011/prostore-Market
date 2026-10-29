import Link from 'next/link';
import { MenuIcon } from 'lucide-react';
import { getAllCategories } from '@/lib/actions/product.action';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const CategoryDrawer = async () => {
  const categories = await getAllCategories();

  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant='outline' size='icon' aria-label='Open categories' />}
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side='left' className='w-full max-w-sm'>
        <SheetHeader>
          <SheetTitle>Select a category</SheetTitle>
          <SheetDescription className='sr-only'>
            Browse products by category
          </SheetDescription>
        </SheetHeader>
        <div className='mt-4 space-y-1 px-4'>
          {categories.map(({ category, count }) => (
            <SheetClose
              key={category}
              nativeButton={false}
              render={
                <Button
                  variant='ghost'
                  className='w-full justify-start'
                  nativeButton={false}
                  render={<Link href={`/search?category=${encodeURIComponent(category)}`} />}
                />
              }
            >
              {category} ({count})
            </SheetClose>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CategoryDrawer;
