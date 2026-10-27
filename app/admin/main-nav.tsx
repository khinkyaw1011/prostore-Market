'use client';

import type { ComponentProps } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { title: 'Overview', href: '/admin/overview' },
  { title: 'Products', href: '/admin/products' },
  { title: 'Orders', href: '/admin/orders' },
  { title: 'Users', href: '/admin/users' },
] as const;

export default function MainNav({ className, ...props }: ComponentProps<'nav'>) {
  const pathname = usePathname();

  return (
    <nav className={cn('flex items-center gap-4 lg:gap-6', className)} {...props}>
      {links.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              !isActive && 'text-muted-foreground'
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}