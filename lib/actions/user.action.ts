'use server'
import {signInFormSchema, signUpFormSchema} from '../validators'
import {signIn,signOut} from "@/auth"
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { hashSync } from 'bcrypt-ts-edge'
import { createUser } from '@/db/user'
import { formatError, fieldErrorsOf } from '../utils'
import type { ActionState } from '@/types'
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
    };
  }
}