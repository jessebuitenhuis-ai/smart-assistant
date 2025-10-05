"use client";

import logout from "@/actions/auth/logout";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MouseEventHandler, useTransition } from "react";

export function AppSidebarLogout() {
  const [pending, startTransition] = useTransition();
  const action: MouseEventHandler = (event) => {
    event.preventDefault();
    startTransition(() => logout());
  };

  return (
    <DropdownMenuItem onClick={action}>
      {pending ? "Logging out..." : "Log out"}
    </DropdownMenuItem>
  );
}
