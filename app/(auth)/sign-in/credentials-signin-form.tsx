"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInDefaultValues } from "@/lib/constants";
import { signInWithCredentials } from "@/lib/actions/user.action";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
const CredentialSignInForm = () => {
  const [data, action] = useActionState(signInWithCredentials, {
    success: false,
    message: "",
  });
  const searchParams= useSearchParams();
  const callBackUrl=searchParams.get('callbackUrl') || '/';
  const SignInButton=()=>{
    const {pending} =useFormStatus();
    return(
        <Button type='submit' disabled={pending} className='w-full' variant='default'>
            {pending ? 'Signing In...' : 'Sign In'}
        </Button>
    )

  }
  return (
    <form action={action}>
      <input type="hidden" name="callbackUrl" value={callBackUrl} />
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={signInDefaultValues.email}
          />
          {data.errors?.email?.[0] && (
            <p className="text-sm text-destructive">{data.errors.email[0]}</p>
          )}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="password"
            defaultValue={signInDefaultValues.password}
          />
          {data.errors?.password?.[0] && (
            <p className="text-sm text-destructive">{data.errors.password[0]}</p>
          )}
        </div>
        <SignInButton/>
        {data && !data.success && (
          <div className="text-center text-destructive">{data.message}</div>
        )}
        <div className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" target="_self" className="link">
            Sign Up
          </Link>
        </div>
      </div>
    </form>
  );
};

export default CredentialSignInForm;
