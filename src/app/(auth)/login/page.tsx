"use client";

import { Fragment, useActionState } from "react";
import Button from "@/ui/button";
import Input from "@/ui/input";
import Link from "next/link";
import { login } from "@/actions/auth/login";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <Fragment>
      <h1 className="text-2xl font-bold text-center text-gray-900">Login</h1>
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
        <Button type="submit" disabled={pending}>
          {pending ? "Logging in..." : "Login"}
        </Button>
      </form>
      <Link href="/register" className="text-sm text-blue-500 hover:underline">
        Don't have an account? Register
      </Link>
    </Fragment>
  );
}
