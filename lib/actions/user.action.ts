'use server'
import {paymentMethodSchema, signInFormSchema, signUpFormSchema} from '../validators'
import {signIn,signOut} from "@/auth"
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { hashSync } from 'bcrypt-ts-edge'
import { createUser } from '@/db/user'
import { formatError, fieldErrorsOf } from '../utils'
import { shippingAddressSchema } from "../validators";
import type { ActionState } from '@/types'
import { auth } from "@/auth";
import { ShippingAddress } from "@/types";
import { db } from '@/db/prisma'
import {z} from 'zod'
//Sign in the user with credentials
export async function signInWithCredentials(prevState:ActionState, formData:FormData) {
    try {
        const result=signInFormSchema.safeParse({
            email:formData.get('email'),
            password:formData.get('password')
        });
        if(!result.success){
            return{success:false, message:formatError(result.error), errors:fieldErrorsOf(result.error)}
        }
        await signIn('credentials',result.data);
        return {success:true, message: 'Signed in successfully'}
    } catch (error) {
        if(isRedirectError(error)){
            throw error;
        }
        return{success:false ,message:formatError(error)}
    }
}
//Sign user out 

export async function signOutUser() {
    await signOut({
        redirectTo: '/',
    });
    
}

// Sign up user action
export async function signUpWithCredentials(prevState: ActionState, formData: FormData) {
  try {
    // Validate form inputs using the Zod schema
    const result = signUpFormSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });

    if (!result.success) {
      return {
        success: false,
        message: formatError(result.error),
        errors: fieldErrorsOf(result.error),
      };
    }

    const user = result.data;

    // Store the plain password before hashing for auto-login
    const plainPassword = user.password;

    // Hash the password
    user.password = hashSync(user.password, 10);

    // Save user to the database
    await createUser({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    // Sign in user immediately after registration
    await signIn('credentials', {
      email: user.email,
      password: plainPassword,
    });

    return {
      success: true,
      message: 'User registered successfully',
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      success: false,
      message: formatError(error),
      errors: fieldErrorsOf(error),
    };
  }
}

export async function getUserById(userId: string) {
  const user = await db.orm.public.User.where({ id: userId }).first();
  if (!user) throw new Error("User not found");
  return user;
}
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("User not found");

    const currentUser = await db.orm.public.User.where({ id: userId }).first();
    if (!currentUser) throw new Error("User not found");

    const address = shippingAddressSchema.parse(data);

    await db.orm.public.User.where({ id: currentUser.id }).update({
      address,
    });

    return { success: true, message: "User updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
// Update user's payment method
export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error('User not found');

    const currentUser = await db.orm.public.User.where({ id: userId }).first();
    if (!currentUser) throw new Error('User not found');

    const paymentMethod = paymentMethodSchema.parse(data);

    await db.orm.public.User.where({ id: currentUser.id }).update({
      paymentMethod: paymentMethod.type,
    });

    return { success: true, message: 'User updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}