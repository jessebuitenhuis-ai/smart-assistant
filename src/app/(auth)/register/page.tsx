"use client";

import { Fragment, useActionState } from "react";
import Button from "@/ui/button";
import Input from "@/ui/input";
import { register } from "@/actions/auth/register";
import Link from "next/link";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined);

  return (
    <Fragment>
      <h1 className="text-2xl font-bold text-center text-gray-900">Register</h1>
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
      <Link href="/login" className="text-sm text-blue-500 hover:underline">
        Already have an account? Login
      </Link>
    </Fragment>
  );
}
