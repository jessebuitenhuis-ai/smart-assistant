"use client";

import logout from "@/actions/auth/logout";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";

export default function LogoutButton() {
  const [pending, startTransition] = useTransition();
  const logoutAction = () => startTransition(() => logout());
  return (
    <Button onClick={logoutAction} pending={pending} pendingEl="Logging out...">
      Logout
    </Button>
  );
}
