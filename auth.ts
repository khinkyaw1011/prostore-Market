import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compareSync } from 'bcrypt-ts-edge';
import { db } from '@/db/prisma';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
export const config = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, 
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (credentials === null) return null;

       
        const user = await db.orm.public.User
          .where({ email: credentials.email as string })
          .first();

        //check username and password
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );

          // correct password get the data
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user, trigger, token }) {
      // set the user ID from the token
      session.user.id = token.sub ?? '';
      session.user.role = token.role;
      session.user.name= token.name;
      console.log(token);
      // if there is the update, set the user name
      if (trigger === 'update') {
        session.user.name = user.name;
      }
      if (trigger === 'update' && session?.user?.name && token.sub) {
    const dbUser = await db.orm.public.User.select('name').first({ id: token.sub });
    if (dbUser) token.name = dbUser.name;
  }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
  if (user) {
    token.id = user.id;
    token.role = user.role;

  

if (trigger === "signIn" || trigger === "signUp") {
  const cookiesObject = await cookies();
  const sessionCartId = cookiesObject.get("sessionCartId")?.value;

  if (sessionCartId) {
    const sessionCart = await db.orm.public.Cart.where({
      sessionCartId,
    }).first();

    // Only a guest cart (no user yet) gets moved to this user
    if (sessionCart && !sessionCart.userId) {
      // Delete the user's current cart, if any
      await db.orm.public.Cart.where({ userId: user.id! }).delete();

      // Assign the guest cart to the logged-in user
      await db.orm.public.Cart.where({ id: sessionCart.id }).update({
        userId: user.id!,
      });
    }
  }
}

  }
   
  return token;
},
    authorized({request,auth}:any){
       // Array of regex patterns of paths we want to protect
       const protectedPaths = [
      /\/shipping-address/,
      /\/payment-method/,
      /\/place-order/,
      /\/profile/,
      /\/user\/(.*)/,
      /\/order\/(.*)/,
      /\/admin/,
    ];
     // Get the pathname from the request URL object
    const { pathname } = request.nextUrl;
     // Not authenticated and accessing a protected path: redirect to sign in
    if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;

    //Check for session cart cookies
      if(!request.cookies.get('sessionCartId')){
          //Generate new session cart id cookies
          const sessionCartId=crypto.randomUUID();
          
          //clone the req headers
          const newRequestHeaders=new Headers(request.headers);
          //Create new response and the new headers
          const response= NextResponse.next({
            request:{
              headers:newRequestHeaders
            }
          })
          //Set newly generated sessionCartId in the response cookies
          response.cookies.set('sessionCartId',sessionCartId,{
            httpOnly:true,
            sameSite:'lax',
            path:'/',
            maxAge: 60 * 60 * 24 * 30,
          })
          return response;
      }else{
        return true
      }
    }
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);