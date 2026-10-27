'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/toast';
import { updateProfile } from '@/lib/actions/user.action';
import { updateProfileSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';

type ProfileValues = z.infer<typeof updateProfileSchema>;

export default function ProfileForm() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: session?.user?.name ?? '',
      email: session?.user?.email ?? '',
    },
  });

  const onSubmit = async (values: ProfileValues) => {
    const res = await updateProfile(values);

    if (!res.success) {
      toast.add({ type: 'error', title: 'Error', description: res.message });
      return;
    }

    await update({ user: { name: values.name } });
    router.refresh();
    toast.add({ type: 'success', title: 'Success', description: res.message });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-5'>
      <FieldGroup>
        <Controller
          control={form.control}
          name='email'
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='email'>Email</FieldLabel>
              <Input
                {...field}
                id='email'
                disabled
                placeholder='Email'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name='name'
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='name'>Name</FieldLabel>
              <Input
                {...field}
                id='name'
                placeholder='Name'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type='submit'
        size='lg'
        className='w-full'
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? 'Submitting...' : 'Update Profile'}
      </Button>
    </form>
  );
}