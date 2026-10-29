'use server'
import {paymentMethodSchema, signInFormSchema, signUpFormSchema, updateProfileSchema, updateUserSchema} from '../validators'
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
import { revalidatePath } from 'next/cache'
import { PAGE_SIZE, USER_ROLES } from '../constants'
import { requireAdmin } from '../auth-guard'
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
// Get all users (admin, paginated)
export async function getAllUsers({
  limit = PAGE_SIZE,
  page,
  query = '',
}: {
  limit?: number;
  page: number;
  query?: string;
}) {
  await requireAdmin();

  const currentPage = Math.max(1, page);
  const search = query.trim().toLowerCase();

  // Search by name or email; the ORM only has a case-sensitive LIKE, so filter in code
  if (search) {
    const matches = (
      await db.orm.public.User.orderBy((user) => user.createdAt.desc()).all()
    ).filter(
      (user) =>
        user.name?.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
    );

    return {
      data: matches.slice((currentPage - 1) * limit, currentPage * limit),
      totalPages: Math.ceil(matches.length / limit),
    };
  }

  const [users, { total }] = await Promise.all([
    db.orm.public.User
      .orderBy((user) => user.createdAt.desc())
      .limit(limit)
      .offset((currentPage - 1) * limit)
      .all(),
    db.orm.public.User.aggregate((a) => ({ total: a.count() })),
  ]);

  return {
    data: users,
    totalPages: Math.ceil(total / limit),
  };
}

// Delete a user (admin)
export async function deleteUser(id: string) {
  try {
    await requireAdmin();

    const session = await auth();
    if (session?.user?.id === id) throw new Error('You cannot delete your own account');

    const userExists = await db.orm.public.User.where({ id }).first();
    if (!userExists) throw new Error('User not found');

    await db.orm.public.User.where({ id }).delete();

    revalidatePath('/admin/users');

    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}

// Update a user (admin): name and role only; email is not editable
export async function updateUser(user: z.infer<typeof updateUserSchema>) {
  try {
    await requireAdmin();

    const { id, name, role } = updateUserSchema.parse(user);

    if (!USER_ROLES.includes(role)) throw new Error('Invalid role');

    const userExists = await db.orm.public.User.where({ id }).first();
    if (!userExists) throw new Error('User not found');

    await db.orm.public.User.where({ id }).update({ name, role });

    revalidatePath('/admin/users');

    return { success: true, message: 'User updated successfully' };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
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
// Update the user profile
export async function updateProfile(user: z.infer<typeof updateProfileSchema>) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error('User is not authorized');

    // Validate on the server too, not just in the form
    const { name } = updateProfileSchema.pick({ name: true }).parse(user);

    const currentUser = await db.orm.public.User.first({ id: userId });
    if (!currentUser) throw new Error('User not found');

    await db.orm.public.User.where({ id: currentUser.id }).update({ name });

    return { success: true, message: 'User updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}