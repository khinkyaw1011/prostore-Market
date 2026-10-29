import type { Metadata } from 'next';
import Link from 'next/link';
import ProductCard from '@/components/product/productCard';
import { Button } from '@/components/ui/button';
import { getAllCategories, getAllProducts } from '@/lib/actions/product.action';

const ratings = [4, 3, 2, 1];

const sortOrders = ['newest', 'lowest', 'highest', 'rating'];

type SearchParams = {
  q?: string;
  category?: string;
  price?: string;
  rating?: string;
  sort?: string;
  page?: string;
};

// Page title reflects the active search / filters
export async function generateMetadata(props: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const {
    q = 'all',
    category = 'all',
    price = 'all',
    rating = 'all',
  } = await props.searchParams;

  const isQuerySet = q !== 'all' && q.trim() !== '';
  const isCategorySet = category !== 'all' && category.trim() !== '';
  const isPriceSet = price !== 'all' && price.trim() !== '';
  const isRatingSet = rating !== 'all' && rating.trim() !== '';

  if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
    return {
      title: `Search ${isQuerySet ? q : ''}
      ${isCategorySet ? `: Category ${category}` : ''}
      ${isPriceSet ? `: Price ${price}` : ''}
      ${isRatingSet ? `: Rating ${rating}` : ''}`
        .replace(/\s+/g, ' ')
        .trim(),
    };
  }

  return { title: 'Search Products' };
}

const prices = [
  { name: '$1 to $50', value: '1-50' },
  { name: '$51 to $100', value: '51-100' },
  { name: '$101 to $200', value: '101-200' },
  { name: '$201 to $500', value: '201-500' },
  { name: '$501 to $1000', value: '501-1000' },
];

const SearchPage = async (props: { searchParams: Promise<SearchParams> }) => {
  const {
    q = 'all',
    category = 'all',
    price = 'all',
    rating = 'all',
    sort = 'newest',
    page = '1',
  } = await props.searchParams;

  // Build a /search URL from the current params, overriding any that are passed in
  const getFilterUrl = ({
    c,
    s,
    p,
    r,
    pg,
  }: {
    c?: string;
    s?: string;
    p?: string;
    r?: string;
    pg?: string;
  }) => {
    const params = { q, category, price, rating, sort, page };

    if (c) params.category = c;
    if (s) params.sort = s;
    if (p) params.price = p;
    if (r) params.rating = r;
    if (pg) params.page = pg;
    // Changing a filter starts again from the first page
    else if (c || s || p || r) params.page = '1';

    return `/search?${new URLSearchParams(params).toString()}`;
  };

  const categories = await getAllCategories();

  const products = await getAllProducts({
    query: q === 'all' ? '' : q,
    category,
    price,
    rating,
    sort,
    page: Number(page) || 1,
  });

  return (
    <div className='grid md:grid-cols-5 md:gap-5'>
      <div className='filter-links'>
        {/* Category links */}
        <div className='mb-2 mt-3 text-xl'>Department</div>
        <div>
          <ul className='space-y-1'>
            <li>
              <Link
                className={`${
                  (category === 'all' || category === '') && 'font-bold'
                }`}
                href={getFilterUrl({ c: 'all' })}
              >
                Any
              </Link>
            </li>
            {categories.map((x) => (
              <li key={x.category}>
                <Link
                  className={`${category === x.category && 'font-bold'}`}
                  href={getFilterUrl({ c: x.category })}
                >
                  {x.category}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Price links */}
        <div className='mb-2 mt-8 text-xl'>Price</div>
        <div>
          <ul className='space-y-1'>
            <li>
              <Link
                className={`${price === 'all' && 'font-bold'}`}
                href={getFilterUrl({ p: 'all' })}
              >
                Any
              </Link>
            </li>
            {prices.map((p) => (
              <li key={p.value}>
                <Link
                  className={`${price === p.value && 'font-bold'}`}
                  href={getFilterUrl({ p: p.value })}
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Rating links */}
        <div className='mb-2 mt-8 text-xl'>Customer Ratings</div>
        <div>
          <ul className='space-y-1'>
            <li>
              <Link
                className={`${rating === 'all' && 'font-bold'}`}
                href={getFilterUrl({ r: 'all' })}
              >
                Any
              </Link>
            </li>
            {ratings.map((r) => (
              <li key={r}>
                <Link
                  className={`${rating === r.toString() && 'font-bold'}`}
                  href={getFilterUrl({ r: `${r}` })}
                >
                  {`${r} stars & up`}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className='space-y-4 md:col-span-4'>
        <div className='my-4 flex flex-col md:flex-row md:items-center md:justify-between'>
          <div className='flex flex-wrap items-center'>
            {q !== 'all' && q !== '' && <span>Query: {q}&nbsp;&nbsp;</span>}
            {category !== 'all' && category !== '' && (
              <span>Category: {category}&nbsp;&nbsp;</span>
            )}
            {price !== 'all' && <span>Price: {price}&nbsp;&nbsp;</span>}
            {rating !== 'all' && <span>Rating: {rating} stars &amp; up&nbsp;&nbsp;</span>}
            {(q !== 'all' && q !== '') ||
            (category !== 'all' && category !== '') ||
            rating !== 'all' ||
            price !== 'all' ? (
              <Button variant='link' nativeButton={false} render={<Link href='/search' />}>
                Clear
              </Button>
            ) : null}
          </div>
          <div>
            Sort by{' '}
            {sortOrders.map((s) => (
              <Link
                key={s}
                href={getFilterUrl({ s })}
                className={`mx-2 ${sort === s ? 'font-bold' : ''}`}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {products.data.length === 0 && <div>No products found</div>}
          {products.data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
