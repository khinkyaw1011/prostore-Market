'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types';

const ProductCarousel = ({ data }: { data: Product[] }) => {
  const slides = data.filter((product) => product.banner);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({
      delay: 5000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    }),
  ]);
  const [selected, setSelected] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  if (slides.length === 0) return null;

  return (
    <div className='relative mb-12 w-full' aria-roledescription='carousel'>
      <div className='overflow-hidden rounded-xl' ref={emblaRef}>
        <div className='flex'>
          {slides.map((product) => (
            <div key={product.id} className='min-w-0 shrink-0 grow-0 basis-full'>
              <Link href={`/product/${product.slug}`}>
                <div className='relative mx-auto'>
                  <Image
                    src={product.banner!}
                    alt={product.name}
                    width={0}
                    height={0}
                    sizes='100vw'
                    className='h-auto w-full'
                  />
                  <div className='absolute inset-0 flex items-end justify-center'>
                    <h2 className='bg-gray-900/50 px-2 text-2xl font-bold text-white'>
                      {product.name}
                    </h2>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <Button
            variant='outline'
            size='icon'
            aria-label='Previous slide'
            onClick={scrollPrev}
            className='absolute left-3 top-1/2 -translate-y-1/2 rounded-full'
          >
            <ChevronLeft />
          </Button>
          <Button
            variant='outline'
            size='icon'
            aria-label='Next slide'
            onClick={scrollNext}
            className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full'
          >
            <ChevronRight />
          </Button>
          <div className='absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5'>
            {slides.map((product, index) => (
              <button
                key={product.id}
                type='button'
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`size-2 rounded-full ${
                  index === selected ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductCarousel;
