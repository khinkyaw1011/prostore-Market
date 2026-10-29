'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

type PaginationProps = {
  page: number | string;
  totalPages: number;
  urlParamName?: string;
};

export default function Pagination({
  page,
  totalPages,
  urlParamName = 'page',
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = Number(page) || 2;

  // Keep any other query params, just change the page number
  const hrefFor = (target: number) => {
    const params = new URLSearchParams(searchParams);
    params.set(urlParamName, String(target));
    return `${pathname}?${params.toString()}`;
  };

  const PageButton = ({
    target,
    disabled,
    label,
  }: {
    target: number;
    disabled: boolean;
    label: string;
  }) =>
    disabled ? (
      <Button size='lg' variant='outline' className='w-28' disabled>
        {label}
      </Button>
    ) : (
      <Button  size='lg' variant='outline' className='w-28'>
        <Link href={hrefFor(target)}>{label}</Link>
      </Button>
    );

  return (
    <nav aria-label='Pagination' className='flex gap-2'>
      <PageButton target={current - 1} disabled={current <= 1} label='Previous' />
      <PageButton target={current + 1} disabled={current >= totalPages} label='Next' />
    </nav>
  );
}