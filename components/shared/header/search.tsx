import { SearchIcon } from 'lucide-react';
import { getAllCategories } from '@/lib/actions/product.action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Search = async () => {
  const categories = await getAllCategories();

  return (
    <form action='/search' method='GET'>
      <div className='flex w-full max-w-sm items-center space-x-2'>
        <select
          name='category'
          defaultValue='all'
          aria-label='Category'
          className='h-9 w-[180px] rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
        >
          <option value='all'>All</option>
          {categories.map(({ category }) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <Input
          name='q'
          type='text'
          placeholder='Search...'
          className='md:w-25 lg:w-75'
        />
        <Button type='submit' size='icon' aria-label='Search'>
          <SearchIcon />
        </Button>
      </div>
    </form>
  );
};

export default Search;
