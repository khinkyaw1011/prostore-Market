'use client';

import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from '@/components/ui/toast';
import { updateUser } from '@/lib/actions/user.action';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { updateUserSchema } from '@/lib/validators';
import { USER_ROLES } from '@/lib/constants';

type UpdateUserValues = z.infer<typeof updateUserSchema>;

const UpdateUserForm = ({ user }: { user: UpdateUserValues }) => {
  const router = useRouter();
  const form = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: user,
  });

  const onSubmit: SubmitHandler<UpdateUserValues> = async (values) => {
    try {
      const res = await updateUser({ ...values, id: user.id });

      if (!res.success) {
        toast.add({ type: 'error', title: 'Error', description: res.message });
        return;
      }

      toast.add({ type: 'success', title: 'Success', description: res.message });
      form.reset();
      router.push('/admin/users');
    } catch (error) {
      toast.add({
        type: 'error',
        title: 'Error',
        description: (error as Error).message,
      });
    }
  };

  return (
    <form method='POST' onSubmit={form.handleSubmit(onSubmit)}>
      <div className='space-y-5'>
        {/* Email */}
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
                placeholder='Enter user email'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/* Name */}
        <Controller
          control={form.control}
          name='name'
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='name'>Name</FieldLabel>
              <Input
                {...field}
                id='name'
                placeholder='Enter user name'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/* Role */}
        <Controller
          control={form.control}
          name='role'
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='role'>Role</FieldLabel>
              <select
                {...field}
                id='role'
                aria-invalid={fieldState.invalid}
                className='h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
              >
                <option value='' disabled>
                  Select a role
                </option>
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <div className='flex justify-center mt-6'>
        <Button
          type='submit'
          variant='outline'
          size='lg'
          className='px-8 w-full'
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Submitting...' : 'Update User'}
        </Button>
      </div>
    </form>
  );
};

export default UpdateUserForm;
