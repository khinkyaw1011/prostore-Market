"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpDefaultValues } from "@/lib/constants";
import { signUpWithCredentials } from "@/lib/actions/user.action";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
const CredentialSignInForm = () => {
  const [data, action] = useActionState(signUpWithCredentials, {
    success: false,
    message: "",
  });
  const searchParams= useSearchParams();
  const callBackUrl=searchParams.get('callbackUrl') || '/';
  const SignUpButton=()=>{
    const {pending} =useFormStatus();
    return(
        <Button type='submit' disabled={pending} className='w-full' variant='default'>
            {pending ? 'Submitting...' : 'Sign Up'}
        </Button>
    )

  }
  return (
    <form action={action}>
      <input type="hidden" name="callbackUrl" value={callBackUrl} />
      <div className="space-y-4">
         <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="name"
            required
            autoComplete="name"
            defaultValue={signUpDefaultValues.name}
          />
          {data.errors?.name?.[0] && (
            <p className="text-sm text-destructive">{data.errors.name[0]}</p>
          )}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="text"
            required
            autoComplete="email"
            defaultValue={signUpDefaultValues.email}
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
            defaultValue={signUpDefaultValues.password}
          />
          {data.errors?.password?.[0] && (
            <p className="text-sm text-destructive">{data.errors.password[0]}</p>
          )}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="confirmPassword"
            defaultValue={signUpDefaultValues.confirmPassword}
          />
          {data.errors?.confirmPassword?.[0] && (
            <p className="text-sm text-destructive">{data.errors.confirmPassword[0]}</p>
          )}
        </div>
        <SignUpButton/>
        {data && !data.success && (
          <div className="text-center text-destructive">{data.message}</div>
        )}
        <div className="text-sm text-center text-muted-foreground">
          Already have an account?{' '}
          <Link href="/sign-in" target="_self" className="link">
            Sign In
          </Link>
        </div>
      </div>
    </form>
  );
};

export default CredentialSignInForm;
