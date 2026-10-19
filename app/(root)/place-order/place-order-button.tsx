'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';
import { createOrder } from '@/lib/actions/order.action';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';

export default function PlaceOrderButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handlePlaceOrder = () => {
    startTransition(async () => {
      const res = await createOrder();

      if (res.success && res.redirectTo) {
        router.push(res.redirectTo);
        return;
      }

      toast.add({
        type: 'error',
        title: 'Error',
        description: res.message,
        priority: 'high',
      });

      if (res.redirectTo) router.push(res.redirectTo);
    });
  };

  return (
    <Button
      className="w-full"
      disabled={isPending}
      onClick={handlePlaceOrder}
    >
      {isPending ? <Loader className="h-4 w-4 animate-spin" /> : 'Place Order'}
    </Button>
  );
}
