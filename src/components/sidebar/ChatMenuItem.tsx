"use client";

import Link from "next/link";
import { MessageCircleIcon, Plus, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getThreads } from "@/actions/chat/get-threads";
import { createThread } from "@/actions/chat/create-thread";
import { Thread } from "@/types/chat";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { usePathname, useRouter } from "next/navigation";

export function ChatMenuItem() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isOpen && threads.length === 0) {
      loadThreads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadThreads = async () => {
    setIsLoading(true);
    const result = await getThreads(10);
    if (result.success) {
      setThreads(result.threads);
    }
    setIsLoading(false);
  };

  const handleCreateThread = async () => {
    const result = await createThread();
    if (result.success) {
      router.push(`/chat/${result.thread.id}`);
      await loadThreads();
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <MessageCircleIcon />
            <span>Chat</span>
            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton onClick={handleCreateThread} asChild>
                <button className="w-full">
                  <Plus className="h-4 w-4" />
                  <span>New Chat</span>
                </button>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            {isLoading ? (
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild>
                  <div className="cursor-not-allowed opacity-50">
                    <span className="text-muted-foreground">Loading...</span>
                  </div>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ) : (
              threads.map((thread) => (
                <SidebarMenuSubItem key={thread.id}>
                  <SidebarMenuSubButton asChild isActive={pathname === `/chat/${thread.id}`}>
                    <Link href={`/chat/${thread.id}`}>
                      <span className="truncate">
                        {thread.title || "New Chat"}
                      </span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
