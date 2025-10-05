"use client";

import { RegisterFormState } from "@/actions/auth/register-state";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useActionState } from "react";
import { EmailField } from "../forms/EmailField";
import { PasswordField } from "../forms/PasswordField";
import { H1 } from "../typography/h1";
import { Paragraph } from "../typography/paragraph";
import { TextField } from "../forms/TextField";

type RegisterFormProps = {
  action: (
    state: RegisterFormState,
    formData: FormData
  ) => Promise<RegisterFormState>;
} & React.ComponentProps<"div">;

export function RegisterForm({
  className,
  action,
  ...props
}: RegisterFormProps) {
  const [state, dispatch, pending] = useActionState(action, undefined);

  return (
    <div
      className={cn("flex flex-col gap-6 text-center", className)}
      {...props}
    >
      <div className="flex flex-col gap-2">
        <H1>Create an account</H1>
        <Paragraph>
          Already have an account? <Link href="/login">Login</Link>
        </Paragraph>
      </div>
      <form action={dispatch}>
        <FieldGroup>
          <FieldGroup className="gap-2">
            <TextField
              id="name"
              placeholder="John Doe"
              name="name"
              label="Name"
              required
            />
            <EmailField required />
            <PasswordField required />
          </FieldGroup>
          <Button
            type="submit"
            pending={pending}
            pendingEl="Creating account..."
          >
            Register
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
