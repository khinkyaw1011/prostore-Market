'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Loader } from 'lucide-react';
import { paymentMethodSchema } from '@/lib/validators';
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from '@/lib/constants';
import {updateUserPaymentMethod} from '@/lib/actions/user.action';
import { Button } from '@/components/ui/button';

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

const PaymentMethodForm = ({
  preferredPaymentMethod,
}: {
  preferredPaymentMethod: string | null;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: preferredPaymentMethod || DEFAULT_PAYMENT_METHOD,
    },
  });

  const onSubmit: SubmitHandler<PaymentMethodFormValues> = (values) => {
    startTransition(async () => {
      const res = await updateUserPaymentMethod(values);

      if (!res.success) {
        setError('type', { message: res.message });
        return;
      }

      router.push('/place-order');
    });
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="h2-bold mt-4">Payment Method</h1>
      <p className="text-sm text-muted-foreground">
        Please select a payment method
      </p>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="space-y-3">
          <legend className="sr-only">Payment method</legend>
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method}
              className="flex items-center gap-3 rounded-md border p-3 cursor-pointer has-[:checked]:border-primary"
            >
              <input
                type="radio"
                value={method}
                {...register('type')}
                className="h-4 w-4 accent-primary"
              />
              <span>{method}</span>
            </label>
          ))}
        </fieldset>

        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}{' '}
          Continue
        </Button>
      </form>
    </div>
  );
};

export default PaymentMethodForm;