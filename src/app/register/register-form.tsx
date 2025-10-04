"use client";

import { register } from "@/app/actions/auth";
import Button from "@/ui/button";
import Input from "@/ui/input";
import { useActionState } from "react";

export default function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);

  return (
    <form action={action} className="space-y-4">
      <Input
        id="email"
        labelTxt="Email"
        type="email"
        errors={state?.errors?.email}
        required
      />
      <Input
        id="password"
        labelTxt="Password"
        type="password"
        errors={state?.errors?.password}
        required
      />
      <Button type="submit" disabled={pending}>
        Register
      </Button>
    </form>
  );
}
