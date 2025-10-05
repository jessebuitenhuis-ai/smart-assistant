"use client";

import { Fragment, useActionState } from "react";
import Button from "@/ui/button";
import Input from "@/ui/input";
import { register } from "@/actions/auth/register";
import Link from "next/link";
import SubmitButton from "@/ui/submit-button";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined);

  return (
    <Fragment>
      <h1 className="text-2xl font-bold text-center text-gray-900">Register</h1>
      {state?.message && (
        <p className="text-red-500 text-sm text-center">{state?.message}</p>
      )}
      <form action={action} className="space-y-4">
        <Input
          id="email"
          name="email"
          labelTxt="Email"
          type="email"
          errors={state?.errors?.email}
          required
        />
        <Input
          id="password"
          name="password"
          labelTxt="Password"
          type="password"
          errors={state?.errors?.password}
          required
        />
        <SubmitButton pending={pending} pendingEl="Registering...">
          Register
        </SubmitButton>
      </form>
      <Link href="/login" className="text-sm text-blue-500 hover:underline">
        Already have an account? Login
      </Link>
    </Fragment>
  );
}
