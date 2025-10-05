import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Bot } from "lucide-react";
import AppSidebarMenu from "./app-sidebar-menu";
import { AppSidebarUserDropdown } from "./app-sidebar-user-dropdown";

export default async function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="flex-row px-4">
        <Bot />
        <span>Smart Assistant</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <AppSidebarMenu />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <AppSidebarUserDropdown />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
