import { Star, StarHalf } from 'lucide-react';

// Shows `value` (0-5, halves allowed) as filled, half and empty stars
const Rating = ({ value, caption }: { value: number; caption?: string }) => {
  const stars = Array.from({ length: 5 }).map((_, index) => {
    const position = index + 1;

    if (value >= position) {
      return <Star key={index} className='size-4 fill-yellow-500 text-yellow-500' />;
    }

    if (value >= position - 0.5) {
      return (
        <span key={index} className='relative inline-block size-4'>
          <Star className='absolute inset-0 size-4 text-yellow-500' />
          <StarHalf className='absolute inset-0 size-4 fill-yellow-500 text-yellow-500' />
        </span>
      );
    }

    return <Star key={index} className='size-4 text-yellow-500' />;
  });

  return (
    <div
      className='flex items-center gap-0.5'
      role='img'
      aria-label={`${value} out of 5 stars`}
    >
      {stars}
      {caption && <span className='ml-2 text-sm'>{caption}</span>}
    </div>
  );
};

export default Rating;
