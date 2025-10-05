"use client";

import logout from "@/actions/auth/logout";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTransition } from "react";

export function AppSidebarLogout() {
  const [pending, startTransition] = useTransition();
  const action = () => startTransition(() => logout());

  return (
    <DropdownMenuItem onClick={action}>
      {pending ? "Logging out..." : "Log out"}
    </DropdownMenuItem>
  );
}
