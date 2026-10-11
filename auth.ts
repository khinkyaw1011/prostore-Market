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

      return session;
    },
    async jwt({token,user}){
      //asign user fields to token
      if(user){
        token.role=user.role;
        //If user has no name then use the email
        if(user.name === 'NO_NAME' && user.id){
          token.name = user.email!.split('@')[0];
         // Update database to reflect token name
          await db.orm.public.User.where({ id: user.id }).update({ name: token.name });

          //old version
          // await prisma.user.update({
          //   where: { id: user.id },
          //   data: { name: token.name },
          // });
        }
      }
      return token
    },
    authorized({request,auth}:any){
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