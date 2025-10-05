import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldSeparator } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { EmailField } from "./forms/EmailField";
import { PasswordField } from "./forms/PasswordField";
import { AppleIcon } from "./icons/apple-icon";
import { GoogleIcon } from "./icons/google-icon";
import { H1 } from "./typography/h1";
import { Paragraph } from "./typography/paragraph";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
      <form>
        <FieldGroup>
          <FieldGroup className="gap-2">
            <EmailField required />
            <PasswordField required />
          </FieldGroup>
          <Field>
            <Button type="submit">Login</Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" type="button">
              <AppleIcon />
              Continue with Apple
            </Button>
            <Button variant="outline" type="button">
              <GoogleIcon />
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
