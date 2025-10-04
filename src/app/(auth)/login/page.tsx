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
          Login
        </Button>
      </form>
      <Link href="/register" className="text-sm text-blue-500 hover:underline">
        Don't have an account? Register
      </Link>
    </Fragment>
  );
}
