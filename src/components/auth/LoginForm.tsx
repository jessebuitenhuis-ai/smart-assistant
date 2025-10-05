"use client";

import { LoginFormState } from "@/actions/auth/login-state";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldSeparator } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useActionState, useTransition } from "react";
import { EmailField } from "../forms/EmailField";
import { PasswordField } from "../forms/PasswordField";
import { GoogleIcon } from "../icons/google-icon";
import { H1 } from "../typography/h1";
import { Paragraph } from "../typography/paragraph";

type LoginFormProps = {
  loginWithEmail: (
    state: LoginFormState,
    formData: FormData
  ) => Promise<LoginFormState>;
  loginWithGoogle: () => Promise<LoginFormState>;
} & React.ComponentProps<"div">;

export function LoginForm({
  className,
  loginWithEmail,
  loginWithGoogle,
  ...props
}: LoginFormProps) {
  const [, dispatchLoginWithEmail, loginWithEmailPending] = useActionState(
    loginWithEmail,
    undefined
  );

  const [loginWithGooglePending, startTransition] = useTransition();
  const dispatchLoginWithGoogle = () => {
    startTransition(() => {
      loginWithGoogle();
    });
  };

  return (
    <div
      className={cn("flex flex-col gap-6 text-center", className)}
      {...props}
    >
      <div className="flex flex-col gap-2">
        <H1>Login to Smart Assistant</H1>
        <Paragraph>
          Don&apos;t have an account? <Link href="/register">Sign up</Link>
        </Paragraph>
      </div>
      <form action={dispatchLoginWithEmail}>
        <FieldGroup>
          <FieldGroup className="gap-2">
            <EmailField required />
            <PasswordField required />
          </FieldGroup>
          <Button
            type="submit"
            pending={loginWithEmailPending}
            pendingEl="Logging in..."
          >
            Login
          </Button>
          <FieldSeparator>Or</FieldSeparator>
          <Button
            variant="outline"
            type="button"
            onClick={dispatchLoginWithGoogle}
            pending={loginWithGooglePending}
            pendingEl="Redirecting..."
          >
            <GoogleIcon />
            Continue with Google
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
