"use client";

import logout from "@/actions/auth/logout";
import Button from "@/ui/button";
import { useTransition } from "react";

export default function LogoutButton() {
  const [pending, startTransition] = useTransition();
  const logoutAction = () => startTransition(() => logout());
  return (
    <Button onClick={logoutAction} disabled={pending}>
      {pending ? "Logging out..." : "Logout"}
    </Button>
  );
}
