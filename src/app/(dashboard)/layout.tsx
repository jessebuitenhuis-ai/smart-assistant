import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "../../components/sidebar/app-sidebar";
import { PropsWithChildren } from "react";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-6 max-w-7xl">{children}</div>
      </main>
    </SidebarProvider>
  );
}
