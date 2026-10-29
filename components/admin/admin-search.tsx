'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { getSearchSuggestions, type SearchScope } from '@/lib/actions/admin-search.action';

// Searches whichever admin list (orders, users, products) the admin is on
const AdminSearch = () => {
  const pathname = usePathname();
  const router = useRouter();

  let scope: SearchScope = 'products';
  if (pathname.includes('/admin/orders')) scope = 'orders';
  else if (pathname.includes('/admin/users')) scope = 'users';
  const formActionUrl = `/admin/${scope}`;

  const searchParams = useSearchParams();
  const [queryValue, setQueryValue] = useState(searchParams.get('query') || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Only fetch suggestions for text the admin typed, not for text synced from the URL
  const typedRef = useRef(false);

  useEffect(() => {
    typedRef.current = false;
    setQueryValue(searchParams.get('query') || '');
    setOpen(false);
  }, [searchParams]);

  // Debounced suggestion lookup
  useEffect(() => {
    if (!typedRef.current) return;

    const text = queryValue.trim();
    if (!text) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const results = await getSearchSuggestions(scope, text);
        if (cancelled) return;
        setSuggestions(results);
        setActive(-1);
        setOpen(results.length > 0);
      } catch {
        if (!cancelled) setSuggestions([]);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [queryValue, scope]);

  // Close when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const goTo = (value: string) => {
    setQueryValue(value);
    setOpen(false);
    router.push(`${formActionUrl}?query=${encodeURIComponent(value)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      goTo(suggestions[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className='relative'>
      <form action={formActionUrl} method='GET'>
        <Input
          type='search'
          placeholder='Search...'
          name='query'
          value={queryValue}
          autoComplete='off'
          role='combobox'
          aria-expanded={open}
          aria-autocomplete='list'
          onChange={(e) => {
            typedRef.current = true;
            setQueryValue(e.target.value);
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          className='md:w-25 lg:w-75'
        />
        <button className='sr-only' type='submit'>
          Search
        </button>
      </form>
      {open && (
        <ul
          role='listbox'
          className='absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border bg-white py-1 text-sm shadow-lg dark:bg-neutral-900'
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              role='option'
              aria-selected={index === active}
              onMouseDown={(e) => {
                e.preventDefault();
                goTo(suggestion);
              }}
              onMouseEnter={() => setActive(index)}
              className={`cursor-pointer truncate px-3 py-1.5 ${
                index === active ? 'bg-secondary' : ''
              }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminSearch;
