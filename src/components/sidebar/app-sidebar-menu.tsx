import Link from "next/link";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { menuItems } from "./menu-items";
import { ChatMenuItem } from "./ChatMenuItem";

export default function AppSidebarMenu() {
  return (
    <SidebarMenu>
      {menuItems.map((item) => {
        // Use custom ChatMenuItem for chat
        if (item.title === "Chat") {
          return <ChatMenuItem key={item.title} />;
        }

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <Link href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
