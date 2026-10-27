'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatNumber } from '@/lib/utils';

// Animates a number from 0 up to `value` when the dashboard loads
export default function CountUp({
  value,
  format = 'number',
  duration = 3000,
}: {
  value: number;
  format?: 'number' | 'currency';
  duration?: number;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    // Skip the animation for users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCurrent(value);
      return;
    }

    let frame: number;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out: fast start, gentle stop
      setCurrent(value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <span className='tabular-nums'>
      {format === 'currency' ? formatCurrency(current) : formatNumber(Math.round(current))}
    </span>
  );
}
