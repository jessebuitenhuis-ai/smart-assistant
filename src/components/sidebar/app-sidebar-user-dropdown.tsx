import { getUser } from "@/lib/supabase/getUser";
import { User2, ChevronUp } from "lucide-react";
import { SidebarMenuButton } from "../ui/sidebar";
import { AppSidebarLogout } from "./app-sidebar-logout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import UserAvatar from "../auth/UserAvatar";

export async function AppSidebarUserDropdown() {
  const user = await getUser();
  const username =
    user?.user_metadata.name || user?.user_metadata.email || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton>
          <UserAvatar className="size-5" />
          <span>{username}</span>
          <ChevronUp className="ml-auto" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        className="w-[var(--radix-popper-anchor-width)]"
      >
        <DropdownMenuItem>
          <span>Account</span>
        </DropdownMenuItem>
        <AppSidebarLogout />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
