"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldSeparator } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { EmailField } from "./forms/EmailField";
import { PasswordField } from "./forms/PasswordField";
import { GoogleIcon } from "./icons/google-icon";
import { H1 } from "./typography/h1";
import { Paragraph } from "./typography/paragraph";
import { LoginFormState } from "@/actions/auth/login-state";
import { useActionState } from "react";

type LoginFormProps = {
  action: (
    state: LoginFormState,
    formData: FormData
  ) => Promise<LoginFormState>;
} & React.ComponentProps<"div">;

export function LoginForm({ className, action, ...props }: LoginFormProps) {
  const [state, dispatch, pending] = useActionState(action, undefined);

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
      <form action={dispatch}>
        <FieldGroup>
          <FieldGroup className="gap-2">
            <EmailField required />
            <PasswordField required />
          </FieldGroup>
          <Field>
            <Button type="submit">Login</Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Button variant="outline" type="button">
            <GoogleIcon />
            Continue with Google
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
